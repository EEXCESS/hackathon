//bookmark control

//deselect
/*
$("#bookmark-header").click(function(){
    $(".bookmark").css("background","");
    
});
*/

var currentSelectedBookmark = null;
var bookmarkDict = {
	bookmarks:{},
	nodes:{}
};

//work with bookmark
$("#workbookmark").click(function(event){
    
	////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////
	
    if($("#workbookmark").text() == "explore"){
        //work modus
        $("#workbookmark").text("(de)select");

        //$(".editbookmarkname,.editcolor,#newcolor,#addbookmark").prop("disabled",true);
		
		drawGraphObj.ResultNodeEvent = function(resultNodeName){
			forceGraph.To.Object().To.Node().To.SubElement()
				.Change(resultNodeName,"svgcircle",{attr:{stroke:"red","stroke-width":3}});
		
		};
		ChangeResultNodes({attr:{stroke:"red","stroke-width":3}});
		forceGraph.To.Object().To.Graph().ReDraw();	
		
		
    }else if($("#workbookmark").text() == "(de)select"){
        //explore modus
        $("#workbookmark").text("explore");
        //$(".editbookmarkname,.editcolor,#newcolor,#addbookmark").prop("disabled",false);
		drawGraphObj.ResultNodeEvent = function(resultNodeName){
			forceGraph.To.Object().To.Node().To.SubElement()
				.Change(resultNodeName,"svgcircle",{attr:{stroke:"","stroke-width":""}});
		
		};
		ChangeResultNodes({attr:{stroke:"","stroke-width":""}});
		forceGraph.To.Object().To.Graph().ReDraw();	
		
    }
	////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////
	
});





