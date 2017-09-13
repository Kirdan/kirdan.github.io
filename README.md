# Graph for Sets 

## Overview
The motivation for this project is introducing a new methodology for visualizing sets and intersections. Understanding relationships between sets and their intersections provides insights that are useful for data analysis.

When thinking about data intersections Venn diagrams and Euler diagrams immediately come to mind. However once dealing with more than 3 sets these diagrams become very complex and hard to understand. The more sets we add more tangled and contraintiative the visualization gets. More so, when attempting to keep Venn diagram scaled the visual challenge become even harder. 

## Concept

Graph for Sets (g4s) is a new way of displaying sets and intersections. g4s aims to be simple, intuitive, scalable as well as aesthetically pleasing. The concept utilizes topological graph, following these rules and conventions:

Sets and Intersections are represented as 2 types of vertices, disks and rings, where sets are disks and intersections are rings. For example, the following represents sets A and B and their intersection AnB:
<p align="center">
 <img src="https://github.com/Kirdan/kirdan.github.io/blob/master/AnB.png">
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

