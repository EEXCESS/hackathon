/**
 * @typedef Range
 * @type {Object}
 * @property {String} start XPath of the DOM-Element, in which the range starts
 * @property {String} end XPath of the DOM-ELement in which the range ends
 * @property {Integer} startOffset Starting position of the range in the start element (first character is 0)
 * @property {Integer} endOffset Ending position of the range in the end element (first character is 0)
 */

/**
 * 
 * @typedef Json_TextAnnotation
 * @type {Object}
 * @property {Integer} id The annotation's identifier
 * @property {Array.<Range>} ranges The ranges, the annotation is targeting
 * @property {String} quote A quote of the text, the annotation is targeting
 * @property {String} prefix A small piece of text immediately before the annotation's quote
 * @property {String} suffix A small piece of text immediately after the annotation's quote
 * @property {String} uri The URI of the document, containing the targeted text
 * @property {String} text A textual annotation about the target
 * @property {String[]} tags Tags about the target
 */

/**
 * @typedef JsonLD_TextAnnotation
 * @type {Object}
 * @property {Integer} id The annotatinon's identifier
 * @property {Array.<Range>} ranges The ranges, the annotation is targeting
 * @property {String} annotation.hasTarget.hasSelector.oa:exact A quote of the annotated text
 * @property {String} annotation.hasTarget.hasSelector.oa:prefix A small piece of text, preceding the annotated text
 * @property {String} annotation.hasTarget.hasSelector.oa:suffix A small pieco of text, following the annotated text
 * @property {String} resource URI of the document, containing the annotated text
 */

/**
 * @typedef Topic
 * @property {String} label A (human-readable) label for the topic
 * @property {String} [uri] A (machine-readable) URI for the topic
 */

/**
 * @typedef Task_db
 * @type {Object}
 * @property {String} name The task's name
 * @property {Array.<Topic>} topics The topics associated with this task
 * @property {Number} start Timestamp with the task's starttime in milliseconds from the epoch
 * @property {Integer} expertise_level The user's expertise level on this task and topics, ranging from 0-10
 * @property {Boolean} recommendations_desirable Flag, indicating if a user wants recommendations for this task 
 */

/**
 * @typedef TaskWrapper
 * @property {Integer} id Identifier of the current task (-1 for an inactive task)
 * @property {String} selected The currently selected task
 * @property {Array.<String>} options Selectable task names
 * @property {String} individual A user-defined task name. This is used,
 * if task name 'other' from options is selected
 * @property {Boolean} recommendations_desirable Flag, indicating if
 * recommendations are desirable for the current task
 * @property {Integer} expertise_level Level of the user's expertise 
 * on the current task (in the range of 0-10)
 * @property {Array.<Topic>} topics Array of topics associated with the current task
 */

/**
 * @typedef Recommendation
 * @property {String} guid globally unique identifier of recommended resource
 * TODO: add further properties
 */

/**
 * @callback ratingScoreCallback
 * @param {Integer} score
 */

/**
 * @callback reqTextAnnotationsCallback
 * @param {Array.<Json_TextAnnotation>} textAnnotations
 */

/**
 * @callback querySuccess
 * @param {Object} result
 */

/**
 * @callback queryError
 * @param {String} error The error message
 */

/**
 * @callback startedTaskStored
 * @param {Integer} taskID The indexedDB's identifier assigned to the started task
 */

/**
 * @callback demographicsResult
 * @param {Array} demographics Demographics of a user represent as an array of name/value-pairs
 */

/**
 * callback messageCallback
 * @param {String} message The message to send
 */