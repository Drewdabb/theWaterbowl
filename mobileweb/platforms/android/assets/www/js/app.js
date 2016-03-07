'use strict';

angular.module('venteritoryApp', [
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'ngMap'
])
        .config(function ($routeProvider, $compileProvider) {
            $routeProvider
                    .when('/', {
                        templateUrl: 'views/login.html',
                        controller: 'LoginCtrl'
                    }).when('/register', {
                        templateUrl: 'views/registration.html',
                        controller: 'LoginCtrl'
                    });
            $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
        })
        .controller('LoginCtrl', function ($scope, $http, $location, $routeParams) {

            $scope.username = '';
            $scope.password = '';
            $scope.login = function () {
                var req = $http.post('http://sakula6440.ventera.com:8080/login');
                req.then(function (response) {
                    $scope.message = response;
                }).catch(function (response) {
                    console.error('Error: ' + response.status + " : " + response.data);
                });
            };
        })
        .controller("cameraController", function ($scope, $routeParams, dataService, Camera) {
            dataService.getLoginData($routeParams.fspEntityID).then(function (data) {
                $scope.data = data.response.docs[0];
            });

            $scope.getPhoto = function () {
                Camera.getPicture().then(function (imageURI) {
                    console.log(imageURI);
                }, function (err) {
                    console.log(err);
                });
            };
        })
        .factory('Camera', ['$q', function ($q) {
                return {
                    getPicture: function (options) {
                        var q = $q.defer();

                        navigator.camera.getPicture(function (result) {
                            q.resolve(result);
                        }, function (err) {
                            q.reject(err);
                        }, options);

                        return q.promise;
                    }
                };
            }])
        .factory("dataService", function (
                $http
                ) {
            var loginData = {};
            return {
                getLoginData: function (id) {
                    return $http({
                        url: "http://sakula6440.ventera.com:8080/solrweb/callorder/select?q=fspEntityID:" + id + "&wt=json",
                        method: "GET"
                    }).success(function (data) {
                        loginData = data;
                    }).then(function () {
                        return loginData;
                    });
                }
            };
        })
        .filter('telephone', function () {
            return function (tel) {
                if (!tel) {
                    return 'None';
                }

                var value = tel.toString().trim().replace(/^\+/, '');

                if (value.match(/[^0-9]/)) {
                    return tel;
                }

                var country, city, number;

                switch (value.length) {
                    case 10: // +1PPP####### -> C (PPP) ###-####
                        country = 1;
                        city = value.slice(0, 3);
                        number = value.slice(3);
                        break;

                    case 11: // +CPPP####### -> CCC (PP) ###-####
                        country = value[0];
                        city = value.slice(1, 4);
                        number = value.slice(4);
                        break;

                    case 12: // +CCCPP####### -> CCC (PP) ###-####
                        country = value.slice(0, 3);
                        city = value.slice(3, 5);
                        number = value.slice(5);
                        break;

                    default:
                        return tel;
                }

                if (country === 1) {
                    country = "";
                }

                number = number.slice(0, 3) + '-' + number.slice(3);

                return (country + " (" + city + ") " + number).trim();
            };
        });