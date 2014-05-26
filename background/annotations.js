/*
 * @namespace EEXCESS
 * @type {Object}
 */
var EEXCESS = EEXCESS || {};

/**
 * This function encapsulates variables and functions for storing and retrieving
 * annotations.
 * @type {Object}
 * @namespace EEXCESS.annotation
 * @return {Object} Returns a set of functions to store and retrieve annotations
 */
EEXCESS.annotation = (function() {
    /**
     * Creates textual and semantic tagging bodies for an annotation
     * @memberOf EEXCESS.annotation
     * @param {String} text The input text for which to create a textual body. 
     * An empty String does not create a body.
     * @param {String[]} tags The tags for which to create semantic tagging bodies.
     * A separate body is created for each tag.
     * @returns {Array} the created bodies
     */
    var _createBodies = function(text, tags) {
        var bodies = [];
        // textual body
        if (text !== '') {
            bodies.push({
                '@type': ['cnt:ContentAsText', 'oa:Tag'],
                'chars': text
            });
        }
        // semantic tagging bodies
        if (tags.length > 0) {
            for (var i = 0, len = tags.length; i < len; i++) {
                bodies.push({
                    '@type': 'oa:SemanticTag',
                    '@id': tags[i]
                });
            }
        }
        return bodies;
    };

    /**
     * Creates a text annotation in json format out of a json-ld formatted 
     * annotation
     * @memberOf EEXCESS.annotation
     * @param {JsonLD_TextAnnotation} data The annotation in json-ld format
     * @returns {Json_TextAnnotation} the annotation
     */
    var _createTextAnnotation = function(data) {
        var annotation = {
            id: data.id,
            ranges: data.ranges,
            quote: data.annotation.hasTarget.hasSelector['oa:exact'],
            prefix: data.annotation.hasTarget.hasSelector['oa:prefix'],
            suffix: data.annotation.hasTarget.hasSelector['oa:suffix'],
            uri: data.resource,
            text: '',
            tags: []
        };
        var bodies = data.annotation.hasBody;
        for (var i = 0, len = bodies.length; i < len; i++) {
            if (bodies[i]['@type'].indexOf('cnt:ContentAsText') > -1) {
                annotation.text = bodies[i]['chars'];
            } else if (bodies[i]['@type'] === 'oa:SemanticTag') {
                annotation.tags.push(bodies[i]['@id']);
            }
        }
        return annotation;
    };
    return {
        /**
         * Creates an annotation in json-ld format, representing a rating of
         * the provided resource with the given score and stores it in the indexedDB.
         * If a rating for this resource with the same context is already present in the database, its score is updated.
         * @memberOf EEXCESS.annotation
         * @param {String} resource URI of the resource to rate
         * @param {Integer} score The rating's score
         * @param {Object} context The context of the score assignment (a 
         * resource may be rated positive when provided as result to a certain 
         * query, but negative in the context of another query)
         * @param {Boolean} beenRecommended Flag for indicating if the resource was recommended by the EEXCESS framework
         * @param {String} type The type of the resource (represented by a dctypes value)
         */
        rating: function(resource, score, context, beenRecommended) {
            var entryExists = false;
            // create json-ld format
            var rating = {
                resource: resource,
                timestamp: new Date().getTime(),
                context: context,
                beenRecommended: beenRecommended,
                type: 'rating',
                annotation: {
                    '@context': 'http://www.w3.org/ns/oa-context-20130208.json',
                    '@type': 'oa:Annotation',
                    'hasTarget': {
                        '@id': resource
                    },
                    'hasBody': {
                        'http://purl.org/stuff/rev#rating': score,
                        'http://purl.org/stuff/rev#minRating': 1,
                        'http://purl.org/stuff/rev#maxRating': 2
                    }
                }
            };

            var xhr = $.ajax({
                url: localStorage['PP_BASE_URI'] + 'api/v1/log/rating',
                data: JSON.stringify({"uuid":EEXCESS.profile.getUUID(),"rating":rating}),
                type: 'POST',
                contentType: 'application/json; charset=UTF-8',
                dataType: 'json'
            });

            var tx = EEXCESS.DB.transaction('resource_relations', 'readwrite');
            var store = tx.objectStore('resource_relations');
            var idx = store.index('resource');
            var curreq = idx.openCursor(resource);

            // if rating with same context is present in database, update it
            curreq.onsuccess = function() {
                var cursor = curreq.result;
                if (cursor) {
                    if (cursor.value.type === 'rating' && cursor.value.context.query === context.query) {
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
                    var tx2 = EEXCESS.DB.transaction('resource_relations', 'readwrite');
                    var store2 = tx2.objectStore('resource_relations');
                    store2.put(rating);
                }
            };
        },
        /**
         * Retrieves the rating score of a resource from the indexedDB. There may be
         * more than one rating on this resource for different contexts. This
         * function ignores the context and takes the first rating found.
         * @memberOf EEXCESS.annotation
         * @param {String} uri The resource for which to retrieve a score
         * @param {Object} context A context for which to retrieve ratings (unused)
         * @param {ratingScoreCallback} callback Function to call with the retrieved rating score
         */
        getRating: function(uri, context, callback) {
            var tx = EEXCESS.DB.transaction('resource_relations');
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
                                callback(req.result.annotation.hasBody['http://purl.org/stuff/rev#rating']);
                            } else {
                                cursor.continue();
                            }
                        }
                    };
                }
            };
        },
