# g4s API Reference

g4s - shortcut for **Graph for Sets**, it's a javascript library, based on [D3.js](https://d3js.org), that visualizes sets and intersections in an intuitive way, aimed for easy insights discovery.

* [Data Format](#Data Format)
* Getting Started
* Customization
* Tuning mode
* Messages

## Data Format
g4s expects to get data in the format of JSON object.

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

## Getting Started
g4s has only one third party prerequisite: the d3.js v4.x: https://github.com/d3/d3. Besides D3 you need to include in your HTML document g4s CSS file and the javascript library itself.

Include g4s.css in the <head> tag:

```html
<link rel="stylesheet" type="text/css" href="g4s.css">
```

At the botton of the <body> tag include the javascript library in this order:

```HTML
<script type="text/javascript" src="d3.js"></script>
<script type="text/javascript" src="g4s.js"></script>
```

g4s requires a div container in which it will build an SVG element that will host the interactive graph. For example:

```HTML
<div id="myg4s"></div>
```

To instantiate a g4s graph use the g4s.init API. Here is the full function signature:
```javascript
g4s.init(data, container, tuning, height, width, charge, link_distance, link_strength)
```

However at minimum g4s.init requires just the first 2 parameters:

1. data - as [JSON object](#Data Format)
2. container - the ID attribute of the div container

In our example:
```javascript
g4s.init(data, "myg4s")
```
Here is the fully functional example:
<p align="center">
 [<img src="m/g4s_api_1_tn.png">](https://bl.ocks.org/Kirdan/ad774e98643ce93371b4c5b625dbfeba)
</p>
