var EEXCESS = EEXCESS || {};

// JSON.pruned : a function to stringify any object without overflow
// example : var json = JSON.pruned({a:'e', c:[1,2,{d:{e:42, f:'deep'}}]})
// two additional optional parameters :
//   - the maximal depth (default : 6)
//   - the maximal length of arrays (default : 50)
// GitHub : https://github.com/Canop/JSON.prune
// This is based on Douglas Crockford's code ( https://github.com/douglascrockford/JSON-js/blob/master/json2.js )
(function() {
    'use strict';

    var DEFAULT_MAX_DEPTH = 6;
    var DEFAULT_ARRAY_MAX_LENGTH = 50;
    var seen; // Same variable used for all stringifications

    Date.prototype.toPrunedJSON = Date.prototype.toJSON;
    String.prototype.toPrunedJSON = String.prototype.toJSON;

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
            escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
            meta = {// table of character substitutions
        '\b': '\\b',
        '\t': '\\t',
        '\n': '\\n',
        '\f': '\\f',
        '\r': '\\r',
        '"': '\\"',
        '\\': '\\\\'
    };

    function quote(string) {
        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function(a) {
            var c = meta[a];
            return typeof c === 'string'
                    ? c
                    : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }

    function str(key, holder, depthDecr, arrayMaxLength) {
        var i, // The loop counter.
                k, // The member key.
                v, // The member value.
                length,
                partial,
                value = holder[key];
        if (value && typeof value === 'object' && typeof value.toPrunedJSON === 'function') {
            value = value.toPrunedJSON(key);
        }

        switch (typeof value) {
            case 'string':
                return quote(value);
            case 'number':
                return isFinite(value) ? String(value) : 'null';
            case 'boolean':
            case 'null':
                return String(value);
            case 'object':
                if (!value) {
                    return 'null';
                }
                if (depthDecr <= 0 || seen.indexOf(value) !== -1) {
                    return '"-pruned-"';
                }
                seen.push(value);
                partial = [];
                if (Object.prototype.toString.apply(value) === '[object Array]') {
                    length = Math.min(value.length, arrayMaxLength);
                    for (i = 0; i < length; i += 1) {
                        partial[i] = str(i, value, depthDecr - 1, arrayMaxLength) || 'null';
                    }
                    v = partial.length === 0
                            ? '[]'
                            : '[' + partial.join(',') + ']';
                    return v;
                }
                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        try {
                            v = str(k, value, depthDecr - 1, arrayMaxLength);
                            if (v)
                                partial.push(quote(k) + ':' + v);
                        } catch (e) {
                            // this try/catch due to some "Accessing selectionEnd on an input element that cannot have a selection." on Chrome
                        }
                    }
                }
                v = partial.length === 0
                        ? '{}'
                        : '{' + partial.join(',') + '}';
                return v;
        }
    }

    JSON.pruned = function(value, depthDecr, arrayMaxLength) {
        seen = [];
        depthDecr = depthDecr || DEFAULT_MAX_DEPTH;
        arrayMaxLength = arrayMaxLength || DEFAULT_ARRAY_MAX_LENGTH;
        return str('', {'': value}, depthDecr, arrayMaxLength);
    };

}());


/**
 * Replaces predefined entities in XML
 * @memberOf EEXCESS
 * @param {String} text the original text
 * @returns {String} text with entities replaced
 */
