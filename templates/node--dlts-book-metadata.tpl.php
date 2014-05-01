<div dir="<?php print $lang_dir ?>" data-dir="<?php print $lang_dir ?>" data-lang="<?php print $lang_language ?>" class="<?php print $classes; ?> clearfix"<?php print $attributes; ?>>
  <?php if (isset($lang_options)) : ?><?php print t('Available languages:') ?> <?php print render($lang_options) ; ?><?php endif; ?>
  <?php print render($content); ?>
  <?php if (isset($select_multivolbook)) : ?>
    <div class="field field-name-field-title field-type-text field-label-inline clearfix">
      <div class="field-label"><?php print t('Related titles') ?>:</div><?php print $select_multivolbook; ?>
    </div>
  <?php endif; ?>  
</div>