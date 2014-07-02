var EEXCESS = EEXCESS || {};

EEXCESS.storage = (function() {
    var _name = 'eexcess_db'; // name of the database
    var _version = 42; // version number of the database
    var _db = {}; // the database (needs to be initalized - DO NOT ACCESS DIRECTLY! use _getDB instead)
    
    // checks, if the provided callback is a function and executes it without parameters
    var _empty_callback = function(callback) {
        if (typeof callback === 'function') {
            callback();
        }
    };
    
    // checks, if the provided callback is a function and executes it with supplied parameter
    var _optional_callback = function(callback, value) {
        if (typeof callback === 'function') {
            callback(value);
        }
    };

    /**
     * Wrapper for local storage access. If a value is supplied, it is stored at
     * with the supplied key. Otherwise the function returns the value stored at
     * the supplied key.
     * 
     * @param {String} key The key for which to retrieve/store a value
     * @param {JSON} value (optional) The value to store. If no value is
     * supplied, the value at the supplied key is returned.
     */
    var _local = function(key, value) {
        if (typeof value === 'undefined') {
            return localStorage[key];
        } else {
            localStorage[key] = value;
        }
    };

    /**
     * Obtains a connection to the database
     * 
     * @param {function} success success callback, receives the database as parameter
     * @param {function} error (optional) error callback
     */
    var _getDB = function(success, error) {
        if (typeof _db === 'IDBDatabase') {
            success(_db);
        } else {
            _init(success, error);
        }
    };

    /**
     * 
     * Puts an object into the desired object store (may overwrite an existing entry)
     * 
     * @param {String} objectStore name of the object store, where the entry should be put in
     * @param {Object} value the value to store
     * @param {Function} error (optional) error callback
     * @param {Function} success (optional) success callback
     */
    var _put = function(objectStore, value, success, error) {
        _getDB(function(db) {
            var tx = db.transaction(objectStore, 'readwrite');
            var store = tx.objectStore(objectStore);
            var req = store.put(value);
            req.onsuccess = _empty_callback(success);
            req.onerror = _empty_callback(error);
        }, _empty_callback(error));
    };

    /**
     * Adds an object to the desired object store
     * @param {String} objectStore name of the object store to which an entry should be added
     * @param {Object} value the object to add
     * @param {Function} success (optional) success callback without parameters
     * @param {Function} error (optional) error callback without parameters
     * @returns {undefined}
     */
    var _add = function(objectStore, value, success, error) {
        _getDB(function(db) {
            var tx = db.transaction(objectStore, 'readwrite');
            var store = tx.objectStore(objectStore);
            var req = store.add(value);
            req.onsuccess = _empty_callback(success);
            req.onerror = _empty_callback(error);
        }, _empty_callback(error));
    };

    /**
     * Stores the closing of a result with to the database. This means updating
     * an existing entry for a started view with the duration of the view.
     * @param {String} resource url of the resource
     * @param {Function} success (optional) success callback, receives the updated entry as parameter
     * @param {Function} error (optional) error callback without parameters
     */
    var _closedRecommendation = function(resource, success, error) {
        _getDB(function(db) {
            var tx = db.transaction('resource_relations', 'readwrite');
            var store = tx.objectStore('resource_relations');
            var idx = store.index('resource');
            var curreq = idx.openCursor(resource);

            curreq.onsuccess = function() {
                var cursor = curreq.result;
                if (cursor) {
                    if (cursor.value.type === 'view' && typeof cursor.value.duration === 'undefined') {
                        cursor.value.duration = new Date().getTime() - cursor.value.timestamp;
                        cursor.update(cursor.value);
                        _optional_callback(success, cursor.value);
                    } else {
                        cursor.continue();
                    }
                } else {
                    _empty_callback(error);
                }
            };
            curreq.onerror = _empty_callback(error);
        }, _empty_callback(error));
    };

    /**
     * Stores the rating of a resource. If a rating for this resource is already
     * present within the same context, the rating is updated
     * 
     * @param {Object} rating the rating, including the resource and context
     * @param {Function} success (optional) success callback without parameters
     * @param {Function} error (optional) error callback without parameters
     */
    var _setRating = function(rating, success, error) {
        _getDB(function(db) {
            var entryExists = false;
            var tx = db.transaction('resource_relations', 'readwrite');
            var store = tx.objectStore('resource_relations');
            var idx = store.index('resource');
            var curreq = idx.openCursor(rating.resource);

            // if rating with same context is present in database, update it
            curreq.onsuccess = function() {
                var cursor = curreq.result;
                if (cursor) {
                    if (cursor.value.type === 'rating' && cursor.value.context.query === rating.context.query) {
                        entryExists = true;
                        rating.id = cursor.primaryKey;
                        cursor.update(rating);
                    } else {
                        cursor.continue();
                    }
                }
            };

            // add new rating to database
            tx.oncomplete = function() {
                if (!entryExists) {
                    var tx2 = db.transaction('resource_relations', 'readwrite');
                    var store2 = tx2.objectStore('resource_relations');
                    var req = store2.put(rating);
                    req.onsuccess = _empty_callback(success);
                    req.onerror = _empty_callback(error);
                }
            };
            tx.onerror = _empty_callback(error);
        }, _empty_callback(error));
    };

    /**
     * Obtains the rating for a resource from the database. At the moment, the
     * rating's context is not considered (the same result item may be rated 
     * different, when retrieved by different queries), but instead, the first 
     * rating found is returned.
     * 
     * @param {String} uri the uri of the resource for which to retrieve the rating
     * @param {Object} context the context for which to retrieve the rating
     * @param {Function} success success callback, receiving the rating score as parameter
     * @param {Function} error (optional) error callback, receiving the error message as parameter
     */
    var _getRating = function(uri, context, success, error) {
        _getDB(function(db) {
            var tx = db.transaction('resource_relations');
            var store = tx.objectStore('resource_relations');
            var idx = store.index('resource');
            var curreq = idx.openKeyCursor(uri);

            curreq.onsuccess = function() {
                var cursor = curreq.result;
                if (cursor) {
                    var req = store.get(cursor.primaryKey);
                    req.onsuccess = function() {
                        if (typeof req.result !== 'undefined') {
                            if (req.result.type === 'rating') { // TODO: check context?
                                success(req.result.annotation.hasBody['http://purl.org/stuff/rev#rating']);
                            } else {
                                cursor.continue();
                            }
                        }
                    };
                } else {
                    _optional_callback(error, 'no entry found');
                }
            };
            curreq.onerror = _optional_callback(error, 'db error');
        }, _optional_callback(error, 'db error'));
    };

    /**
     * Enriches a visit with its referrer (if any) and stores it in the database
     * 
     * @param {Object} visitItem the visit to store
     * @param {Integere} referringVisitId identifier of the referring visit
     */
    var _storeVisit = function(visitItem, referringVisitId) {
        _getDB(function(db) {
            var tx = db.transaction('history', 'readwrite');
            var store = tx.objectStore('history');
            var idx = store.index('chrome_visitId');

            var req = idx.get(referringVisitId);
            req.onsuccess = function() {
                if (typeof req.result !== 'undefined') {
                    visitItem.referrer = req.result.url;
                } else {
                    visitItem.referrer = '';
                }
                store.add(visitItem);
            };
        });
    };

    /**
     * Stores recommendations in the database, along with the context in which 
     * they were retrived and a timestamp.
     * 
     * @param {Array} recommendations the recommendations to store
     * @param {Object} context the context in which the recommendations were retrieved
     * @param {long} timestamp the timestamp
     */
    var _storeRecommendations = function(recommendations, context, timestamp) {
        _getDB(function(db) {
            var tx = db.transaction('recommendations', 'readwrite');
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
                            i++;
                        }
                    };
                }
            }
        });
    };

    /**
     * Initializes or updates the database. If the rm_previous parameter is set to true or left empty, the previous entries are removed.
     * 
     * @param {function} success (optional) success callback (receives the database as parameter)
     * @param {function} error (optional) error callback (receives the error object as parameter)
     * @param {type} rm_previous (optional) flag, indicating if the previous entries should be removed (by default they are)
     */
    var _init = function(success, error, rm_previous) {
        var clear = true;
        if (typeof rm_previous === 'boolean') {
            clear = rm_previous;
        }

        // initialize connection
        var req = indexedDB.open(_name, _version);

        // update or create db
        req.onupgradeneeded = function() {
            var os;
            console.log('db upgrade needed');
            EEXCESS.DB = req.result;
            // remove existing object store 'resource_relations' if present
            if (EEXCESS.DB.objectStoreNames.contains('resource_relations') && clear) {
                EEXCESS.DB.deleteObjectStore('resource_relations');
            }
            // create object store 'resource_relations'
            os = EEXCESS.DB.createObjectStore('resource_relations', {keyPath: 'id', autoIncrement: true});
            os.createIndex('query', 'context.query');
            os.createIndex('resource', 'resource');
            os.createIndex('timestamp', 'timestamp');


            // remove existing object store 'recommendations' if present
            if (EEXCESS.DB.objectStoreNames.contains('recommendations') && clear) {
                EEXCESS.DB.deleteObjectStore('recommendations');
            }
            // create object store 'recommendations'
            os = EEXCESS.DB.createObjectStore('recommendations', {keyPath: 'recommendation_id', autoIncrement: true});
            os.createIndex('uri', 'uri');
            os.createIndex('timestamp', 'timestamp');
            os.createIndex('query', 'context.query');

            // remove existing object store 'tasks' if present
            if (EEXCESS.DB.objectStoreNames.contains('tasks') && clear) {
                EEXCESS.DB.deleteObjectStore('tasks');
            }

            // remove existing object store 'queries' if present
            if (EEXCESS.DB.objectStoreNames.contains('queries') && clear) {
                EEXCESS.DB.deleteObjectStore('queries');
            }
            // create object store 'queries'
            os = EEXCESS.DB.createObjectStore('queries', {keyPath: 'id', autoIncrement: true});
            os.createIndex('query', 'query');
            os.createIndex('timestamp', 'timestamp');

            // remove existing object store 'history' if present
            if (EEXCESS.DB.objectStoreNames.contains('history') && clear) {
                EEXCESS.DB.deleteObjectStore('history');
            }
            // create object store 'history'
            os = EEXCESS.DB.createObjectStore('history', {keyPath: 'visit_id', autoIncrement: true});
            os.createIndex('chrome_visitId', 'chrome_visitId');
            os.createIndex('start', 'start');
            os.createIndex('end', 'end');

            // remove existing object store 'demographics' if present
            if (EEXCESS.DB.objectStoreNames.contains('demographics') && clear) {
                EEXCESS.DB.deleteObjectStore('demographics');
            }

            // remove existing object store 'interactions' if present
            if (EEXCESS.DB.objectStoreNames.contains('interactions') && clear) {
                EEXCESS.DB.deleteObjectStore('interactions');
            }
            // create object store 'interactions'
            os = EEXCESS.DB.createObjectStore('interactions', {keyPath: 'id', autoIncrement: true});
            os.createIndex('timestamp', 'timestamp');
        };

        req.onsuccess = function() {
            _db = req.result;
            if (typeof success === 'function') {
                success(req.result);
            }
        };

        req.onerror = function() {
            if (typeof error === 'function') {
                error(this);
            }
        };
    };

    var _loadQueryCrumbsData = function(history_length, success, error) {
        _getDB(function(db) {
            var queries = [];

            var tx1 = db.transaction("queries");
            var index = tx1.objectStore("queries").index("timestamp");
            var i = 0;

            index.openCursor(null, "prev").onsuccess = function(event) {
                var cursor = event.target.result;
                if (cursor && i < history_length) {
                    queries.push(cursor.value);
                    i += 1;
                    cursor.continue();
                }
            };
            tx1.oncomplete = function(event) {

                var fLoadSuccess = 0;

                var pushResults = function(q) {
                    queries[q].results = [];
                    var tx_sub = db.transaction("recommendations");
                    var recIndex = tx_sub.objectStore("recommendations").index("query");
                    var queryString = '';
                    queries[q].query.forEach(function(d) {
                        queryString += d.text + ' ';
                    });
                    queryString = queryString.trim();
                    queries[q].query = queryString.split(' ');
                    var singleKeyRange = IDBKeyRange.only(queryString);
                    recIndex.openCursor(singleKeyRange).onsuccess = function(event) {
                        var cursor2 = event.target.result;
                        if (cursor2) {
                            var result = {
                                title: cursor2.value.result.title,
                                uri: cursor2.value.result.uri
                            };
                            queries[q].results.push(result);
                            cursor2.continue();
                        }
                    };

                    tx_sub.oncomplete = function(event) {
                        fLoadSuccess += 1;
                        if (fLoadSuccess === queries.length) {
                            success(queries);
                        }
                    };
                };

                for (var q = 0; q < queries.length; q++) {
                    pushResults(q);
                }
            };
        }, _empty_callback(error));
    };

    return {
        local: _local,
        put: _put,
        add: _add,
        storeVisit: _storeVisit,
        storeRecommendations: _storeRecommendations,
        getRating: _getRating,
        setRating: _setRating,
        closedRecommendation: _closedRecommendation,
        loadQueryCrumbsData: _loadQueryCrumbsData
    };
})();