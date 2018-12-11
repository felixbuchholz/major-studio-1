/* global d3 */
/* global data */
let xScaleActiveMap, yScaleActiveMap, xAxis, yAxis;
let yearSlider, activeMapYearsArr, lastYear;
let yAxisMax = 4;
let pointTimer = 350; // good choice: 350
let countryTimer = 420; // good choice: 420
let yAxisTimer = 1000;
let distanceFromCircle = 6;



function scaleYAxis(value) {
  yAxisMax = value;
  yScaleActiveMap.domain([0, yAxisMax]);
  d3.select('#active-map-graph').select("#yAxisCont").select('.axis')
    .transition().duration(yAxisTimer)
      .call(yAxis);
  yAxisReScale();
}

function activeMapSetup() {
    activeMapYearsArr = Object.keys(data.activeMap);
    lastYear = parseInt(activeMapYearsArr[activeMapYearsArr.length-1]);
    
    const margin = {top: 60, right: 180, bottom: 40, left: 30};
      let w = 1200 - margin.left - margin.right;
      let h = 700 - margin.top - margin.bottom;
    
    let graph = d3.select('#active-map-graph')
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
      .domain([0, 100])
      .range([0, w])
    xAxis = d3.axisBottom(xScaleActiveMap)
    
    xAxisCont.append("g").attr('class', 'axis')
      .call(xAxis.ticks(5));
    
    // var max = d3.max(data.map(x => parseFloat(x[1])));
    yScaleActiveMap = d3.scaleLinear()
    .domain([0, yAxisMax])
    .range([0, -h])
    
    // Adjust to specific scale
    yAxis = d3.axisLeft(yScaleActiveMap)
    yAxisCont.append("g").attr('class', 'axis')
      .call(yAxis.ticks(5));
      
    yAxisCont.selectAll('.tick')
    .filter(function(d, i,list) {
      return i === list.length - 1;
    })
    .select('text')
    .style('font-weight','bold')
    .style('font-size','12px');
    
    // https://bl.ocks.org/d3noob/23e42c8f67210ac6c678db2cd07a747e
    xAxisCont.append("text").attr('class', 'label')
      .attr("transform",
            "translate(" + (w + 30) + " ," +
                           (margin.bottom - 80) + ")")
      .style("text-anchor", "left")
        .append('tspan')
          .attr('x', '0')
          .attr('dy', '0.6em')
          .text("Poverty headcount ratio")
        .append('tspan')
          .attr('x', '0')
          .attr('dy', '1.2em')
          .text("at $1.90 a day (2011 PPP)")
        .append('tspan')
          .attr('x', '0')
          .attr('dy', '1.2em')
          .text("(% of population)")
    
    yAxisCont.append("text").attr('class', 'label')
      .attr("y", `${-h - 30}`)
      .attr("x", `${0}`)
      .text(`${'Access to clean fuels and technologies for cooking (% of population)'}`);
  }
  createAxes()
  
  createYearSlider();
  
}


updateLineActiveMap = (country) => {
  // console.log(country);
  
  let dataCont = d3.select('#active-map-graph').select('#dataCont');
  let lineCont = appendGroupClassTo('lineCont', dataCont);
  
  const myData = data.activeMapByCountryFiltered[country];
  
  let myColor = d3.rgb(0,0,0);
  
   let valueline = d3.line()
    .x(function(d) { return xScaleActiveMap(d[1]); })
    .y(function(d) { return yScaleActiveMap(d[2]); });

  lineCont.append("path")
    .attr("class", "dataLine")
    .attr("class", function(d) {
      return `line-${country}`
    })
    .attr("d", valueline(myData))
    .attr('stroke', '#888')
    .attr('stroke-width', 0.5)
    .attr('fill', 'none')
    
  lineCont.append("circle")
      .attr("r", 2.5)
      // .transition().duration(200) // if circle already available: select & move, else: transition form origin. When data is not matching current year: add * 
      .attr("cx", function() {
        return xScaleActiveMap(myData[myData.length-1][1]);
      })
      .attr("cy", function(d) { 
        return yScaleActiveMap(myData[myData.length-1][2]); 
      })
      .attr('fill', myColor)
      .attr("class", function() {
        return `${myData[0][0]}`
      })
  
  let textX = xScaleActiveMap(myData[myData.length-1][1])+5;
  let textY = yScaleActiveMap(myData[myData.length-1][2])+1;
  lineCont.append("text")
    .text(`${country}`)
      .attr("x", function() {
          return textX;
      })
      .attr("y", function(d) { 
          return textY; 
      })
      .attr('transform', (d,i) => {
      let a = -20;
      let x = textX;
      let y = textY;
      return `rotate(${a}, ${x}, ${y})`; //translate(${-width/2+barWidth/2},0)
      })
}

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
  activeMapUpdate();
}

