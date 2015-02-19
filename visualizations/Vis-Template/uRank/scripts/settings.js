function Settings(){

    Settings.prototype.getRankingDimensions = function(domRoot, iWidth){

		var rootWidth  = $(domRoot).width();
		var rootHeight = $(domRoot).height();

        //var margin = {top: 20, bottom: 30, left: Math.floor(rootWidth * 0.3), right: Math.floor(rootWidth * 0.02) };
        var margin = {top: 0, bottom: 20, left: 2, right: 0 };
        var width = rootWidth - margin.left - margin.right;
        var height = $('#eexcess_content').height();
        var centerOffset = (iWidth/2) - ((width + margin.left + margin.right)/2);
        var verticalOffset = ((rootHeight - 500) / 2) < 30 ? 30 : ((rootHeight - 500) / 2);

        return{ 'margin': margin, 'width': width, 'height': height, 'centerOffset': centerOffset, 'verticalOffset': verticalOffset };
	};




    /************************************************************
     * INITDATA
     *
     * **/
	Settings.prototype.getRankingInitData = function( initData, ranking, rankingCriteria ){

        var data = fixMissingAndMalformattedValues( initData );
        var attr = rankingCriteria == 'overall_score' ? 'overallScore' : 'maxScore';
        var a = [];
        var i = 0;

        while(i < ranking.length && ranking[i][attr] > 0){

            a[i] = ranking[i];
            a[i]['title']       = data[a[i].originalIndex]['title'];
            a[i]['id']          = data[a[i].originalIndex]['id'];
            a[i]['uri']         = data[a[i].originalIndex]['uri'];
            a[i]['facets']      = new Array();
            a[i]['facets']      = data[a[i].originalIndex]['facets'];

            var x0 = 0;
            var maxWeightedScoreFound = false;

            a[i]['weightedKeywords'].forEach(function(wk){

                if(rankingCriteria == 'overall_score'){

                    wk['x0'] = x0;
                    wk['x1'] = x0 + wk['weightedScore'];
                    x0 = wk['x1'];
                }
                else{
                    if(wk['weightedScore'] == a[i]['maxScore'] && !maxWeightedScoreFound){
                        wk['x0'] = x0;
                        wk['x1'] = x0 + wk['weightedScore'];
                        x0 = wk['x1'];
                        maxWeightedScoreFound = true;
                    }
                    else{
                        wk['x0'] = x0;
                        wk['x1'] = x0;
                    }
                }
            });
            i++;
        }
        return { 'data' : a};
	};



    /************************************************************
     * INITDATA processing
     *
     * **/


    function fixMissingAndMalformattedValues( data ){

        var dataArray = [];
        data.forEach(function(d){
            var obj = {};
            obj['id'] = d.id;
            obj['title'] = d.title;
            obj['uri'] = d.uri;
            obj['facets'] = new Array();
            obj['facets']['language'] = d.facets.language || 'en';
            obj['facets']['provider'] = d.facets.provider;
            obj['facets']['year'] = parseDate(String(d.facets.year));
            obj['facets']['country'] = d.facets.country || "";
            obj['facets']['keywords'] = d.facets.keywords || [];

            dataArray.push(obj);
        });

        return dataArray;
    }

};
