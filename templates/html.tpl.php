<!DOCTYPE html>
<html dir="<?php print $language->dir; ?>" class="<?php print $classes; ?>">
<head>
  <?php print $head; ?>
  <title><?php print $head_title; ?></title>
  <?php print $styles; ?>  
  <?php print $scripts; ?>
  <?php print $script; ?>  
</head>
<body id="pane-body" class="pane-body" <?php print $attributes;?>>
  <div id="skip-link"><a href="#page" class="element-invisible element-focusable"><?php print t('Skip to main content'); ?></a></div>
  <?php print $page_top; ?>
  <?php print $page; ?>
  <?php print $page_bottom; ?>
</body>
</html>