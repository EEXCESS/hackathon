function Visualization( EEXCESSobj ) {

	var self = this;
	var EEXCESS = EEXCESSobj || {};
	
    var width;		// Screen width
    var height;	    // Screen height
    
    // DOM Selectors
    var root = "div#eexcess_canvas";											        // String to select the area where the visualization should be displayed
	var searchField = "#eexcess_search_field";									        // String to select search field in the header
	var btnSearch = "#eexcess_search_button";									        // Selector for search button on left side of the header
	var headerText = "#eexcess_header_text";									        // String to select the text container in the middle of the header
	var btnFilter = "#eexcess_filter_button";
	var btnReset = "#eexcess_btnreset";											        // Selector for reset button in vis control panel
	var chartSelect = "#eexcess_select_chart";									        // select for chart
	var divMapping = "#eexcess_controls_mappings";								        // div that contains selects for mapping combinations
	var divMappingInd = "#eexcess_mapping_container_";							        // id for the above div
	var mappingSelect = ".eexcess_select";										        // To select all visual channels' <select> elements by class
	var contentPanel = "#eexcess_content";										        // Selector for content div on the right side
	var contentList = "#eexcess_content .eexcess_result_list";					        // ul element within div content
	var allListItems = "#eexcess_content .eexcess_result_list .eexcess_list";	        // String to select all li items by class
	var listItem = "#eexcess_content .eexcess_result_list #data-pos-";			        // String to select individual li items by id
	var colorIcon = ".color_icon";												        // Class selector for div icon colored according to legend categories
	var saveBookmarkDialogId = "#eexcess-save-bookmark-dialog";                         // Id for dialog poping up upon clicking on a "star" icon
    var bookmarkSettingsId = "#eexcess-bookmark-dialog-settings";                       // Div containing <select> in bookmark dialog
    var bookmarkDropdownListId = "#eexcess-bookmark-dropdown-list";                     // Div wrapping drop down list in boofmark dialog
    var newBookmarkOptionsId = "#eexcess-bookmark-dialog-new-options";                  // Div wrapping color picker and input element in bookmark dialog
    var colorPickerId = "#eexcess-bookmak-dialog-color-picker";                         // Div tranformed into a colorpicekr in bookmark dialog
    var bookmarkInputWrapperId = "#eexcess-bookmark-dialog-new-options-input-wrapper";  // Wrapper for input containing new bookmark name
    var favIconClass = ".eexcess_fav_icon";                                             // img element fpr favicon (either on or off)
    var bookmarkDetailsIconClass = ".eexcess_bookmark_section_details_icon";            // img element with 3-dot icon in each list item used to display bookmarked item's details on click

	
	// Icon and Image Constants
    var root = "div#eexcess_canvas";											// String to select the area where the visualization should be displayed
	var searchField = "#eexcess_search_field";									// String to select search field in the header
	var btnSearch = "#eexcess_search_button";									// Selector for search button on left side of the header
	var headerText = "#eexcess_header_text";									// String to select the text container in the middle of the header
	var btnFilter = "#eexcess_filter_button";                                   // Reset button id
	var btnReset = "#eexcess_btnreset";											// Selector for reset button in vis control panel
	var chartSelect = "#eexcess_select_chart";									// select for chart
	var divMapping = "#eexcess_controls_mappings";								// div that contains selects for mapping combinations
	var divMappingInd = "#eexcess_mapping_container_";							// id for the above div
	var mappingSelect = ".eexcess_select";										// To select all visual channels' <select> elements by class
	var contentPanel = "#eexcess_content";										// Selector for content div on the right side
	var contentList = "#eexcess_content .eexcess_result_list";					// ul element within div content
	var allListItems = "#eexcess_content .eexcess_result_list .eexcess_list";	// String to select all li items by class
	var listItem = "#eexcess_content .eexcess_result_list #data-pos-";			// String to select individual li items by id
	var colorIcon = ".color_icon";												// Class selector for div icon colored according to legend categories


	// Icon & Image Constants
	var LOADING_IMG = "../../media/loading.gif";
	var NO_IMG = "../../media/no-img.png";
    var FAV_ICON_OFF = "../../media/icons/favicon_off.png";
    var FAV_ICON_ON = "../../media/icons/favicon_on.png";
    var BOOKMARK_DETAILS_ICON = "../../media/batchmaster/ellipsis.png"
    var IMG_COLOR_WHEEL_SMALL = "../../media/icons/color_wheel_16x16.png";
    var IMG_COLOR_WHEEL_LARGE = "../../media/color-spectrum.jpg";
    var IMG_COLOR_WHEEL_MEDIUM = "../../media/color-wheel.jpg";
    var ICON_EUROPEANA =  "../../media/icons/Europeana-favicon.ico";
    var ICON_MENDELEY = "../../media/icons/mendeley-favicon.ico";
    var ICON_ZBW = "../../media/icons/ZBW-favicon.ico";
    var ICON_WISSENMEDIA = "../../media/icons/wissenmedia-favicon.ico";
    var ICON_KIM_COLLECT = "../../media/icons/KIM.Collect-favicon.ico";
    var ICON_UNKNOWN = "../../media/icons/question-mark.png";

    // String Constants
    var STR_SEARCHING = "Searching...";
    var STR_NO_DATA_RECEIVED = "No Data Received";
    var STR_NEW = "New...";
	var STR_BOOKMARK_NAME_MISSING = "Indicate new bookmark name";
	

	// Main variables
	var data;							// contains the data to be visualized
	var mappings;						// contains all the possible mapping combiantions for each type of visualization
	var query;							// string representing the query that triggered the current recommendations
	var charts;
	var groupBy;
	
	
	// Ancillary variables
	var visChannelKeys;					// array containing the keys (names) of the visual atributes corresponding to the current chart
	var mappingSelectors = [];			// Selector array for visual channel <select>. Necessary for event handlers		
	var indicesToHighlight = [];		// array containing the indices of <li> elements to be highlighted in content list	
	var isBookmarkDialogOpen = false;


	// Chart objects
	var timeVis, barVis;
	
		
    // Constants
    var ICON_EUROPEANA =  "../../media/icons/Europeana-favicon.ico";
    var ICON_MENDELEY = "../../media/icons/mendeley-favicon.ico";
    var ICON_ZBW = "../../media/icons/ZBW-favicon.ico";
    var ICON_WISSENMEDIA = "../../media/icons/wissenmedia-favicon.ico";
    var ICON_KIM_COLLECT = "../../media/icons/KIM.Collect-favicon.ico";
    var ICON_UNKNOWN = "../../media/icons/help.png";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	var PREPROCESSING = {};
	
	
	/**
	 *	Bind event handlers to buttons
	 *$
	 * */
	PREPROCESSING.bindEventHandlers = function(){
		var ICON_UNKNOWN = "../../media/icons/help.png";
		$( btnSearch  ).click( function(){ EVTHANDLER.btnSearchClicked(); });
		$( btnReset   ).click( function(){ EVTHANDLER.btnResetClicked(); });
        $( 'html' ).click(function(){ if(isBookmarkDialogOpen) BOOKMARKS.destroyBookmarkDialog(); });
	};
	


	
	/**
	 * Format the received mapping combinations so they can be more easily manipulated
	 * 
	 **/
	PREPROCESSING.getFormattedMappings = function( originalMappings ){
		
		formattedMappings = [];
			
		charts.forEach(function(chart, chartIndex){
			
			// formattedMappings[].combinations is a 2D array containing all the possible combinations for each chart
			// outer array => 1 mapping combination per element. Inner array => 1 visual channel/attribute per element
			formattedMappings.push({ 'chart': chart, 'combinations': new Array() });		
			var keys = [];
			
			// Find in the mappings received the first mapping combination for the current chart
			var firstIndex = 0;
			while(firstIndex < originalMappings.length && originalMappings[firstIndex].chartname != chart)
				firstIndex++;
			
			// Find the visual channels' keys for the current chart
			originalMappings[firstIndex].visualchannels.forEach(function(vc){
				keys.push(vc.label);
			});
			
			// Find all the mapping combinations for the current chart, starting from firstIndex
			//(it's already known that the previous mappings are not for current chart)
			for(var i = firstIndex; i < originalMappings.length; i++){
				
				if(originalMappings[i].chartname == chart){
					
					//	Mapping combination found. Add new array element to formattedMappings[].combinations[] array   
					var combIndex = formattedMappings[chartIndex].combinations.length;		
					formattedMappings[chartIndex].combinations[combIndex] = new Array();
					
					originalMappings[i].visualchannels.forEach(function(vc){
					
						var visChannel = {'facet': vc.component.facet, 'visualattribute': vc.label};
						var vcIndex = keys.indexOf(vc.label);
						
						formattedMappings[chartIndex].combinations[combIndex][vcIndex] = visChannel;
					});
				}
			}
		});

		formattedMappings = PREPROCESSING.dirtyFixForMappings(formattedMappings);	// once fixed in server delete this line and the method
		return formattedMappings;
	};
	
	
	PREPROCESSING.dirtyFixForMappings = function(formattedMappings){
		
		var i = 0;
		while (i < charts. length && formattedMappings[i].chart != 'barchart')
			i++;
		
		
		// if there exist combinations specified for barchart, clear the array, if not, create a new item in formattedMappings for barchart
		if( i < charts.length)
			formattedMappings[i].combinations = new Array();
		else{
			formattedMappings.push( {'chart': 'barchart', 'combinations': new Array()} );
			charts.push('barchart');
		}
		
		var facets = ['language', 'provider'];
		
		facets.forEach(function(f){
			
			var combIndex = formattedMappings[i].combinations.length;		
			formattedMappings[i].combinations[combIndex] = new Array();
			
			formattedMappings[i].combinations[combIndex].push( {'facet': f, 'visualattribute': 'x-axis'} );
			formattedMappings[i].combinations[combIndex].push( {'facet': 'count', 'visualattribute': 'y-axis'} );
			formattedMappings[i].combinations[combIndex].push( {'facet': f, 'visualattribute': 'color'} );
			
		});
		
		return formattedMappings;
	};

	

    PREPROCESSING.extendDataWithAncillaryDetails = function(){

        var itemIds = data.map(function(d){ return d.id; });
        var bookmarkedItems = BookmarkingAPI.getBookmarkedItemsByItemId(itemIds);

        data.forEach(function(d){

            // Set 'bookmarked' property to true or false
            if(typeof bookmarkedItems[d.id] != 'undefined' && bookmarkedItems[d.id] != 'undefined')
                d['bookmarked'] = true;
            else
                d['bookmarked'] = false;


            // Assign 'provider-icon' with the provider's icon
            switch(d.facets.provider){
                case "Europeana":   d['provider-icon'] = ICON_EUROPEANA; break;
			    case "europeana":   d['provider-icon'] = ICON_EUROPEANA; break;
			    case "mendeley":    d['provider-icon'] = ICON_MENDELEY; break;
                case "ZBW":         d['provider-icon'] = ICON_ZBW; break;
                case "econbiz":     d['provider-icon'] = ICON_ZBW; break;
                case "wissenmedia": d['provider-icon'] = ICON_WISSENMEDIA; break;
                case "KIM.Collect": d["provider-icon"] = ICON_KIM_COLLECT; break;
                default: d['provider-icon'] = ICON_UNKNOWN; break;
            }
        });

    };

	
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	var QUERY = {};
	
	/**
	 *	Updates the text in the center of the header according to the received paramter 
	 *
	 * */
	QUERY.updateHeaderText = function( text ){
		
		if( text == STR_SEARCHING){
			$( headerText ).find( "span" ).text( "" );
            
            VISPANEL.showMessageOnCanvas( STR_SEARCHING );
		}
		else{
			$( headerText ).find( "span" ).text( text );
		}
	};
	
	/**
	 * Updates search field on the header (on left side for the moment)
	 * 
	 **/
	QUERY.updateSearchField = function( text, action ){
		$( searchField ).attr( "value", text );
	};
	
	
	QUERY.refreshResults = function(){
		var terms = $( searchField ).val();
		
		// Search for new results if the query is different from the current one
		if(terms != query){
			this.updateHeaderText( STR_SEARCHING );
            EEXCESS.messaging.callBG({method: {parent: 'model', func: 'query'}, data: {terms:[{weight:1,text:terms}],reason:{reason:'manual'}}});
		}
	};

	
	
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	var EVTHANDLER = {};


	/**
	 * Click on search button triggers a new search
	 * 
	 * */
	EVTHANDLER.btnSearchClicked = function(){
		QUERY.refreshResults();
	};

	
	/**
	 * 	Chart <select> changed
	 * 
	 * */
	EVTHANDLER.chartSelectChanged = function(){
		VISPANEL.drawChart();
	};
	
	
	/**
	 *	Function that wraps the change event handlers. These events are triggered by the <select> elements (chart and visual channels)
	 *
	 * */
	EVTHANDLER.setSelectChangeHandlers = function(){
		// Change event handler for visual channels' <select> elements
		$(mappingSelectors).each(function(i, item){	
			$(item).change(function(){
				VISPANEL.drawChart( item );	
			});
		});
		
	};
	
	
	////////	content list item click	////////
	
	EVTHANDLER.listItemClicked = function(d, i, isSelectedFromOutside){
		console.log("list item clicked");
        LIST.selectListItem( d, i);
	};
	

	
	
	////////	Reset Button Click	////////
	
	EVTHANDLER.btnResetClicked = function(){

		LIST.highlightListItems();
		indicesToHighlight = [];
		
		VISPANEL.updateCurrentChart( "reset_chart" );
	};


    /**** Bookmark section in content list items ****/

	////////	Star Icon clicked on list item    ////////

    EVTHANDLER.faviconClicked = function(d, i){

        d3.event.stopPropagation();
        BOOKMARKS.buildSaveBookmarkDialog(d, i, this);
    };



    EVTHANDLER.bookmarkDetailsIconClicked = function(){

        d3.event.stopPropagation();
        BOOKMARKS.buildBookmarkedItemDialog();
    };



    /**** Bookmark Dialog ****/

    ////////	Value changed in bookmark dropdown list 	////////
    EVTHANDLER.bookmarkDropdownListChanged = function(value, index){

        if(index == 0)
            $(newBookmarkOptionsId).slideDown("slow");
        else
            $(newBookmarkOptionsId).slideUp("slow");

        $(newBookmarkOptionsId).find('p').fadeOut('fast');
    };


    ////////	'Cancel' button clicked in bookmark dialog 	////////
    EVTHANDLER.bookmarkCancelButtonClicked = function(){
        BOOKMARKS.destroyBookmarkDialog();
    };


    ////////	'Save' button clicked in bookmark dialog 	////////
    EVTHANDLER.bookmarkSaveButtonClicked = function(){
        BOOKMARKS.saveBookmark();
    };



	
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	var CONTROLS = {}
	
	/**
	 * Creates the <select> element to chose the type of visualization (chart)
	 * 
	 * */
	CONTROLS.buildChartSelect = function(){
		
		//Create chart <select>
		var chartOptions = "";
		
		// "mappings" is an array where each item contains the name of the chart and all the possible combinatios for it 
		charts.forEach(function(chart){ 
			chartOptions += "<option class=\"ui-selected\" value=\"" + chart + "\">" + chart + "</option>"; 
		});
		
		d3.select(chartSelect).html(chartOptions);
		$(chartSelect+":eq("+ 0 +")").prop("selected", true);
		
		$(chartSelect).change( EVTHANDLER.chartSelectChanged );
	};
		
	
	
	/**
	 *	Created one <select> element per visual channel
	 *	It is executed every time the chart selection changes
	 *
	 * */	
	CONTROLS.buildVisualChannelSelects = function(){
		
		// Steps to create <select> elements for visual channels
		//
		var combinations = [];
		var chartIndex = charts.indexOf( VISPANEL.chartName );		// VISPANEL.chartName value assigned in 'getSelectedMapping()' (the caller)
		mappingSelectors = [];
		
		visChannelKeys = [];
		var initialMapping = mappings[chartIndex].combinations[0];
		
		// Each item of the array "combinations" consists in an object that stores the name of the visual channel ('channel'), 
		// and an empty array that will contain all its possible values ('values')
		initialMapping.forEach(function(m){
			combinations.push({'channel': m.visualattribute, 'values': []});
			visChannelKeys.push(m.visualattribute);
		});
				
		// Goes over all the combinations. Every time chartname equals the current chart, it retrieves all the possible values for each visual channel
		// The values are stored like -> combinations[0] = { channel: x-axis, values: [year, ...]}	
		mappings[chartIndex].combinations.forEach(function(comb){
			
			comb.forEach(function(vc){
				var visAttrIndex = visChannelKeys.indexOf(vc.visualattribute);
				
				if(combinations[visAttrIndex]['values'].indexOf(vc.facet) == -1)
					combinations[visAttrIndex]['values'].push(vc.facet);
			});
					
		});
		
		// For each visual channel stored in the array combinations, creates a <select> element and populates its <option> subitems with the
		// values retrieved in the previous step
		combinations.forEach(function(c, i){
			
			var divChannel = d3.select(divMapping)
								.append("div")
								.attr("class", "eexcess_mapping_container")
								.attr("id", "eexcess_mapping_container_"+i);
			
			divChannel
				.append("span")
				.attr("class", "eexcess_controls_title")
				.text(c.channel);
			
			var channelSelect = divChannel
									.append("select")
									.attr("class", "eexcess_select")
									.attr("name", c.channel);
					
			// the "mappingSelectors" array stores the selectors that allow to set change events for each visual channel <select> element in
			// the function "setSelectChangeHandlers"
			// E.g. mappingSelectors[0] = "#eexcess_mapping_container_0 .eexcess_select"
			mappingSelectors.push(divMappingInd + "" + i + " "+ mappingSelect);	
			
			var mappingOptions = "";

			c.values.forEach(function(v){
				mappingOptions += "<option class=\"ui-selected\" value=\""+v+"\">"+v+"</option>";
			});
			
			channelSelect.html( mappingOptions );
		});
		// Create event handlers
		EVTHANDLER.setSelectChangeHandlers();
		
		return initialMapping;
	};
	
	
	
	/**
	 *	Update visual channels' <select> elements according to mapping combination received as parameter
	 *
	 * */
	CONTROLS.updateChannelsSelections = function( validMapping ){

		$(mappingSelectors).each(function(i, item){
			var channelName= $(item).attr("name");
			var channelIndex = visChannelKeys.indexOf(channelName);

			$(item + " option[value="+validMapping[channelIndex].facet+"]").prop("selected", true);
		});
	}
	



	
	
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	var LIST = {};
	
	LIST.internal = {
			
			/**
			 *	Calculates the index to scroll to, which depends on the existence or abscence of a ranking
			 *	There exists a ranking if dataRanking.length > 0
			 * */
			getIndexToScroll: function( indices ) {	
				if( typeof dataRanking === 'undefined' || dataRanking === 'undefined' || dataRanking.length > 0){
					for(var i = 0; i < dataRanking.length; i++){
						if( indices.indexOf( dataRanking[i].originalIndex ) !== -1 )
							return dataRanking[i].originalIndex;
					}
				}
				else
					return indices[0];
			}
	};
	
	
	
	/**
	 * 	Keeps track of selected recommendation in content list
	 * 
	 * */
	LIST.selectededListIndex = 'undefined';
	
	
	
	/**
	 *	Function that populates the list on the right side of the screen.
	 *	Each item represents one recommendation contained in the variable "data"
	 *
	 * */	
	LIST.buildContentList = function(){
	
		//d3.selectAll(".eexcess_ritem").remove();
		d3.selectAll( allListItems ).remove();
		
		var listData = d3.select(contentList).selectAll("li").data(data);
		
		var aListItem = listData.enter()
							.append("li")
								.attr("class", "eexcess_list")
								.attr("id", function(d, i){ return "data-pos-"+i; })
								.on("click", EVTHANDLER.listItemClicked);
		
		// div 1 groups the preview image, partner icon and link icon
		iconsDiv = aListItem.append("div")
					.attr("class", "eexcess_item_ctl");
		
		iconsDiv.append("a")
				.attr("href", "#")
				.append("img")
					.attr("class", "eexcess_preview")
					.attr("src", function(d){ return d.previewImage || NO_IMG ; });
		
		iconsDiv.append("img")
				.attr("class", "eexcess_partner_icon")
				.attr("title", function(d){ return d.facets.provider; })
				.attr("src", function(d){ return d['provider-icon']; });


		// div 2 wraps the recommendation title (as a link), a short description and a large description (not used yet)
		var contentDiv = aListItem.append("div")
			.attr("class", "eexcess_ritem_container");
		

        contentDiv.append("h1")
				.append("a")
					.attr("class", "eexcess_ritem_title")
					.attr("href", "#")
                    .on("click", function(d){
                        window.open(d.uri, '_blank');
                        EEXCESS.messaging.callBG({method:{parent:'model',func:'resultOpened'},data:d.uri}); })
					.text(function(d){ return d.title; });


		contentDiv.append("p")
			.attr("class", "eexcess_ritem_short")
			.html(function(d){
				var facetKeys = Object.keys(d.facets);
				var string = "";
				
				facetKeys.forEach(function(facetKey){
					if( !Array.isArray(d.facets[facetKey]) )
						string += d.facets[facetKey] + ", ";
				});
				return string.substring(0, string.length - 2); 
			});

        // bookmark section contains fav icon and details icon

        var bookmarkDiv = aListItem.append('div')
            .attr('class', 'eexcess_bookmark_section');


        bookmarkDiv.append("img")
            .attr("class", "eexcess_fav_icon")
            .attr("src", function(d){ if(d.bookmarked) return FAV_ICON_ON; return FAV_ICON_OFF; })
            .on("click", EVTHANDLER.faviconClicked);


        bookmarkDiv.append("img")
            .attr("class", "eexcess_bookmark_section_details_icon")
            .attr("src", BOOKMARK_DETAILS_ICON)
            .style("display", function(d){ if(d.bookmarked) return 'inline-block'; return 'none'; })
            .on("click", EVTHANDLER.bookmarkDetailsIconClicked)


		$( contentPanel ).scrollTo( "top" );
	};
	
	
	
	/**
	 * Draws legend color icons in each content list item
	 * */
	LIST.setColorIcon = function(){
		
		$( colorIcon ).remove();
		
		var iconColorScale = (VISPANEL.chartName == 'timeline') ?  timeVis.colorScale : (VISPANEL.chartName == 'barchart') ?  barVis.colorScale : 'undefined'; 
		
		if( iconColorScale != 'undefined' ){
			
			var facet;
			for(var i = 0; i < mappingSelectors.length; i++){
				if($(mappingSelectors[i]).attr("name") == "color")
					facet = $(mappingSelectors[i]).val();
			}
			
			for(var i = 0; i < data.length; i++){	
				var item = $(listItem +""+ i + " .eexcess_item_ctl");
				var title = data[i].facets[facet] || 'en';
				item.append( "<div class=\"color_icon\" title=\""+ title +"\" ></div>" );	
				item.find( colorIcon ).css( 'background', iconColorScale(data[i].facets[facet] || 'en') );
			}
		}
	};
	data
	
	
	/**
	 * Draws legend color icons in each content list item
	 * */
	LIST.selectListItem = function( d, i, flagSelectedOutside ){
		
		var isSelectedFromOutside = flagSelectedOutside || false;
		var index = i;

		LIST.selectededListIndex = (index !== LIST.selectededListIndex) ? index : 'undefined';
		
		// if clickedListIndex is not undefined then the item was selected, otherwise it was deselected
		if(LIST.selectededListIndex !== 'undefined'){
			LIST.highlightListItems( [index] );
			
			if( !flagSelectedOutside )
				VISPANEL.updateCurrentChart( 'highlight_item_selected', [index] );
		}
		else{
			LIST.highlightListItems();
			VISPANEL.updateCurrentChart( 'highlight_item_selected', [] );
		}
	};

	


	
	/**
	 *	Function that highlights items on the content list, according to events happening on the visualization.
	 *	E.g. when one or more keywords are selected, the matching list items remain highlighted, while the others become translucid
	 *	If no parameters are received, all the list items are restored to the default opacity 
	 *
	 * */
	LIST.highlightListItems = function( indices ){

		// "indices" is an array indicating the indices of the list items that should be highlighted 
		
		var highlightIndices = indices || [];
		
		if(highlightIndices.length > 0){
			
			for(var i = 0; i < data.length; i++){			
				var item = d3.select(listItem +""+ i);
				
				if(highlightIndices.indexOf(i) != -1)
					item.style("opacity", "1");
				else
					item.style("opacity", "0.2");
			}

			var indexToScroll = highlightIndices[0];			
			$( contentPanel ).scrollTo( listItem +""+ indexToScroll );
		}
		else{
			d3.selectAll( allListItems ).style("opacity", "1");
			$( contentPanel ).scrollTo( "top" );
		}
	};
	
	

    LIST.turnFaviconOnturnFaviconOnAndShowDetailsIcon = function( index ){
        // Replace favicon_off with favicon_on
        d3.select(listItem + '' +index).select(favIconClass).attr("src", FAV_ICON_ON);
        // show bookmark details icon
        d3.select(listItem + '' +index).select(bookmarkDetailsIconClass).style('display', 'inline-block');
        // Update item's property 'bookmarked'
        data[index].bookmarked = true;
    };

	
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	var VISPANEL = {};
	
	
	VISPANEL.internal = {
			
			/**
			 * Sets the chart and the mapping combination to be used, acording to the <select> elements' selected values 
			 * */	
			getSelectedMapping: function( item ) {
				
				// if "item" is undefined -> change triggered by chart <select>, otherwise triggered by one  of the visual channels' <select>
				var changedItem = item || "undefined";
		    	
				// if the chart changes, reset array with indices to be  highlighted
				if(VISPANEL.chartName != $(chartSelect).val()) indicesToHighlight = [];
				
				VISPANEL.chartName = $(chartSelect).val();
				
				var selectedMapping = [];
				
			    if(changedItem == "undefined"){		    
			    	// VISPANEL SELECTION CHANGED 	
			    	// Empty current visual channels controls (<select> elements) 
			    	$(divMapping).empty();
			    	
			    	// Re-build visual channels' controls
			    	// Assign "selectedMapping" with the first possible mapping combination for the new chart, which is returned by the function below
			    	var selectedMapping = CONTROLS.buildVisualChannelSelects();
			    }
			    else{
			    	// VISUAL CHANNEL SELECTION CHANGED
			    	// Update modified visual channel with new value
			    	mappingSelectors.forEach(function(item){
			    		
						var channelName = $(item).attr("name");
						var channelValue = $(item).val();
						
			    		selectedMapping.push({'facet': channelValue, 'visualattribute': channelName});
			    	});
			    	
			    	var changedChannelName = $(changedItem).attr("name");
			    	var changedChannelValue = $(changedItem).val();
			    	
			    	// selectedMapping remains unchanged if it contains a valid mapping combination, otherwise it's updated with the first valid one in the list 
			    	selectedMapping = this.getValidatedMappings(selectedMapping, changedChannelName, changedChannelValue);
			    }

			    return selectedMapping;
			},
			
			
			/**
			 * Checks if the mapping combination is valid. If not, it returns a valid one and calls
			 * the method to change the visual attributes' selected values in the corresponding <select> elements  
			 * 
			 * */
			getValidatedMappings: function( selectedMapping, changedChannelName, changedChannelValue ) {
				
				var validMapping = [];
				var chartIndex = charts.indexOf( VISPANEL.chartName );

				// Go over each mapping combination
				mappings[chartIndex].combinations.forEach(function(c){
						
					var flagIsValid = true;
					var validMappingFound = false;
					var j = 0;
					
					// 	Check each visual channel
					while( j < visChannelKeys.length && flagIsValid ){
						
						var vcIndex = visChannelKeys.indexOf(c[j]['visualattribute']);
						if(c[vcIndex]['facet'] != selectedMapping[vcIndex]['facet'])
							flagIsValid = false;
			
						j++;
					}
						// As soon as the selected combination is validated, return it
					if(flagIsValid)
						return selectedMapping;
				
					var changedIndex = visChannelKeys.indexOf(changedChannelName);
					if(c[changedIndex]['facet'] == changedChannelValue && !validMappingFound){
						validMapping = c;
						validMappingFound = true;
					}
					
				});
				
				// if loop finishes it means the selectedMapping isn't valid
				// Change <select> values according to the first valid mapping combination encountered (stored in validMapping)
				CONTROLS.updateChannelsSelections( validMapping );
				
				// Return valid combination
				return validMapping;
			}	
					
	};

	
	/** 
	 * 	chartName = name of the chart currently displayed
	 * 	isRankingDrawn = flag to indicate whether the method 'draw' or 'redraw' for rankingVis should be called
	 * 	Settings = object that contains method for retrieving canvas dimensions and processed input data for each type of chart
	 * 
	 * */
	VISPANEL.chartName = "";
	VISPANEL.Settings = new Settings();
	
	
	
	/**
	 * Clears the visualization and specific controls areas.
	 * Retrieves the selected chart and the appropriate mapping combination
	 * Calls the "draw" function corresponding to the selected chart
	 * 
	 * */
	VISPANEL.drawChart = function( item ){
		
		$(root).empty();
		var selectedMapping = this.internal.getSelectedMapping( item );

		switch(VISPANEL.chartName){		// chartName is assigned in internal.getSelectedMapping() 
			case "timeline" : timeVis.draw( selectedMapping, data, width, height,  indicesToHighlight, LIST.selectededListIndex, self ); break;
			case "barchart": barVis.draw( selectedMapping, data.slice(0), width, height,  LIST.selectededListIndex );	break;
			default : d3.select(root).text("No Visualization");	
		}

		LIST.setColorIcon();
		LIST.highlightListItems(indicesToHighlight);
	};
	
	
	
	
	VISPANEL.updateCurrentChart = function( action, arg ){
		
		switch( action ){
			
			case "reset_chart":
			
				switch(VISPANEL.chartName){
					case "timeline": timeVis.reset(); break;
					case "barchart": barVis.reset(); break;
				}
				break;
			case "highlight_item_selected":
				
				var arrayIndices = arg;
				switch(VISPANEL.chartName){
					case "timeline": timeVis.selectNodes( arrayIndices, self ); break;
                    case "barchart": barVis.clearSelection(); break;
				}
				break;

		}
	
	};
    
    
    VISPANEL.showMessageOnCanvas = function( message ){
        
        $( root ).empty();
			
		var messageOnCanvasDiv = d3.select( root ).append("div")
            .attr("id", "eexcess_message_on_canvas");
			
		messageOnCanvasDiv.append("span")
            .text( message );	
			
        if( message == STR_SEARCHING ){
            messageOnCanvasDiv.append("img")
                .attr("src", LOADING_IMG);
        }
    };
            


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    var BOOKMARKS = {};


    BOOKMARKS.internal = {

        currentBookmark :{
                        'bookmark-name': 'none',
                        'color': ' none',
                        'type': 'none'      // new or existing
                        },

        currentItem : {
                        'item-name': 'none',
                        'item-id': 'none',
                        'query': 'none',
                        'index': 'none'
                     },


        getCurrentBookmark : function(){

            var bookmarkName = $(bookmarkDropdownListId).find('span').text();
            var color = '', type = '';

            if( bookmarkName == STR_NEW ){
                bookmarkName = $(bookmarkInputWrapperId).find('input').val();
                color = $(colorPickerId).css('backgroundColor');
                type = 'new';
            }
            this.currentBookmark['bookmark-name'] = bookmarkName;
            this.currentBookmark['color'] = color;
            this.currentBookmark['type'] = type;

            return this.currentBookmark;
        },


        setCurrentItem : function(itemName, itemId, queryTerm, index){
            this.currentItem['item-name'] = itemName;
            this.currentItem['item-id'] = itemId;
            this.currentItem['query'] = queryTerm;
            this.currentItem['index'] = index;
        },


        getCurrentItem : function(){ return this.currentItem; },


        validateBookmarkToSave : function(){
            var $message = $(newBookmarkOptionsId).find('p');

            // validation for new bookmark name
            if(this.currentBookmark['type'] == 'new' && (this.currentBookmark['bookmark-name'] == '' || this.currentBookmark['bookmark-name'] == 'none')) {
                $message.fadeIn('slow');
                return false;
            }

            $message.fadeOut('fast');
            return true;
        }

    };





    BOOKMARKS.buildSaveBookmarkDialog = function(d, i, sender) {

        BOOKMARKS.destroyBookmarkDialog();
        isBookmarkDialogOpen = true;

        this.internal.setCurrentItem(d.title, d.id, query, i);

        var topOffset = $(contentPanel).offset().top;
        var leftOffset = $(contentPanel).offset().left;

        // Append bookmark form to content item
        var dialogBookmark = d3.select("body").append("div")
            .attr("id", "eexcess-bookmark-save-dialog")
            .attr("class", "eexcess-bookmark-dialog")
            .style('display', 'none')
            .style("top", topOffset + "px" );

        dialogBookmark.on('click', function(){ d3.event.stopPropagation(); });

        dialogBookmark.append("span")
            .attr("id", "eexcess-bookmark-dialog-title")
            .text("Bookmark Item");

        // Append details section
        var bookmarkDetails = dialogBookmark.append('div')
            .attr('id', 'eexcess-boookmark-dialog-details');

        bookmarkDetails.append('span').text('Title:');
        bookmarkDetails.append('p').text(d.title);
        bookmarkDetails.append('span').text('Query:');
        bookmarkDetails.append('p').text(query);

        // Append settings section (for bookmark selection or definition of new bookmark)
        var bookmarkSettings = dialogBookmark.append("div")
            .attr("id", "eexcess-bookmark-dialog-settings");

        bookmarkSettings.append("span").text("Add to:");

        // array to be sent to plugin building the dropdown list with the list items and the corresponding colors
        var optionsData = $.merge([{'name': STR_NEW, 'color': ''}], BookmarkingAPI.getAllBookmarkNamesAndColors());

        bookmarkSettings.append("div").attr("id", "eexcess-bookmark-dropdown-list");

        // Create dropdown list to select bookmark
        $("#eexcess-bookmark-dropdown-list").dropdown({
            'data' : optionsData,
            'change' : EVTHANDLER.bookmarkDropdownListChanged
        });


        // Add wrapper div containing icon for color picking, text input and legend
        var newBookmarkOptions = bookmarkSettings.append("div")
            .attr("id", "eexcess-bookmark-dialog-new-options");

        newBookmarkOptions.append("div")
            .attr("id", "eexcess-bookmak-dialog-color-picker")
            .attr("title", "Select Color");


        newBookmarkOptions.append("div")
            .attr("id", "eexcess-bookmark-dialog-new-options-input-wrapper")
            .append("input");

        newBookmarkOptions.append('p')
            .text(STR_BOOKMARK_NAME_MISSING)
            .style('display', 'none');


        // Append save and cancel buttons within container
        var bookmarkButtonsWrapper = dialogBookmark.append("div")
            .attr("id", "eexcess-bookmark-buttons-wrapper");


        bookmarkButtonsWrapper.append("button")
            .attr("class", "eexcess-bookmark-button")
            .text("Save")
            .on("click", EVTHANDLER.bookmarkSaveButtonClicked);

        bookmarkButtonsWrapper.append("button")
            .attr("class", "eexcess-bookmark-button")
            .text("Cancel")
            .on('click', EVTHANDLER.bookmarkCancelButtonClicked);


        // show bookmark dialog
        $(saveBookmarkDialogId).slideDown('slow');

        // make div icon a color picker
        $( colorPickerId ).colorpicker({
            'img' : IMG_COLOR_WHEEL_LARGE,
            'width' : 200,
            'height' : 200
        });
    };




    BOOKMARKS.destroyBookmarkDialog = function(){
        $( colorPickerId ).colorpicker('destroy');
        $( saveBookmarkDialogId ).remove();

        isBookmarkDialogOpen = false;
    };



    BOOKMARKS.saveBookmark = function(){

        var bookmark = this.internal.getCurrentBookmark();
        var item = this.internal.getCurrentItem();

        if( this.internal.validateBookmarkToSave() ){
            if(bookmark['type'] == 'new')
                BookmarkingAPI.createBookmark(bookmark['bookmark-name'], bookmark['color']);

            BookmarkingAPI.addItemToBookmark(bookmark['bookmark-name'], item['item-name'], item['item-id'], item['query']);
            BOOKMARKS.destroyBookmarkDialog();

            console.log(BookmarkingAPI.getAllBookmarks());

            LIST.turnFaviconOnAndShowDetailsIcon( item['index'] );
        }
    };

	


    BOOKMARKS.buildBookmarkedItemDialog = function(){






    };
	



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	/**
	 * 	Initizialization function called from starter.js
	 * 	Sets up the visualization-independent components and instantiates the visualization objects (e.g. timeVis) 
	 * 
	 * */
	this.init = function(){

		PREPROCESSING.bindEventHandlers();
		timeVis = new Timeline(root, self, VISPANEL.Settings );
		barVis = new Barchart(root, self, VISPANEL.Settings );

        BookmarkingAPI = new Bookmarking();
        BookmarkingAPI.init();
	};




    /**
     * 	Initizialization function called from starter.js
     * 	Sets up the visualization-independent components and instantiates the visualization objects (e.g. timeVis)
     *
     * */
    this.refresh = function( receivedQuery, receivedData, receivedCharts, receivedMappings, receivedGroupBy, action ){

        width  = $(window).width();
        height = $(window).height();

        data = receivedData;													// contains the data to be visualized
        charts = receivedCharts;
        mappings = PREPROCESSING.getFormattedMappings( receivedMappings );		// contains all the possible mapping combiantions for each type of visualization
        query = receivedQuery;													// string representing the query that triggered the current recommendations
        groupBy = receivedGroupBy;
        indicesToHighlight = [];

        // Initialize template's elements
        PREPROCESSING.extendDataWithAncillaryDetails();
        QUERY.updateHeaderText( "Query Results : " + data.length );
        QUERY.updateSearchField( query );
        CONTROLS.buildChartSelect();
        LIST.buildContentList();
        
        if(data.length > 0){
            // Call method to create a new visualization (empty parameters indicate that a new chart has to be drawn)
            VISPANEL.drawChart();
        }
        else{
            VISPANEL.showMessageOnCanvas( STR_NO_DATA_RECEIVED );
        }

        //BookmarkingAPI.testBookmarking();
    };

	
	
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	
	
	
	///////////// External calls triggered by current chart
	
	this.ListItemSelected = function(d, i){
		LIST.selectListItem( d, i, true );
	};
	
	
	this.selectItems = function( itemIndices ){
		LIST.highlightListItems( itemIndices, true );
	};



}
