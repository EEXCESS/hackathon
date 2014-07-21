
//link methods --------------------------------------------------------------------------------------------------------
var LinkClass = function(core){
	///////////////////////////
	var graphData = core.graphData;
	var links = core.links;
	//////////////////////////
	
	var helpFunc = new HelpFunctions();
	var AssignParameter = helpFunc.AssignParameter;	
	var getArrayElementById = helpFunc.getArrayElementById;	
	
	var oC={

		Add:function(sourceNodeId,targetNodeId,linkId,linkObj){
			// add link with 2 nodes inefficient
			// if use dictionary (node) is: ok
			if(!graphData.data.dict.link.hasOwnProperty(linkId)){
				var newlink = null;
				if(linkObj != undefined){
					linkObj.source = graphData.data.dict.node[sourceNodeId].object;
					linkObj.target = graphData.data.dict.node[targetNodeId].object;
					newlink = linkObj;
				}else{   //default line
					newlink = {
						//search in array: not ok
						//solution: get node per dictionary: ok
						source: graphData.data.dict.node[sourceNodeId].object, 
						//search in array: not ok
						//solution: get node per dictionary: ok
						target: graphData.data.dict.node[targetNodeId].object,
						elementId:linkId,
						linkContent:{ 
							parameter:{
								curve:{
									active:false,
									radius:1,
									restpathparam:"0 0 1"
								},
								distance:20,
								strength:1,
								title:null,
								event:{
									action:null,
									func:null,
									param:null
								},
								attr:{"stroke":"black","fill":"none"}
							},
							subElementsList:["svgtext"],
							subElements:{
								"svgtext":{
									element:"text",
									attr:{fill:"black"},
									text:null,
									event:{
										action:null,
										func:null,
										param:null
									}
								}
							}
						}
					};
				}

				links.push(newlink);
				graphData.data.dict.link[linkId] = links[links.length-1];
				graphData.data.dict.node[sourceNodeId].connections[linkId] = null;
				graphData.data.dict.node[targetNodeId].connections[linkId] = null;
				
			}
		},

		Delete:function(linkId){
			//delete link
			//search in array link-list and delete it: ok.
			links.splice(getArrayElementById(links,linkId,"elementId").index, 1);
			
			var currentLink = graphData.data.dict.link[linkId];
			delete graphData.data.dict.node[currentLink.source.elementId].connections[linkId];
			delete graphData.data.dict.node[currentLink.target.elementId].connections[linkId];
			delete graphData.data.dict.link[linkId];
			
			
		},
		Change:function(linkId,param){
			//change link data
			AssignParameter(param,graphData.data.dict.link[linkId].linkContent.parameter);
		},


		ChangeSubElement:{

			Delete:function(linkId,deleteSubLinkId){

				var currentElement = graphData.data.dict.link[linkId].linkContent;
				currentElement.subElementsList.splice(currentElement.subElementsList.indexOf(deleteSubLinkId),1);
				delete currentElement.subElements[deleteSubLinkId];
				
			},
			Add:function(linkId,newSubLinkId,svgSubElement){

				var currentElement = graphData.data.dict.link[linkId].linkContent;
				currentElement.subElementsList.push(newSubLinkId);
				
				//default sub link
				currentElement.subElements[newSubLinkId] ={
					element:svgSubElement,
					attr:{},
					text:null,
					event:{
						action:null,
						func:null,
						param:null
					}
				};
				
			},

			Change:function(linkId,subLinkId,param){
				AssignParameter(param,graphData.data.dict.link[linkId].linkContent.subElements[subLinkId]);
			}
		}

	}; 
return oC;};


//marker methods ------------------------------------------------------------------
var MarkerClass = function(core){
	///////////////////////////
	var graphData = core.graphData;
	var markers = core.markers;
	//////////////////////////
	
	var helpFunc = new HelpFunctions();
	var AssignParameter = helpFunc.AssignParameter;	
	var getArrayElementById = helpFunc.getArrayElementById;	
	
	var oC={

		Add:function(markerId,markerObj){
			if(!graphData.data.dict.marker.hasOwnProperty(markerId)){
				var newMarker = null;
				if(markerObj != undefined){
					newMarker = markerObj;
				}else{ // default marker
					newMarker ={
						elementId:markerId,
						attr:{viewBox:"0 -5 10 10",refX:15,markerWidth:6,markerHeight:6,orient:"auto"},
						markerContent:{
							subElementsList:["svgpath"],
							subElements:{
								"svgpath":{
									element:"path",
									//transform:"scale(3)"
									attr:{d:"M0,-5L10,0L0,5",fill:"red"}
								}
							}
						}
					};
				}
				markers.push(newMarker);
				graphData.data.dict.marker[markerId] = markers[markers.length-1];
			}
		},
		
		Delete:function(markerId){
			markers.splice(getArrayElementById(markers,markerId,"elementId").index, 1);
			delete graphData.data.dict.marker[markerId];
		},

		Change:function(markerId,param){
			AssignParameter(param,graphData.data.dict.marker[markerId].attr);
		},
		
		ChangeSubElement:{

			Add:function(markerId,newSubMarkerId,svgSubElement){

				var currentElement = graphData.data.dict.marker[markerId].markerContent;
				currentElement.subElementsList.push(newSubMarkerId);
				
				//default sub marker
				currentElement.subElements[newSubMarkerId] ={
					element:svgSubElement,
					attr:{},
					text:null
				};
			},

			Delete:function(markerId,newSubMarkerId){

				var currentElement = graphData.data.dict.marker[markerId].markerContent;
				currentElement.subElementsList.splice(currentElement.subElementsList.indexOf(newSubMarkerId),1);
				delete currentElement.subElements[newSubMarkerId];
				
			},

			Change:function(markerId,newSubMarkerId,param){
				AssignParameter(param,graphData.data.dict.marker[markerId].markerContent.subElements[newSubMarkerId]);
			}
		}

	}; 
return oC;};
