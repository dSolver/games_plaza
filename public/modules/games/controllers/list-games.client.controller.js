window.createGamesController = function($mdDialog, Games, CoreService, $location) {
    var vm = this;
    vm.game = {};
    CoreService.isReady('statuses').then(function() {
        vm.statuses = CoreService.getStatuses();
    });


    // Create new Game
    vm.create = function() {
        // Create new Game object

        if (vm.game.subreddit) {
            var r = vm.game.subreddit.split('/');
            vm.game.subreddit = r[r.length - 1];
        }

        var game = new Games({
            name: vm.game.name,
            link: vm.game.link,
            version: vm.game.version,
            subreddit: vm.game.subreddit,
            status: vm.game.status,
            shortDescription: vm.game.shortDescription,
            description: vm.game.description,
            youtube: vm.game.youtube,
            developer_twitter: vm.game.developer_twitter,
            twitch: vm.game.twitch,
            facebook: vm.game.facebook,
            googlePlay: vm.game.googlePlay,
            appStore: vm.game.appStore,
            windowsStore: vm.game.windowsStore
        });

        // Redirect after save
        game.$save(function(response) {
            $mdDialog.hide();
            $location.path('games/' + response.slug);

        }, function(errorResponse) {
            vm.error = errorResponse.data.message;
        });
    };

    vm.closeDialog = function() {
        $mdDialog.hide();
    };
}

// Games controller
window.angular.module('games').controller('ListGames', [
    'CoreService', 'Page', 'GamesService', '$stateParams', '$mdDialog', '$mdSidenav', '$location', 'Authentication', 'Games', '$timeout',
    function(CoreService, Page, GamesService, $stateParams, $mdDialog, $mdSidenav, $location, Authentication, Games, $timeout) {

        var vm = this;
        var criteria = $stateParams;
        var gameResults;
        vm.loading = true;
        vm.filters = {
            'Hide Reviewed': {
                on: false,
                fn: function(game) {
                    return Authentication.user && Authentication.user.reviewed.indexOf(game._id) < 0;
                }
            }
        };
        vm.displayMode = criteria.view || 'tile';
        vm.authentication = Authentication;

        vm.canCreatePlaylist = vm.authentication.user ? true : false;
        Page.title = 'Search List of Incremental Games';
        Page.description = 'Use the filter and tags to find games to fit your tastes, or just browse our collection';
        Page.keywords = 'Search, Filter, Games, List, Incremental, Idle, Playlist';

        function init(criteria) {
            updateURLParams(criteria);
            vm.games = CoreService.getGames();
            gameResults = GamesService.search(vm.games, criteria);
            vm.gamesDisplayed = [];
            vm.availableTags = getAvailableTags(gameResults);
            vm.loading = false;

            setGamesDisplayed();

        }

        function setGamesDisplayed() {
            /*var displayedLength = vm.gamesDisplayed.length;
            if (displayedLength < gameResults.length) {
                vm.gamesDisplayed.push(gameResults[displayedLength]);
                $timeout(function() {
                    setGamesDisplayed();
                }, 50);
            }*/
            vm.gamesDisplayed = gameResults.slice();
        }

        function getAvailableTags(games) {
            var tags = [];
            games.forEach(function(g) {
                g.tags.forEach(function(tag) {
                    if (!tags.some(function(t) {
                            return t === tag;
                        })) {
                        tags.push(tag);
                    }

                });
            });

            return tags;
        }

        function updateURLParams(search) {
            if (!search) {
                $location.search('keyword', null);
                $location.search('tags', null);
                $location.search('extags', null);
                $location.search('sortby', null);
                return;
            }
            if (search.keyword && search.keyword.length > 0) {
                $location.search('keyword', search.keyword);
            } else {
                $location.search('keyword', null);
            }

            if (search.tags && search.tags.length > 0) {
                $location.search('tags', search.tags.join(','));
            } else {
                $location.search('tags', null);
            }

            if (search.exclude && search.exclude.tags && search.exclude.tags.length > 0) {
                $location.search('extags', search.exclude.tags.join(','));
            } else {
                $location.search('extags', null);
            }

            if (search.view && search.view != 'tile') {
                $location.search('view', search.view);
            } else {
                $location.search('view', null);
            }
        }

        function applyFilters(games, filters) {
            return games.filter(function(game) {
                return Object.keys(filters).every(function(f) {
                    if (filters[f].on) {
                        return filters[f].fn(game);
                    } else {
                        return true;
                    }

                });
            });
        }

        //creating
        vm.openCreator = function(ev) {
            vm.error = null;
            if (vm.canCreateGame) {
                vm.game = {};

                $mdDialog.show({
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    templateUrl: '/modules/games/views/create-game.client.view.html',
                    controller: window.createGamesController,
                    controllerAs: 'vm'
                }).then(function() {

                }, function() {

                });
            }
        };

        vm.canCreateGame = !!Authentication.user;

        vm.applySearch = function(criteria) {
            updateURLParams(criteria);
            vm.searchResults = GamesService.search(vm.games, criteria);
            vm.applyFilters();
        };

        vm.applyFilters = function() {
            gameResults = applyFilters(vm.searchResults, vm.filters);
            vm.availableTags = getAvailableTags(gameResults);
            vm.gamesDisplayed = [];
            setGamesDisplayed();
        };

        vm.changeDisplayMode = function(view) {
            vm.displayMode = view;
            criteria.view = view;
            updateURLParams(criteria);
        };

        vm.showSearch = function() {
            $mdSidenav('searchBar').open();
        };

        CoreService.isReady('gamelist').then(function() {
            init(criteria);
        }, function(error) {
            vm.error = error;
        });
    }
]);