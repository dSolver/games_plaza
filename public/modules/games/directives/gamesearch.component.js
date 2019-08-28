window.angular.module('games')
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
    };

    vm.update = function() {
        updateExcludedGameIds();
        vm.onUpdate({ search: vm.search });
    };

    vm.ready = function() {
        vm.onReady();
    };

    vm.updateTagState = function(tagname, state) {
        vm.tagstates[tagname] = state;

        var incInd = vm.search.tags.indexOf(tagname);
        var exInd = vm.search.exclude.tags.indexOf(tagname);

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
    };

    vm.isAvailable = function(tag) {
        if (vm.availableTags !== undefined) {
            return vm.availableTags.some(function(t) {
                return t === tag;
            });
        } else {
            return true;
        }
    };

    vm.hasAvailableTags = function(group) {
        return group.some(function(tag) {
            return vm.isAvailable(tag);
        });
    }

    function init() {
        vm.statuses = CoreService.getStatuses();

        vm.tags = CoreService.getTags();

        Object.keys(vm.tags).forEach(function(cat) {
            vm.tags[cat].forEach(function(t) {
                vm.tagstates[t] = 0;
            });
        });

        //check the search params
        var locationParams = $location.search();
        convertParamToSearch(locationParams);

        vm.update();
        if (vm.onReady) {
            vm.ready();
        }

    }

    function findTag(str) {
        str = str.toLowerCase();

        return Object.keys(vm.tagstates).find(function(tag) {
            return tag.toLowerCase() === str;
        });
    }

    function convertParamToSearch(params) {
        //update the search with tags
        var tags;
        if (!params) {
            return false;
        }
        console.log('convertParamToSearch');
        if (params.tags) {
            tags = params.tags.split(',');
            tags.forEach(function(tag) {
                tag = findTag(tag);

                vm.tagstates[tag] = 1;
                if (vm.search.tags.indexOf(tag) < 0) {
                    vm.search.tags.push(tag);
                }
            });
        }

        if (params.extags) {
            tags = params.extags.split(',');
            tags.forEach(function(tag) {
                var t = findTag(tag);
                vm.tagstates[t] = -1;
                if (vm.search.exclude.tags.indexOf(t) < 0) {
                    vm.search.exclude.tags.push(t);
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