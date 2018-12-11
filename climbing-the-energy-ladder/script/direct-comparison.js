/* global d3 */
/* global data */
let xScaleActiveMap, yScaleActiveMap, xAxis, yAxis;
let yearSlider, activeMapYearsArr, lastYear;
let xAxisMax = 4;
let pointTimer = 380; // good choice: 380
let countryTimer = 400; // good choice: 400
let xAxisTimer = 500;
let initialCircleRadius = 10;
let regularCircleSize = 3;
let distanceFromCircle = 8;
let myDegrees = 0;

let myVar;
let currentYear = 2000;
let running = false;
let changedScale = false; 

let countryCounter = 0;
let dataPointCounter = 0;
let allCountryNames, currentCountryName, currentCountryData;
let dataCont, countryCont; 
let xText, yText;

/*
let createYearSlider = () => {
  // console.log(lastYear)
  yearSlider = document.getElementById('active-map-slider');
  noUiSlider.create(yearSlider, {
    start: [2000, 2003],
    step: 1,
    connect: true,
    tooltips: [wNumb({mark: '.', decimals: 0}), wNumb({mark: '.', decimals: 0})],
    range: {
        'min': 2000,
        'max': lastYear
    },
    behaviour: "tap-drag"
  });
  yearSlider.noUiSlider.on('update', sliderUpdate);
}
*/

function sliderUpdate () {
  if (currentYearMax == lastYear) {
    d3.select('#play-pause-button').classed('play', false);
    d3.select('#play-pause-button').classed('pause', false);
    d3.select('#play-pause-button').classed('stop', true);
  } else {
    if (!running) {
      d3.select('#play-pause-button').classed('play', true);
      d3.select('#play-pause-button').classed('pause', false);
      d3.select('#play-pause-button').classed('stop', false);
    } else {
      d3.select('#play-pause-button').classed('play', false);
      d3.select('#play-pause-button').classed('pause', true);
      d3.select('#play-pause-button').classed('stop', false);
    }
  } 
}

function activeMapSetup() {
    activeMapYearsArr = Object.keys(data.activeMap);
    lastYear = parseInt(activeMapYearsArr[activeMapYearsArr.length-1]);
    
    const margin = {top: 60, right: 180, bottom: 40, left: 30};
      let w = 1000 - margin.left - margin.right;
      let h = 800 - margin.top - margin.bottom;
    
    let graph = d3.select('#direct-comparison-graph')
      .append('svg')
        .attr('width', w + margin.left + margin.right)
        .attr('height', h + margin.top + margin.bottom)
        .style('opacity', 1)
    
    let mContainer = appendGroupTo('mContainer', graph)
    
    // Chart branch
    let chart = appendGroupTo('chart', mContainer);
    // Data container
    let dataCont = appendGroupTo('dataCont', chart);
      // indivdual structure per country defined later
    // Axes
    let axes = appendGroupTo('axes', chart);
    
    // Modal branch
    let modal = appendGroupTo('modal', mContainer);
    mContainer.attr('transform', `translate(${margin.left}, ${h+margin.top})`)
    
    let createAxes = () => {
    
    // Remove those to general later
    let xAxisCont = appendGroupTo('xAxisCont', axes);
    let yAxisCont = appendGroupTo('yAxisCont', axes);
    // console.log(new Date(data[0][0]))
    
    // https://stackoverflow.com/questions/3674539/incrementing-a-date-in-javascript
    // https://stackoverflow.com/questions/36561064/last-tick-not-being-displayed-in-d3-charts
    
    xScaleActiveMap = d3.scaleLinear()
      .domain([0, xAxisMax])
      .range([0, w])
    xAxis = d3.axisBottom(xScaleActiveMap)
    
    xAxisCont.append("g").attr('class', 'axis')
      .call(xAxis.ticks(5));
    
    // var max = d3.max(data.map(x => parseFloat(x[1])));
    yScaleActiveMap = d3.scaleLinear()
    .domain([0, 100])
    .range([0, -h])
    
    // Adjust to specific scale
    yAxis = d3.axisLeft(yScaleActiveMap)
    yAxisCont.append("g").attr('class', 'axis')
      .call(yAxis.ticks(5));
      
    xAxisCont.selectAll('.tick')
    .filter(function(d, i,list) {
      return i === list.length - 1;
    })
    .select('text')
    .style('font-weight','bold')
    .style('font-size','12px');
    
    // https://bl.ocks.org/d3noob/23e42c8f67210ac6c678db2cd07a747e
    yAxisCont.append("text").attr('class', 'label')
      .attr("transform",
            "translate(" + (w + 30) + " ," +
                           (margin.bottom - 80) + ")")
      .style("text-anchor", "left")
        .append('tspan')
          .attr('x', '0')
          .attr('dy', '0.6em')
          .text("Access to clean fuels")
        .append('tspan')
          .attr('x', '0')
          .attr('dy', '1.2em')
          .text("and cooking technologies")
        .append('tspan')
          .attr('x', '0')
          .attr('dy', '1.2em')
          .text("(% of population)")
    
    xAxisCont.append("text").attr('class', 'label')
      .attr("y", `${-h - 30}`)
      .attr("x", `${0}`)
      .text(`${'Poverty headcount ratio at $1.90 a day (2011 PPP) (% of population)'}`);
  }
  createAxes()
  // createYearSlider();
}
function test() {
  // data.aacc[0].currentYear.push(data.aacc[0].years[0]);
}


