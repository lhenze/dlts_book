<?php

/** Not meant to be pretty. We know what we want we get it. */
function dlts_book_js_alter(&$javascript) {

  $exclude = array();
  
  $site_path = str_replace('themes/dlts_book', '', drupal_get_path('theme', 'dlts_book'));
  $settings = drupal_array_merge_deep_array($javascript['settings']['data']);
  
  if (!user_access('access administration pages')) {

    $exclude = array(
  
      // inline
      'settings' => FALSE,

      // Core

      'misc/drupal.js' => FALSE,
      'misc/jquery.js' => FALSE,
      'misc/jquery.once.js' => FALSE,
      'misc/form.js' => FALSE,
      'misc/collapse.js' => FALSE,
      'misc/jquery.cookie.js' => FALSE,
      'modules/contextual/contextual.js' => FALSE,
      'modules/toolbar/toolbar.js' => FALSE,

      // Contrib

      $site_path . 'modules/views/js/views-contextual.js' => FALSE,
      $site_path . 'modules/field_group/field_group.js' => FALSE,   

    );
  }
  
  // start looking for a better solution
  if (isset($settings)) {  
    $javascript['init'] = array(
      'group' => JS_THEME,
      'type' => 'inline',
      'every_page' => '',
      'weight' => 5,
      'scope' => 'header',
      'cache' => 1,
      'defer' => FALSE,
      'preprocess' => 1,
      'version' => '',
      'data' => 'var Y = YUI().use(function (Y) { Y.namespace("DLTS"); Y.DLTS.settings = ' . drupal_json_encode($settings) .' });'
    );
  }

  $javascript = array_diff_key($javascript, $exclude);

}

/*
 * Not meant to be pretty. We know what we want we get it.
 * @TODO: Need more work
 */
function dlts_book_css_alter(&$css) {
  if (!user_access('access administration pages')) {
  
  $site_path = str_replace('themes/dlts_book', '', drupal_get_path('theme', 'dlts_book'));
 
  $exclude = array(

    // Core
    
    'misc/vertical-tabs.css' => FALSE,
    'modules/aggregator/aggregator.css' => FALSE,
    'modules/block/block.css' => FALSE,
    'modules/book/book.css' => FALSE,
    'modules/comment/comment.css' => FALSE,
    'modules/dblog/dblog.css' => FALSE,
    'modules/file/file.css' => FALSE,
    'modules/filter/filter.css' => FALSE,
    'modules/forum/forum.css' => FALSE,
    'modules/help/help.css' => FALSE,
    'modules/menu/menu.css' => FALSE,
    'modules/node/node.css' => FALSE,
    'modules/openid/openid.css' => FALSE,
    'modules/poll/poll.css' => FALSE,
    'modules/profile/profile.css' => FALSE,
    'modules/search/search.css' => FALSE,
    'modules/statistics/statistics.css' => FALSE,
    'modules/syslog/syslog.css' => FALSE,
    'modules/system/admin.css' => FALSE,
    'modules/system/maintenance.css' => FALSE,
    'modules/system/system.css' => FALSE,
    'modules/system/system.admin.css' => FALSE,
    'modules/system/system.base.css' => FALSE,
    'modules/system/system.maintenance.css' => FALSE,
    'modules/system/system.menus.css' => FALSE,
    'modules/system/system.messages.css' => FALSE,
    'modules/system/system.theme.css' => FALSE,
    'modules/taxonomy/taxonomy.css' => FALSE,
    'modules/tracker/tracker.css' => FALSE,
    'modules/update/update.css' => FALSE,
    'modules/user/user.css' => FALSE,
    'modules/field/theme/field.css' => FALSE,
  
    // Admin CSS
  
    'modules/contextual/contextual.css' => FALSE,
    'modules/shortcut/shortcut.css' => FALSE,
    'modules/toolbar/toolbar.css' => FALSE,
  
    // Contrib
    
    $site_path . 'modules/views/css/views.css' => FALSE,  
    $site_path . 'modules/ctools/css/ctools.css' => FALSE,
    $site_path . 'modules/field_group/field_group.css' => FALSE,
    $site_path . 'modules/date/date_api/date.css' => FALSE,
  );
  
  $css = array_diff_key($css, $exclude);
  
  }
  
}

/**
 * Add non JavaScript tags to document 
 * See: http://api.drupal.org/api/drupal/includes%21theme.inc/function/template_preprocess_html/7
 */
function dlts_book_process_html(&$vars) {
  if (dlts_utilities_is_pjax()) {
    $vars['theme_hook_suggestions'][] = 'html__pjax';
    return;
  }
  $vars['script'] = dlts_utilities_get_script();
  $vars['classes'] = 'yui3-skin-sam yui-skin-sam pane html ' . (isset($_GET['searchTerms']) ? 'search-visible' : 'search-hidden') . ' ' . $vars['classes'];  
}

