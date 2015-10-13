requirejs.config({
    paths: {
      d3: "../extensions/basicscatterlasso/d3",
      lasso: "../extensions/basicscatterlasso/lasso"
    },
	shim : {
		"lasso" : {
          "exports" : "lasso",
			"deps" : ["d3"]
		}
	}
});
define( [
  "text!./style.css",
  "lasso"
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
          
          	var self = this;
          	
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
          
          	// Create a rectangle in the background for lassoing
            var bg = svg.append('rect')
              .attr('class','lassoable')
              .attr('x',0)
              .attr('y',0)
              .attr('width',width)
              .attr('height',height)
              .attr('opacity',0);
          	
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
            	.attr('class','lassoable')
            	.attr('cx',function(d) {return x(d[1].qNum);})
            	.attr('cy',function(d) {return y(d[2].qNum);})
            	.attr('r',function(d) {return Math.sqrt(a(d[3].qNum)/Math.PI);});
          
          
          // Define the lasso
          var lasso = d3.lasso()
                .closePathDistance(75) // max distance for the lasso loop to be closed
                .closePathSelect(true) // can items be selected by closing the path?
                .hoverSelect(true) // can items by selected by hovering over them?
          		.area(svg.selectAll('.lassoable')) // a lasso can be drawn on the bg rectangle and any of the circles on top of it
          		.items(circles) // the circles will be evaluated for lassoing
                .on("start",lasso_start) // lasso start function
                .on("draw",lasso_draw) // lasso draw function
                .on("end",lasso_end); // lasso end function
         
          svg.call(lasso);
          
          function lasso_start() {
            lasso.items()
              .classed({"not-possible":true}); // style as not possible
          }
          
          function lasso_draw() {
            
            // Style the possible dots
            lasso.items().filter(function(d) {return d.possible===true})
              .classed({"not-possible":false,"possible":true});
          
            // Style the not possible dot
            lasso.items().filter(function(d) {return d.possible===false})
              .classed({"not-possible":true,"possible":false});
            
          }
          
          function lasso_end() {
            
            // Get all the lasso items that were "selected" by the user
            var selectedItems = lasso.items()
            	.filter(function(d) {
                  return d.selected;
                });
            
            // Retrieve the dimension element numbers for the selected items
            var elemNos = selectedItems[0]
            	.map(function(d) {
                  return d.__data__[0].qElemNumber;
                });
            
            // Filter these dimension values
            self.backendApi.selectValues(0,elemNos,true);
          }
                
		}
	};

} );

