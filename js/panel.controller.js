'use strict';
angular.module('hypnoised.calendar').controller('PanelCtrl', function ($http, CalendarService, Segments) {
    const $ctrl = this;
    let _apiKey = '';
    let _calendarId = '';

    $ctrl.calendar = undefined;
    $ctrl.shareUrl = `https://calendar.google.com/calendar/embed?src=${_calendarId}`;
    $ctrl.error = undefined;

    function fetchCalendar() {
        CalendarService.fetchCalendar(_calendarId, _apiKey)
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
                               _calendarId = config[Segments.BROADCASTER] ? config[Segments.BROADCASTER].calendarId : undefined;
                               _apiKey = config[Segments.BROADCASTER] ? config[Segments.BROADCASTER].apiKey : undefined;
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