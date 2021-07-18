/* global addTrack, paths, level, globalStats, moving, drawDots, drawFruit, drawBoard, eraseText, drawText, samePoints,
getTrack, playingTracks, collision, tracks, inRange, inPath, mouth, Tau, distance, player, random, restartLevel */

class CreateText {
  constructor (x, y, maxWidth, text, size = 14, color = 'white') {
    this.x = x
    this.y = y
    this.maxWidth = maxWidth
    this.text = text
    this.size = size
    this.color = color
  }

  erase () {
    cText.clearRect(this.x, this.y - this.size * 1.5, this.maxWidth, this.size * 2.5)
  }

  draw () {
    cText.beginPath()
    cText.fillStyle = this.color
    cText.font = `${this.size}px 'Press Start 2P'`
    cText.fillText(this.text, this.x, this.y, this.maxWidth)
  }
}

class CreateTrack {
  constructor (id, url) {
    this.id = id
    this.url = url
  }

  turnOff () {
    this.url.pause()
    this.url.currentTime = 0

    playingTracks.delete(this.id)
  }

  setTimer () {
    return new Promise((resolve, reject) => {
      this.url.onended = () => {
        this.url.onended = null

        this.turnOff()
        resolve()
      }
    })
  }
}

class CreateCircleObj {
  constructor (x, y, radius = 3) {
    this.x = x
    this.y = y
    this.radius = radius
  }

  erase () {
    this.context.clearRect(this.x - this.radius * 1.5, this.y - this.radius * 1.5, this.radius * 3, this.radius * 3)
  }
}

class CreateDot extends CreateCircleObj {
  constructor (x, y, radius) {
    super(x, y, radius)

    this.type = 'dot'
    this.context = cDot
  }

  draw () {
    this.context.beginPath()
    this.context.fillStyle = 'white'
    this.context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    this.context.fill()
  }
}

class CreatePowerUpDot extends CreateDot {
  constructor (x, y, radius) {
    super(x, y, radius)

    this.type = 'powerUp'

    this.bleekInt = 0
  }

  bleek (activate) {
    if (activate) {
      let seen = true

      this.bleekInt = setInterval(() => {
        seen ? this.erase() : this.draw()

        seen = !seen
      }, 750)
    } else {
      clearInterval(this.bleekInt)

      this.draw()
    }
  }
}

class CreateFruit extends CreateDot {
  constructor (x, y, radius, fruitType) {
    super(x, y, radius)

    this.type = 'fruit'
    this.fruitType = fruitType

    this.disappearTimer = 0
    this.bleekInt = 0
  }

  disappear (disappearOn) {
    if (disappearOn) {
      this.disappearTimer = setTimeout(() => {
				let show = false

				this.bleekInt = setInterval(() => {
				  show ? this.draw() : this.erase()

				  show = !show
				}, 300)

        this.disappearTimer = setTimeout(() => {
          clearTimeout(this.disappearTimer)
          clearInterval(this.bleekInt)

          this.erase()

          level.fruit = null

          if (globalStats.fruitsSpawned < 2) drawFruit()
        }, 3000)
      }, 7000)
    } else {
      clearTimeout(this.disappearTimer)
      clearInterval(this.bleekInt)
    }
  }

  draw () {
    switch (this.fruitType) {
      case 'cherry':

        CreateFruit.drawCherry(this)
        break
    }
  }

  // Maybe in future I will make more Fruites, but for now it is enough
  static drawCherry (item) {
    const ctx = item.context
    const r = item.radius

    ctx.beginPath()
    ctx.fillStyle = '#ff0000'

    ctx.arc(item.x - r / 2, item.y + r / 2, r / 2.2, 0, Tau, true)
    ctx.arc(item.x + r / 2, item.y + r / 1.5, r / 2.2, 0, Tau, true)
    ctx.fill()

    ctx.beginPath()
    ctx.strokeStyle = '#959817'
    ctx.lineWidth = 2.5

    ctx.moveTo(item.x - r / 2, item.y + r / 2.5)
    ctx.quadraticCurveTo(item.x - r / 2, item.y - r / 2, item.x + r / 1.5, item.y - r / 2)
    ctx.moveTo(item.x + r / 2, item.y + r / 3)
    ctx.quadraticCurveTo(item.x, item.y, item.x + r / 1.5, item.y - r / 2)
    ctx.stroke()

    ctx.beginPath()
    ctx.fillStyle = '#670303'
    ctx.fillRect(item.x + r / 1.5 - 3, item.y - r / 2 - 2, 6, 5)
    ctx.fill()
  }
}

