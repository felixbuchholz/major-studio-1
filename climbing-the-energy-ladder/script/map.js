/* global d3 */
/* global data */

let scale =  (scaleFactor) => {
    return d3.geoTransform({
        point: function(x, y) {
            this.stream.point(x * scaleFactor, -1 * y * scaleFactor);
        }
    });
};

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
    let contWidth = d3.select('#death-map-container').node().getBoundingClientRect().width;
    // console.log(contWidth)
    let map = d3.select("#death-map")
      .append("svg")
        .attr('width', `${contWidth}`)
        .attr('height', `${contWidth*0.42}`)
      .append('g');
    // let scaleFactor = 0.5;

    
    let deathratesArr = [];
    myCombinedDataset.features.forEach((e, i) => {
      deathratesArr.push(parseFloat(e.deathrate));
    })
    // console.log(d3.max(deathratesArr))
    let colorScale = d3.scaleSequential(d3.interpolateYlOrBr).domain([0, d3.max(deathratesArr)]);
    
     let featureElement = map.selectAll("path")
    	.data(myCombinedDataset.features, function(d) {return d.properties.name})
    	.enter()
        .append("path")
        .attr("d", d3.geoPath().projection(scale(4)))
        .attr('transform', 'translate(600, 350)')
        .attr("stroke", "white")
        .attr('stroke-width', 1)
        .attr("fill", (d, i) => {
          // console.log(isNaN(d.deathrate))
          if (isNaN(d.deathrate)) {
            return `rgb(250, 250, 250)`;
          } else {
            return colorScale(d.deathrate);
          }
        })
        .attr("fill-opacity", 1)
        .on("mouseenter", mouseoverMap)
          .on("mousemove", mousemoveMap)
          .on("mouseleave", mouseoutMap)
          .on("click", clickToDashMap);
        
  // ––––––––––––––––––––––– LEGEND
  
  
  let margin = ({top: 0, right: 0, bottom: 20, left: 3})
  let height = 50;
  let barHeight = 10;
  let width = 450;
  
  
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
  
  // ------------------- legend
  
}

var tooltipMap = d3.select("#death-map-outer")
    .append("div")
      .attr("class", "my-tooltip")
      .style("opacity", 0);

function mouseoverMap(d){
  tooltipMap.transition()
    .duration(200)
    .style("opacity", 1);
}

function mousemoveMap(d){
    // console.log(d);
    d3.select(this).classed('active-country', true).raise();
    // Data – DOM does get out of sync. Observe that. https://stackoverflow.com/questions/14167863/how-can-i-bring-a-circle-to-the-front-with-d3
    // .raise();
    tooltipMap.html(`Country: <span class='em'>${d.properties.name}</span> <br /> Death Rate from Household Air Pollution: <span class='em'>${parseFloat(d.deathrate).toFixed(0)}</span>`)
      .style("left", (d3.event.pageX - 170) + "px")
      .style("top", (d3.event.pageY - 150) + "px");
}

function mouseoutMap(d){
    d3.select(this).classed('active-country', false);
    tooltipMap.transition()
      .duration(500)
      .style("opacity", 0);
}

function clickToDashMap (d) {
  let country = d.properties.name;
  console.log(country)
  if (country == 'United Republic of Tanzania') {
    country = 'Tanzania';
  }
  selectCountry(country);
  document.querySelector('#holistic').scrollIntoView({
            block: 'start',
            behavior: 'smooth'
        });
 // window.location.href = '#holistic';
}

function resizeMap() {
  let contWidth = d3.select('#death-map-container').node().getBoundingClientRect().width;
    // console.log(contWidth)
  d3.select("#death-map").select('g').attr('transform', `scale(${1*contWidth/1458})`);
  d3.select("#death-map")
    .select("svg")
      .attr('width', `${contWidth}`)
      .attr('height', `${contWidth*0.42}`)
}


d3.select(window)
  .on("resize", sizeChange);
  
function sizeChange() {
  resizeMap();
}
