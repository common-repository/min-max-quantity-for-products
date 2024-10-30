var app = angular.module('plugin', ['ngMaterial', 'ngAnimateCss', 'ngMessages']);
app.config(function ($mdThemingProvider) {

    $mdThemingProvider.theme('default')
        .primaryPalette('blue')
        .accentPalette('brown');
});