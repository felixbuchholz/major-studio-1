/*global d3*/
/*global data*/
/*global noUiSlider*/
/*global selectedCountry*/
let selectedIndicator = 'poverty';
let menuOpen = true;
let yearHint = false;
let yearRangeHint = false;
var valueSliders = {};
const myInfoIndicators = [
  ['cleanfuels', `<span class='em'>Access to clean fuels</span> and cooking technology in % of the population`],
  ['lifeexp', `<span class='em'>Average life expectancy</span> at birth in years`], ['poverty', `<span class='em'>Poverty headcount ratio</span> at national poverty line in % the of population`], ['schoolyears', `<span class='em'>Average schooling years</span> of the population with age 25 +`], ['population', `<span class='em'>Population</span>`], ['gdp', `<span class='em'>GDP per capita</span> in PPP current int. $`]];

function updateSlider() {
  
  // console.log('test')
  d3.select('#filters-value2015').selectAll('div').data(myInfoIndicators).enter().append('div')
    .attr('class', 'col-lg-2 filter-range filter-selected')
      .html((d) => { 
        // console.log(d)
        return `<label class='filter-range-label'>${d[1]}</label><br/>
                  <div class='slider' id='slider-${d[0]}'></div>` 
      })
  .on('mouseenter', (d) => {showClosestValueToRange(d[0])})
  
  
  for (var indicator of myInfoIndicators) {
    indicator = indicator[0]
    console.log()
    valueSliders[indicator] = document.getElementById(`slider-${indicator}`);
    var min = data.ranges2015.totals[indicator]['lowerLimit']-0.5;
    var max = data.ranges2015.totals[indicator]['upperLimit']+1;
    noUiSlider.create(valueSliders[indicator], {
      start: [min, max],
      connect: true,
      tooltips: [wNumb({mark: '.', thousand: ',', decimals: 0}), wNumb({mark: '.', thousand: ',', decimals: 0})],
      range: {
          'min': min,
          'max': max
      },
      behaviour: "tap-drag"
    });
  }
  
  
  
  for (var indicator of myInfoIndicators) {
    //console.log(indicator)
    indicator = indicator[0]
    valueSliders[indicator].noUiSlider.on('update', updateCountrySelectList);
  }
  
  // d3.select(`#slider-${indicator}`).on('click', function(d) {console.log(this)})
}

let currentIndicatorSelection = "cleanfuels"

let showClosestValueToRange = (d) => {
  currentIndicatorSelection = d
  updateCountrySelectList()
}

let updateCountrySelectList = () => {
  const indicator = currentIndicatorSelection;
  
  const currentSlider = valueSliders[indicator];
  const filterLowerLimit = currentSlider.noUiSlider.get()[0];
  const filterUpperLimit = currentSlider.noUiSlider.get()[1];
  //console.log(filterLowerLimit, filterUpperLimit)
  let currentArray = []
  for (var country in data.ranges2015.countries[indicator]) {
    const value = data.ranges2015.countries[indicator][country]['decadeEndValue']
    if (value != undefined) {
      currentArray.push([value, country])
    }
   
  }
  
  currentArray = currentArray.sort((function(index){
    return function(a, b){
        return (a[index] === b[index] ? 0 : (a[index] < b[index] ? -1 : 1));
    };
  })(0));
  
  while (parseFloat(currentArray[0]) < filterLowerLimit) {
    currentArray.splice(0,1)
  } 
  while (parseFloat(currentArray[currentArray.length-1]) > filterUpperLimit) {
    currentArray.splice(currentArray.length-1,1)
  } 
    
  const lowSelector = currentArray[0][1].toLowerCase().split(' ').join('-')
  const lowValue = reformatNumVeryShort(currentArray[0][0].toFixed(1))
  const highSelector = currentArray[currentArray.length-1][1].toLowerCase().split(' ').join('-')
  const highValue = reformatNumVeryShort(currentArray[currentArray.length-1][0].toFixed(1))
  
  d3.select('#select-list').selectAll('.li-value').style('opacity', '0')
  d3.select('#select-list').select(`#${lowSelector}`).select('.li-value').style('opacity', '1').text(`${lowValue}`)
  d3.select('#select-list').select(`#${highSelector}`).select('.li-value').style('opacity', '1').text(`${highValue}`)

  regionsAndCountries = getRegionsAndCountries();
  
  let up = d3.select('#select-list').selectAll('div').data(regionsAndCountries).enter().append('div');
  up.append('h4').text((d) => { return d[0][2]; });
  up.append('ul').attr('class', 'mylist').attr('id', (d) => { 
    return d[0][3]; 
  });
  
  regionsAndCountries.forEach((e, i) => {
    // console.log(`#${e[0][3]}`)
    let u = d3.select(`#${e[0][3]}`).selectAll('li').data(e);
    
    u.exit().remove();
    u.classed('outOfRange', (d, i) => {
      // let myBooleans = {};
      return getOutOfRangeCountries(d);
    })
    let li = u.enter()
      .append('li')
      .attr('id', (d) => {
        return d[0].toLowerCase().split(' ').join('-')
      })
      .on('click', (d) => {
        console.log(d[0]);
        selectCountry(d[0]);
      })
      .attr('class', 'pointer');
      
      li.append('span')
        .attr('class', 'country')
        .text((d) => {
          const country = d[0];
          return country;
        })

        .append('span')
        .attr('class', 'sup')
        .text((d) => {
          const country = d[0];
          let indicatorHints = [];
          myInfoIndicators.forEach((indicator, i) => {
            indicator = indicator[0]
            let decadeEndValue = data.ranges2015.countries[indicator][country]['decadeEndValue'];
            if (decadeEndValue == undefined) {
              indicatorHints.push(i+1);
            }
          })
          if (indicatorHints.length > 0) {
            return ' ' + indicatorHints.join(',');
          } else {
            return ''
          }
          
        });
    
    let value = li.append('span')
      .attr('class', 'li-value')
      .text((d, i) => { 
        return 1 
      });
    
    value.style('opacity', (d) => {
      if (true) {
        
      }
    })
  })
  
  
}

