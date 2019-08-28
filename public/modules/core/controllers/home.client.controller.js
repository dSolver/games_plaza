


window.angular.module('core').controller('HomeController', ['$rootScope', '$state', 'CoreService', 'GamesService', 'Authentication', '$http', '$mdMedia', 'Page', 
    function($rootScope, $state, CoreService, GamesService, Authentication, $http, $mdMedia, Page) {
        var vm = this;

        vm.authentication = Authentication;

        var search;

        var len = 10;
        vm.searchIsReady = false;
        vm.newGames = (new Array(len)).fill({}); //blank
        vm.featuredGames = (new Array(len)).fill({}); //blanks
        
        
        Page.title = 'Incremental Games Plaza - Front Page';
        Page.description = 'Lists the featured games and newly added games. These incremental and idle games are curated by a community of redditors';


        CoreService.isReady('gamelist').then(function() {
            var gamelist = CoreService.getGames();
            vm.featuredGames = GamesService.sort(gamelist.filter(function(g) {
                return g.featured;
            }), 'Highest Rating');
            
            console.log(vm.featuredGames);
            vm.newGames = GamesService.sort(gamelist, 'Newest').filter(function(g){
                return !g.tags.includes('NSFW');
            }).slice(0, len);
            
        }, function(error) {
            vm.error = error;
        });

        vm.doSearch = function() {
            $state.go('listGames', search);
        };

        vm.setSearch = function(criteria) {
            search = criteria
        };


        vm.searchReady = function() {
            vm.searchIsReady = true;
        }

    }
]);
