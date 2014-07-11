Y.use(
    'node'
  , 'event'
  , 'event-custom'
  , 'crossframe'
  , function(Y) {
    
    'use strict';
    
    // https://github.com/josephj/yui3-crossframe
    
    Y.on('button:button-metadata:on', function(e) {
        Y.CrossFrame.postMessage("parent", "hello", {});
    });
    
    Y.on('button:button-metadata:off', function(e) {
        Y.CrossFrame.postMessage("parent", "hello", {});
    });    
    
    Y.on('openlayers:next', function(e) {
        Y.CrossFrame.postMessage("parent", "next", {});
    }, Y.one('.paging.next'));
    
    Y.on('openlayers:previous', function(e) {
        Y.CrossFrame.postMessage("parent", "previous", {});
    }, Y.one('.paging.previous'));   
        
    Y.Global.on("crossframe:css", function (e, data, callback) { 

        Y.Get.css(data.message, function (err) {
        
            if (err) {
                Y.log('Error loading CSS: ' + err[0].error, 'error');
                return;
            }
            
            callback({"info": "some information from receiver. (" + parseInt(new Date().getTime()) + ")"})
            
            Y.log('file.css loaded successfully!');
            
        });      
    
    });
    
});