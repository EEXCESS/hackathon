
function Barchart( domRoot, visTemplate ) {

	var BARCHART = {};
	
    BARCHART.Settings = new Settings('barchart');
	var Vis = visTemplate;
	
	var self = this;
	var root = domRoot;
	var width, height, margin, centerOffset, verticalOffset;
	var x, y, color, xAxis, yAxis;
	var svg, focus;
	var data, recomList;
	var xAxisChannel, yAxisChannel, colorChannel;
	var bars;
	var indexItemSelected = 'undefined';
	


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	BARCHART.Evt = {};

	/********************************************************************************************************************************
	 * Bar event handlers
	 * */
	
	BARCHART.Evt.onBarMouseClicked = function(d, i){
		
		BARCHART.Render.HighlightFilteredFacet(d[colorChannel], i, d.selected);
	};
	
	
	BARCHART.Evt.onBarMouseOvered = function(d){
		
		//d3.select(this).style("fill", "yellow");
		d3.select(this).style("stroke", function(d){ return color(d[colorChannel]); }).style("stroke-width", 2);
		
		// Get current x/y values, then augment for the tooltip
		//var xPosition = parseFloat(d3.select(this).attr("x")) + 340;
        var xPosition = x(d[xAxisChannel]) + x.rangeBand() * 1.5;
        var yPosition = y(d[yAxisChannel]) + 100;

		d3.select("#tooltip").remove();
	
		tooltip = d3.select( root ).append( "div" )
					.attr( "id", "tooltip" )
					.style("width", "auto");

        var message;
		if(d[yAxisChannel] > 1)
			message = d[yAxisChannel] + ' recommendations for ' + xAxisChannel + ' = ' + d[xAxisChannel];
		else
			message = d[yAxisChannel] + ' recommendation for ' + xAxisChannel + ' = ' + d[xAxisChannel];
		
		tooltip.append("p")
			.attr("id", "value")
			.text(function(){ return message; });

		// Show the toolxtip
		tooltip
			.style("left", xPosition + "px")
			.style("top", yPosition + "px")
			.style("opacity", 0.4)
			.transition()	// With this line the circles have black borders
			.style("opacity", 0.9)
			.duration(1000);				
		
	};
	
	
	BARCHART.Evt.onBarMouseOuted = function(d){
		//d3.select(this).style("fill", function(d){ return color(d[colorChannel]); });
		d3.select(this).style("stroke", "none");
		d3.select("#tooltip").remove();
	};
	
	
	
	/********************************************************************************************************************************
	 *	Legend events' handlers
	 * */
	BARCHART.Evt.legendClicked = function( legendDatum, legendIndex ){
		
		BARCHART.Render.HighlightFilteredFacet( legendDatum.item, legendIndex, legendDatum.selected );
	};
	
	
	BARCHART.Evt.legendMouseOvered = function(d, i){

		d3.select(this).select("div")
			.style("border", "0.1em yellow solid")
			.style("width", "1.4em")
			.style("height", "1.4em");
		
		d3.select(this).select("text")
			.style("font-size", "0.9em");
	};
	
	
	BARCHART.Evt.legendMouseOuted = function(d, i){
		
		d3.select(this).select("div")
			.style("border", function(){ if(d.selected) return "0.1em lime solid"; return "none"; })
			.style("width",  function(){ if(d.selected) return "1.4em"; return "1.5em"; })
			.style("height", function(){ if(d.selected) return "1.4em"; return "1.5em"; });
		
		d3.select(this).select("text")
			.style("font-size", "0.85em");	
	};

	
		
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	BARCHART.Internal = {};

	BARCHART.Internal.getLegendDomain = function(colorDomain){
		
		var legendDomain = [];
		
		colorDomain.forEach(function(c, i){
			legendDomain[i] = { 'item': c, 'selected': false };
		});
		return legendDomain;
	};
	
	
	
	
	
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	BARCHART.Render = {};	
	
	
		
	/******************************************************************************************************************
	* 
	*	Entry method. Sets canvas dimensions and initial input.
	*	Draws main svg components (svg, focus & context), defines scales and axis.
	* 
	* ***************************************************************************************************************/
	BARCHART.Render.draw = function( receivedData, mappings, iWidth, iHeight ){
		
		
		/******************************************************
		*	Define canvas dimensions
		******************************************************/
		BARCHART.Dimensions = BARCHART.Settings.getDimensions(domRoot, iWidth, iHeight);
		width          = BARCHART.Dimensions.width;
		height         = BARCHART.Dimensions.height;
		margin         = BARCHART.Dimensions.margin;
		centerOffset   = BARCHART.Dimensions.centerOffset;
		verticalOffset = BARCHART.Dimensions.verticalOffset;
		
		
		/******************************************************
		*	Define input variables
		******************************************************/

		BARCHART.Input = BARCHART.Settings.getInitData(receivedData, mappings);
		data         = BARCHART.Input.data;
        recomList    = BARCHART.Input.recomList;
		xAxisChannel = BARCHART.Input.xAxisChannel;
		yAxisChannel = BARCHART.Input.yAxisChannel;
		colorChannel = BARCHART.Input.colorChannel;

		
		/******************************************************
		*	Define scales
		******************************************************/
		x = d3.scale.ordinal()
			.domain( data.map(function(d) {return d[xAxisChannel]; }))
			//.rangeRoundBands([0, width], .1);
			.rangeBands( [0, width], .1 );
	 
		y = d3.scale.linear()
			.domain( [0, d3.max(data, function(d) { return d[yAxisChannel]; })] )
			.range( [height, 0] );

		color = d3.scale.category10();
		
		BARCHART.Ext.colorScale = color;
		
		/******************************************************
		*	Define axis functions
		******************************************************/
		xAxis = d3.svg.axis().scale(x).orient("bottom");
			
		yAxis = d3.svg.axis().scale(y).orient("left").ticks(6);
		
			
		/******************************************************
		*	Draw main components
		******************************************************/
		var divChart = d3.select( root ).append("div")
			.attr("id", "div-chart")
			.style("padding-top", verticalOffset);
	
		
		svg = divChart.append("svg")
			.attr("class", "svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom);
	
		
		/******************************************************
		*	Add focus and context g components
		******************************************************/
		focus = svg.append("g")
			.attr("class", "focus")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
			.attr("height", height);


		/******************************************************
		*	Draw elements in focus area
		******************************************************/
		focus.append("g")
	    	.attr("class", "x axis")
	    	.attr("transform", "translate(0," + height + ")")
	    	.call(xAxis)
	    	.selectAll("text")
	        	.style("text-anchor", "end")
	            .attr("dx", "-.8em")
	            .attr("dy", ".15em")
	            .attr("transform", function() { return "rotate(-45)"; });

	 
		focus.append("g")
	    	.attr("class", "y axis")
	    	.call(yAxis)
	    		.append("text")
	    		.attr("transform", "rotate(-90)")
	    		.attr("y", 6)
	    		.attr("dy", "-4em")
	    		.style("text-anchor", "end")
	    		.text("Score");
    	
		bars = focus.selectAll(".bar");	
		BARCHART.Render.drawBars( 'animate_bars' );
		
		
		
		/******************************************************
		 *	Legends
		 *****************************************************/	
		
		legendDomain = BARCHART.Internal.getLegendDomain(color.domain());
		
		
		var legendWrapper = d3.select("#div-chart")
						.append("div")
						.attr("id", "div-wrap-legends");
		
		legend = legendWrapper.selectAll(".legend")
			.data(legendDomain)
			.enter()
			.append("div")
				.attr("class", "legend")
				.attr("transform", function(d, i) { return "translate(40," + (i+1)*20 + ")"; })
				.on( "click", BARCHART.Evt.legendClicked )
				.on( "mouseover", BARCHART.Evt.legendMouseOvered )
				.on( "mouseout", BARCHART.Evt.legendMouseOuted );
		
		legend.append("div")
			.attr("x", width + 126)
			.style("background", function(d, i){ return color(d.item); });
		
		legend.append("text")
			.attr("x", width +120)
			.attr("y", 9)
			.attr("dy", ".35em")
			.style("text-anchor", "end")
			.text(function(d) { return d.item; });

	};
	

	
	
	/******************************************************************************************************************
	* 
	*	Reusable function. Invoked either from 'draw' or 'redraw'
	* 
	* ***************************************************************************************************************/
	BARCHART.Render.drawBars = function( action ){
		
		bars.remove();
		
		focus.selectAll(".bar")
			.data( data )
			.enter().append("rect")
                .attr("class", "bar")
				.attr("x", function(d) { return x(d[xAxisChannel]); })
				.attr("width", x.rangeBand())
			    .style("fill", function(d){ return color(d[colorChannel]); });
		
        bars = focus.selectAll(".bar");	        
        
        if( action == 'animate_bars' ){
            
            bars
                .attr("y", function(d) { return y(0); })
				.attr("height", function(d) { return  0; })
                .transition()
                    .delay(function (d,i){ return i * 10;})
			        .duration(800)
			        .attr("height", function(d) { return height - y(d[yAxisChannel]); })
			        .attr("y", function(d) { return y(d[yAxisChannel]); });
        }
        else{
            bars
                .attr("height", function(d) { return height - y(d[yAxisChannel]); })
			    .attr("y", function(d) { return y(d[yAxisChannel]); });
        }

		bars
			.on("click", BARCHART.Evt.onBarMouseClicked)
			.on("mouseover", BARCHART.Evt.onBarMouseOvered)
			.on("mouseout", BARCHART.Evt.onBarMouseOuted);
       
	};
		
	
	
	
	/******************************************************************************************************************
	* 
	*	Highlight bar and color legend selected
	* 
	* ***************************************************************************************************************/
	BARCHART.Render.HighlightFilteredFacet = function( facetValue, facetIndex, isSelected ){
		
        
		// retrieve indices to highlight in list panel (vis-template)
		var indicesToHighlight = [];
		var dataToHighlight = [];
		
		if( !isSelected ){		// it wasn't selected and now will be marked as selected				
			
			recomList.forEach(function(d, i){
				if(d.facets[colorChannel] == facetValue){
					indicesToHighlight.push(i);
					dataToHighlight.push(d);
				}
			});
		}        		
		
		// update legends' and bars' domains
		legendDomain.forEach(function(l, i){
			l.selected = (i == facetIndex && !isSelected);
		});
		
		data.forEach(function(d, i){
			d.selected = (i == facetIndex && !isSelected);
		});
		
		
		if(!isSelected){
			// hide non-matching bars
			bars.transition()
				.style("opacity", function(d, i){ if(d.selected) return 1; return 0.2; })
				.duration(500);			
		}
		else{
			// restore bars' opacity
			bars.transition()
				.style("opacity", 1)
				.duration(500);
		}		

		// highlight legend selected
		var legends = d3.selectAll('.legend');
		legends.select("text")
			.style("font-weight", function(l, i){ if(l.selected) return "bold"; return "normal"; });
		
		legends.select("div")
			.style("border", function(l, i){ if(l.selected) return "0.1em lime solid"; return "none"; });
		
		FilterHandler.setCurrentFilterCategories('category', dataToHighlight, colorChannel, [facetValue]);
	};
	

	
	
	
	
	/******************************************************************************************************************
	* 
	*	Reset barchart
	* 
	* ***************************************************************************************************************/
	BARCHART.Render.reset = function( action ){

        BARCHART.Render.clearLegends();
		BARCHART.Render.drawBars( action );
	};



    /******************************************************************************************************************
     *
     *	Reset barchart
     *
     * ***************************************************************************************************************/
    BARCHART.Render.clearLegends = function(){

        legendDomain.forEach(function(l){
            l.selected = false;
        });

        $('.legend').find('text').css('font-weight', 'normal');
        d3.selectAll('.legend').select("div")
            .style("border", "none")
            .style("width", "1.5em")
            .style("height", "1.5em");
    };
    
    
    
    /******************************************************************************************************************
    *
    *	Clear selected bar and legend when a list item is clickend on in vis-template
    *
    * ***************************************************************************************************************/
    BARCHART.Render.clearSelection = function(){
        BARCHART.Render.reset( 'do_not_animate_bars' );
    };

	

	
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	BARCHART.Ext = {
			
		draw: function(recomData, mappings, iWidth, iHeight ){
		  BARCHART.Render.draw( recomData, mappings, iWidth, iHeight );
		},
		
		reset: function(){ BARCHART.Render.reset( 'animate_bars' );	},
        
        clearSelection: function(){ BARCHART.Render.clearSelection(); }
	};
	
	
	return BARCHART.Ext;
	
}