function getAndDrawNextDataPoint() {
// Handle the changing, pushing and counting: 
  if (dataPointCounter < data.aacc[countryCounter].years.length) {
    data.aaccSeq[countryCounter].push(data.aacc[countryCounter].years[dataPointCounter])
    dataPointCounter++;
  } else {
    countryCounter++;
    dataPointCounter = 0;
    data.aaccSeq.push([data.aacc[countryCounter].years[dataPointCounter]])
  }
    
  let countries = d3.select('#direct-comparison-graph')
    .select('#dataCont')
    .selectAll('g')
    .data(data.aaccSeq, function(d, i) { 
      return d[d.length-1].iso
    })
    
  
  countries.enter()
   .append('g')
    .attr('class', function(d) {
      // console.log(d[d.length-1].iso)
      return d[d.length-1].iso
    })
    .classed('country', true)
    .classed('deact', false)
    .on("mouseenter", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseout)
    .on("click", clickToDash)
    .each(function(p, j) {
      
      // Circles
      // console.log(p)
      d3.select(this)
        .selectAll("circle")
        .data(p, function(d, i) {
          //console.log(d)
          return d.iso
        })
        .enter()
        .append('circle')
        .attr('class', function(d) {
            return d.iso
        })
        .style('opacity', '0')
        .attr('r', initialCircleRadius)
        .attr("cx", function(d) {
          // console.log(d)
          return xScaleActiveMap(d.cleanfuels);
        })
        .attr("cy", function(d) { 
          return yScaleActiveMap(d.poverty); 
        })
        .attr('fill', 'rgb(252, 195, 11)')
        .attr("year", function(d) {
          return `${d.year}`
        })
        .attr("poverty", function(d) {
          return `${d.poverty}`
        })
        .attr("cleanfuels", function(d) {
          return `${d.cleanfuels}`
        })
        .attr("population", function(d) {
          return `${d.population}`
        })
        .attr("gdp", function(d) {
          return `${d.gdp}`
        })
        .attr("lifeexp", function(d) {
          return `${d.lifeexp}`
        })
        .transition().duration(pointTimer)
        .style('opacity', '1');
      
      // Text
      d3.select(this)
        .selectAll("text")
        .data(p, function(d, i) {
          //console.log(d)
          return d.iso
        })
        .enter()
        .append('text')
        .style('opacity', '0')
        .attr('x', function(d) {
          // console.log(d);
          xText = xScaleActiveMap(d.cleanfuels)+distanceFromCircle;
          // console.log(xText);
          return xText;
        })
        .attr('y', function(d) {
          yText = yScaleActiveMap(d.poverty)+distanceFromCircle;
          return yText;
        })
        .attr('transform', (d,i) => {
          let a = myDegrees;
          let x = xText;
          let y = yText;
          return `rotate(${a}, ${x}, ${y})`; //translate(${-width/2+barWidth/2},0)
        })
        .attr("year", function(d) {
          return `${d.year}`
        })
        .attr("poverty", function(d) {
          return `${d.poverty}`
        })
        .attr("cleanfuels", function(d) {
          return `${d.cleanfuels}`
        })
        .text(function(d) { return d.country; })
          .transition().duration(pointTimer)
          .style('opacity', '1')
          
    })
    
    if (data.aaccSeq[countryCounter].length >= 2) {
    // console.log('line should appear')
    let countryLine = d3.line()
      .x(function(d) { 
        // console.log(d.cleanfuels)
        return xScaleActiveMap(d.cleanfuels); })
      .y(function(d) { 
        // console.log(d.poverty)
        return yScaleActiveMap(d.poverty); });
        
      //console.log(data.aaccSeq[countryCounter][0].iso)
    let pathselection = d3.select(`.${data.aaccSeq[countryCounter][0].iso}`)
      .selectAll('path')
      .data(data.aaccSeq[countryCounter])
      .enter() // ------ ENTER

    // console.log(pathselection);
    let path = pathselection  
      .insert('path',"circle")
        .attr("d", countryLine(data.aaccSeq[countryCounter]))
        .attr('stroke', '#333')
        .attr('stroke-width', 1)
        .attr('fill', 'none')
    // console.log(path)
    // console.log(currentCountryName, path.node())
    
    var totalLength = path.node().getTotalLength();
    // ----- PATH UPDATEE
    path.attr("stroke-dasharray", totalLength + " " + totalLength)
       .attr("stroke-dashoffset", totalLength)
       .transition()
       .duration(pointTimer)
       .attr("stroke-dashoffset", 0);
  }
     
    //----------------- enter
    countries.classed('deact', true);
    d3.select(`.${data.aaccSeq[countryCounter][0].iso}`).classed('deact', false);
    //----------------- UPDATE
    
    countries.each(function(p, j) {
      //console.log(p[p.length-1])
      d3.select(this)
        .selectAll("circle")
        .data([p[p.length-1]], function(d, i) {
          // console.log(d)
          return d.iso
        })
        .attr("year", function(d) {
          return `${d.year}`
        })
        .attr("poverty", function(d) {
          return `${d.poverty}`
        })
        .attr("cleanfuels", function(d) {
          return `${d.cleanfuels}`
        })
        .attr("population", function(d) {
          return `${d.population}`
        })
        .attr("gdp", function(d) {
          return `${d.gdp}`
        })
        .attr("lifeexp", function(d) {
          return `${d.lifeexp}`
        })
        .transition()
        .duration(pointTimer)
        .attr('r', getRadius)
        .attr("cx", function(d) {
          return xScaleActiveMap(d.cleanfuels);
        })
        .attr("cy", function(d) { 
          return yScaleActiveMap(d.poverty); 
        })
        .attr('fill', 'rgb(0, 0, 0)')
        
    
    
      d3.select(this)
        .selectAll('text')
        .data([p[p.length-1]], function(d, i) {
          // console.log(d)
          return d.iso
        })
        .transition()
        .duration(pointTimer)
        .attr('x', function(d) {
          // console.log(d);
          xText = xScaleActiveMap(d.cleanfuels)+distanceFromCircle;
          // console.log(xText);
          return xText;
        })
        .attr('y', function(d) {
          yText = yScaleActiveMap(d.poverty)+distanceFromCircle;
          return yText;
        })
        .attr('transform', (d,i) => {
          let a = myDegrees;
          let x = xText;
          let y = yText;
          return `rotate(${a}, ${x}, ${y})`; //translate(${-width/2+barWidth/2},0)
        })
  })
}

