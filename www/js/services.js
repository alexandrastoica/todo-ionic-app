angular.module('starter.services', [])

.factory('Auth', ['$rootScope', '$firebaseAuth', '$firebaseObject', 'FIREBASE_URL', '$location',

    function($rootScope, $firebaseAuth, $firebaseObject, FIREBASE_URL, $location) {

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
                    $location.path('/tabs/addlist');
                }).catch(function(error) {
                    $rootScope.message = error.message;
                });
            }, //login
            requireAuth: function() {
                return auth.$requireAuth();
            }, //require auth
            logout: function() {
                $location.path('/');
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
                    $location.path('/');
                }).catch(function(error) {
                    $rootScope.message = error.message;
                }); // createUser
            } //register
        }; // object

        return returnObj;
}]); //factory