'use strict';
angular.module('hypnoised.calendar')
       .factory('CalendarEvent', function ($q) {
           /**
            *
            * @param {Date} startDate
            * @param {Date} endDate
            * @param {RecurrenceRuleset} ruleset
            * @param {string} timezone
            * @constructor
            */
           function CalendarEvent(startDate, endDate, ruleset, timezone) {
               this.startDate = startDate;
               this.endDate = endDate;
               this.ruleset = ruleset;
               this.timezone = timezone;
           }

           return CalendarEvent;
       });
