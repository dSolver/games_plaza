

window.angular.module('games').component('tag', {

    template: '<div class="inexSelector" ng-class="{\'included\': $ctrl.state==1, \'excluded\': $ctrl.state==-1}" layout="row" layout-align="center center">'+
'      <button ng-click="$ctrl.include()"><span class="fa fa-plus"></span></button>'+
'      <span ng-bind="$ctrl.tagname" ng-click="$ctrl.include()" class="clickable" flex></span>'+
'      <button ng-click="$ctrl.exclude()"><span class="fa fa-minus"></span></button>'+
'    </div>'
  ,
    bindings: {
        tagname: '@',
        state: '<',
        onUpdate: '&'
    },

    controller: inexCtrl
});

function inexCtrl() {
    this.include = function() {
        if (this.state == 1) {
            this.state = 0;
        } else {
            this.state = 1;
        }
        this.update(this.tagname, this.state);
    };

    this.exclude = function() {
        if (this.state == -1) {
            this.state = 0;
        } else {
            this.state = -1;
        }
        this.update(this.tagname, this.state);
    };

    this.update = function(tagname, state) {
        this.onUpdate({
            tagname: tagname,
            state: state
        });
    };

}
