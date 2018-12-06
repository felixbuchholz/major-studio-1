/*
  let properCountryCodes = [];
  let properCountryNames = []
  data.africaGeo.features.forEach((e, i) => {
    properCountryCodes.push(e.properties.adm0_a3)
    properCountryNames.push(e.properties.geounit)
  })
  data.africaCountries.map((x) => {
    x.splice(1,1);
  });
  let africanCountries = data.africaCountries
  
  africanCountries.map((x) => {
    // console.log(x[1])
    const niceName = properCountryNames[properCountryCodes.indexOf(x[1])]
    if (niceName != undefined) {
       x[0] = properCountryNames[properCountryCodes.indexOf(x[1])]
    } else {
      x[0] = '!' + x[0] 
    }
   
  })
  
  africanCountries.sort(function (a, b) {
    return a[1].localeCompare(b[1]);
  });
  
  // console.log(JSON.stringify(africanCountries))
  */
  
  
  
  let allNames = []
  data.africaCountries.forEach((e, i ) => {
    allNames.push(e[0])
  })
  console.log(allNames)
  let test = arr1IncludesArr2atProp3(data.indicators.gini, allNames, 'Country Name')
  console.log(test);
  let hdiNames = []
  test.forEach((e, i) => {
    hdiNames.push(e['Country Name'])
  })
  console.log(hdiNames)
  
  let difference = allNames.filter(x => !hdiNames.includes(x));
  console.log(difference)
  
  
  
  /*
  
  let properCountryNamesSorted = properCountryNames.sort((a, b) => {
   a[1] > b[1];
  })
  console.log(JSON.stringify(properCountryNamesSorted))
  
  
  let iso3List = [];
  data.africaCountries.forEach((e) => {return iso3List.push(e[2]);});
  
  let difference = iso3List.filter(x => !properCountryNames.includes(x));
  
  
  console.log(difference)
  let dataOnlyAfrica = arr1IncludesArr2atProp3(data.indicators.population, iso3List, 'Country Code')
  console.log(dataOnlyAfrica);
  
  let allWithData = []
  dataOnlyAfrica.forEach((e, i) => {
    allWithData.push([e['Country Name'], e['Country Code']]);
  })
  allWithData = allWithData.splice(-2, 2);
  let allWithDataSorted = allWithData.sort((a, b) => { a[1] - b[1]; })
  console.log(allWithDataSorted)
  console.log(JSON.stringify(allWithDataSorted))
  
  allWithDataSorted.forEach((e, i) => {
    
  })
  */
  // difference = allWithData.filter(x => !properCountryNames.includes(x));
  //console.log(difference)