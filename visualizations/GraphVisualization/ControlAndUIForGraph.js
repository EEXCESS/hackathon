//help functions
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

	if(text == undefined){
		console.log("no text");
		return "no text";
	}
	return text.length < sizeCompare ? text : text.substring(0,sizeCut)+"..."; 
}

function FilterTextList(objectVar,stringVal){
	return Object.keys(objectVar).filter(function(element){
        return stringVal == element.substring(0,stringVal.length);
    });
}

function ChangeResultNodes(circleProperties,textProperties){
	var changeNodes = FilterTextList(forceGraph.Graph.GetGraphData().data.dict.node,"ResultNodeID_UniqueNodeID_");
	
	changeNodes.forEach(function(element){
		forceGraph.To.Object().To.Node().To.SubElement()
			.Change(element,"svgcircle",circleProperties)
			.Change(element,"svgtext",textProperties);
	});

}


//only test function
function LastTestAction(){
//only test output
	console.log({"wl":getDataFromIndexedDB.queryObjHistory});
	console.log({"wl":getDataFromIndexedDB.uniqueWords});

	console.log(getDataFromIndexedDB.wordsWithResults);
	console.log({"wl":getDataFromIndexedDB.wordHistory});
	
	console.log("---------");
}

//init the application

//get data from indexedDB
var getDataFromIndexedDB = null;
getDataFromIndexedDB = new GetDataFromIndexedDB();

getDataFromIndexedDB.Init(function(){
	LastTestAction();
	forceGraph.InitGraph("#D3graph");
	forceGraph.To.Object().Graph.GetGraphData().data.funcDict = funcStore;
	//very important!
	//start the jQuery library
	$(BuildControls);
	
	//BuildControls();
});




function AddBookMarkInGraph(nodeId,bookmarkId,color){

	var bookmarkNodeId = "Bookmark_"+nodeId+"_"+bookmarkId;
	forceGraph.To.Object().To.Node()
		.Add(bookmarkNodeId)
		.Change(bookmarkNodeId,{title:bookmarkId})
		.To.SubElement()
			.Delete(bookmarkNodeId,"svgcircle")
			.Add(bookmarkNodeId,"svgrect","rect")
			.Change(bookmarkNodeId,"svgrect",{
				attr:{"fill":color,x:-5,y:-5,width:10,height:10}
			})
	.To.Object().To.Link()
		.Add(nodeId,bookmarkNodeId,"LinkBookmark_"+nodeId+"_"+bookmarkId)
		.Change("LinkBookmark_"+nodeId+"_"+bookmarkId,{distance:2});
	
	forceGraph.To.Object().To.Graph().ReDraw();
	
}

function DeleteBookMarkFromGraph(nodeId,bookmarkId){


	var bookmarkNodeId = "Bookmark_"+nodeId+"_"+bookmarkId;
	forceGraph.To.Object().To.Node()
		.Delete(bookmarkNodeId);
	forceGraph.To.Object().To.Graph().ReDraw();
}



