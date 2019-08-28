window.angular.module('core')
    .factory('CoreService', ['$q', '$http', '$timeout', 'Authentication',
        function($q, $http, $timeout, Authentication) {
            var ready = false;

            var errors = {};

            var data = {
                gamelist: window.games || []
            };

            var toLoad = [{
                api: 'api/tags',
                field: 'tags'
            }, {
                api: 'api/statuses',
                field: 'statuses'
            }];

            if (Authentication.user) {
                toLoad.push({
                    api: '/api/playlists/mine',
                    field: 'myplaylists'
                });
            }

            var loaded = 0;

            toLoad.forEach(function(req) {
                $http.get(req.api).then(function(response) {
                    data[req.field] = response.data;
                    loaded++;
                    if (loaded === toLoad.length) {
                        ready = true;
                    }
                }, function(error) {
                    errors[req.field] = error;
                });
            });

            var scoreThoughts = [
                '',
                'Horrible',
                'Bleh',
                'Meh',
                'Good',
                'Epic'
            ];


            function isReady(resource) {
                var deferred = $q.defer();

                function check() {
                    if (ready || (resource && data[resource])) {
                        deferred.resolve();
                    } else {
                        $timeout(function() {
                            check();
                        }, 100);
                    }
                }

                check();

                return deferred.promise;
            }

            function getGames() {
                return data.gamelist;
            }

            function getTags() {
                return data.tags;
            }

            function getStatuses() {
                return data.statuses;
            }

            function getMyPlaylists() {
                return data.myplaylists;
            }

            function isLoggedIn() {
                return !!Authentication.user;
            }

            function getGameById(gameId) {
                return data.gamelist.find(function(g) {
                    return g._id === gameId;
                });
            }

            return {
                isReady: isReady,
                ready: isReady,
                getTags: getTags,
                getGames: getGames,
                getStatuses: getStatuses,
                scoreThoughts: scoreThoughts,
                getMyPlaylists: getMyPlaylists,
                authentication: Authentication,
                isLoggedIn: isLoggedIn,
                getGameById: getGameById
            };

        }
    ]);
