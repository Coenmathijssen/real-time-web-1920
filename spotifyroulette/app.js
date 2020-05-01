const express = require('express')
const app = express()
const path = require('path')
const socket = require('socket.io')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
require('dotenv').config()

const loginRoute = require('./server/login.js')
const callbackRoute = require('./server/callback.js')
const getSongs = require('./server/getSongs.js')
const createGame = require('./server/create-game.js')

// Setting up port for express to use
const server = app.listen(process.env.PORT || 3000, () => {
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

// Socket setup
const io = socket(server)
io.on('connection', (socket) => {
  socket.username = 'anonymous'
})

// Get routes
app.get('/login', loginRoute) // Redirect for Spotify auth
app.get('/callback', callbackRoute) // calback url
app.get('/account', getSongs) // calback url

// Create a new room with unique ID
app.post('/create-game', createGame)
