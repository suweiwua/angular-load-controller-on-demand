'use strict';

define(['services/routeResolver'], function () {

    var app = angular.module('app', ['ngRoute', 'resolverMod']);

    app.config(['$routeProvider', 'routeResolverProvider', '$controllerProvider', function ($routeProvider, routeResolverProvider, $controllerProvider) {

        /*
         向app模块注册动态加载的controller
        */
        app.register = {
            controller: $controllerProvider.register
        };

        /* 
        routeResolverProvider为处理动态加载controller的provider 
        resolve方法，会返回一个包含resolve的配置对象
        */
        var resolve = routeResolverProvider.resolve;

        $routeProvider
            .when('/a', resolve({baseName: 'a'}))
            .when('/b', resolve({baseName: 'b'}))
            .when('/c', resolve({baseName: 'c'}))
            .when('/d', resolve({baseName: 'd'}))
            .otherwise({ redirectTo: '/a' });
    }]);

    return app;
});