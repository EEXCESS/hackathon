
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

				g.build.addNodeWithLink(dataParameter.nodeId,"listId"+linecount,"listId"+linecount);
				var paramData ={
					text:text,
					nodeId:"listId"+linecount,
					currentKey:request.data.results.results[arrayIndex].uri
					};
				//var paramData ={
				//	currentKey:result,
				//	keyword:keyword
				//};
				g.build.setNodeProperties("listId"+linecount,{
					xscale:2,yscale:2,fill:"orange",text:TextCutter(text,10,9),title:text,
					"contextmenuEvent":"MakePopupMenu","contextmenuParam":JSON.stringify(paramData)
				}); 
				g.build.setLinkProperties("listId"+linecount,{
					width:2,
					distance:75,
					color:"yellow"
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


