/**
 * Provides methods to manage the storage of data. 
 * @class storage
 */

/**
 * TODO
 * @param id
 * @method getStoredValue
 */
function getStoredValue(id){
	var value = EEXCESS.storage.local(STORAGE_PREFIX + id);
	if (value == "null"){ value = null; } // Not clear why the value is sometimes equal to "null" (instead of null)
	return value;
}

/**
 * TODO
 * @param id
 * @param value
 * @method storeValue
 */
function storeValue(id, value){
	EEXCESS.storage.local(STORAGE_PREFIX + id, value);
}

/**
 * TODO
 * @param inputElement
 * @method saveInput
 */
function saveInput(inputElement){
	var inputElementId = inputElement.getAttribute("id");
	storeValue(inputElementId, inputElement.value);
}

/**
 * TODO
 * @param button
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

/**
 * TODO
 * @param key
 * @returns
 * @method getStoredJson
 */
function getStoredJson(key){ 
	var jsonString = getStoredValue(key);
	if (jsonString == null){
		jsonString = "[]"; // TODO change with "{}" or ""
	}
	return JSON.parse(jsonString);
}