let getRegionsAndCountries = () => {
  const onlyRegions = ["Northern Africa", "Eastern Africa", "Central Africa", "Western Africa", "Southern Africa"];
  let regionsAndCountries = [];
  onlyRegions.forEach((region, i) => {
    let countries = data.africaCountries.filter((x) => x[2] == region);
    countries = countries.sort();
    countries.map((x) => {
      let properIdName = x[2];
      properIdName = properIdName.toLowerCase().split(' ').join('-');
      x[3] = properIdName;
      
      //console.log(x[3])
    });
    regionsAndCountries.push(countries);
  });
  return regionsAndCountries;
}

let getOutOfRangeCountries = (d) => {
  let myBooleans = [];
  
      myInfoIndicators.forEach((indicator, i) => {
        indicator = indicator[0]
        // myBooleans[indicator];
         const currentSlider = valueSliders[indicator];
        // console.log(indicator, currentSlider)
        const filterLowerLimit = currentSlider.noUiSlider.get()[0];
        const filterUpperLimit = currentSlider.noUiSlider.get()[1];
        
        const country = d[0];
        let decadeEndValue = data.ranges2015.countries[indicator][country]['decadeEndValue'];
        
        // TODO: Don’t grey out countries without data in one indicator right from the beginning.
        
        if (decadeEndValue == undefined) {
          decadeEndValue = filterUpperLimit-1;
        }
        if (country == 'Somalia') {
          // console.log(indicator, decadeEndValue);
        }
        // console.log(country, decadeEndValue)
        // console.log(decadeEndValue, filterLowerLimit)
        if (decadeEndValue < filterLowerLimit) {
          myBooleans.push(true);
        } else {
          myBooleans.push(false);
        }
        
        if (decadeEndValue > filterUpperLimit) {
          myBooleans.push(true);
        } else {
          myBooleans.push(false);
        }
      })
      // console.log(myBooleans)
      // console.log(myBooleans.includes(true))
      const overallBoolean = myBooleans.includes(true)
      if (overallBoolean == true) {
        return  true;
      } else {
        return false;
      }
}

let getNextCountryEndDecade = (direction) => {
  const currentDisplayValue= d3.select('#cleanfuels').select('.value').html();
  let cleanfuelsArr = [];
  for (var country in data.ranges2015.countries.cleanfuels) {
    const value = data.ranges2015.countries.cleanfuels[country]['decadeEndValue']
    if (value != undefined) {
      cleanfuelsArr.push([value, country])
    }
  }
  cleanfuelsArr = cleanfuelsArr.sort((function(index){
    return function(a, b){
        return (a[index] === b[index] ? 0 : (a[index] < b[index] ? -1 : 1));
    };
  })(0));
  if (direction == 'up') {
      while (parseFloat(cleanfuelsArr[0]) <= parseFloat(currentDisplayValue)+0.01) {
    cleanfuelsArr.splice(0,1)
    } 
    selectCountry(cleanfuelsArr[0][1])
  } else {
    while (parseFloat(cleanfuelsArr[cleanfuelsArr.length-1]) >= parseFloat(currentDisplayValue)-0.001) {
      cleanfuelsArr.splice(-1,1)
    }
    console.log(cleanfuelsArr)
    selectCountry(cleanfuelsArr[cleanfuelsArr.length-1][1])
  }
}


