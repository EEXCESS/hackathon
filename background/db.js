var EEXCESS = EEXCESS || {};
/**
 * Represents an instance of the indexedDB
 * @memberOf EEXCESS
 */
EEXCESS.DB = {};

/**
 * Initializes {@link EEXCESS.DB} with an instance of the indexedDB. Creates
 * object stores, if necessary (and removes previously created object stores).
 * @memberOf EEXCESS
 */
EEXCESS.initDB = function() {
    console.log('init DB');
    
    // initialize connection
    var req = indexedDB.open('eexcess_db', 42);
    console.log('opening');

    // update or create db
    req.onupgradeneeded = function() {
        var clear = true; // flag to delete existing object stores
        var os;
        console.log('upgrade needed');
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
        os.createIndex('timestamp','timestamp');
        os.createIndex('query','context.query');

        // remove existing object store 'tasks' if present
        if (EEXCESS.DB.objectStoreNames.contains('tasks') && clear) {
            EEXCESS.DB.deleteObjectStore('tasks');
        }
//        // create object store 'tasks'
//        os = EEXCESS.DB.createObjectStore('tasks', {keyPath: 'task_id', autoIncrement: true});
//        os.createIndex('start', 'start');

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
//        // create object store 'demographics'
//        os = EEXCESS.DB.createObjectStore('demographics', {keyPath: 'user_id'});

        // remove existing object store 'interactions' if present
        if (EEXCESS.DB.objectStoreNames.contains('interactions') && clear) {
            EEXCESS.DB.deleteObjectStore('interactions');
        }
        // create object store 'interactions'
        os = EEXCESS.DB.createObjectStore('interactions', {keyPath: 'id', autoIncrement: true});
        os.createIndex('timestamp', 'timestamp');
    };

    req.onsuccess = function() {
        console.log('db initialized');
        EEXCESS.DB = req.result;
    };

    req.onerror = function() {
        console.log('db error');
        console.log(this);
    };
}();