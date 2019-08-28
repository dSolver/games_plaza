window.angular.module('core').component('subreddit', {
	controller: ['SubredditService', '$mdDialog', function(SubredditService, $mdDialog) {
		SubredditService.get().then(function(resp) {
			this.posts = resp.data;
			this.posts.forEach(function(post) {
				post.created = new Date(post.created_utc * 1000);
			});
			console.log(this.posts);
		});

		this.explain = function(ev) {
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
	}],
	template: '		<div class="md-title">Game Posts from /r/incremental_games</div>'+
'		<div class="md-padding">'+
'				<div ng-repeat=\'post in $ctrl.posts track by $index\' layout="row" class="subreddit-post">'+
'					<div class="subreddit-score" ng-bind="post.score">'+
'					</div>'+
'					<div class="subreddit-post-content">'+
'						<div class="post-title" layout="row" layout-align="start start">'+
'							<span class="post-flair" ng-bind="post.link_flair_text" hide-xs></span> '+
'							<span>'+
'								<a ng-href="{{post.url}}" target="_new">{{post.title}}</a>'+
'								<span class="post-domain" hide-xs>({{post.domain}})</span>'+
'							</span>'+
'						</div>'+
'						<div class="post-details">'+
'							<a ng-href="https://www.reddit.com/u/{{post.author}}">{{post.author}}</a>'+
'							'+
'							<span am-time-ago="post.created"></span>'+
'							<a ng-href="https://www.reddit.com{{post.permalink}}" target="_new">{{post.num_comments}} comment{{post.num_comments>1?\'s\':\'\'}}</a>'+
'						</div>'+
'						<div class="post-game" ng-if="!post.nogame">'+
'							<div ng-if="post.game">'+
'								<a ng-href="/game/{{post.game.slug}}" ng-bind="post.game.name" class="post-gamelink"></a>'+
'								<span ng-repeat="tag in post.game.tags track by $index" class="tag {{tag}}">{{tag}}</span>'+
'							</div>'+
'							<div ng-if="!post.game" class="plaza-fail">'+
'								The Plaza could not figure out which game this post is about. <a href="#" ng-click="$ctrl.explain($event)">Learn More</a>'+
'							</div>'+
'						</div>'+
'					</div>'+
'					<div class="post-thumb">'+
'						<img ng-if="post.thumbnail" ng-src="{{post.thumbnail}}">'+
'					</div>'+
'				</div>'+
'		</div>'
	
});
