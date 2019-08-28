window.angular.module('core').factory('SubredditService', ['$http', function($http) {
    return {
        get: function(){
        	return $http.get('api/subreddit');
        }
    };
}]);
