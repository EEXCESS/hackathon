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

function ChangeResultNodes(Func){
	drawGraphObj.ResultNodeEvent = Func;
	var changeNodes = FilterTextList(forceGraph.Graph.GetGraphData().data.dict.node,"ResultNodeID_UniqueNodeID_");
	changeNodes.forEach(Func);
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
				attr:{"fill":color,x:-5,y:-5,width:10,height:10},
				event:{action:"mouseover",func:"MouseOverBookmark",param:JSON.stringify({
					nodeName:bookmarkNodeId,bookmarkName:bookmarkId,nodeId:nodeId,color:color})},
				event1:{action:"mouseout",func:"MouseOutBookmark",param:JSON.stringify({
					nodeName:bookmarkNodeId,bookmarkName:bookmarkId,nodeId:nodeId,color:color})}
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


// make graph and control objects.
var forceGraph = new FGraph();
var drawGraphObj = new DrawGraph();
var slidercontrol = new SilderControl();


var rList = null;
var onlyResult = false;
var currentResultClick = {
	resultNode:null,
	queryNode:null
	};

var currentHover = null;

//storefunction for graph	
var funcStore =	{
	"WorkWithResultNode":function(param){

		//if(toggleBookmark){
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
						'<div style="user-select: text;" class="bookmark_element_'+currentNodeId+' grey_round_box">'
							+'<div>'
								+'<span class="type_bold">query: </span>'
								+'<span class="querycontent">'
								+$("#"+queryNodePartNames[1] + "_" +queryNodePartNames[2]+" title").text()
								+'</span>'
							+'</div>'
							+'<div>'
								+'<span class="type_bold">title:</span>'
								+$("#"+currentNodeId+" title").text()
							+'</div>'
						+'</div>');
				
				//add bookmark hover
				$(".bookmark_element_"+currentNodeId).on("mouseover",function(){
					funcStore["MouseOverBookmark"](JSON.stringify({
						nodeName:"Bookmark_"+currentNodeId+"_"+currentSelectedBookmark,
						bookmarkName:currentSelectedBookmark,
						nodeId:currentNodeId,
						color:"black"}));
				});
				$(".bookmark_element_"+currentNodeId).on("mouseout",function(){
					funcStore["MouseOutBookmark"](JSON.stringify({
						nodeName:"Bookmark_"+currentNodeId+"_"+currentSelectedBookmark,
						bookmarkName:currentSelectedBookmark,
						nodeId:currentNodeId,
						color:"black"}));
				});
				$(".bookmark_element_"+currentNodeId).on("click",function(){
					var searchText = 
						$("#"+currentSelectedBookmark+" .bookmark_element_"+currentNodeId+" .querycontent").text();
					//console.log("|"+searchText+"|");
					
					var historyNumber = [];
					getDataFromIndexedDB.wordHistory.forEach(function(query,index){
						if(searchText == query){
							historyNumber.push(index);
						}
					});
					//console.log(historyNumber);
					//console.log(sliderMin+ " , "+sliderMax);
					var binaryContent ={number:0,min:false,max:false};
					var vmin = null;
					var vmax = null;
					
					for(var icount=0;icount<historyNumber.length;icount++){
						binaryContent ={number:historyNumber[icount],min:false,max:false};
						
						if(sliderMin<=historyNumber[icount]){
							binaryContent.min = true;
						}
						if(historyNumber[icount]<=sliderMax){
							binaryContent.max = true;
						}
						
						if(binaryContent.min == true && binaryContent.max == true){
							//bookmark are here
							vmin = null; vmax = null;
							break;
						//bookmark not here
						}else if(binaryContent.min == false && binaryContent.max == true){
							vmin = binaryContent.number;
						}else if(binaryContent.min == true && binaryContent.max == false){
							vmax = binaryContent.number;
							break;
						}

					}
					
					if(vmin != null && vmax != null){
						if((sliderMin - vmin)<(vmax-sliderMax)){
							sliderMin = vmin;
						}else{
							sliderMax = vmax;
						}
					}else if(vmin != null && vmax == null){
						sliderMin = vmin;
					}else if(vmax != null && vmin == null){
						sliderMax = vmax;
					}
					
					slidercontrol.brush.extent([sliderMin, sliderMax]);
					
					drawGraphObj.ReDrawGraph(sliderMin,sliderMax,sliderMin,sliderMax);
					drawGraphObj.ChangeGraph(sliderMin,sliderMax);
					forceGraph.To.Object().To.Graph().ReDraw();
					
					slidercontrol.ChangeSilderControl();
				});	
				AddBookMarkInGraph(currentNodeId,currentSelectedBookmark,
					$("#"+currentSelectedBookmark+" .editcolor").val());	
				bookmarkDict.bookmarks[currentSelectedBookmark][currentNodeId] ={};
				bookmarkDict.bookmarks[currentSelectedBookmark][currentNodeId] ={
					color:$("#"+currentSelectedBookmark+" .editcolor").val(),
					query:$("#"+queryNodePartNames[1] + "_" +queryNodePartNames[2]+" title").text(),
					title:$("#"+currentNodeId+" title").text()
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
				
				if(Object.keys(bookmarkDict.nodes[currentNodeId]).length == 0){
					delete bookmarkDict.nodes[currentNodeId];
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
		var searchText = $("#searchtext").val();
		searchText += " " +$("#"+JSON.parse(param).nodeName +" title").text();
		$("#searchtext").val(searchText);
		
	},
	"ShowDetails":function(param){

		//console.log("gg "+ param);
		var nodeName = JSON.parse(param).nodeName;
		
		var nameArray = nodeName.split("_");
		
		var queryNode = "UniqueNodeID_" + nameArray[2];
		var queryNodeTitle = $("#"+queryNode +" title").text();
		var currentQueryNodeObj = getDataFromIndexedDB.wordsWithResults[queryNodeTitle];
		
		console.log(currentQueryNodeObj);
		var currentArrayResult = currentQueryNodeObj.resultList[parseInt(nameArray[3])];
		//var currentResult = currentQueryNodeObj.results[currentArrayResult];
		//console.log(currentResult);		
		
		
		//change nodes properties
		if(currentResultClick.resultNode != null){
			forceGraph.To.Object().To.Node().To.SubElement()
				.Change(currentResultClick.resultNode,"svgcircle",{
					attr:{"stroke":"","stroke-width":""}
				}).Change(currentResultClick.queryNode,"svgcircle",{attr:{"fill-opacity":1.0}});
			forceGraph.To.Object().To.Graph().ReDraw();
		}
		currentResultClick.resultNode = nodeName;
		currentResultClick.queryNode = queryNode;
		forceGraph.To.Object().To.Node().To.SubElement()
			.Change(nodeName,"svgcircle",{
				attr:{"stroke":"black","stroke-width":3}
			}).Change(queryNode,"svgcircle",{attr:{"fill-opacity":0.5}});
		forceGraph.To.Object().To.Graph().ReDraw();	
		
		
		//get to details

		
		function ClearDetailData(){
			$("#bookmarklist *").remove();
			$("#title_data").val("");
			$("#link_data").text("").attr("href","");
			$("#image_data").attr("src","");
			$("#id_data, #language_data, #partner_data, #provider_data, #type_data, #year_data").text("");
		};
		ClearDetailData();

		var detailData = currentQueryNodeObj.results[currentArrayResult];
		//console.log(detailData);
		
		//bookmarkDict
		if(Object.keys(bookmarkDict.nodes).length > 0){
			if(bookmarkDict.nodes.hasOwnProperty(nodeName)){
				Object.keys(bookmarkDict.nodes[nodeName]).forEach(function(bookmarkName){
					var bookmarkdata = bookmarkDict.bookmarks[bookmarkName][nodeName];
					$("#bookmarklist").append(
						'<li class="bookmark_box">'
						+'<span style="background-color:'+bookmarkdata.color+';">&nbsp;&nbsp;</span>'
						+bookmarkName+'</li>');
				});
			}
		}
		
		$("#title_data").val(detailData.title);
		$("#link_data").text(detailData.uri).attr("href",detailData.uri);//.val(TextCutter(detailData.uri,20,19));
		$("#image_data").attr("src",detailData.previewImage);
		$("#id_data").text(detailData.id);
		
		$("#language_data").text(detailData.facets.language);
		$("#partner_data").text(detailData.facets.partner);
		$("#provider_data").text(detailData.facets.provider);
		$("#type_data").text(detailData.facets.type);
		$("#year_data").text(detailData.facets.year);

		//var test = forceGraph.Graph.GetGraphData();
		
	},
	"GetResults":function(param){
		$("#result_btn").trigger("click");
		//console.log(JSON.parse(param).queries);
		onlyResult = true;
		rList.loading(); // show loading bar, will be removed when new results arrive
		
		//$("#searchstatus").text("searching");
		
		var textinput = JSON.parse(param).query;
		var query_terms = textinput.split(' ');
		var query = [];
		for (var i = 0; i < query_terms.length; i++) {
			var tmp = {
				weight: 1,
				text: query_terms[i]
			};
			query.push(tmp);
		}
		console.log("start search go");
	

	
		//begin search
		EEXCESS.callBG({
			method: {parent: 'model', func: 'query'}, data:query //data: [{weight:1,text:dataParameter.text}]
		});
	},
	"ShrinkCircle":function(param){
		var paramObj = JSON.parse(param);
		forceGraph.To.Object().To.Node()
			.To.SubElement()
				.Change(paramObj.nodeName,"svgcircle",{
					attr:{visibility:"visible"}
				})
				.Change(paramObj.nodeName,"svghiddencircle",{
					attr:{visibility:"hidden"}
				});
				
		forceGraph.To.Object().To.Graph().ReDraw();	

	},
	"GrowCircle":function(param){
		var paramObj = JSON.parse(param);
		
		if(currentHover != null){
			try{
				forceGraph.To.Object().To.Node()
					.To.SubElement()
						.Change(currentHover,"svgcircle",{
							attr:{visibility:"visible"}
						})
						.Change(currentHover,"svghiddencircle",{
							attr:{visibility:"hidden"}
						});
			}catch(ex){}
		}
		currentHover = paramObj.nodeName;
		
		
		forceGraph.To.Object().To.Node()
			.To.SubElement()
				.Change(paramObj.nodeName,"svgcircle",{
					attr:{visibility:"hidden"}
				})
				.Change(paramObj.nodeName,"svghiddencircle",{
					attr:{visibility:"visible"}
				});
				
		forceGraph.To.Object().To.Graph().ReDraw();	
	},
	"MouseOverBookmark":function(param){
		var bookmarkNodeId = JSON.parse(param);
		
		try{
			forceGraph.To.Object().To.Node()
				.To.SubElement()
					.Change(bookmarkNodeId.nodeName,"svgrect",{
						attr:{transform:"scale(2)"}});
			
			forceGraph.To.Object().To.Graph().ReDraw();	
		}catch(e){}
		$("#"+bookmarkNodeId.bookmarkName+", "
			+"#"+bookmarkNodeId.bookmarkName+" .bookmark_element_"+bookmarkNodeId.nodeId).css({
			"outline-width":2,"outline-color":bookmarkNodeId.color,"outline-style":"dashed"});
	
		
	},
	"MouseOutBookmark":function(param){
		var bookmarkNodeId = JSON.parse(param);
		
		try{
			forceGraph.To.Object().To.Node()
				.To.SubElement()
					.Change(bookmarkNodeId.nodeName,"svgrect",{
						attr:{transform:"scale(1)"}});
			
			forceGraph.To.Object().To.Graph().ReDraw();	
		}catch(e){}
		
		$("#"+bookmarkNodeId.bookmarkName+", "+".bookmark_element_"+bookmarkNodeId.nodeId).css({
			"outline-width":"","outline-color":"","outline-style":""});
	}
};








// show the Details
var DetailsFunction = function(){
	if(!toggleDetails){
		function EventDetailsParam(resultNodeName){
			return {action:"click",func:"ShowDetails",param:JSON.stringify({nodeName:resultNodeName})};
		};
		var ShowDetailsNode = function(resultNodeName){
			forceGraph.To.Object().To.Node().To.SubElement()
				.Change(resultNodeName,"svghiddencircle",{
					event:EventDetailsParam(resultNodeName)//,
					//attr:{"stroke":"black","stroke-width":3}
				})
				;//.Change(resultNodeName,"svgtext",{event:EventDetailsParam(resultNodeName)});
		};
		
		ChangeResultNodes(ShowDetailsNode);
		
		forceGraph.To.Object().To.Graph().ReDraw();	
		toggleDetails = true;
	}else{
		function EventEmptyParam(){
			return {action:"",func:"",param:""};
		}
		var ShowNotDetailsNode = function(resultNodeName){
			forceGraph.To.Object().To.Node().To.SubElement()
				.Change(resultNodeName,"svghiddencircle",{
					event:EventEmptyParam()//,
					//attr:{"stroke":"","stroke-width":""}
				})
				;//.Change(resultNodeName,"svgtext",{event:EventEmptyParam()});
		};
		
		ChangeResultNodes(ShowNotDetailsNode);

		forceGraph.To.Object().To.Graph().ReDraw();	
		toggleDetails = false;
	}
};


//work with bookmark
var BookmarkFunction = function(){
	if(!toggleBookmark){

		//$(".editbookmarkname,.editcolor,#newcolor,#addbookmark").prop("disabled",true);
		
		function EventBookmarkParam(resultNodeName){
			return {action:"click",func:"WorkWithResultNode",param:JSON.stringify({nodeName:resultNodeName})};
		};
		var AddBookmarkNode = function(resultNodeName){
			forceGraph.To.Object().To.Node().To.SubElement()
				.Change(resultNodeName,"svgcircle",{attr:{stroke:"red","stroke-width":3}})
				.Change(resultNodeName,"svghiddencircle",{
					attr:{stroke:"red","stroke-width":3},
					event:EventBookmarkParam(resultNodeName),
					//event1:{action:"mouseover",func:"GrowCircle",param:JSON.stringify({nodeName:resultNodeName})},
					//event2:{action:"mouseout",func:"ShrinkCircle",param:JSON.stringify({nodeName:resultNodeName})}
				
					
				});/*.Change(resultNodeName,"svgtext",{
					event:EventBookmarkParam(resultNodeName)//,
					//event1:{action:"mouseover",func:"GrowShrinkCircle",param:JSON.stringify({nodeName:resultNodeName,radius:15})},
					//event2:{action:"mouseout",func:"GrowShrinkCircle",param:JSON.stringify({nodeName:resultNodeName,radius:10})}
				});*/
		};
		
		ChangeResultNodes(AddBookmarkNode);
		
		forceGraph.To.Object().To.Graph().ReDraw();	
		toggleBookmark = true;
	}else {
		//$(".editbookmarkname,.editcolor,#newcolor,#addbookmark").prop("disabled",false);
		
		function EventEmptyParam(){
			return {action:"",func:"",param:""};
		}
		var DeleteBookmarkNode = function(resultNodeName){
			forceGraph.To.Object().To.Node().To.SubElement()
				.Change(resultNodeName,"svgcircle",{attr:{stroke:"","stroke-width":""}})
				.Change(resultNodeName,"svghiddencircle",{attr:{stroke:"","stroke-width":""},event:EventEmptyParam()})
				;//.Change(resultNodeName,"svgtext",{event:EventEmptyParam()});
		};
		
		ChangeResultNodes(DeleteBookmarkNode);

		forceGraph.To.Object().To.Graph().ReDraw();	
		toggleBookmark = false;
	}

};



var AddSearchFunction = function(){
	if(!toggleAddSearch){
		function EventSearchParam(resultNodeName){
			return {action:"click",func:"AddNewTextForSearch",param:JSON.stringify({nodeName:resultNodeName})};
		};
		var AddSearch = function(resultNodeName){
			forceGraph.To.Object().To.Node().To.SubElement()
				.Change(resultNodeName,"svgcircle",{attr:{stroke:"blue","stroke-width":3}})
				.Change(resultNodeName,"svghiddencircle",{
					attr:{stroke:"blue","stroke-width":3},event:EventSearchParam(resultNodeName)
				})
				;//.Change(resultNodeName,"svgtext",{event:EventSearchParam(resultNodeName)});
		
		};

		ChangeResultNodes(AddSearch);

		forceGraph.To.Object().To.Graph().ReDraw();
		toggleAddSearch = true;
	}else{
		function EventEmptyParam(){
			return {action:"",func:"",param:""};
		}
		var DeleteSearch = function(resultNodeName){
			forceGraph.To.Object().To.Node().To.SubElement()
				.Change(resultNodeName,"svgcircle",{attr:{stroke:"","stroke-width":""}})
				.Change(resultNodeName,"svghiddencircle",{attr:{stroke:"","stroke-width":""},event:EventEmptyParam()})
				;//.Change(resultNodeName,"svgtext",{event:EventEmptyParam()});
		
		};
		ChangeResultNodes(DeleteSearch);

		forceGraph.To.Object().To.Graph().ReDraw();
		toggleAddSearch = false;

	}
	
};




var toggleBookmark = false;
var toggleAddSearch = false;
var toggleDetails = false;
var sliderMin = 0;
var sliderMax = 0;

//main function // important
var BuildControls = function(){


	//console.log("build slider");
	//console.log({"wl":getDataFromIndexedDB.queryObjHistory});
	
	var historyData = getDataFromIndexedDB.queryObjHistory;
	var intalvalResults = GetSamePartOfArray(historyData.length,4);
	//var sliderWidth = 900;
	var sliderWidth = 720;
	

	
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
		//sliderMin = 400;
		//sliderMax = 410;
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

	

	var previewHandler = function(url) {
		console.log(url);
	
	};
	/*
	 * Creates a result list in the provided div-element with the provided handler
	 * defined above and sets the correct paths (pathToMedia & pathToLibs)
	 */
	 
	rList = EEXCESS.searchResultList($('#result_panel'),{
		previewHandler: previewHandler, 
		pathToMedia: '../../media/', 
		pathToLibs: '../../libs/'
		});
		
		
		
	// populate query field initially
	/*
	EEXCESS.callBG({method: {parent: 'model', func: 'getResults'}, data: null}, function(res) {
		$('#searchtext').val(res.query);
	});
		*/
	
	
	$("#go").click(function(evt){

		rList.loading(); // show loading bar, will be removed when new results arrive
		
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
				if(onlyResult){
					onlyResult = false;
					//console.log("finish search match");
					return;
				}
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
	
	//remove searchtext
	$("#removetext").click(function(){
		$("#searchtext").val("");
	});
	
	///////////////////////////////////////////////////////////////////////////
	$("#result_btn").click(function(){
		$("#result_panel").show();
		$("#work_panel").hide();
		
	});
	
	$("#work_btn").click(function(){
		$("#work_panel").show();
		$("#result_panel").hide();
	});
	
	///////////////////////////////////////////////////////////////////////////
	
	
	
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
	
	

	DetailsFunction();
	
	//explore graph
	$("#explore_graph").click(function(){
		$("#work_btn").trigger("click");
		
		$("#add_search, #bookmarks").removeClass("searchmodus");
		$("#explore_graph").addClass("searchmodus");
		
		$("#bookmark_panel").hide();
		$("#detail_panel").show();
		

		
		
		
		
		if(toggleAddSearch){
			AddSearchFunction();
		}
		if(toggleBookmark){
			BookmarkFunction();
		}
		
		if(!toggleDetails){
			DetailsFunction();
		}
		
	});
	

	$("#add_search").click(function(){
		$("#work_btn").trigger("click");
		
		$("#explore_graph, #bookmarks").removeClass("searchmodus");
		$("#add_search").addClass("searchmodus");
		
		$("#bookmark_panel").hide();
		$("#detail_panel").hide();
		if(toggleBookmark){
			BookmarkFunction();
		}
		if(toggleDetails){
			DetailsFunction();
		}
		

		
		if(!toggleAddSearch){
			AddSearchFunction();
		}		


	});
	
	$("#bookmarks").click(function(){
		$("#work_btn").trigger("click");
	
		$("#add_search, #explore_graph").removeClass("searchmodus");
		$("#bookmarks").addClass("searchmodus");
		$("#detail_panel").hide();
		$("#bookmark_panel").show();
		
		
		if(toggleAddSearch){
			AddSearchFunction();
		}
		if(toggleDetails){
			DetailsFunction();
		}

		
		if(!toggleBookmark){
			BookmarkFunction();
		}	

	});
	
	

	

};






