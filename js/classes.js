class CreateText {

	constructor(x, y, maxWidth, text, size = 14, color = "white") {

		this.x = x;
		this.y = y;
		this.maxWidth = maxWidth;
		this.text = text;
		this.size = size;
		this.color = color;

	}

	erase() {

		cText.clearRect(this.x, this.y - this.size * 1.5, this.maxWidth, this.size * 2.5);

	}

	draw() {

		cText.beginPath();
		cText.fillStyle = this.color;
		cText.font = `${this.size}px 'Press Start 2P'`
		cText.fillText(this.text, this.x, this.y, this.maxWidth);

	}

}

class CreateTrack{

	constructor(id, url) {

		this.id = id;
		this.url = url;

	}

	turnOff() {

		this.url.pause();
		this.url.currentTime = 0;

		playingTracks.delete(this.id);

	}

	setTimer() {

		return new Promise((resolve, reject) => {

			this.url.onended = () => {

				this.url.onended = null;

				this.turnOff();
				resolve();

			}

		});

	}

}

class CreateCircleObj{

	constructor(x, y, radius = 3) {

		this.x = x;
		this.y = y;
		this.radius = radius;

	}

	erase() {

		this.context.clearRect(this.x - this.radius * 1.5, this.y - this.radius  * 1.5, this.radius * 3, this.radius * 3);

	}

}

class CreateDot extends CreateCircleObj{

	constructor(x, y, radius) {

		super(x, y, radius);

		this.type = "dot";
		this.context = cDot;

	}

	draw() {

		this.context.beginPath();
		this.context.fillStyle = "white";
		this.context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		this.context.fill();

	}

}

class CreatePowerUpDot extends CreateDot{

	constructor(x, y, radius) {

		super(x, y, radius);

		this.type = "powerUp";

		this.bleekInt = 0;

	}

	bleek(activate) {
		
		if(activate) {

			let seen = true;

			this.bleekInt = setInterval(() => {

				seen ? this.erase() : this.draw();

				seen = !seen;

			}, 750);
		
		}else {

			clearInterval(this.bleekInt);

			this.draw();

		}

	}

}

class CreateFruit extends CreateDot{

	constructor(x, y, radius, fruitType){

		super(x, y, radius);

		this.type = "fruit";
		this.fruitType = fruitType;

		this.disappearTimer;
		this.bleekInt;

	}

	bleek(bleekOn) {

		if(bleekOn) {

			let show = false;

			this.bleekInt = setInterval(() => {

				show ? this.draw() : this.erase();

				show = !show;

			}, 350)

		}else {

			clearInterval(this.bleekInt);

			this.draw();

		}

	}

	disappear(disappearOn) {

		if(disappearOn) {

			this.disappearTimer = setTimeout(() => {

				this.bleek(true);

				this.disappearTimer = setTimeout(() => {

					this.bleek(false);
					this.erase();

					level.fruit = undefined;

					if(globalStats.fruitsSpawned < 2) drawFruit();

				}, 3000)

			}, 7000)

		}else {

			console.log("this.timer === off")

			this.bleek(false);
			clearTimeout(this.disappearTimer);

		}

	}

	draw() {

		switch(this.fruitType) {

			case "cherry": 

				CreateFruit.drawCherry(this);
				break;

		}

	}

	// Maybe in future I will make more Fruites, but for now it is enough
	static drawCherry(obj) {

		let ctx = obj.context;
		let r = obj.radius;

		ctx.beginPath();
		ctx.fillStyle = "#ff0000";

		ctx.arc(obj.x - r / 2, obj.y + r / 2, r / 2.2, 0, Tau, true);
		ctx.arc(obj.x + r / 2, obj.y + r / 1.5, r / 2.2, 0, Tau, true);
		ctx.fill();

		ctx.beginPath();
		ctx.strokeStyle = "#959817";
		ctx.lineWidth = 2.5;

		ctx.moveTo(obj.x - r / 2, obj.y + r / 2.5);
		ctx.quadraticCurveTo(obj.x - r / 2, obj.y - r / 2, obj.x + r / 1.5, obj.y - r / 2);
		ctx.moveTo(obj.x + r / 2, obj.y + r / 3);
		ctx.quadraticCurveTo(obj.x, obj.y, obj.x + r / 1.5, obj.y - r / 2);
		ctx.stroke();

		ctx.beginPath();
		ctx.fillStyle = "#670303";
		ctx.fillRect(obj.x + r / 1.5 - 3, obj.y - r / 2 - 2, 6, 5)
		ctx.fill();

	}

}

