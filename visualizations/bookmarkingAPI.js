function Bookmarking() {

    var INTERNAL = {};


    INTERNAL.init = function() {

        //chrome.storage.local.remove("bookmark-dictionary");
        // Retrieve current bookmark dictionary and keep it in a local variable during execution
        chrome.storage.local.get( "bookmark-dictionary", function(value){
            BOOKMARKING.Dictionary = ($.isEmptyObject(value)) ? {} : JSON.parse(value["bookmark-dictionary"]);
            console.log('Bookmark dictionary');
            console.log(BOOKMARKING.Dictionary);
        } );
    };



    INTERNAL.saveToLocalStorage = function( bookmarkDictionaryCopy ) {

        chrome.storage.local.set({ "bookmark-dictionary" : JSON.stringify( bookmarkDictionaryCopy ) }, function(){
            if(typeof chrome.runtime.lastError == 'undefined' || chrome.runtime.lastError == 'undefined'){
                console.log('Saving bookmark dictionary in local storage... SUCCESS');
            }
            else{
                console.log('Saving bookmark dictionary in local storage... FAIL');
                console.log( chrome.runtime.lastError );
            }
        });
    };



    INTERNAL.normalizeString = function( text ) {
        return text.replace(' ', '+');
    };



/****************************************************************************************************************************************************************************************************/

    var BOOKMARKING = {};


    BOOKMARKING.Dictionary;


    // Creation, Addition

    BOOKMARKING.createBookmark = function( bookmarkName, color ){

        // If bookmark to be added already exists, return false
        if( BOOKMARKING.Dictionary[bookmarkName] != 'undefined' && BOOKMARKING.Dictionary[bookmarkName] != null )
            return "bookmark to be added already exists";

        var timestamp = Date.now();

        BOOKMARKING.Dictionary[bookmarkName] = {
            'id' : INTERNAL.normalizeString( bookmarkName ) + "-" + timestamp,
            'color' : color || '#fff',
            'items' : new Array()
        };

        INTERNAL.saveToLocalStorage( BOOKMARKING.Dictionary );
        return "success";
    };



    BOOKMARKING.addItemToBookmark = function( bookmarkName, item ){

        if( typeof BOOKMARKING.Dictionary[bookmarkName] == 'undefined' || BOOKMARKING.Dictionary[bookmarkName] == 'undefined')
            return "Selected bookmark does not exist";

        // If item to be added already exists in specified bookmark, return false
        if( BOOKMARKING.Dictionary[bookmarkName].items.getIndexOf(item.id, 'id') != -1 )
            return 'Item already exists in ' + bookmarkName;

		item.bookmarked = true; //do to ask cicilia??

        BOOKMARKING.Dictionary[bookmarkName].items.push(item);

        INTERNAL.saveToLocalStorage( BOOKMARKING.Dictionary );
        return 'success';
    };




    //// Deletion

    BOOKMARKING.deleteBookmark = function( bookmarkName ){

        // If bookmark to be deleted doesn't exist, return false
        if( BOOKMARKING.Dictionary[bookmarkName] == 'undefined' || BOOKMARKING.Dictionary[bookmarkName] == null )
            return "Selected bookmark does not exist";

        delete BOOKMARKING.Dictionary[bookmarkName];

        INTERNAL.saveToLocalStorage( BOOKMARKING.Dictionary );
        return "success";
    };


    BOOKMARKING.deleteAllBookmarks = function(){
        BOOKMARKING.Dictionary = {};
        INTERNAL.saveToLocalStorage( BOOKMARKING.Dictionary );
        return "success";
    };



    BOOKMARKING.deleteItemFromBookmark = function( itemId, bookmarkName ){
        // If item to be deleted doesn't exist in specified bookmark, return false
        var index = BOOKMARKING.Dictionary[bookmarkName].items.getIndexOf(itemId, 'id');
        if(index == -1)
            return "Selected item does not exist";

        BOOKMARKING.Dictionary[bookmarkName].items.splice(index, 1);

        INTERNAL.saveToLocalStorage( BOOKMARKING.Dictionary );
        return "success";
    };



    BOOKMARKING.deleteItemFromAllBookmarks = function( itemId ){

        var entries = Object.keys(BOOKMARKING.Dictionary);

        entries.forEach(function( entry ){
            var index = BOOKMARKING.Dictionary[entry].items.getIndexOf(itemId, 'id');
            if(index != -1)
                BOOKMARKING.Dictionary[entry].items.splice(index, 1);
        });

        INTERNAL.saveToLocalStorage( BOOKMARKING.Dictionary );
        return "success";
    };



    //// Retrieval


    BOOKMARKING.getAllBookmarks = function(){
        return BOOKMARKING.Dictionary;
    };


    BOOKMARKING.getAllBookmarkNamesAndColors = function(){

        var bookmarkNamesAndColors = [];
        var entries = Object.keys(BOOKMARKING.Dictionary);

        entries.forEach(function(entry){
            bookmarkNamesAndColors.push({
                'bookmark-name' : entry,
                'color' : BOOKMARKING.Dictionary[entry].color
            });
        });

        return bookmarkNamesAndColors;
    };



    BOOKMARKING.getBookmarsDictionary = function( bookmarkName ) {

        if(typeof BOOKMARKING.Dictionary[bookmarkName] == 'undefined' || BOOKMARKING.Dictionary[bookmarkName] == 'undefined' || BOOKMARKING.Dictionary[bookmarkName] == null)
            return "Error retrieving bookmark";

        return BOOKMARKING.Dictionary[bookmarkName];
    };



    BOOKMARKING.getAllBookmarkedItemsInArray = function( bookmarkName ) {

        if(BOOKMARKING.Dictionary[bookmarkName] == 'undefined' || BOOKMARKING.Dictionary[bookmarkName] == null || typeof BOOKMARKING.Dictionary[bookmarkName] == 'undefined')
            return "Error retrieving bookmark";

        var bookmarkedItems = [];

        BOOKMARKING.Dictionary[bookmarkName].items.forEach(function(item){

            var obj = item;
            obj['bookmark-name'] = bookmarkName;
            obj['bookmark-id'] = BOOKMARKING.Dictionary[bookmarkName].id;
            obj['color'] = BOOKMARKING.Dictionary[bookmarkName].color;
        });

        return bookmarkedItems;
    };



    /**
    *   @param attrValues: array or single item value (id or name) for which all the corresponding bookmarks want to be retrieved
    *   @param attrName: name of the attribute to be used for comparison
    *   return: dictionary whose entries correspond to the values included in attrValues that are actually bookmarked.
    *       Each entry contains an array 'bookmarked', where each item consists of an object specifying bookmark name and id, plus the query within which the item was bookmarked'
    *       An item representes a recommended documents that can be bookmarked in more than one bookmark (but only once in each bookmark). Hence 'bookmarked'
    *       has as many elements as the # of bookmarkswhere an item was included.
    *
    **/
    BOOKMARKING.getBookmarkedItemsByAttr = function( attrValues, attrName ){

        valuesArray = (Array.isArray(attrValues)) ? attrValues : [attrValues];

        var bookmarkedItems = {};
        var dictionaryEntries = Object.keys(BOOKMARKING.Dictionary);

        dictionaryEntries.forEach(function(entry){
            BOOKMARKING.Dictionary[entry].items.forEach(function(item){

                if( valuesArray.indexOf(item[attrName]) != -1 ){

                    var itemEntry = item[attrName];
                    if(typeof bookmarkedItems[itemEntry] == 'undefined' || bookmarkedItems[itemEntry] == 'undefined'){
                        // bookmarkedItems doesn't contain an entry with the value item[attrName] yet. Add new entry
                        bookmarkedItems[itemEntry] = { 'bookmarked' : new Array() };
                    }

                    bookmarkedItems[itemEntry].bookmarked.push({
                        'bookmark-name' : entry,
                        'bookmark-id' : BOOKMARKING.Dictionary[entry].id,
                        'color' : BOOKMARKING.Dictionary[entry].color,
                    });
                }
            });
        });

        // If the param attrValues is an array, return the whole dictionary contained in bookmarkedItems, otherwise only the content for the only entry in bookmarkedItems
        if(Array.isArray(attrValues)) return bookmarkedItems;
        return bookmarkedItems[attrValues];
    };





/****************************************************************************************************************************************************************************************************/


    var EXTERNAL = {

        init : function(){
            INTERNAL.init();
        },


        // Creation, Addition
        createBookmark : function( bookmarkName, color ){
            return BOOKMARKING.createBookmark(bookmarkName, color );
        },

        addItemToBookmark : function( bookmarkName, item ){
            return BOOKMARKING.addItemToBookmark( bookmarkName, item );
        },


        // Deletion
        deleteBookmark : function( bookmarkName ){
            return BOOKMARKING.deleteBookmark( bookmarkName );
        },

        deleteAllBookmarks : function(){
            return BOOKMARKING.deleteAllBookmarks();
        },

        deleteItemFromBookmark : function( itemId, bookmarkName ){
            return BOOKMARKING.deleteItemFromBookmark( itemId, bookmarkName );
        },

        deleteItemFromAllBookmarks : function(itemId){
            return BOOKMARKING.deleteItemFromAllBookmarks(itemId);
        },


        // Retrieval
        getAllBookmarks : function(){
            return BOOKMARKING.getAllBookmarks();
        },

        getAllBookmarkNamesAndColors : function(){
            return BOOKMARKING.getAllBookmarkNamesAndColors();
        },

        getBookmarsDictionary : function(bookmarkName){
            return BOOKMARKING.getBookmarsDictionary(bookmarkName);
        },

        getAllBookmarkedItemsInArray : function(bookmarkName) {
            return BOOKMARKING.getAllBookmarkedItemsInArray(bookmarkName)  ;
        },

        getBookmarkedItemsById : function(itemId) {
             return BOOKMARKING.getBookmarkedItemsByAttr( itemId, 'id' );
        },

        getBookmarkedItemsByTitle : function(itemName) {
             return BOOKMARKING.getBookmarkedItemsByAttr( itemName, 'title' );
        },


        // Testing
        testBookmarking : function(){

            EXTERNAL.deleteAllBookmarks();

            console.log(EXTERNAL.createBookmark( 'bububu', '#F00' ));
            console.log(EXTERNAL.createBookmark( 'blahblah', '#0F0' ));
            console.log(EXTERNAL.createBookmark( 'interesting'));
            console.log(EXTERNAL.createBookmark( 'bububu', '#00F' ));

            console.log("*****************************************************************************************");
            console.log("GET ALL BOOKMARK NAMES");
            console.log(JSON.stringify(EXTERNAL.getAllBookmarkNamesAndColors()));

            console.log("*****************************************************************************************");
            console.log("add items to bookmarks");
            console.log(EXTERNAL.addItemToBookmark("bububu", "Gender Pay Gap in the 20th Century", "doc1346923649898", "pay gap"));
            console.log(EXTERNAL.addItemToBookmark("bububu", "Women in industry", "dfff3y4237498724723947923", "women workforce"));
            console.log(EXTERNAL.addItemToBookmark("blahblah", "Machine Learning for Dummies", "ghgug65467468768", "machine learning"));
            console.log(EXTERNAL.addItemToBookmark("blahblah", "Women in industry", "dfff3y4237498724723947923", "women workforce"));
            console.log(EXTERNAL.addItemToBookmark("bububu", "Gender Pay Gap in the 20th Century", "doc1346923649898", "pay gap"));

            console.log("*****************************************************************************************");
            console.log("GET ALL BOOKMARKS (items loaded)");
            console.log(EXTERNAL.getAllBookmarks());

            console.log("*****************************************************************************************");
            console.log("get bookmarks in object for <bububu>");
            console.log(EXTERNAL.getBookmarsDictionary("bububu"));
            console.log("get bookmarks in object for <blahblah>");
            console.log(EXTERNAL.getBookmarsDictionary("blahblah"));
            console.log("get bookmarks in object for <lalala> (doesn't exist)");
            console.log(EXTERNAL.getBookmarsDictionary("lalala"));

            console.log("*****************************************************************************************");
            console.log("get bookmarks in array for <bububu>");
            console.log(EXTERNAL.getAllBookmarkedItemsInArray("bububu"));
            console.log("get bookmarks in array for <blahblah>");
            console.log(EXTERNAL.getAllBookmarkedItemsInArray("blahblah"));
            console.log("get bookmarks in array for <lalala> (doesn't exist)");
            console.log(EXTERNAL.getAllBookmarkedItemsInArray("lalala"));

            console.log("*****************************************************************************************");
            console.log("get bookmarks by item id <doc1346923649898> (1 item)");
            console.log(EXTERNAL.getBookmarkedItemsByItemId("doc1346923649898"));
            console.log("get bookmarks by item id <dfff3y4237498724723947923> (2 items)");
            console.log(EXTERNAL.getBookmarkedItemsByItemId("dfff3y4237498724723947923"));
            console.log("get bookmarks by item id <ffffffff> (doesn't exist)");
            console.log(EXTERNAL.getBookmarkedItemsByItemId("ffffffff"));
            console.log("get bookmarks by item id for array [doc1346923649898, dfff3y4237498724723947923, ffffffff]");
            console.log(EXTERNAL.getBookmarkedItemsByItemId(["doc1346923649898", "dfff3y4237498724723947923", "ffffffff"]));

            /*
            console.log("*****************************************************************************************");
            console.log("delete item with id <dfff3y4237498724723947923> from bookmark <bububu>");
            console.log(EXTERNAL.deleteItemFromBookmark("dfff3y4237498724723947923", "bububu"));
            console.log(JSON.stringify(EXTERNAL.getAllBookmarks()));

            // Re-add deleted items to execute next test
            EXTERNAL.addItemToBookmark("bububu", "Women in industry", "dfff3y4237498724723947923", "women workforce");

            console.log("*****************************************************************************************");
            console.log("delete item with id <dfff3y4237498724723947923> from all bookmarks");
            console.log(EXTERNAL.deleteItemFromAllBookmarks("dfff3y4237498724723947923"));
            console.log(JSON.stringify(EXTERNAL.getAllBookmarks()));

            console.log("*****************************************************************************************");
            chrome.storage.sync.get( "bookmark-dictionary", function(value){
                console.log("Read local storage");
                console.log(value);
            });

            console.log("*****************************************************************************************");
            console.log("DELETE ALL BOOKMARKS");
            console.log(EXTERNAL.deleteAllBookmarks());
            console.log(EXTERNAL.getAllBookmarks());
            */
        }

    };



    return EXTERNAL;

}
