'use strict';
angular.module('hypnoised.calendar')
       .factory('RecurrenceRuleset', function () {
           /**
            * @param {'Z'}TZ_ID
            * @param {'DAILY', 'MONTHLY', 'YEARLY'}FREQ
            * @param {[?'MO', ?'TU', ?'WE', ?'TH', ?'FR', ?'SA', ?'SU']} BY_DAY
            * @param {string|Date} UNTIL
            * @param {number} INTERVAL
            * @param {number} BY_MONTH 0-11
            * @param {number} COUNT
            * @constructor
            */
           function RecurrenceRuleset(TZ_ID, FREQ, BY_DAY, UNTIL, INTERVAL, BY_MONTH, COUNT) {
               this.TZ_ID = TZ_ID;
               this.FREQ = FREQ;
               this.BY_DAY = BY_DAY;
               this.UNTIL = UNTIL;
               this.INTERVAL = INTERVAL;
               this.BY_MONTH = BY_MONTH;
               this.COUNT = COUNT;
           }

           return RecurrenceRuleset;
       });
