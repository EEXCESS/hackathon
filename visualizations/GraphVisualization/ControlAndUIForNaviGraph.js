//help functions
function GetSamePartOfArray(arraySize,parts){
	var resultArray = [];
	var interval = d3.round(arraySize/(parts+1));
	var iterate = interval-1;

	resultArray.push(0);
	do{
		resultArray.push(iterate);
		iterate = iterate +interval;
		parts--;
	}while(parts != 0);

	resultArray.push(arraySize-1);
	return resultArray;
}

function TextCutter(text,sizeCompare,sizeCut){

	if(text == undefined){
		console.log("no text");
		return "no text";
	}
	return text.length < sizeCompare ? text : text.substring(0,sizeCut)+"..."; 
}

function FilterTextList(objectVar,stringVal){
	return Object.keys(objectVar).filter(function(element){
        return stringVal == element.substring(0,stringVal.length);
    });
}



//only test function
function LastTestAction(){
//only test output
	console.log({"wl":getDataFromIndexedDB.queryObjHistory});
	console.log({"wl":getDataFromIndexedDB.uniqueWords});

	console.log(getDataFromIndexedDB.wordsWithResults);
	console.log({"wl":getDataFromIndexedDB.wordHistory});
	
	console.log("---------");
}

//init the application



//init bookmark data
var bookmarkingAPI = new Bookmarking();

bookmarkingAPI.init();




//get data from indexedDB
var getDataFromIndexedDB = null;
getDataFromIndexedDB = new GetDataFromIndexedDB();

getDataFromIndexedDB.Init(function(){
	
	LastTestAction();
	forceNaviGraph.InitGraph("#D3graph");
	forceNaviGraph.To.Object().Graph.GetGraphData().data.funcDict = funcStore;
	
	forceBookmarkGraph.InitGraph("#Bookmarkgraph");
	
	//Ultrahack !!!!!!!!!!!!!!!!!!!!!
	setTimeout(function () {
		LoadBookmarks(bookmarkingAPI.getAllBookmarks());
		//very important!
		//start the jQuery library
		$(BuildControls);
	},4000);
	//Ultrahack !!!!!!!!!!!!!!!!!!!!!
	
	//very important!
	//start the jQuery library
	//$(BuildControls);
	
	
});


function AddBookMarkInGraph(nodeId,bookmarkId,color){

	var bookmarkNodeId = "Bookmark_"+nodeId+"_"+bookmarkId;
	
	var graphdata = forceNaviGraph.To.Object().To.Graph().GetGraphData();
	if(graphdata.data.dict.node.hasOwnProperty(nodeId)){
		forceNaviGraph.To.Object().To.Node()
			.Add(bookmarkNodeId)
			.Change(bookmarkNodeId,{title:bookmarkId})
			.To.SubElement()
				.Delete(bookmarkNodeId,"svgcircle")
				.Add(bookmarkNodeId,"svgrect","rect")
				.Change(bookmarkNodeId,"svgrect",{
					attr:{"fill":color,x:-5,y:-5,width:10,height:10},
					event:{action:"mouseover",func:"MouseOverBookmark",param:JSON.stringify({
						nodeName:bookmarkNodeId,bookmarkName:bookmarkId,nodeId:nodeId,color:color})},
					event1:{action:"mouseout",func:"MouseOutBookmark",param:JSON.stringify({
						nodeName:bookmarkNodeId,bookmarkName:bookmarkId,nodeId:nodeId,color:color})}
				})
		.To.Object().To.Link()
			.Add(nodeId,bookmarkNodeId,"LinkBookmark_"+nodeId+"_"+bookmarkId)
			.Change("LinkBookmark_"+nodeId+"_"+bookmarkId,{distance:2});
		
		forceNaviGraph.To.Object().To.Graph().ReDraw();
		

		
		//console.log("boooooooookmark");
		//bookmark
		return true;
	}//else{
		//console.log("noooooooooooo  boooooooookmark!!!!!!!!!!!!");
	//}

	//no bookmark
	return false;

}

