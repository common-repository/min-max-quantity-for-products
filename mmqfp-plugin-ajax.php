<?php

$table_name = $wpdb->prefix . "woocommerce_min_max_rules";

/**
 * Returns all existing roles as json back to the frontend
 */
add_action('wp_ajax_mmqfp_get_roles', 'mmqfp_ajax_get_roles');
function mmqfp_ajax_get_roles()
{
    $roles = wp_roles();
    wp_send_json_success($roles);
}

/**
 * Returns all existing rules as json back to the frontend
 */
add_action('wp_ajax_mmqfp_get_rules', 'mmqfp_ajax_get_rules');
function mmqfp_ajax_get_rules()
{
    global $table_name;
    global $wpdb;
    $rules = $wpdb->get_results("SELECT * FROM " . $table_name);
    wp_send_json_success($rules);
}

/**
 * If the id is present in the payload data, the object is updated, else a new rule is creaded
 */
add_action('wp_ajax_mmqfp_save_or_update_rule', 'mmqfp_ajax_save_or_update_rule');
function mmqfp_ajax_save_or_update_rule()
{
    global $wpdb;
    global $table_name;
    $rule = $_POST['rule'];
    $rule_as_array = mmqfp_get_array_from_rule($rule);
    $insertRequired = is_null($rule['id']);
    if (!$insertRequired) {
        $id = intval($rule['id']);
        $wpdb->update($table_name, $rule_as_array, array('id' => $id));
    } else {
        $wpdb->insert($table_name, $rule_as_array);
    }

    wp_send_json_success($wpdb->insert_id);
}

/**
 * Deletes a rule identified by an ID
 */
add_action('wp_ajax_mmqfp_delete_rule', 'mmqfp_ajax_delete_rule');
function mmqfp_ajax_delete_rule()
{
    global $wpdb;
    global $table_name;
    $id = $_POST['id'];
    $wpdb->delete($table_name, array('id' => $id));
    wp_send_json_success($wpdb->last_error);
}

/**
 * @param $rule the rule to be converted to an array
 * @param $insert is insert (id will be null) statement or update (id will be the id from the rule object)
 * @return array the array representation of the rule
 */
function mmqfp_get_array_from_rule($rule)
{
    $id = $rule['id'];
    if (is_null($id)) {
        return array('min_value' => $rule['min_value'], 'max_value' => $rule['max_value'], 'role' => $rule['role']);
    }
    return array('id' => $id, 'min_value' => $rule['min_value'], 'max_value' => $rule['max_value'], 'role' => $rule['role']);
}