var EEXCESS = EEXCESS || {};

/**
 * Encapsulates functionality for the model of the eexcess widget
 * @namespace EEXCESS.model
 */
EEXCESS.model = (function() {
    // general widget parameters
    var params = {
        visible: true,
        tab: 'results'
    };
    /**
     * Represents the current query, according results and the scroll position 
     * in the result list
     */
    var results = {
        query: 'search text...',
        data: null,
        weightedTerms:null,
        scroll: 0
    };
    // Represents the current task
    var task = {
        id: -1,
        start: 0,
        options: ['select...', 'annotate webpage', 'write a blog entry', 'other'],
        selected: '',
        individual: '',
        topics: [],
        sroll: 0,
        expertise_level: 5,
        recommendations_desirable: true,
        topics_language: 'en'
    };
    // store the topics used for the last started task
    var lastTopics = [];
    /**
     * Update results to a query with ratings from the indexedDB and send each
     * updated result to all tabs
     * @memberOf EEXCESS.model
     * @param {Array.<Recommendation>} items The results, for which to retrieve 
     * ratings
     */
    var _updateRatings = function(items) {
        var offset = results.data.results.length - items.length;
        for (var i = 0, len = items.length; i < len; i++) {
            if (typeof items[i].uri !== 'undefined') {
                EEXCESS.annotation.getRating(items[i].uri, {query: results.query}, function(score) {
                    results.data.results[this.pos].rating = score;
                    EEXCESS.sendMsgAll({
                        method: {parent: params.tab, func: 'rating'},
                        data: {uri: this.uri, score: score}
                    });
                }.bind({pos: i + offset, uri: items[i].uri}));
            }
        }
    };
    return {
        /**
         * Sets the scroll position of the current resultlist to the specified 
         * value
         * @memberOf EEXCESS.model
         * @param {Integer} value The scroll position
         */
        scroll: function(value) {
            results.scroll = value;
        },
        /**
         * Toggles the visibility of the widget
         * @memberOf EEXCESS.model
         * @returns {Boolean} true if visible, otherwise false
         */
        toggleVisibility: function() {
            params.visible = !params.visible;
            return params.visible;
        },
        quietQuery: function(tabID, data, callback) {
            var simpleQuery = '';
            for(var i=0,len=data.length; i<len;i++) {
                simpleQuery += data[i].text;
                if(i < len-1) {
                    simpleQuery += ' ';
                }
            }
            EEXCESS.logging.logQuery(tabID, data);
            var success = function(res) { // success callback
                if (res.totalResults !== 0) {
                    // update results with ratings
                    _updateRatings(res.results);
                    // provide searchResults to callback
                    callback(res);
                    // create context
                    var context = {query: simpleQuery};
                    // log results
                    EEXCESS.logging.logRecommendations(res.results, context);
                }
            };
            var error = function(error) { // error callback
                EEXCESS.sendMessage(tabID, {method: {parent:'results',func:'error'}, data: error});
            };
            // call provider (resultlist should start with first item)
            EEXCESS.backend.getCall()(data, 1, success, error);
        },
        /**
         * Executes the following functions:
         * - log the query
         * - set widget's tab to 'results' and reset scroll position
         * - query europeana
         * After a successful query to europeana, the obtained results will be
         * logged in the indexedDB and enriched with ratings from the indexedDB.
         * Furthermore they are set as the current results in the widget's model.
         * At logging the recommendations, query and active task (if present) are
         * added as context.
         * @memberOf EEXCESS.model
         * @param {Integer} tabID Identifier of the browsertab, the request 
         * originated
         * @param {String} data The query term 
         */
        query: function(tabID, data) {
            results.weightedTerms = data;
            results.query = '';
            for(var i=0,len=data.length; i<len;i++) {
                results.query += data[i].text;
                if(i < len-1) {
                    results.query += ' ';
                }
            }
            params.tab = 'results';
            results.scroll = 0;
            EEXCESS.logging.logQuery(tabID, data);
            var success = function(data) { // success callback
                // TODO: search may return no results (although successful)
                results.data = data;
                if (data.totalResults !== 0) {
                    // update results with ratings
                    _updateRatings(data.results);
                    // create context
                    var context = {query: results.query};
                    // log results
                    EEXCESS.logging.logRecommendations(data.results, context);
                }
                EEXCESS.sendMsgAll({
                    method: 'newSearchTriggered',
                    data: {query: results.query, results: results.data}
                });
            };
            var error = function(error) { // error callback
                EEXCESS.sendMessage(tabID, {method: {parent:'results',func:'error'}, data: error});
            };
            // call provider (resultlist should start with first item)
            EEXCESS.backend.getCall()(data, 1, success, error);
        },
        /**
         * Obtains more results for the current query from europeana.
         * On success, the obtained results are appended to the model's 
         * resultlist, with the further steps executed equal to 
         * {@link EEXCESS.model.query}
         * @memberOf EEXCESS.model
         * @param {Integer} tabID Identifier of the browsertab, the request 
         * originated
         * @param {Integer} data Position in the search result list to start 
         * with (the first is 1)
         */
        moreResults: function(tabID, data) {
            var success = function(data) {
                results.data.results = results.data.results.concat(data.results);
                EEXCESS.sendMsgAll({
                    method: {parent: params.tab, func: 'moreResults'},
                    data: data.results
                });
                // update results with ratings
                _updateRatings(data.results);
                // create context
                var context = {query: results.query};
                if (task.id !== -1) {
                    context.task_id = task.id;
                }
                // log results
                EEXCESS.logging.logRecommendations(data.results, context);
            };
            var error = function(error) {
                EEXCESS.sendMessage(tabID, {method: {parent:'results',func:'error'}, data: error});
            };
            EEXCESS.backend.getCall()(results.weightedTerms, data, success, error);
        },
        /**
         * Sends the current model state to the specified callback
         * @memberOf EEXCESS.model
         * @param {Integer} tabID Identifier of the browsertab, the request 
         * originated
         * @param {Object} data not used
         * @param {Function} callback
         */
        widget: function(tabID, data, callback) {
            callback({params: params, results: results, task: task});
        },
        /**
         * Changes the model's current widget tab and informs all browsertabs
         * @memberOf EEXCESS.model
         * @param {Integer} tabID Identifier of the browsertab, the request 
         * originated
         * @param {String} data The widget tab to set as current
         */
        changeTab: function(tabID, data) {
            params.tab = data;
            EEXCESS.sendMsgAll({
                method: 'update',
                data: {params: params, results: results, task: task}
            });
        },
        /**
         * Sends the current visibility state of the widget to the specified 
         * callback
         * @memberOf EEXCESS.model
         * @param {Integer} tabID Identifier of the browsertab, the request 
         * originated
         * @param {Object} data not used
         * @param {Function} callback
         */
        visibility: function(tabID, data, callback) {
            callback(params.visible);
        },
        /**
         * Adds a topic to the model's task and informs all other tabs.
         * If the current task is active, the topic is added to the task in the 
         * logs as well.
         * @memberOf EEXCESS.model
         * @param {Integer} tabID Identifier of the browsertab, the request 
         * originated
         * @param {Topic} data The topic to add
         */
        addTopic: function(tabID, data) {
            task.topics.push(data);
            EEXCESS.sendMsgOthers(tabID, {
                method: {parent: params.tab, func: 'addTopic'},
                data: data.label
            });
            if (task.id !== -1) {
                // task is active
                EEXCESS.logging.tasks.addTopic(task.id, data);
            }
        },
        /**
         * Removes a topic from the model's task and informs all other tabs.
         * If the current task is active, the topic is removed from the task in 
         * the logs as well.
         * @memberOf EEXCESS.model
         * @param {Integer} tabID Identifier of the browsertab, the request 
         * originated
         * @param {Topic} data The topic to remove
         */
        remTopic: function(tabID, data) {
            for (var i = 0, len = task.topics.length; i < len; i++) {
                if (task.topics[i].label === data) {
                    task.topics.splice(i, 1);
                    EEXCESS.sendMsgOthers(tabID, {
                        method: {parent: params.tab, func: 'removeTopic'},
                        data: data
                    });
                    break;
                }
            }
            if (task.id !== -1) {
                // task is active
                EEXCESS.logging.tasks.removeTopic(task.id, data);
            }
        },
        /**
         * Sets the 'indivual' option of the model's task to a user specified 
         * name and informs all other tabs
         * @memberOf EEXCESS.model
         * @param {Integer} tabID Identifier of the browsertab, the request 
         * originated
         * @param {String} data The name of the individual task
         */
        changeIndividual: function(tabID, data) {
            task.individual = data;
            EEXCESS.sendMsgOthers(tabID, {
                method: {parent: params.tab, func: 'changeIndividual'},
                data: data
            });
        },
        /**
         * Sets the value of the currently selected task in the model to the one 
         * specified by the user and informs all other tabs
         * @memberOf EEXCESS.model
         * @param {Integer} tabID Identifier of the browsertab, the request 
         * originated
         * @param {String} data The task name to set as the currently selected
         */
        changeOption: function(tabID, data) {
            task.selected = data;
            EEXCESS.sendMsgOthers(tabID, {
                method: {parent: params.tab, func: 'changeOption'},
                data: data
            });
        },
        /**
         * Sets the language of the topic input field to the specified value and 
         * informs all other tabs
         * @memberOf EEXCESS.model
         * @param {Integer} tabID Identifire of the browsertab, the request 
         * originated
         * @param {String} data The country code for the language to set as 
         * current for the topic input field
         * @returns {undefined}
         */
        changeTopicsLanguage: function(tabID, data) {
            task.topics_language = data;
            EEXCESS.sendMsgOthers(tabID, {
                method: {parent: params.tab, func: 'changeTopicsLanguage'},
                data: data
            });
        },
        /**
         * Sets the flag, indicating if recommendations are desirable for the 
         * current task to the specified value and informs all other tabs. If
         * the current task is active, flag is updated on the corresponding task 
         * in the log.
         * @memberOf EEXCESS.model
         * @param {Integer} tabID Identfier of the browsertab, the request 
         * originated
         * @param {Boolean} data The value, indicating if recommendations are 
         * desirable
         */
        recommendationsDesirable: function(tabID, data) {
            task.recommendations_desirable = data;
            EEXCESS.sendMsgOthers(tabID, {
                method: {parent: params.tab, func: 'recommendationsDesirable'},
                data: data
            });
            if (task.id !== -1) {
                // task is active
                EEXCESS.logging.tasks.recommendationsDesirable(task.id, data);
            }
        },
        /**
         * Changes the user's expertise level on the current task to the 
         * specified
         * value and inforrms all other tabs. If the current task is active,
         * the value is set accordingly in the log.
         * @memberOf EEXCESS.model
         * @param {Integer} tabID Identifier of the browsertab, the request 
         * originated
         * @param {Integer} data Expertise level to set (in the range of 0-10)
         */
        changeExpertiseLevel: function(tabID, data) {
            task.expertise_level = data;
            EEXCESS.sendMsgOthers(tabID, {
                method: {parent: params.tab, func: 'changeExpertiseLevel'},
                data: data
            });
            if (task.id !== -1) {
                // task is active
                EEXCESS.logging.tasks.changeExpertiseLevel(task.id, data);
            }
        },
        /**
         * Starts the current task, logs it and informs all other tabs.
         * Sets the id of the current task to the corresponding value in the
         * indexedDB.
         * @memberOf EEXCESS.model
         * @param {Integer} tabID Identifier of the browsertab, the request 
         * originated
         * @param {type} [data] not used
         */
        startTask: function(tabID, data) {
            lastTopics = [];
            for (var i = 0, len = task.topics.length; i < len; i++) {
                lastTopics.push(task.topics[i].label);
            }
            task.start = new Date().getTime();
            EEXCESS.sendMsgOthers(tabID, {
                method: {parent: params.tab, func: 'startTask'}
            });
            EEXCESS.sendMsgAll({method: 'taskStarted'});
            // log start
            var tmp_task = {
                name: task.selected,
                individual: task.individual,
                topics: task.topics,
                start: task.start,
                expertise_level: task.expertise_level,
                recommendations_desirable: task.recommendations_desirable
            };
            if (task.name === 'other') {
                tmp_task.individual = task.individual;
            }
            EEXCESS.logging.tasks.startTask(tmp_task, function(task_id) {
                task.id = task_id;
            });
        },
        /**
         * Stops the current task, logs it, informs all other tabs and resets
         * the current task's id.
         * @memberOf EEXCESS.model
         * @param {Integer} tabID Identifier of the browsertab, the request 
         * originated
         * @param {{start:String, end:String}} data start- and end-time of the 
         * task, encoded as ISO 8601
         */
        stopTask: function(tabID, data) {
            EEXCESS.sendMsgOthers(tabID, {
                method: {parent: params.tab, func: 'stopTask'}
            });
            EEXCESS.sendMsgAll({method: 'taskStopped'});
            var task_id = task.id;
            task.id = -1;
            EEXCESS.logging.tasks.stopTask(task_id, data);
        },
        /**
         * Sets the rating score of a resource in the resultlist to the 
         * specified value, logs the rating and informs all other tabs.
         * The query and current task (if active) is added to the rating as 
         * context in the log.
         * @memberOf EEXCESS.model
         * @param {Integer} tabID Identifier of the browsertab, the request 
         * originated
         * @param {Object} data rating of the resource
         * @param {String} data.uri URI of the rated resource
         * @param {Integer} data.score Score of the rating
         * @param {Integer} data.pos Position of the resource in the resultlist
         */
        rating: function(tabID, data) {
            console.log(data);
            var context = {query: results.query};
            if (task.id !== -1) {
                context.task_id = task.id;
            }
            EEXCESS.annotation.rating(data.uri, data.score, context, true);
            results.data.results[data.pos].rating = data.score;
            EEXCESS.sendMsgOthers(tabID, {
                method: {parent: params.tab, func: 'rating'},
                data: data
            });
        },
        /**
         * Returns the model's current context. The context contains the current
         * query (if any) and the currently active task (if any)
         * @memberOf EEXCESS.model
         * @returns {Object} the context
         */
        getContext: function() {
            var context = {};
            if (results.query !== 'search text...') {
                context.query = results.query;
            }
            if (task.id !== -1) {
                // task is active
                context.task_id = task.id;
            }
            return context;
        },
        /**
         * Returns the visibility state of the eexcess widget
         * @memberOf EEXCESS.model
         * @returns {Boolean} true if visible, false otherwise
         */
        getVisibility: function() {
            return params.visible;
        },
        /**
         * Hands the topics used with the last task to the provided callback
         * @param {Integer} tabID Identifier of the browsertab, the request 
         * originated
         * @param {Object} data (not used)
         * @param {Function} callback Function to call with the last topics
         */
        getLastTopics: function(tabID, data, callback) {
            callback(lastTopics);
        },
        /**
         * Hands a boolean flag, indicating, if an active task is present, to
         * the provided callback
         * @param {Integer} tabID Identifier of the browsertab, the request
         * originated
         * @param {Object} data (not used)
         * @param {Function} callback (not used)
         */
        getTaskActive: function(tabID, data, callback) {
            callback(task.id !== -1);
        },
        getResults: function(tabID, data, callback) {
            callback({query: results.query, results: results.data});
        }

    };
}());

