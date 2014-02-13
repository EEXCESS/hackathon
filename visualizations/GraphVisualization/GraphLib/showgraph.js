
function ShowGraph(){
	var self = this;
	
	this.functionValues = {};
	
	this.optionObject = new Options();
	
	this.option = this.optionObject.makeOptions;
	this.changeOption = this.optionObject.setOptions;
	
	this.storeId = "";
	this.setStore = false;
	
	var svgVar = this.option.svg;
	this.svg= d3.select(svgVar.HTMLObject.value).append("svg")
		.attr("width", svgVar.width.value)
		.attr("height", svgVar.height.value);
	
		
	this.svg.append("rect")
		.attr("width", svgVar.width.value)
		.attr("height", svgVar.height.value);
	
	this.zoom = d3.behavior.zoom();
		//.on("zoom", redraw);
	
	this.vis = this.svg.append("g")	
		.call(this.zoom)
		//.on("dblclick.zoom", null)
		.append("g");
	
	
	
	var visVar = this.option.vis;
	this.vis.append("rect")
		.attr("id","plate")
		.attr("width", visVar.width.value)
		.attr("height", visVar.height.value);
					
	
	this.ReTransform = function(){
		d3.select("#plate").attr("transform",
			"translate("
				+(-visVar.width.value/2+svgVar.width.value/2)+
				","
				+(-visVar.height.value/2+svgVar.height.value/2)+
				")");
		d3.select("svg")
			.attr("width", svgVar.width.value)
			.attr("height", svgVar.height.value);	
			
	};
	this.ReTransform();
	
	
	var forceVar = this.option.force;
	this.force = d3.layout.force()
		.size([svgVar.width.value, svgVar.height.value])
		.charge(forceVar.charge.value)
		.gravity(forceVar.gravity.value)
		.linkDistance(forceVar.linkDistance.value)
		.theta(forceVar.theta.value)
		.linkStrength(forceVar.linkStrength.value);
		//.on("tick", tick);
		

	this.ZoomAction = function(){};
	
	// rescale g
	this.redraw = function(){
		//console.log("zoom action");
		self.ZoomAction();
	
		var trans=d3.event.translate;
		var scale=d3.event.scale;
		
		visVar.trans.x.value = trans[0];
		visVar.trans.y.value = trans[1];
		visVar.scale.value = scale;
		
		d3.behavior.zoom().translate(trans);
		d3.behavior.zoom().scale(scale);
		
		self.vis.attr("transform",
			"translate(" + trans+ ")"
			+ " scale(" + scale + ")");
			
		self.setStore ?	sessionStorage.setItem(self.storeId,JSON.stringify(self.serialize)):null;
	}
	this.zoom.on("zoom",this.redraw);
	
	
	this.tick = function(){			
		self.link.selectAll("line")
			.attr("x1", function(d) {return d.source.x;})
			.attr("y1", function(d) { return d.source.y; })
			.attr("x2", function(d) { return d.target.x; })
			.attr("y2", function(d) { return d.target.y; })
			////////////////////////////////////////////////////////
			.style("stroke-width", function(d){return d.width;})
			.style("stroke",function(d){return d.color;});
			
			
		self.link.selectAll(".link-text")
			.attr("x", function(d) { return d.target.x > d.source.x ? d.source.x - (d.source.x-d.target.x)/2:d.target.x + (d.source.x-d.target.x)/2; })
			.attr("y", function(d) { return d.target.y > d.source.y ? d.source.y - (d.source.y-d.target.y)/2:d.target.y + (d.source.y-d.target.y)/2; })
			.text(function(d) { return d.text;});			
		/////////////////////////////////////////////////////
		
		
		self.node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

		self.node.selectAll(".node-text").text(function(d) { return d.attributes.text;});
		self.node.selectAll(".graphnode").attr("transform",function(d) { return "scale(" +d.attributes.xscale + ","+d.attributes.yscale+")";});
		/////////////////////////////////////////////////////////
		//self.node.selectAll("circle")//.attr("r",function(d){ return d.r; })
		//	.style("fill",function(d){ return d.attributes.color; });
		////////////////////////////////////////////////////////////	

	}	
	this.force.on("tick",this.tick);


	this.nodeDict = {};
	this.linkDict = {};
	
		
		
	this.node = this.vis.selectAll(".node");
	this.link = this.vis.selectAll(".link");
		
	this.nodes = this.force.nodes();
	this.links = this.force.links();

	
	this.restart = function(/*graph*/) {			
	/*
		if(graph != undefined){
			if(graph.hasOwnProperty("addEvents")){
				graph.addEvents();
			}					
		}
		*/
		this.link = this.vis.selectAll(".link").data([]).exit().remove();
		this.link = this.vis.selectAll(".link");
				
		this.link = this.link.data(this.links);
		var innerLink = this.link.enter().insert("g")//, ".cursor")
			.attr("class", "link");
			
		//////////////////////////////////////////////////////////	
		//link properties	
		innerLink.append("line", ".node")
			.style("stroke-width", function(d){return d.width;})
			.style("stroke",function(d){return d.color;})
			.on("click",function(d){
				if(d.hasOwnProperty("clickEvent")){
					return self.functionValues[d.clickEvent]();
					//return d.clickEvent(d);
				}
			}).append("svg:title").text(function(d, i){ 
				return d.title; 
			});
			
		var textAndTooltipInLink = innerLink.insert("g");
		
		textAndTooltipInLink.append("svg:title").text(function(d, i){ 
				return d.title; 
			});
		textAndTooltipInLink.append("text")
			.attr("class","link-text")
			.attr("text-anchor", "middle")
			.attr("dy", ".35em")
			.attr("y",20)
			.text(function(d) {return d.text;});
		///////////////////////////////////////////////////////////
			
		this.link.exit().remove();
		
		this.node = this.vis.selectAll(".node").data([]).exit().remove();
		this.node = this.vis.selectAll(".node");
		
		this.node = this.node.data(this.nodes);
		var innerNode = this.node.enter().insert("g")//, ".cursor")
			.attr("class", "node")
			.attr("id",function(d){return d.attributes.name;})//node id
			.call(this.force.drag)
			
		var graphNode = innerNode.insert("g")
			.attr("class","graphnode");	
		
		////////////////////////////////////////////////////

		//node properties	
		innerNode.each(function(d){
			for(var element in d.attributes){
				graphNode.style(element,function(d){
					return d.attributes[element];
				});
			}
		});
				/*
		graphNode.style("fill",function(d){
		return d.attributes.color;
		});*/
		graphNode.append("circle")
			.attr("vector-effect","non-scaling-stroke")
			.attr("r", 5)
			.attr("visibility",function(d){return d.attributes.circleOrPoly == "circle"?"visible":"hidden";})
			.on("click",function(d){
				if(d.attributes.hasOwnProperty("clickEvent")){
					return self.functionValues[d.attributes.clickEvent](d.attributes.clickParam);
				}
			})
			.on("contextmenu",function(d){
				if(d.attributes.hasOwnProperty("contextmenuEvent")){
					return self.functionValues[d.attributes.contextmenuEvent](d.attributes.contextmenuParam);
				}
			})
			.append("svg:title").text(function(d, i){ 
					return d.attributes.title; 
			});
		
		
		
		
		graphNode.append("polygon")
			.attr("visibility",function(d){return d.attributes.circleOrPoly == "polygon"?"visible":"hidden";})
			.attr("vector-effect","non-scaling-stroke")
			.attr("points",function(d){return d.attributes.polypoints;})
			.on("click",function(d){
				if(d.attributes.hasOwnProperty("clickEvent")){
					return self.functionValues[d.attributes.clickEvent](d.attributes.clickParam);
				}
			})
			.on("contextmenu",function(d){
				if(d.attributes.hasOwnProperty("contextmenuEvent")){
					return self.functionValues[d.attributes.contextmenuEvent](d.attributes.contextmenuParam);
				}
			})
			.append("svg:title").text(function(d, i){ 
				return d.attributes.title; 
			});
			
			
		//////////////////////////////////////////////////		  
			
			
		var textAndTooltipInNode = innerNode.insert("g");
		
		textAndTooltipInNode.append("svg:title").text(function(d, i){ 
			return d.attributes.title; 
		});
		
		textAndTooltipInNode.append("text")
			.attr("class","node-text")
			.attr("text-anchor", "middle")
			.attr("dy", ".35em")
			.attr("y",20)
			.text(function(d) {return d.attributes.text;});
		
			
		this.node.exit().remove();
		
		
		if (d3.event) {
			// prevent browser's default behavior
			d3.event.preventDefault();
		}
		
		this.force.start();
		this.setStore ?	sessionStorage.setItem(this.storeId,JSON.stringify(this.serialize)):null;
		
		
	};
	
	

	this.serialize = {
		"option":this.option,
		"nodeDict":this.nodeDict,
		"linkDict":this.linkDict		
	};

	
};
