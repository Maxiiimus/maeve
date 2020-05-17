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
            artist: "A-ha",
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
        },
        {
            id: 55,
            title: "Crazy",
            artist: "Patsy Cline",
            path: "midis/Patsy Cline/Crazy.mid",
            image: "images/artists/Patsy Cline - Showcase.jpg"
        },
        {
            id: 56,
            title: "Somebody That I Used to Know",
            artist: "Gotye",
            path: "midis/Gotye/Somebody That I Used to Know.mid",
            image: "images/artists/Gotye - Making Mirrors.jpg"
        },
        {
            id: 57,
            title: "Free Bird",
            artist: "Lynyrd Skynyrd",
            path: "midis/Lynyrd Skynyrd/Free Bird.mid",
            image: "images/artists/Lynyrd Skynyrd.jpg"
        },
        {
            id: 58,
            title: "She Talks to Angels",
            artist: "The Black Crows",
            path: "midis/Black Crows/She Talks To Angels.mid",
            image: "images/artists/The Black Crows.jpg"
        },
        {
            id: 59,
            title: "Lean on Me",
            artist: "Bill Withers",
            path: "midis/Bill Withers/Lean on Me.mid",
            image: "images/artists/Bill Withers - Still Bill.jpg"
        },
        {
            id: 60,
            title: "Feeling Good",
            artist: "Nina Simone",
            path: "midis/Nina Simone/Feeling Good.mid",
            image: "images/artists/Nina Simone - Spell on You.jpg"
        },
        {
            id: 61,
            title: "Don't Worry Be Happy",
            artist: "Bobby McFerrin",
            path: "midis/Bobby McFerrin/Dont Worry Be Happy.mid",
            image: "images/artists/Bobby McFerrin - Simple Pleasures.jpg"
        },
        {
            id: 62,
            title: "Escape (The Piña Colada Song)",
            artist: "Rupert Holmes",
            path: "midis/Rupert Holmes/Escape The Pina Colada Song.mid",
            image: "images/artists/Rupert Holmes - Partners in Crime.jpg"
        },
        {
            id: 63,
            title: "Sweet Child O Mine",
            artist: "Guns N Roses",
            path: "midis/Guns N Roses/Sweet Child O Mine.mid",
            image: "images/artists/Guns N Roses - Appetite for Destruction.jpg"
        },
        {
            id: 64,
            title: "Welcome to the Jungle",
            artist: "Guns N Roses",
            path: "midis/Guns N Roses/Welcome to the Jungle.mid",
            image: "images/artists/Guns N Roses - Appetite for Destruction.jpg"
        },
        {
            id: 65,
            title: "Cool Water",
            artist: "Marty Robbins",
            path: "midis/Marty Robbins/Cool Water.mid",
            image: "images/artists/Marty Robbins - Gunfighter Ballads.jpg"
        },
        {
            id: 66,
            title: "Hey Jude",
            artist: "The Beatles",
            path: "midis/Beatles/Hey Jude.mid",
            image: "images/artists/Beatles - Compilation.jpg"
        },
        {
            id: 67,
            title: "Puttin' on the Ritz",
            artist: "Fred Astaire",
            path: "midis/Fred Astaire/Puttin on the Ritz.mid",
            image: "images/artists/Fred Astaire.jpg"
        },
        {
            id: 68,
            title: "I'd Like to Teach the World to Sing",
            artist: "The New Seekers",
            path: "midis/The New Seekers/Id Like to Teach the World To Sing.mid",
            image: "images/artists/The New Seekers.jpg"
        },
        {
            id: 69,
            title: "I Will Survive",
            artist: "Gloria Gaynor",
            path: "midis/Gloria Gaynor/I Will Survive.mid",
            image: "images/artists/Gloria Gaynor.jpg"
        },
        {
            id: 70,
            title: "Y.M.C.A.",
            artist: "The Village People",
            path: "midis/The Village People/YMCA.mid",
            image: "images/artists/Village People - Cruisin.jpg"
        },
        {
            id: 71,
            title: "You're So Vain",
            artist: "Carly Simon",
            path: "midis/Carly Simon/Youre So Vain.mid",
            image: "images/artists/Carly Simon.jpg"
        },
        {
            id: 72,
            title: "Itsy Bitsy Teenie Weenie Yellow Polkadot Bikini",
            artist: "Brian Hyland",
            path: "midis/Brian Hyland/Itsy Bitsy Teenie Weenie Yellow Polkadot Bikini.mid",
            image: "images/artists/Brian Hyland.jpg"
        },
        {
            id: 73,
            title: "Mr. Bojangles",
            artist: "Nitty Gritty Dirt Band",
            path: "midis/Nitty Gritty Dirt Band/Mr. Bojangles.mid",
            image: "images/artists/Nitty Gritty Dirt Band.jpg"
        },
        {
            id: 74,
            title: "Aquarius/Let the Sunshine In",
            artist: "The 5th Dimension",
            path: "midis/The 5th Dimension/Aquarius.mid",
            image: "images/artists/The 5th Dimension.jpg"
        },
        {
            id: 75,
            title: "Just the Way You Are",
            artist: "Billy Joel",
            path: "midis/Billy Joel/Just the Way You Are.mid",
            image: "images/artists/Billy Joel - The Stranger.jpg"
        },
        {
            id: 76,
            title: "All of Me",
            artist: "Billy Holiday",
            path: "midis/Billie Holiday/All of Me.mid",
            image: "images/artists/Billie Holiday.jpg"
        },
        {
            id: 77,
            title: "Can't Take My Eyes Off Of You",
            artist: "Frankie Valli and the Four Seasons",
            path: "midis/Frankie Valli/Cant Take My Eyes Off Of You.mid",
            image: "images/artists/Frankie Valli.jpg"
        },
        {
            id: 78,
            title: "Walk Right In",
            artist: "The Rooftop Singers",
            path: "midis/The Rooftop Singers/Walk Right In.mid",
            image: "images/artists/The Rooftop Singers.jpg"
        },
        {
            id: 79,
            title: "I Guess That's Why They Call It The Blues",
            artist: "Elton John",
            path: "midis/Elton John/I Guess Thats Why They Call It The Blues.mid",
            image: "images/artists/Elton John - Too Low for Zero.jpg"
        },
        {
            id: 80,
            title: "Leaving on a Jet Plane",
            artist: "John Denver",
            path: "midis/John Denver/Leaving on a Jet Plane.mid",
            image: "images/artists/John Denver.jpg"
        },
        {
            id: 81,
            title: "Take Me Home Country Roads",
            artist: "John Denver",
            path: "midis/John Denver/Take Me Home Country Roads.mid",
            image: "images/artists/John Denver.jpg"
        },
        {
            id: 82,
            title: "Do-Re-Mi",
            artist: "Julie Andrews",
            path: "midis/Julie Andrews/Do-Re-Mi.mid",
            image: "images/artists/Sound of Music.jpg"
        },
        {
            id: 83,
            title: "Over the Rainbow",
            artist: "Judy Garland",
            path: "midis/Judy Garland/Over the Rainbow.mid",
            image: "images/artists/Judy Garland.jpg"
        },
        {
            id: 84,
            title: "Beauty and the Beast",
            artist: "Angela Lansbury",
            path: "midis/Beauty and the Beast/Beauty and the Beast.mid",
            image: "images/artists/Beauty and the Beast.jpg"
        },
        {
            id: 85,
            title: "Eleanor Rigby",
            artist: "The Beatles",
            path: "midis/Beatles/Eleanor Rigby.mid",
            image: "images/artists/Beatles - Revolver.jpg"
        },
        {
            id: 86,
            title: "Bad Romance",
            artist: "Lady Gaga",
            path: "midis/Lady Gaga/Bad Romance.mid",
            image: "images/artists/Lady Gaga - The Fame Monster.jpg"
        },
        {
            id: 87,
            title: "Sunday Bloody Sunday",
            artist: "U2",
            path: "midis/U2/Sunday Bloody Sunday.mid",
            image: "images/artists/U2 - War.jpg"
        },
        {
            id: 88,
            title: "Total Eclipse of the Heart",
            artist: "Bonnie Tyler",
            path: "midis/Bonnie Tyler/Total Eclipse of the Heart.mid",
            image: "images/artists/Bonnie Tyler.jpg"
        },
        {
            id: 89,
            title: "All Star",
            artist: "Smash Mouth",
            path: "midis/Smash Mouth/All Star.mid",
            image: "images/artists/Smash Mouth.jpg"
        },
        {
            id: 90,
            title: "Careless Whisper",
            artist: "George Michael",
            path: "midis/George Michael/Careless Whisper.mid",
            image: "images/artists/George Michael.jpg"
        },
        {
            id: 91,
            title: "Wonderwall",
            artist: "Oasis",
            path: "midis/Oasis/Wonderwall.mid",
            image: "images/artists/Oasis.jpg"
        },
        {
            id: 92,
            title: "Never Gonna Give You Up",
            artist: "Rick Astley",
            path: "midis/Rick Astley/Never Gonna Give You Up.mid",
            image: "images/artists/Rick Astley.jpg"
        },
        {
            id: 93,
            title: "Harvest Moon",
            artist: "Neil Young",
            path: "midis/Neil Young/Harvest Moon.mid",
            image: "images/artists/Neil Young - Harvest Moon.jpg"
        },
        {
            id: 94,
            title: "Free Fallin'",
            artist: "Tom Petty",
            path: "midis/Tom Petty/Free Fallin.mid",
            image: "images/artists/Tom Petty - Full Moon Fever.jpg"
        },
        {
            id: 95,
            title: "Lose Yourself",
            artist: "Eminem",
            path: "midis/Eminem/Lose Yourself.mid",
            image: "images/artists/Eminem - Curtain Call.jpg"
        },
        {
            id: 96,
            title: "Budapest",
            artist: "George Ezra",
            path: "midis/George Ezra/Budapest.mid",
            image: "images/artists/George Ezra.jpg"
        },
        {
            id: 97,
            title: "Riptide",
            artist: "Vance Joy",
            path: "midis/Vance Joy/Riptide.mid",
            image: "images/artists/Vance Joy - Dream Your Life Away.jpg"
        },
        {
            id: 98,
            title: "Perfect",
            artist: "Ed Sheeran",
            path: "midis/Ed Sheeran/Perfect.mid",
            image: "images/artists/Ed Sheeran - Divide.jpg"
        },
        {
            id: 99,
            title: "Let Her Go",
            artist: "Passenger",
            path: "midis/Passenger/Let Her Go.mid",
            image: "images/artists/Passenger - All the Little Lights.jpg"
        },
        {
            id: 100,
            title: "Believer",
            artist: "Imagine Dragons",
            path: "midis/Imagine Dragons/Believer.mid",
            image: "images/artists/Imagine Dragons - Evolve.jpg"
        },
        {
            id: 101,
            title: "All of Me",
            artist: "John Legend",
            path: "midis/John Legend/All Of Me.mid",
            image: "images/artists/John Legend - All of Me.jpg"
        },
        {
            id: 102,
            title: "The Addams Family Theme",
            artist: "The Addams Family",
            path: "midis/Addams Family/The Addams Family Theme.mid",
            image: "images/artists/TV Themes.jpg"
        }
    ]
};
module.exports = songList;
