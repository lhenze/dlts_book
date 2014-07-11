Y.use(
    'node'
  , 'event'
  , 'event-custom'
  , 'crossframe'
  , function(Y) {
    
    'use strict';
    
    Y.Global.on("crossframe:css", function (e, data, callback) { 

        Y.Get.css(data.message, function (err) {
        
            if (err) {
                Y.log('Error loading CSS: ' + err[0].error, 'error');
                return;
            }
            
            Y.log('file.css loaded successfully!');
            
        });      
    
    });
    
});