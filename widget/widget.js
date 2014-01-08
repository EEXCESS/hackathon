var EEXCESS = EEXCESS || {};
EEXCESS.extID = chrome.i18n.getMessage('@@extension_id');

/**
 * Encapsulates functionality for displaying search results and interaction with
 * them
 * @namespace EEXCESS.results
 */
EEXCESS.results = (function() {
    /**
     * Looks for the presence of a set of facets in a search result and 
     * concatenates the found results in a string together with their respective 
     * value.
     * @memberOf EEXCESS.results
     * @param {Object} item A search result item
     * @returns {String} The concatenated string of facets and values (e.g.
     * "type: IMAGE | year: 2013 | ...")
     */
    var _facets = function(item) {
        var facetString = '';
        var counter = 0;
        
        for(var key in item.facets) {
            counter++;
            if(counter > 1) {
                facetString += ' | ';
            }
            facetString += key + ': ' + item.facets[key];
        }
        return facetString;
    };
    /**
     * Constructs a DOM-Element for a link, adds thumbnail functionality and 
     * preview functionality via fancybox.
     * @memberOf EEXCESS.results
     * @param {String} url The URL of the link
     * @param {String} img URL of a preview image for the link
     * @param {String} title Link title to be shown to the user
     * @returns {Object} Jquery object of the link's DOM-node
     */
    var _link = function(url, img, title) {
        var link = $('<a href="#">' + title + '</a>');
        link.click(function() {
            EEXCESS.callBG({method: 'fancybox', data: url});
        });
        _thumbnail(link, img);
        return link;
    };
    /**
     * Adds thumbnail functionality to a link on hover. The thumbnail is
     * displayed at the current mouse position and sticks to the mouse, as long
     * as the mouse move's over the link area. The thumbnail is removed, when
     * the mouse leaves the link's area.
     * @memberOf EEXCESS.results
     * @param {Object} link Jquery object of the link's DOM-node
     * @param {String} img URL of the thumbnail image
     */
    var _thumbnail = function(link, img) {
        // thumbnail on hover
        var xOffset = 10;
        var yOffset = 30;
        link.hover(
                function(e) {
                    $('body').append('<p id="eexcess_thumb"><img src="' + img
                            + '" alt="img preview" /></p>');
                    $('#eexcess_thumb')
                            .css('position', 'absolute')
                            .css('top', (e.pageY - xOffset) + 'px')
                            .css('left', (e.pageX + yOffset) + 'px')
                            .css('z-index', 9999)
                            .fadeIn('fast');
                },
                function() {
                    $('#eexcess_thumb').remove();
                });
        link.mousemove(function(e) {
            $('#eexcess_thumb')
                    .css('top', (e.pageY - xOffset) + 'px')
                    .css('left', (e.pageX + yOffset) + 'px');
        });
    };
    /**
     * Adds rating functionality to an element
     * @memberOf EEXCESS.results
     * @param {Object} element Jquery object of a DOM-element, for which to add
     * rating functionality
     * @param {String} uri URI of the corresponding resource to be rated 
     * @param {Integer} score Current rating score of the resource (in the range of 0-1)
     */
    var _rating = function(element, uri, score) {
        element.raty({
            score: score,
            path: '../libs/rating/img',
            number: 2,
            width: false,
            iconRange: [
                {range: 1, on: 'thumb_down-on.png', off: 'thumb_down-off.png'},
                {range: 2, on: 'thumb_up-on.png', off: 'thumb_up-off.png'}
            ],
            hints: ['bad', 'good'],
            single: true,
            click: function(score, evt) {
                EEXCESS.callBG({
                    method: {parent: 'model', func: 'rating'},
                    data: {
                        uri: this.uri,
                        score: score,
                        pos: this.element.data('pos'),
                        beenRecommended: true
                    }
                });
            }.bind({uri: uri, element: element})
        });
    };

    return {
        /**
         * Displays the results of a search in the eexcess widget
         * @memberOf EEXCESS.results
         * @param {Object} data Object containing the result of a search
         * @param {Integer} data.totalResults Number of total results for the search
         * @param {Array} data.items Array of result items
         */
        showResults: function(data) {
            $('#eexcess_content').empty();
            if (data === null || data.totalResults === 0) {
                $('#eexcess_content').append($('<p>no results</p>'));
                return;
            }
            var list = $('<ul id="eexcess_resultList" data-total="' + data.totalResults + '"></ul>');
            $('#eexcess_content').append(list);
            EEXCESS.results.moreResults(data.results, list);
        },
        /**
         * Appends the results of a search to the ones, currently shown in the
         * eexcess widget.
         * @memberOf EEXCESS.results
         * @param {Array} items Array of result items 
         * @param {Object} list Jquery object of the DOM-node at which to append
         * the results
         */
        moreResults: function(items, list) {
            $('#eexcess_content').unbind('scroll');
            if (typeof list === 'undefined') {
                list = $('#eexcess_resultList');
            }
            var offset = $('#eexcess_resultList li').length;
            for (var i = 0, len = items.length; i < len; i++) {
                var item = items[i];
                var img = item.edmPreview;
                if (typeof img === 'undefined') {
                    img = 'no-img.png';
                }
                var title = item.title;
                if (typeof title === 'undefined') {
                    title = 'no title';
                }
                var pos = i + offset;
                var li = $('<li data-pos="' + pos + '"></li>');

                list.append(li);
                
                                // rating
                var raty = $('<div class="eexcess_raty"  data-uri="' + item.uri + '" data-pos="' + pos + '"></div');
                _rating(raty, item.uri, item.rating);
                li.append(raty);

                var containerL = $('<div class="resCtL"></div');
                li.append(containerL);
                containerL.append(_link(item.uri, img, '<img class="eexcess_previewIMG" src="' + img + '" />'));

                // contents
                var resCt = $('<div class="eexcess_resContainer"></div>');
                resCt.append(_link(item.uri, img, title));
                li.append(resCt);



                // annotator
//                containerL.append($('<a href="" title="add resource to annotation" class="annotator_add" ><img src="../media/icons/add.png" /></a>')
//                        .click(function(evt) {
//                            evt.preventDefault();
//                            EEXCESS.callBG({method: 'useResource', data: this});
//                        }.bind(item.link)));

                // show link
                var linkCopy = $('<a href="" title="show URL of the resource"><img src="../media/icons/link.png" /></a>');
                linkCopy.click(function(evt) {
                    evt.preventDefault();
                    $('#dialog_url p').text(this);
                    var at = 'center top+' + evt.pageY;
                    $('#dialog_url').dialog({
                        title: 'URL of the resource',
                        height: 130,
                        position: {my: "center", at: at}
                    });
                    // select the link
                    var selection = window.getSelection();
                    var range = document.createRange();
                    range.selectNodeContents($('#dialog_url p').get()[0]);
                    selection.removeAllRanges();
                    selection.addRange(range);
                }.bind(item.guid));
                containerL.append(linkCopy);

                // facets
                var facets = _facets(item);
                if (facets !== '') {
                    resCt.append($('<p style="margin:0;padding:0;font-size:0.9em;">' + facets + '</p>'));
                }
                resCt.append($('<p style="clear:both;"></p>'));



            }
            $('#eexcess_loading').remove();
            if ($('#eexcess_resultList').data('total') > $('#eexcess_resultList li').length) {
                $('#eexcess_content').scroll(function() {
                    EEXCESS.scrollalert(true);
                });
            } else {
                $('#eexcess_content').scroll(function() {
                    EEXCESS.scrollalert(false);
                });
            }
        },
        /**
         * Sets the rating of a resource currently displayed in the result list
         * to the specified value
         * @memberOf EEXCESS.results
         * @param {{uri:String,score:Integer}} data Object containing the URI of
         * the resource to rate and the score to set
         */
        rating: function(data) {
            _rating($('.eexcess_raty[data-uri="' + data.uri + '"]'), data.uri, data.score);
        }

    };
})();


