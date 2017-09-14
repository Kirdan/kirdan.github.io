# Graph for Sets 

[Live demo](https://kirdan.github.io/){:target="_blank"}

## Overview
The motivation for this project is introducing a new methodology for visualizing sets and intersections. Understanding relationships between sets and their intersections provides insights that are useful for data analysis.

When thinking about data intersections Venn diagrams and Euler diagrams immediately come to mind. However once dealing with more than 3 sets these diagrams become very complex and hard to understand. The more sets we add more tangled and contraintiative the visualization gets. More so, when attempting to keep Venn diagram scaled the visual challenge become even harder. 

## Concept

Graph for Sets (g4s) is a new way of displaying sets and intersections. g4s aims to be simple, intuitive, scalable as well as aesthetically pleasing. The concept utilizes topological graph, following these rules and conventions:

Sets and Intersections are represented as 2 types of vertices, disks and rings, where sets are disks and intersections are rings. For example, the following represent sets A and B and their intersection AnB:
<p align="center">
 <img src="https://github.com/Kirdan/kirdan.github.io/blob/master/AnB.png">
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

The g4s approach scales and can effectively represent the relations among many sets, as demonstrated in this [demo](https://kirdan.github.io/)

## About the Implementation
To simplify the visualization algorithm I decided to go with force-directed approach. That pretty much dictated the choice of the excellent [d3.js library](http://d3js.org), that besides being an industry leader in data visualization has a built-in support for force directed graph. That enabled keeping the code concise.

You can check a live demo of g4s [here](https://kirdan.github.io/). The data in this example is taken from twitter. It provides some interesting insights, showing the various intersections between 6 groups of followers, following [Donald Trump](https://twitter.com/realDonaldTrump), [NASA](https://twitter.com/nasa), the [NRA](https://twitter.com/nra), [Neil deGrasse Tyson](https://twitter.com/neiltyson), [Alex Jones](https://twitter.com/realalexjones) and the [Flat Earth Organization](https://twitter.com/FlatEarthOrg) (totally random selection…). 

## How to Use
Prerequisite: the d3.js v4.x. https://github.com/d3/d3.

After d3.js include the g4s.js library.

The process function expects to get data as json object with this format:
```json
[
 {"sets": [0],   "label": "name1", "size": 500000},
 {"sets": [1],   "label": "name2", "size": 600000},
 {"sets": [2],   "label":  "name3", "size": 86000},
 {"sets": [3],   "label": "name4", "size": 1000000},
 {"sets": [0,1],   "size": 4000},
 {"sets": [0,1],   "size": 4000},
 {"sets": [0,1],   "size": 30000},
 {"sets": [0,2],    "size": 60000},
 {"sets": [0,3],    "size": 1800},
 {"sets": [0,2,3],  "size": 5000}
]
```
