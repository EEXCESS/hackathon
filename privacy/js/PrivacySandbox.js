var traceValuesMapping=[];
var tracesSliderCurrentValue = 0;




function initSandbox(){
	
	var maxScore = 100;
	var recommendation = localStorage["recommend"];
	$('#results').html(recommendation);
	
	var recommendation_query = localStorage["recommendation_query"];
	if ( recommendation_query != undefined){
	
		var svgQ = "";
		
		fullQuery = JSON.parse(recommendation_query);
		var svgQuery = "";
		var y = 0;
		var y2 = 10;
		for ( var i = 0 ; i< fullQuery.content.length; i++){
				
				var score = fullQuery.content[i].score ;
				var term  = fullQuery.content[i].term;
				var barWidth = 250 * score / maxScore;
				
				svgQuery += '<text x="-10" y="'+y2+'" text-anchor="end" style="fill:black; font-size:14;font-weight:bold;">'+term+'</text>'; //y+10
				svgQuery += '<rect x="+10" y="'+y+'" width="'+barWidth+'" height="10" style="fill: red" />';
				svgQuery += '<text x="'+(barWidth+20)+'" y="'+y2+'" style="fill:black; font-size:10">'+score+'</text>'; // y +10
				y = y +15;
				y2 = y +10;
				
				
			}
		if ( fullQuery.ponderatedTopics != undefined){
			for ( var i = 0 ; i< fullQuery.ponderatedTopics.length; i++){
				
				var score = fullQuery.ponderatedTopics[i].value ;
				var term  = fullQuery.ponderatedTopics[i].term;
				var barWidth = 250 * score / maxScore;
				
				
				svgQuery += '<text x="-10" y="'+y2+'" text-anchor="end" style="fill:black; font-size:14;font-weight:bold;">'+term+'</text>'; //y+10
				svgQuery += '<rect x="+10" y="'+y+'" width="'+barWidth+'" height="10" style="fill: blue" />';
				svgQuery += '<text x="'+(barWidth+20)+'" y="'+y2+'" style="fill:black; font-size:10">'+score+'</text>'; // y +10
				y = y +15;
				y2 = y +10;
				
			}
	}
		svgQuery += '</g></svg>';
		
		svgQ= '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" height="'+y2+'"><g transform=translate(100)>';
		svgQ+= svgQuery;
		
		$('#recommendation_query').html(svgQ);
	}
};

function findNearest(values, includeLeft, includeRight, value) {
    var nearest = null;
    var diff = null;
    for (var i = 0; i < values.length; i++) {
        if ((includeLeft && values[i] <= value) || (includeRight && values[i] >= value)) {
            var newDiff = Math.abs(value - values[i]);
            if (diff == null || newDiff < diff) {
                nearest = values[i];
                diff = newDiff;
            }
        }
    }
    return nearest;
}

$.fn.addSliderSegmentsUser = function (amount, values) {	
	var range = values[values.length-1]-values[0];
	var gapSum = 0;
	var tracesJson = JSON.parse(localStorage["traces"]);
	var traces = tracesJson["hits"].hits;
	//var arrowHeight = $(".tooltip-arrow").height();
	
	
	var sliderLength = $("#sliderUserTrace").width(); // length in px of the full slider
	var arrowHeight = 5;
	var sliderPosition = $("#sliderUserTrace").position(); // pb : the position seems to be relative to the container ...
	
	for(var i=amount-1;i>=0;i--){
		if ( traces[amount-1-i] != undefined ){
		var segmentMargin = i==0 ? 0 : (100*(values[i]-values[i-1])/range);
		
		var arrowPositionTop = sliderPosition.top-10//+(values[i]*sliderLength)/values[amount-1];
		var arrowPositionLeft = 8+sliderPosition.left+(values[i]*sliderLength)/values[amount-1];
		var boxPosition =  $("#sliderUserTrace").parent().position();
		
		
		arrowPositionTop += boxPosition.top;
		arrowPositionLeft += boxPosition.left;
		
		//arrowPositionTop+=128;
		//arrowPositionLeft+=578;
		console.log('slider position : '+sliderPosition.left+' '+sliderPosition.top);
		var tooltipPosition = 35 + (values[i]*sliderLength)/values[amount-1];
		arrowPosition = 0;
		//var tooltipPosition = 0 ;
		gapSum += segmentMargin;
		
		var displayedTrace = JSON.stringify(traces[amount-1-i]["_source"]["document"].title);
		displayedTrace += "\n";
		displayedTrace += JSON.stringify(traces[amount-1-i]["_source"]["temporal"].begin);
		var segment = "<div class='ui-slider-segment' id='segment-"+i+"' data-sum='"+gapSum+"' style='margin-left: "+segmentMargin+"%;'>"+
		                 "<div class='tooltip top slider-tip' style='display: none'>"+
		                   //"<div class='tooltip-arrow advice' style='margin-left: "+arrowPosition+"px'></div>"+
		                   "<div class='tooltip-arrow advice' style='position:fixed; top:"+arrowPositionTop+";left:"+arrowPositionLeft+";'></div>"+
		                   "<div class='tooltip-inner advice' style='margin-left: "+tooltipPosition+"px; margin-bottom:"+arrowHeight+"px;'>"+displayedTrace+"</div>"+
		                 "</div>"+
		               "</div>";
		//alert(JSON.stringify(traces[i]));
		$(this).prepend(segment);
		var obj = {
				value: values[i],
				trace: JSON.stringify(traces[amount-1-i]["_source"])
		};
		
		traceValuesMapping.push(obj);
	}
	}
};

