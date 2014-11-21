<!-- this template replaced by ds-1col\-\-node-dlts-book-metadata.tpl.php  | LMH 11/21/14 -->
<div dir="<?php print $lang_dir ?>" data-dir="<?php print $lang_dir ?>" data-lang="<?php print $lang_language ?>" class="<?php print $classes; ?> clearfix"<?php print $attributes; ?>>

  <?php if (isset($lang_options)) : ?><div class="lang-options"><?php print locale('Available languages', NULL, $lang_language) ?>: <?php print render($lang_options) ; ?></div><?php endif; ?>

  <?php  print render($content); ?>

   <?php if (isset($select_multivolbook)) : ?>
    <div class="field field-name-field-title field-type-text field-label-inline clearfix">
      <?php print $select_multivolbook; ?>
    </div>
  <?php endif; ?>

   <?php if (isset($series)) : ?>
      <?php print $series; ?>
  <?php endif; ?>

</div>


