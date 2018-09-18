RiTa.loadString('transforming-lives.txt', stringCallback);

var myCon = {};
var myNodes = {};

function stringCallback(text) {

  var myStem = RiTa.stem(text, RiTa.PLING)

  var args = {
   ignoreCase: true,
   ignoreStopWords: true,
   wordCount: 10,
   ignorePunctuation: true,
  };
  myCon = RiTa.concordance(myStem, args);

  for (var element in myCon) {
    // console.log(!isNaN(element));
    if (!isNaN(element[0]) || element.includes('/') || element.includes('+') || element.length < 3) {
      delete myCon[element];
    }
  }

  myCon['per cent'] = myCon.per + myCon.cent;
  delete myCon.cent;
  delete myCon.per;

  var sortable = [];
  for (var word in myCon) {
      sortable.push([word, myCon[word]]);
  }
  sortable.sort(function(a, b) {
      return b[1]- a[1];
    });

  var nodes = [];

  // console.log(sortable);
  for (var i = 0; i < 300; i++) {
    nodes.push({name: sortable[i][0], count: sortable[i][1]})
    myNodes['nodes'] = nodes;
  };

  var myKwic = RiTa.kwic(text, 'energy', args);
  // console.log(myKwic);

  for (var i = 0; i < myKwic.length; i++) {
    myKwic[i] = RiTa.stem(myKwic[i], RiTa.PLING)
    myKwic[i] = new RiString(myKwic[i])
    myKwic[i] = myKwic[i].words();
    myKwic[i] = measureDistance(myKwic[i])
  }
  console.log(myKwic);


  myd3();
};
// ––––––––––––––––––––––––––d3–––––––––––––––––––––––
function measureDistance(array) {
  var myArray = [];
  for (var j = 0; j < array.length; j++) {
    var distance;
    if (j < array.indexOf('energy')) {
      distance = array.indexOf('energy') - j;
    } else {
      distance = j - array.indexOf('energy');
    }

    myArray.push([array[j], distance]);
  }
  return myArray
}

var chartDiv = document.getElementById("chart");
var svg = d3.select(chartDiv).append("svg");
var force;
var nodes;
var myTextSize = 3;

function myd3() {

  var width = chartDiv.clientWidth;
  var height = chartDiv.clientHeight;

  svg
    .attr("width", width)
    .attr("height", height);

  var dataset = myNodes;
  console.log(dataset);

  //Initialize a simple force layout, using the nodes and edges in dataset
  force = d3.forceSimulation(dataset.nodes)
  			  .force("charge", d3.forceManyBody().strength(21))
  				// .force("link", d3.forceLink(dataset.edges).distance(30))
  			  .force("center", d3.forceCenter().x(width/2).y(height/2))
  				.force("collision", d3.forceCollide().radius(function(d, i) {
  					return d.count*0.75+d.name.length*1.4;
  				}));

  var colors = d3.scaleOrdinal(d3.schemeCategory10);


  //Create edges as lines
  /*
  var edges = svg.selectAll("line")
  	.data(dataset.edges)
  	.enter()
  	.append("line")
  	.style("stroke", "#eee")
  	.style("stroke-width", 1);
  */

  //Create nodes as circles

  nodes = svg.selectAll("g")
  	.data(dataset.nodes)
  	.enter()
  	.append("g")

  var circles = nodes.append("circle")
  	.attr("r", function(d, i) {
  		return d.count;
  	})
  	.style("fill", function(d, i) {
  		return colors(i);
  	})
  	.style("fill-opacity", 0)
  	.call(d3.drag()  //Define what to do on drag events
  		.on("start", dragStarted)
  		.on("drag", dragging)
  		.on("end", dragEnded));

  //Add a simple tooltip
  nodes.append("title")
  	 .text(function(d) {
  		return d.name;
  	 });

  var texts = nodes.append("text")
  	.text(function(d) {
  	return d.name;
  	})
  	.style("fill", "black")
  	.style("text-anchor", "middle")
  	.style("font-size", function(d) {
  		return d.count*0.4 + 2 + "px"
  	})
  	.style("x", "0")
  	.style("y", "0")


  //Every time the simulation "ticks", this will be called
  force.on("tick", function() {
    /*
  	edges.attr("x1", function(d) { return d.source.x; })
  		 .attr("y1", function(d) { return d.source.y; })
  		 .attr("x2", function(d) { return d.target.x; })
  		 .attr("y2", function(d) { return d.target.y; });
    */

  	nodes.attr("cx", function(d) { return d.x; })
  		 .attr("cy", function(d) { return d.y; });

    circles.attr("cx", function(d) { return d.x; })
  		 .attr("cy", function(d) { return d.y; });

    texts.attr("x", function(d) { return d.x; })
  			.attr("y", function(d) { return d.y; });


  });
}

//Define drag event functions
function dragStarted(d) {
	if (!d3.event.active) force.alphaTarget(0.3).restart();
	d.fx = d.x;
	d.fy = d.y;
}

function dragging(d) {
	d.fx = d3.event.x;
	d.fy = d3.event.y;
}

function dragEnded(d) {
	if (!d3.event.active) force.alphaTarget(0);
	d.fx = null;
	d.fy = null;
}

window.addEventListener("resize", myd3);
