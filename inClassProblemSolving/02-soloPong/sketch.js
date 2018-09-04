var w = 400;
var h = 600;
var fr = 100;

class Ball {
  constructor() {
    this.r = Math.floor(Math.random() * 5) + 10;
    this.xPos = Math.floor(Math.random() * w);
    this.yPos = Math.floor(Math.random() * (h - marginBottom*3 - rectHeight));
    this.xSpeed = Math.floor(Math.random() * 10) - 9;
    this.ySpeed = Math.floor(Math.random() * 10) - 9;
    while (this.ySpeed == 0) {
      this.ySpeed = Math.floor(Math.random() * 10) - 9;
    };
    this.display = function() {
      ellipse(this.xPos, this.yPos, this.r, this.r);
    };
    this.move = function() {
      this.leftWallContact = this.xPos <= 0 + Math.floor(this.r/2);
      this.rightWallContact = this.xPos >= w - Math.floor(this.r/2)
      this.oppositeWallContact = this.yPos <= 0 + Math.floor(this.r/2);
      this.rectContact = (this.xPos <= mouseX + rectWidth/2) && (this.xPos >= mouseX - rectWidth/2) && (this.yPos >= (h-(marginBottom+rectHeight))) && (this.yPos <= (h-(marginBottom+rectHeight-(this.ySpeed+1))));
      if (this.leftWallContact || this.rightWallContact) {
        this.xSpeed *= -1;
      };
      if (this.oppositeWallContact || this.rectContact) {
        this.ySpeed *= -1;
        if (this.rectContact) {
          contactCounter++;
          moveTester = 0;
          rotateTest *= -1;
          this.ySpeed *= 1.1;
          //TODO Spin here
          // this.spin = map(this.xSpeed, -1.1, 1.1, rectLeft, rectRight);
          this.xSpeed *= 1.1;
        };
      };
      this.xPos += this.xSpeed;
      this.yPos += this.ySpeed;
    }
  }
}

var balls = [];

var rectHeight = 15;
var marginBottom = 0;
var rectWidth = 0;
var rectLeft, rectRight;
var contactCounter = 0;
var heightGainOnContact = 0;
var moveTester = 0;
var rotateTest = -1;

function setVariables() {
  contactCounter = 0;
  marginBottom = contactCounter * heightGainOnContact + 20;
  rectWidth = Math.floor(Math.random() * 50) + 20;
  heightGainOnContact = Math.floor(Math.random() * 50) +10;
  moveTester = heightGainOnContact;
  rotateTest = -1;
}

setVariables();

function mouseClicked(){
  setVariables();
  balls = [];
  for (var i = 0; i < 1; i++) {
    balls[i] = new Ball();
  }
}

function keyPressed() {
  if (keyCode === UP_ARROW) {
    balls.push(new Ball())
    console.log(balls.length);
  }
}


function setup() {
  createCanvas(w, h);
  frameRate(fr);
  balls[0] = new Ball();
}

function draw() {
  background(200);

  push();
  if (rotateTest > 0) {
    translate(width, height);
    rotate(PI);
  }
  for (var i = 0; i < balls.length; i++) {
    balls[i].display();
    balls[i].move();
  }
  rectMode(CENTER);
  rect(mouseX, h-marginBottom, rectWidth, rectHeight);
  rectLeft = mouseX - rectWidth/2;
  rectRight = mouseX + rectWidth/2;
  textAlign(CENTER);
  text(contactCounter, mouseX, h-marginBottom+rectHeight/2-1)
  pop();

  setTimeout(function() {
      if (moveTester < heightGainOnContact) {
        marginBottom = (contactCounter * heightGainOnContact) + moveTester;
        moveTester++;
      } else if (moveTester == heightGainOnContact) {
        marginBottom = contactCounter * heightGainOnContact + moveTester;
      };
    },
    // Previoulsy the value 5 in the next line was the ySpeed variable of the Ball, to make it dependent on the
    (1000/fr*-1/5)+20/heightGainOnContact
  )
}
