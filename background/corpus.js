var EEXCESS = EEXCESS || {};

/**
 * Encapsulates functionality for logging user actions.
 * @namespace EEXCESS.logging
 * @type {Object}
 * @returns {Object} Returns a set of functions for logging user actions
 */
EEXCESS.corpus = (function() {
    return {
        getCorpus: function(tabID, data, callback) {
            var worker = new Worker('background/corpus_webWorker.js');
            worker.addEventListener('message', function(e) {
                // send corpus back to content script
                callback(e.data);
            }, false);
            worker.postMessage({request: 'tokenize', elements: data, language: 'en'});
        }
    };
}());