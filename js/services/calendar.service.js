'use strict';
angular.module('hypnoised.calendar')
       .service('CalendarService', function ($http, $q, $timeout, Segments) {
           window.Twitch.ext.onAuthorized((auth) => {
               $service.authObj = auth;
               _isAuthenticated = true;
           });

           const $service = this;
           const WAIT_DELAY = 500;
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
                   _configPromise = $http.get(`https://api.twitch.tv/extensions/${$service.authObj.clientId}/configurations/channels/${$service.authObj.channelId}`,
                       // _configPromise = $http.get(`https://api.twitch.tv/extensions/${auth.clientId}/configurations/segments/global`,
                       {
                           headers: {
                               'Authorization': `Bearer ${$service.authObj.token}`,
                               'client-id': $service.authObj.clientId,
                               'content-type': 'application/json'
                           }
                       });
                   _configPromise.then(function (response) {
                       console.log(response.data);
                       initConfig(response.data);
                   }, function (error) {
                       console.error(error);
                   });
               } else if ($service.config) {
                   console.warn('Auth was already fetched');
               } else {
                   console.error('Client is not autorized for Twitch API calls');
               }
           }

           function initConfig(config) {
               $service.config = {};
               angular.forEach(Segments, (segment) => {
                   $service.config[segment] = undefined;
                   if (config[`${segment}:${$service.authObj.channelId}`]) {
                       let segmentConfig = config[`${segment}:${$service.authObj.channelId}`];
                       if (segmentConfig.record && segmentConfig.record.content) {
                           $service.config[segment] = JSON.parse(config[`${segment}:${$service.authObj.channelId}`].record.content);
                       }
                   }
               });
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
               window.Twitch.ext.configuration.set(segment, 1, JSON.stringify(data));
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
                       _configPromise.then((response) => {
                           initConfig(response.data);
                           resolve($service.config);
                       }, reject);
                   } else if (!_configPromise) {
                       fetchConfig();
                       console.warn('Auth not loaded yet, waiting 0.5s');
                       if (configRetryCount < 10) {
                           $timeout(function () {
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