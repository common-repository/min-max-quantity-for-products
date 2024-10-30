<?php

add_filter('woocommerce_quantity_input_args', 'mmqfp_woocommerce_quantity_input_args', 10, 2);

$table_name = $wpdb->prefix . "woocommerce_min_max_rules";

/**
 * @param $args
 * @param $product
 * @return mixed The modified $args input argument with 'min_value', 'max_value' and initial 'input_value' (= min_value)
 */
function mmqfp_woocommerce_quantity_input_args($args, $product) {

    // Default values: if 'default' role is set in admin, this value is applied, else 1-9
    $min = mmqfp_get_min_by_role('default', 1);
    $max = mmqfp_get_max_by_role('default', 9);

    $current_user = wp_get_current_user();

    // if user is logged in
    if (0 != $current_user->ID) {
        $roles_of_user = $current_user->roles;
        if (sizeof($roles_of_user) > 0) {
            $role = $roles_of_user[0];
            $min = mmqfp_get_min_by_role($role, $min);
            $max = mmqfp_get_max_by_role($role, $max);
        }
    }

    $args['min_value'] = $min;
    $args['max_value'] = $max;
    $args['input_value'] = $min;

    return $args;
}

/**
 * @param $role the role for which the min value will be read from the database
 * @return null or min_value as read from db fro $role
 */
function mmqfp_get_min_by_role($role, $fallback) {
    global $wpdb, $table_name;
    $r = strtolower($role);
    $result =  $wpdb->get_results( "SELECT * FROM " . $table_name . " WHERE role =  '$r'")[0];
    return $result != null ? $result->min_value : $fallback;
}

/**
 * @param $role the role for which the max value will be read
 * @return null or max_value as read from db fro $role
 */
function mmqfp_get_max_by_role($role, $fallback) {
    global $wpdb, $table_name;
    $r = strtolower($role);
    $result =  $wpdb->get_results( "SELECT * FROM " . $table_name . " WHERE role =  '$r'")[0];
    return $result != null ? $result->max_value : $fallback;
}

