<div class="<?php print $classes; ?>">
  <?php if ($rows): ?>
    <div class="view-content"><?php print $rows; ?></div>
  <?php elseif ($empty): ?>
    <div class="view-empty"><?php print $empty; ?></div>
  <?php endif; ?>
  <?php if ($pager): ?><?php print $pager; ?><?php endif; ?>
</div>