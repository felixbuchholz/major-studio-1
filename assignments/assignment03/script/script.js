/*global d3*/
let selectedCountry = 'Ghana';
let selectedIndicator = 'poverty';
let menuOpen = true;

let data = {};


Promise.all([
  d3.json('data/geo/africa.geo.json'),
  d3.json('data/conversions/africaCountriesList.json'),
  d3.csv('data/hdi.csv'),
  d3.csv('data/gini.csv'),
  d3.csv('data/lifeexp.csv'),
  d3.csv('data/schoolyears.csv'),
  d3.csv('data/population.csv'),
  d3.csv('data/gdp.csv'),
  d3.csv('data/clean-fuels.csv'),
  d3.csv('data/deathrate.csv'),
  d3.csv('data/poverty-320.csv')
])
.then(([africaGeo, africaCountries, hdi, gini, lifeexp, schoolyears, population, gdp, cleanfuels, deathrate, poverty]) => {
  deathrate = translateOWIData(deathrate);
  data = {
    'africaGeo': africaGeo, 
    'africaCountries': africaCountries,
    'indicators': {
      'hdi': hdi, 
      'gini': gini, 
      'lifeexp': lifeexp, 
      'schoolyears': schoolyears, 
      'population': population, 
      'gdp': gdp, 
      'cleanfuels': cleanfuels, 
      'deathrate': deathrate, 
      'poverty': poverty
    }
  };
  console.log(data);
  
  // Functions
  selectCountry(selectedCountry);
  updateCountrySelectList();

 });
 
// https://stackoverflow.com/a/11764168
function chunk (arr, len) {

  var chunks = [],
      i = 0,
      n = arr.length;

  while (i < n) {
    chunks.push(arr.slice(i, i += len));
  }

  return chunks;
}


// FUNCTIONS
let myData = [selectedCountry];
let selectCountry = (countrySelection) => {
  selectedCountry = countrySelection;
  if (menuOpen == true) {
    openCloseMenu();
  }
  
  myData = [selectedCountry];
  updateMenuRow(myData);
  updateInfoRow();
  updateButtonRow();
  metaUpdateGraph('cleanfuels', 1);
  metaUpdateGraph(selectedIndicator);
};

let selectIndicator = (myIndicatorSelection) => {
  selectedIndicator = myIndicatorSelection;
  metaUpdateGraph(selectedIndicator);
}

let openCloseMenu = () => {
  if (menuOpen == true) {
    d3.select('#select-menu').style('display', 'none');
    menuOpen = false;
  } else {
    d3.select('#select-menu').style('display', 'block');
    menuOpen = true;
  }
}

let updateCountrySelectList = () => {
  // console.log(data.africaCountries)
  let u = d3.select('#select-list').selectAll('li').data(data.africaCountries);
  u.exit().remove();
  u.enter()
    .append('li')
    .attr('class', 'pointer')
    .text((d) => { return d[0] })
    .on('click', (d) => {
      selectCountry(d[0])
    })
}


let updateMenuRow = (myData) => {
  // console.log(myData)
  let u = d3.select('#name')
    .selectAll('.value')
    .data(myData);
    
    u.exit()
    .transition()
    .duration(200)
    .style("font-size", '0px')
    .remove();
    
    
  u.enter()
    .append('span')
    .merge(u)
    .style("opacity", '0')
    .transition()
    .duration(500)
    .style("opacity", '1')
    .text((d) => { 
    // console.log(d) 
    return d
    });
  
  // region
  const geoAfricaProperties = data.africaGeo.features.map(f => f.properties);
  const countryRegion = arrayPropertyHasValues(geoAfricaProperties, 'geounit', [selectedCountry]).subregion;
  d3.select('#region').selectAll('.value').html("").text(`${countryRegion}`);
}

let updateInfoRow = () => {
 for (var indicator in data.indicators) {
    updateInfo(indicator)
  }
}

let updateInfo = (indicator) => {
  const mydata = getIndicatorPair(indicator);
  // TODO: .enter()
  const myselect = d3.selectAll(`#${indicator}`)
  const year = myselect.selectAll('.year').data([mydata])
  const value = myselect.selectAll('.value').data([mydata])
  year.text((d) => { return d[0] })
  value.text((d) => { return d[1] })
}

let getIndicatorPair = (indicator) => {
  let mydata = [];
  // hdi
  if (indicator == 'hdi') {
    mydata = [2017, arrayPropertyHasValues(data.indicators.hdi, 'Country', [selectedCountry]).rank2017]
  } else { // ––– end hdi
    mydata = getDecadeUpperLimit(data.indicators[indicator])
  }
  mydata[1] = formatValues(mydata[1])
  return mydata;
}

