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

                var listRef = new Firebase(FIREBASE_URL + 'lists/');
                var listInfo = $firebaseArray(listRef);

                $scope.addList = function(params){
                    Lists.addLists(params, $scope.addedUsersId);
                    params.listname = '';
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


                /*if(!$scope.share){
                    $scope.addedUsers = [];
                    $scope.addedUsersId = [];
                    $scope.params.share-email = '';
                }*/

            } // if user authenticated

        }); // onAuth

}]) //controller


.controller("ListCtrl", ['$scope', '$rootScope', '$state','$firebaseAuth', '$firebaseArray', '$firebaseObject', 'FIREBASE_URL', '$ionicListDelegate', 'Auth', 'Lists', '$ionicPopup', '$timeout',
    function($scope, $rootScope, $state, $firebaseAuth, $firebaseArray, $firebaseObject, FIREBASE_URL, $ionicListDelegate, Auth, Lists, $ionicPopup, $timeout) {

        var ref = new Firebase(FIREBASE_URL);
        var auth = $firebaseAuth(ref);

        $scope.data = function(){
           showDelete = false;
           showReorder = false;
        }

        auth.$onAuth(function(authUser) {
            if (authUser) {

                $scope.whichList = $state.params.lId;
                
                if(!$rootScope.lists){
                    $rootScope.lists = [];
                    Lists.getLists();
                } 
                

                $scope.moveList = function(list, fromIndex, toIndex) {
                    //Move the item in the array
                    $rootScope.lists.splice(fromIndex, 1);
                    $rootScope.lists.splice(toIndex, 0, list);
                };

                $scope.deleteList = function(key, id) {
                    //delete from the lists object
                    var refDel = new Firebase(FIREBASE_URL + "/lists/" + id);
                    var record = $firebaseObject(refDel);
                    record.$remove(id);

                    //delete from the users object
                    var refDel = new Firebase(FIREBASE_URL + "/users/" + $rootScope.currentUser.$id + "/lists/" + id);
                    var record = $firebaseObject(refDel);
                    record.$remove(id);

                    $ionicListDelegate.showDelete(false);
                }; //remove the list


                $scope.deleteSharedList = function(key, id) {

                    //delete from users object
                    var refDel = new Firebase(FIREBASE_URL + "/lists/" + id + "/members");
                    refDel.once("value", function(snap){
                        snap.forEach(function(data) {
                            var userRef = new Firebase(FIREBASE_URL + "/users/" + data.key() + "/lists/" + id);
                            var record = $firebaseObject(userRef);
                            record.$remove(id);
                        });
                    });
                    //delete from the lists object
                    var refDel = new Firebase(FIREBASE_URL + "/lists/" + id);
                    var record = $firebaseObject(refDel);
                    record.$remove(id);

                    $state.go("tabs.shared");

                }; //remove the list

                var listRef = new Firebase(FIREBASE_URL + "lists/" + $scope.whichList);
                var listInfo = $firebaseObject(listRef);
                $scope.members = [];

                listInfo.$loaded().then(function(){
                    var authorId = listInfo.by;
                    var userRef = new Firebase(FIREBASE_URL + 'users/' + authorId);
                    var userInfo = $firebaseObject(userRef);
                    userInfo.$loaded().then(function(){
                        $scope.author = userInfo.name + " | " + userInfo.email;
                    });

                    angular.forEach(listInfo.members, function(user, key){
                        var userRef = new Firebase(FIREBASE_URL + 'users/' + key);
                        var userInfo = $firebaseObject(userRef);
                        userInfo.$loaded().then(function(){
                            $scope.members.push(userInfo.email);
                        });
                    });
                });

                $scope.addTask = function(){
                    $scope.popup = {}
                    var myPopup = $ionicPopup.show({
                        templateUrl: '../templates/popup.html',
                        title: 'Enter a task',
                        scope: $scope,
                        buttons: [
                            { 
                                text: 'Cancel' 
                            }, {
                                text: '<b>Save</b>',
                                type: 'button-positive',
                                onTap: function(e) {
                                    if (!$scope.popup.taskname) {
                                        //don't allow the user to save unless he enters task
                                        e.preventDefault();
                                    } else {
                                        return $scope.popup.taskname;
                                    }
                                }
                            }
                        ]
                    }).then(function(res) {
                        Lists.addTask($scope.whichList, res);
                        Lists.getTasks($scope.whichList);
                    });

                } //add task

                if($scope.whichList){
                    Lists.getTasks($scope.whichList);

                    $scope.completeTask = function(id){
                        var ref = new Firebase(FIREBASE_URL + "/lists/" + $scope.whichList + "/tasks/" + id);
                        ref.update({
                            done: 1
                        });
                    }
                } //if list defined
            
            }//if auth
        }); //onAuth
}])

.controller("ProfileCtrl", ['$scope', '$rootScope', '$state','$firebaseAuth', '$firebaseArray', '$firebaseObject', 'FIREBASE_URL', '$ionicListDelegate', 'Auth', 'Lists', '$ionicPopup', '$timeout',
    function($scope, $rootScope, $state, $firebaseAuth, $firebaseArray, $firebaseObject, FIREBASE_URL, $ionicListDelegate, Auth, Lists, $ionicPopup, $timeout) {


                $scope.logout = function(){
                    Auth.logout();
                    $rootScope.lists = [];
                    $rootScope.ownLists = [];
                    $rootScope.sharedLists = [];
                    $scope.addedUsers = [];
                    $scope.addedUsersId = [];
                    $scope.whichList = '';
                };

}]);
