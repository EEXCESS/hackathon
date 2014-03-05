
function GetValueNumber(stringVal,maxNumberInString){
	return stringVal == maxNumberInString ? Number.MAX_VALUE : parseInt(stringVal);
}

function TextCutter(text,sizeCompare,sizeCut){
	return text.length < sizeCompare ? text : text.substring(0,sizeCut)+"..."; 
}
	
// close Popupmeu	
d3.select('#closepopupmenu').on("click", function () {
    d3.select('#popup_menu').style("display", "none");
});

//keyword paramter
var dataParameter = {};

	
var storeDetailsForShorttime = {};	
//get results
d3.select('#gotoresults').on("click", function () {
	//start search with asynchronous call.
	chrome.runtime.sendMessage(
		chrome.i18n.getMessage('@@extension_id'),{
			method: {parent: 'model', func: 'query'}, data: [{weight:1,text:dataParameter.text}]
		}
	);
	d3.select('#popup_menu').style("display", "none");
});
//search finished with results, asynchronous call
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (request.method === 'newSearchTriggered') {
			console.log(request.data);

			Object.keys(request.data.results.results).forEach(function(arrayIndex){
				var text="";
				linecount++
				text = request.data.results.results[arrayIndex].title;
				storeDetailsForShorttime[request.data.results.results[arrayIndex].uri] = request.data.results.results[arrayIndex];

				g.build.addNodeWithLink(dataParameter.nodeId,"ResultId"+linecount,"listId"+linecount);
				var paramData ={
					text:text,
					nodeId:"ResultId"+linecount,
					currentKey:request.data.results.results[arrayIndex].uri
					};
				//var paramData ={
				//	currentKey:result,
				//	keyword:keyword
				//};
				g.build.setNodeProperties("ResultId"+linecount,{
					"nodeGraph":{xscale:2,yscale:2,fill:"orange"},
					"nodeD3":{text:TextCutter(text,10,9),title:text},
					"nodeEvents":{"contextmenu":{name:"MakePopupMenu","param":JSON.stringify(paramData)}}
				}); 
				g.build.setLinkProperties("listId"+linecount,{
					"linkD3":{width:2,distance:75},
					"linkGraph":{stroke:"yellow"}
				}); 
				
			});
			g.build.show.restart();
			
		}
	}
);


//get details
d3.select('#gotodetails').on("click", function () {

	ClearDetailData();

	
	var detailData = storeDetailsForShorttime[dataParameter.currentKey];
	//console.log(detailData);
	
	$("#title_data").val(detailData.title);
	$("#link_data").text(detailData.uri).attr("href",detailData.uri);//.val(TextCutter(detailData.uri,20,19));
	$("#image_data").attr("src",detailData.previewImage);
	$("#id_data").text(detailData.id);
	
	$("#language_data").text(detailData.facets.language);
	$("#partner_data").text(detailData.facets.partner);
	$("#provider_data").text(detailData.facets.provider);
	$("#type_data").text(detailData.facets.type);
	$("#year_data").text(detailData.facets.year);
	
	
	d3.select('#popup_menu').style("display", "none");
});




//clear data
d3.select('#cleardata').on("click", function () {
	ClearDetailData();
});

function ClearDetailData(){
	$("#title_data").val("");
	$("#link_data").text("").attr("href","");
	$("#image_data").attr("src","");
	$("#id_data, #language_data, #partner_data, #provider_data, #type_data, #year_data").text("");
};

var functions = {
	TestFunc:function(){
		console.log("ASDF");
	},
	NodeIn:function(paramData){
		d3.event.preventDefault();
		console.log("in");
		
		g.build.setNodeProperties(paramData,{
			"nodeGraph":{fill:"purple"}
		}); 
		g.build.show.restart();
	},
	NodeOut:function(paramData){
		d3.event.preventDefault();
		console.log("out");
	
		g.build.setNodeProperties(paramData,{
			"nodeGraph":{fill:"green"}
		}); 
		g.build.show.restart();
	},	
	MakePopupMenu:function(paramData){
		//console.log(paramData);
		if (d3.event.pageX || d3.event.pageY) {
			var x = d3.event.pageX;
			var y = d3.event.pageY;
		} else if (d3.event.clientX || d3.event.clientY) {
			var x = d3.event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
			var y = d3.event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
		}

		d3.select('#popup_menu')
			.style('position', 'absolute')
			.style('left', x + 'px')
			.style('top', y + 'px')
			.style('display', 'block');

		d3.event.preventDefault();
		dataParameter = JSON.parse(paramData);
	}
};
	


// rebuild graph
$("#redraw").click(function(){
	wordsWithResults = {};
	wordHistory = [];
	uniqueWordsResult =[];

	db.onsuccess();
	
});


//only demo
/*
d3.select('#addmetalink').on("click", function () {

	$("#metanodename").val($('#metanodeselect').val());
});
*/

d3.select('#workmetalink').on("click", function () {
	var work = $("#addordeletemetalink").val();
	var nodeName = $("#metanodeselect").val();
	if(work == "+"){
		g.build.addLink("metalinkid_"+dataParameter.nodeId+"_"+nodeName,
			dataParameter.nodeId,"metanodeid_"+nodeName);
		g.build.show.restart();
	}else if(work == "x"){
		g.build.deleteLink("metalinkid_"+dataParameter.nodeId+"_"+nodeName)
		g.build.show.restart();
	}
});

d3.select('#addmetanode').on("click", function () {

	//console.log(dataParameter);//.nodeid
	var nodeName = $("#metanodename").val();

	g.build.addNodeWithLink(dataParameter.nodeId,"metanodeid_"+nodeName,
		"metalinkid_"+dataParameter.nodeId+"_"+nodeName);
	g.build.setNodeProperties("metanodeid_"+nodeName,{
		"nodeGraph":{xscale:7,yscale:7,fill:"blue"},
		"nodeD3":{title:nodeName,text:TextCutter(nodeName,10,9)}
	}); 
	g.build.setLinkProperties("metalinkid_"+dataParameter.nodeId+"_"+nodeName,{
		"linkD3":{distance:100},
		"linkGraph":{stroke:"black"}});

	var differentElement = true;
	$("#metanodeselect > option").each(function(index,element){
		//console.log($(element).val());
		if(nodeName == $(element).val()){
			differentElement = false;
		}
	});
	if(differentElement){
		$("#metanodeselect").append("<option>"+nodeName+"</option>");
	}
	
	g.build.show.restart();
	
	$("#metanodename").val("");
	d3.select('#popup_menu').style("display", "none");
});



//Data for Belgin////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

//getdata from database
$("#getdata").click(function(){
	window.URL = window.URL || window.webkitURL;

	var logString = JSON.stringify(getData);//.join("\r\n");
	var downloadBlob = new Blob([logString], {type: 'text/plain'});

	$("#getdata").attr("href", window.URL.createObjectURL(downloadBlob));
	$("#getdata").attr("download", "logdata.txt");

});



//get current data
var getData = {};
chrome.runtime.sendMessage(
	chrome.i18n.getMessage('@@extension_id'), 
	{
		method: {
			parent: 'model', 
			func: 'getResults'
		},
		data: null
	}, 
	function(reqResult) {
		//alert("test X");
		//console.log("- - - - -");
		//console.log(reqResult);
		getData = reqResult;
	}
);


