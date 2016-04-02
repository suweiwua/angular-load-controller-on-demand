'use strict';

define(['services/routeResolver'], function () {

    var app = angular.module('app', ['ngRoute', 'routeResolverServices']);

    app.config(['$routeProvider', 'routeResolverProvider', '$controllerProvider', 
                '$compileProvider', '$filterProvider', '$provide',
        function ($routeProvider, routeResolverProvider, $controllerProvider, 
                  $compileProvider, $filterProvider, $provide) {

            //Change default views and controllers directory using the following:
            //routeResolverProvider.routeConfig.setBaseDirectories('/app/views', '/app/controllers');

            app.register =
            {
                controller: $controllerProvider.register,
                directive: $compileProvider.directive,
                filter: $filterProvider.register,
                factory: $provide.factory,
                service: $provide.service
            };

            //Define routes - controllers will be loaded dynamically
            var route = routeResolverProvider.route;

            $routeProvider
                .when('/a', route.resolve('a'))
                .when('/b', route.resolve('b'))
                .when('/c', route.resolve('c'))
                .when('/d', route.resolve('d'))
                .otherwise({ redirectTo: '/a' });
    }]);

    return app;
});