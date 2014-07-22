/////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Dropdown list
 *
 * */


$.fn.dropdown = function( options ){

    //var data = options['data'];
    var onChangeCallback = options['change'];
    var duration = options['duration'] || 400;
    var easing = options['easing'] || 'swing';
    var slideOptions = { 'duration': duration, 'easing': easing };

    var dataArray = [];
    var liElementsArray = $(this).find('li').each(function(i, li){
        var obj = {};
        obj['item'] = $(li).find('a').text();
        obj['color'] = $(li).find('div').text();
        dataArray.push(obj);
    });


    $(this).empty();
    $(this).addClass("wrapper-dropdown");

    var dropdownList = d3.select(this[0]);

    dropdownList.append("div")
        .attr("class", "dropdown-list-icon")
        .style("margin-top", "0.11em");

    dropdownList.append("span")
        .style("margin-left", "0em")
        .text(dataArray[0].item);


    var dropdownListUl = dropdownList.append("ul")
        .attr("class", "dropdown")
        .style('display', 'none');

    var liElements = dropdownListUl.selectAll("li")
        .data( dataArray )
        .enter()
        .append("li")
            .attr("data-item", function(d, i){ return i; });


    liElements.append("a")
        .attr("href", "#")
            .text(function(d){ return d.item; })
            .append("div")
                .attr("class", "dropdown-list-icon")
                .style("background-color", function(d){ return d.color || "inherit"; });

    // Events
    if(onChangeCallback != 'undefined'){

        liElements.on("click", function(d, i){
            dropdownList.select(".dropdown-list-icon").style("background", d.color || "inherit");
            dropdownList.select("span").text( d.item );

            $(this).find('.dropdown').slideUp(slideOptions);
            $(this).removeClass("active");

            onChangeCallback(d.item, i);              // EVTHANDLER.selectBookmarkChanged
        });
    }


    this.on('click', function(event){
        $(this).toggleClass('active');
        $(this).find('.dropdown').slideToggle(slideOptions);
		event.stopPropagation();
    });


};




/////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Accordion with drop-down lists
 *
 * */


$.fn.accordionCustom = function( options ) {

    var collapsible = options['collapsible'] || false;
    var duration = options['duration'] || 400;
    var easing = options['easing'] || 'swing';
    var slideOptions = { 'duration': duration, 'easing': easing };

    var dataArray = [];

    $(this).children('div').each(function(i, item){
        $(item).attr('id', 'accordion-item-' + i);

        var dataObj = {};
        dataObj['title'] = $(item).find('h3').text();
        dataObj['color'] = $(item).find('div').text();
        dataObj['content'] = $(item).find('p').text();

        dataArray.push(dataObj);

        $(item).empty();
    });


    dataArray.forEach(function(d, i){

        $('#accordion-item-' + i).addClass('accordion-item');
        var accordionItem = d3.select('#accordion-item-' + i);

        var header = accordionItem.append('div')
            .attr('class', 'accordion-header')

        header.append("div")
            .attr("class", "accordion-header-color-icon")
            .style('background-color', d.color);

        header.append("span")
            .style("margin-left", "0em")
            .text(d.title);

        accordionItem.append('div')
            .attr('class', 'accordion-content')
            .style('display', 'none')
            .append('p').text(d.content);

        // Colapse & Expand
        header.on('click', function(d){

            if(collapsible){
                itemIdToToggle = $(this.parentNode).attr('id');

                $('.accordion-item').each(function(i, item){
                    if($(item).attr('id') == itemIdToToggle){
                        $(item).find('.accordion-header').toggleClass('active');
                        $(item).find('.accordion-content').slideToggle(slideOptions);
                    }
                    else{
                        $(item).find('.accordion-header').removeClass('active');
                        $(item).find('.accordion-content').slideUp(slideOptions);
                    }
                });
            }
            else{
                $(this.parentNode).find('.accordion-header').toggleClass('active');
                $(this.parentNode).find('.accordion-content').slideToggle(slideOptions);
            }
        });

    });

};



