/**
 * Breadcrumbs are now togglable in the the theme settings page
 * See: http://api.drupal.org/api/drupal/includes%21theme.inc/function/template_process_page/7 
 */
function dlts_book_process_page(&$vars) {

  if (isset($vars['node'])) {
    $vars['classes_array'][] = $vars['node']->type;
  }
  
  // we need to do something about this, not sure is the right palce to have it or the best way to do this
  if (!dlts_utilities_is_pjax()) {
    $vars['breadcrumb'] = theme_get_setting('dlts_book_toggle_breadcrumb') ? $vars['breadcrumb'] : NULL;
    $search = module_invoke('search', 'block_view', 'search');
    $search['content']['search_block_form']['#attributes']['value'] = '';
    $search['content']['search_block_form']['#attributes']['placeholder'] = t('Find in collection');
    $vars['search'] = $search;
  }
  
}

/** See: http://api.drupal.org/api/drupal/includes%21theme.inc/function/template_process_page/7 */
function dlts_book_preprocess_page(&$vars) {
  
  $browser = dlts_utilities_browser_info();
  
  if (dlts_utilities_is_pjax()) {  
    $vars['theme_hook_suggestions'][] = 'page__pjax__book__page';    
    if (isset($vars['node']) ) {
      /** Fallback to AJAX and hash browsing in IE <= 9 */
  	  if (isset($browser['msie']) && $browser['msie'] < 10 && !isset($_GET['routed'])) {
        drupal_goto(str_replace('1#/' . dlts_utilities_collection() . '/', '', $_GET['pjax']), array('query'=>array('pjax' => 1, 'routed' => 1 )), 301);
      }
      return;
    }  
  }
  
  /** Enable some extra functionality (specifically PJAX) for old IE browsers */
  if (isset($browser['msie']) && $browser['msie'] < 10) {
    drupal_add_js($theme_path . '/js/modules/history.js', array('group' => JS_LIBRARY, 'weight' => -101 ));
  }

  /** Theme path */
  $theme_path = drupal_get_path('theme', 'dlts_book');  
  
  /** Theme absolute-path */
  $absolute_theme_path = url($theme_path . '/', array('absolute' => TRUE));
  
  /** This is something we probably want to have in the setting and make sure is part of the book feature */
  $vars['logo'] = NULL;
  
  /** Add YUI Library from YUI Open CDN; should we add this as a setting in the theme form? */
  drupal_add_js('http://yui.yahooapis.com/3.11.0/build/yui/yui-min.js', 'external', array('group' => JS_LIBRARY, 'weight' => -100 ));

  /** Take a close look and see if we need this. This used to be part of 1.x (aof1 Jul 23, 2013) */ 
  $js_data = array(
    'book' => array(
      'theme_path' => $absolute_theme_path,
      'retrieve' => (isset($_COOKIE['dlts_retrieve_pages']) ? ($_COOKIE['dlts_retrieve_pages'] == $vars['identifier'] ? TRUE : FALSE) : FALSE),
    ),
  );

  drupal_add_js($js_data, 'setting');
  
}

/**
 * See: http://api.drupal.org/api/drupal/modules%21node%21node.module/function/template_preprocess_node/7
 */
