Y.applyConfig({
    modules: {
        'template-micro' : {
            fullpath: Y.DLTS.settings.book.theme_path + 'js/modules/template-micro.js'
        }
    }
});

Y.use('node', 'event-delegate', 'template-micro', 'escape', function (Y) {
    'use strict';
    
    var settings, search, search_success, datasource_conf, compiled_found, compiled_no_found, compiled_result;
    
    settings = Y.DLTS.settings;
    
    search = Y.one('.pane-search');
    
	/** Compile templates */
	compiled_found = Y.Template.Micro.compile(settings.search.messages.found);

	compiled_result = Y.Template.Micro.compile(settings.search.templates.result);
	
	compiled_no_found = Y.Template.Micro.compile(settings.search.messages.no_found);
    
    /** Search success callback */
    search_success = function(datasource) {
        var pane_results, height, message;

        pane_results = Y.one('.pane.results-area');

		/** Clear the result pane */
		pane_results.empty();

		/** Results */
		if (datasource.numFound > 0) {

			/** available height */
			height = Y.one('.pane.main').get('offsetHeight') - (Y.one('#top').get('offsetHeight') + Y.one('.pane.navbar').get('offsetHeight') + Y.one('.pane.pager').get('offsetHeight') + Y.one('.pane.search form').get('offsetHeight'));

			/** set the height at the container and so that we can hide overflow at this level */
			Y.one('.pane.search-container').setStyle('height', height);

			/** append number of found message to search results pane */
			pane_results.append(compiled_found({message: datasource.numFound}));

		    /** iterate results and append new content */
		    Y.Array.each(datasource.data, function(result) { pane_results.append(compiled_result(result)) });
		}

		/** No results */
		else {
			/** append no found message to search results pane */
			pane_results.append(compiled_no_found({}));
		}

	};
	
    /** datasource configuration object */ 
    datasource_conf = {
    	id: 'search',
        source: settings.basePath + 'books/' + settings.search.pages,
       	plugins: {
       	    cache: {
       	        sandbox: 'search-' + settings.book.identifier,
       	        cache: Y.CacheOffline,
       	        expires: 21600000            
       	    },
       	    json: {
       	        schema: {
        	        resultListLocator: 'results.docs',
        		    resultFields: ['link', 'snippet', 'entity_id', 'its_field_sequence_number']
        	    }
            }
        }
    };
    
    /** create a new datasource instance */
    Y.fire('datasource:new', datasource_conf);
    
    /** delegate on click event for the search results */
    search.delegate('click', function(e) {
    	e.referenceTarget = this;
    	Y.fire('pjax:change', e);
    }, 'div.book-pane-options-search-result');
    
    /** delegate search */
    search.delegate('submit', function(e) {
        e.preventDefault();
        var currentTarget = e.currentTarget,
	        query = currentTarget.one('.form-text');

        Y.fire('datasource:request', {
            id: 'search',
            request: '/' + query.get('value') + '?fl=its_field_sequence_number',
            callback: search_success
        });
	}, 'form');
	
	/** search button "on" event */
    Y.on('button:button-search:on', function() {
        this.removeClass('hidden');
        this.ancestor('html').removeClass('search-hidden');
    }, search);
    
    /** search button "off" event */
    Y.on('button:button-search:off', function() {
        this.addClass('hidden');
        this.ancestor('html').addClass('search-hidden');
    }, search);
    
    /** If the page was requested with search terms, fire a datasource request and append the new content to the search pane */
    if (settings.search.searchTerms) {
	    Y.fire('datasource:request', {
            id: 'search',
            request: '/' + settings.search.searchTerms + '?fl=its_field_sequence_number',
            callback: search_success
        });
	    Y.fire('button:button-search:on');
    }    
    
});