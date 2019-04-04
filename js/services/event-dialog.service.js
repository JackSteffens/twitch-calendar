'use strict';
angular.module('hypnoised.calendar')
       .service('EventDialogService', function ($compile, $rootElement, $rootScope, $timeout) {
           const BACKDROP_ID = 'dialog-backdrop';
           let $service = this;
           $service.openEvent = openEvent;
           $service.closeEvent = closeEvent;

           /**
            * @param {Event} event
            * @param {CalendarEvent} calendarEvent
            */
           function openEvent(event, calendarEvent) {
               let backdrop = findBackdrop();
               if (!backdrop) {
                   backdrop = createBackdrop();
               }
               insertIntoBackdrop(event, backdrop, calendarEvent);
           }

           function closeEvent() {
               clearBackdrop();
           }

           /**
            *
            * @return {JQLite | undefined}
            */
           function findBackdrop() {
               let backdrop = undefined;
               let rootChildren = $rootElement.children() || [];
               angular.forEach(rootChildren, (element) => {
                   if (element.id === BACKDROP_ID && !backdrop) {
                       backdrop = element;
                   }
               });
               return backdrop ? angular.element(backdrop) : undefined;
           }

           /**
            * @param {Event} event
            * @param {JQLite} backdropElement
            * @param {CalendarEvent} calendarEvent
            */
           function insertIntoBackdrop(event, backdropElement, calendarEvent) {
               console.log('event : ', event);

               let scope = $rootScope.$new();
               scope.event = calendarEvent;
               scope.width = event.currentTarget.clientWidth;
               scope.height = event.currentTarget.clientHeight;
               scope.posX = event.currentTarget.getBoundingClientRect().left;
               scope.posY = event.currentTarget.getBoundingClientRect().top;

               let dialog = angular.element(`<event-dialog event="event" width="width" height="height" pos-x="posX" pos-y="posY"></event-dialog>`);
               dialog.css('height', scope.height + 'px');
               dialog.css('width', scope.width + 'px');
               dialog.css('top', scope.posY + 'px');
               dialog.css('left', scope.posX + 'px');

               $compile(dialog)(scope);

               backdropElement.append(dialog);
               backdropElement.removeClass('hide');
               window.requestAnimationFrame(() => {
                   backdropElement.addClass('active');
                   dialog.addClass('active');
                   $timeout(() => {
                       dialog.attr('style', '');
                   }, 100);
               });
           }

           function clearBackdrop() {
               let backdrop = findBackdrop();
               if (backdrop) {
                   let dialog = backdrop.find('event-dialog');
                   dialog.removeClass('active');
                   backdrop.removeClass('active');
                   $timeout(() => {
                       backdrop.addClass('hide');
                       backdrop.empty();
                   }, 200);
               }
           }

           /**
            *
            * @return {JQLite}
            */
           function createBackdrop() {
               let backdrop = angular.element(`<div id="dialog-backdrop"></div>`);
               $rootElement.append(backdrop);
               return backdrop;
           }
       });