class MovingObj extends CreateCircleObj {
  constructor (x, y, radius, speed = 2) {
    super(x, y, radius)

    this.speed = speed

    this.key = ''
    this.direction = 'left'
    this.path = inPath(this.x, this.y)
  }

  dirToSpeed (direction) {
    let x = 0
    let y = 0

    switch (direction) {
      case 'left':

        x = this.x - this.speed
        y = this.y

        break

      case 'right':

        x = this.x + this.speed
        y = this.y

        break

      case 'up':

        x = this.x
        y = this.y - this.speed

        break

      case 'down':

        x = this.x
        y = this.y + this.speed

        break
    }

    return { x, y }
  }

  update (nextStep, startX, startY, endX, endY) {
    if (nextStep.x < startX) {
      this.x = startX
    } else if (nextStep.x > endX) {
      this.x = endX
    } else {
      this.x = nextStep.x
    }

    if (nextStep.y < startY) {
      this.y = startY
    } else if (nextStep.y > endY) {
      this.y = endY
    } else {
      this.y = nextStep.y
    }

    if (this.x === 0) {
    	this.erase()

      this.x = 550
      this.path = [362, 258, 550, 258]
    } else if (this.x === 550) {
    	this.erase()

      this.x = 0
      this.path = [0, 258, 186, 258]
    }
  }
}

class CreateEnemy extends MovingObj {
  constructor (x, y, radius, speed, color, pickTarget) {
    super(x, y, radius, speed)

    this.color = color
    this.eye = {
      x: 0,
      y: 0,
      color: 'blue'
    }
    this.bleek = {
      status: false,
      interval: 0
    }

    this.releaseTimer = 0
    this.release = false

    this.pickTarget = pickTarget
    this.target = {}
    this.holePath = []
    this.holePathProgress = 1
    this.remakeTimer = 0

    this.context = cGhosts

    this.type = 'enemy'
    this.status = 'normal'
    this.basic = {
      color: this.color,
      speed: this.speed,
      pickTarget: this.pickTarget
    }
  }

  remakeHolePath () {
    clearTimeout(this.remakeTimer)

    this.remakeTimer = setTimeout(() => {
      this.remakeHolePath()
    }, 8000)

    this.target = CreateEnemy.defineTarget(this.pickTarget)

    this.holePathProgress = 1
    this.searchPath()
    this.pressButton()
  }

  searchPath () {
    const holePath = []
    let partedPathes = []
    let joinedPathes = []

    function distToSegment (p, v, w) {
      const l2 = distance(v, w)

      if (l2 === 0) return distance(p, v)

      let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2
      t = Math.max(0, Math.min(1, t))

      return Math.sqrt(distance(p, { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) }))
    }

    const pickRoute = () => {
      let currentPath = inPath(this.x, this.y)
      const forbiddenPaths = []

      holePath.push(currentPath)

      while (!inRange(this.target.x, this.target.y, holePath[holePath.length - 1])) {
        const notCopy = paths.filter(el => holePath.every(copy => el !== copy) ? CreateEnemy.intersects(...currentPath, ...el) : false)
        const possiblePathes = notCopy.filter(el => forbiddenPaths.every(forbidden => el !== forbidden))

        if (possiblePathes.length === 1) {
          currentPath = possiblePathes[0]
          holePath.push(currentPath)

          continue
        }

        let shortPath = possiblePathes[0]

        if (shortPath === undefined) {
          forbiddenPaths.push(currentPath)

          holePath.pop()

          currentPath = holePath[holePath.length - 1]

          continue
        }

        for (const el of possiblePathes) {
          if (inRange(this.target.x, this.target.y, el)) {
            shortPath = el
            break
          }

          const pathDistance = distToSegment(this.target, { x: el[0], y: el[1] }, { x: el[2], y: el[3] })
          const shortPathDistance = distToSegment(this.target, { x: shortPath[0], y: shortPath[1] }, { x: shortPath[2], y: shortPath[3] })

          if (pathDistance < shortPathDistance) shortPath = el
        }

        currentPath = shortPath
        holePath.push(currentPath)
      }
    }

