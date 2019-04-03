'use strict';
angular.module('hypnoised.calendar')
       .service('RecurrenceService', function ($q, RecurrenceRuleset) {
           let $service = this;
           const DAYS = {
               'MO': 0,
               'TU': 1,
               'WE': 2,
               'TH': 3,
               'FR': 4,
               'SA': 5,
               'SU': 6
           };
           const DAYS_IN_WEEK = 7;
           const DAY_IN_MILLISECONDS = 86400000;

           $service.constructWeekly = constructWeekly;


           /**
            *
            * @param event
            * @param ruleset
            * @return {Promise}
            */
           function constructWeekly(event, ruleset) {
               return $q((resolve, reject) => {
                   const eventStartDate = new Date(event.start.dateTime);
                   let indexDate = angular.copy(eventStartDate);
                   let indexCount = 0;
                   let now = new Date();

                   while (indexDate.getTime() < now.getTime() && (indexCount <= (ruleset.COUNT || 0))) {
                       if (ruleset.COUNT) {
                           indexCount++;
                       }

                       if (ruleset.BY_DAY) {
                           indexDate = getNextDate(indexDate, ruleset.BY_DAY);
                       } else if (ruleset.INTERVAL) {
                           // every x weeks
                       }
                       console.log('weekly date iterated : ', indexDate);
                   }

                   event.start.dateTime = indexDate;

                   resolve(event);
               });
           }


           /**
            * works well :)
            * @param {Date} date
            * @param {Array<string>} allowedDays
            * @return {Date}
            */
           function getNextDate(date, allowedDays) {
               let currentDay = date.getDay();
               let chosenNextDay = DAYS[allowedDays.find((day) => DAYS[day] > currentDay)] || DAYS[allowedDays[0]];
               let neededDays = Math.abs((chosenNextDay - currentDay) % DAYS_IN_WEEK);
               return new Date(date.getTime() + neededDays * DAY_IN_MILLISECONDS);
           }
       });