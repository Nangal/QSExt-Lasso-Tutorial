define( [
  "text!./style.css",
  "./d3"
],
function (cssContent) {
  	
  	$("<style>").html(cssContent).appendTo("head");
  
	return {
      	initialProperties : {
			version: 1.0,
			qHyperCubeDef : {
				qDimensions : [],
				qMeasures : [],
				qInitialDataFetch : [{
					qWidth : 4,
					qHeight : 2500
				}]
			}
		},
		definition : {
			type : "items",
			component : "accordion",
			items : {
				dimensions : {
					uses : "dimensions",
					min : 1,
					max:1
				},
				measures : {
					uses : "measures",
					min : 3,
					max:3
				},
				sorting : {
					uses : "sorting"
				},
				settings : {
					uses : "settings"
				}
			}
		},
		paint: function ($element,layout) {
          	
          	// Get the extension container properties
			var height = $element.height(),
				width = $element.width(),
				id = "container_" + layout.qInfo.qId;
          
          	// Get the data
			var qMatrix = layout.qHyperCube.qDataPages[0].qMatrix;
          
          	// Create or empty the chart container
			if(document.getElementById(id)) {
				$("#" + id).empty();
			}
			else {
				$element.append($("<div />").attr("id",id).width(width).height(height));
			}
          
          	// Define the plot margins
            var margin = {
              top:10,
              bottom:10,
              left:10,
              right:10
            };
          
          	// Create the svg
            var svg = d3.select("#" + id).append("svg")
            .attr("width",width)
            .attr("height",height);
          	
          	// Create a plot transformed by the margins
            var plot = svg.append("g")
            	.attr('transform','translate(' + margin.left + ',' + margin.top + ')');
          
          	
            // Create the x scale	
            var x = d3.scale.linear()
            	.domain([layout.qHyperCube.qMeasureInfo[0].qMin,layout.qHyperCube.qMeasureInfo[0].qMax])
            	.range([0, width - margin.left - margin.right]);
         	
          	// Create the y scale
            var y = d3.scale.linear()
            	.domain([layout.qHyperCube.qMeasureInfo[1].qMin,layout.qHyperCube.qMeasureInfo[1].qMax])
            	.range([height-margin.top-margin.bottom, 0]);
          
          	// Create the area scale
          	var a = d3.scale.linear()
            	.domain([layout.qHyperCube.qMeasureInfo[2].qMin,layout.qHyperCube.qMeasureInfo[2].qMax])
            	.range([1*Math.PI,100*Math.PI]);
          
          	// Create the circles
          	var circles = plot.selectAll('circle')
            	.data(qMatrix)
            	.enter()
            	.append('circle')
            	.attr('cx',function(d) {return x(d[1].qNum);})
            	.attr('cy',function(d) {return y(d[2].qNum);})
            	.attr('r',function(d) {return Math.sqrt(a(d[3].qNum)/Math.PI);});
          	
		}
	};

} );

