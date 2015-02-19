
(function VisController() {

    var self = this;

    var width  = $(window).width();     // Screen width
    var height = $(window).height();    // Screen height


    // DOM Selectors
    var root = "#eexcess_canvas";                                               // String to select the area where the visualization should be displayed

    var headerPanel = "#eexcess_header";                                        // header dom element
    var headerInfoSection = "#eexcess_header_info_section span";
    var headerTaskSection = "#eexcess_header_task_section";                     // Section wrapping #items, task, finish and expand/collapse buttons
    var headerControlsSection = "#eexcess_header_control_section";
    var btnShowList = "#eexcess_list_button";
    var btnShowText = "#eexcess_text_button";
    var btnFinished = "#eexcess_finished_button";                               // Finishes the task and redirects back to the initial screeen
    var sampleTextSection = "#eexcess_topic_text_section";
    var selectedItemsSection = "#eexcess_selected_items_section";               // Section listing items marked as relevant by the user
    var selectedItemsClass = ".eexcess_selected_item";                          // Selected item contained in selectedItemsSection

    var mainPanel = "#eexcess_main_panel";                                      // Panel containing tag cloug, canvas (in #eexcess_vis) and content list
    var inputCriteria = '.eexcess_vis_controls_input';
    var tagContainer = "#eexcess_keywords_container";                           // Selector for div wrapping keyword tags
    var tagClass = ".eexcess_keyword_tag";                                      // Selector for all keyword tags
    var tagId = "#tag-";                                                        // Id selector for tags in tag container
    var tagPos = "tag-pos-";                                                    // attribute for keyword tags. value assigned = index
    var tagBox = "#eexcess_keywords_box";                                       // Selector for div where tags are droppped
    var tagClassInBox = ".eexcess_keyword_tag_in_box";                          // Selector for keyword tags inside tag box
    var weightSliderClass = ".eexcess_weight_slider";                           // Selector for slider class within tags in tag box
    var weightSliderId = "#eexcess_weight_slider_pos-";                         // Id selector for slider within tags in tag box
    var tagImgClass = ".eexcess_tag_img";                                       // Selector for "delete" icon in tags inside tag box
    var btnReset = "#eexcess_btnreset";                                         // Selector for reset button in vis control panel
    var btnRankByOverall = "#eexcess_btn_sort_by_overall_score";                // Button that triggers ranking by overall score criteria
    var btnRankByMax = "#eexcess_btn_sort_by_max_score";                        // Button to rank by max score criteria

    var visPanelCanvas = "#eexcess_vis_panel_canvas";
    var contentPanel = "#eexcess_content";                                      // Selector for content div on the right side
    var contentList = "#eexcess_content .eexcess_result_list";                  // ul element within div content
    var allListItems = "#eexcess_content .eexcess_result_list .eexcess_list";   // String to select all li items by class
    var listItem = "#data-pos-";                                                // String to select individual li items by id
    var rankingContainerClass = ".eexcess_ranking_container";                   // class selector for div wrapping ranking indicators in content list
    var allListItemTitles = ".eexcess_ritem_title";
    var favIconClass = ".eexcess_favicon_section";
    var detailsSections = '.eexcess_item_details_section';

    var documentDetailsTitle = "#eexcess_document_details_title";
    var documentDetailsYear = "#eexcess_document_details_year";
    var documentDetailsLanguage = "#eexcess_document_details_language";
    var documentDetailsProvider = "#eexcess_document_details_provider";
    var documentViewer = '#eexcess_document_viewer';


    // Constants
    var TAG_CATEGORIES = 5;
    var SELECTED_ITEMS_REQUIRED = 5;

    var LOADING_IMG = "media/loading.gif";
    var DELETE_ICON_IMG = "media/fancybox_sprite_close.png";
    var NO_IMG = "media/no-img.png";
    var FAV_ICON_OFF = "media/favicon_off.png";
    var FAV_ICON_ON = "media/favicon_on.png";
    var REMOVE_SMALL_ICON = "media/batchmaster/remove.png"
    var ICON_EUROPEANA =  "media/Europeana-favicon.ico";
    var ICON_MENDELEY = "media/mendeley-favicon.ico";
    var ICON_ZBW = "media/ZBW-favicon.ico";
    var ICON_WISSENMEDIA = "media/wissenmedia-favicon.ico";
    var ICON_KIM_COLLECT = "media/KIM.Collect-favicon.ico";
    var ICON_UNKNOWN = "media/help.png";
    var ARROW_DOWN_ICON = "media/batchmaster/arrow-down.png";
    var ARROW_UP_ICON = "media/batchmaster/arrow-up.png";

    var STR_DROPPED = "Dropped!";
    var STR_DROP_TAGS_HERE = "Drop tags here!";
    var STR_JUST_RANKED = "new";
    var STR_SEARCHING = "Searching...";
    var STR_NO_INDEX = 'no_index'


    // variables from dataset
    var dataset,
        data,                       // contains the data to be visualized
        keywords,
        query,                      // string representing the query that triggered the current recommendations
        sampleText, task, questions;

    // Ancillary variables
    var dataRanking,                    // array that represents the current ranking. Each item is an object specifying "originalIndex, "overallScore", "rankingPos" and "positionsChanged"
        selectedTags = [],              // array of DOM elements contained in the tag box
        rankingCriteria = 'overall_score',
        showRanking;

    // Ranking object
    var  rankingVis;


    // Color scales
    var tagColorRange = colorbrewer.Blues[TAG_CATEGORIES + 1];
    tagColorRange.splice(tagColorRange.indexOf("#08519c"), 1, "#2171b5");
    var tagColorScale = d3.scale.ordinal().domain(d3.range(0, TAG_CATEGORIES, 1)).range(tagColorRange);
    var textTagColorScale = d3.scale.ordinal().range(['#eee', '#ddd', '#333', '#222', '#222']);
    var weightColorRange = colorbrewer.Set1[9];
    weightColorRange.splice(weightColorRange.indexOf("#ffff33"), 1, "#ffd700");
    var weightColorScale = d3.scale.ordinal().range(weightColorRange);


    // NLP
    var stemmer = natural.PorterStemmer;
    var nounInflector = new natural.NounInflector();
    stemmer.attach();
    nounInflector.attach();

    // User Evaluations variables
    var taskStorage = new TaskStorage(),
        currentTask,
        currentQuestion,
        startTime,
        taskResults = {
            "timestamp" : "",
            "task-number" : "",
            "dataset-id" : "",
            "description" : "",
            "tool-aided" : "",
            'overall-time' : 0,
            'questions-results' : []
        };

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    var EVTHANDLER = {};


    EVTHANDLER.canvasResized = function(){
        VISPANEL.resizeRanking();
    };


    ////////    Rank button clicked (by overall or max score)   ////////

    EVTHANDLER.rankButtonClicked = function(sender){
        rankingCriteria = $(sender).attr('sort-by');
        if(dataRanking.length > 0)
            LIST.rankRecommendations();
    };



    ////////    Reset Button Click  ////////

    EVTHANDLER.btnResetClicked = function(){
        TAGCLOUD.clearTagbox();
        TAGCLOUD.buildTagCloud();
        LIST.resetContentList();
        VISPANEL.resetRanking();
        DOCPANEL.clear();
    };



    ////////    content list item click ////////

    EVTHANDLER.listItemClicked = function(d, i){
        LIST.selectListItem(i);
    };

    ////////    list item mouseover ////////
    EVTHANDLER.listItemHovered = function(d, index){
        LIST.hoverListItem(index);
    };


    ////////    list item mouseout  ////////
    EVTHANDLER.listItemUnhovered = function(d, index){
        LIST.unhoverListItem(index);
    };



    ////////    Tag in box mouseovered  ////////

    EVTHANDLER.tagInBoxMouseOvered = function(){
        d3.select(this)
            .style( "background", function(k){ return getGradientString("#0066ff", [1, 0.8, 1]); })
            .style("color", "#eee");
    };


    ////////    Tag in box mouseouted   ////////

    EVTHANDLER.tagInBoxMouseOuted = function(){
        d3.select(this)
            .style( "background", function(k){ return getGradientString(tagColorScale(k.colorCategory+1), [1, 0.7, 1]); })
            .style("color", "#111");
    };



    ////////    Delete tag click    ////////

    EVTHANDLER.deleteTagClicked = function(tag){
        TAGCLOUD.deleteTagInBox(tag);
    };


    ////////    Draggable   ////////

    var draggedItem;
    var isOverDroppable;

    EVTHANDLER.dragStarted = function(event, ui) {
        draggedItem = $(this).hide();
        isOverDroppable = false;
    };


    EVTHANDLER.dragStopped = function(event, ui) {
        draggedItem.show();
        if(isOverDroppable){
            $(this).draggable('destroy');
            var keywordTerm = d3.select(draggedItem[0]).text();
            LIST.rankRecommendations();
        }
    };


    ////////    Droppable   ////////

    EVTHANDLER.dropped = function(event, ui){
        TAGCLOUD.dropTagInTagBox( ui.draggable );
        ui.draggable.draggable( BEHAVIOR.draggableOptions );
        isOverDroppable = true;
    };


    ////////    Slider  ////////

    EVTHANDLER.slideSlided = function(event, ui) {
        TAGCLOUD.changeKeywordInBoxWeight( this, ui );
    };


    EVTHANDLER.slideStopped = function() {
        LIST.rankRecommendations();
    };



    EVTHANDLER.faviconClicked = function(d, i){
        d3.event.stopPropagation();
        var index = (typeof dataRanking !== 'undefined' && dataRanking.length > 0) ? dataRanking[i].originalIndex :  i;
        HEADER.addItemToListOfSelected(index);
        LIST.switchFaviconOnOrOff(index);
    };


    EVTHANDLER.removeSelectedItemIconClicked = function(event, index) {
        event.stopPropagation();
        HEADER.removeItemFromListOfSelected(index);
        LIST.switchFaviconOnOrOff(index);
    };


    ////////    Show List button    ////////

    EVTHANDLER.btnListClicked = function(event){
        event.stopPropagation();
        $(sampleTextSection).slideUp();
        $(selectedItemsSection).slideToggle();
    };


    ////////    Show Text button    ////////

    EVTHANDLER.btnTextClicked = function(event){
        event.stopPropagation();
        $(selectedItemsSection).slideUp();
        $(sampleTextSection).slideToggle();
    };


    ////////    Finished button ////////

    EVTHANDLER.btnFinishedClicked = function(){
      HEADER.finishQuestion();
    };





////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    var PREPROCESSING = {};


    PREPROCESSING.extendDataWithAncillaryDetails = function(){

        data.forEach(function(d){
            d['isSelected'] = false;
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



    PREPROCESSING.extendKeywordsWithColorCategory = function(){

        var extent = d3.extent(keywords, function(k){ return k['repeated']; });
        var range = (extent[1] - 1/*extent[0]*/) * 0.1;   // / TAG_CATEGORIES;
        //console.log('extent --> ' + extent[0] + ' - ' + extent[1]);
        //console.log('range = ' + range);
        catArray = [];
        for(var i = 0; i < TAG_CATEGORIES; i++)
            catArray[i] = 0;

        keywords.forEach(function(k){
            var colorCategory = parseInt((k['repeated'] - 1/*extent[0]*/) / range);
            k['colorCategory'] = (colorCategory < TAG_CATEGORIES) ? colorCategory : TAG_CATEGORIES - 1;
          //  console.log('******* ' + k.term + ' --- repeated = ' + k.repeated + ' --- color category = ' + k.colorCategory);
            catArray[k.colorCategory]++;
        });
        //console.log(catArray);
    };




////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    var HEADER = {};


    HEADER.internal = {
        validateIsQuestionAnswered : function(){
            var numberOfSelectedItems = $(selectedItemsClass).length;
            if(numberOfSelectedItems < SELECTED_ITEMS_REQUIRED){
                return confirm("You need to select exactly " + SELECTED_ITEMS_REQUIRED + " items" +
                    "\n Items selected = " + numberOfSelectedItems + 
                    "\n Are you sure you want to finish Question #" + (currentQuestion+1));
            }
            else if(numberOfSelectedItems > SELECTED_ITEMS_REQUIRED){
                alert("You must select exactly " + SELECTED_ITEMS_REQUIRED + " items from the list" +
                     "\n Items selected = " + numberOfSelectedItems);
                return false;
            }
            return true;
        }

    };


    HEADER.showInfoInHeader = function(){
        // Display number of results on the left of header
        $(headerInfoSection).html("Number of Items: " + data.length);

        // Display task on the left of header
        $(headerTaskSection).find('#p_task').html('TASK: ' + task);
        $(headerTaskSection).find('#p_question').html(questions[currentQuestion]);

        $(sampleTextSection).find('p').html(sampleText);
    }


    HEADER.addItemToListOfSelected = function(index){

        if(!data[index].isSelected){
            var selectedItemContainer = d3.select(selectedItemsSection).append('div')
                .attr('class', 'eexcess_selected_item')
                .attr('original-index', index);

            selectedItemContainer.append('span').text(data[index].title);
            selectedItemContainer.append('img').attr("src", REMOVE_SMALL_ICON);

            $(selectedItemsSection).find("div[original-index='" + index + "']").find('img').click(function(event){ EVTHANDLER.removeSelectedItemIconClicked(event, index); });
        }
        else{
            HEADER.removeItemFromListOfSelected(index);
        }
    };



    HEADER.removeItemFromListOfSelected = function(index) {
        $(selectedItemsSection).find("div[original-index='" + index + "']").remove();
    };


    HEADER.clearListOfSelected = function(index) {
        $(selectedItemsSection).empty();
    };


    HEADER.finishQuestion = function(){

        if(HEADER.internal.validateIsQuestionAnswered()){
            var elapsedTime = parseInt($.now() - startTime);

            var selectedItems = [];
            $(selectedItemsClass).each(function(i, item){
                var index = $(item).attr('original-index');
                var datumToSave = {
                    id : data[index].id,
                    title : data[index].title
                };
                selectedItems.push(datumToSave);
            });

            var questionResult = {
                'question-number' : currentQuestion + 1,
                'time': elapsedTime,
                'selected-items': selectedItems
            };
            taskResults["questions-results"].push(questionResult);

            currentQuestion++;
            if(currentQuestion < questions.length)
                initializeNextQuestion();
            else{
                taskResults['timestamp']    = new Date().toString();
                taskResults["task-number"]  = currentTask;
                taskResults['dataset-id']   = dataset['dataset-id'];
                taskResults['topic']        = dataset['topic'];
                taskResults['total-items']  = dataset['totalResults'];
                taskResults['description']  = dataset['description'];
                taskResults['tool-aided']   = dataset['tool-aided'];

                // calculate overall time
                taskResults["questions-results"].forEach(function(q, i){
                    taskResults['overall-time'] += q.time;
                    q.time = q.time.toTime();
                });
                taskResults['overall-time'] = taskResults['overall-time'].toTime();

                console.log(taskResults);
                taskStorage.saveTask(taskResults);
                console.log(JSON.stringify(taskStorage.getEvaluationResults()));
                self.location = "task_completed.html";
            }
        }
    };



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    var BEHAVIOR = {};


    BEHAVIOR.draggableOptions = {
            revert: 'invalid',
            helper: 'clone',
            appendTo: tagBox,
            start: EVTHANDLER.dragStarted,
            stop: EVTHANDLER.dragStopped
        };


    BEHAVIOR.droppableOptions = {
            tolerance: 'touch',
            drop: EVTHANDLER.dropped
        };


    BEHAVIOR.sliderOptions = {
            orientation: 'horizontal',
            animate: true,
            range: "min",
            min: 0,
            max: 1,
            step: 0.2,
            value: 0.6,
            slide: EVTHANDLER.slideSlided,
            stop: EVTHANDLER.slideStopped
        };




////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    var TAGCLOUD = {};

    /**
     * Clear tag box when reseting the template
     * */
    TAGCLOUD.clearTagbox = function(){
        $(tagBox).empty();
        $('<p></p>').appendTo($(tagBox)).text(STR_DROP_TAGS_HERE);
        selectedTags = [];
        TAGCLOUD.updateTagColor();
    };


    /**
     * Append one tag per keyword and add drag & drop behavior
     *
     * */
    TAGCLOUD.buildTagCloud = function(){
        // Empty tag container
        $(tagContainer).empty();
        // Append one div per tag
        d3.select(tagContainer).selectAll(tagClass)
            .data(keywords)
            .enter()
            .append("div")
                .attr( "class", "eexcess_keyword_tag" )
                .attr( "id", function(k, i){ return "tag-"+i; })
                .attr('tag-pos', function(k, i){ return i; })
                .attr('is-selected', false)
                .style( "background", function(k){ return getGradientString(tagColorScale(k.colorCategory+1), [1, 0.7, 1]); })
                .text( function(k){ return k.term; })
                .on( "mouseover", EVTHANDLER.tagInBoxMouseOvered)
                .on( "mouseout", EVTHANDLER.tagInBoxMouseOuted);

        // bind drag behavior to each tag
        $(tagClass).draggable( BEHAVIOR.draggableOptions );

        // bind droppable behavior to tag box
        $(tagBox).droppable( BEHAVIOR.droppableOptions );
    };



    TAGCLOUD.dropTagInTagBox = function( tag ){
        // Set tag box legend
        $(tagBox).find('p').remove();

        if (tag.hasClass("eexcess_keyword_tag")) {
            selectedTags.push(tag);
            TAGCLOUD.buildDroppedTag(tag);
        }
    };


    /**
     * Re-build tag dropped in tag box, add slider and delete icon
     *
     * */
    TAGCLOUD.buildDroppedTag = function( tag ){

        // Append dragged tag onto tag box
        $(tagBox).append(tag);

        // Change tag's class
        tag.removeClass( "eexcess_keyword_tag" ).addClass( "eexcess_keyword_tag_in_box" )
            .attr('is-selected', true);

        // Append "delete" icon to tag and bind event handler
        $("<img class=\"eexcess_tag_img\" src=\"" + DELETE_ICON_IMG + "\" />").appendTo(tag)
            .click(function(){ EVTHANDLER.deleteTagClicked(tag); });

        /*
        var indexHist = $(".div-histogram").length;
        d3.select(tag[0]).append("div").attr("class", "div-histogram").attr('id', 'histogram-' + indexHist);
        */

        // Add new div to make it a slider
        $("<div class='div-slider'></div>").appendTo(tag).slider( BEHAVIOR.sliderOptions );

        // Retrieve color in weightColorScale for the corresponding label
        // Create weight slider
        //var label = $(tag).text();
        var stem = d3.select(tag[0]).data()[0].stem;
        var aux = weightColorScale(stem);
        var rgbSequence = hexToR(aux) + ', ' + hexToG(aux) + ', ' + hexToB(aux);

        // Set tag's style
        d3.select(tag[0])
            .style("background", function(){ return "rgba("+ rgbSequence + ", 0.6)"; })
            .style("color", "")
            .style("border", "solid 0.2em " + aux)
            .on("mouseover", "")
            .on("mouseout", "");

        // Reset the draggability
        tag.draggable('destroy');
    };



    /**
     *  Adjust opacity of the tag when the weightslider is changed
     *
     * */
    TAGCLOUD.changeKeywordInBoxWeight = function( keywordSlider, ui ){

        var tag = keywordSlider.parentNode;
        var stem = d3.select(tag).data()[0].stem;
        var aux = weightColorScale(stem);
        var rgbSequence = hexToR(aux) + ', ' + hexToG(aux) + ', ' + hexToB(aux);

        d3.select(tag).style("background", "rgba("+ rgbSequence + "," + ui.value + ")");
    };




    /**
     *  Actions executed when the event corresponding to deleting a tag in the tag box is triggered, including detaching it from the tag box,
     *  re-building the tag cloud, updating the "selectedTags" array, which stores the DOM elements for each tag in the box
     *
     * */
    TAGCLOUD.deleteTagInBox = function(tag){

        TAGCLOUD.restoreTagFromBoxToCloud(tag[0]);

        var index = 0;
        while( index < selectedTags.length && tag[0] != selectedTags[index][0] )
            index++;
        selectedTags.splice(index, 1);

        // update weightColorScale domain to adjust tag colors
        TAGCLOUD.updateTagColor();

        if( selectedTags.length == 0 ){
            $('<p></p>').appendTo($(tagBox)).text(STR_DROP_TAGS_HERE);
            LIST.resetContentList();
            VISPANEL.resetRanking();
        }
        else{
            LIST.rankRecommendations();
        }
    };



    /**
     *  Detach tag from tag box and return it to container (tag cloud)
     *
     * */
    TAGCLOUD.restoreTagFromBoxToCloud = function(tag){

        // Remove icon and slider
        $(tag).children().remove();
        // Change class
        $(tag)
            .removeClass("eexcess_keyword_tag_in_box").addClass("eexcess_keyword_tag")
            .attr('is-selected', false);

        // Restore style
        d3.select(tag)
            .style("background", function(k){ return getGradientString(tagColorScale(k.colorCategory+1), [1, 0.7, 1]) })
            .style("border", "")
            .style("color", "#111")
            .on( "mouseover", EVTHANDLER.tagInBoxMouseOvered)
            .on( "mouseout", EVTHANDLER.tagInBoxMouseOuted);

        $(tag).draggable(BEHAVIOR.draggableOptions);
        // Re-append to tag container, in the corresponding postion
        var tagIndex = parseInt($(tag).attr('tag-pos'));
        var i = tagIndex - 1;
        var firstTagIndex = $(tagContainer).find(tagClass + ':eq(0)').attr('tag-pos');

        while(i >= firstTagIndex && $(tagId + '' + i).attr('is-selected').toBool())
            --i;
        // Remove from tag box
        $(tag).detach();
        if(i >= firstTagIndex)    // The current tag should be inserted after another (tag-pos == i)
            $(tagId + '' + i).after(tag);
        else                      // The current tag is inserted in the first position of tag container
            $(tagContainer).prepend(tag);
    };



    TAGCLOUD.updateTagColor = function(){

        // Clear color scale domain
        weightColorScale.domain([]);

       // var tags = $( tagClassInBox );

        for(var i = 0; i < selectedTags.length; i++){
            // Reasign keyword to color scale domain
            var stem = d3.select(selectedTags[i][0]).data()[0].stem;
            var aux = weightColorScale(stem);
            var rgbSequence = hexToR(aux) + "," + hexToG(aux) + "," + hexToB(aux);
            var value = $(selectedTags[i][0]).find(".div-slider").slider("value");

            d3.select(selectedTags[i][0])
                .style("background", "rgba("+ rgbSequence + ", " + value + ")")
                .style("border", "solid 0.2em " + aux);
        }
    };



    /**
     *  Retrieves the selected keywords (in tag box) and the weight assigned by the user
     *  @return array. Each item is an object containing 'term' and 'weight'
     * */
    TAGCLOUD.getWeightedKeywordsInBox = function() {

        var  weightedKeywords = [];
        $(tagClassInBox).each(function(i, tag){
            var term = d3.select(tag).data()[0].term;
            var stem = d3.select(tag).data()[0].stem;
            var weight = parseFloat( $(tag).find(".div-slider").slider("value") / 10);
            weightedKeywords.push({ 'term': term, 'stem': stem, 'weight': weight });
        });
        return weightedKeywords;
    }





////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    var LIST = {};

    LIST.internal = {


        getFormattedTitle: function(title){
            if(title.length > 60)
                title = title.substring(0, 56) + '...';
            title = DOCPANEL.internal.highlightKeywordsInText(title, true);
            return title;

        },

        /**
         *  Calculates the index to scroll to, which depends on the existence or abscence of a ranking
         *  There exists a ranking if dataRanking.length > 0
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
        },

        getActualIndex : function(index){
            if(dataRanking.length == 0)
                return index;
            return dataRanking[index].originalIndex;
        },


        /**
         *  Creates the ranking items with default values and calculates the weighted score for each selected keyword (tags in tag box)
         *
         * */
        updateRanking: function(){

            dataRanking = [];
            data.forEach(function(d, i) {
                dataRanking.push({
                    'originalIndex': i,
                    'rankingPos': 0,
                    'overallScore': 0,
                    'maxScore' : 0,
                    'positionsChanged': 1000,
                    'weightedKeywords': new Array()
                });

                var max = 0;
                var keywordsInBox = TAGCLOUD.getWeightedKeywordsInBox();
                keywordsInBox.forEach(function(wk, j) {
                    var index = d.keywords.getIndexOf(wk.stem, 'term');

                    if(index > -1){ // item contains keyword in box
                        var score = (parseFloat(d.keywords[index].score) *  parseFloat(wk.weight)).round(3);
                        if(score > max)
                            max = score;

                        dataRanking[i].overallScore = parseFloat(dataRanking[i].overallScore) + score;
                        dataRanking[i].maxScore = max;
                        dataRanking[i].weightedKeywords.push({ 'term': wk.stem, 'weightedScore': score });
                    }
                    else{   // item doesn't contain keyword in box => maxScore and overallScore are set to 0
                        dataRanking[i].weightedKeywords.push({ 'term': wk.stem, 'weightedScore': 0, 'maxScore': 0 });
                    }
                });
                dataRanking[i].overallScore = dataRanking[i].overallScore.round(3);
            });
        },


        /**
         *  Sorts the dataRanking array by overall score, using the quicksort algorithm
         *
         * */
        sortRanking: function(array){

            var attr = (rankingCriteria == 'overall_score') ? 'overallScore' : 'maxScore';
            quicksort(array);
            assignRankingPosition(array);

            function quicksort(array){
                qsort(array, 0, array.length);
            }

            function qsort(array, begin, end) {
                if(end-1 > begin) {
                    var pivot = begin +  Math.floor((end - begin) / 2); //begin + Math.floor(Math.random() * (end - begin));
                    pivot = partition(array, begin, end, pivot);
                    qsort(array, begin, pivot);
                    qsort(array, pivot+1, end);
                }
            }

            function partition(array, begin, end, pivot) {
                var piv = array[pivot];
                array.swap(pivot, end-1);
                var store = begin;
                var ix;
                for(ix = begin; ix < end-1; ++ix) {
                    //if(array[ix].overallScore >= piv.overallScore) {
                    if(array[ix][attr] >= piv[attr]) {
                        array.swap(store, ix);
                        ++store;
                    }
                }
                array.swap(end-1, store);
                return store;
            }

            function assignRankingPosition(array){
                var currentScore = Number.MAX_VALUE;
                var currentPos = 1;
                var itemsInCurrentPos = 0;
                array.forEach(function(d, i){
                    if(d[attr] > 0){
                        if( d[attr] < currentScore ){
                            currentPos = currentPos + itemsInCurrentPos;
                            d.rankingPos = currentPos;
                            currentScore = d[attr];
                            itemsInCurrentPos = 1;
                        }
                        else{
                            d.rankingPos = currentPos;
                            itemsInCurrentPos++;
                        }
                    }
                    else{
                        d.rankingPos = 0;
                    }
                });
            }
        },


        /**
         *  Calculates the number of positions changed by each recommendations, basing on the array "previousRanking"
         *  If there doesn't exist a previous ranking or a recommendation wasn't previously ranked, then the value 1000 is assigned
         *
         * */
        extendRankingWithPositionsChanged: function(previousRanking){

            dataRanking.forEach(function(d, i){

                if(typeof previousRanking === 'undefined' || previousRanking.length == 0){
                    d['positionsChanged'] = 1000;
                    d['lastIndex'] = -1;
                }
                else{
                    var originalIndex = d['originalIndex'];
                    var currentRankingPos = d['rankingPos'];
                    var j = 0;
                    while( j < previousRanking.length  &&  previousRanking[j].originalIndex !== d['originalIndex'] )
                        j++;

                    d['lastIndex'] = j;
                    if( previousRanking[j].rankingPos === 0 )
                        d['positionsChanged'] = 1000;
                    else
                        d['positionsChanged'] = previousRanking[j]['rankingPos'] - d['rankingPos'];
                }
            });
        },


        /**
         *  Calculates the number of positions changed by each recommendations, basing on the array "previousRanking"
         *  If there doesn't exist a previous ranking or a recommendation wasn't previously ranked, then the value 1000 is assigned
         *
         * */
        hasRankingChanged: function(previousRanking) {

            if( typeof previousRanking === 'undefined' || previousRanking === 'undefined' || previousRanking.length === 0)
                return false;

            if(dataRanking.length != previousRanking.length)
                return true;

            for(var i = 0; i < dataRanking.length; i++){
                var j = 0;
                while(dataRanking[i]['originalIndex'] !== previousRanking[j]['originalIndex'] )
                    j++;

                if(dataRanking[i]['rankingPos'] !== previousRanking[j]['rankingPos'] )
                    return false;
            }
           return true;
        }

    };



    /**
     *  Keeps track of selected recommendation in content list
     *
     * */
    LIST.selectededListIndex = STR_NO_INDEX;



    /**
     *  Function that populates the list on the right side of the screen.
     *  Each item represents one recommendation contained in the variable "data"
     *
     * */
    LIST.buildContentList = function(){

        //d3.selectAll(".eexcess_ritem").remove();
        d3.selectAll( allListItems ).remove();

        var content = d3.select(contentList).selectAll("li").data(data);

        var aListItem = content.enter()
                            .append("li")
                                .attr("class", "eexcess_list")
                                .attr("id", function(d, i){ return "data-pos-"+i; })
                                .attr("doc_id", function(d){ return d.id})
                                .attr("pos", function(d, i){ return i; });

        var rankingDiv = aListItem.append('div')
            .attr("class", "eexcess_ranking_container");


        // div 2 wraps the recommendation title (as a link), a short description and a large description (not used yet)
        var contentDiv = aListItem.append("div")
            .attr("class", "eexcess_ritem_container");

        contentDiv.append("h3")
                .append("a")
                    .attr("class", "eexcess_ritem_title")
                    .attr('id', function(d, i){ return 'item-title-' + i; })
                    .attr("href", "#")
                  //  .on("click", function(d){ window.open(d.uri, '_blank'); })
                    .html(function(d){
                         return LIST.internal.getFormattedTitle(d.title);
                    });

        // fav icon section on the right
        aListItem.append('div')
            .attr('class', 'eexcess_favicon_section')
            .append("img")
                .attr('title', 'Mark as relevant')
                .attr("src", FAV_ICON_OFF);

        LIST.updateItemsBackground();
        LIST.bindEventHandlersToItems();
        $(contentPanel).scrollTo("top");
    };



    LIST.bindEventHandlersToItems = function(){
        // Event for item clicked
        d3.selectAll(allListItems)
            .on("click", function(d, i){ EVTHANDLER.listItemClicked(d, i); })
            .on("mouseover", EVTHANDLER.listItemHovered)
            .on("mouseout", EVTHANDLER.listItemUnhovered)
            .select(favIconClass).select('img').on("click", function(d, i){ EVTHANDLER.faviconClicked(d, i);});
    };




    /**
     * Wraping function that calls a sequence of methods to create a ranking of recommendations and display it
     *
     * */
    LIST.rankRecommendations = function() {

        var previousRanking = dataRanking || [];
        // Recalculates scores and positions, sorts the dataRanking array and extends it with #positionsChanged
        this.internal.updateRanking();
        this.internal.sortRanking(dataRanking);
        this.internal.extendRankingWithPositionsChanged(previousRanking);
        this.highlightListItems();
        this.stopAnimation();
        var isRankingChanged = LIST.internal.hasRankingChanged(previousRanking);

        // Synchronizes rendering methods
        if(!isRankingChanged){
            this.colorKeywordsInTitle();
            this.sortContentList();
            this.addRankingPositions(previousRanking);
            this.hideUnrankedItems();
            this.animateRanking();
            this.updateItemsBackground();
        }
        DOCPANEL.clear();
        VISPANEL.drawRanking(isRankingChanged);
    };



    /**
     * Stop the list movement and restores default style
     *
     * */
    LIST.stopAnimation = function(){
        $(".eexcess_list").stop(true, true);
        $(allListItems)
            .removeClass("eexcess_list_moving_up")
            .removeClass("eexcess_list_moving_down")
            .removeClass("eexcess_list_not_moving");
    };



    /**
     * Reorganizes list <li> items according to the calculated ranking
     *
     * */
    LIST.sortContentList = function(){

        var liHtml = new Array();

        dataRanking.forEach(function(d, i){
            var current = $( listItem + "" + d.originalIndex );
            var outer = $(current).outerHTML();
            liHtml.push( outer );
            current.remove();
        });

        var oldHtml = "";
        for(var j = liHtml.length-1; j >= 0; j--){
            $(contentList).html(liHtml[j] + "" + oldHtml);
            oldHtml = $(contentList).html();
        }

        // Re-binds on click event to list item. Removing and re-appending DOM elements destroy the bounds to event handlers
        //d3.selectAll( allListItems ).on("click", EVTHANDLER.listItemClicked);
        LIST.bindEventHandlersToItems();
        LIST.selectededListIndex = STR_NO_INDEX;
    };



    /**
     * Appends a yellow circle indicating the ranking position and a colored legend stating #positionsChanged
     *
     * */
    LIST.addRankingPositions = function( previousRanking ) {

        $( rankingContainerClass ).empty();

        dataRanking.forEach(function(d, i){
            if( d.overallScore > 0 ){
                var color = d.positionsChanged > 0 ? "rgba(0, 200, 0, 0.8)" : ( d.positionsChanged < 0 ? "rgba(250, 0, 0, 0.8)" : "rgba(128, 128, 128, 0.8)" );

                var divRanking = d3.select( listItem + "" + d.originalIndex ).select(rankingContainerClass);

                divRanking.append("div")
                    .attr("class", "eexcess_ranking_pos")
                    .text( d.rankingPos );

                divRanking.append("div")
                    .attr("class", "eexcess_ranking_posmoved")
                    .style("color", function(d){ return color; })
                    .text(function(){
                        if( d.positionsChanged == 1000 ) return STR_JUST_RANKED;
                        if( d.positionsChanged > 0 ) return "+" + d.positionsChanged;
                        if( d.positionsChanged < 0 ) return d.positionsChanged;
                        return "=";
                    });
            }
        });
    };



    /**
     * Calculate which items should be highlighted
     *
     * */
    LIST.hideUnrankedItems = function(){
        dataRanking.forEach(function(d){
            if(d.rankingPos == 0)
                $(listItem + '' + d.originalIndex).css('display', 'none');
            else
                $(listItem + '' + d.originalIndex).css('display', '');
        });
    };



    /**
     * Handles the visual effects when the ranking is updated.
     * Generates accordion-like animation for ranked items and style effects
     *
     * */
    LIST.animateRanking = function() {

        var delay = 4000;
        dataRanking.forEach(function(d, i){
            var item = $(listItem +""+ d.originalIndex);

            if( d.overallScore > 0 ){
                var shift = i * 5;//parseFloat( 50 + i*10 );
                var duration = 500 + 50 * i;
                var movingClass = (d.positionsChanged > 0) ? "eexcess_list_moving_up" : ( (d.positionsChanged < 0) ? "eexcess_list_moving_down" : "eexcess_list_not_moving" );

                item.addClass(movingClass);
                item.animate({'top': shift}, {
                    'complete': function(){
                        $(this).animate({"top": 0}, duration, "swing" );
                    }
                });
            }
        });

        setTimeout(function(){
            $( allListItems )
                .removeClass("eexcess_list_moving_up")
                .removeClass("eexcess_list_moving_down")
                .removeClass("eexcess_list_not_moving");
        }, delay);
    };

    
    

    /**
     * IN PROGRESS
     *
     * */
    LIST.anotherAnimation = function() {

        var delay = 4000;
        dataRanking.forEach(function(d, i){
            var item = $(listItem +""+ d.originalIndex);

            if( d.overallScore > 0 ){
                var shift = (d.lastIndex != -1) ? (d.lastIndex * 27.5) + 'px' : (i * 5)+'px' ;
                var duration = 500 + 50 * i;
                var movingClass = (d.positionsChanged > 0) ? "eexcess_list_moving_up" : ( (d.positionsChanged < 0) ? "eexcess_list_moving_down" : "eexcess_list_not_moving" );

                item.addClass(movingClass);
                item.animate({'top': shift}, {
                    'complete': function(){
                        $(this).animate({"top": 0}, duration, "swing" );
                    }
                });
            }
        });

        setTimeout(function(){
            $(allListItems)
            .removeClass("eexcess_list_moving_up")
            .removeClass("eexcess_list_moving_down")
            .removeClass("eexcess_list_not_moving");
        }, delay);

    };
    
    

    /**
     * Description
     */
    LIST.updateItemsBackground = function(){
        $(allListItems).removeClass('light_background').removeClass('dark_background');
        $(allListItems).each(function(i, item){
            if(i%2 == 0)
                $(item).addClass('light_background');
            else
                $(item).addClass('dark_background');
        });
    };



    /**
     * Description
     */
    LIST.colorKeywordsInTitle = function(){

        $(allListItems).each(function(i, item){
            var pos = parseInt($(item).attr('pos'));
            $(item).find('a').html(LIST.internal.getFormattedTitle(data[pos].title));

        });

    };



    /**
     * Draws legend color icons in each content list item
     * */
    LIST.selectListItem = function( i, flagSelectedOutside ){
        LIST.stopAnimation();
        var isSelectedFromOutside = flagSelectedOutside || false;

        // if clickedListIndex is undefined then the item was selected, otherwise it was deselected
        if(i !== LIST.selectededListIndex){
            LIST.selectededListIndex = i;
            var actualIndex = LIST.internal.getActualIndex(i);
            LIST.highlightListItems(actualIndex);
            DOCPANEL.showDocument(actualIndex);
        }
        else{
            LIST.selectededListIndex = STR_NO_INDEX;
            LIST.highlightListItems();
            DOCPANEL.clear();
        }

        if( !isSelectedFromOutside )
            VISPANEL.selectItemInRanking(i);
    };


    /**
     *  Function that highlights items on the content list, according to events happening on the visualization.
     *  E.g. when one or more keywords are selected, the related list items remain highlighted, while the other become translucid
     *  If no paramters are received, all the list items are restored to the default opacity
     *
     * */
    LIST.highlightListItems = function(index){
        if(typeof index !== 'undefined'){
            $(allListItems).css("opacity", "0.3");
            $(listItem + "" + index).css("opacity", "1");
        }
        else{
            $(allListItems).css("opacity", "1");
        }
    };



    LIST.hoverListItem = function(index, isExternalCall) {
        $(listItem + '' + LIST.internal.getActualIndex(index)).addClass("eexcess_list_hover");
        isExternalCall = isExternalCall || false;
        if(!isExternalCall)
            VISPANEL.hoverItem(index);
    };



    LIST.unhoverListItem = function(index, isExternalCall){
        $(listItem + '' + LIST.internal.getActualIndex(index)).removeClass("eexcess_list_hover");
        isExternalCall = isExternalCall || false;
        if(!isExternalCall)
            VISPANEL.unhoverItem(index);
    };



    /**
     * Restores content list to its original state
     *
     * */
    LIST.resetContentList = function(){
        LIST.stopAnimation();

        var liHtml = new Array();
        data.forEach(function(d, i){
            var item = $( listItem + "" + i );
            item.css("top", "0");
            item.css("display", "");
            liHtml.push( $(item).outerHTML() );
            item.remove();
        });

        var oldHtml = "";
        for(var j = liHtml.length-1; j >= 0; j--){
            $(contentList).html(liHtml[j] + "" + oldHtml);
            oldHtml = $(contentList).html();
        }

        // Delete ranking related icons
        $(rankingContainerClass).empty();

        LIST.colorKeywordsInTitle();
        LIST.highlightListItems();
        LIST.updateItemsBackground();
        LIST.bindEventHandlersToItems();
        dataRanking = [];
    };



    LIST.switchFaviconOnOrOff = function(index){

        data[index].isSelected = !data[index].isSelected;
        var faviconToSwitch = (data[index].isSelected) ? FAV_ICON_ON : FAV_ICON_OFF;

        d3.select(listItem + '' +index).select(favIconClass).select('img')
            .transition().attr("src", faviconToSwitch).duration(2000);
    };


    LIST.clearAllFavicons = function(){
        d3.selectAll(allListItems).select(favIconClass).select('img').attr('src', FAV_ICON_OFF);
    };



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    var VISPANEL = {};

    VISPANEL.drawRanking = function(isRankingChanged){
        if(showRanking){
            rankingVis.draw(dataRanking, data, weightColorScale, rankingCriteria, isRankingChanged);
            $(visPanelCanvas).scrollTo('top');
        }
    };

    VISPANEL.resetRanking = function(){
        if(showRanking)
            rankingVis.reset();
    };

    VISPANEL.selectItemInRanking = function(actualIndex){
        if(showRanking)
            rankingVis.selectItem(actualIndex);
    };

    VISPANEL.hoverItem = function(index){
        if(showRanking)
            rankingVis.hoverItem(index);
    };

    VISPANEL.unhoverItem = function(index){
        if(showRanking)
            rankingVis.unhoverItem(index);
    };

    VISPANEL.resizeRanking = function(){
        if(showRanking)
            rankingVis.resize();
    };



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    var DOCPANEL = {};

    DOCPANEL.internal = {

        highlightKeywordsInText : function(text, isTitle){
            var textWithKeywords = isTitle ? '' : '<p>',
                word = "";
            var keywordsInBox = TAGCLOUD.getWeightedKeywordsInBox();
            text.split('').forEach(function(c){
                if(c.match(/\w/)){
                    word += c;
                }
                else if(c == '\n'){
                    textWithKeywords += '</p><p>'
                }
                else {
                    if(word != '')
                        word = DOCPANEL.internal.getStyledWord(word, keywordsInBox);
                    textWithKeywords += word + c;
                    word = "";
                }
            });
            if(word != "")
                textWithKeywords += this.getStyledWord(word, keywordsInBox);
            if(!isTitle)
                textWithKeywords +='</p>';

            return textWithKeywords;
        },


        getStyledWord : function(word, keywordsInBox){
            var trickyWords = ['it', 'is', 'us', 'ar'];
            var wordStem = word.replace(/our$/, 'or').stem();

            if(trickyWords.indexOf(wordStem) == -1 || word.isAllUpperCase()){
                if(keywordsInBox.getIndexOf(wordStem, "stem") > -1)
                    return "<strong style=\"color:" + weightColorScale(wordStem) + "\">" + word + "</strong>";

                wordStem = word.singularizeNoun().stem();
                if(keywordsInBox.getIndexOf(wordStem, "stem") > -1)
                    return "<strong style=\"color:" + weightColorScale(wordStem) + "\">" + word + "</strong>";
            }
            return word;
        }

    };


    DOCPANEL.showDocument = function(index){
        $(documentDetailsTitle).html(this.internal.highlightKeywordsInText(data[index].title, true));
        $(documentDetailsYear).html(data[index].facets.year);
        $(documentDetailsLanguage).html(data[index].facets.language);
        $(documentDetailsProvider).html(data[index].facets.provider);
        $(documentViewer).html(this.internal.highlightKeywordsInText(data[index].description));
        $(documentViewer + ' p').hide();
        $(documentViewer + ' p').slideDown('slow');
        $(documentViewer).scrollTo('top');
    };


    DOCPANEL.clear = function(){
        $(documentDetailsTitle).empty();
        $(documentDetailsYear).empty();
        $(documentDetailsLanguage).empty();
        $(documentDetailsProvider).empty();
        $(documentViewer).empty();
    };




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




    function getStaticElementsReady(){
        var offsetTop = $(btnShowList).offset().top + $(btnShowList).height() + 10;
        var offsetLeft = $(selectedItemsSection).parent().offset().left + 10;
        $(selectedItemsSection).width($(headerControlsSection).width() - 20).css("top", offsetTop).css("left", offsetLeft);
        $(sampleTextSection).width($(headerControlsSection).width() - 20).css("top", offsetTop).css("left", offsetLeft);
        $('html').click(function(){
            $(selectedItemsSection).slideUp();
            $(sampleTextSection).slideUp();
        });
        $(selectedItemsSection).click(function(event){ event.stopPropagation(); });
        $(sampleTextSection).click(function(event){ event.stopPropagation(); });

        $(btnReset).click( function(){ EVTHANDLER.btnResetClicked(); });
        $(btnRankByOverall).click(function(){ EVTHANDLER.rankButtonClicked(this); });
        $(btnRankByMax).click(function(){ EVTHANDLER.rankButtonClicked(this); });
        $(btnShowList).click(EVTHANDLER.btnListClicked);
        $(btnShowText).click(EVTHANDLER.btnTextClicked);
        $(btnFinished).click(EVTHANDLER.btnFinishedClicked);
        $(window).resize(function(){ EVTHANDLER.canvasResized(); });
        $(mainPanel).resize(function(){ EVTHANDLER.canvasResized(); });
    }


    function initializeNextQuestion(){

        data.shuffle();
        data.forEach(function(d){
            d['isSelected'] = false;
        });
        dataRanking = [];
        if(dataset["tool-aided"] === 'yes'){
            TAGCLOUD.clearTagbox();
            TAGCLOUD.buildTagCloud();
            VISPANEL.resetRanking();
        }
        LIST.buildContentList();
        HEADER.clearListOfSelected();
        HEADER.showInfoInHeader();
        DOCPANEL.clear();

        var minToGo = (currentTask == 0) ? 'X' : (currentQuestion == questions.length - 1) ? 6 : 3;
        $('#task_question_message')
            .fadeIn(1)
            .html('<span>Task: #' + currentTask + '</span><span>Question: #' + (currentQuestion + 1) + '</span><span>You have ' +
                  minToGo + ' minutes to complete it</span>')
            .dimBackground();

        setTimeout(function(){
            $('#task_question_message').fadeOut('slow');
            $('#task_question_message').undim();
            startTime = $.now();
        }, 2500);
    }


    /**
     *  Initizialization function self-invoked
     *
     * */
    (function(){
        dataset = JSON.parse($("#dataset").text());
        console.log(dataset);

        data = dataset['data'];                                                 // contains the data to be visualized
       // data.shuffle();
        query = dataset['query'];                                               // string representing the query that triggered the current recommendations
        keywords = dataset['keywords'];
        sampleText = dataset['text'];
        task = dataset['task'];

        currentTask = dataset['task-number'];
        questions = dataset['questions'];
        currentQuestion = 0;

      //  dataRanking = [];
      //  PREPROCESSING.extendDataWithAncillaryDetails();
        PREPROCESSING.extendKeywordsWithColorCategory();
       // HEADER.showInfoInHeader();
      //  LIST.buildContentList();
        getStaticElementsReady();
        initializeNextQuestion();

        if(dataset['tool-aided'] == 'yes'){
            rankingVis = new RankingVis(root, width, height, self);
            // Initialize template's elements
          //  TAGCLOUD.clearTagbox();
          //  TAGCLOUD.buildTagCloud();
           // VISPANEL.resetRanking();
            showRanking = true;
        }
        else{
            $('#eexcess_main_panel').css('justifyContent', 'center');
            $('#eexcess_controls_left_panel').css('display', 'none');
            $('#eexcess_vis_panel').css('width', '30%');
            $('#eexcess_vis_panel_controls').css('display', 'none');
            $('#eexcess_canvas').css('display', 'none');
            $('#eexcess_vis_panel_canvas').css('height', '100%');
            $(contentPanel).css('float', 'right').css('width', '100%');
            $('#eexcess_document_panel').css('float', '').css('width', '23%').css('marginLeft', '.5em');
            $('#eexcess_selected_items_section').css('boxShadow', '.5em .5em 1em #aaa, -.5em .5em 1em #aaa, .5em .5em 1em #aaa');
            $('#eexcess_topic_text_section').css('boxShadow', '.5em .5em 1em #aaa, -.5em .5em 1em #aaa, .5em .5em 1em #aaa');
            showRanking = false;
        }

     //   startTime = $.now();
    })();




//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    ///////////// External call triggered by rankingvis

    this.ListItemSelected = function(index){
        LIST.selectListItem(index, true);
    };

    this.ListItemHovered = function(index){
        LIST.hoverListItem(index, true);
    };

    this.ListItemUnhovered = function(index){
        LIST.unhoverListItem(index, true);
    };

})();
