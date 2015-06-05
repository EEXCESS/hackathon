/**
 * Provides methods to manage the interests. 
 * @class interests
 */

/**
 * Returns all the nodes embedding a fields related to the topics of interest. 
 * @returns {ListNode} List of interest inputs.
 * @method getInterestInputs
 */
function getInterestInputs(){
	return document.getElementsByClassName(CLASS_INTEREST);
}

/**
 * Initializes the interests with the values from the data store. 
 * It generates the HTML code, initializes the TagIt fields, adds the listeners and initializes the buttons. 
 * @method initInterests
 */
function initInterests(){ 
	var interests = getStoredJson(INTERESTS); 
	var interestsElement = document.getElementById(INTERESTS);
	var code = "";
	for (var i = 0 ; i < interests.length ; i++){
		code = code + generateCodeInterest(i);
		interestsElement.innerHTML = code;
	}
	var interestElements = getInterestInputs();
	for (var i = 0 ; i < interestElements.length ; i++){
		var interestElement = interestElements[i];
		var interestId = interestElement.getAttribute("id"); 
		initInterest(interestId);
		createInterestListener(interestId);
	}
	// Initialize the buttons
	for (var i = 0 ; i < interests.length ; i++){
		var policyElement = document.getElementById(INTEREST_POLICY + i);
		initButtonGroup(policyElement);
	}
}

/**
 * Adds an interest: generates the HTML code, adds the listeners, initializes the buttons, saves the interests and update the listeners. 
 * @method addNewInterest
 */
function addNewInterest(){
	var interestsElement = document.getElementById(INTERESTS);
	var nbInterests = interestsElement.children.length + 1; // +1 to consider the new one
	var code = "";
	for (var i = 0 ; i < nbInterests ; i++){
		code = code + generateCodeInterest(i);
	}
	interestsElement.innerHTML = code;
	var interestElements = getInterestInputs();
	for (var i = 0 ; i < interestElements.length ; i++){
		// Initialise the interests
		var interestElement = interestElements[i];
		var interestId = interestElement.getAttribute("id");
		initInterest(interestId);
		createInterestListener(interestId);
		// Initialise the buttons
		var policyElement = document.getElementById(INTEREST_POLICY + i);
		initButtonGroup(policyElement);
		
	}	
	// Save all the interests
	saveInterests();
	// Add listeners
	updateInterestListeners();
}

/**
 * Initializes an interest (instantiate the TagIt field).  
 * @param {String} interestId identifier of an interest.
 * @method initInterest
 */
function initInterest(interestId) {
	$("#" + interestId).tagit();
	var index = extractEndingNumber(interestId);
	var interests = getStoredJson(INTERESTS);
	if (interests.length > index){
		var interest = interests[index]; 
		for (var i = 0 ; i < interest.length ; i++){
			$("#" + interestId).tagit("createTag", interest[i]);
		}
	}
}

/**
 * Create the listeners for a TagIt field. 
 * @param {String} interestId identifier of an interest.
 * @method createInterestListener
 */
function createInterestListener(interestId) {
	$("#" + interestId).tagit({
		removeConfirmation: true,
    	afterTagAdded: function(event, ui) {
	    	if (!ui.duringInitialization) {
	    		var interestElement = document.getElementById(interestId);
	    		elementListener(interestElement, CLASS_INTEREST);
	            saveInterests();
	        }
    	}, 
    	afterTagRemoved: function(event, ui) {
    		var interestElement = document.getElementById(interestId);
    		elementListener(interestElement, CLASS_INTEREST);
    		saveInterests();
        }
    });
}

/**
 * Updates the listeners for all the interests: 
 * TagIt field listeners, listener for the removal of an interest, and buttons listeners. 
 * @method updateInterestListeners
 */
function updateInterestListeners(){
	var interestElements = getInterestInputs();
	for (var i = 0 ; i < interestElements.length ; i++){
		var interestElement = interestElements[i];
		var interestId = interestElement.getAttribute("id");
		var interestIdNum = extractEndingNumber(interestId); 
		createInterestListener(interestId);
		var removeInterestElement = document.getElementById(REMOVE_INTEREST + interestIdNum);
		removeInterestElement.addEventListener("click", function(){ removeInterestListener(this); }); 
		var policyInterestElement = document.getElementById(INTEREST_POLICY + interestIdNum);
		for (var j = 0 ; j < policyInterestElement.children.length ; j++){
			var button = policyInterestElement.children[j];
			button.addEventListener("click", function(){ policyButtonListener(this); });
		}
	}
}

