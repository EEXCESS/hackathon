function GetSamePartOfArray(arraySize,parts){
	var resultArray = [];
	var interval = d3.round(arraySize/(parts+1));
	var iterate = interval-1;

	resultArray.push(0);
	do{
		resultArray.push(iterate);
		iterate = iterate +interval;
		parts--;
	}while(parts != 0);

	resultArray.push(arraySize-1);
	return resultArray;
}

function TextCutter(text,sizeCompare,sizeCut){
	return text.length < sizeCompare ? text : text.substring(0,sizeCut)+"..."; 
}

var forceGraph = new FGraph();

var sliderMin = 0;
var sliderMax = 0;

function BuildSlider(){

	$(function(){
		//////////////////////////////
		forceGraph.InitGraph("#D3graph");
		//////////////////////////////
		
		//console.log("build slider");
		//console.log({"wl":getDataFromIndexedDB.queryObjHistory});
		
		var historyData = getDataFromIndexedDB.queryObjHistory;
		var intalvalResults = GetSamePartOfArray(historyData.length,4);
		var sliderWidth = 900;
		
		var slidercontrol = new SilderControl();
		
		//generate slider
		slidercontrol.SetSliderControl("d3Slider","d3_slider");
		
		//set slider width
		slidercontrol.x.range([0,sliderWidth]);//slider width
		slidercontrol.x.domain([0,historyData.length-1]);		
		slidercontrol.isScale.xDataScale.domain(
				intalvalResults//["0","100","200","300"]
			)
			.rangePoints([0, sliderWidth], 0);//slider scale width
		
		
		//set slider work , min max values.
		sliderMin = historyData.length-5;
		sliderMax = historyData.length-1;
		
		//slider with events
		slidercontrol.brush.extent([sliderMin,sliderMax])
			.on("brush",function() {
				var s = slidercontrol.brush.extent();
				if(sliderMin != d3.round(s[0]) || sliderMax != d3.round(s[1])){
					//circle.classed("selected", function(d) { return s[0] <= d && d <= s[1]; });
					//console.log(d3.round(s[0]) + " - " + d3.round(s[1]));
					  
					//forceGraph.To.Object().To.Node()
						//.Delete("StartNodeID")
						//.Delete("EndNodeID");
						
					//draw a graph
					//DrawGraph_(d3.round(s[0]),d3.round(s[1]),"yellow");
					
					DrawGraph(d3.round(s[0]),d3.round(s[1]));
					
					sliderMin = d3.round(s[0]);
					sliderMax = d3.round(s[1]);
				}
				
			})
			.on("brushend",function() {
					//var s = slidercontrol.brush.extent();
				  //svg.classed("selecting", !d3.event.target.empty());
				  
				  
				  
				});
		
		slidercontrol.ChangeSilderControl();
		
		//draw a graph in first time
		//DrawGraph_(sliderMin,sliderMax,"grey");
		
		DrawGraph(sliderMin,sliderMax);
		
		forceGraph.To.Object().To.Graph().ReDraw();	
	});
	
}




