
var DrawBookmarkGraph = function(){
	var oC = {};//generate a object content json object;
	var bookmarkData = null;
	
	// convert json object in string json for jQuery name(id)
	function JSON2JSONId(jsonObject){
		return JSON.stringify(jsonObject).replace(
			/({|}|\[|\]|"|\?|:|,|\ |')/g, 
			function(m){
				switch(m) {
					case '{': return '«';case '}': return '»';
					case '[': return '◄';case ']': return '►';
					case '"': return '░';case ' ': return '°';
					case ':': return '⌂';case ',': return '♦';
					case '?': return '¿';case "'": return '▒';
					
					case ';': return '⌂';
				}
			}
		);
	};
	
	
	
	function Addbookmark(bookmarkName,booknameProperties){
		var bookmarkName = JSON2JSONId(bookmarkName);
		
		forceBookmarkGraph.To.Object().To.Node()
			.Add(bookmarkName)
			.Change(bookmarkName,{title:booknameProperties.bookmarkName})
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

	
	
	function AddbookmarkItem(bookmarkNameObj,bookmarkItemNameObj){
	
		var bookmarkItemName = JSON2JSONId(bookmarkItemNameObj);
		
		forceBookmarkGraph.To.Object().To.Node()
			.Add(bookmarkItemName)
			.Change(bookmarkItemName,{
				title:(
					"query: "+ bookmarkItemNameObj[1]["name"][1]["query"]+
					" | title: "+ bookmarkItemNameObj[1]["name"][2]["title"]) })
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
	
	function AddLineBetweenBookmarks(bookmarkNameObj1,bookmarkNameObj2){
	
	}
	
	function SetLineBetweenBookmarks(lineName,lineProperties){
	}
	
	//generate bookmarks in Graph
	oC.AddBookmarkGraph = function(bookmarkDataParam){
		bookmarkData = bookmarkDataParam;

		var bookmarksInGraph =[];
		var lineBetweenBookmarks ={};
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
							{"title":MD5(item.title)}
						]
					}
				];
				AddbookmarkItem(bookmarkNameObj,bookmarkItemValue);
				
				//add and grow lines between bookmarks
				bookmarksInGraph.forEach(function(bookmarkInGraph){
					console.log(": " + bookmarkInGraph);
					console.log(":: " + JSON2JSONId(bookmarkNameObj));
					console.log("::: "+ JSON2JSONId(bookmarkItemValue));
					//add and grow line between bookmarks
					
					
				});
				console.log(".....................");
			});
			
			bookmarksInGraph.push(JSON2JSONId(bookmarkNameObj));
		});
		
		
	};
	
	return oC;
	
}