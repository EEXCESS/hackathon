(function Controls(){

    var taskStorage = new TaskStorage();

    var clearResults = function(){
        taskStorage.removeEvaluationsResults();
    };

    var fixResults = function(){
        taskStorage.fix();
    };

    var restoreResults = function(){
        taskStorage.restore();
    };

    var downloadResults = function(e){

        var scriptURL = (document.URL).replace('controls.html', 'download.php'),
            d = new Date(),
            timestamp = d.getFullYear() + '-' + (parseInt(d.getMonth()) + 1) + '-' + 
                d.getDate() + '_' + d.getHours() + '.' + d.getMinutes() + '.' + d.getSeconds();

        console.log(scriptURL);
        $.generateFile({
            filename	: 'evaluation_results_' + timestamp + '.txt',
            content		: JSON.stringify(taskStorage.getEvaluationResults()),
            script		: scriptURL
        });
        e.preventDefault();
    };


    var processResults = function(e) {

        var linked_user_doc_qk = [],
            kw_aux = [
                { query: 'women in workforce', keywords: ['participation&women&workforce', 'gap&gender&wage', 'inquality&man&salary&wage&woman&workforce']},
                { query: 'robot', keywords: ['autonomous&robot', 'human&interaction&robot', 'control&information&robot&sensor']},
                { query: 'augmented reality', keywords: ['environment&virtual', 'context&object&recognition', 'augmented&environment&image&reality&video&world']},
                { query: 'circular economy', keywords: ['management&waste', 'china&industrial&symbiosis', 'circular&economy&fossil&fuel&system&waste']}];

        taskStorage.getEvaluationResults().forEach(function(result){
            var user_num = (result.user.toString().length == 1) ? '0'+result.user.toString() : result.user.toString();
            
            result["tasks-results"].forEach(function(task) {
                if(task["tool-aided"] === 'yes') {
                    task["questions-results"].forEach(function(question) {
                        var kw = getKeywords(task.query, question["question-number"], kw_aux);
                        question["selected-items"].forEach(function(item) {
                            linked_user_doc_qk.push({
                                user_id: 'user_' + user_num,
                                document_id: item.id,
                                document_title: item.title,
                                query: task.query,
                                keywords: kw
                            });
                        });
                    });
                }
            });
        });
       // console.log('linked_user_doc_qk');
        //console.log(linked_user_doc_qk);

        function getKeywords(query, questionNumber, kw_aux) {
            var index = kw_aux.getIndexOf(query, 'query');
            return kw_aux[index].keywords[questionNumber - 1].split('&');
        }
        
        var host = "http://localhost/RankingViz/server/recommender.php";
        var successfulInsertions = 0;
        
        linked_user_doc_qk.forEach(function(link, i) {
        
            var dataToSend = { action: 'initial_data_added', data: link };
            // Call server
            $.post(host, dataToSend)
            .done(function(reqData){
                //console.log(JSON.parse(reqData));
                successfulInsertions++;
            })
            .fail(function(jqXHR, textStatus) {
                console.log(jqXHR.responseJSON.message);
            });
        });
        
        setTimeout(function() {
            console.log('Total links = ' + linked_user_doc_qk.length + ' --- Successful insertions = ' + successfulInsertions);
        }, 5000);
    
    };



    (function init(){
        $('#clear_results').click(clearResults);
        $('#fix_results').click(fixResults);
        $('#restore_results').click(restoreResults);
        $('#download_results').click(downloadResults);
        $('#process_results').click(processResults);
    })();

})()
