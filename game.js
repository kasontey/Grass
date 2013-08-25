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
	var keysDown={};//keyboard controls
	var buffer = 220;
	var i=1;
	var isPaused = false;
	var input = 0;

//event listeners >> takes user input (numbers) and checks for answers
	addEventListener("keydown", function (e) {
		keysDown[e.keyCode] = true;
	}, false);

	addEventListener("keyup", function (e) {
		//console.log(e.keyCode);
		delete keysDown[e.keyCode];

		if(e.keyCode==27){ // Player pushes Esc >> Toggles isPaused
			if(!isPaused){
				isPaused = true;
			} else {
				isPaused = false;
			}
		}

		for(var x = 96; x <= 105; x++){ // Player pushes number >> Digit is concatenated to input
			if(x == e.keyCode){
				var digit = x - 96;
				input = +("" + input + digit);
			}
			else if(x - 48 == e.keyCode){
				var digit = x - 96;
				input = +("" + input + digit);
			}	
		}

		if(input > 999){
			input = 0;
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

//reset >> deletes theherd, keysDown elements, resets score
	var reset = function () {
		for(monster in theherd){
			delete theherd[monster];
		}
		for(e in keysDown){
			delete keysDown[e];
		}
		//alert("end of game, you have been eaten! And you demolished " +score + " tigers!");
		score = 0;
	};

var generate = function() {
	// initialize monster
		var name = "Monster" + i;
		theherd[name] = { 
			speed: 5 + score,
			x : 32 + (Math.random() * (canvas.width - 64)),
			y : 32 + (Math.random() * (canvas.height - 64))
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

	i++;

	for(monster in theherd){ // makes "older" monsters move faster
		theherd[monster].speed += 5;
	}
};

//update game objects
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
			

			//collision for monsters, much revision needed.
			for(brother in theherd){
				
				blueboxwidth=64;
				blueboxheight=26;
				if(brother!=monster){
					if(theherd[monster].y<theherd[brother].y+26 && theherd[monster].y+26 >theherd[brother].y){
						
						if (theherd[monster].x<theherd[brother].x+64 && theherd[monster].x>theherd[brother].x) {
							console.log("stuck");
							console.log(monster);
							theherd[monster].x = theherd[brother].x+64;
						}

					}
					if(theherd[monster].x+64>theherd[brother].x && theherd[monster].x <theherd[brother].x+64){
						
						if (theherd[monster].y<theherd[brother].y+26 && theherd[monster].y+26>theherd[brother].y) {
							console.log("stuck");
							console.log(monster);
							theherd[monster].y = theherd[brother].y+26;
						}

					}

					
				}
			}
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

//draws everything
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
				if(! isPaused){
					for (monster in theherd){ // draws equation
						ctx.font = "24px Helvetica";
						ctx.fillStyle= "rgba(14,34,200,.7)";
						ctx.fillRect(theherd[monster].x,theherd[monster].y-25, 64,26);
						ctx.fillStyle="rgb(250,250,250)";
						ctx.fillText(theherd[monster].a + 'x' + theherd[monster].b, theherd[monster].x, theherd[monster].y-25);
					}
				}
			}
		
		ctx.fillStyle= "rgba(14,34,200,.7)";
		ctx.fillRect(640,28,50,30); // score box
		ctx.fillRect(290,28,120,35); // input box

		ctx.fillStyle = "rgb(250, 250, 250)";
		ctx.font = "24px Helvetica";
		ctx.textAlign = "left";
		ctx.textBaseline = "top";
		ctx.fillText("Score: " + score, 300, 32); // score
		ctx.fillText(input,650,32); // input

		if(isPaused){
			ctx.fillStyle="rgba(20,20,35,.8)";
			ctx.fillRect(160,94,704,452); // pause menu
			
			ctx.font = "35px Helvetica";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillStyle = "rgb(250, 250, 250)";
			ctx.fillText("Pause. Press Esc to resume.", canvas.width/2, canvas.height/2); //pause menu text.
		}

	};

var main = function(){
	var now = Date.now();
	var delta = now - then;

	if(! isPaused){
		if( (now - lastgen) / 1000 > 3 ){ // generates tiger every 3 seconds
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
setInterval(main, 1); //execute as fast as possible