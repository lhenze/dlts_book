<?php

function dlts_book_form_system_theme_settings_alter(&$form, &$form_state) {
   
   $form['dlts_book_settings']['dlts_book_toggle'] = array(
    '#type' => 'fieldset',
    '#title' => t('Toggle advanced elements'),
    '#description' => t('Enable or disable the display of certain page elements.'),
  );
  
  $form['dlts_book_settings']['dlts_book_toggle']['dlts_book_toggle_breadcrumb'] = array(
    '#type' => 'checkbox',
    '#title' => t('Display the breadcrumb'),
    '#default_value' => theme_get_setting('dlts_book_toggle_breadcrumb'),
    '#description' => t('Breadcrumbs are disabled by default in DLTS Book theme. Enable the checkbox to show a trail of links from the homepage to the current page.'),  
    '#weight' => 1,
  );
  
   $form['dlts_book_settings']['dlts_book_toggle'] = array(
    '#type' => 'fieldset',
    '#title' => t('Toggle advanced elements'),
    '#description' => t('Enable or disable the display of certain page elements.'),
  );
  
  $environments = array('local' => t('localhost'), 'dev' => t('development'), 'stage' => t('staging'), 'min' => t('production') );
  
  $dlts_book_environment = theme_get_setting('dlts_book_environment');

  $form['settings']['dlts_book_environment'] = array(
    '#type' => 'radios',
    '#title' => t('Project environment'),
    '#default_value' =>  isset($dlts_book_environment) ? $dlts_book_environment : 0,
    '#options' => $environments,
    '#description' => t('The environment this project is running.'),
  );  
  
}
