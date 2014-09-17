'use strict';

/**
 * @ngdoc function
 * @name <%= scriptAppName %>.controller:OtherCtrl
 * @description
 * # OtherCtrl
 * Controller of the <%= scriptAppName %>
 */
angular.module('<%= scriptAppName %>')
  .controller('OtherCtrl', function ($scope) {
    
    $scope.things = [
      'One Fish',
      'Two Fish',
      'Red Fish',
      'Blue Fish'
    ];

  });