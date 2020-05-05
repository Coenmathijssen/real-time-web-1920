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

// Add users in waiting room, game and scoreboard
socket.on('user joined', user => {
  // Add users in waiting room
  let playerList = document.getElementsByClassName('players')[0]
  playerList.innerHTML += `<p class="${user}">${user}</p>`

  // // Add users in game
  // let players = document.getElementsByClassName('players')[1]
  // players.innerHTML += `<p id="${user}" class="answer">${user}</p>`

  let scoreboard = document.getElementsByClassName('scoreboard')[0]
  scoreboard.innerHTML +=
  `<div class="scorecard score${user}">
    <p class="place place-${user}">01</p>
    <p class="name name-${user}">${user}</p>
    <p class="score" id="score-${user}"></p>
  </div>`
})

// Update counter of players ready
socket.on('increment', amount => {
  let playersReady = document.getElementById('players-ready')
  playersReady.textContent = amount
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

<details>
<summary>
Join room request
</summary>
Here, a user fills in his name and the required game pin. On the submit button, a 'join room request' is fired to the server. The server reads out the data passed through the socket event. Then, the server checks if the room exists, if the room isn't full (max 10 players). If everything checks out, a new user is created and stored in the database. The user is added to the room and the waiting room is updated visually.
    
**client side**

```javascript
// Join game
const joinGameButton = document.getElementById('join-game')
joinGameButton.addEventListener('click', () => {
  console.log('working client')
  const playerName = document.getElementsByName('playerName')[1].value
  const pin = document.getElementsByName('groupName')[0].value

  socket.emit('join room request', {
    pin: pin,
    playerName: playerName
  })
})

// Add users in waiting room, game and scoreboard
socket.on('user joined', user => {
  // Add users in waiting room
  let playerList = document.getElementsByClassName('players')[0]
  playerList.innerHTML += `<p class="${user}">${user}</p>`

  // // Add users in game
  // let players = document.getElementsByClassName('players')[1]
  // players.innerHTML += `<p id="${user}" class="answer">${user}</p>`

  let scoreboard = document.getElementsByClassName('scoreboard')[0]
  scoreboard.innerHTML +=
  `<div class="scorecard score${user}">
    <p class="place place-${user}">01</p>
    <p class="name name-${user}">${user}</p>
    <p class="score" id="score-${user}"></p>
  </div>`
})

// Update counter of players ready
socket.on('increment', amount => {
  let playersReady = document.getElementById('players-ready')
  playersReady.textContent = amount
})
```

**server side**

```javascript
socket.on('join room request', data => {
    // Convert entered user pin to number
    const roomPin = data.pin

    // Find the right room
    Room.findOne({ pin: roomPin }, (err, foundRoom) => {
      if (err) {
        console.log('not found', err)
        socket.emit('denied', roomPin)
      } else {
        if (!foundRoom) {
          // If the room doesn't exist, send error
          console.log('User not found in database')
          socket.emit('denied', `The entered pin of ${roomPin} is not valid, please try again`)
          return
        }

        // Set username of socket
        socket.username = data.playerName

        // Room is not full and player can enter
        if (foundRoom.players.length < 10) {
          // Add username to song object
          const cleanedDataWithName = addUsername(cleanedData, data.playerName)

          // Create new user
          const user = {
            username: data.playerName,
            connectedRoom: roomPin,
            songs: cleanedDataWithName
          }

          // Save new user to database
          const newUser = new User(user)
          console.log(newUser)

          newUser.save(err => {
            if (err) {
              console.log('save failed: ', err)
            } else {
              console.log('user has been saved')
            }
          })

          // Save user in room
          foundRoom.players.push(data.playerName)

          // Save songs of users in room
          cleanedDataWithName.forEach(song => {
            foundRoom.songsTotal.push(song)
          })

          // Save editted room to databse
          foundRoom.save((err, updatedRoom) => {
            if (err) {
              console.log('failed to save room', err)
            }
          })

          // Let the user also show the users who joined before him
          foundRoom.players.forEach(player => {
            if (player !== data.playerName) {
              socket.emit('user joined', player)
            }
          })

          // Let user join room
          socket.join(roomPin)
          io.in(roomPin).emit('set pin', roomPin)
          socket.emit('accepted')

          // Set the roomPin for user
          io.in(roomPin).emit('set pin', roomPin)

          // Add user in the waiting room (visually)
          io.in(roomPin).emit('user joined', data.playerName)
          io.in(roomPin).emit('increment', foundRoom.players.length)
        } else {
          // If the room is full, send error
          console.log('Room is full')
          socket.emit('denied', `The room with pin ${roomPin} is full, try again in a bit`)
        }
      }
    })
  })
```
</details>

<details>
<summary>
Accepted / Denied (room request)
</summary>
If the room is not full and the pin is valid, the client gets sent an 'accepted'. On this socket event, the waiting room appears. If it doesn't check out, the client gets sent an 'denied'. On this socket event, an alert is shown with the reason why they didn't get through.
    
**client side**

```javascript
socket.on('accepted', roomPin => {
  joinGame.classList.remove('visible')
  waitingRoom.classList.add('visible')
})

socket.on('denied', message => {
  window.alert(message)
})
```
</details>

<details>
<summary>
Disconnect
</summary>
When a user disconnects, a lot needs to happen server side. First I check if the socket is connected to any room with the help of the database. If so, I need to filter out the songs which came from that user. Next, I delete the player from the room players list. If the player list is now empty (socket was the last player), I delete the whole room from the database. At last, I delete the user from the database. 
    
**server side**

```javascript 
socket.on('disconnect', () => {
    // Check if user is connected to any room
    User.findOne({ username: socket.username, connectedRoom: { $exists: true, $ne: null } }, (err, foundUser) => {
      console.log(foundUser)
      if (err) {
        console.log('not found', err)
      } else {
        if (foundUser !== null) {
          // Find the right room through the user
          Room.findOne({ pin: foundUser.connectedRoom }, (err, foundRoom) => {
            if (err) {
              console.log('not found', err)
            } else {
              if (foundRoom.players) {
                // Delete player from room player song array
                foundRoom.players = foundRoom.players.filter(player => {
                  return player !== socket.username
                })

                // Delete player songs from room song array
                foundRoom.songsTotal = foundRoom.songsTotal.filter(song => {
                  if (song.username !== socket.username) {
                    return song
                  }
                })

                // Update db
                foundRoom.save((err, updatedObject) => {
                  if (err) {
                    console.log('failed to update room', err)
                  }
                })
                // Delete room if no players are in it
              } if (foundRoom.players.length === 0) {
                Room.findOneAndDelete(foundRoom)
                console.log('room deleted')
              }

              // Update waiting room visually for all sockets
              io.in(foundRoom.pin).emit('user left', socket.username)
              io.in(foundRoom.pin).emit('increment', foundRoom.players.length)
            }
          })
        }
      }
    })

    User.findOneAndDelete({username: socket.username})
  })
```
</details>

<details>
<summary>
Start game
</summary>
When the host clicks the play button, the 'start game' event is fired. The server now needs to find the right room in the database. In this room, the duplicate songs are filtered out. Then, a x amount of random songs get picked. This amount depends on the length of the game, set by the host. The game starts and the songs get sent to the client one by one, with a delay.
    
**Client side**

```javascript
// Start game
socket.on('starting', () => {
  document.getElementById('ready-to-play').classList.remove('visible')
  waitingRoom.classList.remove('visible')
  guess.classList.add('visible')
})

socket.on('game commands', song => {
  if (song !== undefined) {
    // Insert song and artist name
    const songMeta = document.getElementsByClassName('song-meta')[0]
    songMeta.innerHTML = `
      <h1>${song.song}</h1>
      <h2>${song.artists[0]}</h2>
    `

    // Insert audio
    const audio = document.getElementById('audio')
    audio.innerHTML = `<audio id="audio-play" src="${song.sample}"></audio>`
    document.getElementById('audio-play').play()
  }

  // Trigger timer
  const timer = document.getElementsByClassName('bar-over')[0]
  timer.classList.add('visible')
  timer.style.transition = 'all 10s linear'
  timer.style.width = '0px'

  // Update right anwser visually
  if (song.username !== undefined) {
    document.getElementById('answer-user').innerHTML = song.username
  }
  // Pause song after 10 seconds
  setTimeout(() => {
    document.getElementById('audio-play').pause()
  },
  10000)

  // Render the score page
  setTimeout(() => {
    guess.classList.remove('visible')
    timer.classList.remove('visible')
    score.classList.add('visible')

    // Reset timer
    timer.style.transition = 'all 0s linear'
    timer.style.width = 'calc(100% - 10px)'
  },
  10001)

  // Render the guess page again
  setTimeout(() => {
    score.classList.remove('visible')
    guess.classList.add('visible')
  },
  15001)

  // Enable users to click on a answer again
  answers.forEach(function (answer) {
    answer.addEventListener('click', submitAnswer)
  })
})
```

**Server side**

```javascript
socket.on('start game', () => {
    // Check if user is connected to any room
    User.findOne({ username: socket.username, connectedRoom: { $exists: true, $ne: null } }, (err, foundUser) => {
      if (err) {
        console.log(err)
      } else {
        if (foundUser !== null) {
          // Find the right room through the user
          Room.findOne({ pin: foundUser.connectedRoom }, (err, foundRoom) => {
            if (err) {
              console.log('not found', err)
            } else {
              // filter out duplicate songs
              const noDuplicateSongs = filterDuplicates(foundRoom.songsTotal)

              // Determine amount of used songs for game, according to duration
              if (foundRoom.duration === '5min') {
                foundRoom.songsSelection = randomSongPick(noDuplicateSongs, 9)
              } else if (foundRoom.duration === '10min') {
                foundRoom.songsSelection = randomSongPick(noDuplicateSongs, 18)
              } else if (foundRoom.duration === '15min') {
                foundRoom.songsSelection = randomSongPick(noDuplicateSongs, 27)
              }

              // Update db
              foundRoom.save((err, updatedObject) => {
                if (err) {
                  console.log('failed to update room', err)
                }
              })
            }
            // Add players to guess room
            io.in(foundUser.connectedRoom).emit('add players', foundRoom.players)
            socket.emit('add players', foundRoom.players)

            // START GAME
            gameStart(foundRoom)
          })
          io.in(foundUser.connectedRoom).emit('starting')
        }
      }
    })
  })
  
  // Pick random items out of array
function randomSongPick (array, amount) {
  return array
    .map(x => ({ x, r: Math.random() }))
    .sort((a, b) => a.r - b.r)
    .map(a => a.x)
    .slice(0, amount)
}

function filterDuplicates (songs) {
  const unique = songs.filter((elem, index, self) => self.findIndex((t) => {
    // https://stackoverflow.com/questions/36032179/remove-duplicates-in-an-object-array-javascript
    return (t.song === elem.song)
  }) === index)

  return unique
}

function gameStart (room) {
  io.in(room.pin).emit('game commands')

  // Wait 10 seconds with every iteration
  const interval = 15000
  room.songsSelection.forEach(function (song, index) {
    setTimeout(() => {
      io.in(room.pin).emit('game commands', song)
      io.in(room.pin).emit('update answer', song.username)
    }, index * interval)
  })
}
```
</details>

<details>
<summary>
Answer submitted
</summary>
I have an eventListener on every possible answer. These anwser have an unique id with the name of the player. This gets sent to the server. I check if the answer is correct. Then I update the score and sent an 'update score' event back to the server. On this 'update score' event in the client. I sort the player with the highest score to the lowest score. Next, I update the scoreboard.
    
**client side**

```javascript
socket.on('update score', (user, score) => {
  console.log(user)
  console.log(document.getElementById(`score-${user}`))
  document.getElementById(`score-${user}`).textContent = score

  moveUsersInScoreboard()
})

function moveUsersInScoreboard () {
  // Add all connected players to the guess room
  const scores = document.getElementsByClassName('score')

  // https://stackoverflow.com/questions/282670/easiest-way-to-sort-dom-nodes
  // Sort innerHTML from high to low (score)
  const sorted = []
  for (var i in scores) {
    if (scores[i].nodeType === 1) { // get rid of the whitespace text nodes
      sorted.push(scores[i])
    }
  }

  sorted.sort((a, b) => {
    return a.innerHTML === b.innerHTML
      ? 0
      : (a.innerHTML < b.innerHTML ? 1 : -1)
  })

  // Remove 'score-' in id
  const sortedNames = sorted.map(item => {
    let id = item.id
    id = id.replace('score-', '')
    return id
  })

  let scoreboard = document.getElementsByClassName('scoreboard')[0]
  scoreboard.innerHTML = ''

  sortedNames.forEach((item, i) => {
    let place = i + 1
    let score = sorted[i].innerHTML
    score = score.toString()
    console.log('item: ', score)

    scoreboard.innerHTML +=
    `<div class="scorecard score${item}">
      <p class="place place-${item}">0${place}</p>
      <p class="name name-${item}">${item}</p>
      <p class="score" id="score-${item}">${score}</p>
    </div>`
  })
}
```

**server side**

```javascript
let songsPassed = 0
let score = 0

socket.on('answer submitted', answer => {
    User.findOne({ username: socket.username, connectedRoom: { $exists: true, $ne: null } }, (err, foundUser) => {
      if (err) {
        console.log(err)
      } else {
        if (foundUser !== null) {
          // Find the right room through the user
          Room.findOne({ pin: foundUser.connectedRoom }, (err, foundRoom) => {
            if (err) {
              console.log('not found', err)
            } else {
              // Check if anwser is correct
              if (answer === foundRoom.songsSelection[songsPassed].username) {
                score = score + 100
                // User got it right, update anwser
                io.in(foundUser.connectedRoom).emit('update score', foundUser.username, score)
                songsPassed++
              } else {
                // User got it wrong, update anwser
                io.in(foundUser.connectedRoom).emit('update score', foundUser.username, score)
                songsPassed++
              }
            }
          })
        }
      }
    })
  })
```
</details>

## Creating and modifying data
In this function, I check for objects with the same .song key. If so, I will only keep one

```javascript
function filterDuplicates (songs) {
  const unique = songs.filter((elem, index, self) => self.findIndex((t) => {
    // https://stackoverflow.com/questions/36032179/remove-duplicates-in-an-object-array-javascript
    return (t.song === elem.song)
  }) === index)

  return unique
}
```

In this function, I pick x amount of random songs out of an array to use in the game
  
```javascript
// Pick random items out of array
// https://stackoverflow.com/questions/19269545/how-to-get-n-no-elements-randomly-from-an-array
function randomSongPick (array, amount) {
  return array
    .map(x => ({ x, r: Math.random() }))
    .sort((a, b) => a.r - b.r)
    .map(a => a.x)
    .slice(0, amount)
}
```

Here, I create an array of html elements. I sort this array on the value (number) in the innerHTML. Next, I remove part of an ID.

```javascript
// Add all connected players to the guess room
  const scores = document.getElementsByClassName('score')

  // https://stackoverflow.com/questions/282670/easiest-way-to-sort-dom-nodes
  // Sort innerHTML from high to low (score)
  const sorted = []
  for (var i in scores) {
    if (scores[i].nodeType === 1) { // get rid of the whitespace text nodes
      sorted.push(scores[i])
    }
  }

  sorted.sort((a, b) => {
    return a.innerHTML === b.innerHTML
      ? 0
      : (a.innerHTML < b.innerHTML ? 1 : -1)
  })

  // Remove 'score-' in id
  const sortedNames = sorted.map(item => {
    let id = item.id
    id = id.replace('score-', '')
    return id
  })
```

## Author and license
Coen Mathijssen - MIT license