class MovingObj extends CreateCircleObj{

	constructor(x, y, radius, speed = 5) {

		super(x, y, radius);

		this.speed = speed;

		this.key = "";
		this.direction = "left";
		this.path = inPath(this.x, this.y);

	}

	update() {

		let nextStepX = "";
		let nextStepY = "";

		let startX = this.path[0];
		let startY = this.path[1];
		let endX = this.path[2];
		let endY = this.path[3];

		let dirToSpeed = (direction) => {

			let x = "";
			let y = "";

			switch(direction) {

				case "left":

					x = this.x - this.speed;
					y = this.y;

					break;

				case "right":

					x = this.x + this.speed;
					y = this.y;

					break;

				case "up":

					x = this.x;
					y = this.y - this.speed;

					break;

				case "down":

					x = this.x;
					y = this.y + this.speed;

					break;			

			}

			return {x: x, y: y}

		}

		this.checkDirection(dirToSpeed(this.key).x, dirToSpeed(this.key).y, startX, startY, endX, endY);
		
		nextStepX = dirToSpeed(this.direction).x;
		nextStepY = dirToSpeed(this.direction).y;

		if(nextStepX < startX) {

			this.x = startX;

		}else if(nextStepX > endX) {

			this.x = endX;

		} else {

			this.x = nextStepX;

		}

		if(nextStepY < startY) {

			this.y = startY;

		} else if(nextStepY > endY) {

			this.y = endY;

		} else{

			this.y = nextStepY;

		}

		if(this.x == 0) {

			this.x = 550;
			this.path = [362,258,550,258];

		} else if(this.x == 550) {

			this.x = 0;
			this.path = [0,258,186,258];

		}

	}

}

class CreateEnemy extends MovingObj{

	constructor(x, y, radius, speed, name, color, pickTarget) {

		super(x, y, radius, speed);

		this.name = name;
		this.color = color;
		this.eye = {

			x: 0,
			y: 0,
			color: "blue"

		}
		this.bleek = {

			status: false,
			interval: 0

		}
		this.pickTarget = pickTarget;
		this.target = {};
		this.holePath = [];
		this.holePathProgress = 1;
		this.remakeTimer = 0;

		this.context = eval(`c${this.name}`);

		this.type = "enemy";
		this.status = "normal";
		this.basic = {

			color: this.color,
			speed: this.speed,
			pickTarget: this.pickTarget

		};

	}

	remakeHolePath() {

		clearTimeout(this.remakeTimer);

		this.remakeTimer = setTimeout(() => {

			this.remakeHolePath();

		}, 8000);

		this.target = CreateEnemy.defineTarget(this.pickTarget);

		this.holePathProgress = 1;
		this.searchPath();
		this.pressButton();

	}

	searchPath() {

		let holePath = [];
		let partedPathes = [];
		let joinedPathes = [];

		function distToSegment(p, v, w) {

			let l2 = distance(v, w);
			
			if (l2 == 0) return distance(p, v);
			
			let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
			t = Math.max(0, Math.min(1, t));

			return Math.sqrt(distance(p, { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) }));
		
		}

		let pickRoute = () => {

			let currentPath = inPath(this.x, this.y);
			let forbiddenPaths = [];

			holePath.push(currentPath);

			while(!inRange(this.target.x, this.target.y, holePath[holePath.length - 1])) {

				let notCopy = paths.filter(el => holePath.every(copy => el != copy) ? CreateEnemy.intersects(...currentPath, ...el) : false);
				let possiblePathes = notCopy.filter(el => forbiddenPaths.every(forbidden => el != forbidden));

				if(possiblePathes.length === 1) {

					currentPath = possiblePathes[0];
					holePath.push(currentPath);

					continue;

				}

				let shortPath = possiblePathes[0];

				if(shortPath == undefined) {

					forbiddenPaths.push(currentPath);

					holePath.pop();

					currentPath = holePath[holePath.length - 1];

					continue;

				}

				for(let el of possiblePathes) {

					if(inRange(this.target.x, this.target.y, el)) {

						shortPath = el;
						break;

					}

					let pathDistance = distToSegment(this.target, {x: el[0], y: el[1]}, {x: el[2], y: el[3]});
					let shortPathDistance = distToSegment(this.target, {x: shortPath[0], y: shortPath[1]}, {x: shortPath[2], y: shortPath[3]});;

					if(pathDistance < shortPathDistance) shortPath = el;

				}

				currentPath = shortPath;
				holePath.push(currentPath);

			}

		}

