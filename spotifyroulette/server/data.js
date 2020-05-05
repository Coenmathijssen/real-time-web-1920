// Pick random items out of array
// https://stackoverflow.com/questions/19269545/how-to-get-n-no-elements-randomly-from-an-array
function randomSongPick (array, amount) {
  return array
    .map(x => ({ x, r: Math.random() }))
    .sort((a, b) => a.r - b.r)
    .map(a => a.x)
    .slice(0, amount)
}

function filterDuplicates (songs) {
  const unique = songs.filter((elem, index, self) => self.findIndex((t) => {
    // https://stackoverflow.com/questions/36032179/remove-duplicates-in-an-object-array-javascript
    return (t.song === elem.song)
  }) === index)

  return unique
}

function addUsername (array, username) {
  return array.map(el => {
    let song = Object.assign({}, el)
    song.username = username
    return song
  })
}

function cleanItems (data) {
  const cleanedData = data.map(item => {
    const track = item.track

    return {
      'song': track.name,
      'artists': track.artists.map(artist => artist.name),
      'sample': track.preview_url
    }
  })
  // console.log('data cleaned: ', cleanedData)
  return cleanedData
}

function getRandomNumber (between) {
  return Math.floor(Math.random() * between) + 1
}

module.exports = { randomSongPick, filterDuplicates, addUsername, cleanItems, getRandomNumber }
