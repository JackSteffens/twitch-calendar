'use strict';
angular.module('hypnoised.calendar')
    .directive('calendar', function () {
        return {
            restrict: 'E',
            templateUrl: 'js/components/calendar/calendar.html',
            controller: 'CalendarCtrl',
            controllerAs: '$ctrl',
            scope: {
                gCalendar: '<'
            },
            bindToController: true,
            replace: false
        };
    });
