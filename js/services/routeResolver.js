'use strict';

define([], function () {

    var resolverMod = angular.module('resolverMod', []);

    var resolverProvider = function () {

        this.$get = function () {
            return this;
        };

        this.resolve = function (opt) {

            var defaults = {
                baseName: '',   //约定的模块名
                path: '',       //子目录
                controllerSuffix: '',   //控制器后缀
                controllerFileSuffix: '.js',    //控制器文件后缀
                templateFileSuffix: '.html',    //模板文件后缀
                templateDir: '/js/business/',   //模板目录
                controllerDir: '/js/business/'  //控制器目录
            };

            var config = angular.extend({}, defaults, opt);

            //路由配置
            config.routeDef = angular.extend({}, config.routeDef, {
                templateUrl: config.templateDir + config.path + config.baseName + config.templateFileSuffix,
                controller: config.baseName + config.controllerSuffix,
            });

            config.routeDef.resolve = angular.extend({}, config.routeDef.resolve, {
                //按需加载核心
                load_on_need: ['$q', function ( $q ) {

                    var defer = $q.defer();
                    var controllerUrl = config.controllerDir + config.path + config.baseName + config.controllerFileSuffix;
                    var dependencies = [controllerUrl];

                    require(dependencies, function () {
                        //加载成功后改变promise状态为resolve
                        defer.resolve();
                    });

                    return defer.promise;
                }]
            });

            return config.routeDef;
        }
    };

    resolverMod.provider('routeResolver', resolverProvider);
});