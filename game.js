var can = document.querySelector('#myCan');
var c = can.getContext("2d");
var frames = 0;
var DEGREE = Math.PI / 180;
var sprite = new Image();
var sprite2 = new Image();
sprite.src = "./img/sprite.png";
sprite2.src = "./img/sprite2.png";
var FLAP = new Audio();
FLAP.src = "./audio/flap.mp3";
var DIE = new Audio();
DIE.src = "./audio/die.mp3";
var HIT = new Audio();
HIT.src = "./audio/hit.mp3";
var POINT = new Audio();
POINT.src = "./audio/point.mp3";
var SWOSH = new Audio();
SWOSH.src = "./audio/swosh.mp3";


var bg={
        sX: 0,
        sY: 0,
        w: 140,
        h: 250,
        x: 0,
        y: 20,

        draw: function(){
            c.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
            c.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
            c.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w * 2, this.y, this.w, this.h);
        }
}

var fg = {
  sX: 150,
  sY: 0,
  w: 150,
  h: 55,
  x: 0,
  dx: 2,
  y: can.height - 55,
  draw: function(){
    c.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
    c.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
  },
  update: function(){
    if(state.current == state.game){
      this.x = (this.x - this.dx) % (this.w/3) ;
    }
  }
}

var pipes ={
  top: {
    sX: 150,
  },
  bottom:{
    sX: 180,
  },
  sY: 3,
  w: 30,
  h: 160,
  dx: 2,
  position: [],
  gap: 80,
  maxYposition: -155,


  update: function(){
    if(state.current != state.game) return;
    if(frames % 90 == 0){
      this.position.push({x: can.width, y:  Math.random() * this.maxYposition});
    }
    for(var i=0; i< this.position.length; i++){
      let p = this.position[i];
      p.x -= this.dx; 
      if(p.x + this.w < 0){
        score.value++;
        POINT.play();
        score.best = Math.max(score.value, score.best);
        localStorage.setItem("best", score.best);
        this.position.shift();
      }
      if (bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w && (bird.y - bird.radius < p.y+ this.h ||  bird.y + bird.radius > p.y+ this.h + this.gap)){
        HIT.play();
        state.current = state.over;
      }
     
    }
  },
  draw: function(){
    for(var i=0; i< this.position.length; i++){
      var p= this.position[i];
      c.drawImage(sprite2, this.top.sX, this.sY, this.w, this.h, p.x, p.y, this.w, this.h);
      c.drawImage(sprite2, this.bottom.sX, this.sY, this.w, this.h, p.x, p.y + this.h + this.gap, this.w, this.h);
    }
    }
}


var bird = {
  animation: [
    {sX: 263, sY: 90},
    {sX: 222, sY: 124},
    {sX: 263, sY: 90},
    {sX: 263, sY: 64}
    ],
    w: 18, 
    h: 14, 
    x: 25, 
    y: 85,
    animationIndex: 0,
    speed: 0,
    gravity: 0.25,
    jump: 4.6,
    rotation: 0,
    radius: 7,
    isDead : false,
    draw: function () {
      c.save();
      c.translate(this.x, this.y); //(this.x - this.w , this.y - this.h);
      c.rotate(this.rotation);
      c.drawImage(sprite, this.animation[this.animationIndex].sX, this.animation[this.animationIndex].sY, this.w, this.h, - this.w/2, - this.h/2, this.w, this.h);
      c.restore()
      },
    update: function(){
        var period = state.current == state.game ? 5 : 10;
        this.animationIndex += (frames % period == 0 ? 1 : 0);
        this.animationIndex = this.animationIndex % this.animation.length;
        if(state.current == state.getReady){
            this.y = 85
        }else{
          this.speed += this.gravity;
          this.y += this.speed;
          if (this.y + this.h / 2 >= can.height - fg.h) { // ino kharej az else balayi gozashte
            this.y = can.height - fg.h - this.h / 2;
            this.animationIndex = 0;
            if(! this.isDead){
              DIE.play();
              this.isDead = true;
            }
            state.current = state.over;
          }
           if (this.speed < this.jump) { // why not < 0 
             this.rotation = -25 * DEGREE;
           } else {
             this.rotation = 90 * DEGREE;
           }  
        }       
    },
    flap: function(){
      FLAP.play();
      this.speed = -this.jump       
    }
};