let formatValues = (nStr) => {
  if (nStr != undefined) {
    // console.log(nStr.split('.')[1] != undefined);
  let res;
  if (nStr.split('.')[1] != undefined) {
    const decNums = nStr.split('.')[1].length
    if (decNums > 3) {
      res = parseFloat(nStr).toFixed(3)
    } else if (decNums <= 3  && decNums > 1) {
      res = parseFloat(nStr).toFixed(2)
    } else {
      res = parseFloat(nStr).toFixed(1)
    }
  } else {
    res = Number(nStr)
  }
  
  if (res > 1000) {
    res = addCommas(res.toString())
  }
  // console.log(res)
  return res;
  } else
  return '–';
  
}

let updateButtonRow = () => {
  const myButtonIndicators = ['cleanfuels', 'deathrate', 'poverty', 'schoolyears', 'population', 'gdp']
  myButtonIndicators.forEach((e, i) => {updateButton(e)})
}

let updateButton = (indicator) => {
  const array = data.indicators[indicator]
  const change = calculateChange(array).toFixed(1)
  const yearRange = `${getDecadeLowerLimit(array)[0]} – ${getDecadeUpperLimit(array)[0]}`;
  const myselect = d3.select(`#button-${indicator}`)
  const year = myselect.selectAll('.year').data([yearRange])
  const value = myselect.selectAll('.value').data([change])
  year.text((d) => { return d});
  value.text((d) => { return d});
}

let calculateChange = (array) => {
  const earlier = parseFloat(getDecadeLowerLimit(array)[1]); 
  const later = parseFloat(getDecadeUpperLimit(array)[1]);
  const change = (later - earlier) / earlier;
  return change * 100;
};

let metaUpdateGraph = (selectedIndicator, comparison = 2) => {
  const labels = {
    'cleanfuels': '% of the population with access to clean fuels',
    'deathrate': 'death rates (per 100,000 people)',
    'poverty': '% of the population under the national poverty line',
    'schoolyears': 'Average schooling years',
    'population': 'Population',
    'gdp': 'GDP per capita (PPP, current int. billion $)'
  }
  const headlines = {
    'cleanfuels': 'Access to clean fuels and cooking technologies',
    'deathrate': 'Indoor air pollution death rates',
    'poverty': 'Poverty gap, national poverty line',
    'schoolyears': 'Average schooling years',
    'population': 'Population',
    'gdp': 'GDP per capita PPP'
  }
  let i = {
    'data': getDecadeArray(data.indicators[selectedIndicator]),
    'label': labels[selectedIndicator],
    'headline': headlines[selectedIndicator]
  };
  if (comparison == 1) {
    i['select'] = '#svg-graph-1'
  } else {
    i['select'] = '#svg-comparison'
  }
  updateGraph(i.data, i.select, i.label)
  d3.select(i.select).select('h3').text(`${i.headline}`);
  d3.select('#selection-indicator').selectAll('.selected-item').classed('selected-item', false)
  d3.select('#selection-indicator').select(`.${selectedIndicator}`).classed('selected-item', true)
}

