'use strict';
angular.module('hypnoised.calendar')
       .factory('RecurrenceRuleset', function () {
           /**
            * @param {string |undefined} TZ_ID , 'America/New_York:19970902T090000'
            * @param {'DAILY', 'MONTHLY', 'YEARLY' | undefined} FREQ
            * @param {[?'MO', ?'TU', ?'WE', ?'TH', ?'FR', ?'SA', ?'SU'] | undefined} BY_DAY
            * @param {Date | undefined} UNTIL
            * @param {number | undefined} INTERVAL
            * @param {'MO'|'TU'|'WE'|'TH'|'FR'|'SA'|'SU'| undefined} WK_ST
            * @param {number | undefined} BY_MONTH 0-11
            * @param {number | undefined} COUNT
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
