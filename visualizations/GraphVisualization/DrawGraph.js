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
		
		//generate slider
		var slidercontrol = new SilderControl();	
		slidercontrol.SetSliderControl("d3Slider","d3_slider");
		
		//set slider width
		slidercontrol.x.range([0,sliderWidth]);//slider width
		slidercontrol.x.domain([0,historyData.length-1]);		
		slidercontrol.isScale.xDataScale.domain(
				intalvalResults//["0","100","200","300"]
			)
			.rangePoints([0, sliderWidth], 0);//slider scale width
		
		
		//set slider work , min max values.
		var sliderMin = historyData.length-10;
		var sliderMax = historyData.length-1;
		
		//slider with events
		slidercontrol.brush.extent([sliderMin,sliderMax])
			.on("brush",function() {
				  var s = slidercontrol.brush.extent();
				  //circle.classed("selected", function(d) { return s[0] <= d && d <= s[1]; });
				  console.log(d3.round(s[0]) + " - " + d3.round(s[1]));
				})
			.on("brushend",function() {
					var s = slidercontrol.brush.extent();
				  //svg.classed("selecting", !d3.event.target.empty());
				});
		
		slidercontrol.ChangeSilderControl();
		
		//draw a graph
		DrawGraph(sliderMin,sliderMax);

	});
	
}

var forceGraph = new FGraph();

function DrawGraph(min,max){


	
	console.log("==========================");
	console.log({"wl":getDataFromIndexedDB.uniqueWords});
	console.log({"wl":getDataFromIndexedDB.queryObjHistory});

	console.log(getDataFromIndexedDB.wordsWithResults);
	console.log({"wl":getDataFromIndexedDB.wordHistory});
	
	//StartNodeID
	//StartConnectionID
	//EndNodeID
	//EndConnectionID
	
	//UniqueNodeID...
	
	//HistoryNodeID...
	//HistoryLinkID...
	//HistoryConnectionID...
	
	//draw a first graph
	//action begin --------------------------------------------------------------------------------------------
	//first node
	var historyIndex = 0;
	
	var queries = getDataFromIndexedDB.wordHistory[historyIndex];
	var nodeName = "UniqueNodeID_"+historyIndex;
	
	
	forceGraph.To.Object().To.Node()
		.Add(nodeName)
		.Change(nodeName,{title:queries})
		.To.SubElement()
			.Add(nodeName,"svgtext","text")
			.Change(nodeName,"svgtext",{attr:{transform:"translate(-20)"},text:TextCutter(queries,10,9)})
			.Change(nodeName,"svgcircle",{attr:{fill:"green",r:10}});
	

	//draw a start node
	var startNodeId = "StartNodeID";
	var startConnectionID = "StartConnectionID";
	forceGraph.To.Object().To.Node()
			.Add(startNodeId)
			.To.SubElement()
				.Add(startNodeId,"svgtext","text")
				.Change(startNodeId,"svgtext",{attr:{},text:"start"})
				.Change(startNodeId,"svgcircle",{attr:{fill:"blue"}})
	.To.Object().To.Link()	
			.Add(nodeName,startNodeId,startConnectionID)
			.Change(startConnectionID,{distance:70});
	//action end --------------------------------------------------------------------------------------------		
	
	
	function AddUniqueQuery(index){
		//var queries = getDataFromIndexedDB.wordHistory[index];
		
		var nodeName = "UniqueNodeID_"+index;
		if(forceGraph.Graph.GetGraphData().data.dict.node[nodeName] == undefined){
			var queries = getDataFromIndexedDB.wordHistory[index];
			
			forceGraph.To.Object().To.Node()
				.Add(nodeName)
				.Change(nodeName,{title:queries})
				.To.SubElement()
					.Add(nodeName,"svgtext","text")
					.Change(nodeName,"svgtext",{attr:{transform:"translate(-20)"},text:TextCutter(queries,10,9)})
					.Change(nodeName,"svgcircle",{attr:{fill:"green",r:10}});
		}
		
	}
	function AddHistoryQuery(index){
		var historyNodeID = "HistoryNodeID_"+index;
		var queries = getDataFromIndexedDB.wordHistory[index];
		
		var nodeName = "UniqueNodeID_"+index;
		var connectionName = "HistoryConnectionID_"+index;
		
		
		forceGraph.To.Object().To.Node()
			.Add(historyNodeID)
			.To.SubElement()
				.Add(historyNodeID,"svgtext","text")
				.Change(historyNodeID,"svgtext",{attr:{},text:index})
				.Change(historyNodeID,"svgcircle",{attr:{}})
		.To.Object().To.Link()	
				.Add(nodeName,historyNodeID,connectionName)
				;//.Change(startConnectionID,{});
				
	}
	
	AddUniqueQuery(1);
	AddHistoryQuery(1);
	
	
	//draw a graph
	forceGraph.To.Object().To.Graph().ReDraw();	
	
	/*
	//first node
	var queries = getDataFromIndexedDB.uniqueWords[0];
	var nodeName = "ID" + MD5(queries);
	
	forceGraph.To.Object().To.Node()
		.Add(nodeName)
		.Change(nodeName,{title:queries})
		.To.SubElement()
			.Add(nodeName,"svgtext","text")
			.Change(nodeName,"svgtext",{attr:{transform:"translate(-20)"},text:TextCutter(queries,10,9)})
			.Change(nodeName,"svgcircle",{attr:{fill:"green",r:10}});
			
	
	//test
	forceGraph.To.Object().To.Node()
			.Add("nX")
	.To.Object().To.Link()	
			.Add(nodeName,"nX","l1");
	
	
			
	//draw a graph
	forceGraph.To.Object().To.Graph().ReDraw();	
	*/
	
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