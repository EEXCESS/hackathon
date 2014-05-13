
/*

var db = indexedDB.open("eexcess_db");

var wordsWithResults = {};
var wordHistory = [];
var uniqueWordsResult =[];



//start automatically async method if the script start.
db.onsuccess = function() {


//var GetDataFromDB = function(evt) {

	console.log("-get data from db");
	var tx = db.result.transaction('queries'); // get read transaction
	var store = tx.objectStore('queries'); // get object store
	var idx = store.index('timestamp'); // get timestamp index 

	//number of elements -------------------------------------------------------------------------
	
	//var cursor2 = idx.openCursor(IDBKeyRange.lowerBound(0),"prev");
	////async method
	//cursor2.onsuccess = function(evt1) {
	//	var res = evt1.target.result.value;
	//	console.log(res);
	//}
	
	//number of elements -------------------------------------------------------------------------

	var cursor = idx.openCursor(IDBKeyRange.lowerBound(0)); // open cursor, starting at "0" (every timestamp is larger)

	// iterate over the entries
	storeDetailsForShorttime = {};
	
	//async method
	cursor.onerror = function() {
		console.log("no keywords!");
	};
	
	//async method
	cursor.onsuccess = function(evt) {
		
		var res = evt.target.result;
		if (res !== null) {
			//console.log("*>");
			// get history wordlist
			var valquery = res.value.query.map(function(d){return d.text;}).join(" ");//res.value.query[0];
			//valquery != undefined ? wordHistory.push(valquery.text):"";
			valquery != undefined ? wordHistory.push(valquery):"";

			res.continue(); // next entry
		}else{
			//console.log(">");
			//console.log(wordHistory);
			$("#keywordnumber").text(wordHistory.length);
			wordHistory = wordHistory.reverse().splice(0,
				10//Number.MAX_VALUE//GetValueNumber($("#last_keywords").val(),"All")
				);
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
//db.onsuccess = GetDataFromDB;
	
	
function AsyncGetResultData(keywords,func){
	var tx = db.result.transaction('recommendations'); // get read transaction
	var store = tx.objectStore('recommendations'); // get object store
	var idx = store.index('query'); // get timestamp index 

	var keyword = keywords.shift();
	var cursor = idx.openCursor(IDBKeyRange.only(keyword));
	
	var resultObject = {};
	var maxResultCount = 5;//GetValueNumber($("#results_per_keywords").val(),"All");
	
	cursor.onsuccess = function(evt) {
		
		var res = evt.target.result;
		if (res !== null) {
			//console.log("*>>");
			if(maxResultCount > Object.keys(resultObject).length){
				resultObject[res.value.result.uri] = res.value.result;
			}
			res.continue(); // next entry
		}else{
			
			wordsWithResults[keyword].results = resultObject;
			if(keywords.length == 0){
				//console.log(">>");
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
			//console.log("*>>>");
			if(res.value.type){
				//console.log("g");
				if(wordsWithResults.hasOwnProperty(res.value.context.query)){
					wordsWithResults[res.value.context.query].userActions[res.value.resource] = res.value;
				}
				// res.value // resource, context.query
			}

			res.continue(); // next entry
		}else{
			//console.log(">>>");
			func();
		}
		
	};
}
*/

//new Code -------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------

var GetDataFromIndexedDB = function(){
	var database = indexedDB.open("eexcess_db");
	
	
	//async method
	function AsyncGetSubData(database,transactionAndObjectstoreName,indexDbName,keyRange,func1,func2){
		var tx = database.result.transaction(transactionAndObjectstoreName); // get read transaction
		var store = tx.objectStore(transactionAndObjectstoreName); // get object store
		var idx = store.index(indexDbName); // get timestamp index 

		var cursor = idx.openCursor(keyRange); // open cursor, starting at "0" (every timestamp is larger)
		/*
		//async method
		cursor.onerror = function() {
			console.log("no keywords!");
		};
		*/
			
		//async method
		cursor.onsuccess = function(evt) {
			var res = evt.target.result;
			var storeObj;
			if (res !== null) {
				storeObj = func1(evt);
				res.continue(); // next entry
			}else{
				func2(evt,storeObj);
			}
		};
	}

	var GetData = function() {
		//Async dictionary
		var asyncSeries = {
			"GetHistory":function(){
				AsyncGetSubData(database,'queries','timestamp',IDBKeyRange.lowerBound(0),
					function(evt){
						oC.queryObjHistory.push(evt.target.result.value);
					},function(){
						//console.log(oC.queryObjHistory);
						
						//next async call
						asyncSeries["MakeWordlists"]();
					}
				);
			},
			"MakeWordlists":function(){
				oC.queryObjHistory.forEach(function(element){
					oC.wordHistory.push(element.query.map(function(d){return d.text;}).join(" "));	
				});
				//console.log(oC.wordHistory);
				oC.uniqueWords = d3.set(oC.wordHistory).values();

				oC.uniqueWords.forEach(function(d){
					oC.wordsWithResults[d] = {results:{},userActions:{}};//userActions ??
				});
				//console.log(oC.uniqueWords);
				
				//next async call
				asyncSeries["MakeResults"](-1);
			},
			"MakeResults":function(index){
				index++;
				var keyword = oC.uniqueWords[index];
				var resultObject ={};
				
				AsyncGetSubData(database,'recommendations','query',IDBKeyRange.only(keyword),
					function(evt){
						var res = evt.target.result;
						resultObject[res.value.result.uri] = res.value.result;

					},function(){
						oC.wordsWithResults[keyword].results = resultObject;
						if(oC.uniqueWords.length-1 == index){
							// async call posible;
							//console.log("--finish--");
							//LastTestAction();
							//BuildSlider();
							oC.asyncCall();
							//console.log("--finish--");
						
						}else{
							//recursion async call
							asyncSeries["MakeResults"](index);
						}
					}
				);
			}
		};
		
		//start async the first call.
		asyncSeries["GetHistory"]();
	};
	
	var oC = {
		asyncCall:function(){},
	
		queryObjHistory:[],
		wordHistory:[],
		uniqueWords:[],
		
		wordsWithResults :{},
		Init:function(asyncCall){
			oC.asyncCall = asyncCall;
			database.onsuccess = GetData;
		}
	};
	return oC;
};


//only test function
function LastTestAction(){
//only test output
	console.log({"wl":getDataFromIndexedDB.queryObjHistory});
	console.log({"wl":getDataFromIndexedDB.uniqueWords});

	console.log(getDataFromIndexedDB.wordsWithResults);
	console.log({"wl":getDataFromIndexedDB.wordHistory});
	
	console.log("---------");
}

var getDataFromIndexedDB = null;
getDataFromIndexedDB = new GetDataFromIndexedDB();
var call = function(){
	//LastTestAction();
	BuildControls();
};

getDataFromIndexedDB.Init(call);


//------------------------------------------------------------------------------------------------------------------------




