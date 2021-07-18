/* global getId, addTrack, moving, drawDots, drawFruit, drawBoard, CreatePacMan, eraseText, drawText, getTrack, CreateEnemy, Audio, requestAnimationFrame */

const paths = [
  // CENTER
  [128, 416, 422, 416],
  [30, 98, 518, 98],
  [0, 258, 186, 258],
  [362, 258, 550, 258],
  [186, 204, 362, 204],
  [186, 310, 362, 310],
  [30, 522, 518, 522],
  [238, 258, 314, 258],
  [276, 204, 276, 258],

  // LEFT
  [128, 26, 128, 470],
  [30, 26, 244, 26],
  [30, 26, 30, 150],
  [30, 150, 128, 150],
  [244, 26, 244, 98],
  [186, 204, 186, 364],
  [30, 364, 244, 364],
  [244, 364, 244, 416],
  [30, 364, 30, 416],
  [30, 416, 70, 416],
  [70, 416, 70, 470],
  [30, 470, 128, 470],
  [30, 470, 30, 522],
  [244, 150, 244, 204],
  [186, 150, 244, 150],
  [186, 98, 186, 150],
  [244, 470, 244, 522],
  [186, 470, 244, 470],
  [186, 416, 186, 470],

  // RIGHT
  [422, 26, 422, 470],
  [304, 26, 518, 26],
  [518, 26, 518, 150],
  [304, 26, 304, 98],
  [422, 150, 518, 150],
  [362, 204, 362, 364],
  [304, 364, 518, 364],
  [304, 364, 304, 416],
  [518, 364, 518, 416],
  [480, 416, 518, 416],
  [480, 416, 480, 470],
  [422, 470, 518, 470],
  [518, 470, 518, 522],
  [304, 150, 304, 204],
  [304, 150, 362, 150],
  [362, 98, 362, 150],
  [304, 470, 304, 522],
  [304, 470, 362, 470],
  [362, 416, 362, 470]
]

const tracksPool = [
  ['openingSong', 'opening', './assets/sound/opening_song.mp3', false],
  ['sirenEffect', 'siren', './assets/sound/siren_effect.mp3', true],
  ['weakGhost', 'weak', './assets/sound/weak_ghost.mp3', true],
  ['wakaEffect', 'waka', './assets/sound/eating_dot.mp3', true],
  ['eatFruit', 'eatFruit', './assets/sound/eat_fruit.mp3', false],
  ['eatGhostEffect', 'eatGhost', './assets/sound/eating_ghost_effect.mp3', false],
  ['goHomeEffect', 'ghostHome', './assets/sound/ghost_go_home.mp3', true],
  ['extraLifeEffect', 'extraLife', './assets/sound/extra_live_effect.mp3', false],
  ['dieEffect', 'die', './assets/sound/dies_effect.mp3', false],
  ['lolSong', 'lol', './assets/sound/lol_u_died.mp3', true]
]

const playerStartPos = new Map([
	['first', { x: 274, y: 416 }],
	['second', { x: 274, y: 98 }]
])

const enemyPool = [
  { color: 'red', target: 'player', spawn: { x: 276, y: 204 } }, // name: 'Blinky'
  { color: 'pink', target: 'after', spawn: { x: 238, y: 258 } }, // name: 'Pinky'
  { color: 'cyan', target: 'any', spawn: { x: 278, y: 258 } }, // name: 'Inky'
  { color: 'orange', target: 'random', spawn: { x: 314, y: 258 } } // name: 'Clyde'
]

const Tau = Math.PI * 2

const mouth = new Map([
  ['right', {
    openS: Tau * 0.1,
    openE: Tau * 0.9,
    closeS: 0,
    closeE: Tau
  }],
  ['left', {
    openS: Tau * 0.6,
    openE: Tau * 0.4,
    closeS: Tau * 0.49,
    closeE: Tau * 0.49
  }],
  ['down', {
    openS: Tau * 0.35,
    openE: Tau * 1.15,
    closeS: Tau * 0.25,
    closeE: Tau * 1.25
  }],
  ['up', {
    openS: Tau * 0.85,
    openE: Tau * 0.65,
    closeS: Tau * 0.74,
    closeE: Tau * 0.74
  }]
])

const cWidth = 550
const cHeight = 550

const canvasPlayer = getId('pacMan')
const cPlayer = canvasPlayer.getContext('2d')

const canvasGhosts = getId('ghosts')
const cGhosts = canvasGhosts.getContext('2d')

const dotsCanvas = getId('dots')
const cDot = dotsCanvas.getContext('2d')

const textCanvas = getId('text')
const cText = textCanvas.getContext('2d')

