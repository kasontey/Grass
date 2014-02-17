//create the canvas
	var canvas = document.getElementById("canvas");
	var ctx = canvas.getContext("2d");
	canvas.width = 1024;
	canvas.height = 640;
	canvas.style.display = "inline";

//load booleans
	//background
	var bgReady=false;
	var bgImage = new Image();
	bgImage.onload = function (){
		bgReady = true;
	};
	bgImage.src = "biggy2.png";

	//panda and hero
	var phReady=false;
	var phImage = new Image();
	phImage.onload = function (){
		phReady = true;
	};
	phImage.src = "panda.png";

	//goblin and hunter
	var ghReady=false;
	var ghImage = new Image();
	ghImage.onload = function (){
		ghReady = true;
	};
	ghImage.src = "tiger.gif";

//game objects
	var hero = {
		speed: 256
	};
	var theherd = {};
	var score = 0;
	var keysDown = {};//keyboard controls
	var buffer = 220;
	var i = 1; //this is used as a counter for the monsters
	var isPaused = false;
	var input = 0; //whatever the user has typed
	var gameOver = false;
	var fakeNumPad = { // keyboard numberpad, k is 5
		79: 9, // o
		73: 8, // i
		85: 7, // u
		76: 6, // l
		75: 5, // k
		74: 4, // j
		190: 3, // .
		188: 2, // ,
		77: 1, // m
		32: 0 // spacebar
	};
	var widthChange = 0; // score box width change

//event listeners >> takes user input (numbers) and checks for answers
	addEventListener("keydown", function (e) {
		keysDown[e.keyCode] = true;
		if(e.keyCode===32){
			e.preventDefault();
		}
	}, false);

	addEventListener("keyup", function (e) {
		console.log(e.keyCode);
		delete keysDown[e.keyCode];

		if(!gameOver && e.keyCode===27){ // Player pushes Esc >> Toggles isPaused

			isPaused=!isPaused ? true : false;

		} 
		//checks if the player presses enter to restart game
		else if(gameOver && e.keyCode===13){
			gameOver = false;
		}

		if(isPaused){
			return;
		}

		//the following chunk looks to see what number has been typed in
		var digit = "";
		for(var x = 96; x <= 105; x++){ // Player pushes number >> Digit is concatenated to input
			if(x == e.keyCode){
				digit = x - 96;
			} else if(x - 48 == e.keyCode){
				digit = x - 96;
			}
		}
		if(e.keyCode in fakeNumPad){
			digit = fakeNumPad[e.keyCode];
		}
		
		input = +("" + input + digit);

		//to clear the input
		if(input > 999 || e.keyCode === 186){ // semicolon to clear
			input = 0;
		}

		if(e.keyCode === 8){ // backspace to get rid of last digit
			input = Math.floor(input/10);
		}

		//checks monsters' answers with input
		var found = false;
		for(monster in theherd){
			if(theherd[monster].ans==input){
				delete theherd[monster];
				found = true;
				score++;
			}
		}
		if(found){
			input = 0;
		}

	}, false);

//reset() >> deletes theherd, keysDown elements, resets score, set gameOver to true
	var reset = function () {
		for(monster in theherd){
			delete theherd[monster];
		}
		for(e in keysDown){
			delete keysDown[e];
		}
		score = 0;
		gameOver = true;
	};

var generate = function() {
	// makes "older" monsters move faster
		for(monster in theherd){ 
			theherd[monster].speed += 5;
		}

	// initialize monster
		var name = "Monster" + i;
		theherd[name] = { 
			speed: 5 + score,
			x : 32 + (Math.random() * (canvas.width - 64)), // starting pos
			y : 32 + (Math.random() * (canvas.height - 64)),
			width : 42 // width of hovering box. 2 + 13 + 12 + 13 + 2. 2 margin, 13 for digit, 12 for 'x'
		};

	// makes sure monster is outside buffer
		while( (theherd[name].x < hero.x + buffer - 18 && theherd[name].x > hero.x - buffer + 18) &&
			   (theherd[name].y < hero.y + buffer - 18 && theherd[name].y > hero.y - buffer + 18) ){
			//throw monster on screen randomly
			theherd[name].x = 32 + (Math.random() * (canvas.width - 64));
			theherd[name].y = 32 + (Math.random() * (canvas.height - 64));
		}

	// random numbers made here
		theherd[name].a = 1 + Math.floor(Math.random() * 12 );
		theherd[name].b = 1 + Math.floor(Math.random() * 12 );
		theherd[name].ans = theherd[name].a * theherd[name].b;

	if(theherd[name].a >= 10){
		theherd[name].width+=13;
	}
	if(theherd[name].b >= 10){
		theherd[name].width+=13;
	}

	i++;	
};

