
var g= null;
var linecount = 0;
	
function MakeGraph(){
	g = new ActionGraph();	
	
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

	
	// nodes
	wordHistory.forEach(function(nodename,index){
		var text= nodename;
		if(g.build.show.nodeDict.hasOwnProperty("nodeId"+nodename) == false){

			g.build.addNode("nodeId"+nodename);
			g.build.setNodeProperties("nodeId"+nodename,{
				xscale:5,yscale:5,text:TextCutter(text,10,9) + " : 1" ,title:text,fill:"green"
			}); 
		}else{
			var currentNodeProperty = g.build.getNodeProperties("nodeId"+nodename);
			var newXscale = currentNodeProperty.xscale+1;
			var newYscale = currentNodeProperty.yscale+1;
			
			g.build.setNodeProperties("nodeId"+nodename,{
				xscale:newXscale,yscale:newYscale,
				text:(currentNodeProperty.xscale-4)+ " : "+TextCutter(text,10,9)   ,title:(currentNodeProperty.xscale-4)+ " : "+text
			}); 


		}

	});
	
	
	var color = d3.scale.linear()
		.domain([0,wordHistory.length])
		.range(["red","blue"]);
	
	//First Node for link
	g.build.addNodeWithLink("nodeId"+wordHistory[0],"subNodeId"+0,"subLinkId"+0);
	g.build.setLinkProperties("subLinkId"+0,{
		distance:10*g.build.getNodeProperties("nodeId"+wordHistory[0]).xscale});
	g.build.setNodeProperties("subNodeId"+0,{
		xscale:3,yscale:3,fill:"red",
		text:"start",title:"start",
		stroke:"black","stroke-width":2});
	//debug
	//g.build.setNodeProperties("subNodeId"+0,{text:"subNodeId"+0,title:"subNodeId"+0});
	
	for(nodeCount=1;nodeCount<wordHistory.length;nodeCount++){
		sourceNode = wordHistory[nodeCount-1];
		targetNode = wordHistory[nodeCount];
		
		var targetNodeProperty = g.build.getNodeProperties("nodeId"+targetNode);
		var sourceNodeProperty = g.build.getNodeProperties("nodeId"+sourceNode);
		
		g.build.addNodeWithLink("nodeId"+targetNode,"subNodeId"+nodeCount,"subLinkId"+nodeCount);
		g.build.setLinkProperties("subLinkId"+nodeCount,{distance:10+targetNodeProperty.xscale*5});
		//debug
		//g.build.setNodeProperties("subNodeId"+nodeCount,{text:"subNodeId"+nodeCount,title:"subNodeId"+nodeCount});

		g.build.setNodeProperties("subNodeId"+nodeCount,{fill:color(nodeCount)});
		g.build.addLink("connectionLink"+nodeCount,"subNodeId"+(nodeCount-1),"subNodeId"+nodeCount);
		
		
		g.build.setLinkProperties("connectionLink"+nodeCount,{color:color(nodeCount),
			text:nodeCount,title:nodeCount + " of " + wordHistory.length,
			width:2,distance:/*300*/+10*(targetNodeProperty.xscale+sourceNodeProperty.xscale)});
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
	Object.keys(wordsWithResults).forEach(function(keyword){
		Object.keys(wordsWithResults[keyword].results).forEach(function(result){	
		
			text = wordsWithResults[keyword].results[result].title;
			storeDetailsForShorttime[wordsWithResults[keyword].results[result].uri] = wordsWithResults[keyword].results[result];
		
			/*
			console.log("-------------");
			console.log(result);
			console.log(keyword);
			*/
			var currentNodeProperty = g.build.getNodeProperties("nodeId"+keyword);
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
				distance:75+currentNodeProperty.xscale*5,
				color:"yellow"
			});   
			
			linecount++;
		});
	});

	
	g.build.show.restart();
}
