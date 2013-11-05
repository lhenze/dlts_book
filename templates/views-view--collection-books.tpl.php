<div class="<?php print $classes; ?>">
  <?php if ($header): ?>
    <div class="view-header">
      <?php if ($title): ?>
        <?php print render($title_prefix); ?>
        <?php print $title; ?>
        <?php print render($title_suffix); ?>    
      <?php endif; ?>
      <?php print $header; ?>
    </div>
  <?php endif; ?>
  <?php if ($rows): ?>
    <div class="view-content">
      <?php print $rows; ?>
    </div>
  <?php elseif ($empty): ?>
    <div class="view-empty">
      <?php print $empty; ?>
    </div>
  <?php endif; ?>
  <?php if ($pager): ?>
    <?php print $pager; ?>
  <?php endif; ?>
  <?php if ($footer): ?>
    <div class="view-footer">
      <?php print $footer; ?>
    </div>
  <?php endif; ?>
</div><?php /* class view */ ?>