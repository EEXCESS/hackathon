
var db = indexedDB.open("eexcess_db");

var wordsWithResults = {};
var wordHistory = [];
var uniqueWordsResult =[];


//start automatically if the script start.
db.onsuccess = function() {
	var tx = db.result.transaction('queries'); // get read transaction
	var store = tx.objectStore('queries'); // get object store
	var idx = store.index('timestamp'); // get timestamp index 

	//IDBKeyRange.only(name)
	var cursor = idx.openCursor(IDBKeyRange.lowerBound(0)); // open cursor, starting at "0" (every timestamp is larger)
	// iterate over the entries

	//async method
	cursor.onsuccess = function(evt) {
		var res = evt.target.result;
		if (res !== null) {
			
			// get history wordlist
			var valquery = res.value.query[0];valquery != undefined ? wordHistory.push(valquery.text):"";

			res.continue(); // next entry
		}else{
			console.log(wordHistory);//Number.MAX_VALUE
			wordHistory = wordHistory.reverse().splice(0,parseInt($("#last_keywords").val()));
			console.log(wordHistory);
			
			//wordHistory = wordHistory.reverse();
			//get unique wordlist
			var uniqueWords = d3.set(wordHistory).values();
			
			//add results for unique wordlist
			uniqueWords.forEach(function(d){
				wordsWithResults[d] = {results:{},userActions:{}}
			});
			uniqueWordsResult = uniqueWords.slice();
			AsyncGetResultData(uniqueWords,function(){
				AsyncGetUserAction(function(){
					MakeGraph();
				});
			});
		}
	};
};
	