		let makePartes = () => {

			let i;

			partedPathes = [];

			function checkIntersection(curLine, nextLine) {

				let c = {

					x: curLine[0],
					y: curLine[1],
					x2: curLine[2],
					y2: curLine[3]

				}
				let n = {

					x: nextLine[0],
					y: nextLine[1],
					x2: nextLine[2],
					y2: nextLine[3]

				}

				if((n.y > c.y && n.y < c.y2) || (n.x > c.x && n.x < c.x2)) {

					if(partedPathes[i] == undefined) partedPathes[i] = [];

					if(c.x == c.x2) {

						partedPathes[i].push([c.x, c.y, c.x, n.y], [c.x, n.y, c.x2, c.y2]);


					}else if(c.y == c.y2) {

						partedPathes[i].push([c.x, c.y, n.x, c.y], [n.x, c.y, c.x2, c.y2]);	

					}

				}

			}

			for(i = 0; i < holePath.length; i++) {

				let prev, cur, next;

				cur = holePath[i];

				if(holePath[i - 1] != undefined) {

					prev = holePath[i - 1];

					checkIntersection(cur, prev);

				}
				if(holePath[i + 1] != undefined) {

					next = holePath[i + 1];

					if(partedPathes[i] != undefined) {

						for(let l = 0; l < partedPathes[i].length; l++) {
						
							let part = partedPathes[i][l];

							checkIntersection(part, next);
							
							if(partedPathes[i].length == 4) {

								partedPathes[i].splice(l, 1);
								break;

							}

						}

					}else {

						checkIntersection(cur, next);

					}

				}

				if(partedPathes[i] == undefined) partedPathes[i] = cur;

			}

		}

		let joinPartes = () => {

			joinedPathes = [];

			let compare = (curLine, nextLine) => {

				if(nextLine.length !== 4) {

					for(let n of nextLine) {

						if(CreateEnemy.intersects(...curLine, ...n)) return true;

					}

				} else {

					if(CreateEnemy.intersects(...curLine, ...nextLine)) return true;

				}

				return false;

			}

			for(let i = 0; i < partedPathes.length; i++) {

				let prev, cur, next;

				cur = partedPathes[i];

				if(cur.length === 4) {

					joinedPathes.push(cur);
					continue;

				}

				if(i == 0) {

					for(let c of cur) {

						if(inRange(this.x, this.y, c)) {

							joinedPathes.push(c);
							break;

						}

					}

					continue;

				}else if(i == partedPathes.length - 1) {

					let c1 = cur[0];
					let c2 = cur[1];

					let dist1 = distToSegment(this.target, {x: c1[0], y: c1[1]}, {x: c1[2], y: c1[3]});
					let dist2 = distToSegment(this.target, {x: c2[0], y: c2[1]}, {x: c2[2], y: c2[3]});;

					dist1 < dist2 ? joinedPathes.push(c1) : joinedPathes.push(c2);

					continue;

				}

				prev = partedPathes[i - 1];
				next = partedPathes[i + 1];

				for(let c of cur) {

					if(compare(c, prev) && compare(c, next)) {

						joinedPathes.push(c);
						break;

					}

				}

			}


			this.holePath = joinedPathes;
			this.path = this.holePath[0];

		}

		pickRoute();
		// console.log("holePath");
		// console.log(holePath);
		// console.log("-------------------");
		
		makePartes();
		// console.log("partedPathes");
		// console.log(partedPathes);
		// console.log("-------------------");
		
		joinPartes();
		// console.log("joinedPathes");
		// console.log(joinedPathes);
		// console.log("-------------------");

