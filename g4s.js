function g4s() {}

g4s.init = function(data, container, tuning, height, width, charge, link_d, link_s) {
    initSets(data, container, tuning, height, width, charge, link_d, link_s); 
}

g4s.setCharge = function(charge) {
    CHARGE = charge;
    simulation.force("charge").strength(CHARGE);
    simulation.alpha(1).restart();
}

g4s.setLinkDistance = function(distance) {
    LINK_DISTANCE = distance;
    simulation.force("link").distance(LINK_DISTANCE);
    simulation.alpha(1).restart();
}

g4s.setLinkStrenght = function(strength) {
    LINK_STRENGTH = strength;
    simulation.force("link").strength(LINK_STRENGTH);
    simulation.alpha(1).restart();
}

const SET_AREA_RATIO = 0.2;
var HEIGHT = 800;
var WIDTH = 800;
var CHARGE = 500;
var LINK_DISTANCE = 20;
var LINK_STRENGTH = 0.2;
var ZOOMED = false;
var links_master = [];
var graph_master = [];
var graph = [];
var links = [];
var svg, simulation, node, link, label, valueLabel;
var nodeGroup, textGroup, linkGroup;
var selected_sets = new Set();
var MAX_INTERSECTION;
var inspector_message = {};

var color = d3.scaleOrdinal(d3.schemeCategory10);

var lablelLength = d => d.label ? d.label.length : 0;
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

function initSets(raw_graph, container, tuning, height, width, charge, link_d, link_s) {
  
  if(height) HEIGHT = height;
  if(width) WIDTH = width;
  if (charge) CHARGE = charge;
  if(link_d) LINK_DISTANCE = link_d;
  if(link_s) LINK_STRENGTH = link_s;

  container_element = document.getElementById(container);


  var svg_DOM = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg_DOM.setAttribute("height", HEIGHT);
  svg_DOM.setAttribute("width", WIDTH);

  container_element.append(svg_DOM);

  svg = d3.select("svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height"),
        AREA = WIDTH * HEIGHT;
        g = svg.append("g").attr("transform", "translate(32," + (HEIGHT / 2) + ")");

  simulation = d3.forceSimulation()
        .force("collide", d3.forceCollide( d => getNodeCollisionRadius(d)))
        .force("link", d3.forceLink().id( d => d.id ).distance(LINK_DISTANCE).strength(LINK_STRENGTH)) 
        .force("charge", d3.forceManyBody().strength( -CHARGE ))
        .force("center", d3.forceCenter(WIDTH / 2 , HEIGHT / 2))
        .force("X", d3.forceX(width / 2).strength(d => d.group == 1 ? 0 : +d.size/MAX_INTERSECTION))
        .force("Y", d3.forceY(height / 2).strength(d => d.group == 1 ? 0 : +d.size/MAX_INTERSECTION)); 
  
  var scaleArea = d3.scaleLinear()
      .domain([1, raw_graph.reduce((total, set) => total + set.size, 0)])
      .range([300, AREA * SET_AREA_RATIO]);

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

  init(container);

  if(tuning) setFroceControls();
}


