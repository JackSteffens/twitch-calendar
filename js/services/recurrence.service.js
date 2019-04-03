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


           function partseUntilRulesetDate(dateString) {
               let year = dateString.slice(0, 4);
               let month = dateString.slice(4, 6);
               let day = dateString.slice(6, 8);
               let t = dateString.slice(8, 9);
               let hour = dateString.slice(9, 11);
               let minute = dateString.slice(11, 13);
               let second = dateString.slice(13, 15);
               let zone = dateString.slice(15, 16);
               let parsed = `${year}-${month}-${day}${t}${hour}:${minute}:${second}${zone}`;
               return new Date(parsed);
           }

           /**
            *
            * @param event
            * @param ruleset
            * @return {Promise}
            */
           function constructWeekly(event, ruleset) {
               return $q((resolve) => {
                   const eventStartDate = new Date(event.start.dateTime);
                   const eventEndDate = new Date(event.end.dateTime);
                   const now = new Date();
                   let indexDate = angular.copy(eventStartDate);
                   let indexCount = 0;
                   let untilDate = new Date();

                   if (ruleset.UNTIL) {
                       untilDate = partseUntilRulesetDate(ruleset.UNTIL);
                   }

                   while (indexDate.getTime() <= now.getTime()) {
                       indexCount++;
                       if (ruleset.UNTIL && indexDate.getTime() > untilDate.getTime()) {
                           break;
                       }

                       if (ruleset.COUNT && !isAllowedByCount(indexCount, ruleset.COUNT)) {
                           break;
                       }

                       if (ruleset.BY_DAY) {
                           indexDate = getNextDate(indexDate, ruleset.BY_DAY);
                       } else if (ruleset.INTERVAL) {
                           // every x weeks
                       }
                   }

                   let deltaDate = eventEndDate.getTime() - eventStartDate.getTime();

                   event.end.dateTime = new Date(indexDate.getTime() + deltaDate);
                   event.start.dateTime = indexDate;

                   resolve(event);
               });
           }

           function isAllowedByCount(countIndex, maxCount) {
               if (maxCount === null || maxCount === undefined) {
                   return true;
               } else {
                   return countIndex < Number(maxCount);
               }
           }

           /**
            * TODO Write tests for this, as it's brittle
            * @param {Date} givenDate
            * @param {Array<string>} allowedDays
            * @return {Date}
            */
           function getNextDate(givenDate, allowedDays) {
               let currentDay = givenDate.getDay();
               let chosenNextDay = DAYS[allowedDays.find((day) => DAYS[day] > currentDay)] || DAYS[allowedDays[0]];
               let delta = (chosenNextDay - currentDay) + 1; // +1 since days are 0 indexed
               let neededDays = delta <= 0 ? (DAYS_IN_WEEK + delta) : delta;
               return new Date(givenDate.getTime() + (neededDays * DAY_IN_MILLISECONDS));
           }
       });