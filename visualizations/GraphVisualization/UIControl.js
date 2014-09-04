
//help functions
function ChangeResultNodes(Func){
	drawNaviGraphObj.ResultNodeEvent = Func;
	var changeNodes = FilterTextList(forceNaviGraph.Graph.GetGraphData().data.dict.node,"ResultNodeID_UniqueNodeID_");
	changeNodes.forEach(Func);
}




// show the Details
var DetailsFunction = function(){
	if(!toggleDetails){

		function EventDetailsParam(resultNodeName){
			return {action:"click",func:"ShowDetails",param:JSON.stringify({nodeName:resultNodeName})};
		};
		var ShowDetailsNode = function(resultNodeName){
			forceNaviGraph.To.Object().To.Node().To.SubElement()
				.Change(resultNodeName,"svghiddencircle",{
					event:EventDetailsParam(resultNodeName)//,
					//attr:{"stroke":"black","stroke-width":3}
				})
				;//.Change(resultNodeName,"svgtext",{event:EventDetailsParam(resultNodeName)});
		};
		ChangeResultNodes(ShowDetailsNode);
		
		
		
		
		forceNaviGraph.To.Object().To.Graph().ReDraw();	
		toggleDetails = true;
	}else{
		function EventEmptyParam(){
			return {action:"",func:"",param:""};
		}
		var ShowNotDetailsNode = function(resultNodeName){
			forceNaviGraph.To.Object().To.Node().To.SubElement()
				.Change(resultNodeName,"svghiddencircle",{
					event:EventEmptyParam()//,
					//attr:{"stroke":"","stroke-width":""}
				})
				;//.Change(resultNodeName,"svgtext",{event:EventEmptyParam()});
		};
		
		ChangeResultNodes(ShowNotDetailsNode);

		forceNaviGraph.To.Object().To.Graph().ReDraw();	
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
			forceNaviGraph.To.Object().To.Node().To.SubElement()
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
		
		forceNaviGraph.To.Object().To.Graph().ReDraw();	
		
		
		
		toggleBookmark = true;
	}else {
		//$(".editbookmarkname,.editcolor,#newcolor,#addbookmark").prop("disabled",false);
		
		function EventEmptyParam(){
			return {action:"",func:"",param:""};
		}
		var DeleteBookmarkNode = function(resultNodeName){
			forceNaviGraph.To.Object().To.Node().To.SubElement()
				.Change(resultNodeName,"svgcircle",{attr:{stroke:"","stroke-width":""}})
				.Change(resultNodeName,"svghiddencircle",{attr:{stroke:"","stroke-width":""},event:EventEmptyParam()})
				;//.Change(resultNodeName,"svgtext",{event:EventEmptyParam()});
		};
		
		ChangeResultNodes(DeleteBookmarkNode);

		forceNaviGraph.To.Object().To.Graph().ReDraw();	
		toggleBookmark = false;
	}

};