    const makePartes = () => {
      let i

      partedPathes = []

      function checkIntersection (curLine, nextLine) {
        const c = {

          x: curLine[0],
          y: curLine[1],
          x2: curLine[2],
          y2: curLine[3]

        }
        const n = {

          x: nextLine[0],
          y: nextLine[1],
          x2: nextLine[2],
          y2: nextLine[3]

        }

        if ((n.y > c.y && n.y < c.y2) || (n.x > c.x && n.x < c.x2)) {
          if (partedPathes[i] === undefined) partedPathes[i] = []

          if (c.x === c.x2) {
            partedPathes[i].push([c.x, c.y, c.x, n.y], [c.x, n.y, c.x2, c.y2])
          } else if (c.y === c.y2) {
            partedPathes[i].push([c.x, c.y, n.x, c.y], [n.x, c.y, c.x2, c.y2])
          }
        }
      }

      for (i = 0; i < holePath.length; i++) {
        const cur = holePath[i]

        if (holePath[i - 1] !== undefined) {
          const prev = holePath[i - 1]

          checkIntersection(cur, prev)
        }
        if (holePath[i + 1] !== undefined) {
          const next = holePath[i + 1]

          if (partedPathes[i] !== undefined) {
            for (let l = 0; l < partedPathes[i].length; l++) {
              const part = partedPathes[i][l]

              checkIntersection(part, next)

              if (partedPathes[i].length === 4) {
                partedPathes[i].splice(l, 1)
                break
              }
            }
          } else {
            checkIntersection(cur, next)
          }
        }

        if (partedPathes[i] === undefined) partedPathes[i] = cur
      }
    }

    const joinPartes = () => {
      joinedPathes = []

      const compare = (curLine, nextLine) => {
        if (nextLine.length !== 4) {
          for (const n of nextLine) {
            if (CreateEnemy.intersects(...curLine, ...n)) return true
          }
        } else {
          if (CreateEnemy.intersects(...curLine, ...nextLine)) return true
        }

        return false
      }

      for (let i = 0; i < partedPathes.length; i++) {
        const cur = partedPathes[i]

        if (cur.length === 4) {
          joinedPathes.push(cur)
          continue
        }

        if (i === 0) {
          for (const c of cur) {
            if (inRange(this.x, this.y, c)) {
              joinedPathes.push(c)

              break
            }
          }

          continue
        } else if (i === partedPathes.length - 1) {
          const c1 = cur[0]
          const c2 = cur[1]

          const dist1 = distToSegment(this.target, { x: c1[0], y: c1[1] }, { x: c1[2], y: c1[3] })
          const dist2 = distToSegment(this.target, { x: c2[0], y: c2[1] }, { x: c2[2], y: c2[3] })

          dist1 < dist2 ? joinedPathes.push(c1) : joinedPathes.push(c2)

          continue
        }

        const prev = partedPathes[i - 1]
        const next = partedPathes[i + 1]

        for (const c of cur) {
          if (compare(c, prev) && compare(c, next)) {
            joinedPathes.push(c)
            break
          }
        }
      }

      this.holePath = joinedPathes
      this.path = this.holePath[0]
    }

    pickRoute()

    makePartes()