function init() {

    graph = graph_master.slice(0);
    
    linkGroup = svg.append("g").attr("class", "links");

    link = linkGroup.selectAll("link")
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
            .attr("id", getId)
            .attr("class",l => "l"+l.id.split("to")[0]+ " l"+l.id.split("to")[1]);
    link.exit().remove();
    link = linkEnter.merge(link);

    var nodeEnter = node
      .enter()
        .append("circle")
        .attr("r", d => d.r )
        .attr("fill", d =>  d.group == 1 ? color(d.sets[0]) : "white" )
        .style("stroke", d => d.group != 1 ? blendColors(d.sets.map(color)) : "#fff") 
        .style("stroke-width", d => d.group != 1 ? 5 : 1.5 )
        .attr("id", getId)  //.attr("id", d => d.id )
        .attr("class", d => d.group == 1 ? "set" : "intersection " + d.sets.map(s => "g" + s).join(" "))
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

  link = linkGroup.selectAll("line")
      .data(links, getId);
   
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
        d3.selectAll("." + d.id)
                 .attr("fill", set_color);

        d3.selectAll(".l" + d.id)
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
      
            d3.selectAll("." + d.id)
                         .attr("fill", "white");
  
            d3.selectAll(".l" + d.id)
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

function adjustCharge() {
  simulation.force("charge").strength(+this.value);
  document.getElementById("range_value_charge").innerHTML = this.value;
  simulation.alpha(1).restart();
}

function adjustLinkDistance() {
  simulation.force("link").distance(+this.value);
  document.getElementById("range_value_link_distance").innerHTML = this.value;
  simulation.alpha(1).restart();
}

function adjustLinkStrenght() {
  simulation.force("link").strength(+this.value);
  document.getElementById("range_value_link_strength").innerHTML = this.value;
  simulation.alpha(1).restart();
}

function setFroceControls() {
    var force_controls, force_controls_list, link_strength_li, link_distance_li, charge_li, link_strength_input, link_distance_input, charge_input;
    var link_strength_span, link_distance_span, charge_span, ul;
    force_controls = document.createElement("div");
    force_controls.setAttribute("id", "force_controls");
    force_controls_list = document.createElement("ul");
    force_controls_list.setAttribute("id", "force_controls_list");

    ul = document.createElement("ul");
    ul.setAttribute("id", "force_control_list");
    link_strength_li = document.createElement("li");
    link_distance_li = document.createElement("li");
    charge_li = document.createElement("li");

    link_strength_input = document.createElement("input");
    link_strength_input.setAttribute("id", "link_strength_control");
    link_strength_input.setAttribute("type", "range");
    link_strength_input.setAttribute("class", "force_controls");
    link_strength_input.setAttribute("min", "0");
    link_strength_input.setAttribute("max", "1");
    link_strength_input.setAttribute("step", "0.01");
    link_strength_input.value = LINK_STRENGTH;

    link_strength_span = document.createElement("span");
    link_strength_span.setAttribute("id", "range_value_link_strength");
    link_strength_span.setAttribute("class", "controls_value");
    link_strength_span.innerHTML = LINK_STRENGTH;

    link_strength_li.append(link_strength_input);
    link_strength_li.append(" link strength ");
    link_strength_li.append(link_strength_span);

    link_distance_input = document.createElement("input");
    link_distance_input.setAttribute("id", "link_distance_control");
    link_distance_input.setAttribute("type", "range");
    link_distance_input.setAttribute("class", "force_controls");
    link_distance_input.setAttribute("min", "10");
    link_distance_input.setAttribute("max", "100");
    link_distance_input.setAttribute("step", "1");
    link_distance_input.value = LINK_DISTANCE;

    link_distance_span = document.createElement("span");
    link_distance_span.setAttribute("id", "range_value_link_distance");
    link_distance_span.setAttribute("class", "controls_value");
    link_distance_span.innerHTML = LINK_DISTANCE;

    link_distance_li.append(link_distance_input);
    link_distance_li.append(" link distance ");
    link_distance_li.append(link_distance_span);

    charge_input = document.createElement("input");
    charge_input.setAttribute("id", "charge_control");
    charge_input.setAttribute("type", "range");
    charge_input.setAttribute("class", "force_controls");
    charge_input.setAttribute("min", "0");
    charge_input.setAttribute("max", "2000");
    charge_input.setAttribute("step", "1");
    charge_input.value = CHARGE;

    charge_span = document.createElement("span");
    charge_span.setAttribute("id", "range_value_charge");
    charge_span.setAttribute("class", "controls_value");
    charge_span.innerHTML = CHARGE;

    charge_li.append(charge_input);
    charge_li.append(" charge ");
    charge_li.append(charge_span);

    force_controls.append(ul);
    ul.append(link_strength_li);
    ul.append(link_distance_li);
    ul.append(charge_li);

    var twitter_graph = document.getElementById("twitter_graph");
    twitter_graph.append(force_controls);
    
    d3.select("#charge_control").on("input", adjustCharge);
    d3.select("#link_distance_control").on("input", adjustLinkDistance);
    d3.select("#link_strength_control").on("input", adjustLinkStrenght);
}


function ticked() {
  link
      .attr("x1", d => d.source.x )
      .attr("y1", d => d.source.y )
      .attr("x2", d => d.target.x )
      .attr("y2", d => d.target.y );
  node
      .attr("cx", d =>  Math.max(d.r, Math.min(WIDTH - d.r, d.x)))     
      .attr("cy", d =>  Math.max(d.r, Math.min(HEIGHT - d.r, d.y)));
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