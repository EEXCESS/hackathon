/*
fun();
function fun(){
	//alert("test");
	//var data = 
}
*/

	$(function(){

				var funcs = {
					f1:function(d) {
						alert("X");
					},	
					f2:function(d) {
						alert(JSON.stringify(d));
					},	
					f3:function(d) {
						alert("!");
					},
					f4:function(d){}
				};		
					
					
					
				var g = new ActionGraph();
				g.build.show.functionValues = funcs;
				g.build.show.storeId = "data";
				g.build.show.setStore = true;

				if(typeof(Storage)!=="undefined"){
					if (sessionStorage.getItem("data")){
					}
					else{
						sessionStorage.setItem("data",JSON.stringify(g.build.show.serialize));
					}
				}
				else{
				  ///no Storage
				}


				  
				var jsonObj = JSON.parse(sessionStorage.getItem("data"));

				g.build.addNodes(jsonObj.nodeDict);
				g.build.addLinks(jsonObj.linkDict);


				g.changeOption(jsonObj.option);


				g.build.show.setStore = false;
				g.build.show.restart();

				g.build.show.setStore = true;
				
				
				
				
	
chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            if (request.method === 'newSearchTriggered') {
                console.log(request.data);
							

			
				
				
	

					
					
					//build search graph
					var objTest = {};
					if(typeof(Storage)!=="undefined"){
						if (sessionStorage.getItem("dataTest")){
						}
						else{
							sessionStorage.setItem("dataTest",JSON.stringify(objTest));
						}
					}
					else{
					  ///no Storage
					}
					objTest = JSON.parse(sessionStorage.getItem("dataTest"));
					console.log(objTest);
					
					
					
					if(Object.keys(objTest).length == 0){
						g.build.addNode(request.data.query);
						g.build.setNodeProperties(request.data.query,{"xscale":2,"yscale":2,"text":request.data.query}); 
						objTest["lineCount"] = 0;
					}else{
						g.build.addNode(request.data.query);
						g.build.setNodeProperties(request.data.query,{"xscale":2,"yscale":2,"text":request.data.query}); 
						
						g.build.addLink("line"+objTest["lineCount"],objTest["lastNodeName"],request.data.query);     
						g.build.setLinkProperties("line"+objTest["lineCount"],{"text":"line"+objTest["lineCount"],"color":"#00ffff","width":2});  
						objTest["lineCount"] = objTest["lineCount"]+1;
					}

					
					g.build.show.restart();
					
					objTest["lastNodeName"] = request.data.query;
					

					sessionStorage["dataTest"] = JSON.stringify(objTest);
					
					
					//Senario1 begin
					$("#senario1").click(function(){
						g.build.addNode("n1");
						g.build.setNodeProperties("n1",{"xscale":2,"yscale":2,"text":"n1"}); 
						g.build.addNode("n2");
						g.build.setNodeProperties("n2",{"text":"n2"}); 
						g.build.addNode("n3");
						g.build.setNodeProperties("n3",{"text":"n3","fill":"#ff00ff"}); 
						g.build.addNode("n4");
						g.build.setNodeProperties("n4",{"text":"n4","fill":"#0000ff","xscale":3,"yscale":1}); 
						
						
						g.build.addLink("l1","n1","n2");     
						g.build.setLinkProperties("l1",{"text":"l1","color":"#00ffff","width":2});   
						g.build.addLink("l2","n1","n3");     
						g.build.setLinkProperties("l2",{"text":"l2","width":3}); 
						g.build.addLink("l3","n1","n4");     
						g.build.setLinkProperties("l3",{"text":"l3"}); 
						
						g.build.addLink("l4","n2","n3");     
						g.build.setLinkProperties("l4",{"text":"l4","color":"#00ff00"});   
						g.build.addLink("l5","n2","n4");     
						g.build.setLinkProperties("l5",{"text":"l5","color":"#00ff00","width":3}); 
						
						
						g.build.show.restart();
					});	
					//Senario1 end	
						
			
			
				
            }
        }
);


	});

/*
chrome.runtime.sendMessage(
	chrome.i18n.getMessage('@@extension_id'), 
	{
		method: {
			parent: 'model', 
			func: 'getResults'
		},
	data: null
	}, 
	function(reqResult) {
		//alert("test X");
		console.log(reqResult);
		// do something with 'reqResult'
		
		$(function(){
			var funcs = {
				f1:function(d) {
					alert("X");
				},	
				f2:function(d) {
					alert(JSON.stringify(d));
				},	
				f3:function(d) {
					alert("!");
				},
				f4:function(d){}
			};		
				
				
				
			var g = new ActionGraph();
			g.build.show.functionValues = funcs;
			g.build.show.storeId = "data";
			g.build.show.setStore = true;
			
			if(typeof(Storage)!=="undefined"){
				if (sessionStorage.getItem("data")){
				}
				else{
					sessionStorage.setItem("data",JSON.stringify(g.build.show.serialize));
				}
			}
			else{
			  ///no Storage
			}
			

			  
			var jsonObj = JSON.parse(sessionStorage.getItem("data"));

			g.build.addNodes(jsonObj.nodeDict);
			g.build.addLinks(jsonObj.linkDict);
			
			
			g.changeOption(jsonObj.option);
			
		
			g.build.show.setStore = false;
			g.build.show.restart();

			g.build.show.setStore = true;
			
			//build search graph
			
			if(sessionStorage["lastNode"] == null){
			
			}else{
			
			}
			g.build.addNode("Begin search");
			g.build.setNodeProperties("n1",{"xscale":2,"yscale":2,"text":"n1"}); 
			g.build.addLink("l1","n1","n2");     
			g.build.setLinkProperties("l1",{"text":"l1","color":"#00ffff","width":2});  

			
			
			//Senario1 begin
			$("#senario1").click(function(){
				g.build.addNode("n1");
				g.build.setNodeProperties("n1",{"xscale":2,"yscale":2,"text":"n1"}); 
				g.build.addNode("n2");
				g.build.setNodeProperties("n2",{"text":"n2"}); 
				g.build.addNode("n3");
				g.build.setNodeProperties("n3",{"text":"n3","fill":"#ff00ff"}); 
				g.build.addNode("n4");
				g.build.setNodeProperties("n4",{"text":"n4","fill":"#0000ff","xscale":3,"yscale":1}); 
				
				
				g.build.addLink("l1","n1","n2");     
				g.build.setLinkProperties("l1",{"text":"l1","color":"#00ffff","width":2});   
				g.build.addLink("l2","n1","n3");     
				g.build.setLinkProperties("l2",{"text":"l2","width":3}); 
				g.build.addLink("l3","n1","n4");     
				g.build.setLinkProperties("l3",{"text":"l3"}); 
				
				g.build.addLink("l4","n2","n3");     
				g.build.setLinkProperties("l4",{"text":"l4","color":"#00ff00"});   
				g.build.addLink("l5","n2","n4");     
				g.build.setLinkProperties("l5",{"text":"l5","color":"#00ff00","width":3}); 
				
				
				g.build.show.restart();
			});	
			//Senario1 end	
				
			
		});
		
		
	}
);
*/