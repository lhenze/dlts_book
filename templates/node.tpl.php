<div id="node-<?php print $node->nid; ?>" class="<?php print $classes; ?> clearfix"<?php print $attributes; ?>>
  <?php if (!$page && isset($title)) : ?>
  	<?php print render($title_prefix); ?>
    <h2<?php print $title_attributes; ?>><a href="<?php print $node_url; ?>"><?php print $title; ?></a></h2>
    <?php print render($title_suffix); ?>
  <?php endif; ?>
  <div class="content"<?php print $content_attributes; ?>>
    <?php print render($content); ?>
  </div>
</div>