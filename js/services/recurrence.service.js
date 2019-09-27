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
           $service.parseRecurrenceRules = parseRecurrenceRules;

           /**
            *
            * @param dateString
            * @return {Date}
            */
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
            * @param {CalendarEvent | {start:{dateTime:{string}}, end:{dateTime:{string}}}} event
            * @param {RecurrenceRuleset} ruleset
            * @return {Promise<Array<CalendarEvent>>}
            */
           function constructWeekly(event, ruleset) {
               return $q((resolve) => {
                   if (!event.start.dateTime && event.start.date) {
                       event.start.dateTime = new Date(event.start.date);
                   }
                   if (!event.end.dateTime && event.end.date) {
                       event.end.dateTime = new Date(event.end.date);
                   }
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
                           // If there's also an interval and 'getNextDate' caused the week to pass, add the interval weeks
                           if (ruleset.INTERVAL && DAYS_IN_UTC[ruleset.BY_DAY[0]] === indexDate.getUTCDay()) {
                               indexDate = getNextInterval(indexDate, ruleset.FREQ, ruleset.INTERVAL);
                           }
                       } else if (ruleset.INTERVAL) {
                           indexDate = getNextInterval(indexDate, ruleset.FREQ, ruleset.INTERVAL);
                       } else { // If it's just weekly with no further rules, take index date's day
                           let allowedDay = Object.entries(DAYS_IN_UTC).find(([day, number]) => number === indexDate.getUTCDay())[0];
                           indexDate = getNextDate(indexDate, [allowedDay]);
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
            *
            * @param {CalendarEvent} event
            * @param {RecurrenceRuleset} ruleset
            * @return {Promise<Array<CalendarEvent>>}
            */
           function constructDaily(event, ruleset) {
               return $q((resolve, reject) => {
                   
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

           /**
            * Write tests based on these scenarios
            * https://tools.ietf.org/html/rfc5545#section-3.8.5
            * TODO Move to RecurrenceService
            * @param ruleString
            * @return {RecurrenceRuleset}
            */
           function parseRecurrenceRules(ruleString) {
               let startsWithRRULE = new RegExp(/(^RRULE:)(.*)/);
               let freqPattern = new RegExp(/(FREQ=)(WEEKLY|DAILY|MONTHLY|YEARLY)(\;|$)/m);
               let countPattern = new RegExp(/(COUNT=)(\d+)(\;|$)/m);
               // FIXME "-1<DAY>" should be implemented too, note the minus (-)
               let byDayPattern = new RegExp(/(?:BYDAY=)((\d?(MO|TU|WE|TH|FR|SA|SU),?)*)(\;|$)/m);
               let byMonthPattern = new RegExp(/(?:BYDAY=)((\d?(MO|TU|WE|TH|FR|SA|SU),?)*)(\;|$)/m);
               let untilPattern = new RegExp(/(?:UNTIL=)(.*Z)(\;|$)/m);
               let weekStartPattern = new RegExp(/(?:WKST=)(MO|TU|WE|TH|FR|SA|SU)(\;|$)/m);

               /**
                * @param {array} groups
                * @param {number} groupNumber
                * @return {undefined}
                */
               function getValue(groups, groupNumber) {
                   return groups ? groups[groupNumber] : undefined;
               }

               // TODO Use new RecurrenceRuleset()
               return {
                   FREQ: getValue((ruleString).match(freqPattern), 2),
                   COUNT: getValue((ruleString).match(countPattern), 2),
                   UNTIL: getValue((ruleString).match(untilPattern), 1),
                   INTERVAL: undefined,
                   BY_DAY: (() => {
                       let string = getValue((ruleString).match(byDayPattern), 1);
                       return string ? string.split(',') : undefined;
                   })(), // BY_DAY is an array with days like ['MO','TU','WE', etc .. ]
                   WK_ST: getValue((ruleString).match(weekStartPattern), 1),
                   BY_MONTH: undefined, // [number] of month when FREQ = YEARLY
                   BY_MONTH_DAY: undefined // [number] of day in month, when FREQ = MONTHLY
               };
           }
       });