EEXCESS.escapeXMLchars = function(text) {
    text = text.replace(/&/g, "&amp;");
    text = text.replace(/</g, "&lt;");
    text = text.replace(/>/g, "&gt;");
    text = text.replace(/"/g, "&quot;");
    text = text.replace(/'/g, "&apos;");
    return text;
};

/**
 * packages the object stores of the corresponding indexedDB into a zip file and
 * downloads it. Information about the browser is added in the file browserInfo
 * @memberOf EEXCESS
 * 
 */
EEXCESS.downloadDB = function() {
    // initialize db connection
    var db = indexedDB.open("eexcess_db");

    db.onsuccess = function() {
        console.log("db initialized");

        zip.workerScriptsPath = "../media/lib/zip/";
        // use a BlobWriter to store the zip into a Blob object
        zip.createWriter(new zip.BlobWriter(), function(writer) {
            var i = 0;
            getOS();
            function getOS() {
                var pInfo = document.getElementById("progress-nr");
                pInfo.innerHTML = "processing file " + i + " of " + db.result.objectStoreNames.length;
                if (i < db.result.objectStoreNames.length) {
                    var os = db.result.objectStoreNames[i];
                    // open transaction
                    var tx = db.result.transaction(os);
                    var store = tx.objectStore(os);

                    // get contents from indexedDB
                    var json = {};
                    //var xml = "<" + os + ">";
                    var cursor = store.openCursor(IDBKeyRange.lowerBound(0));
                    cursor.onsuccess = function(e) {
                        var res = e.target.result;
                        if (res !== null) {
                            json[res.key] = res.value;
                            var itemKey = res.key;
                            //xml += "<item key=\"" + itemKey + "\">" + json2xml(res.value) + "</item>";
                            res.continue();
                        }
                    };

                    // package contents of object store into zip file
                    tx.oncomplete = function() {
                        //xml += "</" + os + ">";
                        console.log(i + ": " + os);
                        // add XML contents as string via textReader
                        //writer.add(os + ".xml", new zip.TextReader(xml), function() {
                        // onsuccess callback
                        // add JSON contents as string via textReader
                        writer.add(os + ".json", new zip.TextReader(JSON.stringify(json)), function() {
                            // onsuccess callback
                            // move to next object store
                            i++;
                            getOS();
//                            }, function(currentIndex, totalIndex) {
//                                // onprogress callback
//                                var pBar = document.getElementById("progress-bar");
//                                var progress = (currentIndex / totalIndex) * 50 + 50;
//                                pBar.style.width = progress + "%";
//                            });
                        }, function(currentIndex, totalIndex) {
                            // onprogress callback
                            var pBar = document.getElementById("progress-bar");
                            var progress = (currentIndex / totalIndex) * 100;
                            pBar.style.width = progress + "%";
                        });
                    };
                } else {
                    try {
                        // add browser info
                        var browserInfo = {
                            jQerySupport: $.support,
                            navigator: window.navigator
                        };
                        writer.add("browserInfo.json", new zip.TextReader(JSON.pruned(browserInfo)), function() {

                            // close the zip writer and provide the file as download
                            writer.close(function(blob) {
                                // blob contains the zip file as a Blob object
                                var blobURL = URL.createObjectURL(blob);
                                var zipLink = document.createElement("a");
                                zipLink.href = blobURL;
                                zipLink.download = "archive.zip";
                                // simulate click
                                var clickEvent = new MouseEvent('click', {});
                                zipLink.dispatchEvent(clickEvent);
                            });
                            pInfo.innerHTML = "processed all files";
                        });
                    } catch (e) {
                        // close the zip writer and provide the file as download
                        writer.close(function(blob) {
                            // blob contains the zip file as a Blob object
                            var blobURL = URL.createObjectURL(blob);
                            var zipLink = document.createElement("a");
                            zipLink.href = blobURL;
                            zipLink.download = "archive.zip";
                            // simulate click
                            var clickEvent = new MouseEvent('click', {});
                            zipLink.dispatchEvent(clickEvent);
                        });
                        pInfo.innerHTML = "processed all files";
                    }
                }
            }
        }, function(error) {
            // onerror callback
            console.log(error);
        });
    };

    db.onerror = function() {
        alert("DB ERROR: \n\n" + this.webkitErrorMessage);
        console.log(this);
    };
};

/**
 * add handler to invoke db download
 */
document.getElementById('download_iddb').onclick = function() {
    EEXCESS.downloadDB();
};

EEXCESS.kill_log = (function() {
    $('#kill_log').click(function(evt) {
        evt.preventDefault();
        // initialize db connection
        var db = indexedDB.open("eexcess_db");

        db.onsuccess = function() {
            var tx = db.result.transaction('tasks');
            var store = tx.objectStore('tasks');
            var countreq = store.count();
            countreq.onsuccess = function() {
                $('#kill_dialog').dialog({
                    modal: true,
                    width: 800,
                    buttons: [{
                            text: 'proceed',
                            click: function() {
                                var lb = 0;
                                if(!$('#task_list').is(':empty')) {
                                 lb = $('#task_list option:selected').data('lb');   
                                }
                                if ($('#warning').is(':visible')) {
                                    deleteHandler(lb);
                                } else {
                                    if (lb === 0) {
                                        $('#warning').text('WARNING: you are about to remove all your actions from the log').show();
                                    } else {
                                        $('#warning').text('WARNING: you are about to remove all your actions from the log since ' + new Date(lb).toLocaleString()).show();
                                    }
                                }
                            }
                        }, {
                            text: 'cancel',
                            click: function() {
                                $(this).dialog("close");
                            }
                        }],
                    open: function() {
                        if (countreq.result > 1) {
                            $('#several_tasks').show();
                            var curreq = store.openCursor(null, 'prev');
                            curreq.onsuccess = function() {
                                var cursor = curreq.result;
                                if (cursor) {
                                    var name = cursor.value.name;
                                    if (name === 'other') {
                                        name = cursor.value.individual;
                                    }
                                    var end = 'unknown';
                                    var lb = 0;
                                    if (typeof cursor.value.end !== 'undefined') {
                                        end = new Date(cursor.value.end).toLocaleString();
                                        lb = cursor.value.end;
                                    } else {
                                        lb = cursor.value.start;
                                    }
                                    $('#task_list').append('<option data-lb="' + lb + '">start: ' + new Date(cursor.value.start).toLocaleString() + ' | end: ' + end + ' - ' + name + '</option>');
                                    cursor.continue();
                                }
                            };
                            // TODO  
                        } else {
                            $('#single_task').show();
                        }
                    },
                    close: function() {
                        $('#task_list').empty();
                        $('#single_task').hide();
                        $('#several_tasks').hide();
                        $('#warning').hide();
                    }
                });
//                var confirmed = false;
//                var lb;
//                if (countreq.result > 1) {
//                    var curreq = store.openCursor(null, 'prev');
//                    curreq.onsuccess = function() {
//                        var cursor = curreq.result;
//                        if (cursor) {
//                            if (typeof cursor.value.end !== 'undefined') {
//                                confirmed = confirm('This will remove all your actions from the log since the end of the last task\n - name of the last task: ' + cursor.value.name + '\n - ending time: ' + new Date(cursor.value.end).toLocaleString() + '\n Are you sure?');
//                                if(confirmed) {
//                                    deleteHandler(cursor.value.end);
//                                }
//                            } else {
//                                cursor.continue();
//                            }
//                        }
//                    };
//                }
//                else {
//                    confirmed = confirm('This will remove all your actions from the log\n Are you sure?');
//                    if(confirmed) {
//                        deleteHandler(0);
//                    }
//                }

                function deleteHandler(lb) {
                    console.log(lb);
                    $('#remove_list').show();
                    var i = 0;
                    deleteFromOS(lb);
                    function deleteFromOS(lowerbound) {
                        if (i < db.result.objectStoreNames.length) {
                            var osName = db.result.objectStoreNames[i];
                            var li = $('<li>removing from: ' + osName + '</li>');
                            $('#remove_list').append(li);
                            var tx = db.result.transaction(osName, 'readwrite');
                            var store = tx.objectStore(osName);
                            var index;
                            try {
                                index = store.index('timestamp');
                            } catch (DOMException) {
                                index = store.index('start');
                            }
                            var curreq = index.openCursor(IDBKeyRange.lowerBound(lowerbound));
                            curreq.onsuccess = function() {
                                var cursor = curreq.result;
                                if (cursor) {
                                    var delreq = cursor.delete();
                                    delreq.onsuccess = cursor.continue();
                                }
                            };
                            tx.oncomplete = function() {
                                li.append(' - done');
                                i++;
                                deleteFromOS(lowerbound);
                            };
                        } else {
                            alert('deleted all logs since: ' + new Date(lb).toLocaleString());
                            $('#remove_list').hide();
                            $('#remove_list').empty();
                            $('#kill_dialog').dialog('close');
                        }
                    }
                    ;
                }
                ;
            };
        };
    });
}());



      