let countryCounter = 0;
let dataPointCounter = 0;
let allCountryNames, currentCountryName, currentCountryData;
let dataCont, countryCont; 
let xText, yText;

function getNextCountryAndData() {
  // console.log(countryCounter);
  
  let allCountryValues = Object.values(data.activeMapByCountry);
  allCountryValues = allCountryValues.map((x) => {
    let maxAccess = d3.max(x.map(y => parseFloat(y[2])));
    let resArr = [maxAccess, x[0][3]];
    return resArr;
  })
  allCountryValues.sort(function(a, b) {
  if (a[0] < b[0]) {
    return -1;
  }
  if (a[0] > b[0]) {
    return 1;
  }
  
  return 0;
  })
  
  //console.log(allCountryValues)
  
  allCountryNames = allCountryValues.map(x => x[1]);
  allCountryNames = allCountryNames.filter(x => x != 'Ghana')
  
  // console.log(allCountryNames)
  currentCountryName = allCountryNames[countryCounter];
  currentCountryData = data.activeMapByCountry[currentCountryName]; 
  //console.log(currentCountryName, data.activeMapByCountry[currentCountryName]);
  data.activeMapSequence.push(currentCountryData);
  //dataCont = d3.select('#active-map-graph').select('#dataCont');
  //countryCont = dataCont.append('g').class('country').attr('id', `${currentCountryName}`)
  // countryCont.append('circle')
  data.activeMapSequencePoints.push([currentCountryData[0]])
  data.activeMapSequenceLines.push([currentCountryData[0]])
  //countryCounter++;
  dataPointCounter = 0;
  //console.log(countryCounter, data.activeMapSequencePoints);
} 

// -------------------- TOOLTIPS

var tooltip = d3.select("#active-map")
    .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

function mouseover(d){
  tooltip.transition()
    .duration(200)
    .style("opacity", .9);
}

function mousemove(d){
    // console.log(this);
    d3.select(this).classed('deact', false)
    // Data – DOM does get out of sync. Observe that. https://stackoverflow.com/questions/14167863/how-can-i-bring-a-circle-to-the-front-with-d3
    // .raise();
    tooltip.html(`Country: <span class='em'>${d[3]}</span> <br /> Year: <span class='em'>${d[0]}</span> <br /> Poverty Headcount Ratio: <span class='em'>${parseFloat(d[1]).toFixed(1)}</span> %<br /> Access to Clean Fuels: <span class='spot em'>${parseFloat(d[2]).toFixed(1)} %`)
      .style("left", (d3.event.pageX + 50) + "px")
      .style("top", (d3.event.pageY - 50) + "px");
}

function mouseout(d){
    d3.select(this).classed('deact', true);
    tooltip.transition()
      .duration(500)
      .style("opacity", 0);
}

// -------------------- tooltips

// -------------------- CLICK

function clickToDash (d) {
  selectCountry(d[3]);
  document.querySelector('#holistic').scrollIntoView({
          block: 'start',
          behavior: 'smooth'
      });
  //window.location.href = '#holistic';
  
}

// -------------------- click