function DrawGraph(min,max){

	function getUniqueNodeName(index){
		return "UniqueNodeID_"+MD5(getDataFromIndexedDB.wordHistory[index]);
	};

	function AddUniqueQueryNode(index,uniqueNodeName){
		if(forceGraph.Graph.GetGraphData().data.dict.node[uniqueNodeName] == undefined){
			var queries = getDataFromIndexedDB.wordHistory[index];
			
			// draw a query node
			forceGraph.To.Object().To.Node()
				.Add(uniqueNodeName)
				.Change(uniqueNodeName,{title:queries})
				.To.SubElement()
					.Add(uniqueNodeName,"svgtext","text")
					.Change(uniqueNodeName,"svgtext",{attr:{transform:"translate(-20)"},text:TextCutter(queries,10,9)})
					.Change(uniqueNodeName,"svgcircle",{attr:{fill:"green",r:10}})
					.Add(uniqueNodeName,"svgtext1","text")
					.Change(uniqueNodeName,"svgtext1",{attr:{transform:"translate(-20,-20)"},text:10});
		}
	};
	
	function AddHistoryQueryNode(isPreviousNode,index,uniqueNodeName,previousNode,historyNodeID){
	
		AddUniqueQueryNode(index,uniqueNodeName);
	
		var historyConnectionNameID = "HistoryConnectionID_"+index;

		var test = forceGraph.Graph.GetGraphData();
		if(forceGraph.Graph.GetGraphData().data.dict.node[historyNodeID] == undefined){
		
			var radius = forceGraph.Graph.GetGraphData()
				.data.dict.node[uniqueNodeName].object.nodeContent.subElements["svgcircle"].attr.r;
			radius = radius +2;
			
			//draw a subnode
			forceGraph.To.Object().To.Node()
				.Add(historyNodeID)
				.Change(historyNodeID,{drag:true})
				.To.SubElement()
					.Add(historyNodeID,"svgtext","text")
					.Change(historyNodeID,"svgtext",{attr:{},text:index})
					.Change(historyNodeID,"svgcircle",{attr:{fill:"grey"}})//colorTest}})
			.To.Object().To.Link()	
				//draw a connection link	
				.Add(uniqueNodeName,historyNodeID,historyConnectionNameID)
				////draw a histrory link			
				//.Add(previousNode,historyNodeID,historyLinkNameID)
				//.Change(historyLinkNameID,{strength:0})
			// grow a query node //????????????????
			.To.Object().To.Node()
				.To.SubElement()
					.Change(uniqueNodeName,"svgcircle",{attr:{r:radius}})
					.Change(uniqueNodeName,"svgtext1",{attr:{transform:"translate(-20,-20)"},text:radius});
			
			if(isPreviousNode){
				var historyLinkNameID = "HistoryLinkID_"+index;
				forceGraph.To.Object().To.Link()	
					//draw a histrory link			
					.Add(previousNode,historyNodeID,historyLinkNameID)
					.Change(historyLinkNameID,{strength:0});
			}
				
		}else{
			//console.log("history node is exists");
		}
	};
	
	function DeleteHistoryQueryNode(index){
		// get data from graph
		var graphData = forceGraph.Graph.GetGraphData().data.dict;	
		var uniqueNodeId = graphData.link["HistoryConnectionID_"+index].source.elementId

		//delete history node
		forceGraph.To.Object().To.Node()
			.Delete("HistoryNodeID_"+index);

		//delete unique query node
		if(Object.keys(graphData.node[uniqueNodeId].connections).length == 0){
			forceGraph.To.Object().To.Node()
				.Delete(uniqueNodeId);
		}else{
			// shrink the query node radius. //????????????????????
			var radius = graphData.node[uniqueNodeId].object.nodeContent.subElements["svgcircle"].attr.r;
			radius = radius -2;
			forceGraph.To.Object().To.Node()
				.To.SubElement()
					.Change(uniqueNodeId,"svgcircle",{attr:{r:radius}})
					.Change(uniqueNodeId,"svgtext1",{attr:{transform:"translate(-20,-20)"},text:radius});;
		}
	};
	
	
	
	
	
	
	
	
	//console.log("#: " +min+"(" + sliderMin + ")" + " - " +max+"(" + sliderMax + ")");

	// draw first time a graph
	if(min == sliderMin && max == sliderMax){
		console.log("slider first time");
		AddHistoryQueryNode(false,min,getUniqueNodeName(min),null,"HistoryNodeID_"+min);
		
		var index = min+1;
		do{
			//console.log(index);
			AddHistoryQueryNode(true,index,getUniqueNodeName(index),"HistoryNodeID_"+(index-1),"HistoryNodeID_"+(index));
		
			index++;
		}while(index <= max);
	
	}else{
		
		if(max < sliderMin || sliderMax < min){
		
			console.log("slider big junp");
			
			forceGraph.To.Object()
				.To.Graph().Delete();
			
			var currentNode = forceGraph.To.Object().To.Node();			
			Object.keys(forceGraph.Graph.GetGraphData().data.dict.node).forEach(function(key){
				currentNode.Delete(key);	
			});	
				
			var test = forceGraph.Graph.GetGraphData();
			
			
			AddHistoryQueryNode(false,min,getUniqueNodeName(min),null,"HistoryNodeID_"+min);
			
			var index = min+1;
			do{
				//console.log(index);
				AddHistoryQueryNode(true,index,getUniqueNodeName(index),"HistoryNodeID_"+(index-1),"HistoryNodeID_"+(index));
			
				index++;
			}while(index <= max);
			
		
		}else{
			//first indexes of the search graph.
			if(min < sliderMin){
				console.log("slider grow on the left side");
				
				AddHistoryQueryNode(false,min,getUniqueNodeName(min),null,"HistoryNodeID_"+min);
			
				var index = min+1;
				do{//while(index < sliderMin){
					//console.log(index);
					AddHistoryQueryNode(true,index,getUniqueNodeName(index),"HistoryNodeID_"+(index-1),"HistoryNodeID_"+(index));
					//console.log("-" + index + "." + sliderMin);
				
					index++;
				}while(index < sliderMin);
				
				var nextNode = "HistoryNodeID_"+sliderMin;
				var previousNode = "HistoryNodeID_"+(sliderMin-1)//min;
				var linkName = "HistoryLinkID_"+sliderMin;//min;/////////
				forceGraph.To.Object().To.Link()	
					//draw a history link	
					.Add(previousNode,nextNode,linkName)
					.Change(linkName,{strength:0,attr:{stroke:"red"}})
					.To.SubElement()
						.Change(linkName,"svgtext",{attr:{},text:sliderMin});

			}else if(min > sliderMin){
				console.log("slider shrink on the left side");
				var index = sliderMin;
				while(index < min){
					//console.log(index);
					DeleteHistoryQueryNode(index);
					index++;
				};
			}
			
			var minNoUpdateGraph = min < sliderMin ? sliderMin : min;
			var maxNoUpdateGraph = max > sliderMax ? sliderMax : max;
			
			if(minNoUpdateGraph <maxNoUpdateGraph){
				var index = minNoUpdateGraph+1;
				do{
					//console.log(index);
					//change lines and nodes properties.
					/*
					forceGraph.To.Object().To.Link()	
						//draw a history link	
						.Change("HistoryLinkID_"+index,{attr:{stroke:"blue"}})
						.To.SubElement()
							.Add("HistoryLinkID_"+index,"svgtextX","text")
							.Change("HistoryLinkID_"+index,"svgtextX",{attr:{fill:"blue",transform:"translate(0,-20)"},text:index});
					*/
					index++;
				}while(index < maxNoUpdateGraph);
			}else{
				//doto anything
			}
			
			if(max < sliderMax){
				console.log("slider shrink on the right side");
				var index = max+1;
				do{
					//console.log(index);
					DeleteHistoryQueryNode(index);
					index++;
				}while(index <= sliderMax);
				
			}else if(max > sliderMax){
				console.log("slider grow on the rifght side");
				
				var index = sliderMax+1;
				do{//while(index < sliderMin){
					
					//console.log("-" + index + "." + max);
					AddHistoryQueryNode(true,index,getUniqueNodeName(index),"HistoryNodeID_"+(index-1),"HistoryNodeID_"+(index));
					

					index++;
				}while(index <= max);
			}
		}
		
	}
	

	//test Control begin
	////////////////////////////////////////////////////
	//test history his edges
	for(var i=0;i<getDataFromIndexedDB.wordHistory.length;i++){
		var dataGraph = forceGraph.Graph.GetGraphData();
		if(dataGraph.data.dict.node["HistoryNodeID_"+i] != undefined){
			forceGraph.To.Object().To.Node()
				.To.SubElement()
					.Change("HistoryNodeID_"+i,"svgcircle",{attr:{fill:"grey"}});
			if(Object.keys(dataGraph.data.dict.node["HistoryNodeID_"+i].connections).length != 3){
				forceGraph.To.Object().To.Node()
					.To.SubElement()
						.Change("HistoryNodeID_"+i,"svgcircle",{attr:{fill:"red"}});
			}
		}
	}
	
	//histroy line
	
	////////////////////////////////////////
	//test Control end
	
	
	
	//draw a graph
	forceGraph.To.Object().To.Graph().ReDraw();	
}