var AddSearchFunction = function(){
	if(!toggleAddSearch){
		function EventSearchParam(resultNodeName){
			return {action:"click",func:"AddNewTextForSearch",param:JSON.stringify({nodeName:resultNodeName})};
		};
		var AddSearch = function(resultNodeName){
			forceNaviGraph.To.Object().To.Node().To.SubElement()
				.Change(resultNodeName,"svgcircle",{attr:{stroke:"blue","stroke-width":3}})
				.Change(resultNodeName,"svghiddencircle",{
					attr:{stroke:"blue","stroke-width":3},event:EventSearchParam(resultNodeName)
				})
				;//.Change(resultNodeName,"svgtext",{event:EventSearchParam(resultNodeName)});
		
		};

		ChangeResultNodes(AddSearch);

		forceNaviGraph.To.Object().To.Graph().ReDraw();
		toggleAddSearch = true;
	}else{
		function EventEmptyParam(){
			return {action:"",func:"",param:""};
		}
		var DeleteSearch = function(resultNodeName){
			forceNaviGraph.To.Object().To.Node().To.SubElement()
				.Change(resultNodeName,"svgcircle",{attr:{stroke:"","stroke-width":""}})
				.Change(resultNodeName,"svghiddencircle",{attr:{stroke:"","stroke-width":""},event:EventEmptyParam()})
				;//.Change(resultNodeName,"svgtext",{event:EventEmptyParam()});
		
		};
		ChangeResultNodes(DeleteSearch);

		forceNaviGraph.To.Object().To.Graph().ReDraw();
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


	//generate bookmark graph
	//drawBookmarkGraphObj.AddBookmarkGraph(bookmarkingAPI.getAllBookmarks());
	//forceBookmarkGraph.To.Object().To.Graph().ReDraw();	
	
	//console.log("build slider");
	//console.log({"wl":getDataFromIndexedDB.queryObjHistory});
	
	var historyData = getDataFromIndexedDB.queryObjHistory;
	var intalvalResults = GetSamePartOfArray(historyData.length,4);
	//var sliderWidth = 900;
	//var sliderWidth = 720;
	var sliderWidth = 1500;
	

	
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

				drawNaviGraphObj.ReDrawGraph(d3.round(s[0]),d3.round(s[1]),sliderMin,sliderMax);
				//drawNaviGraphObj.ReDrawGraphNew(d3.round(s[0]),d3.round(s[1]),sliderMin,sliderMax);
				
				sliderMin = d3.round(s[0]);
				sliderMax = d3.round(s[1]);

				drawNaviGraphObj.ChangeGraph(sliderMin,sliderMax);
				var graphForce = forceNaviGraph.To.Object().To.Graph().GetForceObj();
				graphForce.stop();
				
				forceNaviGraph.To.Object().To.Graph().ReDraw();	
				
				var test = forceNaviGraph.Graph.GetGraphData();
			}

		})
		.on("brushend",function() {
			var graphForce = forceNaviGraph.To.Object().To.Graph().GetForceObj();
			graphForce.start();
			  //svg.classed("selecting", !d3.event.target.empty());
		});
	
	slidercontrol.ChangeSilderControl();
	
	//draw a graph in first time

	drawNaviGraphObj.ReDrawGraph(sliderMin,sliderMax,sliderMin,sliderMax);
	//drawNaviGraphObj.ReDrawGraphNew(sliderMin,sliderMax,sliderMin,sliderMax);
	drawNaviGraphObj.ChangeGraph(sliderMin,sliderMax);
	
	forceNaviGraph.To.Object().To.Graph().ReDraw();	
	
	
	
	
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
	EEXCESS.messaging.callBG({method: {parent: 'model', func: 'getResults'}, data: null}, function(res) {
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

        EEXCESS.messaging.callBG({
			method: {parent: 'model', func: 'query'}, 
			data: {reason: {reason: 'manual', text: textinput}, terms: query}});
      	/*EEXCESS.messaging.callBG({
			method: {parent: 'model', func: 'query'}, 
			data:query //data: [{weight:1,text:dataParameter.text}]
		});*/
	});
	
	

	//search finished with results, asynchronous call
	EEXCESS.messaging.listener(
		function(request, sender, sendResponse) {
			console.log("--#: " + request.method);
			
			//'getTextualContext'){
			if (request.method === 'newSearchTriggered') {
				if(onlyResult){
					onlyResult = false;
					console.log("finish search match");
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
						
						drawNaviGraphObj.ReDrawGraph(sliderMin,historyData.length-1,sliderMin,sliderMax);	
						drawNaviGraphObj.ChangeGraph(sliderMin,historyData.length-1);
						sliderMax = historyData.length-1;

						forceNaviGraph.To.Object().To.Graph().ReDraw();	
		
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
			
			drawNaviGraphObj.ReDrawGraph(sliderMin,historyData.length-1,sliderMin,sliderMax);	
			drawNaviGraphObj.ChangeGraph(sliderMin,historyData.length-1);

			forceNaviGraph.To.Object().To.Graph().ReDraw();	
		
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
	
	$("#bookmarkgraphCheck").click(function(event){
		if($("#bookmarkgraphCheck:checked" ).val() == "bookmarkgraphCheck"){
			console.log($("#bookmarkgraphCheck:checked" ).val());
			//TODO...

			
			console.log("******************");
			console.log(bookmarkingAPI.getAllBookmarks());
			console.log("******************");
			
			drawBookmarkGraphObj.AddBookmarkGraph(bookmarkingAPI.getAllBookmarks());
			forceBookmarkGraph.To.Object().To.Graph().ReDraw();	

			
			$("#bookmarkgraphControl").show();
			$("#navigraphControl").hide();

		}else{
			
			//hack begin
			$("#Bookmarkgraph").empty();
			$("#Bookmarkgraph").append("<svg></svg>");
			//forceBookmarkGraph = null;
			forceBookmarkGraph = new FGraph();
			forceBookmarkGraph.InitGraph("#Bookmarkgraph");
			//hack end
			
			$("#bookmarkgraphControl").hide();
			$("#navigraphControl").show();
		}
	});

};