/**
 * Encapsulates functionality for configuring, starting and stopping tasks
 * @namespace EEXCESS.task
 */
EEXCESS.task = (function() {
    /**
     * Handles the start of a task.
     * Checks preconditions (a task name must be present, as well as at least 
     * one topic associated to the task). Furthermore, if the set of topics for
     * the current task is the same as for the last, a confirmation dialog is 
     * shown to the user. If all conditions are met, the task gets started and 
     * the background script is informed about the start. Otherwise an error 
     * message is shown to the user, indicating the problems 
     * @memberOf EEXCESS.task
     */
    var _startHandler = function() {
        var errors = [];
        var taskID = $('#usr_task').find('option:selected').text();
        if (taskID === 'select...') {
            errors.push('no taskID selected');
        } else if (taskID === 'other' && $('#individual_task').val() === '') {
            errors.push('no name for "other" task given');
        }
        if ($('#eexcess_topics').tagit('assignedTags').length === 0) {
            errors.push('no topics defined');
        }
        if (errors.length === 0) {
            EEXCESS.callBG({method: {parent: 'model', func: 'getLastTopics'}, data: null}, function(lastTopics) {
                // compare current topics with topics of last task
                var currentTopics = $('#eexcess_topics').tagit('assignedTags');
                if ($(currentTopics).not(lastTopics).length === 0 && $(lastTopics).not(currentTopics).length === 0) {
                    // topics have not changed
                    $('#topics_confirm').dialog({// jquery.ui.dialog
                        title: 'Change of topics',
                        dialogClass: 'no-close',
                        modal: true,
                        position: {my: 'center', at: 'top', of: window},
                        buttons: [{
                                text: 'proceed',
                                click: function() {
                                    $(this).dialog("close");
                                    EEXCESS.task.startTask();
                                    EEXCESS.callBG({method: {
                                            parent: 'model',
                                            func: 'startTask'}});
                                }
                            }, {
                                text: 'modify topics',
                                click: function() {
                                    $(this).dialog("close");
                                }
                            }]
                    });
                } else {
                    EEXCESS.task.startTask();
                    EEXCESS.callBG({method: {parent: 'model', func: 'startTask'}});
                }
            });
        } else {
            alert(errors);
        }
    };

    return {
        /**
         * Initializes the widget's task view with the provided task-object
         * @memberOf EEXCESS.task
         * @param {TaskWrapper} task An object containing information about the currently
         * selected and available task parameters
         */
        init: function(task) {
            var ct = $('#eexcess_content');
            ct.empty();
            ct.append('task: ');
            var options = $('<select id="usr_task" name="taskID" size="1"></select>');
            ct.append(options);
            // set currently selected task in the view
            for (var i = 0, len = task.options.length; i < len; i++) {
                if (task.options[i] === task.selected) {
                    options.append($('<option label="' + task.options[i] + '">' + task.options[i] + '</option>').prop('selected', true));
                } else {
                    options.append($('<option label="' + task.options[i] + '">' + task.options[i] + '</option>'));
                }
            }
            // change of the selected task
            options.change(function() {
                var option = $(this).find('option:selected').text();
                EEXCESS.callBG({method: {parent: 'model', func: 'changeOption'}, data: option});
                EEXCESS.task.changeOption(option);
            });
            // show input field for user specified task only if option 'other' is selected
            var indiviual_task = $('<input id="individual_task" type="text" size="15" placeholder="specify task..." value="' + task.individual + '"/>');
            options.after(indiviual_task);
            if (task.selected !== 'other') {
                indiviual_task.hide();
            }
            // controls for start/stop of a task
            var start_btn = $('<a href="#" class="btn" id="start_btn" title="start task"><img src="play.png" /></a>');
            ct.append(start_btn);
            var stop_btn = $('<a href="#" class="btn" id="stop_btn" title="stop task"><img src="stop.png" /></a>').hide();
            ct.append(stop_btn);
            if (task.id !== -1) {
                EEXCESS.task.startTask();
            } else {
                start_btn.click(_startHandler);
            }

            // recommendations desirable
            var rec_desirable = $('<p id="desirable_paragraph"><input type="checkbox" id="recommendations_desirable" /><label for="recommendations_desirable">Would you like to get recommendations for this task?</label></p>');
            ct.append(rec_desirable);
            if (task.selected !== 'other') {
                rec_desirable.hide();
            }
            $('#recommendations_desirable').prop('checked', task.recommendations_desirable).change(function() {
                EEXCESS.callBG({method: {parent: 'model', func: 'recommendationsDesirable'}, data: $(this).prop('checked')});
            });

            // expertise level
            ct.append('<p><label for="expertise_level" title="Your level of expertise on the set of topics related to this task" class="tooltip">Expertise Level:</label><input type="text" id="expertise_level" style="border: 0; color: green; font-weight: bold;" readonly /></p>');
            ct.append('<span class="sliderLabel">beginner</span><div id="expertise_slider"></div><span class="sliderLabel">expert</span>');
            $('#expertise_slider').slider({
                min: 0,
                max: 10,
                value: task.expertise_level,
                slide: function(event, ui) {
                    $('#expertise_level').val(ui.value);
                    EEXCESS.callBG({method: {parent: 'model', func: 'changeExpertiseLevel'}, data: ui.value});
                }
            });
            $('#expertise_level').val($('#expertise_slider').slider('value'));

            // topics
            ct.append('<p style="margin:0;margin-top:2%" title="Please specify a set of topics which are related to this task (you will get suggestions as you type. If none of the suggestions is applicable, press \'Esc\' to enter a custom value)" class="tooltip">Topics:</p>');
            var existingTopics = '';
            for (var i = 0, len = task.topics.length; i < len; i++) {
                existingTopics += '<li>' + task.topics[i].label + '</li>';
            }
            var topics = $('<ul id="eexcess_topics">' + existingTopics + '</ul>');
            ct.append(topics);
            topics.tagit({// tagit plugin for topics
                allowSpaces: true,
                removeConfirmation: true,
                autocomplete: {
                    source: function(request, response) {
                        $.ajax({
                            processData: false,
                            contentType: 'application/json',
                            type: 'POST',
                            url: "http://zaire.dimis.fim.uni-passau.de:8181/code-server/disambiguation/categorysuggestion",
                            dataType: "json",
                            data: '{"input":"' + request.term + '","language":"' + $('#topics_language option:selected').text() + '"}', // possible language fields: en,de,fr
                            success: function(data) {
                                response($.map(data.categories, function(item) {
                                    return {
                                        label: item.label,
                                        value: {label: item.label, uri: item.url}
                                    };
                                }));
                            },
                            error: function(jqXHR, textStatus, errorThrown) {
                                console.log("error!");
                                console.log(jqXHR);
                                console.log(textStatus);
                                console.log(errorThrown);
                                console.log(jqXHR.responseText);
                            }
                        });
                    },
                    minLength: 3,
                    focus: function(event, ui) {
                        // show only labels in the preview
                        event.preventDefault();
                        $(this).val(ui.item.label);
                    }
                },
                afterTagAdded: function(event, ui) {
                    if (!ui.duringInitialization) {
                        EEXCESS.callBG({method: {parent: 'model', func: 'addTopic'}, data: {label: ui.tagLabel, uri: ui.tag.data('uri')}});
                    }
                },
                afterTagRemoved: function(event, ui) {
                    EEXCESS.callBG({method: {parent: 'model', func: 'remTopic'}, data: ui.tagLabel});
                }
            });
            // input language of topics (relevant for autocomplete)
            ct.append('<label for="topics_language" title="the language in which suggestions are provided for your input" class="tooltip">input language:</label>');
            var topics_language = $('<select id="topics_language"><option label="en">en</option><option label="de">de</option><option label="fr">fr</option></select>');
            topics_language.find('option[label="' + task.topics_language + '"]').prop('selected', true);
            topics_language.change(function() {
                var lang = $(this).find('option:selected').text();
                EEXCESS.callBG({method: {parent: 'model', func: 'changeTopicsLanguage'}, data: lang});
            });
            ct.append(topics_language);
        },
        /**
         * Adds a topic to the list of topics in the widget's view
         * @memberOf EEXCESS.task
         * @param {String|Topic} topic The topic to add
         */
        addTopic: function(topic) {
            $('#eexcess_topics').tagit('createTag', topic);
        },
        /**
         * Removes a topic from the list of topics in the widget's view
         * @memberOf EEXCESS.task
         * @param {String} topic Label of the topic to remove
         */
        removeTopic: function(topic) {
            $('#eexcess_topics').tagit('removeTagByLabel', topic);
        },
        /**
         * Sets the checkbox for the flag, if recommendations are desirable to
         * the specified value (checked if desirable, unchecked otherwise)
         * @memberOf EEXCESS.task
         * @param {Boolean} desirable The value to set
         */
        recommendationsDesirable: function(desirable) {
            $('#recommendations_desirable').prop('checked', desirable);
        },
        /**
         * Changes the level of expertise in the widget's view to the specified
         * value
         * @memberOf EEXCESS.task
         * @param {Integer} level The level to set (in the range of 0-10)
         */
        changeExpertiseLevel: function(level) {
            $('#expertise_slider').slider('value', level);
            $('#expertise_level').val(level);
        },
        /**
         * Starts the current task. Hides or disables fields and controls, which are
         * not accessible, while a task is running. Informs the background script
         * about the start. Adds a dialog to adjust start and end time, when the 
         * task is stopped and sends the values to the background script.
         * @memberOf EEXCESS.task
         */
        startTask: function() {
            $('#start_btn').unbind('click').hide();
            $('#usr_task').prop('disabled', true);
            $('#individual_task').prop('disabled', true);
            $('#stop_btn').show().click(function() {
                EEXCESS.callBG({method: {parent: 'model', func: 'widget'}}, function(model) {
                    setTimeout(function() {
                        // start and end time encoded as ISO 8601 (respecting timezoneoffset)
                        var start = new Date(this.start);
                        start.setHours(start.getHours() - (start.getTimezoneOffset() / 60)); //remove timezone offset.
                        $('#task_start').val(start.toISOString().substr(0, 19));
                        var end = new Date();
                        end.setHours(end.getHours() - (end.getTimezoneOffset() / 60));
                        $('#task_end').val(end.toISOString().substr(0, 19));

                        // dialog title = task name
                        var task_title = 'task: ';
                        if ($('#individual_task').is(':visible')) {
                            task_title += $('#individual_task').val();
                        } else {
                            task_title += $('#usr_task').val();
                        }
                        $('#task_edit_dialog').dialog({// jquery.ui.dialog
                            title: task_title,
                            dialogClass: "no-close",
                            modal: true,
                            position: {my: "center", at: "top", of: window},
                            buttons: [{
                                    text: "OK",
                                    click: function() {
                                        var data = {
                                            start: $('#task_start').val(),
                                            end: $('#task_end').val()
                                        };
                                        if (new Date(data.end) > new Date(data.start)) {
                                            $(this).dialog("close");
                                            $('#dialog_error').hide();
                                            EEXCESS.callBG({method: {parent: 'model', func: 'stopTask'}, data: data});
                                        } else {
                                            $('#dialog_error').html('start time must be smaller than end time').show();
                                        }
                                    }
                                }]
                        });
                    }.bind(model.task), 200);
                });
                EEXCESS.task.stopTask();
            });
        },
        /**
         * Stops the task in the widget's view
         * @memberOf EEXCESS.task
         */
        stopTask: function() {
            $('#stop_btn').hide().unbind('click');
            $('#usr_task').prop('disabled', false);
            $('#individual_task').prop('disabled', false);
            $('#start_btn').show().click(_startHandler);
        },
        /**
         * Changes the currently selected task in the widget's view
         * @memberOf EEXCESS.task
         * @param {String} option The value to set as currently selected task
         */
        changeOption: function(option) {
            $('#usr_task option[label="' + option + '"]').prop('selected', true);
            if (option === 'other') {
                $('#individual_task').show().change(function() {
                    EEXCESS.callBG({method: {parent: 'model', func: 'changeIndividual'}, data: $(this).val()});
                });
                $('#desirable_paragraph').show();
            } else {
                $('#individual_task').hide();
                $('#desirable_paragraph').hide();
            }
        },
        /**
         * Sets the user specified task name to the provided value in the widget's view
         * @memberOf EEXCESS.task
         * @param {String} value The task name to set
         */
        changeInidvidual: function(value) {
            $('#individual_task').attr('value', value);
        },
        /**
         * Sets the currently selected input language for topics to the specified
         * value
         * @memberOf EEXCESS.task
         * @param {String} lang Country code of the language to set
         */
        changeTopicsLanguage: function(lang) {
            $('#topics_language option[label="' + lang + '"]').prop('selected', true);
            $('#topics_language option[label!="' + lang + '"]').prop('selected', false);
        }
    };
})();


