<?php hide($content['link']); ?>
<div dir="<?php print $lang_dir ?>" data-dir="<?php print $lang_dir ?>" data-lang="<?php print $lang_language ?>" class="<?php print $classes; ?> clearfix"<?php print $attributes; ?>>
  <?php if (isset($lang_options)) : ?><?php print t('Available languages:') ?> <?php print render($lang_options) ; ?>	<?php endif; ?>
  <?php print render($content); ?>
</div>