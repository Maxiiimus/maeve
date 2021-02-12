const sqlite3 = require('sqlite3').verbose();
const songLibrary = require('../midis/song-list');

const DB_FILE = './db/music_library.db';
const CREATE_SONGS_TABLE = `CREATE TABLE IF NOT EXISTS songs (song_id INTEGER PRIMARY KEY, title TEXT NOT NULL,
                            artist TEXT NOT NULL, midi_path TEXT NOT NULL UNIQUE, image_path TEXT NOT NULL)`;
const CREATE_PLAYLISTS_TABLE = `CREATE TABLE IF NOT EXISTS playlists (playlist_id INTEGER PRIMARY KEY, 
                                name TEXT NOT NULL)`;
const CREATE_PLAYLIST_ITEMS_TABLE = `CREATE TABLE IF NOT EXISTS playlist_items (item_id INTEGER PRIMARY KEY, 
                                     playlist_id INTEGER, song_id INTEGER)`;
const GET_ALL_SONGS = `SELECT song_id, title, artist, midi_path, image_path FROM songs`;
const ADD_SONG = `INSERT INTO songs(title, artist, midi_path, image_path) VALUES(?,?,?,?)`;
const DELETE_SONG = `DELETE FROM songs WHERE song_id = ?`;
const DELETE_SONG_FROM_PLAYLISTS = `DELETE FROM playlist_items WHERE song_id = ?`;
const CREATE_PLAYLIST = `INSERT INTO playlists(name) VALUES(?)`;
const RENAME_PLAYLIST = `UPDATE playlists SET name = ? WHERE playlist_id = ?`;
const DELETE_PLAYLIST = `DELETE FROM playlists WHERE playlist_id = ?`;
const DELETE_PLAYLIST_ITEMS = `DELETE FROM playlist_items WHERE playlist_id = ?`;

class MusicLibrary {

    // songsOut is an array that will be used to store the songs from the database
    constructor(songsOut, playlistsOut, playlistOut) {
        this.db = new sqlite3.Database(DB_FILE, (err) => {
            if (err) {
                console.error(err.message);
            }
            console.log('Connected to the music library database.');
        });

        // Pointer to the arrays to store the songs, playlists, and current playlist
        this.songs = songsOut;
        this.playlists = playlistsOut;
        this.playlist = playlistOut;

        // When first created, default to playlist 1 which will be prevented from deletion so there is always 1
        this.currentPlaylistID = 1;

        //this.rebuildLibrary();
        this.initialize();

        // run some tests
        //this.runTests();
    }

    initialize() {
        // Load the song library and the list of playlists
        this.getLibrary((err) => {
            console.log("Loaded song library");
        });
        this.getPlaylists((err) => {
            // After the playlists load, then load in the first playlist songs
            this.getPlaylist(this.currentPlaylistID, (err) => {
                console.log("Loaded playlist: " + this.currentPlaylistID);
            });
            console.log("Loaded all playlists");
        });
    }

    // Loads in songs from the json file. Only needs to be called to initialize the songs database
    rebuildLibrary(callback) {
        this.removeLibrary((err) => {
            this.createLibrary((err) => {
                this.loadSongs((err) => {
                    this.createPlaylist("Queue", (err) => {
                        this.getLibrary((err) => {
                            console.log("Loaded song library");
                        });
                        this.getPlaylists((err) => {
                            // After the playlists load, then load in the first playlist songs
                            this.getPlaylist(this.currentPlaylistID, (err) => {
                                console.log("Loaded playlist: " + this.currentPlaylistID);
                            });
                            console.log("Loaded all playlists");
                            callback(err);
                        });
                    });
                });
            });
        });
    }

    runCommand(sql, callback) {
        this.db.run(sql, [], function(err) {
            callback(err);
        });
    }

    removeLibrary(callback) {
        this.runCommand('DROP TABLE songs', (err) => {
            if (err) {
                callback(err);
            } else {
                this.runCommand('DROP TABLE playlists', (err) => {
                    if (err) {
                        callback(err);
                    } else {
                        this.runCommand('DROP TABLE playlist_items', (err) => {
                            callback(err);
                        });
                    }
                });
            }
        });
    }

