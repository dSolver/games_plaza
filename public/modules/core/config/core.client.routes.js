

// Setting up route
window.angular.module('core').config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
        // Redirect to home view when route not found
        $urlRouterProvider.otherwise('/');

        // Home state routing
        $stateProvider.
        state('home', {
            url: '/?tags&keyword&sortby&extag&view',
            templateUrl: 'modules/core/views/home.client.view.html',
            params: {
                tags: {
                    array: true,
                    squash: false
                },
                extags: {
                    array: true,
                    squash: false
                },
                keyword: {
                    squash: false
                },
                sortby: {
                    squash: false
                },
                view: {
                    squash: false
                }
            }
        }).
        state('about', {
            url: '/about',
            templateUrl: 'modules/core/views/about.client.view.html'
        }).
        state('privacy', {
            url: '/privacy',
            templateUrl: 'modules/core/views/privacy.client.view.html'
        }).
        state('terms', {
            url: '/terms',
            templateUrl: 'modules/core/views/terms.client.view.html'
        }).
        state('users', {
            url: '/users',
            templateUrl: 'modules/core/views/users.client.view.html'
        })
        .state('donate', {
            url: '/donate',
            templateUrl: 'modules/core/views/donate.client.view.html'
        })
        .state('subreddit',{
            url: '/r/incremental_games',
            template: '<subreddit></subreddit>'
        });

        
    }
]);