		// ctx.clearRect(0, 0, innerWidth, innerHeight);
		// drawDots();

	}

	returnNormal() {

		this.bleek.status = false;
		clearInterval(this.bleek.interval);

		this.status = "normal";

		this.color = this.basic.color;
		this.eye.color = "blue";
		this.speed = this.basic.speed;

		this.pickTarget = this.basic.pickTarget;
		this.remakeHolePath();

	}

	makeBleek() {

		let stage = "white";

		this.bleek.status = true;
		this.bleek.interval = setInterval(() => {

			if(stage === "blue") {

				this.color = "white";
				this.eye.color = "red";

				stage = "white";

			}else{

				this.color = "blue";
				this.eye.color = "white";

				stage = "blue";

			}

		}, 100);

	}

	makeWeak() {

		this.status = "weak";

		this.color = "blue";
		this.eye.color = "white";
		this.speed = this.basic.speed / 2;

		this.draw();

		this.pickTarget = "random";
		this.remakeHolePath();

	}

	goHome() {

		if(getTrack(tracks.weakGhost)) {

			getTrack(tracks.weakGhost).turnOff();

		}else if(getTrack(tracks.sirenEffect)) {

			getTrack(tracks.sirenEffect).turnOff();

		}

		addTrack(tracks.goHomeEffect, false);

		this.status = "home";
		this.bleek.status = false;
		clearInterval(this.bleek.interval);

		this.color = "white";
		this.eye.color = "blue";
		this.speed = this.basic.speed * 2;

		this.pickTarget = "home";
		this.remakeHolePath();

	}

	checkDirection(x, y, startX, startY, endX, endY) {

		let lookAt = () => {

			let r = this.radius * .3;

			switch (this.direction){

				case "up":

					this.eye.y = -r;
					this.eye.x = 0;
					break;
				
				case "down":

					this.eye.y = r;
					this.eye.x = 0;
					break;
				
				case "left":
				
					this.eye.x = -r;
					this.eye.y = 0;
					break;
				
				case "right":
				
					this.eye.x = r;
					this.eye.y = 0;
					break;

			}

		}

		if(this.path == this.holePath[this.holePath.length - 1] && !inRange(x, y, this.path)) {

			if(this.status === "home") {

				return setTimeout(() => {

					if(!getTrack(tracks.lolSong) && !getTrack(tracks.dieEffect) && !getTrack(tracks.openingSong) && getTrack(tracks.goHomeEffect)) {

						this.returnNormal();

						if(level.enemies.every(enemy => enemy.status !== "home")) {

							getTrack(tracks.goHomeEffect).turnOff();

							globalStats.weakGhostTimer !== 0 ? addTrack(tracks.weakGhost, false) : addTrack(tracks.sirenEffect, false)

						}

					}

				}, 2000);

			}

			this.remakeHolePath();

		}

		if(inRange(x, y, [startX, startY, endX, endY])) {

			this.direction = this.key;
			lookAt();

		}else if(this.holePath.length == 1) {

			this.pressButton();

		}else if(inRange(this.x, this.y, this.holePath[this.holePathProgress])) {

			this.path = this.holePath[this.holePathProgress];	

			(this.holePathProgress < this.holePath.length - 1) ? this.holePathProgress++ : this.path = this.holePath[this.holePath.length - 1];

			this.pressButton();

		}else if((inRange(this.x, this.y, [362,258,550,258]) || inRange(this.x, this.y, [0,258,186,258])) && !inRange(x, y, [startX, startY, endX, endY])) {

			this.remakeHolePath();

		}

	}

	pressButton() {

		let cur = {

			x: this.path[0],
			y: this.path[1],
			x2: this.path[2],
			y2: this.path[3]

		}

		let pickKey = (x, y) => {

			if(cur.x == cur.x2) {

				if(this.y < y) {

					this.key = "down";

				}else {

					this.key = "up";

				}

			}else if(cur.y == cur.y2) {

				if(this.x < x) {

					this.key = "right";

				}else {

					this.key = "left";

				}

			}
			
		}

		if(this.holePath.length > 1) {

			if(this.path == this.holePath[this.holePath.length - 1]){

				samePoints(cur.x, cur.y, this.x, this.y) ? pickKey(cur.x2, cur.y2) : pickKey(cur.x, cur.y);

				return;

			}

			let next = {

				x: this.holePath[this.holePathProgress][0],
				y: this.holePath[this.holePathProgress][1],
				x2: this.holePath[this.holePathProgress][2],
				y2: this.holePath[this.holePathProgress][3]

			}

			if(samePoints(cur.x, cur.y, next.x, next.y) || samePoints(cur.x, cur.y, next.x2, next.y2)) {

				pickKey(cur.x, cur.y);

			}else if(samePoints(cur.x2, cur.y2, next.x, next.y) || samePoints(cur.x2, cur.y2, next.x2, next.y2)) {

				pickKey(cur.x2, cur.y2);

			}

			return;

		}

		pickKey(this.target.x, this.target.y);

	}

	erase() {

		this.context.clearRect(this.x - this.radius, this.y - this.radius, this.radius * 2.2, this.radius * 2.2);

	}

	update() {

		super.update();

		this.draw();

	}

	draw() {

		let r = this.radius;
		let ctx = this.context;

		if(this.status !== "home") {
		
			ctx.beginPath();
			ctx.fillStyle = this.color;
			ctx.moveTo(this.x + r, this.y + r * 1.1);
			ctx.lineTo(this.x + r * .66, this.y + r * .8);
			ctx.lineTo(this.x + r * .33, this.y + r * 1.1);
			ctx.lineTo(this.x, this.y + r * .8);
			ctx.lineTo(this.x - r * .33, this.y + r * 1.1);
			ctx.lineTo(this.x - r * .66, this.y + r * .8);
			ctx.lineTo(this.x - r, this.y + r * 1.1);
			ctx.lineTo(this.x - r, this.y);
			ctx.arc(this.x, this.y, r, Tau / 2, Tau, false);
			ctx.fill();
		
		}

		if(this.status === "weak") {

			ctx.beginPath();
			ctx.strokeStyle = this.eye.color;
			ctx.lineWidth = 2;
			ctx.moveTo(this.x - r * .6, this.y + r * .6);
			ctx.lineTo(this.x - r * .4, this.y + r * .4);
			ctx.lineTo(this.x - r * .2, this.y + r * .6);
			ctx.lineTo(this.x, this.y + r * .4);
			ctx.lineTo(this.x + r * .2, this.y + r * .6);
			ctx.lineTo(this.x + r * .4, this.y + r * .4);
			ctx.lineTo(this.x + r * .6, this.y + r * .6);
			ctx.stroke();

		}

		if(this.status !== "weak") {

			ctx.fillStyle = "white";
			ctx.beginPath();
			ctx.arc(this.x - r * .5, this.y, r * .3, Tau, false);
			ctx.fill();

			ctx.beginPath();
			ctx.arc(this.x + r * .5, this.y, r * .3, Tau, false);
			ctx.fill();

		}

		ctx.fillStyle = this.eye.color;
		ctx.beginPath();
		ctx.arc(this.x + this.eye.x + r * .5, this.y + this.eye.y, r * .15, Tau, false);
		ctx.fill();

		ctx.beginPath();
		ctx.arc(this.x + this.eye.x - r * .5, this.y + this.eye.y, r * .15, Tau, false);
		ctx.fill();

	}

	static intersects(a, b, c, d, p, q, r, s) {

		// a = startPointX1
		// b = startPointY1
		// c = endPointX1
		// d = endPointY1

		// p = startPointX2
		// q = startPointY2
		// r = endPointX2
		// s = endPointY2
		
		let det, gamma, lambda;
		
		det = (c - a) * (s - q) - (r - p) * (d - b);
		
		lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
		gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
	
		return (0 <= lambda && lambda <= 1) && (0 <= gamma && gamma <= 1);

	}

	static defineTarget(t) {

		function home() {

			return {x: 258, y: 258};

		}

		function playerCordinates() {

			return {x: player.x, y: player.y};

		}

		let afterPlayer = () => {

			let dir = player.direction;

			let filter = paths.filter(p => {

				switch(dir) {

					case "left":

						if(p[0] > player.x || p[2] > player.x) return false;
						break;

					case "right":

						if(p[0] < player.x || p[2] < player.x) return false;
						break;

					case "up":

						if(p[1] > player.x || p[3] > player.y) return false;
						break;

					case "down":

						if(p[1] < player.y || p[3] < player.y) return false;
						break;

				}

				return CreateEnemy.intersects(...p, ...player.path);

			});

			let prepareTarget = p => random(0, 1) ? {x: p[0], y: p[1]} : {x: p[2], y: p[3]};

			if(filter.length === 0) {

				return prepareTarget(player.path);

			} else if(filter.length === 1) {

				return prepareTarget(filter[0]);

			}

			let u = prepareTarget(filter[random(0, filter.length - 1)]);

			return u;

		}

		function randomPath() {

			let target = {};

			let r = random(0, paths.length - 1);

			if(random(0, 1) == 0) {

				target.x = paths[r][0];
				target.y = paths[r][1];

			}else {

				target.x = paths[r][2];
				target.y = paths[r][3];

			}

			return target;

		};

		function anyTarget() {

			let pool = ["player", "after", "random"];
			let p = pool[random(0, pool.length - 1)];

			return CreateEnemy.defineTarget(p);

		};

		switch(t) {

			case "player":

				return playerCordinates();

				break;

			case "after":

				return afterPlayer();

				break;

			case "random":

				return randomPath();

				break;

			case "any":

				return anyTarget();

				break;

			case "home":

				return home();

				break;

		}

	}

	static makeAllWeak() {

		clearTimeout(globalStats.weakGhostTimer);

		globalStats.ghostStreak = 1;
		globalStats.weakGhostTimer = 0;

		if(getTrack(tracks.sirenEffect)) getTrack(tracks.sirenEffect).turnOff();
		if(!getTrack(tracks.goHomeEffect)) addTrack(tracks.weakGhost, false);

		level.enemies.forEach(enemy => {

			if(enemy.bleek.status) {
			
				clearInterval(enemy.bleek.interval);
				enemy.color = "blue";
				enemy.eye.color = "white";		
			
			}

			if(enemy.status !== "weak" && enemy.status !== "home") enemy.makeWeak();

		});

		globalStats.weakGhostTimer = setTimeout(() => {

			level.enemies.forEach(enemy => {

				if(enemy.status === "weak") enemy.makeBleek();

			});

			globalStats.weakGhostTimer = setTimeout(() => {

				level.enemies.forEach(enemy => { if(enemy.status === "weak") enemy.returnNormal() });

				if(getTrack(tracks.weakGhost)) {
					
					getTrack(tracks.weakGhost).turnOff();
					addTrack(tracks.sirenEffect, false)

				}

				globalStats.ghostStreak = 1;
				globalStats.weakGhostTimer = 0;

			}, 3000);

		}, 10000);

	}

}

