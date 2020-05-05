# Spotify Roulette
## Spotify Roulette
For my concept I'm using the Spotify API. How does my concept work? Before entering my webapp, you need to give permission to read out your Spotify credentials and your liked songs. You are able to create and enter 'rooms' with a unique pin. Your own space for you and your friends. You're able to enter a room with a code, similary like Kahoot. The webapp serves the users a random song from one of the playlist of a user. All friends have to guess to which user the song belongs. If you get it right, you get 100 points. If you get more points, you can add more songs to a co-created playlist (of your friends). The ultimate winner is also able to rearrange the songs in the co-created playlist. Now you have a playlist together, which you can use at a party!

## Data lifecycle
![data-lifecycle-01](https://user-images.githubusercontent.com/43337909/79839837-641a8400-83b5-11ea-896f-4e9dbc155346.jpg)

## Install
1. Open the terminal on your computer.
2. Create a directory in a location of your choice with `mkdir` in your console.
3. Clone the repository with the following command:
<br></br>
`git clone https://github.com/Coenmathijssen/browser-technologies-1920.git`
<br></br>
4. Navigate to the repo with the `cd` command in your console. Next, install all the dependencies with 
<br></br>
`npm install`
<br></br>
5. For building, bundling and compiling of the SCSS and JS, use
<br></br>
`npm run build`
<br></br>
6. To develop and see changes live, use this in your first window of your terminal:
<br></br>
`npm run watch`
<br></br>
And this in your second window of your terminal:
<br></br>
`npm run dev`
<br></br>
These commands are editable in the package.json file
<br></br>
6. Open the localhost to view the webapp.

## Deployment
Deploy website on Heroku:
1. Go to https://www.heroku.com/ and sign in (or create an account).
2. Create new app.
3. Connect the Git repo to your Heroku.
4. Change the directory to 'dist'.
5. Run the installation commands in your terminal.

## Spotify API
### OAuth
The Spotify API is free to use for every developers account, when not using it for commercial purposes. So first, you need an account at [Spotify Developer](https://developer.spotify.com/dashboard/). In order to use the [OAuth 2.0](https://oauth.net/2/) for the Spotify API, you need the following variables:
- Client ID
- Client Secret
- Redirect URI

You can find all these values inside the Spotify Developer Dashboard. The Spotify Redirect URI needs to be set in your Spotify Dashboard. This URI has to be the same as your callback url. Otherwise the OAuth will fail. It's important to **remember that this route will change when you deploy your app**. Also, the client ID and Client Secret should **never be exposed to GitHub**. Never hardcode it in your files and always use something like a dotenv file. Here is an example of how it is used in my project:

**.env.example**

```
CLIENT_ID='client id from your Spotify Developer account'
CLIENT_SECRET='client from your Spotify Developer account'
REDIRECT_URI='redirect URL'
```

The flow Spotify OAuth flow in short:
1. Send user to Spotify, asking them to give permission for the application to read their Spotify data. 
2. Spotify returns to application on a set callback url (redirect URI)
2. Request necessery acces to access and refresh token with a fetch including .env data
3. Get access and refresh token
4. Now you are able to fetch the user's Spotify data through a fetch with the access code.

For elaboration, see [Spotify Authorization Guide](https://developer.spotify.com/documentation/general/guides/authorization-guide/)

```
Base URL:
'https://api.spotify.com/v1/me'

Request:
'user-read-private user-read-email user-library-read'
```

### Raw data
Spotify returns an enormous amount of data. I only need a fraction of it, so I did some data cleaning. The raw data:

```
[ { added_at: '2020-05-04T09:10:50Z',
    track:
     { album: [Object],
       artists: [Array],
       available_markets: [Array],
       disc_number: 1,
       duration_ms: 237354,
       explicit: false,
       external_ids: [Object],
       external_urls: [Object],
       href: 'https://api.spotify.com/v1/tracks/4WYdnYz9C7zixJuWcy67FJ',
       id: '4WYdnYz9C7zixJuWcy67FJ',
       is_local: false,
       name: 'Before Sunrise',
       popularity: 41,
       preview_url:
        'https://p.scdn.co/mp3-preview/95972402492e888972c43a61c5c19a2369313d31?cid=efa2b81c38df42b693a38401bdbe7d04',
       track_number: 1,
       type: 'track',
       uri: 'spotify:track:4WYdnYz9C7zixJuWcy67FJ'
     }
   },
...
]
```

### Cleaned data
I really only need the song name, the artists and a mp3 sample. So I did a little bit of data cleaning before storing the data in the database:

```javascript
function cleanItems (data) {
  const cleanedData = data.map(item => {
    const track = item.track

    return {
      'song': track.name,
      'artists': track.artists.map(artist => artist.name),
      'sample': track.preview_url
    }
  })
  // console.log('data cleaned: ', cleanedData)
  return cleanedData
}
```

This will return the cleaned data as:

```
[ { song: 'Before Sunrise',
    artists: [ 'Gengahr' ],
    sample:
     'https://p.scdn.co/mp3-preview/95972402492e888972c43a61c5c19a2369313d31?cid=efa2b81c38df42b693a38401bdbe7d04' 
  },
...
]
```

## Database 
For storing user and room data, I'm using [mongodb](https://www.mongodb.com/). This keeps the server space from overflowing. On top of that, my app won't break when the server goes down for a minute. For storing room and user data, I've used the following scheme. This is required for mongodb to work.

```javascript
// Mongoose schema
const Schema = mongoose.Schema
const roomSchema = new Schema({
  pin: String,
  hostName: String,
  duration: String,
  players: {
    type: Array,
    default: []
  },
  songsTotal: {
    type: Array,
    default: []
  },
  songsSelection: {
    type: Array,
    default: []
  }
})

const UserSchema = new Schema({
  username: String,
  connectedRoom: String,
  songs: {
    type: Array,
    default: []
  }
})

// // Model
const Room = mongoose.model('Room', roomSchema)
const User = mongoose.model('User', UserSchema)
```

## Socket events
<details>
<summary>
Create Room
</summary>
The user fills out his name and chooses the length of the game: 5min, 10min or 15min. A submit button is clicked, firing a `create room` event to the server. Here, a random pin is created. In this event, a new room and a new user is created and stored in the database. The created user gets added to the room. The pin of the room is set and a 'ready to play' button appears only for the host of the room. This gives the host the exclusive permission to start the game and not the other players.
    
**Client side**

```javascript
// Creating game
const createGameButton = document.getElementById('create-game')
createGameButton.addEventListener('click', () => {
  const playerName = document.getElementsByName('playerName')[0].value
  const duration = document.querySelector('input[name="duration"]:checked').value
  socket.emit('create room', {
    pin: null,
    hostName: playerName,
    duration: duration,
    players: [
      playerName
    ]
  })
})
```

**Server side**

```javascript
socket.on('create room', data => {
    const roomPin = getRandomNumber(1000000)

    // Add username to every song object
    const cleanedDataWithName = addUsername(cleanedData, data.hostName)

    // Create new user
    const user = {
      username: data.hostName,
      connectedRoom: roomPin.toString(),
      songs: cleanedDataWithName
    }

    // Save new user to database
    const newUser = new User(user)
    console.log('new user: ', newUser)

    newUser.save(err => {
      if (err) {
        console.log('save failed: ', err)
      } else {
        console.log('user has been saved')
      }
    })

    // Create new room with right data
    const room = {
      pin: roomPin,
      hostName: data.hostName,
      duration: data.duration,
      players: [
        data.hostName
      ],
      songsTotal: cleanedDataWithName
    }

    // Save new room to database
    const newRoom = new Room(room)

    newRoom.save(err => {
      if (err) {
        console.log('save failed: ', err)
      } else {
        console.log('room has been saved')
      }
    })

    // Set username of socket
    socket.username = data.hostName
    socket.room = roomPin
    console.log(socket.room)

    // Let user who created room join it
    socket.join(roomPin)

    // Let play button appear for the one who created the room
    socket.emit('play button appear')

    // Set the right room pin in waiting room
    io.in(roomPin).emit('set pin', roomPin)

    // Add user to waiting room
    io.in(roomPin).emit('user joined', data.hostName)

    // Increase amount of players ready by 1
    socket.emit('increment', 1)
  })
```
</details>


## Author and license
Coen Mathijssen - MIT license
