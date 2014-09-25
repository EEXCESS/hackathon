//help functions

function StringToWordcict(str){
    var strDict ={};
    str.split(" ").forEach(function(element){
        if(strDict.hasOwnProperty(element)){
            strDict[element] += 1;
        }else{
            strDict[element] = 1;
        }
    });
    //console.log(strDict);
    return strDict;
}


function GetEqualValue(wordDict1,wordDict2,oneDifferent){
    var equalCounter = 0;
    Object.keys(wordDict1).forEach(function(element){
        if(wordDict2.hasOwnProperty(element)){
            if(oneDifferent){
                equalCounter += 1;
            }else{
                equalCounter += wordDict1[element] + wordDict2[element];
            }
        }    
    });
	//console.log("<<< "+ equalCounter +" >>>");
    return equalCounter;
}

//console.log(GetEqualValue(StringToWordcict(str1),StringToWordcict(str2),true));



function SpecialChars(){

	var oC = {};

	oC.charDict = {
		'{':  '«',
		'}':  '»',
		'[':  '◄',
		']':  '►',
		'(':  '←',
		')':  '→',
		' ':  '°',
		'?':  '¿',
		':':  '⌂',
		',':  '♦',
		';':  '↕',
		'.':  '▓',
		'&':  '®',
		'!':  'î',
		"'":  '▒',
		'-':  '↔',
		'/':  '☼'
	};
	
	oC.charDictInverse = KeyValue2ValueKey(oC.charDict);

	
	oC.charDictSpecial = {
		'"': '░',
	};
	
	oC.charDictSpecialInverse = KeyValue2ValueKey(oC.charDictSpecial);
	
	
	function KeyValue2ValueKey(dict){
		var newDict ={};
		Object.keys(dict).forEach(function(key){
			newDict[dict[key]] = key;
		});
		return newDict;
	}
	

	
	function CharDict2CharString(charDictInput,synStr){
		var resultString = '';
		
		Object.keys(charDictInput).forEach(function(key){
			resultString += synStr + key + '|'
		});

		return resultString.substring(0,resultString.length-1);
	}

	
	oC.FromCharDict2String = function(){
		var resultString = '';
		resultString = CharDict2CharString(oC.charDict,"\\");
		resultString += '|' + CharDict2CharString(oC.charDictSpecial,'\\');
		return resultString;
	};
	
	oC.FromCharDictInvers2String = function(){
		var resultString = '';
		resultString = CharDict2CharString(oC.charDictInverse,"\\");
		resultString += '|' + CharDict2CharString(oC.charDictSpecialInverse,'\\');
		return resultString;
	};
	return oC;
}



