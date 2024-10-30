angular.module('plugin').controller('pluginCtrl', function ($scope, $mdToast) {

    $scope.translations = {
        success: {
            de: "Erfolgreich",
            en: "Successfully"
        },
        error: {
            de: "Es ist ein Fehler aufgetreten",
            en: "Something went wrong"
        },
        role: {
            de: "Rolle",
            en: "Role"
        },
        minLabelTooltip: {
            de: "mindest Bestellmenge für die unterschiedlichen Rollen",
            en: "minimum order quantity for a role"
        },
        maxLabelTooltip: {
            de: "maximale Bestellmenge für die unterschiedlichen Rollen",
            en: "maximum order quantity for a role"
        },
        roleLabelTooltip: {
            de: "Die Rolle",
            en: "The role"
        },
        searchTerm: {
            de: "Suche...",
            en: "Search..."
        },
        titleExistingRules: {
            de: "Gespeicherte Regeln",
            en: "Existing Rules"
        },
        titleAddEditRule: {
            de: "Editieren einer Regel",
            en: "Edit a rule"
        },
        pleaseSelectARole: {
            de: "Bitte eine Rolle auswählen",
            en: "Please choose a role"
        },
        clearForm: {
            de: "Zurücksetzen",
            en: "Clear form"
        },
        save: {
            de: "Speichern",
            en: "Save"
        },
        noRolesAvailableRemark: {
            de: "Alle Rollen sind in einer Regel verwendet. Sie können diese durch das Klicken auf den 'Bearbeiten' Button editieren",
            en: "All roles are used within a rule. You can edit these by clicking on the edit button of the desired rule"
        },

        pleaseEnterMinValue: {
            de: "Bitte einen min. Wert angeben",
            en: "Please provide a min value"
        },

        valueMustBeAtLeast: {
            de: "Der Mindestwert beträgt",
            en: "Value must be at least"
        },
        valueCanNotExceed: {
            de: "Der Wert kann folgenden nicht überschreiten:",
            en: "Can't exceed value"
        },

        pleaseEnterMaxValue: {
            de: "Bitte einen max. Wert angeben",
            en: "Please provide a max value"
        },

        savedRuleDescription: {
            de: "Hier haben Sie eine Übersicht über bereits erstellte Regeln. Das Plugin setzt die Mindest- und Maximalbestellmengen global auf alle Produkte fest. Sie haben über die Icons die Möglichkeit bestehende Regeln zu editieren oder direkt zu löschen. 'Default' beschreibt die Rolle für einen nicht angemeldeten User.",
            en: "Here you have an overview of existing rules. The Plugin sets the minimum and maximum order quantity globally on all products. You can edit or delete these by clicking on the appropriate icon next to the rule. The Role 'default' describes a non logged in user."
        },

        editRuleDescription: {
            de: "Hier haben Sie die Möglichkeit eine bestehende Regel zu bearbeiten oder eine neue zu erstellen. Eine Regel setzt die mindest und maximal Bestellmenge für eine bestimmte Rolle für alle Produkte im Shop fest. Zum bearbeiten klicken Sie auf das entsprechende Symbol einer bestehenden Regel auf der linken Seite.",
            en: "Here you have the possibility to edit an existing rule or to create a new one. A rule sets the minimum and maximum order quantity globally for all products for a distinct role. To edit an existing one, please click on the edit button of the proper rule."
        },

        noRulesDefinedMessage: {
            de: "Es sind noch keine Regeln definiert",
            en: "No rules defined yet"
        }
    };

    var DEFAULT_ROLE = {
        name: 'default',
        title: 'Default'
    };

    $scope.holder = {
        language: 'en',
        init: false,
        loading: false, // loading data in the left card
        saving: false, // clicking save on the right card
        persistedRules: [], // all persistent min_max_rules objects
        rule: {}, // the model for the form to save or update a new rule
        roles: [], // model for the select
        allRoles: [] // all relevant roles to be considered
    };

    $scope.applyRuleInForm = function (ruleToApply) {

        filterRoles();
        $scope.holder.roles.push(ruleToApply.role);
        angular.copy(ruleToApply, $scope.holder.rule);
        $scope.holder.rule.role = ruleToApply.role;
        $scope.ruleForm.minInput.$touched = true;
        $scope.ruleForm.maxInput.$touched = true;
    };

    $scope.clearRuleForm = function () {
        $scope.holder.rule = {};
        $scope.holder.saving = false;
        filterRoles();
        reset();
    };

    var getRoleObjectForRuleName = function (roleName) {
        var roleObject = {};
        angular.forEach($scope.holder.allRoles, function (rObject) {
            if (rObject.name === roleName) {
                roleObject = rObject;
            }
        });
        return roleObject;
    };

    /**
     * loads all min-Max_rules from the database and calls the callback in case of success
     */
    var loadRules = function () {
        $scope.holder.loading = true;
        jQuery.ajax(
            {
                type: "post",
                dataType: "json",
                url: DATA_HOLDER.ajaxurl,
                data: {'action': 'mmqfp_get_rules'},
                success: function (response) {
                    $scope.holder.persistedRules = [];
                    angular.forEach(response.data, function (ruleFromDb) {
                        var rule = {
                            min_value: parseInt(ruleFromDb.min_value),
                            max_value: parseInt(ruleFromDb.max_value),
                            id: parseInt(ruleFromDb.id),
                            role: getRoleObjectForRuleName(ruleFromDb.role)
                        };
                        $scope.holder.persistedRules.push(rule);
                    });
                    filterRoles();
                    $scope.holder.loading = false;
                    $scope.$apply();
                },
                error: function (response) {
                    showToast(showToast($scope.translations.error[$scope.holder.language]));
                }
            });
    };

    /**
     * This method filters the $scope.holder.roles array. It removes all roles that are already used in a persistedRule
     */
    var filterRoles = function () {
        $scope.holder.roles = [];
        angular.forEach($scope.holder.allRoles, function (roleObject) {
            if (!isRoleCoveredByRules(roleObject)) {
                $scope.holder.roles.push(roleObject);
            }
        });
    };

    /**
     *
     * @param roleObject The role name to be checked if a rule has already be defined
     * @returns {boolean} true if a rule is present, else false
     */
    var isRoleCoveredByRules = function (roleObject) {
        for (i = 0; i < $scope.holder.persistedRules.length; i++) {
            var rule = $scope.holder.persistedRules[i];
            if (rule.role.name === roleObject.name) {
                return true;
            }
        }
        return false;
    };

    /**
     * This method saves all relevant roles (All roles from the WP database plus our 'default' fallback) in the
     * $scope.holder.allRoles variable. Should be called once during initialization
     */
    var loadAllRoles = function (callback) {
        jQuery.ajax(
            {
                type: "post",
                dataType: "json",
                url: DATA_HOLDER.ajaxurl,
                data: {'action': 'mmqfp_get_roles'},
                success: function (response) {
                    var roles = response.data.roles;
                    var pointer = 0;
                    angular.forEach(roles, function (role) {
                        var key = Object.keys(roles)[pointer++];
                        var r = {
                            name: key,
                            title: role.name
                        };
                        $scope.holder.allRoles.push(r);
                    });
                    $scope.holder.allRoles.push(DEFAULT_ROLE);
                    callback();
                },
                error: function (response) {
                    showToast($scope.translations.error[$scope.holder.language]);
                }
            });
    };

    var prepareRuleForDb = function (rule) {
        var ruleForDb = {
            id: rule.id,
            min_value: rule.min_value,
            max_value: rule.max_value,
            role: rule.role.name

        };
        return ruleForDb;
    };

    var getTitleForRoleName = function (roleName) {
        var title = '';
        angular.forEach($scope.holder.allRoles, function (roleObject) {
            if (roleObject.name === roleName) {
                roleTitle = roleObject.title;
            }
        });
        return title;
    };

    function reset() {
        $scope.ruleForm.minInput.$touched = false;
        $scope.ruleForm.maxInput.$touched = false;
    }

    function init() {

        // var lang = 'en';
        // if (lang && lang==='de') {
        //     $scope.holder.language = lang;
        // } else {
        //     $scope.holder.language = 'en';
        // }

        $scope.holder.loading = true;
        loadAllRoles(function () {
            loadRules();
            $scope.holder.init = true;
        });
        $scope.holder.rule = {};

    }

    function showToast(text) {
        $mdToast.show(
            $mdToast.simple()
                .textContent(text)
                .position('top left')
        );

    }

    $scope.saveOrUpdateRule = function (rule) {
        $scope.holder.saving = true;
        rule = prepareRuleForDb(rule);
        jQuery.ajax(
            {
                type: "post",
                dataType: "json",
                url: DATA_HOLDER.ajaxurl,
                data: {
                    'action': 'mmqfp_save_or_update_rule',
                    'rule': rule
                },
                success: function (response) {
                    showToast($scope.translations.success[$scope.holder.language]);
                    $scope.holder.persistedRules = [];
                    loadRules();
                    filterRoles();
                    rule.id = response.data;
                    rule.role = getTitleForRoleName(rule.role);
                    $scope.holder.rule = {};
                    $scope.holder.saving = false;
                    $scope.$apply();
                },
                error: function (response) {
                    showToast($scope.translations.error[$scope.holder.language]);
                    $scope.holder.saving = false;
                    $scope.holder.formIsCleared = true;
                    $scope.$apply();
                }
            });
    };

    $scope.deleteRule = function (rule, index) {
        jQuery.ajax(
            {
                type: "post",
                dataType: "json",
                url: DATA_HOLDER.ajaxurl,
                data: {
                    'action': 'mmqfp_delete_rule',
                    'id': rule.id
                },
                success: function (response) {
                    showToast($scope.translations.success[$scope.holder.language]);
                    $scope.holder.persistedRules.splice(index, 1);
                    filterRoles();
                    $scope.$apply();
                },
                error: function (response) {
                    showToast($scope.translations.error[$scope.holder.language]);
                    loadRules();
                    $scope.$apply();
                }
            });
    };



    $scope.orderByExpression = 'brand';
    $scope.reverse = false;

    $scope.sort = function (field) {
        if ($scope.orderByExpression === field) {
            $scope.reverse = !$scope.reverse;
        } else {
            $scope.orderByExpression = field;
            $scope.reverse = false;
        }

    };

    $scope.getSortClass = function (field) {
        if ($scope.orderByExpression === field) {
            if ($scope.reverse) {
                return 'fa-arrow-up margin-right-sm';
            }
            return 'fa-arrow-down margin-right-sm';
        }
    };

    init();

});