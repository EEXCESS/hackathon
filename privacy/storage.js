/**
 * Provides methods to manage the storage of data. 
 * @class storage
 */

/**
 * Stored a pair (key, value) in the data store. 
 * It will over-write the previous value if the key already exists in the data store.  
 * @param id Key to be stored. 
 * @param value Value to be stored. 
 * @method storeValue
 */
function storeValue(id, value){
	EEXCESS.storage.local(STORAGE_PREFIX + id, value);
}

/**
 * Retrieves the value corresponding to a given key from the data store. 
 * @param {String} id Key of the value to be retrieved. 
 * @returns {String} Value corresponding to the key. 
 * @method getStoredValue
 */
function getStoredValue(id){
	var value = EEXCESS.storage.local(STORAGE_PREFIX + id);
	if (value == "null"){ value = null; } // Not clear why the value is sometimes equal to "null" (instead of null)
	return value;
}

/**
 * Retrieves the JSON value corresponding to a given key from the data store. 
 * @param {String} key Key of the value to be retrieved. 
 * @returns {String} JSON value corresponding to the key. 
 * @method getStoredJson
 */
function getStoredJson(key){ 
	var jsonString = getStoredValue(key);
	if (jsonString == null){
		jsonString = "[]"; // TODO change with "{}" or ""
	}
	return JSON.parse(jsonString);
}

/**
 * Saves an input element in the data store.  
 * Its id is used as the key, and its value as the value. 
 * @param {Element} inputElement Input element to be saved.  
 * @method saveInput
 */
function saveInput(inputElement){
	var inputElementId = inputElement.getAttribute("id");
	storeValue(inputElementId, inputElement.value);
}

/**
 * Saves a button in the data store. 
 * Its parent's id is used as the key, and its index in the button group as the value. 
 * @param {Element} button Button to be saved. 
 * @method saveButton
 */
function saveButton(button){
	var children = button.parentNode.children;
	var buttonGroupId = button.parentNode.getAttribute("id");
	for (var i = 0 ; i < children.length ; i++){
		var child = children[i];
		if (child.textContent == button.textContent){ // the current child is the button that was clicked on
			storeValue(buttonGroupId, i);
		}
	}
}