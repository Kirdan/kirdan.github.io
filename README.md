# Graph for Sets

[Live demo](https://kirdan.github.io/)

## Overview
The motivation for this project is introducing a new methodology for visualizing sets and intersections. Understanding relationships between sets and their intersections provides insights that are useful for data analysis.

When thinking about data intersections Venn diagrams and Euler diagrams immediately come to mind. However once dealing with more than 3 sets these diagrams become very complex and hard to understand. The more sets we add more tangled and contraintiative the visualization gets. More so, when attempting to keep Venn diagram scaled the visual challenge become even harder.

## Concept

Graph for Sets (g4s) is a new way of displaying sets and intersections. g4s aims to be simple, intuitive, scalable as well as aesthetically pleasing. The concept utilizes topological graph, following these rules and conventions:

Sets and Intersections are represented as 2 types of vertices, disks and rings, where sets are disks and intersections are rings. For example, the following represent sets A and B and their intersection AnB:
<p align="center">
 <img src="m/AnB.png">
</p>
Sets and their intersections are connected with edges(links):
<p align="center">
 <img src="https://github.com/Kirdan/kirdan.github.io/blob/master/AnB_linked.png">
</p>
This is equivalent to this Venn diagram:
<p align="center">
 <img src="https://github.com/Kirdan/kirdan.github.io/blob/master/venn_AnB.png">
</p>




### Topological Rules:
* Sets/disks are never connected directly, only through intersections/rings
* Intersections/rings are never connected to other intersections/rings
* A set/disk can be connected to many intersections/rings
* An intersection/ring can be connected to many sets/disks

## Putting it all together

Consider this iconic Venn image:
<p align="center">
 <img src="https://github.com/Kirdan/kirdan.github.io/blob/master/venn.png">
</p>
Here is its g4s equivalent:
<p align="center">
<img src="https://github.com/Kirdan/kirdan.github.io/blob/master/g4s.png">
 </p>
The main advantage of g4s is making the intersection a first class citizen in its visual representation, as opposed to a “side effect” created by intersecting other entities. Intersections provide important insights and are being studied and used frequently in almost any data driven industry. g4s provides them the proper representation they deserve.

The g4s approach scales and can effectively represent the relations among many sets, as demonstrated in this [demo](https://kirdan.github.io/).

## About the Implementation
To simplify the visualization algorithm I decided to go with force-directed approach. That pretty much dictated the choice of the excellent [d3.js library](http://d3js.org), that besides being an industry leader in data visualization has a built-in support for force directed graphs. That enabled keeping the code concise.

You can check a live demo of g4s [here](https://kirdan.github.io/). The data in this example is taken from twitter. It provides some interesting insights, showing the various intersections between 6 groups of followers, following [Donald Trump](https://twitter.com/realDonaldTrump), [NASA](https://twitter.com/nasa), the [NRA](https://twitter.com/nra), [Neil deGrasse Tyson](https://twitter.com/neiltyson), [Alex Jones](https://twitter.com/realalexjones) and the [Flat Earth Organization](https://twitter.com/FlatEarthOrg) (totally random selection…).

## How to Use

### Quick Start

CSS: In your HTML page Include the following:

```html
<link rel="stylesheet" type="text/css" href="g4s.css">
```
Javascript:
The only prerequisite: the d3.js v4.x. https://github.com/d3/d3. Right after include the g4s library:

```HTML
<script type="text/javascript" src="d3.js"></script>
<script type="text/javascript" src="g4s.js"></script>
```

Somewhere in the body of the page create a div container that will host the graph. The only required parameter is the id:

```HTML
<div id="myg4s"></div>
```

In your script, call the g4s.init function:

```HTML
<script>
    g4s.init(data, "myg4s");
</script>
```

At minimum g4s.init expects 2 parameters:
1. The data, as a JSON object - see below
2. The id of the div container

### The Data

Consider the following example:

* Group A: 300 members
* Group B: 260 members
* Group C: 310 members
* A&cap;B = 85
* A&cap;C = 61
* B&cap;C = 50
* A&cap;B&cap;C = 25

Here is the JSON object g4s expects:

```json
[
 {"sets": [0],   "label": "Group A", "size": 300},
 {"sets": [1],   "label": "Group B", "size": 260},
 {"sets": [2],   "label": "Group C", "size": 310},
 {"sets": [0,1],   "size": 85},
 {"sets": [0,2],   "size": 61},
 {"sets": [1,2],   "size": 50},
 {"sets": [0,1,2],  "size": 25}
]
```
