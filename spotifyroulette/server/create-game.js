const tempDatabase = []

module.exports = (req, res) => {
  const newRoom = {
    pin: getRandomNumber(100000),
    hostName: req.body.playerName,
    duration: req.body.duration
  }

  tempDatabase.push(newRoom)
  console.log(tempDatabase)
  res.redirect(`/`)
}

function getRandomNumber (between) {
  return Math.floor(Math.random() * between) + 1
}
