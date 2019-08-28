

// Users service used for communicating with the users REST endpoint
window.angular.module('users').factory('Profiles', ['$resource',
    function($resource) {
        return $resource('api/m/:username', {
            username: '@username'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);