function dlts_book_preprocess_node(&$vars) {
	
  /** Include utilities files */
  module_load_include('inc', 'dlts_utilities', 'inc/dlts_utilities.book');

  module_load_include('inc', 'dlts_utilities', 'inc/dlts_utilities.book_page');
  
  /** Theme absolute-path */
  $theme_path = drupal_get_path('theme', 'dlts_book');  

  /** Theme absolute-path */
  $absolute_theme_path = url($theme_path . '/', array('absolute' => TRUE));
  
  switch ($vars['type']) {

    case 'page' :
      
      /** Use node--dlts-book-page.tpl.php for both dlts_book_page and dlts_book_stitched_page contetn types */
      $vars['theme_hook_suggestions'][] = 'node__dlts_page';
      $vars['search'] = module_invoke('search', 'block_view', 'search');
      $vars['browse'] = array( '#markup' => l(t('Browse collection'), 'books', array('attributes' => array('class' => array('browse-collection', 'button', 'link')))) );
      $vars['bobcat'] = array( '#markup' => l(t('BobCat record'), dlts_utilities_collection_bobcat_record(), array('attributes' => array('class' => array('link')))));
      
      /** we need to remove this from here */
      $vars['book_index'] = array('#markup' => l(t('Collection index'), file_create_url(file_build_uri('the_masses_index.pdf')), array('attributes' => array('class' => array('link')))));

      // we need this?
      $js_data = array(
        'book' => array(
          'theme_path' => $absolute_theme_path,
        ),
      );

      drupal_add_js($js_data, 'setting');      
      
      break;

    case 'dlts_book' :
    
      switch ($vars['view_mode']) {
        case 'metadata':
           // Remove Book title from metadata pane
          unset($vars['title']);
          break;
      }    
    
      break;

    case 'dlts_book_page' :
    case 'dlts_book_stitched_page' :
      
      /** Node object */
      $node = $vars['node'];
      
      /** Page title */
      $vars['page_title'] = $node->title;
      
      $vars['page_type'] = ($vars['type'] == 'dlts_book_page') ? 'single' : 'double';
      
      /** Prev page */
      $vars['button_prevpage'] = $node->prevpage;
      
      /** Next page */
      $vars['button_nextpage'] = $node->nextpage;
      
      /** Book page sequence number */
      $vars['book_page_sequence_number'] = dlts_utilities_book_page_get_sequence_number($node);   

      /** Book nid */
      $vars['book_nid'] = dlts_utilities_book_page_get_book_nid($node);
      
      /** Book identifier */
      $vars['identifier'] = dlts_utilities_book_page_get_identifier($node);
      
      /** Load book */
      $book = dlts_utilities_book_page_load_book($node);
	  
	  if (
	    !isset($vars['field_cropped_master']) || 
	    (isset($vars['field_cropped_master']) && empty($vars['field_cropped_master']) )
	  ) {
	  	
        $vars['field_cropped_master'] = array( array(
            'fid' => 3,
            'djakota_width' => 5684,
            'djakota_height' => 4226,
            'djakota_levels' => 6,
            'djakota_dwtLevels' => 0, 
            'djakota_compositingLayerCount' => 0, 
            'width' => 5684,
            'height' => 4226,
            'uid' => 1,
            'filename' => 'fighting.tif',
            'uri' => 'public://fighting.tif',
            'filemime' => 'image/tiff',
            'filesize' => 72086840,
            'status' => 0,
            'timestamp' => 1383597646,
            'uuid' => 'ca361ff7-6645-4a50-a416-ed8ba6a5eee1',
            'rdf_mapping' => array(),
          )
		);
      }
      
      /** Book sequence count */
      $vars['sequence_count'] = $sequence_count = dlts_utilities_book_get_sequence_count($book);
      
      /** Pages in view */
      $pages_in_view = $vars['type'] == 'dlts_book_page' ? 1 : 2;
      
      /** Toggle between Single and Double page button */
      $vars['button_togglepage'] = $node->togglepage;
      
      $vars['thumbnails'] = theme_yui3_thumbnails();

      /** Use node--dlts-book-page.tpl.php for both dlts_book_page and dlts_book_stitched_page contetn types */
      $vars['theme_hook_suggestions'][] = (dlts_utilities_is_pjax()) ? 'node__dlts_book_pjax_page' : 'node__dlts_book_page';
      
      /** Remove tabs from book page and stitched page. This is working? */      
      $vars['tabs'] = theme_get_setting('dlts_book_toggle_page_tabs') ? $vars['tabs'] : NULL;      

      /** Add UI YUI */
      $js_yui_files_conf = array('type' => 'file', 'scope' => 'footer', 'weight' => 5);
      
      drupal_add_js($theme_path . '/js/ui.datasource.yui.js', $js_yui_files_conf);
      drupal_add_js($theme_path . '/js/ui.keyboard.yui.js', $js_yui_files_conf);
      drupal_add_js($theme_path . '/js/ui.components.yui.js', $js_yui_files_conf);
      
      /** Collection type */
      $collection_type = dlts_utilities_collection_type();

      $js_data = array(
        'book' => array(
          'path' => url('books/' . $vars['identifier'], array('absolute' => TRUE )),
          'theme_path' => $absolute_theme_path,
          'identifier' => $vars['identifier'],
          'pages' => array(),
          'sequence_count' => $sequence_count,
          'sequence_number' => $vars['book_page_sequence_number'],
          'pages_in_view' => $pages_in_view,
          'components' => array (),
          'templates' => array(
          	'thumbnail' => theme_micro_thumbnail_sequence(),
          	'thumbnail_sequence' => theme_micro_thumbnail(),
          	'scrollview' => theme_micro_pages_carousel(),
           ),
        ),
      );

      dlts_book_add_search($vars, $js_data);

      drupal_add_js($js_data, 'setting');

      /** Prev page */
      $vars['button_prevpage'] = $node->prevpage;
      
      /** Next page */      
      $vars['button_nextpage'] = $node->nextpage;
      
      /** Metadata button */
      $vars['button_metadata'] = _dlts_book_navbar_item(
        array(
          'title' => t('Metadata'),
          'path' => 'node/' . $node->nid,
          'attributes' => array('data-title' => t('Metadata'), 'class' => array('button', 'metadata', 'on'), 'id' => array('button-metadata')),
          'fragment' => 'metadata',
        )
      );

      /** Fullscreen button */
      $vars['button_fullscreen'] = _dlts_book_navbar_item(
        array(
          'title' => t('Fullscreen'),
          'path' => 'node/' . $node->nid,
          'attributes' => array('data-title' => t('Fullscreen'), 'class' => array('button', 'fullscreen'), 'id' => array('button-fullscreen')),
          'fragment' => 'fullscreen',
        )
      );
      
      /** Thumbnails button */
      $vars['button_thumbnails'] = _dlts_thumbnail_pager($vars);      
      
      /** Zoom in and out buttons */
      $vars['control_panel'] = '
        <div id="control-zoom">
          <div id="control-zoom-in" class="navbar-item" data-title="Zoom in"></div>
          <div id="control-zoom-out" class="navbar-item" data-title="Zoom out"></div>
        </div>';
      
      $vars['pane_metadata_hidden'] = FALSE;
      
      /** YUI! 3 Slider container */
      $vars['slider'] = _dlts_book_slider(array('id' => 'slider', 'sequence_number' => $vars['book_page_sequence_number'], 'sequence_count' => $sequence_count, 'collection_type' => $collection_type));

      break;
  }
}

