const express = require('express')
const app = express()
const path = require('path')
const socket = require('socket.io')
const cookieParser = require('cookie-parser')
require('dotenv').config()

const loginRoute = require('./server/login.js')
const callbackRoute = require('./server/callback.js')
const getSongs = require('./server/getSongs.js')

// Setting up port for express to use
const server = app.listen(process.env.PORT || 3000, () => {
  console.log('listening on port: ', process.env.PORT)
})

//  Serve html, css and js files in the static directory
app.use(express.static(path.join(__dirname, 'dist')))
app.use(cookieParser())

// Basic router setup, will seperate later
app.get('/', (req, res) => {
  res.render('index.html')
})

// Socket setup
const io = socket(server)
io.on('connection', (socket) => {
  socket.username = 'anonymous'
})

// Get routes
app.get('/login', loginRoute) // Redirect for Spotify auth
app.get('/callback', callbackRoute) // calback url
app.get('/account', getSongs) // calback url

