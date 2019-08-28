

//Setting up route
window.angular.module('discussions').config(['$stateProvider',
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