class CreatePacMan extends MovingObj{

	constructor(x, y, radius, speed) {

		super(x, y, radius, speed);

		this.context = cPlayer;

		this.type = "player";

		this.turnLag = 0;
		this.wakaTimer;

		this.mouth = {

			start: mouth.get("left").openS,
			end: mouth.get("left").openE,
			status: "close",
			stop: false

		}

	}

	eatAnimation() {

		let closeMouth = (s, e) => {

			if(this.mouth.start > s && this.mouth.end < e) {

				this.mouth.start -= .1
				this.mouth.end += .1

			}else {

				this.mouth.status = "open";

			}

		}

		let openMouth = (s, e) => {

			if(this.mouth.start < s && this.mouth.end > e) {

				this.mouth.start += .1;
				this.mouth.end -= .1;

			}else {

				this.mouth.status = "close";

			}

		}

		switch(this.mouth.status) {

			case "close":

				closeMouth(mouth.get(this.direction).closeS, mouth.get(this.direction).closeE);
				break;

			case "open":

				openMouth(mouth.get(this.direction).openS, mouth.get(this.direction).openE);
				break;

		}

	}

	dieAnimation() {

		let startToEnd = mouth.get(this.direction).openS + Tau / 2.51;
		let endToEnd = mouth.get(this.direction).openE - Tau / 2.51;

		let dieInt = setInterval(() => {

			this.erase();

			if(this.mouth.start < startToEnd - 0.1 && this.mouth.end > endToEnd - 0.1) {

				this.mouth.start += .05;
				this.mouth.end -= .05;

				this.draw();

			}else {

				clearInterval(dieInt);

			}

		}, 20);

	}

