<?php

/**
 * @file
 * Display Suite 1 column template.
 */
?>
<<?php print $ds_content_wrapper; print $layout_attributes; ?> class="ds-1col <?php print $classes;?> clearfix" dir="<?php print $lang_dir ?>" data-dir="<?php print $lang_dir ?>" data-lang="<?php print $lang_language ?>" >
  <?php if (isset($lang_options)) : ?><div class="lang-options"><?php print locale('Available languages', NULL, $lang_language) ?>: <?php print render($lang_options) ; ?></div><?php endif; ?>
    <?php if (isset($select_multivolbook)) : ?>
   			<?php print $select_multivolbook; ?>
  	<?php print $ds_content; ?>
 
  <?php endif; ?>
</<?php print $ds_content_wrapper ?>>
<?php if (!empty($drupal_render_children)): ?>
  <?php print $drupal_render_children ?>
<?php endif; ?>