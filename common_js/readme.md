common\_js
============
This folder contains files which may be used by several components. Examples on how to use them are provided in 'usage\_examples'.

* **searchResultList.js** displays a list of search results
* **storage.js** contains wrappers for access to local storage and the indexed database

### storage.js
In order to ease portability to other systems, this file wraps access to storage systems. In particular, for the browser extension, this encompasses local storage and the indexed database.
#### local storage
To access local storage, please use the wrapper-function EEXCESS.storage.local(key,value). This function returns the corresponding entry for a given key from the local storage, if no value is supplied and sets the value for the corresponding key, if both parameters are supplied
#### indexed database
To obtain a connection to the database, please use the function _getDB and hand in a calback, which receives the database-object upon successful connection. Basic wrapper functions, like for example put() or add() for adding entries to the database are already present. If you need more sophisticated functionality, please create new wrappers accordingly.
