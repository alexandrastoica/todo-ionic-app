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
                console.log(user);
                auth.$authWithPassword({
                    email: user.email,
                    password: user.password
                }).then(function(regUser) {
                    $state.go('tabs.addlist');
                }).catch(function(error) {
                    $rootScope.message = error.message;
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
                    $rootScope.message = error.message;
                }); // createUser
            } //register
        }; // object

        return returnObj;
}]) //factory

.factory('Lists', ['$rootScope', '$firebaseArray', 'FIREBASE_URL', '$state', '$location',
    function($rootScope, $firebaseArray, FIREBASE_URL, $state, $location) {

        var listObj = {
            getLists: function() {

                var listRef = new Firebase(FIREBASE_URL + 'lists/');
                var userRef = new Firebase(FIREBASE_URL + 'users/');

                $rootScope.lists = [];
                $rootScope.ownLists = [];
                $rootScope.sharedLists = [];

                var userListRef = userRef.child($rootScope.currentUser.$id).child('/lists');

                userListRef.on('child_added', function(snap){
                    listRef.child(snap.key()).once('value', function(data){
                        $rootScope.lists.push(data.val());  
                        //console.log(data.val());
                    });
                });
            },
            addLists: function(params, addedUsersId){
                var ref = new Firebase(FIREBASE_URL);
                var listId = ref.child('/lists').push();  //create a new list id
                    listId.set({
                        listId: listId.key(),
                        name: params.listname,
                        done: 0,
                        date: Firebase.ServerValue.TIMESTAMP,
                        by: $rootScope.currentUser.$id,
                        shared: 0
                    }, function(err){
                        if(!err){
                            var name = listId.key();
                            ref.child('/users/' + $rootScope.currentUser.$id + "/lists/" + name).set(true);
                            ref.child('/users/' + $rootScope.currentUser.$id + "/own-lists/" + name).set(true);
                         }
                    });

                    if(addedUsersId.length > 0) {
                        var membersRef = listId.toString(); // get the path to store members if applicable
                        var members = new Firebase(membersRef + '/members');
                        listId.update({
                            shared: 1
                        });
                        angular.forEach(addedUsersId, function(id, key){
                            members.set({
                                userId: id
                            }); //add
                            var name = listId.key();
                            ref.child('/users/' + id + "/lists/" + name).set(true);
                            ref.child('/users/' + id + "/shared-lists/" + name).set(true); // add the list to each member for reference
                        });
                        addedUsers = [];
                    } // if added users
                    $state.go('tabs.lists');
            }

        }
        return listObj;

}]) //factory

.factory("GetUser", ["$firebaseObject", "FIREBASE_URL",
  function($firebaseObject, FIREBASE_URL) {
    return function(value, listId) {

      var ref = new Firebase(FIREBASE_URL + "lists/" + listId);
      var Ref = ref.child(value);

      // return it as a synchronized object
      return $firebaseObject(Ref);
    }
  }
]);