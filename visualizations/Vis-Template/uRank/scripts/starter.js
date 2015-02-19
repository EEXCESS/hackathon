(function Starter() {
    var self = this;

    this.dataset = {};
    this.datasetId = "NO_DATASET";
    this.allTokens = [];
    this.keywordsArray = [];

    var dsm;

    var stemmer = natural.PorterStemmer; //natural.LancasterStemmer;
    var tokenizer = new natural.WordTokenizer;
    var nounInflector = new natural.NounInflector();
    var tfidf = new natural.TfIdf();
    var stopWords = natural.stopwords;
    stemmer.attach();
    nounInflector.attach();

    var pos = new Pos();
    var lexer = new pos.Lexer();
    var tagger = new pos.Tagger();


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /** Event Handlers  **/

    var selectDatasetChanged = function(){

        var text = "";
        self.datasetId = $("#select-dataset").val();

        if(self.datasetId != "NO_DATASET"){
            self.dataset = dsm.getDataset(self.datasetId);
            text = self.dataset.text;
        }
        $("#section-text").find("p").html(text);
    };


    var startButtonClicked = function(){
        if(self.datasetId != "NO_DATASET"){
            startVisualization();
        }
    };


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    function startVisualization(){
        console.log("Status: Testing with Dataset " + this.datasetId);
        $("#eexcess_loading").fadeIn('fast');

        this.dataset['task-number'] = this.task;
        this.dataset['tool-aided'] = $("#select-tool-condition").val() || 'yes';
        this.dataset["data"] = getDataWithKeywords(this.dataset.data);
        this.dataset["keywords"] = getGlobalKeywords(this.dataset.data);

        $("input[name='dataset']").val(JSON.stringify(this.dataset));
        $("form").submit();
    }


    function getDataWithKeywords(data){

        var candidateAdjectives = [],
            keyAdjectives = [];

        data.forEach(function(d, i) {

            d.title = d.title.clean();
            d.description = d.description.clean();
            var document = (d.description !== "undefined") ? d.title +'. '+ d.description : d.title;
            document = document.replace(/[-=’‘\']/g, ' ').replace(/[()\"“”]/g,'');

            d.taggedWords = tagger.tag(lexer.lex(document));

            // Find out which adjectives are potentially important and worth keeping
            d.taggedWords.forEach(function(tw){
                if(tw[1] == 'JJ'){
                    var adjIndex = candidateAdjectives.getIndexOf(tw[0].toLowerCase(), 'adj');
                    if(adjIndex == -1)
                        candidateAdjectives.push({ 'adj': tw[0].toLowerCase(), 'repeated': 1 });
                    else
                        candidateAdjectives[adjIndex].repeated++;
                }
            });
        });

        candidateAdjectives.forEach(function(ca){
            if(ca.repeated >= parseInt(data.length * 0.5))
                keyAdjectives.push(ca.adj);
        });

        //console.log(keyAdjectives);
        // Create each item's document to be processed by tf*idf
        // Save selected words in allTokens (nouns and certain adjectives)
        data.forEach(function(d, i) {
            var document = '';
            d.taggedWords.forEach(function(tw){
                /*if(tw[0].match(/our$/) && tw[0].length > 4)
                    tw[0] = tw[0].replace('our', 'or');
                */
                switch(tw[1]){
                    case 'NN':          // singular noun
                        tw[0] = (tw[0].isAllUpperCase()) ? tw[0] : tw[0].toLowerCase();
                        document += tw[0] + ' '; break;
                    case 'NNS':         // plural noun
                        document += tw[0].toLowerCase().singularizeNoun() + ' ';
                        break;
                    case 'NNP':         // proper noun
                        tw[0] = (tagger.wordInLexicon(tw[0].toLowerCase())) ? tw[0].toLowerCase().singularizeNoun() : tw[0];
                        document += tw[0] + ' '; break;
                    case 'JJ':
                        if(keyAdjectives.indexOf(tw[0]) > -1)
                            document += tw[0] + ' '; break;
                }
            });

            tfidf.addDocument(document);    // stemming in natural
            $.merge(this.allTokens, tokenizer.tokenize(document));
        });

        // Save keywords for each item
        // keywordsArray stores all keywords whose score is >= mean score for current item
        data.forEach(function(d, i){
            d.keywords = [];
            var scores = 0;
            tfidf.listTerms(i).forEach(function(item){
                if(isNaN(item.term) && parseFloat(item.tfidf) > 0 ){
                    d.keywords.push({ 'term': item.term, 'score': item.tfidf });
                    scores += item.tfidf;
                }
            });

            var mean = scores / d.keywords.length;
            d.keywords.forEach(function(k){
                var kIndex = this.keywordsArray.getIndexOf(k.term, 'stem')
                if(k.score >= mean && kIndex == -1)
                    this.keywordsArray.push({ 'stem': k.term, 'term': '', 'repeated': 1, 'variations': [] });
                else if(kIndex > -1)
                    this.keywordsArray[kIndex].repeated++;
            });
        });

        return data;
    }




    function getGlobalKeywords(data) {
        var sortedKeywords = [];
        var minRepetitions = (parseInt(data.length * 0.05) > 1) ? parseInt(data.length * 0.05) : 2;

        this.keywordsArray.forEach(function(k){
            if(k.repeated >= minRepetitions)
                sortedKeywords.splice(findIndexToInsert(sortedKeywords, k), 0, k);
        });

        var words = lexer.lex(this.allTokens.join(' '));
        var taggedTokens = tagger.tag(words);

        taggedTokens.forEach(function(t){
            var token = (t[1] != 'NNS') ? t[0] : t[0].singularizeNoun();
            var kIndex = sortedKeywords.getIndexOf(token.stem(), 'stem');

            if(kIndex >= 0 && stopWords.indexOf(token.toLowerCase()) == -1){
                var vIndex = sortedKeywords[kIndex].variations.getIndexOf(token, 'term');

                if(vIndex < 0)
                    sortedKeywords[kIndex].variations.push({ 'term': token, 'repeated': 1 });
                else
                    sortedKeywords[kIndex].variations[vIndex].repeated++;
            }
        });

        sortedKeywords.forEach(function(k){
            k.term = getTerm(k);
        });
        console.log('sorted keywords -- ' + sortedKeywords.length);
     //   console.log(JSON.stringify(sortedKeywords));
        return sortedKeywords
    }




    function findIndexToInsert(kArray, keyword){
        var i = 0;
        while(i < kArray.length && keyword.repeated < kArray[i].repeated)
            i++;
        return i;
    }



    function getTerm(k){
        // Only one variations
        if(k.variations.length == 1)
            return k.variations[0].term;

        // 2 variations, one in lower case and the other starting in uppercase --> return in lower case
        if(k.variations.length == 2 && !k.variations[0].term.isAllUpperCase() && !k.variations[1].term.isAllUpperCase() && k.variations[0].term.toLowerCase() === k.variations[1].term.toLowerCase())
            return k.variations[0].term.toLowerCase();

        // One variation is repeated >= 75%
        var repetitions = 0;
        for(var i = 0; i < k.variations.length; ++i)
            repetitions += k.variations[i].repeated;

        for(var i = 0; i < k.variations.length; ++i)
            if(k.variations[i].repeated >= parseInt(repetitions * 0.75))
                return k.variations[i].term;

        // One variation end in 'ion', 'ment', 'ism' or 'ty'
        for(var i = 0; i < k.variations.length; ++i)
            if(k.variations[i].term.match(/ion$/) || k.variations[i].term.match(/ment$/) || k.variations[i].term.match(/ism$/) || k.variations[i].term.match(/ty$/))
                return k.variations[i].term.toLowerCase();

        // One variation == keyword stem
        var stemIndex = k.variations.getIndexOf(k.stem, 'term');
        if(stemIndex > -1)
            return k.variations[stemIndex].term;

        // Pick shortest term
        var shortestTerm = k.variations[0].term;
        for(var i = 1; i < k.variations.length; i++){
            if(k.variations[i].term.length < shortestTerm.length)
                shortestTerm = k.variations[i].term;
        }
        return shortestTerm.toLowerCase();
    }


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /** Access point    **/

    (function(){
        // Fill dataset select options and bind event handler
        dsm = new datasetManager();
        var idsAndDescriptions = dsm.getDatsetsIDsAndDescriptions();
        var datasetOptions = "<option value=\"NO_DATASET\">Select dataset...</option>";
        idsAndDescriptions.forEach(function(ds){
            datasetOptions += "<option value=\"" + ds.id + "\">" + ds.description + "</option>";
        });

        $("#select-dataset").html(datasetOptions);
        // Bind event handlers for dataset select and start button
        $("#select-dataset").change(selectDatasetChanged);
        $("#start-button").click(startButtonClicked);

        var taskToken = tokenizer.tokenize($('#task').text());
        this.task = taskToken.length > 0 ? parseInt(taskToken) : 0;
    })();

})();










