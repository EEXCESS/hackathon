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
    return {
        /**
         * Creates an annotation in json-ld format, representing a rating of
         * the provided resource with the given score and stores it in the database.
         * If a rating for this resource with the same context is already present in the database, its score will be updated.
         * @memberOf EEXCESS.annotation
         * @param {String} resource URI of the resource to rate
         * @param {Integer} score The rating's score
         * @param {Object} context The context of the score assignment (a 
         * resource may be rated positive when provided as result to a certain 
         * query, but negative in the context of another query)
         * @param {Boolean} beenRecommended Flag for indicating if the resource was recommended by the EEXCESS framework
         */
        rating: function(resource, score, context, beenRecommended) {
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

            // log rating on pp
            var xhr = $.ajax({
                url: EEXCESS.config.LOG_RATING_URI,
                data: JSON.stringify({"uuid":EEXCESS.profile.getUUID(),"rating":rating}),
                type: 'POST',
                contentType: 'application/json; charset=UTF-8',
                dataType: 'json'
            });
            
            // store rating
            EEXCESS.storage.setRating(rating);
        },
        /**
         * Retrieves the rating score of a resource from the database. 
         * @memberOf EEXCESS.annotation
         * @param {String} uri The resource for which to retrieve a score
         * @param {Object} context A context for which to retrieve ratings
         * @param {ratingScoreCallback} callback Function to call with the retrieved rating score
         */
        getRating: function(uri, context, callback) {
            EEXCESS.storage.getRating(uri, context, callback);
        }
    };
})();