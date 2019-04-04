'use strict';
angular.module('hypnoised.calendar')
       .controller('EventDialogCtrl', function ($scope, EventDialogService) {
           const $ctrl = this;
           $ctrl.close = close;
           $ctrl.event = undefined;

           function close() {
               console.log();
               EventDialogService.closeEvent();
           }

           $ctrl.$onInit = function () {
               // console.log('event : ', $ctrl.event);
               // console.log('width : ', $ctrl.width);
               // console.log('height : ', $ctrl.height);
               // console.log('posX : ', $ctrl.posX);
               // console.log('posY : ', $ctrl.posY);
           };

           $ctrl.$onChanges = function (changes) {
               if (changes.event && changes.event.currentValue) {
                   $ctrl.event = changes.event.currentValue;
               }
           };
       });
