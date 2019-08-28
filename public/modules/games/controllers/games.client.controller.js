

// Games controller
window.angular.module('games').controller('GamesController', [
    '$rootScope', '$scope', 'Page', 'CoreService', 'GamesService', '$stateParams', '$state', '$http', '$timeout', '$mdDialog', '$location', 'Games', 'Upload', 'Reviews', 'Discussions',
    function($rootScope, $scope, Page, CoreService, GamesService, $stateParams, $state, $http, $timeout, $mdDialog, $location, Games, Upload, Reviews, Discussions) {
        $scope.authentication = CoreService.authentication;

        $scope.availableTags = [];

        $scope.maxfilesize = 2500 * 1024;
        $scope.maxDiscussionsDisplayed = 5;
        $scope.maxReviewsDisplayed = 5;

        $scope.uploads = {
            logo: null,
            files: null
        };

        $scope.confirmRemove = function(ev) {
            //$rootScope.openDialog($scope, ev, 'modules/games/views/remove-game.client.view.html');

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
                    return name.trim();
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

        $scope.openLounge = function(gameId) {
            $rootScope.openGameInLounge(gameId);
            $rootScope.openLounge = true;
        };

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

            if (!$stateParams.gameId) {

                $state.go('listGames');
            }
            $scope.game = Games.get({
                gameId: $stateParams.gameId
            }, function() {
                console.log('game data: ', $scope.game);
                Page.title = $scope.game.name;
                if($scope.game.shortDescription){
                    Page.description = $scope.game.shortDescription;
                }
                if($scope.game.logo){
                    Page.image = 'https://plaza.dsolver.ca/uploads/'+$scope.game.logo
                }
                if($scope.game.tags){
                    Page.keywords = $scope.game.tags.join(', ');
                }
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
                if ($scope.game.creatorNames) {
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
                GamesService.like($scope.game._id).then(function(data) {
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

        $scope.addTag = function(tag) {
            //add a tag
            if ($scope.game.tags.indexOf(tag) < 0) {
                $http.put('/api/tags/' + $scope.game._id + '/' + tag).success(function(data) {
                    $scope.game.tags.push(tag);
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
                $rootScope.openDialog($scope, ev, '/modules/games/views/edit-game.client.view.html');
            }
        };

        $scope.openImage = function(ev, index) {
            $scope.imgIndex = index;
            $rootScope.openDialog($scope, ev, '/modules/games/views/view-screenshot.client.view.html');
        };

        //reviewing
        $scope.openReviewWriter = function(ev, score) {
            $scope.error = null;
            $scope.closeDialog();
            if ($scope.canReview) {
                $scope.review = {
                    score: score
                };
                $rootScope.openDialog($scope, ev, '/modules/reviews/views/create-review.client.view.html');
            }
        };

        $scope.openReviewEditor = function(ev, review) {
            $scope.review = new Reviews(review);
            $scope.error = null;
            $rootScope.openDialog($scope, ev, '/modules/reviews/views/edit-review.client.view.html');
        };

        $scope.openReviewDetails = function(ev, review) {
            $scope.review = review;
            $scope.error = null;
            $rootScope.openDialog($scope, ev, '/modules/reviews/views/view-review.client.view.html');
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

                var existingReview = $scope.reviews.find(function(r) {
                    return r._id === review._id
                });
                if (existingReview) {
                    existingReview = review;
                }

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

                $rootScope.openDialog($scope, ev, '/modules/discussions/views/create-discussion.client.view.html');

            }
        };


        $scope.openDiscussionEditor = function(ev, discussion) {
            $scope.error = null;
            $scope.closeDialog();
            if ($scope.authentication.user._id === discussion.user._id || $scope.authentication.user.roles.indexOf('admin') >= 0) {
                $scope.discussion = discussion;
                $rootScope.openDialog($scope, ev, '/modules/discussions/views/edit-discussion.client.view.html');
            }
        };

        $scope.openDiscussionDetails = function(ev, discussion) {
            $scope.closeDialog();
            $scope.discussion = discussion;

            $scope.getFullDiscussion(discussion._id);

            $scope.comment = {

            };
            $rootScope.openDialog($scope, ev, '/modules/discussions/views/view-discussion.client.view.html');
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

        $scope.tagUsed = function(tag) {

            return $scope.game && $scope.game.tags.find(function(t) {
                return t === tag;
            });
        };

    }
]).filter('hasContent', function() {
    return function(items, search) {
        return items.filter(function(element, index, array) {
            return element.contentHTML.length === 0;
        });
    };
});
