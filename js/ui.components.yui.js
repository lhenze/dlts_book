/* jshint laxcomma: true, laxbreak: true, unused: false */
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
  , pane_tooltip = Y.one('#tooltip')
  
     /** widgets */
   , slider
   , tooltip
   
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
   , on_toggle_language
   , on_mousemove_tooltip
   , on_mouseleave_tooltip

     /** book global settings; the object that represent the current book and settings */
   , book = Y.DLTS.settings.book
   
   /** others */
   , waitingToShow = false
   
   ; /** definition list end */
    
    /** set a X-PJAX HTTP header for all IO requests */
    Y.io.header('X-PJAX', 'true');

    /** add view port information to global setting */
    book.viewport = Y.DOM.viewportRegion();

    resizePageMeta = function () {
        
        /** definition list start */
        var viewportHeight = this.get('winHeight')
          , adminBarHeight = 0
          , topHeight = Y.one('#top').get('offsetHeight')
          , navbarHeight = Y.one('#navbar').get('offsetHeight')
          , pageHeight = Y.one('#pager').get('offsetHeight')
          , nodeAdminMenu = Y.one('#admin-menu')
          , sidebarHeight

          ; /** definition list end */

        if (nodeAdminMenu) {
            adminBarHeight = Y.one('#toolbar').get('offsetHeight') 
                           + nodeAdminMenu.get('offsetHeight') 
                           + Y.one('.tabs').get('offsetHeight') 
                           + 10;
        }

        sidebarHeight = viewportHeight - (adminBarHeight + topHeight + navbarHeight + pageHeight);
        
        Y.one('#pagemeta').setStyles({'height' :  sidebarHeight});
        
    };
    
    on_toggle_language = function(e) {
    	
        var current_target = e.currentTarget
          , data_target = current_target.get('value');

        e.preventDefault();
        
        Y.io(data_target, { 
            on: {
                complete: function(id, e) {
            	
                    var node = Y.one('#pagemeta')
                      , dir;

                    node.set('innerHTML', e.response);

                    dir = node.one('.node-dlts-book').getAttribute('data-dir');

                    Y.one('.pane.main').set('dir', dir);

                    Y.one('.titlebar').set('dir', dir);

                    Y.one('#page-title').set('innerHTML', node.one('.field-name-field-title .field-item').get('text'));

                } 
            }
        });        

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
        
        /** At this point we assume the new toggle / next / previous buttons are part 
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
    
    on_mousemove_tooltip = function (e) {
    	
        var i
          , currentTarget = e.currentTarget
          , target_title = currentTarget.getAttribute('data-title') 
          
        Y.log(target_title);

        if (tooltip.get('visible') === false) {
            // while it's still hidden, move the tooltip adjacent to the cursor
            Y.one('#tooltip').setStyle('opacity', '0');
            tooltip.move([(e.pageX + 10), (e.pageY + 20)]);
        }
        
        if (waitingToShow === false) {
            // wait half a second, then show tooltip
            setTimeout(function(){
                Y.one('#tooltip').setStyle('opacity', '1');
                tooltip.show();
            }, 500);
        
            // while waiting to show tooltip, don't let other
            // mousemoves try to show tooltip too.
            waitingToShow = true;
            
            tooltip.setStdModContent('body', target_title);

        }
    }
    
    // handler that hides the tooltip
    on_mouseleave_tooltip = function (e) {
        
        // this check prevents hiding the tooltip 
        // when the cursor moves over the tooltip itself
        if ((e.relatedTarget) && (e.relatedTarget.hasClass('yui3-widget-bd') === false)) {
            tooltip.hide();
            waitingToShow = false;            
        }
    }

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
    
    /** tooltip object */
    tooltip = new Y.Overlay({
        srcNode: "#tooltip",
        visible: false,
        zIndex: 9999999999
    })
    
    tooltip.plug(Y.Plugin.WidgetAnim);

    tooltip.anim.get('animHide').set('duration', 0.01);
    
    tooltip.anim.get('animShow').set('duration', 0.3);
    
    tooltip.render();    

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
    
    /** delegate click on book pages thumbnail links */
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
    
    Y.on('button:button-multibook:off', function(e) {
      
      var self = this; 
      
      self.addClass('hidden');
      
    }, Y.one('#multivolbooks'));
    
    Y.on('button:button-multibook:on', function(e) {
    	
        var self = this 
          , current_target = e.currentTarget
          , data_target = current_target.get('href');
          
        Y.io(data_target, { 
            on: {
                complete: function(id, e) {
            	
                    self.one('.multivolbooks-container').set('innerHTML', e.response);
                    
                    self.removeClass('hidden');

                } 
            }
        });   
      
      
    }, Y.one('#multivolbooks'));

    Y.on('button:button-thumbnails:on', function(e) {

        var current_book_page = Y.one('#slider_value').get('value')
        
          , pane = Y.one('.view-book-thumbnails')

            /** maximum width of each column */
          , columns_max_width = 150

            /** minimum width of each column */
          , columns_min_width = 70

            /** columns per pager page; the weird looking math is a fancy/faster way to achieve Math.floor() */
          , pager_count = (book.viewport.width / columns_max_width)|0

            /** given the client viewport try to calculate the "optimal" width of each column */
          , columns_width = (book.viewport.width/pager_count)|0 - 10 * pager_count

            /** thumbnail page  */
          , book_thumbnails_page = Math.ceil(current_book_page / pager_count) - 1;
          
        /** @TODO: this is ugly and syntactically uglier because we need a better solution */
        if (columns_width > columns_max_width || columns_width < columns_min_width ) ( ( columns_width = columns_max_width ) && ( pager_count = pager_count - 1 ) );

        this.removeClass('hidden');
        
        if (!pane || pane && (current_book_page / pager_count) > 1) {
            Y.io.queue(Y.DLTS.settings.book.path + '/pages?page=' + book_thumbnails_page + '&pager_count=' + pager_count);
        }

    }, Y.one('.pane.thumbnails'));

    // Subscribe to "io.success" for thumbnails page requests.
    
    Y.on('io:success', function (id, response) {
    	
        var node, current_book_page;
           
         /** current book page */
         current_book_page = Y.one('#slider_value').get('value');

         this.one('.thumbnails-container').set('innerHTML', response.response);

         node = this.one('.sequence-number-' + current_book_page);
            
         if (node) {
             node.addClass('active');
         }
    }, Y.one('.pane.thumbnails'));

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
        location.href = location.href.replace(/\/$/, '') + '/edit';
    }, '.node-type-dlts-book-page', '.tabs li.edit a');

    Y.delegate('click', function(e) {
        e.halt();
        location.href = location.href.replace(/\/$/, '');
    }, '.node-type-dlts-book-page', '.tabs li.view a');
    
    Y.delegate('click', function(e) {

        e.halt();
        
        var current_target = e.currentTarget
          , data_target = current_target.getAttribute('data-url');
          
        location.href = data_target;
        
    }, 'body', '.multivolbooks .node-dlts-multivol-book');
    
    Y.delegate('change', on_toggle_language, 'body', '.language', pane_pagemeta);
    
    // https://yuilibrary.com/yui/docs/overlay/overlay-tooltip.html

    Y.delegate('mousemove', on_mousemove_tooltip, 'body', '.multivolbooks .node-dlts-multivol-book');
    
    Y.delegate('mouseleave', on_mouseleave_tooltip, 'body', '.multivolbooks .node-dlts-multivol-book');

    if (pane_tooltip) {
        pane_tooltip.on('mouseleave', on_mouseleave_tooltip);
    }

});