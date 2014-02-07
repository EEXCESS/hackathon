
/*
$(function(){
	$('g.graphnode').contextMenu('cntxtMenu',{
		bindings:
		{
			'open': function(t) {
				alert(t.__data__.name);
			},
			'delete': function(t) {
				$('g.node').remove();
				//alert('Trigger was '+t.__data__.name+'\nAction was Delete');
			}
		}
	});
});

*/

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
			width:{value:1000},
			height:{value:500}
		},
		vis:{
			width:{value:5000},
			height:{value:5000}/*,
			trans:{
				x:{value:0},
				y:{value:0}				
			},
			scale:{value:1}
			*/
		},
		force:{//3000
			charge:{value:-500},
			//gravity:{value:0.05},
			//linkDistance:{value:50}
		}});


 
	if(wordHistory.length == 0){
		return;
	}
	console.log(wordsWithResults);
	//console.log(uniqueWordsResult);

	
	//wordHistory.reverse();
	
	//console.log(wordHistory);
	
	
	// nodes
	wordHistory.forEach(function(nodename,index){
		if(g.build.show.nodeDict.hasOwnProperty("nodeId"+nodename) == false){
			g.build.addNode("nodeId"+nodename);
			g.build.setNodeProperties("nodeId"+nodename,{
				xscale:5,yscale:5,text:index +": "+ nodename,fill:"green","font-size":"20px"
			}); 
		}
		else{
		/*
			var currentNodeProperty = g.build.getNodeProperties("nodeId"+nodename);
			var newXscale = currentNodeProperty.xscale+1;
			var newYscale = currentNodeProperty.yscale+1;
			
			g.build.setNodeProperties("nodeId"+nodename,{
				xscale:newXscale,yscale:newYscale
			}); 
			*/
		}
	});
	

	/*
	// build links between nodes(keywords)
	var sourceNode;
	var targetNode;
	var color = d3.scale.linear()
		.domain([uniqueWordsResult.length,0])
		.range(["lime","blue"]);
	var width = d3.scale.linear()
		.domain([uniqueWordsResult.length,0])
		.range([2,10]);
		
	var trueCount = 0;	
	for(nodeCount=1;nodeCount<wordHistory.length;nodeCount++){
		sourceNode = wordHistory[nodeCount-1];
		targetNode = wordHistory[nodeCount];
		
		if(sourceNode != targetNode){
			trueCount++
			g.build.addLink("nodeId"+nodeCount,"nodeId"+sourceNode,"nodeId"+targetNode);
			g.build.setLinkProperties("nodeId"+nodeCount,{
				distance:100,width:width(trueCount),color:color(trueCount),text:nodeCount,title:nodeCount
			});   
		}
	}
	*/
	
	
	var color = d3.scale.linear()
		.domain([wordHistory.length,0])
		.range(["red","blue"]);
	
	//First Node for link
	g.build.addNodeWithLink("nodeId"+wordHistory[0],"subNodeId"+0,"subLinkId"+0);
	g.build.setLinkProperties("subLinkId"+0,{distance:10});
	g.build.setNodeProperties("subNodeId"+0,{xscale:2,yscale:2,fill:"blue"});
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
		
		//if(sourceNode != targetNode){
			g.build.setLinkProperties("connectionLink"+nodeCount,{
				strength:0,color:color(nodeCount),text:nodeCount,title:nodeCount,width:3
			});  
		//}
	}
	g.build.setNodeProperties("subNodeId"+(wordHistory.length-1),{xscale:2,yscale:2,fill:"red"});
	
	
	// get results for each keyword
	var text="";
	var lc = 0;
	Object.keys(wordsWithResults).forEach(function(keyword){
		
		Object.keys(wordsWithResults[keyword].results).forEach(function(result){	
			text = wordsWithResults[keyword].results[result].title;
			text = text.length < 10 ? text : text.substring(0,9); 

			g.build.addNodeWithLink("nodeId"+keyword,"listId"+lc,"listId"+lc);
			g.build.setNodeProperties("listId"+lc,{
				xscale:1,yscale:1,fill:"fuchsia",text:text,title:wordsWithResults[keyword].results[result].title
			}); 
			
			// get node Properties with user mouse interactions
			if(wordsWithResults[keyword].userActions.hasOwnProperty(result)){
				g.build.setNodeProperties("listId"+lc,{
					stroke:"black","stroke-width":"3"
				}); 
			}

			g.build.setLinkProperties("listId"+lc,{
				width:2,
				distance:75,
				color:"purple"//,text:text
			});   
			
			lc++;
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
	}
);