function initSliderUser(){
	var trace = JSON.parse(localStorage["traces"]).hits.hits;
	
	var i = 0;
	
	for (i=0;i<10 && i< trace.length;i++){

		trace[i] = trace[i]._source;

	};
	i--;
	
	
	var begin = new Date(trace[i].temporal.begin);
	var beginMilli = begin.getTime();
	var end = new Date(trace[0].temporal.begin);
	var endMilli = end.getTime();
	var range = endMilli - beginMilli;
	
	var previousMilli = 0;
  
	
	/* 3 next loops are here to be sure the values will not be :
	 *     - too close
	 *     - out of range
	 *     -too close again
	 *     
	 *     We have to check it 2 times because the second loop put them really close together
	 */
    var values = [0];
	for(i=8;i>=0;i--){
		if (trace[i] != undefined){
			var current = new Date(trace[i].temporal.begin);
			var currentMilli = current.getTime();
			var diffMilli = currentMilli-beginMilli;
			var test = (((diffMilli-previousMilli)/range)*25);
			if (test < 1) {
				diffMilli = range/25 + previousMilli;
			}
			values.push(diffMilli);
			previousMilli = diffMilli;
		}
	};
		
	for(i=0;i<10;i++){
		if(values[i] > range && values[i] != undefined){
			values[i] = range - ( 9 - i );
		}
	}
	
	var valuesIncorrect = true;
	var j = 9;
	
	while(valuesIncorrect){
		var diff = values[j] - values[j-1];
		if((diff/range)*25 > 1){
			valuesIncorrect = false;
		}
		else{
			values[j-1] = values[j] - (range/25);
		}
		j = j-1;
		if(j<0){
			valuesIncorrect = false;
		}
	}
	
	var slider = $("#sliderUserTrace").slider({
		min: 0,
		max: range,
		values: [range],
		create: function(){
			$(this).children(".ui-slider-handle").html('<div class="tooltip top slider-tip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>');
			$(this).find(".slider-tip").hide();
		},
		slide: function(event, ui) {
		    var includeLeft = event.keyCode != $.ui.keyCode.RIGHT;
		    var includeRight = event.keyCode != $.ui.keyCode.LEFT;
		    var value = findNearest(values, includeLeft, includeRight, ui.value);
		    slider.slider('values', 0, value);
		    console.log(value);
		    //updateRecommendation(initSandbox);
		    //initSandbox();
		    //$(this).find('.ui-slider-handle').find(".tooltip-inner").html(ui.value);
		    tracesSliderCurrentValue = value;
		    return false;
		    
		},
		change: function(event, ui) { 
			console.log("change : ui value = "+ui.value);
			tracesSliderCurrentValue = ui.value;
			/*
			console.log("values : "+values);
			console.log("mapping : "+traceValuesMapping);
			console.log ("range : "+range);
			console.log("handle : "+ui.handle);
			console.log("value : "+ui.value);
			console.log("values : "+ui.values);
			*/
			var correspondingItem;
			for ( var i = 0; i <traceValuesMapping.length; i++){
				if ( traceValuesMapping[i].value == ui.value){
					correspondingItem = traceValuesMapping[i].trace;
				}
			}
			
			
			console.log("corresponding item : "+ correspondingItem );
			var item = JSON.parse(correspondingItem);
			var displayed = item.document.title;
			displayed+="\n";
			displayed+= item.temporal.begin;
			$(this).find('.tooltip-arrow').css("margin-bottom","-8px");
			$(this).find('.tooltip-arrow').css("margin-left","3px");
		    $(this).find('.ui-slider-handle').find(".tooltip-inner").html(displayed);
			/*$.ajax({
				   url: "http://localhost:12564/api/v0/recommend",
				   type: "POST",
				   contentType: "application/json;charset=UTF-8",
				   data: correspondingItem,
				   complete: function(response, status){
				   
						var xml = $(response.responseText);
						var hitCount = $(xml).attr("data-hits");
						localStorage["recommend"] = response.responseText;
					
						if (hitCount != 0) {
							chrome.browserAction.setBadgeText({text: hitCount});
						}
						//localStorage["recommendation_query"] = response.getResponseHeader('recommendation_query');
						
						
				   }
				});*/
			updateRecommendation(initSandbox, JSON.parse(correspondingItem));
				/*$.ajax({
					   url: "http://localhost:11564/api/v0/query/enrich",
					   type: "POST",
					   contentType: "application/json;charset=UTF-8",
					   data: correspondingItem,
					   complete: function(response, status){

							localStorage["recommendation_query"] = response.responseText;
							updateRecommendation(initSandbox, JSON.parse(correspondingItem));

					   }
					});*/
			
		}
		
	});
	
	$("#sliderUserTrace").addSliderSegmentsUser(values.length, values);
	
	
}
function tracesSelectionHoverIn(){
	/*if ($(this).find(".tooltip-inner").html() == "undefined"){
		$(this).find(".tooltip-inner").html("coucou");
	}*/
	$(this).find(".slider-tip").show();
	
}

function tracesSelectionHoverOut(){
	$(this).find(".slider-tip").hide();
	
}
$(document).ready(function(){
	$("#sliderUserTrace").find(".ui-slider-handle").live("mouseenter",tracesSelectionHoverIn).live("mouseleave",tracesSelectionHoverOut);
});