const songList = {
    songs: [
        {
            id: 1,
            title: "In Hell I'll Be In Good Company",
            artist: "The Dead South",
            path: "midis/Dead South/In Hell Ill Be In Good Company.mid",
            image: "images/artists/The Dead South - Good Company.jpg"
        },
        {
            id: 2,
            title: "Old Town Road",
            artist: "Lil Nas X",
            path: "midis/Lil Nas X/Old Town Road.mid",
            image: "images/artists/Lil Nas X - Old Town Road.jpg"
        },
        {
            id: 3,
            title: "Where Everybody Knows Your Name",
            artist: "Gary Portnoy",
            path: "midis/Cheers/Where Everybody Knows Your Name.mid",
            image: "images/artists/Cheers.jpg"
        },
        {
            id: 4,
            title: "Westworld Main Theme",
            artist: "Ramin Djawadi",
            path: "midis/Westworld/Westworld Main Theme.mid",
            image: "images/artists/Westworld.jpg"
        },
        {
            id: 5,
            title: "Despacito",
            artist: "Luis Fonsi",
            path: "midis/Luis Fonsi/Despacito.mid",
            image: "images/artists/Luis Fonsi.jpg"
        },
        {
            id: 6,
            title: "Crazy Train",
            artist: "Ozzy Osborne",
            path: "midis/Ozzy Osborne/Crazy Train.mid",
            image: "images/artists/Ozzy Osborne - Crazy Train.jpg"
        },
        {
            id: 7,
            title: "While My Guitar Gently Weeps",
            artist: "The Beatles",
            path: "midis/Beatles/While My Guitar Gently Weeps.mid",
            image: "images/artists/Beatles - White Album.jpg"
        },
        {
            id: 8,
            title: "King of Pain",
            artist: "The Police",
            path: "midis/The Police/King of Pain.mid",
            image: "images/artists/The Police - Synchronicity.jpeg"
        },
        {
            id: 9,
            title: "Paint It Black",
            artist: "The Rolling Stones",
            path: "midis/The Rolling Stones/Paint It Black.mid",
            image: "images/artists/The Rolling Stones - Aftermath.jpg"
        },
        {
            id: 10,
            title: "Super Mario Brothers Main Theme",
            artist: "Koji Kondo",
            path: "midis/Super Mario Brothers/Main Theme.mid",
            image: "images/artists/Super Mario Bros.jpg"
        },
        {
            id: 11,
            title: "Fur Elise",
            artist: "Ludwig van Beethoven",
            path: "midis/Beethoven/Fur Elise.mid",
            image: "images/artists/Beethoven - Greatest Hits.jpg"
        },
        {
            id: 12,
            title: "Piano Man",
            artist: "Billy Joel",
            path: "midis/Billy Joel/Piano Man.mid",
            image: "images/artists/Billy Joel - Piano Man.jpg"
        },
        {
            id: 13,
            title: "Game of Thrones Main Theme",
            artist: "‎Ramin Djawadi",
            path: "midis/Game of Thrones/Game of Thrones.mid",
            image: "images/artists/Game of Thrones.jpg"
        },
        {
            id: 14,
            title: "The Entertainer",
            artist: "‎Scott Joplin",
            path: "midis/Scott Joplin/The Entertainer.mid",
            image: "images/artists/The Sting.jpg"
        },
        {
            id: 15,
            title: "The Simpsons Main Theme",
            artist: "‎Danny Elfman",
            path: "midis/Simpsons/Main Theme.mid",
            image: "images/artists/The Simpsons.jpg"
        },
        {
            id: 16,
            title: "Sweet Dreams",
            artist: "‎Eurythmics",
            path: "midis/Eurythmics/Sweet Dreams.mid",
            image: "images/artists/Eurythmics - Sweet Dreams.jpg"
        },
        {
            id: 17,
            title: "Enter Sandman",
            artist: "Metallica",
            path: "midis/Metallica/Enter Sandman.mid",
            image: "images/artists/Metallica - Metallica.jpg"
        },
        {
            id: 18,
            title: "Dream On",
            artist: "Aerosmith",
            path: "midis/Aerosmith/Dream On.mid",
            image: "images/artists/Aerosmith - Aerosmith.jpg"
        },
        {
            id: 19,
            title: "Pressure",
            artist: "Billy Joel",
            path: "midis/Billy Joel/Pressure.mid",
            image: "images/artists/Billy Joel - The Nylon Curtain.jpg"
        },
        {
            id: 20,
            title: "The Good The Bad and The Ugly",
            artist: "Ennio Morricone",
            path: "midis/Good Bad Ugly/The Good The Bad and The Ugly.mid",
            image: "images/artists/Good Bad Ugly.jpg"
        },
        {
            id: 21,
            title: "Float On",
            artist: "Modest Mouse",
            path: "midis/Modest Mouse/Float On.mid",
            image: "images/artists/Modest Mouse - Good News.jpg"
        },
        {
            id: 22,
            title: "Every Breath You Take",
            artist: "The Police",
            path: "midis/The Police/Every Breath You Take.mid",
            image: "images/artists/The Police - Synchronicity.jpeg"
        },
        {
            id: 23,
            title: "Thunderstruck",
            artist: "AC/DC",
            path: "midis/AC DC/Thunderstruck.mid",
            image: "images/artists/AC DC - The Razors Edge.jpg"
        },
        {
            id: 24,
            title: "Rhapsody in Blue",
            artist: "George Gershwin",
            path: "midis/George Gershwin/Rhapsody in Blue.mid",
            image: "images/artists/George Gershwin.jpg"
        },
        {
            id: 25,
            title: "100 Years",
            artist: "Five for Fighting",
            path: "midis/Five for Fighting/100 Years.mid",
            image: "images/artists/Five for Fighting - Battle.jpg"
        },
        {
            id: 26,
            title: "Ride of the Valkyries",
            artist: "Richard Wagner",
            path: "midis/Richard Wagner/Ride of the Valkyries.mid",
            image: "images/artists/Wagner - Ride of the Valkyries.jpg"
        },
        {
            id: 27,
            title: "Toccata and Fugue in D Minor",
            artist: "Johann Bach",
            path: "midis/Bach/Toccata and Fugue in D Minor.mid",
            image: "images/artists/Back - Essentials.jpg"
        },
        {
            id: 28,
            title: "Symphony No. 5 1st Movement",
            artist: "Ludwig van Beethoven",
            path: "midis/Beethoven/Symphony No.5 1st Movement.mid",
            image: "images/artists/Beethoven - 5th.jpg"
        },
        {
            id: 29,
            title: "Livin on a Prayer",
            artist: "Bon Jovi",
            path: "midis/Bon Jovi/Livin on a Prayer.mid",
            image: "images/artists/Bon Jovi - Slippery When Wet.jpg"
        },
        {
            id: 30,
            title: "Nobody Home",
            artist: "Pink Floyd",
            path: "midis/Pink Floyd/Nobody Home.mid",
            image: "images/artists/Pink Floyd - The Wall.jpg"
        },
        {
            id: 31,
            title: "Comfortably Numb",
            artist: "Pink Floyd",
            path: "midis/Pink Floyd/Comfortably Numb.mid",
            image: "images/artists/Pink Floyd - The Wall.jpg"
        },
        {
            id: 32,
            title: "Another Brick in the Wall Part 1",
            artist: "Pink Floyd",
            path: "midis/Pink Floyd/Another Brick in the Wall Part 1.mid",
            image: "images/artists/Pink Floyd - The Wall.jpg"
        },
        {
            id: 33,
            title: "Dancing Queen",
            artist: "ABBA",
            path: "midis/ABBA/Dancing Queen.mid",
            image: "images/artists/ABBA - Arrival.jpg"
        },
        {
            id: 33,
            title: "Your Song",
            artist: "Elton John",
            path: "midis/Elton John/Your Song.mid",
            image: "images/artists/Elton John - Elton John.jpg"
        },
        {
            id: 34,
            title: "Black Hole Sun",
            artist: "Soundgarden",
            path: "midis/Soundgarden/Black Hole Sun.mid",
            image: "images/artists/Soundgarden - Superunknown.jpg"
        },
        {
            id: 35,
            title: "Come As You Are",
            artist: "Nirvana",
            path: "midis/Nirvana/Come As You Are.mid",
            image: "images/artists/Nirvana - Nevermind.jpg"
        },
        {
            id: 36,
            title: "Hooked on a Feeling",
            artist: "Blue Swede",
            path: "midis/Blue Swede/Hooked on a Feeling.mid",
            image: "images/artists/Blue Swede - Hooked on a Feeling.jpg"
        },
        {
            id: 37,
            title: "Don't Stop Believin'",
            artist: "Journey",
            path: "midis/Journey/Dont Stop Believin.mid",
            image: "images/artists/Journey - Escape.jpg"
        },
        {
            id: 38,
            title: "Down Under",
            artist: "Men at Work",
            path: "midis/Men at Work/Down Under.mid",
            image: "images/artists/Men at Work.jpg"
        },
        {
            id: 39,
            title: "Come and Get Your Love",
            artist: "Redbone",
            path: "midis/Redbone/Come and Get Your Love.mid",
            image: "images/artists/Redbone - Get You Love.jpg"
        },
        {
            id: 40,
            title: "Funkytown",
            artist: "Lipps, Inc.",
            path: "midis/Lipps, Inc./FUNKYTOWN.mid",
            image: "images/artists/Lipps - Funkytown.jpg"
        },
        {
            id: 41,
            title: "Clocks",
            artist: "Coldplay",
            path: "midis/Coldplay/Clocks.mid",
            image: "images/artists/Coldplay - Clocks.jpg"
        },
        {
            id: 42,
            title: "Come Sail Away",
            artist: "Styx",
            path: "midis/Styx/Come Sail Away.mid",
            image: "images/artists/Styx - Come Sail Away.jpg"
        },
        {
            id: 43,
            title: "Cake by the Ocean",
            artist: "DNCE",
            path: "midis/DNCE/Cake by the Ocean.mid",
            image: "images/artists/DNCE - DNCE.jpg"
        },
        {
            id: 44,
            title: "Mad World",
            artist: "Gary Jules",
            path: "midis/Gary Jules/Mad World.mid",
            image: "images/artists/Gary Jules - Snake Oil.jpg"
        },
        {
            id: 45,
            title: "Memories",
            artist: "Maroon 5",
            path: "midis/Maroon 5/Memories.mid",
            image: "images/artists/Maroon 5 - Memories.jpg"
        },
        {
            id: 46,
            title: "The Pink Panther Theme",
            artist: "Henry Mancini",
            path: "midis/Henry Mancini/The Pink Panther.mid",
            image: "images/artists/Pink Panther.jpg"
        },
        {
            id: 47,
            title: "Skyfall",
            artist: "Adele",
            path: "midis/Adele/Skyfall.mid",
            image: "images/artists/Adele - Skyfall.jpg"
        },
        {
            id: 48,
            title: "Rolling in the Deep",
            artist: "Adele",
            path: "midis/Adele/Rolling in the Deep.mid",
            image: "images/artists/Adele - 21.jpg"
        },
        {
            id: 49,
            title: "Happier",
            artist: "Marshmello feat. Bastille",
            path: "midis/Marshmello/Happier.mid",
            image: "images/artists/Marshmello - Happier.jpg"
        },
        {
            id: 50,
            title: "I'm Still Standing",
            artist: "Elton John",
            path: "midis/Elton John/Im Still Standing.mid",
            image: "images/artists/Elton John - Too Low for Zero.jpg"
        },
        {
            id: 51,
            title: "Bad Guy",
            artist: "Billie Eilish",
            path: "midis/Billie Eilish/Bad Guy.mid",
            image: "images/artists/Billie Eilish - Fall Asleep.jpg"
        },
        {
            id: 52,
            title: "Take on Me",
            artist: "a-ha",
            path: "midis/a-ha/Take on Me.mid",
            image: "images/artists/a-ha - Take on Me.jpg"
        },
        {
            id: 53,
            title: "Africa",
            artist: "TOTO",
            path: "midis/Toto/Africa.mid",
            image: "images/artists/TOTO - TOTO IV.jpg"
        },
        {
            id: 54,
            title: "Get Lucky",
            artist: "Daft Punk",
            path: "midis/Daft Punk/Get Lucky.mid",
            image: "images/artists/Daft Punk - Get Lucky.jpg"
        }
    ]
};
module.exports = songList;
