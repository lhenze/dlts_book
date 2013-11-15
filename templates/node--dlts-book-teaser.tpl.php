<?php
    hide($content['comments']);
    hide($content['links']);
?>
<div class="<?php print $classes ?> views-g"<?php print $attributes ?>>
  <div <?php print $content_attributes ?>>
    <div class="views-u">
      <a href="<?php print $book_first_page ?>"><?php print $representative_image ?></a>
    </div>
    <div class="views-u">
      <h2 class="title"><a href="<?php print $book_first_page ?>"><?php print $book_title ?></a></h2>
      <?php print render($content) ?>
      <a class="btn" href="<?php print $book_first_page ?>"><?php print t('Read') ?></a>
    </div>
  </div>
</div>