function myZoomButton() {
  if (xAxisMax == 100) {
    scaleXAxis(4);
    d3.select('#zoom-icon').select('i').classed('minus', true);
    d3.select('#zoom-icon').select('i').classed('plus', false);
  } else {
    scaleXAxis(100);
    d3.select('#zoom-icon').select('i').classed('minus', false);
    d3.select('#zoom-icon').select('i').classed('plus', true);
  }
}

function scaleXAxis(value) {
  xAxisMax = value;
  xScaleActiveMap.domain([0, xAxisMax]);
  d3.select('#direct-comparison-graph').select("#xAxisCont").select('.axis')
    .transition().duration(xAxisTimer)
      .call(xAxis);
  xAxisReScale();
}

function xAxisReScale() {
  let countryGroups = d3.select('#direct-comparison-graph')
    .select('#dataCont')
    .selectAll('g')
    .data(data.aaccSeq);
    
    //console.log(countryGroups)
    
  countryGroups.each(function(p, j) {
    // console.log(this)
     d3.select(this)
        .selectAll("circle")
        .data([p[p.length-1]], function(d, i) {
          //console.log(d)
          return d.iso
        })
        .transition().duration(xAxisTimer)
        .attr("cx", function(d) { 
          return xScaleActiveMap(d.cleanfuels); 
        });
      
    d3.select(this)
      .selectAll('text')
      .data([p[p.length-1]], function(d, i) {
          return d.iso
      })
      .transition()
      .duration(xAxisTimer)
      .attr('x', function(d) {
            // console.log(d);
            xText = xScaleActiveMap(d.cleanfuels)+distanceFromCircle;
            // console.log(xText);
            return xText;
          })
      .attr('y', function(d) {
        yText = yScaleActiveMap(d.poverty)+distanceFromCircle;
        return yText;
      })
      .attr('transform', (d,i) => {
        let a = myDegrees;
        let x = xText;
        let y = yText;
        return `rotate(${a}, ${x}, ${y})`; //translate(${-width/2+barWidth/2},0)
      })
    })
    
    let countryLines = d3.select('#direct-comparison-graph')
    .select('#dataCont')
    .selectAll('g')
    .data(data.aaccSeq);
    
    let countryLine = d3.line() 
      .x(function(d) { 
        return xScaleActiveMap(d.cleanfuels); })
      .y(function(d) { 
        return yScaleActiveMap(d.poverty); });
    
    countryLines.each(function(p, j) {
      d3.select(this)
        .selectAll('path')
        .data(p)
        .transition().duration(xAxisTimer)
        .attr("d", countryLine(p))
    })
    
}

