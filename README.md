# Real Time Web - Chat app

<img width="525" alt="Screenshot 2020-04-09 at 18 28 04" src="https://user-images.githubusercontent.com/43337909/78917958-ed65b880-7a8f-11ea-8321-dcc7a99fb7d6.png">


This assignment is to help you understand the concept of communicating and changing states through a Web Socket. For this assignment, Socket.io is used for creating a basic chat application.

## Dependencies
- Express
- Socket.io
- Dotenv
- Nodemon
- Parcel

## Basic usage example of Socket.io
HTML for sending a message

```html
<div class="messaging-container">
  <input type="text" id="message" placeholder="Message">
  <button id="send">Verstuur</button>
</div>
```

Receiving the message server-side, and emitting to all connected sockets

```javascript
const io = socket(server)
io.on('connection', (socket) => {
  socket.username = 'anonymous'

  // Handle chat event
  socket.on('chat', (data) => {
    io.sockets.emit('chat', data.message, socket.username)
  })
})
```

Displaying the data sent from server on all sockets, client-side

```javascript
socket.on('chat', (data, username) => {
  output.innerHTML += `<p><strong>${username}: </strong>${data}</p>`
  feedback.innerHTML = ''
})
```

A detailed description can be found at https://socket.io/

## Features
### Swear words
As an extra feature, I'm filtering out swear words and replace them with *. 

First I made an array of swear words:

```javascript 
let swearList = ['kanker', 'kut', 'hoer', 'lul', 'eikel', 'mongool', '4r5e', '5h1t', '5hit', 'a55', 'anal', 'anus', 'ar5e', 'arrse', 'arse', 'ass', 'ass-fucker', 'asses', 'assfucker', 'assfukka', 'asshole', 'assholes', 'asswhole', 'a_s_s', 'b!tch', 'b00bs', 'b17ch', 'b1tch', 'ballbag', 'balls', 'ballsack', 'bastard', 'beastial', 'beastiality', 'bellend', 'bestial', 'bestiality', 'bi+ch', 'biatch', 'bitch', 'bitcher', 'bitchers', 'bitches', 'bitchin', 'bitching', 'bloody', 'blow job', 'blowjobs', 'boiolas', 'bollock', 'bollok', 'boner', 'boob', 'boobs', 'booobs', 'boooobs', 'booooobs', 'booooooobs', 'breasts', 'buceta', 'bugger', 'bum', 'bunny fucker', 'butt', 'butthole', 'buttmuch', 'buttplug', 'c0ck', 'c0cksucker', 'carpet muncher', 'cawk', 'chink', 'cipa', 'cl1t', 'clit', 'clitoris', 'clits', 'cnut', 'cock', 'cock-sucker', 'cockface', 'cockhead', 'cockmunch', 'cockmuncher', 'cocks', 'cocksuck', 'cocksucked', 'cocksucker', 'cocksucking', 'cocksucks', 'cocksuka', 'cocksukka', 'cok', 'cokmuncher', 'coksucka', 'coon', 'cox', 'crap', 'cum', 'cummer', 'cumming', 'cums', 'cumshot', 'cunilingus', 'cunillingus', 'cunnilingus', 'cunt', 'cuntlick', 'cuntlicker', 'cuntlicking', 'cunts', 'cyalis', 'cyberfuc', 'cyberfuck', 'cyberfucked', 'cyberfucker', 'cyberfuckers', 'cyberfucking', 'd1ck', 'damn', 'dick', 'dickhead', 'dildo', 'dildos', 'dink', 'dinks', 'dirsa', 'dlck', 'dog-fucker', 'doggin', 'dogging', 'donkeyribber', 'doosh', 'duche', 'dyke', 'ejaculate', 'ejaculated', 'ejaculates', 'ejaculating', 'ejaculatings', 'ejaculation', 'ejakulate', 'f4nny', 'fag', 'fagging', 'faggitt', 'faggot', 'faggs', 'fagot', 'fagots', 'fags', 'fanny', 'fannyflaps', 'fannyfucker', 'fanyy', 'fatass', 'fcuk', 'fcuker', 'fcuking', 'feck', 'fecker', 'felching', 'fellate', 'fellatio', 'fingerfuck', 'fingerfucked', 'fingerfucker', 'fingerfuckers', 'fingerfucking', 'fingerfucks', 'fistfuck', 'fistfucked', 'fistfucker', 'fistfuckers', 'fistfucking', 'fistfuckings', 'fistfucks', 'flange', 'fook', 'fooker', 'fuck', 'fucka', 'fucked', 'fucker', 'fuckers', 'fuckhead', 'fuckheads', 'fuckin', 'fucking', 'fuckings', 'fuckingshitmotherfucker', 'fuckme', 'fucks', 'fuckwhit', 'fuckwit', 'fudge packer', 'fudgepacker', 'fuk', 'fuker', 'fukker', 'fukkin', 'fuks', 'fukwhit', 'fukwit', 'fux', 'fux0r', 'f_u_c_k', 'gangbang', 'gangbanged', 'gangbangs', 'gaylord', 'gaysex', 'goatse', 'God', 'god-dam', 'god-damned', 'goddamn', 'goddamned', 'hardcoresex', 'hell', 'heshe', 'hoar', 'hoare', 'hoer', 'homo', 'hore', 'horniest', 'horny', 'hotsex', 'jack-off', 'jackoff', 'jap', 'jerk-off', 'jism', 'jiz', 'jizm', 'jizz', 'kawk', 'knob', 'knobead', 'knobed', 'knobend', 'knobhead', 'knobjocky', 'knobjokey', 'kock', 'kondum', 'kondums', 'kum', 'kummer', 'kumming', 'kums', 'kunilingus', 'l3i+ch', 'l3itch', 'labia', 'lust', 'lusting', 'm0f0', 'm0fo', 'm45terbate', 'ma5terb8', 'ma5terbate', 'masochist', 'master-bate', 'masterb8', 'masterbat*', 'masterbat3', 'masterbate', 'masterbation', 'masterbations', 'masturbate', 'mo-fo', 'mof0', 'mofo', 'mothafuck', 'mothafucka', 'mothafuckas', 'mothafuckaz', 'mothafucked', 'mothafucker', 'mothafuckers', 'mothafuckin', 'mothafucking', 'mothafuckings', 'mothafucks', 'mother fucker', 'motherfuck', 'motherfucked', 'motherfucker', 'motherfuckers', 'motherfuckin', 'motherfucking', 'motherfuckings', 'motherfuckka', 'motherfucks', 'muff', 'mutha', 'muthafecker', 'muthafuckker', 'muther', 'mutherfucker', 'n1gga', 'n1gger', 'nazi', 'nigg3r', 'nigg4h', 'nigga', 'niggah', 'niggas', 'niggaz', 'nigger', 'niggers', 'nob', 'nob jokey', 'nobhead', 'nobjocky', 'nobjokey', 'numbnuts', 'nutsack', 'orgasim', 'orgasims', 'orgasm', 'orgasms', 'p0rn', 'pawn', 'pecker', 'penis', 'penisfucker', 'phonesex', 'phuck', 'phuk', 'phuked', 'phuking', 'phukked', 'phukking', 'phuks', 'phuq', 'pigfucker', 'pimpis', 'piss', 'pissed', 'pisser', 'pissers', 'pisses', 'pissflaps', 'pissin', 'pissing', 'pissoff', 'poop', 'porn', 'porno', 'pornography', 'pornos', 'prick', 'pricks', 'pron', 'pube', 'pusse', 'pussi', 'pussies', 'pussy', 'pussys', 'rectum', 'retard', 'rimjaw', 'rimming', 's hit', 's.o.b.', 'sadist', 'schlong', 'screwing', 'scroat', 'scrote', 'scrotum', 'semen', 'sex', 'sh!+', 'sh!t', 'sh1t', 'shag', 'shagger', 'shaggin', 'shagging', 'shemale', 'shi+', 'shit', 'shitdick', 'shite', 'shited', 'shitey', 'shitfuck', 'shitfull', 'shithead', 'shiting', 'shitings', 'shits', 'shitted', 'shitter', 'shitters', 'shitting', 'shittings', 'shitty', 'skank', 'slut', 'sluts', 'smegma', 'smut', 'snatch', 'son-of-a-bitch', 'spac', 'spunk', 's_h_i_t', 't1tt1e5', 't1tties', 'teets', 'teez', 'testical', 'testicle', 'tit', 'titfuck', 'tits', 'titt', 'tittie5', 'tittiefucker', 'titties', 'tittyfuck', 'tittywank', 'titwank', 'tosser', 'turd', 'tw4t', 'twat', 'twathead', 'twatty', 'twunt', 'twunter', 'v14gra', 'v1gra', 'vagina', 'viagra', 'vulva', 'w00se', 'wang', 'wank', 'wanker', 'wanky', 'whoar', 'whore', 'willies', 'willy', 'xrated', 'xxx']
```