const boardCanvas = getId('board')
const cBoard = boardCanvas.getContext('2d')

const menu = getId('menu')
const onePlayerButton = getId('onePlayer')
const twoPlayersButton = getId('twoPlayers')
const firstControlButton = getId('changeFirstControl')
const secondControlButton = getId('changeSecondControl')
const muteButton = getId('muteButton')

let stopGame = false

const tracks = new Map()
const playingTracks = new Map()
let muteSound = false

const player = new Map()
const controls = new Map([
  ['firstPlayer', {
    up: 'w',
    left: 'a',
    down: 's',
    right: 'd'
  }],
  ['secondPlayer', {
    up: 'ArrowUp',
    left: 'ArrowLeft',
    down: 'ArrowDown',
    right: 'ArrowRight'
  }]
])

const level = {
  enemies: [],
  dots: [],
  text: [],
  fruit: null
}

const globalStats = {
  firstPlayerHighScore: 0,
  secondPlayerHighScore: 0,
  ghostStreak: 1,
  weakGhostTimer: 0,
  fruitsTimer: 0,
  fruitsSpawned: 0
}

function * changeControlButtons (scheme) {
  const block = document.createElement('div')

  block.id = 'block'

  document.body.append(block)

  alert('After you click OK press key for UP')

  scheme.up = yield

  alert('After you click OK press key for LEFT')

  scheme.left = yield

  alert('After you click OK press key for DOWN')

  scheme.down = yield

  alert('After you click OK press key for RIGHT')

  scheme.right = yield

  document.onkeydown = null

  block.remove()
}

function changeControls (player) {
  const controlScheme = controls.get(player)
  const controlSchemeBeforeChange = {
    up: controlScheme.up,
    left: controlScheme.left,
    down: controlScheme.down,
    right: controlScheme.right
  }

  const iterator = changeControlButtons(controlScheme)

  iterator.next()

  document.onkeydown = event => {
    if (event.key === 'Escape') {
      controlScheme.up = controlSchemeBeforeChange.up
      controlScheme.left = controlSchemeBeforeChange.left
      controlScheme.down = controlSchemeBeforeChange.down
      controlScheme.right = controlSchemeBeforeChange.right

      document.onkeydown = null

      document.getElementById('block').remove()

      return
    }

    iterator.next(event.key)
  }
}

tracksPool.forEach(track => {
  tracks.set(track[0], {
    id: track[1],
    url: new Audio(track[2])
  })

  const createdTrack = tracks.get(track[0])

  createdTrack.url.loop = track[3]
  createdTrack.url.load()
})

tracks.get('wakaEffect').url.volume = 0.5

alert('first player control scheme is - W - A - S - D -\nsecond player control scheme is - Arrow Up - Arrow Left - Arrow Down - Arrow Rigth')

canvasPlayer.width = cWidth
canvasPlayer.height = cHeight

canvasGhosts.width = cWidth
canvasGhosts.height = cHeight

dotsCanvas.width = cWidth
dotsCanvas.height = cHeight

textCanvas.width = cWidth
textCanvas.height = cHeight

boardCanvas.width = cWidth
boardCanvas.height = cHeight

onePlayerButton.addEventListener('click', event => { init(1) })

twoPlayersButton.addEventListener('click', event => { init(2) })

firstControlButton.addEventListener('click', event => { changeControls('firstPlayer') })

secondControlButton.addEventListener('click', event => { changeControls('secondPlayer') })

muteButton.addEventListener('click', event => {
  muteSound = !muteSound

  muteButton.className = muteSound ? 'mute' : 'volume'

  tracks.forEach(t => { t.url.volume = muteSound ? 0 : 1 })
})

function init (playersAmount) {
  const firstPlayerPos = playerStartPos.get('first')

  player.set('first', new CreatePacMan(firstPlayerPos.x, firstPlayerPos.y, 16, 2, 'male'))

  if (playersAmount === 2) {
    const secondPlayerPos = playerStartPos.get('second')

    player.set('second', new CreatePacMan(secondPlayerPos.x, secondPlayerPos.y, 16, 2, 'female'))
  }

  for (const enemy of enemyPool) {
    level.enemies.push(new CreateEnemy(enemy.spawn.x, enemy.spawn.y, 16, 2, enemy.color, enemy.target))
  }

  menu.style.display = 'none'

  document.onkeydown = event => {
    const firstControls = controls.get('firstPlayer')
    const secondControls = controls.get('secondPlayer')

    let key = ''
    let playerKey = ''

    switch (event.key) {
      case firstControls.up:

        key = 'up'
        playerKey = 'first'

        break

      case firstControls.down:

        key = 'down'
        playerKey = 'first'

        break

      case firstControls.left:

        key = 'left'
        playerKey = 'first'

        break

      case firstControls.right:

        key = 'right'
        playerKey = 'first'

        break
    }

    switch (event.key) {
      case secondControls.up:

        key = 'up'
        playerKey = 'second'

        break

      case secondControls.down:

        key = 'down'
        playerKey = 'second'

        break

      case secondControls.left:

        key = 'left'
        playerKey = 'second'

        break

      case secondControls.right:

        key = 'right'
        playerKey = 'second'

        break
    }

    if (key !== '') {
      if (!player.has(playerKey)) return

      const currentPlayer = player.get(playerKey)

      currentPlayer.key = key

      clearTimeout(currentPlayer.turnLag)

      if (currentPlayer.key !== currentPlayer.direction) {
        currentPlayer.turnLag = setTimeout(() => {
          currentPlayer.key = currentPlayer.direction
        }, 1000)
      }
    }
  }

  drawBoard()

  drawDots()

  getReadyForGame()
}

