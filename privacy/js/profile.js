function doProfileItemChange() {
    var fieldName = $(this).attr("data-eexcess-profile-field");
    var value = $(this).val();
    console.log("Updating profile entry '" + fieldName + "' to " + value);
    EEXCESS.storage.local("privacy.profile." + fieldName,value);
}

function loadProfileItem() {
    var fieldName = $(this).attr("data-eexcess-profile-field");
    var value = EEXCESS.storage.local("privacy.profile." + fieldName);
    $(this).val(value);
}

function loadTopics(topicList) {
    var jsonTopics = EEXCESS.storage.local('privacy.profile.topics');
    var topics = [];
    if(jsonTopics) {
        topics = JSON.parse(jsonTopics);
    }
    for (var i=0;i<topics.length;i++) {
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
        if(!ui.duringInitialization) {
        var jsonTopics = EEXCESS.storage.local('privacy.profile.topics');
        var topics = [];
        if(jsonTopics) {
            topics = JSON.parse(jsonTopics);
        }
        topics.push({label:ui.tagLabel,uri:ui.tag.data('uri'),policy:0});
        EEXCESS.storage.local('privacy.profile.topics',JSON.stringify(topics));
        }
    },
    afterTagRemoved: function(event, ui) {
        var topics = JSON.parse(EEXCESS.storage.local('privacy.profile.topics'));
        for (var i=0;i<topics.length;i++) {
            if(topics[i]['label'] === ui.tagLabel) {
                topics.splice(i,1);
                break;
            }
        }
        EEXCESS.storage.local('privacy.profile.topics',JSON.stringify(topics));
    }
});
