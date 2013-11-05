YUI({
    combine: true,
    modules: {
        'imageloader-dlts': {
            fullpath: Y.DLTS.settings.book.theme_path + 'js/imageloader-dlts.js'
        }
    }
}).use('node-event-delegate', 'event-custom', 'imageloader-dlts', 'handlebars', 'datasource-get', 'datasource-jsonschema', 'datasource-cache', 'cache-offline', function(Y) {
    'use strict';

    Y.log('ui.pages.view.js');
    
    // Assignment start

    var panes = {
        thumbnails: Y.one('.view-content')
    },

    templates = {
        container: Y.Handlebars.compile(Y.one('#thumbnail-sequence').get('text')),
        item: Y.Handlebars.compile(Y.one('#thumbnail').get('text'))
    },

    foldGroup = new Y.ImgLoadGroup({ 
        foldDistance: 30
    }),

    url = 'pages.json',

    paneOffsetWidth = Y.one('body').get('offsetWidth'),

    imagesRows = (Y.UA.ipad) ? 4 : ( (Y.UA.iphone) ? 2 : 6 ),

    padding = 8,

    panesWidth = Math.floor(paneOffsetWidth / imagesRows) - padding, 

    imageWidth = panesWidth,

    dataSource = new Y.DataSource.Get({source: url });

    // assignment ends
    
    function handleSuccessJSONP(e) {

        var items = (Y.Lang.isObject(e.response.results)) ? e.response.results : {}, 
        	l = items.length, 
        	elm;

        Y.Object.each(items, function(item, key) {
        	
            // calculate the height of the images
        	  if (key == 0) {
                Y.log(item.thumbnail.height);
            }

            if (parseInt(key / imagesRows) == (key / imagesRows)) {
                panes.thumbnails.append(templates.container({ id: key }));
                elm = Y.one('#g' + key);
            }

            item.width = imageWidth;
            item.rows = imagesRows;

            elm.append(templates.item(item));

            Y.fire('image:available', item);

            if (key == l - 1) {
                Y.fire('thumbails:available');
            }
        });
    }

    function handleFailureJSONP(e) {
        Y.log('Failure');
        Y.log(e);
    }

    dataSource.plug(Y.Plugin.DataSourceJSONSchema, {
        schema: {
            resultListLocator: 'pages',
            resultFields: ['title', 'sequence', 'count', 'identifier', 'thumbnail', 'description', 'volume', 'number', 'date']
        }
    });

    dataSource.plug(Y.Plugin.DataSourceCache, {
        sandbox: 'books',
        cache: Y.CacheOffline,
        expires: 21600000 
    });
    
    dataSource.cache.flush();
    
    dataSource.cache.on('retrieve', function() {
        Y.log('retrieve');
    });

    dataSource.sendRequest({
        request: '?limit=0',
        on: {
            success: handleSuccessJSONP,
            failure: handleFailureJSONP
        }
    });
    
    Y.on('image:available', function(image) {
        foldGroup.registerImage({
            domId: 'thumb-' + image.sequence, 
            srcUrl: image.thumbnail.image,
            width: imageWidth,
            setVisible: true
        });
    });    

    Y.on('thumbails:loaded', function(image) {
        var ancestor = image.ancestor('.thumb-item');
        ancestor.removeClass('hidden');
    });
    
    Y.on('thumbails:fetched', function(group) {
        Y.log('thumbails:fetched');
    });

});