function getAndDrawNextDataPoint() {
  
  if (countryCounter == 0 && dataPointCounter == 0) {
    getNextCountryAndData();
  }
  if (dataPointCounter == 0) {
    yearSlider.noUiSlider.set([data.activeMapSequencePoints[countryCounter][0][0], data.activeMapSequencePoints[countryCounter][0][0]]);
  }
  yearSlider.noUiSlider.set([null, data.activeMapSequencePoints[countryCounter][0][0]]);
  
  // enter, update, exit
  let countries = d3.select('#active-map')
    .select('#dataCont')
    .selectAll('g')
    .data(data.activeMapSequencePoints);
  //console.log(countries)
  
  
  // ----------------------------------------- ENTER --------------------------
  countries.enter()
    .append('g')
    .classed('deact', false)
    .classed('country', true)
    .attr('id', `${currentCountryName.split(' ').join('')}`)
    .each(function(p, j) {
      // console.log(p)
      d3.select(this)
        .selectAll("circle")
        .data(p)
        .enter()
        .append('circle')
        .style('opacity', '0')
        .attr("r", 6)
        .attr("cx", function(d) {
          //console.log(d)
          return xScaleActiveMap(parseFloat(d[1]));
        })
        .attr("cy", function(d) { 
          return yScaleActiveMap(parseFloat(d[2])); 
        })
        .attr('fill', 'rgb(252, 195, 11)')
        .attr("year", function(d) {
          return `${d[0]}`
        })
        .transition().duration(pointTimer)
        .style('opacity', '1');
        
        // console.log(d3.select(this))

        d3.select(this)
          .selectAll("text")
          .data(p)
          .enter()
          .append('text')
          // .style('font-size', '15px')
          // .style('fill', 'rgb(252, 195, 11)')
          .style('opacity', '0')
          .attr('x', function(d) {
            // console.log(d);
            xText = xScaleActiveMap(parseFloat(d[1]))+distanceFromCircle;
            // console.log(xText);
            return xText;
          })
          .attr('y', function(d) {
            yText = yScaleActiveMap(parseFloat(d[2]))+distanceFromCircle;
            return yText;
          })
          .attr('transform', (d,i) => {
            let a = -20;
            let x = xText;
            let y = yText;
            return `rotate(${a}, ${x}, ${y})`; //translate(${-width/2+barWidth/2},0)
          })
          .text(function(d) { return d[3]; })
            .transition().duration(pointTimer)
            .style('opacity', '1')
        
    }); // if circle already available: select & move, else: transition form origin. When data is not matching current year: add * 
  
   
  // console.log(data.activeMapSequenceLines[countryCounter].length)
  if (data.activeMapSequenceLines[countryCounter].length >= 2) {
    // console.log('line should appear')
    let countryLine = d3.line() //.curve(d3.curveCatmullRom.alpha(0.5))
      // .curveNatural(d3.curveNatural)
      .x(function(d) { 
        // console.log(parseFloat(d[1]))
        return xScaleActiveMap(parseFloat(d[1])); })
      .y(function(d) { 
        // console.log(parseFloat(d[2]))
        return yScaleActiveMap(parseFloat(d[2])); });
      
    let pathselection = d3.select(`#${currentCountryName.split(' ').join('')}`)
      .selectAll('path')
      .data(data.activeMapSequenceLines[countryCounter])
      .enter() // ------ ENTER
      
      // console.log(pathselection);
    let path = pathselection  
      .insert('path',"circle")
        .attr("d", countryLine(data.activeMapSequenceLines[countryCounter]))
        .attr('stroke', '#000')
        .attr('stroke-width', 0.5)
        .attr('fill', 'none')
    // console.log(path)
    // console.log(currentCountryName, path.node())
    
    var totalLength = path.node().getTotalLength();
    
    path.attr("stroke-dasharray", totalLength + " " + totalLength)
       .attr("stroke-dashoffset", totalLength)
       .transition()
       .duration(pointTimer)
       .attr("stroke-dashoffset", 0);
  }
  // ----------------------------- enter
  countries.classed('deact', true)
  d3.select(`#${currentCountryName.split(' ').join('')}`).classed('deact', false)

 // ----------------------------- UPDATE
    countries.each(function(p, j) {
     d3.select(this)
     //d3.select(`#${currentCountryName.split(' ').join('')}`)
        .selectAll("circle")
        .data(p)
        //.data(data.activeMapSequencePoints[countryCounter])
        .transition()
        .duration(pointTimer)
        .attr('r', '2.5')
        .attr("cx", function(d) {
          // console.log(parseFloat(d[1]))
          return xScaleActiveMap(parseFloat(d[1]));
        })
        .attr("cy", function(d) { 
          // console.log(parseFloat(d[2]))
          return yScaleActiveMap(parseFloat(d[2])); 
        })
        .attr('fill', 'rgb(0, 0, 0)')
        .attr("year", function(d) {
          return `${d[0]}`
        })
    
    d3.select(this)
          .data(p)
          .on("mouseenter", mouseover)
          .on("mousemove", mousemove)
          .on("mouseleave", mouseout)
          .on("click", clickToDash);
        
    d3.select(this)
      .selectAll('text')
      .data(p)
      .transition()
      .duration(pointTimer)
      .attr('x', function(d) {
            // console.log(d);
            xText = xScaleActiveMap(parseFloat(d[1]))+distanceFromCircle;
            // console.log(xText);
            return xText;
          })
      .attr('y', function(d) {
        yText = yScaleActiveMap(parseFloat(d[2]))+distanceFromCircle;
        return yText;
      })
      .attr('transform', (d,i) => {
        let a = -20;
        let x = xText;
        let y = yText;
        return `rotate(${a}, ${x}, ${y})`; //translate(${-width/2+barWidth/2},0)
      })
      
  })

  
  if (dataPointCounter < data.activeMapSequence[countryCounter].length-1) {
      dataPointCounter++;
      // console.log(data.activeMapSequence[countryCounter].length, dataPointCounter);
      //console.log(data.activeMapSequence[countryCounter][dataPointCounter])
      data.activeMapSequencePoints[countryCounter] = [data.activeMapSequence[countryCounter][dataPointCounter]];
      data.activeMapSequenceLines[countryCounter].push(data.activeMapSequence[countryCounter][dataPointCounter]);
  } else {
      // console.log('happened')
      countryCounter++;
      getNextCountryAndData();
  }
  
  // console.log(data.activeMapSequencePoints[countryCounter])
  // console.log(currentCountryData[dataPointCounter])
  // countryCont.select('circle').data([currentCountryData[dataPointCounter]])
  
}