var funcStore =	{
	"WorkWithResultNode":function(param){
		//var appModus = "bookmark";
		//if(appModus == "bookmark"){
		if($("#workbookmark").text() == "(de)select"){
			//console.log(JSON.parse(param).nodeName + " - " +currentSelectedBookmark);
			
			var currentNodeId = JSON.parse(param).nodeName;
			//var test = forceGraph.Graph.GetGraphData();
			
			if(currentSelectedBookmark == null){
				console.log("no bookmark selected");
			}else{
				var bookmarkElement = $("#"+currentSelectedBookmark+" .bookmark_element_"+currentNodeId);
				
				if(bookmarkElement.length == 0){
					//add new bookmark element
					
					var queryNodePartNames = currentNodeId.split("_");
					$("#"+currentSelectedBookmark+" .bookmarkelement")
						.append(
							'<div class="bookmark_element_'+currentNodeId+'">'
								+'<div class="bookmarkdata">'
									+"Query: "+$("#"+queryNodePartNames[1] + "_" +queryNodePartNames[2]+" title").text()
								+'</div>'
								+'<div class="bookmarkdata">'
									+$("#"+currentNodeId+" title").text()
								+'</div>'
							+'</div>');
					AddBookMarkInGraph(currentNodeId,currentSelectedBookmark,
						$("#"+currentSelectedBookmark+" .editcolor").val());	
					bookmarkDict.bookmarks[currentSelectedBookmark][currentNodeId] ={};
					bookmarkDict.bookmarks[currentSelectedBookmark][currentNodeId] ={
						color:$("#"+currentSelectedBookmark+" .editcolor").val()
					};
					
					if(!bookmarkDict.nodes.hasOwnProperty(currentNodeId)){
						bookmarkDict.nodes[currentNodeId]={};
					}
					bookmarkDict.nodes[currentNodeId][currentSelectedBookmark] = null;
				}else{
					//delete bookmark element
					$("#"+currentSelectedBookmark+" .bookmark_element_"+currentNodeId).remove();
					DeleteBookMarkFromGraph(currentNodeId,currentSelectedBookmark);
					
					delete bookmarkDict.bookmarks[currentSelectedBookmark][currentNodeId];

					delete bookmarkDict.nodes[currentNodeId][currentSelectedBookmark];
					
					if(bookmarkDict.nodes[currentNodeId].length == 0){
						delete bookmarkDict.nodes.currentNodeId;
					}
				}
			}
		}	
		//}
	},
	"MoreResult":function(param){
		// get data from graph
		var graphData = forceGraph.Graph.GetGraphData().data;	
		var uniqueNodeId = JSON.parse(param).nodeName;
		
		drawGraphObj.DeleteResultNode(uniqueNodeId,graphData);
		drawGraphObj.AddResultNodes(uniqueNodeId,JSON.parse(param).query,1000);
		
		forceGraph.To.Object().To.Graph().ReDraw();
	},
	"LessResult":function(param){
		//console.log(JSON.parse(param).nodeName);
		var graphData = forceGraph.Graph.GetGraphData().data;	
		var uniqueNodeId = JSON.parse(param).nodeName;
		
		drawGraphObj.DeleteResultNode(uniqueNodeId,graphData);
		drawGraphObj.AddResultNodes(uniqueNodeId,JSON.parse(param).query,5);
		
		forceGraph.To.Object().To.Graph().ReDraw();
	},
	"AddNewTextForSearch":function(param){
		//console.log(JSON.parse(param).nodeName);
		//console.log($("#"+JSON.parse(param).nodeName +" title").text());
		var searchText = $("#searchtext").val();
		searchText += " " +$("#"+JSON.parse(param).nodeName +" title").text();
		$("#searchtext").val(searchText);
		
	}
};



// make graph and control objects.
var forceGraph = new FGraph();
var drawGraphObj = new DrawGraph();
var slidercontrol = new SilderControl();


// build Controls
//function BuildControls(){