    joinPartes()
  }

  returnNormal () {
    this.bleek.status = false
    clearInterval(this.bleek.interval)

    this.status = 'normal'

    this.color = this.basic.color
    this.eye.color = 'blue'
    this.speed = this.basic.speed

    this.pickTarget = this.basic.pickTarget
    this.remakeHolePath()
  }

  makeBleek () {
    let stage = 'white'

    this.bleek.status = true
    this.bleek.interval = setInterval(() => {
      if (stage === 'blue') {
        this.color = 'white'
        this.eye.color = 'red'

        stage = 'white'
      } else {
        this.color = 'blue'
        this.eye.color = 'white'

        stage = 'blue'
      }
    }, 100)
  }

  makeWeak () {
    this.status = 'weak'

    this.color = 'blue'
    this.eye.color = 'white'
    this.speed = this.basic.speed / 2

    this.draw()

    this.pickTarget = 'random'
    this.remakeHolePath()
  }

  goHome () {
    if (getTrack(tracks.get('weakGhost'))) {
      getTrack(tracks.get('weakGhost')).turnOff()
    } else if (getTrack(tracks.get('sirenEffect'))) {
      getTrack(tracks.get('sirenEffect')).turnOff()
    }

    addTrack(tracks.get('goHomeEffect'), false)

    this.status = 'home'
    this.bleek.status = false
    clearInterval(this.bleek.interval)

    this.color = 'white'
    this.eye.color = 'blue'
    this.speed = this.basic.speed * 2

    this.pickTarget = 'home'
    this.remakeHolePath()
  }

  checkDirection (x, y, startX, startY, endX, endY) {
    const lookAt = () => {
      const r = this.radius * 0.3

      switch (this.direction) {
        case 'up':

          this.eye.y = -r
          this.eye.x = 0
          break

        case 'down':

          this.eye.y = r
          this.eye.x = 0
          break

        case 'left':

          this.eye.x = -r
          this.eye.y = 0
          break

        case 'right':

          this.eye.x = r
          this.eye.y = 0
          break
      }
    }

    if (this.path === this.holePath[this.holePath.length - 1] && !inRange(x, y, this.path)) {
      if (this.status === 'home') {
        return setTimeout(() => {
          if (!getTrack(tracks.get('lolSong')) && !getTrack(tracks.get('dieEffect')) && !getTrack(tracks.get('openingSong')) && getTrack(tracks.get('goHomeEffect'))) {
            this.returnNormal()

            if (level.enemies.every(enemy => enemy.status !== 'home')) {
              getTrack(tracks.get('goHomeEffect')).turnOff()

              globalStats.weakGhostTimer !== 0 ? addTrack(tracks.get('weakGhost'), false) : addTrack(tracks.get('sirenEffect'), false)
            }
          }
        }, 2000)
      }

      this.remakeHolePath()
    }

    if (inRange(x, y, [startX, startY, endX, endY])) {
      this.direction = this.key
      lookAt()
    } else if (this.holePath.length === 1) {
      this.pressButton()
    } else if (inRange(this.x, this.y, this.holePath[this.holePathProgress])) {
      this.path = this.holePath[this.holePathProgress];

      (this.holePathProgress < this.holePath.length - 1) ? this.holePathProgress++ : this.path = this.holePath[this.holePath.length - 1]

      this.pressButton()
    } else if ((inRange(this.x, this.y, [362, 258, 550, 258]) || inRange(this.x, this.y, [0, 258, 186, 258])) && !inRange(x, y, [startX, startY, endX, endY])) {
      this.remakeHolePath()
    }
  }

  pressButton () {
    const cur = {

      x: this.path[0],
      y: this.path[1],
      x2: this.path[2],
      y2: this.path[3]

    }

    const pickKey = (x, y) => {
      if (cur.x === cur.x2) {
        if (this.y < y) {
          this.key = 'down'
        } else {
          this.key = 'up'
        }
      } else if (cur.y === cur.y2) {
        if (this.x < x) {
          this.key = 'right'
        } else {
          this.key = 'left'
        }
      }
    }

    if (this.holePath.length > 1) {
      if (this.path === this.holePath[this.holePath.length - 1]) {
        samePoints(cur.x, cur.y, this.x, this.y) ? pickKey(cur.x2, cur.y2) : pickKey(cur.x, cur.y)

        return
      }

      const next = {

        x: this.holePath[this.holePathProgress][0],
        y: this.holePath[this.holePathProgress][1],
        x2: this.holePath[this.holePathProgress][2],
        y2: this.holePath[this.holePathProgress][3]

      }

      if (samePoints(cur.x, cur.y, next.x, next.y) || samePoints(cur.x, cur.y, next.x2, next.y2)) {
        pickKey(cur.x, cur.y)
      } else if (samePoints(cur.x2, cur.y2, next.x, next.y) || samePoints(cur.x2, cur.y2, next.x2, next.y2)) {
        pickKey(cur.x2, cur.y2)
      }

      return
    }

    pickKey(this.target.x, this.target.y)
  }

  erase () {
    this.context.clearRect(this.x - this.radius, this.y - this.radius, this.radius * 2.2, this.radius * 2.2)
  }

  update () {
		if (!this.release) return this.draw()

    const nextStep = this.dirToSpeed(this.direction)

    const startX = this.path[0]
    const startY = this.path[1]
    const endX = this.path[2]
    const endY = this.path[3]

    this.checkDirection(this.dirToSpeed(this.key).x, this.dirToSpeed(this.key).y, startX, startY, endX, endY)

    super.update(nextStep, startX, startY, endX, endY)

    this.draw()
  }

  draw () {
    const r = this.radius
    const ctx = this.context

    if (this.status !== 'home') {
      ctx.beginPath()
      ctx.fillStyle = this.color
      ctx.moveTo(this.x + r, this.y + r * 1.1)
      ctx.lineTo(this.x + r * 0.66, this.y + r * 0.8)
      ctx.lineTo(this.x + r * 0.33, this.y + r * 1.1)
      ctx.lineTo(this.x, this.y + r * 0.8)
      ctx.lineTo(this.x - r * 0.33, this.y + r * 1.1)
      ctx.lineTo(this.x - r * 0.66, this.y + r * 0.8)
      ctx.lineTo(this.x - r, this.y + r * 1.1)
      ctx.lineTo(this.x - r, this.y)
      ctx.arc(this.x, this.y, r, Tau / 2, Tau, false)
      ctx.fill()
    }

    if (this.status === 'weak') {
      ctx.beginPath()
      ctx.strokeStyle = this.eye.color
      ctx.lineWidth = 2
      ctx.moveTo(this.x - r * 0.6, this.y + r * 0.6)
      ctx.lineTo(this.x - r * 0.4, this.y + r * 0.4)
      ctx.lineTo(this.x - r * 0.2, this.y + r * 0.6)
      ctx.lineTo(this.x, this.y + r * 0.4)
      ctx.lineTo(this.x + r * 0.2, this.y + r * 0.6)
      ctx.lineTo(this.x + r * 0.4, this.y + r * 0.4)
      ctx.lineTo(this.x + r * 0.6, this.y + r * 0.6)
      ctx.stroke()
    }

    if (this.status !== 'weak') {
      ctx.fillStyle = 'white'
      ctx.beginPath()
      ctx.arc(this.x - r * 0.5, this.y, r * 0.3, Tau, false)
      ctx.fill()

      ctx.beginPath()
      ctx.arc(this.x + r * 0.5, this.y, r * 0.3, Tau, false)
      ctx.fill()
    }

    ctx.fillStyle = this.eye.color
    ctx.beginPath()
    ctx.arc(this.x + this.eye.x + r * 0.5, this.y + this.eye.y, r * 0.15, Tau, false)
    ctx.fill()

    ctx.beginPath()
    ctx.arc(this.x + this.eye.x - r * 0.5, this.y + this.eye.y, r * 0.15, Tau, false)
    ctx.fill()
  }

  static intersects (a, b, c, d, p, q, r, s) {
    // a = startPointX1
    // b = startPointY1
    // c = endPointX1
    // d = endPointY1

    // p = startPointX2
    // q = startPointY2
    // r = endPointX2
    // s = endPointY2

    const det = (c - a) * (s - q) - (r - p) * (d - b)
    const lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det
    const gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det

    return (lambda >= 0 && lambda <= 1) && (gamma >= 0 && gamma <= 1)
  }

  static defineTarget (target) {
  	const chasingPlayer = random(1, player.size)

  	let currentPlayer = player.get(chasingPlayer === 1 ? 'first' : 'second')

  	if (currentPlayer.dead) {
  		player.forEach(p => { if (!p.dead) currentPlayer = p })

  		if (currentPlayer.dead) target = 'random'
  	}

    function home () {
      return { x: 258, y: 258 }
    }

    function playerCordinates () {
      return { x: currentPlayer.x, y: currentPlayer.y }
    }

    const afterPlayer = () => {
      const dir = currentPlayer.direction

      const adjacentPath = paths.filter(p => {
        switch (dir) {
          case 'left':

            if (p[0] > currentPlayer.x || p[2] > currentPlayer.x) return false
            break

          case 'right':

            if (p[0] < currentPlayer.x || p[2] < currentPlayer.x) return false
            break

          case 'up':

            if (p[1] > currentPlayer.x || p[3] > currentPlayer.y) return false
            break

          case 'down':

            if (p[1] < currentPlayer.y || p[3] < currentPlayer.y) return false
            break
        }

        return CreateEnemy.intersects(...p, ...currentPlayer.path)
      })

      const prepareTarget = p => random(0, 1) ? { x: p[0], y: p[1] } : { x: p[2], y: p[3] }

      if (adjacentPath.length === 0) {
        return prepareTarget(currentPlayer.path)
      } else if (adjacentPath.length === 1) {
        return prepareTarget(adjacentPath[0])
      }

      return prepareTarget(adjacentPath[random(0, adjacentPath.length - 1)])
    }

    function randomPath () {
      const target = {}

      const r = random(0, paths.length - 1)

      if (random(0, 1) === 0) {
        target.x = paths[r][0]
        target.y = paths[r][1]
      } else {
        target.x = paths[r][2]
        target.y = paths[r][3]
      }

      return target
    };

    function anyTarget () {
      const pool = ['player', 'after', 'random']
      const p = pool[random(0, pool.length - 1)]

      return CreateEnemy.defineTarget(p)
    };

    switch (target) {
      case 'player':
        return playerCordinates()

      case 'after':
        return afterPlayer()

      case 'random':

        return randomPath()
      case 'any':
        return anyTarget()

      case 'home':
        return home()
    }
  }

  static makeAllWeak () {
    clearTimeout(globalStats.weakGhostTimer)

    globalStats.ghostStreak = 1
    globalStats.weakGhostTimer = 0

    if (getTrack(tracks.get('sirenEffect'))) getTrack(tracks.get('sirenEffect')).turnOff()
    if (!getTrack(tracks.get('goHomeEffect'))) addTrack(tracks.get('weakGhost'), false)

    level.enemies.forEach(enemy => {
      if (enemy.bleek.status) {
        clearInterval(enemy.bleek.interval)

        enemy.color = 'blue'
        enemy.eye.color = 'white'
      }

      if (enemy.status !== 'weak' && enemy.status !== 'home') enemy.makeWeak()
    })

    globalStats.weakGhostTimer = setTimeout(() => {
      level.enemies.forEach(enemy => {
        if (enemy.status === 'weak') enemy.makeBleek()
      })

      globalStats.weakGhostTimer = setTimeout(() => {
        level.enemies.forEach(enemy => { if (enemy.status === 'weak') enemy.returnNormal() })

        if (getTrack(tracks.get('weakGhost'))) {
          getTrack(tracks.get('weakGhost')).turnOff()
          addTrack(tracks.get('sirenEffect'), false)
        }

        globalStats.ghostStreak = 1
        globalStats.weakGhostTimer = 0
      }, 3000)
    }, 10000)
  }
}

