/*                   Global Name Space                 */
/* --------------------------------------------------- */

// const marginAll = 100;
const margin = {top: 50, right: 170, bottom: 100, left: 50};
let w = 800 - margin.left - margin.right;
let h = 600 - margin.top - margin.bottom;
let mySelection = 'ZAF';
let myCountries = [];
let myScaleMax = 0;
let adj, data, dataOnlyAfrica, dataOnlyAfricaSE21;
let africaArr = [];
let mySelectionArray
let namesList = [];



/* +++++++++++++++++++++++++++++++++++++++++++++++++++ */
/*                   Load Data                         */
/* --------------------------------------------------- */
const africa = d3.json('data/africaCountriesList.json')
const neighbors = d3.json('data/country_adj_2digit.json')
const dataset = d3.csv('data/se4data.csv');

africa.then((africa) => {
  // console.log(africa);
  africa.forEach((e, i) => {
    africaArr.push(e);
  });
  africaArr.forEach((e) => {return namesList.push(e[0]);});
  namesList.splice(-2)
  console.log(africaArr);

neighbors.then((neighborsData) => {
  // console.log(adj);
  adj = neighborsData;
dataset.then((se4dataset) => {
  // console.log(data);
  data = se4dataset

  /*                 Handle Data                 */
  /* ------------------------------------------- */

  /*TODO:

    1. Tooltip / position

    # viewBox
    # crispEdges
    # For the comparison to access to electricity
    1. Handle the data with a function that’s able to update

    # For interactivity
    5. Do the same for a second indicator

  */
/* THIS WAS ONLY NEEDED TO CORRECT THE COUNTRIES LIST ONCE AND TO INCLUDE ISREAL AND SPAIN IN THE AFRICA LIST  BECAUSE THEY ARE NEIGHBORS */
    /*
      // find all neighbors once
      let allNeighbors = [];
      africaArr.forEach((e, i) => {
        mySelectionNeighbors = adj[e[1]];
        mySelectionNeighbors.forEach((f, j) => {
          console.log(allNeighbors.indexOf(f) != -1);
          if (allNeighbors.indexOf(f) == -1) {
            allNeighbors.push(f);
          }
        })
      })
      console.log(allNeighbors);

      allNeighbors.forEach((e, i) => {
        try {
        console.log(translateCountryCode(e), i, e);
        }
        catch(err) {
            console.log(err.message);
        }
      })
      */

  update();
})
})
})

// BACK TO GLOBAL*********************************

var input = document.getElementById("myinput");
new Awesomplete(input, {
  autoFirst: false,
  minChars: 1,
	list: namesList
});

// Update function
let update = () => {
  originalFilter();
  myScaleMax = 0
  mySelectionArray = [];
  myCountries = [];
  d3.selectAll('.countryCont').remove()
  d3.select('#xAxisCont').remove()
  d3.select('#yAxisCont').remove()

  findNeighbors();
  console.log(mySelectionArray);
  populateCountriesArray();
  checkCountriesArray();
  createInput();

  createAxes(myCountries[0])

  myCountries.forEach((e, i) => {
    svg(e, i)
  });
}

let originalFilter = () => {
  let isoList = [];
  africaArr.forEach((e) => {return isoList.push(e[2]);});
  dataOnlyAfrica = aIncludeBwithC(data, isoList, 'Country Code')
  // Filter all the entries for the indicator 2.1
  dataOnlyAfricaSE21 = aIncludeBwithC(dataOnlyAfrica, ['2.1_ACCESS.CFT.TOT'], 'Indicator Code')
}

// Find neigbors
let findNeighbors = () => {
  // Find and add all the neighbors
  let mySelectionNeighbors = adj[translateCountryCode(mySelection)]
  // console.log(mySelectionNeighbors);

  mySelectionNeighbors.forEach((e,i) => {
    // console.log(e, translateCountryCode(e));
    if (e.length==2) {
      mySelectionNeighbors[i] = translateCountryCode(e);
    }
  })
  mySelectionArray = [mySelection].concat(mySelectionNeighbors);
}

// Populate Countries Array
let populateCountriesArray = () => {
  mySelectionArray.forEach((e, i) => {
    myCountries.push(createSelectionSet(e));
    console.log(myCountries);
  })
}

// manipulate the se21 data to include the se2.1 data and group it
let createSelectionSet = (mySelection) => {
  // console.log(aIncludeBwithC(dataOnlyAfricaSE21, [mySelection], 'Country Code')[0]);
  let mySelectionSet = aIncludeBwithC(dataOnlyAfricaSE21, [mySelection], 'Country Code')[0];
  // console.log(mySelectionSet);
  // regex
  let regYears = /^\d{4}$/;
  // loop
  mySelectionSet['se21'] = [];
  for (var element in mySelectionSet) {
    if (regYears.test(element)) {
      if (mySelectionSet[element] != '') {
        // Date.parse https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse

        mySelectionSet.se21.push([Date.parse(element), parseFloat(mySelectionSet[element])]);
      }
      // Temporary solution to prevent the code from breaking: commenting out these lines
      // delete mySelectionSet[element]
      // delete mySelectionSet['']
    }
  }
  return mySelectionSet;
}

