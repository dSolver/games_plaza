

window.angular.module('users').controller('AuthenticationController', ['$scope', '$http', '$location', 'Authentication',
    function($scope, $http, $location, Authentication) {
        $scope.authentication = Authentication;

        // If user is signed in then redirect back home
        if ($scope.authentication.user) $location.path('/');

        function handleRedirect() {
            console.log('lastState', $scope.lastState);
            if ($scope.lastState) {
                $location.path($scope.lastState);
            } else {
                $location.path('/');
            }

        }

        $scope.signup = function() {
            $http.post('/auth/signup', $scope.credentials).success(function(response) {
                // If successful we assign the response to the global user model
                $scope.authentication.user = response;
                handleRedirect();

            }).error(function(response) {
                $scope.error = response.message;
            });
        };

        $scope.signin = function() {
            $http.post('/auth/signin', $scope.credentials).success(function(response) {
                // If successful we assign the response to the global user model
                $scope.authentication.user = response;
                handleRedirect();

            }).error(function(response) {
                $scope.error = response.message;
            });
        };
    }
]);