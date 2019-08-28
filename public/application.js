'use strict';

//Start by defining the main module and adding the module dependencies
window.app = angular.module(window.ApplicationConfiguration.applicationModuleName, window.ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
window.app.config(['$locationProvider', '$mdIconProvider', '$mdThemingProvider', '$sceDelegateProvider', '$httpProvider',
    function($locationProvider, $mdIconProvider, $mdThemingProvider, $sceDelegateProvider, $httpProvider) {
        //$locationProvider.hashPrefix('!');
        $locationProvider.html5Mode(true).hashPrefix('!');
        var customCyan = $mdThemingProvider.extendPalette('indigo', {
            'contrastDefaultColor': 'light'
        });

        var customGrey = $mdThemingProvider.extendPalette('grey', {
            'A100': 'f0f0f0'
        });
        $mdThemingProvider.definePalette('customCyan', customCyan);
        $mdThemingProvider.definePalette('customGrey', customGrey);
        $mdThemingProvider.theme('default')
            .primaryPalette('customCyan')
            .accentPalette('indigo')
            .backgroundPalette('customGrey');

        $sceDelegateProvider.resourceUrlWhitelist([
            'https://www.youtube.com/**',
            'https://www.youtu.be/**',
            'http://localhost:3456/**',
            'http://dsolver.ca/**',
            'self'
        ]);

        (function(i, s, o, g, r, a, m) {
            i['GoogleAnalyticsObject'] = r;
            i[r] = i[r] || function() {
                (i[r].q = i[r].q || []).push(arguments)
            }, i[r].l = 1 * new Date();
            a = s.createElement(o),
                m = s.getElementsByTagName(o)[0];
            a.async = 1;
            a.src = g;
            m.parentNode.insertBefore(a, m)
        })(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');
    }
]);

window.app.constant('moment', window.moment);