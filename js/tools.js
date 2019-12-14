let getId = id => document.getElementById(id);

let samePoints = (x, y, x2, y2) => (x === x2 && y === y2) ? true : false;

let random = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

let distance = (point1, point2) => (point1.x - point2.x) * (point1.x - point2.x) + (point1.y - point2.y) * (point1.y - point2.y);

let collision = (obj1, obj2, r1, r2) => Math.hypot(obj1.x - obj2.x, obj1.y - obj2.y) - r1 - r2 <= 0;

let inRange = (x, y, range) => (x >= range[0] && x <= range[2]) && (y >= range[1] && y <= range[3]) ? true : false;

let inPath = (x, y) => paths.find(el => inRange(x, y, el));

let getTrack = track => playingTracks.get(track.id);

function drawText(x, y, maxWidth, text, size, color) {

	level.text.push(new CreateText(x, y, maxWidth, text, size, color));
	level.text.forEach(text => text.draw());

}

function eraseText() {

	level.text.forEach(text => text.erase());
	level.text = [];

}

function addTrack(track, timerOn = true) {

	let song;

	playingTracks.set(track.id, new CreateTrack(track.id, track.url));

	song = getTrack(track);
	song.url.play();

	if(timerOn) {

		return song.setTimer();

	}

}

function moving(type) {

	if(type === false) {

		stopGame = true;

		level.enemies.forEach(enemy => clearTimeout(enemy.remakeTimer));

	}else if(type === true) {

		stopGame = false;

		level.enemies.forEach(enemy => enemy.remakeHolePath());

		anime();

	}

}

function drawFruit() {

	let poolOfFruits = ["cherry"];

	globalStats.fruitsTimer = setTimeout(() => {

		level.fruit = new CreateFruit(276, 310, 16, "cherry");
		level.fruit.draw();

		globalStats.fruitsSpawned++;

	}, random(15000, 30000));

}


function drawDots() {

	let filterForbidden = paths.filter(el => {

		let forbiddenPaths = [
	
			[362,204,362,364],
			[186,204,186,364],
			[304,150,304,204],
			[244,150,244,204],
			[0,258,186,258],
			[362,258,550,258],
			[186,204,362,204],
			[186,310,362,310],
			[238,258,314,258],
			[276,204,276,258]

		];

		return forbiddenPaths.every(p => el.toString() !== p.toString());

	});

	function pushPowerDots() {

		let dir = [
		
			[30, 79.39999999999999],
			[518, 79.39999999999999],
			[30, 416],
			[518, 416]
		
		]

		dir.forEach(d => level.dots.push(new CreatePowerUpDot(d[0], d[1], 8)))
	
	}

	function pushDots() {

		filterForbidden.forEach(p => level.dots.push(new CreateDot(p[2], p[3])));

		for(let p of filterForbidden) {
		
			let point = {

				x: p[0],
				y: p[1]

			}

			let gap;

			if(p[0] == p[2]) {

				dir = "down";
				gap = 17.80;

			}else if(p[1] == p[3]) {

				dir = "right";
				gap = 19.53;

			}

			while(inRange(point.x, point.y, p)) {

				if(level.dots.some(dot => collision(dot, point, dot.radius, dot.radius)) == false) {

					level.dots.push(new CreateDot(point.x, point.y));

				}

				if(dir == "right") {

					point.x += gap;

				}else if(dir == "down") {

					point.y += gap;

				}

			}
		
		}

	}

	level.dots = [];

	pushPowerDots();
	pushDots();

	for(let dot of level.dots) dot.draw();
	
}