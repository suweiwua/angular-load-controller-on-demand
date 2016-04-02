使用angularjs + requirejs来开发大型单页应用应该说是比较好的组合，通过requirejs异步加载angular的各个
模块一定程度上可以提高应用的加载速度。但是一般情况下，我们所有模块的controller也会在页面初加载
的时候被加载进来，这样就会有不必要的加载，因为有些模块用户可能根本不会使用到，尤其是对于有好
几十个模块的大型应用来讲，尤其不能接受

那么，有没有办法实现angular模块的controller按需加载呢，答案是有的

借助angular中$routeProvider的配置参数resolve + requirejs 我们可以轻松实现模块的按需加载

##我们先来看看一般的 angularjs + requirejs 方案

如开头描述，这里的四个模块aMod、bMod、cMod、dMod在页面初始加载时就会被加载进来，导致资源浪费，
用户体验下降

```js
require.config({
    paths: {
        angular: 'http://img6.didistatic.com/static/tms/cdn/z/angular/angular/1.5.0/angular.min',
        angularRoute: 'http://img6.didistatic.com/static/tms/cdn/z/angular-route/angular-route/1.3.5/angular-route.min',
    },
    shim: {
        angular: {
            exports: 'angular'
        },
        angularRoute: ['angular'],
        aMod: ['angularRoute'],
        bMod: ['angularRoute'],
        cMod: ['angularRoute'],
        dMod: ['angularRoute']
    }
});

require(
    [
        //四个模块的controller文件在页面初始化时就载入了进来
        'aMod',
        'bMod',
        'cMod',
        'dMod'
    ],
    function () {
        var app = angular.module('app', ['ngRoute', 'aMod', 'bMod', 'cMod', 'dMod']);

        app.config(['$routeProvider', function ($routeProvider) {

            $routeProvider
                .when('/a', {
                    templateUrl: 'aMod.html',
                    controller: 'aModController'
                })
                .when('/b', {
                    templateUrl: 'bMod.html',
                    controller: 'bModController'
                })
                .when('/c', {
                    templateUrl: 'cMod.html',
                    controller: 'cModController'
                })
                .when('/d', {
                    templateUrl: 'dMod.html',
                    controller: 'dModController'
                })
                .otherwise({ redirectTo: '/a' });
        }]);

        angular.bootstrap(document, ['app']);
    }
);
```

## angular $routeProvider配置参数resolve + requirejs 方案

###目录结构

![angular按需加载目录结构](http://7xp4te.com1.z0.glb.clouddn.com/angular-load-controller-on-demand-dir.png 'angular按需加载目录结构')

###各文件源码解析(按源码执行顺序)

####main.js

main.js是requirejs的入口文件，其中加载了angular，ngRoute，以及angular入口文件app，当所有文件
加载完毕后，会在回调函数里调用angular.bootstrap来启动应用

```js
require.config({
    paths: {
        angular: 'http://img6.didistatic.com/static/tms/cdn/z/angular/angular/1.5.0/angular.min',
        angularRoute: 'http://img6.didistatic.com/static/tms/cdn/z/angular-route/angular-route/1.3.5/angular-route.min',
        app: 'app'
    },
    shim: {
        angular: {
            exports: 'angular'
        },
        angularRoute: ['angular'],
        app: ['angular', 'angularRoute']
    }
});

require(
    [
        'app'
    ],
    function () {
        angular.bootstrap(document, ['app']);
    });
```

#### app.js

app.js是应用的主模块定义文件，其中包含路由定义，以及向各个动态加载的模块提供动态注入的
register对象

在定义路由规则时，会调用routeResolverProvider来返回动态的路由配置

```js
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
```

#### routeResolver.js

该模块是按需加载controller的核心模块，以provider的形式提供路由配置

```js
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
```
#### a.js

定义业务模块a的controller，依赖主模块app

通过调用之前在app模块中的register对象的controller方法来将自己动态注入app模块中

```js
'use strict';

define(['app'], function (app) {

    //This controller retrieves data from the customersService and associates it with the $scope
    //The $scope is ultimately bound to the customers view due to convention followed by the routeResolver
    app.register.controller('a', ['$scope', function ($scope) {
        $scope.title = 'this is a controller';
     }]);
});
```

### $routeProvider配置参数resolve
详细用法可参阅angular官方文档[https://docs.angularjs.org/api/ngRoute/provider/$routeProvider](https://docs.angularjs.org/api/ngRoute/provider/$routeProvider "https://docs.angularjs.org/api/ngRoute/provider/$routeProvider")


##总结

至此，使用以上代码，我们就可以实现当页面初始化时，加载必要的模块，其他模块只需在需要
的时候在去动态加载

小伙伴们是不都已经迫不及待的想尝试尝试呢，我搞了一个demo大家可以run起来（注意需要在根目录起个
server环境哦）
github：[https://github.com/suweiwua/angular-load-controller-on-demand](https://github.com/suweiwua/angular-load-controller-on-demand "https://github.com/suweiwua/angular-load-controller-on-demand")