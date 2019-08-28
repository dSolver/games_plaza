

// Discussions controller
window.angular.module('discussions').controller('DiscussionsController', ['$rootScope', '$scope', '$timeout', '$http', '$stateParams', '$location', 'Page', 'Authentication', 'Discussions',
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
                    $scope.htmlReady();
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