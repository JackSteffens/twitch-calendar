'use strict';
describe('RecurrenceService', function () {
    const DAY_IN_MILLISECONDS = 86400000;
    let RecurrenceService, $rootScope;
    beforeEach(function () {
        module('hypnoised.calendar');
        inject(function (_RecurrenceService_, _$rootScope_) {
            RecurrenceService = _RecurrenceService_;
            $rootScope = _$rootScope_;
        });
    });

    describe('getNextDate', function () {
        describe('When the given date is a Monday and allowed Days contains Monday, Wednesday, Friday', function () {
            it('should return a date being Wednesday, 2 days after the given date', function () {
                const givenDate = new Date('Mon Apr 8 2019 12:00:00 GMT+0200');
                const expectedDate = new Date('Wed Apr 10 2019 12:00:00 GMT+0200');
                const nextDate = RecurrenceService.getNextDate(givenDate, ['MO', 'WE', 'FR']);
                expect(nextDate).toEqual(expectedDate);
                expect(nextDate.getTime() - givenDate.getTime()).toBe(DAY_IN_MILLISECONDS * 2);
            });
        });

        describe('When the given date is a Tuesday and allowed Days contains Monday, Tuesday, Saturday and Sunday', function () {
            it('should return a date being Saturday, 4 days after the given date', function () {
                const givenDate = new Date('Tue Apr 2 2019 12:00:00 GMT+0200');
                const expectedDate = new Date('Sat Apr 6 2019 12:00:00 GMT+0200');
                const nextDate = RecurrenceService.getNextDate(givenDate, ['TU', 'SA', 'SU']);
                expect(nextDate).toEqual(expectedDate);
                expect(nextDate.getTime() - givenDate.getTime()).toBe(DAY_IN_MILLISECONDS * 4);
            });
        });

        describe('When the given date is a Wednesday and allowed Days contains Tuesday and Wednesday', function () {
            it('should return a date being Tuesday, 6 days after the given date', function () {
                const givenDate = new Date('Wed Apr 17 2019 12:00:00 GMT+0200');
                const expectedDate = new Date('Tue Apr 23 2019 12:00:00 GMT+0200');
                const nextDate = RecurrenceService.getNextDate(givenDate, ['TU', 'WE']);
                expect(nextDate).toEqual(expectedDate);
                expect(nextDate.getTime() - givenDate.getTime()).toBe(DAY_IN_MILLISECONDS * 6);
            });
        });

        describe('When the given date is a Thursday and allowed Days contains Sunday', function () {
            it('should return a date being Sunday, 3 days after the given date', function () {
                const givenDate = new Date('Thu Apr 18 2019 12:00:00 GMT+0200');
                const expectedDate = new Date('Sun Apr 21 2019 12:00:00 GMT+0200');
                const nextDate = RecurrenceService.getNextDate(givenDate, ['SU']);
                expect(nextDate).toEqual(expectedDate);
                expect(nextDate.getTime() - givenDate.getTime()).toBe(DAY_IN_MILLISECONDS * 3);
            });
        });

        describe('When the given date is a Friday and allowed Days contains only Friday', function () {
            it('should return a date being Friday, 7 days after the given date', function () {
                const givenDate = new Date('Fri Apr 5 2019 12:00:00 GMT+0200');
                const expectedDate = new Date('Fri Apr 12 2019 12:00:00 GMT+0200');
                const nextDate = RecurrenceService.getNextDate(givenDate, ['FR']);
                expect(nextDate).toEqual(expectedDate);
                expect(nextDate.getTime() - givenDate.getTime()).toBe(DAY_IN_MILLISECONDS * 7);
            });
        });

        describe('When the given date is a Saturday and allowed Days contains Thursday, Friday, Saturday', function () {
            it('should return a date being Thursday, 4 days after the given date', function () {
                const givenDate = new Date('Sat Apr 14 2019 12:00:00 GMT+0200');
                const expectedDate = new Date('Thu Apr 18 2019 12:00:00 GMT+0200');
                const nextDate = RecurrenceService.getNextDate(givenDate, ['TH', 'FR', 'SA']);
                expect(nextDate).toEqual(expectedDate);
                expect(nextDate.getTime() - givenDate.getTime()).toBe(DAY_IN_MILLISECONDS * 4);
            });
        });

        describe('When the given date is a Sunday and allowed Days contains all days of the week', function () {
            it('should return a date being Monday, 1 day after the given date', function () {
                const givenDate = new Date('Sun Apr 28 2019 12:00:00 GMT+0200');
                const expectedDate = new Date('Mon Apr 29 2019 12:00:00 GMT+0200');
                const nextDate = RecurrenceService.getNextDate(givenDate, ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU']);
                expect(nextDate).toEqual(expectedDate);
                expect(nextDate.getTime() - givenDate.getTime()).toBe(DAY_IN_MILLISECONDS);
            });
        });
    });

    describe('constructWeekly', function () {
        describe('Today being the 10th of April, 2019', function () {
            beforeEach(function () {
                let today = new Date('2019-04-10T12:00:00+02:00');
                jasmine.clock().mockDate(today); // Wed Apr 10 2019 12:00:00 GMT+0200 (Central European Summer Time)
                console.log('Mocked today : ', today);
            });

            describe('given a ruleset weekly on Tuesday until forever starting Tuesday April 2nd', function () {
                it('should give back 3 events', function (done) {
                    const startDate = '2019-04-02T20:00:00+02:00';
                    const endDate = '2019-04-02T22:00:00+02:00';
                    let calEvent = {
                        start: {
                            dateTime: startDate
                        },
                        end: {
                            dateTime: endDate
                        }
                    };
                    const ruleset = {FREQ: 'WEEKLY', BY_DAY: ['TU']};
                    RecurrenceService.constructWeekly(calEvent, ruleset)
                                     .then((constructedEvents) => {
                                         expect(constructedEvents.length).toBe(3);
                                         expect(new Date(constructedEvents[0].start.dateTime)).toEqual(new Date('2019-04-02T20:00:00+02:00'));
                                         expect(new Date(constructedEvents[1].start.dateTime)).toEqual(new Date('2019-04-09T20:00:00+02:00'));
                                         expect(new Date(constructedEvents[2].start.dateTime)).toEqual(new Date('2019-04-16T20:00:00+02:00'));
                                         done();
                                     });
                    $rootScope.$apply();
                });
            });

            describe('given a ruleset weekly with week start monday starting Monday, March 31st', function () {
                it('should give back ', function (done) {
                    const startDate = '2019-03-31T20:00:00+02:00';
                    const endDate = '2019-03-31T21:00:00+02:00';
                    let calEvent = {
                        start: {
                            dateTime: startDate
                        },
                        end: {
                            dateTime: endDate
                        }
                    };
                    const ruleset = {FREQ: 'WEEKLY'};
                    RecurrenceService.constructWeekly(calEvent, ruleset)
                                     .then((constructedEvents) => {
                                         expect(constructedEvents.length).toBe(3);
                                         expect(new Date(constructedEvents[0].start.dateTime)).toEqual(new Date('2019-03-31T20:00:00+02:00'));
                                         expect(new Date(constructedEvents[1].start.dateTime)).toEqual(new Date('2019-04-07T20:00:00+02:00'));
                                         expect(new Date(constructedEvents[2].start.dateTime)).toEqual(new Date('2019-04-14T20:00:00+02:00'));
                                         done();
                                     });
                    $rootScope.$apply();
                });
            });
        });

    });
});