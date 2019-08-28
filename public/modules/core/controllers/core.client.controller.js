

window.angular.module('core').controller('CoreController', ['$rootScope', '$scope', '$mdMedia', '$stateParams', 'Authentication', 'Page', '$mdToast', '$mdSidenav', '$http', '$location', '$state', '$mdDialog', '$timeout', 'Games', 'Playlists',
    function($rootScope, $scope, $mdMedia, $stateParams, Authentication, Page, $mdToast, $mdSidenav, $http, $location, $state, $mdDialog, $timeout, Games, Playlists) {

        $scope.Page = Page;

        $rootScope.$on('$stateChangeSuccess', function(event) {
            window.ga('send', 'pageview', $location.path());
            $scope.curPath = $location.path();
            Page.reset();
        });

        var setTagsWhenLoaded = false,
            setStatusesWhenLoaded = false,
            setKeywordWhenLoaded = false;

        $scope.tags = [];

        $scope.authentication = Authentication;

        var localPrefs = $rootScope.localPrefs = (window.localStorage.getItem('localPrefs') ? JSON.parse(window.localStorage.getItem('localPrefs')) : {});

        $scope.updateLocalPrefs = function() {
            window.localStorage.setItem('localPrefs', JSON.stringify($rootScope.localPrefs));
        };

        $rootScope.openDialog = function(scope, ev, templateURL, controller, onclose, oncancel) {
            $rootScope.mdDialogOpen = true;
            var preserveScope = false;

            if (!controller) {
                controller = function() {};
                preserveScope = true;
            }

            $mdDialog.show({
                scope: scope,
                preserveScope: preserveScope,
                targetEvent: ev,
                clickOutsideToClose: true,
                templateUrl: templateURL,
                controller: controller,
                disableParentScroll: true
            }).then(function() {
                $rootScope.mdDialogOpen = false;
            }, function() {
                $rootScope.mdDialogOpen = false;
            });
        };

        $rootScope.closeDialog = function() {
            $mdDialog.hide();
            $rootScope.mdDialogOpen = false;
        };

        $rootScope.mdDialogOpen = false;

        $scope.goto = function(state, href) {
            if (href) {
                window.location = state;
            } else {
                $state.go(state);
            }
        };

        $rootScope.whatsMyVote = function(id) {
            if ($scope.authentication.user) {
                if ($scope.authentication.user.liked.indexOf(id) >= 0) {
                    return 1;
                } else if ($scope.authentication.user.disliked.indexOf(id) >= 0) {
                    return -1;
                }
            }
            return 0;
        };
        

        $scope.getNotifications = function(init) {
            if ($scope.authentication.user) {
                $scope.drawer.busy = true;
                $http.get('/api/notifications').then(function(response) {
                    var faketime = init ? 0 : 1000;
                    $timeout(function() {
                        $scope.drawer.busy = false;
                        $scope.notifications = response.data;


                        $scope.hasUnread = $scope.notifications.some(function(n) {
                            return !n.read
                        });

                    }, faketime);


                }, function(error) {

                });
            }
        };

        $scope.readNotification = function(notification) {
            notification.read = true;
            $http.put('/api/notification/' + notification._id);
            $scope.hasUnread = $scope.notifications.some(function(n) {
                return !n.read
            });

        };
        
        $scope.showLounge = function(evt){
            evt.stopPropagation();
            evt.preventDefault();
            
            $rootScope.openLounge = true;
        };

        $rootScope.openPlaylistCreator = function(ev, game) {
            $scope.error = null;
            if ($scope.canCreatePlaylist) {
                $scope.playlist = {
                    games: [game._id]
                };
                $rootScope.openDialog($scope, ev, '/modules/playlists/views/create-playlist.client.view.html');
            }
        };

        $rootScope.openPlaylistMgr = function(ev, game) {

            ev.stopPropagation();
            ev.preventDefault();
            $scope.playlists = [];
            $scope.loadingPlaylist = true;
            /*
            CoreService.isReady('myplaylists').then(function(){
                var playlists = CoreService.getMyPlaylists();
            });*/

            $http.get('/api/playlists/mine').then(function(response) {
                $scope.playlists = response.data;
                $scope.loadingPlaylist = false;
            }, function(error) {
                $scope.error = 'Cannot load playlists';
            });

            $scope.focusedGame = game;
            $scope.playlistState = 'list';
            $rootScope.openDialog($scope, ev, '/modules/playlists/views/manager.client.view.html');

        };

        $rootScope.createNewPlaylist = function() {
            $scope.playlist = {
                games: [$scope.focusedGame._id]
            };

            $scope.playlistState = 'create';
        };

        $scope.createPlaylist = function() {
            //create new playlist object

            var playlist = new Playlists({
                name: $scope.playlist.name,
                description: $scope.playlist.description,
                games: $scope.playlist.games
            });

            playlist.$save(function(response) {
                $scope.closeDialog();
            })
        };

        $scope.tryAdd = function(playlist) {
            var game = $scope.focusedGame;
            if (playlist.games.indexOf(game._id) === -1) {
                playlist.games.push(game._id);
                $http.put('/api/playlists/' + playlist._id, { games: playlist.games }).then(function(response) {
                    $scope.closeDialog();
                    $mdToast.show($mdToast.simple().position('top right').textContent(game.name + ' added to ' + playlist.name));
                }, function(error) {
                    console.log(error);
                });
            }
        };


        $scope.drawer = {
            opened: false,
            toggle: function() {
                $mdSidenav('notificationDrawer').toggle();
            },
            busy: false,

        };

        $scope.getNotifications(true);

        $scope.issm = function(){
            return $mdMedia('sm') || $mdMedia('xs')
        };

    }
]);