/*
 * Take control over DLTS Shapes theme function.
 */
function dlts_book_dlts_shapes_ocr_coordinates_openlayers_js($variables) {

  $coord = array();

  if (isset($variables['terms']) && !empty($variables['terms'])) {
    foreach ($variables['terms'] as $term) {
      $coord[] = explode(' ', $term['coordinates']);
    }
  }
  
  $data = array(
    'shapes' => array(
      'ocr' => $coord,
    ),
  );
    
  $options = array(
    'type' => 'setting',
    'scope' => JS_THEME,
  );
  
  if (dlts_utilities_is_pjax()) {
    dlts_utilities_add_script(json_encode($data), array('id' => 'shapes', 'script_type' => 'application/json', 'type' => 'inline', 'scope' => 'header', 'group' => SCRIPT_THEME));
  }
  else {
    drupal_add_js($data, $options);
  }
    
  return;
}

function dlts_book_menu_local_task($variables) {
  
  $link = $variables['element']['#link'];
  $link_text = $link['title'];
  $link_class = strtolower($link_text);

  if (!empty($variables['element']['#active'])) {
    // Add text to indicate active tab for non-visual users.
    $active = '<span class="element-invisible">' . t('(active tab)') . '</span>';

    // If the link does not contain HTML already, check_plain() it now.
    // After we set 'html'=TRUE the link will not be sanitized by l().
    if (empty($link['localized_options']['html'])) {
      $link['title'] = check_plain($link['title']);
    }
	
    $link['localized_options']['html'] = TRUE;
    $link_text = t('!local-task-title!active', array('!local-task-title' => $link['title'], '!active' => $active));
  }

  return '<li class="' . $link_class . (!empty($variables['element']['#active']) ? ' active' : '') . '">' . l($link_text, $link['href'], $link['localized_options']) . "</li>";
  
}

function dlts_book_dlts_image_hires($variables) {
  
  $file = $variables['file'];
  $module_path = drupal_get_path('module', 'dlts_image');
  $fid = 'id-'. $file['fid'];
  $fileUri = file_create_url($file['uri']);
  drupal_add_css($module_path . '/css/dlts_image.css');
 
  /** Add Openlayers to the page */
  drupal_add_js( variable_get( 'dlts_image_openlayers_source', 'sites/all/libraries/openlayers/lib/OpenLayers.js'), array('group' => JS_LIBRARY));

  $openlayers_options = array(
    'service' => variable_get('dlts_image_djatoka_service', ''),
    'imgMetadata' => array(
      'width' => $file['djakota_width'],
      'height' => $file['djakota_height'],
      'levels' => $file['djakota_levels'],
      'dwtLevels' => $file['djakota_dwtLevels'],
      'compositingLayerCount' => $file['djakota_compositingLayerCount']
    ),
  );
  
  $file['zoom'] = 1;
  
  if (isset($file['zoom'])) {
    $openlayers_options['zoom'] = $file['zoom'];
  }

  $js_inline = '(function(O){O.DLTS.Page("'. $fid .'","'.  $fileUri .'",'. json_encode($openlayers_options) .')})(OpenLayers);';

  $js_options = array(
    'group' => JS_DEFAULT,
    'type' => 'inline',
    'every_page' => FALSE,
    'weight' => 5,
    'scope' => 'footer',
    'cache' => TRUE,
    'defer' => TRUE,
  );
  
  drupal_add_js($js_inline, $js_options);

  return '<div id="' . $fid . '" class="dlts_image_map olMap" data-uri="'. $fileUri .'" data-width="'. $file['djakota_width'] .'" data-height="'. $file['djakota_height'] .'" data-levels="'. $file['djakota_levels'] .'" data-dwtLevels="'. $file['djakota_dwtLevels'] .'" data-compositing-layer="'. $file['djakota_compositingLayerCount'] .'"></div>';
  
}

