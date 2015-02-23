/* jshint laxcomma: true, laxbreak: true, unused: false */
Y.use(
  'node', 'event', 'event-custom', 'transition', 'slider', 'pjax', 'gallery-soon', 'widget-anim', 'overlay', 'io-queue',
  function(Y) {

    'use strict';

    /** definition list start */
    var

    /** nodes */
      slider_datasource = Y.one('#slider_value'),
      pane_pagemeta = Y.one('.pane.pagemeta'),
      pane_top = Y.one('#top')

    /** widgets */
    , slider
    // , tooltip

    /* utilities */

    /** Pjax object to request new book pages; the content from successful requests will be appended to "display" pane */
    , pjax = new Y.Pjax({
      container: '.pane.display'
    })

    /** callbacks */
    , showHideTitleBar, resizePageMeta, slide_value_change, pager_form, on_button_click, slide_end, change_page, pjax_navigate, pjax_callback, pjax_load, on_toggle_language, on_toggle_multivol

    /** book global settings; the object that represent the current book and settings */
    , book = Y.DLTS.settings.book

    ; /** definition list end */

    /** set a X-PJAX HTTP header for all IO requests */
    Y.io.header('X-PJAX', 'true');

    /** add view port information to global setting */
    book.viewport = Y.DOM.viewportRegion();
    showHideTitleBar = function() {
      /* Title bar is hidden by default using an inline style (to prevent flash of unstyled content)
      When the book is loaded outside of any site context, the titlebar is returned ... otherwise not. */
      var nodeTitleBar = Y.one('#titlebar');
      if (window.self === window.top) {
        // Y.log("This is not in an iframe"); 
        nodeTitleBar.removeAttribute('style');
      } else {
        // Y.log("This IS in an iframe");
        nodeTitleBar.remove(true);
      }
    };

    resizePageMeta = function() {

      /** definition list start */
      var viewportHeight = this.get('winHeight'),
        adminBarHeight = 0,
        topHeight = Y.one('#top').get('offsetHeight'),
        navbarHeight = Y.one('#navbar').get('offsetHeight'),
        pageHeight = Y.one('#pager').get('offsetHeight'),
        nodeAdminMenu = Y.one('#admin-menu'),
        sidebarHeight

      ; /** definition list end */

      if (nodeAdminMenu) {
        adminBarHeight = Y.one('#toolbar').get('offsetHeight') + nodeAdminMenu.get('offsetHeight') + Y.one('.tabs').get('offsetHeight') + 10;
      }

      sidebarHeight = viewportHeight - (adminBarHeight + topHeight + navbarHeight + pageHeight);

      Y.one('#pagemeta').setStyles({
        'height': sidebarHeight
      });

    };

    on_toggle_language = function(e) {

      var current_target = e.currentTarget,
        data_target = current_target.get('value');

      e.preventDefault();

      Y.io(data_target, {

        on: {

          complete: function(id, e) {

            var node = Y.one('#pagemeta'),
              dir;

            node.set('innerHTML', e.response);

            dir = node.one('.node-dlts-book').getAttribute('data-dir');

            Y.one('.pane.main').set('dir', dir);

            Y.one('.titlebar').set('dir', dir);

            Y.one('#page-title').set('innerHTML', node.one('.field-name-field-title .field-item').get('text'));

          }
        }

      });

    };

    on_toggle_multivol = function(e) {

      var current_target = e.currentTarget,
        data_target = current_target.get('value'),
        url_array = data_target.split('::');

      e.preventDefault();

      if (url_array[1]) {
        location.href = url_array[1];
      } else {
        location.href = data_target;
      }
      return false;
    };

    on_button_click = function(e) {

      e.preventDefault();

      var self = this,
        current_target = e.currentTarget,
        event_prefix, event_id, node_target, data_target;

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
      } else {
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

      var value = this.get('value'),
        current = parseInt(book.sequence_number, 10),
        path = book.path + '/',
        css_class;

      if (value.match(/\D/)) {
        css_class = 'error';
      } else {
        value = parseInt(value, 10);

        if (value !== current && (value > 0 && value <= book.sequence_count)) {
          css_class = 'ok';
          pjax.navigate(path + value);
        } else {
          if (value !== current) {
            css_class = 'error';
          } else {
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

      var slider = this.slider,
        datasource = this.datasource;

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

      var slider = this,
        url = book.path + '/' + e.target.getValue();

      if (!Y.Lang.isValue(slider.triggerBy)) {

        pjax.navigate(url);

        /** slider set focus to the slider rail, blur as soon as possible so that user can use the keyboard to read the book */
        Y.soon(function() {
          slider.thumb.blur();
        });

      }

      /** event was triggered by reference */
      else {
        slider.triggerBy = undefined;
      }
    };

    change_page = function(config) {

      var map, service, zoom, open_layers_dlts = OpenLayers.DLTS;

      if (Y.Lang.isObject(open_layers_dlts.pages[0], true)) {
        map = open_layers_dlts.pages[0];
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
      } else if (/(^[\d]+-[\d]+$){1}/.test(msg)) {
        this.one('.current_page').set('text', msg);
      } else {
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

      var config, node = e.content.node,
        map = node.one('.dlts_image_map');

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

    /** slider object */
    slider = new Y.Slider({
      axis: 'x',
      min: 1,
      dir: Y.DLTS.settings.book.dir,
      clickableRail: false,
      max: parseInt(book.sequence_count, 10),
      value: parseInt(book.sequence_number, 10),
      length: (book.viewport.width - 150) + 'px'
    });

    /** render the slider and plug-ins */

    slider.render('#slider');

    /** events listeners */

    Y.on('domready', showHideTitleBar, '#pagemeta');
    
    Y.on('contentready', resizePageMeta, '#pagemeta');

    Y.on('windowresize', resizePageMeta, '#pagemeta');

    slider.after('valueChange', slide_value_change, {
      datasource: slider_datasource,
      slider: slider
    });

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

    // remove content
    function onThumbnailsPageComplete(id, response, args) {
      Y.one('.thumbnails-container').empty();
    }

    // add loading effect
    function onThumbnailsPageStart(e) {
      Y.one('.thumbnails-container').addClass('io-loading');
    }

    // remove loading effect        
    function onThumbnailsPageEnd(e) {
      Y.one('.thumbnails-container').removeClass('io-loading');
    }

    function onThumbnailsPageSuccess(id, response, args) {
      Y.one('.thumbnails-container').set('innerHTML', response.response);
    }

    function onThumbnailsPageFailure(e) {
      Y.log('failure');
    }

    Y.one('body').delegate('click', function(e) {

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

      /** request new page */
      Y.io(url, {
        on: {
          start: onThumbnailsPageStart,
          end: onThumbnailsPageEnd,
          complete: onThumbnailsPageComplete,
          success: onThumbnailsPageSuccess,
          failure: onThumbnailsPageFailure
        }
      });

    }, '#thumbnails .pager a');

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
      this.button.blur();
      this.top.removeClass('hidden');
    }, {
      top: pane_top,
      button: Y.one('a.fullscreen')
    });

    Y.on('openlayers:change', function(config) {

      var sequence = config.sequence,
        slider = this.slider,
        datasource = this.datasource;

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

      var self = this,
        current_target = e.currentTarget,
        data_target = current_target.get('href');

      if (self.hasClass('rendered')) {
        self.removeClass('hidden');
      } else {
        Y.io(data_target, {
          on: {
            complete: function(id, e) {

              self.addClass('rendered');

              self.one('.multivolbooks-container').set('innerHTML', e.response);

              self.removeClass('hidden');

            }
          }
        });
      }

    }, Y.one('#multivolbooks'));

    Y.on('button:button-thumbnails:on', function(e) {

      var current_book_page = Y.one('#slider_value').get('value'),
        pane = Y.one('.view-book-thumbnails'),
        pager_count = 10
        /** thumbnail page  */
        ,
        book_thumbnails_page = Math.ceil(current_book_page / pager_count) - 1
        /** View URL */
        ,
        target = Y.DLTS.settings.book.path + '/pages?page=' + book_thumbnails_page + '&pager_count=' + pager_count;

      this.removeClass('hidden');

      if (!pane || pane && (current_book_page / pager_count) > 1) {

        // Y.io.queue(url);

        Y.io(target, {
          on: {
            complete: onThumbnailsOnSuccess
          }
        });
      }

    }, Y.one('.pane.thumbnails'));

    // Subscribe to "io.success" for thumbnails page requests.

    function onThumbnailsOnSuccess(id, response) {
      var node, current_book_page, block;

      /** current book page */
      node = Y.one('.pane.thumbnails');

      /** current book page */
      current_book_page = Y.one('#slider_value').get('value');

      node.one('.thumbnails-container').set('innerHTML', response.response);

      block = node.one('.sequence-number-' + current_book_page);

      if (node) {
        node.addClass('active');
      }
    }

    Y.on('button:button-thumbnails:off', function(e) {
      this.addClass('hidden');
    }, Y.one('.pane.thumbnails'));

    function openLayersTilesLoading ( ) {
      if ( Y.one('body').hasClass( 'openlayers-loading' ) ) Y.later( 500, Y.one('.pane.load'), openLayersTilesLoading );
      else Y.one('.pane.load').hide();
    }

    Y.once('contentready', openLayersTilesLoading, '.dlts_image_map');

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

      var current_target = e.currentTarget,
        data_target = current_target.getAttribute('data-url');

      location.href = data_target;

    }, 'body', '.multivolbooks .multibook-item');

    Y.delegate('change', on_toggle_language, 'body', '.language', pane_pagemeta);

    Y.delegate('change', on_toggle_multivol, 'body', '.ctools-jump-menu-select', pane_pagemeta);

  });
