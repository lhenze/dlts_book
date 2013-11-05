<div class="<?php print $classes; ?> clearfix"<?php print $attributes; ?>>
  <?php if (!$label_hidden) : ?>  
    <div class="field-label"<?php print $title_attributes; ?>><?php print $label ?>:&nbsp;</div>
  <?php endif; ?>
  <div class="field-items"<?php print $content_attributes; ?>>
		<div class="field-item">
    	<?php foreach ($items as $delta => $item) : ?>
    	<?php print render($item); ?><?php if ($delta != count($items) - 1 ) :?>, <?php endif; ?>
    	<?php endforeach; ?>
		</div>
  </div>
</div>