    loadSongs(callback) {
        // Clear the array of songs (but don't loose the reference)
        while(this.songs.length > 0) {
            this.songs.pop();
        }

        for (let i = 0; i < songLibrary.songs.length; i++) {
            this.addSong(songLibrary.songs[i]['title'], songLibrary.songs[i]['artist'],
                songLibrary.songs[i]['path'], songLibrary.songs[i]['image'], (err) => {

                // Return after the last song is loaded
                if (i === songLibrary.songs.length - 1) {
                    callback(err);
                }
            });
        }
    }

    /*
        Create Library table
     */
    createLibrary(callback) {
        // Create the table with all of the songs
        this.runCommand(CREATE_SONGS_TABLE, (err) => {
            if (err) {
                callback(err);
            } else {
                this.runCommand(CREATE_PLAYLISTS_TABLE, (err) => {
                    if (err) {
                        callback(err);
                    } else {
                        this.runCommand(CREATE_PLAYLIST_ITEMS_TABLE, (err) => {
                            callback(err);
                        });
                    }
                });
            }
        });
    }

    /*
        Get the full library of songs - Asynchronous
    */
    getLibrary(callback) {
        this.db.all(GET_ALL_SONGS,[], (err, songs) => {
            if (err) {
                console.log('Error loading songs: ' + err.message);
            } else {
                for (let i = 0; i < songs.length; i++) {
                    this.songs.push({
                        song_id: songs[i].song_id,
                        title: songs[i].title,
                        artist: songs[i].artist,
                        midi_path: songs[i].midi_path,
                        image_path: songs[i].image_path
                    });
                }
                console.log("Finished loading songs.");
            }
            callback(err);
        });
    }

    /*
        Add a song to the library
    */
    addSong(title, artist, path, image, callback) {
        this.db.run(ADD_SONG, [title, artist, path, image], function(err) {
            if (err) {
                console.log(err.message);
            } else {
                // get the last insert id
                console.log('A song has been inserted: ' + title);
            }
            callback(err);
        });
    }

    /*
        Remove a song from the library
    */
    deleteSong(songID, callback) {
        // Delete the song from the library
        this.db.run(DELETE_SONG, [songID], function(err) {
            if (err) {
                console.log('Error deleting song:' + err.message);
            } else {
                console.log('Deleted song: ' + songID);
            }

            // Also remove it from any playlists
            this.db.run(DELETE_SONG_FROM_PLAYLISTS, [songID], function(err) {
                if (err) {
                    console.log('Error removing song from playlists: ' + err.message);
                } else {
                    console.log('Removed song from all playlists: ' + songID);
                }
                callback(err);
            });
        });
    }

    /*
        Get a playlist - loads the specified playlist into the internal this.playlist field
    */
    getPlaylist(playlistID, callback) {
        let sql = `SELECT item_id, songs.song_id, title, artist, midi_path, image_path FROM songs INNER JOIN playlist_items
                   ON playlist_items.song_id = songs.song_id WHERE playlist_items.playlist_id = ?`;

        this.db.all(sql,[playlistID], (err, songs) => {
            if (err) {
                console.log('Error getting playlist: ' + err.message);
            } else {
                // Clear the array (but don't loose the reference)
                while(this.playlist.length > 0) {
                    this.playlist.pop();
                }
                for (let i = 0; i < songs.length; i++) {
                    this.playlist.push({
                        item_id: songs[i].item_id,
                        song_id: songs[i].song_id,
                        title: songs[i].title,
                        artist: songs[i].artist,
                        midi_path: songs[i].midi_path,
                        image_path: songs[i].image_path
                    });
                    console.log("Got playlist song: " + songs[i].title);
                }
                // Success
                console.log("Finished loading playlist: " + playlistID);
                this.currentPlaylistID = playlistID;
            }
            callback(err);
        });
    }

