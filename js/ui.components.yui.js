Y.use(
    'node'
  , 'event'
  , 'event-custom'
  , 'transition'
  , 'slider'
  , 'pjax'
  , 'gallery-soon'
  , 'widget-anim'
  , 'overlay'
  , 'io-queue'
  , function (Y) {

    'use strict';
    
    /** definition list start */
    var 

    /** nodes */
    slider_datasource = Y.one('#slider_value')
  , pane_pagemeta = Y.one('.pane.pagemeta')
  , pane_top = Y.one('#top')
  
     /** widgets */
   , slider
   
     /* utilities */
   
     /** Pjax object to request new book pages; the content from successful requests will be appended to "display" pane */
   , pjax = new Y.Pjax({ container: '.pane.display' })

     /** callbacks */
   , resizePageMeta
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


     /** book global settings; the object that represent the current book and settings */
   , book = Y.DLTS.settings.book
   
   ; /** definition list end */
    
    /** set a X-PJAX HTTP header for all IO requests */
    Y.io.header('X-PJAX', 'true');

    /** add view port information to global setting */
    book.viewport = Y.DOM.viewportRegion();

    resizePageMeta = function () {

        var viewportHeight = this.get('winHeight');
        var adminBarHeight = 0;
        if (Y.one('#admin-menu')) {
            adminBarHeight = Y.one('#toolbar').get('offsetHeight') + Y.one('#admin-menu').get('offsetHeight') + Y.one('.tabs').get('offsetHeight') + 10;
        }
        var topHeight = Y.one('#top').get('offsetHeight');
        var navbarHeight = Y.one('#navbar').get('offsetHeight');
        var pageHeight = Y.one('#pager').get('offsetHeight');
        var sidebarHeight = viewportHeight - (adminBarHeight + topHeight + navbarHeight + pageHeight);
        Y.one('#pagemeta').setStyle('height', sidebarHeight + 'px');
        Y.one('#pagemeta').setStyle('overflow-y', 'scroll');
        Y.log(sidebarHeight);
    }
  
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

        e.preventDefault();
      
        /** test if the target is not active */
        if (e.currentTarget.hasClass('inactive')) return false;

        /** if event has referenceTarget, then event was trigger by reference */
        if (Y.Lang.isObject(e.referenceTarget, true)) {
            url = e.referenceTarget.getAttribute('data-url');
        }

        /** trigger by a pjax enable link */
        else {
            url = this.get('href');
        }
      
        /** request URL */
        pjax.navigate(url);

    };
    
    pjax_load = function(e) {
        
        var config
          , node = e.content.node
          , map = node.one('.dlts_image_map');
        
        /** At this point we assume the new toogle / next / previous buttons are part 
            of the response DOM, replace the old ones */ 
        
        Y.one('.paging.previous').replace(node.one('.previous').cloneNode(true));
        Y.one('.paging.next').replace(node.one('.next').cloneNode(true));	
        Y.one('a.toogle').replace(node.one('.toogle').cloneNode(true));	
        
        /** Configuration for the new book page */
        config = {
            id: map.get('id'),
            title: node.getAttribute('data-title'),
            node: map,
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
    Y.on('contentready', resizePageMeta, '#pagemeta');
    Y.on('windowresize', resizePageMeta, '#pagemeta');

    slider.after('valueChange', slide_value_change, { datasource: slider_datasource, slider: slider });

    slider.after('slideEnd', slide_end, slider);

    Y.on('openlayers:next', pjax_callback, Y.one('.paging.next'));
    
    Y.on('pjax:change', pjax_callback);
    
    Y.on('openlayers:previous', pjax_callback, Y.one('.paging.previous'));    
    
    Y.one('.pane.pager').delegate('submit', pager_form, 'form', slider_datasource);

    pjax.on('load', pjax_load);

    pjax.on('navigate', pjax_navigate, Y.one('.pane.load'));
    
    Y.one('#page').delegate('click', on_button_click, 'a.button');

    Y.one('#page').delegate('click', pjax_callback, 'a.paging, a.toogle');
    
    /** delegate click on book pages thumbnails links */
    Y.one('#page').delegate('click', pjax_callback, '.view-book-thumbnails a');    

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

        var current_book_page = Y.one('#slider_value').get('value')
        
          , pane = Y.one('.view-book-thumbnails')

            /** maximum width of each column */
          , columns_max_width = 200

            /** minimum width of each column */
          , columns_min_width = 180

            /** columns per pager page; the weird looking math is a fancy/faster way to achieve Math.floor() */
          , pager_count = (book.viewport.width / columns_max_width)|0

            /** given the client viewport try to calculate the "optimal" width of each column */
          , columns_width = (book.viewport.width/pager_count)|0 - 10 * pager_count

            /** thumbnail page  */
          , book_thumbnails_page = Math.ceil(current_book_page / pager_count) - 1;
          
        /** @TODO: this is ugly and syntactically uglier because we need a better solution */
        // if (columns_width > columns_max_width || columns_width < columns_min_width ) ( ( columns_width = columns_max_width ) && ( pager_count = pager_count - 1 ) );

        this.removeClass('hidden');
        
        if (!pane || pane && (current_book_page / pager_count) > 1) {
            Y.io.queue(Y.DLTS.settings.book.path + '/pages?page=' + book_thumbnails_page + '&pager_count=' + pager_count);
        }

    }, Y.one('.pane.thumbnails'));

    // Subscribe to "io.success" for thumbnails page requests.
    Y.on('io:success', function (id, response, arg) {

        /** current book page */
        var current_book_page = Y.one('#slider_value').get('value');

        if (arg === 'thumbnails') {
            var node;
            
            this.one('.thumbnails-container').set('innerHTML', response.response);

        	node = this.one('.sequence-number-' + current_book_page);
        	
        	if (node) {
        	    node.addClass('active');
        	}

        }

    }, Y, 'thumbnails');

    Y.on('button:button-thumbnails:off', function(e) {
        this.addClass('hidden');
    }, Y.one('.pane.thumbnails'));
    
    Y.once('contentready', function() {
        Y.later(1000, Y.one('.pane.load'), function() {
            this.hide();
        });
    }, '.dlts_image_map');
    
    Y.delegate('click', function(e) {
        var currentTarget = e.currentTarget;
        
        e.preventDefault();
        
        Y.io.queue(currentTarget.get('href'));

    }, 'body', '.thumbnails-container .pager a');
    
    Y.delegate('click', function(e) {
        e.halt();
        location.href = location.href.replace(/\/$/, '') + '/edit'
    }, '.node-type-dlts-book-page', '.tabs li.edit a');

    Y.delegate('click', function(e) {
        e.halt();
        location.href = location.href.replace(/\/$/, '')
    }, '.node-type-dlts-book-page', '.tabs li.view a');

});