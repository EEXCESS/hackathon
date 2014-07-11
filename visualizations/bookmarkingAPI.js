function Bookmarking() {

    var INTERNAL = {};


    INTERNAL.init = function() {

        // Retrieve current bookmark dictionary and keep it in a local variable during execution
        chrome.storage.sync.get( "bookmark-dictionary", function(value){
            BOOKMARKING.Dictionary = JSON.parse(value["bookmark-dictionary"]);
            console.log(BOOKMARKING.Dictionary);
        } );
    };



    INTERNAL.saveToLocalStorage = function( bookmarkDictionaryCopy ) {
        chrome.storage.sync.set({ "bookmark-dictionary" : JSON.stringify( bookmarkDictionaryCopy ) }, function(){ });
    };



    INTERNAL.normalizeString = function( text ) {
        return text.replace(' ', '+');
    };



/*****************************************************************************************************************************************************************************************************************/
    var BOOKMARKING = {};


    BOOKMARKING.Dictionary = {};


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



    BOOKMARKING.addItemToBookmark = function( bookmarkName, itemName, itemId, query ){

        if( typeof BOOKMARKING.Dictionary[bookmarkName] == 'undefined' || BOOKMARKING.Dictionary[bookmarkName] == 'undefined')
            return "bookmark specified doesn't exist";

        // If item to be added already exists in specified bookmark, return false
        if( BOOKMARKING.Dictionary[bookmarkName].items.getIndexOf(itemId, 'item-id') != -1 )
            return 'item to be added already exists in specified bookmark';

        var timestamp = Date.now();

        BOOKMARKING.Dictionary[bookmarkName].items.push({
            'item-name' : itemName,
            'item-id' : itemId,
            'query' : query
        });

        INTERNAL.saveToLocalStorage( BOOKMARKING.Dictionary );
        return 'success';
    };




    //// Deletion

    BOOKMARKING.deleteBookmark = function( bookmarkName ){

        // If bookmark to be deleted doesn't exist, return false
        if( BOOKMARKING.Dictionary[bookmarkName] == 'undefined' || BOOKMARKING.Dictionary[bookmarkName] == null )
            return "bookmark to be deleted doesn't exist";

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
        var index = BOOKMARKING.Dictionary[bookmarkName].items.getIndexOf(itemId, 'item-id');
        if(index == -1)
            return false;

        BOOKMARKING.Dictionary[bookmarkName].items.splice(index, 1);

        INTERNAL.saveToLocalStorage( BOOKMARKING.Dictionary );
        return "success";
    };



    BOOKMARKING.deleteItemFromAllBookmarks = function( itemId ){

        var entries = Object.keys(BOOKMARKING.Dictionary);

        entries.forEach(function( entry ){
            var index = BOOKMARKING.Dictionary[entry].items.getIndexOf(itemId, 'item-id');
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


    BOOKMARKING.getBookmarkNamesAndColors = function(){

        var bookmarkNamesAndColors = [];
        var keys = Object.keys(BOOKMARKING.Dictionary);

        keys.forEach(function(key){
            bookmarkNamesAndColors.push({
                'name' : key,
                'color' : BOOKMARKING.Dictionary[key].color
            });
        });

        return bookmarkNamesAndColors;
    };



    BOOKMARKING.getBookmarsDictionary = function( bookmarkName ) {

        if(typeof BOOKMARKING.Dictionary[bookmarkName] == 'undefined' || BOOKMARKING.Dictionary[bookmarkName] == 'undefined' || BOOKMARKING.Dictionary[bookmarkName] == null)
            return {};

        return BOOKMARKING.Dictionary[bookmarkName];
    };



    BOOKMARKING.getAllBookmarkedItemsInArray = function( bookmarkName ) {

        if(BOOKMARKING.Dictionary[bookmarkName] == 'undefined' || BOOKMARKING.Dictionary[bookmarkName] == null || typeof BOOKMARKING.Dictionary[bookmarkName] == 'undefined')
            return [];

        var bookmarkedItems = [];

        BOOKMARKING.Dictionary[bookmarkName].items.forEach(function(item){
            bookmarkedItems.push({
                'bookmark-name' : bookmarkName,
                'bookmark-id' : BOOKMARKING.Dictionary[bookmarkName].id,
                'color' : BOOKMARKING.Dictionary[bookmarkName].color,
                'item-id' : item["item-id"],
                'item-name' : item["item-name"],
                'query' : item.query
            });
        });

        return bookmarkedItems;
    };



    BOOKMARKING.getBookmarkedItemsByAttr = function( attrValues, attrName ){

        attrValues = (Array.isArray(attrValues)) ? attrValues : [attrValues];

        var bookmarkedItems = {};
        var dictionaryEntries = Object.keys(BOOKMARKING.Dictionary);

        dictionaryEntries.forEach(function(entry){
            BOOKMARKING.Dictionary[entry].items.forEach(function(item){

                if( attrValues.indexOf(item[attrName]) != -1 ){

                    var bookmarkedEntryValue = bookmarkedItems[item[attrName]];
                    if(typeof bookmarkedEntryValue != 'undefined' && bookmarkedEntryValue != 'undefined'){
                        // bookmarkedItems already contains an entry with the value item[attrName]



                    }
                    else{



                    }

                    bookmarkedItems.push({
                        'bookmark-name' : entry,
                        'bookmark-id' : BOOKMARKING.Dictionary[entry].id,
                        'color' : BOOKMARKING.Dictionary[entry].color,
                        'item-id' : item["item-id"],
                        'item-name' : item["item-name"],
                        'query' : item.query
                    });
                }
            });
        });

        return bookmarkedItems;
    };


    /**
    *
    *   @param attrName could be item-id, item-name or query. It's defined in the EXTERNAL methods
    */
    BOOKMARKING.getItemDetailsByAttr = function(attrValue, attrName){

        var secondAttrName = (attrName == 'item-id') ? 'item-name' : 'item-id';


        var bookmarkedItems = [];
        var dictionaryEntries = Object.keys(BOOKMARKING.Dictionary);

        dictionaryEntries.forEach(function(entry){
            BOOKMARKING.Dictionary[entry].items.forEach(function(item){

                if( item[attrName] == attrValue ){
                    bookmarkedItems.push({
                        'bookmark-name' : entry,
                        'bookmark-id' : BOOKMARKING.Dictionary[entry].id,
                        'color' : BOOKMARKING.Dictionary[entry].color,
                        'item-id' : item["item-id"],
                        'item-name' : item["item-name"],
                        'query' : item.query
                    });
                }
            });
        });

        return bookmarkedItems;


    };




/*****************************************************************************************************************************************************************************************************************/


    var EXTERNAL = {

        init : function(){
            INTERNAL.init();
        },


        // Creation, Addition
        createBookmark : function( bookmarkName, color ){
            return BOOKMARKING.createBookmark(bookmarkName, color );
        },

        addItemToBookmark : function( bookmarkName, itemName, itemId, query ){
            return BOOKMARKING.addItemToBookmark( bookmarkName, itemName, itemId, query );
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
            return BOOKMARKING.getBookmarkNamesAndColors();
        },

        getBookmarsDictionary : function(bookmarkName){
            return BOOKMARKING.getBookmarsDictionary(bookmarkName);
        },

        getAllBookmarkedItemsInArray : function(bookmarkName) {
            return BOOKMARKING.getAllBookmarkedItemsInArray(bookmarkName)  ;
        },

        getBookmarkedItemsByQuery : function( query ) {
             return BOOKMARKING.getBookmarkedItemsByAttr( query, 'query' );
        },

        getBookmarkedItemsByItemId : function( itemId ) {
             return BOOKMARKING.getBookmarkedItemsByAttr( itemId, 'item-id' );
        },
        getBookmarkedItemsByitemName : function( itemName ) {
             return BOOKMARKING.getBookmarkedItemsByAttr( itemName, 'item-name' );
        },

        getItemDetailsByitemId : function(itemId){
            return BOOKMARKING.getItemDetailsByAttr(itemId, 'item-id');
        },

        getItemDetailsByitemName : function(itemName){
            return BOOKMARKING.getItemDetailsByAttr(itemName, 'item-name');
        },

        getItemDetailsByQuery : function(queryTerm){
            return BOOKMARKING.getItemDetailsByAttr(queryTerm, 'query');
        }

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
            console.log("get bookmarks by query <women workforce>");
            console.log(EXTERNAL.getBookmarkedItemsByQuery("women workforce"));
            console.log("get bookmarks by query <women> (doesn't exist)");
            console.log(EXTERNAL.getBookmarkedItemsByQuery("women"));

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
