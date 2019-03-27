'use strict';
angular.module('calendar').controller('ViewCtrl', function ($http, $filter) {
    const $ctrl = this;
    const API_KEY = 'AIzaSyA2OjZyfInigiK0K71GKaUzatKHJ4U8VlA';
    const CALENDAR_ID = 'vqgc7vs42o478h4nvecn0l30pg@group.calendar.google.com';

    $ctrl.calendar = {
        summary: 'loading ...'
    };
    $ctrl.schedule = [];
    $ctrl.shareUrl = `https://calendar.google.com/calendar/embed?src=${CALENDAR_ID}`;
    $ctrl.error = undefined;

    function initCalendar(calendar) {
        $ctrl.calendar = calendar;
        $ctrl.schedule = groupByDay(calendar.items || []);
    }

    function groupByDay(events) {
        let groups = [];
        let knownDates = new Set();
        events.forEach((event) => {
            let date = new Date(event.start.dateTime);
            let dateFormatted = $filter('date')(date, 'shortDate');
            if (knownDates.has(dateFormatted)) {
                let group = groups.find((group) => $filter('date')(group.date, 'shortDate') === dateFormatted);
                group.events.push(event);
                group.events.sort((e1, e2) => {
                    return new Date(e1.start.dateTime).getTime() - new Date(e2.start.dateTime).getTime();
                });
            } else {
                knownDates.add(dateFormatted);
                groups.push({
                    date: date,
                    events: [event]
                })
            }
        });
        return groups;
    }

    $ctrl.$onInit = () => {
        $http.get(`https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events?key=${API_KEY}`)
            .then((response) => {
                console.log(response.data);
                initCalendar(response.data);
            }, (response) => {
                console.error(response);
                if (response.status === 404) {
                    $ctrl.error = 'The configured calendar could not be found. Please inform the streamer.'
                } else if (response.status === 400) {
                    $ctrl.error = 'The configured Google Calendar API Key is invalid. Please inform the streamer.'
                }
            });
    };
});