// -------------------- TOOLTIPS

var tooltip = d3.select("#active-map")
    .append("div")
      .attr("class", "my-tooltip")
      .style("opacity", 0);

function mouseover(d){
  tooltip.transition()
    .duration(200)
    .style("opacity", .9);
}

function mousemove(d){
  let years;
    if (d[0].year == d[d.length-1].year) {
      years = d[d.length-1].year
    } else {
      years = `${d[0].year} – ${d[d.length-1].year}`;
    }
    // console.log(d);
    d3.select(this).classed('deact', false).raise()
    // Data – DOM does get out of sync. Observe that. https://stackoverflow.com/questions/14167863/how-can-i-bring-a-circle-to-the-front-with-d3
    // .raise();
    tooltip.html(`Country: <span class='em'>${d[d.length-1].country}</span> <br /> Year(s): <span class='em'>${years}</span> <br /> Poverty Headcount Ratio: <span class='em'>${d[d.length-1].poverty}</span> %<br /> Access to Clean Fuels: <span class='spot em'>${d[d.length-1].cleanfuels} %`)
      .style("left", (d3.event.pageX + 50) + "px")
      .style("top", (d3.event.pageY - 50) + "px");
}

function mouseout(d){
    d3.select('#direct-comparison-graph')
    .select('#dataCont')
    .selectAll('g')
    .data(data.aaccSeq, function(d, i) { 
      return d[d.length-1].iso
    })
    .order();
    
    d3.select(this).classed('deact', true);
    tooltip.transition()
      .duration(500)
      .style("opacity", 0);
}

// -------------------- tooltips

// -------------------- CLICK

function clickToDash (d) {
  selectCountry(d[0].country);
  document.querySelector('#holistic').scrollIntoView({
          block: 'start',
          behavior: 'smooth'
      });
  //window.location.href = '#holistic';
  
}

// -------------------- click

// -- Utility functions

let appendGroupTo = (name, appendTo) => {
      return appendTo
        .append('g')
          .attr('id', name)
    }
    
let appendGroupClassTo = (name, appendTo) => {
return appendTo
  .append('g')
    .attr('class', name)
}

function myStartFunction() {
  // console.log('called start')
  if (countryCounter == 49) {
    console.log('This is the end')
    clearInterval(myVar);
    running = false;
    // 
    d3.select('#direct-comparison-graph').select('#dataCont').select('.TUN').select('circle').attr('fill', 'rgb(0, 0, 0)').attr('r', getRadius);
    //
    d3.select('#play-pause-button').classed('play', false);
    d3.select('#play-pause-button').classed('pause', false);
    d3.select('#play-pause-button').classed('stop', true);
    // d3.select('#active-map-slider').classed('grayed-out', false);
  } else {
    if (!running) {
      running = true;
      d3.select('#play-pause-button').classed('play', false);
      d3.select('#play-pause-button').classed('pause', true);
      d3.select('#play-pause-button').classed('stop', false);
      // d3.select('#active-map-slider').classed('grayed-out', true);
      myVar = setInterval(myTimer, countryTimer);
    } else {
      running = false;
      clearInterval(myVar);
      d3.select('#play-pause-button').classed('play', true);
      d3.select('#play-pause-button').classed('pause', false);
      d3.select('#play-pause-button').classed('stop', false);
      d3.select('#active-map-slider').classed('grayed-out', false);
    }
  }
}

