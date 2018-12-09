/* global d3 */
/* global data */
function lpg () {
   const margin = {top: 50, right: 20, bottom: 50, left: 0};
  let w = 130 - margin.left - margin.right;
  let h = 260 - margin.top - margin.bottom;
  
  let graph = d3.select('#lpg-graph')
    .append('svg')
    .attr('width', w + margin.left + margin.right)
    .attr('height', h + margin.top + margin.bottom)
    
  let mContainer = appendGroupTo('mContainer', graph)
  
  // Chart branch
  let chart = appendGroupTo('chart', mContainer);
    
    // Axes
    let axes = appendGroupTo('axes', chart);
    // Data container
    let dataCont = appendGroupTo('dataCont', chart);
      // indivdual structure per country defined later

  // Modal branch
  let modal = appendGroupTo('modal', mContainer);


  mContainer.attr('transform', `translate(${margin.left}, ${h+margin.top})`)
  
  let xScale, xAxis, yScale, yAxis;

  // Remove those to general later
  let xAxisCont = appendGroupTo('xAxisCont', axes);
  let yAxisCont = appendGroupTo('yAxisCont', axes);
  
  var tomorrow = new Date('2009');
  tomorrow.setDate(tomorrow.getDate() + 1);
  /*
  xScale = d3.scaleTime()
      .domain([new Date('1990'), tomorrow])
      .range([0, w])
  xAxis = d3.axisBottom(xScale)

  xAxisCont.append("g").attr('class', 'axis')
      .call(xAxis.ticks(0));
  */
  
  yScale = d3.scaleLinear()
    .domain([0, 220000])
    .range([0, -h])
  yAxisCont.attr('transform', `translate(${w}, 0)`)
    
  yAxis = d3.axisRight(yScale)
  yAxisCont.append("g").attr('class', 'axis')
      .call(yAxis.ticks(2));
  
  xAxisCont.append("text").attr('class', 'label')
      .attr("transform",
            "translate(" + (30) + " ," +
                           (margin.bottom - 35) + ")")
      .style("text-anchor", "middle")
      .text("1990");
      
  xAxisCont.append("text").attr('class', 'label')
    .attr("transform",
          "translate(" + (70) + " ," +
                         (margin.bottom - 35) + ")")
    .style("text-anchor", "middle")
    .text("2009");
      

  yAxisCont.append("text").attr('class', 'label')
      .attr("y", `${-h - 10}`)
      .attr("x", `${-w}`)
      .text(`LPG consumption in tonnes`);
      
  dataCont.append('rect')
    .attr('x', 20)
    .attr('y', `${yScale(5000)}`)
    .attr('width', 20)
    .attr('height', `${yScale(5000)*-1}`)
    .style('fill', 'rgb(252, 195, 11)')
    
  dataCont.append('rect')
    .attr('x', 60)
    .attr('y', `${yScale(220000)}`)
    .attr('width', 20)
    .attr('height', `${yScale(220000)*-1}`)
    .style('fill', 'rgb(252, 195, 11)')
  
  yAxisCont.selectAll('.tick').select('line').attr('x1', `${-w}`).style("stroke-dasharray", ("3, 3")).style('stroke', '#888')
  yAxisCont.select('.domain').remove()
  
}