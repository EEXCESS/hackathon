
function SilderControl(){

	function ReDraw(){
	
	/*	
		d3.select(oC.selectHTMLTag).select("svg").remove();
		
		var svg = d3.select(oC.selectHTMLTag)
			.append("svg")
				.attr(oC.svgAttr)
			.append("g")
				.attr("id","gghh")
				.attr("transform", "translate(" + oC.position + ")");
*/

		d3.select("#"+oC.controlId).remove();	

		var svg = d3.select("#"+oC.svgTag)
			.append("g")
				.attr("id",oC.controlId)
				.attr("transform", "translate(" + oC.position + ")");
				
		// scale //////////////	

		if(oC.isScale.value){	
			svg.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(0," +// 96
				oC.isScale.scaleY + ")")
				.call(
					d3.svg.axis().scale(oC.isScale.xDataScale).orient("bottom")
				);
		}
		//////////////////////
			
			
			/*
		var circle = svg.append("g").selectAll("circle")
			.data(data)
		  .enter().append("circle")
			.attr("transform", function(d) { return "translate(" + x(d) + "," + y() + ")"; })
			.attr("r", 3.5);
		*/
		var brushg = svg.append("g")
			.attr("class", "brush")
			.call(oC.brush);

			
		brushg.selectAll(".resize")
			//.append("path")
			.attr("transform", "translate(0," +  /*height*//*96 /2*/ 96/2 + ")")
			;//.attr("d", arc);

			
		brushg.selectAll("rect")
			.attr("height", oC.sliderHeight);

			
		brushg.selectAll(".background").style({fill:"white",visibility:"visible",stroke:"black","stroke-width":1});
	}
	
	var oC = {
		x:null,
		brush:null,
		svgTag:"svg1",
		controlId:"slider1",
		position:"20,20",
		sliderHeight:20,
		isScale:{
			value:true,
			xDataScale:null,
			scaleY:30
		},

		ChangeSilderControl:function(){
		
			oC.brush.x(oC.x);
			
			ReDraw();	
		},
		
		SetSliderControl:function(controlId,svgTag){
			oC.controlId = controlId;
			oC.svgTag = svgTag;

			oC.x = d3.scale.linear()
				.range([0,600])// slider width
				.domain([0,100]);

			oC.brush = d3.svg.brush()
				.x(oC.x)
				.extent([10, 30]);
				
			   // .on("brushstart", brushstart)
				//.on("brush", brushmove)
				//.on("brushend", brushend);

				/*
			var arc = d3.svg.arc()
				.outerRadius(height / 2)
				.startAngle(0)
				.endAngle(function(d, i) { return i ? -Math.PI : Math.PI; });
			*/
			
			//scale part
			//oC.x;
			oC.isScale.xDataScale = d3.scale.ordinal()
				.domain(
					["a","b","c"]
				)
				.rangePoints([0, 600], 0);
			
			//redraw the control
			ReDraw();	
				
				/*
			brushstart();
			brushmove();

			function brushstart() {
			  svg.classed("selecting", true);
			}
			*/
			/*
			function brushmove() {
			  var s = oC.brush.extent();
			  //circle.classed("selected", function(d) { return s[0] <= d && d <= s[1]; });


			  console.log(d3.round(s[0]) + " - " + d3.round(s[1]));
			}

			function brushend() {
				var s = oC.brush.extent();
			  //svg.classed("selecting", !d3.event.target.empty());
			}
			*/
		}
	};
	
	
	return oC;
	
};