/**
 * Handler to be called on scrolling in the result list. If the end of the result
 * list is reached, but there are still more results available for the current query, the 
 * background script is called to retrieve a further set of results.
 * @memberOf EEXCESS
 * @param {Boolean} moreResults Indicating, if more results are available for the current query
 */
EEXCESS.scrollalert = function(moreResults) {
    var scrolltop = $('#eexcess_content').prop('scrollTop');
    var scrollheight = $('#eexcess_content').prop('scrollHeight');
    var windowheight = $('#eexcess_content').prop('clientHeight');
    var offset = 20;
    EEXCESS.callBG({method: 'scroll', data: scrolltop});
    if (moreResults && scrolltop > 0 && (scrolltop + windowheight + offset >= scrollheight)) {
        $('#eexcess_content').unbind('scroll');
        $('#eexcess_content').append($('<div id="eexcess_loading"><img src="../media/loading.gif" /></div>'));
        var start = $('#eexcess_content').find('li:last').data('pos') + 2;
        EEXCESS.callBG({method: {parent: 'model', func: 'moreResults'}, data: start});
    }
};

/**
 * Sets the scroll position of the '#eexcess_content' element to the specified
 * value.
 * @memberOf EEXCESS
 * @param {Integer} value The scroll position to set
 */
EEXCESS.scroll = function(value) {
    $('#eexcess_content').scrollTop(value);
};

