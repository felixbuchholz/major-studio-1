var w = 400;
var h = 600;
var fr = 100;

var r = 0;
var marginBottom = 0;
var rectWidth = 0;
var contactCounter = 0;
var xPos = 0;
var yPos = 0;
var xSpeed = 0;
var ySpeed = 0;
var heightGainOnContact = 0;
var moveTester = 0;
var rotateTest = -1;
console.log(r, marginBottom, xPos, yPos, xSpeed, ySpeed, rectWidth);

function setVariables() {
  r = Math.floor(Math.random() * 5) + 10;
  contactCounter = 0;
  marginBottom = contactCounter * heightGainOnContact + 20;
  xPos = Math.floor(Math.random() * w);
  yPos = Math.floor(Math.random() * (h - marginBottom*3 - r));
  xSpeed = Math.floor(Math.random() * 10) - 9;
  ySpeed = Math.floor(Math.random() * 10) - 9;
  while (ySpeed == 0) {
    console.log('happened');
    ySpeed = Math.floor(Math.random() * 10) - 9;
  }
  rectWidth = Math.floor(Math.random() * 50) + 20;
  heightGainOnContact = Math.floor(Math.random() * 50) +10;
  moveTester = heightGainOnContact;
  rotateTest = -1;

    console.log(r, marginBottom, xPos, yPos, xSpeed, ySpeed, rectWidth, heightGainOnContact);
}

setVariables();

function mouseClicked(){
  setVariables();
}

function setup() {
  createCanvas(w, h);
  frameRate(fr);
}

function draw() {
  background(200);

  xPos += xSpeed;
  yPos += ySpeed;

  push();
  if (rotateTest > 0) {
    translate(width, height);
    rotate(PI);
  }

  ellipse(xPos, yPos, r, r);
  rectMode(CENTER);
  rect(mouseX, h-marginBottom, rectWidth, r);
  pop();

  var leftWallContact = xPos <= 0 + Math.floor(r/2);
  var rightWallContact = xPos >= w - Math.floor(r/2)

  if (leftWallContact || rightWallContact) {
    xSpeed *= -1;
  }

  var oppositeWallContact = yPos <= 0 + Math.floor(r/2);
  var rectContact = (xPos <= mouseX + rectWidth/2) && ( xPos >= mouseX - rectWidth/2) && (yPos >= (h-(marginBottom+r))) && (yPos <= (h-(marginBottom+r-(ySpeed+1))));

  if (oppositeWallContact || rectContact) {
    ySpeed *= -1;
    if (rectContact) {
      contactCounter++;
      moveTester = 0;
      rotateTest *= -1;
    }
  }

  setTimeout(function() {
      if (moveTester < heightGainOnContact) {
        marginBottom = (contactCounter * heightGainOnContact) + moveTester;
        moveTester++;
      } else if (moveTester == heightGainOnContact) {
        marginBottom = contactCounter * heightGainOnContact + moveTester;
      };
    },
    (1000/fr*-1/ySpeed)+20/heightGainOnContact
  )

}
// Todo: implement a switch to flip the canvas
// if rectContact: es startet ein Ding, checkt ob wir heightGainOnContact haben, und wenn nicht, dann ++
