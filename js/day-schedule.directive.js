'use strict';
angular.module('calendar')
    .directive('daySchedule', function () {
        return {
            restrict: 'E',
            templateUrl: 'js/day-schedule.html',
            controller: function () {
                let $ctrl = this;
                $ctrl.isLive = isLive;
                $ctrl.isExpired = isExpired;

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

                $ctrl.$onInit = function () {
                    console.log('initialized');
                };

                $ctrl.$onChanges = function (changes) {
                    console.log(changes);
                }
            },
            controllerAs: '$ctrl',
            scope: {
                schedule: '<'
            },
            bindToController: true,
            replace: false
        };
    });
