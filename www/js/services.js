angular.module('starter.services', [])

.factory('Auth', ['$rootScope', '$firebaseAuth', '$firebaseObject', 'FIREBASE_URL', '$state',
    function($rootScope, $firebaseAuth, $firebaseObject, FIREBASE_URL, $state) {

        var ref = new Firebase(FIREBASE_URL);
        var auth = $firebaseAuth(ref);

        auth.$onAuth(function(authUser){
        	if (authUser){
        		var userRef = new Firebase(FIREBASE_URL + 'users/' + authUser.uid);
        		var userObj = $firebaseObject(userRef);
        		$rootScope.currentUser = userObj; 
        	} else {
        		$rootScope.currentUser = '';
        	}
        }); // this determines whether the user is or not logged in and which user it is
        
        var returnObj = {
            login: function(user) {
                auth.$authWithPassword({
                    email: user.email,
                    password: user.password
                }).then(function(regUser) {
                    $state.go('tabs.add');
                }, {
                    remember: 'default'
                }).catch(function(error) {
                    //tell the user what the error is
                    switch (error.code) {
                      case "INVALID_EMAIL":
                        $rootScope.message = "The specified user account email is invalid.";
                        break;
                      case "INVALID_PASSWORD":
                        $rootScope.message = "The specified user account password is incorrect.";
                        break;
                      case "INVALID_USER":
                        $rootScope.message = "The specified user account does not exist.";
                        break;
                      default:
                        $rootScope.message = "Error logging user in:" + error.message;
                    }
                });
            }, //login
            requireAuth: function() {
                return auth.$requireAuth();
            }, //require auth
            logout: function() {
                $state.go('login');
                return auth.$unauth();
            }, //logout
            register: function(user) {
                auth.$createUser({
                    email: user.email,
                    password: user.password
                }).then(function(regUser) {
                    var regRef = new Firebase(FIREBASE_URL + 'users')
                        .child(regUser.uid).set({
                            date: Firebase.ServerValue.TIMESTAMP,
                            userId: regUser.uid,
                            name: user.name,
                            email: user.email
                        }); //user info
                    $state.go('login');
                }).catch(function(error) {
                    //tell the user what the error is
                    switch (error.code) {
                      case "EMAIL_TAKEN":
                        $rootScope.message = "The new user account cannot be created because the email is already in use.";
                        break;
                      case "INVALID_EMAIL":
                        $rootScope.message = "The specified email is not a valid email.";
                        break;
                      default:
                        $rootScope.message = "Error creating user:" + error.message;
                    }
                    
                }); // createUser
            } //register
        }; // object

        return returnObj;
}]) //factory

.factory('Lists', ['$rootScope', '$firebaseArray', '$firebaseObject', 'FIREBASE_URL', '$state', '$ionicLoading',
    function($rootScope, $firebaseArray, $firebaseObject, FIREBASE_URL, $state, $ionicLoading) {

        var listObj = {
            getLists: function() {

                var listRef = new Firebase(FIREBASE_URL + 'lists/');
                var userListRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/lists/');

                userListRef.on("child_added", function(snap, prevSnap){
                    $rootScope.lists.push($firebaseObject(listRef.child(snap.key())));
                });
            },
            getTasks: function(listid){
                var taskRef = new Firebase(FIREBASE_URL + '/lists/' + listid + "/tasks");

                taskRef.on("child_added", function(snap){
                    $rootScope.tasks.push($firebaseObject(taskRef.child(snap.key())));
                });
            },
            addLists: function(params, addedUsersId){
                var ref = new Firebase(FIREBASE_URL);
                var listId = ref.child('/lists').push();  //create a new list id

                listId.set({
                    listId: listId.key(),
                    name: params.listname,
                    date: Firebase.ServerValue.TIMESTAMP,
                    by: $rootScope.currentUser.$id,
                    shared: 0
                }, function(err){
                    if(!err){
                        var name = listId.key();
                        ref.child('/users/' + $rootScope.currentUser.$id + "/lists/" + name).set(true);
                        ref.child('/lists/' + name + '/members/' + $rootScope.currentUser.$id).set(true);
                     }
                });

                var membersRef = listId.toString(); // get the path to store members if applicable
                var members = new Firebase(membersRef + '/members');
                
                // if added users
                if(addedUsersId.length > 0) {
                    listId.update({
                        shared: 1
                    });
                    angular.forEach(addedUsersId, function(id, key){
                        members.child(id).set(true);
                        var name = listId.key();
                        ref.child('/users/' + id + "/lists/" + name).set(true);
                    });
                    addedUsers = [];
                    $state.go("tabs.shared");
                } else {
                    $state.go("tabs.lists");
                }
            },
            addTask: function(listid, name){
                //console.log(listid + " " + name);
                var ref = new Firebase(FIREBASE_URL);
                var taskId = ref.child('/lists/'+ listid +'/tasks/').push();  //create a new list id
                taskId.set({
                    taskId: taskId.key(),
                    name: name,
                    done: 0,
                    date: Firebase.ServerValue.TIMESTAMP,
                    by: $rootScope.currentUser.$id
                });
            }
        }
        return listObj;

}]) //factory

.factory('ConnectivityMonitor', function($rootScope, $cordovaNetwork){
 
  return {
    isOnline: function(){
      if(ionic.Platform.isWebView()){
        return $cordovaNetwork.isOnline();    
      } else {
        return navigator.onLine;
      }
    },
    isOffline: function(){
      if(ionic.Platform.isWebView()){
        return !$cordovaNetwork.isOnline();    
      } else {
        return !navigator.onLine;
      }
    },
    startWatching: function(){
        if(ionic.Platform.isWebView()){
 
          $rootScope.$on('$cordovaNetwork:online', function(event, networkState){
            console.log("went online");
          });
 
          $rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
            console.log("went offline");
          });
 
        }
        else {
 
          window.addEventListener("online", function(e) {
            console.log("went online");
          }, false);    
 
          window.addEventListener("offline", function(e) {
            console.log("went offline");
          }, false);  
        }       
    }
  }
})

.factory("User", ["$firebaseObject", "FIREBASE_URL",
  function($firebaseObject, FIREBASE_URL) {

    var userObj = {

        getUser: function(){
            var userRef = new Firebase(FIREBASE_URL + "users/" + $rootScope.currentUser.$id);
        }
        

    } 

    return userObj;
  }
]);