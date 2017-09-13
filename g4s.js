const SET_AREA_RATIO = 0.2;
var margin = 20;
var ZOOMED = false;
var links_master = [];
var graph_master = [];
var graph = [];
var links = [];
var node, link, label, valueLabel;
var nodeGroup, textGroup;
var selected_sets = new Set();
var MAX_INTERSECTION;
var inspector_message = {};

var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height"),
    area = width * height;
    g = svg.append("g").attr("transform", "translate(32," + (height / 2) + ")");

svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    .style("fill", "none")
    .style("pointer-events", "all");
    
var color = d3.scaleOrdinal(d3.schemeCategory10);

var lablelLength = d => d.label ? d.label.length : 0;

var simulation = d3.forceSimulation()
    .force("collide", d3.forceCollide( d => getNodeCollisionRadius(d)))
    .force("link", d3.forceLink().id( d => d.id ).distance(20).strength(0.2)) 
    .force("charge", d3.forceManyBody().strength( -500 ))
    .force("center", d3.forceCenter(width / 2 , height / 2))
    .force("X", d3.forceX(width / 2).strength(d => d.group == 1 ? 0 : +d.size/MAX_INTERSECTION))
    .force("Y", d3.forceY(height / 2).strength(d => d.group == 1 ? 0 : +d.size/MAX_INTERSECTION)); 

var findLink = linkid => element => element.id == linkid;
var getId = s => s.id; 
var getLabelID = s => "n" + s.id;

function blendColors(colors) {

  	var regseg = /[\da-z]{2}/gi;
  	
  	var d2h = v => v.toString(16);
  	var h2d = v => parseInt(v, 16);
  	 
  	var ch = [];
	
  	for (var i = colors.length - 1; i >= 0; i--) {
  		ch[i] = colors[i].match(regseg);
  	}
	
  	let average_seg = [], blend = [];
    
    for (var i = 2; i >= 0; --i) {
	       
  	    var total = 0; 
  	    
        for (var j = ch.length - 1; j >= 0; j--) {
  	    		total += h2d(ch[j][i]);
  	    }

  	    average_seg = d2h( Math.floor( total / ch.length ) );

  	    blend[i] = average_seg.length == 2 ? '' + average_seg : '0' + average_seg; 
  	 }

  	 return "#" + blend.join("");
}

function numberFormater(number) {
    if(number < 1000) return number.toFixed();
    else if (number < 1000000) return (number/1000).toFixed(1) + "K"; 
    else return (number/1000000).toFixed(1) + "M";
}
 
d3.json("static/common/js/test.json", function(error, raw_graph) {
  if (error) throw error;
  
  var scaleArea = d3.scaleLinear()
      .domain([1, raw_graph.reduce((total, set) => total + set.size, 0)])
      .range([300, area * SET_AREA_RATIO]);

  for (var i = raw_graph.length - 1; i >= 0; i--) {

   raw_graph[i].sets.sort((a,b) => a -b);
   raw_graph[i].id = "g" + raw_graph[i].sets.join("");
   raw_graph[i].group = raw_graph[i].sets.length;
   raw_graph[i].r = Math.sqrt( scaleArea(raw_graph[i].size) / Math.PI );
    
    if(raw_graph[i].group != 1) {
        for (var j = raw_graph[i].sets.length - 1; j >= 0; j--) {
        
          var link = {
            source: raw_graph[i].id,
            target: "g" + raw_graph[i].sets[j].toString(),
            id: raw_graph[i].id + "tog" + raw_graph[i].sets[j].toString(),
          }

          links_master.push(link);

        }
    }
  }

  graph_master = raw_graph.slice(0);
  links = links_master.slice(0);

  MAX_INTERSECTION = Math.max(...graph_master.filter(d => d.group != 1).map(d => +d.size));
  
  init();
});


function init() {
    graph = graph_master.slice(0);
    
    link = svg.append("g").attr("class", "links")
        .selectAll("link")
        .data(links, getId);
    
    nodeGroup = svg.append("g").attr("class", "nodes");
    node = nodeGroup.selectAll("circle")
        .data(graph, getId);

    textGroup = svg.append("g").attr("class", "texts");
    label = textGroup.selectAll(".set_name")
        .data(graph.filter(s => s.group == 1), getId);

    valueLabel = textGroup.selectAll(".valuetext")
        .data(graph, getId);
    
    updateGraph();

    simulation
        .nodes(graph)
        .on("tick", ticked);

    simulation.force("link")
        .links(links);
}
 

