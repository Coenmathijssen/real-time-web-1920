// Import functions
import moveUsersInScoreboard from './scoreboard-move.js'

// Make connection
const socket = io()

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
  const pin = document.getElementById('room-pin')
  pin.textContent = roomPin
})

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
  timer.style.transition = 'all 30s linear'
  timer.style.width = '0px'

  // Update right anwser visually
  if (song.username !== undefined) {
    document.getElementById('answer-user').innerHTML = song.username
  }
  // Pause song after 10 seconds
  setTimeout(() => {
    document.getElementById('audio-play').pause()
  },
  25000)

  // Render the score page
  setTimeout(() => {
    guess.classList.remove('visible')
    timer.classList.remove('visible')
    score.classList.add('visible')

    // Reset timer
    timer.style.transition = 'all 0s linear'
    timer.style.width = 'calc(100% - 10px)'
  },
  25001)

  // Render the guess page again
  setTimeout(() => {
    score.classList.remove('visible')
    guess.classList.add('visible')
  },
  30001)

  // Enable users to click on a answer again
  answers.forEach(function (answer) {
    answer.addEventListener('click', submitAnswer)
    answer.style.backgroundColor = '#121623'
  })
})

// Add all connected players to the guess room
let answers = Array.from(document.getElementsByClassName('answer'))

socket.on('add players', players => {
  for (let i = 0; i < answers.length; i++) {
    if (players[i]) {
      answers[i].classList.add('visible')
      answers[i].textContent = players[i]
      answers[i].id = players[i]
    }
  }
})

// Anwsering
answers.forEach(function (answer) {
  // Create an event listener for every possible answer, where the id is passed
  answer.addEventListener('click', submitAnswer)
})

function submitAnswer () {
  socket.emit('answer submitted', this.id)
  this.style.backgroundColor = '#F6546A'

  // Remove all event listeners when item is clicked, to prevent from clicking multiple times
  answers.forEach(function (answer) {
    answer.removeEventListener('click', submitAnswer)
  })
}

socket.on('update score', (user, score) => {
  console.log(user)
  console.log(document.getElementById(`score-${user}`))
  document.getElementById(`score-${user}`).textContent = score

  moveUsersInScoreboard()
})
