

window.angular.module('users').controller('ProfileController', ['$scope', '$http', '$location', 'Page', '$stateParams', '$mdDialog', 'Users', 'Profiles', 'Authentication', 'Playlists',
    function($scope, $http, $location, Page, $stateParams, $mdDialog, Users, Profiles, Authentication, Playlists) {
        $scope.user = Authentication.user;


        $scope.findUser = function() {
            Page.title = ('Plaza Profile - '+$stateParams.username);

            $scope.profile = Profiles.get({
                username: $stateParams.username
            }, function() {
                $scope.profile.reviewcount = $scope.profile.reviewed.length;
                if (Authentication.user) {
                    $scope.isCurrentUser = Authentication.user._id === $scope.profile._id;
                }
                console.log($scope.profile);
                $http.get('/api/games/by/' + $stateParams.username).then(function(response) {
                    $scope.gamesCreated = response.data;
                }, function(err) {

                });

                $scope.playlistsPublished = Playlists.query({by: $scope.profile._id})

            }, function() {
                $scope.profile = null;
                $scope.notfound = true;
            });
        };


        $scope.openProfileEditor = function(ev) {
            if ($scope.profile._id === Authentication.user._id) {
                $scope.closeDialog();

                $scope.openDialog($scope, ev, '/modules/users/views/profile-edit.client.view.html');

            }
        };

        $scope.update = function(ev) {
            $http.put('/api/users', {

                tagline: $scope.profile.tagline,
                intro: $scope.profile.intro
            }).then(function(response) {
                $scope.profile.tagline = response.data.tagline;
                $scope.profile.introHTML = response.data.introHTML;
                $scope.closeDialog();
            }, function(err) {
                $scope.profileUpdateError = err;
            });
        }

    }
]);
