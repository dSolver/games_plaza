

//Games service used to communicate Games REST endpoints
window.angular.module('games').factory('Games', ['$resource',
    function($resource) {
        return $resource('api/games/:gameId', {
            gameId: '@_id'
        }, {
            update: {
                method: 'PUT'
            },
            findSimilar: {
                url: 'api/games/:gameId/similar',
                method: 'GET',
                isArray: true
            }
        });
    }
]).factory('Reviews', ['$resource',
    function($resource) {
        return $resource('api/reviews/:reviewId', {
            reviewId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]).factory('GamesService', ['$q', '$http', 'Games', function($q,$http, Games){
    
    var sortFn =  {
        'Newest': function(a, b){
            return (new Date(b.created)) - (new Date(a.created));
        },
        'Most Likes': function(a, b){
            if(b.liked === a.liked){
                return sortFn['Newest'](a, b);
            } else {
                return b.liked - a.liked;
            }
        },
        'Highest Rating': function(a, b){
            if(b.score === a.score){
                return sortFn['Most Likes'](a, b);
            } else {
                return b.score - a.score;
            }
        },
        'Most Views': function(a, b){
            if(b.viewed === a.viewed){
                return sortFn['Highest Rating'](a, b);
            } else {
                return b.viewed - a.viewed;
            }
        },
        'Alphabetical': function(a, b){
            return ((a.name == b.name) ? 0 : (a.name < b.name ? -1 : 1));
        }
    }
    
    var sort = function(list, sortBy){
        return list.sort(sortFn[sortBy])
    }
    
    return {
        search: search,
        sort: sort,
        sortBys: Object.keys(sortFn),
        like: function(gameId){
            return $http.put('/api/games/' + gameId + '/like');
        },
        unlike: function(gameId){
            return $http.put('/api/games/' + gameId + '/unlike');
        }
    };
    
    
    
    function simplify(str){
        var acceptedChars = (' abcdefghijklmnopqrstuvwxyz0123456789-_').split('');
    
        str = str.replace(/[àáâãäå]/g,'a');
        str = str.replace(/[èéêë]/g, 'e');
        str = str.replace(/[ìíîï]/g, 'i');
        str = str.replace(/[òóôõö]/g, 'o');
        str = str.replace(/[ùúûü]/g, 'u');
        str = str.replace(/[ñ]/g, 'u');
        str = str.replace(/[ýÿ]/g, 'y');
    
        return str.split('').filter(function(s){
           return acceptedChars.indexOf(s)>=0
        }).join('');
    }
    
    function checkExclusion(criteria, game){
        var tag = true;
        var id = true;
        if(criteria.tags){
            tag = criteria.tags.every(function(t){
                return game.tags.indexOf(t) < 0
            });
        }
        if(criteria.gameIds){
            id = criteria.gameIds.indexOf(game._id) < 0;
        }
        
        return tag && id;
    }
    
    /** returns a list of games **/
    function search(list, criteria){
        if(!list){
            list = [];
        }

        if(criteria){
            if(criteria.keyword){
                criteria.keyword = simplify(criteria.keyword.toLowerCase());
            }
            if(!criteria.sortBy){
                criteria.sortBy = 'Highest Rating';
            }
            return sort(list.filter(function(game){
                
                // hasTag: either no tags were selected or false if any tag selected is not in the game's tags array.
                var hasTag = !criteria.tags || !criteria.tags.some(function(t){
                    return game.tags.indexOf(t) < 0
                });
                
                var hasKeyword = !criteria.keyword || simplify(game.name.toLowerCase()).indexOf(criteria.keyword) >= 0
                
                var isExcluded = !criteria.exclude || checkExclusion(criteria.exclude, game);
                
                return hasTag && hasKeyword && isExcluded;
            }), criteria.sortBy);
        } else {
            return sort(list.slice(), 'Highest Rating');
        }
        
    }
    
}]);