var DrawBookmarkGraph = function(){
	var oC = {};//generate a object content json object;
	var bookmarkData = null;
	
	// convert json object in string json for jQuery name(id)
	function JSON2JSONId(jsonObject){

		var resultStr = JSON.stringify(jsonObject);
		
		//var chars = new RegExp("(\\{|\\}|\\[|\\]|\"|\\?|\\:|\;|\\,|\\ |\\.|\\'|\\&|\\!|\\-|\\(|\\))", "g");
		var chars = new RegExp("("+SpecialChars().FromCharDict2String()+")", "g");
		var resultStrFiltered = resultStr.replace(
			//(\{|\}|\[|\]|\"|\?|\:|\;|\,|\ |\.|\'|\&|\!|\-|\(|\))/g, 
			chars, 
			function(m){
				if(SpecialChars().charDict.hasOwnProperty(m)){
					return SpecialChars().charDict[m];
				}
				if(SpecialChars().charDictSpecial.hasOwnProperty(m)){
					return SpecialChars().charDictSpecial[m];
				}
			}
		);
		return resultStrFiltered;
	};
	// convert jsonid string in string json 
	function JSONId2JSONString(jsonStringId){
		var chars = new RegExp("("+SpecialChars().FromCharDictInvers2String()+")", "g");
	
		return jsonStringId.replace(
			//(«|»|◄|►|░|¿|⌂|↕|♦|°|▒|▓|®|î|↔|←|→)/g, 
			chars,
			function(m){
				if(SpecialChars().charDictInverse.hasOwnProperty(m)){
					return SpecialChars().charDictInverse[m];
				}
				if(SpecialChars().charDictSpecialInverse.hasOwnProperty(m)){
					return SpecialChars().charDictSpecialInverse[m];
				}
			/*
				switch(m) {
					case '«': return '{'; case '»': return '}';
					case '◄': return '['; case '►': return ']';
					case '←': return '(';case '→': return ')';
					
					case '°': return ' '; case '¿': return '?'; 
					case '⌂': return ':'; case '♦': return ',';
					case '↕': return ';'; case '▓': return '\.';
					case '®': return '&'; case 'î': return '!'; 
					case '░': return '"'; case '▒': return "'";
					case '↔': return '-';
				}
				*/
			}
		);
	};
	
	
	function Addbookmark(bookmarkNameObj,booknameProperties){
		var bookmarkName = JSON2JSONId(bookmarkNameObj);
		
		forceBookmarkGraph.To.Object().To.Node()
			.Add(bookmarkName)
			.Change(bookmarkName,{drag:true,title:booknameProperties.bookmarkName})
			.To.SubElement()
				.Change(bookmarkName,"svgcircle",{
					attr:{fill:booknameProperties.color,r:60}
				})
				.Add(bookmarkName,"textForRect","rect")
				.Change(bookmarkName,"textForRect",{
					attr:{transform:"translate(-60,85)",height:20,width:120,fill:"lightgreen"}})
				.Add(bookmarkName,"svgtext","text")						
				.Change(bookmarkName,"svgtext",{
					attr:{transform:"translate(-55,100)"},
					text:TextCutter(booknameProperties.bookmarkName,10,9)});
		
	};

	
	
	function DrawbookmarkItem(bookmarkNameObj,bookmarkItemNameObj){
	
		var bookmarkItemName = JSON2JSONId(bookmarkItemNameObj);
		
		forceBookmarkGraph.To.Object().To.Node()
			.Add(bookmarkItemName)
			.Change(bookmarkItemName,{drag:true,
				title:(
					"query: "+ bookmarkItemNameObj[1]["name"][1]["query"]+
					" | title: "+ JSONId2JSONString(bookmarkItemNameObj[1]["name"][2]["title"])) })
			.To.SubElement()
				.Change(bookmarkItemName,"svgcircle",{
					attr:{fill:"grey",r:20}
				});
				
				
		var bookmarkName = JSON2JSONId(bookmarkNameObj);		
		
		var bookmarkLineName = JSON2JSONId([
				{"graphobj":"link"},
				{
					"name":bookmarkItemNameObj[1]["name"]
				}
			]);
			
		forceBookmarkGraph.To.Object().To.Link()
			.Add(bookmarkName,bookmarkItemName,bookmarkLineName)
			.Change(bookmarkLineName,{"distance":200});

		
	};
	
	function AddLineBetweenBookmarks(bookmarkNameObj1,bookmarkNameObj2,bookmarkLineName,lineWidth){
		var widthVal = 0;

		if(lineWidth > 0){
			forceBookmarkGraph.To.Object().To.Link()
				.Add(bookmarkNameObj1,bookmarkNameObj2,bookmarkLineName);
				
			widthVal = lineWidth*2;
			forceBookmarkGraph.To.Object().To.Link()
				.Change(bookmarkLineName,{"distance":800,"attr":{"stroke-width":widthVal}})
				.To.SubElement()
					.Change(
						bookmarkLineName,
						"svgtext",
						{attr:{fill:"orange","stroke":"orange"},text:widthVal});
		}

	}
	
	
	//generate bookmarks in Graph
	oC.AddBookmarkGraph = function(bookmarkDataParam){
		bookmarkData = bookmarkDataParam;

		var bookmarksInGraph ={};
		var bookmarkNamesInGraph =[];
		
		var relationBetweenBookmarks = {};
		//add bookmarks
		Object.keys(bookmarkData).forEach(function(bookmark){

			//add bookmark
			var bookmarkNameObj = [
				{"graphobj":"node"},
				{"bookmark":bookmark}
			];
			Addbookmark(bookmarkNameObj,{
				bookmarkName:bookmark,
				color:bookmarkData[bookmark].color});
			

			
			//add bookmark items
			bookmarkData[bookmark].items.forEach(function(item){
			
				//add bookmark item
				var bookmarkItemValue = [
					{"graphobj":"node"},
					{
						"name":[
							{"bookmark":bookmark},
							{"query":item.query},
							{"title":JSON2JSONId(item.title)}
						]
					}
				];
				DrawbookmarkItem(bookmarkNameObj,bookmarkItemValue);
				
				//add and grow lines between bookmarks
				bookmarkNamesInGraph.forEach(function(bookmarkName){
					
					//---Start Bookmark and Bookmark items output
					//console.log(": " + bookmarksInGraph[bookmarkName]);
					//console.log(": " + JSON2JSONId(bookmarkNameObj));
					
					var bookmarkItemValueObj = bookmarkItemValue[1].name;
					//console.log(":: " +bookmarkItemValueObj[0].bookmark);
					//console.log(":: | "+ 
					//	JSONId2JSONString(bookmarkItemValueObj[1].query) + " | " + 
					//	JSONId2JSONString(bookmarkItemValueObj[2].title));					
						
					
					//console.log(":: " +bookmarkName);
					var betweenBookmarks = bookmarkName+ "_" +bookmarkItemValueObj[0].bookmark;
					bookmarkData[bookmarkName].items.forEach(function(itemOfOtherBookmark){
						//console.log(":: | " + itemOfOtherBookmark.query + " | " + itemOfOtherBookmark.title);
						
						if(!relationBetweenBookmarks.hasOwnProperty(betweenBookmarks)){	
							relationBetweenBookmarks[betweenBookmarks] = {
								differentCount :0,
								nodeOne:bookmarksInGraph[bookmarkName],
								nodeTwo:JSON2JSONId(bookmarkNameObj)
							};	
						}

						relationBetweenBookmarks[betweenBookmarks].differentCount += GetEqualValue(
							StringToWordcict(bookmarkItemValueObj[1].query),
							StringToWordcict(itemOfOtherBookmark.query),true)+
							GetEqualValue(
							StringToWordcict(bookmarkItemValueObj[2].title),
							StringToWordcict(itemOfOtherBookmark.title),true);
							
					});

					//---End Bookmark and Bookmark items output
				});
				//console.log(".....................");
			});
			

			
			bookmarksInGraph[bookmark] = JSON2JSONId(bookmarkNameObj);
			bookmarkNamesInGraph.push(bookmark);
		});
		
		//add and lines between bookmarks
		//console.log("#------------#");
		//console.log(relationBetweenBookmarks);
		//console.log("#------------#");
		
		Object.keys(relationBetweenBookmarks).forEach(function(element){
			AddLineBetweenBookmarks(
				relationBetweenBookmarks[element].nodeOne,
				relationBetweenBookmarks[element].nodeTwo,
				element,
				relationBetweenBookmarks[element].differentCount);
		});
		

	};
	
	return oC;
	
}