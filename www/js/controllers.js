angular.module('starter.controllers', [])


.controller("LoginCtrl", ['$scope', 'Auth',
    function($scope, Auth) {

        $scope.login = function(LoginForm) {
            $scope.user = {
                email: LoginForm.email.$modelValue,
                password: LoginForm.password.$modelValue
            };
            console.log($scope.user);
            Auth.login($scope.user);
        };

        $scope.logout = function(){
        	Auth.logout();
        };

    }
])

.controller("RegisterCtrl", ['$scope', 'Auth',
    function($scope, Auth) {

        $scope.register = function(RegisterForm) {
            $scope.user = {
                email: RegisterForm.email.$modelValue,
                name: RegisterForm.name.$modelValue,
                password: RegisterForm.password.$modelValue
            };
            console.log($scope.user);
            Auth.register($scope.user);
        }

    }
]); //controller