

var DrawGraph = function(){
	var oC = {};//generate a object content json object;
	
	function getUniqueNodeName(index){
		return "UniqueNodeID_"+MD5(getDataFromIndexedDB.wordHistory[index]);
	};

	function AddResultNode(count,manyResult,uniqueNodeName,clusterDistance){
	
		var currentResult = {};
		var resultNodeName = "";
		var resultLinkName = "";
		
		currentResult = manyResult.results[manyResult.resultList[count]];
		resultNodeName = "ResultNodeID_"+uniqueNodeName+"_"+count;
		resultLinkName = "ResultLinkID_"+uniqueNodeName+"_"+count;
		
		var titleData = "no title";
		
		if(currentResult != undefined){
			titleData = currentResult.title;
		}
		
		

		forceGraph.To.Object().To.Node()
			.Add(resultNodeName)
			.Change(resultNodeName,{
				//drag:true,
				title:titleData,
				cluster:{name:"clus_"+uniqueNodeName,distance:clusterDistance,active:true},
				})//55
				
			.To.SubElement()
				.Add(resultNodeName,"svgtext","text")
				.Add(resultNodeName,"svghiddencircle","circle")
				.Change(resultNodeName,"svgtext",{
					attr:{},
					text:TextCutter(titleData,10,9)
					//event2:{action:"mouseout",func:"GrowShrinkCircle",param:JSON.stringify({nodeName:resultNodeName,radius:10})}
					//event:{action:"click",func:"WorkWithResultNode",param:JSON.stringify({nodeName:resultNodeName})}
				})
				.Change(resultNodeName,"svgcircle",{
					attr:{fill:"yellow",r:10},
					event1:{action:"mouseover",func:"GrowCircle",param:JSON.stringify({nodeName:resultNodeName})},
				})
				.Change(resultNodeName,"svghiddencircle",{
					event1:{action:"mouseout",func:"ShrinkCircle",param:JSON.stringify({nodeName:resultNodeName})},

					attr:{fill:"yellow",r:15,visibility:"hidden" }
				})
		.To.Object().To.Link()	
			//draw a connection link	
			.Add(uniqueNodeName,resultNodeName,resultLinkName)
			.Change(resultLinkName,{strength:0,attr:{fill:"none",stroke:"none"}});
			
			
		oC.ResultNodeEvent(resultNodeName);
		//console.log(oC);
		
		
		//add the bookmarks
		//todo
		//...
		if(bookmarkDict.nodes.hasOwnProperty(resultNodeName)){
			var bookmarkValues = bookmarkDict.nodes[resultNodeName];
			Object.keys(bookmarkValues).forEach(function(bookmarkElement){
				/////////////
				AddBookMarkInGraph(
					resultNodeName,
					bookmarkElement,
					bookmarkDict.bookmarks[bookmarkElement][resultNodeName].color);

				/////////////
			});
			

		}
		//var bookmarkValues = bookmarkDict.nodes[resultNodeName];
		//console.log(bookmarkDict);
		//console.log(bookmarkValues);
	}
	
	oC.AddResultNodes = function(uniqueNodeName,queries,maxLength){

		var manyResult = getDataFromIndexedDB.wordsWithResults[queries];

		if(manyResult.resultList.length == 0){
			return;
		}
		//manyResult.results[....]
		// .title
		// .previewImage
		// .uri
		//var maxLength = 5;
		if(maxLength > manyResult.resultList.length){
			maxLength = manyResult.resultList.length;
		}
		console.log("### " + maxLength);
		
		var currentResult = {};
		var resultNodeName = "";
		var resultLinkName = "";
		
		var clusterDistancdArray = [
			{count:5,distance:30,radius:120},
			{count:10,distance:60,radius:150},
			{count:20,distance:80,radius:200},
			{count:40,distance:90,radius:250},
			{count:80,distance:100,radius:370},
			{count:160,distance:105,radius:400}
			];
		var currentCount = 0;
		//draw a result node
		for(var count=0;count<maxLength;count++){
			if(clusterDistancdArray[currentCount].count == count){
				currentCount++;
			}
			AddResultNode(count,manyResult,uniqueNodeName,clusterDistancdArray[currentCount].distance);
		}
		var distance = clusterDistancdArray[currentCount].distance;
		forceGraph.To.Object().To.Node()
			.To.SubElement()
				.Change(uniqueNodeName,"svgcircle",{
					attr:{r:clusterDistancdArray[currentCount].radius}
				})
				.Change(uniqueNodeName,"textForRect",{attr:{transform:"translate(-80,"+(135+distance)+")"}})
				.Change(uniqueNodeName,"moreResult",{attr:{transform:"translate(30,"+(137+distance)+")"}})
				.Change(uniqueNodeName,"moreResultText",{attr:{transform:"translate(33,"+(148+distance)+")"}})
				.Change(uniqueNodeName,"lessResult",{attr:{transform:"translate(50,"+(137+distance)+")"}})
				.Change(uniqueNodeName,"lessResultText",{attr:{transform:"translate(53,"+(150+distance)+")"}})
				.Change(uniqueNodeName,"svgtext",{attr:{transform:"translate(-75,"+(150+distance)+")"}})
				.Change(uniqueNodeName,"resultText",{attr:{transform:"translate(-75,"+(170+distance)+")"}});
	}


	function AddUniqueQueryNode(index,uniqueNodeName){

		if(forceGraph.Graph.GetGraphData().data.dict.node[uniqueNodeName] == undefined){
			var queries = getDataFromIndexedDB.wordHistory[index];
			
			// draw a query node
			forceGraph.To.Object().To.Node()
				.Add(uniqueNodeName)
				.Change(uniqueNodeName,{title:queries,drag:true,cluster:{name:"clus_"+uniqueNodeName,distance:15,active:true}})
				.To.Cluster()
					.Add("clus_"+uniqueNodeName,uniqueNodeName)
					.To.Node()	
				.To.SubElement()
					.Change(uniqueNodeName,"svgcircle",{
						attr:{fill:"green","stroke":"darkgreen","stroke-width":4,r:120},
						event:{action:"click",func:"GetResults",param:JSON.stringify({query:queries})}
					})//10	
					//rect with title
					.Add(uniqueNodeName,"textForRect","rect")
					.Change(uniqueNodeName,"textForRect",{
						attr:{transform:"translate(-80,135)",height:20,width:150,fill:"lightgreen"}})
					.Add(uniqueNodeName,"svgtext","text")						
					.Change(uniqueNodeName,"svgtext",{attr:{transform:"translate(-75,150)"},text:TextCutter(queries,10,9)})
					//more or less results
					.Add(uniqueNodeName,"moreResult","rect")
					.Add(uniqueNodeName,"moreResultText","text")
					.Change(uniqueNodeName,"moreResult",{
						attr:{transform:"translate(30,137)",height:15,width:15,fill:"green"},
						event:{action:"click",func:"MoreResult",param:JSON.stringify({nodeName:uniqueNodeName,query:queries})}
					})
					.Change(uniqueNodeName,"moreResultText",{
						attr:{transform:"translate(33,148)"},
						event:{action:"click",func:"MoreResult",param:JSON.stringify({nodeName:uniqueNodeName,query:queries})},
						text:"+"})
						
					.Add(uniqueNodeName,"lessResult","rect")
					.Add(uniqueNodeName,"lessResultText","text")		
					.Change(uniqueNodeName,"lessResult",{
						attr:{transform:"translate(50,137)",height:15,width:15,fill:"green"},
						event:{action:"click",func:"LessResult",param:JSON.stringify({nodeName:uniqueNodeName,query:queries})}
					})
					.Change(uniqueNodeName,"lessResultText",{
						attr:{transform:"translate(53,150)"},
						event:{action:"click",func:"LessResult",param:JSON.stringify({nodeName:uniqueNodeName,query:queries})},
						text:"-"})
					.Add(uniqueNodeName,"resultText","text")
					.Change(uniqueNodeName,"resultText",{
						attr:{transform:"translate(-75,170)"},
						text:getDataFromIndexedDB.wordsWithResults[queries].resultList.length + " Results"})
					//visit keyword, query
					.Add(uniqueNodeName,"svgtext1","text")
					//.Change(uniqueNodeName,"svgtext1",{attr:{transform:"translate(0,-150)"},text:120})
					.Change(uniqueNodeName,"svgtext1",{attr:{transform:"translate(0,-150)"},text:1});
					
			oC.AddResultNodes(uniqueNodeName,queries,5,30);
		}else{
			return true;
		}
		return false
	};

	function AddHistoryQueryNode(isPreviousNode,index,uniqueNodeName,previousNode,historyNodeID){

		var isQueryNode = AddUniqueQueryNode(index,uniqueNodeName);

		var historyConnectionNameID = "HistoryConnectionID_"+index;

		var test = forceGraph.Graph.GetGraphData();
		if(forceGraph.Graph.GetGraphData().data.dict.node[historyNodeID] == undefined){
		
			var graphData = forceGraph.Graph.GetGraphData();
			//var radius = graphData.data.dict.node[uniqueNodeName].object.nodeContent.subElements["svgcircle"].attr.r;
			//radius = radius +2;
			var radius = graphData.data.dict.node[uniqueNodeName].object.nodeContent.subElements["svgtext1"].text;
			radius++;
			var clusterDistance = graphData.data.clusters["clus_"+uniqueNodeName].nodeContent.parameter.cluster.distance;
			clusterDistance = clusterDistance +2;
			
			//draw a subnode
			forceGraph.To.Object().To.Node()
				.Add(historyNodeID)
				.Change(historyNodeID,{
					//drag:true,
					cluster:{name:"clus_"+uniqueNodeName,distance:5,active:true}})
				.To.SubElement()
					//.Add(historyNodeID,"svgtext","text")
					//.Change(historyNodeID,"svgtext",{attr:{},text:index})
					.Change(historyNodeID,"svgcircle",{attr:{fill:"none"}})//grey
			.To.Object().To.Link()	
				//draw a connection link	
				.Add(uniqueNodeName,historyNodeID,historyConnectionNameID)
				.Change(historyConnectionNameID,{strength:0,attr:{fill:"none",stroke:"none"}})
			// grow a query node //????????????????
			.To.Object().To.Node()
				//.Change(uniqueNodeName,{cluster:{distance:clusterDistance}})//grow node
				.To.SubElement()
					//.Change(uniqueNodeName,"svgcircle",{attr:{r:radius}})//grow node
					.Change(uniqueNodeName,"svgtext1",{
						attr:{transform:"translate(0,-150)",style:"font-size:70px;"},text:radius});
			
			var lineProperty = {strength:0};
			if(!isQueryNode){

				//lineProperty = {strength:0.5,distance:300};
			}
			//draw a histrory link	
			if(isPreviousNode){
				var historyLinkNameID = "HistoryLinkID_"+index;
				forceGraph.To.Object().To.Link()	
					//draw a histrory link			
					.Add(previousNode,historyNodeID,historyLinkNameID)
					.Change(historyLinkNameID,lineProperty);
			}
				
		}else{
			//console.log("history node is exists");
		}
	};

	oC.DeleteResultNode = function(uniqueNodeId,graphData){
		//delete a result nodes
		var resultLinks = FilterTextList(graphData.dict.node[uniqueNodeId].connections,"ResultLinkID_"+ uniqueNodeId + "_");
		//console.log(resultLinks);
		
		var resultNodeName = "";
		resultLinks.forEach(function(element){
			//console.log(element);
			resultNodeName = "ResultNodeID_"+element.substring(13,element.length);
			
			//delete bookmarks
			//console.log(resultNodeName);//resultnode
			var resultLinkBookmarks = FilterTextList(graphData.dict.node[resultNodeName].connections,"LinkBookmark_");
			//console.log(resultLinkBookmarks);
			resultLinkBookmarks.forEach(function(element){
				forceGraph.To.Object().To.Node()
					.Delete(element.substring(4,element.length));
			});
			
			forceGraph.To.Object().To.Node()
				.Delete(resultNodeName);
		});
		forceGraph.To.Object().To.Node()
			.To.SubElement()
				.Change(uniqueNodeId,"svgcircle",{
					attr:{r:120}
				})				
				.Change(uniqueNodeId,"textForRect",{attr:{transform:"translate(-80,135)"}})
				.Change(uniqueNodeId,"moreResult",{attr:{transform:"translate(30,137)"}})
				.Change(uniqueNodeId,"moreResultText",{attr:{transform:"translate(33,148)"}})
				.Change(uniqueNodeId,"lessResult",{attr:{transform:"translate(50,137)"}})
				.Change(uniqueNodeId,"lessResultText",{attr:{transform:"translate(53,150)"}})
				.Change(uniqueNodeId,"svgtext",{attr:{transform:"translate(-75,150)"}})
				.Change(uniqueNodeId,"resultText",{attr:{transform:"translate(-75,170)"}});
	};
	
	function DeleteHistoryQueryNode(index){
		// get data from graph
		var graphData = forceGraph.Graph.GetGraphData().data;	
		var uniqueNodeId = graphData.dict.link["HistoryConnectionID_"+index].source.elementId;

		//delete history node
		forceGraph.To.Object().To.Node()
			.Delete("HistoryNodeID_"+index);

		//delete nodes
		var resultNodes = FilterTextList(graphData.dict.node[uniqueNodeId].connections,"HistoryConnectionID_");
		if(resultNodes.length == 0){
		//if(Object.keys(graphData.dict.node[uniqueNodeId].connections).length == 0){
			
			oC.DeleteResultNode(uniqueNodeId,graphData);

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
				//.Change(uniqueNodeId,{cluster:{distance:clusterDistance}})
				.To.SubElement()//shrink node
					//.Change(uniqueNodeId,"svgcircle",{attr:{r:radius}})
					//.Change(uniqueNodeId,"svgtext1",{attr:{transform:"translate(-20,-20)"},text:radius});
					
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
					fill:"none",stroke:"none"
					//stroke:"blue"
					}
			})
			.Add(startNodeID,uniqueNode,startConnectionID)
			.Change(startConnectionID,{strength:0,attr:{fill:"none",stroke:"none"}});		
	}
	
	function AddFirstNode(firstNode,uniqueNode){
		DrawNode(firstNode,uniqueNode,"StartNodeID","StartConnectionID","StartLinkID");
		forceGraph.To.Object().To.Node().To.SubElement()
			//.Change("StartNodeID","svgcircle",{attr:{fill:"red"}})
			.Change("StartNodeID","svgcircle",{attr:{fill:"none"}})
			
			//.Change("StartNodeID","svgtext",{attr:{},text:"start"})
		.To.Object().To.Link()
			//.Change("StartLinkID",{attr:{stroke:"red"}});
			.Change("StartLinkID",{attr:{fill:"none",stroke:"none"}});
			
			
	}
	
	function AddLastNode(lastNode,uniqueNode){
		DrawNode(lastNode,uniqueNode,"EndNodeID","EndConnectionID","EndLinkID");
		forceGraph.To.Object().To.Node().To.SubElement()
			//.Change("EndNodeID","svgcircle",{attr:{fill:"blue"}})
			.Change("EndNodeID","svgcircle",{attr:{fill:"none"}})
			
			//.Change("EndNodeID","svgtext",{attr:{},text:"finish"})
		.To.Object().To.Link()
			//.Change("EndLinkID",{attr:{stroke:"blue"}});
			.Change("EndLinkID",{attr:{fill:"none",stroke:"none"}});			
			
	}


	function IterateGraph(min,max,sliderMin,sliderMax,
		firstDraw,graphBigJump,graphShrinkLeft,graphGrowLeft,
		noUpdateGraph,graphShrinkRight,graphGrowRight,
		drawOneResult){

		//console.log("#: " +min+"(" + sliderMin + ")" + " - " +max+"(" + sliderMax + ")");
		if(min == max){
			drawOneResult();
			return;
		}
		
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
	
	
	//var oC = {
	oC.ResultNodeEvent = function(param){};

		oC.ChangeGraph = function(min,max){
			
			console.log(min +" - "+ max);

			
			if((max-min)==0){
				return;
			}
			
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
				.range([200,1]);//10	
				
			var index = min;
			var currentLinkName = "";
			var currentNodeName = "";
			
			var count = 0;
			do{
				//console.log(index);
				currentLinkName = "HistoryLinkID_"+(index+1);
				if(forceGraph.Graph.GetGraphData().data.dict.link.hasOwnProperty(currentLinkName)){/////////////
					forceGraph.To.Object().To.Link()
						.Change(currentLinkName,{attr:{
							stroke:color(count),
							"stroke-linecap":"round",
							"stroke-opacity":transparent(index),
							"stroke-width":lineWidth(index)
						}})
						;//.To.SubElement()
						//.Change(currentLinkName,"svgtext",{text:count,attr:{fill:"purple"}});
					
				}////////

				
				
				index++;
				count++;
			//}while(index <= max);
			}while(index < max);
			//forceGraph.To.Object().To.Graph().ReDraw();

			
			//change the line strength
			var graphData = forceGraph.Graph.GetGraphData().data.dict;
			var queryNodes = Object.keys(graphData.node).filter(function(element){
			    if(element.substring(0,"UniqueNodeID_".length) == "UniqueNodeID_"){
					return element;
				}
			}).map(function(element){
				return {
					count:Object.keys(graphData.node[element].connections).filter(function(nodeElement){
						if(nodeElement.substring(0,"HistoryConnectionID_".length) == "HistoryConnectionID_"){
							return nodeElement;
						}
					}).length,
					data:element
				};
			}).sort(function(a,b){
				if (a.count > b.count)
					return 1;
				if (a.count < b.count)
					return -1;
				// a must be equal to b
				return 0;
			}).reverse();
			console.log(graphData);
			console.log(queryNodes);
			
		};
		
		oC.ReDrawGraphNew=function(min,max,sliderMin,sliderMax){
		
			// draw first time a graph
			var firstDraw = function(){
				//console.log("slider first time");

				if(min==0 && max==1){
					return;
				}
				//var test1 = getUniqueNodeName(min);
				var index = min+1;
				
				var isNodeVisited = AddUniqueQueryNode(min,getUniqueNodeName(min));
				
				while(index <= max){
					isNodeVisited = AddUniqueQueryNode(index,getUniqueNodeName(index));
					//console.log(getUniqueNodeName(index));
					//if(!isNodeVisited){
						var historyLinkNameID = "HistoryLinkID_"+index;
						forceGraph.To.Object().To.Link()	
							//draw a histrory link			
							.Add(getUniqueNodeName(index),getUniqueNodeName(index-1),historyLinkNameID)
							.Change(historyLinkNameID,{strength:0,distance:500});
					//}
					
					index++;
				};

			};
			var sliderBigJump = function(){};
			var sliderShrinkLeft = function(){};
			var sliderGrowLeft = function(){
				var index = min+1;
				while(index <= sliderMin-1){
					//console.log(min+" . " + index + " . " + sliderMin);
					isNodeVisited = AddUniqueQueryNode(index,getUniqueNodeName(index));
					//console.log(getUniqueNodeName(index));
					//if(!isNodeVisited){
						var historyLinkNameID = "HistoryLinkID_"+index;
						forceGraph.To.Object().To.Link()	
							//draw a histrory link			
							.Add(getUniqueNodeName(index),getUniqueNodeName(index-1),historyLinkNameID)
							.Change(historyLinkNameID,{strength:0,distance:500});
					index++;
				//}while(index < sliderMin);
				};
	
			};
			var noUpdateGraph = function(){};
			var sliderShrinkRight = function(){};
			var drawOneResult = function(){};
			var sliderGrowRight = function(){};
			
			IterateGraph(min,max,sliderMin,sliderMax,
				firstDraw,sliderBigJump,sliderShrinkLeft,sliderGrowLeft,
				noUpdateGraph,sliderShrinkRight,sliderGrowRight,
				drawOneResult);
		};
		
		oC.ReDrawGraph=function(min,max,sliderMin,sliderMax){

			// draw first time a graph
			var firstDraw = function(){
				//console.log("slider first time");

				if(min==0 && max==1){
					return;
				}
				
				AddHistoryQueryNode(false,min,getUniqueNodeName(min),null,"HistoryNodeID_"+min);
				
				AddFirstNode("HistoryNodeID_"+min,getUniqueNodeName(min));
				
				var index = min+1;

				do{
					//console.log(index);
					AddHistoryQueryNode(true,index,getUniqueNodeName(index)//index
					,"HistoryNodeID_"+(index-1),"HistoryNodeID_"+(index));
					index++;
				}while(index <= max);
				

				AddLastNode("HistoryNodeID_"+(max-1),getUniqueNodeName(max-1));
				//min
				

				
				//forceGraph.To.Object().To.Graph().ReDraw();	
			};
			
			var drawOneResult = function(){
			
				forceGraph.To.Object()
					.To.Graph().Delete();
				
				//delete all nodes from search graph
				var currentNode = forceGraph.To.Object().To.Node();			
				Object.keys(forceGraph.Graph.GetGraphData().data.dict.node).forEach(function(key){
					currentNode.Delete(key);	
				});	

				
				AddHistoryQueryNode(false,min,getUniqueNodeName(min),null,"HistoryNodeID_"+min);

				AddFirstNode("HistoryNodeID_"+min,getUniqueNodeName(min));
				
				//forceGraph.To.Object().To.Graph().ReDraw();

				AddLastNode("HistoryNodeID_"+(max),getUniqueNodeName(max));
			}
			
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
				noUpdateGraph,sliderShrinkRight,sliderGrowRight,
				drawOneResult);

			var test = forceGraph.Graph.GetGraphData();
		};
	
	//};
	return oC;
};

