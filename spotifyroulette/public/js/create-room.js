// Make connection
const socket = io()

// function animateValue (id, start, end, duration) {
//   var range = end - start
//   var current = start
//   var increment = end > start ? 1 : -1
//   var stepTime = Math.abs(Math.floor(duration / range))
//   var obj = document.getElementById(id)
//   var timer = setInterval(() => {
//     current += increment
//     obj.innerHTML = current
//     if (current === end) {
//       clearInterval(timer)
//     }
//   }, stepTime)
// }

// animateValue('value', 100, 25, 5000)

console.log('joe')

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

// Redirecting to waiting room
socket.on('redirect to waiting room', function (destination) {
  window.location.href = destination
})
