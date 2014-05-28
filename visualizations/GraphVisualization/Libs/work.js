
var HelpFunctions = function(){
	var oC = {
		//help functions      /////////////////////////////////////////////////////////////////////////////////////////////////////////

		//not used
		GetEmptyObj:function(obj,returnNull){
			return obj == undefined ? {} : obj;
		},

		ChangeData:function(data,obj,prop){
			data != undefined ? obj[prop] = data : null;
		},

		ChangeManyData:function(data,func){
			data != undefined ? func() : null;
		},

		// assign the old json tree with new json data from new json tree
		AssignParameter:function(sourceObj,targetObj){
			var sourceSubObj;
			var targetSubObj;
			Object.keys(sourceObj).forEach(function(key){
				sourceSubObj = sourceObj[key];
				targetSubObj = targetObj[key];
				
				if(typeof sourceSubObj === "object" && Array.isArray(sourceSubObj) == false && sourceSubObj != null){
					oC.AssignParameter(sourceSubObj,targetSubObj);
				}else{
					targetObj[key] = sourceSubObj;
				}
			
			});    
		},


		getArrayElementById:function(array,id,idName){
			if(idName == undefined){
				idName ="id";
			}
			var result ={};
			array.some(function(element,index){
				if(element[idName] == id){
					result.element = element;
					result.index = index;
					return true;
				}
			});
			return result;
		},

		//delete all links from one node
		spliceLinksForNode:function(nodeId,func,links) {

			var toSplice = links.filter(function(l) {
				//console.log(l);
				//return (l.source.elementId === nodeId) || (l.target.elementId === nodeId);
				if((l.source.elementId === nodeId) || (l.target.elementId === nodeId)){
					func(l);
					return true;
				}
			});
			
			toSplice.map(function(l){
				links.splice(oC.getArrayElementById(links,l.elementId,"elementId").index, 1);
			});
			  
		}


	}; 
return oC;
}




var WorkFunctions = function(core){
	///////////////////////////
	var graphData = core.graphData;
	//////////////////////////
	var nodeWorks = new NodeClass(core);
	var markerWorks = new MarkerClass(core);
	var linkWorks = new LinkClass(core);
	var clusterWorks = new ClusterClass(core);
	
	var helpFunc = new HelpFunctions();
	var AssignParameter = helpFunc.AssignParameter;
	
	
	var oC = {
		DeleteGraph:function(){
			//delete Graph
			//delete node and links
			Object.keys(graphData.data.dict.node).forEach(function(key){
				nodeWorks.Delete(key);	
			});
			
			//delete markers
			Object.keys(graphData.data.dict.marker).forEach(function(key){
				markerWorks.Delete(key);	
			});

			//delete clusters
			Object.keys(graphData.data.clusters).forEach(function(key){
				clusterWorks.AwayCluster(key);	
			});
			
			// set default value
			graphData = core.SetDefaultValues();
		},


		ImportData:function(data){
			

			//import nodes
			Object.keys(data.dict.node).forEach(function(key){ 
				nodeWorks.Add(key,data.dict.node[key]);
			});
			
			//import links
			var currentLink = null;
			Object.keys(data.dict.link).forEach(function(key){ 
				currentLink = data.dict.link[key];
				linkWorks.Add(currentLink.source.elementId,currentLink.target.elementId,key,currentLink);

			});
			
			//import markers
			Object.keys(data.dict.marker).forEach(function(key){ 
				markerWorks.Add(key,data.dict.marker[key]);
			});
			
			//import clusters
			Object.keys(data.clusters).forEach(function(key){ 
				clusterWorks.ToCluster(key,data.clusters[key].elementId);
			});
	
			//import function data
			graphData.data.funcDict = data.funcDict;
			
		},

		//set and Import data -----------------------------------------------------------------------------------------

		SetOptions:function(options){
			AssignParameter(options,graphData.options);
		},
		SetScaleTrans:function(scaleTrans){
			AssignParameter(scaleTrans,graphData.vis);
		},
		Redraw:function(){
			core.redraw();
		},
		Reoption:function(){
			core.reoption();
		},	
		Rescale:function(){
			core.rescale();
		}
	}; 
return oC;
}

/*





/*
function mousedown() {
  if (!mousedown_node && !mousedown_link) {
    // allow panning if nothing is selected
    vis.call(d3.behavior.zoom().on("zoom"), rescale);
    return;
  }
}
*/





