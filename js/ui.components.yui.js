Y.use(
    'node'
  , 'event'
  , 'event-custom'
  , 'transition'
  , 'slider'
  , 'pjax'
  , 'gallery-soon'
  , 'imageloader'
  , 'template'
  , 'widget-anim'
  , 'overlay'
  , 'io-queue'
  , function (Y) {

    'use strict';
    
    /** definition list start */
    var 

    /** nodes */
    slider_datasource
  , pane_pagemeta
  , pane_top

    /** callbacks */
   , slide_value_change
   , pager_form
   , on_button_click
   , slide_end
   , change_page
   , pjax_navigate
   , pjax_callback
   , pjax_load
   , on_mousemove_over_slider_rail
   , on_mouseleave_slider_rail

    /** widgets and others */
   , pjax
   , slider

    /** the object that represent the current book and settings */
   , book
   
   , requestURI;
   
    // Set a X-PJAX HTTP header.
    Y.io.header('X-PJAX', 'true');

    /** definition list end */

    /** book global settings */
    book = Y.DLTS.settings.book;

    pane_top = Y.one('#top');

    pane_pagemeta = Y.one('.pane.pagemeta');

    slider_datasource = Y.one('#slider_value');

    /** add view port information to global setting */
    book.viewport = Y.DOM.viewportRegion();
    
    requestURI = 'collection-items?page='

    /** callbacks */
    on_button_click = function(e) {

        e.preventDefault();

        var self = this
          , current_target = e.currentTarget        
          , event_prefix
          , event_id
          , node_target
          , data_target;
          
        /** don't waste time if the button is inactive */  
        if (current_target.hasClass('inactive')) return;

        /** if current target has target, get target from data-target */
        if (current_target.hasClass('target')) {
          
            data_target = self.getAttribute('data-target');

            event_prefix = 'button:' + data_target;
            
            /** look-up for the main target */
            node_target = Y.all('#' + data_target);

        }
        
        /** current target is the main target */
        else {

            event_id = self.get('id');
            
            event_prefix = 'button:' + event_id;
            
            /** find possible reference targets to this target */
            node_target = Y.all('a[data-target=' + event_id + ']');
        }

        if (self.hasClass('on')) {
            self.removeClass('on');
            if (Y.Lang.isObject(node_target)) {
                node_target.each(function(node) {
                    node.removeClass('on');
                });
            }
            Y.fire(event_prefix + ':off', e);
        }
        else {
            self.addClass('on');
            if (Y.Lang.isObject(node_target)) {
                node_target.each(function(node) {
                    node.addClass('on');
                });
            }
            Y.fire(event_prefix + ':on', e);
        }

        Y.fire(event_prefix + ':toggle', e);
    }; 
    
    /** TODO: I don't like this, find a more elegant solution */
    pager_form = function(e) {
        e.preventDefault();
        
        var value = this.get('value')
          , current = parseInt(book.sequence_number, 10)
          , path = book.path + '/'
          , css_class;

        if (value.match(/\D/)) {
            css_class = 'error';
        }    
        else {
            value = parseInt(value, 10);
            
            if (value !== current && (value > 0 && value <= book.sequence_count)) {
                css_class = 'ok';
                pjax.navigate(path + value);
            }
            else {
                if (value !== current) {
                    css_class = 'error';
                }
                else {
                    css_class = 'warning';
                }
            }
        }
        
        this.addClass(css_class).transition({
            duration: 1,
            easing: 'ease-in',
            opacity: 0.9
        }, function() {
            this.removeClass(css_class);
        });
    };

    /** callback for changes in the value of the slider */
    slide_value_change = function(e) {
      
        var slider = this.slider
          , datasource = this.datasource;
      
        /** slider event */
        if (!Y.Lang.isValue(slider.triggerBy)) {
            datasource.set('value', e.newVal);
        }
        /** event was triggered by reference */
        else {
           slider.triggerBy = undefined;
        }
    };

    /** callback for the slide end event */
    slide_end = function(e) {

        e.preventDefault();

        var slider = this
          , url = book.path + '/' + e.target.getValue();

        if (!Y.Lang.isValue(slider.triggerBy)) {

            pjax.navigate(url);

            /** slider set focus to the slider rail, blur as soon as possible so that user can use the keyboard to read the book */
            Y.soon(function () {
                slider.thumb.blur();
            });

        }
        
        /** event was triggered by reference */
        else {
          slider.triggerBy = undefined; 
        }
    };
    
    change_page = function(config) {

        var map
          , service
          , zoom
          , open_layers_dlts = OpenLayers.DLTS;

        if (Y.Lang.isObject(open_layers_dlts.pages[0], true)) {
            map =  open_layers_dlts.pages[0];
            service = map.baseLayer.url;
            zoom = map.getZoom();
            map.destroy();
            open_layers_dlts.pages = [];
        }

        if (Y.Object.isEmpty(open_layers_dlts.pages)) {
            open_layers_dlts.Page(config.id, config.uri, { 
                zoom: zoom,
                boxes: config.boxes,
                service: service,
                imgMetadata: config.metadata
            });
            
            Y.on('contentready', function() {
            	
                Y.one('#page-title').setContent(config.title);
                
                Y.fire('openlayers:change', config);
                
                Y.later(1000, Y.one('.pane.load'), function() {
                    this.hide();
                });

            }, '#' + config.id);
        }
    };

    pjax_navigate = function(e) {
    	
        var msg = e.url.replace(book.path + '/', '');
        
        if (/(^[\d]+$){1}/.test(msg)) {
            this.one('.current_page').set('text', msg);
        }
        else if (/(^[\d]+-[\d]+$){1}/.test(msg)) {
            this.one('.current_page').set('text', msg);
        }
        else {
            this.one('.current_page').set('text', '');
        }

        this.addClass('loading');

        this.show();

    };
    
    /** pjax callback can be call by clicking a pjax enable link or by reference with data-url */  
    pjax_callback = function(e) {

        var url;

        // test if the target is not active
        if (e.currentTarget.hasClass('inactive')) {
        	e.preventDefault();
        	return false;
        }

        /** if this has referenceTarget, then this event was trigger by reference */
        if (Y.Lang.isObject(e.referenceTarget, true)) {
            url = e.referenceTarget.getAttribute('data-url');
        }
        /** trigger by a pjax enable link */
        else {
            url = this.get('href');
        }
      
        pjax.navigate(url);
    };
    
    pjax_load = function(e) {
        
        var node = e.content.node
          , map = node.one('.dlts_image_map')
          , next = node.one('.next')
          , prev = node.one('.previous')
          , toogle = node.one('.toogle')
          , config;
        
        /** At this point we assume the new toogle / next / previous buttons are part of the response DOM, replace the old ones */ 
        
        Y.one('.paging.previous').replace(prev.cloneNode(true));
        Y.one('.paging.next').replace(next.cloneNode(true));	
        Y.one('a.toogle').replace(toogle.cloneNode(true));	
        
        /** Configuration for the new book page */
        config = {
            id: map.get('id'),
            title: node.getAttribute('data-title'),
            node: map,
            boxes: [],
            sequence: node.getAttribute('data-sequence'),
            uri: map.getAttribute('data-uri'),
            metadata: {
                width: map.getAttribute('data-width'),
                height: map.getAttribute('data-height'),
                levels: map.getAttribute('data-levels'),
                dwtLevels: map.getAttribute('data-dwtlevels'),
                compositingLayerCount: map.getAttribute('data-compositing-layer')
            }
        };

        Y.on('available', change_page, '#' + config.id, OpenLayers, config);

    };

    /** pjax object */    
    pjax = new Y.Pjax({ container: '.pane.display' });

    /** slider object */
    slider = new Y.Slider({
        axis: 'x',
        min: 1,
        clickableRail: false,
        max: parseInt(book.sequence_count, 10),
        value: parseInt(book.sequence_number, 10),
        length: (book.viewport.width - 150) + 'px',
        thumbUrl: Y.DLTS.settings.book.theme_path + 'js/img/thumb-x.png'
    });

    /** render the slider and plug-ins */
    
    slider.render('#slider');
    
    /** events listeners */
   
    slider.after('valueChange', slide_value_change, { datasource: slider_datasource, slider: slider });

    slider.after('slideEnd', slide_end, slider);
    
    Y.one('.pane.pager').delegate('submit', pager_form, 'form', slider_datasource);

    pjax.on('load', pjax_load);

    pjax.on('navigate', pjax_navigate, Y.one('.pane.load'));
    
    Y.one('#page').delegate('click', on_button_click, 'a.button');

    Y.one('#page').delegate('click', pjax_callback, 'a.paging, a.toogle');

    Y.on('button:button-metadata:on', function(e) {
          this.removeClass('hidden');
          this.ancestor('.pane-body').removeClass('pagemeta-hidden');
    }, pane_pagemeta);
    
    Y.on('button:button-metadata:off', function(e) {
          this.addClass('hidden');
          this.ancestor('.pane-body').addClass('pagemeta-hidden');
    }, pane_pagemeta);

    Y.on('button:button-fullscreen:on', function(e) {
        Y.fire('button:' + this.button.get('id') + ':off', this.pagemeta);
        this.button.removeClass('on');
        this.top.addClass('hidden');
    }, {  
        top: pane_top,
        pagemeta: pane_pagemeta,
        button: Y.one('a.metadata')
   });

    Y.on('button:button-fullscreen:off', function(e) {
        this.removeClass('hidden');
    }, pane_top);

    Y.on('openlayers:change', function(config) {
        
        var sequence = config.sequence
          , slider = this.slider
          , datasource = this.datasource;
        
        slider.triggerBy = 'openlayers:change';
        
        datasource.set('value', sequence);
        
        slider.set('value', sequence);
        
    }, {
        datasource: slider_datasource,
        slider: slider
    });
    
    Y.on('button:button-thumbnails:on', function(e) {

        this.removeClass('hidden');
        
        var page = 0;
        
  	    var requestURI = location.href;

        var match = requestURI.match(/\/[\d]\/?$/);
        
        // Y.log(match[0].match(/[\d]$/)[0])
        
        if (match) {
            Y.io.queue(requestURI.slice(0, match.index) + '/pages?page=' + page);
        }
                
    }, Y.one('.pane.thumbnails'));

    function onThumbnailsRequestSuccess(id, response, transaction) {
        this.one('.thumbnails-container').append(response.response)
    }
    
    // Subscribe to "io.success".
    Y.on('io:success', onThumbnailsRequestSuccess);
  
    // Subscribe to "io:start".
    // Y.on('io:start', onStart, Y, transactions);    
    
    Y.on('button:button-thumbnails:off', function(e) {
        this.addClass('hidden');
    }, Y.one('.yui3-carousel-container'));
    
    Y.once('contentready', function() {
        Y.later(1000, Y.one('.pane.load'), function() {
            this.hide();
        });
    }, '.dlts_image_map');
    
    Y.delegate('click', function(e) {
        e.halt();
        location.href = location.href.replace(/\/$/, '') + '/edit'
    }, '.node-type-dlts-book-page', '.tabs li.edit a');

    Y.delegate('click', function(e) {
        e.halt();
        location.href = location.href.replace(/\/$/, '')
    }, '.node-type-dlts-book-page', '.tabs li.view a');

});