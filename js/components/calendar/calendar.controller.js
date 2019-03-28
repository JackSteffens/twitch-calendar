'use strict';
angular.module('hypnoised.calendar')
       .controller('CalendarCtrl', function ($filter) {
           const $ctrl = this;
           $ctrl.schedule = [];
           $ctrl.summary = 'Loading ...';
           $ctrl.description = 'Loading ...';

           function groupByDay(events) {
               const today = new Date();
               let groups = [];
               let knownDates = new Set(); // formatted dates (string)
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
                       let week = getWeek(date);
                       knownDates.add(dateFormatted);
                       groups.push({
                           date: date,
                           events: [event],
                           today: date.toDateString() === today.toDateString(),
                           week: week
                       });
                   }
               });
               groups.sort((g1, g2) => {
                   return g1.date.getTime() - g2.date.getTime();
               });
               // checking if the days indicate the start of a week
               for (let index = 0; index < groups.length; index++) {
                   groups[index].startOfNewWeek = index === 0 ? true : groups[index].week !== groups[index - 1].week;
               }
               return groups;
           }

           function getWeek(givenDate) {
               let date = new Date(givenDate);
               date.setHours(0, 0, 0, 0);
               // Thursday in current week decides the year.
               date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
               // January 4 is always in week 1.
               let week1 = new Date(date.getFullYear(), 0, 4);
               // Adjust to Thursday in week 1 and count number of weeks from date to week1.
               return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
                   - 3 + (week1.getDay() + 6) % 7) / 7);
           }

           $ctrl.$onChanges = (changes) => {
               if (changes.gCalendar && changes.gCalendar.currentValue) {
                   $ctrl.summary = changes.gCalendar.currentValue.summary;
                   $ctrl.description = changes.gCalendar.currentValue.description;
                   $ctrl.schedule = groupByDay(changes.gCalendar.currentValue.items || []);
               }
           };
       });