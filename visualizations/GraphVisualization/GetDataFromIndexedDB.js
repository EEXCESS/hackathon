
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
					if(element.query != undefined){//console.log(element);
						oC.wordHistory.push(element.query.map(function(d){
							//console.log("..." + d.text);
							return d.text;
						}).join(" "));	
					}else{
						oC.wordHistory.push("");
					}
				});
				//console.log(oC.wordHistory);
				oC.uniqueWords = d3.set(oC.wordHistory).values();

				oC.uniqueWords.forEach(function(d){
					oC.wordsWithResults[d] = {results:{},userActions:{},resultList:[]};//userActions ??
				});
				//console.log(oC.uniqueWords);
				
				//next async call
				asyncSeries["MakeResults"](-1);
			},
			"MakeResults":function(index){
				index++;
				var keyword = oC.uniqueWords[index];
				var resultObject ={};
				var resultList = [];
				AsyncGetSubData(database,'recommendations','query',IDBKeyRange.only(keyword),
					function(evt){
						var res = evt.target.result;
						resultObject[res.value.result.uri] = res.value.result;
						resultList.push(res.value.result.uri);
						
					},function(){
						oC.wordsWithResults[keyword].results = resultObject;
						oC.wordsWithResults[keyword].resultList = resultList;
						
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
		},
		GetNewData:function(asyncCall){
		
			oC.asyncCall = function(){};
			oC.queryObjHistory=[];
			oC.wordHistory=[];
			oC.uniqueWords=[];
			
			oC.wordsWithResults ={};
			
			//console.log(oC);
			
			oC.asyncCall = asyncCall;
			database.onsuccess();
			//LastTestAction();

			//BuildControls();
				//forceNaviGraph.InitGraph("#D3graph");
			
			
		}
	};
	return oC;
};



//------------------------------------------------------------------------------------------------------------------------




