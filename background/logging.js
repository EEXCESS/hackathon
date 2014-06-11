/**
 * Extend the String object with a 'startsWith' method
 */
if (typeof String.prototype.startsWith !== 'function') {
    /**
     * Checks, if a string-object starts with the provided term
     * @global
     * @param {String} str the term to check
     * @returns {Boolean} true, if the string starts with the provided term, otherwise false
     */
    String.prototype.startsWith = function(str) {
        return this.slice(0, str.length) === str;
    };
}

var EEXCESS = EEXCESS || {};

/**
 * Encapsulates functionality for logging user actions.
 * @namespace EEXCESS.logging
 * @type {Object}
 * @returns {Object} Returns a set of functions for logging user actions
 */
EEXCESS.logging = (function() {
    /**
     * The indexedDB's identifier for the entry of the latest textual input logged.
     * User input's are (iner alia) logged by a timeout, thus a user may still
     * be adding text to the same field after the text input was logged. The
     * avoidance of duplicates is achieved by checking if current input to be
     * logged extends the latest entry in the database.
     */
    var lastInputTextId = -1;
    return {
        /**
         * Encapsulates functionality for logging user tasks
         * @namespace EEXCESS.logging.tasks
         */
        tasks: {
            /**
             * Store the provided starting task into the indexedDB
             * @memberOf EEXCESS.logging.tasks
             * @param {Task_db} task The task to start
             * @param {startedTaskStored} callback Function to call with the indexedDB's identifier of the task after storing it
             */
            startTask: function(task, callback) {
                var tx = EEXCESS.DB.transaction('tasks', 'readwrite');
                var store = tx.objectStore('tasks');

                var req = store.add(task);
                req.onsuccess = function() {
                    callback(req.result);
                };
                req.onerror = function() {
                    // TODO: forward error
                    console.log(this);
                };
            },
            /**
             * Modifies the start time of the task with the provided id and adds an end time.
             * @memberOf EEXCESS.logging.tasks
             * @param {Integer} task_id The identifier for the task in the indexedDB
             * @param {{start:String,end:String}} data Start and end time of the task, encoded as ISO 8601
             */
            stopTask: function(task_id, data) {
                var tx = EEXCESS.DB.transaction('tasks', 'readwrite');
                var store = tx.objectStore('tasks');

                // convert ISO 8601 to milliseconds from the epoch
                var start = new Date(data.start);
                start.setHours(start.getHours() + (start.getTimezoneOffset() / 60)); // add timezone offset
                var end = new Date(data.end);
                end.setHours(end.getHours() + (end.getTimezoneOffset() / 60));
                start = start.getTime();
                end = end.getTime();

                var req = store.get(task_id);
                req.onsuccess = function() {
                    if (typeof req.result !== 'undefined') {
                        req.result.start = start;
                        req.result.end = end;
                        store.put(req.result);
                    }
                };
            },
            /**
             * Adds a topic to task in the database, specified by the id
             * @memberof EEXCESS.logging.tasks
             * @param {Integer} task_id The identifier of the task for which to add the topic
             * @param {Topic} topic The topic to add
             */
            addTopic: function(task_id, topic) {
                var tx = EEXCESS.DB.transaction('tasks', 'readwrite');
                var store = tx.objectStore('tasks');
                var curreq = store.openCursor(task_id);
                curreq.onsuccess = function() {
                    var cursor = curreq.result;
                    if (cursor) {
                        cursor.value.topics.push(topic);
                        cursor.update(cursor.value);
                    }
                };
            },
            /**
             * Sets the 'recommendations desirable' flag of the task with the 
             * given identifier to the provided value.
             * @memberOf EEXCESS.logging.tasks
             * @param {Integer} task_id The task's identifier in the indexedDB 
             * @param {Boolean} desirable Flag, indicating if recommendations are desirable for this task
             */
            recommendationsDesirable: function(task_id, desirable) {
                var tx = EEXCESS.DB.transaction('tasks', 'readwrite');
                var store = tx.objectStore('tasks');
                var curreq = store.openCursor(task_id);
                curreq.onsuccess = function() {
                    var cursor = curreq.result;
                    if (cursor) {
                        cursor.value.recommendations_desirable = desirable;
                        cursor.update(cursor.value);
                    }
                };
            },
            /**
             * Sets the level of expertise of the task with the given id to the
             * provided value.
             * @memberOf EEXCESS.logging.tasks
             * @param {Integer} task_id The task's identifier in the indexedDB
             * @param {Integer} level The level of expertise (ranging from 0-10)
             */
            changeExpertiseLevel: function(task_id, level) {
                var tx = EEXCESS.DB.transaction('tasks', 'readwrite');
                var store = tx.objectStore('tasks');
                var curreq = store.openCursor(task_id);
                curreq.onsuccess = function() {
                    var cursor = curreq.result;
                    if (cursor) {
                        cursor.value.expertise_level = level;
                        cursor.update(cursor.value);
                    }
                };
            },
            /**
             * Removes the specfied topic from the task with the given id
             * @memberOf EEXCESS.logging.tasks
             * @param {Integer} task_id The task's identfier in the indexedDB
             * @param {Topic} topic
             */
            removeTopic: function(task_id, topic) {
                var tx = EEXCESS.DB.transaction('tasks', 'readwrite');
                var store = tx.objectStore('tasks');
                var curreq = store.openCursor(task_id);
                curreq.onsuccess = function() {
                    var cursor = curreq.result;
                    if (cursor) {
                        for (var i = 0, len = cursor.value.topics.length; i < len; i++) {
                            /**
                             * compare only labels, as URI might not be present
                             * (does not account for same label, but different URIs)
                             */
                            if (cursor.value.topics[i].label === topic) {
                                cursor.value.topics.splice(i, 1);
                                cursor.update(cursor.value);
                                break;
                            }
                        }
                    }
                };
            }
        },
        /**
         * Stores recommendations which were retrieved from a partner's datastore
         * into the indexedDB along with the context, the items were recommended
         * @memberOf EEXCESS.logging
         * @param {Array.<Recommendation>} recommendations Recommendations as returned by a query on a partner's datastore
         * @param {Object} context The context in which the recommendations were provided (can e.g. contain a query term)
         */
        logRecommendations: function(recommendations, context, timestamp) {
            var tx = EEXCESS.DB.transaction('recommendations', 'readwrite');
            var store = tx.objectStore('recommendations');
            var idx = store.index('uri');
            var i = 0;
            handleNext(); // initial item (others get handled by callback on success)
            // handle a single item
            function handleNext() {
                if (i < recommendations.length) {
                    var curreq = idx.openCursor(recommendations[i].uri);
                    curreq.onsuccess = function() {
                        var cursor = curreq.result;
                        if (cursor) {
                            /**
                             * check if recommendation is already present in database for this context
                             * compare context objects by their string representation ATTENTION: attribute order matters!!!
                             */
                            if (JSON.stringify(cursor.value.context) === JSON.stringify(context)) {
                                i++;
                                handleNext();
                            } else {
                                cursor.continue();
                            }
                        } else {
                            store.put({result: recommendations[i], uri: recommendations[i].uri, context: context, timestamp: timestamp}).onsuccess = handleNext;
                            //store.put({uri: recommendations[i].uri, context: context, timestamp:new Date().getTime()}).onsuccess = handleNext;
                            i++;
                        }
                    };
                }
            }
        },
        /**
         * Stores the term of a user-initiated query in the indexedDB along with its context.
         * If the user selected a piece of text, this is assumed to be the context, otherwise
         * the text currently in the viewport makes the context. (if a paragraph starts in the viewport, 
         * but ends outside, while still contained in the same DOM-node, the whole paragraph is stored
         * @memberOf EEXCESS.logging
         * @param {Integer} tabID Identifier of the browsertab, the query was executed in
         * @param {String} query The query term
         */
        logQuery: function(tabID, query, timestamp) {
            /**
             * request the context from the browsertab, the query was sent and
             * execute database transaction on callback
             */
            EEXCESS.sendMessage(tabID, {method: 'getTextualContext'}, function(data) {
                var tx = EEXCESS.DB.transaction('queries', 'readwrite');
                var store = tx.objectStore('queries');
                store.put({query: query, timestamp: timestamp, context: data});
            });
        },
        /**
         * Stores the user interaction of starting to view a recommended resource
         * @memberof EEXCESS.logging
         * @param {Integer} tabID Identifier of the browsertab, the request originated
         * @param {String} resource URI of the viewed resource
         */
        openedRecommendation: function(tabID, resource) {
            var tx = EEXCESS.DB.transaction('resource_relations', 'readwrite');
            var store = tx.objectStore('resource_relations');
            var tmp = {
                resource: resource,
                timestamp: new Date().getTime(),
                type: 'view',
                context: EEXCESS.model.getContext(),
                beenRecommended: true
            };
            store.add(tmp);
            tmp['action'] = 'result-view';
            tmp['uuid'] = EEXCESS.profile.getUUID();
            var xhr = $.ajax({
                url: localStorage['PP_BASE_URI'] + 'api/v1/log/rview',
                data: JSON.stringify(tmp),
                type: 'POST',
                contentType: 'application/json; charset=UTF-8',
                dataType: 'json'
            });

        },
        /**
         * Logs the duration of a user viewing a recommended resource on closing its view
         * @memberof EEXCESS.logging
         * @param {Integer} tabID Identifier of the browsertab, the request originated
         * @param {String} resource URI of the viewed resource
         */
        closedRecommendation: function(tabID, resource) {
            var tx = EEXCESS.DB.transaction('resource_relations', 'readwrite');
            var store = tx.objectStore('resource_relations');
            var idx = store.index('resource');
            var curreq = idx.openCursor(resource);

            curreq.onsuccess = function() {
                var cursor = curreq.result;
                if (cursor) {
                    if (cursor.value.type === 'view' && typeof cursor.value.duration === 'undefined') {
                        cursor.value.duration = new Date().getTime() - cursor.value.timestamp;
                        cursor.update(cursor.value);
                        var tmp = cursor.value;
                        tmp['action'] = 'result-close';
                        tmp['uuid'] = EEXCESS.profile.getUUID();
                        var xhr = $.ajax({
                            url: localStorage['PP_BASE_URI'] + 'api/v1/log/rclose',
                            data: JSON.stringify(tmp),
                            type: 'POST',
                            contentType: 'application/json; charset=UTF-8',
                            dataType: 'json'
                        });
                    } else {
                        cursor.continue();
                    }
                }
            };
        },
        /**
         * Retrieves the user's demographics from the indexedDB and hands them over
         * to a callback on success.
         * @memberOf EEXCESS.logging
         * @param {Integer} tabID Identfier of the browsertab, the request originated
         * @param {Object} data not used
         * @param {demographicsResult} callback Function to call with the retrieved demographics
         */
        getDemographics: function(tabID, data, callback) {
            var tx = EEXCESS.DB.transaction('demographics');
            var req = tx.objectStore('demographics').get(23); // currently single user, hardcoded id
            req.onsuccess = function() {
                if (typeof req.result !== 'undefined') {
                    delete req.result.user_id;
                    callback(req.result);
                }
            };
        },
        /**
         * Stores demographics of a user in the indexedDB
         * @memberof EEXESS.logging
         * @param {Integer} tabID Identifier of the browsertab, the request originated
         * @param {Array} data Demographics of a user, represented as an array of <name,value> pairs
         * @param {messageCallback} callback Function to inform requester about success
         */
        setDemographics: function(tabID, data, callback) {
            data.user_id = 23; // currently single user, hardcoded id
            var tx = EEXCESS.DB.transaction('demographics', 'readwrite');
            var req = tx.objectStore('demographics').put(data);
            req.onsuccess = function() {
                callback('demographics saved');
            };
            req.onerror = function() {
                callback('unable to save demographics');
            };
        },
        /**
         * Stores text a user has entered on a webpage in the database
         * @memberOf EEXCESS.logging
         * @param {Integer} tabID Identifier of the browsertab, the request originated
         * @param {String} input The input text to log
         */
        logInput: function(tabID, input) {
            input.type = 'textInput';
            input.eexcess_visible = EEXCESS.model.getVisibility();
            var tx = EEXCESS.DB.transaction('interactions', 'readwrite');
            var store = tx.objectStore('interactions');
            var curreq = store.openCursor(lastInputTextId);
            curreq.onsuccess = function() {
                var cursor = curreq.result;
                if (cursor) { // check if current input extends latest input
                    if (input.text.startsWith(cursor.value.text)) {
                        cursor.value.text = input.text;
                        cursor.update(cursor.value);
                    } else {
                        var req = store.put(input);
                        req.onsuccess = function() {
                            lastInputTextId = req.result;
                        };
                    }
                } else {
                    var req = store.put(input);
                    req.onsuccess = function() {
                        lastInputTextId = req.result;
                    };
                }
            };
        },
        /**
         * Stores a mouse click in the indexedDB
         * @memberOf EEXCESS.logging
         * @param {Integer} tabID Identifier of the browsertab, the request originated
         * @param {Object} clickData Data associated with the click (timestamp, position, ...)
         */
        logClick: function(tabID, clickData) {
            var tx = EEXCESS.DB.transaction('interactions', 'readwrite');
            var store = tx.objectStore('interactions');
            clickData.eexcess_visible = EEXCESS.model.getVisibility();
            clickData.type = 'click';
            store.put(clickData);
        },
        /**
         * Stores a submitted form in the indexedDB
         * @memberOf EEXCESS.logging
         * @param {Integer} tabID Identifier of the browsertab, the request originated
         * @param {Array} submitData Array of name/value pairs, containing the form data
         */
        logSubmit: function(tabID, submitData) {
            var tx = EEXCESS.DB.transaction('interactions', 'readwrite');
            var store = tx.objectStore('interactions');
            submitData.eexcess_visible = EEXCESS.model.getVisibility();
            submitData.type = 'submit';
            store.put(submitData);
        }
    };
}());

