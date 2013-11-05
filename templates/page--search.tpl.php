<?php

/**
 * @file
 * Default theme implementation to display a single Drupal page.
 *
 * Available variables:
 *
 * General utility variables:
 * - $base_path: The base URL path of the Drupal installation. At the very
 *   least, this will always default to /.
 * - $directory: The directory the template is located in, e.g. modules/system
 *   or themes/bartik.
 * - $is_front: TRUE if the current page is the front page.
 * - $logged_in: TRUE if the user is registered and signed in.
 * - $is_admin: TRUE if the user has permission to access administration pages.
 *
 * Site identity:
 * - $front_page: The URL of the front page. Use this instead of $base_path,
 *   when linking to the front page. This includes the language domain or
 *   prefix.
 * - $logo: The path to the logo image, as defined in theme configuration.
 * - $site_name: The name of the site, empty when display has been disabled
 *   in theme settings.
 * - $site_slogan: The slogan of the site, empty when display has been disabled
 *   in theme settings.
 *
 * Navigation:
 * - $main_menu (array): An array containing the Main menu links for the
 *   site, if they have been configured.
 * - $secondary_menu (array): An array containing the Secondary menu links for
 *   the site, if they have been configured.
 * - $breadcrumb: The breadcrumb trail for the current page.
 *
 * Page content (in order of occurrence in the default page.tpl.php):
 * - $title_prefix (array): An array containing additional output populated by
 *   modules, intended to be displayed in front of the main title tag that
 *   appears in the template.
 * - $title: The page title, for use in the actual HTML content.
 * - $title_suffix (array): An array containing additional output populated by
 *   modules, intended to be displayed after the main title tag that appears in
 *   the template.
 * - $messages: HTML for status and error messages. Should be displayed
 *   prominently.
 * - $tabs (array): Tabs linking to any sub-pages beneath the current page
 *   (e.g., the view and edit tabs when displaying a node).
 * - $action_links (array): Actions local to the page, such as 'Add menu' on the
 *   menu administration interface.
 * - $feed_icons: A string of all feed icons for the current page.
 * - $node: The node object, if there is an automatically-loaded node
 *   associated with the page, and the node ID is the second argument
 *   in the page's path (e.g. node/12345 and node/12345/revisions, but not
 *   comment/reply/12345).
 *
 * Regions:
 * - $page['help']: Dynamic help text, mostly for admin pages.
 * - $page['highlighted']: Items for the highlighted content region.
 * - $page['content']: The main content of the current page.
 * - $page['sidebar_first']: Items for the first sidebar.
 * - $page['sidebar_second']: Items for the second sidebar.
 * - $page['header']: Items for the header region.
 * - $page['footer']: Items for the footer region.
 *
 * @see template_preprocess()
 * @see template_preprocess_page()
 * @see template_process()
 */
?>
<div id="page" class="page">
  <a id="main-content"></a>
  <div id="top" class="top">
    <div id="header" class="header">
      <?php if ($logo): ?><a href="<?php print $front_page; ?>" title="<?php print t('Home'); ?>" rel="home" id="logo"><img src="<?php print $logo; ?>" alt="<?php print t('Home'); ?>" /></a><?php endif; ?>      
      <?php if ($site_name) : ?><<?php if ($title) : print 'h1'; else: print 'h2'; endif; ?> id="site-name"><a href="<?php print $front_page; ?>" title="<?php print t('Home'); ?>" rel="home"><span><?php print $site_name; ?></span></a></<?php if ($title) : print 'h1'; else: print 'h2'; endif; ?>><?php endif; ?>
    </div>
    <?php if ($main_menu || $secondary_menu) : ?>
      <div id="navigation" class="navigation">
        <?php if ($main_menu) : ?>
          <?php print theme('links__system_main_menu', array('links' => $main_menu, 'attributes' => array('id' => 'main-menu', 'class' => array('links', 'inline', 'clearfix')), 'heading' => t('Main menu'))); ?>
        <?php endif; ?>
        <?php if ($secondary_menu) : ?>
          <?php print theme('links__system_secondary_menu', array('links' => $secondary_menu, 'attributes' => array('id' => 'secondary-menu', 'class' => array('links', 'inline', 'clearfix')), 'heading' => t('Secondary menu'))); ?>
        <?php endif; ?>
      </div>
    <?php endif; ?>
    <?php if ($breadcrumb) : ?>
      <div id="breadcrumb"><?php print $breadcrumb; ?></div>
    <?php endif; ?>
    <?php if (isset($page['highlighted'])) : ?>
      <div id="highlighted"><?php print render($page['highlighted']); ?></div>
    <?php endif; ?>
    <?php if ($title): ?>
      <div id="titlebar" class="titlebar yui3-g">
        <div class="yui3-u-5-24 title">
          <span class="icon book"></span><h1 class="title" id="page-title"><?php print $title ?></h1>
        </div>
        <?php if ($search) : ?>
          <div class="yui3-u-19-24 search">
            <?php print render($search) ?>  
          </div>
        <?php endif; ?>
      </div>
    <?php endif; ?>
    <?php if ($tabs) : ?>
      <div class="tabs"><?php print render($tabs); ?></div>
    <?php endif; ?>
  </div>
  <div class="yui-g search-results-header">
    <div class="yui3-1">
      <h2><?php print t('Results');?></h2>
    </div>
  </div>
  <?php if (!empty($messages) || !empty($page['help']) || !empty($action_links)) : ?>
    <div class="yui-g">
      <div class="yui3-1">
        <?php print render($page['help']); ?>
        <?php if ($action_links): ?><ul class="action-links"><?php print render($action_links); ?></ul><?php endif; ?>
        <?php if ($messages) : ?><?php print $messages; ?><?php endif; ?>
      </div>
    </div>
  <?php endif; ?>
  <div class="yui3-g search-results-content">
    <?php if (isset($page['left'])) : ?>
      <div class="yui3-u left">
        <?php print render($page['left']); ?>
      </div>
    <?php endif; ?>
    <div class="yui3-u content">
      <?php print render($page['content']); ?>
    </div>    
  </div>
  <?php if ($feed_icons) : ?>
    <?php print $feed_icons; ?> 
  <?php endif; ?>
  <?php if ( isset($footer)) : ?>
    <div class="footer yui3-g">
      <div class="yui3-u-1">
        <div class="content">  
          <?php print render($footer); ?>
        </div>
      </div>
    </div>
  <?php endif; ?> 
</div>