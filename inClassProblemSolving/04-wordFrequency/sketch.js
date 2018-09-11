var dictionary = [];
var counter = [];

function setup() {
    createCanvas(windowWidth, windowHeight);
    background('pink');
    loadStrings('./sotu-t-1.txt', callback);
}

function compare(a,b) {
  if (a.count < b.count)
    return 1;
  if (a.count > b.count)
    return -1;
  return 0;
}

function callback(sotu) {
  //  console.log(sotu);
    
    sotu.forEach(function(phrases) {
  //  console.log(phrases);
    var words = phrases.split(' ');
    // console.log(words)
        words.forEach(function(word){
            if (dictionary.indexOf(word) == -1) {
                dictionary.push(word);
                counter.push(1);
            } 
            else if (dictionary.indexOf(word) >= 0)  {
                var n = dictionary.indexOf(word);
                counter[n] ++;
            }
        });
    });
    
    for (var i = 0; i < dictionary.length; i++) {
        dictionary[i] = {
            word: dictionary[i],
            count: counter[i]
        }
    };
    dictionary.sort(compare);
    dictionary.splice(0,1);
    console.log(dictionary);
    // console.log(counter);
}

/*
function draw() {
    translate(width/2, height/2);
    ellipse(0, 0, 1, 1)
}

function mouseReleased() {

}
*/

