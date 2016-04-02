'use strict';

define(['app'], function (app) {

    //This controller retrieves data from the customersService and associates it with the $scope
    //The $scope is ultimately bound to the customers view due to convention followed by the routeResolver
    app.register.controller('c', ['$scope', function ($scope) {
    	$scope.title = 'this is c controller';
     }]);
});