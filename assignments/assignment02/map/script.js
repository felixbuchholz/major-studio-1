///////////////////////
/* buttons */

var width = 960,
    height = 1000;

var svg = d3.select("div.svg").append("svg")
    .attr("width", width)
    .attr("height", height);

// var div = d3.select("body").append("div")
//     .attr("class", "tooltip")
//     .style("opacity", 0);


var tooltip = {
    element: null,
    init: function() {
        this.element = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);
    },
    show: function(t) {
        this.element.html(t).transition().duration(200).style("left", d3.event.pageX + 20 + "px").style("top", d3.event.pageY - 20 + "px").style("opacity", .9);
    },
    move: function() {
        this.element.transition().duration(30).ease("linear").style("left", d3.event.pageX + 20 + "px").style("top", d3.event.pageY - 20 + "px").style("opacity", .9);
    },
    hide: function() {
        this.element.transition().duration(500).style("opacity", 0)
    }};

tooltip.init();

var numFormat = d3.format(",d");




var toGreyExcept = function(t) {

  var color = d3.select(t).style("fill");
  console.log(color)
  d3.selectAll(".subunit").style("fill", function(d) {

    //var a = e.data.color;


    if (!t || this === t) {

      return; }
    return "#cccccc";

    // var n = d3.rgb(a).hsl().darker(2);
    // n.s *= .9;
    // return n.toString()

  });
};
/*
console.log(se);
// Okay what I want to do is: whenever the Country Name matches, the country array is updated with the the properties Indicator Code and the value for 2016 (or an array with all the years, that are not empty)
se.forEach((element, i) => {console.log(parseFloat(element['2015'])+parseFloat(element['2016']))})
*/

d3.csv("data/se4data.csv", function(error, se) {
  if (error) return console.error(error);


 d3.json("data/africaTopoMap.json", function(error, data) {
   if (error) return console.error(error);


   var colorScale = d3.scale.threshold()
     .domain([ 1,  10, 20, 30, 40, 50, 60, 70, 80, 90, 100])
     .range(colorbrewer.RdYlGn["11"]);

   formatValue = d3.format("s");

   // A position encoding for the key only.
   var x = d3.scale.linear()
       .domain([10, 100])
       .range([0, 600]);



   var xAxis = d3.svg.axis()
       .scale(x)
       .orient("bottom")
       .tickSize(13)
       .tickValues(colorScale.domain())
       .tickFormat(function(d) { return formatValue(d)});

   // key
   var g = svg.append("g")
       .attr("class", "key")
       .attr("transform", "translate(170,50)");

   g.selectAll("rect")
       .data(colorScale.range().map(function(d, i) {
         return {
           x0: i ? x(colorScale.domain()[i - 1]) : x.range()[0],
           x1: i < colorScale.domain().length ? x(colorScale.domain()[i]) : x.range()[1],
           z: d
         };
       }))
     .enter().append("rect")
       .attr("height", 8)
       .attr("x", function(d) { return d.x0; })
       .attr("width", function(d) { return d.x1 - d.x0; })
       .style("fill", function(d) { return d.z; });

   g.call(xAxis).append("text")
       .attr("class", "caption")
       .attr("y", -16)
       .text("Access to Clean Fuels and Cooking Technology in Africa in %");
   // key end

   var formatNumber = d3.format(",.0f");

   var subunits = topojson.feature(data, data.objects.collection);

   var projection = d3.geo.mercator()
       .center([15, 5])
       .scale(600)
       .translate([width / 2, height / 2]);


   // var projection = d3.geo.albers()
   //     .center([0, 55.4])
   //     .rotate([4.4, 0])
   //     .parallels([50, 60])
   //     .scale(6000)
   //     .translate([width / 2, height / 2]);

   var path = d3.geo.path()
       .projection(projection);

   // function createStuff () {

   d3.selectAll(".subunit").remove();

   var map = svg.append("g")
                 .attr("class", "map");

  // TODO: continue working here!
  // console.log(se);
  var dataset = topojson.feature(data, data.objects.collection).features
  console.log(dataset);
  // var results = dataset.filter(function (entry) { return entry.properties.adm0_a3 == "AGO"; });
  var se21 = se.filter(function (entry) { return entry['Indicator Code'] == "2.1_ACCESS.CFT.TOT"; });
  dataset.forEach((dElement, di) => {
    se21.forEach((sElement, si) => {
      if (dElement.properties.adm0_a3 == sElement['Country Code']) {
        console.log(dElement.properties.adm0_a3);
        dElement['accessCleanFuels'] = sElement;
      }
    })
    if (dElement['accessCleanFuels'] == undefined) {
      console.log('undef');
    }
  });
  console.log(se21);

   var countries = map.selectAll(".subunit")
       .data(dataset)
       //.data(topojson.feature(uk, uk.objects.subunits).features)
       .enter().append("path")
       .attr("class", function(d) { return "subunit " + d.properties.subunit; })
       .attr("d", path)
       .style("fill", function(d, i) {
         return colorScale(d.accessCleanFuels == undefined? 0 : parseFloat(d.accessCleanFuels['2016']));
       });

   // countries.append("title")
   //         .text(function(d, i) { return d.properties.subunit; });

   countries.on("mouseover", function (d, i) {
       //console.log(this)
       tooltip.show(`<b>${d.properties.subunit}</b><br>Access to clean fuels:  ${d.accessCleanFuels === undefined? 0 : parseFloat(d.accessCleanFuels['2016']).toFixed(2)} %`);
       // toGreyExcept(this);
   });


   countries.on("mousemove", function (d, i) {
       tooltip.move();
       })
       .on("mouseout", function (d, i) {
       //createStuff();
       tooltip.hide();
   });

   // }  // createStuff end
   // createStuff();

   map.append("path")
       .datum(topojson.mesh(data, data.objects.collection, function(a, b) { return a !== b; }))
       .attr("d", path)
       .attr("class", "subunit-boundary");



   // svg.append("path")
   //     .datum(subunits)
   //     .attr("d", path);

 });


})

// bl.ocks resize
d3.select(self.frameElement).style("height", height + 80 + "px");

/*
// https://stackoverflow.com/questions/23218174/how-do-i-save-export-an-svg-file-after-creating-an-svg-with-d3-js-ie-safari-an
function saveSvg(svgEl, name) {
    console.log(svgEl);
    svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    var svgData = svgEl.outerHTML;
    var preface = '<?xml version="1.0" standalone="no"?>\r\n';
    var svgBlob = new Blob([preface, svgData], {type:"image/svg+xml;charset=utf-8"});
    var svgUrl = URL.createObjectURL(svgBlob);
    var downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = name;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

saveSvg(svg[0][0], 'test.svg')
*/
