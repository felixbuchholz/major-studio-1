# Climbing the Energy Ladder – Documentation

## Code Snippets

### Stroke to give Labels a bit space when overplotting (with lines or other elements):

1. approach: selection.clone(this).lower('true')
2. approach: CSS for the SVG element:

``` css
.label text {
    paint-order: stroke;
    stroke: #fff;
    stroke-width: 3px;
    stroke-linecap: butt;
    stroke-linejoin: miter;
}
```

### Keeping track of different states can be a hustle: 

```javascript
let myVar;
let currentYear = 2000;
let running = false;
let changedScale = false; 
function myStartFunction() {
  console.log('called start')
  if (countryCounter == 49) {
    clearInterval(myVar);
    running = false;
    d3.select('#play-pause-button').classed('play', false);
    d3.select('#play-pause-button').classed('pause', false);
    d3.select('#play-pause-button').classed('stop', true);
  } else {
    if (!running) {
      running = true;
      d3.select('#play-pause-button').classed('play', false);
      d3.select('#play-pause-button').classed('pause', true);
      d3.select('#play-pause-button').classed('stop', false);
      
      myVar = setInterval(myTimer, countryTimer);
    } else {
      running = false;
      clearInterval(myVar);
      d3.select('#play-pause-button').classed('play', true);
      d3.select('#play-pause-button').classed('pause', false);
      d3.select('#play-pause-button').classed('stop', false);
    }
  }
}

function myTimer() {
  if (countryCounter == 49) {
    myStartFunction();
  } else {
    // console.log('yes');  
    yearSlider.noUiSlider.set([null, currentYearMax + 1]);
    if (!changedScale) {
      if (countryCounter >= 20) {
        changedScale = true; 
        if (yAxisMax < 100) {
          myStartFunction();
          scaleYAxis(100);
          d3.select('#p100').attr('checked', function() {
            return 'checked'
          })
          d3.select('#p4').attr('checked', function() {
            return ''
          })
        }
      setTimeout(myStartFunction(), 2000);
      } else {
        getAndDrawNextDataPoint();
      }
    } else {
      getAndDrawNextDataPoint();
    }
    
    
  }
}

function myBackFunction() {
  yearSlider.noUiSlider.set([2000, 2003]);
  if (!running) {
    d3.select('#play-pause-button').classed('play', true);
    d3.select('#play-pause-button').classed('pause', false);
    d3.select('#play-pause-button').classed('stop', false);
  } else {
    d3.select('#play-pause-button').classed('play', false);
    d3.select('#play-pause-button').classed('pause', true);
    d3.select('#play-pause-button').classed('stop', false);
    
  }
  activeMapUpdate();
}
```

