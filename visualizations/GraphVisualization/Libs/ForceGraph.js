
var FGraph = function(){
	var core = null;
	
	var nodeWorks = null;
	var linkWorks = null;
	var markerWorks = null;
	var clusterWorks = null;
	var workFunc = null;		
		
	var graphData = null;
	
	var currentObjectContent = null;
	
	
	
	var ToObject = function(){currentObjectContent = oC;return currentObjectContent;};	
	
	var ToNode = function(){currentObjectContent = oC.Node;return currentObjectContent;};
	var ToLink = function(){currentObjectContent = oC.Link;return currentObjectContent;};
	var ToMarker = function(){currentObjectContent = oC.Marker;return currentObjectContent;};
	var ToGraph = function(){currentObjectContent = oC.Graph;return currentObjectContent;};

	var ToNodeSubElement = function(){currentObjectContent = oC.Node.ChangeSubElement;return currentObjectContent;};
	var ToNodeCluster = function(){currentObjectContent = oC.Node.Cluster;return currentObjectContent;};
	var ToLinkSubElement = function(){currentObjectContent = oC.Link.ChangeSubElement;return currentObjectContent;};
	var ToMarkerSubElement = function(){currentObjectContent = oC.Marker.ChangeSubElement;return currentObjectContent;};	
		
	var oC = {
		//Init graph
		InitGraph:function(chartIdParam){
			core =new Core();
			core.InitCore(chartIdParam);
			//graphData = core.graphData;
			
			nodeWorks = new NodeClass(core);
			linkWorks = new LinkClass(core);
			markerWorks = new MarkerClass(core);
			clusterWorks = new ClusterClass(core);
			workFunc = new WorkFunctions(core);

			currentObjectContent = oC;
		},

		Test1:function(){
			return currentObjectContent;
		},
		
		
		To:{
			Object:ToObject,
			Node:ToNode,Link:ToLink,
			Graph:ToGraph,Marker:ToMarker
		},
		
		Node:{
			To:{
				SubElement:ToNodeSubElement,Object:ToObject,Cluster:ToNodeCluster
			},
			
			Add:function(nodeId,nodeObj){
				nodeWorks.Add(nodeId,nodeObj);return currentObjectContent;
			},	
			Change:function(nodeId,param){
				nodeWorks.Change(nodeId,param);return currentObjectContent;
			},
			Delete:function(nodeId){
				nodeWorks.Delete(nodeId);return currentObjectContent;
			},
			ChangeSubElement:{
				To:{
					Object:ToObject,Node:ToNode
				},
				Delete:function(nodeId,deleteSubNodeId){
					nodeWorks.ChangeSubElement.Delete(nodeId,deleteSubNodeId);return currentObjectContent;
				},
				Add:function(nodeId,newSubNodeId,svgSubElement){
					nodeWorks.ChangeSubElement.Add(nodeId,newSubNodeId,svgSubElement);return currentObjectContent;
				},
				Change:function(nodeId,subNodeId,param){
					nodeWorks.ChangeSubElement.Change(nodeId,subNodeId,param);return currentObjectContent;
				}				
			},
			Cluster:{
				To:{
					Object:ToObject,Node:ToNode
				},
				Add:function(clusterName,nodeName){
					clusterWorks.ToCluster(clusterName,nodeName);return currentObjectContent;
				},
				Delete:function(clusterName){
					clusterWorks.AwayCluster(clusterName);return currentObjectContent;
				},
			}
		},
		Link:{
			To:{
				SubElement:ToLinkSubElement,Object:ToObject
			},
			Add:function(sourceNodeId,targetNodeId,linkId,linkObj){
				linkWorks.Add(sourceNodeId,targetNodeId,linkId,linkObj);return currentObjectContent;
			},	
			Change:function(linkId,param){
				linkWorks.Change(linkId,param);return currentObjectContent;
			},
			Delete:function(linkId){
				linkWorks.Delete(linkId);return currentObjectContent;
			},
			ChangeSubElement:{
				To:{
					Object:ToObject,Link:ToLink//,Node:ToNode
				},
				Delete:function(linkId,deleteSubLinkId){
					linkWorks.ChangeSubElement.Delete(linkId,deleteSubLinkId);return currentObjectContent;
				},
				Add:function(linkId,newSubLinkId,svgSubElement){
					linkWorks.ChangeSubElement.Add(linkId,newSubLinkId,svgSubElement);return currentObjectContent;
				},
				Change:function(linkId,subLinkId,param){
					linkWorks.ChangeSubElement.Change(linkId,subLinkId,param);return currentObjectContent;
				}				
			}
		},
		Marker:{
			To:{
				SubElement:ToMarkerSubElement,Object:ToObject
			},
			Add:function(markerId,markerObj){
				markerWorks.Add(markerId,markerObj);return currentObjectContent;
			},	
			Change:function(markerId,param){
				markerWorks.Change(markerId,param);return currentObjectContent;
			},
			Delete:function(markerId){
				markerWorks.Delete(markerId);return currentObjectContent;
			},
			ChangeSubElement:{
				To:{
					Object:ToObject,Marker:ToMarker
				},
				Delete:function(markerId,newSubMarkerId){
					markerWorks.ChangeSubElement.Delete(markerId,newSubMarkerId);return currentObjectContent;
				},
				Add:function(markerId,newSubMarkerId,svgSubElement){
					markerWorks.ChangeSubElement.Add(markerId,newSubMarkerId,svgSubElement);return currentObjectContent;
				},
				Change:function(markerId,newSubMarkerId,param){
					markerWorks.ChangeSubElement.Change(markerId,newSubMarkerId,param);return currentObjectContent;
				}				
			}
		},
		
		Graph:{
			To:{
				Object:ToObject
			},
			Delete:function(){
				workFunc.DeleteGraph();return currentObjectContent;
			},
			Import:function(data){
				workFunc.ImportData(data);return currentObjectContent;
			},
			SetOptions:function(options){
				workFunc.SetOptions(options);return currentObjectContent;
			},
			SetScaleTrans:function(scaleTrans){
				workFunc.SetScaleTrans(scaleTrans);return currentObjectContent;
			},
			ReDraw:function(){
				workFunc.Redraw();return currentObjectContent;
			},
			ReOption:function(){
				workFunc.Reoption();return currentObjectContent;
			},	
			ReScale:function(){
				workFunc.Rescale();return currentObjectContent;
			},
			GetGraphData:function(){
				return core.graphData;
			}
		}
		
		
	}
return oC;};
