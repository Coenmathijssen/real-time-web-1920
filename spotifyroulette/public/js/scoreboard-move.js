export function moveUsersInScoreboard () {
  // Add all connected players to the guess room
  const scores = document.getElementsByClassName('score')

  // https://stackoverflow.com/questions/282670/easiest-way-to-sort-dom-nodes
  // Sort innerHTML from high to low (score)
  const sorted = []
  for (var i in scores) {
    if (scores[i].nodeType === 1) { // get rid of the whitespace text nodes
      sorted.push(scores[i])
    }
  }

  sorted.sort((a, b) => {
    return a.innerHTML === b.innerHTML
      ? 0
      : (a.innerHTML < b.innerHTML ? 1 : -1)
  })

  // Remove 'score-' in id
  const sortedNames = sorted.map(item => {
    let id = item.id
    id = id.replace('score-', '')
    return id
  })

  let scoreboard = document.getElementsByClassName('scoreboard')[0]
  scoreboard.innerHTML = ''

  sortedNames.forEach((item, i) => {
    let place = i + 1
    let score = sorted[i].innerHTML
    score = score.toString()
    console.log('item: ', score)

    scoreboard.innerHTML +=
    `<div class="scorecard score${item}">
      <p class="place place-${item}">0${place}</p>
      <p class="name name-${item}">${item}</p>
      <p class="score" id="score-${item}">${score}</p>
    </div>`
  })
}