/**
 * See: http://api.drupal.org/api/drupal/modules%21field%21field.module/function/template_preprocess_field/7
 * We might want to move this since this is specific to The Masses
 */
function dlts_book_preprocess_field(&$vars) {
  if ($vars['element']['#field_name'] == 'field_pdf_file') {
    $vars['label'] = t('Download PDF');
    foreach ($vars['items'] as $key => $value) {
      if (isset( $value['#markup'])) {
        preg_match('/\/(.*)\/(.*){1}_(.*).pdf{1}/', $value['#markup'], $matches);
        if ( isset($matches) && isset( $matches[3]) ) {
				  if ( $matches[3] == 'hi' ) {
						$pdf_link_text = t('High-bandwidth');
				  }
				  else {
					  $pdf_link_text = t('Low-bandwidth');
				  }
          $vars['items'][$key]['#markup'] = '<span class="field-item pdf-'. $matches[3] .'">' . l( $pdf_link_text, $value['#markup']) . '</span>';
        }
      }
    }
  }
  if ($vars['element']['#field_name'] == 'field_language_code') {
    // Run the language code through dlts_book_language() to get a human readable language type from IA the language code
    // Label is changed in field--field-language-code--dlts-book.tpl.php
    $vars['items']['0']['#markup'] = dlts_book_language($vars['items']['0']['#markup'] );
  }
}

function _dlts_book_navbar_item($variables = array()) {
  return '<li class="navbar-item">'. l('<span>' . $variables['title'] . '</span>', $variables['path'], array('fragment' => $variables['fragment'], 'attributes' => $variables['attributes'], 'html' => TRUE)) . '</li>';
}

function _dlts_book_slider($variables = array( 'id' => NULL, 'sequence_number' => 0, 'sequence_count' => 0 )) {
  return '<div class="tooltip"></div><span id="'. $variables['id'] . '"></span><form><input id="slider_value" value="' . $variables['sequence_number'] . '"/></form></span> <span>/</span> <span class="sequence_count">' . $variables['sequence_count'] . '</span>';
}

function _dlts_thumbnail_pager($vars) {
  if ( ($vars['type'] == 'dlts_book_page') || ($vars['type'] == 'dlts_book_stitched_page') )  {
    $thumbnails_path = '';
    $thumbs_num = 16;
    $pagenid = $vars['node']->nid;

		$book_id = field_get_items('node', $vars['node'], 'field_is_part_of');
    $thumbnails_path = 'books/' . $book_id[0]['value'] . '/pages';

    if ($vars['type'] == 'dlts_book_page') {
      $page_num = $vars['book_page_sequence_number'];
    }
    else {
      $field_sequence_number  = field_get_items('node', $vars['node'], 'field_sequence_number_left');
      $page_num = $field_sequence_number[0]['value'];    
    }

    // 24 = count of items per view; -1 = pa
    $pager_count = (ceil((int)$page_num / $thumbs_num) - 1);

    return '<li class="navbar-item">' . l( '<span>' . t('Thumbnails View') . '</span>', $thumbnails_path, array('query' => array('page' => $pager_count, 'pnid' => $pagenid ), 'attributes' => array('title' => t('Thumbnails'), 'id' => 'button-thumbnails', 'class' => array('button', 'thumbnails')), 'html' => TRUE)) . '</li>';
  }
  else {
    return NULL;
  }
}

function dlts_page_number($field_seq_num, $field_page_num) {
  if (!empty($field_page_num)) {
    $page_num = $field_page_num;
  }
  else {
    $page_num = $field_seq_num;
  }
  return $page_num;
}

function dlts_book_language(&$language_code) {
  if (!empty($language_code)) {
    switch ($language_code) {
      case 'eng':
        return t('English');
        break;
      case 'fre':
        return t('French');
        break;
      case 'ger':
        return t('German');
        break;
      default:
        return t('Other: @language', array('@language' => $language_code));
        break;
     }
   }
}