// Add the country name to your array!
// Add the country to an array that always holds the current state. 
// Whenever a new country enters the stage: set the slider-min to the min of the country.

// only available after the whole animation went through!

function yAxisReScale() {
  let countryPoints = d3.select('#active-map')
    .select('#dataCont')
    .selectAll('g')
    .data(data.activeMapSequencePoints);
    
    console.log(countryPoints)
    
  countryPoints.each(function(p, j) {
     d3.select(this)
     //d3.select(`#${currentCountryName.split(' ').join('')}`)
        .selectAll("circle")
        .data(p)
        //.data(data.activeMapSequencePoints[countryCounter])
        .transition().duration(yAxisTimer)
        .attr("cy", function(d) { 
          // console.log(parseFloat(d[2]))
          return yScaleActiveMap(parseFloat(d[2])); 
        });
      
    d3.select(this)
      .selectAll('text')
      .data(p)
      .transition()
      .duration(yAxisTimer)
      .attr('x', function(d) {
            // console.log(d);
            xText = xScaleActiveMap(parseFloat(d[1]))+distanceFromCircle;
            // console.log(xText);
            return xText;
          })
      .attr('y', function(d) {
        yText = yScaleActiveMap(parseFloat(d[2]))+distanceFromCircle;
        return yText;
      })
      .attr('transform', (d,i) => {
        let a = -20;
        let x = xText;
        let y = yText;
        return `rotate(${a}, ${x}, ${y})`; //translate(${-width/2+barWidth/2},0)
      })
    })
    
    let countryLines = d3.select('#active-map')
    .select('#dataCont')
    .selectAll('g')
    .data(data.activeMapSequenceLines);
    
    let countryLine = d3.line() //.curve(d3.curveCatmullRom.alpha(0.5))
      // .curveNatural(d3.curveNatural)
      .x(function(d) { 
        // console.log(parseFloat(d[1]))
        return xScaleActiveMap(parseFloat(d[1])); })
      .y(function(d) { 
        // console.log(parseFloat(d[2]))
        return yScaleActiveMap(parseFloat(d[2])); });
    
    countryLines.each(function(p, j) {
      d3.select(this)
        .selectAll('path')
        .data(p)
        .transition().duration(yAxisTimer)
        .attr("d", countryLine(p))
    })
    
}

function activeMapUpdate() {
  /*
  d3.select('#active-map-graph').selectAll('.lineCont').remove();
  currentYearMin = parseInt(yearSlider.noUiSlider.get()[0]);
  currentYearMax = parseInt(yearSlider.noUiSlider.get()[1]);
  updateYearFilter();
  for (var country in data.activeMapByCountryFiltered) {
    updateLineActiveMap(country);
  }
  if (currentYearMax == lastYear) {
    d3.select('#play-pause-button').classed('play', false);
    d3.select('#play-pause-button').classed('pause', false);
    d3.select('#play-pause-button').classed('stop', true);
  }
  */
}



function myStartFunction() {
  console.log('called start')
  if (countryCounter == 49) {
    clearInterval(myVar);
    running = false;
    d3.select('#play-pause-button').classed('play', false);
    d3.select('#play-pause-button').classed('pause', false);
    d3.select('#play-pause-button').classed('stop', true);
    d3.select('#active-map-slider').classed('grayed-out', false);
  } else {
    if (!running) {
      running = true;
      d3.select('#play-pause-button').classed('play', false);
      d3.select('#play-pause-button').classed('pause', true);
      d3.select('#play-pause-button').classed('stop', false);
      d3.select('#active-map-slider').classed('grayed-out', true);
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