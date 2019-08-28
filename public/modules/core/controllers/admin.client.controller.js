

window.angular.module('core').controller('AdminController', ['$rootScope', '$scope', 'Authentication', '$mdSidenav', '$http', '$location', '$state', '$mdDialog', '$timeout',
    function($rootScope, $scope, Authentication, $mdSidenav, $http, $location, $state, $mdDialog, $timeout) {


        $scope.getUsers = function() {
            if (!$scope.users) {
                $scope.users = [];
                var userRoles = ['admin', 'contrib', 'user'];
                $http.get('/users').success(function(data) {
                    $scope.users = data;
                    angular.forEach($scope.users, function(user) {
                        user.roleObj = {};

                        for (var i = 0; i < userRoles.length; i++) {
                            user.roleObj[userRoles[i]] = {
                                role: userRoles[i],
                                on: (user.roles.indexOf(userRoles[i]) >= 0 ? true : false)
                            };
                        }
                        console.log(user.username, user.roleObj);
                    });
                });
            }
        };


        $scope.updateUser = function(user) {
            console.log(user.roleObj);
            var roles = [];
            for (var role in user.roleObj) {
                if (user.roleObj[role].on) {
                    roles.push(user.roleObj[role].role);
                }
            }

            $http.post('/api/user/' + user._id + '/changeRoles', {
                roles: roles
            }).success(function(data) {

                user.updateSuccess = true;
                $timeout(function() {
                    user.updateSuccess = false;
                }, 3000);
            }).error(function(data) {

            });
        };
    }
]);