function DeleteBookMarkFromGraph(nodeId,bookmarkId){

	var bookmarkNodeId = "Bookmark_"+nodeId+"_"+bookmarkId;
	forceNaviGraph.To.Object().To.Node()
		.Delete(bookmarkNodeId);
	forceNaviGraph.To.Object().To.Graph().ReDraw();
}


// make graph and control objects.
var forceNaviGraph = new FGraph();
var drawNaviGraphObj = new DrawNaviGraph();
var slidercontrol = new SilderControl();

var forceBookmarkGraph = new FGraph();
var drawBookmarkGraphObj = new DrawBookmarkGraph();


var rList = null;
var onlyResult = false;
var currentResultClick = {
	resultNode:null,
	queryNode:null
	};

var currentHover = null;



function AddBookmarkItem(currentNodeId,currentSelectedBookmark,queryName){
	
	var bookmarkColor = $("#"+currentSelectedBookmark+" .editcolor").val();
	var bookmarkItem = null;
	
	if(currentSelectedBookmark == null){
		console.log("no bookmark selected");
	}else{
		var bookmarkElement = $("#"+currentSelectedBookmark+" .bookmark_element_"+currentNodeId);
		var queryNodePartNames = currentNodeId.split("_");
		
		if(bookmarkElement.length == 0){
			//add new bookmark element
			
			
			
			var queryTextContent = $("#"+queryNodePartNames[1] + "_" +queryNodePartNames[2]+" title").text();
			var titleTextContent = $("#"+currentNodeId+" title").text();
			
			if(queryName != null ){

				bookmarkItem = getDataFromIndexedDB.wordsWithResults[queryName].results[
						getDataFromIndexedDB.wordsWithResults[queryName].resultList[queryNodePartNames[3]]
					];
				bookmarkItem.query = queryName;
				
				queryTextContent = queryName;		
				titleTextContent = bookmarkItem.title;

			}else{
				var bookmarkItem = getDataFromIndexedDB.wordsWithResults[queryTextContent].results[
						getDataFromIndexedDB.wordsWithResults[queryTextContent].resultList[queryNodePartNames[3]]
					];
				bookmarkItem.query = queryTextContent;
				bookmarkingAPI.addItemToBookmark(currentSelectedBookmark, bookmarkItem);
			
			}
			
			$("#"+currentSelectedBookmark+" .bookmarkelement")
				.append(
					'<div style="user-select: text;" class="bookmark_element_'+currentNodeId+' grey_round_box">'
						+'<div>'
							+'<span class="type_bold">query: </span>'
							+'<span class="querycontent">'+queryTextContent
							+'</span>'
						+'</div>'
						+'<div>'
							+'<span class="type_bold">title:</span>'
							+titleTextContent
						+'</div>'
					+'</div>');
			
			//add bookmark hover
			$(".bookmark_element_"+currentNodeId).on("mouseover",function(){
				funcStore["MouseOverBookmark"](JSON.stringify({
					nodeName:"Bookmark_"+currentNodeId+"_"+currentSelectedBookmark,
					bookmarkName:currentSelectedBookmark,
					nodeId:currentNodeId,
					color:"black"}));
			});
			$(".bookmark_element_"+currentNodeId).on("mouseout",function(){
				funcStore["MouseOutBookmark"](JSON.stringify({
					nodeName:"Bookmark_"+currentNodeId+"_"+currentSelectedBookmark,
					bookmarkName:currentSelectedBookmark,
					nodeId:currentNodeId,
					color:"black"}));
			});
			$(".bookmark_element_"+currentNodeId).on("click",function(){
				var searchText = 
					$("#"+currentSelectedBookmark+" .bookmark_element_"+currentNodeId+" .querycontent").text();
				//console.log("|"+searchText+"|");
				
				var historyNumber = [];
				getDataFromIndexedDB.wordHistory.forEach(function(query,index){
					if(searchText == query){
						historyNumber.push(index);
					}
				});
				//console.log(historyNumber);
				//console.log(sliderMin+ " , "+sliderMax);
				var binaryContent ={number:0,min:false,max:false};
				var vmin = null;
				var vmax = null;
				
				for(var icount=0;icount<historyNumber.length;icount++){
					binaryContent ={number:historyNumber[icount],min:false,max:false};
					
					if(sliderMin<=historyNumber[icount]){
						binaryContent.min = true;
					}
					if(historyNumber[icount]<=sliderMax){
						binaryContent.max = true;
					}
					
					if(binaryContent.min == true && binaryContent.max == true){
						//bookmark are here
						vmin = null; vmax = null;
						break;
					//bookmark not here
					}else if(binaryContent.min == false && binaryContent.max == true){
						vmin = binaryContent.number;
					}else if(binaryContent.min == true && binaryContent.max == false){
						vmax = binaryContent.number;
						break;
					}

				}
				
				if(vmin != null && vmax != null){
					if((sliderMin - vmin)<(vmax-sliderMax)){
						sliderMin = vmin;
					}else{
						sliderMax = vmax;
					}
				}else if(vmin != null && vmax == null){
					sliderMin = vmin;
				}else if(vmax != null && vmin == null){
					sliderMax = vmax;
				}
				
				slidercontrol.brush.extent([sliderMin, sliderMax]);
				
				drawNaviGraphObj.ReDrawGraph(sliderMin,sliderMax,sliderMin,sliderMax);
				drawNaviGraphObj.ChangeGraph(sliderMin,sliderMax);
				forceNaviGraph.To.Object().To.Graph().ReDraw();
				
				slidercontrol.ChangeSilderControl();
			});	
			var drawBookmark = AddBookMarkInGraph(currentNodeId,currentSelectedBookmark,bookmarkColor);	

			
			bookmarkDict.bookmarks[currentSelectedBookmark][currentNodeId] ={};

			var queryVal = queryName;
			if(queryName == null){
				queryVal = $("#"+queryNodePartNames[1] + "_" +queryNodePartNames[2]+" title").text();
			}
			
			bookmarkDict.bookmarks[currentSelectedBookmark][currentNodeId] ={
				color:$("#"+currentSelectedBookmark+" .editcolor").val(),
				query:queryVal,//$("#"+queryNodePartNames[1] + "_" +queryNodePartNames[2]+" title").text(),
				title:bookmarkItem.title//$("#"+currentNodeId+" title").text()
			};


			
			if(!bookmarkDict.nodes.hasOwnProperty(currentNodeId)){
				bookmarkDict.nodes[currentNodeId]={};
			}
			bookmarkDict.nodes[currentNodeId][currentSelectedBookmark] = null;
			//console.log(bookmarkDict);
		}else{
			//delete bookmark element
			$("#"+currentSelectedBookmark+" .bookmark_element_"+currentNodeId).remove();
			DeleteBookMarkFromGraph(currentNodeId,currentSelectedBookmark);

			var queryNameVar = bookmarkDict.bookmarks[currentSelectedBookmark][currentNodeId].query;
			
			bookmarkItem = getDataFromIndexedDB.wordsWithResults[queryNameVar].results[
				getDataFromIndexedDB.wordsWithResults[queryNameVar].resultList[queryNodePartNames[3]]
			];
			bookmarkingAPI.deleteItemFromBookmark(bookmarkItem.id,currentSelectedBookmark);
			
			
			delete bookmarkDict.bookmarks[currentSelectedBookmark][currentNodeId];

			delete bookmarkDict.nodes[currentNodeId][currentSelectedBookmark];
			
			if(Object.keys(bookmarkDict.nodes[currentNodeId]).length == 0){
				delete bookmarkDict.nodes[currentNodeId];
			}
		}
	}
	//}	

}


