
var Core = function(){

var oC = {

	graphData:null,

	outer:null,
	vis:null,
	zoomCall:null,
	force:null,
	nodes:null,
	links:null,
	markers:null,
	node:null,
	link:null,
	defs:null,
	marker:null,
	dataPanZoom:null,

	//data for graph, it is serialable in json format.
	SetDefaultValues: function (){
		return {
			//graph option
			options:{
				svg:{
					chartId:"#chart",
					width:750,//960,
					height:350//500
				},
				size:{
					width:750,//960,
					height:350//500
				},
				force:{
					chargeValue: -350,//-100,//-400,//-200
					gravity:0.015, //0.05,
					friction:0.75, //0.5,
					theta:0.8,//0.8
					alpha:0.1//0.01
				}
			},

			//graph scale
			vis:{
				trans:[0,0],
				scale:1
			},

			//graph data
			data:{
				dict:{
					node:{},
					link:{},
					marker:{}
				},
				clusters:{},
				funcDict:{}
			}
		};
	},

	InitCore:function(chartIdParam){
		oC.graphData = oC.SetDefaultValues();

		if(chartIdParam != undefined){
			oC.graphData.options.svg.chartId = chartIdParam;
		}

		// init svg
		oC.outer = d3.select(oC.graphData.options.svg.chartId)
			.append("svg")
			//.attr("width", oC.graphData.options.svg.width)
			.attr("height", oC.graphData.options.svg.height);
			//.attr("pointer-events", "all")
			//.attr("class","box");


		oC.vis = oC.outer.append('g');

		oC.zoomCall = d3.behavior.zoom().on("zoom", oC.PanZoom);
		oC.outer.call(oC.zoomCall);


			//////////////////
		   // .on("dblclick.zoom", null)
		 // .append('g');
		/*
			.on("mousemove", mousemove)
			.on("mousedown", mousedown)
			.on("mouseup", mouseup);
		*/

		//help for graph
		/*
		vis.append('rect')
			.attr("stroke","red")
			.attr('width', width)
			.attr('height', height)
			.attr('fill', 'white');
		*/

		// init force layout
		oC.force = d3.layout.force().on("tick", oC.tick);
		/*
		var force = d3.layout.force()
			.size([width, height])
			//.nodes([{testId:0}]) // initialize with a single node
			//.linkDistance([])
			.charge(chargeValue)
			.on("tick", tick);
		*/

		// init force nodes and links and makers;
		oC.nodes = oC.force.nodes();
		oC.links = oC.force.links();
		oC.markers = [];

		// init svg nodes and links;
		oC.node = oC.vis.selectAll(".node");
		oC.link = oC.vis.selectAll(".link");

		//create defs for markers.
		oC.defs = oC.vis.append("defs");
		oC.marker = oC.defs.selectAll(".marker");



		//start the graph
		//console.log("start");
		oC.reoption();
		oC.redraw();
		oC.rescale();
	},



	//tick  ----------------------------------------------------------------------------------------------------------------------
	tick:function(e){
		//console.log("tick");
		oC.node.attr("transform", Transform);
		oC.node.each(cluster(10 * e.alpha * e.alpha))

		oC.link.select("path").attr("d", LinkArc)
		oC.link.select(".label")
			.attr("transform",function(d) {
				return "translate(" + (d.source.x + d.target.x)/2 + "," + (d.source.y + d.target.y)/2 + ")";
			});

		function LinkArc(d) {
			var dx = d.target.x - d.source.x;
			var dy = d.target.y - d.source.y;

			if(d.linkContent.parameter.curve.active){
				var curve = d.linkContent.parameter.curve;
				var dr = Math.sqrt(dx * dx + dy * dy)+curve.radius;
				return "M" + d.source.x + " "+ d.source.y  +
					"A" + dr + " " + dr + " "+curve.restpathparam+" " + d.target.x+ " " + d.target.y;
			}
			return "M" + d.source.x + " "+ d.source.y  +  "L" + d.target.x+ " " + d.target.y;
		}

		function Transform(d) {
			return "translate(" + d.x + "," + d.y + ")";
		}

		function cluster(alpha) {
			return function(d) {
				var cluster = d.nodeContent.parameter.cluster;

				if(!cluster.active){
					return;
				}
				if(!oC.graphData.data.clusters.hasOwnProperty(cluster.name)){
					return;
				}
				var clusterValue = oC.graphData.data.clusters[cluster.name];// center node from cluster.

				if (clusterValue === d){
					return;
				}

				var x = d.x - clusterValue.x,
					y = d.y - clusterValue.y,
					l = Math.sqrt(x * x + y * y),
					r = cluster.distance + clusterValue.nodeContent.parameter.cluster.distance;

				if (l != r) {
				  l = (l - r) / l * alpha;
				  d.x -= x *= l;
				  d.y -= y *= l;
				  clusterValue.x += x;
				  clusterValue.y += y;
				}

			};
		}

	},



	//re- scale, draw, option ----------------------------------------------------------------------------------------------------------------------

	//reoption force graph
	reoption: function() {

		//svg graph
		oC.outer = d3.select(oC.graphData.options.svg.chartId)
		  .select("svg")
			//.attr("width", oC.graphData.options.svg.width)
			.attr("height", oC.graphData.options.svg.height);
			//.attr("pointer-events", "all")
			//.attr("class","box");

		//options for graph
		var optionsForce = oC.graphData.options.force;
		oC.force.size([oC.graphData.options.size.width, oC.graphData.options.size.height])
			.charge(optionsForce.chargeValue)
			.gravity(optionsForce.gravity)
			.friction(optionsForce.friction)
			.alpha(optionsForce.alpha)
			.theta(optionsForce.theta);
	},


	// rescale force layout

	PanZoom:function() {
		//console.log("rescale");

		if(oC.dataPanZoom == null){
			oC.dataPanZoom = d3.event;
		}
		oC.graphData.vis.trans=d3.event.translate;
		oC.graphData.vis.scale=d3.event.scale;

		oC.vis.attr("transform",
			"translate(" + oC.graphData.vis.trans + ")"
			+ " scale(" + oC.graphData.vis.scale + ")");

	},

	rescale:function(){

		oC.vis.attr("transform",
			"translate(" + oC.graphData.vis.trans + ")"
			+ " scale(" + oC.graphData.vis.scale + ")");

		if(oC.dataPanZoom != null){
			oC.dataPanZoom.translate=oC.graphData.vis.trans;
			oC.dataPanZoom.scale=oC.graphData.vis.scale;
		}

		oC.zoomCall.translate(oC.graphData.vis.trans);
		oC.zoomCall.scale(oC.graphData.vis.scale);

	},




	// redraw force layout
	//var count = 0;
	redraw:function() {
		//console.log("redraw "+ count);count++;

/*
		if(oC.force.stopCalc){
			oC.force.stop();
		}*/

		//link properties
		oC.force.linkDistance(function(d){
			return d.linkContent.parameter.distance;
		});
		oC.force.linkStrength(function(d){
			return d.linkContent.parameter.strength;
		});


		// generate any svg-link
		oC.link.data([]).exit().remove();
		oC.link = oC.vis.selectAll(".link");

		oC.link = oC.link.data(oC.links);

		var linkgroup = oC.link.enter()
			.insert("g", ".node")
			.attr("class", "link")
			.attr("id",function(d){
				return d.elementId;
			});

		linkgroup.insert("svg:title").text(function(d){
			return d.linkContent.parameter.title;
		});

		linkgroup.insert("path")
			.attr("data-nodata",function(d){

				var innerCurrentElement = d.linkContent.parameter;
				d3.select("#"+d.elementId  +" > " + "path").attr(innerCurrentElement.attr)
				.on(innerCurrentElement.event.action,function(d){
					return oC.graphData.data.funcDict[innerCurrentElement.event.func](innerCurrentElement.event.param);
				});

			});


		linkgroup.insert('g')
			.attr("class","label")
			.attr("data-nodata",function(d){

				var currentSubLink = d.linkContent;

				var currentElement ={};
				var subElement = d3.select("#"+d.elementId +" > .label");

				currentSubLink.subElementsList.forEach(function(currentSubLinkname){

					currentElement = currentSubLink.subElements[currentSubLinkname];
					var innerCurrentElement = currentElement;//very important!

					//d3.select("#"+d.elementId +" > .label")
					subElement.insert(currentElement.element)
						.attr(currentElement.attr)
						.text(currentElement.text)
						.on(currentElement.event.action,function(d){
							return oC.graphData.data.funcDict[innerCurrentElement.event.func](innerCurrentElement.event.param);
						});
				});
			});


		/*
		  link
			.classed("link_selected", function(d) { return d === selected_link; });
		*/


		// generate any svg-node
		oC.node.data([]).exit().remove();
		oC.node = oC.vis.selectAll('.node');

		oC.node = oC.node.data(oC.nodes);


		oC.node.enter()
			.insert("g")
			.attr("class", "node")
			.attr("id",function(d){
				return d.elementId;
			})
			.insert("svg:title").text(function(d){
				return d.nodeContent.parameter.title;
			})
			.attr("data-nodata",function(d){
				var currentNode = d.nodeContent;

				var currentElement ={};
				var subElement = d3.select("#"+d.elementId).attr(currentNode.parameter.attr);

				currentNode.subElementsList.forEach(function(currentSubNode){

					currentElement = currentNode.subElements[currentSubNode];
					var innerCurrentElement = currentElement; //very important!

					subElement.insert(currentElement.element)
						.attr(currentElement.attr)
						.text(currentElement.text)
						.on(currentElement.event.action,function(d){
							return oC.graphData.data.funcDict[innerCurrentElement.event.func](innerCurrentElement.event.param);
						})
						.on(currentElement.event1.action,function(d){
							return oC.graphData.data.funcDict[innerCurrentElement.event1.func](innerCurrentElement.event1.param);
						})
						.on(currentElement.event2.action,function(d){
							return oC.graphData.data.funcDict[innerCurrentElement.event2.func](innerCurrentElement.event2.param);
						});

					if(currentNode.parameter.drag){
						subElement.call(oC.force.drag);
					}
				});
			});

		// generate any svg marker
		oC.marker.data([]).exit().remove();
		oC.marker = oC.defs.selectAll('.marker');

		oC.marker = oC.marker.data(oC.markers);

		oC.marker.enter()
			.insert("marker")
			.attr("class", "marker")
			.attr("id",function(d){
				return d.elementId;
			})
			.attr("data-nodata",function(d){
				var currentSubMarker = d.markerContent;

				var currentElement ={};
				var subElement = d3.select("#"+d.elementId).attr(d.attr);
				currentSubMarker.subElementsList.forEach(function(currentSubMarkername){

					currentElement = currentSubMarker.subElements[currentSubMarkername];
					//var innerCurrentElement = currentElement;

					subElement.insert(currentElement.element)
						.attr(currentElement.attr)
						.text(currentElement.text);
				});
			});

//////////////////////////////////
/*
		if (d3.event) {
			// prevent browser's default behavior
			d3.event.preventDefault();
		}
		*/
////////////////////////////////

		oC.force.start();

	}
};


return oC;};
