<div class="node pjax" data-type="<?php print $page_type ?>" data-identifier="<?php print $identifier ?>" data-sequence-count="<?php print $sequence_count ?>" data-sequence="<?php print $book_page_sequence_number ?>" data-title="<?php print $page_title ?>">
<?php

  // if preview page
  isset($button_prevpage) ? print $button_prevpage : next;
  
  // print content
  print render($content);
  
  // if next page
  isset($button_nextpage) ? print $button_nextpage : next;
  
  // if toggle between 1 or 2 pages view
  isset($button_togglepage) ? print $button_togglepage : next;

?>
</div>