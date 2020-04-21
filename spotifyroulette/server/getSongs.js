const fetch = require('node-fetch')

module.exports = async (req, res, next) => {
  const accessToken = req.cookies.ACCESS_TOKEN

  const headers = {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    }
  }

  try {
    const spotifyResponse = await fetch(('https://api.spotify.com/v1/me/tracks'), headers)
    let data = await spotifyResponse.json()
    data = data.items
    // console.log(data)
    const cleanedData = cleanItems(data)
    res.send(cleanedData)
  } catch (err) {
    console.log('error fetching songs of user: ', err)
  }
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
  console.log('data cleaned: ', cleanedData)
  return cleanedData
}