function myTimer() {
  if (countryCounter == 49) {
    myStartFunction();
  } else {
    // console.log('yes');  
    // yearSlider.noUiSlider.set([null, currentYearMax + 1]);
    if (!changedScale) {
      if (countryCounter >= 20) {
        changedScale = true; 
        if (xAxisMax < 100) {
          myStartFunction();
          scaleXAxis(100);
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
  if (!running) {
    d3.select('#play-pause-button').classed('play', true);
    d3.select('#play-pause-button').classed('pause', false);
    d3.select('#play-pause-button').classed('stop', false);
  } else {
    d3.select('#play-pause-button').classed('play', false);
    d3.select('#play-pause-button').classed('pause', true);
    d3.select('#play-pause-button').classed('stop', false);
  }
  data['aaccSeq'] = [[]];
  countryCounter = 0;
  dataPointCounter = 0;
  let countryGroups = d3.select('#direct-comparison-graph').select('#dataCont').selectAll('g');
  countryGroups.transition().duration(1000).style('opacity', 0);
  countryGroups.transition().delay(1000).remove();
}


$(function () {
  $('[data-toggle="tooltip"]').tooltip()
})
// Add the hovers
d3.select('#showPopulation').on('mouseenter', showPop)
d3.select('#showPopulation').on('mouseleave', backToNormal)
d3.select('#showGDP').on('mouseenter', showGDP)
d3.select('#showGDP').on('mouseleave', backToNormal)
d3.select('#showLifeExp').on('mouseenter', showLifeExp)
d3.select('#showLifeExp').on('mouseleave', backToNormal)

function resetHoverStates() {
   for (var state in hoverStates) {
    hoverStates[state] = false;
  }
  // console.log(hoverStates)
}

let hoverStates = {
  'normal': true,
  'population': false,
  'gdp': false,
  'lifeexp': false
}

function backToNormal(d) {
  resetHoverStates();
  hoverStates.normal = true; 
  d3.select('#direct-comparison-graph').select('#dataCont').selectAll('g').classed('deact', true)
  d3.select('#direct-comparison-graph').select('#dataCont').selectAll('path').style('stroke', null)
  d3.select('#direct-comparison-graph').selectAll('circle').attr('r', getRadius).style('opacity', null)
}

function getRadius(d, i) {
  //console.log(hoverStates)
  if (hoverStates.normal == true) {
    return regularCircleSize;
  } else if (hoverStates.population == true) {
    if (!isNaN(d3.select(this).attr('population'))) {
      return Math.sqrt(d3.select(this).attr('population')*0.00001);
    } else {
      return 1;
    }
  } else if (hoverStates.gdp == true) {
    if (!isNaN(d3.select(this).attr('gdp'))) {
      return Math.sqrt(d3.select(this).attr('gdp')*0.1);
    } else {
      return  1;
    }
  }
  else if (hoverStates.lifeexp == true) {
    if (!isNaN(d3.select(this).attr('lifeexp'))) {
      return Math.sqrt(d3.select(this).attr('lifeexp')*2);
    } else {
      return 1;
    }
  }
}

function showPop() {
  resetHoverStates();
  hoverStates.population = true;
  adjustView();
}

function showGDP() {
  resetHoverStates();
  hoverStates.gdp = true;
  adjustView();
}

function showLifeExp() {
  resetHoverStates();
  hoverStates.lifeexp = true;
  adjustView();
}



function adjustView() {
  d3.select('#direct-comparison-graph').select('#dataCont').selectAll('g').classed('deact', false)
  
  d3.select('#direct-comparison-graph').selectAll('circle').attr('r', getRadius)
  
  if (!running) {
    d3.select('#direct-comparison-graph').selectAll('circle').style('opacity', 0.4)
    d3.select('#direct-comparison-graph').select('#dataCont').selectAll('path').style('stroke', '#eee').style('opacity', 0.4)
  }
}

