Y.use('datasource-get', 'datasource-jsonschema', 'cache', 'datasource-cache', 'cache-offline', function (Y) {
    'use strict';

    var datasource = Y.namespace('Y.DLTS.datasource');
	
    Y.on('datasource:new', function(config) {
    	if (Y.Lang.isValue(config.id)) {
            config.plugins.cache.cache = Y.CacheOffline;
            this[config.id] = new Y.DataSource.Get({ source: config.source });
            this[config.id].plug(Y.Plugin.DataSourceJSONSchema, config.plugins.json);
            this[config.id].plug(Y.Plugin.DataSourceCache, config.plugins.cache);
            if (Y.Lang.isObject(config.plugins.cache.callback)) {
                this[config.id].cache.on('retrieve', config.plugins.cache.callback);
            }
            // this[config.id].cache.flush();
    	}
    	else {
    	    Y.error('Unable to register new datasource.');
    	}
    }, datasource);

    Y.on('datasource:request', function(config) {
        var callback;
        
        callback = {
            success: function (e) {
                var data = {}, numFound = 0;
                if (Y.Lang.isObject(config.callback)) {
                    data = e.response.results;
                    numFound = data.length;
                    config.callback({ data: data, numFound: numFound, e: e });
                }
            },
            failure: function (e) {
                Y.error('Request fail for datasource ' + config.id);
            }
        };

        this[config.id].sendRequest({ callback: callback, request: config.request });

    }, datasource);
    
    Y.DLTS.datasource = datasource;

});