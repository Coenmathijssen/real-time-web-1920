// Make connection
const socket = io()

document.getElementById('room-pin').addEventListener('click', () => {
  console.log('joe')
  socket.emit('set pin')
})

// Redirecting to waiting room
socket.on('set pin', roomPin => {
  console.log('running?')
  const pin = document.getElementById('room-pin')
  pin.textContent = roomPin
})



