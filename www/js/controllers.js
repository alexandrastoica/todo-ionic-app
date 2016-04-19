angular.module('starter.controllers', [])


.controller("LoginCtrl", ['$scope', '$rootScope', 'Auth',
    function($scope, $rootScope, Auth) {

        $rootScope.message = '';

        //console.log($rootScope.currentUser);
        $scope.login = function(user) {
            //console.log(user);
            $scope.user = {
                email: user.email,
                password: user.password
            };
            console.log($scope.user);
            Auth.login($scope.user);
        };   
}])

.controller("RegisterCtrl", ['$scope', '$rootScope', 'Auth',
    function($scope, $rootScope, Auth) {

        $rootScope.message = '';

        $scope.register = function(user) {
            $scope.user = {
                email: user.email,
                name: user.name,
                password: user.password
            };
            console.log($scope.user);
            Auth.register($scope.user);
        };

}]) //controller

.controller("AddListCtrl", ['$scope', '$rootScope', '$state','$firebaseAuth', '$firebaseArray', '$firebaseObject', 'FIREBASE_URL', '$ionicListDelegate', 'Auth', 'Lists',
    function($scope, $rootScope, $state, $firebaseAuth, $firebaseArray, $firebaseObject, FIREBASE_URL, $ionicListDelegate, Auth, Lists) {

        var ref = new Firebase(FIREBASE_URL);
        var auth = $firebaseAuth(ref);

        auth.$onAuth(function(authUser) {
            if (authUser) {

                $scope.logout = function(){
                    Auth.logout();
                    $rootScope.lists = [];
                    $rootScope.ownLists = [];
                    $rootScope.sharedLists = [];
                    $scope.addedUsers = [];
                    $scope.addedUsersId = [];
                    $scope.whichList = '';
                };

                var listRef = new Firebase(FIREBASE_URL + 'lists/');
                var listInfo = $firebaseArray(listRef);

                Lists.getLists();

                $scope.data = function(){
                   showDelete = false;
                   showReorder = false;
                }

                $scope.moveList = function(list, fromIndex, toIndex) {
                    //Move the item in the array
                    $rootScope.lists.splice(fromIndex, 1);
                    $rootScope.lists.splice(toIndex, 0, list);
                };

                $scope.deleteList = function(key) {
                    listInfo.$remove(key);
                    $rootScope.lists.splice(key, 1);
                }; //remove the list


                $scope.addList = function(params){
                    Lists.addLists(params, $scope.addedUsersId);
                }

                var userRef = new Firebase(FIREBASE_URL + 'users/');
                var userInfo = $firebaseArray(userRef);

                $scope.users = userInfo;

                $scope.addedUsers = [];
                $scope.addedUsersId = [];

                $scope.addPerson = function(user) {
                    console.log("person added");
                    $scope.addedUsers.push(user.email);
                    $scope.addedUsersId.push(user.$id);
                }; //add user to list

                $scope.removePerson = function(key) {
                    $scope.addedUsers.splice(key, 1);
                }; //remove user from the list


                //get user by id
                $scope.whichList = $state.params.lId;
                $scope.shares = [];
                if($scope.whichList != undefined){
                    listRef.child($scope.whichList + '/by').once('value', function(snap) {
                        authorId = snap.val();
                        userRef.child(authorId).child('/name').once('value', function(snap){
                            $scope.author = snap.val();
                        });
                    });
                    listRef.child($scope.whichList).child('/shared').once('value', function(snap) {
                        //console.log(snap.val());
                        if(snap.val() == 1){
                            listRef.child($scope.whichList + '/members').once('value', function(snap){
                                var data = snap.val();
                                userRef.child(data.userId).child('/name').once('value', function(snap){
                                    //console.log(snap.val());
                                        $scope.shares.push(snap.val());
                                });
                            });
                        } else {
                            $scope.shares = [];
                        }
                    });



                } else {
                    $scope.author = '';
                }

            } // if user authenticated

        }); // onAuth

}]); //controller