'use strict';
angular.module('hypnoised.calendar')
       .directive('daySchedule', function () {
           return {
               restrict: 'E',
               templateUrl: 'js/components/day-schedule/day-schedule.html',
               controller: function (EventDialogService) {
                   let $ctrl = this;
                   $ctrl.loading = false;
                   $ctrl.isLive = isLive;
                   $ctrl.isExpired = isExpired;
                   $ctrl.openEvent = openEvent;

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

                   /**
                    * @param {Event} event
                    * @param {CalendarEvent} calendarEvent
                    */
                   function openEvent(event, calendarEvent) {
                       EventDialogService.openEvent(event, calendarEvent);
                   }

                   $ctrl.$onChanges = function (changes) {
                       if (changes.schedule && changes.schedule.currentValue) {
                           $ctrl.schedule = changes.schedule.currentValue;
                       }

                       if (changes.loading && changes.loading.currentValue !== undefined) {
                           $ctrl.loading = changes.loading.currentValue;
                       }
                   };
               },
               controllerAs: '$ctrl',
               scope: {
                   schedule: '<',
                   loading: '<'
               },
               bindToController: true,
               replace: false
           };
       });
