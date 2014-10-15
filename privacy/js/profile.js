function doProfileItemChange() {
    var fieldName = $(this).attr("data-eexcess-profile-field");
    var value = $(this).val();
    console.log("Updating profile entry '" + fieldName + "' to " + value);
    EEXCESS.storage.local("privacy.profile." + fieldName, value);
}

function loadProfileItem() {
    var fieldName = $(this).attr("data-eexcess-profile-field");
    var value = EEXCESS.storage.local("privacy.profile." + fieldName);
    $(this).val(value);
}

function loadTopics(topicList) {
    var jsonTopics = EEXCESS.storage.local('privacy.profile.topics');
    var topics = [];
    if (jsonTopics) {
        topics = JSON.parse(jsonTopics);
    }
    for (var i = 0; i < topics.length; i++) {
        topicList.append('<li data="' + topics[i]['uri'] + '">' + topics[i]['label'] + '</li>');
    }
}

(function($) {
    $('.datepicker').datepicker({viewMode: 2}).on('changeDate', function(ev) {
        $(this).trigger('change');
    });

    $("input[data-eexcess-profile-field]").live("change", doProfileItemChange);
    $("select[data-eexcess-profile-field]").live("change", doProfileItemChange);

    $("*[data-eexcess-profile-field]").each(loadProfileItem);
    loadTopics($('#topicInput'));
})(jQuery);


$('#topicInput').tagit({// tagit plugin for topics
    allowSpaces: true,
    removeConfirmation: true,
    autocomplete: {
        source: function(request, response) {
            $.ajax({
                processData: false,
                contentType: 'application/json',
                type: 'POST',
                url: EEXCESS.config.DISAMBIGUATE_URI,
                dataType: "json",
                data: '{"input":"' + request.term + '","language":"en"}', // possible language fields: en,de,fr TODO: make selectable
                success: function(data) {
                    response($.map(data.categories, function(item) {
                        return {
                            label: item.label,
                            value: {label: item.label, uri: item.url}
                        };
                    }));
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log("error!");
                    console.log(jqXHR);
                    console.log(textStatus);
                    console.log(errorThrown);
                    console.log(jqXHR.responseText);
                }
            });
        },
        minLength: 3,
        focus: function(event, ui) {
            // show only labels in the preview
            event.preventDefault();
            $(this).val(ui.item.label);
        }
    },
    afterTagAdded: function(event, ui) {
        if (!ui.duringInitialization) {
            var jsonTopics = EEXCESS.storage.local('privacy.profile.topics');
            var topics = [];
            if (jsonTopics) {
                topics = JSON.parse(jsonTopics);
            }
            topics.push({label: ui.tagLabel, uri: ui.tag.data('uri'), policy: 0});
            EEXCESS.storage.local('privacy.profile.topics', JSON.stringify(topics));
        }
    },
    afterTagRemoved: function(event, ui) {
        var topics = JSON.parse(EEXCESS.storage.local('privacy.profile.topics'));
        for (var i = 0; i < topics.length; i++) {
            if (topics[i]['label'] === ui.tagLabel) {
                topics.splice(i, 1);
                break;
            }
        }
        EEXCESS.storage.local('privacy.profile.topics', JSON.stringify(topics));
    }
});

$(document).ready(function() {
    var xhr = $.ajax({
        url: EEXCESS.config.FR_BASE_URI + 'getRegisteredPartners',
        type: 'GET',
        dataType: 'json'
    });
    xhr.done(function(data) {
        // display available partners
        var source_div = $('#source_selection');
        for (var i = 0; i < data.partner.length; i++) {
            var name = data.partner[i].systemId;
            var tags = '';
            if (data.partner[i].tags.length > 0) {
                tags = '(';
                for (var j = 0; j < data.partner[i].tags.length; j++) {
                    tags += data.partner[i].tags[j];

                    if (j < data.partner[i].tags.length - 1) {
                        tags += ', ';
                    } else {
                        tags += ')';
                    }
                }
            }
            source_div.append('<input type="checkbox" name="selected_source" value="' + data.partner[i].systemId + '" id="selected_source_' + data.partner[i].systemId + '"/> ' + data.partner[i].systemId + ' ' + tags + '<br/>');
        }

        // check selected partners
        var sources = EEXCESS.storage.local('selected_sources');
        if (typeof sources === 'undefined') {
            sources = ['Europeana', 'Mendeley', 'ZBW', 'KIMCollect'];
        }  else {
            sources = JSON.parse(sources);
        }
        for (var i = 0; i < sources.length; i++) {
            var selector = '#selected_source_' + sources[i];
            $(selector).prop('checked', true);
        }

        // update seleceted partners
        $('input[name="selected_source"]').change(function() {
            if ($(this).is(':checked')) {
                if($.inArray($(this)[0].value, sources) === -1) {
                    sources.push($(this)[0].value);
                }
            } else {
                var idx = $.inArray($(this)[0].value, sources);
                if(idx > -1) {
                    sources.splice(idx,1);
                }
            }
            EEXCESS.storage.local('selected_sources',JSON.stringify(sources));
        });
    });
    xhr.fail(function(jqXHR, textStatus, errorThrown) {
        $('#source_selection').append('<p>An error occured while retrieving the list of available sources, please try again later</p>');
    });
}); 