/**
 * Updates the widget's view with the current state of the model in the background script
 * @memberOf EEXCESS
 * @param {Object} widget The current state of the widget model in the background script
 */
EEXCESS.update = function(widget) {
    $('#eexcess_tab').find('a').removeAttr('class');
    $('#eexcess_' + widget.params.tab).attr('class', 'selected');
    if(widget.results.query === 'search text...') {
        $('#eexcess_query').attr('placeholder', widget.results.query);
    } else {
    $('#eexcess_query').val(widget.results.query);
    }
//    $('#eexcess_query').val('');
//    $('#eexcess_query').attr('placeholder', widget.results.query);

    switch (widget.params.tab) {
        case 'results':
            EEXCESS.results.showResults(widget.results.data);
            break;
        case 'options':
            $('#eexcess_content').empty();
            $('#eexcess_content').append($('<iframe src="/privacy/options.html" style="display: inline; width: 100%; height: 100%;"></iframe>'));
        	break;
        case 'task':
            EEXCESS.task.init(widget.task);
            break;
    }

    setTimeout(function() {
        $('#eexcess_content').scrollTop(widget[widget.params.tab].scroll);
    }, 200);
};


/**
 * Initializes the widget's view with the current state of the widget in the background script's model
 * @memberOf EEXCESS
 * @param {Object} widget The current state of the widget's model in the background script
 */