function updateGraph() {
    var t = d3.transition().duration(500);

    var linkEnter =  link
        .enter()
          .append("line")
            .attr("id", getId );
    link.exit().remove();
    link = linkEnter.merge(link);

    var nodeEnter = node
      .enter()
        .append("circle")
        .attr("r", d => d.r )
        .attr("fill", d =>  d.group == 1 ? color(d.sets[0]) : "white" )
        .style("stroke", d => d.group != 1 ? blendColors(d.sets.map(color)) : "#fff") 
        .style("stroke-width", d => d.group != 1 ? 5 : 1.5 )
        .attr("id", d => d.id )
        .attr("class", d => d.group == 1 ? "set" : "intersection")
          .call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended))
    nodeEnter
      .transition(t)
          .style("fill-opacity", 1);
    node.exit()
      .transition(t)
          .style("fill-opacity", 1e-6)
          .style("stroke-opacity", 1e-6)
          .remove();
    node = nodeEnter.merge(node);

    var labelEnter = label
      .enter()
        .append("text")
          .text( d => d.label )
          .attr("id", d => "n" + d.id)
          .attr("dx", d => (- d.label.length * 4.2) + "px")
          .attr("dy", d => -(d.r +5))
          .attr("class", "set_name");
    label.exit().remove();
    label = labelEnter.merge(label);

    var valueLabelEnter = valueLabel
        .enter()
          .append("text")
            .text( d => numberFormater(d.size))
            .attr( "id" , d => "vl" + d.id)
            .attr( "dx", d => (- numberFormater(d.size).length * 4.5) + "px" )
            .attr( "dy", "0.5em" )
            .attr( "class", d => getLabelClass(d))
            .style("cursor", "default")
          .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));
    valueLabel.exit().remove();
    valueLabel = valueLabelEnter.merge(valueLabel);
    
    node
      .on("mouseover", d =>focusNode(d))
      .on("mouseout", d => unfocusNode(d))
      .on("dblclick", d => selectNode(d));
    valueLabel
          .on("mouseover" , d => focusNode(d))
          .on("mouseout", d => unfocusNode(d))
          .on("dblclick", d => selectNode(d));

    simulation.restart();
}

function getLabelClass(node) {
    var nodeclass = "valuetext";

    if(node.group == 1) nodeclass += " setvaluetext";
    else nodeclass += " intersectionvaluetext";

    if(numberFormater(node.size).length * 5 >= 2 * node.r - 22) nodeclass += " smallnode";

    return nodeclass;
}

function getNodeCollisionRadius(node) {
    if(node.group != 1) return node.r + 10;
    else return Math.sqrt(Math.pow(node.r, 2) + Math.pow(lablelLength(node)*5/2, 2)) + 30;
}


 function selectNode(d) {

   if(d.group == 1) selectSet(d);
   else zoomIntersection(d);
   
 }

function zoomIntersection(d) {
     ZOOMED = !ZOOMED;

     if(ZOOMED) {
  
       var intersectionlinks = linksOfIntersection(d.id);     
       var sets = setsOfIntersection(d.sets);
       var intersectionNodes = graph.filter(s => sets.indexOf(s) != -1 || s === d);
  
       updateData(intersectionNodes, intersectionlinks);
      
     } else {
       restoreData();    
     }
     updateGraph(); 
     cleanSetSelection();
}

function cleanSetSelection() {
    selected_sets.clear();

    d3.selectAll("circle")
      .data(graph_master.filter( node => node.group == 1), getId)
        .style("stroke", "white")
        .style("stroke-dasharray", "none");

    d3.selectAll(".intersection").style("stroke-opacity", 1);
}


