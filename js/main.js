const paths = [

	// CENTER
	[128,416,422,416],
	[30,98,518,98],
	[0,258,186,258],
	[362,258,550,258],
	[186,204,362,204],
	[186,310,362,310],
	[30,522,518,522],
	[238,258,314,258],
	[276,204,276,258],

	// LEFT
	[128,26,128,470],
	[30,26,244,26],
	[30,26,30,150],
	[30,150,128,150],
	[244,26,244,98],
	[186,204,186,364],
	[30,364,244,364],
	[244,364,244,416],
	[30,364,30,416],
	[30,416,70,416],
	[70,416,70,470],
	[30,470,128,470],
	[30,470,30,522],
	[244,150,244,204],
	[186,150,244,150],
	[186,98,186,150],
	[244,470,244,522],
	[186,470,244,470],
	[186,416,186,470],

	// RIGHT
	[422,26,422,470],
	[304,26,518,26],
	[518,26,518,150],
	[304,26,304,98],
	[422,150,518,150],
	[362,204,362,364],
	[304,364,518,364],
	[304,364,304,416],
	[518,364,518,416],
	[480,416,518,416],
	[480,416,480,470],
	[422,470,518,470],
	[518,470,518,522],
	[304,150,304,204],
	[304,150,362,150],
	[362,98,362,150],
	[304,470,304,522],
	[304,470,362,470],
	[362,416,362,470]

];

const tracksPool = [

	["openingSong", "opening", "./assets/sound/opening_song.mp3", false],
	["sirenEffect", "siren", "./assets/sound/siren_effect.mp3", true],
	["weakGhost", "weak", "./assets/sound/weak_ghost.mp3", true],
	["wakaEffect", "waka", "./assets/sound/eating_dot.mp3", true],
	["eatFruit", "eatFruit", "./assets/sound/eat_fruit.mp3", false],
	["eatGhostEffect", "eatGhost", "./assets/sound/eating_ghost_effect.mp3", false],
	["goHomeEffect", "ghostHome", "./assets/sound/ghost_go_home.mp3", true],
	["extraLifeEffect", "extraLife", "./assets/sound/extra_live_effect.mp3", false],
	["dieEffect", "die", "./assets/sound/dies_effect.mp3", false],
	["lolSong", "lol", "./assets/sound/lol_u_died.mp3", true]
	
]

const enemyPool = [

	{name: "Blinky", color: "red", target: "player", spawn: {x: 276, y: 204}},
	{name: "Pinky", color: "pink", target: "after", spawn: {x: 238, y: 258}},
	{name: "Inky", color: "cyan", target: "any", spawn: {x: 278, y: 258}},
	{name: "Clyde", color: "orange", target: "random", spawn: {x: 314, y: 258}}

];

const Tau = Math.PI * 2;

const mouth = new Map([

	["right", {

		openS: Tau * .1,
		openE: Tau * .9,
		closeS: 0,
		closeE: Tau

	}],

	["left", {

		openS: Tau * .6,
		openE: Tau * .4,
		closeS: Tau * .49,
		closeE: Tau * .49

	}],

	["down", {

		openS: Tau * .35,
		openE: Tau * 1.15,
		closeS: Tau * .25,
		closeE: Tau * 1.25

	}],

	["up", {

		openS: Tau * .85,
		openE: Tau * .65,
		closeS: Tau * .74,
		closeE: Tau * .74

	}]

])

const CWidth = 550;
const CHeight = 550;

let canvasPlayer = getId("pacMan");
let cPlayer = canvasPlayer.getContext("2d");

let blinkyCanvas = getId("ghostBlinky");
let cBlinky = blinkyCanvas.getContext("2d");

let pinkyCanvas = getId("ghostPinky");
let cPinky = pinkyCanvas.getContext("2d");

let inkyCanvas = getId("ghostInky");
let cInky = inkyCanvas.getContext("2d");

let clydeCanvas = getId("ghostClyde");
let cClyde = clydeCanvas.getContext("2d");

let dotsCanvas = getId("dots");
let cDot = dotsCanvas.getContext("2d");

let textCanvas = getId("text");
let cText = textCanvas.getContext("2d");

let boardCanvas = getId("board");
let cBoard = boardCanvas.getContext("2d", { alpha: false });

let menu = getId("menu");
let startButton = getId("startGame");
let controlButton = getId("changeControl");
let muteButton = getId("muteButton");

let stopGame = false;

let tracks = {};
let playingTracks = new Map([]);
let muteSound = false;

let player = {};
let controls = {

	up: 87,
	down: 83,
	left: 65,
	right: 68

}

let releas = {

	amount: 1,
	interval: 0

}

let level = {

	enemies: [],
	dots: [],
	text: [],
	fruit: undefined

}

let globalStats = {

	ghostStreak: 1,
	weakGhostTimer: 0,
	fruitsTimer: 0,
	fruitsSpawned: 0

}
let stats = new Proxy({

	score: 0,
	highScore: 0,
	lives: 3,
	giftedLives: 1

}, {

	set(target, key, value) {

		if(key == "score") {

			if(value > stats.highScore) {

				stats.highScore = value;

			}

			if(value / (stats.giftedLives * 10000) >= 1) {

				stats.lives += 1;
				stats.giftedLives += 1;

				addTrack(tracks.extraLifeEffect);

			}

		}else if(key == "lives") {

			if(value < target.lives) {

				moving(false);

				player.dieAnimation();

				clearTimeout(globalStats.weakGhostTimer);
				clearTimeout(globalStats.fruitsTimer)

				addTrack(tracks.dieEffect).then(() => {

					if(value <= 0) {

						restartGame();

					}else {

						restartLevel();

					}

				});

			}

		}

		target[key] = value

		return true;

	}

});

