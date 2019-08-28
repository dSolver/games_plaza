'use strict';

// Init the application configuration module for AngularJS application
window.ApplicationConfiguration = (function() {
    // Init module configuration options
    var applicationModuleName = 'workshop';
    var applicationModuleVendorDependencies = ['ngResource', 'ngCookies', 'ngAnimate', 'ngMessages', 'ngSanitize', 'ui.router', 'ui.utils', 'ngMaterial', 'ngFileUpload', 'QuickList', 'angular-carousel', 'angularMoment', 'luegg.directives'];

    // Add a new vertical module
    var registerModule = function(moduleName, dependencies) {
        // Create angular module
        angular.module(moduleName, dependencies || []);

        // Add the module to the AngularJS configuration file
        angular.module(applicationModuleName).requires.push(moduleName);
    };

    return {
        applicationModuleName: applicationModuleName,
        applicationModuleVendorDependencies: applicationModuleVendorDependencies,
        registerModule: registerModule
    };
})();