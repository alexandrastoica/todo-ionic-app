// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'firebase'])

.run(function($ionicPlatform, $rootScope, $state) {
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
                }
        });
    });
})

.constant('FIREBASE_URL', 'https://fiery-inferno-5206.firebaseIO.com/')

.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('login', {
            url: "/",
            cache: false,
            templateUrl: "templates/login.html",
            controller: "LoginCtrl"
        })
        .state('register', {
            url: "/register",
            cache: false,
            templateUrl: "templates/register.html",
            controller: "RegisterCtrl"
        })
        .state('tabs', {
            url: "/tabs",
            cache: false,
            abstract: true,
            templateUrl: "templates/tabs.html"
        })
        .state('tabs.addlist', {
            url: "/addlist",
            cache: false,
            views: {
                "addlist-tab": {
                    templateUrl: "templates/addlist.html",
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
            cache: false,
            views: {
                "lists-tab": {
                    templateUrl: "templates/lists.html",
                    controller: "AddListCtrl"
                }
            },
            resolve: {
                currentAuth: function(Auth) {
                    console.log(Auth.requireAuth());
                    return Auth.requireAuth();
                }
            } // resolve - this will prevent unlogged user from accessing the page
        }).state('lists.detail', {
            url: "/lists/:lId",
            cache: false,
            views: {
                "lists-tab": {
                    templateUrl: "templates/lists.details.html",
                    controller: "AddListCtrl"
                }
            },
            resolve: {
                currentAuth: function(Auth) {
                    console.log(Auth.requireAuth());
                    return Auth.requireAuth();
                }
            } // resolve - this will prevent unlogged user from accessing the page
        }).state('tabs.profile', {
            url: "/profile",
            cache: false,
            views: {
                "profile-tab": {
                    templateUrl: "templates/profile.html",
                    controller: "AddListCtrl"
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