EEXCESS.init = function(widget) {
    $('#eexcess_tab a.inline').click(function(evt) {
        evt.preventDefault();
        $('#eexcess_tab').find('a').removeAttr('class');
        $(this).attr('class', 'selected');
        $('#eexcess_content').empty();
        $('#eexcess_content').append($('<div id="eexcess_loading"><img id="eexcess_loading" src="../media/loading.gif" /></div>'));
        EEXCESS.callBG({method: {parent: 'model', func: 'changeTab'}, data: $(this).data('name')});
    });

    var form = $('#eexcess_searchForm');
    form.submit(function() {
        $('#eexcess_content').empty();
        $('#eexcess_content').unbind('scroll');
        $('#eexcess_content').scrollTop(0);
        $('#eexcess_content').append($('<div id="eexcess_loading"><img id="eexcess_loading" src="../media/loading.gif" /></div>'));
        var query = $('#eexcess_query').val();
        EEXCESS.callBG({method: {parent: 'model', func: 'query'}, data: query});
        return false;
    });
    EEXCESS.update(widget);
};

/**
 * Displays an error message to the user and resets the widget to its current state
 * in the background script's model
 * @memberOf EEXCESS
 * @param {String} error The error message to display
 */
EEXCESS.error = function(error) {
    alert(error);
    EEXCESS.callBG({method: {parent: 'model', func: 'widget'}}, EEXCESS.init);
};

// Initalize the widget with the current state in the background script's model on execution of this script
EEXCESS.callBG({method: {parent: 'model', func: 'widget'}}, EEXCESS.init);