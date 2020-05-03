// Make connection
const socket = io()

let cookie = getCookie('ACCESS_TOKEN')

// let pages appear and disapear
const introduction = document.getElementsByClassName('introduction')[0]
const createGame = document.getElementsByClassName('create')[0]
const joinGame = document.getElementsByClassName('join')[0]
const waitingRoom = document.getElementsByClassName('waiting-room')[0]
const guess = document.getElementsByClassName('guess')[0]
const score = document.getElementsByClassName('scores')[0]

// Introduction
document.getElementById('create-gimma').addEventListener('click', () => {
  introduction.classList.remove('visible')
  createGame.classList.add('visible')
})

document.getElementById('join-gimma').addEventListener('click', () => {
  introduction.classList.remove('visible')
  joinGame.classList.add('visible')
})

// Create game
document.getElementById('create-game').addEventListener('click', () => {
  createGame.classList.remove('visible')
  waitingRoom.classList.add('visible')
})

// Waiting room
document.getElementById('ready-to-play').addEventListener('click', () => {
  socket.emit('start game')
})

// Guess room
document.getElementsByClassName('time')[0].addEventListener('click', () => {
  guess.classList.remove('visible')
  score.classList.add('visible')
})

// SOCKET.IO

// Creating game
const createGameButton = document.getElementById('create-game')
createGameButton.addEventListener('click', () => {
  const playerName = document.getElementsByName('playerName')[0].value
  const duration = document.querySelector('input[name="duration"]:checked').value
  console.log(playerName, duration)
  socket.emit('create room', {
    pin: null,
    hostName: playerName,
    duration: duration,
    players: [
      playerName
    ]
  })
})

// Set room pin of waiting room
socket.on('set pin', roomPin => {
  console.log('running?')
  const pin = document.getElementById('room-pin')
  pin.textContent = roomPin
})

// Join game
// Creating game
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

// Let play button appear for the one socket who created the room
socket.on('play button appear', () => {
  document.getElementById('ready-to-play').classList.add('visible')
})

socket.on('accepted', roomPin => {
  joinGame.classList.remove('visible')
  waitingRoom.classList.add('visible')
})

socket.on('denied', message => {
  window.alert(message)
})

// Add users in waiting room, game and scoreboard
socket.on('user joined', user => {
  // Add users in waiting room
  let playerList = document.getElementsByClassName('players')[0]
  playerList.innerHTML += `<p class="${user}">${user}</p>`

  // Add users in game
  let players = document.getElementsByClassName('players')[1]
  players.innerHTML += `<p id="${user}">${user}</p>`

  let scoreboard = document.getElementsByClassName('scoreboard')[0]
  scoreboard.innerHTML +=
  `<div class="scorecard score${user}">
    <p class="place place${user}">01</p>
    <p class="name name${user}">${user}</p>
    <p class="score score${user}">3524</p>
  </div>`
})

// Update counter of players ready
socket.on('increment', amount => {
  let playersReady = document.getElementById('players-ready')
  playersReady.textContent = amount
})

// Remove users in waiting room
socket.on('user left', user => {
  console.log('joe', user)
  let player = document.getElementById(user)
  console.log(player)
  player.remove()
})

// Start game
socket.on('starting', () => {
  document.getElementById('ready-to-play').classList.remove('visible')
  waitingRoom.classList.remove('visible')
  guess.classList.add('visible')
})

function getCookie(name) {
  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length == 2) return parts.pop().split(";").shift();
}
