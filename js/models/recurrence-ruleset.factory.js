'use strict';
angular.module('hypnoised.calendar')
       .factory('RecurrenceRuleset', function () {
           /**
            * @param {string} TZ_ID , 'America/New_York:19970902T090000'
            * @param {'DAILY', 'MONTHLY', 'YEARLY'} FREQ
            * @param {[?'MO', ?'TU', ?'WE', ?'TH', ?'FR', ?'SA', ?'SU']} BY_DAY
            * @param {string|Date} UNTIL
            * @param {number} INTERVAL
            * @param {'MO'|'TU'|'WE'|'TH'|'FR'|'SA'|'SU'|null} WK_ST
            * @param {number} BY_MONTH 0-11
            * @param {number} COUNT
            * @constructor
            */
           function RecurrenceRuleset(TZ_ID, FREQ, BY_DAY, UNTIL, INTERVAL, WK_ST, BY_MONTH, COUNT) {
               this.TZ_ID = TZ_ID;
               this.FREQ = FREQ;
               this.BY_DAY = BY_DAY;
               this.UNTIL = UNTIL;
               this.INTERVAL = INTERVAL;
               this.WK_ST = WK_ST;
               this.BY_MONTH = BY_MONTH;
               this.COUNT = COUNT;
           }

           return RecurrenceRuleset;
       });