var BuildControls = function(){
	var sliderMin = 0;
	var sliderMax = 0;

	//console.log("build slider");
	//console.log({"wl":getDataFromIndexedDB.queryObjHistory});
	
	var historyData = getDataFromIndexedDB.queryObjHistory;
	var intalvalResults = GetSamePartOfArray(historyData.length,4);
	var sliderWidth = 900;
	

	
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
	//console.log(historyData);
	if(historyData.length < 5){
		sliderMin = 0;
		sliderMax = 0;
	}else{
		sliderMin = historyData.length-5;
		sliderMax = historyData.length-1;
	}

	
	//slider with events
	slidercontrol.brush.extent([sliderMin,sliderMax])
		.on("brush",function() {
			var s = slidercontrol.brush.extent();
			if(sliderMin != d3.round(s[0]) || sliderMax != d3.round(s[1])){
				//circle.classed("selected", function(d) { return s[0] <= d && d <= s[1]; });
				//console.log("min: " + d3.round(s[0]) + " - max: " + d3.round(s[1]));

				drawGraphObj.ReDrawGraph(d3.round(s[0]),d3.round(s[1]),sliderMin,sliderMax);
				//drawGraphObj.ReDrawGraphNew(d3.round(s[0]),d3.round(s[1]),sliderMin,sliderMax);
				
				sliderMin = d3.round(s[0]);
				sliderMax = d3.round(s[1]);

				drawGraphObj.ChangeGraph(sliderMin,sliderMax);
				var graphForce = forceGraph.To.Object().To.Graph().GetForceObj();
				graphForce.stop();
				
				forceGraph.To.Object().To.Graph().ReDraw();	
				
				var test = forceGraph.Graph.GetGraphData();
			}
			
		})
		.on("brushend",function() {
			var graphForce = forceGraph.To.Object().To.Graph().GetForceObj();
			graphForce.start();
			  //svg.classed("selecting", !d3.event.target.empty());
		});
	
	slidercontrol.ChangeSilderControl();
	
	//draw a graph in first time

	drawGraphObj.ReDrawGraph(sliderMin,sliderMax,sliderMin,sliderMax);
	//drawGraphObj.ReDrawGraphNew(sliderMin,sliderMax,sliderMin,sliderMax);
	drawGraphObj.ChangeGraph(sliderMin,sliderMax);
	
	forceGraph.To.Object().To.Graph().ReDraw();	
	
	
	
	
	///////////////////////////////////////////////////////////////////////////

	
	$("#go").click(function(){
		$("#searchstatus").text("searching");
		
		var textinput = $("#searchtext").val();
		var query_terms = textinput.split(' ');
		var query = [];
		for (var i = 0; i < query_terms.length; i++) {
			var tmp = {
				weight: 1,
				text: query_terms[i]
			};
			query.push(tmp);
		}
		console.log("start search");
		
		//begin search
		EEXCESS.callBG({
			method: {parent: 'model', func: 'query'}, data:query //data: [{weight:1,text:dataParameter.text}]
		});

	});
	
	//search finished with results, asynchronous call
	EEXCESS.messageListener(
		function(request, sender, sendResponse) {
			if (request.method === 'newSearchTriggered') {
				console.log("finish search XX");
				getDataFromIndexedDB.GetNewData(function(){
					LastTestAction();
					$("#searchstatus").text("search finish");
					
					var historyData = getDataFromIndexedDB.queryObjHistory;
					var intalvalResults = GetSamePartOfArray(historyData.length,4);

					
					slidercontrol.x.domain([0,historyData.length-1]);
					//set slider width
					slidercontrol.isScale.xDataScale.domain(
						intalvalResults//["0","100","200","300"]
					);

					
					if($("#growgraph:checked" ).val() == "growgraph"){
						slidercontrol.brush.extent([sliderMin,historyData.length-1]);
						
						drawGraphObj.ReDrawGraph(sliderMin,historyData.length-1,sliderMin,sliderMax);	
						drawGraphObj.ChangeGraph(sliderMin,historyData.length-1);
						sliderMax = historyData.length-1;

						forceGraph.To.Object().To.Graph().ReDraw();	
		
					}else{
						slidercontrol.brush.extent([sliderMin,sliderMax]);
					}
					

					
					slidercontrol.ChangeSilderControl();
				});
			}
		}
	);
	
	
	
	$("#growgraph").click(function(event){
		if($("#growgraph:checked" ).val() == "growgraph"){
		
			var historyData = getDataFromIndexedDB.queryObjHistory;
			slidercontrol.brush.extent([sliderMin,historyData.length-1]);
			slidercontrol.ChangeSilderControl();
			
			drawGraphObj.ReDrawGraph(sliderMin,historyData.length-1,sliderMin,sliderMax);	
			drawGraphObj.ChangeGraph(sliderMin,historyData.length-1);

			forceGraph.To.Object().To.Graph().ReDraw();	
		
		}else{

		}
	});
	
	$("#explore_graph").click(function(){
		//$("#UniqueNodeID_9f7ca7b1088e57abb9e129858507c760").on("click.aa",function(){
		//	console.log("123 ################## 123");
		//});
		
	});
	
	//hack......................only test
	var toggleAddSearch = false;
	$("#add_search").click(function(){
		if(!toggleAddSearch){
			drawGraphObj.ResultNodeEvent = function(resultNodeName){
				forceGraph.To.Object().To.Node().To.SubElement()
					.Change(resultNodeName,"svgcircle",{
						attr:{stroke:"blue","stroke-width":5},
						event:{action:"click",func:"AddNewTextForSearch",param:JSON.stringify({nodeName:resultNodeName})}
					}).Change(resultNodeName,"svgtext",{
						event:{action:"click",func:"AddNewTextForSearch",param:JSON.stringify({nodeName:resultNodeName})}
						});
			
			};
			//ChangeResultNodes({attr:{stroke:"blue","stroke-width":5}});
			
			var changeNodes = FilterTextList(forceGraph.Graph.GetGraphData().data.dict.node,"ResultNodeID_UniqueNodeID_");

			changeNodes.forEach(function(element){
				forceGraph.To.Object().To.Node().To.SubElement()
					.Change(element,"svgcircle",{
						attr:{stroke:"blue","stroke-width":5},
						event:{action:"click",func:"AddNewTextForSearch",param:JSON.stringify({nodeName:element})}
					})
					.Change(element,"svgtext",{
						event:{action:"click",func:"AddNewTextForSearch",param:JSON.stringify({nodeName:element})}
					});
			});	
			
			
			forceGraph.To.Object().To.Graph().ReDraw();
			toggleAddSearch = true;
		}else{
			drawGraphObj.ResultNodeEvent = function(resultNodeName){
				forceGraph.To.Object().To.Node().To.SubElement()
					.Change(resultNodeName,"svgcircle",{attr:{stroke:"","stroke-width":""}})
					.Change(resultNodeName,"svgcircle",{
						event:{action:"",func:"",param:""}
					});
			
			};
			ChangeResultNodes({attr:{stroke:"","stroke-width":""},event:{action:"",func:"",param:""}},
			{event:{action:"",func:"",param:""}});
			
			forceGraph.To.Object().To.Graph().ReDraw();
			toggleAddSearch = false;
		}
		
	});
	
};