    // Returns the list of playlists as {playlistID, playlistName}
    getPlaylists(callback) {
        let sql = `SELECT playlist_id, name FROM playlists`;

        this.db.all(sql,[], (err, playlists) => {
            if (err) {
                console.log('Error getting playlist: ' + err.message);
            } else {
                // First, empty the list
                while(this.playlists.length > 0) {
                    this.playlists.pop();
                }
                for (let i = 0; i < playlists.length; i++) {
                    this.playlists.push({
                        playlist_id: playlists[i].playlist_id,
                        name: playlists[i].name
                    });
                    console.log("Got playlist: " + playlists[i].name);
                }
                console.log("Finished loading playlists.");
            }
            callback(err);
        });
    }

    /*
        Create a playlist in the database, return the rowID of the new list
    */
    createPlaylistInternal(name, callback) {
        this.db.run(CREATE_PLAYLIST, [name], function(err) {
            if (err) {
                console.log('Error creating playlist: ' + err.message);
                callback(err, 0);
            } else {
                // Success
                console.log('Playlist created: ' + name);
                console.log(`A row has been inserted with rowid ${this.lastID}`);
                callback(err, this.lastID);
            }
        });
    }

    /*
        Find the playlistID given the rowID
     */
    getPlaylistID(rowID, callback) {
        let playlistID = 1; // default to playlist 1
        this.db.all('SELECT playlist_id FROM playlists WHERE rowID = ?', [rowID], (err, playlists) => {
            if (err) {
                console.log('Error getting playlist_id for playlist: ' + err.message);
            } else {
                if (playlists && playlists.length >= 1) {
                    playlistID = playlists[0].playlist_id;
                    console.log('Found playlist with playlist_id = ' + playlistID);
                }
            }
            callback(err, playlistID);
        });
    }

    /*
        Create a playlist, then select the playlist
    */
    createPlaylist(name, callback) {
        // 1. Create a new playlist, returns rowID of the new playlist
        this.createPlaylistInternal(name, (err, rowID) => {
            if (err) {
                console.log('Error creating playlist: ' + err.message);
                callback(err);
            } else {
                // 2. Find the playlist_id of the new playlist by rowID
                this.getPlaylistID(rowID, (err, playlistID) => {
                    if (err) {
                        console.log('Error getting playlist_id: ' + err.message);
                        this.currentPlaylistID = 1; // Something went wrong, so just select playlist 1
                    } else {
                        console.log('Got playlist_id: ' + playlistID);
                        this.currentPlaylistID = playlistID;
                    }
                    // 4. Reload all playlists since we have a new one now
                    this.getPlaylists((err) => {
                        if (err) {
                            console.log('Error loading playlists.');
                        } else {
                            // 3. Load the new playlist (should be empty)
                            this.getPlaylist(playlistID, (err) => {
                                if (err) {
                                    console.log('Error loading playlist: ' + playlistID);
                                } else {
                                    console.log("Loaded playlist: " + playlistID);
                                }
                                callback(err);
                            });
                        }
                    });
                });
            }
        });
    }

    /*
        Rename a playlist (internal implementation)
    */
    renamePlaylistInternal(name, playlistID, callback) {
        this.db.run(RENAME_PLAYLIST, [name, playlistID], function(err) {
            if (err) {
                console.log('Error renaming playlist: ' + err.message);
            } else {
                // Success
                console.log('Playlist ' + playlistID + ' renamed to: ' + name);
            }
            callback(err);
        });
    }

    /*
        Rename a playlist
    */
    renamePlaylist(name, callback) {
        let playlistID = this.currentPlaylistID;
        this.renamePlaylistInternal(name, playlistID,(err) => {
            if (!err) {
                // Reload all playlist names since we renamed one
                this.getPlaylists((err) => {
                    if (err) {
                        console.log('Error loading playlists.');
                    } else {
                        // Reselect the playlist that was renamed
                        this.getPlaylist(playlistID, (err) => {
                            callback(err);
                        });
                    }
                });
            }
        });
    }

    /*
        Adds the song to the playlist_items table for the current playlistID and song_id
     */
    addSongToPlaylistInternal(songID, callback) {
        this.db.run("INSERT INTO playlist_items (playlist_id, song_id) VALUES (?, ?)",
            [this.currentPlaylistID, songID], function(err) {
            if (err) {
                console.log('Error renaming playlist' + err.message);
            } else {
                console.log('Inserted song ' + songID + ' into playlist');
            }

            callback(err);
        });
    }

