'use strict';
angular.module('hypnoised.calendar')
       .service('CalendarService', function ($http, $q, $timeout, Segments) {
           window.Twitch.ext.onAuthorized((auth) => {
               $service.authObj = auth;
               _isAuthenticated = true;
           });

           const $service = this;
           const WAIT_DELAY = 500;
           const EXTENSION_VERSION = '0.0.1';
           let _configPromise = undefined;
           let configRetryCount = 0;
           let _isAuthenticated = false;

           $service.authObj = {
               channelId: undefined,
               clientId: undefined,
               token: undefined,
               userId: undefined
           };
           $service.config = undefined;
           $service.getConfig = getConfig;
           $service.getAuth = getAuth;
           $service.saveDeveloperConfig = saveDeveloperConfig;
           $service.saveGlobalConfig = saveGlobalConfig;
           $service.saveBroadcasterConfig = saveBroadcasterConfig;

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
                       console.log('transformed : ', config);
                       console.log('window.Twitch.ext.configuration : ', window.Twitch.ext.configuration);
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
               saveConfig(Segments.DEVELOPER, data);
           }

           function saveBroadcasterConfig(data) {
               saveConfig(Segments.BROADCASTER, data);
           }

           function saveGlobalConfig(data) {
               saveConfig(Segments.GLOBAL, data);
           }

           function saveConfig(segment, data) {
               window.Twitch.ext.configuration.set(segment, EXTENSION_VERSION, JSON.stringify(data));
           }

           function getAuth() {
               return $service.authObj;
           }

           /**
            *
            * @return {promise<Object>}
            */
           function getConfig() {
               console.log('getConfig() triggered : ', configRetryCount);
               return $q((resolve, reject) => {
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
           }
       });