tracksPool.forEach(track => {

	tracks[track[0]] = {

		id: track[1],
		url: new Audio(track[2])
	
	}
	tracks[track[0]].url.loop = track[3];
	tracks[track[0]].url.load();

})

tracks.wakaEffect.url.volume = .5;

alert("Your controls sceme is - W - A - S - D -");

canvasPlayer.width = CWidth;
canvasPlayer.height = CHeight;

blinkyCanvas.width = CWidth;
blinkyCanvas.height = CHeight;

pinkyCanvas.width = CWidth;
pinkyCanvas.height = CHeight;

inkyCanvas.width = CWidth;
inkyCanvas.height = CHeight;

clydeCanvas.width = CWidth;
clydeCanvas.height = CHeight;

dotsCanvas.width = CWidth;
dotsCanvas.height = CHeight;

textCanvas.width = CWidth;
textCanvas.height = CHeight;

boardCanvas.width = CWidth;
boardCanvas.height = CHeight;

startButton.addEventListener("click", event => {

	menu.style.display = "none";

	document.onkeydown = event => {

		let key = "";

		switch(event.keyCode) {

			case controls.up:

				key = "up";
				break;

			case controls.down:

				key = "down";
				break;

			case controls.left:

				key = "left";
				break;

			case controls.right:

				key = "right";
				break;

		}

		if(key !== "") {

			player.key = key;

			clearTimeout(player.turnLag);

			if(player.key !== player.direction) {

				player.turnLag = setTimeout(() => {

					player.key = player.direction;

				}, 1000);

			}

		}

	};

	init();
	drawDots();

	getReadyForGame();

	drawFruit();

});

controlButton.addEventListener("click", event => {

	function* changeControls() {

		alert("After you click OK press key for UP");

		controls.up = yield;

		alert("After you click OK press key for DOWN");

		controls.down = yield;

		alert("After you click OK press key for LEFT");

		controls.left = yield;

		alert("After you click OK press key for RIGHT");

		controls.right = yield;

		document.onkeydown = null;

		return;

	}

	let iterator = changeControls();

	iterator.next();

	document.onkeydown = event => iterator.next(event.keyCode);

});

muteButton.addEventListener("click", event => {

	muteSound = !muteSound;

	muteButton.className = muteSound ? "mute" : "volume";
	Object.values(tracks).forEach(track => track.url.volume = muteSound ? 0 : 1)

});

function init() {

	player = {};
	level.enemies = [];

	player = new CreatePacMan(274, 416, 16, 2);
	player.draw();

	for(let enemy of enemyPool) {

		level.enemies.push(new CreateEnemy(enemy.spawn.x, enemy.spawn.y, 16, 2, enemy.name, enemy.color, enemy.target));

	}
	level.enemies.forEach(enemy => enemy.draw());

	drawBoard();

}

function anime() {

	for(let i = 0; i < releas.amount; i++) {

		let enemy = level.enemies[i];

		enemy.erase();
		enemy.update();

	}

	player.erase();
	player.update();

	if(stopGame === true) return;

	requestAnimationFrame(anime);

}

function releasGhost() {

	releas.amount = 1;

	clearInterval(releas.interval);

	releas.interval = setInterval(() => {

		releas.amount < enemyPool.length ? releas.amount++ : clearInterval(releas.interval);

	}, 2000);

}

function getReadyForGame() {

	drawText(235, 325, 90, "Ready!", 25, "yellow");

	addTrack(tracks.openingSong).then(() => {

		eraseText();

		addTrack(tracks.sirenEffect, false);

		player.eatAnimation();
		level.dots.forEach(dot => { if(dot.type == "powerUp") dot.bleek(true)});

		releasGhost();

		if(level.fruit === undefined) {

			if(globalStats.fruitsSpawned < 2) drawFruit();

		}else {

			level.fruit.disappear(true);

		}

		moving(true);

	});

}

function restartGame() {

	function restart(e) {

		if(e.key == "Enter") {

			document.removeEventListener("keypress", restart);

			eraseText();

			getTrack(tracks.lolSong).turnOff();

			restartLevel();
			drawDots();
			drawFruit();

		}

	}

	clearTimeout(globalStats.fruitsTimer);
	clearTimeout(globalStats.weakGhostTimer);

	level.enemies.forEach(enemy => enemy.erase());
	player.erase();

	if(level.fruit !== undefined) {

		level.fruit.disappear(false);
		level.fruit.erase();

	}

	drawText(175, 230, 200, "LOL, YOU DIED", 25, "red");
	drawText(175, 270, 200, `High score = ${stats.highScore}`, 20);
	drawText(175, 310, 200, `Your score = ${stats.score}`, 18);

	stats.score = 0;
	stats.giftedlives = 1;
	stats.lives = 3;
	
	globalStats.fruitsSpawned = 0;
	level.fruit = undefined;

	addTrack(tracks.lolSong, false);

	document.addEventListener("keypress", restart);

}

function restartLevel() {

	clearTimeout(globalStats.fruitsTimer);
	clearTimeout(globalStats.weakGhostTimer);
	
	globalStats.ghostStreak = 1;

	if(level.fruit !== undefined) {

		console.log("if(fruit !== undefined) WORKS!!!!!!")

		level.fruit.disappear(false);

	}

	player.erase();
	level.enemies.forEach(enemy => enemy.erase());

	init();

	getReadyForGame();

}