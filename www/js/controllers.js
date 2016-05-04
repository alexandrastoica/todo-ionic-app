angular.module('starter.controllers', [])


.controller("LoginCtrl", ['$scope', '$rootScope', 'Auth', '$ionicLoading',
    function($scope, $rootScope, Auth, $ionicLoading) {

        $rootScope.message = '';

        //log in user automacally if logged in before
        if(localStorage.getItem('usr')) {
            var info = localStorage.getItem('usr');
            info = JSON.parse(info);
            Auth.login(info);
        }

        $scope.login = function(user) {
            $scope.user = {
                email: user.email,
                password: user.password
            };
            //store user info locally to keep the user logged in
            localStorage.setItem("usr", JSON.stringify($scope.user));
            Auth.login($scope.user); //call login service
        };
}])

.controller("RegisterCtrl", ['$scope', '$rootScope', 'Auth',
    function($scope, $rootScope, Auth) {

        $rootScope.message = '';

        //register the user
        $scope.register = function(user) {
            $scope.user = {
                email: user.email,
                name: user.name,
                password: user.password
            };
            Auth.register($scope.user); //call auth service
        };

}]) //controller

.controller("AddListCtrl", ['$scope', '$rootScope', '$state','$firebaseAuth', '$firebaseArray', '$firebaseObject', 'FIREBASE_URL', '$ionicListDelegate', 'Auth', 'Lists',
    function($scope, $rootScope, $state, $firebaseAuth, $firebaseArray, $firebaseObject, FIREBASE_URL, $ionicListDelegate, Auth, Lists) {

        var ref = new Firebase(FIREBASE_URL);
        var auth = $firebaseAuth(ref);

        auth.$onAuth(function(authUser) {
            if (authUser) {

                // define lists reference
                var listRef = new Firebase(FIREBASE_URL + 'lists/');
                var listInfo = $firebaseArray(listRef);

                var userRef = new Firebase(FIREBASE_URL + 'users/');
                var userInfo = $firebaseArray(userRef);

                $scope.users = userInfo;
                
                //use application lifecycle to reset the variables on enter and after leave
                $scope.$on("$ionicView.enter", function(event, data){
                    // initialise variables
                    $scope.addedUsers = [];
                    $scope.addedUsersId = [];
                    $scope.share = false;
                    $scope.params = {
                        share_email: '',
                        listname: ''
                    }
                });

                $scope.$on("$ionicView.afterLeave", function(event, data){
                    // initialise variables
                    $scope.addedUsers = [];
                    $scope.addedUsersId = [];
                    $scope.share = false;
                    $scope.params = {
                        share_email: '',
                        listname: ''
                    }
                });

                //reset variables if toggle false
                $scope.toggleChange = function(){
                    if($scope.share == false){
                        $scope.share = true;
                    } else {
                        $scope.share = false;
                        $scope.addedUsers = [];
                        $scope.addedUsersId = [];
                        $scope.params.share_email = '';
                    }
                }

                //add list by calling the list service and reset variables
                $scope.addList = function(params){
                    Lists.addLists(params, $scope.addedUsersId);
                    params.listname = '';
                    $scope.addedUsers = [];
                    $scope.addedUsersId = [];
                    params.share_email = '';
                }

                //add or remove user to an array to display to the current user 
                //and also to add to the list object on addList()
                $scope.addPerson = function(user) {
                    $scope.addedUsers.push(user.email);
                    $scope.addedUsersId.push(user.$id);
                }; //add user to list

                $scope.removePerson = function(key) {
                    $scope.addedUsers.splice(key, 1);
                }; //remove user from the list

            } // if user authenticated

        }); // onAuth

}]) //controller
.controller("ListCtrl", ['$scope', '$rootScope', '$state','$firebaseAuth', '$firebaseArray', '$firebaseObject', 'FIREBASE_URL', '$ionicListDelegate', 'Auth', 'Lists', '$ionicPopup', '$ionicLoading', '$cordovaDialogs',
    function($scope, $rootScope, $state, $firebaseAuth, $firebaseArray, $firebaseObject, FIREBASE_URL, $ionicListDelegate, Auth, Lists, $ionicPopup, $ionicLoading, $cordovaDialogs) {

        var ref = new Firebase(FIREBASE_URL);
        var auth = $firebaseAuth(ref);

        $scope.data = function(){
           showDelete = false;
        }

        $scope.taskparams = {
            newTask: ''
        }

        auth.$onAuth(function(authUser) {
            if (authUser) {

                if(!$rootScope.lists){
                    $rootScope.lists = [];
                    Lists.getLists();
                }

                //get the subpage of list details, if existing
                $scope.whichList = $state.params.lId;

                $scope.deleteList = function(key, id) {
                    //ensure the user wants to delete the item
                    $cordovaDialogs.confirm('Are you sure you want to delete this item?', 'Delete', ['Cancel','Confirm']).then(function(buttonIndex) {
                        if(buttonIndex == 1){ //confirmed
                            //delete from the lists object
                            var refDel = new Firebase(FIREBASE_URL + "/lists/" + id);
                            var record = $firebaseObject(refDel);
                            record.$remove(id);

                            //delete from the users object
                            var refDel = new Firebase(FIREBASE_URL + "/users/" + $rootScope.currentUser.$id + "/lists/" + id);
                            var record = $firebaseObject(refDel);
                            record.$remove(id);

                            $ionicListDelegate.showDelete(false);
                        }
                    });
                }; //remove the list


                $scope.deleteSharedList = function(key, id) {
                    $cordovaDialogs.confirm('Are you sure you want to delete this item?', 'Delete', ['Cancel','Confirm']).then(function(buttonIndex) {
                        if(buttonIndex == 1){ //confirmed
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
                        }
                    });
                }; //remove the list

                if($scope.whichList){
                    //fetch task list when needed
                    var refDel = new Firebase(FIREBASE_URL + "/lists/" + $scope.whichList + "/tasks");
                    var record = $firebaseObject(refDel);
                    $rootScope.tasks = $firebaseArray(refDel);
                }

                //do not let users delete a shared list if they are not admins
                $scope.canDelete = false;

                var listRef = new Firebase(FIREBASE_URL + "lists/" + $scope.whichList);
                var listInfo = $firebaseObject(listRef);
                $scope.members = [];

                listInfo.$loaded().then(function(){
                    var authorId = listInfo.by;
                    //if admin, let user delete list
                    if(authorId == $rootScope.currentUser.$id){
                        $scope.canDelete = true;
                    }
                    //got to that user and fetch their details
                    var userRef = new Firebase(FIREBASE_URL + 'users/' + authorId);
                    var userInfo = $firebaseObject(userRef);
                    userInfo.$loaded().then(function(){
                        $scope.author = userInfo.name + " | " + userInfo.email;
                    });

                    //fetch list of members
                    angular.forEach(listInfo.members, function(user, key){
                        var userRef = new Firebase(FIREBASE_URL + 'users/' + key);
                        var userInfo = $firebaseObject(userRef);
                        userInfo.$loaded().then(function(){
                            $scope.members.push(userInfo.email);
                        });
                    });
                });

                $scope.addTask = function(params){
                    Lists.addTask($scope.whichList, params.newTask);
                    params.newTask = '';
                } //add task

                $scope.removeTask = function(id){
                    //get record reference and remove
                    var ref = new Firebase(FIREBASE_URL + "/lists/" + $scope.whichList + "/tasks/" + id);
                    var record = $firebaseObject(ref);
                    record.$remove(id);
                }
                    
                $scope.completeTask = function(id){
                    //get record reference and update
                    var ref = new Firebase(FIREBASE_URL + "/lists/" + $scope.whichList + "/tasks/" + id);
                    ref.update({
                        done: 1,
                        date: Firebase.ServerValue.TIMESTAMP
                    });
                }
            
            }//if auth
        }); //onAuth
}])

.controller("ProfileCtrl", ['$scope', '$rootScope', 'Auth', '$ionicHistory', '$cordovaNetwork',
    function($scope, $rootScope, Auth, $ionicHistory, $cordovaNetwork) {

        $scope.logout = function(){
            Auth.logout(); //log the user out by calling auth service
            localStorage.removeItem('todousr'); //eliminate login details from localstorage to prevent autologin
            $ionicHistory.clearCache(); //clear any cached views
        };
        
}]);
