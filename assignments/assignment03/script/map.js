/* global d3 */
/* global data */
let buildMap = () => {

  let myCombinedDataset = data.worldGeo;
  myCombinedDataset.features.forEach((country, i) => {
    data.worldDeath.forEach((datum, j) => {
      //console.log(country)
      if (country.id == datum['Country Code']) {
        country['deathrate'] = datum['2015']
      }
    })
  })
  //console.log(myCombinedDataset)
  
    let map = d3.select("#death-map").append("svg");
    // let scaleFactor = 0.5;
    let scale =  (scaleFactor) => {
        return d3.geoTransform({
            point: function(x, y) {
                this.stream.point(x * scaleFactor + window.innerWidth/2, -1 * y * scaleFactor + window.innerHeight/2);
            }
        });
    };
    
    let deathratesArr = [];
    myCombinedDataset.features.forEach((e, i) => {
      deathratesArr.push(parseFloat(e.deathrate));
    })
    // console.log(d3.max(deathratesArr))
    let colorScale = d3.scaleSequential(d3.interpolateYlOrBr).domain([0, d3.max(deathratesArr)]);
    
     let featureElement = map.selectAll("path")
    	.data(myCombinedDataset.features)
    	.enter()
        .append("path")
        .attr("d", d3.geoPath().projection(scale(4)))
        .attr('transform', 'translate(-250, -80)')
        .attr("stroke", "white")
        .attr('stroke-width', 2)
        .attr("fill", (d, i) => {
          // console.log(isNaN(d.deathrate))
          if (isNaN(d.deathrate)) {
            return `rgb(250, 250, 250)`;
          } else {
            return colorScale(d.deathrate);
          }
        })
        .attr("fill-opacity", 1);
  let margin = ({top: 0, right: 40, bottom: 20, left: 40})
  let height = 50;
  let barHeight = 10;
  let width = 700;
  
  
  
  let legend = d3.select("#death-legend").append("svg");
  
  
  const defs = legend.append("defs");
  
  const linearGradient = defs.append("linearGradient")
      .attr("id", "linear-gradient");
  
  linearGradient.selectAll("stop")
    .data(colorScale.ticks().map((t, i, n) => ({ offset: `${100*i/n.length}%`, color: colorScale(t) })))
    .enter().append("stop")
    .attr("offset", d => d.offset)
    .attr("stop-color", d => d.color);
  
  let axisScale = d3.scaleLinear()
    .domain(colorScale.domain())
    .range([margin.left, width - margin.right])
    
 let axisBottom = g => g
    .attr("class", `x-axis`)
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(axisScale)
      .ticks(7)
      .tickSize(-barHeight))
  
  legend.append('g')
    .attr("transform", `translate(0,${height - margin.bottom - barHeight})`)
    .append("rect")
    .attr('transform', `translate(${margin.left}, 0)`)
	.attr("width", width - margin.right - margin.left)
	.attr("height", barHeight)
	.style("fill", "url(#linear-gradient)");
  
  legend.append('g')
    .call(axisBottom);
    
    
  legend.selectAll('text').attr('y', '6')
  // .style('font-size', '12px')
}
  /*
  else if (d.deathrate==0) {
            return `rgb(250, 250, 250)`;
          } 
  */
  /*  .on('mouseover', function(d) {
        console.log(d.properties.subregion);
        d3.select(this).attr("fill", (d, i) => {
          if (d.properties.subregion == 'Middle Africa') {
            return '#e41a1c';
          } else if (d.properties.subregion == 'Western Africa') {
            return '#377eb8';
          } else if (d.properties.subregion == 'Northern Africa') {
            return '#4daf4a';
          } else if (d.properties.subregion == 'Eastern Africa') {
            return '#984ea3';
          } else if (d.properties.subregion == 'Southern Africa') {
            return '#ff7f00';
          }
        });
        d3.select("#hover")
            .text(d.properties.name.toUpperCase() + ' (Population: ' + (d.properties.pop_est/1000000).toFixed(1) + 'Mio.) ' + 'Region: ' + d.properties.subregion);
        d3.select('#hover').attr("fill-opacity", 1);
    })
    .on('mouseout', function() {
        d3.select(this).attr("fill", "lightgray");
        d3.select('#hover').attr("fill-opacity", 0);
    })
    .on('mousemove', function(d) {
        d3.select("#hover")
            .attr('x', function() { return d3.mouse(this)[0] + 20; })
            .attr('y', function() { return d3.mouse(this)[1] + 10; });
    });

    */

// svg.append("text")
//    .attr('id', 'hover');