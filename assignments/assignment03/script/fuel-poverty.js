/* global d3 */
let xScaleActiveMap, yScaleActiveMap;

function activeMapSetup() {
    
    
    const margin = {top: 40, right: 40, bottom: 40, left: 40};
      let w = 1200 - margin.left - margin.right;
      let h = 800 - margin.top - margin.bottom;
    
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
    
    
    
    let xAxis, yAxis;
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
    .domain([0, 100])
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
            "translate(" + (w + 20) + " ," +
                           (margin.bottom - 50) + ")")
      .style("text-anchor", "middle")
      .text("Poverty");
    
    yAxisCont.append("text").attr('class', 'label')
      .attr("y", `${-h - 10}`)
      .attr("x", `${0}`)
      .text(`${'Access to clean fuels'}`);
  }
  createAxes()
  

  // g Container for each country!
  /*
  let yearCont = dataCont.append('g')
      .attr('id', year)
      .attr('class', 'yearCont');
  let scatterplotCont = appendGroupClassTo('scatterplotCont', yearCont);
  let lineCont = appendGroupClassTo('lineCont', dataCont);
  */
  
  // Do something with color here
        
  
}
/*
updateDataActiveMap = (year) => {
  


  const myData = data.activeMap[year];
  console.log('myData')
  
  let myColor = d3.rgb(0,0,0);
  
  let yearCont = d3.select('#active-map-graph').select('#dataCont').append('g')
      .attr('id', year)
      .attr('class', 'yearCont');
  let scatterplotCont = appendGroupClassTo('scatterplotCont', yearCont);
  
  scatterplotCont.selectAll("circle")
      .data(myData)
      .enter()
      .append("circle")
        .attr("r", 2.5)
        .attr("cx", function(d) {
          return xScaleActiveMap(d[1]);
        })
        .attr("cy", function(d) { 
          return yScaleActiveMap(d[2]); 
        })
        .attr('fill', myColor)
        .attr("class", function(d) {
          return `${d[0]}`
        })
        
}
*/

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
    .attr('stroke', myColor)
    .attr('stroke-width', 2)
    .attr('fill', 'none')
    
  lineCont.append("circle")
      .attr("r", 2.5)
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
  lineCont.append("text")
    .text(`${country}`)
    .attr("x", function() {
        return xScaleActiveMap(myData[myData.length-1][1]);
      })
      .attr("y", function(d) { 
        return yScaleActiveMap(myData[myData.length-1][2]); 
      })
}

let yearSlider = document.getElementById('active-map-slider');
noUiSlider.create(yearSlider, {
  start: [2000, 2003],
  step: 1,
  connect: true,
  tooltips: [wNumb({mark: '.', decimals: 0}), wNumb({mark: '.', decimals: 0})],
  range: {
      'min': 2000,
      'max': 2017
  },
  behaviour: "tap-drag"
});
yearSlider.noUiSlider.on('update', activeMapUpdate);

function activeMapUpdate() {
    d3.select('#active-map-graph').selectAll('.lineCont').remove();
    currentYearMin = yearSlider.noUiSlider.get()[0];
    currentYearMax = yearSlider.noUiSlider.get()[1];
    updateYearFilter();
    for (var country in data.activeMapByCountryFiltered) {
      updateLineActiveMap(country);
    }
  }

/*
let myVar;
let currentYear = 2000;

function myStartFunction() {
  myVar = setInterval(myTimer, 1000);
}

function myTimer() {
  console.log('yes');  
  updateDataActiveMap(currentYear);
  currentYear++;
}

function myStopFunction() {
    clearInterval(myVar);
}
*/
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