function selectSet(d) {
  if(ZOOMED) return;

  inspector_message = {};

  if(selected_sets.has(d.sets[0])) {
    selected_sets.delete(d.sets[0]);

    d3.select("#" + d.id)
      .style("stroke", "white")
      .style("stroke-dasharray", "none");
  } else {
    selected_sets.add(d.sets[0]);

    d3.select("#" + d.id)
      .style("stroke", "black")
      .style("stroke-dasharray", "5, 5"); 
  }

  if(selected_sets.size == 0) {

    d3.selectAll(".intersection").style("stroke-opacity", 1);

  } else if(selected_sets.size == 1) {

    let set_id = "g" + [...selected_sets][0];

    d3.selectAll(".intersection")
                     .style("stroke-opacity", s => intersectionsOfSet([...selected_sets][0]).indexOf(s) != -1 ? 1 : 0.1)
                     .attr("fill", "white");

    d3.selectAll("line")
                      .style("stroke", l => linksOfSet(set_id).indexOf(l) != -1 ? d3.select("#" + set_id).style("fill") : "grey")
                      .style("stroke-opacity", l => linksOfSet(set_id).indexOf(l) != -1 ? 1 : 0.2)
                      .style("stroke-width", 1);

    inspector_message.type = "selected_set";
    inspector_message.id = set_id;
    inspector_message.set = graph_master.find(set => set.id === set_id);

                      
  } else {
    var desired_intersection = [...selected_sets].sort((a,b) => a - b);
    
    if(d3.select("#g" + desired_intersection.join("")).empty()) return;

    d3.selectAll(".intersection")
        .style("stroke-opacity",  s => s.sets.toString() == desired_intersection.toString() ? 1 : 0.1)
        .attr("fill", "white");

    let intersection_color = d3.select("#g" + desired_intersection.join("")).style("stroke");

    d3.selectAll("line")
                     .style("stroke-opacity", l => linksOfIntersection("g" + desired_intersection.join(""))
                        .map(i => i.id).indexOf(l.id) != -1 ? 1 : 0.2)
                     .style("stroke-width", l => linksOfIntersection("g" + desired_intersection.join(""))
                        .map(i => i.id).indexOf(l.id) != -1 ? 5 : 1)
                     .style("stroke", l => linksOfIntersection("g" + desired_intersection.join(""))
                        .map(i => i.id).indexOf(l.id) != -1 ? intersection_color : "grey");

    inspector_message.type = "selected_sets";
    inspector_message.intersection = desired_intersection;
    inspector_message.size = graph.find(d => d.id === "g" + desired_intersection.join("")).size;
   
  }
  document.dispatchEvent(intersectionEvent); 
  
}


function topThreeIntersections() {

  var topThreeIntersections = graph_master.filter(s => s.group != 1)
                                    .sort((a,b) => b.size - a.size)
                                    .slice(0,3);
 
  var setsOfTopThree = topThreeIntersections
            .map(n => n.sets).reduce((total, num) => total.concat(num))
            .filter((item, index, array) => array.indexOf(item) == index);

  var topThreeSets = graph.filter(s => s.group == 1 && setsOfTopThree.indexOf(s.sets[0]) != -1);

  var topThreeNodes = topThreeIntersections.concat(topThreeSets);

  var topThreeLinks = [];

  var appendLinks = intersection => topThreeLinks = topThreeLinks.concat(linksOfIntersection(intersection.id));

  topThreeIntersections.forEach(appendLinks);

  updateData(topThreeNodes, topThreeLinks);
  updateGraph();
  cleanSetSelection();

  inspector_message = {};

  inspector_message.type = "top3";
  inspector_message.sets = topThreeSets;
  inspector_message.intersection = topThreeIntersections; 

  document.dispatchEvent(intersectionEvent); 
}


function updateData(nodes, links) {
   
  link = link.data(links);
   
  node = nodeGroup.selectAll("circle")
     .data(nodes, getId);

  valueLabel = textGroup.selectAll(".valuetext")
     .data(nodes, getId);

  label = textGroup.selectAll(".set_name")
     .data(nodes.filter(s => s.group == 1), getId);
}

function restoreData() {
  links = links_master.slice(0);

  link = link.data(links);

  graph = graph_master.slice(0);

  node = nodeGroup.selectAll("circle")
      .data(graph, getId);
    
  valueLabel = textGroup.selectAll(".valuetext")
      .data(graph, getId);
    
  label = textGroup.selectAll(".set_name")
      .data(graph.filter(s => s.group == 1), getId);
}


