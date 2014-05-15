
function getUniqueNodeName(index){
	return "UniqueNodeID_"+MD5(getDataFromIndexedDB.wordHistory[index]);
};

function AddResultNodes(uniqueNodeName,queries){

	var manyResult = getDataFromIndexedDB.wordsWithResults[queries];

	if(manyResult.resultList.length == 0){
		return;
	}
//manyResult.results[....]
// .title
// .previewImage
// .uri
	var maxLength = 5;
	maxLength > manyResult.resultList.length ? manyResult.resultList.length : maxLength;
	
	var currentResult = {};
	var resultNodeName = "";
	var resultLinkName = "";
	//draw a result node
	for(var count=0;count<maxLength;count++){
		currentResult = manyResult.results[manyResult.resultList[count]];
		resultNodeName = "ResultNodeID_"+uniqueNodeName+"_"+count;
		resultLinkName = "ResultLinkID_"+uniqueNodeName+"_"+count;
		
		
		forceGraph.To.Object().To.Node()
			.Add(resultNodeName)
			.Change(resultNodeName,{
				//drag:true,
				title:currentResult.title,
				cluster:{name:"clus_"+uniqueNodeName,distance:30/*55*/,active:true}})
			.To.SubElement()
				.Add(resultNodeName,"svgtext","text")
				.Change(resultNodeName,"svgtext",{attr:{},text:TextCutter(currentResult.title,10,9)})
				.Change(resultNodeName,"svgcircle",{attr:{fill:"yellow",r:10}})
		.To.Object().To.Link()	
			//draw a connection link	
			.Add(uniqueNodeName,resultNodeName,resultLinkName)
			.Change(resultLinkName,{strength:0})
	}

}


function AddUniqueQueryNode(index,uniqueNodeName){
	if(forceGraph.Graph.GetGraphData().data.dict.node[uniqueNodeName] == undefined){
		var queries = getDataFromIndexedDB.wordHistory[index];
		
		// draw a query node
		forceGraph.To.Object().To.Node()
			.Add(uniqueNodeName)
			.Change(uniqueNodeName,{title:queries,/*drag:true,*/cluster:{name:"clus_"+uniqueNodeName,distance:15,active:true}})
			.To.Cluster()
				.Add("clus_"+uniqueNodeName,uniqueNodeName)
				.To.Node()	
			.To.SubElement()
				.Add(uniqueNodeName,"svgtext","text")
				.Change(uniqueNodeName,"svgtext",{attr:{transform:"translate(-20)"},text:TextCutter(queries,10,9)})
				.Change(uniqueNodeName,"svgcircle",{attr:{fill:"green",r:/*120*/10}})
				.Add(uniqueNodeName,"svgtext1","text")
				.Change(uniqueNodeName,"svgtext1",{attr:{transform:"translate(-20,-20)"},text:10});
				
		AddResultNodes(uniqueNodeName,queries);
	}else{
		//unknown
	}
};

