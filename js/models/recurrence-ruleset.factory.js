'use strict';
angular.module('hypnoised.calendar')
       .factory('RecurrenceRuleset', function ($q) {
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