class CreatePacMan extends MovingObj {
  constructor (x, y, radius, speed, sex) {
    super(x, y, radius, speed)

    this.context = cPlayer

    this.type = 'player'
    this.sex = sex

    this.dead = false
    this.invincible = false
    this.invincibleTimer = 0

    this.lives = 3
    this.giftedLives = 1
    this.score = 0

    this.turnLag = 0
    this.wakaTimer = 0

    this.mouth = {
      start: mouth.get('left').openS,
      end: mouth.get('left').openE,
      status: 'close',
      stop: false
    }
  }

  eatAnimation () {
    const closeMouth = (s, e) => {
      if (this.mouth.start > s && this.mouth.end < e) {
        this.mouth.start -= 0.1
        this.mouth.end += 0.1
      } else {
        this.mouth.status = 'open'
      }
    }

    const openMouth = (s, e) => {
      if (this.mouth.start < s && this.mouth.end > e) {
        this.mouth.start += 0.1
        this.mouth.end -= 0.1
      } else {
        this.mouth.status = 'close'
      }
    }

    switch (this.mouth.status) {
      case 'close':

        closeMouth(mouth.get(this.direction).closeS, mouth.get(this.direction).closeE)
        break

      case 'open':

        openMouth(mouth.get(this.direction).openS, mouth.get(this.direction).openE)
        break
    }
  }

