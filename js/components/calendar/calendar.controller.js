'use strict';
angular.module('hypnoised.calendar')
       .controller('CalendarCtrl', function ($filter) {
           const $ctrl = this;
           $ctrl.schedule = [];
           $ctrl.summary = 'Loading ...';
           $ctrl.description = 'Loading ...';

           function groupByDay(events) {
               let groups = [];
               let knownDates = new Set();
               events.forEach((event) => {
                   let date = new Date(event.start.dateTime);
                   let dateFormatted = $filter('date')(date, 'shortDate');
                   if (knownDates.has(dateFormatted)) {
                       let group = groups.find((group) => $filter('date')(group.date, 'shortDate') === dateFormatted);
                       group.events.push(event);
                       group.events.sort((e1, e2) => {
                           return new Date(e1.start.dateTime).getTime() - new Date(e2.start.dateTime).getTime();
                       });
                   } else {
                       knownDates.add(dateFormatted);
                       groups.push({
                           date: date,
                           events: [event]
                       });
                   }
               });
               groups.sort((g1, g2) => {
                   return g1.date.getTime() - g2.date.getTime();
               });
               return groups;
           }

           $ctrl.$onChanges = function (changes) {
               if (changes.gCalendar && changes.gCalendar.currentValue) {
                   $ctrl.summary = changes.gCalendar.currentValue.summary;
                   $ctrl.description = changes.gCalendar.currentValue.description;
                   $ctrl.schedule = groupByDay(changes.gCalendar.currentValue.items || []);
               }
           };
       });