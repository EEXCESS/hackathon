

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
	
		Object.keys(wordsWithResults[keyword].results).forEach(function(result){	
			text = wordsWithResults[keyword].results[result].title;
			text = text.length < 10 ? text : text.substring(0,9); 
			
			g.build.addNodeWithLink("nid"+keyword,"lid"+lc,"lid"+lc);
			g.build.setNodeProperties("lid"+lc,{
				xscale:2,yscale:2,fill:"fuchsia",text:text,"title":wordsWithResults[keyword].results[result].title
			}); 

			g.build.setLinkProperties("lid"+lc,{
				width:2,
				//distance:250,
				color:"purple"//,text:text
			});   
			
			lc++;
		});

	});
	


	
	
	/*
	var nodename = wordHistory[0];
	g.build.addNode(nodename);
	g.build.setNodeProperties(nodename,{"xscale":2,"yscale":2,"text":nodename}); 
	
	
	
	//alert(g.build.getNodeIndex(nodename));
	//alert(g.build.show.nodeDict.hasOwnProperty(nodename));
	
	//wordHistory.length
	for(var nodeCount=1;nodeCount<10;nodeCount++){
		if(g.build.show.nodeDict.hasOwnProperty(wordHistory[nodeCount-1])){
			g.build.addNodeWithLink(wordHistory[nodeCount-1],wordHistory[nodeCount],nodeCount);
			g.build.setNodeProperties(wordHistory[nodeCount],{"xscale":2,"yscale":2,"text":wordHistory[nodeCount]}); 
			g.build.setLinkProperties(nodeCount,{
				distance:200,"text":nodeCount,"width":2,color:"lightgrey",width:nodeCount
			});   
		
		}
	}
	*/
	
	
	/*
	g.build.addNode("n2");
	g.build.setNodeProperties("n2",{"text":"n2"}); 
	g.build.addNode("n3");
	g.build.setNodeProperties("n3",{"text":"n3","fill":"#ff00ff"}); 
	g.build.addNode("n4");
	g.build.setNodeProperties("n4",{"text":"n4","fill":"#0000ff","xscale":3,"yscale":1}); 


	g.build.addLink("l1","n1","n2");     
	g.build.setLinkProperties("l1",{"text":"l1","color":"#00ffff","width":2});   
	g.build.addLink("l2","n1","n3");     
	g.build.setLinkProperties("l2",{"text":"l2","width":3}); 
	g.build.addLink("l3","n1","n4");     
	g.build.setLinkProperties("l3",{"text":"l3"}); 

	g.build.addLink("l4","n2","n3");     
	g.build.setLinkProperties("l4",{"text":"l4","color":"#00ff00"});   
	g.build.addLink("l5","n2","n4");     
	g.build.setLinkProperties("l5",{"text":"l5","color":"#00ff00","width":3}); 
*/

	g.build.show.restart();

}

/*
function MakeGraph(){

var g = new ActionGraph();

g.build.addNode("n1");
g.build.setNodeProperties("n1",{"xscale":2,"yscale":2,"text":"n1"}); 
g.build.addNode("n2");
g.build.setNodeProperties("n2",{"text":"n2"}); 
g.build.addNode("n3");
g.build.setNodeProperties("n3",{"text":"n3","fill":"#ff00ff"}); 
g.build.addNode("n4");
g.build.setNodeProperties("n4",{"text":"n4","fill":"#0000ff","xscale":3,"yscale":1}); 


g.build.addLink("l1","n1","n2");     
g.build.setLinkProperties("l1",{"text":"l1","color":"#00ffff","width":2});   
g.build.addLink("l2","n1","n3");     
g.build.setLinkProperties("l2",{"text":"l2","width":3}); 
g.build.addLink("l3","n1","n4");     
g.build.setLinkProperties("l3",{"text":"l3"}); 

g.build.addLink("l4","n2","n3");     
g.build.setLinkProperties("l4",{"text":"l4","color":"#00ff00"});   
g.build.addLink("l5","n2","n4");     
g.build.setLinkProperties("l5",{"text":"l5","color":"#00ff00","width":3}); 


g.build.show.restart();

}
*/
	
					
				

