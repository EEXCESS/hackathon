/**
 * Defines all the constants used in the module profile.
 * @class constants
 */

/** 
 * @attribute STORAGE_PREFIX 
*/
var STORAGE_PREFIX = "privacy.profile.";

/** 
 * @attribute ADD_LANGUAGE 
 */
var ADD_LANGUAGE = "addLanguage";
/** 
 * @attribute REMOVE_LANGUAGE 
 */
var REMOVE_LANGUAGE = "removeLanguage";
/** 
 * @attribute ADD_INTEREST 
 */
var ADD_INTEREST = "addInterest";
/** 
 * @attribute REMOVE_INTEREST 
 */
var REMOVE_INTEREST = "removeInterest";

/** 
 * @attribute BUTTON_STYLE_GREY
 */
var BUTTON_STYLE_GREY = "btn-default";
/** 
 * @attribute BUTTON_STYLE_GREEN
 */
var BUTTON_STYLE_GREEN = "btn-success";
/** 
 * @attribute BUTTON_STYLE_ORANGE
 */
var BUTTON_STYLE_ORANGE = "btn-warning";
/** 
 * @attribute BUTTON_STYLE_RED
 */
var BUTTON_STYLE_RED = "btn-danger";

/** 
 * @attribute INPUT_SUFFIX
 */
var INPUT_SUFFIX = "Input";
/** 
 * @attribute DISPLAY_SUFFIX
 */
var DISPLAY_SUFFIX = "Display";
/** 
 * @attribute POLICY_SUFFIX
 */
var POLICY_SUFFIX = "Policy";

/** 
 * @attribute PARENT_ID
 */
var PARENT_ID = "ParentId"; 

/** 
 * @attribute NAME
 */
var NAME = "name";
/** 
 * @attribute COUNTRY
 */
var COUNTRY = "country";
/** 
 * @attribute CITY
 */
var CITY = "city";
/** 
 * @attribute LOCATION
 */
var LOCATION = "location";
/** 
 * @attribute BIRTHDATE
 */
var BIRTHDATE ="birthdate";
/** 
 * @attribute LANGUAGE
 */
var LANGUAGE = "language";
/** 
 * @attribute LANGUAGES
 */
var LANGUAGES = LANGUAGE + "s";
/** 
 * @attribute LANGUAGE_LABEL
 */
var LANGUAGE_LABEL = LANGUAGE + "Label";

/** 
 * @attribute LANGUAGE_SKILL
 */
var LANGUAGE_SKILL = LANGUAGE + "Skill";
/** 
 * @attribute INTEREST
 */
var INTEREST ="interest";
/** 
 * @attribute INTERESTS
 */
var INTERESTS =INTEREST + "s";

/** 
 * @attribute CLASS_TEXT
 */
var CLASS_TEXT = "eexcess-text";
/** 
 * @attribute CLASS_DATE
 */
var CLASS_DATE = "eexcess-date";
/** 
 * @attribute CLASS_LANGUAGE
 */
var CLASS_LANGUAGE = "eexcess-language";
/** 
 * @attribute CLASS_INTEREST
 */
var CLASS_INTEREST = "eexcess-interest";
/** 
 * @attribute CLASS_BUTTON
 */
var CLASS_BUTTON = "eexcess-button";
/** 
 * @attribute CLASS_BUTTON_GROUP
 */
var CLASS_BUTTON_GROUP ="btn-group";

/** 
 * List of european languages: Bulgarian, Czech, Danish, Dutch, English, Estonian, etc. 
 * @attribute TAB_LANGUAGE_LABELS
 */
var TAB_LANGUAGE_LABELS = ["Bulgarian", "Czech", "Danish", "Dutch", "English", "Estonian", "Finnish", "French", 
                 "German", "Greek", "Hungarian", "Irish", "Italian", "Latvian", "Lithuanian", "Maltese", 
                 "Polish", "Portuguese", "Romanian", "Slovak", "Slovenian", "Spanish", "Swedish"];
/** 
 * List of skill level (Fluent, Intermediate, Basic knowledge). 
 * @attribute TAB_LANGUAGE_SKILLS
 */
var TAB_LANGUAGE_SKILLS = ["Fluent", "Intermediate", "Basic knowledge"];

/** 
 * The default language is English (TAB_LANGUAGE_LABELS[4]). 
 * @attribute DEFAULT_LANGUAGE_LABEL_INDEX
 */
var DEFAULT_LANGUAGE_LABEL_INDEX = 4; // 4 = English
/** 
 * The default skill level is Fluent (TAB_LANGUAGE_SKILLS[0]). 
 * @attribute DEFAULT_LANGUAGE_SKILL_INDEX
 */
var DEFAULT_LANGUAGE_SKILL_INDEX = 0; // 0 = fluent
/** 
 * @attribute DEFAULT_POLICY_LEVEL
 */
