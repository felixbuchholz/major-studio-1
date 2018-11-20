/* global d3 */
let data = {};
let selectedCountry;

Promise.all([
  d3.json('data/geo/africa.geo.json'),
  d3.json('data/geo/sm-world-countries.geo.json'),
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
.then(([africaGeo, worldGeo, africaCountries, hdi, gini, lifeexp, schoolyears, population, gdp, cleanfuels, deathrate, poverty]) => {
  deathrate = translateOWIData(deathrate);
  data = {
    'africaGeo': africaGeo, 
    'worldGeo' : worldGeo,
    'worldDeath' : deathrate,
    'africaCountries': africaCountries,
    'indicators': {
      'hdi': hdi, 
      'cleanfuels': cleanfuels, 
      'deathrate': deathrate, 
      'poverty': poverty,
      'lifeexp': lifeexp, 
      'gini': gini, 
      'schoolyears': schoolyears, 
      'population': population, 
      'gdp': gdp
    }
  };
  
  
  /*
  // TODO: make deathrate smaller
  // https://stackoverflow.com/questions/5072136/javascript-filter-for-objects/40562289#40562289
  object = {firstname: 'abd', lastname:'tm', age:16, school:'insat'};
  
  keys = ['firstname', 'age'];
  then :
  
  keys.reduce((result, key) => ({ ...result, [key]: object[key] }), {});
  */
  
  const geoAfricaProperties = data.africaGeo.features.map(f => f.properties);
  data.africaCountries.forEach((e, i) => {
    const region = arrayPropertyHasValues(geoAfricaProperties, 'geounit', e).subregion;
    if (region == undefined) {
      data.africaCountries[i][2] = 'Eastern Africa'
    } else if (region == 'Middle Africa') {
      data.africaCountries[i][2] = 'Central Africa';
    } else {
      data.africaCountries[i][2] = region;
    }
    
  })
    
  
  
  let allNames = [];
  data.africaCountries.forEach((e, i ) => {
    allNames.push(e[0]);
  });
  
  // TODO: don’t use the ranges for the countries, when you want to change the filter!
  for (var indicator in data.indicators) {
    const filtered = arr1IncludesArr2atProp3(data.indicators[indicator], allNames, 'Country Name');
    // console.log(filtered);
    data.indicators[indicator] = filtered;
  }
  data['ranges2015'] = {};
  data['ranges2015']['countries'] = {};
  data['ranges2015']['totals'] = {};
  
  for (var indicator in data.indicators) {
    let max = -Infinity;
    let min = +Infinity;
    data['ranges2015']['countries'][indicator] = {};
    data['ranges2015']['totals'][indicator] = {}
    allNames.forEach((country, i) => {
      
      data['ranges2015']['countries'][indicator][country] = {};
      selectedCountry = country;
      
       if (indicator == 'hdi') {
        
        data['ranges2015']['countries'][indicator][country]['decadeEndValue'] = arrayPropertyHasValues(data.indicators.hdi, 'Country Name', [selectedCountry]).rank2017;
        data['ranges2015']['countries'][indicator][country]['decadeEndYear'] = 2017;
        
      } else {
        
        let myDecadeEnd = getDecadeEnd(data.indicators[indicator]);
        //console.log(myDecadeEnd)
        if (myDecadeEnd != undefined && myDecadeEnd.length > 0) {
         // console.log(indicator, country, myLog)
         let myDecadeEndYear = parseFloat(myDecadeEnd[0])
         let myDecadeEndValue = parseFloat(myDecadeEnd[1])
         data['ranges2015']['countries'][indicator][country]['decadeEndValue'] = myDecadeEndValue;
         data['ranges2015']['countries'][indicator][country]['decadeEndYear'] = myDecadeEndYear;
         if (myDecadeEndValue > max) {
            max = myDecadeEndValue;
         }
         if (myDecadeEndValue < min) {
            min = myDecadeEndValue;
         }
         let myDecadeStart = getDecadeStart(data.indicators[indicator]);
         if (myDecadeStart != undefined && myDecadeStart.length > 0) {
           // console.log(indicator, country, myLog)
           let myDecadeStartYear = parseFloat(myDecadeStart[0])
           let myDecadeStartValue = parseFloat(myDecadeStart[1])
           data['ranges2015']['countries'][indicator][country]['decadeStartValue'] = myDecadeStartValue;
           data['ranges2015']['countries'][indicator][country]['decadeStartYear'] = myDecadeStartYear;
           
           let myRate;
           const later = myDecadeEndValue;
           const earlier = myDecadeStartValue;
           myRate = ((later - earlier) / earlier) * 100;
           data['ranges2015']['countries'][indicator][country]['rate'] = myRate;
          }
        }
        
      }
      
    })
    data['ranges2015']['totals'][indicator]['upperLimit'] = max;
    data['ranges2015']['totals'][indicator]['lowerLimit'] = min;
  }

// Not according to indicator !!!

data['sorting'] = {};
data['sorting']['decadeEnd'] = [];
data['sorting']['rate'] = [];

for (var country in data.ranges2015.countries.cleanfuels) {
  const value = data.ranges2015.countries.cleanfuels[country]['decadeEndValue']
  if (value != undefined) {
    data['sorting']['decadeEnd'].push([value, country])
  } else {
    data['sorting']['decadeEnd'].push([0, country])
  }
  const rate = data.ranges2015.countries.cleanfuels[country]['rate']
  if (rate != undefined) {
    data['sorting']['rate'].push([rate, country])
  } else {
    data['sorting']['rate'].push([0, country])
  }
}
data['sorting']['decadeEnd'] = data['sorting']['decadeEnd'].sort((function(index){
  return function(a, b){
      return (a[index] === b[index] ? 0 : (a[index] < b[index] ? -1 : 1));
  };
})(0));
data['sorting']['rate'] = data['sorting']['rate'].sort((function(index){
  return function(a, b){
      return (a[index] === b[index] ? 0 : (a[index] < b[index] ? -1 : 1));
  };
})(0));
  
  
  console.log(data);
  
  
  // Functions
  selectedCountry='Nigeria'
  selectCountry(selectedCountry);
  updateSlider();
  //console.log(data.worldGeo)
  buildMap();
 });
 
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

let getDecadeStart = (array) => {
  let myArray = getDecadeArray(array)
  return myArray[0]
};

let getDecadeEnd = (array) => {

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
    //console.log(regYearsArr)
    if (regYearsArr.length == 0) {
      return [[],[]]
    }
    upperLimit = parseInt(regYearsArr[regYearsArr.length-1][0]);
    // console.log(upperLimit);
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
      const yearsAboveDiff = regYearsArr.filter(year => year[0] > upperLimitDiff)
      // c(yearsAboveDiff);
      lowerLimit = yearsAboveDiff[0][0];
    }
  }
  return regYearsArr.filter(year => year[0] >= lowerLimit && year[0] <= upperLimit)
} 

let arr1IncludesArr2atProp3 = (arr1, arr2, prop3) => {
    // Add an exclamation mark to throw things out!
        //f => b.includes(f['Country Code'])
    const res = arr1.filter(f => arr2.includes(f[prop3]));
    return res;
}

Array.prototype.isNull = function (){
    return this.join().replace(/,/g,'').length === 0;
};

let arrayPropertyHasValues = (array, property, values) => {
  // console.log(array, property, values)
  let filter = array.filter(f => values.includes(f[property]));
  if (filter.length == 1) {
    return filter[0];
  } else {
    return filter;
  }
};