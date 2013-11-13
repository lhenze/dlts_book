<?php if ($page) : ?>
  <div class="tooltip"></div>
  <div id="navbar" class="pane navbar">
    <?php if ($button_togglepage || $button_thumbnails || $button_fullscreen || $button_metadata): ?>
      <ul class="navbar navbar-left">
        <?php if (isset( $button_metadata)) : print $button_metadata; endif; ?>
        <?php if (isset( $button_fullscreen)) : print $button_fullscreen; endif; ?>
        <?php if (isset( $button_togglepage)) : print $button_togglepage; endif; ?>        
        <?php if (isset( $button_thumbnails)) : print $button_thumbnails; endif; ?>
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
      <?php if (isset( $prevpage)) : print '<li class="navbar-item">' . $prevpage . '</li>'; endif; ?>      
      <?php if (isset( $nextpage)) : print '<li class="navbar-item">' . $nextpage . '</li>'; endif; ?>
      <?php if (isset($button_annotations)) : print $button_annotations; endif; ?>
      <?php if (isset($button_search)) : print $button_search; endif; ?>
    </ul>
  </div>
  <div id="main" class="pane main">
    <div id="pagemeta" class="pane pagemeta"><?php if (isset($book_nid)) : print views_embed_view('book_description', 'block', $book_nid); endif; ?></div>
    <div id="display" class="pane display">
      <?php if ( isset( $prevpage ) ) : print $prevpage; endif; ?>
      <?php print render($content); ?>
      <?php if ( isset( $nextpage ) ) : print $nextpage; endif; ?>    
    </div>
    <?php if (isset($search_box)) : ?> 
      <div id="options" class="pane-options">
        <?php if ( isset($search_box) ): ?>
          <?php print $search_box; ?>
        <?php endif; ?>
      </div>
    <?php endif; ?>
    <div class="pane load loading">
      <div id="squaresWaveG">
        <span id="squaresWaveG_1" class="squaresWaveG"></span>
        <span id="squaresWaveG_2" class="squaresWaveG"></span>
        <span id="squaresWaveG_3" class="squaresWaveG"></span>
        <span id="squaresWaveG_4" class="squaresWaveG"></span>
        <span id="squaresWaveG_5" class="squaresWaveG"></span>
        <span id="squaresWaveG_6" class="squaresWaveG"></span>
        <span id="squaresWaveG_7" class="squaresWaveG"></span>
        <span id="squaresWaveG_8" class="squaresWaveG"></span>
      </div>
      <p><?php print t('Loading Page') ?> <span class="current_page"><?php print $book_page_sequence_number ?></span></p>
    </div>
  </div>
  <div id="pager" class="pane pager">
    <?php if (isset($slider)) : print $slider; endif; ?>
  </div>
  <?php if (isset($thumbnails)) : print $thumbnails; endif; ?>
<?php endif; ?>