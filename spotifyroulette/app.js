const express = require('express')
const app = express()
const path = require('path')
const socket = require('socket.io')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
require('dotenv').config()

const loginRoute = require('./server/login.js')
const callbackRoute = require('./server/callback.js')
const getSongs = require('./server/getSongs.js')
const createGame = require('./server/create-game.js')

// // Setting up port for express to use
// const server = app.listen(3000, `192.168.2.8`, () => {
//   console.log('listening on port: ', process.env.PORT)
// })

// Setting up port for express to use
const server = app.listen(3000, `localhost`, () => {
  console.log('listening on port: ', process.env.PORT)
})

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
  useUnifiedTopology: true
})

mongoose.connection.on('connected', () => {
  console.log('mongoose is connected')
})

// Mongoose schema
const Schema = mongoose.Schema
const UserSchema = new Schema({
  users: {
    type: Array,
    default: []
  },
  songs: {
    type: Array,
    default: []
  },
  rooms: {
    pin: String,
    hostName: String,
    duration: String,
    players: {
      type: Array,
      default: []
    }
  }
})

// Model
const User = mongoose.model('User', UserSchema)

newUser.save(err => {
  if (err) {
    console.log('save failed: ', err)
  } else {
    console.log('data has been saved')
  }
})

// Spotify login routes
app.get('/login', loginRoute) // Redirect for Spotify auth
app.get('/callback', callbackRoute) // calback url
app.get('/index', getSongs) // calback url

// Create a new room with unique ID
app.post('/create-game', createGame)

const tempDatabase = []

// Socket setup
const io = socket(server)

// SOCKET.IO ---> NEED TO SEPERATE LATER
io.on('connection', socket => {
  socket.on('create room', data => {
    const roomPin = getRandomNumber(1000000)

    // Create new room
    const newRoom = {
      pin: roomPin,
      hostName: data.hostName,
      duration: data.duration,
      players: [
        data.hostName
      ]
    }

    const data = {
      rooms: {
        pin: roomPin,
        hostName: data.hostName,
        duration: data.duration,
        players: [
          data.hostName
        ]
      }
    }

    const newUser = new User(data)

    // Set username of socket
    socket.username = data.hostName
    socket.room = roomPin
    console.log(socket.room)

    // Let user who created room join it
    socket.join(roomPin)

    // Push in temporary database
    tempDatabase.push(newRoom)
    console.log(tempDatabase)

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
    const roomPin = Math.floor(data.pin)

    // Filter the right room
    const found = tempDatabase.filter(x => x.pin === roomPin)
    console.log(found)

    if (found.length > 0) {
      // Set username of socket
      socket.username = data.playerName

      // Set roompin of socket
      socket.room = roomPin
      console.log(socket.room)

      // Get index of the right room in array
      const foundIndex = tempDatabase.findIndex(x => x.pin === roomPin)

      // Create a playerList of room
      let playerList = tempDatabase[foundIndex].players

      // Check if user list is full. If not, then start the join process
      if (playerList.length < 10) {
        // Let the user also show the users who joined before him
        playerList.forEach(player => {
          socket.emit('user joined', player)
        })

        // Add joined user to the database
        tempDatabase[foundIndex].players.push(data.playerName)
        // console.log(tempDatabase)

        // Let user join room
        socket.join(roomPin)
        io.in(roomPin).emit('set pin', roomPin)
        socket.emit('accepted')

        console.log(tempDatabase)

        // Set the roomPin for user
        io.in(roomPin).emit('set pin', roomPin)

        // Add user in the waiting room (visually)
        io.in(roomPin).emit('user joined', data.playerName)
        io.in(roomPin).emit('increment', playerList.length)
      } else {
        socket.emit('denied', roomPin)
      }
    } else {
      socket.emit('denied', roomPin)
    }
  })

  socket.on('disconnect', () => {
    if (socket.room) {
      const foundIndex = tempDatabase.findIndex(x => x.pin === socket.room)

      // Create a playerList of room
      const playerList = tempDatabase[foundIndex].players

      // Remove player from playerslist
      tempDatabase[foundIndex].players = playerList.filter(player => {
        return player !== socket.username
      })
      console.log(tempDatabase)

      // Update waiting room visually for all sockets
      io.in(socket.room).emit('user left', socket.username)
      io.in(socket.room).emit('increment', tempDatabase[foundIndex].players.length)

      // Delete room if no players are in it
      if (tempDatabase[foundIndex].players.length === 0) {
        tempDatabase.splice(foundIndex, 1)
        console.log(tempDatabase)
      }
    }
  })

  socket.on('start game', () => {
    io.in(socket.room).emit('starting')
  })
})

function getRandomNumber (between) {
  return Math.floor(Math.random() * between) + 1
}