let getNextCountryRate = (direction) => {
  // console.log(direction)
  // const 
  const currentDisplayValue= d3.select('#button-cleanfuels').select('.value').html();
  let cleanfuelsArr = [];
  for (var country in data.ranges2015.countries.cleanfuels) {
    const earlier = data.ranges2015.countries.cleanfuels[country]['decadeStartValue'];
    const later = data.ranges2015.countries.cleanfuels[country]['decadeEndValue'];
    if (earlier != undefined && later != undefined) {
      const rate = ((later - earlier) / earlier) * 100;
      cleanfuelsArr.push([rate, country])
    }
  }
  cleanfuelsArr = cleanfuelsArr.sort((function(index){
    return function(a, b){
        return (a[index] === b[index] ? 0 : (a[index] < b[index] ? -1 : 1));
    };
  })(0));
  
  
  
  if (direction == 'up') {
      while (parseFloat(cleanfuelsArr[0]) <= parseFloat(currentDisplayValue)+0.1) {
    cleanfuelsArr.splice(0,1)
    } 
    console.log(cleanfuelsArr)
    selectCountry(cleanfuelsArr[0][1])
  } else {
    while (parseFloat(cleanfuelsArr[cleanfuelsArr.length-1]) >= parseFloat(currentDisplayValue)-0.1) {
      cleanfuelsArr.splice(-1,1)
    }
    console.log(cleanfuelsArr)
    selectCountry(cleanfuelsArr[cleanfuelsArr.length-1][1])
  }
}

/*
  const earlier = parseFloat(getDecadeStart(array)[1]); 
  const later = parseFloat(getDecadeEnd(array)[1]);
  const change = (later - earlier) / earlier;
  return change * 100;
*/

// FUNCTIONS
let myData = [selectedCountry];
let selectCountry = (countrySelection) => {
  selectedCountry = countrySelection;
  if (menuOpen == true) {
    openCloseMenu();
  }
  
  yearHint = false;
  yearRangeHint = false;
  
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
    menuOpen = false;
    d3.select('#select-menu').transition(400).style('opacity', 0).transition(300).delay(300).style('display', 'none');
  } else {
    menuOpen = true;
    d3.select('#select-menu').style('display', 'block').transition(400).style('opacity', 1);
  }
};

// https://stackoverflow.com/questions/11246758/how-to-get-unique-values-in-an-array
let getUniqueItems = (array) => {
  return array.filter(function(item, i, ar){ return ar.indexOf(item) === i; });
};


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
  d3.select('#region').selectAll('.value').data(data.africaCountries).html("").text((d) => { return d[2]; });
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
  
  year
    .text((d) => { 
      if (yearHint == false && d[0]=='2015') {
        
        //console.log(d)
        yearHint = true;
        return d[0]=='2015' ? '*' : `(${d[0]})` 
      } else {
        return d[0]=='2015' ? '' : `(${d[0]})`
      }
      
      
    })
    .classed('sup', (d) => { return d[0]=='2015' ? true: false})
    .classed('sub', (d) => { return d[0]=='2015' ? false: true})
      
  value.text((d) => { return d[1] })
}

let getIndicatorPair = (indicator) => {
  // c(indicator);
  let mydata = [];
  // hdi
  if (indicator == 'hdi') {
    mydata = [2017, arrayPropertyHasValues(data.indicators.hdi, 'Country Name', [selectedCountry]).rank2017]
  } else { // ––– end hdi
    mydata = getDecadeEnd(data.indicators[indicator])
  }
  // console.log(mydata)
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
      res = parseFloat(nStr).toFixed(2)
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
  const yearRange = `${getDecadeStart(array)[0]} – ${getDecadeEnd(array)[0]}`;
  const myselect = d3.select(`#button-${indicator}`)
  const year = myselect.selectAll('.year').data([yearRange])
  const value = myselect.selectAll('.value').data([change])
  
  year
    .text((d) => { 
      // console.log(d)
      if (yearRangeHint == false && d=='2005 – 2015') {
        yearRangeHint = true;
        return d=='2005 – 2015' ? '**' : `(${d})` 
      } else {
        return d=='2005 – 2015' ? '' : `(${d})`
      }
      
      
    })
    .classed('sup', (d) => { return d=='2005 – 2015' ? true: false})
    .classed('sub', (d) => { return d=='2005 – 2015' ? false: true})
  
  value.text((d) => { return d});
}

