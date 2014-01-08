
function ActionGraph(){
	//var self = this;
	this.build = new BuildGraph();
	
	var selfbuild = this.build.show;	
	
	function iteratorDict(data,executeDict){
		for(var key in executeDict){
			if(data.hasOwnProperty(key)){
				executeDict[key]();
			}
		}
	}
	
	this.changeOption =function(jsonData){
		iteratorDict(jsonData,{
			"svg":function(){
				var svgVar = selfbuild.option.svg;
				var jsonSVG = jsonData["svg"];
				iteratorDict(jsonSVG,{
					"width":function(){
						svgVar.width.value = jsonSVG["width"].value;
						selfbuild.svg.attr("width",svgVar.width.value);
						selfbuild.svg.select("rect").attr("width",svgVar.width.value);
					},"height":function(){
						svgVar.height.value = jsonSVG["height"].value;
						selfbuild.svg.attr("width",svgVar.height.value);
						selfbuild.svg.select("rect").attr("height",svgVar.height.value);
					},"HTMLObject":function(){
						svgVar.HTMLObject.value = jsonSVG["HTMLObject"].value;
						selfbuild.svg.select(svgVar.HTMLObject.value);
					}
				});
			},"vis":function(){
				var visVar = selfbuild.option.vis;
				var jsonVis = jsonData["vis"];
				iteratorDict(jsonVis,{
					"width":function(){
						visVar.width.value = jsonVis["width"].value;
						selfbuild.vis.select("rect").attr("width",visVar.width.value);
					},"height":function(){
						visVar.height.value = jsonVis["height"].value;
						selfbuild.vis.select("rect").attr("height",visVar.height.value);
					},"trans":function(){
						var jsonTrans = jsonVis["trans"];
						iteratorDict(jsonTrans,{
							"x":function(){
								visVar.trans.x.value = jsonTrans["x"].value;
								transAndScale();
							},"y":function(){
								visVar.trans.y.value = jsonTrans["y"].value;
								transAndScale();
							}
						});
					},"scale":function(){
						visVar.scale.value = jsonVis["scale"].value;
						transAndScale();
					}
				});
			},"force":function(){
				var forceVar = selfbuild.option.force;
				var jsonForce = jsonData["force"];
				iteratorDict(jsonForce,{
					"charge":function(){
						forceVar.charge.value = jsonForce["charge"].value;
						selfbuild.force.charge(forceVar.charge.value);
					},"gravity":function(){
						forceVar.gravity.value = jsonForce["gravity"].value;
						selfbuild.force.gravity(forceVar.gravity.value);
					},"linkDistance":function(){
						forceVar.linkDistance.value = jsonForce["linkDistance"].value;
						selfbuild.force.linkDistance(forceVar.linkDistance.value);
					}
				});
			}
		});
	};
	
	function transAndScale(){
		var visVar = selfbuild.option.vis;
		var ta = [visVar.trans.x.value,visVar.trans.y.value];
		selfbuild.zoom.translate(ta);
		selfbuild.zoom.scale(visVar.scale.value);
		selfbuild.vis.attr("transform","translate(" + ta+ ") scale(" + visVar.scale.value+ ")");
	}


}


			