function DrawGraph_(min,max,colorTest){

	function getUniqueNodeName(index){
		return "UniqueNodeID_"+MD5(getDataFromIndexedDB.wordHistory[index]);
	};

	function AddUniqueQuery(index,nodeName){
		//nodeName = "UniqueNodeID_"+MD5(getDataFromIndexedDB.wordHistory[index]);
		if(forceGraph.Graph.GetGraphData().data.dict.node[nodeName] == undefined){
			var queries = getDataFromIndexedDB.wordHistory[index];
			
			// draw a node
			forceGraph.To.Object().To.Node()
				.Add(nodeName)
				.Change(nodeName,{title:queries})
				.To.SubElement()
					.Add(nodeName,"svgtext","text")
					.Change(nodeName,"svgtext",{attr:{transform:"translate(-20)"},text:TextCutter(queries,10,9)})
					.Change(nodeName,"svgcircle",{attr:{fill:"green",r:10}})
					.Add(nodeName,"svgtext1","text")
					.Change(nodeName,"svgtext1",{attr:{transform:"translate(-20,-20)"},text:10});
		}
		
	}

	
	function AddHistoryQuery(index,nodeName,historyNodeID,previousNode){
		//nodeName = getUniqueNodeName(index);
		AddUniqueQuery(index,nodeName);
	
		var queries = getDataFromIndexedDB.wordHistory[index];
		
		//var historyNodeID = "HistoryNodeID_"+index;		
		var historyConnectionNameID = "HistoryConnectionID_"+index;
		var historyLinkNameID = "HistoryLinkID_"+index;
	
		
		if(forceGraph.Graph.GetGraphData().data.dict.node[historyNodeID] == undefined){
		
			var radius = forceGraph.Graph.GetGraphData()
				.data.dict.node[nodeName].object.nodeContent.subElements["svgcircle"].attr.r;
			radius = radius +2;
			
			//draw a subnode
			forceGraph.To.Object().To.Node()
				.Add(historyNodeID)
				.To.SubElement()
					.Add(historyNodeID,"svgtext","text")
					.Change(historyNodeID,"svgtext",{attr:{},text:index})
					.Change(historyNodeID,"svgcircle",{attr:{fill:colorTest}})
			.To.Object().To.Link()	
				//draw a connection link	
				.Add(nodeName,historyNodeID,historyConnectionNameID)
				//draw a histrory link			
				.Add(previousNode,historyNodeID,historyLinkNameID)
				.Change(historyLinkNameID,{strength:0})
			// grow a query node //????????????????
			.To.Object().To.Node()
				.To.SubElement()
					.Change(nodeName,"svgcircle",{attr:{r:radius}})
					.Change(nodeName,"svgtext1",{attr:{transform:"translate(-20,-20)"},text:radius});
				
			//previousNode = historyNodeID;	
		}else{
			console.log("boooooooooooooooooooooooooooooooom!");
			//previousNode = "HistoryNodeID_"+(index-1);	;
			//console.log("## node");
			
		//	return 1;
		}
		//return 0;		
	}

/*
	console.log("==========================");
	console.log({"wl":getDataFromIndexedDB.uniqueWords});
	console.log({"wl":getDataFromIndexedDB.queryObjHistory});

	console.log(getDataFromIndexedDB.wordsWithResults);
	console.log({"wl":getDataFromIndexedDB.wordHistory});
	*/

	var changeGraph = function(index){
		// get data from graph
		var graphData = forceGraph.Graph.GetGraphData().data.dict;	
		var uniqueNodeId = graphData.link["HistoryConnectionID_"+index].source.elementId

		//delete history node
		forceGraph.To.Object().To.Node()
			.Delete("HistoryNodeID_"+index);

		//delete unique query node
		if(Object.keys(graphData.node[uniqueNodeId].connections).length == 0){
			forceGraph.To.Object().To.Node()
				.Delete(uniqueNodeId);
		}else{
			// shrink the query node radius. //????????????????????
			var radius = graphData.node[uniqueNodeId].object.nodeContent.subElements["svgcircle"].attr.r;
			radius = radius -2;
			forceGraph.To.Object().To.Node()
				.To.SubElement()
					.Change(uniqueNodeId,"svgcircle",{attr:{r:radius}})
					.Change(uniqueNodeId,"svgtext1",{attr:{transform:"translate(-20,-20)"},text:radius});;
		}
	};

	//draw a first graph
	
	//first node

	//assing variable--------------

	//if(colorTest == "grey"){
		//AddUniqueQuery(min);
	//}

	
	//AddUniqueQuery(min);


	
	var drawStartNode = function(nodeName,startNodeId){
		//draw a start node
		//var  = "StartNodeID";
		var startConnectionID = "StartConnectionID";
		forceGraph.To.Object().To.Node()
			.Add(startNodeId)
			.To.SubElement()
				.Add(startNodeId,"svgtext","text")
				.Change(startNodeId,"svgtext",{attr:{},text:"start"})
				.Change(startNodeId,"svgcircle",{attr:{fill:"blue"}})
		.To.Object().To.Link()	
			.Add(nodeName,startNodeId,startConnectionID)
			.Change(startConnectionID,{distance:50});
		//previousNode = startNodeId;
	};
	
	//draw the last node
	var drawEndNode = function(nodeName,previousNode){
		var endNodeId = "EndNodeID";
		var endConnectionID = "EndConnectionID";
		var endLinkID = "EndLinkID";
		
		forceGraph.To.Object().To.Node()
			.Add(endNodeId)
			.To.SubElement()
				.Add(endNodeId,"svgtext","text")
				.Change(endNodeId,"svgtext",{attr:{},text:"end"})
				.Change(endNodeId,"svgcircle",{attr:{fill:"red"}})
		.To.Object().To.Link()	
			//draw a connection link	
			.Add(nodeName,endNodeId,endConnectionID)
			//draw a histrory link			
			.Add(previousNode,endNodeId,endLinkID)
			.Change(endLinkID,{strength:0});
	};
	
	var addHistoryLink = function(previousNode,historyNodeID){
		forceGraph.To.Object().To.Link()	
			//draw a history link	
			.Add(previousNode,historyNodeID,"HistoryLinkID_"+index)
			.Change(historyNodeID,{strength:0,attr:{stroke:"red"}})
			.To.SubElement()
				.Change(historyNodeID,"svgtext",{attr:{},text:index});
	};
	
	
	//drawStartNode();
	 


/////////////////////////////////////////
var previousNode = null;

console.log("#: " +min+"(" + sliderMin + ")" + " - " +max+"(" + sliderMax + ")");

// draw first time a graph
if(min == sliderMin && max == sliderMax){
	var nodeName = getUniqueNodeName(min);
	AddUniqueQuery(min,nodeName);
	previousNode = "StartNodeID";
	drawStartNode(nodeName,previousNode);
	
	for(var index=min;index<max;index++){
		nodeName = getUniqueNodeName(index);	
		var historyNodeID	= "HistoryNodeID_"+index;
		
		AddHistoryQuery(index,nodeName,historyNodeID,previousNode);
		previousNode = historyNodeID;
	}
	
	drawEndNode(nodeName,previousNode);
}


	if(min < sliderMin){

		forceGraph.To.Object().To.Node()
			.Delete("StartNodeID");
		//forceGraph.To.Object().To.Node()
		//	.Delete("EndNodeID");
			
		var nodeName = getUniqueNodeName(min);
		AddUniqueQuery(min,nodeName);
		previousNode = "StartNodeID";
		drawStartNode(nodeName,previousNode);
		
		var historyNodeID = "";

		for(var index=min;index<sliderMin;index++){
			nodeName = getUniqueNodeName(index);
			historyNodeID = "HistoryNodeID_"+index;
			
			AddHistoryQuery(index,nodeName,historyNodeID,previousNode);
			previousNode = historyNodeID;
		}
		
		var lastNode = "HistoryNodeID_"+sliderMin;
		var lastLink = "HistoryLinkID_"+sliderMin;
		
		if(sliderMin == sliderMax){
			lastNode = "EndNodeID";
			lastLink = "EndLinkID";
		}
		
		forceGraph.To.Object().To.Link()	
			//draw a history link	
			.Add(previousNode,lastNode,lastLink)
			.Change(lastLink,{strength:0,attr:{stroke:"red"}})
			.To.SubElement()
				.Change(lastLink,"svgtext",{attr:{},text:sliderMin});

		
		
	}else if(min > sliderMin){
		forceGraph.To.Object().To.Node()
			.Delete("StartNodeID");
			
		for(var index=sliderMin;index<min;index++){
			changeGraph(index);
		}
		var nodeName = getUniqueNodeName(min);
		//AddUniqueQuery(min,nodeName);
		
		previousNode = "StartNodeID";
		drawStartNode(nodeName,previousNode);
		

		var lastNode = "HistoryNodeID_"+min;
		var lastLine = "HistoryLinkID_"+ min;
		if(sliderMin+1 == sliderMax){
			lastNode = "EndNodeID";
			lastLine = "EndLinkID";
		}
		
		forceGraph.To.Object().To.Link()	
			//draw a history link	
			.Add(previousNode,lastNode,lastLine)
			.Change(lastLine,{strength:0,attr:{stroke:"red"}})
			.To.SubElement()
				.Change(lastLine,"svgtext",{attr:{},text:(min)});
		
		
	}

	if(max < sliderMax){
		forceGraph.To.Object().To.Node()
			.Delete("EndNodeID");
			
		var firstNode = "HistoryNodeID_"+(max-1);
		if(sliderMin+1 == sliderMax){
			firstNode = "StartNodeID";
		}
		
		var nodeName = getUniqueNodeName(max-1);
		drawEndNode(nodeName,firstNode);	
		
		for(var index=max;index<sliderMax;index++){
			changeGraph(index);
		}


	}else if(max > sliderMax){
		forceGraph.To.Object().To.Node()
			.Delete("EndNodeID");
			
		var nodeName = null;//getUniqueNodeName(sliderMax);
		
		previousNode = "HistoryNodeID_"+(sliderMax-1);
		for(var index=sliderMax;index<max;index++){
			nodeName = getUniqueNodeName(index);
			historyNodeID = "HistoryNodeID_"+index;
			
			AddHistoryQuery(index,nodeName,historyNodeID,previousNode);
			previousNode = historyNodeID;
		}
		
		drawEndNode(nodeName,previousNode);

		
		//forceGraph.To.Object().To.Node()
		//	.Delete("EndNodeID");
		
		//AddUniqueQuery(sliderMax);	
		//for(var index=sliderMax;index<max;index++){
		//	AddHistoryQuery(index);
		//}
		
		//drawEndNode();
		
	}

///////////////////////////////////	
	
	//draw a graph
	forceGraph.To.Object().To.Graph().ReDraw();	
}