var score = {
  best:parseInt(localStorage.getItem("best")) || 0,
  value: 0,
  draw: function(){
    c.strokeStyle = "#fff";
    c.fillStyle = "#000";
    if(state.current == state.game){
      c.lineWidth = "2";
      c.font = "35px IMPACT";
      c.strokeText(this.value, can.width / 2 - 14, 50);
      c.fillText(this.value, can.width / 2 - 14, 50);
    }else if(state.current == state.over){
      c.lineWidth = "2";
      c.font = "8px IMPACT";
      c.strokeText(this.value, 147, 137);
      c.fillText(this.value, 147, 137);
      c.strokeText(this.best, 148, 155);
      c.fillText(this.best, 148, 155);
    }
    
  }
}


var getReady = {
  sX0: 145,
  sY0: 171,
  w0: 98,
  h0: 26,
  x0: can.width / 2,
  y0: 50,
  sX: 145,
  sY: 220,
  w: 95,
  h: 23,
  x: can.width / 2,
  y: 80,
  sX2: 160,
  sY2: 120,
  w2: 56,
  h2: 52,
  x2: can.width / 2,
  y2: 130,
  draw: function () {
     c.drawImage(
       sprite,
       this.sX0,
       this.sY0,
       this.w0,
       this.h0,
       Math.floor(this.x0 - this.w0 / 2),
       Math.floor(this.y0 - this.h0 / 2),
       this.w0,
       this.h0
     );
    c.drawImage(
      sprite,
      this.sX,
      this.sY,
      this.w,
      this.h,
      Math.floor(this.x - this.w / 2),
      Math.floor(this.y - this.h / 2),
      this.w,
      this.h
    );
    c.drawImage(sprite, this.sX2, this.sY2, this.w2, this.h2, Math.floor(this.x2 - this.w2 / 2), Math.floor(this.y2 - this.h2 / 2), this.w2, this.h2);
  },
};


var gameOver = {
  sX: 145,
  sY: 195,
  w: 95,
  h: 25,
  x: can.width / 2,
  y: 90,
  sX2: 145,
  sY2: 56,
  w2: 115,
  h2: 62,
  x2: can.width / 2,
  y2: 140,
  sX3: 240,
  sY3: 212,
  w3: 42,
  h3: 14,
  x3: can.width / 2,
  y3: 180,
  draw: function () {
    c.drawImage(sprite, this.sX, this.sY, this.w, this.h, Math.floor(this.x - this.w / 2), Math.floor(this.y - this.h / 2), this.w, this.h);
    c.drawImage(sprite, this.sX2, this.sY2, this.w2, this.h2, Math.floor(this.x2 - this.w2 / 2), Math.floor(this.y2 - this.h2 / 2), this.w2, this.h2);
    c.drawImage(sprite, this.sX3, this.sY3, this.w3, this.h3, Math.floor(this.x3 - this.w3 / 2), Math.floor(this.y3 - this.h3 / 2), this.w3, this.h3);
    
  },
};





function update(){
  pipes.update();
  fg.update();
  bird.update();
}

function draw(){
    c.fillStyle = "#70c5ce"
    c.fillRect(0, 0, can.width, can.height)// this can cover everything under it so we dont need clearRect anymore.
    bg.draw();
    pipes.draw();
    fg.draw();
    bird.draw();
    if (state.current == state.getReady) { // in 2 ta if ro ye ja dige gozashte
        getReady.draw();
    }
    if (state.current == state.over) {
        gameOver.draw();
    }
    score.draw();
}

var state = {
    current : 0,
    getReady: 0,
    game: 1,
    over: 2
}

document.addEventListener("click", clickHandler);
document.addEventListener("keydown", function(e){
    if(e.which == 32){
        clickHandler()
    }
})

function clickHandler(){
    switch(state.current){
        case state.getReady:
            bird.isDead = false;
            state.current = state.game;
            break
        case state.game:
            bird.flap();
            break
        default:
            bird.speed = 0;
            bird.rotation = 0;
            pipes.position= [];
            score.value= 0;
            state.current = state.getReady;
            break
    }
}
function animate(){
    update();
    draw();
    frames ++;
    requestAnimationFrame(animate)
}
animate()
// console.log(pipes.position);