var DEFAULT_POLICY_LEVEL = 0; // The most restrictive
/** 
 * @attribute MAX_POLICY_THRESHOLD
 */
var MAX_POLICY_THRESHOLD = 3; // In the current version there are only 3 levels (0, 1 and 2)

// Input elements ends with "Input"
/** 
 * @attribute NAME_INPUT
 */
var NAME_INPUT = NAME + INPUT_SUFFIX;
/** 
 * @attribute COUNTRY_INPUT
 */
var COUNTRY_INPUT = COUNTRY + INPUT_SUFFIX;
/** 
 * @attribute CITY_INPUT
 */
var CITY_INPUT = CITY + INPUT_SUFFIX;
/** 
 * @attribute BIRTHDATE_INPUT
 */
var BIRTHDATE_INPUT = BIRTHDATE + INPUT_SUFFIX;
/** 
 * @attribute LANGUAGE_LABEL_INPUT
 */
var LANGUAGE_LABEL_INPUT = LANGUAGE_LABEL + INPUT_SUFFIX;
/** 
 * @attribute LANGUAGE_SKILL_INPUT
 */
var LANGUAGE_SKILL_INPUT = LANGUAGE_SKILL + INPUT_SUFFIX;
/** 
 * @attribute INTEREST_INPUT
 */
var INTEREST_INPUT = INTERESTS + INPUT_SUFFIX;

// Display elements ends with "Display"
/** 
 * @attribute NAME_DISPLAY
 */
var NAME_DISPLAY = NAME + DISPLAY_SUFFIX;
/** 
 * @attribute COUNTRY_DISPLAY
 */
var COUNTRY_DISPLAY = COUNTRY + DISPLAY_SUFFIX;
/** 
 * @attribute CITY_DISPLAY
 */
var CITY_DISPLAY = CITY + DISPLAY_SUFFIX;
/** 
 * @attribute BIRTHDATE_DISPLAY
 */
var BIRTHDATE_DISPLAY = BIRTHDATE + DISPLAY_SUFFIX;
/** 
 * @attribute LANGUAGE_LABEL_DISPLAY
 */
var LANGUAGE_LABEL_DISPLAY = LANGUAGE_LABEL + DISPLAY_SUFFIX;
/** 
 * @attribute LANGUAGE_SKILL_DISPLAY
 */
var LANGUAGE_SKILL_DISPLAY = LANGUAGE_SKILL + DISPLAY_SUFFIX;
/** 
 * @attribute INTEREST_DISPLAY
 */
var INTEREST_DISPLAY = INTERESTS + DISPLAY_SUFFIX;

// Policy elements ends with "Policy" but there's not necessarily one policy element per input or display
/** 
 * @attribute NAME_POLICY
 */
var NAME_POLICY = NAME + POLICY_SUFFIX;
/** 
 * @attribute LOCATION_POLICY
 */
var LOCATION_POLICY= LOCATION + POLICY_SUFFIX;
/** 
 * @attribute BIRTHDATE_POLICY
 */
var BIRTHDATE_POLICY = BIRTHDATE + POLICY_SUFFIX;
/** 
 * @attribute LANGUAGE_POLICY
 */
var LANGUAGE_POLICY = LANGUAGE + POLICY_SUFFIX;
/** 
 * @attribute INTEREST_POLICY
 */
var INTEREST_POLICY = INTERESTS + POLICY_SUFFIX;

// The arrays are sorted so that it's possible to associate input, display and policy elements
/** 
 * List of all the input elements (e.g., birthDateInput). 
 * @attribute INPUTS
 */
var INPUTS = [NAME_INPUT, COUNTRY_INPUT, CITY_INPUT, BIRTHDATE_INPUT, LANGUAGE_LABEL_INPUT, LANGUAGE_SKILL_INPUT, INTEREST_INPUT];
/** 
 * List of all the display element (e.g., birthDateDisplay). 
 * A value can be null if the corresponding input is never displayed (e.g., nameInput). 
 * @attribute DISPLAYS
 */
var DISPLAYS = [null, COUNTRY_DISPLAY, CITY_DISPLAY, BIRTHDATE_DISPLAY, LANGUAGE_LABEL_DISPLAY, LANGUAGE_SKILL_DISPLAY, INTEREST_DISPLAY];
/** 
 * List of all the policy elements (e.g., birthDatePolicy). 
 * A value can appear multiple times when several input values depend on the same button (e.g., countryInput and cityInput). 
 * @attribute POLICIES
 */
var POLICIES = [NAME_POLICY, LOCATION_POLICY, LOCATION_POLICY, BIRTHDATE_POLICY, LANGUAGE_POLICY, LANGUAGE_POLICY, INTEREST_POLICY];