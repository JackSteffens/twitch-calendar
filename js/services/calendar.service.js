'use strict';
angular.module('hypnoised.calendar')
       .service('CalendarService', function ($http, $q, $timeout, $filter, Segments, RecurrenceService) {
           window.Twitch.ext.onAuthorized((auth) => {
               $service.authObj = auth;
               _isAuthenticated = true;
           });

           const $service = this;
           const WAIT_DELAY = 500;
           const EXTENSION_VERSION = '0.0.1';
           const DAY_IN_MILLISECONDS = 86400000;
           const TODAY = new Date();
           const CONSOLE_STYLING = 'color:#9575CD; font-weight:bold;';
           let _configPromise = undefined;
           let configRetryCount = 0;
           let _isAuthenticated = false;
           let _originalEvents = new Map();

           $service.authObj = {
               channelId: undefined,
               clientId: undefined,
               token: undefined,
               userId: undefined
           };
           $service.config = undefined;
           $service.getConfig = getConfig;
           $service.getAuth = getAuth;
           $service.getOriginalEvents = getOriginalEvents;
           $service.saveDeveloperConfig = saveDeveloperConfig;
           $service.saveGlobalConfig = saveGlobalConfig;
           $service.saveBroadcasterConfig = saveBroadcasterConfig;
           $service.fetchCalendar = fetchCalendar;
           $service.constructCalendarAsync = constructCalendarAsync;
           $service.constructPseudoEvents = constructPseudoEvents;

           function fetchConfig() {
               if (!$service.config && _isAuthenticated) {
                   _configPromise = $q((resolve) => {
                       let config = {};
                       angular.forEach(Segments, (segment) => {
                           let data = window.Twitch.ext.configuration[segment] ? window.Twitch.ext.configuration[segment].content : undefined;
                           config[segment] = data ? JSON.parse(data) : data;
                       });
                       resolve(config);
                   });
                   _configPromise.then((config) => {
                       $service.config = config;
                   }, (error) => {
                       console.error(error);
                   });
               } else if ($service.config) {
                   console.warn('Auth was already fetched');
               } else {
                   console.error('Client is not autorized for Twitch API calls');
               }
           }

           function saveDeveloperConfig(data) {
               return saveConfig(Segments.DEVELOPER, data);
           }

           function saveBroadcasterConfig(data) {
               return saveConfig(Segments.BROADCASTER, data);
           }

           function saveGlobalConfig(data) {
               return saveConfig(Segments.GLOBAL, data);
           }

           function saveConfig(segment, data) {
               return $q((resolve) => {
                   window.Twitch.ext.configuration.set(segment, EXTENSION_VERSION, JSON.stringify(data));
                   $timeout(resolve, 1000);
               });
           }

           function getAuth() {
               return $service.authObj;
           }

           /**
            * @param {string} calendarId
            * @param {string} apiKey
            * @return {Promise}
            */
           function fetchCalendar(calendarId, apiKey) {
               let promise = $http.get(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?key=${apiKey}`);
               promise.then((response) => {
                   if (response.data && response.data.items) {
                       response.data.items.forEach((event) => {
                           _originalEvents.set(event.id, event);
                       });
                   }
               });
               return promise;
           }

           function getOriginalEvents() {
               return _originalEvents;
           }

           /**
            * Groups the events by day and sorts them on date
            * @param {Array} events
            * @return {Promise<
            *           Array<{ date: Date, events: [Object], today: boolean, week: number }>
                    >}
            */
           function constructCalendarAsync(events) {
               console.debug(`%cStarting off with ${events.length} calendar events`, CONSOLE_STYLING);
               return $q((resolve, reject) => {
                   if (!$service.config) {
                       reject('Config was not loaded yet');
                   }

                   let groups = [];
                   let knownDates = new Set(); // formatted dates (string)
                   constructPseudoEvents(events)
                       .then((pseudoEvents) => {
                           console.debug(`%cFiltering through ${pseudoEvents.length} PseudoEvents`, CONSOLE_STYLING, pseudoEvents);

                           pseudoEvents.forEach((pEvent, pEventIndex) => {
                               // FIXME This ugly block of code
                               let eventEndDate = new Date(pEvent.end.dateTime);
                               if (isPastMaximumExpiry(eventEndDate)) {
                                   return;
                               }

                               let eventStartDate = new Date(pEvent.start.dateTime);
                               let formattedDate = $filter('date')(eventStartDate, 'shortDate');
                               if (knownDates.has(formattedDate)) {
                                   let group = groups.find((group) => $filter('date')(group.date, 'shortDate') === formattedDate);
                                   group.events.push(pEvent);
                                   group.events.sort((event1, event2) => {
                                       return new Date(event1.start.dateTime).getTime() - new Date(event2.start.dateTime).getTime();
                                   });
                               } else {
                                   knownDates.add(formattedDate);
                                   groups.push({
                                       date: eventStartDate,
                                       events: [pEvent],
                                       today: isToday(eventStartDate),
                                       week: getWeek(eventStartDate)
                                   });
                               }
                               console.debug(`Processed (${pEventIndex + 1}/${pseudoEvents.length}) Events`);
                           });

                           // sorting
                           groups.sort((group1, group2) => {
                               return group1.date.getTime() - group2.date.getTime();
                           });

                           // checking if the days indicate the start of a week
                           for (let index = groups.length - 1; index >= 0; index--) {
                               if (index > 0) {
                                   // TODO Rename to 'first event of the week'
                                   groups[index].startOfNewWeek = groups[index].week !== groups[index - 1].week;
                               }
                           }
                           if (groups.length) {
                               groups[0].startOfNewWeek = true;
                           }
                           console.debug('Events grouped by day : ', groups);
                           resolve(groups);
                       }, (reason) => {
                           console.error('Unable to construct pseudo events', reason);
                       });
               });
           }

           /**
            *
            * @param {Array<CalendarEvent>}events
            * @return {Promise<Array<CalendarEvent>>}
            */
           function constructPseudoEvents(events) {
               let pseudoEvents = [];
               let constructPromises = [];
               return $q((resolve) => {
                   events.forEach((event) => {
                       if (event.recurrence && event.recurrence[0]) {
                           constructPromises.push(applyRecurrenceRules(event));
                       } else {
                           pseudoEvents.push(event);
                       }
                   });

                   $q.all(constructPromises)
                     .then((responses) => {
                         // concat pseudoEvents with responses
                         console.debug(`%cFinished ${constructPromises.length} promises : `, CONSOLE_STYLING, responses);
                         responses.forEach((events) => {
                             pseudoEvents = pseudoEvents.concat(events);
                         });
                         resolve(pseudoEvents);
                     }, (reason) => {
                         console.error(reason);
                     });
               });
           }

           /**
            * CREATE A NEW EVENT BASED ON THE RECURRENCE RULES UP UNTIL YOU REACH
            * AN EVENT WITH START TIME GREATER OR EQUAL TO TODAY, RETURN THAT EVENT. DON'T GO FURTHER
            * AS SOME EVENTS MAY GO UP UNTIL INFINITE
            * TODO Move to RecurrenceService
            * @param {{recurrence:Array, start:{dateTime:string}, end:{dateTime:string}}} originalEvent
            * @return {Promise<Array<CalendarEvent>>}
            */
           function applyRecurrenceRules(originalEvent) {
               let modifiedEvent = angular.copy(originalEvent);
               return $q((resolve, reject) => {
                   try {
                       let ruleset = RecurrenceService.parseRecurrenceRules(modifiedEvent.recurrence[0]);
                       if (ruleset) {
                           console.debug('Build a ruleset ', ruleset);
                           if (ruleset.FREQ === 'WEEKLY') {
                               RecurrenceService.constructWeekly(modifiedEvent, ruleset)
                                                .then((constructedEvents) => {
                                                    console.debug('constructed event : ', constructedEvents);
                                                    resolve(constructedEvents);
                                                });
                           } else {
                               console.error(`No support for ${ruleset.FREQ} events yet. Event ignored : `, originalEvent);
                               resolve([]);
                           }
                       }
                   } catch (e) {
                       console.error('Could not parse the Event its recurring rules', e);
                       console.debug('Failed recurring Event : ', originalEvent);
                       // resetting recurring event since we couldn't parse its rules
                       reject(originalEvent);
                   }
               });
           }

           /**
            * @param {Date} eventEndDate
            * @return {boolean}
            */
           function isPastMaximumExpiry(eventEndDate) {
               let maxExpiryDays = $service.config[Segments.BROADCASTER].maximumExpiryDays || 0;
               if (!$service.config[Segments.BROADCASTER].showExpiredEvents) {
                   maxExpiryDays = 0;
               }
               return eventEndDate.getTime() < TODAY.getTime() - DAY_IN_MILLISECONDS * maxExpiryDays;
           }


           /**
            * @param {Date} givenDate
            * @return {boolean}
            */
           function isToday(givenDate) {
               return givenDate.toDateString() === TODAY.toDateString();
           }

           /**
            * @param {Date}givenDate
            * @return {number} week number
            */
           function getWeek(givenDate) {
               let date = new Date(givenDate);
               date.setHours(0, 0, 0, 0);
               // Thursday in current week decides the year.
               date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
               // January 4 is always in week 1.
               let week1 = new Date(date.getFullYear(), 0, 4);
               // Adjust to Thursday in week 1 and count number of weeks from date to week1.
               return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
                   - 3 + (week1.getDay() + 6) % 7) / 7);
           }

           /**
            *
            * @return {promise<Object>}
            */
           function getConfig() {
               console.debug('getConfig() triggered, configRetryCount : ', configRetryCount);
               let promise = $q((resolve, reject) => {
                   if ($service.config) {
                       resolve($service.config);
                   } else if (_configPromise && _configPromise.then) {
                       _configPromise.then((deserializedConfig) => {
                           $service.config = deserializedConfig;
                           resolve($service.config);
                       }, reject);
                   } else if (!_configPromise) {
                       fetchConfig();
                       console.warn('Auth not loaded yet, waiting 0.5s');
                       if (configRetryCount < 10) {
                           $timeout(() => {
                               configRetryCount++;
                               getConfig().then(resolve, reject);
                           }, WAIT_DELAY);
                       } else {
                           reject('Called 10 times, but could not fetch config');
                       }
                   }
               });
               promise.then(() => {
                   console.debug('Resetting getConfig() configRetryCount to 0');
                   configRetryCount = 0; // Reset the retry count
               }, angular.noop);
               return promise;
           }
       });