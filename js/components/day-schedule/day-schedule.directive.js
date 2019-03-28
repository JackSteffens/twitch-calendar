'use strict';
angular.module('hypnoised.calendar')
       .directive('daySchedule', function () {
           return {
               restrict: 'E',
               templateUrl: 'js/components/day-schedule/day-schedule.html',
               controller: function () {
                   let $ctrl = this;
                   $ctrl.isLive = isLive;
                   $ctrl.isExpired = isExpired;

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

                   $ctrl.$onChanges = function (changes) {
                       if (changes.schedule && changes.schedule.currentValue) {
                           $ctrl.schedule = changes.schedule.currentValue;
                       }
                   };
               },
               controllerAs: '$ctrl',
               scope: {
                   schedule: '<'
               },
               bindToController: true,
               replace: false
           };
       });
