'use strict';

module.exports = {
    app: {
        title: 'Incremental Games Plaza',
        description: 'Incremental and other web games list. Share your ideas, review games, discuss, and explore, all community driven.',
        keywords: 'Incremental, Idle, Web, Game, Workshop, dSolver, List, Review, Rating, Discussion, Comment, Screenshots'
    },
    port: process.env.WORKSHOP_PORT || 3456,
    templateEngine: 'swig',
    sessionSecret: process.env.WORKSHOP_SESSION_SECRET || 'MEAN',
    sessionCollection: 'sessions',
    prerenderToken: process.env.PRERENDER_TOKEN || 'ABCD',
    assets: {
        lib: {
            css: [
                /*'//ajax.googleapis.com/ajax/libs/angular_material/1.1.0/angular-material.min.css',*/
                'public/lib/angular-material/angular-material.min.css',
                '//maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css',
                'public/lib/angular-carousel/dist/angular-carousel.css'
            ],
            js: [
                '//cdnjs.cloudflare.com/ajax/libs/es6-shim/0.35.3/es6-shim.min.js',
                '//cdn.socket.io/socket.io-1.4.5.js',
                '//ajax.googleapis.com/ajax/libs/angularjs/1.5.7/angular.js',
                '//ajax.googleapis.com/ajax/libs/angular_material/1.1.0/angular-material.min.js',
                '//ajax.googleapis.com/ajax/libs/angularjs/1.5.7/angular-resource.min.js',
                '//ajax.googleapis.com/ajax/libs/angularjs/1.5.7/angular-cookies.min.js',
                '//ajax.googleapis.com/ajax/libs/angularjs/1.5.7/angular-animate.min.js',
                '//ajax.googleapis.com/ajax/libs/angularjs/1.5.7/angular-touch.min.js',
                '//ajax.googleapis.com/ajax/libs/angularjs/1.5.7/angular-sanitize.min.js',
                '//ajax.googleapis.com/ajax/libs/angularjs/1.5.7/angular-aria.min.js',
                '//ajax.googleapis.com/ajax/libs/angularjs/1.5.7/angular-messages.min.js',
                '//ajax.googleapis.com/ajax/libs/angularjs/1.5.7/angular-route.min.js',
                '//ajax.googleapis.com/ajax/libs/jquery/3.1.0/jquery.min.js',
                'public/lib/angular-ui-router/release/angular-ui-router.min.js',
                'public/lib/angular-ui-utils/ui-utils.js',
                'public/lib/angular-carousel/dist/angular-carousel.min.js',
                'public/lib/angular-moment/angular-moment.min.js',
                'public/lib/angular-scroll-glue/src/scrollglue.js',
                'public/lib/ng-file-upload/ng-file-upload.js',
                'public/lib/quick-ngrepeat/quick-ng-repeat.js',
                'public/lib/moment/moment.js'
            ]
        },
        css: [
            'public/modules/**/css/*.css',
            'public/highlighter/styles/googlecode.css'
        ],
        js: [
        ],
        tests: [
        ]
    }
};