  dieAnimation () {
    const startToEnd = mouth.get(this.direction).openS + Tau / 2.51
    const endToEnd = mouth.get(this.direction).openE - Tau / 2.51

    this.draw()

    const dieInt = setInterval(() => {
      this.erase()

      if (this.mouth.start < startToEnd - 0.1 && this.mouth.end > endToEnd - 0.1) {
        this.mouth.start += 0.05
        this.mouth.end -= 0.05

        this.draw()
      } else {
        clearInterval(dieInt)

        this.mouth = {
		      start: mouth.get('left').openS,
		      end: mouth.get('left').openE,
		      status: 'close',
		      stop: false
		    }
      }
    }, 20)
  }

  checkDirection (x, y, startX, startY, endX, endY) {
    const prevDir = this.direction

    if (inRange(x, y, [startX, startY, endX, endY])) {
      this.direction = this.key

      clearTimeout(this.turnLag)
    } else if (inPath(x, y) !== undefined) {
      this.path = inPath(x, y)
      this.direction = this.key

      clearTimeout(this.turnLag)
    }

    if (this.direction !== prevDir) {
      this.mouth.start = mouth.get(this.direction).openS
      this.mouth.end = mouth.get(this.direction).openE

      this.mouth.status = 'close'
    }
  }

  update () {
  	if (this.dead) return

  	const updateStatistics = () => {
  		let playerHighScore = this.sex === 'male' ? 'firstPlayerHighScore' : 'secondPlayerHighScore'

  		if (this.score > globalStats[playerHighScore]) globalStats[playerHighScore] = this.score

			if (this.score / (this.giftedLives * 10000) >= 1) {
			  this.lives += 1
			  this.giftedLives += 1

			  addTrack(tracks.get('extraLifeEffect'))
			}
  	}

    for (let i = 0; i < level.dots.length; i++) {
      const item = level.dots[i]

      if (collision(item, this, item.radius, 0)) {
        const delItem = (p = 0) => {
          this.score += p

          item.erase()
          level.dots.splice(i, 1)

          updateStatistics()

          if (level.dots.length === 0) {
            let interval = 0
            let blue = true

            moving(false)

            playingTracks.forEach(t => { t.turnOff() })

            globalStats.fruitsSpawned = 0

            level.enemies.forEach(e => { e.erase() })

            interval = setInterval(() => {
              blue === true ? drawBoard('white') : drawBoard('blue')
              blue = !blue
            }, 300)

            setTimeout(() => {
              clearInterval(interval)

              restartLevel()

              drawDots()
            }, 2000)
          }
        }

        switch (item.type) {
          case 'dot': {
						delItem(10)

						let song = getTrack(tracks.get('wakaEffect'))

						const eating = () => {
							clearTimeout(this.wakaTimer)

							this.wakaTimer = setTimeout(() => {
								song.turnOff()
							}, 350)
						}

						if (!song) {
							addTrack(tracks.get('wakaEffect'), false)

							song = getTrack(tracks.get('wakaEffect'))

							eating()
						} else eating()

						break
          }

          case 'powerUp':

            CreateEnemy.makeAllWeak()

            item.bleek(false)

            delItem(50)

            console.log('Here is Johnny!!!')

            break
        }
      }
    }

    if (level.fruit) {
      if (collision(level.fruit, this, level.fruit.radius, this.radius)) {
        this.score += 100

        updateStatistics()

        drawText(level.fruit.x - level.fruit.radius, level.fruit.y + level.fruit.radius, level.fruit.radius * 2, String(100), 18, 'red')

        level.fruit.disappear(false)
        level.fruit.erase()
        level.fruit = null

        addTrack(tracks.get('eatFruit')).then(() => { eraseText() })

        if (globalStats.fruitsSpawned < 2) drawFruit()
      }
    }

    for (const enemy of level.enemies) {
      if (collision(enemy, this, enemy.radius, this.radius)) {
      	let secondPlayer
      	let continueTimer

      	if (player.size === 2) {
					let invincibleTimeLeft = 0

					const releaseTimeLeft = []

					secondPlayer = player.get(this.sex === 'male' ? 'second' : 'first')

					if (secondPlayer.invincible) {
						clearTimeout(secondPlayer.invincibleTimer)

						invincibleTimeLeft = 2500 - secondPlayer.invincibleTimer
					}

					for (let i = 0; i < level.enemies.length; i++) {
						clearTimeout(level.enemies[i].releaseTimer)

						releaseTimeLeft.push(2000 * i - level.enemies[i].releaseTimer)
					}

      		continueTimer = () => {
      			// when eating ghost - ghosts doesn't move
	        	if (invincibleTimeLeft > 0) {
							secondPlayer.invincibleTimer = setTimeout(() => {
								secondPlayer.invincible = false
								secondPlayer.invincibleTimer = 0
							}, invincibleTimeLeft)
						}
						for (let i = 0; i < level.enemies.length; i++) {
							if (level.enemies[i].release) continue

							level.enemies[i].releaseTimer = setTimeout(() => {
								level.enemies[i].release = true
							}, releaseTimeLeft[i])
						}
	      	}
	      }

        if (!this.invincible && enemy.status === 'normal' && !getTrack(tracks.get('dieEffect'))) {
          moving(false)

        	this.lives -= 1

          playingTracks.forEach(track => { track.turnOff() })

          this.dieAnimation()

          addTrack(tracks.get('dieEffect')).then(() => {
		        if (player.size === 1) {
		          this.lives <= 0 ? restartGame() : restartLevel()

		          return
		        }

	        	this.x = 0
        		this.y = 0

        		this.dead = true

        		if (this.lives > 0) {
        			continueTimer()

	        		setTimeout(() => {
	        			toBasicPosition(this, playerStartPos.get(this.sex === 'male' ? 'first' : 'second'))

	        			this.dead = false

	        			this.invincible = true
								this.invincibleTimer = setTimeout(() => {
									this.invincible = false
									this.invincibleTimer = 0
								}, 2500)
	        		}, 2500)
        		} else if (player.get(this.sex === 'male' ? 'second' : 'first').lives === 0) {
        			restartGame()

        			return
        		}

	        	moving(true)
	        })

          return
        } else if (enemy.status === 'weak' && !getTrack(tracks.get('eatGhostEffect'))) {
          moving(false, false)

          enemy.erase()

          for (const e of level.enemies) {
          	if (e === enemy) continue

          	e.draw()
          }

          clearTimeout(enemy.remakeTimer)

          enemy.goHome()

          drawText(enemy.x - enemy.radius, enemy.y + enemy.radius, enemy.radius * 2, String(200 * globalStats.ghostStreak), 25, 'red')

          this.score += (200 * globalStats.ghostStreak)

          globalStats.ghostStreak *= 2

          updateStatistics()

          addTrack(tracks.get('eatGhostEffect')).then(() => {
            eraseText()

            if (player.size === 2) continueTimer()

            moving(true, false)
          })
        }

        break
      }
    }

    this.eatAnimation()

    this.draw()

    const nextStep = this.dirToSpeed(this.direction)

    const startX = this.path[0]
    const startY = this.path[1]
    const endX = this.path[2]
    const endY = this.path[3]

    this.checkDirection(this.dirToSpeed(this.key).x, this.dirToSpeed(this.key).y, startX, startY, endX, endY)

    for (const p of player) {
    	if (p[1] === this) continue

    	if (collision(p[1], { x: nextStep.x, y: nextStep.y }, p[1].radius, this.radius)) return
    }

    super.update(nextStep, startX, startY, endX, endY)
  }

  draw () {
    const ctx = this.context

    ctx.beginPath()
    ctx.moveTo(this.x, this.y)
    ctx.arc(this.x, this.y, this.radius, this.mouth.start, this.mouth.end, false)
    ctx.lineTo(this.x, this.y)
    if (this.sex === 'male') {
      ctx.fillStyle = '#fff200'
    } else {
      ctx.fillStyle = '#fc4e91'
    }
    ctx.fill()

    if (this.invincible) {
    	ctx.strokeStyle = 'white'
    	ctx.lineWidth = 3
    	ctx.stroke()
    }
  }
}
