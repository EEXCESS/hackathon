hackathon
============
This readme provides information on the current file-structure, data stored and methods, which may be useful for several components.
Please feel free to adapt it.

For some basic information on chrome extensions see http://developer.chrome.com/extensions/overview  


file structure
----------------------
* **/background** Background-page and -scripts
* **/common_js** Scripts, which may be used by several components
* **/libs** External libraries
* **/media** Icons, images, CSS-files and other media
* **/options** Files for the "options" page
* **/privacy** Privacy components
* **/visualizations** Visualization components 
* **/widget** The sidebar UI
* **README.md** This file
* **content.js** The content script injected into every page which is whitelisted in the manifest-file.
* **eexcess.css** The basic style. All general definitions (like colors, heading-definitions, line styles, ...) go here. Should not contain definitions below class-level.
* **manifest.json** Configuration file, defining permissions, icons, paths, ...

(for detailed information on a component, see the readme in the respective folder)

common methods
--------------------------
Please use the message\_wrapper in common\_js to send/receive messages.
 
### retrieving current query and results ###
```javascript
EEXCESS.callBG({method: {parent: 'model', func: 'getResults'}, data: null}, function(res) {
    console.log(res);
});
```
The current query is contained in res.query and the results in res.results

### listen for new search events ###
```javascript
EEXCESS.messageListener(
        function(request, sender, sendResponse) {
            if (request.method === 'newSearchTriggered') {
                console.log(request.data);
            }
        }
);
```
The issued query is contained in request.data.query and the results in request.data.results

### issue a new query ###
```javascript
// call loading-method on search result list (to show loading bar)
EEXCESS.callBG({method: {parent: 'model', func: 'query'}, data: query});
```

The query-object has to contain the query as an array, consisting of terms and weights, i.e. each element of the array needs to adhere to the following structure:
```javascript
{weight: [0-1], text:"single query term"}
```

data stored
---------------------------------------
This section provides an overview of the data stored within the extension and accessible by all extension pages.

### indexed database ###
To access/modify the data please refer to the Indexed Database API (http://www.w3.org/TR/IndexedDB/)  
database name: 'eexcess_db'

#### structure ####
(indented items represent indexed fields)

* **history** the browsing history
    * chrome_visitId
	* end
	* start
* **recommendations** all recommendation results retrieved so far
    * uri
	* query
	* timestamp
* **clicked_keyword** [graph visualization]
	* keyword
* **interactions** a user's interactions with a web page (currently textual input)
	* timestamp
* **queries** the queries issued so far (im- & explicit queries)
	* query
	* timestamp
* **resource_relations** the user's relations/interactions with resources (atm view/rating of a recommendation result)
	* query
	* timestamp
	* resource
	
#### objects ####
more detailed description of the objects stored in the database's particular object stores

##### history #####
* *chrome\_visitId*: the id of the corresponding visit in chrome's history   
* *end*: end time of the visit (in ms since the epoch)   
* *referrer*: the referring url (if any)   
* *start*: start time of the visit (in ms since the epoch)   
* *transition*: the transition, how the browser navigated to this url (link, typed, reload, ... see https://developer.chrome.com/extensions/history)    
* *url*: the url of the visit  
* *visit_id*: auto incremented visit identifier   

##### recommendations #####
* *context*: object of the context, in which the recommendation was provided (currently the corresponding query)  
	* *query*: the query which caused this recommendation  
* *recommendation_id*: auto incremented recommendation identifier  
* *result*: object, containing information of the retrieved result. At the moment, this object is exactly identical to the original result object. However, this will change over time and only a subset of the original result will be contained, as soon as we know which data is actually necessary, since storing all information about all results will consume too much disk space.  
* *timestamp*: timestamp of when the result was retrieved (in ms since the epoch)   
* *uri*: the url of a webpage, presenting details about the result  

##### clicked_keyword #####
[graph visualization]

##### interactions #####
This object store can contain different objects, according to the interactions executed by the user.

###### type: textual Input ######
This interaction is logged, every time the user inputs text on a particular web page (logging is done after a timeout of 1s).

* *eexcess_visible*: boolean, indicating, if the eexcess sidebar was visible or not at the time of the interaction  
* *id*: auto incremented interaction identifier  
* *text*: the input text  
* *timestamp*: timestamp of when the interaction occured (in ms since the epoch)  
* *type*: specifying the type of interaction ('textInput' in this case)    
* *url*: the url of the page on which the interaction occured  

###### type: form submit ######
This interaction is logged on submitting a form on a particular web page.

* *eexcess_visible*: boolean, indicating, if the eexcess sidebar was visible or not at the time of the interaction  
* *id*: auto incremented interaction identifier  
* *parameters*: array object containing the parameters of the form fields (array elements are of the form {name:"name of the field", value:"value of the field"})  
* *target*: the target of the submit event (the submit button)
* *timestamp*:  timestamp of when the interaction occured (in ms since the epoch)  
* *type*: specifying the type of interaction ('submit' in this case)  
* *url*: the url of the page on which the interaction occured  

##### queries #####	
* *context*: the context, in which the query was issued
	* *selectedText*: text that was selected when the query was issued (if any)
	* *url*: the url of the page on which the query was issued
* *id*: auto incremented query identifier
* *query*: the query, represented by an array of query terms and their according weights (array elements are of the form {weight:[0-1],text:'query term'})
* *timestamp*: timestamp of when the query was issued (in ms since the epoch)

##### resource_relations #####
Contains different objects, according to the type of the relation

###### type:view ######
Indicates a view of a particular resource.

* *beenRecommended*: boolean, indicating if the resource was recommended by EEXCESS
* *context*: the context in which the view occured
	* *query*: the query, for which the viewed resource was provided
* *duration*: the duration of the view (in ms)
* *id*: auto incremented resource relation identifier
* *resource*: url of the resource viewed
* *timestamp*: timestamp of when the view occured (in ms since the epoch)
* *type*: the type of the relation ('view' in this case)

###### type:rating ######
A rating of a particular resource.

* *annotation*: json-ld object, containing the rating in the open annotation format
	* *@context*: "http://www.w3.org/ns/oa-context-20130208.json"
	* *@type*: "oa:Annotation"
	* *hasBody*: the annotation
		* *http://purl.org/stuff/rev#maxRating*: 2 // max rating value
		* *http://purl.org/stuff/rev#minRating*: 1 // min rating value
		* *http://purl.org/stuff/rev#rating*: the actual rating value
	* *hasTarget*: the annotated resource
		* *@id*: url of the annotated resource
		* *@type*: type of the annotated resource
* *beenRecommended*: boolean, indicating if the resource was recommended by EEXCESS
* *context*: the context in which the rating was given
	* *query*: the query, which caused the resource to appear in the result list
* *id*: auto incremented resource relation identifier
* *resource*: url of the rated resource
* *timestamp*: timestamp of when the resource was rated (in ms since the epoch)
* *type*: the type of the relation ('rating' in this case)

	
### local storage ###

* **backend** the server to call for recommendations (fr-stable, fr-devel, europeana)
* **API\_BASE\_URI** [privacy proxy]
* **privacy_email** [privacy proxy]
* **traces** [privacy proxy]



