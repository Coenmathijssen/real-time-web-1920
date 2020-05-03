const socket = require('socket.io')

const tempDatabase = []

module.exports = socket => {
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

    // Set username of socket
    socket.username = data.hostName
    socket.room = roomPin
    console.log(socket.room)

    // Let user who created room join it
    socket.join(roomPin)

    // Push in temporary database
    tempDatabase.push(newRoom)
    console.log(tempDatabase)

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
}

function getRandomNumber (between) {
  return Math.floor(Math.random() * between) + 1
}
