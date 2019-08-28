'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function() {
    // Init module configuration options
    var applicationModuleName = 'workshop';
    var applicationModuleVendorDependencies = ['ngResource', 'ngCookies', 'ngAnimate', 'ngMessages', 'ngSanitize', 'ui.router', 'ui.utils', 'ngMaterial', 'ngFileUpload', 'QuickList', 'angular-carousel', 'angularMoment', 'luegg.directives'];

    // Add a new vertical module
    var registerModule = function(moduleName, dependencies) {
        // Create angular module
        angular.module(moduleName, dependencies || []);

        // Add the module to the AngularJS configuration file
        angular.module(applicationModuleName).requires.push(moduleName);
    };

    return {
        applicationModuleName: applicationModuleName,
        applicationModuleVendorDependencies: applicationModuleVendorDependencies,
        registerModule: registerModule
    };
})();
'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider', '$mdIconProvider', '$mdThemingProvider', '$sceDelegateProvider',
    function($locationProvider, $mdIconProvider, $mdThemingProvider, $sceDelegateProvider) {
        //$locationProvider.hashPrefix('!');
        $locationProvider.html5Mode(true);
        var customCyan = $mdThemingProvider.extendPalette('indigo', {
            'contrastDefaultColor': 'light'
        });

        var customGrey = $mdThemingProvider.extendPalette('grey', {
            'A100': 'f0f0f0'
        });
        $mdThemingProvider.definePalette('customCyan', customCyan);
        $mdThemingProvider.definePalette('customGrey', customGrey);
        $mdThemingProvider.theme('default')
            .primaryPalette('customCyan')
            .accentPalette('indigo')
            .backgroundPalette('customGrey');

        $sceDelegateProvider.resourceUrlWhitelist([
            'https://www.youtube.com/**',
            'https://www.youtu.be/**',
            'http://localhost:3456/**',
            'http://dsolver.ca/**',
            'self'
        ]);

        (function(i, s, o, g, r, a, m) {
            i['GoogleAnalyticsObject'] = r;
            i[r] = i[r] || function() {
                (i[r].q = i[r].q || []).push(arguments)
            }, i[r].l = 1 * new Date();
            a = s.createElement(o),
                m = s.getElementsByTagName(o)[0];
            a.async = 1;
            a.src = g;
            m.parentNode.insertBefore(a, m)
        })(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');
    
        
    }
]);

angular.module(ApplicationConfiguration.applicationModuleName).constant('moment', moment);

