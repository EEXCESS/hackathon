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
			var node = {};node.attributes={};
			node.attributes.circleOrPoly = "circle";
			node.attributes.polypoints = "-5,-5 -5,5 5,5 5,-5";
			node.attributes.name = name;
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
	
	this.setNodeProperties = function(name,properties){
		var index = this.getNodeIndex(name);
		for(element in properties){
			this.show.nodes[index]["attributes"][element] = properties[element];
		}
	}
	
	this.deleteNodeProperties= function(name,keyArray){
		var index = this.getNodeIndex(name);
		var currentArrayElement;
		for(element in keyArray){
			currentArrayElement = keyArray[element];
			delete this.show.nodes[index]["attributes"][currentArrayElement];
		}
	}
	
	this.deleteNode = function(name){
		var index = this.getNodeIndex(name);
		this.show.nodes.splice(index, 1);
		
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
		
		//delete node and links
		var nodeElement = this.show.nodeDict[name];
		
		var linkElement;
		var currentNodeName;
		for(var linkName in nodeElement.links){
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
		}
		// delete selected node.
		delete this.show.nodeDict[name];
	}
	
	
	

	this.addLink = function(linkName,sourceNode,targetNode,obj){
		if(this.show.linkDict.hasOwnProperty(linkName) == false &&
			this.show.nodeDict.hasOwnProperty(sourceNode) == true &&
			this.show.nodeDict.hasOwnProperty(targetNode) == true){
		
			var link = {};
			var sn = this.show.nodes[this.getNodeIndex(sourceNode)];
			var tn = this.show.nodes[this.getNodeIndex(targetNode)];

			
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
			
			if(obj != undefined){
				link = obj;
				link.source = sn;
				link.target = tn;
			}
			this.show.links.push(link);

			
			this.show.force.linkDistance(function(d) { 
				return d.distance;
			});
			
			this.show.force.linkStrength(function(d) { 
				return d.strength;
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
	
	this.setLinkProperties = function(name,properties){
		var index = this.getLinkIndex(name);
		for(element in properties){
			this.show.links[index][element] = properties[element];
		}
	}
	
	this.deleteLinkProperties= function(name,keyArray){
		var index = this.getLinkIndex(name);
		var currentArrayElement;
		for(element in keyArray){
			currentArrayElement = keyArray[element];
			delete this.show.links[index][currentArrayElement];
		}
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