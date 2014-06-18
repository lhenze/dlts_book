<div class="node pjax" data-identifier="<?php print $identifier ?>" data-sequence-count="<?php print $sequence_count ?>" data-sequence="<?php print $book_page_sequence_number ?>" data-title="<?php print $book_title ?>">
<?php

  if (isset($button_prevpage)) {
	print $button_prevpage;
  }
  
  // print content  
  print render($content);
  
  // if next page
  if (isset($button_nextpage)) {
	print $$button_nextpage;
  }
  
  // if toggle between 1 or 2 pages view
  if (isset($button_togglepage)) {
	print $$button_togglepage;
  }  

?>
</div>