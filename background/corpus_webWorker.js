var EEXCESS = EEXCESS || {};

/**
 * Represents a token.
 * 
 * By default, the type is set to 'w', if no type is provided. This corresponds
 * to a regular word.
 * 
 * @param {String} token
 * @param {String} parent
 * @param {String} type
 */
EEXCESS.Token = function(token, parent, type) {
    this.token = token;
    this.parent = parent;
    this.type = type || 'w';
};

/**
 * Returns an array of stopwords for the provided language if the specified
 * language is supported.
 * 
 * Currently, only english and german are supported
 * 
 * @param {String} language country code of provided language
 * @returns {Array} array of stopwords
 */
EEXCESS.stopwords = function(language) {
    // TODO: stopwords to DB / learn stopwords ?
    var languages = {};
    languages['en'] = ["a", "about", "above", "after", "again", "against",
        "all", "am", "an", "and", "any", "are", "aren't", "as", "at", "be", "for","edit",
        "because", "been", "before", "by", "from", "had", "hadn't", "has", 
        "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "he's", 
        "her", "here", "here's", "hers", "herself", "him", "himself", "his", 
        "how", "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", 
        "is", "isn't", "it", "it's", "its", "itself", "let's", "me", "more", 
        "most", "mustn't", "my", "myself", "no", "nor", "not", "of", "off", 
        "on", "once", "only", "or", "other", "ought", "our", "ours", 
        "ourselves", "out", "over", "own", "same", "shan't", "she", "she'd", 
        "she'll", "she's", "should", "shouldn't", "so", "some", "such", "than", 
        "that", "that's", "the", "their", "theirs", "them", "themselves", 
        "then", "there", "there's", "these", "they", "they'd", "they'll", 
        "they're", "they've", "this", "those", "through", "to", "too", "under", 
        "until", "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're", 
        "we've", "were", "weren't", "what", "what's", "when", "when's", "where", 
        "where's", "which", "while", "who", "who's", "whom", "why", "why's", 
        "with", "won't", "would", "wouldn't", "you", "you'd", "you'll", 
        "you're", "you've", "your", "yours", "yourself", "yourselves"
    ];
    languages["de"] = ["aber", "als", "am", "an", "auch", "auf", "aus", "bei",
        "bin", "bis", "bist", "da", "dadurch", "daher", "darum", "das", "daß",
        "dass", "dein", "deine", "dem", "den", "der", "des", "dessen",
        "deshalb", "die", "dies", "dieser", "dieses", "doch", "dort", "du",
        "durch", "ein", "eine", "einem", "einen", "einer", "eines", "er", "es",
        "euer", "eure", "für", "hatte", "hatten", "hattest", "hattet", "hier",
        "hinter", "ich", "ihr", "ihre", "im", "in", "ist", "ja", "jede",
        "jedem", "jeden", "jeder", "jedes", "jener", "jenes", "jetzt", "kann",
        "kannst", "können", "könnt", "machen", "mein", "meine", "mit", "muß",
        "mußt", "musst", "müssen", "müßt", "nach", "nachdem", "nein", "nicht",
        "nun", "oder", "seid", "sein", "seine", "sich", "sie", "sind", "soll", "siehe",
        "sollen", "sollst", "sollt", "sonst", "soweit", "sowie", "und", "unser",
        "unsere", "unter", "vom", "von", "vor", "wann", "warum", "was",
        "weiter", "weitere", "wenn", "wer", "werde", "werden", "werdet",
        "weshalb", "wie", "wieder", "wieso", "wir", "wird", "wirst", "wo",
        "woher", "wohin", "wurde", "zu", "zum", "zur", "über"
    ];
    if (typeof languages[language] !== 'undefined') {
        return languages[language];
    } else {
        return [];
    }
};


/**
 * Creates a token out of the provided text.
 * Removes leading/trailing whitespaces and special characters.
 * Tokens, consisting of a single character after this process are discarded.
 * For urls, tokens with the type 'u' are created and for email-adresses,
 * tokens with the type 'e' respectively.
 * 
 * @param {String} text the text from which to create the token
 * @param {String} parent the parent element of the text
 * @returns {EEXCESS.Token} the created token
 */