//Then define the init function for starting up the application
angular.element(document).ready(function() {
    //Fixing facebook bug with redirect
    if (window.location.hash === '#_=_') window.location.hash = '#!';

    //Then init the app
    angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('articles');
'use strict';

// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('comments');
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');
'use strict';

// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('discussions');
'use strict';

// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('fileuploads');
'use strict';

// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('games');
'use strict';

// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('playlists');
'use strict';

// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('reviews');
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('users');
'use strict';

// Setting up route
angular.module('articles').config(['$stateProvider',
	function($stateProvider) {
		// Articles state routing
		$stateProvider.
		state('listArticles', {
			url: '/articles',
			templateUrl: 'modules/articles/views/list-articles.client.view.html'
		}).
		state('createArticle', {
			url: '/articles/create',
			templateUrl: 'modules/articles/views/create-article.client.view.html'
		}).
		state('viewArticle', {
			url: '/articles/:articleId',
			templateUrl: 'modules/articles/views/view-article.client.view.html'
		}).
		state('editArticle', {
			url: '/articles/:articleId/edit',
			templateUrl: 'modules/articles/views/edit-article.client.view.html'
		});
	}
]);
'use strict';

angular.module('articles').controller('ArticlesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Articles',
	function($scope, $stateParams, $location, Authentication, Articles) {
		$scope.authentication = Authentication;

		$scope.create = function() {
			var article = new Articles({
				title: this.title,
				content: this.content
			});
			article.$save(function(response) {
				$location.path('articles/' + response._id);

				$scope.title = '';
				$scope.content = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.remove = function(article) {
			if (article) {
				article.$remove();

				for (var i in $scope.articles) {
					if ($scope.articles[i] === article) {
						$scope.articles.splice(i, 1);
					}
				}
			} else {
				$scope.article.$remove(function() {
					$location.path('articles');
				});
			}
		};

		$scope.update = function() {
			var article = $scope.article;

			article.$update(function() {
				$location.path('articles/' + article._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.find = function() {
			$scope.articles = Articles.query();
		};

		$scope.findOne = function() {
			$scope.article = Articles.get({
				articleId: $stateParams.articleId
			});
		};
	}
]);
'use strict';

//Articles service used for communicating with the articles REST endpoints
angular.module('articles').factory('Articles', ['$resource',
	function($resource) {
		return $resource('articles/:articleId', {
			articleId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
'use strict';

//Setting up route
angular.module('comments').config(['$stateProvider',
	function($stateProvider) {
		// Comments state routing
		$stateProvider.
		state('listComments', {
			url: '/comments',
			templateUrl: 'modules/comments/views/list-comments.client.view.html'
		}).
		state('createComment', {
			url: '/comments/create',
			templateUrl: 'modules/comments/views/create-comment.client.view.html'
		}).
		state('viewComment', {
			url: '/comments/:commentId',
			templateUrl: 'modules/comments/views/view-comment.client.view.html'
		}).
		state('editComment', {
			url: '/comments/:commentId/edit',
			templateUrl: 'modules/comments/views/edit-comment.client.view.html'
		});
	}
]);
'use strict';

// Comments controller
angular.module('comments').controller('CommentsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Comments',
	function($scope, $stateParams, $location, Authentication, Comments) {
		$scope.authentication = Authentication;

		// Create new Comment
		$scope.create = function() {
			// Create new Comment object
			var comment = new Comments ({
				name: this.name
			});

			// Redirect after save
			comment.$save(function(response) {
				$location.path('comments/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Comment
		$scope.remove = function(comment) {
			if ( comment ) { 
				comment.$remove();

				for (var i in $scope.comments) {
					if ($scope.comments [i] === comment) {
						$scope.comments.splice(i, 1);
					}
				}
			} else {
				$scope.comment.$remove(function() {
					$location.path('comments');
				});
			}
		};

		// Update existing Comment
		$scope.update = function() {
			var comment = $scope.comment;

			comment.$update(function() {
				$location.path('comments/' + comment._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Comments
		$scope.find = function() {
			$scope.comments = Comments.query();
		};

		// Find existing Comment
		$scope.findOne = function() {
			$scope.comment = Comments.get({ 
				commentId: $stateParams.commentId
			});
		};
	}
]);
'use strict';

//Comments service used to communicate Comments REST endpoints
angular.module('comments').factory('Comments', ['$resource',
	function($resource) {
		return $resource('comments/:commentId', { commentId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
        // Redirect to home view when route not found
        $urlRouterProvider.otherwise('/');

        // Home state routing
        $stateProvider.
        state('home', {
            url: '/',
            templateUrl: 'modules/core/views/home.client.view.html'
        }).
        state('about', {
            url: '/about',
            templateUrl: 'modules/core/views/about.client.view.html'
        }).
        state('privacy', {
            url: '/privacy',
            templateUrl: 'modules/core/views/privacy.client.view.html'
        }).
        state('terms', {
            url: '/terms',
            templateUrl: 'modules/core/views/terms.client.view.html'
        }).
        state('users', {
            url: '/users',
            templateUrl: 'modules/core/views/users.client.view.html'
        })
        .state('subreddit',{
            url: '/r/incremental_games',
            template: '<subreddit></subreddit>'
        })
    }
]);
'use strict';

angular.module('core').controller('AdminController', ['$rootScope', '$scope', 'Authentication', '$mdSidenav', '$http', '$location', '$state', '$mdDialog', '$timeout',
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
'use strict';

angular.module('core').controller('CoreController', ['$rootScope', '$scope', '$mdMedia', '$stateParams', 'CoreService', 'Page', '$mdToast', '$mdSidenav', '$http', '$location', '$state', '$mdDialog', '$timeout', 'Games', 'Playlists',
    function($rootScope, $scope, $mdMedia, $stateParams, CoreService, Page, $mdToast, $mdSidenav, $http, $location, $state, $mdDialog, $timeout, Games, Playlists) {

        $scope.Page = Page;

        $rootScope.$on('$stateChangeSuccess', function(event) {
            window.ga('send', 'pageview', $location.path());
            $scope.curPath = $location.path();
            Page.setTitle('Incremental Games Plaza');
        });

        var setTagsWhenLoaded = false,
            setStatusesWhenLoaded = false,
            setKeywordWhenLoaded = false;

        $scope.tags = [];

        $scope.authentication = CoreService.authentication;

        var localPrefs = $rootScope.localPrefs = (window.localStorage.getItem('localPrefs') ? JSON.parse(window.localStorage.getItem('localPrefs')) : {});

        $scope.updateLocalPrefs = function() {
            window.localStorage.setItem('localPrefs', JSON.stringify($rootScope.localPrefs));
        };

        $scope.openDialog = function(scope, ev, templateURL, controller, onclose, oncancel) {
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
                parent: angular.element('document'),
                disableParentScroll: true
            }).then(function() {
                $rootScope.mdDialogOpen = false;
            }, function() {
                $rootScope.mdDialogOpen = false;
            });
        };

        $scope.closeDialog = function() {
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

        $rootScope.openPlaylistCreator = function(ev, game) {
            $scope.error = null;
            if ($scope.canCreatePlaylist) {
                $scope.playlist = {
                    games: [game._id]
                };
                $scope.openDialog($scope, ev, '/modules/playlists/views/create-playlist.client.view.html');
            }
        };

        $rootScope.openPlaylistMgr = function(ev, game) {

            ev.stopPropagation();
            ev.preventDefault();
            $scope.playlists = [];
            $scope.loadingPlaylist = true;
            CoreService.isReady('myplaylists').then(function(){
                var playlists = CoreService.getMyPlaylists();
            })
            $http.get('/api/playlists/mine').then(function(response) {
                $scope.playlists = response.data;
                $scope.loadingPlaylist = false;
            }, function(error) {
                $scope.error = 'Cannot load playlists';
            });

            $scope.focusedGame = game;
            $scope.playlistState = 'list';
            $scope.openDialog($scope, ev, '/modules/playlists/views/manager.client.view.html');

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

'use strict';


angular.module('core').controller('HomeController', ['$rootScope', '$state', 'CoreService', 'GamesService', 'Authentication', '$http', '$mdMedia', 
    function($rootScope, $state, CoreService, GamesService, Authentication, $http, $mdMedia) {
        var vm = this;
        
        vm.authentication = Authentication;
        
        var search;

        var len = 10;
        vm.searchIsReady = false;
        vm.newGames = (new Array(len)).fill({}); //blank
        vm.featuredGames = (new Array(len)).fill({}); //blanks
        
        CoreService.isReady('gamelist').then(()=>{
            var gamelist = CoreService.getGames();
            vm.featuredGames = GamesService.sort(gamelist.filter((g)=>{
                return g.featured;
            }), 'Highest Rating');
            
            console.log(vm.featuredGames);
            vm.newGames = GamesService.sort(gamelist, 'Newest').slice(0, len);
        }, (error)=>{
            vm.error = error;
        });

        vm.doSearch = function(){
            $state.go('listGames', search);
        };

        vm.setSearch = function(criteria){
            search = criteria
        };


        vm.searchReady = function(){
            vm.searchIsReady = true;
        }
        
    }
]);

(function () {

    'use strict';

    angular.module('core').

    service('Adsense', function(){
        this.url = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
        this.isAlreadyLoaded = false;
    }).

    directive('adsense', function () {
        return {
            restrict: 'E',
            replace: true,
            scope : {
                adClient : '@',
                adSlot : '@',
                inlineStyle : '@',
                adFormat : '@'
            },
            template: '<div class="ads"><ins class="adsbygoogle" data-ad-client="{{adClient}}" data-ad-slot="{{adSlot}}" style="{{inlineStyle}}" data-ad-format="{{adFormat}}"></ins></div>',
            controller: ['Adsense', 'Authentication', '$timeout', function (Adsense, Authentication, $timeout) {
                this.user = Authentication.user;
                if (!Adsense.isAlreadyLoaded && this.user) {
                    var s = document.createElement('script');
                    s.type = 'text/javascript';
                    s.src = Adsense.url;
                    s.async = true;
                    document.body.appendChild(s);

                    Adsense.isAlreadyLoaded = true;
                }
                /**
                 * We need to wrap the call the AdSense in a $apply to update the bindings.
                 * Otherwise, we get a 400 error because AdSense gets literal strings from the directive
                 */
                $timeout(function(){
                     (window.adsbygoogle = window.adsbygoogle || []).push({});
                }, 100);
            }]
        };
    });
}());

angular.module('core').component('subreddit', {
	controller: SubredditController,
	template: `
		<div class="md-title">/r/incremental_games</div>
		<div ng-repeat='post in $ctrl.posts track by $index' layout="row" class="subreddit-post">
			<div class="subreddit-score" ng-bind="post.score">
			</div>
			<div class="subreddit-post-content">
				<div class="post-title" layout="row" layout-align="start start">
					<span class="post-flair" ng-bind="post.link_flair_text" hide-xs></span> 
					<span>
						<a ng-href="{{post.url}}" target="_new">{{post.title}}</a>
						<span class="post-domain" hide-xs>({{post.domain}})</span>
					</span>
				</div>
				<div class="post-details">
					<a ng-href="https://www.reddit.com/u/{{post.author}}">{{post.author}}</a>
					
					<span am-time-ago="post.created"></span>

					<a ng-href="https://www.reddit.com{{post.permalink}}" target="_new">{{post.num_comments}} comment{{post.num_comments>1?'s':''}}</a>
				</div>
				<div class="post-game" ng-if="!post.nogame">
					<div ng-if="post.game">
						<a ng-href="/game/{{post.game.slug}}" ng-bind="post.game.name" class="post-gamelink"></a>
						<span ng-repeat="tag in post.game.tags track by $index" class="tag {{tag}}">{{tag}}</span>
					</div>
					<div ng-if="!post.game" class="plaza-fail">
						The Plaza could not figure out which game this post is about. <a href="#" ng-click="$ctrl.explain($event)">Learn More</a>
					</div>
				</div>
			</div>
			<div class="post-thumb">
				<img ng-if="post.thumbnail" ng-src="{{post.thumbnail}}">
			</div>
		</div>
	`
});

function SubredditController(SubredditService, $mdDialog){
	"ngInject";
	SubredditService.get().then((resp)=>{
		this.posts = resp.data;
		this.posts.forEach(function(post){
			post.created = new Date(post.created_utc*1000);
		});
		console.log(this.posts);
	})

	this.explain = function(ev){
		ev.preventDefault();
		$mdDialog.show(
			$mdDialog.alert()
				.clickOutsideToClose(true)
				.title('The Plaza could not detect the game')
				.textContent('Either the name of the game is not in the post title, or The Plaza does not have this game yet. Please add it!')
				.ariaLabel('The Plaza could not detect the game because the name is not in the title, or the Plaza does not have the game')
				.ok('Cool. Cool-cool-cool')
				.targetEvent(ev)
			);
	}
}
'use strict';

angular.module('core').factory('CoreService', function($q, $http, $timeout, Authentication){
    "ngInject";
    var ready = false;
    
    var errors = {};
    
    var data = {
        gamelist: window.games
    };
    
    var toLoad = [
        {
            api: 'api/tags',
            field: 'tags'
        },
        {
            api: 'api/statuses',
            field: 'statuses'
        }
    ];
    
    if(Authentication.user){
        toLoad.push({
            api: '/api/playlists/mine',
            field: 'myplaylists'
        })
    }
    
    var loaded = 0;
    
    toLoad.forEach((req)=>{
        $http.get(req.api).then((response)=>{
            data[req.field] = response.data;
            loaded++;
            if(loaded === toLoad.length){
                ready = true;
            }
        }, (error)=>{
            errors[req.field] = error;
        })
    });
    
    var scoreThoughts = [
            '',
            'Horrible',
            'Bleh',
            'Meh',
            'Good',
            'Epic'
        ];
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
    
    function isReady(resource){
        var deferred = $q.defer();
        var check = ()=>{
            if(ready || (resource && data[resource])){
                 deferred.resolve();
            } else {
                $timeout(()=>{
                    check();
                }, 100);
            }
        }
        
        check();
        
        return deferred.promise;
    }
    
    function getGames(){
        return data.gamelist;
    }
    
    function getTags(){
        return data.tags;
    }

    function getStatuses(){
        return data.statuses;
    }
    
    function getMyPlaylists(){
        return data.myplaylists;
    }
    
    function isLoggedIn(){
        return Authentication.user ? true : false
    }
    
    function getGameById(gameId){
        return data.gamelist.find(function(g){
            return g._id === gameId;
        });
    }
});
angular.module('core').factory('Page', function() {
    var title = 'Incremental Games Plaza';
    return {
        title: function() {
            return title;
        },
        setTitle: function(newTitle) {
            title = newTitle;
        }
    }
});

angular.module('core').factory('SubredditService', ['$http', function($http) {
    return {
        get: function(){
        	return $http.get('api/subreddit');
        }
    }
}]);

'use strict';

//Setting up route
angular.module('discussions').config(['$stateProvider',
    function($stateProvider) {
        // Discussions state routing
        $stateProvider.
        state('listDiscussions', {
            url: '/discussions',
            templateUrl: 'modules/discussions/views/list-discussions.client.view.html'
        }).
        state('createDiscussion', {
            url: '/discussions/create',
            templateUrl: 'modules/discussions/views/create-discussion.client.view.html'
        }).
        state('viewDiscussion', {
            url: '/discussions/:discussionId/:slug',
            templateUrl: 'modules/discussions/views/view-discussion.client.page.html',
            controller: 'DiscussionsController'
        }).
        state('editDiscussion', {
            url: '/discussions/:discussionId/edit',
            templateUrl: 'modules/discussions/views/discussion-edit.html',
            controller: 'DiscussionsController'
        });
    }
]);
'use strict';

// Discussions controller
angular.module('discussions').controller('DiscussionsController', ['$rootScope', '$scope', '$timeout', '$http', '$stateParams', '$location', 'Page', 'Authentication', 'Discussions',
    function($rootScope, $scope, $timeout, $http, $stateParams, $location, Page, Authentication, Discussions) {
        $scope.authentication = Authentication;

        // Create new Discussion
        $scope.create = function() {
            // Create new Discussion object
            var discussion = new Discussions({
                name: this.name
            });

            // Redirect after save
            discussion.$save(function(response) {
                $location.path('discussions/' + response._id);

                // Clear form fields
                $scope.name = '';
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Remove existing Discussion
        $scope.remove = function(discussion) {
            if (discussion) {
                discussion.$remove();

                for (var i in $scope.discussions) {
                    if ($scope.discussions[i] === discussion) {
                        $scope.discussions.splice(i, 1);
                    }
                }
            } else {
                $scope.discussion.$remove(function() {
                    $location.path('discussions');
                });
            }
        };

        // Update existing Discussion
        $scope.update = function() {
            var discussion = $scope.discussion;

            discussion.$update(function() {
                $location.path('discussions/' + discussion._id);
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Update existing Discussion
        $scope.updateDiscussion = function() {
            $scope.discussion.$update(function() {
                $scope.edittingDiscussion = false;
            }, function(errorResponse) {
                $scope.discussionEdit.error = errorResponse.data.message;
            });
        };

        // Find a list of Discussions
        $scope.find = function() {
            $scope.discussions = Discussions.query();

        };

        // Find existing Discussion
        $scope.findOne = function() {
            $scope.discussion = Discussions.get({
                discussionId: $stateParams.discussionId
            }, function(response) {
                $scope.discussion = response;
                $scope.discussion.myVote = $rootScope.whatsMyVote($scope.discussion._id);

                for (var i = 0; i < $scope.discussion.comments.length; i++) {
                    var comment = $scope.discussion.comments[i];
                    comment.myVote = $scope.whatsMyVote(comment._id);
                }

                $scope.comment = {

                };

                $scope.discussion.comments = $scope.discussion.comments.reverse();

                $scope.context = null;

                if ($scope.discussion.attached) {
                    $scope.attachType = $scope.discussion.attachType || 'games';

                    $http.get('/api/' + $scope.attachType + '/' + $scope.discussion.attached).success(function(data) {
                        $scope.context = data;
                    }).error(function(data) {

                    });
                }
                $scope.isFollowed = ($scope.authentication.user && 
                                    $scope.authentication.user.followed && 
                                    $scope.authentication.user.followed.some(function(id){
                                        return id == $scope.discussion._id;})
                                    );
                

                $timeout(function() {
                    $('[data-class=discussion] pre code').each(function(i, block) {
                        hljs.highlightBlock(block);
                    });
                }, 400);
            }, function(response) {
                $scope.discussion = null;
            });
        };


        // Remove existing Review
        $scope.removeDiscussion = function(discussion) {
            if (discussion) {
                discussion.$remove(function(response) {
                    var index;
                    for (var i in $scope.discussions) {
                        if ($scope.discussions[i]._id === discussion._id) {
                            index = i;
                        }
                    }
                    if (!isNaN(index)) {
                        $scope.discussions.splice(index, 1);
                    }

                    discussion = null;
                    $scope.closeDialog();
                });

            }
        };

        // Update existing Review
        $scope.updateDiscussion = function() {
            $scope.discussion.$update(function() {
                $scope.closeDialog();
            }, function(errorResponse) {
                $scope.discussionEdit.error = errorResponse.data.message;
            });
        };

        //vote on a discussion

        function updateVote(item, user, direction) {
            var id = item._id;
            var indLiked = user.liked.indexOf(id);
            var indDisliked = user.disliked.indexOf(id);

            if (direction === 1) {
                if (indLiked >= 0) {
                    //no change
                    item.myVote = 1;
                } else if (indDisliked >= 0) {
                    item.disliked--;
                    item.myVote = 0;
                    user.disliked.splice(indDisliked, 1);
                } else {
                    item.liked++;
                    item.myVote = 1;
                    user.liked.push(id);
                }
            } else if (direction === -1) {
                if (indLiked >= 0) {
                    item.liked--;
                    item.myVote = 0;
                    user.liked.splice(indLiked, 1);
                } else if (indDisliked >= 0) {
                    //no change
                    item.myVote = -1;
                } else {
                    item.disliked++;
                    item.myVote = -1;
                    user.disliked.push(id);
                }
            }
        }

        $scope.voteDiscussion = function(discussion, direction) {
            if ($scope.authentication.user) {
                $http.put('/api/discussions/' + discussion._id + '/vote', {
                    vote: direction
                }).success(function(response) {
                    updateVote(discussion, $scope.authentication.user, direction);
                });
            }
        };

        $scope.voteComment = function(comment, direction) {
            if ($scope.authentication.user) {
                $http.put('/api/comments/' + comment._id + '/vote', {
                    vote: direction
                }).success(function(response) {
                    updateVote(comment, $scope.authentication.user, direction);
                });
            }
        };

        //submit comment
        $scope.submitDiscussionComment = function() {
            if ($scope.discussion && $scope.comment && $scope.comment.content.trim().length > 0) {
                $http.put('/api/discussions/' + $scope.discussion._id + '/comment', $scope.comment).success(function(response) {
                    response.user = $scope.authentication.user;
                    $scope.discussion.comments.unshift(response);
                    $scope.comment = {};
                });
            }
        };

        $scope.reportDiscussion = function(discussion) {
            var reports = discussion.reports;
            if (discussion.reports.indexOf(discussion.report) < 0) {
                $http.post('/api/discussions/' + discussion._id + '/report', {
                    report: discussion.report
                });
            }

            discussion.reported = true;
            discussion.showReport = false;
        };

        $scope.reportComment = function(comment) {
            var reports = comment.reports;
            if (comment.reports.indexOf(comment.report) < 0) {
                $http.post('/api/comments/' + comment._id + '/report', {
                    report: comment.report
                });
            }

            comment.reported = true;
            comment.showReport = false;
        };

        $scope.toggleFollow = function(){
            if($scope.isFollowed){
                $http.post('/api/discussions/'+$scope.discussion._id+'/unfollow').then(function(resp){
                    $scope.authentication.user.followed.splice($scope.authentication.user.followed.indexOf($scope.discussion._id), 1);
                    $scope.isFollowed = false;

                })
            } else {
                $http.post('/api/discussions/'+$scope.discussion._id+'/follow').then(function(resp){
                    $scope.authentication.user.followed.push($scope.discussion._id);
                    $scope.isFollowed = true;
                }, function(err){

                })
            }
        }
    }
]);
'use strict';

//Discussions service used to communicate Discussions REST endpoints
angular.module('discussions').factory('Discussions', ['$resource',
	function($resource) {
		return $resource('api/discussions/:discussionId', { discussionId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
'use strict';

//Setting up route
angular.module('fileuploads').config(['$stateProvider',
	function($stateProvider) {
		// Fileuploads state routing
		$stateProvider.
		state('listFileuploads', {
			url: '/fileuploads',
			templateUrl: 'modules/fileuploads/views/list-fileuploads.client.view.html'
		}).
		state('createFileupload', {
			url: '/fileuploads/create',
			templateUrl: 'modules/fileuploads/views/create-fileupload.client.view.html'
		}).
		state('viewFileupload', {
			url: '/fileuploads/:fileuploadId',
			templateUrl: 'modules/fileuploads/views/view-fileupload.client.view.html'
		}).
		state('editFileupload', {
			url: '/fileuploads/:fileuploadId/edit',
			templateUrl: 'modules/fileuploads/views/edit-fileupload.client.view.html'
		});
	}
]);
'use strict';

// Fileuploads controller
angular.module('fileuploads').controller('FileuploadsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Fileuploads',
	function($scope, $stateParams, $location, Authentication, Fileuploads) {
		$scope.authentication = Authentication;

		// Create new Fileupload
		$scope.create = function() {
			// Create new Fileupload object
			var fileupload = new Fileuploads ({
				name: this.name
			});

			// Redirect after save
			fileupload.$save(function(response) {
				$location.path('fileuploads/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Fileupload
		$scope.remove = function(fileupload) {
			if ( fileupload ) { 
				fileupload.$remove();

				for (var i in $scope.fileuploads) {
					if ($scope.fileuploads [i] === fileupload) {
						$scope.fileuploads.splice(i, 1);
					}
				}
			} else {
				$scope.fileupload.$remove(function() {
					$location.path('fileuploads');
				});
			}
		};

		// Update existing Fileupload
		$scope.update = function() {
			var fileupload = $scope.fileupload;

			fileupload.$update(function() {
				$location.path('fileuploads/' + fileupload._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Fileuploads
		$scope.find = function() {
			$scope.fileuploads = Fileuploads.query();
		};

		// Find existing Fileupload
		$scope.findOne = function() {
			$scope.fileupload = Fileuploads.get({ 
				fileuploadId: $stateParams.fileuploadId
			});
		};
	}
]);
'use strict';

//Fileuploads service used to communicate Fileuploads REST endpoints
angular.module('fileuploads').factory('Fileuploads', ['$resource',
	function($resource) {
		return $resource('api/fileuploads/:fileuploadId', { fileuploadId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
'use strict';

//Setting up route
angular.module('games').config(['$stateProvider',
    function($stateProvider) {
        // Games state routing
        $stateProvider.
        state('listGames', {
            url: '/games?tags&keyword&sortby&extag&view',
            templateUrl: 'modules/games/views/list-games.client.view.html',
            controller: 'ListGamesController',
            controllerAs: 'vm',
            params: {
                tags: {
                    array: true,
                    squash: false
                },
                extags: {
                    array: true,
                    squash: false
                },
                keyword: {
                    squash: false
                },
                sortby: {
                    squash: false
                },
                view: {
                    squash: false
                }
            },
            reloadOnSearch: false
        }).
        state('listAndroidGames',{
            url: '/android-games',
            templateUrl: 'modules/games/views/list-android-games.client.view.html',
            controller: 'ListTagGamesController'
        }).
        state('listiOSGames',{
            url: '/ios-games',
            templateUrl: 'modules/games/views/list-ios-games.client.view.html',
            controller: 'ListTagGamesController'
        }).
        state('viewGame', {
            url: '/games/:gameId',
            templateUrl: 'modules/games/views/view-game.client.view.html'
        }).
        state('playground', {
            url: '/lounge',
            templateUrl: 'modules/games/views/playground.client.view.html',
            controller: 'PlaygroundController',
            params:{
                games: {
                    array: true,
                    squash: false
                }
            },
            reloadOnSearch: false
        });
    }
]);
'use strict';

// Games controller
angular.module('games').controller('GamesController',

    function($rootScope, $scope, Page, CoreService, GamesService, $stateParams, $state, $http, $timeout, $mdDialog, $location, Games, Upload, Reviews, Discussions) {
        $scope.authentication = CoreService.authentication;

        $scope.availableTags = [];

        $scope.maxfilesize = 2500 * 1024;
        $scope.maxDiscussionsDisplayed = 5;
        $scope.maxReviewsDisplayed = 5;

        $scope.uploads = {
            logo: null,
            files: null
        }

        $scope.confirmRemove = function(ev) {
            //$scope.openDialog($scope, ev, 'modules/games/views/remove-game.client.view.html');

            var confirm = $mdDialog.confirm()
                .parent(angular.element(document.body))
                .title('Are you sure you want to delete this game?')
                .ariaLabel('Confirm delete')
                .ok('Yes')
                .cancel('No')
                .targetEvent(ev);
            $mdDialog.show(confirm).then(function() {
                $scope.remove();
            }, function() {

            });
        };

        // Remove existing Game
        $scope.remove = function(game) {
            if (game) {
                game.$remove();
                var index;
                for (var i in $scope.games) {
                    if ($scope.games[i]._id === game._id) {
                        index = i;
                    }
                }
                $scope.games.splice(index, 1);
            } else {
                $scope.game.$remove(function() {
                    if ($scope.games) {
                        var index;
                        for (var i in $scope.games) {
                            if ($scope.games[i]._id === $scope.game._id) {
                                index = i;
                            }
                        }
                        $scope.games.splice(index, 1);
                    }
                    $location.path('games');
                });
            }
        };

        // Update existing Game
        $scope.update = function() {
            var game = $scope.game;

            if ($scope.game.subreddit) {
                var r = $scope.game.subreddit.split('/');
                $scope.game.subreddit = r[r.length - 1];
            }

            if ($scope.game.creatorNamesArr) {
                $scope.game.creatorNames = $scope.game.creatorNamesArr.split(',').map(function(name) {
                    return name.trim()
                });
            } else {
                $scope.game.creatorNames = [];
            }

            game.$update(function() {
                $scope.closeDialog();
                normalizeYoutube();
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        $scope.openLounge = function(gameId){
            $rootScope.openGameInLounge(gameId);
            $rootScope.openLounge = true;
        }

        $scope.getACL = function() {
            $http.get('/api/games/' + $scope.game._id + '/acl').success(function(data) {

                //various ACL stuff
                $scope.canEdit = data.canEdit;
                $scope.canChangeLogo = data.canChangeLogo;

                $scope.canAddScreenshots = data.canAddScreenshots;
                $scope.canDeleteScreenshots = data.canDeleteScreenshots;
                $scope.canRemoveTags = data.canRemoveTags;
                $scope.canAddTags = data.canAddTags;

                $scope.canReview = data.canReview;
                $scope.canDeleteGame = data.canDeleteGame;

                $scope.canPassOwnership = data.canPassOwnership;

                $scope.canViewHistory = data.canViewHistory;

                $scope.canAdmin = data.canAdmin;

                if ($scope.canPassOwnership) {
                    $http.get('/api/users').success(function(data) {
                        $scope.allUsers = data;
                    });
                }
            });
        };

        function checkCanAddReview() {
            $scope.canAddReview = true;
            if ($scope.authentication.user) {

                if ($scope.myReview) {
                    $scope.canAddReview = false;
                }
            } else {
                $scope.canAddReview = false;
            }
            $scope.selectedScore = 0;
        }

        $scope.listReviews = function() {
            var data = {};
            if ($scope.game && !$scope.reviews) {
                data = {
                    gameId: $scope.game._id
                };

                $scope.loadingReviews = true;
                $scope.reviews = Reviews.query(data, function() {
                    checkCanAddReview();
                    $scope.loadingReviews = false;
                }, function() {
                    $scope.loadingReviews = false;
                });

            }

        };

        $scope.listDiscussions = function() {
            var data = {};
            if ($scope.game && !$scope.discussions) {
                data = {
                    attached: $scope.game._id
                };

                $scope.loadingDiscussions = true;
                $scope.discussions = Discussions.query(data, function() {
                    $scope.loadingDiscussions = false;
                }, function() {
                    $scope.loadingDiscussions = false;
                });
            }

        };

        $scope.listSimilars = function() {
            if ($scope.game && !$scope.similarGames) {
                $scope.similarGames = Games.findSimilar({ gameId: $scope.game._id });
            }
        };

        $scope.getFullDiscussion = function(id) {
            Discussions.get({
                discussionId: id
            }, function(response) {
                $scope.discussion = response;
                $scope.discussion.myVote = $scope.whatsMyVote(id);

                for (var i = 0; i < $scope.discussion.comments.length; i++) {
                    var comment = $scope.discussion.comments[i];
                    comment.myVote = $scope.whatsMyVote(comment._id);
                }

                $timeout(function() {
                    $('[data-class=discussion] pre code').each(function(i, block) {
                        hljs.highlightBlock(block);
                    });
                }, 400);
            });
        };


        $scope.editMyReview = function(ev, review) {
            if ($scope.game && $scope.authentication.user) {
                /*
                angular.forEach($scope.reviews, function(review) {
                    if (review.user._id === $scope.authentication.user._id) {
                        $scope.openReviewEditor(ev, review);
                    }
                });*/
                $scope.openReviewEditor(ev, review);
            }
        };

        function normalizeYoutube() {
            function parseURL(url) {
                var parser = document.createElement('a'),
                    searchObject = {},
                    queries, split, i;
                // Let the browser do the work
                parser.href = url;
                // Convert query string to object
                queries = parser.search.replace(/^\?/, '').split('&');
                for (i = 0; i < queries.length; i++) {
                    split = queries[i].split('=');
                    searchObject[split[0]] = split[1];
                }
                return {
                    protocol: parser.protocol,
                    host: parser.host,
                    hostname: parser.hostname,
                    port: parser.port,
                    pathname: parser.pathname,
                    search: parser.search,
                    searchObject: searchObject,
                    hash: parser.hash
                };
            }

            var parsed = parseURL($scope.game.youtube);
            console.log(parsed);
            if (parsed.hostname === location.hostname) {
                //check for v.
                if (parsed.searchObject.v) {
                    $scope.game.youtube = parsed.searchObject.v;
                }
            } else if (parsed.hostname === 'youtu.be') {
                $scope.game.youtube = parsed.pathname.substring(1);
            } else {
                if (parsed.searchObject.v) {
                    $scope.game.youtube = parsed.searchObject.v;
                } else {
                    $scope.game.youtube = null;
                }
            }
        }

        // Find existing Game
        $scope.findOne = function() {
            
            if(!$stateParams.gameId){
                
                $state.go('listGames');
            }
            $scope.game = Games.get({
                gameId: $stateParams.gameId
            }, function() {

                Page.setTitle('Plaza - '+ $scope.game.name);
                if ($scope.authentication.user) {
                    if (!$scope.authentication.user.gamesLiked) {
                        $scope.authentication.user.gamesLiked = [];
                    }

                    $scope.likesThis = ($scope.authentication.user.gamesLiked.indexOf($scope.game._id) >= 0) ? true : false;

                    //tagging
                    $scope.showTagPane = false;

                    $scope.tags = CoreService.getTags();

                    $scope.getACL();

                    $scope.statuses = CoreService.getStatuses();

                    $scope.getMyReview();
                }

                $scope.maxScreenshots = 15;

                $scope.maxDiscussionsDisplayed = 5;

                $scope.maxReviewsDisplayed = 5;

                $scope.canShowMoreScreenshots = ($scope.game.screenshots.length > $scope.maxScreenshots);
                $scope.editAlbum = $scope.canDeleteScreenshots;

                $scope.listReviews();

                $scope.listDiscussions();

                $scope.listSimilars();

                //go through the featured list, update with information
                angular.forEach($scope.featuredGames, function(game, index) {
                    if (game._id === $scope.game._id) {
                        $scope.featuredGames[index] = $scope.game;
                    }
                });

                if ($scope.game.rating) {
                    $scope.game.scoreStr = CoreService.scoreThoughts[Math.round($scope.game.rating)];
                }

                $scope.uploads = {
                    logo: null,
                    files: null
                }
                if($scope.game.creatorNames){
                    $scope.game.creatorNamesArr = $scope.game.creatorNames.join(', ');
                }
                

                if ($scope.game.youtube) {
                    normalizeYoutube();
                }
            }, function() {
                $scope.game = null;
            });
        };

        $scope.getMyReview = function() {
            $http.get('/api/reviews/mine', {
                params: {
                    gameId: $scope.game._id
                }
            }).success(function(data) {
                if (data.length > 0) {
                    $scope.myReview = new Reviews(data[0]);
                    $scope.myReview.user = $scope.authentication.user;
                } else {
                    $scope.selectedScore = 0;
                }


                checkCanAddReview();
            }).error(function(data) {

            });
        };

        $scope.setSelectedScore = function(n) {
            $scope.selectedScore = n;
        };

        $scope.$watch('uploads.files', function() {
            console.log('files changed', $scope.uploads.files);
            $scope.upload($scope.uploads.files);
        });

        $scope.$watch('game.newOwner', function() {
            if ($scope.game.newOwner) {
                console.log('new owner: ', $scope.game.newOwner);
                $http.put('/api/games/' + $scope.game._id + '/passOwnership', { userId: $scope.game.newOwner }).success(function(data) {
                    $scope.game.user = data.user;
                    console.log($scope.game);
                }).error(function() {

                })
            }
        });
        $scope.showMoreScreenshots = function() {
            if ($scope.canShowMoreScreenshots) {
                $scope.maxScreenshots += 15;
                $scope.canShowMoreScreenshots = ($scope.game.screenshots.length > $scope.maxScreenshots);
            }
        };

        function uploadprogress(evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
        }

        function uploadsuccess(data, status, headers, config) {
            console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
            $scope.game.screenshots.unshift(data);
        }

        function upfile(files, index) {
            $scope.uploading = true;
            if (files.length > index) {
                var file = files[index];
                Upload.upload({
                    url: '/api/games/' + $scope.game._id + '/up',
                    fields: {},
                    file: file
                }).progress(uploadprogress).success(function(data, status, headers, config) {
                    uploadsuccess(data, status, headers, config);
                    upfile(files, index + 1);
                });
            } else {
                $scope.uploading = false;
            }
        }

        $scope.upload = function(files) {
            if (files && files.length) {
                upfile(files, 0);
            }
        };


        $scope.deleteImage = function(ev, img) {
            ev.preventDefault();
            ev.stopPropagation();
            var confirm = $mdDialog.confirm()
                .title('Are you sure you want to delete this image?')
                .textContent('This action cannot be undone')
                .targetEvent(ev)
                .ok('Yes')
                .cancel('No');

            $mdDialog.show(confirm).then(function() {
                if ($scope.game.screenshots.indexOf(img) >= 0) {
                    $http.delete('/api/games/' + $scope.game._id + '/' + img._id).success(function(data) {
                        $scope.game.screenshots.splice($scope.game.screenshots.indexOf(img), 1);
                    });
                }
            });


            return false;
        };

        $scope.curUploads = [];

        $scope.$watch('uploads.logo', function() {
            console.log('logo changed', $scope.uploads.logo);
            if ($scope.uploads.logo) {
                $scope.changeLogo($scope.uploads.logo);
            }
        });

        $scope.changeLogo = function(file) {
            Upload.upload({
                url: '/api/games/' + $scope.game._id + '/logo',
                fields: {},
                file: file
            }).progress(function(evt) {
                /*$scope.progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);*/
            }).success(function(data, status, headers, config) {
                console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
                $scope.game.logo = data.filename;
            });
        };

        $scope.like = function() {
            //like this game.
            if ($scope.authentication.user && !$scope.likesThis) {
                GamesService.like($scope.game._id).then(function(data){
                    $scope.authentication.user.gamesLiked.push($scope.game._id);
                    $scope.game.liked++;
                    $scope.likesThis = true;
                });
            }
        };

        $scope.unlike = function() {
            //unlike this game.
            if ($scope.authentication.user && $scope.likesThis) {
                GamesService.unlike($scope.game._id).then(function(data) {
                    $scope.authentication.user.gamesLiked.splice($scope.authentication.user.gamesLiked.indexOf($scope.game._id), 1);
                    $scope.game.liked--;
                    $scope.likesThis = false;
                });
            }
        };


        $scope.$watch('newTag', function() {
            if ($scope.newTag) {
                $scope.addTag($scope.newTag);
            }
        });

        $scope.addTag = function(tag) {
            //add a tag
            if ($scope.game.tags.indexOf(tag) < 0) {
                $http.put('/api/tags/' + $scope.game._id + '/' + tag).success(function(data) {
                    $scope.game.tags.push(tag);
                    $scope.newTag = '';
                });
            }
        };

        $scope.removeTag = function(tag) {
            //remove a tag
            if ($scope.game.tags.indexOf(tag) >= 0) {
                $http.delete('/api/tags/' + $scope.game._id + '/' + tag).success(function(data) {
                    $scope.game.tags.splice($scope.game.tags.indexOf(tag), 1);
                });
            }
        };

        //editing
        $scope.editGame = function(ev) {
            $scope.error = null;
            if ($scope.canEdit) {
                $scope.openDialog($scope, ev, '/modules/games/views/edit-game.client.view.html');
            }
        };

        $scope.openImage = function(ev, index) {
            $scope.imgIndex = index;
            $scope.openDialog($scope, ev, '/modules/games/views/view-screenshot.client.view.html');

        };

        //reviewing
        $scope.openReviewWriter = function(ev, score) {
            $scope.error = null;
            $scope.closeDialog();
            if ($scope.canReview) {
                $scope.review = {
                    score: score
                };
                $scope.openDialog($scope, ev, '/modules/reviews/views/create-review.client.view.html');
            }
        };

        $scope.openReviewEditor = function(ev, review) {
            $scope.review = new Reviews(review);
            $scope.error = null;
            $scope.openDialog($scope, ev, '/modules/reviews/views/edit-review.client.view.html');
        };

        $scope.openReviewDetails = function(ev, review) {
            $scope.review = review;
            $scope.error = null;
            $scope.openDialog($scope, ev, '/modules/reviews/views/view-review.client.view.html');
        };

        // Create new Review
        $scope.createReview = function() {
            // Create new Review object
            var review = new Reviews({
                name: $scope.review.name,
                gameId: $scope.game._id,
                content: $scope.review.content,
                score: $scope.review.score
            });

            if (!$scope.myReview) {
                // Redirect after save
                review.$save(function(response) {
                    response.user = $scope.authentication.user;
                    $scope.myReview = response;
                    $scope.reviews.unshift(response);
                    checkCanAddReview();
                    $scope.closeDialog();

                }, function(errorResponse) {
                    $scope.error = errorResponse.data.message;
                });
            } else {
                $scope.error = 'You have already reviewed this game';
            }
        };

        // Remove existing Review
        $scope.removeReview = function(review) {
            if (review) {
                review.$remove(function() {
                    var index;
                    for (var i in $scope.reviews) {
                        if ($scope.reviews[i]._id === review._id) {
                            index = i;
                        }
                    }
                    $scope.reviews.splice(index, 1);

                    if ($scope.myReview && $scope.myReview._id === review._id) {
                        delete $scope.myReview;
                    }
                    $scope.closeDialog();
                    checkCanAddReview();
                });
            }
        };

        // Update existing Review
        $scope.updateReview = function(review) {
            review.$update(function(review) {
                $scope.myReview = review;
                console.log($scope.reviews);
                console.log(review);
                angular.forEach($scope.reviews, function(r, index) {
                    if (r._id == review._id) {
                        $scope.reviews[index] = review;
                    }
                });

                checkCanAddReview();
                $scope.closeDialog();
            }, function(errorResponse) {
                $scope.reviewEdit.error = errorResponse.data.message;
            });
        };



        //Discussion
        $scope.openDiscussionWriter = function(ev) {
            $scope.error = null;
            $scope.closeDialog();


            if ($scope.authentication.user) {
                $scope.discussion = {
                    content: ''
                };

                $scope.openDialog($scope, ev, '/modules/discussions/views/create-discussion.client.view.html');

            }
        };


        $scope.openDiscussionEditor = function(ev, discussion) {
            $scope.error = null;
            $scope.closeDialog();
            if ($scope.authentication.user._id === discussion.user._id || $scope.authentication.user.roles.indexOf('admin') >= 0) {
                $scope.discussion = discussion;
                $scope.openDialog($scope, ev, '/modules/discussions/views/edit-discussion.client.view.html');
            }
        };

        $scope.openDiscussionDetails = function(ev, discussion) {
            $scope.closeDialog();
            $scope.discussion = discussion;

            $scope.getFullDiscussion(discussion._id);

            $scope.comment = {

            };
            $scope.openDialog($scope, ev, '/modules/discussions/views/view-discussion.client.view.html');
        };

        $scope.createDiscussion = function() {

            if (!$scope.discussion.name || $scope.discussion.name.length === 0) {
                $scope.discussion.$error = 'name required';
            } else {
                // Create new Discussion object
                var discussion = new Discussions({
                    name: $scope.discussion.name,
                    attached: $scope.game._id,
                    attachType: 'games',
                    attachedName: $scope.game.name,
                    content: $scope.discussion.content,
                    description: $scope.description
                });

                // Redirect after save
                discussion.$save(function(response) {
                    response.user = $scope.authentication.user;
                    $scope.discussions.unshift(response);
                    $scope.closeDialog();
                    //$scope.openDiscussionDetails(null, response);
                    $location.path('discussions/' + discussion._id);
                }, function(errorResponse) {
                    $scope.error = errorResponse.data.message;
                });
            }


        };

        // Remove existing Review
        $scope.removeDiscussion = function(discussion) {
            if (discussion) {
                discussion.$remove(function(response) {
                    var index;
                    for (var i in $scope.discussions) {
                        if ($scope.discussions[i]._id === discussion._id) {
                            index = i;
                        }
                    }
                    if (!isNaN(index)) {
                        $scope.discussions.splice(index, 1);
                    }

                    discussion = null;
                    $scope.closeDialog();
                });

            }
        };

        // Update existing Discussion
        $scope.updateDiscussion = function() {
            $scope.discussion.$update(function() {
                $scope.edittingDiscussion = false;
            }, function(errorResponse) {
                $scope.discussionEdit.error = errorResponse.data.message;
            });
        };

        //vote on a discussion

        function updateVote(item, user, direction) {
            var id = item._id;
            var indLiked = user.liked.indexOf(id);
            var indDisliked = user.disliked.indexOf(id);

            if (direction === 1) {
                if (indLiked >= 0) {
                    //no change
                    item.myVote = 1;
                } else if (indDisliked >= 0) {
                    item.disliked--;
                    item.myVote = 0;
                    user.disliked.splice(indDisliked, 1);
                } else {
                    item.liked++;
                    item.myVote = 1;
                    user.liked.push(id);
                }
            } else if (direction === -1) {
                if (indLiked >= 0) {
                    item.liked--;
                    item.myVote = 0;
                    user.liked.splice(indLiked, 1);
                } else if (indDisliked >= 0) {
                    //no change
                    item.myVote = -1;
                } else {
                    item.disliked++;
                    item.myVote = -1;
                    user.disliked.push(id);
                }
            }
        }

        $scope.voteDiscussion = function(discussion, direction) {
            if ($scope.authentication.user) {
                $http.put('/api/discussions/' + discussion._id + '/vote', {
                    vote: direction
                }).success(function(response) {
                    updateVote(discussion, $scope.authentication.user, direction);
                });
            }
        };

        $scope.voteComment = function(comment, direction) {
            if ($scope.authentication.user) {
                $http.put('/api/comments/' + comment._id + '/vote', {
                    vote: direction
                }).success(function(response) {
                    updateVote(comment, $scope.authentication.user, direction);
                });
            }
        };

        //submit comment
        $scope.submitDiscussionComment = function() {
            if ($scope.discussion && $scope.comment && $scope.comment.content.trim().length > 0) {
                $http.put('/api/discussions/' + $scope.discussion._id + '/comment', $scope.comment).success(function(response) {
                    response.user = $scope.authentication.user;
                    $scope.discussion.comments.push(response);
                    $scope.comment = {};
                });
            }
        };

        $scope.reportDiscussion = function(discussion) {
            var reports = discussion.reports;
            if (discussion.reports.indexOf(discussion.report) < 0) {
                $http.post('/api/discussions/' + discussion._id + '/report', {
                    report: discussion.report
                });
            }

            discussion.reported = true;
            discussion.showReport = false;
        };

        $scope.reportComment = function(comment) {
            var reports = comment.reports;
            if (comment.reports.indexOf(comment.report) < 0) {
                $http.post('/api/comments/' + comment._id + '/report', {
                    report: comment.report
                });
            }

            comment.reported = true;
            comment.showReport = false;
        };

        $scope.increaseMaxDiscussions = function() {
            $scope.maxDiscussionsDisplayed += 5;
        };

        $scope.increaseMaxReviews = function() {
            $scope.maxReviewsDisplayed += 5;
        };

        $scope.tagUsed = function(tag){

            return $scope.game && $scope.game.tags.find(function(t){
                return t === tag;
            });
        };

    }
).filter('hasContent', function() {
    return function(items, search) {
        return items.filter(function(element, index, array) {
            return element.contentHTML.length === 0;
        });
    };
});

'use strict';

// Games controller
angular.module('games').controller('ListGamesController',

    function(CoreService, Page, GamesService, $stateParams, $mdDialog, $mdSidenav, $location, Authentication, Games) {

        var vm = this;
        var criteria = $stateParams;
        vm.loading = true;
        vm.filters = {
            'Hide Reviewed': {
                on: false,
                fn: function(game){
                    return Authentication.user && Authentication.user.reviewed.indexOf(game._id) < 0;
                }
            }
        };
        vm.displayMode = criteria.view ? criteria.view : 'tile';
        vm.authentication = Authentication;

        vm.canCreatePlaylist = vm.authentication.user ? true : false;
        Page.setTitle('List of Incremental Games');


        function init(criteria) {
            updateURLParams(criteria);
            vm.games = CoreService.getGames();
            vm.gamesDisplayed = GamesService.search(vm.games, criteria);
            vm.availableTags = getAvailableTags(vm.gamesDisplayed);
            vm.loading = false;
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
                    controller: createGamesController,
                    controllerAs: 'vm'
                }).then(function() {

                }, function() {

                });
            }
        };

        vm.canCreateGame = Authentication.user ? true : false;

        vm.applySearch = function(criteria) {
            updateURLParams(criteria);
            vm.searchResults = GamesService.search(vm.games, criteria);
            vm.applyFilters();
        };

        vm.applyFilters = function(){
            vm.gamesDisplayed = applyFilters(vm.searchResults, vm.filters);
            vm.availableTags = getAvailableTags(vm.gamesDisplayed);
            
        };

        vm.changeDisplayMode = function(view){
            vm.displayMode = view;
            criteria.view = view;
            updateURLParams(criteria);
        };

        vm.showSearch = function() {
            $mdSidenav('searchBar').open();
        };

        function getAvailableTags(games){
            var tags = [];
            games.forEach(function(g){
                g.tags.forEach(function(tag){
                    if(!tags.some(function(t){
                        return t === tag;
                    })){
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

            if(search.view && search.view != 'tile'){
                $location.search('view', search.view);
            } else {
                $location.search('view', null);
            }
        }

        function applyFilters(games, filters){
            return games.filter((game)=>{
                return Object.keys(filters).every(function(f){
                    if(filters[f].on){
                        return filters[f].fn(game);
                    } else {
                        return true;
                    }
                    
                });
            });
        }
        CoreService.isReady('gamelist').then(() => {
            init(criteria);
        }, (error) => {
            vm.error = error;
        });
    }
);

function createGamesController($mdDialog, Games, CoreService, $location) {
    var vm = this;
    vm.game = {};
    CoreService.isReady('statuses').then(function(){
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

angular.module('games').controller('ListTagGamesController', [
    '$scope', 'Games',
    function($scope, Games) {

        $scope.findGames = findGames;

        function findGames(tag) {
            $scope.games = Games.query({
                tag: tag
            });
        }
    }


])

'use strict';

// Games controller
angular.module('games').controller('PlaygroundController', ['$rootScope', '$scope', '$sce', 'Page', '$stateParams', 'Authentication', 'PlaygroundService', 'Games',
    function($rootScope, $scope, $sce, Page, $stateParams, Authentication, PlaygroundService, Games) {


        $scope.messages = [];
        $scope.messageText = '';
        $scope.sendMessage = sendMessage;
        $scope.openedGames =  [];
        init();
        $scope.urlSrc = {};

        function init() {
            Page.setTitle('Plaza - Lounge');
            if (!Authentication.user) {
                //$state.go('home');
                $scope.canChat = false;
            } else {
                $scope.canChat = true;
                if (!PlaygroundService.socket) {
                    PlaygroundService.connect();
                }

                // Add an event listener to the 'chatMessage' event
                PlaygroundService.on('chatMessage', function(message) {
                    if (message.username && message.username === Authentication.user.username) {
                        message.self = true;
                    }
                    var ignore = true;
                    if (!isBlocked(message.username)) {
                        switch (message.type) {
                            case 'status':
                                if (message.text === 'joined') {
                                    $scope.chatMgr.online = PlaygroundService.chatMgr.setOnline(message.data);
                                } else if (message.text === 'left') {
                                    $scope.chatMgr.online = PlaygroundService.chatMgr.setOnline(message.data);
                                }
                                break;
                            default:
                                ignore = false;
                                break;
                        }
                    }

                    if (!ignore) {
                        PlaygroundService.chatMgr.addMessages([message]);
                    }

                });

                PlaygroundService.on('system', function(message) {
                    switch (message.type) {
                        case 'status':
                            $scope.chatMgr.online = PlaygroundService.chatMgr.setOnline(message.data);

                            break;
                        case 'catchup':
                            PlaygroundService.chatMgr.addMessages(message.data);
                            break;
                    }
                });

                // Remove the event listener when the controller instance is destroyed
                $scope.$on('$destroy', function() {
                    PlaygroundService.removeListener('chatMessage');
                });

                $scope.playableGames = Games.query({ playable: true }, function() {
                    $scope.sortMgr.selected = $scope.sortMgr.options[1];

                    if($stateParams.games){
                        $stateParams.games.forEach(function(gameId){
                            var game = $scope.playableGames.find(function(g){
                                return g._id == gameId;
                            })
                            $scope.addTab(game);
                        });
                    }
                });


                $scope.chatMgr = {
                    online: PlaygroundService.chatMgr.online,
                    messages: PlaygroundService.chatMgr.messages,
                    usersDisplayed: false,
                    toggleUsersDisplay: function() {
                        $scope.chatMgr.usersDisplayed = !$scope.chatMgr.usersDisplayed;
                    }
                };

                $scope.hideChat = hideChat;
                $scope.showChat = showChat;



                showChat();
            }
        }

        $scope.sortMgr = {
            options: [
                { name: 'Alphabetical', field: 'slug' },
                { name: 'Best', field: 'score' },
                { name: 'Newest', field: 'created' }
            ],
            selected: null
        };


        $scope.$watch('sortMgr.selected', function(newVal) {
            if (newVal) {
                sortGames(newVal.field);
            }
        });

        function isBlocked(username) {
            return false;
        }

        function sortGames(field) {
            $scope.playableGames.sort(function(a, b) {
                switch (field) {
                    case 'slug':
                        return a.slug > b.slug;
                        break;
                    case 'created':
                        return (new Date(b.created)) - (new Date(a.created));
                        break;
                    case 'score':
                        return b.score - a.score;
                        break;
                }
            });
        }

        // Create a controller method for sending messages
        function sendMessage() {
            // Create a new message object
            var message = {
                text: $scope.messageText
            };

            // Emit a 'chatMessage' message event
            PlaygroundService.emit('chatMessage', message);

            // Clear the message text
            $scope.messageText = '';
        }

        function hideChat() {
            $scope.chatHidden = true;
            console.log($scope.chatMgr);
        }

        function showChat() {
            $scope.chatHidden = false;
        }


        $scope.addTab = function(game) {
            console.log('adding game', game);
            if (!$scope.openedGames.some(function(t) {
                    return t === game
                })) {
                game.src = $sce.trustAsResourceUrl(game.link);
                $scope.openedGames.push(game);

            }
        };

        $scope.closeTab = function(game) {
            var ind = $scope.openedGames.indexOf(game);
            $scope.openedGames.splice(ind, 1);
        };
    }
]);

'use strict';
angular.module('games')
    .component('gameSearch', {
        templateUrl: 'modules/games/views/gamesearch.client.view.html',
        controller: gameSearchController,
        bindings: {
            'oneline': '<',
            'onUpdate': '&',
            'onReady': '&',
            'availableTags': '<'
        }
    });

function gameSearchController($location, CoreService, GamesService, Authentication) {
    var vm = this;
    vm.tagstates = {};
    vm.search = {
        keyword: '',
        tags: [],
        exclude: {
            gameIds: [],
            tags: []
        },
        sortBy: 'Highest Rating',
        view: 'tile'
    };

    vm.sortOpts = GamesService.sortBys;

    vm.hideReviewed = false;

    vm.user = Authentication.user;

    vm.$onInit = function() {
        CoreService.isReady().then(init);
    }

    vm.update = function() {
        updateExcludedGameIds();
        vm.onUpdate({ search: vm.search });
    }

    vm.ready = function(){
        vm.onReady();
    }

    vm.updateTagState = function(tagname, state) {
        vm.tagstates[tagname] = state;

        let incInd = vm.search.tags.indexOf(tagname);
        let exInd = vm.search.exclude.tags.indexOf(tagname);

        switch (state) {
            case 0:
                if (incInd >= 0) {
                    vm.search.tags.splice(incInd, 1);
                }
                if (exInd >= 0) {
                    vm.search.exclude.tags.splice(exInd, 1);
                }

                break;
            case 1:
                if (incInd < 0) {
                    vm.search.tags.push(tagname);
                }
                if (exInd >= 0) {
                    vm.search.exclude.tags.splice(exInd, 1);
                }
                break;
            case -1:
                if (exInd < 0) {
                    vm.search.exclude.tags.push(tagname);
                }
                if (incInd >= 0) {
                    vm.search.tags.splice(incInd, 1);
                }
                break;
        }


        vm.update();
    }

    vm.isAvailable = function(tag){
        if(vm.availableTags!== undefined){
            return vm.availableTags.some(function(t){
                return t === tag;
            });
        } else {
            return true;
        }
    };

    function init() {
        vm.statuses = CoreService.getStatuses();

        vm.tags = CoreService.getTags();

        Object.keys(vm.tags).forEach((cat) => {
            vm.tags[cat].forEach(function(t) {
                vm.tagstates[t] = 0;
            });
        });

        //check the search params
        var locationParams = $location.search();
        convertParamToSearch(locationParams);

        vm.update();
        if(vm.onReady){
            vm.ready();
        }
        
    }

    function findTag(str) {
        str = str.toLowerCase();

        return Object.keys(vm.tagstates).find((tag) => {
            return tag.toLowerCase() === str;
        });
    }

    function convertParamToSearch(params) {
        //update the search with tags
        if (!params) {
            return false;
        }
        console.log('convertParamToSearch');
        if (params.tags) {
            var tags = params.tags.split(',');
            tags.forEach(function(tag) {
                tag = findTag(tag);

                vm.tagstates[tag] = 1;
                if (vm.search.tags.indexOf(tag) < 0) {
                    vm.search.tags.push(tag);
                }
            });
        }

        if (params.extags) {
            var tags = params.extags.split(',');
            tags.forEach(function(tag) {
                var tag = findTag(tag);
                vm.tagstates[tag] = -1;
                if (vm.search.exclude.tags.indexOf(tag) < 0) {
                    vm.search.exclude.tags.push(tag);
                }
            });
        }

        if (params.keyword) {
            vm.search.keyword = params.keyword;
        }

        if (params.sortby) {
            vm.search.sortBy = params.sortby;
        }

        if (params.view) {
            vm.search.view = params.view;
        }
    }

    function updateExcludedGameIds() {
        if (Authentication.user && vm.hideReviewed) {
            vm.search.exclude.gameIds = Authentication.user.reviewed.slice();
        }
    }

}

'use strict';
angular.module('games')
    .component('gameSummary', {
    	template: `

    	`,
    	controller: gameSummaryController,
    	bindings: {
    		'game': '<',
    		'data': '<'
    	}

    });

function gameSummaryController(){
	'ngInject';
}
'use strict';
angular.module('games')
    .component('gameTile', {
       template: `
        <a class="gameTile tile" ui-sref="viewGame({gameId:$ctrl.slug})" 
            ng-style="$ctrl.style">
            <div class="tile-footer">
                <div layout="row" layout-align="space-between">
                    <span class="nowrap tile-name" title="{{$ctrl.gameName}}">{{$ctrl.gameName}}</span>
                    <span flex></span>
                    <span class="nowrap spaced">
                        <span ng-if="$ctrl.gameRating">
                            <span class="fa fa-star"></span> {{$ctrl.gameRating | number:1}}
                        </span>
                        <span ng-if="$ctrl.gameLiked">
                            <span class="fa fa-heart"></span> {{$ctrl.gameLiked}}
                        </span>
                        <span ng-if="$ctrl.loggedIn">
                            <md-menu>
                                <span class="fa fa-ellipsis-v" style="padding: 2px 6px" ng-click="$ctrl.openMenu($mdOpenMenu, $event)"></span>
                                <md-menu-content width="4">
                                    <md-menu-item ng-if="$ctrl.loggedIn">
                                        <md-button ng-click="$ctrl.addToPlaylist($event)">Add to Playlist</md-button>
                                    </md-menu-item>
                                    <md-menu-item ng-if="$ctrl.playable">
                                        <md-button ng-click="$ctrl.openInLounge($event)">Open In Lounge</md-button>
                                    </md-menu-item>
                                    <md-menu-item ng-if="$ctrl.loggedIn">
                                        <md-button ng-if="$ctrl.likesThis" ng-click="$ctrl.unlikeThis($event)">Remove from favourites</md-button>
                                        <md-button ng-if="!$ctrl.likesThis" ng-click="$ctrl.likeThis($event)">Add to favourites</md-button>
                                    </md-menu-item>
                                </md-menu-content>
                            </md-menu>
                        </span>
                    </span>
                </div>
                <div class="taglist" ng-if="!$ctrl.notags">
                    <b>Tags:</b>
                    {{$ctrl.tags}}
                </div>
            </div>
        </a>
       `,
       controller: gameTileController,
        bindings: {
            'gameId' : '<',
            'gameRating': '<',
            'nolink': '<',
            'notags': '<'
        }
    });
    
function gameTileController($rootScope, CoreService, Games, GamesService, Playlists,  $mdDialog){
    'ngInject';
    var cp = this;
    this.$onChanges = function(changeObj){
        if(changeObj.gameId && changeObj.gameId.currentValue){
            extractData(changeObj.gameId.currentValue);   
        }
    }
    
    function extractData(gameId){
        var game = CoreService.getGameById(gameId);
        
        var logo = 'url(/modules/core/img/plazabg.jpg?thumb=228x128)';
        if(game.logo){
            logo = 'url(/uploads/'+game.logo+'?thumb=228x128)';
        }
        cp.style = {'background-image': logo};
        
        if(game.tags.length > 0){
            cp.tags = game.tags.join(', ');
        } else {
            cp.tags = 'Not tagged yet';
        }
        
        cp.gameName  = game.name;
        cp.gameLiked = game.liked;

        cp.slug = game.slug;
        
        cp.loggedIn = CoreService.isLoggedIn();
        
        if(cp.loggedIn){
            cp.likesThis = CoreService.authentication.user.gamesLiked.some(function(id){
                return game._id === id;
            });
            
        }

        cp.playable = game.playable;
    };
    
    this.openMenu = function($mdOpenMenu, ev){
        $mdOpenMenu(ev);
    };
    
    this.addToPlaylist = function(ev){
        $rootScope.openPlaylistMgr(ev, CoreService.getGameById(cp.gameId));
    };
    
    this.likeThis = function(){
        GamesService.like(cp.gameId).then(function(){
             CoreService.authentication.user.gamesLiked.push(cp.gameId);
             CoreService.getGameById(cp.gameId).liked++;
             cp.gameLiked++;
             cp.likesThis = true;
        });
    };
    
    this.unlikeThis = function(){
        GamesService.unlike(cp.gameId).then(function(){
            CoreService.authentication.user.gamesLiked.splice(CoreService.authentication.user.gamesLiked.indexOf(cp.gameId), 1);
            CoreService.getGameById(cp.gameId).liked--;
            cp.gameLiked--;
            cp.likesThis = false;
        });
    };

    this.openInLounge = function(ev){
        $rootScope.openGameInLounge(cp.gameId);
    }
}
'use strict';
angular.module('games')
    .component('lounge', {
        templateUrl: 'modules/games/views/playground.client.view.html',
        controller: loungeController
    });


function loungeController($rootScope, $sce, Authentication, CoreService, PlaygroundService, GamesService) {
    'ngInject';
	var cp = this;
    cp.messages = [];
    cp.messageText = '';
    cp.sendMessage = sendMessage;
    cp.openedGames = [];
    cp.urlSrc = {};
    cp.show = false;

    //expose function to add game in rootscope
    $rootScope.openGameInLounge = function(gameId){
    	var game =getGame(gameId);
    	if(game){
    		cp.addTab(game);
    	}
    }
    
    cp.$onInit = function(){
        init();
    }
    

    function init() {
        if (!Authentication.user) {
            cp.canChat = false;
        } else {
            cp.canChat = true;
            if (!PlaygroundService.socket) {
                PlaygroundService.connect();
            }

            // Add an event listener to the 'chatMessage' event
            PlaygroundService.on('chatMessage', function(message) {
                if (message.username && message.username === Authentication.user.username) {
                    message.self = true;
                }
                var ignore = true;
                if (!isBlocked(message.username)) {
                    switch (message.type) {
                        case 'status':
                            if (message.text === 'joined') {
                                cp.chatMgr.online = PlaygroundService.chatMgr.setOnline(message.data);
                            } else if (message.text === 'left') {
                                cp.chatMgr.online = PlaygroundService.chatMgr.setOnline(message.data);
                            }
                            break;
                        default:
                            ignore = false;
                            break;
                    }
                }

                if (!ignore) {
                    PlaygroundService.chatMgr.addMessages([message]);
                }

            });

            PlaygroundService.on('system', function(message) {
                switch (message.type) {
                    case 'status':
                        cp.chatMgr.online = PlaygroundService.chatMgr.setOnline(message.data);

                        break;
                    case 'catchup':
                        PlaygroundService.chatMgr.addMessages(message.data);
                        break;
                }
            });

            cp.chatMgr = {
                online: PlaygroundService.chatMgr.online,
                messages: PlaygroundService.chatMgr.messages,
                usersDisplayed: false,
                toggleUsersDisplay: function() {
                    cp.chatMgr.usersDisplayed = !cp.chatMgr.usersDisplayed;
                }
            };

            cp.hideChat = hideChat;
            cp.showChat = showChat;



            showChat();
        }

        CoreService.isReady('gamelist').then(function(){
        	cp.playableGames = GamesService.sort(CoreService.getGames().filter(function(g){
	        	return g.playable;
	        }), cp.sortBy);

	        //check localStorage for any opened games
		    var lastOpened = localStorage.getItem('lastOpened');
		    if(lastOpened){
		    	lastOpened.split(',').forEach(function(gameId){
		    		var game = cp.playableGames.find((g)=>{
		    			return g._id === gameId;
		    		});

		    		if(game){
		    			cp.addTab(game);
		    		}
		    	});
		    }
	    });

    }

    function getGame(gameId){
    	return cp.playableGames.find((g)=>{
    		return g._id === gameId;
    	});
    }

    

    cp.sortOpts = GamesService.sortBys;

    cp.sortBy = 'Highest Rating';

    cp.onSortChange = function(){
    	cp.playableGames = GamesService.sort(cp.playableGames, cp.sortBy);
    }

    function isBlocked(username) {
        return false;
    }

    function sortGames(field) {
        cp.playableGames.sort(function(a, b) {
            switch (field) {
                case 'slug':
                    return a.slug > b.slug;
                case 'created':
                    return (new Date(b.created)) - (new Date(a.created));
                case 'score':
                    return b.score - a.score;
            }
        });
    }

    // Create a controller method for sending messages
    function sendMessage() {
        // Create a new message object
        var message = {
            text: cp.messageText
        };

        // Emit a 'chatMessage' message event
        PlaygroundService.emit('chatMessage', message);

        // Clear the message text
        cp.messageText = '';
    }

    function hideChat() {
        cp.chatHidden = true;
        console.log(cp.chatMgr);
    }

    function showChat() {
        cp.chatHidden = false;
    }


    cp.addTab = function(game) {
        if (!cp.openedGames.some(function(t) {
                return t === game
            })) {
            game.src = $sce.trustAsResourceUrl(game.link.replace('http://', '//'));
            cp.openedGames.push(game);
            localStorage.setItem('lastOpened', cp.openedGames.join(','));
        }
    };

    cp.closeTab = function(game) {
        var ind = cp.openedGames.findIndex((g)=>{
        	return g._id === game._id
        });
        cp.openedGames.splice(ind, 1);
        localStorage.setItem('lastOpened', cp.openedGames.join(','));
    };
}

'use strict';

angular.module('games').component('tag', {

    template: `
    <div class="inexSelector" ng-class="{'included': $ctrl.state==1, 'excluded': $ctrl.state==-1}" layout="row" layout-align="center center">
      <button ng-click="$ctrl.include()"><span class="fa fa-plus"></span></button>
      <span ng-bind="$ctrl.tagname" ng-click="$ctrl.include()" class="clickable" flex></span>
      <button ng-click="$ctrl.exclude()"><span class="fa fa-minus"></span></button>
    </div>
  `,
    bindings: {
        tagname: '@',
        state: '<',
        onUpdate: '&'
    },

    controller: inexCtrl
});

function inexCtrl() {
    'ngInject';
    this.include = function() {
        if (this.state == 1) {
            this.state = 0;
        } else {
            this.state = 1;
        }
        this.update(this.tagname, this.state);
    }

    this.exclude = function() {
        if (this.state == -1) {
            this.state = 0;
        } else {
            this.state = -1;
        }
        this.update(this.tagname, this.state);
    }

    this.update = (tagname, state) => {
        this.onUpdate({
            tagname: tagname,
            state: state
        })
    }

}

'use strict';

//Games service used to communicate Games REST endpoints
angular.module('games').factory('Games', ['$resource',
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
]).factory('GamesService', function($q,$http, Games){
    
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
    
});
angular.module('games')
    .service('PlaygroundService', ['Authentication', '$timeout',
        function(Authentication, $timeout) {
            var ChatMgr = function() {
                this.online = [];
                this.onlineHash = {};
                this.messages = [];
                this.maxMessages = 70;
            }

            ChatMgr.prototype.addMessages = function(messages) {
               
                for(var i = 0; i < messages.length; i++){
                    this.messages.push(messages[i]);
                    if(this.messages.length > this.maxMessages){
                        this.messages.shift();
                    }
                }
            };

            ChatMgr.prototype.setOnline = function(users) {
                var self = this;
                self.onlineHash= {}; 
                users.forEach(function(username) {
                    self.onlineHash[username] = true;
                });

                self.online = Object.keys(self.onlineHash);
                return self.online;
            };

            function connect() {
                // Connect only when authenticated
                if (Authentication.user) {
                    service.socket = io('/', {
                        query: 'room=lobby'
                    });
                }
            }

            // Wrap the Socket.io 'emit' method
            function emit(eventName, data) {
                if (service.socket) {
                    service.socket.emit(eventName, data);
                }
            }

            // Wrap the Socket.io 'on' method
            function on(eventName, callback) {
                if (service.socket) {
                    service.socket.on(eventName, function(data) {
                        $timeout(function() {
                            callback(data);
                        });
                    });
                }
            }

            // Wrap the Socket.io 'removeListener' method
            function removeListener(eventName) {
                if (service.socket) {
                    service.socket.removeListener(eventName);
                }
            }

            var service = {
                connect: connect,
                emit: emit,
                on: on,
                removeListener: removeListener,
                socket: null,
                chatMgr: new ChatMgr()
            };

            connect();

            return service;

        }

    ])

'use strict';

//Setting up route
angular.module('playlists').config(['$stateProvider',
	function($stateProvider) {
		// playlists state routing
		$stateProvider.
		state('listPlaylists', {
			url: '/playlists',
			templateUrl: 'modules/playlists/views/list-playlists.client.view.html'
		}).
		state('createPlaylist', {
			url: '/playlists/create',
			templateUrl: 'modules/playlists/views/create-playlist.client.view.html'
		}).
		state('viewPlaylist', {
			url: '/playlists/:playlistId',
			templateUrl: 'modules/playlists/views/view-playlist.client.view.html'
		}).
		state('editPlaylist', {
			url: '/playlists/:playlistId/edit',
			templateUrl: 'modules/playlists/views/edit-playlist.client.view.html'
		});
	}
]);
'use strict';

// Playlists controller
angular.module('playlists').controller('PlaylistsController', ['$rootScope', '$scope', 'Page', '$stateParams', '$location', '$mdToast', 'Authentication', 'Playlists', 'PlaylistGames', '$mdDialog',
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
            Page.setTitle('Plaza - Playlists')

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
                Page.setTitle('Plaza - '+$scope.playlist.name);
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

                $scope.playable = $scope.playlist.games.filter(function(g){
                    return g.playable;
                });

            })
        };

        $scope.openInLounge = function(){
            $scope.playable.forEach(function(g){
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
            })
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
            }, function(res){
            	$scope.playlist.liked = res.liked;
            	$scope.playlist.disliked = res.disliked;
            	$scope.playlist.score = res.score;
            });
        };
    }
]);

angular.module('playlists').service('PlaylistGames', ['$rootScope', '$scope', 'PlaylistGames', 'Playlists', '$q', '$mdDialog',
	function($rootScope, $scope, PlaylistGames, Playlists, $q, $mdDialog){
		return {
			templateUrl: 'modules/playlists/views/playlist-editor.view.html',
			restrict: 'E',
			scope: {
				playlistid: '@'
			},
			link: function postlink(scope, element){
				
			}
		}
	}]);
'use strict';

//Playlists service used to communicate Playlists REST endpoints
angular.module('playlists').service('PlaylistGames', ['$http', 'Authentication', 'Playlists', '$q', '$timeout', 
	function($http, Authentication, Playlists, $q, $timeout) {
	    
	    var myPlaylists = [], initialized = false;
	    
	    if(Authentication.user){
	        initUserPlaylists();
	    } else {
	        initialized = true;
	    }
	    
		return {
		    ready: ready,
		    isInitialized: isInitialized,
		    addGame: addGame,
		    removeGame: removeGame,
		    setPublic: setPublic,
		    checkExistIn: checkExistIn,
		    getMyPlaylists: getMyPlaylists,
		    removeMine: removeMine
		};
		
		function ready(callback){
		    var firstCall = new Date();
		    function check(){
		        if(initialized){
		            callback(myPlaylists);
		        } else {
		            $timeout(function(){
		                var now = new Date();
		                //only try for 10 seconds at most
		                if(now - firstCall < 10000){
		                    check();
		                } else {
		                    callback(myPlaylists);
		                }
        		        
        		    }, 100);
		        }
		    }
		    
		    check();
		}
		
		function isInitialized(){
		    return initialized;
		}
		
		function addGame(playlistId, gameId){
		    return $http.put('/api/playlist/'+playlistId+'/'+gameId);
		}
		
		function removeGame(playlistId, gameId){
		    return $http.delete('/api/playlist/'+playlistId+'/'+gameId);
		}
		
		function setPublic(playlistId){
		    return $http.post('/api/playlists/'+playlistId+'/publish');
		}
		
		function checkExistIn(gameId){
		    //returns the playlists that have this game already
		    return myPlaylists.filter(function(playlist){
		        return playlist.games.some(function(_gameId){
		            return gameId === _gameId;  
		        });
		    });
		}

		function getMyPlaylists(){
		     var deferred = $q.defer();
		    if(Authentication.user){
		    	ready(function(playlist){
		    		deferred.resolve(playlist);
		    	});
		    } else {
		    	deferred.reject();
		    }
		    return deferred.promise;

		}
		
		function initUserPlaylists(){
		    var deferred = $q.defer();
		    if(Authentication.user){
		        $http.get('/api/playlists/mine').then(function(response){
		            myPlaylists = response.data;
		            initialized = true;
		            deferred.resolve(myPlaylists);
		        }, function(error){
		        	initialized = true;
		            deferred.reject(error);
		        });
		    } else {
		        deferred.reject({status: 403, errorMessage: 'Not logged in'});
		        initialized = true;
		    }
		    
		    return deferred.promise;
		    
		}

		function removeMine(playlist){
			return $http.delete('/api/playlists/'+playlist._id).then(function(response){
				console.log(response);
				myPlaylists.splice(myPlaylists.indexOf(playlist), 1);
				return response;
			}, function(error){
				console.log(error);
				return error;
			})
		}
		
	}
]);
'use strict';

//Playlists service used to communicate Playlists REST endpoints
angular.module('playlists').factory('Playlists', ['$resource',
	function($resource) {
		return $resource('api/playlists/:playlistId', { playlistId: '@_id'
		}, {
			update: {
				method: 'PUT'
			},
			vote: {
				method: 'PUT',
				url: 'api/playlists/:playlistId/vote'
			}
		});
	}
]);
'use strict';

//Setting up route
angular.module('reviews').config(['$stateProvider',
	function($stateProvider) {
		// Reviews state routing
		$stateProvider.
		state('listReviews', {
			url: '/reviews',
			templateUrl: 'modules/reviews/views/list-reviews.client.view.html'
		}).
		state('createReview', {
			url: '/reviews/create',
			templateUrl: 'modules/reviews/views/create-review.client.view.html'
		}).
		state('viewReview', {
			url: '/reviews/:reviewId',
			templateUrl: 'modules/reviews/views/view-review.client.view.html'
		}).
		state('editReview', {
			url: '/reviews/:reviewId/edit',
			templateUrl: 'modules/reviews/views/edit-review.client.view.html'
		});
	}
]);
'use strict';

// Reviews controller
angular.module('reviews').controller('ReviewsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Reviews',
	function($scope, $stateParams, $location, Authentication, Reviews) {
		$scope.authentication = Authentication;

		// Create new Review
		$scope.create = function() {
			// Create new Review object
			var review = new Reviews ({
				name: this.name
			});

			// Redirect after save
			review.$save(function(response) {
				$location.path('reviews/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Review
		$scope.remove = function(review) {
			if ( review ) { 
				review.$remove();

				for (var i in $scope.reviews) {
					if ($scope.reviews [i] === review) {
						$scope.reviews.splice(i, 1);
					}
				}
			} else {
				$scope.review.$remove(function() {
					$location.path('reviews');
				});
			}
		};

		// Update existing Review
		$scope.update = function() {
			var review = $scope.review;

			review.$update(function() {
				$location.path('reviews/' + review._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Reviews
		$scope.find = function() {
			$scope.reviews = Reviews.query();
		};

		// Find existing Review
		$scope.findOne = function() {
			$scope.review = Reviews.get({ 
				reviewId: $stateParams.reviewId
			});
		};
	}
]);
'use strict';

//Reviews service used to communicate Reviews REST endpoints
angular.module('reviews').factory('Reviews', ['$resource',
	function($resource) {
		return $resource('api/reviews/:reviewId', { reviewId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
'use strict';

// Config HTTP Error Handling
angular.module('users').config(['$httpProvider',
	function($httpProvider) {
		// Set the httpProvider "not authorized" interceptor
		$httpProvider.interceptors.push(['$q', '$location', 'Authentication',
			function($q, $location, Authentication) {
				return {
					responseError: function(rejection) {
						switch (rejection.status) {
							case 401:
								// Deauthenticate the global user
								Authentication.user = null;

								// Redirect to signin page
								$location.path('signin');
								break;
							case 403:
								// Add unauthorized behaviour 
								break;
						}

						return $q.reject(rejection);
					}
				};
			}
		]);
	}
]);
'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
    function($stateProvider) {
        // Users state routing
        $stateProvider.
        state('profile', {
            url: '/settings/profile',
            templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
        }).
        state('password', {
            url: '/settings/password',
            templateUrl: 'modules/users/views/settings/change-password.client.view.html'
        }).
        state('accounts', {
            url: '/settings/accounts',
            templateUrl: 'modules/users/views/settings/social-accounts.client.view.html'
        }).
        state('signup', {
            url: '/signup',
            templateUrl: 'modules/users/views/authentication/signup.client.view.html'
        }).
        state('signin', {
            url: '/signin',
            templateUrl: 'modules/users/views/authentication/signin.client.view.html'
        }).
        state('forgot', {
            url: '/password/forgot',
            templateUrl: 'modules/users/views/password/forgot-password.client.view.html'
        }).
        state('reset-invalid', {
            url: '/password/reset/invalid',
            templateUrl: 'modules/users/views/password/reset-password-invalid.client.view.html'
        }).
        state('reset-success', {
            url: '/password/reset/success',
            templateUrl: 'modules/users/views/password/reset-password-success.client.view.html'
        }).
        state('reset', {
            url: '/password/reset/:token',
            templateUrl: 'modules/users/views/password/reset-password.client.view.html'
        }).
        state('member', {
            url: '/m/:username',
            templateUrl: 'modules/users/views/member.client.view.html'
        });
    }
]);
'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$http', '$location', 'Authentication',
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
'use strict';

angular.module('users').controller('PasswordController', ['$scope', '$stateParams', '$http', '$location', 'Authentication',
	function($scope, $stateParams, $http, $location, Authentication) {
		$scope.authentication = Authentication;

		//If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

		// Submit forgotten password account id
		$scope.askForPasswordReset = function() {
			$scope.success = $scope.error = null;

			$http.post('/auth/forgot', $scope.credentials).success(function(response) {
				// Show user success message and clear form
				$scope.credentials = null;
				$scope.success = response.message;

			}).error(function(response) {
				// Show user error message and clear form
				$scope.credentials = null;
				$scope.error = response.message;
			});
		};

		// Change user password
		$scope.resetUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.passwordDetails = null;

				// Attach user profile
				Authentication.user = response;

				// And redirect to the index page
				$location.path('/password/reset/success');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
'use strict';

angular.module('users').controller('ProfileController', ['$scope', '$http', '$location', 'Page', '$stateParams', '$mdDialog', 'Users', 'Profiles', 'Authentication', 'Playlists',
    function($scope, $http, $location, Page, $stateParams, $mdDialog, Users, Profiles, Authentication, Playlists) {
        $scope.user = Authentication.user;


        $scope.findUser = function() {
            Page.setTitle('Plaza Profile - '+$stateParams.username)
            $scope.profile = Profiles.get({
                username: $stateParams.username
            }, function() {
                $scope.profile.reviewcount = $scope.profile.reviewed.length;
                if (Authentication.user) {
                    $scope.isCurrentUser = Authentication.user._id === $scope.profile._id;
                }

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

'use strict';

angular.module('users').controller('SettingsController', ['$scope', '$http', '$location', 'Users', 'Authentication',
	function($scope, $http, $location, Users, Authentication) {
		$scope.user = Authentication.user;

		// If user is not signed in then redirect back home
		if (!$scope.user) $location.path('/');

		// Check if there are additional accounts 
		$scope.hasConnectedAdditionalSocialAccounts = function(provider) {
			for (var i in $scope.user.additionalProvidersData) {
				return true;
			}

			return false;
		};

		// Check if provider is already in use with current user
		$scope.isConnectedSocialAccount = function(provider) {
			return $scope.user.provider === provider || ($scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider]);
		};

		// Remove a user social account
		$scope.removeUserSocialAccount = function(provider) {
			$scope.success = $scope.error = null;

			$http.delete('/api/users/accounts', {
				params: {
					provider: provider
				}
			}).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.user = Authentication.user = response;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		// Update a user profile
		$scope.updateUserProfile = function(isValid) {
			if (isValid) {
				$scope.success = $scope.error = null;
				var user = new Users($scope.user);

				user.$update(function(response) {
					$scope.success = true;
					Authentication.user = response;
				}, function(response) {
					$scope.error = response.data.message;
				});
			} else {
				$scope.submitted = true;
			}
		};

		// Change user password
		$scope.changeUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/api/users/password', $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.passwordDetails = null;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', [
	function() {
		var _this = this;

		_this._data = {
			user: window.user
		};

		return _this._data;
	}
]);
'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Profiles', ['$resource',
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
'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
	function($resource) {
		return $resource('api/users', {}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
!function(e){"undefined"!=typeof exports?e(exports):(window.hljs=e({}),"function"==typeof define&&define.amd&&define("hljs",[],function(){return window.hljs}))}(function(e){function n(e){return e.replace(/&/gm,"&amp;").replace(/</gm,"&lt;").replace(/>/gm,"&gt;")}function t(e){return e.nodeName.toLowerCase()}function r(e,n){var t=e&&e.exec(n);return t&&0==t.index}function a(e){return/no-?highlight|plain|text/.test(e)}function i(e){var n,t,r,i=e.className+" ";if(i+=e.parentNode?e.parentNode.className:"",t=/\blang(?:uage)?-([\w-]+)\b/.exec(i))return E(t[1])?t[1]:"no-highlight";for(i=i.split(/\s+/),n=0,r=i.length;r>n;n++)if(E(i[n])||a(i[n]))return i[n]}function o(e,n){var t,r={};for(t in e)r[t]=e[t];if(n)for(t in n)r[t]=n[t];return r}function u(e){var n=[];return function r(e,a){for(var i=e.firstChild;i;i=i.nextSibling)3==i.nodeType?a+=i.nodeValue.length:1==i.nodeType&&(n.push({event:"start",offset:a,node:i}),a=r(i,a),t(i).match(/br|hr|img|input/)||n.push({event:"stop",offset:a,node:i}));return a}(e,0),n}function c(e,r,a){function i(){return e.length&&r.length?e[0].offset!=r[0].offset?e[0].offset<r[0].offset?e:r:"start"==r[0].event?e:r:e.length?e:r}function o(e){function r(e){return" "+e.nodeName+'="'+n(e.value)+'"'}f+="<"+t(e)+Array.prototype.map.call(e.attributes,r).join("")+">"}function u(e){f+="</"+t(e)+">"}function c(e){("start"==e.event?o:u)(e.node)}for(var s=0,f="",l=[];e.length||r.length;){var g=i();if(f+=n(a.substr(s,g[0].offset-s)),s=g[0].offset,g==e){l.reverse().forEach(u);do c(g.splice(0,1)[0]),g=i();while(g==e&&g.length&&g[0].offset==s);l.reverse().forEach(o)}else"start"==g[0].event?l.push(g[0].node):l.pop(),c(g.splice(0,1)[0])}return f+n(a.substr(s))}function s(e){function n(e){return e&&e.source||e}function t(t,r){return new RegExp(n(t),"m"+(e.cI?"i":"")+(r?"g":""))}function r(a,i){if(!a.compiled){if(a.compiled=!0,a.k=a.k||a.bK,a.k){var u={},c=function(n,t){e.cI&&(t=t.toLowerCase()),t.split(" ").forEach(function(e){var t=e.split("|");u[t[0]]=[n,t[1]?Number(t[1]):1]})};"string"==typeof a.k?c("keyword",a.k):Object.keys(a.k).forEach(function(e){c(e,a.k[e])}),a.k=u}a.lR=t(a.l||/\b\w+\b/,!0),i&&(a.bK&&(a.b="\\b("+a.bK.split(" ").join("|")+")\\b"),a.b||(a.b=/\B|\b/),a.bR=t(a.b),a.e||a.eW||(a.e=/\B|\b/),a.e&&(a.eR=t(a.e)),a.tE=n(a.e)||"",a.eW&&i.tE&&(a.tE+=(a.e?"|":"")+i.tE)),a.i&&(a.iR=t(a.i)),void 0===a.r&&(a.r=1),a.c||(a.c=[]);var s=[];a.c.forEach(function(e){e.v?e.v.forEach(function(n){s.push(o(e,n))}):s.push("self"==e?a:e)}),a.c=s,a.c.forEach(function(e){r(e,a)}),a.starts&&r(a.starts,i);var f=a.c.map(function(e){return e.bK?"\\.?("+e.b+")\\.?":e.b}).concat([a.tE,a.i]).map(n).filter(Boolean);a.t=f.length?t(f.join("|"),!0):{exec:function(){return null}}}}r(e)}function f(e,t,a,i){function o(e,n){for(var t=0;t<n.c.length;t++)if(r(n.c[t].bR,e))return n.c[t]}function u(e,n){if(r(e.eR,n)){for(;e.endsParent&&e.parent;)e=e.parent;return e}return e.eW?u(e.parent,n):void 0}function c(e,n){return!a&&r(n.iR,e)}function g(e,n){var t=N.cI?n[0].toLowerCase():n[0];return e.k.hasOwnProperty(t)&&e.k[t]}function h(e,n,t,r){var a=r?"":w.classPrefix,i='<span class="'+a,o=t?"":"</span>";return i+=e+'">',i+n+o}function p(){if(!L.k)return n(B);var e="",t=0;L.lR.lastIndex=0;for(var r=L.lR.exec(B);r;){e+=n(B.substr(t,r.index-t));var a=g(L,r);a?(y+=a[1],e+=h(a[0],n(r[0]))):e+=n(r[0]),t=L.lR.lastIndex,r=L.lR.exec(B)}return e+n(B.substr(t))}function d(){if(L.sL&&!x[L.sL])return n(B);var e=L.sL?f(L.sL,B,!0,M[L.sL]):l(B);return L.r>0&&(y+=e.r),"continuous"==L.subLanguageMode&&(M[L.sL]=e.top),h(e.language,e.value,!1,!0)}function b(){return void 0!==L.sL?d():p()}function v(e,t){var r=e.cN?h(e.cN,"",!0):"";e.rB?(k+=r,B=""):e.eB?(k+=n(t)+r,B=""):(k+=r,B=t),L=Object.create(e,{parent:{value:L}})}function m(e,t){if(B+=e,void 0===t)return k+=b(),0;var r=o(t,L);if(r)return k+=b(),v(r,t),r.rB?0:t.length;var a=u(L,t);if(a){var i=L;i.rE||i.eE||(B+=t),k+=b();do L.cN&&(k+="</span>"),y+=L.r,L=L.parent;while(L!=a.parent);return i.eE&&(k+=n(t)),B="",a.starts&&v(a.starts,""),i.rE?0:t.length}if(c(t,L))throw new Error('Illegal lexeme "'+t+'" for mode "'+(L.cN||"<unnamed>")+'"');return B+=t,t.length||1}var N=E(e);if(!N)throw new Error('Unknown language: "'+e+'"');s(N);var R,L=i||N,M={},k="";for(R=L;R!=N;R=R.parent)R.cN&&(k=h(R.cN,"",!0)+k);var B="",y=0;try{for(var C,j,I=0;;){if(L.t.lastIndex=I,C=L.t.exec(t),!C)break;j=m(t.substr(I,C.index-I),C[0]),I=C.index+j}for(m(t.substr(I)),R=L;R.parent;R=R.parent)R.cN&&(k+="</span>");return{r:y,value:k,language:e,top:L}}catch(O){if(-1!=O.message.indexOf("Illegal"))return{r:0,value:n(t)};throw O}}function l(e,t){t=t||w.languages||Object.keys(x);var r={r:0,value:n(e)},a=r;return t.forEach(function(n){if(E(n)){var t=f(n,e,!1);t.language=n,t.r>a.r&&(a=t),t.r>r.r&&(a=r,r=t)}}),a.language&&(r.second_best=a),r}function g(e){return w.tabReplace&&(e=e.replace(/^((<[^>]+>|\t)+)/gm,function(e,n){return n.replace(/\t/g,w.tabReplace)})),w.useBR&&(e=e.replace(/\n/g,"<br>")),e}function h(e,n,t){var r=n?R[n]:t,a=[e.trim()];return e.match(/\bhljs\b/)||a.push("hljs"),-1===e.indexOf(r)&&a.push(r),a.join(" ").trim()}function p(e){var n=i(e);if(!a(n)){var t;w.useBR?(t=document.createElementNS("http://www.w3.org/1999/xhtml","div"),t.innerHTML=e.innerHTML.replace(/\n/g,"").replace(/<br[ \/]*>/g,"\n")):t=e;var r=t.textContent,o=n?f(n,r,!0):l(r),s=u(t);if(s.length){var p=document.createElementNS("http://www.w3.org/1999/xhtml","div");p.innerHTML=o.value,o.value=c(s,u(p),r)}o.value=g(o.value),e.innerHTML=o.value,e.className=h(e.className,n,o.language),e.result={language:o.language,re:o.r},o.second_best&&(e.second_best={language:o.second_best.language,re:o.second_best.r})}}function d(e){w=o(w,e)}function b(){if(!b.called){b.called=!0;var e=document.querySelectorAll("pre code");Array.prototype.forEach.call(e,p)}}function v(){addEventListener("DOMContentLoaded",b,!1),addEventListener("load",b,!1)}function m(n,t){var r=x[n]=t(e);r.aliases&&r.aliases.forEach(function(e){R[e]=n})}function N(){return Object.keys(x)}function E(e){return x[e]||x[R[e]]}var w={classPrefix:"hljs-",tabReplace:null,useBR:!1,languages:void 0},x={},R={};return e.highlight=f,e.highlightAuto=l,e.fixMarkup=g,e.highlightBlock=p,e.configure=d,e.initHighlighting=b,e.initHighlightingOnLoad=v,e.registerLanguage=m,e.listLanguages=N,e.getLanguage=E,e.inherit=o,e.IR="[a-zA-Z]\\w*",e.UIR="[a-zA-Z_]\\w*",e.NR="\\b\\d+(\\.\\d+)?",e.CNR="\\b(0[xX][a-fA-F0-9]+|(\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)",e.BNR="\\b(0b[01]+)",e.RSR="!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~",e.BE={b:"\\\\[\\s\\S]",r:0},e.ASM={cN:"string",b:"'",e:"'",i:"\\n",c:[e.BE]},e.QSM={cN:"string",b:'"',e:'"',i:"\\n",c:[e.BE]},e.PWM={b:/\b(a|an|the|are|I|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such)\b/},e.C=function(n,t,r){var a=e.inherit({cN:"comment",b:n,e:t,c:[]},r||{});return a.c.push(e.PWM),a.c.push({cN:"doctag",bK:"TODO FIXME NOTE BUG XXX",r:0}),a},e.CLCM=e.C("//","$"),e.CBCM=e.C("/\\*","\\*/"),e.HCM=e.C("#","$"),e.NM={cN:"number",b:e.NR,r:0},e.CNM={cN:"number",b:e.CNR,r:0},e.BNM={cN:"number",b:e.BNR,r:0},e.CSSNM={cN:"number",b:e.NR+"(%|em|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc|px|deg|grad|rad|turn|s|ms|Hz|kHz|dpi|dpcm|dppx)?",r:0},e.RM={cN:"regexp",b:/\//,e:/\/[gimuy]*/,i:/\n/,c:[e.BE,{b:/\[/,e:/\]/,r:0,c:[e.BE]}]},e.TM={cN:"title",b:e.IR,r:0},e.UTM={cN:"title",b:e.UIR,r:0},e});hljs.registerLanguage("javascript",function(e){return{aliases:["js"],k:{keyword:"in of if for while finally var new function do return void else break catch instanceof with throw case default try this switch continue typeof delete let yield const export super debugger as async await",literal:"true false null undefined NaN Infinity",built_in:"eval isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent encodeURI encodeURIComponent escape unescape Object Function Boolean Error EvalError InternalError RangeError ReferenceError StopIteration SyntaxError TypeError URIError Number Math Date String RegExp Array Float32Array Float64Array Int16Array Int32Array Int8Array Uint16Array Uint32Array Uint8Array Uint8ClampedArray ArrayBuffer DataView JSON Intl arguments require module console window document Symbol Set Map WeakSet WeakMap Proxy Reflect Promise"},c:[{cN:"pi",r:10,b:/^\s*['"]use (strict|asm)['"]/},e.ASM,e.QSM,{cN:"string",b:"`",e:"`",c:[e.BE,{cN:"subst",b:"\\$\\{",e:"\\}"}]},e.CLCM,e.CBCM,{cN:"number",v:[{b:"\\b(0[bB][01]+)"},{b:"\\b(0[oO][0-7]+)"},{b:e.CNR}],r:0},{b:"("+e.RSR+"|\\b(case|return|throw)\\b)\\s*",k:"return throw case",c:[e.CLCM,e.CBCM,e.RM,{b:/</,e:/>\s*[);\]]/,r:0,sL:"xml"}],r:0},{cN:"function",bK:"function",e:/\{/,eE:!0,c:[e.inherit(e.TM,{b:/[A-Za-z$_][0-9A-Za-z$_]*/}),{cN:"params",b:/\(/,e:/\)/,eB:!0,eE:!0,c:[e.CLCM,e.CBCM],i:/["'\(]/}],i:/\[|%/},{b:/\$[(.]/},{b:"\\."+e.IR,r:0},{bK:"import",e:"[;$]",k:"import from as",c:[e.ASM,e.QSM]},{cN:"class",bK:"class",e:/[{;=]/,eE:!0,i:/[:"\[\]]/,c:[{bK:"extends"},e.UTM]}]}});hljs.registerLanguage("http",function(t){return{aliases:["https"],i:"\\S",c:[{cN:"status",b:"^HTTP/[0-9\\.]+",e:"$",c:[{cN:"number",b:"\\b\\d{3}\\b"}]},{cN:"request",b:"^[A-Z]+ (.*?) HTTP/[0-9\\.]+$",rB:!0,e:"$",c:[{cN:"string",b:" ",e:" ",eB:!0,eE:!0}]},{cN:"attribute",b:"^\\w",e:": ",eE:!0,i:"\\n|\\s|=",starts:{cN:"string",e:"$"}},{b:"\\n\\n",starts:{sL:"",eW:!0}}]}});hljs.registerLanguage("css",function(e){var c="[a-zA-Z-][a-zA-Z0-9_-]*",a={cN:"function",b:c+"\\(",rB:!0,eE:!0,e:"\\("},r={cN:"rule",b:/[A-Z\_\.\-]+\s*:/,rB:!0,e:";",eW:!0,c:[{cN:"attribute",b:/\S/,e:":",eE:!0,starts:{cN:"value",eW:!0,eE:!0,c:[a,e.CSSNM,e.QSM,e.ASM,e.CBCM,{cN:"hexcolor",b:"#[0-9A-Fa-f]+"},{cN:"important",b:"!important"}]}}]};return{cI:!0,i:/[=\/|'\$]/,c:[e.CBCM,r,{cN:"id",b:/\#[A-Za-z0-9_-]+/},{cN:"class",b:/\.[A-Za-z0-9_-]+/},{cN:"attr_selector",b:/\[/,e:/\]/,i:"$"},{cN:"pseudo",b:/:(:)?[a-zA-Z0-9\_\-\+\(\)"']+/},{cN:"at_rule",b:"@(font-face|page)",l:"[a-z-]+",k:"font-face page"},{cN:"at_rule",b:"@",e:"[{;]",c:[{cN:"keyword",b:/\S+/},{b:/\s/,eW:!0,eE:!0,r:0,c:[a,e.ASM,e.QSM,e.CSSNM]}]},{cN:"tag",b:c,r:0},{cN:"rules",b:"{",e:"}",i:/\S/,c:[e.CBCM,r]}]}});hljs.registerLanguage("coffeescript",function(e){var c={keyword:"in if for while finally new do return else break catch instanceof throw try this switch continue typeof delete debugger super then unless until loop of by when and or is isnt not",literal:"true false null undefined yes no on off",reserved:"case default function var void with const let enum export import native __hasProp __extends __slice __bind __indexOf",built_in:"npm require console print module global window document"},n="[A-Za-z$_][0-9A-Za-z$_]*",t={cN:"subst",b:/#\{/,e:/}/,k:c},r=[e.BNM,e.inherit(e.CNM,{starts:{e:"(\\s*/)?",r:0}}),{cN:"string",v:[{b:/'''/,e:/'''/,c:[e.BE]},{b:/'/,e:/'/,c:[e.BE]},{b:/"""/,e:/"""/,c:[e.BE,t]},{b:/"/,e:/"/,c:[e.BE,t]}]},{cN:"regexp",v:[{b:"///",e:"///",c:[t,e.HCM]},{b:"//[gim]*",r:0},{b:/\/(?![ *])(\\\/|.)*?\/[gim]*(?=\W|$)/}]},{cN:"property",b:"@"+n},{b:"`",e:"`",eB:!0,eE:!0,sL:"javascript"}];t.c=r;var i=e.inherit(e.TM,{b:n}),s="(\\(.*\\))?\\s*\\B[-=]>",o={cN:"params",b:"\\([^\\(]",rB:!0,c:[{b:/\(/,e:/\)/,k:c,c:["self"].concat(r)}]};return{aliases:["coffee","cson","iced"],k:c,i:/\/\*/,c:r.concat([e.C("###","###"),e.HCM,{cN:"function",b:"^\\s*"+n+"\\s*=\\s*"+s,e:"[-=]>",rB:!0,c:[i,o]},{b:/[:\(,=]\s*/,r:0,c:[{cN:"function",b:s,e:"[-=]>",rB:!0,c:[o]}]},{cN:"class",bK:"class",e:"$",i:/[:="\[\]]/,c:[{bK:"extends",eW:!0,i:/[:="\[\]]/,c:[i]},i]},{cN:"attribute",b:n+":",e:":",rB:!0,rE:!0,r:0}])}});hljs.registerLanguage("markdown",function(e){return{aliases:["md","mkdown","mkd"],c:[{cN:"header",v:[{b:"^#{1,6}",e:"$"},{b:"^.+?\\n[=-]{2,}$"}]},{b:"<",e:">",sL:"xml",r:0},{cN:"bullet",b:"^([*+-]|(\\d+\\.))\\s+"},{cN:"strong",b:"[*_]{2}.+?[*_]{2}"},{cN:"emphasis",v:[{b:"\\*.+?\\*"},{b:"_.+?_",r:0}]},{cN:"blockquote",b:"^>\\s+",e:"$"},{cN:"code",v:[{b:"`.+?`"},{b:"^( {4}|	)",e:"$",r:0}]},{cN:"horizontal_rule",b:"^[-\\*]{3,}",e:"$"},{b:"\\[.+?\\][\\(\\[].*?[\\)\\]]",rB:!0,c:[{cN:"link_label",b:"\\[",e:"\\]",eB:!0,rE:!0,r:0},{cN:"link_url",b:"\\]\\(",e:"\\)",eB:!0,eE:!0},{cN:"link_reference",b:"\\]\\[",e:"\\]",eB:!0,eE:!0}],r:10},{b:"^\\[.+\\]:",rB:!0,c:[{cN:"link_reference",b:"\\[",e:"\\]:",eB:!0,eE:!0,starts:{cN:"link_url",e:"$"}}]}]}});hljs.registerLanguage("json",function(e){var t={literal:"true false null"},i=[e.QSM,e.CNM],l={cN:"value",e:",",eW:!0,eE:!0,c:i,k:t},c={b:"{",e:"}",c:[{cN:"attribute",b:'\\s*"',e:'"\\s*:\\s*',eB:!0,eE:!0,c:[e.BE],i:"\\n",starts:l}],i:"\\S"},n={b:"\\[",e:"\\]",c:[e.inherit(l,{cN:null})],i:"\\S"};return i.splice(i.length,0,c,n),{c:i,k:t,i:"\\S"}});hljs.registerLanguage("xml",function(t){var e="[A-Za-z0-9\\._:-]+",s={b:/<\?(php)?(?!\w)/,e:/\?>/,sL:"php",subLanguageMode:"continuous"},c={eW:!0,i:/</,r:0,c:[s,{cN:"attribute",b:e,r:0},{b:"=",r:0,c:[{cN:"value",c:[s],v:[{b:/"/,e:/"/},{b:/'/,e:/'/},{b:/[^\s\/>]+/}]}]}]};return{aliases:["html","xhtml","rss","atom","xsl","plist"],cI:!0,c:[{cN:"doctype",b:"<!DOCTYPE",e:">",r:10,c:[{b:"\\[",e:"\\]"}]},t.C("<!--","-->",{r:10}),{cN:"cdata",b:"<\\!\\[CDATA\\[",e:"\\]\\]>",r:10},{cN:"tag",b:"<style(?=\\s|>|$)",e:">",k:{title:"style"},c:[c],starts:{e:"</style>",rE:!0,sL:"css"}},{cN:"tag",b:"<script(?=\\s|>|$)",e:">",k:{title:"script"},c:[c],starts:{e:"</script>",rE:!0,sL:""}},s,{cN:"pi",b:/<\?\w+/,e:/\?>/,r:10},{cN:"tag",b:"</?",e:"/?>",c:[{cN:"title",b:/[^ \/><\n\t]+/,r:0},c]}]}});hljs.registerLanguage("bash",function(e){var t={cN:"variable",v:[{b:/\$[\w\d#@][\w\d_]*/},{b:/\$\{(.*?)}/}]},s={cN:"string",b:/"/,e:/"/,c:[e.BE,t,{cN:"variable",b:/\$\(/,e:/\)/,c:[e.BE]}]},a={cN:"string",b:/'/,e:/'/};return{aliases:["sh","zsh"],l:/-?[a-z\.]+/,k:{keyword:"if then else elif fi for while in do done case esac function",literal:"true false",built_in:"break cd continue eval exec exit export getopts hash pwd readonly return shift test times trap umask unset alias bind builtin caller command declare echo enable help let local logout mapfile printf read readarray source type typeset ulimit unalias set shopt autoload bg bindkey bye cap chdir clone comparguments compcall compctl compdescribe compfiles compgroups compquote comptags comptry compvalues dirs disable disown echotc echoti emulate fc fg float functions getcap getln history integer jobs kill limit log noglob popd print pushd pushln rehash sched setcap setopt stat suspend ttyctl unfunction unhash unlimit unsetopt vared wait whence where which zcompile zformat zftp zle zmodload zparseopts zprof zpty zregexparse zsocket zstyle ztcp",operator:"-ne -eq -lt -gt -f -d -e -s -l -a"},c:[{cN:"shebang",b:/^#![^\n]+sh\s*$/,r:10},{cN:"function",b:/\w[\w\d_]*\s*\(\s*\)\s*\{/,rB:!0,c:[e.inherit(e.TM,{b:/\w[\w\d_]*/})],r:0},e.HCM,e.NM,s,a,t]}});hljs.registerLanguage("php",function(e){var c={cN:"variable",b:"\\$+[a-zA-Z_-ÿ][a-zA-Z0-9_-ÿ]*"},a={cN:"preprocessor",b:/<\?(php)?|\?>/},i={cN:"string",c:[e.BE,a],v:[{b:'b"',e:'"'},{b:"b'",e:"'"},e.inherit(e.ASM,{i:null}),e.inherit(e.QSM,{i:null})]},n={v:[e.BNM,e.CNM]};return{aliases:["php3","php4","php5","php6"],cI:!0,k:"and include_once list abstract global private echo interface as static endswitch array null if endwhile or const for endforeach self var while isset public protected exit foreach throw elseif include __FILE__ empty require_once do xor return parent clone use __CLASS__ __LINE__ else break print eval new catch __METHOD__ case exception default die require __FUNCTION__ enddeclare final try switch continue endfor endif declare unset true false trait goto instanceof insteadof __DIR__ __NAMESPACE__ yield finally",c:[e.CLCM,e.HCM,e.C("/\\*","\\*/",{c:[{cN:"doctag",b:"@[A-Za-z]+"},a]}),e.C("__halt_compiler.+?;",!1,{eW:!0,k:"__halt_compiler",l:e.UIR}),{cN:"string",b:"<<<['\"]?\\w+['\"]?$",e:"^\\w+;",c:[e.BE]},a,c,{b:/(::|->)+[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*/},{cN:"function",bK:"function",e:/[;{]/,eE:!0,i:"\\$|\\[|%",c:[e.UTM,{cN:"params",b:"\\(",e:"\\)",c:["self",c,e.CBCM,i,n]}]},{cN:"class",bK:"class interface",e:"{",eE:!0,i:/[:\(\$"]/,c:[{bK:"extends implements"},e.UTM]},{bK:"namespace",e:";",i:/[\.']/,c:[e.UTM]},{bK:"use",e:";",c:[e.UTM]},{b:"=>"},i,n]}});