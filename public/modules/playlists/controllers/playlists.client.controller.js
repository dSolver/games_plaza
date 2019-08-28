// Playlists controller
window.angular.module('playlists').controller('PlaylistsController', ['$rootScope', '$scope', 'Page', '$stateParams', '$location', '$mdToast', 'Authentication', 'Playlists', 'PlaylistGames', '$mdDialog',
    function($rootScope, $scope, Page, $stateParams, $location, $mdToast, Authentication, Playlists, PlaylistGames, $mdDialog) {
        $scope.authentication = Authentication;
        var lastGame;

        // Create new Playlist
        $scope.createPlaylist = function() {
            // Create new Playlist object
            var playlist = new Playlists({
                name: this.name
            });

            // Redirect after save
            playlist.$save(function(response) {
                $location.path('playlists/' + response._id);

                // Clear form fields
                $scope.name = '';
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Remove existing Playlist (only applies to own)
        $scope.remove = function(ev, playlist) {
            ev.stopPropagation();
            ev.preventDefault();

            if (playlist) {
                PlaylistGames.removeMine(playlist).then(function(response) {
                    $scope.findMine();
                }, function(error) {

                });
            }
        };

        // Update existing Playlist
        $scope.update = function() {
            var playlist = $scope.playlist;

            playlist.$update(function() {
                $location.path('playlists/' + playlist._id);
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Find a list of Playlists
        $scope.find = function() {
            $scope.playlists = Playlists.query();
            Page.title = 'Plaza - Playlists';
            Page.description = 'Create and curate your own list of games with the Plaza Playlists';


        };

        $scope.findMine = function() {
            $scope.myPlaylists = Playlists.query({ by: Authentication.user._id });

            /*$scope.loadMine = PlaylistGames.getMyPlaylists().then(function(playlist){
                console.log(playlist);
                console.log($scope.loadMine);
                $scope.myPlaylists = playlist;
            });
            console.log($scope.loadMine);*/
        };

        // Find existing Playlist
        $scope.findOne = function() {
            $scope.playlist = Playlists.get({
                playlistId: $stateParams.playlistId
            }, function(response) {
                Page.title = 'Plaza - ' + $scope.playlist.name;
                Page.description = $scope.playlist.description;
                if (response.user._id === Authentication.user._id) {
                    $scope.canEdit = true;
                    $scope.canPublish = !$scope.playlist.published;
                    $scope.newPlaylistName = $scope.playlist.name;
                } else {
                    $scope.canEdit = false;
                }

                if ($scope.playlist.published && Authentication.user) {
                    $scope.playlist.myVote = $rootScope.whatsMyVote($scope.playlist._id);
                }

                $scope.playable = $scope.playlist.games.filter(function(g) {
                    return g.playable;
                });

            });
        };

        $scope.openInLounge = function() {
            $scope.playable.forEach(function(g) {
                $rootScope.openGameInLounge(g._id);
            });

            $rootScope.openLounge = true;
        }

        $scope.deleteGame = function(ev, game) {
            ev.preventDefault();
            ev.stopPropagation();

            $scope.playlist.games.splice($scope.playlist.games.indexOf(game), 1);
            $scope.playlist.$update(function() {

                lastGame = game;
                var toast = $mdToast.simple()
                    .position('top right')
                    .textContent(game.name + ' Deleted')
                    .action('Undo')
                    .hideDelay(6000)
                    .highlightAction(true);

                $mdToast.show(toast).then(function(response) {
                    console.log(response);
                    if (response == 'ok') {
                        $scope.undoDelete();
                    }
                });
            });
        };

        $scope.undoDelete = function() {
            if (lastGame) {
                $scope.playlist.games.push(lastGame);
                $scope.playlist.$update(function() {
                    lastGame = null;
                    $mdToast.show($mdToast.simple().position('top right').textContent('Undo delete game'))
                })
            }
        };

        $scope.toggleEditName = function() {
            if ($scope.canEdit) {
                $scope.showEditName = !$scope.showEditName;
                if ($scope.showEditName) {
                    $scope.newPlaylistName = $scope.playlist.name;
                }
            }
        };

        $scope.updateName = function() {
            $scope.newPlaylistName.trim();
            if ($scope.newPlaylistName.length > 0) {
                $scope.playlist.name = $scope.newPlaylistName;
                $scope.playlist.$update();
            } else {
                $scope.newPlaylistName = $scope.playlist.name;
            }
        };

        $scope.startEditDescription = function() {
            if ($scope.canEdit) {
                $scope.newPlaylistDescription = $scope.playlist.description;
                $scope.showDescriptionEditor = true;
            }
        };

        $scope.updateDescription = function() {
            $scope.playlist.description = $scope.newPlaylistDescription;
            $scope.playlist.$update(function(response) {
                $scope.playlist = response;
            });
            $scope.showDescriptionEditor = false;
        };

        $scope.cancelEditDescription = function() {
            $scope.showDescriptionEditor = false;
        };

        $scope.publish = function() {
            if ($scope.canPublish) {
                $scope.publishing = true;
                PlaylistGames.setPublic($scope.playlist._id).then(function(response) {
                    $scope.canPublish = false;
                    $scope.playlist.published = true;
                    $scope.publishing = false;
                }, function(error) {
                    $scope.publishing = false;
                });
            }
        };

        $scope.vote = function(val) {
            if (val == $scope.playlist.myVote) {
                $scope.playlist.myVote = 0;
            } else {
                $scope.playlist.myVote = val;
            }

            /*$http.post('/playlists/' + $scope.playlist._id + '/vote', {
                v: $scope.playlist.myVote
            }).then(function(response) {
                var data = response.data;
                $scope.playlist.score = data.score;
                $scope.playlist.liked = data.liked;
                $scope.playlist.disliked = data.disliked;
            }, function(error) {

            });*/
            console.log($scope.playlist);

            var ret = Playlists.vote({
                playlistId: $scope.playlist._id
            }, {
                vote: $scope.playlist.myVote
            }, function(res) {
                $scope.playlist.liked = res.liked;
                $scope.playlist.disliked = res.disliked;
                $scope.playlist.score = res.score;
            });
        };
    }
]);
