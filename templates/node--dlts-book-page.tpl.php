<?php if ($page) : ?>
  <div class="tooltip"></div>
  <div id="navbar" class="pane navbar">
    <?php if ($button_togglepage || $button_thumbnails || $button_fullscreen || $button_metadata || $button_multibook) : ?>
      <ul class="navbar navbar-left">
        <?php if (isset( $button_metadata)) : print $button_metadata; endif; ?>
        <?php if (isset( $button_fullscreen)) : print $button_fullscreen; endif; ?>
        <?php if (isset( $button_togglepage)) : print $button_togglepage; endif; ?>
        <?php if (isset( $button_thumbnails)) : print $button_thumbnails; endif; ?>
        <?php if (isset( $button_multibook)) : print $button_multibook; endif; ?>
      </ul>
    <?php endif; ?>
    <div class="navbar navbar-spacer navbar-spacer-1"></div>
    <div class="navbar navbar-middle">
      <?php if ($control_panel): ?>
        <?php print $control_panel; ?>
      <?php endif; ?>
    </div>
    <div class="navbar navbar-spacer navbar-spacer-2"></div>
    <ul class="navbar navbar-right">
      <?php if (isset($prevpage)) : print '<li class="navbar-item">' . $prevpage . '</li>'; endif; ?>      
      <?php if (isset($nextpage)) : print '<li class="navbar-item">' . $nextpage . '</li>'; endif; ?>
      <?php if (isset($button_language)) : print $button_language; endif; ?>
      <?php if (isset($button_search)) : print $button_search; endif; ?>      
    </ul>
  </div>
  
  <div id="main" class="pane main" dir="<?php print $lang_dir ?>">
    <div id="pagemeta" class="pane pagemeta">
      <?php if (isset($metadata)) : print render($metadata); endif; ?>
    </div>
    <div id="display" class="pane display">
      <?php if ( isset( $prevpage ) ) : print $prevpage; endif; ?>
      <?php print render($content); ?>
      <?php if ( isset( $nextpage ) ) : print $nextpage; endif; ?>    
    </div>
    <?php if (isset($search_box)) : ?><div id="options" class="pane-options"><?php print $search_box; ?></div><?php endif; ?>
    <div class="pane load loading"><?php if (isset($loading)) : print $loading; endif; ?></div>
  </div>
  
  <div dir="<?php print $read_order ?>" id="pager" class="pane pager">
    <?php if (isset($slider)) : print $slider; endif; ?>
  </div>
  
  <?php if (isset($thumbnails)) : print $thumbnails; endif; ?>
  <?php if (isset($multivolbooks)) : print $multivolbooks; endif; ?>  	

  <?php if (isset($thumbnails) || isset($multivolbooks)) : ?>  	
    <div id="tooltip"></div>
  <?php endif; ?>
  	
<?php endif; ?>