'use strict';
angular.module('hypnoised.calendar').controller('PanelCtrl', function ($http, CalendarService, Segments) {
    const $ctrl = this;
    let API_KEY = ''; // AIzaSyA2OjZyfInigiK0K71GKaUzatKHJ4U8VlA
    let CALENDAR_ID = ''; // vqgc7vs42o478h4nvecn0l30pg@group.calendar.google.com

    $ctrl.calendar = undefined;
    $ctrl.shareUrl = `https://calendar.google.com/calendar/embed?src=${CALENDAR_ID}`;
    $ctrl.error = undefined;

    function fetchCalendar() {
        $http.get(`https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events?key=${API_KEY}`)
             .then((response) => {
                 $ctrl.calendar = response.data;
             }, (response) => {
                 console.error(response);
                 if (response.status === 404) {
                     $ctrl.error = 'The configured calendar could not be found. Please inform the streamer.';
                 } else if (response.status === 400) {
                     $ctrl.error = 'The configured Google Calendar API Key is invalid. Please inform the streamer.';
                 }
             });
    }

    $ctrl.$onInit = () => {
        window.Twitch.ext.configuration.onChanged(function () {
            CalendarService.getConfig()
                           .then(function (config) {
                               CALENDAR_ID = config[Segments.BROADCASTER] ? config[Segments.BROADCASTER].calendarId : undefined;
                               API_KEY = config[Segments.BROADCASTER] ? config[Segments.BROADCASTER].apiKey : undefined;
                               fetchCalendar();
                           }, function (response) {
                               if (response.status === 404) {
                                   $ctrl.error = 'The configured calendar could not be found. Please inform the streamer.';
                               } else if (response.status === 400) {
                                   $ctrl.error = 'The configured Google Calendar API Key is invalid. Please inform the streamer.';
                               } else if (response.status === 403) {
                                   $ctrl.error = 'Access to some resource was forbidden';
                               } else {
                                   $ctrl.error = `Something went wrong, but we are not sure about what. Included error message : [${response.data ? response.data.message : 'no message'}]`;
                               }
                           });
        });
    };
});