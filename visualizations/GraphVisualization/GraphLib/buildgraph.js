function BuildGraph(){

	this.show = new ShowGraph();
	var self = this;
	
	this.addNeigborNodes = function(sourceNode,nodeLinkNameArray){
		nodeLinkNameArray.forEach(function(d){
			self.addNodeWithLink(sourceNode,d.nodename,d.linkname)
		});
	}
	
	this.addNodeWithLink = function(sourceNode,targetNode,linkName){
		this.addNode(targetNode);
		this.addLink(linkName,sourceNode,targetNode);
	}
	

	this.addNode = function(name,obj){	
		if(this.show.nodeDict.hasOwnProperty(name) == false){
			var node = {};
			node.attributes={
				"nodeGraph":{},
				"nodeText":{},
				"nodeEvents":{},
				"nodeD3":{}
			};
			
			node.attributes.nodeD3.circleOrPoly = "circle";
			node.attributes.nodeD3.polypoints = "-5,-5 -5,5 5,5 5,-5";
			node.attributes.nodeD3.name = name;
			
			if(obj != undefined){
				node = obj;
			}
			this.show.nodes.push(node);
			var nodeElement = {
				"obj":node,
				"links":{}
			};
			this.show.nodeDict[name] = nodeElement;
		}
	}
	
	this.addNodes = function(nodeDictionary){
		for(var element in nodeDictionary){
			this.addNode(element,nodeDictionary[element].obj);
		}
	}
	
	this.getNodeIndex = function(name){
		return this.show.nodes.indexOf(this.show.nodeDict[name].obj);
	}
	
	this.getNodeProperties = function(name){
		return this.show.nodes[this.getNodeIndex(name)]["attributes"];
	}
	
	this.setNodeProperties = function(name,partitions){
		var index = this.getNodeIndex(name);

		Object.keys(partitions).forEach(function(part){
			Object.keys(partitions[part]).forEach(function(attribute){
				self.show.nodes[index]["attributes"][part][attribute] = partitions[part][attribute];
			});
		});
	}
	
	this.deleteNodeProperties = function(name,partitions){
		var index = this.getNodeIndex(name);
		Object.keys(partitions).forEach(function(part){
			Object.keys(partitions[part]).forEach(function(keyArray){
				delete self.show.nodes[index]["attributes"][part][partitions[part][keyArray]];
			});
		});
	}
	
	//this method is buggy, if you want delete many nodes, store the added node in a row
	// reverted the row and delete the nodes.
	//bug fix, i hope
	this.deleteNode = function(name){
		var index = this.getNodeIndex(name);
		this.show.nodes.splice(index, 1);
		
/*
		//delete links
		var toSplice;
		toSplice = this.show.links.filter(							
			function(l) { 
				return (l.source.index == index) || (l.target.index == index); 
			});
		var currentObject = this.show;	
		toSplice.map(function(l) {
				//this.links.splice(links.indexOf(l), 1); 
				currentObject.links.splice(currentObject.links.indexOf(l), 1); 
		});
		*/
		
		//delete node and links
		var nodeElement = this.show.nodeDict[name];
		
		var linkElement;
		var currentNodeName;
		for(var linkName in nodeElement.links){
			this.deleteLink(linkName);
			/*
			linkElement = this.show.linkDict[linkName];
			if(linkElement.sourcenode != name){
				currentNodeName = linkElement.sourcenode;
			}
			if(linkElement.targetnode != name){
				currentNodeName = linkElement.targetnode;
			}
			//delete the linksname from the neighbornodes
			delete this.show.nodeDict[currentNodeName].links[linkName];
			
			//delete Links
			delete this.show.linkDict[linkName];
			*/
		}

		// delete selected node.
		delete this.show.nodeDict[name];
	}
	


	this.addLink = function(linkName,sourceNode,targetNode,obj){
		if(this.show.linkDict.hasOwnProperty(linkName) == false &&
			this.show.nodeDict.hasOwnProperty(sourceNode) == true &&
			this.show.nodeDict.hasOwnProperty(targetNode) == true){
			
			var sn = this.show.nodes[this.getNodeIndex(sourceNode)];
			var tn = this.show.nodes[this.getNodeIndex(targetNode)];
			
			var link = {};
			link.attributes = {
				"linkGraph":{},
				"linkText":{},
				"linkEvents":{},
				"linkD3":{}
			};
			
			
			link.attributes.linkD3.name = linkName;
			link.source = sn;
			link.target = tn;
			link.attributes.linkD3.distance = this.show.option.force.linkDistance.value;
			link.attributes.linkD3.strength = this.show.option.force.linkStrength.value;
			link.attributes.linkGraph["stroke-width"] = 1; 
			link.attributes.linkGraph["stroke"] = "#000000";
			
			/*
			///////////////////
			if(link.distance == undefined || link.width == undefined || 
				link.color == undefined || link.strength == undefined){
				link.source = sn; link.target = tn;
				link.distance = this.show.option.force.linkDistance.value;
				link.strength = this.show.option.force.linkStrength.value;
				
				link.width = 1; link.color = "#000000";
			}else{////???
				link.source = sn;
				link.target = tn;
			}
			*/
			if(obj != undefined){
				link = obj;
				link.source = sn;
				link.target = tn;
			}
			this.show.links.push(link);

			
			this.show.force.linkDistance(function(d) { 
				return d.attributes.linkD3.distance;
			});
			
			this.show.force.linkStrength(function(d) { 
				return d.attributes.linkD3.strength;
			});
			
	
			var linkElement = {
				"obj":link,
				"sourcenode":sourceNode,
				"targetnode":targetNode
			};
			
			this.show.linkDict[linkName] = linkElement;
			// sn = sourcenode, tn targetnode
			this.show.nodeDict[sourceNode].links[linkName] = "sn";
			this.show.nodeDict[targetNode].links[linkName] = "tn";
		}
	};
	
	this.addLinks = function(linkDictionary){
		var currentObj;
		for(var element in linkDictionary){
			currentObj = linkDictionary[element];
			this.addLink(element,currentObj.sourcenode,currentObj.targetnode,linkDictionary[element].obj);
			
		}
	}
	
	this.getLinkIndex = function(name){
		return this.show.links.indexOf(this.show.linkDict[name].obj);
	}
	
	this.setLinkProperties = function(name,partitions){
		var index = this.getLinkIndex(name);

		Object.keys(partitions).forEach(function(part){
			Object.keys(partitions[part]).forEach(function(attribute){
				self.show.links[index]["attributes"][part][attribute] = partitions[part][attribute];
			});
		});
	}
	
	this.deleteLinkProperties = function(name,partitions){
		var index = this.getLinkIndex(name);
		Object.keys(partitions).forEach(function(part){
			Object.keys(partitions[part]).forEach(function(keyArray){
				delete self.show.links[index]["attributes"][part][partitions[part][keyArray]];
			});
		});
	}

	this.deleteLink = function(name){
		var linkIndex = this.getLinkIndex(name);
		this.show.links.splice(linkIndex,1);
		
		var linkElement = this.show.linkDict[name];
		
		delete this.show.nodeDict[linkElement.sourcenode].links[name]
		delete this.show.nodeDict[linkElement.targetnode].links[name]
		delete this.show.linkDict[name];
	}


	
}