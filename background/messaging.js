var EEXCESS = EEXCESS || {};

// listen for incoming messages
EEXCESS.messaging.listener(
        function(req, sender, sendResponse) {
            if (typeof sender.tab === 'undefined') {
                // sender cannot be identified, exit
                console.log('no tab');
                return;
            }
            var tabID = sender.tab.id;
            if (req.method === 'fancybox') {
                EEXCESS.inject.fancybox(tabID, req);
            } else if (req.method === 'privacySandbox') {
                EEXCESS.messaging.sendMsgTab(tabID, req);
            }
            else {
                // call function as specfied by the request
                EEXCESS[req.method.parent][req.method.func](tabID, req.data, sendResponse);
                return true;
            }
        }
);


