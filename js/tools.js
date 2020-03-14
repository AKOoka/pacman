/* global paths, level, playingTracks, globalStats, anime, CreateTrack, CreatePowerUpDot, CreateFruit, CreateDot, CreateText */

const getId = id => document.getElementById(id)

const samePoints = (x, y, x2, y2) => (x === x2 && y === y2)

const random = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)

const distance = (point1, point2) => (point1.x - point2.x) * (point1.x - point2.x) + (point1.y - point2.y) * (point1.y - point2.y)

const collision = (obj1, obj2, r1, r2) => Math.hypot(obj1.x - obj2.x, obj1.y - obj2.y) - r1 - r2 <= 0

const inRange = (x, y, range) => (x >= range[0] && x <= range[2]) && (y >= range[1] && y <= range[3])

const inPath = (x, y) => paths.find(el => inRange(x, y, el))

const getTrack = track => playingTracks.get(track.id)

function drawText (x, y, maxWidth, text, size, color) {
  level.text.push(new CreateText(x, y, maxWidth, text, size, color))
  level.text.forEach(text => text.draw())
}

function eraseText () {
  level.text.forEach(text => text.erase())
  level.text = []
}

function addTrack (track, timerOn = true) {
  playingTracks.set(track.id, new CreateTrack(track.id, track.url))

  const song = getTrack(track)

  song.url.play()

  if (timerOn) {
    return song.setTimer()
  }
}

function moving (type, clearTimer = true) {
  if (type) {
    stopGame = false

    if (clearTimer) level.enemies.forEach(e => { e.remakeHolePath() })

    anime()
  } else {
    stopGame = true

    if (clearTimer) level.enemies.forEach(e => { clearTimeout(e.remakeTimer) })
  }
}

function toBasicPosition (item, startPosition) {
  item.x = startPosition.x
  item.y = startPosition.y

  item.path = inPath(item.x, item.y)

  item.direction = 'left'
  item.key = ''

  item.type === 'enemy' ? item.returnNormal() : item.invincible = false

  clearTimeout(item.turnLag)
}

function drawFruit () {
  const poolOfFruits = ['cherry']

  globalStats.fruitsTimer = setTimeout(() => {
    level.fruit = new CreateFruit(276, 310, 16, 'cherry')
    level.fruit.draw()
    level.fruit.disappear(true)

    globalStats.fruitsSpawned++
  }, random(15000, 45000))
}

function drawDots () {
  const filterForbidden = paths.filter(el => {
    const forbiddenPaths = [
      [362, 204, 362, 364],
      [186, 204, 186, 364],
      [304, 150, 304, 204],
      [244, 150, 244, 204],
      [0, 258, 186, 258],
      [362, 258, 550, 258],
      [186, 204, 362, 204],
      [186, 310, 362, 310],
      [238, 258, 314, 258],
      [276, 204, 276, 258]
    ]

    return forbiddenPaths.every(p => el.toString() !== p.toString())
  })

  function pushPowerDots () {
    const dir = [
      [30, 79.39999999999999],
      [518, 79.39999999999999],
      [30, 416],
      [518, 416]
    ]

    dir.forEach(d => level.dots.push(new CreatePowerUpDot(d[0], d[1], 8)))
  }

  function pushDots () {
    let dir = null

    filterForbidden.forEach(p => level.dots.push(new CreateDot(p[2], p[3])))

    for (const p of filterForbidden) {
      const point = {
        x: p[0],
        y: p[1]
      }

      let gap

      if (p[0] === p[2]) {
        dir = 'down'
        gap = 17.80
      } else if (p[1] === p[3]) {
        dir = 'right'
        gap = 19.53
      }

      while (inRange(point.x, point.y, p)) {
        if (level.dots.some(dot => !collision(dot, point, dot.radius, dot.radius))) {
          level.dots.push(new CreateDot(point.x, point.y))
        }

        if (dir === 'right') {
          point.x += gap
        } else if (dir === 'down') {
          point.y += gap
        }
      }
    }
  }

  level.dots = []

  pushPowerDots()
  pushDots()

  for (const dot of level.dots) dot.draw()
}
