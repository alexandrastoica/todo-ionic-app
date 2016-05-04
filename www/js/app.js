// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'firebase', 'ngCordova'])

.run(function($ionicPlatform, $rootScope, $state, $cordovaDialogs, $cordovaVibration) {
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);

        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }

        //fallback in case unlogged user accesses the wrong page
        $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error){
            if(error === 'AUTH_REQUIRED'){
                $state.go('login');
                console.log(error);
            }
        });

        //tell the user if the app lost internet connection
        $rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
            $cordovaDialogs.alert('Your app needs internet connection to work poperly.', 'No Internet Connection', 'Ok').then(function() {
              // callback success
            });
            //vibrate to tell the user something's not right
            $cordovaVibration.vibrate(100);
        });
    })
})

.constant('FIREBASE_URL', 'https://fiery-inferno-5206.firebaseIO.com/') //define firebase url

.config(function($ionicConfigProvider) {
    $ionicConfigProvider.views.maxCache(10); //control the number of cheched views for storage
    $ionicConfigProvider.scrolling.jsScrolling(false); 
})

.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('login', {
            url: "/",
            templateUrl: "templates/login.html",
            controller: "LoginCtrl"
        })
        .state('register', {
            url: "/register",
            templateUrl: "templates/register.html",
            controller: "RegisterCtrl"
        })
        .state('tabs', {
            url: "/tabs",
            abstract: true,
            templateUrl: "templates/tabs.html"
        })
        .state('tabs.add', {
            url: "/add",
            views: {
                "add-tab": {
                    templateUrl: "templates/add.html",
                    controller: "AddListCtrl"
                }
            },
            resolve: {
                currentAuth: function(Auth) {
                    return Auth.requireAuth();
                }
            } // resolve - this will prevent unlogged user from accessing the page
        }).state('tabs.lists', {
            url: "/lists",
            cache: true,
            views: {
                "lists-tab": {
                    templateUrl: "templates/lists.html",
                    controller: "ListCtrl"
                }
            },
            resolve: {
                currentAuth: function(Auth) {
                    return Auth.requireAuth();
                }
            } // resolve - this will prevent unlogged user from accessing the page
        }).state('tabs.shared', {
            url: "/shared",
            cache: true,
            views: {
                "shared-tab": {
                    templateUrl: "templates/shared.html",
                    controller: "ListCtrl"
                }
            },
            resolve: {
                currentAuth: function(Auth) {
                    return Auth.requireAuth();
                }
            } // resolve - this will prevent unlogged user from accessing the page
        }).state('tabs.detail', {
            url: "/lists/:lId",
            //cache: false,
            views: {
                "lists-tab": {
                    templateUrl: "templates/lists-details.html",
                    controller: "ListCtrl"
                }
            },
            resolve: {
                currentAuth: function(Auth) {
                    return Auth.requireAuth();
                }
            } // resolve - this will prevent unlogged user from accessing the page
        }).state('tabs.shared-detail', {
            url: "/shared/:lId",
            //cache: false,
            views: {
                "shared-tab": {
                    templateUrl: "templates/shared-details.html",
                    controller: "ListCtrl"
                }
            },
            resolve: {
                currentAuth: function(Auth) {
                    return Auth.requireAuth();
                }
            } // resolve - this will prevent unlogged user from accessing the page
        }).state('tabs.profile', {
            url: "/profile",
            //cache: false,
            views: {
                "profile-tab": {
                    templateUrl: "templates/profile.html",
                    controller: "ProfileCtrl"
                }
            },
            resolve: {
                currentAuth: function(Auth) {
                    return Auth.requireAuth();
                }
            } // resolve - this will prevent unlogged user from accessing the page
        });

        $urlRouterProvider.otherwise("/");
});