# {theme}_{module}_{button_type}_button
function dlts_book_dlts_book_pager_button($arguments) {
  $pjax = dlts_utilities_is_pjax();
  $status = $arguments['active'] ? 'active' : 'inactive';
  $icon = (isset($arguments['type']) && $arguments['type'] == 'dlts_book_page') ? 'page-double' : 'page-single';
  
  switch ($arguments['id']) {
    case 'next-page':
	case 'last-page':
      if ($pjax) {
        return '<span class="pjax button ' . $status . ' ' . $arguments['id'] . '">' . l( '<span>' .$arguments['text'] . '</span>', $arguments['url'], array('attributes' => array('data-title' => $arguments['text'], 'title' => $arguments['text'], 'class' => array('next', 'paging', $status)), 'html' => TRUE)) . '</span>';		      
      }
      else {
        return l( '<span>' . $arguments['text'] . '<span>', $arguments['url'], array('attributes' => array('data-title' => $arguments['text'], 'title' => $arguments['text'], 'class' => array('paging', 'next', $status)), 'html' => TRUE));
      }
    break;

    case 'previous-page':
    case 'first-page':
      if ($pjax) {
        return '<span class="pjax button ' . $status . ' ' . $arguments['id'] . '">' . l( '<span>' .  $arguments['text'] . '<span>', $arguments['url'], array('attributes' => array('data-title' => $arguments['text'], 'title' => $arguments['text'], 'class' => array('previous', 'paging', $status)), 'html' => TRUE)) . '</span>';        
      }
      else {
        return l( '<span>' . $arguments['text'] . '<span>', $arguments['url'], array('attributes' => array('data-title' => $arguments['text'], 'title' => $arguments['text'], 'class' => array('paging', 'previous', $status)), 'html' => TRUE));
      }
      break;

    case 'toggle-page':
      if ($pjax) {
        return '<span class="pjax button ' . $status . ' ' . $arguments['id'] . '">' . l( '<span>' . $arguments['text'] . '<span>', $arguments['url'], array('attributes' => array('data-title' => $arguments['text'], 'title' => $arguments['text'], 'class' => array($icon, $status, 'toogle button')), 'html' => TRUE)) . '</span>';
      }
      else {
        return '<li class="navbar-item">' . l( '<span class="test">' . $arguments['text'] . '</span>', $arguments['url'], array('attributes' => array('data-title' => $arguments['text'], 'title' => $arguments['text'], 'class' => array($icon, $status, 'toogle button')), 'html' => TRUE)) . '</li>';
      }
      break;
        
    default: //includes toggle button
      return '<li class="navbar-item">' . l( '<span>' . $arguments['text'] . '<span>', $arguments['url'], $arguments) . '</li>';
      break;
  }

}

function dlts_book_dlts_book_pager_button_inactive($arguments) {
  return '<div class="paging-control"><span class="' . $arguments['attributes']['class'] . '" title="' . $arguments['attributes']['title'] . '">' . $arguments['attributes']['title'] . '</span></div>';
}

function dlts_book_dlts_image_formatter_thumbnail_nodelink($element) {

  // Inside a view $element may contain null data. In that case, just return.
  if (empty($element['#item']['fid'])) {
    return '';
  }

  $node = $element['#node'];
  $imagetag = theme('dlts_image_formatter_thumbnail', $element);

  $nodePath = 'node/'. $node->nid;

  if ( isset($_GET['pnid']) ) {
    $class = 'dlts-image dlts-image-nodelink dlts-image-'. $element['#field_name'] . ( $_GET['pnid'] ==  $element['#node']->nid ? ' active' : '' );
    return l( $imagetag, $nodePath, array('attributes' => array('class' => $class), 'html' => TRUE ) );
  }
}

function dlts_book_preprocess_search_result(&$variables) {

  if ( isset( $variables['result']['fields']['collection'] ) ) {
    $variables['collection'] = $variables['result']['fields']['collection'];
  }
  
  if (isset( $variables['result']['fields']['site'] ) ) {
    $variables['site'] = $variables['result']['fields']['site'];
  }

  if ( isset( $variables['result']['fields']['url'] ) ) {
    $variables['url'] = $variables['result']['fields']['url'];
  }
  
  if ( isset( $variables['result']['fields']['representative_image'] ) ) {
    $variables['representative_image'] = $variables['result']['fields']['representative_image'];
  }
  
  if ( isset( $variables['result']['fields']['collection_title'] ) ) {
    $variables['collection_title'] = $variables['result']['fields']['collection_title'];
  }
  
  if ( isset( $variables['result']['fields']['collection_type'] ) ) {
    $variables['collection_type'] = $variables['result']['fields']['collection_type'];
  }  
  
  if (isset( $variables['result']['fields']['xs_services_image'] )) {
    $variables['services_image'] = $variables['result']['fields']['xs_services_image'];
  }
  
  if (isset($variables['result']['fields']['bundle']) && $variables['result']['fields']['bundle'] == 'dlts_book' ) {
        
    $variables['url'] = url('books/' . $variables['result']['fields']['ss_identifer'], array('absolute' => TRUE));

    if (isset($variables['result']['fields']['ss_identifer'])) {
      $variables['book_alias'] = l('Read book', 'books/' . $variables['result']['fields']['ss_identifer'], array('attributes' => array('class' => array('button', 'icon', 'book'))));
    }
    
  }
  
}

function theme_mustache_search_results() {
  $output = '
    <div class="book-pane-options-search-result results results-{{entity_id}} results-{{bundle}}" data-url="{{link}}" data-page="{{link}}">
      <div>
        <table>
          <tbody>
            <tr>
              <td class="book-pane-options-search-result-snippet-cell">
                <div class="book-pane-options-search-result-snippet" role="link">
                  <div>{{{snippet}}}</div>
                </div>
              </td>
              <td class="book-pane-options-search-result-page-cell">{{its_field_sequence_number}}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>';
  return $output;
}

