'use strict';
angular.module('hypnoised.calendar')
       .service('RecurrenceService', function ($q, RecurrenceRuleset) {
           let $service = this;
           const DAYS_IN_UTC = {
               'MO': 1,
               'TU': 2,
               'WE': 3,
               'TH': 4,
               'FR': 5,
               'SA': 6,
               'SU': 0
           };
           const TOTAL_DAYS_IN_WEEK = 7;
           const DAY_IN_MILLISECONDS = 86400000;

           $service.constructWeekly = constructWeekly;
           $service.getNextDate = getNextDate;

           function parseUntilRulesetDate(dateString) {
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
            * @param {RecurrenceRuleset} ruleset
            * @return {Promise<Array<CalendarEvent>>}
            */
           function constructWeekly(event, ruleset) {
               return $q((resolve) => {
                   const eventStartDate = new Date(event.start.dateTime);
                   const eventEndDate = new Date(event.end.dateTime);
                   const deltaTimestamp = eventEndDate.getTime() - eventStartDate.getTime();
                   const now = new Date();
                   let indexDate = angular.copy(eventStartDate);
                   let indexCount = 0;
                   let untilDate = new Date();
                   let constructedEvents = [angular.copy(event)];

                   if (ruleset.UNTIL) {
                       untilDate = parseUntilRulesetDate(ruleset.UNTIL);
                   }

                   while (indexDate.getTime() <= now.getTime()) {
                       indexCount++;

                       if (ruleset.BY_DAY) {
                           indexDate = getNextDate(indexDate, ruleset.BY_DAY);
                           // If 'getNextDate' caused the week to pass, add the interval weeks
                           if (ruleset.INTERVAL && DAYS_IN_UTC[ruleset.BY_DAY[0]] === indexDate.getUTCDay()) {
                               indexDate = getNextInterval(indexDate, ruleset.FREQ, ruleset.INTERVAL);
                           }
                       } else if (ruleset.INTERVAL) {
                           indexDate = getNextInterval(indexDate, ruleset.FREQ, ruleset.INTERVAL);
                       }

                       if (ruleset.UNTIL && indexDate.getTime() > untilDate.getTime()) {
                           break;
                       } else if (ruleset.COUNT && !isAllowedByCount(indexCount, ruleset.COUNT)) {
                           break;
                       }

                       event.start.dateTime = indexDate;
                       event.end.dateTime = new Date(indexDate.getTime() + deltaTimestamp);
                       constructedEvents.push(angular.copy(event));
                   }

                   resolve(constructedEvents);
               });
           }

           /**
            * @param {Date} date
            * @param {'DAILY', 'WEEKLY', 'MONTHLY'}frequency
            * @param {number} interval
            * @return {Date}
            */
           function getNextInterval(date, frequency, interval) {
               let nextInterval = 0;
               switch (frequency) {
                   case'DAILY':
                       nextInterval = DAY_IN_MILLISECONDS * frequency;
                       break;
                   case 'WEEKLY':
                       nextInterval = DAY_IN_MILLISECONDS * TOTAL_DAYS_IN_WEEK * frequency;
                       break;
                   case 'MONTHLY':
                   // get day of the month 0-31, get next interval month and set the day accordingly
               }
               return new Date(date.getTime() + nextInterval);
           }

           function isAllowedByCount(countIndex, maxCount) {
               if (maxCount === null || maxCount === undefined) {
                   return true;
               } else {
                   return countIndex < Number(maxCount);
               }
           }

           /**
            * Gets the next possible date based off of the given allowed days, starting from the given date.
            * If the givenDate is a Sunday, and the following day available in 'allowedDays' is Tuesday, it returns 2
            * days after the given date as Sunday -> Tuesday = 2 days.
            * @param {Date} givenDate
            * @param {[?'MO', ?'TU', ?'WE', ?'TH', ?'FR', ?'SA', ?'SU']} allowedDays
            * @return {Date}
            */
           function getNextDate(givenDate, allowedDays) {
               let currentDay = givenDate.getUTCDay();
               let chosenNextDay = DAYS_IN_UTC[allowedDays.find((day) => DAYS_IN_UTC[day] > currentDay)] || DAYS_IN_UTC[allowedDays[0]];
               let delta = (chosenNextDay - currentDay); // +1 since days are 0 indexed
               let neededDays = delta <= 0 ? (TOTAL_DAYS_IN_WEEK + delta) : delta;
               return new Date(givenDate.getTime() + (neededDays * DAY_IN_MILLISECONDS));
           }
       });