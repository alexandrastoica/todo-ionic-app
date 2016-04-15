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

.controller("AddListCtrl", ['$scope', '$rootScope', '$state', '$stateParams','$firebaseAuth', '$firebaseArray', 'FIREBASE_URL', '$ionicListDelegate', 'Auth',
    function($scope, $rootScope, $state, $stateParams, $firebaseAuth, $firebaseArray, FIREBASE_URL, $ionicListDelegate, Auth) {

        var ref = new Firebase(FIREBASE_URL);
        var auth = $firebaseAuth(ref);

        console.log("currentUser:  " + $rootScope.currentUser.$id);

        $scope.showDeleteButtons = function() {
            $ionicListDelegate.showDelete(true);
        };

        $scope.logout = function(){
            Auth.logout();
        }

        auth.$onAuth(function(authUser) {
            if (authUser) {

                var listRef = new Firebase(FIREBASE_URL + 'lists/');
                var listInfo = $firebaseArray(listRef);

                $scope.list = [];

                listRef.once("value", function(allListSnapshot){
                    allListSnapshot.forEach(function(listSnapshot){
                        var key = listSnapshot.key();
                        var by = listSnapshot.child("by").val();
                        var shared = listSnapshot.child("shared").val();
                        var data = listSnapshot.val();
                        //console.log(data.members.userId);

                        //See if the current user has created the list
                        if($rootScope.currentUser.$id == by){
                            $scope.list.push(data);
                        } else if(shared == 1){ // if not, see if the list is shared to the current user
                            //console.log(key + " list by " + by + " with members ");
                            //console.log(data.members);

                            angular.forEach(data.members, function(member, key){
                                if($rootScope.currentUser.$id == member){
                                        $scope.list.push(data);
                                    } // if
                            }); // forEach member

                        } // else if

                    }); // allListSnapshot
                    console.log($scope.list);
                }); //listRef

                $scope.moveList = function(list, fromIndex, toIndex) {
                    //Move the item in the array
                    $scope.list.splice(fromIndex, 1);
                    $scope.list.splice(toIndex, 0, list);
                };


                $scope.addList = function(params) {
                    //console.log(params.listname);
                    

                    var listId = listRef.push();
                    listId.set({
                        listId: listId.key(),
                        name: params.listname,
                        done: 0,
                        date: Firebase.ServerValue.TIMESTAMP,
                        by: $rootScope.currentUser.$id,
                        shared: 0
                    }); //add

                    params.listname = '';

                    var membersRef = listId.toString(); // get the path to store members if applicable
                    var members = new Firebase(membersRef + "/members/");
                    //alert(members);

                    if($scope.addedUsersId.length > 0) {

                        listId.update({
                            shared: 1
                        });

                        angular.forEach($scope.addedUsersId, function(id, key){
                            members.set({
                                userId: id
                            }); //add
                        });

                        $scope.addedUsers = [];
                    
                    } // if added users

                    $state.go('tabs.lists');

                }; // add list


                $scope.deleteList = function(key) {
                    listInfo.$remove(key);
                }; //remove the list

                var userRef = new Firebase(FIREBASE_URL + 'users/');
                var userInfo = $firebaseArray(userRef);

                $scope.users = userInfo;

                //var item = userRef.$getRecord('test@test1.com');
                //alert(item);

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


            } // if user authenticated


            $stateParams.lId;

        }); // onAuth

}]); //controller