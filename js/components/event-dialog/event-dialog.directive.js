'use strict';
angular.module('hypnoised.calendar')
       .directive('eventDialog', function () {
           return {
               restrict: 'E',
               templateUrl: 'js/components/event-dialog/event-dialog.html',
               controller: 'EventDialogCtrl',
               controllerAs: '$ctrl',
               scope: {
                   event: '<',
                   height: '<',
                   width: '<',
                   posX: '<',
                   posY: '<'
               },
               bindToController: true,
               replace: false
           };
       });
