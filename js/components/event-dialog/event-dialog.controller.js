'use strict';
angular.module('hypnoised.calendar')
       .controller('EventDialogCtrl', function ($scope, EventDialogService, CalendarService) {
           const $ctrl = this;
           $ctrl.close = close;
           $ctrl.getEventStatus = getEventStatus;
           $ctrl.event = undefined;
           $ctrl.test = Array(100);
           $ctrl.recurrenceEvents = [];

           function close() {
               EventDialogService.closeEvent($ctrl.height, $ctrl.width, $ctrl.posY, $ctrl.posX);
           }

           function getEventStatus() {
               let status = '';
               if (isLive($ctrl.event)) {
                   status = 'live';
               } else if (isExpired($ctrl.event)) {
                   status = 'expired';
               }
               return status;
           }

           function isLive(event) {
               let startDate = new Date(event.start.dateTime).getTime();
               let endDate = new Date(event.end.dateTime).getTime();
               let now = Date.now();
               return now >= startDate && now <= endDate;
           }

           function isExpired(event) {
               let endDate = new Date(event.end.dateTime).getTime();
               let now = Date.now();
               return now > endDate;
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
                   CalendarService.constructPseudoEvents([$ctrl.event])
                                  .then(function (result) {
                                      $ctrl.recurrenceEvents = result;
                                  });
               }
           };
       });
