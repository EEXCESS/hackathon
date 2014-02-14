
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

	storeDetailsForShorttime = {};
	
	//async method
	cursor.onsuccess = function(evt) {
		var res = evt.target.result;
		if (res !== null) {
			
			// get history wordlist
			var valquery = res.value.query[0];valquery != undefined ? wordHistory.push(valquery.text):"";

			res.continue(); // next entry
		}else{
			//console.log(wordHistory);
			$("#keywordnumber").text(wordHistory.length);
			wordHistory = wordHistory.reverse().splice(0,GetValueNumber($("#last_keywords").val(),"All"));
			wordHistory = wordHistory.reverse();
			//console.log(wordHistory);
			
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
	var maxResultCount = GetValueNumber($("#results_per_keywords").val(),"All");
	
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