let checkCountriesArray = () => {
  /* Check if countries have indicator data */
  /* -------------------------------------- */
  let emptyCountries = [];
  myCountries.forEach((e, i) => {
    if (e.se21.length < 1) {
      emptyCountries.push(e)
      myCountries.splice(i, 1)
    }
  })
  emptyCountries.forEach((e, i) => {
    modal.append('text')
        .text(() => {
          return 'There is no data available for: ' + e['Country Name']
        })
        .attr('x', 0)
        .attr('y', `${70+i*14}`)
        .attr('class', 'plotLabel')
        .attr('class', 'countryCont')
        // .style("text-anchor", "middle")
  })
  // Find the mean
  myCountries.forEach((e, i) => {
    let total = 0;
    //substitute with e[indicator] later probably
    e.se21.forEach((f, j) => {
      total += f[1];
    })
    let mean = total/e.se21.length;
    e['stats'] = {};
    e.stats['se21'] = {};
    e.stats.se21['mean'] = mean;
  })

  // Find the max
  myCountries.forEach((e, i) => {
    let max = 0;
    //substitute with e[indicator] later probably
    e.se21.forEach((f, j) => {
      if (f[1] > max)
      max = f[1];
    })
    e.stats.se21['max'] = max;
    if (myScaleMax < max) {
      myScaleMax = max;
    }
  })

  // console.log(myScaleMax);
  /*
  // sort by mean ASCENDING
  myCountries = myCountries.sort(function(a, b) {
        return a.stats.se21.mean - b.stats.se21.mean;
  });
  */
  // sort by last value DESCENDING

  myCountries = myCountries.sort(function(a, b) {
        return b.se21[b.se21.length-1][1] - a.se21[a.se21.length-1][1];
    });
  // Position
  myCountries.forEach((e, i) => {
    e.stats.se21['position'] = i;
  })

    // myCountries.forEach((e, i) => {
    //   console.log(e.stats.se21.mean);
    // })
    // console.log(myCountries);
}

// Nice, just moved this out of the svg function and then every graph was in the right place :)
let graph = d3.select("#graph")
  .append('svg')
    .attr('width', w + margin.left + margin.right)
    .attr('height', h + margin.top + margin.bottom);

    /*          Subgroup structure         */
    /* ----------------------------------- */

    /*          Functions         */
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
let createAxes = (myCountry) => {

  // Remove those to general later
  let xAxisCont = appendGroupTo('xAxisCont', axes);
  let yAxisCont = appendGroupTo('yAxisCont', axes);
  xScale = d3.scaleTime()
      .domain([new Date(myCountry.se21[0][0]), new Date(myCountry.se21[myCountry.se21.length-1][0])])
      .range([0, w])
  xAxis = d3.axisBottom(xScale)

  xAxisCont.append("g").attr('class', 'axis')
      .call(xAxis.ticks(d3.timeYear.every(1)));


  yScale = d3.scaleLinear()
    .domain([0, myScaleMax])
    .range([0, -h])
    .nice()

  yAxis = d3.axisLeft(yScale)
  yAxisCont.append("g").attr('class', 'axis')
      .call(yAxis);

  // https://bl.ocks.org/d3noob/23e42c8f67210ac6c678db2cd07a747e
  xAxisCont.append("text").attr('class', 'label')
      .attr("transform",
            "translate(" + (w/2) + " ," +
                           (margin.bottom/2) + ")")
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
      .text("% of the population with access to clean fuels");

  // TODO Grid Lines adjust to v5 https://stackoverflow.com/questions/15580300/proper-way-to-draw-gridlines
  /*
  axes.selectAll("line.horizontalGrid").data(yScale.ticks(4)).enter()
    .append("line")
        .attr(
        {
            "class":"horizontalGrid",
            "x1" : margin.right,
            "x2" : w,
            "y1" : function(d){ return yScale(d);},
            "y2" : function(d){ return yScale(d);},
            "fill" : "none",
            "shape-rendering" : "crispEdges",
            "stroke" : "black",
            "stroke-width" : "1px"
        });
  */

  /* +++++++++++++++++++++++++++++++++++ */
}

/* +++++++++++++++++++++++++++++++++++++++++++++++++++ */
/*                       SVG                           */
/* --------------------------------------------------- */