function theme_micro_search_result() {
	$output = '
    <div class="book-pane-options-search-result results results-<%= data.entity_id %>" data-url="<%= data.link %>" role="link">
      <div>
        <table>
          <tbody>
            <tr>
              <td class="book-pane-options-search-result-snippet-cell">
                <div class="book-pane-options-search-result-snippet">
                  <div><%== data.snippet %></div>
                </div>
              </td>
              <td class="book-pane-options-search-result-page-cell"><%= data.its_field_sequence_number %></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>';
	return $output;
}

function theme_mustache_annotation() {
  /** Theme absolute-path */
  // $theme_path = path_to_theme();
  $theme_path = drupal_get_path('theme', 'dlts_book');  
  
  $output = '
    <div id="annotation-{{type}}-{{id}}" class="annotation annotation-{type}">
      <div class="annotation-content">
        <img class="annotation-avatar" src="'.  file_create_url( $theme_path . '/images/user.png') .'" height="24" width="24"/>
        <div class="annotation-creator">{{creator}}</div>
        <div class="annotation-timestamp">{{modification_date_utc}}</div>
        <div class="annotation-body">{{text}}</div>
        <div class="annotation-footer"></div>
      </div>
    </div>';
  return $output;
}

// OK
function theme_micro_pages_carousel() {
	$output = '
    <li class="carousel-li-item carousel-item-<%= data.sequence %>" data-group="<%= data.group %>" data-sequence="<%= data.sequence %>" data-title="<%= data.title %>">
      <div>
        <a class="carousel-item-link yui3-pjax" href="'. base_path() .'books/<%= data.identifier %>/<%= data.sequence %>"><div class="yui3-carousel-item-container"><img id="thumb-<%= data.sequence %>" /></div></a> 
        <span class="sequence page-number"><%= data.sequence %></span>
      </div>
    </li>';
	return $output;
}

// OK
function theme_mustache_container_sequence() {
  return '<div id="g<%= data.id %>" class="yui3-g thumb-group"></div>'; 
}

// OK
function theme_mustache_thumbnail_sequence() {
	return '<div id="g{{id}}" class="yui3-g thumb-group pages"></div>';
}

// OK
function theme_micro_thumbnail_sequence() {
    return '<div id="g<%= data.id %>" class="yui3-g thumb-group pages"></div>';
}

// OK
function theme_mustache_books_sequence() {
  $output = '
    <div class="yui3-u-1-<%= data.rows %> thumb-item hidden">
      <div class="yui3-g">
        <div class="yui3-u-1">
          <a class="link" href="<%= data.path %>"><img id="thumb-<%= data.identifier %>" width="<%= data.width %>" class="thumb-image" /></a>
          <div class="metadata">
            <span class="vol-info"><%= data.label %></span>
            <span class="publisher"><%= data.publisher %></span>
            <span class="subject"><%= data.subject %></span>
            <span class="sequence_count"><%= data.sequence_count %></span>
            <span class="page_count"><%= data.page_count %></span>
          </div>
        </div>
      </div>
    </div>';
  return $output;
}

// OK
function theme_micro_thumbnail() {
	$output = '
  	<div class="yui3-u-1-<%= data.rows %> thumb-item hidden">
  	  <div class="yui3-g">
  	    <div class="yui3-u-1">
  	      <a class="link" href="books/<%= data.sequence %>"><img id="thumb-<%= data.sequence %>" src="<%= data.thumbnail.image %>" width="<%= data.width %>">" /></a><span class="vol-info">Vol. <%= data.volume %>">, No. <%= data.number %>">, <span class="date-display-single"><%= data.date %>"></span></span>
  	    </div>
  	  </div>
  	</div>';
	return $output;
}

// OK
function theme_mustache_thumbnail() {
  $output = '
  	<div class="yui3-u-1-{{rows}} thumb-item hidden">
  	  <div class="yui3-g">
  	    <div class="yui3-u-1">
  	      <a class="link" href="books/{{sequence}}"><img id="thumb-{{sequence}}" src="{{#thumbnail}}{{image}}{{/thumbnail}}" width="{{width}}" /></a><span class="vol-info">Vol. {{volume}}, No. {{number}}, <span class="date-display-single">{{date}}</span></span>
  	    </div>
  	  </div>
  	</div>';
  return $output;
}

// OK
function theme_yui3_thumbnails() {
  $output = '
    <div class="yui3-g yui3-pagging yui3-carousel-container unrendered hidden">
      <div class="yui3-u-1">
        <div class="yui3-g">
          <div id="carousel-container" class="carousel-container yui3-u-1 yui3-carousel-loading">
            <ol class="modal-item"></ol>
          </div>
        </div>
      </div>
    </div>';
  return $output;
}