function focusNode(d) {
  
  if(document.getElementById("vl" + d.id).classList.contains("smallnode"))
        d3.select("#" + d.id).attr("r", d => numberFormater(d.size).length * 5 + 5),
        d3.select("#n" + d.id).attr("dy", d => - numberFormater(d.size).length * 5 -6),
        d3.select("#vl" + d.id).style("opacity", 1);

  if(selected_sets.size > 0) return;

  if(d.group == 1) {
        let set_color = d3.select("#" + d.id).style("fill");
        d3.selectAll("circle")
                 .data(intersectionsOfSet(d.sets[0]), getId)
                 .attr("fill", set_color);
        d3.selectAll("line")
                  .data(linksOfSet(d.id), getId)
                  .style("stroke", set_color)
                  .style("stroke-opacity", 1);

  if(selected_sets.size == 0)
        inspector_message = {},
        inspector_message.type ="set",
        inspector_message.size = d.size,
        inspector_message.label = d.label;

  } else {
        let intersection_color = d3.select("#" + d.id).style("stroke");

        d3.selectAll(".set_name").style("opacity", 0.4);
        d3.selectAll("circle")
                      .data(setsOfIntersection(d.sets), getId)
                      .style("stroke", intersection_color)
                      .style("stroke-width", 5);
        d3.selectAll(".set_name")
                      .data(setsOfIntersection(d.sets), getLabelID)
                      .style("opacity", 1)
                      .style("font-size", "1.2em");
        d3.selectAll("line")
                      .data(linksOfIntersection(d.id), getId)
                      .style("stroke", intersection_color)
                      .style("stroke-width", 5)
                      .style("stroke-opacity", 1);

    
   if(selected_sets.size == 0)
        inspector_message = {},
        inspector_message.type ="intersection"
        inspector_message.size = d.size,
        inspector_message.intersection= d;
  }
  document.dispatchEvent(intersectionEvent); 
}

function unfocusNode(d) {
    if(selected_sets.size == 0) inspector_message = {};

    if(document.getElementById("vl" + d.id).classList.contains("smallnode"))
        d3.select("#" + d.id).attr("r", d => d.r),
        d3.select("#n" + d.id).attr("dy", d => -(d.r +5)),
        d3.select("#vl" + d.id).style("opacity", 0);

    if(selected_sets.size > 0) return;

    if(d.group == 1) {
      
            d3.selectAll("circle")
                         .data(intersectionsOfSet(d.sets[0]), getId)
                         .attr("fill", "white");
  
            d3.selectAll("line")
                          .data(linksOfSet(d.id), getId)
                          .style("stroke", "grey")
                          .style("stroke-opacity", 0.2);
  
  } else {
            d3.selectAll(".set_name")
                .style("opacity", 1)
                .style("font-size", "1em");

            d3.selectAll("circle")
                            .data(setsOfIntersection(d.sets), getId)
                            .style("stroke", "white")
                            .style("stroke-width", 1.5);

            d3.selectAll("line")
                            .style("stroke", "grey")
                            .style("stroke-width", 1)
                            .style("stroke-opacity", 0.2);

  }

}

 var intersectionsOfSet = prime => 
       graph.filter( member => member.sets.indexOf(prime) != -1 && member.sets.length > 1 );
 
 var linksOfSet = prime =>
       links.filter( member => member.target.id === prime );

 var setsOfIntersection = intersection => 
        graph.filter( member => intersection.indexOf(member.sets[0]) != -1 && member.group == 1 );
 
 var linksOfIntersection = intersection => 
        links.filter( member => member.source.id == intersection );

function updateInspector(text) {
  document.getElementById("inspector").innerHTML = text;
}
 

function ticked() {
  link
      .attr("x1", d => d.source.x )
      .attr("y1", d => d.source.y )
      .attr("x2", d => d.target.x )
      .attr("y2", d => d.target.y );
  node
      .attr("cx", d =>  Math.max(d.r, Math.min(width - d.r, d.x)))     
      .attr("cy", d =>  Math.max(d.r, Math.min(width - d.r, d.y)));
  label
      .attr("x", d => d.x)
      .attr("y", d => d.y);
  valueLabel
      .attr("x", d => d.x)
      .attr("y", d => d.y);
  
}

function dragstarted(d) {
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
  d.fixed = true;
}

function dragended(d) {
  d.fx = null;
  d.fy = null;
  simulation.stop();
}
