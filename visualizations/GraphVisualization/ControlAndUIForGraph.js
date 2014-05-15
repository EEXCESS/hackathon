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


// build Controls
function BuildControls(){

	var sliderMin = 0;
	var sliderMax = 0;

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
		sliderMin = historyData.length-5;////////////////////////
		sliderMax = historyData.length-1;
		
		//slider with events
		slidercontrol.brush.extent([sliderMin,sliderMax])
			.on("brush",function() {
				var s = slidercontrol.brush.extent();
				if(sliderMin != d3.round(s[0]) || sliderMax != d3.round(s[1])){
					//circle.classed("selected", function(d) { return s[0] <= d && d <= s[1]; });
					//console.log(d3.round(s[0]) + " - " + d3.round(s[1]));
					  
					
					ReDrawGraph(d3.round(s[0]),d3.round(s[1]),sliderMin,sliderMax);
					
					sliderMin = d3.round(s[0]);
					sliderMax = d3.round(s[1]);

					
					ChangeGraph(sliderMin,sliderMax);
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

		//DrawGraph(sliderMin,sliderMax);
		ReDrawGraph(sliderMin,sliderMax,sliderMin,sliderMax);
		ChangeGraph(sliderMin,sliderMax);
		
		forceGraph.To.Object().To.Graph().ReDraw();	
	});
	
}
