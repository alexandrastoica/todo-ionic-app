# Ionic ToDo App
This is a mobile application developed using Ionic Framework, AngularJS, Firebase and ngCordova. It allows the user to login and create todo lists, either personal or shared with other registered users by searching for their email account.

#Features
1. It is a dynamic application, using Firebase to store and manipulate data. 
2. It supports high levels of interaction such as login, register. 
3. It enables personalisation by allowing the user to create a personal account that is restricted only to them. 
4. It utilises native functionality of the device where appropriate, i.e. vibration on errors on login, register. 
5. It provides some functionality even without an Internet connection by allowing the logged in user still update their data which is kept locally and synchronises when the internet is back. Although, it is not fully functional without internet connection, the application lets the user know when it cannot connect.  

#Further Information
The application can be downloaded and run from the terminal using `ionic serve`.
The application can be build with 
```
	ionic platform add ios
	ionic build ios
	ionic emulate ios
```
This application was developed for iOS 8 or higher for iPhone. It was tested on both iPhone 5 and iPhone 6.
