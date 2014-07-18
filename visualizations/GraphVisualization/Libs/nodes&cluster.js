
//node methods---------------------------------------------------------------------------------------------------------------------
var NodeClass = function(core){

	///////////////////////////
	var graphData = core.graphData;
	var nodes = core.nodes;
	var links = core.links;

	//////////////////////////
	var helpFunc = new HelpFunctions();

	var ChangeManyData = helpFunc.ChangeManyData;
	var ChangeData = helpFunc.ChangeData;
	var AssignParameter = helpFunc.AssignParameter;
	var getArrayElementById = helpFunc.getArrayElementById;
	var spliceLinksForNode = helpFunc.spliceLinksForNode;


	var oC = {
		Add:function(nodeId,nodeObj){
			//add node ok
			//make dictionary element# key: elementId; value: node-object.
			if(!graphData.data.dict.node.hasOwnProperty(nodeId)){
				var newNode = null;
				if(nodeObj != undefined){
					newNode = nodeObj.object;
				}else{ //default node
					newNode ={
						elementId:nodeId,
						nodeContent:{
							fixed:null,
							px:null,
							py:null,
							parameter:{
								cluster:{
									active:false,
									distance:10,
									name:"cluster0"
								},
								attr:{},
								drag:false,
								title:null
							},
							subElementsList:["svgcircle"],
							subElements:{
								"svgcircle":{
									element:"circle",
									attr:{"r":5,fill:"black","class":"svgcircle"},
									text:null,
									event:{
										action:null,
										func:null,
										param:null
									},
									event1:{
										action:null,
										func:null,
										param:null
									},
									event2:{
										action:null,
										func:null,
										param:null
									}
								}
							}
						}
					};
				}
				nodes.push(newNode);
				graphData.data.dict.node[nodeId] = {
					"object":nodes[nodes.length-1],
					"connections":{}
				};

			}
		},
		Change:function(nodeId,param){

			//if the node a center of the cluster,the cluster are removed.
			var previousClusterName = graphData.data.dict.node[nodeId].object.nodeContent.parameter.cluster.name;

			var nodeObj = graphData.data.dict.node[nodeId].object;

			//change node properties --> special D3 propierties
			ChangeManyData(param.prop,function(){
				ChangeData(param.prop.fixed,nodeObj,"fixed");
				ChangeData(param.prop.px,nodeObj,"px");
				ChangeData(param.prop.py,nodeObj,"py");
			});

			//change the other node data
			delete param.prop;
			AssignParameter(param,nodeObj.nodeContent.parameter);


			//if the node a center of the cluster,the cluster are removed.
			var postClusterName = graphData.data.dict.node[nodeId].object.nodeContent.parameter.cluster.name;

			if(previousClusterName != postClusterName && graphData.data.clusters.hasOwnProperty(previousClusterName)){
				if(graphData.data.clusters[previousClusterName].elementId == nodeId){
					delete graphData.data.clusters[previousClusterName];
				}
			}
		},
		Delete:function(nodeId){
			//delete node
			//search in array node-list and delete is.
			//And filter in link list and delete it: ok.
			//delete dictionary element# key: elementId; from node and links.
			nodes.splice(getArrayElementById(nodes,nodeId,"elementId").index, 1);
			spliceLinksForNode(nodeId,function(currentLink){
				var currentLink = graphData.data.dict.link[currentLink.elementId];
				delete graphData.data.dict.node[currentLink.source.elementId].connections[currentLink.elementId];
				delete graphData.data.dict.node[currentLink.target.elementId].connections[currentLink.elementId];
				delete graphData.data.dict.link[currentLink.elementId];

			},links);

			//if the node a center of the cluster,the cluster are removed.
			var clusterName = graphData.data.dict.node[nodeId].object.nodeContent.parameter.cluster.name;

			if(graphData.data.clusters.hasOwnProperty(clusterName)){
				if(graphData.data.clusters[clusterName].elementId == nodeId){
					delete graphData.data.clusters[clusterName];
				}
			}

			delete graphData.data.dict.node[nodeId];
		},

		ChangeSubElement:{
			Delete:function(nodeId,deleteSubNodeId){

				var currentElement = graphData.data.dict.node[nodeId].object.nodeContent;
				currentElement.subElementsList.splice(currentElement.subElementsList.indexOf(deleteSubNodeId),1);
				delete currentElement.subElements[deleteSubNodeId];

			},
			Add:function(nodeId,newSubNodeId,svgSubElement){

				var currentElement = graphData.data.dict.node[nodeId].object.nodeContent;
				currentElement.subElementsList.push(newSubNodeId);

				//default sub node
				currentElement.subElements[newSubNodeId] ={
					element:svgSubElement,
					attr:{},
					text:null,
					event:{
						action:null,
						func:null,
						param:null
					},
					event1:{
						action:null,
						func:null,
						param:null
					},
					event2:{
						action:null,
						func:null,
						param:null
					}
				};
			},

			Change:function(nodeId,subNodeId,param){
				AssignParameter(param,graphData.data.dict.node[nodeId].object.nodeContent.subElements[subNodeId]);
			}

		}

	};

return oC;};


//cluster -----------------------------------------------------------------------------------------------------------------------------
var ClusterClass = function(core){
	var graphData = core.graphData;

	var oC ={
		ToCluster:function(clusterName,nodeName){
			if(clusterName == graphData.data.dict.node[nodeName].object.nodeContent.parameter.cluster.name){
				graphData.data.clusters[clusterName] = graphData.data.dict.node[nodeName].object;
			}

		},

		AwayCluster:function(clusterName){
			delete graphData.data.clusters[clusterName];
		}
	};

return oC;};


