'use strict';

/**
 * @ngdoc overview
 * @name <%= scriptAppName %>
 * @description
 * # <%= scriptAppName %>
 *
 * Main module of the application.
 */
var <%= scriptAppName %> = angular
  .module('<%= scriptAppName %>', [<%= angularModules %>]);

<%= scriptAppName %>.config(function($stateProvider, $urlRouterProvider){
      
  // For any unmatched url, send to /route1
  $urlRouterProvider.otherwise("/home");
  
  $stateProvider
    .state('app', {
        url: "/",
        abstract: true,
        templateUrl: '<ui-view />'
    })

    .state('app.home', {
        url: '/home',
        templateUrl: 'home.html',
        controller: 'HomeCtrl'
    })
      
    .state('app.other', {
        url: '/other',
        templateUrl: 'other.html',
        controller: 'OtherCtrl'
    });
});