//update() update game objects
	var update = function (modifier) {
		// player movement
			if (87 in keysDown) { // Player holding up
				hero.y -= hero.speed * modifier;
				if (hero.y < 32){
					hero.y = 32;
				}
			}
			if (83 in keysDown) { // Player holding down
				hero.y += hero.speed * modifier;
				if(hero.y + 64 > canvas.height){
					hero.y = canvas.height - 64;
				}
			}
			if (65 in keysDown) { // Player holding left
				hero.x -= hero.speed * modifier;
				if(hero.x < 32){
					hero.x = 32;
				}
			}
			if (68 in keysDown) { // Player holding right
				hero.x += hero.speed * modifier;
				if(hero.x + 64 > canvas.width){
					hero.x = canvas.width - 64;
				}
			}
		
		var monsterTouch = false;

		//monster chasing
		for(monster in theherd){
			
			theherd[monster].x += ( (hero.x-theherd[monster].x) / Math.abs(hero.x-theherd[monster].x) ) * theherd[monster].speed * modifier;
			theherd[monster].y += ( (hero.y-theherd[monster].y) / Math.abs(hero.y-theherd[monster].y) ) * theherd[monster].speed * modifier;
			
			
		}

		// Is hero touching a monster?
			var touching = false;
			for(monster in theherd){
				if ( hero.x <= (theherd[monster].x + 32) 
					&& theherd[monster].x <= (hero.x + 32)
					&& hero.y <= (theherd[monster].y + 32)
					&& theherd[monster].y <= (hero.y + 32)
				){
					touching=true;
				}
			}
			if(touching) {
				reset();
			}
	};

//render() draws everything
	
	var render = function () {
		
		// draw characters
			if(bgReady) {
				ctx.drawImage(bgImage,0,0)
			}
			if (phReady) {
				//buffer box visual
					// ctx.fillStyle= "rgba(14,187,120,.7)";
					// var boxherox=Math.floor(hero.x-(buffer)+18);
					// var boxheroy=Math.floor(hero.y-(buffer)+18);
					// ctx.fillRect(boxherox,boxheroy ,buffer*2,buffer*2);
				ctx.drawImage(phImage, hero.x, hero.y);
			}
			if (ghReady) {
				for(monster in theherd){
					ctx.drawImage(ghImage, theherd[monster].x, theherd[monster].y);
				}
				if(!isPaused){
					for (monster in theherd){ // draws equation
						ctx.font = "24px Helvetica";
						ctx.fillStyle= "rgba(14,34,200,.7)";
						ctx.fillRect(theherd[monster].x+16-theherd[monster].width/2,theherd[monster].y-26,theherd[monster].width,26);//goes to center of box, minus width/2
						ctx.fillStyle="rgb(250,250,250)";
						ctx.textAlign = "center";
						ctx.fillText(theherd[monster].a + 'x' + theherd[monster].b, theherd[monster].x+16, theherd[monster].y-13);
					}
				}
			}
		
		ctx.fillStyle= "rgba(14,34,200,.7)";
		ctx.fillRect(640,0,60,32); // input box
		widthChange = ((score+"").length-1)*13;
		ctx.fillRect(290-widthChange/2,0,110+widthChange,32); // score box


		ctx.fillStyle = "rgb(250, 250, 250)";
		ctx.font = "24px Helvetica";
		ctx.textBaseline = "middle";
		ctx.textAlign = "right";
		ctx.fillText(input, 690, 16); // input
		ctx.textAlign = "center";
		ctx.fillText("Score: " + score, 345, 16); // score

		if(isPaused){
			ctx.fillStyle="rgba(20,20,35,.8)";
			ctx.fillRect(160,94,704,452); // pause menu
			
			ctx.font = "35px Helvetica";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillStyle = "rgb(250, 250, 250)";
			ctx.fillText("Pause. Press [Esc] to resume.", canvas.width/2, canvas.height/2); // pause menu text
		} else if (gameOver){
			ctx.fillStyle="rgba(20,20,35,.8)";
			ctx.fillRect(160,94,704,452); // game over 
			
			ctx.font = "35px Helvetica";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillStyle = "rgb(250, 250, 250)";
			ctx.fillText("Game Over. Press [Enter] to play again.", canvas.width/2, canvas.height/2); // game over text
		}

	};

var main = function(){
	var now = Date.now();
	var delta = now - then;

	if(! isPaused && ! gameOver){
		//this sets the difference between each tiger spawn
		var interval = 5;
		if( (now - lastgen) / 1000 > interval){ 
			generate();
			lastgen = now;
		}
		update(delta/1000); // updates character info
	}
	render();
	then = now;
}

//GAME TIME!!!!!
hero.x = canvas.width / 2;
hero.y = canvas.height / 2;
generate();
var then = Date.now();
var lastgen = then;
setInterval(main, 10); //execute as fast as possible