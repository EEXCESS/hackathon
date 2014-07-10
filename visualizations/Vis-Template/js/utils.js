
/**
 * parsing functions
 * 
 * */	
	
function parseDate( dateString ){

    if(dateString instanceof Date)
        return dateString;

	yearFormat = d3.time.format("%Y");
	var date = yearFormat.parse(dateString);
	
	if(date != null) return date;
	
	dateFormat = d3.time.format("%Y-%m");
	date = dateFormat.parse(dateString);
	
	if(date != null) return date;
	
	if( dateString.length == 8 )
		date = yearFormat.parse( dateString.substring(0, 4) );
	
	if(date != null) return date;
	
	if(dateString.contains("c "))
		date = yearFormat.parse( dateString.substring(2, 6) );
	
	if(date != null) return date;	
	return yearFormat.parse('2014');
}
	
	
	
function toYear(date){
		
	formatYear = d3.time.format("%Y");				
	var year = formatYear(date);
	//if(year != null)
		return year;
	//return "0";
}
	
	
	
/////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Array prototype
 * 
 * */	
	

Array.prototype.getIndexOf = function(target, field) {

	var array = this;
		
	for(var i = 0; i < array.length; i++) {
		if(array[i][field] === target)
			return i;
	}
	return -1;		
};



Array.prototype.swap = function(a, b){
	var tmp = this[a];
	this[a] = this[b];
	this[b] = tmp;
};
	
	
Array.prototype.equals = function( array2 ){
	
	if( typeof array2 === 'undefined' || array2 === 'undefined' || array2.length === 0 )
		return false;		
		
	var array1 = this;
		
	for(var i = 0; i < array1.length; i++){
		var j = 0;
		while( array1[i]['originalIndex'] !== array2[j]['originalIndex'] )
			j++;
		
		if( array1[i]['rankingPos'] !== array2[j]['rankingPos'] )
			return false;
	}
	return true;	
}


	
/////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * String prototype
 * 
 * */	
		
String.prototype.contains = function(it) { 
	return this.indexOf(it) != -1; 
};
	
	
	
/////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * jQuery functions (for DOM elements)
 * 
 * */	
	

$.fn.outerHTML = function() {
    return $(this).clone().wrap('<div></div>').parent().html();
 };




$.fn.scrollTo = function( target, options, callback ){

	if(typeof options == 'function' && arguments.length == 2){ 
		callback = options; 
		options = target; 
	}
	  
	var settings = 
		$.extend({
			scrollTarget  : target,
			offsetTop     : 50,
			duration      : 500,
			easing        : 'swing'
		}, options);
	  
	return this.each(function(){
		var scrollPane = $(this);
		
		var scrollTarget;
		if( typeof settings.scrollTarget == "number" ){
			scrollTarget = settings.scrollTarget;
		}
		else{ 
			if( settings.scrollTarget == "top" ){
				scrollTarget = 0;
			}
			else{
				scrollTarget = $(settings.scrollTarget);
			}
		}
			
		//var scrollTarget = (typeof settings.scrollTarget == "number") ? settings.scrollTarget : $(settings.scrollTarget);
		var scrollY = (typeof scrollTarget == "number") ? scrollTarget : scrollTarget.offset().top + scrollPane.scrollTop() - parseInt(settings.offsetTop);
			
		scrollPane.animate({scrollTop : scrollY }, parseInt(settings.duration), settings.easing, function(){
			if (typeof callback == 'function') { callback.call(this); }
		});
	});
};



/////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Dropdown list
 *
 * */


$.fn.dropdown = function( options ){

    var data = options['data'];
    var onChangeCallback = options['change'];

    var dropdownList = d3.select(this[0])
        .attr("class", "wrapper-dropdown");

    dropdownList.append("div")
        .attr("class", "eexcess-bookmark-dropdown-list-icon")
        .style("margin-top", "0.11em");

    dropdownList.append("span")
        .style("margin-left", "0em")
        .text(data[0].name);

    var dropdownListUl = dropdownList.append("ul")
        .attr("class", "dropdown");

    dropdownListUl.selectAll("li")
        .data( data )
        .enter()
        .append("li")
            .attr("data-item", function(d, i){ return i; })
            .on("click", function(d, i){
                dropdownList.select("div").style("background", d.color || "inherit");
                dropdownList.select("span").text( d.name );
                $(this).removeClass("active");
                onChangeCallback(d.name, i);              // EVTHANDLER.selectBookmarkChanged
            })
            .append("a")
                .attr("href", "#")
                .text(function(d){ return d.name; })
                .append("div")
                    .attr("class", "eexcess-bookmark-dropdown-list-icon")
                    .style("background-color", function(d){ return d.color || "inherit"; });


    this.on('click', function(event){
		  $(this).toggleClass('active');
		  event.stopPropagation();
    });

};


