/*
//help functions
function TextCutter(text,sizeCompare,sizeCut){
	return text.length < sizeCompare ? text : text.substring(0,sizeCut)+"..."; 
}


var g= null;
var linecount = 0;
var optionVar =null;

function MakeGraph(){
	
	g = new ActionGraph();	

	////////////g.build.show.functionValues = functions;
	//g.build.show.setStore = true;
	
	
	g.changeOption({	
		svg:{
			width:{value:750},
			height:{value:500}
		},
		vis:{
			width:{value:5000},
			height:{value:5000}
		},
		force:{//3000
			charge:{value:-250}
		}
	});
	
	if(optionVar != null){
		g.changeOption({
			vis:{
				trans:{
					x:{value:optionVar.vis.trans.x.value},
					y:{value:optionVar.vis.trans.y.value}				
				},
				scale:{value:optionVar.vis.scale.value}
			}
		});
	}
	
	optionVar = g.build.show.option;

	g.build.show.ZoomAction = function(){
		d3.select('#popup_menu').style("display", "none");
	}

	g.build.show.svg.on("click",function(){
		d3.event.preventDefault();
		d3.select('#popup_menu').style("display", "none");
	});
	
 	d3.select("svg").on("contextmenu",function(){
		d3.event.preventDefault();

		
	});
	
	if(wordHistory.length == 0){
		return;
	}
	//console.log(wordsWithResults);/////////////////////////////////////////////////
	//console.log(uniqueWordsResult);

	
	// nodes
	wordHistory.forEach(function(nodename,index){
		var text= nodename;
		if(g.build.show.nodeDict.hasOwnProperty("nodeId"+MD5(nodename)) == false){

			g.build.addNode("nodeId"+MD5(nodename));
			g.build.setNodeProperties("nodeId"+MD5(nodename),{
				"nodeGraph":{xscale:5,yscale:5,fill:"green"},
				"nodeD3":{title:text,text:TextCutter(text,10,9) + " : 1" }
				//"nodeEvents":{click:{name:"TestFunc"}}
			}); 
		}else{
		
			var currentNodeProperty = g.build.getNodeProperties("nodeId"+MD5(nodename))["nodeGraph"];
			var newXscale = currentNodeProperty.xscale+1;
			var newYscale = currentNodeProperty.yscale+1;
			
			g.build.setNodeProperties("nodeId"+MD5(nodename),{
				"nodeGraph":{xscale:newXscale,yscale:newYscale},
				"nodeD3":{text:(currentNodeProperty.xscale-4)+ " : "+TextCutter(text,10,9),title:(currentNodeProperty.xscale-4)+ " : "+text}
			}); 
		}
		var paramData ={
			text:text,
			nodeId:"nodeId"+MD5(nodename),
			result_details:true
			};
		g.build.setNodeProperties("nodeId"+MD5(nodename),{
			"nodeEvents":{contextmenu:{name:"MakePopupMenu",param:JSON.stringify(paramData)}},
			"nodeGraph":{stroke:"darkgreen","stroke-width":4}
		}); 
	});
	
	
	var color = d3.scale.linear()
		.domain([0,wordHistory.length])
		.range(["red","blue"]);
	
	var transparent = d3.scale.linear()
		.domain([0,wordHistory.length])
		.range([0.2,0.75]);
		
		
	var lineWidth = d3.scale.linear()
		.domain([0,wordHistory.length])
		.range([10,1]);	
		
	//First Node for link
	g.build.addNodeWithLink("nodeId"+MD5(wordHistory[0]),"subNodeId"+0,"subLinkId"+0);
	g.build.setLinkProperties("subLinkId"+0,{
		"linkD3":{distance:10*g.build.getNodeProperties("nodeId"+MD5(wordHistory[0]))["nodeGraph"].xscale}});
	g.build.setNodeProperties("subNodeId"+0,{
		"nodeGraph":{xscale:3,yscale:3,fill:"red",stroke:"black","stroke-width":2},
		"nodeD3":{text:"start",title:"start"}
		});
	//debug
	//g.build.setNodeProperties("subNodeId"+0,{text:"subNodeId"+0,title:"subNodeId"+0});
	
	for(nodeCount=1;nodeCount<wordHistory.length;nodeCount++){
		sourceNode = wordHistory[nodeCount-1];
		targetNode = wordHistory[nodeCount];
		
		var targetNodeProperty = g.build.getNodeProperties("nodeId"+MD5(targetNode))["nodeGraph"];
		var sourceNodeProperty = g.build.getNodeProperties("nodeId"+MD5(sourceNode))["nodeGraph"];
		
		g.build.addNodeWithLink("nodeId"+MD5(targetNode),"subNodeId"+nodeCount,"subLinkId"+nodeCount);
		g.build.setLinkProperties("subLinkId"+nodeCount,{"linkD3":{distance:10+targetNodeProperty.xscale*5}});
		//debug
		//g.build.setNodeProperties("subNodeId"+nodeCount,{text:"subNodeId"+nodeCount,title:"subNodeId"+nodeCount});

		g.build.setNodeProperties("subNodeId"+nodeCount,{"nodeGraph":{fill:color(nodeCount)}});
		g.build.addLink("connectionLink"+nodeCount,"subNodeId"+(nodeCount-1),"subNodeId"+nodeCount);
		
		
		g.build.setLinkProperties("connectionLink"+nodeCount,{
			"linkGraph":{stroke:color(nodeCount),"stroke-width":lineWidth(nodeCount),"stroke-opacity":transparent(nodeCount)},
			"linkD3":{
				text:nodeCount,title:nodeCount + " of " + wordHistory.length,
				distance:10*(targetNodeProperty.xscale+sourceNodeProperty.xscale)
				}
			});
			//300
		if(sourceNode == targetNode){
			g.build.setLinkProperties("connectionLink"+nodeCount,{"linkD3":{strength:0}});  
			//g.build.setLinkProperties("connectionLink"+nodeCount,{
			//	strength:0,color:color(nodeCount),text:nodeCount,title:nodeCount,width:3
			//});  
		}
	}
	
	//LastNode
	g.build.setNodeProperties("subNodeId"+(wordHistory.length-1),{
		"nodeGraph":{xscale:3,yscale:3,fill:"blue",stroke:"black","stroke-width":2},
		"nodeD3":{text:"finish",title:"finish"}});
	
	
	
	
	// get results for each keyword
	
	var text="";
	Object.keys(wordsWithResults).forEach(function(keyword){
		Object.keys(wordsWithResults[keyword].results).forEach(function(result){	
		
			var currentResult = wordsWithResults[keyword].results[result];
			text = currentResult.title;
			
			storeDetailsForShorttime[wordsWithResults[keyword].results[result].uri] = wordsWithResults[keyword].results[result];

			//console.log("-------------");
			//console.log(result);
			//console.log(keyword);
			
			var currentNodeProperty = g.build.getNodeProperties("nodeId"+MD5(keyword))["nodeGraph"];
			g.build.addNodeWithLink("nodeId"+MD5(keyword),"ResultId"+linecount,"listId"+linecount);
			var paramData ={
				text:text,
				nodeId:"ResultId"+linecount,
				currentKey:result,
				keyword:keyword
				};
			g.build.setNodeProperties("ResultId"+linecount,{
				"nodeGraph":{xscale:2,yscale:2,fill:"orange"},
				"nodeD3":{
					text:TextCutter(text,10,9),
					title:text,
					poly:"hidden",
					circle:"hidden",
					image:"visible",
					imageX:-5,
					imageY:-5,
					imageWidth:10,
					imageHeight:10,
					imageLink: currentResult.hasOwnProperty("previewImage") ? currentResult.previewImage : "/media/no-img.png"
				},
				"nodeEvents":{contextmenu:{name:"MakePopupMenu",param:JSON.stringify(paramData)}}
			}); 

			// get node Properties with user mouse interactions
			if(wordsWithResults[keyword].userActions.hasOwnProperty(result)){
				g.build.setNodeProperties("ResultId"+linecount,{
					"nodeGraph":{stroke:"black","stroke-width":3}
				}); 
			}
			
			g.build.setLinkProperties("listId"+linecount,{
				"linkD3":{distance:75+currentNodeProperty.xscale*5},
				"linkGraph":{stroke:"green","stroke-width":2}//yellow
			});   
			
			linecount++;
		});
	});

	
	g.build.show.restart();
}
*/