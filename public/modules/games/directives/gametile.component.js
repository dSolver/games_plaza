window.angular.module('games')
    .component('gameTile', {
        template: '<a class="gameTile tile" ui-sref="viewGame({gameId:$ctrl.slug})" ' +
            '           ng-style="$ctrl.style">' +
            '           <div class="tile-footer">' +
            '                <div layout="row" layout-align="space-between">' +
            '                    <span class="nowrap tile-name" title="{{::$ctrl.gameName}}">{{$ctrl.gameName}}</span>' +
            '                    <span flex></span>' +
            '                    <span class="nowrap spaced">' +
            '                        <span ng-if="$ctrl.gameRating">' +
            '                            <span class="fa fa-star"></span> {{::$ctrl.gameRating | number:1}}' +
            '                        </span>' +
            '                        <span ng-if="$ctrl.loggedIn">' +
            '                            <md-menu>' +
            '                                <span class="fa fa-ellipsis-v" style="padding: 2px 6px" ng-click="$ctrl.openMenu($mdOpenMenu, $event)"></span>' +
            '                                <md-menu-content width="4">' +
            '                                    <md-menu-item ng-if="$ctrl.loggedIn">' +
            '                                        <md-button ng-click="$ctrl.addToPlaylist($event)">Add to Playlist</md-button>' +
            '                                    </md-menu-item>' +
            '                                    <md-menu-item ng-if="$ctrl.playable">' +
            '                                        <md-button ng-click="$ctrl.openInLounge($event)">Open In Lounge</md-button>' +
            '                                    </md-menu-item>' +
            '                                    <md-menu-item ng-if="$ctrl.loggedIn">' +
            '                                        <md-button ng-if="$ctrl.likesThis" ng-click="$ctrl.unlikeThis($event)">Remove from favourites</md-button>' +
            '                                        <md-button ng-if="!$ctrl.likesThis" ng-click="$ctrl.likeThis($event)">Add to favourites</md-button>' +
            '                                    </md-menu-item>' +
            '                                </md-menu-content>' +
            '                            </md-menu>' +
            '                        </span>' +
            '                    </span>' +
            '                </div>' +
            '                <div class="taglist" ng-if="!$ctrl.notags">' +
            '                    <b>Tags:</b>' +
            '                    {{$ctrl.tags}}' +
            '                </div>' +
            '            </div>' +
            '        </a>',
        controller: gameTileController,
        bindings: {
            'gameId': '<',
            'gameRating': '<',
            'nolink': '<',
            'notags': '<'
        }
    });

function gameTileController($rootScope, CoreService, Games, GamesService, Playlists, $mdDialog) {
    var cp = this;
    this.$onChanges = function(changeObj) {
        if (changeObj.gameId && changeObj.gameId.currentValue) {
            extractData(changeObj.gameId.currentValue);
        }
    };

    this.openMenu = function($mdOpenMenu, ev) {
        $mdOpenMenu(ev);
    };

    this.addToPlaylist = function(ev) {
        $rootScope.openPlaylistMgr(ev, CoreService.getGameById(cp.gameId));
    };

    this.likeThis = function() {
        GamesService.like(cp.gameId).then(function() {
            CoreService.authentication.user.gamesLiked.push(cp.gameId);
            CoreService.getGameById(cp.gameId).liked++;
            cp.gameLiked++;
            cp.likesThis = true;
        });
    };

    this.unlikeThis = function() {
        GamesService.unlike(cp.gameId).then(function() {
            CoreService.authentication.user.gamesLiked.splice(CoreService.authentication.user.gamesLiked.indexOf(cp.gameId), 1);
            CoreService.getGameById(cp.gameId).liked--;
            cp.gameLiked--;
            cp.likesThis = false;
        });
    };

    this.openInLounge = function(ev) {
        $rootScope.openGameInLounge(cp.gameId);
    };

    function extractData(gameId) {
        var game = CoreService.getGameById(gameId);

        var logo = 'url(/modules/core/img/plazabg.jpg?thumb=228x128)';
        if (game.logo) {
            logo = 'url(/uploads/' + game.logo + '?thumb=228x128)';
        }
        cp.style = { 'background-image': logo };

        if (game.tags.length > 0) {
            cp.tags = game.tags.join(', ');
        } else {
            cp.tags = 'Not tagged yet';
        }

        cp.gameName = game.name;
        cp.gameLiked = game.liked;

        if (!cp.gameRating) {
            cp.gameRating = game.rating;
        }

        cp.slug = game.slug;

        cp.loggedIn = CoreService.isLoggedIn();

        if (cp.loggedIn) {
            cp.likesThis = CoreService.authentication.user.gamesLiked.some(function(id) {
                return game._id === id;
            });
        }

        cp.playable = game.playable;
    }
}
