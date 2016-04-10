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

        $scope.logout = function() {
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
    ]) //controller

.controller("AddListCtrl", ['$scope', '$rootScope', '$firebaseAuth', '$firebaseArray', 'FIREBASE_URL', '$ionicListDelegate',
    function($scope, $rootScope, $firebaseAuth, $firebaseArray, FIREBASE_URL, $ionicListDelegate) {

        var ref = new Firebase(FIREBASE_URL);
        var auth = $firebaseAuth(ref);

        $scope.showDeleteButtons = function() {
            $ionicListDelegate.showDelete(true);
        };

        auth.$onAuth(function(authUser) {
            if (authUser) {

                var listRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/lists');
                var listInfo = $firebaseArray(listRef);

                $scope.list = listInfo;

                $scope.moveList = function(list, fromIndex, toIndex) {
                //Move the item in the array
                $scope.list.splice(fromIndex, 1);
                $scope.list.splice(toIndex, 0, list);
                };

                $scope.addList = function(params) {
                    console.log(params.listname);
                    listInfo.$add({
                        name: params.listname,
                        date: Firebase.ServerValue.TIMESTAMP
                    }).then(function() {
                        params.listname = '';
                    }); //add
                }; // add list

                $scope.deleteList = function(key) {
                    listInfo.$remove(key);
                }; //remove the list

            } // if user authenticated
        }); // onAuth
    }
]); //controller