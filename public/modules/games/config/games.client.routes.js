

//Setting up route
window.angular.module('games').config(['$stateProvider',
    function($stateProvider) {
        // Games state routing
        $stateProvider.
        state('listGames', {
            url: '/games?tags&keyword&sortby&extag&view',
            templateUrl: 'modules/games/views/list-games.client.view.html',
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
            },
            reloadOnSearch: false
        }).
        state('listAndroidGames',{
            url: '/android-games',
            templateUrl: 'modules/games/views/list-android-games.client.view.html',
            controller: 'ListTagGamesController'
        }).
        state('listiOSGames',{
            url: '/ios-games',
            templateUrl: 'modules/games/views/list-ios-games.client.view.html',
            controller: 'ListTagGamesController'
        }).
        state('viewGame', {
            url: '/games/:gameId',
            templateUrl: 'modules/games/views/view-game.client.view.html',
            controller: 'GamesController'
        }).
        state('playground', {
            url: '/lounge',
            templateUrl: 'modules/games/views/playground.client.view.html',
            controller: 'PlaygroundController',
            params:{
                games: {
                    array: true,
                    squash: false
                }
            },
            reloadOnSearch: false
        });
    }
]);