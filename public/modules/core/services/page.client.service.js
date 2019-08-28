window.angular.module('core').service('Page', [function() {


    this.reset = function() {

        this.title = 'Incremental Games Plaza';
        this.description = 'Find your perfect incremental, clicker, and idle game or help us curate the best list of incremental games with tags, reviews, and pictures';
        this.keywords = 'Incremental, Games, Idle, Plaza, Clicker, Reddit, /r/incremental_games, dSolver, Discussion, Community, Reviews, Guides, Articles, Showcase, List, Curate';
        this.image = 'https://plaza.dsolver.ca/modules/core/img/brand/favicon-96x96.png';
    };

    this.reset();

}]);