/** Add search pane to the book */
function dlts_book_add_search(&$vars, &$js_data) {

  $placeholder = t('Find in this issue');
  $searchHasTerms = 0;
  
  /** book absolute-path */  
  $book_url = url('node/' . $vars['book_nid'], array('absolute' => true ));
  
  $uri = drupal_parse_url(request_uri());
      
  if (module_exists('dlts_solr') && user_access('search content')) {
    
    drupal_add_js( drupal_get_path('theme', 'dlts_book') . '/js/ui.search.yui.js', array('type' => 'file', 'scope' => 'footer', 'weight' => 6));

    /* searchTerms is set. Open search pane and search for the terms */
    if (isset($_GET['searchTerms'])) {
      $searchHasTerms = true;
      $placeholder = str_replace('+', ' ', filter_xss($_GET['searchTerms']));
    }

    /** Add search block information to DLTS namespace */
    $js_data += array(
      'search' => array(
        'books' => FALSE,
        'pages' => $vars['identifier'] .'/services/search',
      	'messages' => array(
      	  'found' => '<div class="pane results-found">' . t('Showing all')  . ' <em><%= data.message %></em> ' . t('results') . '</div>',
      	  'no_found' => '<div class="pane results-no-found">' . t('No results found') . '</div>',
      	),
      	'templates' => array(
      	  'result' => theme_micro_search_result(),
      	),
      ),
    );
    
    $js_data['search'] += array( 'searchTerms' => ( ($searchHasTerms) ? $placeholder : false) );
        
    /** Add search button */ 
    $vars['button_search'] = _dlts_book_navbar_item(
      array(
        'title' => t('Search'),
      	'path' => 'node/' . $vars['node']->nid,
        'attributes' => array('title' => t('Search'), 'class' => array('button', 'search', (($searchHasTerms) ? ' on' : '') ), 'id' => array('button-search')),
        'fragment' => 'search',
      )
    );
        
    $search = module_invoke('search', 'block_view', 'search');
    $search['content']['search_block_form']['#attributes']['value'] = '';
    $search['content']['search_block_form']['#attributes']['placeholder'] = $placeholder;
    
    if ($vars['node']->type == 'dlts_book_page') { 
      $search['content']['#action'] = substr($uri['path'], 0, strrpos($uri['path'], '/')) . '/search'; 
    }

    $vars['search_box'] = ''
      . '<div id="pane-search" class="pane-search pane search pane-shadow'. ( $searchHasTerms ? '' : ' hidden search-hidden' ) . '">' 
      . render($search)
      . '<div class="pane search-container"><div id="pane-search-results-area-results" class="pane-search-content pane results-area"></div></div>'
      . '</div>';
    }
}

/*
 * Remove unnecessary white-space to improve DOM performance.
 * See: http://api.drupal.org/api/drupal/includes--theme.inc/function/theme_html_tag/7
 */
function dlts_book_html_tag($variables) {
  $element = $variables['element'];
  $attributes = isset($element['#attributes']) ? drupal_attributes($element['#attributes']) : '';
  if (!isset($element['#value'])) {
    return '<' . $element['#tag'] . $attributes . ' />';
  }
  else {
    $output = '<' . $element['#tag'] . $attributes . '>';
    if (isset($element['#value_prefix'])) {
      $output .= $element['#value_prefix'];
    }
    $output .= $element['#value'];
    if (isset($element['#value_suffix'])) {
      $output .= $element['#value_suffix'];
    }
    $output .= '</' . $element['#tag'] . '>';
    return $output;
  }
}

function dlts_book_process_views_view(&$vars) {

  /** Theme absolute-path */
  $theme_path = drupal_get_path('theme', 'dlts_book');
  
  /** View */
  $view = $vars['view'];  
  
  if ($view->name == 'books') {
    if (dlts_utilities_is_pjax()) {
      $vars['theme_hook_suggestion'] = 'views_view__pjax_collection_books';
    }
    else {
      drupal_add_js($theme_path . '/js/ui.items.view.js', array('type' => 'file', 'scope' => 'footer', 'weight' => 7));
    }
  }
}

function dlts_book_preprocess_views_view(&$vars) {
  
  /** Theme absolute-path */
  $theme_path = drupal_get_path('theme', 'dlts_book');

  /** View */
  $view = $vars['view'];
  
  if ($view->name == 'book_thumbnails') {
    dlts_utilities_add_script(theme_mustache_thumbnail_sequence(), array('id' => 'thumbnail-sequence', 'script_type' => 'text/x-handlebars-template', 'type' => 'inline', 'scope' => 'header', 'group' => SCRIPT_THEME));
    dlts_utilities_add_script(theme_mustache_thumbnail(), array('id' => 'thumbnail', 'script_type' => 'text/x-handlebars-template', 'type' => 'inline', 'scope' => 'header', 'group' => SCRIPT_THEME));
    drupal_add_js($theme_path . '/js/ui.pages.view.js', array('type' => 'file', 'scope' => 'footer', 'weight' => 7));
  }
  
}
