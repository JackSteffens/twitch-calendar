'use strict';
angular.module('calendar').controller('ConfigCtrl', function () {
    const $ctrl = this;
    $ctrl.dateNow = new Date();
    $ctrl.schedule = [{
        date: $ctrl.dateNow,
        events: [{
            summary: '',
            description: '',
            start: {
                dateTime: $ctrl.dateNow
            },
            end: {
                dateTime: $ctrl.dateNow
            }
        }]
    }];

    $ctrl.$onInit = function () {

    }
});