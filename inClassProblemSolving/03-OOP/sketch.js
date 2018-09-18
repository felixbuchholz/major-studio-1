var w = 1920;
var h = 200;
var rects = [];

function Rect (xPos, yPos, mouseListener) {
    this.draw = function () {
        push();
            translate (xPos, yPos);
            if (mouseListener == "x"){
                var r = map(mouseX, 0, w,  0, 2*PI);
            } else if (mouseListener == "y") {
                fill(150);
                var r = map(mouseY, 0, 1000,  0, 2*PI);
            };
            rotate(r);
            rect(0,0, 100, 100);
        pop();
    }
};

function mouseListenerAlternate(i) {
    return (i % 2 == 0) ? 'x' : 'y';
}

for (var i = 0; i < 9; i++) {
    rects.push(new Rect(100 + 200*i, 100, mouseListenerAlternate(i)))
}

// var myRect1 = new Rect(100, 100, 'x');
// var myRect2 = new Rect(300, 100, 'y');


function setup() {
    createCanvas(w,h);
    rectMode(CENTER);
    angleMode(RADIANS);

}

function draw() {
    stroke(0);
    
    for (var i = 0; i < rects.length; i++) {
        rects[i].draw()
    }
}

function mouseReleased() {

}
/*
 
*/ 