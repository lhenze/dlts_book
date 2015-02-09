/* jshint laxcomma: true */
Y.use(
  'node', 'node-scroll-info', 'io-queue', 'gallery-idletimer',
  function(Y) {

    'use strict';

    var body = Y.one('body'),
      pager = Y.one('ul.pager'),
      fold = 200,
      requestURI = 'collection-items?page=',
      transactions = [];

    function onStart(id, response, args) {
      body.addClass('io-loading');
      Y.one('.view .item-list .pager-current').set('text', 'loading more');
    }

    function onSuccess(id, response, transaction) {

      var pager, next;

      body.removeClass('io-loading');

      transaction.push(response.getResponseHeader('uri'));

      Y.one('.view .item-list').remove(true);

      Y.one('.page').append(response.response);

      next = Y.one('.view .item-list .pager-next a');

      if (!next) {
        Y.one('.view .item-list').remove(true);
      }
    }

    function onScroll(e) {
      var next = Y.one('.pager-next a'),
        page, href;
      if (next) {
        href = next.get('href');
        if (Y.Array.indexOf(transactions, href) < 0 && !body.hasClass('io-loading')) {
          if (
            body.scrollInfo.getScrollInfo().atBottom ||
            (Y.IdleTimer.isIdle() && pager.get('region').top - fold < body.get('winHeight'))
          ) {
            page = unescape(href.replace(new RegExp("^(?:.*[&\\?]" + escape('page').replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
            Y.io.queue(requestURI + page);
          }
        }
      }
    }

    function viewMode(e) {

      e.preventDefault();

      var currentTarget = e.currentTarget,
        items_body = Y.one('body'),
        add_grid_klass = 'list_view',
        remove_grid_klass = 'grid_view',
        list_view = currentTarget.hasClass('list');

      if (!list_view) {
        add_grid_klass = 'grid_view';
        remove_grid_klass = 'list_view';
      }

      items_body.removeClass(remove_grid_klass);
      items_body.addClass(add_grid_klass);

    }

    function onClick(e) {
      e.preventDefault();
      onScroll();
    }

    Y.IdleTimer.subscribe('idle', onScroll);

    // be opportunistic
    Y.IdleTimer.start(5000);

    // Set a X-PJAX HTTP header.
    Y.io.header('X-PJAX', 'true');

    // Plug ScrollInfo 
    body.plug(Y.Plugin.ScrollInfo, {
      scrollMargin: fold
    });

    // Stop the queue so transactions can be stored.
    Y.io.queue.stop();

    // Subscribe to "io.success".
    Y.on('io:success', onSuccess, Y, transactions);

    // Subscribe to "io:start".
    Y.on('io:start', onStart, Y, transactions);

    body.scrollInfo.on({
      scroll: onScroll
    });

    // Re-start the queue.
    Y.io.queue.start();

    Y.on('available', function() {
      if (this.get('region').top - fold < body.get('winHeight')) {
        onScroll();
      }
    }, 'ul.pager');

    body.delegate('click', viewMode, 'a.btn.grid, a.btn.list');

    body.delegate('click', onClick, '.pager-next a');
  }
);