let svg = (myCountry, myCountryIndex) => {

  // g Container for each country!
  let countryCont = dataCont.append('g')
      .attr('id', myCountry['Country Name'])
      .attr('class', 'countryCont');

    let scatterplotCont = appendGroupClassTo('scatterplotCont', countryCont);
    let lineCont = appendGroupClassTo('lineCont', countryCont);

let myColor = d3.rgb(d3.interpolateRdYlGn(myCountry.se21[myCountry.se21.length-1][1]/100)).darker(0.4)


  // Add the scatterplotCont http://bl.ocks.org/d3noob/38744a17f9c0141bcd04
  scatterplotCont.selectAll("circle")
      .data(myCountry.se21)
      .enter()
      .append("circle")
        .attr("r", 2.5)
        .attr("cx", function(d) {
          // console.log(d);
          return xScale(d[0]);
        })
        .attr("cy", function(d) { return yScale(d[1]); })
        .attr('fill', myColor)

  /* ########################## LEGEND/ LABEL ############## */
  modal
  .append('line')
      .attr('class', 'countryCont')
      .attr('x1', w+10)
      .attr('y1', -h)
      .attr('x2', w+10)
      .attr('y2', -h+(myCountries.length-1)*20+10)
      .style('stroke', '#ddd');

  modal.append('text')
      .text(() => {
        return myCountry['Country Name']
      })
      .attr('class', 'countryCont')
      .attr('id', `${myCountry['Country Name']}`)
      // .attr('x', `${xScale(myCountry.se21[myCountry.se21.length-1][0])+4}`)
      // .attr('y', `${yScale(myCountry.se21[myCountry.se21.length-1][1])}`)
      .attr('x', w+20)
      .attr('y', (d, i) => {
        // console.log(myCountry);
        return -h+myCountry.stats.se21.position*20+10
      })
      .attr('fill', myColor)
      // .style("text-anchor", "middle")

  // Add the line
  let valueline = d3.line()
    .x(function(d) { return xScale(d[0]); })
    .y(function(d) { return yScale(d[1]); });



  lineCont.append("path")
    .attr("class", "dataLine")
    .attr("d", valueline(myCountry.se21))
    .attr('stroke', myColor)
    .attr('stroke-width', 2)

    lineCont.append("path")
      .attr("class", "selectLine")
      .attr('fill', 'none')
      .attr("d", valueline(myCountry.se21))
      .attr('stroke', 'rgba(0,0,0,0)')
      .attr('stroke-width', 9)
      .on('mouseover', (d, i, nodes) => {

        d3.select('#modal')
          .append('rect')
          .attr('class', 'hover')
              .attr('x', w/2-100)
              .attr('y', -h/2-35)
              .attr('width', 200)
              .attr('height', 60)
              .attr('fill', '#fff')

        d3.select('#modal')
          .append('text')
          .attr('class', 'hover')
          .text(() => {

            return myCountry['Country Name']
          })
          .attr('x', w/2)
          .attr('y', -h/2)
          .attr('text-anchor', 'middle')
          .attr('fill', myColor)
      })
      .on('mouseout', (d, i, nodes) => {

        d3.select('#modal')
          .selectAll('.hover')
          .remove()
      })


}


/* +++++++++++++++++++++++++++++++++++++++++++++++++++ */
/*                  Functions                          */
/* --------------------------------------------------- */


// https://stackoverflow.com/questions/34901593/how-to-filter-an-array-from-all-elements-of-another-array
let aIncludeBwithC = (a, b, c) => {
  let arr = a,
    brr = b,
    // Add an exclamation mark to throw things out!
        //f => b.includes(f['Country Code'])
    res = a.filter(f => b.includes(f[c]));
    return res;
}

let translateCountryCode = (xCharacter) => {
  let res = '';
  if (xCharacter.length == 2){
    africaArr.forEach((e, i) => {
      if (xCharacter == e[1]) {
        res = e[2];
      }
    })
  } else if (xCharacter.length == 3) {
    africaArr.forEach((e, i) => {
      if (xCharacter == e[2]) {
        res = e[1];
      }
    })
  }
  return res;
}

let translateCountryCodeToName = (xCharacter) => {
  let res = '';
  if (xCharacter.length == 2){
    africaArr.forEach((e, i) => {
      if (xCharacter == e[1]) {
        res = e[0];
      }
    })
  } else if (xCharacter.length == 3) {

    africaArr.forEach((e, i) => {
      if (xCharacter == e[2]) {
        res = e[0];
      }
    })
  }
  return res;
}

let translateNameToCountryCode = (name) => {
  res = ''
  africaArr.forEach((e, i) => {
    // console.log(name == e[0]);
    if (name == e[0]) {
      // console.log(e[2]);
      res = e[2];
    }
  })
  return res;
}

/* +++++++++++++++++++++++++++++++++++++++++++++++++++ */
/*                   Inputfield                        */
/* --------------------------------------------------- */

let createInput = () => {
  d3.select('input')
    .attr('type', 'text')
    .attr('size', 26)
    .attr('placeholder', () => {
      return translateCountryCodeToName(mySelection) + ' (select here)'
    })
    .style('border-color', () => {
      myCountry = myCountries.filter(country => country['Country Code'] == mySelection)[0]
      let myColor = d3.rgb(d3.interpolateRdYlGn(myCountry.se21[myCountry.se21.length-1][1]/100)).darker(0.4)
      return d3.rgb(myColor).darker(0.4)
    })
    .on('change', myOnInput);
}


function myOnInput() {
  // console.log(this.value);
  mySelection = translateNameToCountryCode(this.value);
  // console.log(translateNameToCountryCode(this.value));
  update();
}
