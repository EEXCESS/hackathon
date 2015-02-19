function TaskStorage() {
    
    
    function setObject(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    };


    function getObject(key) {
        var value = localStorage.getItem(key);
        return value && JSON.parse(value);
    };


    TaskStorage.prototype.saveTask = function(taskResults){

        if(taskResults['task-number'] === 0)
            return;

        if(taskResults['task-number'] === 1){
            this.userCount++;
            setObject('userCount', this.userCount);
        
            this.evaluationResults.push({
                'user' : this.userCount,
                'tasks-results' : []
            });
        }
        this.evaluationResults[this.evaluationResults.length - 1]["tasks-results"].push(taskResults);
        setObject('evaluationResults', this.evaluationResults);
    };

    
    TaskStorage.prototype.removeEvaluationsResults = function(){
        localStorage.removeItem('userCount');
        localStorage.removeItem('evaluationResults');
        this.userCount = 0;
        this.evaluationResults = [];
    };

    
    TaskStorage.prototype.getEvaluationResults = function(){
        return this.evaluationResults;
    };

 
    
    TaskStorage.prototype.restore = function(){
        var previous = previousResults();
        //console.log(JSON.stringify(previous));
        setObject('evaluationResults', previous);
        setObject('userCount', parseInt(previous[previous.length - 1].user));
        this.userCount = getObject('userCount');
        this.evaluationResults = getObject('evaluationResults');
        console.log('new results');
        console.log(this.evaluationResults);
        
    };


    TaskStorage.prototype.fix = function(){
        var previous = previousResults();
    /*
        previous.forEach(function(d){
            d["tasks-results"].forEach(function(task){
                if(task["dataset-id"].toString().contains("30"))
                    task["total-items"] = "30";
            });
        });
    */
        previous.forEach(function(d) {
            d["tasks-results"].forEach(function(t) {
                t['query'] = getQuery(t["dataset-id"]);
            });
        });

        function getQuery(datasetId) {
            switch(datasetId) {
                case 'T1-30':
                case 'T1-60':   return 'women in workforce'; break;
                case 'T2-30':
                case 'T2-60':   return 'robot'; break;
                case 'T3-30':
                case 'T3-60':   return 'augmented reality'; break;
                case 'T4-30':
                case 'T4-60':   return 'circular economy'; break;
            }
        }
        console.log(JSON.stringify(previous));
    }
    

    
    this.userCount = (function(value){
        if(value != null) return value; return 0;
    })(getObject('userCount'));


    this.evaluationResults = (function(value){
        if(value != null) return value; return [];
    })(getObject('evaluationResults'));


    
}
