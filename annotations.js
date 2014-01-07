var EEXCESS = EEXCESS || {};


/**
 * The Store plugin extends the annotator with functionality to load an save
 * annotations from and to the indexedDB. Whenever an annotation is created,
 * updated or deleted, this plugin informs the background script about the 
 * changes. Upon initialization, annotations for the current page are retrieved
 * from the background script. For newly created annotations, the plugin adds
 * a prefix and suffix to the selected text, the annotation is about, as long as
 * it is shorter than 200 characters, in order to enable the exact idendification
 * of the selected text.
 * @namespace Annotator.Plugin.Store
 */
Annotator.Plugin.Store = (function() {
    function Store(element, options) {
        this.element = element;
        this.options = options;
        // bind handler for storing new annotations
        $(this.element).bind('annotationCreated', function(evt, annotation) {
            // add prefix and suffix (only if quoted text has less than 200 chars)
            var prefix = '';
            var suffix = '';
            // start node of the selection
            var startNode = document.evaluate('/' + annotation.ranges[0].start, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            // end node of the selection
            var endNode = document.evaluate('/' + annotation.ranges[0].end, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            if (annotation.quote.length < 200) {
                var endText = $(endNode).text();
                /*
                 * Tree walker for finding the nodes next to the selection, and
                 * thus, the text for prefix & suffix. Nodes, added by the 
                 * annotator itself are excluded, since they do not belong to
                 * the original document. More precisly, 'annotator-hl' contains
                 * only a copy of the selected text.
                 */
                var walker = document.createTreeWalker(
                        document,
                        NodeFilter.SHOW_TEXT,
                        {acceptNode: function(node) {
                                if ($(node.parentNode).attr('class') === 'annotator-hl') {
                                    return NodeFilter.FILTER_REJECT;
                                }
                                return NodeFilter.FILTER_ACCEPT;
                            }}
                );
                if (annotation.ranges[0].startOffset > 0) {
                    /*
                     * The selected text for the annotation does not start at the
                     * very beginnig of the start node. Thus, the text, preceding
                     * the selection within the start node is chosen as prefix.
                     */
                    prefix = $(startNode).text().slice(0, annotation.ranges[0].startOffset);
                } else {
                    /*
                     * Selection starts at the very beginning of the start node.
                     * Thus, text preceding the start node is chosen as prefix.
                     */
                    walker.currentNode = startNode;
                    while (walker.previousNode()) {
                        var previousText = $(walker.currentNode).text();
                        if (previousText.trim() !== '') {
                            prefix = previousText;
                            break;
                        }
                    }
                }
                if (annotation.ranges[0].endOffset < endText.length) {
                    /*
                     * Selection ends within the end node. The remaining text
                     * of the end node is chosen as suffix.
                     */
                    suffix = endText.slice(annotation.ranges[0].endOffset, endText.length);
                } else {
                    /**
                     * Selection contains the last character of the end node.
                     * Text, following immediately after the end node is chosen
                     * as suffix.
                     */
                    walker.currentNode = endNode;
                    while (walker.nextNode()) {
                        var nextText = $(walker.currentNode).text();
                        if (nextText.trim() !== '') {
                            suffix = nextText;
                            break;
                        }
                    }
                }
            }
            if (prefix.length > 50) {
                // Trim prefix to 50 characters at most
                prefix = prefix.slice(prefix.length - 50, prefix.length);
            }
            if (suffix.length > 50) {
                // Trim suffix to 50 characters at most
                suffix = suffix.slice(0, 50);
            }
            // rewrite xpath of start & end element
            annotation.ranges[0].start = EEXCESS.createXPathFromElement(startNode);
            annotation.ranges[0].end = EEXCESS.createXPathFromElement(endNode);
            // TODO: handle more than one range

            // add prefix, suffix and the url of the current page 
            var tmp = {
                text: annotation.text,
                quote: annotation.quote,
                uri: window.location.hostname + window.location.pathname,
                ranges: annotation.ranges,
                tags: annotation.tags,
                prefix: prefix,
                suffix: suffix
            };
            // send annotation to background script
            EEXCESS.callBG({method: {parent: 'annotation', func: 'storeTextAnnotation'}, data: tmp});
        });

        // bind handler for updating annotations
        $(this.element).bind('annotationUpdated', function(evt, annotation) {
            // TODO: rewrite ranges' xpath?
            /*
             * Add url of the current page to the annotation. Prefix and suffix
             * are already present in the indexedDB. The url is needed to
             * identify the annotation, in the case, its id is not yet updated
             * with the value from the database.
             */
            var tmp = {
                id: annotation.id,
                text: annotation.text,
                quote: annotation.quote,
                uri: window.location.hostname + window.location.pathname,
                ranges: annotation.ranges,
                tags: annotation.tags
            };
            // send updated annotation to background script
            EEXCESS.callBG({method: {parent: 'annotation', func: 'updateTextAnnotation'}, data: tmp});
        });

        // bind handler for deleting an annotation
        $(this.element).bind('annotationDeleted', function(evt, annotation) {
            EEXCESS.callBG({
                method: {parent: 'annotation', func: 'deleteAnnotation'},
                data: {id: annotation.id, uri: window.location.hostname + window.location.pathname, quote: annotation.quote}
            });
        });

    }

    Store.prototype.pluginInit = function() {
        // load annotations
        EEXCESS.callBG({
            method: {parent: 'annotation', func: 'getTextAnnotations'},
            data: window.location.hostname + window.location.pathname}, function(annotations) {
            this.loadAnnotations(annotations);
        }.bind(this.annotator));
    };
    return Store;
})();

// initialize the annotator with 'Store' and 'Tags' plugin
$('body').annotator().annotator('addPlugin', 'Store').annotator('addPlugin', 'Tags');