	checkDirection(x, y, startX, startY, endX, endY) {

		let prevDir = this.direction;

		if(inRange(x, y, [startX, startY, endX, endY])) {

			this.direction = this.key;

			clearTimeout(this.turnLag);

		}else if(inPath(x, y) !== undefined) {

			this.path = inPath(x, y);
			this.direction = this.key;

			clearTimeout(this.turnLag);

		}

		if(this.direction != prevDir) {

			this.mouth.start = mouth.get(this.direction).openS;
			this.mouth.end = mouth.get(this.direction).openE;

			this.mouth.status = "close";

		}

	}

	update() {

		super.update();

		for(let i = 0; i < level.dots.length; i++) {

			let obj = level.dots[i];

			if(collision(obj, this, obj.radius, 0)) {

				let delObj = (p = 0) => {

					stats.score += p;

					obj.erase();
					level.dots.splice(i, 1);

					if(level.dots.length == 0) {

						let interval = 0;
						let blue = true

						moving(false);

						playingTracks.forEach(track => track.turnOff());

						globalStats.fruitsSpawned = 0;

						level.enemies.forEach(enemy => enemy.erase());

						interval = setInterval(() => {

							blue === true ? drawBoard("white") : drawBoard("blue");
							blue = !blue;

						}, 300)

						setTimeout(() => {

							clearInterval(interval);

							restartLevel();
							drawDots();

						}, 2000)

					}

				}

				switch(obj.type) {

					case "dot":

					 	delObj(10);

					 	let song = getTrack(tracks.wakaEffect);

					 	let eating = () => {

					 		clearTimeout(this.wakaTimer)
					 		
					 		this.wakaTimer = setTimeout(() => {

					 			song.turnOff();

					 		}, 350)

					 	}

					 	if(!song) {

					 		addTrack(tracks.wakaEffect, false);

					 		song = getTrack(tracks.wakaEffect);

					 		eating();

					 	}else {

					 		eating();

					 	}

						break;

					case "powerUp":

						obj.bleek(false);

						delObj(50);

						CreateEnemy.makeAllWeak();

						console.log("Here is Johnny!!!");

						break;
				
				}

			}

		}

		if(level.fruit !== undefined) {

			if(collision(level.fruit, this, level.fruit.radius, this.radius)) {

				console.log("fruit collision")

				stats.score += 100;

				drawText(level.fruit.x - level.fruit.radius, level.fruit.y + level.fruit.radius, level.fruit.radius * 2, String(100), 18, "red");

				level.fruit.disappear(false);
				level.fruit.erase();
				level.fruit = undefined;

				console.log(level.fruit);

				addTrack(tracks.eatFruit).then(() => eraseText());

				if(globalStats.fruitsSpawned < 2) drawFruit();

			}

		}

		for(let enemy of level.enemies) {
		
			if(collision(enemy, this, enemy.radius, this.radius)) {

				if(enemy.status === "normal") {

					if(!getTrack(tracks.dieEffect)) {

						playingTracks.forEach(track => track.turnOff());

						level.dots.forEach(dot => { if(dot.type == "powerUp") dot.bleek(false) })

						stats.lives -= 1;				

					}
				
				} else if(enemy.status === "weak") {

					if(enemy.status !== "home" && !getTrack(tracks.eatGhostEffect)) {

						enemy.erase();

						clearTimeout(enemy.remakeTimer);
						enemy.goHome();

						drawText(enemy.x - enemy.radius, enemy.y + enemy.radius, enemy.radius * 2, String(200 * globalStats.ghostStreak), 25, "red");
						
						stats.score += (200 * globalStats.ghostStreak);
						globalStats.ghostStreak *= 2;

						moving(false);

						addTrack(tracks.eatGhostEffect).then(() => {

							eraseText();
							moving(true);

						});

					}

				}

				break;

			}

		}

		this.eatAnimation();

		this.draw();

	}

	draw() {

		let ctx = this.context;

		ctx.beginPath();
		ctx.moveTo (this.x, this.y);
		ctx.arc(this.x, this.y, this.radius, this.mouth.start, this.mouth.end, false);
		ctx.lineTo (this.x, this.y);
		ctx.fillStyle = "#fff200";
		ctx.fill();

	}

}