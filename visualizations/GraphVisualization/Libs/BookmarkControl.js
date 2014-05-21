
function AddBookMark(nodeId,idInClass,color,width,x,y){
    var bookmarkmCount = $("#"+nodeId+" div[class^='bookmark']");
    
    //console.log(rectCount.length);
    
    $("#node").append(
        '<div '
       +'style="position:fixed;left:'+(x+bookmarkmCount.length*width)+'px;top:'+y+'px;'
       +'width:'+width+'px;height:'+width+'px;background:'+color+';"'
       +' class="'+idInClass+'"></div>');
}

function DeleteBookMark(nodeId,idInClass,width){
    var currentObj = $("#"+nodeId+" ."+idInClass);

    //var postion = (parseInt(cxAttr.slice(0,-2))-x)/width+1;
    var position = parseInt(currentObj.css("left").slice(0,-2));
    
    //console.log("#"+position);
    
    $("#"+nodeId+" ."+idInClass).remove();
    var currentElement = null;
    $("#"+nodeId+" div[class^='bookmark']").each(function(index,element){
        currentElement = parseInt($(element).css("left").slice(0,-2));
        if(currentElement > position){
            //console.log(currentElement);
            $(element).css("left",currentElement-width);
        }
        
    });
    
}

/*
AddBookMark("node","bookmark-23","blue",12,20,20);
AddBookMark("node","bookmark-43","yellow",12,20,20);
AddBookMark("node","bookmark-13","red",12,20,20);
AddBookMark("node","bookmark-45545","green",12,20,20);
AddBookMark("node","bookmark-werr","orange",12,20,20);

DeleteBookMark("node","bookmark-43",12);
DeleteBookMark("node","bookmark-45545",12);
*/













//tests
//var testIds = ["id322","id3522","id56","id45666","id445"];


//bookmark control

//deselect
/*
$("#bookmark-header").click(function(){
    $(".bookmark").css("background","");
    
});
*/

var currentSelectedBookmark = null;


//work with bookmark
$("#workbookmark").click(function(event){
    
    if($("#workbookmark").text() == "explore"){
        //work modus
        $("#workbookmark").text("work");

        $(".editbookmarkname,.editcolor").prop("disabled",true);
		
		drawGraphObj.ResultNodeEvent = function(resultNodeName){
			forceGraph.To.Object().To.Node().To.SubElement()
				.Change(resultNodeName,"svgcircle",{attr:{stroke:"red","stroke-width":3}});
		
		};
		ChangeResultNodes({attr:{stroke:"red","stroke-width":3}});
		forceGraph.To.Object().To.Graph().ReDraw();	
		
		/*
        testIds.forEach(function(elementId){
            $("#"+elementId).attr({"stroke-width":2,"stroke":"blue"})
                .on("click",function(){
                    if(currentSelectedBookmark == null){
                        console.log("no bookmark selected");
                    }else{
                        var bookmarkElement = $("#"+currentSelectedBookmark+" .bookmark-element-"+elementId);
                        
                        if(bookmarkElement.length == 0){
                            //add bookmark element
                            $("#"+currentSelectedBookmark+" .bookmarkelement")
                                .append('<div class="bookmark-element-'+elementId+'">'+elementId+'</div>');
                            
                        }else{
                            //delete bookmark element
                            $("#"+currentSelectedBookmark+" .bookmark-element-"+elementId).remove();
                        }
                    }
                });
        });
		*/
		
    }else if($("#workbookmark").text() == "work"){
        //explore modus
        $("#workbookmark").text("explore");
        $(".editbookmarkname,.editcolor").prop("disabled",false);
		drawGraphObj.ResultNodeEvent = function(resultNodeName){
			forceGraph.To.Object().To.Node().To.SubElement()
				.Change(resultNodeName,"svgcircle",{attr:{stroke:"","stroke-width":""}});
		
		};
		ChangeResultNodes({attr:{stroke:"","stroke-width":""}});
		forceGraph.To.Object().To.Graph().ReDraw();	
		
        /*
        testIds.forEach(function(elementId){
            $("#"+elementId).attr({"stroke-width":"","stroke":""})
                .off("click");
        });
        */
    }
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
                    +'<button class="editbookmarkname">edit</button>'
                    +'<input class="editcolor" type="color" value="'+$("#newcolor").val()+'"></input>'
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
    var EditBookmarlColor = function(event){
        //change the color nodes
        //todo...
        
        /*
        $("#"+bookmarkname+" .showable").css(
            "background",$("#"+bookmarkname+" .editcolor").val()
        );
        */
    };
    $("#"+bookmarkname+" .editcolor").on("change",{bookmarkname:bookmarkname},EditBookmarlColor);
    
    
    //delete bookmark
    var DeleteBookmark = function(event){
        if (confirm("You want delete this bookmark?") == true) {
            $("#"+event.data.bookmarkname).remove();
            currentSelectedBookmark = null;
            //delete bookmarks from nodes
            //todo...
            
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
                $("#"+event.data.bookmarkname+" .editcolor").off("change");
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
                $("#"+newBookmarkName+" .editcolor")
                    .on("change",{bookmarkname:newBookmarkName},EditBookmarlColor);
                $("#"+newBookmarkName+" .expanderbookmark")
                    .on("click",{bookmarkname:newBookmarkName},ExpandBookmarkElement);
                currentSelectedBookmark = newBookmarkName;
                
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
    
});




//delete content from the message text

$("#newbookmarkname,#newcolor,#message")
    .on("focus click",function(){
    $("#message").text("");
});