/**
 * Generate the HTML code to insert a new interest. 
 * @param {Integer} index Index of the interest to add. 
 * @returns {String} HTML code. 
 * @method generateCodeInterest
 */
function generateCodeInterest(index){ 
	var code = 	'<div id="' + INTEREST + index + '" class="row">\n';
	code += 	'	<div class="panel-body">\n';
	code += 	'		<div class="col-md-6">\n';
	code += 	'			<div class="row">\n';
	code += 	'				<div class="col-md-1">\n';
	code += 	'					<div class="panel-body">\n';
	code += 	'						<a id="' + REMOVE_INTEREST + index +'" class="' + REMOVE_INTEREST + '" style="color: red;" href="#x"><span class="glyphicon glyphicon-remove"></span></a>\n';
	code += 	'					</div>\n';
	code += 	'				</div>\n';
	code += 	'				<div class="col-md-11 row">\n';
	code += 	'					<div class="input-group">\n';
	code += 	'						<ul id="' + INTEREST_INPUT + index + '" class="' + CLASS_INTEREST + '"></ul>\n';
	code += 	'					</div>\n';
	code += 	'				</div>\n';
	code += 	'			</div>\n';
	code += 	'		</div>\n';
	code += 	'		<div id="' + INTEREST_POLICY + index + '" class="btn-group col-md-2" role="group">\n';
	code += 	'			<button type="button"  class="btn ' + BUTTON_STYLE_GREY + ' ' + CLASS_BUTTON + '" ' + PARENT_ID + '="' + INTEREST_POLICY + index + '">Hidden</button>\n';
	code += 	'			<button type="button"  class="btn ' + BUTTON_STYLE_GREY + ' ' + CLASS_BUTTON + '" ' + PARENT_ID + '="' + INTEREST_POLICY + index + '">Disclosed</button>\n';
	code += 	'		</div>';
	code += 	'		<div class="col-md-4">Value shared with the system: \n';
	code += 	'			<span id="' + INTEREST_DISPLAY + index + '"></span>\n';
	code += 	'		</div>\n';	
	code += 	'	</div>\n';	
	code += 	'</div>\n';
	return code;
}

/**
 * Saves all the interests: extract the values from the form and store it in the data store. 
 * @method saveInterests
 */
function saveInterests(){
	var interestElements = getInterestInputs();
	var interests = [];
	for (var i = 0 ; i < interestElements.length ; i++){
		var interestElement = interestElements[i];
		var interestId = interestElement.getAttribute("id");
		var array = $("#" + interestId).tagit("assignedTags");
		if ((array != null) && (array.length != 0)){
			interests.push(array);
		}
	}
	storeValue(INTERESTS, JSON.stringify(interests));
}

/**
 * Adds a topic to an interest (added only if it's not already contained).  
 * @param {Array} interests Array of interests. 
 * @param {String} interestId Identifier of the interest to be updated. 
 * @param {String} label Label of the new topic. 
 * @returns {Array} Array of interests containing "label". 
 * @method addTopic
 */
function addTopic(interests, interestId, label){
	var index = "";
	if (endsWithNumber(interestId)){
		index = extractEndingNumber(interestId); 
	}
	var interest = interests[index];
	if (interest == null){
		interest = [];
	}
	if (interest.indexOf(label) == -1){
		interest.push(label);
		interests[index] = interest;
	}
	return interests;
}

/**
 * Removes a topic for an interest. 
 * @param {Array} interests Array of interests.  
 * @param {String} interestId Identifier of the interest to be updated. 
 * @param {String} label Label of the topic to be removed.  
 * @returns {Array} Array of interests without "label". 
 * @method removeTopic
 */
function removeTopic(interests, interestId, label){
	var index = extractEndingNumber(interestId);
	var interest = interests[index];
	if (interest != null){
		interest.splice(interest.indexOf(label), 1);
		if (interest.length != 0){
			interests[index] = interest;
		} else {
			interests.splice(index, 1);
		}
	}
	return interests;
}

/**
 * Removes the listener assigned to a link element. 
 * This method is used when an interest is removed to make sure the removal is done properly. 
 * It resets the policy level, remove the HTML code, and save the interests. 
 * @param {Element} link Element corresponding to the link. 
 * @method removeInterestListener
 */
function removeInterestListener(link){
	resetElementPolicy(link, INTEREST_POLICY, DEFAULT_POLICY_LEVEL);
	removeElement(link, INTEREST);
	saveInterests();
}

/**
 * Listener invoked when an interest must be added. 
 * @method addInterestListener
 */
function addInterestListener(){ 
	addNewInterest(); 
}