/**
 * Encapsulates functionality for logging history events
 * @namespace EEXCESS.logging.history
 */
EEXCESS.logging.history = (function() {
    // represents the current visit
    var current = {
        url: '',
        windowId: -1,
        start: 0,
        tabId: -1,
        reset: function() {
            this.url = '';
            this.windowId = -1;
            this.start = 0;
            this.tabId = -1;
        }
    };

    /**
     * Sets the variable 'current' to the current visit with the current point of
     * time as starting timestamp. If the variable already contained another visit, the
     * contained visit is stored to the indexedDB with the current point of time
     * as ending timestamp. If the current url is the same as in the 'current'-
     * variable, the content of this variable remains unchanged.
     * @memberOf EEXCESS.logging.history
     * @param {String} url The url of the current visit
     * @param {Integer} windowId Identifier of the current window
     * @param {Integer} tabId Identifier of the current browsertab
     */
    var _updateChange = function(url, windowId, tabId) {
        if (current.url !== url) {
            if (current.url !== '') {
                _updateDB({url: current.url, start: current.start, end: new Date().getTime()});
            }
            if (!url.startsWith('chrome') && !url.startsWith('https://www.google.de/webhp?sourceid=chrome')) {
                current.url = url;
                current.windowId = windowId;
                current.start = new Date().getTime();
                current.tabId = tabId;
            } else {
                current.reset();
            }
        }
    };

    /**
     * Adds additional information to a visit and stores it in the indexedDB.
     * The information added covers:
     * - transition (as obtained by chrome API)
     * - chrome_visitId (a corresponding identifier in chrome's history)
     * - referrer (url of the referrer, may be empty)
     * @memberOf EEXCESS.logging.history
     * @param {Object} item A visit item
     * @param {String} item.url The visit's url
     * @param {Number} item.start Start of the visit in milliseconds from the epoch
     * @param {Number} item.end End of the visit in milliseconds from the epoch
     */
    var _updateDB = function(item) {
        chrome.history.getVisits({url: item.url}, function(visitItems) {
            var chromeVisit = visitItems[visitItems.length - 1];
            item.transition = chromeVisit.transition;
            item.chrome_visitId = chromeVisit.visitId;
            var tx = EEXCESS.DB.transaction('history', 'readwrite');
            var store = tx.objectStore('history');
            var idx = store.index('chrome_visitId');

            var req = idx.get(chromeVisit.referringVisitId);
            req.onsuccess = function() {
                if (typeof req.result !== 'undefined') {
                    item.referrer = req.result.url;
                } else {
                    item.referrer = '';
                }
                store.add(item);
                item['uuid'] = EEXCESS.profile.getUUID();
            };
        });
    };

    // update the current visit on changes in the active tab
    chrome.tabs.onUpdated.addListener(function(tabID, changeInfo, tab) {
        if (tab.active) {
            _updateChange(tab.url, tab.windowId, tabID);
        }
    });

    // tab activated -> start of visit
    chrome.tabs.onActivated.addListener(function(activeInfo) {
        chrome.tabs.get(activeInfo.tabId, function(tab) {
            _updateChange(tab.url, activeInfo.windowId, activeInfo.tabId);
        });
    });

    // update/store the current visit on changes of the window focus
    chrome.windows.onFocusChanged.addListener(function(windowId) {
        if (windowId === chrome.windows.WINDOW_ID_NONE && current.url !== '') {
            // window has lost focus -> end of visit
            _updateDB({url: current.url, start: current.start, end: new Date().getTime()});
            current.reset();
        } else {
            // window has obtained focus -> start of visit with url of currently active tab
            chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
                if (tabs.length > 0) {
                    _updateChange(tabs[0].url, tabs[0].windowId, tabs[0].id);
                }
            });
        }
    });

    // if removed tab corresponds to current visit -> visit ended
    chrome.tabs.onRemoved.addListener(function(tabID) {
        if (current.tabId === tabID) {
            _updateDB({url: current.url, start: current.start, end: new Date().getTime()});
            current.reset();
        }
    });

    // currently not used, but may be helpful (not tested yet)
//    return {
//        getVisits: function(start, end, callback) {
//            var earliest = end;
//            var visits = [];
//            var tx = EEXCESS.DB.transaction('history');
//            var store = tx.objectStore('history');
//            var idx = store.index('start');
//            var curreq = idx.openCursor(IDBKeyRange.bound(start, end));
//
//            curreq.onsuccess = function() {
//                var cursor = curreq.result;
//                if (cursor) {
//                    if (cursor.value.start < earliest) {
//                        earliest = cursor.value.start;
//                    }
//                    visits.push(cursor.value.visit_id);
//                    cursor.continue();
//                } else {
//                    var idx_end = store.index('end');
//                    var curreq2 = idx_end.openCursor(IDBKeyRange.bound(start, earliest));
//                    curreq2.onsuccess = function() {
//                        var cursor2 = curreq.result;
//                        if (cursor2) {
//                            visits.push(cursor.value.visit_id);
//                        }
//                    };
//                }
//            };
//
//            tx.oncomplete = function() {
//                callback(visits);
//            };
//        }
//    };
})();