    addSongToPlaylist(songID, callback) {
        this.addSongToPlaylistInternal(songID, (err) => {
            if(!err) {
                // Reload the current playlist
                this.getPlaylist(this.currentPlaylistID, (err) => {
                    callback(err);
                });
            }
        });
    }

    /*
        Removes a single song from a playlist by the entry in playlist_items.item_id
    */
    removeSongFromPlaylistInternal(itemID, callback) {
        console.log("removing item from playlist: " + itemID);
        this.db.run("DELETE FROM playlist_items WHERE item_id = ?",
            [itemID], function(err) {
                if (err) {
                    console.log(err.message);
                } else {
                    console.log('Removed item ' + itemID + ' from playlist_items.');
                }

                // Reload the current playlist
                callback(err);
         });
    }

    /*
        Removes a single song from a playlist by the entry in playlist_items.item_id
    */
    removeSongFromPlaylist(itemID, callback) {
        this.removeSongFromPlaylistInternal(itemID, (err) => {
            if (!err) {
                // Reload the current playlist
                this.getPlaylist(this.currentPlaylistID, (err) => {
                    callback(err);
                });
            }
        });
    }

    deletePlaylistInternal(callback) {
        // Delete the song from the library
        this.db.run(DELETE_PLAYLIST, [this.currentPlaylistID], function (err) {
            callback(err);
        });
    }

    deletePlaylistItemsInternal(callback) {
        // Delete the playlist items
        this.db.run(DELETE_PLAYLIST_ITEMS, [this.currentPlaylistID], function (err) {
            callback(err);
        });
    }

    /*
        Delete the current playlist. Will not allow playlist 1 to be deleted so there is always at least 1 playlist
    */
    deletePlaylist(callback) {
        console.log("In deletePlaylist with this.currentPlaylistID = " + this.currentPlaylistID);
        if (this.currentPlaylistID == 1) { // cannot use === here because we type is not always strict
            console.log("Cannot delete playlist 1.");
            callback(new Error("Cannot delete playlist 1."));
        } else {
            // Delete the playlist
            console.log("Calling deletePlaylistInternal");
            this.deletePlaylistInternal((err) => {
                if (err) {
                    console.log(err.message);
                } else {
                    console.log('Removed playlist: ' + this.currentPlaylistID);
                }
                // Also remove the playlist items
                console.log("Calling deletePlaylistItemsInternal");
                this.deletePlaylistItemsInternal((err) => {
                    if (err) {
                        console.log(err.message);
                    } else {
                        console.log('Removed songs for playlist: ' + this.currentPlaylistID);
                    }

                    this.currentPlaylistID = 1; // Set to playlist 1 so there is one selected
                    this.getPlaylists((err) => {
                        // After the playlists load, then load in the first playlist songs
                        this.getPlaylist(this.currentPlaylistID, (err) => {
                            callback(err);
                        });
                    });
                });
            });
        }
    }

    runTests() {

        // Test Add Song
        //this.db.run("DELETE FROM songs WHERE title = '"  + title + "'");
        //this.addSong(title, artist, path, image);
        //this.db.run("DELETE FROM songs WHERE title = '"  + title + "'");

        // Test Add Playlist
        /*let name = "Christmas";
        this.createPlaylist(name, (err) => {
            if (err) {
                console.log("Error creating playlist: " + err.message);
            } else {
                console.log("Created playlist: " + name);
                this.addSongToPlaylist(158,()=>{});
                this.addSongToPlaylist(146,()=>{});
                this.addSongToPlaylist(133,()=>{});
            }
        });*/

        //this.getPlaylist(1, this.playlist,(err, playlist) => {
        //    console.log("Playlist: " + JSON.stringify(playlist));
        //    console.log("Playlist: " + JSON.stringify(this.playlist));
        //});
        //this.deletePlaylist(2);
    }
}

module.exports = MusicLibrary;