function AddHistoryQueryNode(isPreviousNode,index,uniqueNodeName,previousNode,historyNodeID){

	AddUniqueQueryNode(index,uniqueNodeName);

	var historyConnectionNameID = "HistoryConnectionID_"+index;

	var test = forceGraph.Graph.GetGraphData();
	if(forceGraph.Graph.GetGraphData().data.dict.node[historyNodeID] == undefined){
	
		var graphData = forceGraph.Graph.GetGraphData();
		var radius = graphData.data.dict.node[uniqueNodeName].object.nodeContent.subElements["svgcircle"].attr.r;
		radius = radius +2;
		var clusterDistance = graphData.data.clusters["clus_"+uniqueNodeName].nodeContent.parameter.cluster.distance;
		clusterDistance = clusterDistance +2;
		
		//draw a subnode
		forceGraph.To.Object().To.Node()
			.Add(historyNodeID)
			.Change(historyNodeID,{
				//drag:true,
				cluster:{name:"clus_"+uniqueNodeName,distance:5,active:true}})
			.To.SubElement()
				.Add(historyNodeID,"svgtext","text")
				.Change(historyNodeID,"svgtext",{attr:{},text:index})
				.Change(historyNodeID,"svgcircle",{attr:{fill:"grey"}})
		.To.Object().To.Link()	
			//draw a connection link	
			.Add(uniqueNodeName,historyNodeID,historyConnectionNameID)
			////draw a histrory link			
			//.Add(previousNode,historyNodeID,historyLinkNameID)
			.Change(historyConnectionNameID,{strength:0})
		// grow a query node //????????????????
		.To.Object().To.Node()
			.Change(uniqueNodeName,{cluster:{distance:clusterDistance}})
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
	var graphData = forceGraph.Graph.GetGraphData().data;	
	var uniqueNodeId = graphData.dict.link["HistoryConnectionID_"+index].source.elementId

	//delete history node
	forceGraph.To.Object().To.Node()
		.Delete("HistoryNodeID_"+index);

	//delete nodes
	var resultNodes = FilterTextList(graphData.dict.node[uniqueNodeId].connections,"HistoryConnectionID_");
	if(resultNodes.length == 0){
	//if(Object.keys(graphData.dict.node[uniqueNodeId].connections).length == 0){
		
		//delete a result nodes
		var resultLinks = FilterTextList(graphData.dict.node[uniqueNodeId].connections,"ResultLinkID_"+ uniqueNodeId + "_");
		//console.log(resultLinks);
		
		var resultLinkName = "";
		resultLinks.forEach(function(element){
			//console.log(element);
			resultLinkName = "ResultNodeID_"+element.substring(13,element.length);
			forceGraph.To.Object().To.Node()
				.Delete(resultLinkName);
		});
	
		//delete unique query node
		forceGraph.To.Object().To.Node()
			.Delete(uniqueNodeId)
			.To.Cluster()
				.Delete("clus_"+uniqueNodeId);
	}else{
		// shrink the query node radius. //????????????????????
		var radius = graphData.dict.node[uniqueNodeId].object.nodeContent.subElements["svgcircle"].attr.r;
		radius = radius -2;
		
		var clusterDistance = graphData.clusters["clus_"+uniqueNodeId].nodeContent.parameter.cluster.distance;
		clusterDistance = clusterDistance -2;
		
		forceGraph.To.Object().To.Node()
			.Change(uniqueNodeId,{cluster:{distance:clusterDistance}})
			.To.SubElement()
				.Change(uniqueNodeId,"svgcircle",{attr:{r:radius}})
				.Change(uniqueNodeId,"svgtext1",{attr:{transform:"translate(-20,-20)"},text:radius});;
	}
};

function DrawNode(firstOrlastNode,uniqueNode,startNodeID,startConnectionID,startLinkID){

	forceGraph.To.Object().To.Node()
		.Add(startNodeID)
		.Change(startNodeID,{
			cluster:{name:"clus_"+uniqueNode,distance:5,active:true}
			})
			.To.SubElement()
				.Add(startNodeID,"svgtext","text")
				//.Change(startNodeID,"svgtext",{attr:{},text:"start"})
				.Change(startNodeID,"svgcircle",{attr:{r:10}})
		.To.Object().To.Link()	
		.Add(startNodeID,firstOrlastNode,startLinkID)	
		.Change(startLinkID,{strength:0,
			attr:{
				//stroke:"blue"
				}
		})
		.Add(startNodeID,uniqueNode,startConnectionID)
		.Change(startConnectionID,{strength:0});		
}
function AddFirstNode(firstNode,uniqueNode){
	DrawNode(firstNode,uniqueNode,"StartNodeID","StartConnectionID","StartLinkID");
	forceGraph.To.Object().To.Node().To.SubElement()
		.Change("StartNodeID","svgcircle",{attr:{fill:"red"}})
		.Change("StartNodeID","svgtext",{attr:{},text:"start"})
	.To.Object().To.Link()
		.Change("StartLinkID",{attr:{stroke:"red"}});
		
}
function AddLastNode(lastNode,uniqueNode){
	DrawNode(lastNode,uniqueNode,"EndNodeID","EndConnectionID","EndLinkID");
	forceGraph.To.Object().To.Node().To.SubElement()
		.Change("EndNodeID","svgcircle",{attr:{fill:"blue"}})
		.Change("EndNodeID","svgtext",{attr:{},text:"finish"})
	.To.Object().To.Link()
		.Change("EndLinkID",{attr:{stroke:"blue"}});	
}

function ChangeGraph(min,max){
	
	//console.log(min +" - "+ max);

	var domainArray = [0,getDataFromIndexedDB.wordHistory.length];//index
	var domainArrayColor = [0,(max-min)];//count
	
	var color = d3.scale.linear()
		.domain(domainArrayColor)
		.range(["red","blue"]);
	
	var transparent = d3.scale.linear()
		.domain(domainArray)
		.range([0.2,0.75]);
	
	var lineWidth = d3.scale.linear()
		.domain(domainArray)
		.range([10,1]);	
		
	var index = min;
	var currentLinkName = "";
	var currentNodeName = "";
	
	var count = 0;
	do{
		//console.log(index);
		currentLinkName = "HistoryLinkID_"+(index+1);

		forceGraph.To.Object().To.Link()
			.Change(currentLinkName,{attr:{
				stroke:color(count),
				"stroke-opacity":transparent(index),
				"stroke-width":lineWidth(index)
			}})
			.To.SubElement()
			.Change(currentLinkName,"svgtext",{text:count,attr:{fill:"purple"}});
		
		index++;
		count++;
	//}while(index <= max);
	}while(index < max);
	//forceGraph.To.Object().To.Graph().ReDraw();	
}


function ReDrawGraph(min,max,sliderMin,sliderMax){

	// draw first time a graph
	var firstDraw = function(){
		//console.log("slider first time");

		AddHistoryQueryNode(false,min,getUniqueNodeName(min),null,"HistoryNodeID_"+min);
		
		AddFirstNode("HistoryNodeID_"+min,getUniqueNodeName(min));
		
		var index = min+1;
		do{
			//console.log(index);
			AddHistoryQueryNode(true,index,getUniqueNodeName(index),"HistoryNodeID_"+(index-1),"HistoryNodeID_"+(index));
			index++;
		}while(index <= max);
		
		AddLastNode("HistoryNodeID_"+max,getUniqueNodeName(max));
	};
	
	var sliderBigJump = function(){
		//console.log("slider big junp");
		
		forceGraph.To.Object()
			.To.Graph().Delete();
		
		//delete all nodes from search graph
		var currentNode = forceGraph.To.Object().To.Node();			
		Object.keys(forceGraph.Graph.GetGraphData().data.dict.node).forEach(function(key){
			currentNode.Delete(key);	
		});	
			
		//var test = forceGraph.Graph.GetGraphData();
		

		AddHistoryQueryNode(false,min,getUniqueNodeName(min),null,"HistoryNodeID_"+min);
		AddFirstNode("HistoryNodeID_"+min,getUniqueNodeName(min));
		
		var index = min+1;
		do{
			//console.log(index);
			AddHistoryQueryNode(true,index,getUniqueNodeName(index),"HistoryNodeID_"+(index-1),"HistoryNodeID_"+(index));
			index++;
		}while(index <= max);
		
		AddLastNode("HistoryNodeID_"+max,getUniqueNodeName(max));
	};
	
	
	var sliderGrowLeft = function(){
		//add nodes on left side of the search graph.
		//console.log("slider grow on the left side");

		AddHistoryQueryNode(false,min,getUniqueNodeName(min),null,"HistoryNodeID_"+min);
		
		forceGraph.To.Object().To.Node().Delete("StartNodeID");
		AddFirstNode("HistoryNodeID_"+min,getUniqueNodeName(min));
		
		var index = min+1;
		do{
			AddHistoryQueryNode(true,index,getUniqueNodeName(index),"HistoryNodeID_"+(index-1),"HistoryNodeID_"+(index));
			//console.log(min+" . " + index + " . " + sliderMin);
			index++;
		//}while(index < sliderMin);
		}while(index <= sliderMin-1);
		
		
		
		var nextNode = "HistoryNodeID_"+sliderMin;
		var previousNode = "HistoryNodeID_"+(sliderMin-1)//min;
		var linkName = "HistoryLinkID_"+sliderMin;//min;/////////
		forceGraph.To.Object().To.Link()	
			//draw a history link	
			.Add(previousNode,nextNode,linkName)
			.Change(linkName,{strength:0,attr:{
				//stroke:"red"
				}
			});
			//.To.SubElement()
			//	.Change(linkName,"svgtext",{attr:{},text:sliderMin});
	};
	
	var  sliderShrinkLeft= function(){
		//delete nodes on left side of the search graph.
		
		//console.log("slider shrink on the left side");

		forceGraph.To.Object().To.Node().Delete("StartNodeID");
		
		
		var index = sliderMin;
		do{//while(index < min){
			//console.log(sliderMin + " - "+index + " - " + min);
			DeleteHistoryQueryNode(index);
			index++;
		}while(index <= min-1);	
		
		AddFirstNode("HistoryNodeID_"+min,getUniqueNodeName(min));
		
		//}while(index < min);
	};
	
	var noUpdateGraph = function(min,max,sliderMin,sliderMax){
	
	};
	
	var sliderShrinkRight = function(){
		//console.log("slider shrink on the right side");
		//delete nodes on right side of the search graph.
		
		forceGraph.To.Object().To.Node().Delete("EndNodeID");

		var index = max+1;
		do{
			//console.log(index);
			DeleteHistoryQueryNode(index);
			index++;
		}while(index <= sliderMax);
		
		AddLastNode("HistoryNodeID_"+max,getUniqueNodeName(max));
		
	};
	
	var sliderGrowRight = function(){
		//console.log("slider grow on the rifght side");
		
		forceGraph.To.Object().To.Node().Delete("EndNodeID");

		var index = sliderMax+1;
		do{
			//console.log("-" + index + "." + max);
			AddHistoryQueryNode(true,index,getUniqueNodeName(index),"HistoryNodeID_"+(index-1),"HistoryNodeID_"+(index));
			index++;
		}while(index <= max);
		
		AddLastNode("HistoryNodeID_"+max,getUniqueNodeName(max));
	};

	
	IterateGraph(min,max,sliderMin,sliderMax,
		firstDraw,sliderBigJump,sliderShrinkLeft,sliderGrowLeft,
		noUpdateGraph,sliderShrinkRight,sliderGrowRight);

	var test = forceGraph.Graph.GetGraphData();
}


function IterateGraph(min,max,sliderMin,sliderMax,
	firstDraw,graphBigJump,graphShrinkLeft,graphGrowLeft,
	noUpdateGraph,graphShrinkRight,graphGrowRight){

	//console.log("#: " +min+"(" + sliderMin + ")" + " - " +max+"(" + sliderMax + ")");

	if(min == sliderMin && max == sliderMax){
		firstDraw();
	}else{
		
		if(max < sliderMin || sliderMax < min){
			graphBigJump();
		}else{
			
			if(min < sliderMin){
				graphGrowLeft();
			}else if(min > sliderMin){
				graphShrinkLeft();
			}
			noUpdateGraph(min,max,sliderMin,sliderMax);
			/*
			var minNoUpdateGraph = min < sliderMin ? sliderMin : min;
			var maxNoUpdateGraph = max > sliderMax ? sliderMax : max;
			
			if(minNoUpdateGraph <maxNoUpdateGraph){
			
				var index = minNoUpdateGraph+1;
				do{
					//console.log(index);
					//change lines and nodes properties.

					//forceGraph.To.Object().To.Link()	
					//	//draw a history link	
					//	.Change("HistoryLinkID_"+index,{attr:{stroke:"blue"}})
					//	.To.SubElement()
					//		.Add("HistoryLinkID_"+index,"svgtextX","text")
					//		.Change("HistoryLinkID_"+index,"svgtextX",{attr:{fill:"blue",transform:"translate(0,-20)"},text:index});

					index++;
				}while(index < maxNoUpdateGraph);
			}else{
				//doto anything
			}
			*/
			if(max < sliderMax){
				graphShrinkRight();
			}else if(max > sliderMax){
				graphGrowRight();
			}
		}
		
	}
	

	//test Control begin
	////////////////////////////////////////////////////
	/*
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
	*/
	//test Control end
	

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