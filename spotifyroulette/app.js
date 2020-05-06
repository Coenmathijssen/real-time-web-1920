const express = require('express')
const app = express()
const path = require('path')
const fetch = require('node-fetch')
const socket = require('socket.io')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
require('dotenv').config()

const loginRoute = require('./server/login.js')
const callbackRoute = require('./server/callback.js')
const { User, Room } = require('./server/user-schema.js')
const { randomSongPick, filterDuplicates, addUsername, cleanItems, getRandomNumber } = require('./server/data.js')

// Setting up port for express to use
const server = app.listen(process.env.PORT || 3000)

//  Serve html, css and js files in the static directory
app.use(express.static(path.join(__dirname, 'dist')))

// View Engine init
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

// Router setup
const router = require('./public/js/router.js')
app.use(router)

app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())

// Mongoose setup
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/rtw_database', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
}).catch(err => console.log(err))

mongoose.connection.on('connected', () => {
  console.log('mongoose is connected')
})

// Spotify login routes
app.get('/login', loginRoute) // Redirect for Spotify auth
app.get('/callback', callbackRoute) // calback url

// // Create a new room with unique ID
// app.post('/create-game', createGame)

let cleanedData = null

// Socket setup
const io = socket(server)

// SOCKET.IO ---> NEED TO SEPERATE LATER
io.on('connection', socket => {
  let songsPassed = 0
  let score = 0

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
            console.log(song)
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
                foundRoom.remove((err, deleted) => {
                  if (err) {
                    console.log(err)
                  } else {
                    console.log('room deleted')
                  }
                })
              }

              // Update waiting room visually for all sockets
              io.in(foundRoom.pin).emit('user left', socket.username)
              io.in(foundRoom.pin).emit('increment', foundRoom.players.length)
            }
          })
        }
      }
    })

    User.findOneAndDelete({ username: socket.username }, (err, removed) => {
      if (err) {
        console.log(err)
      } else {
        console.log('user deleted')
      }
    })
  })

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
              console.log(randomSongPick(noDuplicateSongs, 9))

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
})

function gameStart (room) {
  // Wait 10 seconds with every iteration
  const interval = 30000
  room.songsSelection.forEach(function (song, index) {
    setTimeout(() => {
      io.in(room.pin).emit('game commands', song)
    }, index * interval)
  })
}

// LELIJKE FETCH
const getSongs = async (req, res, next) => {
  const accessToken = req.cookies.ACCESS_TOKEN

  const headers = {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    }
  }

  try {
    const spotifyResponse = await fetch(('https://api.spotify.com/v1/me/tracks'), headers)
    let data = await spotifyResponse.json()
    data = data.items
    cleanedData = cleanItems(data)
    console.log(cleanedData)
    res.render('index.ejs')
    return cleanedData
  } catch (err) {
    console.log('error fetching songs of user: ', err)
  }
}

app.get('/getData', getSongs) // calback url
