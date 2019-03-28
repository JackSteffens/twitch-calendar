'use strict';
angular.module('hypnoised.calendar').controller('ConfigCtrl', function ($http, CalendarService, $timeout, Segments) {
    const $ctrl = this;
    const HOUR_IN_MILLISECONDS = 3600000;

    $ctrl.dateNow = new Date();
    $ctrl.calendar = undefined;
    $ctrl.authObj = undefined;
    $ctrl.calendarIdPattern = new RegExp(/(.+)(\@group\.calendar\.google\.com$)/);
    $ctrl.config = {
        developer: {},
        global: {},
        broadcaster: {}
    };
    $ctrl.saveBroadcasterConfig = saveBroadcasterConfig;

    function generateScheduleStartDate() {
        let d = new Date();
        d.setMinutes(d.getMinutes() - d.getMinutes() % 10 - 10);
        return d.getTime() - HOUR_IN_MILLISECONDS;
    }

    function generateEventSummary(scheduleStart, eventStart, eventEnd) {
        generateScheduleStartDate();
        if (Date.now() > eventEnd) {
            return 'Title of an expired event';
        } else if (Date.now() < eventStart) {
            return 'Title of an upcoming event';
        } else {
            return 'Title of the currently live event';
        }
    }

    function generateEvents() {
        let events = [];
        let startDate = generateScheduleStartDate();

        for (let index = 0; index < 5; index++) {
            let start = startDate + (index * HOUR_IN_MILLISECONDS);
            let end = start + HOUR_IN_MILLISECONDS;
            events.push({
                summary: generateEventSummary(startDate, start, end),
                description: 'Event description',
                start: {dateTime: start},
                end: {dateTime: end}
            });
        }
        return events;
    }

    function saveBroadcasterConfig() {
        $ctrl.error = undefined;
        let calendarId = $ctrl.config[Segments.BROADCASTER].calendarId;
        let apiKey = $ctrl.config[Segments.BROADCASTER].apiKey;
        CalendarService.fetchCalendar(calendarId, apiKey)
                       .then((response) => {
                           $ctrl.calendar = response.data;
                           return CalendarService.saveBroadcasterConfig($ctrl.config[Segments.BROADCASTER]);
                       }, function (response) {
                           if (response.status === 404) {
                               $ctrl.error = 'The configured calendar could not be found. Please inform the streamer.';
                           } else if (response.status === 400) {
                               $ctrl.error = 'The configured Google Calendar API Key is invalid. Please inform the streamer.';
                           } else {
                               $ctrl.error = 'Something went wrong :: ' + JSON.stringify(response);
                           }
                           console.log($ctrl.error);
                           return Promise.reject(response); // break promise chain
                       })
                       .then(() => {
                           $ctrl.form.$setPristine();
                           console.log('Successfully tested and saved the Calendar ID & Api Key');
                       }, (reason) => {
                           console.error(reason);
                       });
    }


    $ctrl.$onInit = function () {
        $ctrl.calendar = {
            summary: 'Your calendar title',
            description: 'and its description',
            items: generateEvents()
        };

        window.Twitch.ext.configuration.onChanged(() => {
            CalendarService.getConfig()
                           .then(function (config) {
                               $ctrl.config = config;
                               $ctrl.authObj = CalendarService.getAuth();
                           }, function (error) {
                               console.error(error);
                           })
                           .finally(() => {
                               console.log('ConfigCtrl, getConfig() finished');
                           });
        });

    };
});