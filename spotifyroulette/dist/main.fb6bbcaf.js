// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"js/scoreboard-move.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.moveUsersInScoreboard = moveUsersInScoreboard;

function moveUsersInScoreboard() {
  // Add all connected players to the guess room
  var scores = document.getElementsByClassName('score'); // https://stackoverflow.com/questions/282670/easiest-way-to-sort-dom-nodes
  // Sort innerHTML from high to low (score)

  var sorted = [];

  for (var i in scores) {
    if (scores[i].nodeType === 1) {
      // get rid of the whitespace text nodes
      sorted.push(scores[i]);
    }
  }

  sorted.sort(function (a, b) {
    return a.innerHTML === b.innerHTML ? 0 : a.innerHTML < b.innerHTML ? 1 : -1;
  }); // Remove 'score-' in id

  var sortedNames = sorted.map(function (item) {
    var id = item.id;
    id = id.replace('score-', '');
    return id;
  });
  var scoreboard = document.getElementsByClassName('scoreboard')[0];
  scoreboard.innerHTML = '';
  sortedNames.forEach(function (item, i) {
    var place = i + 1;
    var score = sorted[i].innerHTML;
    score = score.toString();
    console.log('item: ', score);
    scoreboard.innerHTML += "<div class=\"scorecard score".concat(item, "\">\n      <p class=\"place place-").concat(item, "\">0").concat(place, "</p>\n      <p class=\"name name-").concat(item, "\">").concat(item, "</p>\n      <p class=\"score\" id=\"score-").concat(item, "\">").concat(score, "</p>\n    </div>");
  });
}
},{}],"js/main.js":[function(require,module,exports) {
"use strict";

var _scoreboardMove = _interopRequireDefault(require("./scoreboard-move.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Import functions
// Make connection
var socket = io(); // let pages appear and disapear

var introduction = document.getElementsByClassName('introduction')[0];
var createGame = document.getElementsByClassName('create')[0];
var joinGame = document.getElementsByClassName('join')[0];
var waitingRoom = document.getElementsByClassName('waiting-room')[0];
var guess = document.getElementsByClassName('guess')[0];
var score = document.getElementsByClassName('scores')[0]; // Introduction

document.getElementById('create-gimma').addEventListener('click', function () {
  introduction.classList.remove('visible');
  createGame.classList.add('visible');
});
document.getElementById('join-gimma').addEventListener('click', function () {
  introduction.classList.remove('visible');
  joinGame.classList.add('visible');
}); // Create game

document.getElementById('create-game').addEventListener('click', function () {
  createGame.classList.remove('visible');
  waitingRoom.classList.add('visible');
}); // Waiting room

document.getElementById('ready-to-play').addEventListener('click', function () {
  socket.emit('start game');
}); // Guess room

document.getElementsByClassName('time')[0].addEventListener('click', function () {
  guess.classList.remove('visible');
  score.classList.add('visible');
}); // Play and pause audio

var play = document.getElementById('play-button');
var pause = document.getElementById('pause-button');
var audio = document.getElementById('audio-play');
play.addEventListener('click', playAudio);
pause.addEventListener('click', pauseAudio);

function playAudio() {
  play.classList.add('hidden');
  pause.classList.remove('hidden');
  audio.play();
}

function pauseAudio() {
  pause.classList.add('hidden');
  play.classList.remove('hidden');
  audio.pause();
} // SOCKET.IO
// Creating game


var createGameButton = document.getElementById('create-game');
createGameButton.addEventListener('click', function () {
  var playerName = document.getElementsByName('playerName')[0].value;
  var duration = document.querySelector('input[name="duration"]:checked').value;
  socket.emit('create room', {
    pin: null,
    hostName: playerName,
    duration: duration,
    players: [playerName]
  });
}); // Set room pin of waiting room

socket.on('set pin', function (roomPin) {
  var pin = document.getElementById('room-pin');
  pin.textContent = roomPin;
}); // Join game

var joinGameButton = document.getElementById('join-game');
joinGameButton.addEventListener('click', function () {
  console.log('working client');
  var playerName = document.getElementsByName('playerName')[1].value;
  var pin = document.getElementsByName('groupName')[0].value;
  socket.emit('join room request', {
    pin: pin,
    playerName: playerName
  });
}); // Let play button appear for the one socket who created the room

socket.on('play button appear', function () {
  document.getElementById('ready-to-play').classList.add('visible');
});
socket.on('accepted', function (roomPin) {
  joinGame.classList.remove('visible');
  waitingRoom.classList.add('visible');
});
socket.on('denied', function (message) {
  window.alert(message);
}); // Add users in waiting room, game and scoreboard

socket.on('user joined', function (user) {
  // Add users in waiting room
  var playerList = document.getElementsByClassName('players')[0];
  playerList.innerHTML += "<p class=\"".concat(user, "\">").concat(user, "</p>"); // // Add users in game
  // let players = document.getElementsByClassName('players')[1]
  // players.innerHTML += `<p id="${user}" class="answer">${user}</p>`

  var scoreboard = document.getElementsByClassName('scoreboard')[0];
  scoreboard.innerHTML += "<div class=\"scorecard score".concat(user, "\">\n    <p class=\"place place-").concat(user, "\">01</p>\n    <p class=\"name name-").concat(user, "\">").concat(user, "</p>\n    <p class=\"score\" id=\"score-").concat(user, "\"></p>\n  </div>");
}); // Update counter of players ready

socket.on('increment', function (amount) {
  var playersReady = document.getElementById('players-ready');
  playersReady.textContent = amount;
}); // Remove users in waiting room

socket.on('user left', function (user) {
  console.log('joe', user);
  var player = document.getElementById(user);
  console.log(player);
  player.remove();
}); // Start game

socket.on('starting', function () {
  document.getElementById('ready-to-play').classList.remove('visible');
  waitingRoom.classList.remove('visible');
  guess.classList.add('visible');
});
socket.on('game commands', function (song) {
  if (song) {
    // Insert song and artist name
    var songMeta = document.getElementsByClassName('song-meta')[0];
    songMeta.innerHTML = "\n      <h1>".concat(song.song, "</h1>\n      <h2>").concat(song.artists[0], "</h2>\n    "); // Insert and play audio

    audio.src = song.sample;
    playAudio();
  } // Trigger timer


  var timer = document.getElementsByClassName('bar-over')[0];
  timer.classList.add('visible');
  timer.style.transition = 'all 30s linear';
  timer.style.width = '0px'; // Update right anwser visually

  if (song.username) {
    document.getElementById('answer-user').innerHTML = song.username;
  } // Pause song after 10 seconds


  setTimeout(function () {
    pauseAudio();
  }, 25000); // Render the score page

  setTimeout(function () {
    guess.classList.remove('visible');
    timer.classList.remove('visible');
    score.classList.add('visible'); // Reset timer

    timer.style.transition = 'all 0s linear';
    timer.style.width = 'calc(100% - 10px)';
  }, 25001); // Render the guess page again

  setTimeout(function () {
    score.classList.remove('visible');
    guess.classList.add('visible');
  }, 30001); // Enable users to click on a answer again

  answers.forEach(function (answer) {
    answer.addEventListener('click', submitAnswer);
    answer.style.backgroundColor = '#121623';
  });
}); // Add all connected players to the guess room

var answers = Array.from(document.getElementsByClassName('answer'));
socket.on('add players', function (players) {
  for (var i = 0; i < answers.length; i++) {
    if (players[i]) {
      answers[i].classList.add('visible');
      answers[i].textContent = players[i];
      answers[i].id = players[i];
    }
  }
}); // Anwsering

answers.forEach(function (answer) {
  // Create an event listener for every possible answer, where the id is passed
  answer.addEventListener('click', submitAnswer);
});

function submitAnswer() {
  socket.emit('answer submitted', this.id);
  this.style.backgroundColor = '#F6546A'; // Remove all event listeners when item is clicked, to prevent from clicking multiple times

  answers.forEach(function (answer) {
    answer.removeEventListener('click', submitAnswer);
  });
}

socket.on('update score', function (user, score) {
  console.log(user);
  console.log(document.getElementById("score-".concat(user)));
  document.getElementById("score-".concat(user)).textContent = score;
  (0, _scoreboardMove.default)();
});
},{"./scoreboard-move.js":"js/scoreboard-move.js"}],"../node_modules/parcel/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "52652" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../node_modules/parcel/src/builtins/hmr-runtime.js","js/main.js"], null)
//# sourceMappingURL=/main.fb6bbcaf.js.map