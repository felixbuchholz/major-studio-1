/* global d3 */
/* global data */
let buildMap = () => {
    let map = d3.select("#death-map").append("svg");
    // let scaleFactor = 0.5;
    let scale =  (scaleFactor) => {
        return d3.geoTransform({
            point: function(x, y) {
                this.stream.point(x * scaleFactor + window.innerWidth/2, -1 * y * scaleFactor + window.innerHeight/2);
            }
        });
    };
        console.log(data.worldGeo)
     let featureElement = map.selectAll("path")
    	.data(data.worldGeo.features)
    	.enter()
        .append("path")
        .attr("d", d3.geoPath().projection(scale(4)))
        .attr('transform', 'translate(-250, -80)')
        .attr("stroke", "white")
        .attr('stroke-width', 2)
        .attr("fill", (d, i) => {
          if (true) {
            let myOp = Math.random();
            return `rgba(0, 0, 0, ${myOp})`;
          } else {
            return '#eee';
          }
        })
        .attr("fill-opacity", 0.5);
}

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