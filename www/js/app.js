// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'firebase'])

.run(function($ionicPlatform) {
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
    });
})

.constant('FIREBASE_URL', 'https://fiery-inferno-5206.firebaseIO.com/')

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
        .state('success', {
            url: "/success",
            templateUrl: "templates/success.html",
            resolve: {
                currentAuth: function(Auth) {
                    return Auth.requireAuth();
                }
            }, // resolve - this will prevent unlogged user from accessing the page
            controller: "LoginCtrl"
        });
        /*.state('tabs', {
            url: "/tab",
            //abstract: true,
            templateUrl: "templates/tabs.html"
        })
        .state("tabs.home", {
            url: '/home',
            views: {
                "home-tab": {
                    templateUrl: 'templates/home.html',
                    controller: 'HomeController'
                }
            }
        })
        .state("tabs.movie", {
            url: '/movie',
            views: {
                "movie-tab": {
                    templateUrl: 'templates/movie.html',
                    controller: 'MovieController'
                }
            }
        })
        .state("tabs.movie-detail", {
            url: '/movie/:id',
            views: {
                "movie-tab": {
                    templateUrl: 'templates/movie.html',
                    controller: 'SearchController'
                }
            }
        })
        .state("tabs.profile", {
            url: '/profile',
            views: {
                "profile-tab": {
                    templateUrl: 'templates/search.html',
                    controller: 'ProfileController'
                }
            }
        })*/

        $urlRouterProvider.otherwise("/");
});