When a message is sent, I'm filtering it with this function. It loops over every swear word and replaces all characters with astrixes. Then I heck for a matching swear word, and replacing it with the astrixes. The whole sentence gets returned.

```javascript
function filterSwearWords (sentence, swearList) {
  let stringArray = sentence.split(' ')

  // Credits for Joan helping me
  swearList.forEach(swearWord => {
    let astrix = ''

    for (let i = 0; i < swearWord.length; i++) {
      astrix += '*'
    }
    sentence = sentence.replace(new RegExp(swearWord, 'g'), `${astrix}`)
  })

  return sentence
}
```

Now I'm broadcasting the message to all sockets listening

```javascript
// Handle chat event
  socket.on('chat', (data) => {
    Emitting to all sockets
    let stringArray = data.message.split(' ')
    console.log(stringArray)
    data.message = filterSwearWords(data.message, swearList)
    io.sockets.emit('chat', data.message, socket.username)
  })
```

### Never the same username
I'm checking if the chosen username is already active. If it is, I'm adding a random number after the chosen username. So that every user will be unique.

```javascript
// Create a username list
let activeUsernames = []

// Setting username
  socket.on('setUsername', (data) => {
    // Push username to array
    if (activeUsernames.includes(data.username)) {
      socket.username = data.username + getRandomNumber(10000)
      activeUsernames.push(socket.username)
      console.log(socket.username)
    } else {
      socket.username = data.username
      activeUsernames.push(socket.username)
    }

    // Emitting joined user to all sockets
    socket.broadcast.emit('userJoined', socket.username)
    socket.emit('youJoined', socket.username)
  })
  
 function getRandomNumber (between) {
  return Math.floor(Math.random() * between) + 1
}
```

## Install
1. Open the terminal on your computer.
2. Create a directory in a location of your choice with `mkdir` in your console.
3. Clone the repository with the following command:
<br></br>
`git clone https://github.com/Coenmathijssen/browser-technologies-1920.git`
<br></br>
4. Navigate to the repo with the `cd` command in your console. Next, install all the dependencies with 
<br></br>
`npm install`
<br></br>
5. For building, bundling and compiling of the SCSS and JS, use
<br></br>
`npm run build`
<br></br>
6. To develop and see changes live, use this in your first window of your terminal:
<br></br>
`npm run watch`
<br></br>
And this in your second window of your terminal:
<br></br>
`npm run dev`
<br></br>
These commands are editable in the package.json file
<br></br>
6. Open the localhost to view the webapp.

## Deployment
Deploy website on Heroku:
1. Go to https://www.heroku.com/ and sign in (or create an account).
2. Create new app.
3. Connect the Git repo to your Heroku.
4. Change the directory to 'dist'.
5. Run the installation commands in your terminal.

## Author and license
Coen Mathijssen - MIT license

# Eindopdracht
## Spotify Roulette
For my concept I'm using the Spotify API. How does my concept work? You are able to enter 'rooms'. Your own space for you and your friends. You're able to enter a room with a code, similary like Kahoot. Then, all users give permission for the webapp to read your Spotify saved song data through OAuth. The webapp serves the users a random song from one of the playlist of a user. All friends have to guess to which user the song belongs. If you get it right, you get a point. If you get more points, you can add more songs to a co-created playlist (of your friends). The ultimate winner is also able to rearrange the songs in the co-created playlist. Now you have a playlist together, which you can use at a party!

## Data lifecycle
![data-lifecycle-01](https://user-images.githubusercontent.com/43337909/79839837-641a8400-83b5-11ea-896f-4e9dbc155346.jpg)

