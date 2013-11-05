  Y.applyConfig({
    modules: {
        'template-micro' : {
            fullpath: Y.DLTS.settings.book.theme_path + 'js/modules/template-micro.js'
        }
    }
});

Y.use('node', 'event', 'event-custom', 'imageloader', 'template-micro', 'escape', function(Y) {
    'use strict';
    
    var settings, columns, width, datasource_conf;

    /** global settings */
    settings = Y.DLTS.settings;
    
    /** the amount of columns per row */
    columns = (Y.UA.ipad) ? 4 : ((Y.UA.iphone) ? 2 : 6);
    
    /** the widht of each image */
    width = Math.floor(Y.one('body').get('offsetWidth') / columns) - 8; /** 8 = padding */
    
    /** datasource configuration object */ 
    datasource_conf = {
        id: 'books',
        source: 'collection-items.json',
       	plugins: {
       	    cache: {
       	        sandbox: 'books',
       	        expires: 21600000
       	    },
       	    json: {
       	    	schema: {
       	            resultListLocator: 'books',
       	            resultFields: ['identifier', 'title', 'label', 'path', 'thumbnail', 'publisher', 'subject', 'sequence_count', 'page_count']
       	        }
            }
        }
    };
    
    /** success callback */
    function requestSuccess(datasource) {
    	
        var thumbnails, compiled_container, compiled_item, elm, fold_group, register_images, register_image, datasource_leght;
        
        /** images group to be loaded upon reaching fold distance */
        fold_group = new Y.ImgLoadGroup({ name: 'books thumbnails', foldDistance: 30 });

        /** element where all the generated content will be append to */
        // thumbnails = Y.one('.pane-books-container');
        
        thumbnails = Y.one('.pane-page-body');

        /** compiled template */
        compiled_container = Y.Template.Micro.compile(settings.books.templates.container);
        
        /** compiled template */
        compiled_item = Y.Template.Micro.compile(settings.books.templates.sequence);
        
        datasource_leght = datasource.data.length;

        /** iterate datasource.data (images), this only exist because in IE and Opera images fail to register if the cache object is empty */
        register_images = function(images) {
            Y.Array.each(images, function(image) {
                register_image(image);
            });
        };

        /** add to the images group a new image */
        register_image = function(image) {
            fold_group.registerImage({
                domId: 'thumb-' + image.identifier,
                srcUrl: image.thumbnail,
                setVisible: true
            });        	
        };
        
        Y.one('.book-views').delegate('click', function(e) {
            e.preventDefault();
            
            var currentTarget = e.currentTarget,
                items_body = Y.one('.items'), 
                add_grid_klass = 'list_view', 
                remove_grid_klass = 'grid_view', 
                new_grid_prefix = 'yui3-u-', 
                new_grid_unit = '1', 
                old_grid_unit = '1-6',
                list_view = currentTarget.hasClass('list');
                
            if (!list_view) {
                add_grid_klass = 'grid_view';
                remove_grid_klass = 'list_view';
                new_grid_unit = '1-6';
                old_grid_unit = '1';
            }
                
            items_body.removeClass(remove_grid_klass);
            
            items_body.addClass(add_grid_klass);

            Y.all('.thumb-item').each(function(item, i) {
                item.removeClass(new_grid_prefix + old_grid_unit);
                item.addClass(new_grid_prefix + new_grid_unit);
            });

        }, 'a');

        /** iterate datasource.data to: create/append content to body and add images to images group */
        Y.Array.each(datasource.data, function(item, i) {
        	var row = parseInt(i / columns, 10);
          
        	item.width = width;
        	
        	item.rows = columns;

        	/** create a new row */
            if (row === (i / columns)) {
                /** append row to content */            	
            	thumbnails.append(compiled_container({ id : i }));
                /** hold a reference until the a row is available */
                elm = Y.one('#g' + i);
            }

            /** append a new colum to row */
            elm.append(compiled_item(item));
            
            /** sad, but we need to do this in order the to sucefully register images in IE and Opera while the cache object is empty */
            if (!Y.UA.ie && !Y.UA.opera) {
                register_image(item);
            }
            
            else if (i === datasource_leght - 1) {
                register_images(datasource.data);
            }

        });
    }
    
    /** Create a new datasource instance */
    Y.fire('datasource:new', datasource_conf);
    
    /** Request books in collection and append to pane on success */
    Y.fire('datasource:request', {
        id: 'books',
        request: '?limit=0',
        callback: requestSuccess
    });
    
    /** thumbails available, display image by removing the hidden class */
    Y.on('thumbails:loaded', function(image) {
        image.ancestor('.thumb-item').removeClass('hidden');
    });
    
});