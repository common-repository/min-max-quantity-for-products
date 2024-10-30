<?php
/**
 * Plugin Name: Min-Max Quantity for Products
 * Plugin URI: https://www.creaded.com
 * Description: The Min-Max Quantity Plugin for woocommerce allows you to set minimum and maximum order quantities globally for products depending on user roles.
 * Author: creaded GmbH
 * Author: URI: https://www.creaded.com
 * Version: 1.1.0
 */

if (!defined('ABSPATH')) {
    exit;
}

require_once(plugin_dir_path(__FILE__) . 'mmqfp-plugin-ajax.php');
require_once(plugin_dir_path(__FILE__) . 'mmqfp-plugin-core.php');


add_action('wp_enqueue_scripts', 'mmqfp_include_scripts');
add_action('admin_enqueue_scripts', 'mmqfp_include_scripts');
add_action('admin_menu', 'mmqfp_create_submenu');
register_activation_hook(__FILE__, 'mmqfp_activation_callback');


function mmqfp_include_scripts()
{
    global $post;
    if (!empty($post) && !empty($post->post_content)) {
        mmqfp_addScripts();
    }
}

/**
 * Adds all js and css files
 */
function mmqfp_addScripts()
{
    $plugin_url = plugin_dir_url(__FILE__);

    // JS
    wp_enqueue_script('mmqfp-plugin-angularjs', $plugin_url . 'js/vendor/angular.min.js', array('jquery'), '1.6.1', false);
    wp_enqueue_script('mmqfp-plugin-angular-animate', $plugin_url . 'js/vendor/angular-animate.min.js', array('jquery'), '1.6.1', false);
    wp_enqueue_script('mmqfp-plugin-angular-aria', $plugin_url . 'js/vendor/angular-aria.min.js', array('jquery'), '1.6.1', false);
    wp_enqueue_script('mmqfp-plugin-angular-messages', $plugin_url . 'js/vendor/angular-messages.min.js', array('jquery'), '1.6.1', false);
    wp_enqueue_script('mmqfp-plugin-angular-material', $plugin_url . 'js/vendor/angular-material.min.js', array('jquery'), '1.1.1', false);
    wp_enqueue_script('mmqfp-plugin-underscore', $plugin_url . 'js/vendor/underscore-min.js', array(), '1.8.3', false);
    wp_enqueue_script('mmqfp-plugin-animate', $plugin_url . 'js/vendor/angular-animate-css.min.js', array(), '1.8.3', false);
    wp_enqueue_script('mmqfp-plugin-angular-locale', $plugin_url . 'js/vendor/angular-locale_de-de.min.js', array('jquery'), '1.6.1', false);

    wp_enqueue_script('mmqfp-plugin-app', $plugin_url . 'js/app.js', array(), '1.0.0', false);
    wp_enqueue_script('mmqfp-plugin-admin-controller', $plugin_url . 'js/pluginCtrl.js', array(), '1.0.0', true);

    // CSS
    wp_enqueue_style('plugin-material-icons', '//fonts.googleapis.com/icon?family=Material+Icons');
    wp_enqueue_style('plugin-angular-material', $plugin_url . 'css/vendor/angular-material.min.css');
    wp_enqueue_style('plugin-magic-animations', $plugin_url . 'css/vendor/magic.min.css');
    wp_enqueue_style('plugin-css', $plugin_url . 'css/app.css');
    wp_enqueue_style('plugin-table-css', $plugin_url . 'css/table.css');

}

/**
 * @return string JSON string containing meta data neccessary in the frontend
 */
function mmqfp_get_frontend_meta_data()
{
    $plugin_url = plugin_dir_url(__FILE__);
    $ajaxurl = admin_url('admin-ajax.php');
    return "<script> DATA_HOLDER={onProductPage : true, ajaxurl:'$ajaxurl' , pluginUrl: '$plugin_url'
            }; </script>";
}


/**
 * Callback method then plugin is activated. It creates the neccesary plugin table if it doesn't already exists
 */
function mmqfp_activation_callback() {

    // Require woocommerce plugin
    if (!is_plugin_active( 'woocommerce/woocommerce.php' )) {
        wp_die( 'The Min-Max quantity plugin requires the woocommerce plugin to be installed and activated. Please check if woocommerce is activated and try again.
        If you have any questions about the plugin, you can contact the developers: info@creaded.com');
    } else {
        global $wpdb;
        $table_name = $wpdb->prefix . "woocommerce_min_max_rules";
        $sql = "CREATE TABLE IF NOT EXISTS " . $table_name .
            "(
        id INT(11) PRIMARY KEY NOT NULL AUTO_INCREMENT,
        min_value INT(11) NOT NULL,
        max_value INT(11) NOT NULL,
        role VARCHAR(255) NOT NULL
    );";
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }

}

/**
 * Method to create the plugin's main page
 */
function mmqfp_create_submenu() {
    mmqfp_addScripts();
    add_submenu_page( 'woocommerce', 'Min-Max Rules', 'Min-Max Rules', 'manage_options', 'creaded-min-max', 'mmqfp_create_plugin_page');
}

/**
 * returns the main HTML content for the plugin page
 */
function mmqfp_create_plugin_page()
{
    $content = file_get_contents(plugin_dir_path(__FILE__) . 'html/plugin.html');
    $content .= mmqfp_get_frontend_meta_data();
    echo $content;
}


