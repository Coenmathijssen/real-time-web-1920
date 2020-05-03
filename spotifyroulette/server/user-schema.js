const mongoose = require('mongoose')

// Mongoose schema
const Schema = mongoose.Schema
const roomSchema = new Schema({
  pin: String,
  hostName: String,
  duration: String,
  players: {
    type: Array,
    default: []
  }
})

const UserSchema = new Schema({
  username: String,
  connectedRoom: String,
  songs: {
    type: Array,
    default: []
  }
})

// // Model
const Room = mongoose.model('Room', roomSchema)
const User = mongoose.model('User', UserSchema)

module.exports = { User, Room }