function updateGraph(data, selection, label) {
  d3.select(selection).select('svg').remove();
  
  const margin = {top: 30, right: 60, bottom: 50, left: 50};
  let w = 700 - margin.left - margin.right;
  let h = 500 - margin.top - margin.bottom;
  
  let graph = d3.select(selection)
  .append('svg')
    .attr('width', w + margin.left + margin.right)
    .attr('height', h + margin.top + margin.bottom);
  
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

    /* ++++++++++++++++++++++++++++++++++++++ */
    /*                Axes                    */
    /* -------------------------------------- */
    
  
  let xScale, xAxis, yScale, yAxis;
  let createAxes = () => {

  // Remove those to general later
  let xAxisCont = appendGroupTo('xAxisCont', axes);
  let yAxisCont = appendGroupTo('yAxisCont', axes);
  // console.log(new Date(data[0][0]))
  xScale = d3.scaleTime()
      .domain([new Date(data[0][0]), new Date(data[data.length-1][0])])
      .range([0, w])
  xAxis = d3.axisBottom(xScale)

  xAxisCont.append("g").attr('class', 'axis')
      .call(xAxis.ticks(d3.timeYear.every(1)));
  
  var max = d3.max(data.map(x => parseFloat(x[1])));
  yScale = d3.scaleLinear()
    .domain([0, max])
    .range([0, -h])
    .nice()

  yAxis = d3.axisLeft(yScale)
  yAxisCont.append("g").attr('class', 'axis')
      .call(yAxis);

  // https://bl.ocks.org/d3noob/23e42c8f67210ac6c678db2cd07a747e
  xAxisCont.append("text").attr('class', 'label')
      .attr("transform",
            "translate(" + (w/2) + " ," +
                           (margin.bottom/1.25) + ")")
      .style("text-anchor", "middle")
      .text("Year");

  yAxisCont.append("text").attr('class', 'label')
      .attr("y", `${-margin.left+10}`)
      .attr("x", `${h/2}`)
      .attr('transform', (d,i) => {
        let a = -90;
        let x = 0;
        let y = 0
        return `rotate(${a}, ${x}, ${y})`;
      })
      .style("text-anchor", "middle")
      .text(`${label}`);
  }
  createAxes()
  
let svg = () => {

  // g Container for each country!
  let countryCont = dataCont.append('g')
      .attr('id', selectedCountry)
      .attr('class', 'countryCont');

    let scatterplotCont = appendGroupClassTo('scatterplotCont', countryCont);
    let lineCont = appendGroupClassTo('lineCont', countryCont);

  let myColor = d3.rgb(0,0,0).darker(0.4);


  // Add the scatterplotCont http://bl.ocks.org/d3noob/38744a17f9c0141bcd04
  scatterplotCont.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
        .attr("r", 2.5)
        .attr("cx", function(d) {
          return xScale(new Date(d[0]));
        })
        .attr("cy", function(d) { 
          return yScale(d[1]); 
          
        })
        .attr('fill', myColor)

  // Add the line
  let valueline = d3.line()
    .x(function(d) { return xScale(new Date(d[0])); })
    .y(function(d) { return yScale(d[1]); });


  lineCont.append("path")
    .attr("class", "dataLine")
    .attr("d", valueline(data))
    .attr('stroke', myColor)
    .attr('stroke-width', 2)
    .attr('fill', 'none')

    lineCont.append("path")
      .attr("class", "selectLine")
      .attr('fill', 'none')
      .attr("d", valueline(data))
      .attr('stroke', 'rgba(0,0,0,0)')
      .attr('stroke-width', 9)
}
svg(data);
}

let arrayPropertyHasValues = (array, property, values) => {
  // console.log(array, property, values)
  let filter = array.filter(f => values.includes(f[property]));
  if (filter.length == 1) {
    return filter[0];
  } else {
    return filter;
  }
};

Array.prototype.isNull = function (){
    return this.join().replace(/,/g,'').length === 0;
};

let getDecadeLowerLimit = (array) => {
  let myArray = getDecadeArray(array)
  return myArray[0]
};

let getDecadeUpperLimit = (array) => {
  let myArray = getDecadeArray(array)
  return myArray[myArray.length-1]
};

let getDecadeArray = (array) => {
  const countryObj = arrayPropertyHasValues(array, 'Country Name', [selectedCountry]);
  let regYearsArr = [];
  const regYears = /^\d{4}$/;
  for (var element in countryObj) {
    if (regYears.test(element)) {
      const value = countryObj[element];
      if (value > 0) {
      regYearsArr.push([element, value]);
      }
    }
  }
  let upperLimit;
  if (countryObj["2015"]  != '') {
    upperLimit = 2015;
  } else {
    upperLimit = parseInt(regYearsArr[regYearsArr.length-1][0]);
  }
  const upperLimitDiff = upperLimit-10;
  
  let lowerLimit;
  if (countryObj[upperLimitDiff.toString()]  != '') {
    lowerLimit = upperLimitDiff;
  } else {
    
    const yearsBelowDiff = regYearsArr.filter(year => year[0] < upperLimitDiff);
    if (!yearsBelowDiff.isNull()) {
      lowerLimit = yearsBelowDiff[yearsBelowDiff.length-1][0];
    } else {
      const yearsAboveDiff = regYearsArr.filter(year => year[0] < upperLimitDiff)
      lowerLimit = yearsAboveDiff[0][0];
    }
  }
  return regYearsArr.filter(year => year[0] >= lowerLimit && year[0] <= upperLimit)
} 

let addCommas = (nStr) => {
  nStr += '';
  var x = nStr.split('.');
  var x1 = x[0];
  var x2 = x.length > 1 ? '.' + x[1] : '';
  var rgx = /(\d+)(\d{3})/;
  while (rgx.test(x1)) {
      x1 = x1.replace(rgx, '$1' + ',' + '$2');
  }
  return x1 + x2;
};

let translateOWIData = (data) => {
  let dataFormat = [];
  let myCountries = chunk(data,6)
  myCountries.forEach((country, i) => {
    let myObject = {};
    myObject['Country Name'] = country[0].Entity;
    myObject['Country Code'] = country[0].Code;
    country.forEach((year, j) => {
      myObject[year.Year] = year['Air pollution death rates (indoor solid fuels) per 100,000- IHME (per 100,000 people)']
      
    })
    dataFormat.push(myObject);
  })
  // console.log(dataFormat)
  return dataFormat
}