/*
//Ultrahack !!!!!!!!!!!!!!!!!!!!!
setTimeout(function () {
	console.log("-----------------------------");
	//console.log(bookmarkingAPI.getAllBookmarkNamesAndColors());/////////

	//console.log(bookmarkingAPI.getAllBookmarks());
	//console.log(bookmarkingAPI.getBookmarsDictionary("zz"));
	//console.log(bookmarkingAPI.getBookmarsDictionary("bububu"));
	//console.log(bookmarkingAPI.getAllBookmarkedItemsInArray("zz")); //??
	//console.log(bookmarkingAPI.getAllBookmarkedItemsInArray("bububu")); //??
	//console.log(bookmarkingAPI.getBookmarkedItemsById("10009777995")); //??
	//console.log(bookmarkingAPI.getBookmarkedItemsByTitle("The economic outlook for Russia in 2012 - 2014"));//??
	
	
	console.log("-----------------------------");
	
	LoadBookmarks(bookmarkingAPI.getAllBookmarks());
}, 5000);
//Ultrahack !!!!!!!!!!!!!!!!!!!!!!!!
*/
function LoadBookmarks(bookmarkDictParam){
	//console.log(bookmarkDictParam);
	//console.log(bookmarkDict);
	if(bookmarkDictParam == null){
		return;
	}
	Object.keys(bookmarkDictParam).forEach(function(bookmarkName){
		console.log(bookmarkName + " : " + bookmarkDictParam[bookmarkName].color);
		
		var color = bookmarkDictParam[bookmarkName].color;
		
		//Hack
		if(color.length == 4){
			var newColor = "#";
			newColor += color[1]+color[1];
			newColor += color[2]+color[2];
			newColor += color[3]+color[3];
			color = newColor;
		}else if(color.length > 7){
			var colorArray = color.substring(4,color.length -1).split(",");
			//console.log(color);
			function componentToHex(c) {
				var hex = c.toString(16);
				return hex.length == 1 ? "0" + hex : hex;
			}

			function rgbToHex(r, g, b) {
				return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
			}
			color = rgbToHex(parseInt(colorArray[0]),parseInt(colorArray[1]),parseInt(colorArray[2]));
			
		}
		////Hack
		AddBookmark(bookmarkName,color);
		
		
		//AddItems
		//console.log("#:- " + bookmarkName);
		bookmarkDictParam[bookmarkName].items.forEach(function(item){
			if(item.hasOwnProperty("query")){
				//console.log("#:-- " + item.query + " : " +item.uri);
				
				if(getDataFromIndexedDB.wordsWithResults[item.query] != undefined){//hack bugfix
					getDataFromIndexedDB.wordsWithResults[item.query].resultList.every(function(element,index){
						if(item.uri == element){
							//console.log("#:--- " + index + " : " + item.uri);
							//add items
							var nodeName = "ResultNodeID_UniqueNodeID_" + MD5(item.query) + "_" + index;
							//console.log(nodeName + " : " + item.query);
							
							AddBookmarkItem(nodeName,bookmarkName,item.query);
							
							return false;
						}
						return true;
					});
				}

			}
		});
		
		
		
	});
}


