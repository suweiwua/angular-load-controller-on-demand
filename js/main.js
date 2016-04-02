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