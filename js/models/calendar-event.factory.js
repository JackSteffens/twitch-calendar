'use strict';
angular.module('hypnoised.calendar')
       .factory('CalendarEvent', function ($q) {
           /**
            * TODO Check the specs https://developers.google.com/calendar/v3/reference/events
            * @constructor
            */
           function CalendarEvent() {
               this.created = ''; //2019-03-27T10:56:27.000Z
               this.creator = {email: '', displayName: ''};
               this.end = {dateTime: '', timeZone: ''};
               this.etag = ''; // "3108583763774000"
               this.extendedProperties = {};
               this.htmlLink = '';
               this.iCalUID = '';
               this.id = '';
               this.kind = '';
               this.organizer = {
                   displayName: '',
                   email: '', // 'SOME_CALENDAR_ID@group.calendar.google.com'
                   self: true
               };
               this.recurrence = ['RRULE:'];
               this.sequence = 0;
               this.start = {dateTime: '', timeZone: ''};
               this.status = '';
               this.summary = '';
               this.updated = '';
           }

           return CalendarEvent;
       });
