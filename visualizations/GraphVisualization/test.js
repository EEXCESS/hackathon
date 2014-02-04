
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
	var maxResultCount = 5;
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
				wordsWithResults[res.value.context.query].userActions[res.value.resource] = res.value;
				// res.value // resource, context.query
			}

			res.continue(); // next entry
		}else{
			func();
		}
		
	};
}




	
function MakeGraph(){

 var g = new ActionGraph();
 
 g.changeOption({	
		svg:{
			HTMLObject:{value:"body"},
			width:{value:1000},
			height:{value:500}
		},
		vis:{
			width:{value:5000},
			height:{value:5000},
			trans:{
				x:{value:0},
				y:{value:0}				
			},
			scale:{value:1}
		},
		force:{
			charge:{value:-3000},
			gravity:{value:0.05},
			linkDistance:{value:80}
		}});


 
	if(wordHistory.length == 0){
		return;
	}
	console.log(wordsWithResults);
	//console.log(uniqueWordsResult);

	
	//wordHistory.reverse();
	
	//console.log(wordHistory);
	
	
	wordHistory.forEach(function(nodename,index){
		if(g.build.show.nodeDict.hasOwnProperty("nid"+nodename) == false){
			g.build.addNode("nid"+nodename);
			g.build.setNodeProperties("nid"+nodename,{
				xscale:5,yscale:5,text:index +": "+ nodename,fill:"red","font-size":"20px"
			}); 
		}
	});
	

	
	
	var sourceNode;
	var targetNode;
	var color = d3.scale.linear()
		.domain([0, uniqueWordsResult.length/2,uniqueWordsResult.length])
		.range(["lime","blue","orange"]);
	var width = d3.scale.linear()
		.domain([0, uniqueWordsResult.length])
		.range([2,10]);
		
	var trueCount = 0;	
	for(nodeCount=1;nodeCount<wordHistory.length;nodeCount++){
		sourceNode = wordHistory[nodeCount-1];
		targetNode = wordHistory[nodeCount];
		if(sourceNode != targetNode){
			trueCount++
			g.build.addLink("nid"+nodeCount,"nid"+sourceNode,"nid"+targetNode);
			g.build.setLinkProperties("nid"+nodeCount,{
				distance:300,width:width(trueCount),color:color(trueCount)
			});   
		}
	}
	
	var text="";
	var lc = 0;
	Object.keys(wordsWithResults).forEach(function(keyword){
		console.log("#-----");
		Object.keys(wordsWithResults[keyword].results).forEach(function(result){	
			text = wordsWithResults[keyword].results[result].title;
			text = text.length < 10 ? text : text.substring(0,9); 
			

			
			g.build.addNodeWithLink("nid"+keyword,"lid"+lc,"lid"+lc);
			g.build.setNodeProperties("lid"+lc,{
				xscale:2,yscale:2,fill:"fuchsia",text:text,title:wordsWithResults[keyword].results[result].title
			}); 
			
			///
			
			console.log(result);
			if(wordsWithResults[keyword].userActions.hasOwnProperty(result)){
				g.build.setNodeProperties("lid"+lc,{
					stroke:"black","stroke-width":"3"
			}); 
			//stroke="black" stroke-width="3"
			}
			///
			g.build.setLinkProperties("lid"+lc,{
				width:2,
				//distance:250,
				color:"purple"//,text:text
			});   
			
			lc++;
		});
		console.log("------");
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
		console.log(reqResult);
		getData = reqResult;
	});


