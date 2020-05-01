const express = require('express')
const router = express.Router()

router.get('/index', function (req, res) {
  res.render('index.ejs')
})

router.get('/create', function (req, res) {
  res.render('create-game.ejs')
})

router.get('/join', function (req, res) {
  res.render('join-game.ejs')
})

router.get('/wait', function (req, res) {
  res.render('waiting-room.ejs')
})

router.get('/guess', function (req, res) {
  res.render('guess.ejs')
})

router.get('/score', function (req, res) {
  res.render('score.ejs')
})

module.exports = router
