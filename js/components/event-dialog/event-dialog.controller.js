'use strict';
angular.module('hypnoised.calendar')
       .controller('EventDialogCtrl', function ($scope, EventDialogService, CalendarService, RecurrenceService) {
           const $ctrl = this;
           let _originalEvent = undefined;
           $ctrl.close = close;
           $ctrl.getEventStatus = getEventStatus;
           $ctrl.isExpired = isExpired;
           $ctrl.parseByDay = parseByDay;
           $ctrl.parseFreq = parseFreq;
           $ctrl.event = undefined;
           $ctrl.recurrenceEvents = [];
           $ctrl.recurrenceRuleset = undefined;

           const FULL_DAYS = {
               'MO': 'Monday',
               'TU': 'Tuesday',
               'WE': 'Wednesday',
               'TH': 'Thursday',
               'FR': 'Friday',
               'SA': 'Saturday',
               'SU': 'Sunday'
           };

           function close() {
               EventDialogService.closeEvent($ctrl.height, $ctrl.width, $ctrl.posY, $ctrl.posX);
           }

           function getEventStatus() {
               let status = '';
               if (isLive($ctrl.event)) {
                   status = 'live';
               } else if (isExpired($ctrl.event)) {
                   status = 'expired';
               }
               return status;
           }

           function isLive(event) {
               let startDate = new Date(event.start.dateTime).getTime();
               let endDate = new Date(event.end.dateTime).getTime();
               let now = Date.now();
               return now >= startDate && now <= endDate;
           }

           function isExpired(event) {
               let endDate = new Date(event.end.dateTime).getTime();
               let now = Date.now();
               return now > endDate;
           }

           function onEventChanged(event) {
               $ctrl.event = event;
               getOriginalEvent();
               if ($ctrl.event.recurrence && $ctrl.event.recurrence[0]) {
                   CalendarService.constructPseudoEvents([_originalEvent])
                                  .then(function (result) {
                                      $ctrl.recurrenceEvents = result;
                                      $ctrl.recurrenceEvents.sort((ev1, ev2) => {
                                          return new Date(ev2.start.dateTime).getTime() - new Date(ev1.start.dateTime).getTime();
                                      });
                                  });
                   getRecurrenceRuleset();
               }
           }

           function getOriginalEvent() {
               _originalEvent = CalendarService.getOriginalEvents().get($ctrl.event.id);
           }

           function parseByDay() {
               if ($ctrl.recurrenceRuleset && $ctrl.recurrenceRuleset.BY_DAY) {
                   let days = '';
                   if ($ctrl.recurrenceRuleset.BY_DAY.length === 1) {
                       days = FULL_DAYS[$ctrl.recurrenceRuleset.BY_DAY[0]] + 's';
                   } else {
                       $ctrl.recurrenceRuleset.BY_DAY.forEach((day, index) => {
                           if (index === 0) {
                               days = FULL_DAYS[day];
                           } else if (index !== $ctrl.recurrenceRuleset.BY_DAY.length - 1) {
                               days = days + ', ' + FULL_DAYS[day];
                           } else {
                               days = days + ' and ' + FULL_DAYS[day];
                           }
                       });
                   }
                   return days;
               }
           }

           function parseFreq() {
               if ($ctrl.recurrenceRuleset && $ctrl.recurrenceRuleset.FREQ) {
                   switch ($ctrl.recurrenceRuleset.FREQ) {
                       case 'DAILY':
                           return 'Every day';
                       case 'WEEKLY':
                           return 'Every week';
                       case 'MONTHLY':
                           return 'Every month';
                   }
               }
           }

           function getRecurrenceRuleset() {
               $ctrl.recurrenceRuleset = RecurrenceService.parseRecurrenceRules($ctrl.event.recurrence[0]);
           }

           $ctrl.$onChanges = function (changes) {
               if (changes.event && changes.event.currentValue) {
                   onEventChanged(changes.event.currentValue);
               }
           };
       });
