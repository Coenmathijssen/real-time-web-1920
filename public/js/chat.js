// Make connection
const socket = io.connect('http://localhost:3000')

// Getting elements
const message = document.getElementById('message')
const handle = document.getElementById('handle')
const sendButton = document.getElementById('send')
const output = document.getElementById('output')
const feedback = document.getElementById('feedback')

// Emit events
sendButton.addEventListener('click', () => {
  socket.emit('chat', {
    message: message.value
  })
})

// Listen for events
// Listening for a connection
socket.on('connected', (data) => {
  output.innerHTML += `<p><strong>${data} </strong>has connected</p>`
})

// Listening for een chat output
socket.on('chat', (data, username) => {
  output.innerHTML += `<p><strong>${username}: </strong>${data}</p>`
  feedback.innerHTML = ''
})

// Emit typing event to server
message.addEventListener('keypress', () => {
  socket.emit('typing')
})

// Displaying who's typing
socket.on('typing', (data) => {
  feedback.innerHTML = `<p><em>${data} is nu aan het typen...</em></p>`
})

// Displaying which user joined the chat
socket.on('userJoined', (data) => {
  output.innerHTML += `<p class="connected">${data} is connected</p>`
})

// Displaying that you joined the chat
socket.on('youJoined', (data) => {
  output.innerHTML += `<p class="connected">Welcome to the chat, ${data}!</p>`
})

// Displaying which user left the chat
socket.on('userLeft', (data) => {
  output.innerHTML += `<p class="disconnected">${data} left the chat</p>`
})

// Setting username
const username = document.getElementById('username')
const usernameSend = document.getElementById('username-send')

// Emit username to server
usernameSend.addEventListener('click', () => {
  document.getElementById('chat').classList.remove('locked')
  socket.emit('setUsername', {
    username: username.value
  })
})
