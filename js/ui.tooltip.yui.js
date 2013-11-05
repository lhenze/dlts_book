Y.use('overlay', 'event', 'event-delegate', 'widget-anim', function (Y) {
	'use strict';
	
	// http://yuilibrary.com/yui/docs/overlay/overlay-tooltip.html
	
    var waitingToShow = false;
        
    var tooltip = new Y.Overlay({
        srcNode: ".tooltip",
        visible: false
    }).plug(Y.Plugin.WidgetAnim);
    
    tooltip.anim.get('animHide').set('duration', 0.01);
    tooltip.anim.get('animShow').set('duration', 0.3);
    tooltip.render();

    // handler that positions and shows the tooltip 
    var onMousemove = function (e) {
        var i, currentTarget, text;
        
        currentTarget = e.currentTarget;
        
        if (tooltip.get('visible') === false) {
            // while it's still hidden, move the tooltip adjacent to the cursor
            Y.one('.tooltip').setStyle('opacity', '0');
            tooltip.move([(e.pageX + 10), (e.pageY + 20)]);
        }
        
        if (waitingToShow === false) {
            // wait half a second, then show tooltip
            setTimeout(function(){
                Y.one('.tooltip').setStyle('opacity', '1');
                tooltip.show();
            }, 500);
            
            // while waiting to show tooltip, don't let other
            // mousemoves try to show tooltip too.
            waitingToShow = true;
            
            text = currentTarget.getAttribute('data-title');
            
            if (text) {
                tooltip.setStdModContent('body', text);	
            }
        }
    }

    // handler that hides the tooltip
    var onMouseleave = function (e) {
        // this check prevents hiding the tooltip when the cursor moves over the tooltip itself
        if ((e.relatedTarget) && (e.relatedTarget.hasClass('yui3-widget-bd') === false)) {
            tooltip.hide();
            waitingToShow = false;            
        }
    }

    Y.delegate('mousemove', onMousemove, '.pane.navbar', 'a, div.navbar-item');
    Y.delegate('mouseleave', onMouseleave, '.pane.navbar', 'a, div.navbar-item');
    
    Y.one('.tooltip').on('mouseleave', onMouseleave);

});