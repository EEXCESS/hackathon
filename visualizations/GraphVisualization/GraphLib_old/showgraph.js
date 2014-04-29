
function ShowGraph(){
	var self = this;
	
	this.functionValues = {};
	
	this.optionObject = new Options();
	
	this.option = this.optionObject.makeOptions;
	this.changeOption = this.optionObject.setOptions;
	
	this.storeId = "";
	this.setStore = false;
	
	var svgVar = this.option.svg;//append
	this.svg= d3.select(svgVar.HTMLObject.value).select("svg")
		.attr("width", svgVar.width.value)
		.attr("height", svgVar.height.value);
	
	//append	
	this.svg.select("rect")
		.attr("width", svgVar.width.value)
		.attr("height", svgVar.height.value);
	
	this.zoom = d3.behavior.zoom();
		//.on("zoom", redraw);
	
	//append
	this.vis = this.svg.select("g")	
		.call(this.zoom)
		//.on("dblclick.zoom", null)
		//append
		.select("g");
	
	
	
	var visVar = this.option.vis;
	//append
	this.vis.select("rect")
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
			.attr("x1", function(d) { return d.source.x; })
			.attr("y1", function(d) { return d.source.y; })
			.attr("x2", function(d) { return d.target.x; })
			.attr("y2", function(d) { return d.target.y; });
			////////////////////////////////////////////////////////
			/*
			.style("stroke-width", function(d){return d.width;})
			.style("stroke",function(d){return d.color;});
			*/
			
		self.link.selectAll(".link-text")
			.attr("x", function(d) { return d.target.x > d.source.x ? d.source.x - (d.source.x-d.target.x)/2:d.target.x + (d.source.x-d.target.x)/2; })
			.attr("y", function(d) { return d.target.y > d.source.y ? d.source.y - (d.source.y-d.target.y)/2:d.target.y + (d.source.y-d.target.y)/2; })
			.text(function(d) { return d.attributes.linkD3.text;});			
		
		/////////////////////////////////////////////////////
		
		
		self.node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

		self.node.selectAll(".node-text").text(function(d) { return d.attributes.nodeD3.text;});
		self.node.selectAll(".graphnode").attr("transform",function(d) { return "scale(" +d.attributes.nodeGraph.xscale + ","+d.attributes.nodeGraph.yscale+")";});
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

	
	this.restart = function() {	
	
	//Link - Implemtation ------------------------------------------------------------
		this.link = this.vis.selectAll(".link").data([]).exit().remove();
		this.link = this.vis.selectAll(".link");
				
		this.link = this.link.data(this.links);
		var innerLink = this.link.enter().insert("g")//, ".cursor")
			.attr("class", "link")
			.attr("id",function(d){
				return d.attributes.linkD3.name;
			});//link id
		
		var graphLink = innerLink.insert("g")
			.attr("class","graphlink");	
			
		//////////////////////////////////////////////////////////	
		
		//link properties	
		innerLink.each(function(d){
			Object.keys(d.attributes.linkGraph).forEach(function(element){
				graphLink.style(element,function(d){
					return d.attributes.linkGraph[element];
				});
			});
			
			Object.keys(d.attributes.linkEvents).forEach(function(element){
				d3.select("#"+d.attributes.linkD3.name).on(element,function(d){
					return self.functionValues[d.attributes.linkEvents[d3.event.type].name](d.attributes.linkEvents[d3.event.type].param)
				});
			});
			
		});
		
		graphLink.append("line", ".node")
			.append("svg:title").text(function(d){ 
				return d.attributes.linkD3.title; 
			});
			
			
		var textAndTooltipInLink = innerLink.insert("g");
		
		textAndTooltipInLink.append("svg:title").text(function(d){ 
				return d.attributes.linkD3.title; 
			});
			
		//link text properties	
		innerLink.each(function(d){
			Object.keys(d.attributes.linkText).forEach(function(element){
				textAndTooltipInLink.style(element,function(d){
					return d.attributes.linkText[element];
				});
			});
		});	
			
		textAndTooltipInLink.append("text")
			.attr("class","link-text")
			.attr("text-anchor", "middle")
			.attr("dy", ".35em")
			.attr("y",20)
			.text(function(d) {return d.attributes.linkD3.text;});
		
		///////////////////////////////////////////////////////////
			
		this.link.exit().remove();
		
		
		
	//Node - Implemtation ------------------------------------------------------------
		this.node = this.vis.selectAll(".node").data([]).exit().remove();
		this.node = this.vis.selectAll(".node");
		
		this.node = this.node.data(this.nodes);
		var innerNode = this.node.enter().insert("g")//, ".cursor")
			.attr("class", "node")
			.attr("id",function(d){return d.attributes.nodeD3.name;})//node id
			.call(this.force.drag);
			
		var graphNode = innerNode.insert("g")
			.attr("class","graphnode");	
		
		////////////////////////////////////////////////////

		//node properties	
		innerNode.each(function(d){
			Object.keys(d.attributes.nodeGraph).forEach(function(element){
				graphNode.style(element,function(d){
					return d.attributes.nodeGraph[element];
				});
			});
			
			Object.keys(d.attributes.nodeEvents).forEach(function(element){
				d3.select("#"+d.attributes.nodeD3.name).on(element,function(d){
					return self.functionValues[d.attributes.nodeEvents[d3.event.type].name](d.attributes.nodeEvents[d3.event.type].param)
				});
			});
		});

		graphNode.append("circle")
			.attr("vector-effect","non-scaling-stroke")
			.attr("r", 5)
			//.attr("visibility",function(d){return d.attributes.nodeD3.circleOrPoly == "circle"?"visible":"hidden";})	
			.attr("visibility",function(d){return d.attributes.nodeD3.circle;})			
			.append("svg:title").text(function(d){ 
				if(d.attributes.nodeD3.hasOwnProperty("title")){
					return d.attributes.nodeD3.title; 
				}
			});

		graphNode.append("polygon")
			//.attr("visibility",function(d){return d.attributes.nodeD3.circleOrPoly == "polygon"?"visible":"hidden";})
			.attr("visibility",function(d){return d.attributes.nodeD3.poly;})	
			.attr("vector-effect","non-scaling-stroke")
			.attr("points",function(d){return d.attributes.nodeD3.polypoints;})
			.append("svg:title").text(function(d, i){ 
				return d.attributes.nodeD3.title; 
			});
			
		graphNode.append("rect")
			.attr("style","stroke:black;stroke-width:2;")
			.attr("vector-effect","non-scaling-stroke")
						/////////////
			.attr("x",function(d){return d.attributes.nodeD3.imageX;})	
			.attr("y",function(d){return d.attributes.nodeD3.imageY;})	
			.attr("width",function(d){return d.attributes.nodeD3.imageWidth;})	
			.attr("height",function(d){return d.attributes.nodeD3.imageHeight;})	
			.attr("xlink:href",function(d){return d.attributes.nodeD3.imageLink;});
			///////////////
		graphNode.append("image")
			//.attr("visibility",function(d){return d.attributes.nodeD3.circleOrPoly == "polygon"?"visible":"hidden";})
			.attr("visibility",function(d){return d.attributes.nodeD3.image;})	
			.attr("vector-effect","non-scaling-stroke")
			.attr({"preserveAspectRatio":"xMidYMid slice"})
			/////////////
			.attr("x",function(d){return d.attributes.nodeD3.imageX;})	
			.attr("y",function(d){return d.attributes.nodeD3.imageY;})	
			.attr("width",function(d){return d.attributes.nodeD3.imageWidth;})	
			.attr("height",function(d){return d.attributes.nodeD3.imageHeight;})	
			.attr("xlink:href",function(d){return d.attributes.nodeD3.imageLink;})	
			///////////////
			.append("svg:title").text(function(d, i){ 
				return d.attributes.nodeD3.title; 
			});
		
		//////////////////////////////////////////////////		  		
			
		var textAndTooltipInNode = innerNode.insert("g");
		
		textAndTooltipInNode.append("svg:title").text(function(d, i){ 
			return d.attributes.nodeD3.title; 
		});
		
		//node text properties	
		innerNode.each(function(d){
			Object.keys(d.attributes.nodeText).forEach(function(element){
				textAndTooltipInNode.style(element,function(d){
					return d.attributes.nodeText[element];
				});
			});
		});
		
		textAndTooltipInNode.append("text")
			.attr("class","node-text")
			.attr("text-anchor", "middle")
			.attr("dy", ".35em")
			.attr("y",20)
			.text(function(d) {return d.attributes.nodeD3.text;});
		
			
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
