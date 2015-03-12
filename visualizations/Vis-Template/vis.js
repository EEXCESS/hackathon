function Visualization( EEXCESSobj ) {

	var self = this;
	var EEXCESS = EEXCESSobj || {};
	
    var width;		// Screen width
    var height;	    // Screen height
	
    var inputData;

	
    // DOM Selectors
    var root = "div#eexcess_canvas";											                   // String to select the area where the visualization should be displayed
    var filterContainer = "eexcess-filtercontainer"; 
	var searchField = "#eexcess_search_field";									                   // String to select search field in the header
	var btnSearch = "#eexcess_search_button";									                   // Selector for search button on left side of the header
	var headerText = "#eexcess_header_text";									                   // String to select the text container in the middle of the header
	var btnReset = "#eexcess_btnreset";											                   // Selector for reset button in vis control panel
	var chartSelect = "#eexcess_select_chart";									                   // select for chart
	var divMapping = "#eexcess_controls_mappings";								                   // div that contains selects for mapping combinations
	var divMappingInd = "#eexcess_mapping_container_";							                   // id for the above div
	var mappingSelect = ".eexcess_select";										                   // To select all visual channels' <select> elements by class
	var contentPanel = "#eexcess_content";										                   // Selector for content div on the right side
	var contentList = "#eexcess_content .eexcess_result_list";					                   // ul element within div content
	var allListItems = "#eexcess_content .eexcess_result_list .eexcess_list";	                   // String to select all li items by class
	var listItem = "#eexcess_content .eexcess_result_list #data-pos-";			                   // String to select individual li items by id
	var colorIcon = ".color_icon";												                   // Class selector for div icon colored according to legend categories
	var favIconClass = ".eexcess_fav_icon";                                                        // img element fpr favicon (either on or off)
    var bookmarkDetailsIconClass = ".eexcess_details_icon";                                        // img element with 3-dot icon in each list item used to display bookmarked item's details on click
    var loadingMsgId = "#eexcess_message_on_canvas";											

	
    var bookmarkDialogClass = ".eexcess-bookmark-dialog";                                          // Class selector for both types of dialog: save bookmark and see-and-edit-bookmark
    var saveBookmarkDialogId = "#eexcess-save-bookmark-dialog";                                    // Id for dialog poping up upon clicking on a "star" icon
    var bookmarkDropdownList = "#eexcess-save-bookmark-dialog .eexcess-bookmark-dropdown-list";    // Div wrapping drop down list in bookmark dialog
    var newBookmarkOptionsId = "#eexcess-save-bookmark-dialog .eexcess-bookmark-dialog-optional";  // Div wrapping color picker and input element in bookmark dialog
    var colorPickerId = "#eexcess-bookmak-dialog-color-picker";                                    // Div tranformed into a colorpicekr in bookmark dialog
    var bookmarkDialogInputWrapper = "#eexcess-save-bookmark-dialog .eexcess-bookmark-dialog-input-wrapper"; // Wrapper for input containing new bookmark name
    var detailsBookmarkDialogId = "#eexcess-see-and-edit-bookmark-dialog";                         // Dialog displaying bookmark detials (when click on 3-dotted icon)
    var bookmarkedInId = 'eexcess-bookmark-bookmarked-in-';                                        // Divs in bookamark details dialog showing bookmarks in which the current item is recorded
	var filterBookmarkDialogId ="#eexcess-filter-bookmark-dialog";								   // Id for dialog filter bookmark
	var filterBookmarkDropdownList = "#eexcess-filter-bookmark-dialog .eexcess-bookmark-dropdown-list"; // Div wrapping drop down list in filter bookmark dialog
	var deleteBookmark = "#eexcess_deleteBookmark_button";										   // Button for boookmark deleted.
	var addBookmarkItems = "#eexcess_addBookmarkItems_button";									   // Button for add boookmarkitems.
	var exportBookmark = "#eexcess_export_bookmark";											   // Export bookmark data.
	var importBookmark = "#eexcess_import_bookmark";											   // Import bookmark data.
	var importBookmarkStyle = "#eexcess_import_bookmark_style";									   // Styles import bookmark button control.
	// Icon & Image Constants
	var LOADING_IMG = "../../media/loading.gif";
	var NO_IMG = "../../media/no-img.png";
    var FAV_ICON_OFF = "../../media/icons/favicon_off.png";
    var FAV_ICON_ON = "../../media/icons/favicon_on.png";
    var REMOVE_SMALL_ICON = "../../media/batchmaster/remove.png";
    var BOOKMARK_DETAILS_ICON = "../../media/batchmaster/ellipsis.png";
    var IMG_COLOR_WHEEL_LARGE = "../../media/color-spectrum.jpg";
    var IMG_COLOR_WHEEL_MEDIUM = "../../media/color-wheel.jpg";
    var ICON_EUROPEANA =  "../../media/icons/Europeana-favicon.ico";
    var ICON_MENDELEY = "../../media/icons/mendeley-favicon.ico";
    var ICON_ZBW = "../../media/icons/ZBW-favicon.ico";
    var ICON_WISSENMEDIA = "../../media/icons/wissenmedia-favicon.ico";
    var ICON_KIM_COLLECT = "../../media/icons/KIM.Collect-favicon.ico";
	var ICON_UNKNOWN = "../../media/icons/help.png";

    // String Constants
    var STR_LOADING = "Loading...";
    var STR_NO_DATA_RECEIVED = "No Data Received";
    var STR_NEW = "New Collecction...";
	var STR_BOOKMARK_NAME_MISSING = "Indicate new bookmark name";
	var STR_SHOWALLRESULTS = "Search results";

	
	// Main variables
	var data;							// contains the data to be visualized
	var mappings;						// contains all the possible mapping combiantions for each type of visualization
	var query;							// string representing the query that triggered the current recommendations
	var charts;
	var groupBy;
	
	
	// Ancillary variables
	var visChannelKeys;					// array containing the keys (names) of the visual atributes corresponding to the current chart
	var mappingSelectors;			    // Selector array for visual channel <select>. Necessary for event handlers
	var indicesToHighlight = [];	    // array containing the indices of <li> elements to be highlighted in content list
	var isBookmarkDialogOpen;
    //var idsArray;
    var bookmarkedItems;

	// Chart objects
	var timeVis, barVis, geoVis, urankVis;


	requirejs.config({
	    baseUrl: '/visualizations/Vis-Template/uRank/',
	    paths: {
	        natural: 'libs/natural',
	        colorbrewer: 'libs/colorbrewer',
	        'dim-background': 'libs/dim-background',
	        lexer: 'libs/pos/lexer',
	        lexicon: 'libs/pos/lexicon',
	        POSTagger: 'libs/pos/POSTagger',
	        pos: 'libs/pos/pos',
	        rankingvis: 'scripts/rankingvis',
	        settings: 'scripts/settings',
	        utils: 'scripts/utils',
	        taskStorage: 'scripts/taskStorage',
	        'vis-controller': 'scripts/vis-controller',
	        'vis-controller-customized': 'scripts/vis-controller-customized',
	    }             
	});




////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     *  START object is returned to starter so it can call init or redresh upon new results received
     *
     */

    var START = {};
    START.plugins = [];

	/**
	 * 	Initizialization function called from starter.js
	 * 	Sets up the visualization-independent components and instantiates the visualization objects (e.g. timeVis)
	 *
	 * */
	START.init = function(){

		PREPROCESSING.bindEventHandlers();
		timeVis = new Timeline(root, EXT);
		barVis = new Barchart(root, EXT);
        geoVis = new Geochart(root, EXT);
        urankVis = new Urank(root, EXT, EEXCESS);

        BookmarkingAPI = new Bookmarking();
        BookmarkingAPI.init();
        PluginHandler.initialize(START, root, filterContainer);
        START.plugins = PluginHandler.getPlugins();

        VISPANEL.clearCanvasAndShowMessage( STR_LOADING );
        $(document).ready(function(){
	        $(window).on('resize', function(e){ 
	        	VISPANEL.drawChart(); 
	        });
	    });

        // for Debugging Purposes
        //$(searchField).val('Graz');
        //QUERY.refreshResults();
        //$(chartSelect).val("geochart");
        //VISPANEL.drawChart();
	};




    /**
     * 	Initizialization function called from starter.js
     * 	Sets up the visualization-independent components and instantiates the visualization objects (e.g. timeVis)
     *
     * */
    START.refresh = function(input){

        if(typeof input == 'undefined' || input == 'undefined'){
            VISPANEL.clearCanvasAndShowMessage( STR_NO_DATA_RECEIVED );
            return;
        }

        width  = $(window).width();
        height = $(window).height();

        data = input.data; //receivedData;													// contains the data to be visualized
        charts = input.charts; //receivedCharts;
        mappings = input.mappingcombination; //PREPROCESSING.getFormattedMappings( receivedMappings );		// contains all the possible mapping combiantions for each type of visualization
        query = input.query;													// string representing the query that triggered the current recommendations

        // Initialize template's elements
        PREPROCESSING.setAncillaryVariables();
        BOOKMARKS.updateBookmarkedItems();
        PREPROCESSING.extendDataWithAncillaryDetails();
        QUERY.updateHeaderText( "Query Results : " + data.length );
        QUERY.updateSearchField( query );
        $(chartSelect).unbind('change');
        CONTROLS.buildChartSelect();
        LIST.buildContentList();
		FILTER.buildFilterBookmark();
		BOOKMARKS.exportBookmarks();
		BOOKMARKS.importBookmarks();
		
        // Call method to create a new visualization (empty parameters indicate that a new chart has to be drawn)
        VISPANEL.drawChart();


        //BookmarkingAPI.testBookmarking();
    };

    START.refreshChartSelect = function(){       
    	START.plugins = PluginHandler.getPlugins();
    	globals.mappingcombination = getMappings();
    	globals.charts = getCharts(globals.mappingcombination); 	
    	mappings = globals.mappingcombination;
    	charts = globals.charts;
        CONTROLS.reloadChartSelect();
    }



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	var PREPROCESSING = {};
	
	
	/**
	 *	Bind event handlers to buttons
	 *$
	 * */
	PREPROCESSING.bindEventHandlers = function(){
		$( btnSearch  ).click( function(){ EVTHANDLER.btnSearchClicked(); });
		$( searchField ).on('keypress', function(e){ if (e.keyCode == 13) EVTHANDLER.btnSearchClicked(); });
		$( btnReset   ).click( function(){ EVTHANDLER.btnResetClicked(); });
        $( 'html' ).click(function(){ if(isBookmarkDialogOpen) BOOKMARKS.destroyBookmarkDialog(); });
        $( '#demo-button-university' ).click(function(e){ $(this).addClass('checked'); $('#demo-button-historicalbuildings').removeClass('checked'); onDataReceived(getDemoResultsUniversity()); });
        $( '#demo-button-historicalbuildings' ).click(function(e){ $(this).addClass('checked'); $('#demo-button-university').removeClass('checked'); onDataReceived(getDemoResultsHistoricBuildings()); });
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

		var i = formattedMappings.getIndexOf("barchart", "chart");
		if (i != -1)
            formattedMappings.splice(i, 1);
		
		i = formattedMappings.push( {'chart': 'barchart', 'combinations': new Array()} );
        i--;
		charts.push('barchart');
		
		var facets = ['language', 'provider'];
		facets.forEach(function(facet){
			var combIndex = formattedMappings[i].combinations.length;
			formattedMappings[i].combinations[combIndex] = new Array();
			formattedMappings[i].combinations[combIndex].push( {'facet': facet, 'visualattribute': 'x-axis'} );
			formattedMappings[i].combinations[combIndex].push( {'facet': 'count', 'visualattribute': 'y-axis'} );
			formattedMappings[i].combinations[combIndex].push( {'facet': facet, 'visualattribute': 'color'} );
		});
		
        i = formattedMappings.getIndexOf("geochart", "chart");
        if (i != -1)
            formattedMappings.splice(i, 1);

        i = formattedMappings.push( {'chart': 'geochart', 'combinations': new Array()} );
        i--;
        charts.push('geochart');
        facets.forEach(function(facet){
            var combIndex = formattedMappings[i].combinations.length;
            formattedMappings[i].combinations[combIndex] = new Array();
            formattedMappings[i].combinations[combIndex].push( {'facet': facet, 'visualattribute': 'color'} );
        });

		return formattedMappings;
	};

	

    PREPROCESSING.setAncillaryVariables = function() {
	    //indicesToHighlight = [];
        isBookmarkDialogOpen = false;
        //idsArray = data.map(function(d){ return d.id; });//not used
    };





    PREPROCESSING.extendDataWithAncillaryDetails = function(){

        data.forEach(function(d){

            // Set 'bookmarked' property to true or false
            if(typeof bookmarkedItems[d.id] != 'undefined' && bookmarkedItems[d.id] != 'undefined')
                d['bookmarked'] = true;
            else
                d['bookmarked'] = false;


            // Assign 'provider-icon' with the provider's icon
            switch(d.facets.provider){
                case "europeana":
                case "Europeana":   d['provider-icon'] = ICON_EUROPEANA; break;
			    case "mendeley":    d['provider-icon'] = ICON_MENDELEY; break;
                case "econbiz":
                case "ZBW":         d['provider-icon'] = ICON_ZBW; break;
                case "wissenmedia": d['provider-icon'] = ICON_WISSENMEDIA; break;
                case "KIM.Collect": d["provider-icon"] = ICON_KIM_COLLECT; break;
                default:            d['provider-icon'] = ICON_UNKNOWN; break;
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
		
		if( text == STR_LOADING){
			$( headerText ).find( "span" ).text( "" );
            
            VISPANEL.clearCanvasAndShowMessage( STR_LOADING );
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
			this.updateHeaderText( STR_LOADING );
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

            if($(item).attr('isDynamic').toBool())
                $(item).change(function(){
				    VISPANEL.drawChart( item );
			 });
		});
		
	};
	
	
	////////	content list item click	////////
	
	EVTHANDLER.listItemClicked = function(d, i, isSelectedFromOutside, x, y, z){
		if (d3.event.ctrlKey){
        	LIST.selectListItem( d, i, false, true, false);
		} else {
        	LIST.selectListItem( d, i, false, false, false);
    	}
	};
	

	
	
	////////	Reset Button Click	////////
	
	EVTHANDLER.btnResetClicked = function(){
		indicesToHighlight = VISPANEL.getAllSelectListItems();
	
		LIST.highlightListItems(indicesToHighlight, false);
		//$(filterBookmarkDialogId+">div>span").text(STR_SHOWALLRESULTS);
		//$(filterBookmarkDialogId+">div>div").css("background","inherit");
		//$(deleteBookmark).prop("disabled",true);
		
		//FILTER.showStars();	
		//FILTER.updateData();	
		
		VISPANEL.updateCurrentChart( "reset_chart" );
		
	};


    /**** Bookmark section in content list items ****/

	////////	Star Icon clicked on list item    ////////

    EVTHANDLER.faviconClicked = function(d, i){

        d3.event.stopPropagation();
        //BOOKMARKS.buildSaveBookmarkDialog(d, i, this);//ask cecillia ????????
		BOOKMARKS.buildSaveBookmarkDialog(
            d,
			function(thisValue){
				thisValue.internal.setCurrentItem(d, i);
			},
			function(bookmarkDetails){
				bookmarkDetails.append('p').text(d.title);
			},EVTHANDLER.bookmarkSaveButtonClicked,
			this);
    };




    EVTHANDLER.bookmarkDetailsIconClicked = function(d, i){

        d3.event.stopPropagation();
        BOOKMARKS.buildSeeAndEditBookmarkDialog(d, i);
    };



    /**** Bookmark Dialog ****/

    ////////	Value changed in bookmark dropdown list 	////////
    EVTHANDLER.bookmarkDropdownListChanged = function(value, index){
		
		currentSelectIndex = index;
		//console.log("##### >> " +currentSelectIndex);
	
        if(index == 0)
            $(newBookmarkOptionsId).slideDown("slow");
        else
            $(newBookmarkOptionsId).slideUp("slow");

        $(newBookmarkOptionsId).find('p').fadeOut('fast');      // error message hidden
    };


    ////////	'Cancel' button clicked in save bookmark dialog 	////////
    EVTHANDLER.bookmarkCancelButtonClicked = function(){
        BOOKMARKS.destroyBookmarkDialog();
    };


    ////////	'Save' button clicked in save bookmark dialog 	////////
    EVTHANDLER.bookmarkSaveButtonClicked = function(){
        BOOKMARKS.saveBookmark();
		FILTER.changeDropDownList();
    };


    ////////	'Done' button clicked in bookmark details dialog 	////////
    EVTHANDLER.bookmarkDoneButtonClicked = function(){
        BOOKMARKS.destroyBookmarkDialog();
    };



    EVTHANDLER.removeBookmarkIconClicked = function(bookmark, bookmarkIndex) {
        BOOKMARKS.deleteBookmarkAndRefreshDetailsDialog(this, bookmark, bookmarkIndex);
    }


	
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	var CONTROLS = {}
	
	/**
	 * Creates the <select> element to chose the type of visualization (chart)
	 * 
	 * */
	CONTROLS.buildChartSelect = function(){
		CONTROLS.reloadChartSelect();
		$(chartSelect).change( EVTHANDLER.chartSelectChanged );
	};

	CONTROLS.reloadChartSelect = function(){
		var chartOptions = "";		
		charts.forEach(function(chart){ 
			chartOptions += "<option class=\"ui-selected\" value=\"" + chart + "\">" + chart + "</option>"; 
		});
		$(chartSelect).empty().html(chartOptions);
		$(chartSelect+":eq("+ 0 +")").prop("selected", true);
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
        var initialMapping = [];
		var chartIndex = charts.indexOf( VISPANEL.chartName );		// VISPANEL.chartName value assigned in 'getSelectedMapping()' (the caller)
		mappingSelectors = [];
		
		visChannelKeys = [];

        if(mappings[chartIndex].combinations.length > 0){

            initialMapping = mappings[chartIndex].combinations[0];
		
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
			
                var selector;
                if(c.values.length > 1){

                    var channelSelect = divChannel
				        .append("select")
                            .attr("class", "eexcess_select")
					        .attr("name", c.channel)
                            .attr('isDynamic', true);
			
                    var mappingOptions = "";

                    c.values.forEach(function(v){
				        mappingOptions += "<option class=\"ui-selected\" value=\""+v+"\">"+v+"</option>";
                    });
                    channelSelect.html( mappingOptions );

                    selector = mappingSelect; // string for selecting a visual channel <select> element
                }
                else{
                    divChannel.append('div')
                        .attr('class', 'eexcess_controls_facet_static')
                        .attr('name', c.channel)
                        .attr('isDynamic', false)
                        .text(c.values[0]);
                    selector = ".eexcess_controls_facet_static";
                }

                // the "mappingSelectors" array stores the selectors that allow to set change events for each visual channel <select> element in
                // the function "setSelectChangeHandlers"
                // E.g. mappingSelectors[0] = "#eexcess_mapping_container_0 .eexcess_select"
                mappingSelectors.push(divMappingInd + "" + i + " "+ selector);
            });


            // Create event handlers
            EVTHANDLER.setSelectChangeHandlers();
		
        }
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

	LIST.indicesSelected = [];
	
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
					.attr("href", function(d){return d.uri;})
                    .on("click", function(d){
                        d3.event.preventDefault();
                        d3.event.stopPropagation();
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
            .attr('title', 'Bookmark this item')
            .attr("src", function(d){ if(d.bookmarked) return FAV_ICON_ON; return FAV_ICON_OFF; })
            .on("click", EVTHANDLER.faviconClicked);


        //bookmarkDiv.append("img")
        //    .attr("class", "eexcess_details_icon")
        //    .attr('title', 'View and delete item\'s bookmarks')
        //    .attr("src", BOOKMARK_DETAILS_ICON)
        //    .style("display", function(d){ if(d.bookmarked) return 'inline-block'; return 'none'; })
        //    .on("click", EVTHANDLER.bookmarkDetailsIconClicked);


		$( contentList ).scrollTo( "top" );
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
	
	
	/**
	 * Draws legend color icons in each content list item
	 * */
	LIST.selectListItem = function( d, i, flagSelectedOutside, addItemToCurrentSelection, scrollToFirst ){

		var addItemToCurrentSelection = addItemToCurrentSelection || false;
		var isSelectedFromOutside = flagSelectedOutside || false;
		var index = i;
		var indicesToHighlight = [];

		var indexWasAlreadySelected = LIST.indicesSelected.indexOf(index) > -1;

		if (addItemToCurrentSelection)
			indicesToHighlight = LIST.indicesSelected;

		if (indexWasAlreadySelected)
			indicesToHighlight.splice(indicesToHighlight.indexOf(index), 1);
		else
			indicesToHighlight.push(index);

		LIST.indicesSelected = indicesToHighlight;
		if (indicesToHighlight.length == 0)
			indicesToHighlight = VISPANEL.getAllSelectListItems();
				
		LIST.highlightListItems( indicesToHighlight, scrollToFirst );
		
		if( !flagSelectedOutside )
			VISPANEL.updateCurrentChart( 'highlight_item_selected', indicesToHighlight );
	};
	


	
	/**
	 *	Function that highlights items on the content list, according to events happening on the visualization.
	 *	E.g. when one or more keywords are selected, the matching list items remain highlighted, while the others become translucid
	 *	If no parameters are received, all the list items are restored to the default opacity 
	 *
	 * */
	LIST.highlightListItems = function( indices, scrollToFirst){

		// "indices" is an array indicating the indices of the list items that should be highlighted 
		scrollToFirst = scrollToFirst == undefined ? true : scrollToFirst;
		indicesToHighlight =[];
		var highlightIndices = indices || [];
		
		if(highlightIndices.length > 0){
			
			for(var i = 0; i < data.length; i++){			
				var item = d3.select(listItem +""+ i);
				
				if(highlightIndices.indexOf(i) != -1){
					item.style("opacity", "1");
					indicesToHighlight.push(i);
				}else{
					item.style("opacity", "0.2");
				}
			}

			var indexToScroll = highlightIndices[0];
			if (scrollToFirst)
				$( contentList ).scrollTo( listItem +""+ indexToScroll, {offsetTop: 90});
		}
		else{
			indicesToHighlight = [];
			//change code !!!!!!!!!!!!!
			d3.selectAll( allListItems ).style("opacity", "0.2");
			//d3.selectAll( allListItems ).style("opacity", "1");
			if (scrollToFirst)
				$( contentList ).scrollTo( "top" );
		}
	};
	
	

    LIST.turnFaviconOnAndShowDetailsIcon = function( index ){
        // Replace favicon_off with favicon_on
        d3.select(listItem + '' +index).select(favIconClass).transition().attr("src", FAV_ICON_ON).duration(2000);
        // show bookmark details icon
        $(listItem + '' +index + ' ' + bookmarkDetailsIconClass).fadeIn('slow');
		
		data[index].bookmarked = true;
		
    };


    LIST.turnFaviconOffAndHideDetailsIcon = function( index ){
        // Replace favicon_on with favicon_off
        d3.select(listItem + '' +index).select(favIconClass).transition().attr("src", FAV_ICON_OFF).duration(2000);
        // Hide bookmark details icon
        $(listItem + '' +index + ' ' + bookmarkDetailsIconClass).fadeOut('slow');
        // Update item's property 'bookmarked'
		
		data[index].bookmarked = false;
    }

	
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
            if(VISPANEL.chartName != $(chartSelect).val()){//??????????
                //indicesToHighlight = [];
			}
				
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
                    var channelValue = $(item).attr('isDynamic').toBool() ? $(item).val() : $(item).text();
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

            // Go over each mapping combination and and then over each visual channel for the current mapping combination
            for(var combIndex = 0; combIndex < mappings[chartIndex].combinations.length; combIndex++) {

                var flagIsValid = true;
                var j = 0;

                // 	Check each visual channel
                while( j < visChannelKeys.length && flagIsValid ){
                    var vcIndex = visChannelKeys.indexOf(mappings[chartIndex].combinations[combIndex][j]['visualattribute']);
                    if(mappings[chartIndex].combinations[combIndex][vcIndex]['facet'] != selectedMapping[vcIndex]['facet'])
                        flagIsValid = false;
                    j++;
                }
                // As soon as the selected combination is validated, return it
                if(flagIsValid)
                    return selectedMapping;

                var validMappingFound = false;
                var changedIndex = visChannelKeys.indexOf(changedChannelName);
                if(mappings[chartIndex].combinations[combIndex][changedIndex]['facet'] == changedChannelValue && !validMappingFound){
                    validMapping = mappings[chartIndex].combinations[combIndex];
                    validMappingFound = true;
                }
            }
            // if loop finishes it means the selectedMapping isn't valid
            // Change <select> values according to the first valid mapping combination encountered (stored in validMapping)
            CONTROLS.updateChannelsSelections(validMapping);

            // Return valid combination
            return validMapping;
        }
					
	};

	
	/** 
	 * 	chartName = name of the chart currently displayed
	 * 
	 * */
	VISPANEL.chartName = "";
	
	
	
	/**
	 * Clears the visualization and specific controls areas.
	 * Retrieves the selected chart and the appropriate mapping combination
	 * Calls the "draw" function corresponding to the selected chart
	 * 
	 * */
	VISPANEL.drawChart = function( item ){

		if ($(root).width() == 0) // workaround: problem, at the beginning, all visualisations get initialized too soon and too often.
			return; 
		
		$(root).empty();		
        // cleanup added controls:
        $('#eexcess_vis_panel').children().not('#eexcess_canvas').remove()
        $('#eexcess_main_panel').attr('class', ''); // removing urank class
		LIST.buildContentList();

		var oldChartName = VISPANEL.chartName;
		var selectedMapping = this.internal.getSelectedMapping( item );
		if (oldChartName != VISPANEL.chartName){
			var plugin = PluginHandler.getByDisplayName(oldChartName);
			if (plugin != null && plugin.Object.finalize != undefined)
				plugin.Object.finalize();
		}

		var plugin = PluginHandler.getByDisplayName(VISPANEL.chartName);
		if (plugin != null){
			if (plugin.Object.draw != undefined)
				plugin.Object.draw(data, selectedMapping, width, height);			
		} else {
			switch(VISPANEL.chartName){		// chartName is assigned in internal.getSelectedMapping() 
				case "timeline" : timeVis.draw(data, selectedMapping, width, height); break;
				case "barchart":  barVis.draw(data, selectedMapping, width, height); break;
	            case "geochart":  geoVis.draw(data, selectedMapping, width, height); break;
                case "urank":  urankVis.draw(data, selectedMapping, width, height); break;
				default : d3.select(root).text("No Visualization");	
			}
		}

		LIST.setColorIcon();
		LIST.highlightListItems(VISPANEL.getAllSelectListItems(), false);//(indicesToHighlight); //changecode
	};
	
	
	VISPANEL.getAllSelectListItems = function(){
		var array =[];
		data.forEach(function(element,index){
			array.push(index);
		});
		return array;
	};
	
	VISPANEL.updateCurrentChart = function( action, arg ){
		
		var plugin = PluginHandler.getByDisplayName(VISPANEL.chartName);
		switch( action ){
			
			case "reset_chart":		
				if (plugin != null){
					if (plugin.Object.reset != undefined)
						plugin.Object.reset();
				} else {
					switch(VISPANEL.chartName){
						case "timeline": timeVis.reset(); break;
						case "barchart": barVis.reset(); break;
	                    case "geochart": geoVis.reset(); break;
                    	case "urank": urankVis.reset(); break;
					}
				}
				break;

			case "highlight_item_selected":
				var arrayIndices = arg;
				if (plugin != null){
					if (plugin.Object.highlightItems != undefined)
						plugin.Object.highlightItems(arrayIndices);
				} else {
					switch(VISPANEL.chartName){
						case "timeline": timeVis.selectNodes(arrayIndices, self); break;
	                    case "barchart": barVis.clearSelection(); break;
	                    case "geochart": geoVis.highlightItems(arrayIndices); break;
                    	case "urank": urankVis.highlightItems(arrayIndices); break;
					}
				}
				break;
		}
	
	};
    
    
    VISPANEL.clearCanvasAndShowMessage = function( message ){
        
        $( root ).empty();
			
		var messageOnCanvasDiv = d3.select( root ).append("div")
            .attr("id", "eexcess_message_on_canvas");
			
		messageOnCanvasDiv.append("span")
            .text( message );	
			
        if( message == STR_LOADING ){
            messageOnCanvasDiv.append("img")
                .attr("src", LOADING_IMG);
        }
    };
            


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    var BOOKMARKS = {};


    BOOKMARKS.internal = {

        currentBookmark :{
                        'bookmark-name': '',
                        'color': '',
                        'type': ''
                        },

        currentItem : {},


        getCurrentBookmark : function(){

            var bookmarkName = $(bookmarkDropdownList).find('span').text();
            var color = '', type = '';

            if( bookmarkName == STR_NEW ){
                bookmarkName = $(bookmarkDialogInputWrapper).find('input').val();
                color = $(colorPickerId).css('backgroundColor');
                type = 'new';
            }
            this.currentBookmark['bookmark-name'] = bookmarkName;
            this.currentBookmark['color'] = color;
            this.currentBookmark['type'] = type;

            return this.currentBookmark;
        },


        setCurrentItem : function(item, index){
            //this.currentItem['item'] = item;
            this.currentItem['item'] = {
                'id': item.id,
                'title': item.title,
                'facets': item.facets,
                'uri': item.uri,
                'coordinate': item.coordinate,
                'query': query
            };
            this.currentItem['index'] = index;
        },


        getCurrentItem : function(){ return this.currentItem['item']; },

        getCurrentItemIndex : function(){ return this.currentItem['index']; },

        validateBookmarkToSave : function(){
            var $message = $(newBookmarkOptionsId).find('p');

            // validation for new bookmark name
            if(
				(this.currentBookmark['type'] == 'new' && this.currentBookmark['bookmark-name'] == '') ||
				this.currentBookmark['bookmark-name'].length > 15) {
                $message.fadeIn('slow');
                return false;
            }

            $message.fadeOut('fast');
            return true;
        }

    };



    BOOKMARKS.updateBookmarkedItems = function(){
        
		//bookmarkedItems = BookmarkingAPI.getBookmarkedItemsById(idsArray);
		//console.log('bisher: ');
		//console.log(bookmarkedItems);
		 
		bookmarkedItems = {};
		var allBookmarks = BookmarkingAPI.getAllBookmarks();
		if (!allBookmarks)
			return;
		Object.keys(allBookmarks).forEach(function(bookmarkKey){
			allBookmarks[bookmarkKey].items.forEach(function(itemsElement){	
				
				var itemEntry = itemsElement['id'];
				if(typeof bookmarkedItems[itemEntry] == 'undefined' || bookmarkedItems[itemEntry] == 'undefined'){
					bookmarkedItems[itemEntry] = { 'bookmarked' : new Array() };
				}

				bookmarkedItems[itemEntry].bookmarked.push({
					'bookmark-name' : bookmarkKey,
					'bookmark-id' : allBookmarks[bookmarkKey].id,
					'color' : allBookmarks[bookmarkKey].color
				});
				
			});
		});
		
		//experimental code end to do ask cecillia ??
		//console.log('neu: ');
		//console.log(bookmarkedItems);
		
        console.log('----- BOOKMARKED ITEMS -----');
        console.log(bookmarkedItems);
    };

    //BOOKMARKS.buildSaveBookmarkDialog = function(d, i, sender) {
	BOOKMARKS.buildSaveBookmarkDialog = function(datum, firstFunc,titleOutput,savebutton, sender) {

		$(filterBookmarkDialogId+">div").removeClass("active").children("ul").slideUp('slow');

        BOOKMARKS.destroyBookmarkDialog();
        isBookmarkDialogOpen = true;

		firstFunc(this);
        //this.internal.setCurrentItem(d, i);

        var topOffset = $(contentPanel).offset().top;

        // Append bookmark form to content item
        var dialogBookmark = d3.select("body").append("div")
            .attr("id", "eexcess-save-bookmark-dialog")
            .attr("class", "eexcess-bookmark-dialog")
            .style('display', 'none')
            .style("top", topOffset + "px" );

        dialogBookmark.on('click', function(){ d3.event.stopPropagation(); });

        dialogBookmark.append("div")
            .attr("class", "eexcess-bookmark-dialog-title")
            .text("Bookmark Item");

        // Append details section
        var bookmarkDetails = dialogBookmark.append('div')
            .attr('class', 'eexcess-boookmark-dialog-details');

        bookmarkDetails.append('span').attr('class', 'label').text('Title:');
        //bookmarkDetails.append('p').text(d.title);
		titleOutput(bookmarkDetails);
        //bookmarkDetails.append('span').text('Query:');
        //bookmarkDetails.append('p').text(query);

        // Append settings section (for bookmark selection or definition of new bookmark)
        var bookmarkSettings = dialogBookmark.append("div")
            .attr("class", "eexcess-bookmark-dialog-settings");

        bookmarkSettings.append("span").attr('class', 'label').text("Add to:");

        // array to be sent to plugin building the dropdown list with the list items and the corresponding colors
        var optionsData = $.merge([{'bookmark-name': STR_NEW, 'color': ''}], BookmarkingAPI.getAllBookmarkNamesAndColors());

        var bookmarksListContainer = bookmarkSettings.append("div").attr("class", "eexcess-bookmark-dropdown-list")
            .append('ul');

        var bookmarksListData = bookmarksListContainer.selectAll('li').data(optionsData);

        bookmarksList = bookmarksListData.enter().append('li');
        bookmarksList.append('a').text(function(b){ return b["bookmark-name"];});
        bookmarksList.append('div').text(function(b){ return b.color; });

        // Create dropdown list to select bookmark
        $( bookmarkDropdownList ).dropdown({
            'change' : EVTHANDLER.bookmarkDropdownListChanged
        });

        // Add wrapper div containing icon for color picking, text input and legendbookmarkDetails.append('p').text(d.title);
        var newBookmarkOptions = bookmarkSettings.append("div")
            .attr("class", "eexcess-bookmark-dialog-optional");

        newBookmarkOptions.append("div")
            .attr("id", "eexcess-bookmak-dialog-color-picker")
            .attr("title", "Select Color");


        newBookmarkOptions.append("div")
            .attr("class", "eexcess-bookmark-dialog-input-wrapper")
            .append("input");

        newBookmarkOptions.append('p')
            .text(STR_BOOKMARK_NAME_MISSING)
            .style('display', 'none');

        var bookmarkButtonsWrapper1 = dialogBookmark.append("div")
            .attr("class", "eexcess-bookmark-buttons-wrapper");

        bookmarkButtonsWrapper1.append("input")
            .attr("type", "button")
            .attr("class", "eexcess-bookmark-button")
            .attr("style", "width:65px;")
            .attr("value", "Save new")
			.on("click",savebutton);
            //.on("click", EVTHANDLER.bookmarkSaveButtonClicked);


        // Also show delete - buttons in this dialog.
		// Todo: remove the old bookmark-info popup
        if (datum && bookmarkedItems[datum.id]){
            //var bookmarkListToDelete = dialogBookmark.append("div")
            //    .attr("class", "eexcess-bookmark-bookmarkList");

            var bookmarkedInSection = dialogBookmark.append('div').attr('class', 'eexcess-bookmark-bookmarked-in-section');
            bookmarkedInSection.append('span').attr('class', 'label').style('width', '100%').text('Already bookmarked in:');

            var itemBookmarksData = bookmarkedInSection.selectAll('div')
                .data(bookmarkedItems[datum.id].bookmarked);

            var itemInBookmarks = itemBookmarksData.enter().append('div')
                    .attr('class', 'eexcess-bookmark-bookmarked-in');

            itemInBookmarks.append('div')
                .attr('class', 'eexcess-bookmark-color-icon')
                .style('background-color', function(d){ return d.color; });

            itemInBookmarks.append('span').text(function(d){ return d["bookmark-name"]; });

            itemInBookmarks.append('img')
                .attr('src', REMOVE_SMALL_ICON)
                .attr('title', 'Remove item from this bookmark')
                .on('click', EVTHANDLER.removeBookmarkIconClicked);
        }





        // Append save and cancel buttons within container
        var bookmarkButtonsWrapper = dialogBookmark.append("div")
            .attr("class", "eexcess-bookmark-buttons-wrapper");


        bookmarkButtonsWrapper.append("input")
            .attr("type", "button")
            .attr("class", "eexcess-bookmark-button")
            .attr("value", "Close")
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
        $( bookmarkDialogClass ).remove();

        isBookmarkDialogOpen = false;
    };



    BOOKMARKS.saveBookmark = function(){

        var bookmark = this.internal.getCurrentBookmark();
        var item = this.internal.getCurrentItem();
        var index = this.internal.getCurrentItemIndex();

        if( this.internal.validateBookmarkToSave() ){
            if(bookmark['type'] == 'new')
                BookmarkingAPI.createBookmark(bookmark['bookmark-name'], bookmark['color']);

            console.log(BookmarkingAPI.addItemToBookmark(bookmark['bookmark-name'], item));

            BOOKMARKS.destroyBookmarkDialog();
            LIST.turnFaviconOnAndShowDetailsIcon(index);

            // Update ancillary variable
            BOOKMARKS.updateBookmarkedItems();
        }
    };

	


    BOOKMARKS.buildSeeAndEditBookmarkDialog = function( datum, index ){

        BOOKMARKS.destroyBookmarkDialog();
        isBookmarkDialogOpen = true;

        this.internal.setCurrentItem(datum, index);

        var topOffset = $(contentPanel).offset().top;

        var detailsDialog = d3.select('body').append('div')
            .attr('id', 'eexcess-see-and-edit-bookmark-dialog')
            .attr("class", "eexcess-bookmark-dialog")
            .style('top', topOffset + 'px')
            .style('display', 'none')
            .on("click", function(){ d3.event.stopPropagation(); });

        detailsDialog.append("div")
            .attr("class", "eexcess-bookmark-dialog-title")
            .text('Bookmark Info');        // = datum.tilte

        var detailsSection = detailsDialog.append('div')
            .attr('class', 'eexcess-boookmark-dialog-details');

        detailsSection.append('span').text('Title');
        detailsSection.append('p').text(datum.title);


        var bookmarkedInSection = detailsDialog.append('div').attr('class', 'eexcess-bookmark-bookmarked-in-section');
        bookmarkedInSection.append('span').style('width', '100%').text('Bookmarked in:');

        var itemBookmarksData = bookmarkedInSection.selectAll('div')
            .data(bookmarkedItems[datum.id].bookmarked);

        var itemInBookmarks = itemBookmarksData.enter().append('div')
                //.attr('id', function(d, i){ return 'eexcess-bookmark-bookmarked-in-' + i; })
                .attr('class', 'eexcess-bookmark-bookmarked-in');

        itemInBookmarks.append('div')
            .attr('class', 'eexcess-bookmark-color-icon')
            .style('background-color', function(d){ return d.color; });

        itemInBookmarks.append('span').text(function(d){ return d["bookmark-name"]; });

        itemInBookmarks.append('img')
            .attr('src', REMOVE_SMALL_ICON)
            .attr('title', 'Remove item from this bookmark')
            .on('click', EVTHANDLER.removeBookmarkIconClicked);


        // Append done button within container
        var bookmarkButtonsWrapper = detailsDialog.append("div")
            .attr("class", "eexcess-bookmark-buttons-wrapper");

        bookmarkButtonsWrapper.append("input")
            .attr("type", "button")
            .attr("class", "eexcess-bookmark-button")
            .attr("value", "Done")
            .on("click", EVTHANDLER.bookmarkDoneButtonClicked);

        $(detailsBookmarkDialogId).slideDown('slow');
    };
	


    BOOKMARKS.deleteBookmarkAndRefreshDetailsDialog = function(sender, bookmark, bookmarkIndex){

        var itemId = this.internal.getCurrentItem().id;
        var itemIndex = this.internal.getCurrentItemIndex();
        
        BookmarkingAPI.deleteItemFromBookmark(itemId, bookmark["bookmark-name"]);

        // sender is img element with remove icon
        $(sender.parentNode).remove();
		
		
		BOOKMARKS.updateBookmarkedItems();

        if(typeof bookmarkedItems[itemId] == 'undefined' || bookmarkedItems[itemId] == 'undefined')
            LIST.turnFaviconOffAndHideDetailsIcon(itemIndex);
			
		FILTER.changeDropDownList();
		
		//update list and drop down list
		$(filterBookmarkDialogId+">div>ul>li:eq("+currentSelectIndexPerFilter+")").trigger("click");

		$(filterBookmarkDialogId+">div>ul").css("display","none");
		$(filterBookmarkDialogId+">div").removeClass("active");
		//update list and drop down list
		
    };
	
	
	BOOKMARKS.exportBookmarks = function(){

		window.URL = window.URL;// || window.webkitURL;

		//console.log(BookmarkingAPI.getAllBookmarks());


		$(exportBookmark).on("click",function(evt){

			var bookmarkData = JSON.stringify(BookmarkingAPI.getAllBookmarks());
			var blob = new Blob([bookmarkData], {type: 'text/plain'});
			$(exportBookmark).attr("href", window.URL.createObjectURL(blob));
			$(exportBookmark).attr("download", "bookmarks.txt");
		});
		//$(exportBookmark).attr("href", window.URL.createObjectURL(blob));
		//$(exportBookmark).attr("download", "bookmarks.txt");
		
		
		

	};

	BOOKMARKS.importBookmarks = function(){
		function doOpen(evt,func) {
			var files = evt.target.files;
			var reader = new FileReader();
			reader.onload = function() {
				func(this.result);
			};
			reader.readAsText(files[0]);
		}
		
		$(importBookmarkStyle).on("click",function(evt){
			$(importBookmark).trigger("click");
		});

		$(importBookmark).on("change",function(evt){
			doOpen(evt,function(dataString){
			
				//update control
				FILTER.changeDropDownList();
				
				FILTER.showStars();
				FILTER.updateData();
				FILTER.showStars();
				FILTER.updateData();
			
			
				var importBookmarks = JSON.parse(dataString);
				console.log(importBookmarks);
				var allBookmarks = BookmarkingAPI.getAllBookmarks();
				console.log(allBookmarks);
				
				//compare items id's
				function searchItemId(items,searchedId){
					items.forEach(function(item){
						if(item.id == searchedId){
							return true;
						}
					});
					return false;
				}
				
				//compare and create bookmark items
				function importItems(bookmark){
					importBookmarks[bookmark].items.forEach(function(currentItem){
						if(!searchItemId(allBookmarks[bookmark].items,currentItem.id)){
							BookmarkingAPI.addItemToBookmark(bookmark,currentItem);
						}
					});
				}
				
				//compare and create two bookmarks
				Object.keys(importBookmarks).forEach(function(currentBookmark){
					if(allBookmarks.hasOwnProperty(currentBookmark)){
						importItems(currentBookmark);
					}else{
						BookmarkingAPI.createBookmark(currentBookmark,importBookmarks[currentBookmark].color);
						importItems(currentBookmark);
					}
				});
				

			});
			
			FILTER.showStars();
			FILTER.updateData();
			FILTER.showStars();
			FILTER.updateData();
			
		});
	
	};


	
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	///////////// External calls to allow overloaded visualization communicate with the template


    var EXT = {};
	
		
	EXT.ListItemSelected = function(datum, index, scrollToFirst){
		LIST.selectListItem( datum, index, true, false, scrollToFirst );
	};
	
	
	EXT.selectItems = function( itemIndicesArray, scrollToFirst ){
		LIST.highlightListItems( itemIndicesArray, scrollToFirst );
	};

	EXT.getAllSelectListItems = function(){
		return VISPANEL.getAllSelectListItems();
	};
	
    EXT.faviconClicked = function(d, i){
    	EVTHANDLER.faviconClicked(d, i);
    }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    var FILTER = {};

	var currentSelectIndex = 0;
	var currentSelectIndexPerFilter = 0;

	//change new Bookmarks
	FILTER.changeDropDownList = function(){
	
		$( filterBookmarkDialogId ).remove();
		
		var topOffset = $('#eexcess_bookmarkingcollections-placeholder').offset().top;
		var dialogBookmark = d3.select("#eexcess_bookmarkingcollections-placeholder").append("span")//div
			.attr("id", "eexcess-filter-bookmark-dialog")
			.attr("class", "eexcess-filter-bookmark-dialog")
			.style("top", topOffset + "px" )
			//.style("width","200px")
			;
		
		var bookmarksListContainer = dialogBookmark.append("div")
			.attr("class", "eexcess-bookmark-dropdown-list")
			.append('ul');

		var bookmarks = BookmarkingAPI.getAllBookmarkNamesAndColors();
		
		var bookmarkCount = 0;
		bookmarks.forEach(function(elementData,indexData){
			bookmarkCount = 0;
			bookmarkCount = BookmarkingAPI.getAllBookmarks()[elementData["bookmark-name"]].items.length;
			elementData["bookmark-name"] = elementData["bookmark-name"] + " : ("+bookmarkCount+")";
		});

	    var optionsData =  $.merge([{'bookmark-name': STR_SHOWALLRESULTS, 'color': ''}], 
			bookmarks
		);
		
		var bookmarksListData = bookmarksListContainer.selectAll('li').data(optionsData);

        var bookmarksList = bookmarksListData.enter().append('li');
        bookmarksList.append('a')
        	//.attr("title", function(b){ return b["bookmark-name"];})
        	.text(function(b){ return b["bookmark-name"];})
	        //.each(function(b) {
	        //    var link = d3.select(this);
	        //    link.attr("title", b["bookmark-name"]);
	        //})
	        ;
        bookmarksList.append('div').text(function(b){ return b.color; });
		
        $(filterBookmarkDropdownList).dropdown({
		   'change':function(evt,index){
				currentSelectIndexPerFilter = index;

				
				evt = evt.split(":")[0].trim();
				var input ={};
				indicesToHighlight =[];

				if(evt == STR_SHOWALLRESULTS){
				
					FILTER.showStars();
					FILTER.updateData();
					
					$(deleteBookmark).prop("disabled",true);
				}else{
					//filtered bookmark from data
					var currentBookmarkItems = BookmarkingAPI.getAllBookmarks()[evt].items;

					//FILTER.filterBookmark(inputData,currentBookmarkItems,function(inputData,indexData){
					//	input.data.push(inputData[indexData]);
					//});
					
					input.data = [];
					var bookmarkCount = 0;
					currentBookmarkItems.forEach(function(item){
						input.data.push(item);
						indicesToHighlight.push(++bookmarkCount);
					});
					data = input.data;
					
					FILTER.updateData();
					$(deleteBookmark).prop("disabled",false).css("background","");
				}
		   }
        });
		
		$(filterBookmarkDialogId).on("mousedown",function(evt){
			BOOKMARKS.destroyBookmarkDialog();
			isBookmarkDialogOpen = false;	
		});
		
		$(filterBookmarkDialogId).slideDown('slow');
	};
	
	/*
	FILTER.filterBookmark = function(inputDataParam,currentBookmark,func){
		inputDataParam.forEach(function(elementData,indexData){
			currentBookmark.forEach(function(elementBookmark,indexBookmark){
				if(elementData.id == elementBookmark.id){
					func(inputDataParam,indexData);
				}
			});
		});
	}
	*/
	
	// build filter bookmark and delete bookmark control.
	FILTER.buildFilterBookmark = function(){
	
	    BOOKMARKS.destroyBookmarkDialog();
		inputData=data;

		FILTER.changeDropDownList();
		
		d3.select(addBookmarkItems).on("click", FILTER.buildAddBookmarkItems);
		
		d3.select(deleteBookmark).on("click",function(){

			if (confirm("Delete current bookmark?") == true) {
				var bookmarkName = $(filterBookmarkDialogId+">div>span").text().split(":")[0].trim();
				BookmarkingAPI.deleteBookmark(bookmarkName);
				
				FILTER.changeDropDownList();
				
				FILTER.showStars();
				FILTER.updateData();
				FILTER.showStars();
				FILTER.updateData();
			} 

		});
		$(deleteBookmark).prop("disabled",true);
	};
	
	FILTER.showStars = function(){
		var input ={};
		input.data = [];
		input.data = inputData;
		// update bookmarking changes:
		input.data.forEach(function(dataItem){
			if(typeof bookmarkedItems[dataItem.id] != 'undefined' &&
				bookmarkedItems[dataItem.id] != 'undefined'){
				dataItem['bookmarked'] = true;
			}else{
				dataItem['bookmarked'] = false;
			}	
		});
		data = input.data;	
		
		//FILTER.updateData();
	};
	
	FILTER.updateData = function(){
		// Initialize template's elements
		//PREPROCESSING.setAncillaryVariables();
		BOOKMARKS.updateBookmarkedItems();
		//PREPROCESSING.extendDataWithAncillaryDetails();
		QUERY.updateHeaderText( "Query Results : " + data.length );
		QUERY.updateSearchField( query );
		//CONTROLS.reloadChartSelect();
		LIST.buildContentList();
		VISPANEL.drawChart();
	};
	
	
	

	FILTER.buildAddBookmarkItems = function(d, i){
//BookmarkingAPI.deleteBookmark("");
        d3.event.stopPropagation();
		BOOKMARKS.buildSaveBookmarkDialog(
            d,
			function(thisValue){},
			function(bookmarkDetails){
				bookmarkDetails.append('p').text("selected bookmarks items");
			},
			function(){

				FILTER.addBookmarkItems();

				//$(filterBookmarkDialogId+">div>ul>li:eq("+currentSelectIndex+")").trigger("click");
				var bookmark = BOOKMARKS.internal.getCurrentBookmark();
				if(bookmark['type'] == 'new' || bookmark['type'] == ''){
					$(filterBookmarkDialogId+">div>ul>li:eq("+
						BookmarkingAPI.getAllBookmarkNamesAndColors().length
					+")").trigger("click");
				}else{
					$(filterBookmarkDialogId+">div>ul>li:eq("+currentSelectIndex+")").trigger("click");
				}
				
				$(filterBookmarkDialogId+">div>ul").css("display","none");
				$(filterBookmarkDialogId+">div").removeClass("active");

				
			},
			this
		);
	};

	
	
	FILTER.addBookmarkItems = function(){
		//console.log(indicesToHighlight);
		var bookmark = BOOKMARKS.internal.getCurrentBookmark();
		
		if( BOOKMARKS.internal.validateBookmarkToSave() ){
		
			//var bookmark = BOOKMARKS.internal.getCurrentBookmark();
			if(bookmark['type'] == 'new'){
				BookmarkingAPI.createBookmark(bookmark['bookmark-name'], bookmark['color']);
			}	

			function addBookmarkFunc(currentData,index){
				var bookmarkItem = {
					'id': currentData.id,
					'title': currentData.title,
					'facets': currentData.facets,
					'uri': currentData.uri,
					'coordinate': currentData.coordinate,
					'query': query
				};
				BookmarkingAPI.addItemToBookmark(bookmark['bookmark-name'], bookmarkItem);
				LIST.turnFaviconOnAndShowDetailsIcon(index);
			}
			
			if(indicesToHighlight.length > 0){
				var currentData;
				indicesToHighlight.forEach(function(indexValue){
					//console.log(indexValue);
					//console.log(data[indexValue]);
					
					currentData = data[indexValue];
					addBookmarkFunc(currentData,indexValue);
				});
			}
			
			BOOKMARKS.destroyBookmarkDialog();
			FILTER.changeDropDownList();
			
			FILTER.showStars();
			FILTER.updateData();
			FILTER.showStars();
			FILTER.updateData();

		}
	};

    return START;
}


	
	