//storefunction for graph	
var funcStore =	{
	"WorkWithResultNode":function(param){

		//if(toggleBookmark){
		//console.log(JSON.parse(param).nodeName + " - " +currentSelectedBookmark);
		
		var currentNodeId = JSON.parse(param).nodeName;
		//var test = forceNaviGraph.Graph.GetGraphData();
		
		var bookmarkColor = $("#"+currentSelectedBookmark+" .editcolor").val();

		AddBookmarkItem(currentNodeId,currentSelectedBookmark,null);
		
	},
	"MoreResult":function(param){
		// get data from graph
		var graphData = forceNaviGraph.Graph.GetGraphData().data;	
		var uniqueNodeId = JSON.parse(param).nodeName;
		
		drawNaviGraphObj.DeleteResultNode(uniqueNodeId,graphData);
		drawNaviGraphObj.AddResultNodes(uniqueNodeId,JSON.parse(param).query,1000);
		
		forceNaviGraph.To.Object().To.Graph().ReDraw();
	},
	"LessResult":function(param){
		//console.log(JSON.parse(param).nodeName);
		var graphData = forceNaviGraph.Graph.GetGraphData().data;	
		var uniqueNodeId = JSON.parse(param).nodeName;
		
		drawNaviGraphObj.DeleteResultNode(uniqueNodeId,graphData);
		drawNaviGraphObj.AddResultNodes(uniqueNodeId,JSON.parse(param).query,5);
		
		forceNaviGraph.To.Object().To.Graph().ReDraw();
	},
	"AddNewTextForSearch":function(param){
		var searchText = $("#searchtext").val();
		searchText += " " +$("#"+JSON.parse(param).nodeName +" title").text();
		$("#searchtext").val(searchText);
		
	},
	"ShowDetails":function(param){

		//console.log("gg "+ param);
		var nodeName = JSON.parse(param).nodeName;
		
		var nameArray = nodeName.split("_");
		
		var queryNode = "UniqueNodeID_" + nameArray[2];
		var queryNodeTitle = $("#"+queryNode +" title").text();
		var currentQueryNodeObj = getDataFromIndexedDB.wordsWithResults[queryNodeTitle];
		
		console.log(currentQueryNodeObj);
		var currentArrayResult = currentQueryNodeObj.resultList[parseInt(nameArray[3])];
		//var currentResult = currentQueryNodeObj.results[currentArrayResult];
		//console.log(currentResult);		
		
		
		//change nodes properties
		if(currentResultClick.resultNode != null){
			forceNaviGraph.To.Object().To.Node().To.SubElement()
				.Change(currentResultClick.resultNode,"svgcircle",{
					attr:{"stroke":"","stroke-width":""}
				}).Change(currentResultClick.queryNode,"svgcircle",{attr:{"fill-opacity":1.0}});
			forceNaviGraph.To.Object().To.Graph().ReDraw();
		}
		currentResultClick.resultNode = nodeName;
		currentResultClick.queryNode = queryNode;
		forceNaviGraph.To.Object().To.Node().To.SubElement()
			.Change(nodeName,"svgcircle",{
				attr:{"stroke":"black","stroke-width":3}
			}).Change(queryNode,"svgcircle",{attr:{"fill-opacity":0.5}});
		forceNaviGraph.To.Object().To.Graph().ReDraw();	
		
		
		//get to details

		
		function ClearDetailData(){
			$("#bookmarklist *").remove();
			$("#title_data").val("");
			$("#link_data").text("").attr("href","");
			$("#image_data").attr("src","");
			$("#id_data, #language_data, #partner_data, #provider_data, #type_data, #year_data").text("");
		};
		ClearDetailData();

		var detailData = currentQueryNodeObj.results[currentArrayResult];
		//console.log(detailData);
		
		//bookmarkDict
		if(Object.keys(bookmarkDict.nodes).length > 0){
			if(bookmarkDict.nodes.hasOwnProperty(nodeName)){
				Object.keys(bookmarkDict.nodes[nodeName]).forEach(function(bookmarkName){
					var bookmarkdata = bookmarkDict.bookmarks[bookmarkName][nodeName];
					$("#bookmarklist").append(
						'<li class="bookmark_box">'
						+'<span style="background-color:'+bookmarkdata.color+';">&nbsp;&nbsp;</span>'
						+bookmarkName+'</li>');
				});
			}
		}
		
		$("#title_data").val(detailData.title);
		$("#link_data").text(detailData.uri).attr("href",detailData.uri);//.val(TextCutter(detailData.uri,20,19));
		$("#image_data").attr("src",detailData.previewImage);
		$("#id_data").text(detailData.id);
		
		$("#language_data").text(detailData.facets.language);
		$("#partner_data").text(detailData.facets.partner);
		$("#provider_data").text(detailData.facets.provider);
		$("#type_data").text(detailData.facets.type);
		$("#year_data").text(detailData.facets.year);

		//var test = forceNaviGraph.Graph.GetGraphData();
		
	},
	"GetResults":function(param){
		$("#result_btn").trigger("click");
		//console.log(JSON.parse(param).queries);
		onlyResult = true;
		rList.loading(); // show loading bar, will be removed when new results arrive
		
		//$("#searchstatus").text("searching");
		
		var textinput = JSON.parse(param).query;
		var query_terms = textinput.split(' ');
		var query = [];
		for (var i = 0; i < query_terms.length; i++) {
			var tmp = {
				weight: 1,
				text: query_terms[i]
			};
			query.push(tmp);
		}
		console.log("start search go");
	

	
		//begin search
		EEXCESS.messaging.callBG({
			method: {parent: 'model', func: 'query'}, data:query //data: [{weight:1,text:dataParameter.text}]
		});
	},
	"ShrinkCircle":function(param){
		var paramObj = JSON.parse(param);
		forceNaviGraph.To.Object().To.Node()
			.To.SubElement()
				.Change(paramObj.nodeName,"svgcircle",{
					attr:{visibility:"visible"}
				})
				.Change(paramObj.nodeName,"svghiddencircle",{
					attr:{visibility:"hidden"}
				});
				
		forceNaviGraph.To.Object().To.Graph().ReDraw();	

	},
	"GrowCircle":function(param){
		var paramObj = JSON.parse(param);
		
		if(currentHover != null){
			try{
				forceNaviGraph.To.Object().To.Node()
					.To.SubElement()
						.Change(currentHover,"svgcircle",{
							attr:{visibility:"visible"}
						})
						.Change(currentHover,"svghiddencircle",{
							attr:{visibility:"hidden"}
						});
			}catch(ex){}
		}
		currentHover = paramObj.nodeName;
		
		
		forceNaviGraph.To.Object().To.Node()
			.To.SubElement()
				.Change(paramObj.nodeName,"svgcircle",{
					attr:{visibility:"hidden"}
				})
				.Change(paramObj.nodeName,"svghiddencircle",{
					attr:{visibility:"visible"}
				});
				
		forceNaviGraph.To.Object().To.Graph().ReDraw();	
	},
	"MouseOverBookmark":function(param){
		var bookmarkNodeId = JSON.parse(param);
		
		try{
			forceNaviGraph.To.Object().To.Node()
				.To.SubElement()
					.Change(bookmarkNodeId.nodeName,"svgrect",{
						attr:{transform:"scale(2)"}});

			forceNaviGraph.To.Object().To.Graph().ReDraw();	
		}catch(e){}
		
		$("#"+bookmarkNodeId.bookmarkName+", "
			+"#"+bookmarkNodeId.bookmarkName+" .bookmark_element_"+bookmarkNodeId.nodeId).css({
			"outline-width":2,"outline-color":bookmarkNodeId.color,"outline-style":"dashed"});
	
		var nameArray = bookmarkNodeId.nodeId.split("_");

		forceNaviGraph.To.Object().To.Node()
			.To.SubElement()
				.Change(
					nameArray[1]+"_"+nameArray[2],
					"svgcircle",
				{attr:{"fill-opacity":0.5}});
		forceNaviGraph.To.Object().To.Graph().ReDraw();
		
	},
	"MouseOutBookmark":function(param){
		var bookmarkNodeId = JSON.parse(param);
		
		try{
			forceNaviGraph.To.Object().To.Node()
				.To.SubElement()
					.Change(bookmarkNodeId.nodeName,"svgrect",{
						attr:{transform:"scale(1)"}});
						
			forceNaviGraph.To.Object().To.Graph().ReDraw();	
		}catch(e){}
		
		$("#"+bookmarkNodeId.bookmarkName+", "+".bookmark_element_"+bookmarkNodeId.nodeId).css({
			"outline-width":"","outline-color":"","outline-style":""});
			
		var nameArray = bookmarkNodeId.nodeId.split("_");

		forceNaviGraph.To.Object().To.Node()
			.To.SubElement()
				.Change(
					nameArray[1]+"_"+nameArray[2],
					"svgcircle",
				{attr:{"fill-opacity":1.0}});
		forceNaviGraph.To.Object().To.Graph().ReDraw();
		
	}
};