// TODO: other types of annotations.... (not only text->specificResource)
        /**
         * Creates an annotation of text in json-ld format from the provided data and 
         * stores it in the indexedDB.
         * @memberOf EEXCESS.annotation
         * @param {Integer} tabID Identifier of the tab, the request originated
         * @param {Json_TextAnnotation} data The annotation to store in json format
         */
        storeTextAnnotation: function(tabID, data) {
            var tmp = {// transform to json-ld
                type: 'annotation',
                timestamp: new Date().getTime(),
                ranges: data.ranges,
                resource: data.uri,
                annotation: {
                    '@context': 'http://www.w3.org/ns/oa-context-20130208.json',
                    '@type': 'oa:Annotation',
                    'oa:motivatedBy': 'oa:tagging',
                    'hasTarget': {
                        'oa:hasSource': {
                            '@id': data.uri,
                            '@type': 'dctypes:text'
                        },
                        '@type': 'oa:SpecificResource',
                        'hasSelector': {
                            '@type': 'oa:TextQuoteSelector',
                            'oa:exact': data.quote,
                            'oa:prefix': data.prefix,
                            'oa:suffix': data.suffix
                        }
                    },
                    'hasBody': _createBodies(data.text, data.tags)
                }
            };
            var tx = EEXCESS.DB.transaction('resource_relations', 'readwrite');
            tx.objectStore('resource_relations').add(tmp);
        },
        /**
         * Updates the bodies of an existing annotation in the database.
         * @memberOf EEXCESS.annotation
         * @param {Integer} tabID Identifier of the tab, the request originated
         * @param {Json_TextAnnotation} data The annotation with newer values in json format
         */
        updateTextAnnotation: function(tabID, data) {
            var tx = EEXCESS.DB.transaction('resource_relations', 'readwrite');
            var store = tx.objectStore('resource_relations');
            // provided annotation has an id (direct update possible)
            if (typeof data.id !== 'undefined') {
                var curreq = store.openCursor(data.id);
                curreq.onsuccess = function() {
                    var cursor = curreq.result;
                    if (cursor) {
                        cursor.value.annotation.hasBody = _createBodies(data.text, data.tags);
                        cursor.update(cursor.value);
                    }
                };
            } else {
                /**
                 * provided annotation does not have an id (this case may occur, 
                 * if a newly created annotation (in the frontend) is not yet 
                 * updated with the identifier of the corresponding entry in the 
                 * database).
                 */
                var idx = store.index('resource');
                var curreq = idx.openCursor(data.uri);
                curreq.onsuccess = function() {
                    var cursor = curreq.result;
                    if (cursor) {
                        // check for same quote (adding new annotations to the same quote is up to the frontend)
                        if (cursor.value.type === 'annotation' && cursor.value.annotation.hasTarget.hasSelector['oa:exact'] === data.quote) {
                            cursor.value.annotation.hasBody = _createBodies(data.text, data.tags);
                            cursor.update(cursor.value);
                        } else {
                            cursor.continue();
                        }
                    }
                };
            }
        },
        /**
         * Removes the annotation with the provided identifier from the indexedDB
         * @memberOf EEXCESS.annotation
         * @param {Integer} tabID  Identifier of the tab, the request originated
         * @param {Object} annotation The annotation to delete
         * @param {Integer} annotation.id The annation's identifier (may be
         * undefined)
         * @param {String} annotation.quote The text, the annotation is about
         */
        deleteAnnotation: function(tabID, annotation) {
            var tx = EEXCESS.DB.transaction('resource_relations', 'readwrite');
            var store = tx.objectStore('resource_relations');
            if (typeof annotation.id !== 'undefined') {
                store.delete(annotation.id);
            } else {
                /**
                 * provided annotation does not have an id (this case may occur, 
                 * if a newly created annotation (in the frontend) is not yet 
                 * updated with the identifier of the corresponding entry in the 
                 * database).
                 */
                var idx = store.index('resource');
                var curreq = idx.openCursor(annotation.uri);
                curreq.onsuccess = function() {
                    var cursor = curreq.result;
                    if (cursor) {
                        // check for same quote
                        if (cursor.value.type === 'annotation' && cursor.value.annotation.hasTarget.hasSelector['oa:exact'] === annotation.quote) {
                            cursor.delete();
                        } else {
                            cursor.continue();
                        }
                    }
                };
            }
        },
        /**
         * Retrieves all text annotations for the provided resource from the
         * database. 
         * @memberOf EEXCESS.annotation
         * @param {Integer} tabID Identifier of the tab, the request originated
         * @param {String} resource The resource for which to retrieve annotations
         * @param {reqTextAnnotationsCallback} callback Function to be called after retrieving the annotations, expecting the results as parameter
         */
        getTextAnnotations: function(tabID, resource, callback) {
            var annotations = [];
            var tx = EEXCESS.DB.transaction('resource_relations');
            var store = tx.objectStore('resource_relations');
            var idx = store.index('resource');
            var curreq = idx.openCursor(resource);
            curreq.onsuccess = function() {
                var cursor = curreq.result;
                if (cursor) {
                    if (cursor.value.type === 'annotation') {
                        annotations.push(_createTextAnnotation(cursor.value));
                        cursor.continue();
                    } else {
                        cursor.continue();
                    }
                }
            };
            tx.oncomplete = function() {
                callback(annotations);
            };
        }
    };
})();