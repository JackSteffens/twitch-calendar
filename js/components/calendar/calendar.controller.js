'use strict';
angular.module('hypnoised.calendar')
       .controller('CalendarCtrl', function (CalendarService) {
           const $ctrl = this;
           $ctrl.calendar = undefined;
           $ctrl.summary = 'Loading ...';
           $ctrl.description = 'Loading ...';
           $ctrl.loading = true;

           $ctrl.$onChanges = (changes) => {
               $ctrl.loading = true;
               if (changes.gCalendar && changes.gCalendar.currentValue) {
                   $ctrl.summary = changes.gCalendar.currentValue.summary;
                   $ctrl.description = changes.gCalendar.currentValue.description;

                   CalendarService.getConfig()
                                  .then(() => {
                                      return CalendarService.constructCalendarAsync(changes.gCalendar.currentValue.items || []);
                                  }, (reason) => Promise.reject(reason))
                                  .then((calendar) => {
                                      $ctrl.calendar = calendar;
                                  }, (reason) => {
                                      console.error(reason);
                                  })
                                  .finally(() => {
                                      $ctrl.loading = false;
                                  });
               }
           };
       });