//add new book mark
$("#addbookmark").click(function(){
    
    //has bookmark a name?
    var bookmarkname =  $("#newbookmarkname").val();
    if(bookmarkname == ""){
        $("#message").text("please get a bookmarkname!");
        return;
    }

    //each bookmark is a unique name
    var findsamename = $('#bookmark-body div[id="'+bookmarkname+'"]');
    if(findsamename.length > 0){
        $("#message").text("bookmark exists");
        return;
    }
    
    // add new bookmark
    $("#bookmark-body").append(
        '<div id="'+bookmarkname+'">'
            +'<div class="bookmark">'
                +'<div>'
                    +'<input class="bookmarktext" type="text" readonly value="'+bookmarkname+'"></input>'
                   // +'<button class="editbookmarkname">edit</button>'
                    +'<input class="editcolor" disabled type="color" value="'+$("#newcolor").val()+'"></input>'
                +'</div>'
                +'<div class="workbookmarkshow" >'
                    +'<button class="expanderbookmark">+</button>'        
                    +'<button class="deletebookmark">x</button>'
                +'</div>'
                +'<div class="editbookmarkshow" style="display:none;">'
                    +'<input class="bookmarknewtext" type="text" value="'+bookmarkname+'"></input>'
                    +'<button class="cancelbookmarkname">cancel</button>'
                +'</div>'
            +'</div>'
            +'<div class="bookmarkelement" style="display:none;">'
               // +"No result"
            +'</div>'
        +'</div>'
    );
    
    
    // add events for bookmark
    

    //expand bookmarkelement
    var ExpandBookmarkElement = function(event){
        var bookmarlElement = "#"+event.data.bookmarkname+" .bookmarkelement";
        
        if($(bookmarlElement).css("display") == "none"){
            //expand bookmark
            //if($(bookmarlElement).children().length>0){
            $(bookmarlElement).css("display","");
            $("#"+bookmarkname+" .expanderbookmark").text("-");
            //}else{
            //    console.log("no bookmark element");
            //}
        }else{
            //colapse bookmark
            $("#"+bookmarkname+" .expanderbookmark").text("+");
            $(bookmarlElement).css("display","none");
        }
    };
    $("#"+bookmarkname+" .expanderbookmark").on("click",{bookmarkname:bookmarkname},ExpandBookmarkElement);
    
    
    //edit bookmark color
	/*
    var EditBookmarlColor = function(event){
        //change the color nodes
        //todo...
        //bookmarkDict.bookmarks[event.data.bookmarkname] ={};
		
        
        //$("#"+bookmarkname+" .showable").css(
        //    "background",$("#"+bookmarkname+" .editcolor").val()
        //);
        
    };
    $("#"+bookmarkname+" .editcolor").on("change",{bookmarkname:bookmarkname},EditBookmarlColor);
    */
    
    //delete bookmark
    var DeleteBookmark = function(event){
        if (confirm("You want delete this bookmark?") == true) {
            $("#"+event.data.bookmarkname).remove();
            currentSelectedBookmark = null;
			
            //delete bookmarks from nodes

			//delete nodes from graph
			//var test = forceGraph.Graph.GetGraphData();	
			var resultNodelistObj = bookmarkDict.bookmarks[event.data.bookmarkname];
			Object.keys(resultNodelistObj).forEach(function(resultNodeId){
				var currentBookmarkName = "Bookmark_"+resultNodeId+"_"+event.data.bookmarkname;
				if(forceGraph.Graph.GetGraphData().data.dict.node.hasOwnProperty(currentBookmarkName)){
					forceGraph.To.Object()
						.Node.Delete(currentBookmarkName);
				}
					
			});
			forceGraph.To.Object().To.Graph().ReDraw();
			
			//work with dictionary 
			var deletedNodes = bookmarkDict.bookmarks[event.data.bookmarkname];
			Object.keys(deletedNodes).forEach(function(elementNode){

				if(bookmarkDict.nodes.hasOwnProperty(elementNode)){
					delete bookmarkDict.nodes[elementNode][event.data.bookmarkname];
					if(bookmarkDict.nodes[elementNode].length == 0){
						delete bookmarkDict.nodes[elementNode];
					}
				}
			});

            delete bookmarkDict.bookmarks[event.data.bookmarkname];
			

			
            $("#message").text("bookmark deleted successfully!");
        }else{
            $("#message").text("cancel bookmark deleted!");
        }
    };
    $("#"+bookmarkname+" .deletebookmark").on("click",{bookmarkname:bookmarkname},DeleteBookmark);
    

   
    
    //edit current bookmark
    var EditCurrentBookmark = function(event){

        var $buttonObj = $("#"+event.data.bookmarkname+" .editbookmarkname");
        
        if($buttonObj.text() == "edit"){
            //user can editable bookmark name
            $buttonObj.text("rename");
            $("#"+event.data.bookmarkname+" .editbookmarkshow").css("display","");
            $("#"+event.data.bookmarkname+" .workbookmarkshow").css("display","none");
            
        }else if($buttonObj.text() == "rename"){
            //save edit new bookmark name
            
            
            
            $buttonObj.text("edit");
            $("#"+event.data.bookmarkname+" .editbookmarkshow").css("display","none");
            $("#"+event.data.bookmarkname+" .workbookmarkshow").css("display","");
            
            var newBookmarkName = $("#"+event.data.bookmarkname+" .bookmarknewtext").val();
            
            if(newBookmarkName == ""){
                return;
            }
            
            var findsamename = $('#bookmark-body div[id="' +newBookmarkName +'"]');
            
            //console.log(findsamename.length);
            if(findsamename.length > 0){
                //console.log("xxx");
                //console.log($("#message"));
                //console.log($("#message").length);

                $("#message").text("gg");
            }else{

                //unbind the events
                $("#"+event.data.bookmarkname).off("click");
                $("#"+event.data.bookmarkname+" .editbookmarkname").off("click");
                $("#"+event.data.bookmarkname+" .cancelbookmarkname").off("click");
                $("#"+event.data.bookmarkname+" .deletebookmark").off("click");
                //$("#"+event.data.bookmarkname+" .editcolor").off("change");
                $("#"+event.data.bookmarkname+" .expanderbookmark").off("click");

                
                $("#"+event.data.bookmarkname).attr("id",newBookmarkName);
                $("#"+newBookmarkName+" .bookmarktext").val(newBookmarkName);
                
                //bind the events
                $("#"+newBookmarkName).on("click",{bookmarkname:newBookmarkName},CurrentBookmarkSelected);
                $("#"+newBookmarkName+" .editbookmarkname")
                    .on("click",{bookmarkname:newBookmarkName},EditCurrentBookmark);
                $("#"+newBookmarkName+" .cancelbookmarkname")
                    .on("click",{bookmarkname:newBookmarkName},CancelEditCurrentbookmark);
                $("#"+newBookmarkName+" .deletebookmark")
                    .on("click",{bookmarkname:newBookmarkName},DeleteBookmark);
                //$("#"+newBookmarkName+" .editcolor")
                //    .on("change",{bookmarkname:newBookmarkName},EditBookmarlColor);
                $("#"+newBookmarkName+" .expanderbookmark")
                    .on("click",{bookmarkname:newBookmarkName},ExpandBookmarkElement);
                currentSelectedBookmark = newBookmarkName;
                
				var currentBookmark = bookmarkDict.bookmarks[event.data.bookmarkname];
				delete bookmarkDict.bookmarks[event.data.bookmarkname];
				bookmarkDict.bookmarks[newBookmarkName] ={};
				bookmarkDict.bookmarks[newBookmarkName] = currentBookmark;
				
                //rename(id) bookmarks from nodes
                //todo...
                
            }            
        }
    };
    $("#"+bookmarkname+" .editbookmarkname").on("click",{bookmarkname:bookmarkname},EditCurrentBookmark);

    
    //cancel edit current bookmark
    var CancelEditCurrentbookmark = function(event){
        var $buttonObj = $("#"+event.data.bookmarkname+" .editbookmarkname");
        $buttonObj.text("edit");
        $("#"+event.data.bookmarkname+" .editbookmarkshow").css("display","none");
        $("#"+event.data.bookmarkname+" .workbookmarkshow").css("display","");
    };
    $("#"+bookmarkname+" .cancelbookmarkname").on("click",{bookmarkname:bookmarkname},CancelEditCurrentbookmark);
    
    
        
    //current bookmark selected
    var CurrentBookmarkSelected = function(event){
        currentSelectedBookmark = event.data.bookmarkname;
        //console.log(currentSelectedBookmark);
        $(".bookmark").css("background","");
        $("#"+event.data.bookmarkname + " .bookmark").css("background","yellow");
        
        $("#message").text(event.data.bookmarkname+ " selected");
        
    };
    $("#"+bookmarkname).on("click",{bookmarkname:bookmarkname},CurrentBookmarkSelected);
    
    
    $("#newbookmarkname").val("");
    $("#message").text("success");
    
	bookmarkDict.bookmarks[bookmarkname] ={};
	
});




//delete content from the message text

$("#newbookmarkname,#newcolor,#message")
    .on("focus click",function(){
    $("#message").text("");
});