function anime () {
  if (stopGame === true) return

  level.enemies.forEach(e => { e.erase() })
  level.enemies.forEach(e => { e.update() })

  player.forEach(p => { p.erase() })
  player.forEach(p => { p.update() })

  requestAnimationFrame(anime)
}

function releaseGhost () {
  for (let i = 0; i < level.enemies.length; i++) {
    const enemy = level.enemies[i]

    clearTimeout(enemy.releaseTimer)

    enemy.release = false
    enemy.releaseTimer = 0
    enemy.releaseTimer = setTimeout(() => { enemy.release = true }, i * 2000)
  }
}

function getReadyForGame () {
  player.forEach(p => {
    toBasicPosition(p, playerStartPos.get(p.sex === 'male' ? 'first' : 'second'))

    p.dead = false

    clearTimeout(p.invincibleTimer)

    p.invincible = false
    p.invincibleTimer = 0
  })

  for (let i = 0; i < level.enemies.length; i++) { toBasicPosition(level.enemies[i], enemyPool[i].spawn) }

  player.forEach(p => { p.draw() })

  level.enemies.forEach(enemy => enemy.draw())

  drawText(235, 325, 90, 'Ready!', 25, 'yellow')

  addTrack(tracks.get('openingSong')).then(() => {
    eraseText()

    addTrack(tracks.get('sirenEffect'), false)

    level.dots.forEach(dot => { if (dot.type === 'powerUp') dot.bleek(true) })

    releaseGhost()

    if (level.fruit) {
      level.fruit.disappear(true)
    } else if (globalStats.fruitsSpawned < 2) {
      drawFruit()
    }

    moving(true)
  })
}

function restartGame () {
  console.log('restartGame()')

  function restart (e) {
    if (e.key === 'Enter') {
      document.removeEventListener('keypress', restart)

      eraseText()

      getTrack(tracks.get('lolSong')).turnOff()

      restartLevel()
      drawDots()
      drawFruit()
    }
  }

  clearTimeout(globalStats.fruitsTimer)
  clearTimeout(globalStats.weakGhostTimer)

  level.enemies.forEach(enemy => { enemy.erase() })

  player.forEach(p => { p.erase() })

  if (level.fruit) {
    level.fruit.disappear(false)
    level.fruit.erase()
  }

  const textAfterDeath = player.size === 1 ? 'LOL, YOU DIED' : 'LOL, YOU ARE BOTH DEAD'

  drawText(175, 230, 200, textAfterDeath, 25, 'red')

  let i = 0

  for (const p of player) {
    const playerHighScore = p[1].sex === 'male' ? 'firstPlayerHighScore' : 'secondPlayerHighScore'

    drawText(150, 270 + i * 80, 300, `${p[0]} player high score = ${globalStats[playerHighScore]}`, 20)
    drawText(150, 310 + i * 80, 300, `${p[0]} player current score = ${p[1].score}`, 18)

    i++
  }

  player.forEach(p => {
    p.score = 0
    p.giftedlives = 1
    p.lives = 3
  })

  globalStats.fruitsSpawned = 0
  level.fruit = null

  addTrack(tracks.get('lolSong'), false)

  document.addEventListener('keypress', restart)
}

function restartLevel () {
  clearTimeout(globalStats.fruitsTimer)
  clearTimeout(globalStats.weakGhostTimer)

  level.dots.forEach(dot => { if (dot.type === 'powerUp') dot.bleek(false) })

  globalStats.ghostStreak = 1

  if (level.fruit) level.fruit.disappear(false)

  player.forEach(p => { p.erase() })

  level.enemies.forEach(enemy => { enemy.erase() })

  getReadyForGame()
}