EEXCESS.createToken = function(text, parent) {
    // to lower case
    text = text.toLowerCase();
    // remove leading/trailing whitespace
    text = text.replace(/^\s+|\s+$/g, '');
    // url?
    if (text.search(/(http|https):\/\/[\w]*/) !== -1) {
        return new this.Token(text, parent, 'u');
    }
    // email?
    if (text.search(/[\w]+@[\w]+/) !== -1) {
        return new this.Token(text, parent, 'e');
    }
    // remove special chars (keep umlauts)
    //text = text.replace(/[^\w\säÄöÖüÜß]/g, '');
    // remove everything with digits in it
    text = text.replace(/.*\d.*/g, '');
    // token has at least 2 chars
    if (text.length > 1) {
        return new this.Token(text, parent, 'w');
    } else {
        return null;
    }
};

/**
 * Tokenizes the provided text
 * 
 * @param {String} text the text to tokenize
 * @param {String} parent the parent element of the text
 * @param {String} language country code of the text's language
 * @returns {Array} tokenized text
 */
EEXCESS.tokenize = function(text, parent, language) {
    var tokens = [];

    // remove stopwords
    var innerRegexp = this.stopwords(language).join('\\b|\\b');
    var regexp = new RegExp('\\b' + innerRegexp + '\\b', 'gi');
    text = text.replace(regexp, '');

    // tokenize
    var words = text.match(/([äöüÄÖÜß\w-_äöuÄÖÜ]{3,})/g);
    if (words) {
        for (var i = 0, len = words.length; i < len; i++) {
            // TODO: save position in the text? (stopwors already removed, thuss not really correct)
            var token = this.createToken(words[i].trim(), parent);
            if (token !== null) {
                tokens.push(token);
            }
        }
    }
    return tokens;
};

/**
 * Represents a corpus of tokens
 */
EEXCESS.Corpus = function() {
};

/**
 * Function updates the amount of tokens belonging to the provided parent
 * 
 * If no entry exists for the token in the corpus, a new entry is created along 
 * with the corresponding parent entry. If the token is present, but the parent
 * entry not, the latter is added. Otherwise, the amount of tokens corresponding
 * to the given parent entry is incremented by 1. In all cases, the overall 
 * amount of occurrences of the provided token is incremented by 1.
 * @param {String} token the token for which to increment the amount
 * @param {String} parent the token's parent for which to increment the amount
 */
EEXCESS.Corpus.prototype.add = function(token, parent) {
    if (typeof this[token] === 'undefined') {
        this[token] = {};
        this[token][parent] = 1;
        this[token]['c'] = 0;
    } else if (typeof this[token][parent] === 'undefined') {
        this[token][parent] = 1;
    } else {
        this[token][parent]++;
    }
    // increment count of all types of this token
    this[token]['c']++;
};

/**
 * Builds a corpus of tokens from the given elements
 * 
 * @param {Array} elements the elements to tokenize (each entry in the array
 * must be an object with structure {text:String,parent:String}
 * @param {String} language country code for language
 * @param {Function} callback callback function to trigger after calculation is
 * finished. The corpus is passed to this function as an argument.
 */
EEXCESS.processElements = function(elements, language, callback) {
    // create tokens from text
    var tokens = [];
    for (var i = 0, len = elements.length; i < len; i++) {
        var t = EEXCESS.tokenize(elements[i].text, elements[i].parent, language);
        tokens = tokens.concat(t);
    }
    // build corpus from tokens
    var corpus = new EEXCESS.Corpus();
    for (var i = 0, len = tokens.length; i < len; i++) {
        // TODO: stem?
        corpus.add(tokens[i].token, tokens[i].parent);
    }
    // callback with corpus
    callback(corpus);
};

// listen for message events
self.addEventListener('message', function(e) {
    if (e.data.request === 'tokenize') {
        EEXCESS.processElements(e.data.elements, e.data.language, self.postMessage);
    }
}, false);
