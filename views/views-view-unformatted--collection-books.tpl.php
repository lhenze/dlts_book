<?php foreach ($rows as $id => $row) : ?>
  <?php if ($id%6 == 0) { ?><div class="views-g-r"><?php } ?>
    <div<?php if ($classes_array[$id]) { print ' class="views-u-1-6"';  } ?>><?php print $row; ?></div>
  <?php if ($id%6 == 5) { ?></div><?php } ?>
<?php endforeach; ?>