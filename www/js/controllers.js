angular.module('starter.controllers', [])


.controller("LoginCtrl", ['$scope', '$rootScope', 'Auth', '$ionicLoading',
    function($scope, $rootScope, Auth, $ionicLoading) {

        $rootScope.message = '';

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
            localStorage.setItem("usr", JSON.stringify($scope.user));
            Auth.login($scope.user);
        };

        $scope.show = function() {
            $ionicLoading.show({
              template: 'Loading...'
            });
        };
        $scope.hide = function(){
            $ionicLoading.hide();
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

        
        $rootScope.$on('$cordovaNetwork:offline', function() {
             console.log('No internet connection add');
        });

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


                $scope.toggleChange = function(){
                    if($scope.share == false){
                        $scope.share = true;
                    } else {
                        $scope.share = false;
                        $scope.addedUsers = [];
                        $scope.addedUsersId = [];
                        params.share_email = '';
                    }
                }

                $scope.addList = function(params){
                    Lists.addLists(params, $scope.addedUsersId);
                    params.listname = '';
                    $scope.addedUsers = [];
                    $scope.addedUsersId = [];
                    params.share_email = '';
                }
            
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


.controller("ListCtrl", ['$scope', '$rootScope', '$state','$firebaseAuth', '$firebaseArray', '$firebaseObject', 'FIREBASE_URL', '$ionicListDelegate', 'Auth', 'Lists', '$ionicPopup', '$ionicLoading',
    function($scope, $rootScope, $state, $firebaseAuth, $firebaseArray, $firebaseObject, FIREBASE_URL, $ionicListDelegate, Auth, Lists, $ionicPopup, $ionicLoading) {

        var ref = new Firebase(FIREBASE_URL);
        var auth = $firebaseAuth(ref);

        $scope.data = function(){
           showDelete = false;
           showReorder = false;
        }

        auth.$onAuth(function(authUser) {
            if (authUser) {

                if(!$rootScope.lists){
                    $rootScope.lists = [];
                    Lists.getLists();
                }

                $scope.whichList = $state.params.lId;

                
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
                        template: '<ion-list> <label class="item item-input"> <input type="text" name="name" autofocus ng-model="popup.taskname" placeholder="Task"> </label> </ion-list>',
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
                        if(res){
                            Lists.addTask($scope.whichList, res);
                        }
                    });

                } //add task

                if($scope.whichList){

                    if(!$rootScope.tasks){
                        $rootScope.tasks = [];
                        Lists.getTasks($scope.whichList);
                    } 
                    
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

.controller("ProfileCtrl", ['$scope', '$rootScope', 'Auth', '$ionicHistory', '$cordovaNetwork',
    function($scope, $rootScope, Auth, $ionicHistory, $cordovaNetwork) {

        $scope.logout = function(){
            Auth.logout();
            localStorage.removeItem('todousr');
            $ionicHistory.clearCache();
        };


        document.addEventListener("deviceready", function () {

            var type = $cordovaNetwork.getNetwork()

            var isOnline = $cordovaNetwork.isOnline()

            var isOffline = $cordovaNetwork.isOffline()


            // listen for Online event
            $rootScope.$on('$cordovaNetwork:online', function(event, networkState){
              var onlineState = networkState;
            })

            // listen for Offline event
            $rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
              var offlineState = networkState;
            })

        }, false);
        
}]);