let calculateChange = (array) => {
  const earlier = parseFloat(getDecadeStart(array)[1]); 
  const later = parseFloat(getDecadeEnd(array)[1]);
  const change = (later - earlier) / earlier;
  return change * 100;
};

let metaUpdateGraph = (selectedIndicator, comparison = 2) => {
  const labels = {
    'cleanfuels': '% of the population with access to clean fuels and cooking technologies',
    'deathrate': 'Air pollution death rates (indoor solid fuels) per 100,000 people',
    'poverty': 'Poverty headcount ratio at national poverty line in % the of population',
    'schoolyears': 'Average schooling years of the population with age 25 +',
    'population': 'Population, total',
    'gdp': 'GDP per capita in PPP, current international $'
  }
  const headlines = {
    'cleanfuels': 'Access to clean fuels and cooking technologies',
    'deathrate': 'Deaths from indoor air pollution',
    'poverty': 'Poverty ratio',
    'schoolyears': 'Average schooling years',
    'population': 'Population',
    'gdp': 'GDP per capita'
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
  d3.select(i.select).select('h3').transition(50).style('opacity', 0)
 d3.select(i.select).select('h3').transition(100).delay(200).text(`${i.headline}`).transition(100).delay(0).attr('class', 'graph-headline').style('opacity', 1)
  d3.selectAll('.selected-cont').selectAll('.selected-item').classed('selected-item', false)
  d3.selectAll('.selected-cont').select(`.${selectedIndicator}`).classed('selected-item', true)
  d3.select('#graph-buttons').selectAll('.selected-button').classed('selected-button', false)
  d3.select('#graph-buttons').select(`.${selectedIndicator}`).classed('selected-button', true)
}

function updateGraph(data, selection, label) {
  d3.select(selection).select('svg').remove();
  
  const margin = {top: 20, right: 100, bottom: 40, left: 40};
  let w = 680 - margin.left - margin.right;
  let h = 500 - margin.top - margin.bottom;
  
  let graph = d3.select(selection)
  .append('svg')
    .attr('width', w + margin.left + margin.right)
    .attr('height', h + margin.top + margin.bottom)
    .style('opacity', 0)
  
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
  
  // https://stackoverflow.com/questions/3674539/incrementing-a-date-in-javascript
  // https://stackoverflow.com/questions/36561064/last-tick-not-being-displayed-in-d3-charts
  var tomorrow = new Date(data[data.length-1][0]);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  xScale = d3.scaleTime()
      .domain([new Date(data[0][0]), tomorrow])
      .range([0, w])
  xAxis = d3.axisBottom(xScale)

  xAxisCont.append("g").attr('class', 'axis')
      .call(xAxis.ticks(2));
  
  var max = d3.max(data.map(x => parseFloat(x[1])));
  yScale = d3.scaleLinear()
    .domain([0, max+1])
    .range([0, -h])
    .nice()
  // Adjust to specific scale
  yAxis = d3.axisLeft(yScale)
  yAxisCont.append("g").attr('class', 'axis')
      .call(yAxis.ticks(8).tickFormat(d3.format(".2s")));
      
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
      .text("Year");

  yAxisCont.append("text").attr('class', 'label')
      .attr("y", `${-h - 10}`)
      .attr("x", `${0}`)
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

  let myColor;
  // console.log(selection)
  if (selection == '#svg-graph-1') {
    myColor = d3.rgb(254, 178, 76);
  } else {
    myColor = d3.rgb(0,0,0);
  }


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
      
      // d3.select(selection).select('svg')
      graph.transition(500).delay(500).style('opacity', 1.0);
}
svg(data);
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

let reformatNumVeryShort = (n) => {
  if (n >= 100 && n < 950) {
    n = Math.round(n/100) + 'H'
  }
  if (n >= 950 && n < 1000) {
    n = '1 K'
  }
  if (n >= 1000 && n < 1000000) {
    n = Math.round(n/1000) + ' K'
  }
  if (n >= 950000 && n < 1000000) {
    n = '1 M'
  }
    if (n >= 1000000 && n < 1000000000) {
    n = Math.round(n/1000000) + ' M'
  }
  return n
}

d3.selection.prototype.first = function() {
  return d3.select(this[0][0]);
};

d3.selection.prototype.last = function() {
  var last = this.size() - 1;
  return d3.select(this[0][last]);
};