function AsyncGetResultData(keywords,func){
	var tx = db.result.transaction('recommendations'); // get read transaction
	var store = tx.objectStore('recommendations'); // get object store
	var idx = store.index('query'); // get timestamp index 

	var keyword = keywords.shift();
	var cursor = idx.openCursor(IDBKeyRange.only(keyword));
	
	var resultObject = {};
	var maxResultCount = parseInt($("#results_per_keywords").val());
	//console.log($("#results_per_keywords").val());
	
	cursor.onsuccess = function(evt) {
		var res = evt.target.result;
		if (res !== null) {
			if(maxResultCount > Object.keys(resultObject).length){
				resultObject[res.value.result.uri] = res.value.result;
			}
			res.continue(); // next entry
		}else{
			wordsWithResults[keyword].results = resultObject;
			if(keywords.length == 0){
				func();
			}else{
				AsyncGetResultData(keywords,func);
			}
		}
	};
}
	
	
function AsyncGetUserAction(func){
	var tx = db.result.transaction('resource_relations'); // get read transaction
	var store = tx.objectStore('resource_relations'); // get object store
	var idx = store.index('timestamp'); // get timestamp index 
	
	var cursor = idx.openCursor(IDBKeyRange.lowerBound(0));
	
	
	// iterate over the entries
	cursor.onsuccess = function(evt) {
		var res = evt.target.result;
		if (res !== null) {
			
			if(res.value.type){
				//console.log("g");
				if(wordsWithResults.hasOwnProperty(res.value.context.query)){
					wordsWithResults[res.value.context.query].userActions[res.value.resource] = res.value;
				}
				// res.value // resource, context.query
			}

			res.continue(); // next entry
		}else{
			func();
		}
		
	};
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//database
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function TextCutter(text,sizeCompare,sizeCut){
	return text.length < sizeCompare ? text : text.substring(0,sizeCut)+"..."; 
}
	
// close Popupmeu	
d3.select('#closepopupmenu').on("click", function () {
    d3.select('#popup_menu').style("display", "none");
});

//keyword paramter
var dataParameter = {};
var linecount = 0;
	
//get results
d3.select('#gotoresults').on("click", function () {
	chrome.runtime.sendMessage(
		chrome.i18n.getMessage('@@extension_id'),{
			method: {parent: 'model', func: 'query'}, data: [{weight:1,text:dataParameter.text}]
		}
	);
	d3.select('#popup_menu').style("display", "none");
});

//get details
d3.select('#gotodetails').on("click", function () {

	ClearDetailData();
	
	var detailData = wordsWithResults[dataParameter.keyword].results[dataParameter.currentKey];
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
	

function MakeGraph(){

	var g = new ActionGraph();	
	 
	g.build.show.ZoomAction = function(){
		d3.select('#popup_menu').style("display", "none");
	}
	 
	g.build.show.functionValues = functions;
 
	g.changeOption({	
		svg:{
			width:{value:1000},
			height:{value:500}
		},
		vis:{
			width:{value:5000},
			height:{value:5000}
		},
		force:{//3000
			charge:{value:-250}
		}});


 
	if(wordHistory.length == 0){
		return;
	}
	console.log(wordsWithResults);
	//console.log(uniqueWordsResult);

	
	
	//console.log(wordHistory);
	//wordHistory.reverse();
	//console.log(wordHistory);
	
	// nodes
	wordHistory.forEach(function(nodename,index){
		if(g.build.show.nodeDict.hasOwnProperty("nodeId"+nodename) == false){
			var text = nodename;

			g.build.addNode("nodeId"+nodename);
			g.build.setNodeProperties("nodeId"+nodename,{
				xscale:5,yscale:5,text:index +": "+ TextCutter(text,10,9),title:text,fill:"green"
			}); 
		}
	});
	
	
	var color = d3.scale.linear()
		.domain([0,wordHistory.length])
		.range(["red","blue"]);
	
	//First Node for link
	g.build.addNodeWithLink("nodeId"+wordHistory[0],"subNodeId"+0,"subLinkId"+0);
	g.build.setLinkProperties("subLinkId"+0,{distance:10});
	g.build.setNodeProperties("subNodeId"+0,{
		xscale:3,yscale:3,fill:"red",text:"start",title:"start",
		stroke:"black","stroke-width":2});
	//debug
	//g.build.setNodeProperties("subNodeId"+0,{text:"subNodeId"+0,title:"subNodeId"+0});
	
	for(nodeCount=1;nodeCount<wordHistory.length;nodeCount++){
		sourceNode = wordHistory[nodeCount-1];
		targetNode = wordHistory[nodeCount];
		

		g.build.addNodeWithLink("nodeId"+targetNode,"subNodeId"+nodeCount,"subLinkId"+nodeCount);
		g.build.setLinkProperties("subLinkId"+nodeCount,{distance:10});
		//debug
		//g.build.setNodeProperties("subNodeId"+nodeCount,{text:"subNodeId"+nodeCount,title:"subNodeId"+nodeCount});
		g.build.setNodeProperties("subNodeId"+nodeCount,{fill:color(nodeCount)});
		g.build.addLink("connectionLink"+nodeCount,"subNodeId"+(nodeCount-1),"subNodeId"+nodeCount);
		
		g.build.setLinkProperties("connectionLink"+nodeCount,{color:color(nodeCount),text:nodeCount,title:nodeCount,width:2,distance:300});
		if(sourceNode == targetNode){
			g.build.setLinkProperties("connectionLink"+nodeCount,{strength:0});  
			//g.build.setLinkProperties("connectionLink"+nodeCount,{
			//	strength:0,color:color(nodeCount),text:nodeCount,title:nodeCount,width:3
			//});  
		}
	}
	//LastNode
	g.build.setNodeProperties("subNodeId"+(wordHistory.length-1),{xscale:3,yscale:3,fill:"blue",text:"finish",title:"finish",
		stroke:"black","stroke-width":2});
	
	
	// get results for each keyword
	var text="";

	//search finished with results
	chrome.runtime.onMessage.addListener(
		function(request, sender, sendResponse) {
			if (request.method === 'newSearchTriggered') {
				//console.log("-------");
				console.log(request.data);

				Object.keys(request.data.results.results).forEach(function(arrayIndex){
					linecount++
					text = request.data.results.results[arrayIndex].title;
					

					g.build.addNodeWithLink(dataParameter.nodeId,"listId"+linecount,"listId"+linecount);
					var paramData ={text:text,nodeId:"listId"+linecount};
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
	Object.keys(wordsWithResults).forEach(function(keyword){
		Object.keys(wordsWithResults[keyword].results).forEach(function(result){	
			text = wordsWithResults[keyword].results[result].title;
			/*
			console.log("-------------");
			console.log(result);
			console.log(keyword);
			*/

			g.build.addNodeWithLink("nodeId"+keyword,"listId"+linecount,"listId"+linecount);
			var paramData ={
				text:text,
				nodeId:"listId"+linecount,
				currentKey:result,
				keyword:keyword
				};
			g.build.setNodeProperties("listId"+linecount,{
				xscale:2,yscale:2,fill:"orange",text:TextCutter(text,10,9),title:text,
				"contextmenuEvent":"MakePopupMenu","contextmenuParam":JSON.stringify(paramData)
			}); 

			// get node Properties with user mouse interactions
			if(wordsWithResults[keyword].userActions.hasOwnProperty(result)){
				g.build.setNodeProperties("listId"+linecount,{
					stroke:"black","stroke-width":"3"
				}); 
			}

			g.build.setLinkProperties("listId"+linecount,{
				width:2,
				distance:75,
				color:"yellow"
			});   
			
			linecount++;
		});
	});



	
	//getdata from database
	$("#getdata").click(function(){
		window.URL = window.URL || window.webkitURL;

		var logString = JSON.stringify(getData);//.join("\r\n");
		var downloadBlob = new Blob([logString], {type: 'text/plain'});

		$("#getdata").attr("href", window.URL.createObjectURL(downloadBlob));
		$("#getdata").attr("download", "logdata.txt");

	});

	
	g.build.show.restart();
}

// rebuild graph
$("#redraw").click(function(){
	wordsWithResults = {};
	wordHistory = [];
	uniqueWordsResult =[];
	//g = null;

	//dataParameter = {};
	//linecount = 0;

	db.onsuccess();
	
	//linecount++;
	//g.build.addNodeWithLink("nodeIdund","XXX"+linecount,"XXX"+linecount);
	//g.build.show.restart();
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


