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




//only test function
function LastTestAction(){
//only test output
	console.log({"wl":getDataFromIndexedDB.queryObjHistory});
	console.log({"wl":getDataFromIndexedDB.uniqueWords});

	console.log(getDataFromIndexedDB.wordsWithResults);
	console.log({"wl":getDataFromIndexedDB.wordHistory});
	
	console.log("---------");
}

//get data from indexedDB
var getDataFromIndexedDB = null;
getDataFromIndexedDB = new GetDataFromIndexedDB();
getDataFromIndexedDB.Init(function(){
	LastTestAction();
	forceGraph.InitGraph("#D3graph");
	BuildControls();
});

// make graph and control objects.
var forceGraph = new FGraph();
var drawGraphObj = new DrawGraph();
var slidercontrol = new SilderControl();


// build Controls
function BuildControls(){

	$(function(){
		//////////////////////////////
		//forceGraph.InitGraph("#D3graph");
		//////////////////////////////
		
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
		console.log(historyData);
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
		drawGraphObj.ChangeGraph(sliderMin,sliderMax);
		
		forceGraph.To.Object().To.Graph().ReDraw();	
		///////////////////////////////////////////////////////////////////////////
		
		
		
		$("#go").click(function(){
			$("#searchstatus").text("searching");
			
			var textinput = $("#serachtext").val();
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
		
		
	});
	
}




