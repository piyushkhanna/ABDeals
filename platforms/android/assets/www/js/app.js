// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic','ionic.service.core', 'ngCordova', 'starter.controllers','ngOpenFB','ngIOS9UIWebViewPatch'])

.run(function($ionicPlatform,$state,$rootScope,$ionicLoading,ngFB,$ionicPopup,$ionicModal,$ionicScrollDelegate,promotionsService) {
  ngFB.init({appId: '1635481623363200'});
  var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
  var duuid,dmodel,dplatform,dversion;
  var user = Ionic.User.current();
  $rootScope.appUser = user;


  if ( app ) {
  // PhoneGap application
  isPhonegap=true;
 
  document.addEventListener('deviceready', function(){
      duuid = device.uuid;
      dmodel =  device.model;
      dplatform =  device.platform;
      dversion =  device.version;
      $rootScope.dev_id= duuid;
      $rootScope.user_id = "trialuser";
      $rootScope.dev_model = dmodel;
      $rootScope.dev_platform = dplatform;
      $rootScope.dev_version= dversion;
      $rootScope.isCordovaapp = true;
    });
  }
  else
  {
    duuid = "ff7b881f-3d9b-000d-a489-28e143f2693b";
    dmodel = "Desktop";
    dplatform = "Not-Phonegap";
    dversion="000";
    $rootScope.dev_id= duuid;
    $rootScope.user_id = "trialuser";
    $rootScope.dev_model = dmodel;
    $rootScope.dev_platform = dplatform;
    $rootScope.dev_version= dversion;

  }

  // Declare your global variable here under root Scope   
  $rootScope.$state = $state; 
  $rootScope.baseServiceURL = "http://www.easemylife.com.au/zdevab/Front-end/php";
  $rootScope.imagesBaseURL = "http://www.easemylife.com.au/medium_mads/"


  //All other rootScope Items goes under fields
  $rootScope.fields = {
    homeDealFilter : 0,
    homeDealFilterChanged: false,   
    homeSearchText: "",
    homeIsSearchCleared: false,
    myPerfectsDealFilterChanged: false,
    myPerfectsDealFilter : 0,
    reloadPerfectsView: false,
    reloadHomeView: false,
    reloadBrowseAdsView: false,
    browseAdsDealFilterChanged: false,
    browseAdsDealFilter : 0
  }
  // Create modal for Promotions we will use later. Bind modal to rootScope so that it can be accessed overall in app
  $ionicModal.fromTemplateUrl('templates/promotions.html', {
    scope: $rootScope,
  }).then(function(modal) {
    $rootScope.promotionsModal = modal;
  });

  $rootScope.showPromotionModal = function()
  {
    $rootScope.promotionsModal.show();

  }
  $rootScope.closePromotionModal = function()
  {
   $rootScope.promotionsModal.hide();
  }
  $rootScope.markNotInterestedInPromotion = function()
  {
   promotionsService.denyPromotion().then(function(){
    $rootScope.promotionsModal.hide();
   });
  }    

  $rootScope.showLoadingOverlay = function(){ $ionicLoading.show({
      template: '<ion-spinner icon="spiral"></ion-spinner>'
    });
  }
  $rootScope.hideLoadingOverlay = function(){ 
    $ionicLoading.hide();
  }
  $rootScope.syncLocalStorage = function(refreshView)
  {
    user.set("savedLocation",  $rootScope.savedLocation);
    user.set("lat", $rootScope.lat);
    user.set("lng", $rootScope.lng);
    user.set("countryCode",$rootScope.countryCode);
    user.set("country", $rootScope.country);
    user.set("homeDealFilter",  $rootScope.fields.homeDealFilter); //0 for local and 1 for national
    user.set("myPerfectsDealFilter",  $rootScope.fields.myPerfectsDealFilter); //0 for local and 1 for national
    user.set("dev_id",$rootScope.dev_id);
    user.set("user_id",$rootScope.user_id);
    user.set("dev_model",$rootScope.dev_model);
    user.set("dev_platform",$rootScope.dev_platform);
    user.set("dev_version",$rootScope.dev_version);
    user.set("pushToken",$rootScope.pushToken);
    user.save();
    if(refreshView)
     {
      if($state.current.name == 'app.home')
      $rootScope.fields.homeDealFilterChanged = true;
      if($state.current.name == 'app.myperfects')
      $rootScope.fields.myPerfectsDealFilterChanged = true;
      if($state.current.name == 'app.browseAds')
      $rootScope.fields.browseAdsDealFilterChanged = true;

      $state.go($state.current, {}, {reload: true});
     }
  }
  $rootScope.clearSearchResults = function(id)
  {
    $("#" + id).val("");
  }

  //check if localStorage has a location already set
  if(typeof(Storage) !== "undefined" && user.get("savedLocation") != undefined)
  {
    $rootScope.savedLocation = user.get("savedLocation");
    $rootScope.lat = user.get("lat");
    $rootScope.lng = user.get("lng");
    $rootScope.countryCode = user.get("countryCode");
    $rootScope.country = user.get("country");
    $rootScope.fields.homeDealFilter = user.get("homeDealFilter"); //0 for local and 1 for national
    $rootScope.fields.myPerfectsDealFilter = user.get("myPerfectsDealFilter");
    $rootScope.syncLocalStorage();
  }
  else
  {
    user.set("homeDealFilter",0); // default local
    user.set("myPerfectsDealFilter",0); 
    $rootScope.fields.homeDealFilter = 0;
    $rootScope.fields.myPerfectsDealFilter = 0;
  }


  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)

    Ionic.io(); 

    // if the user doesn't have an id, you'll need to give it one.
    if (!user.id) {
      user.id = Ionic.User.anonymousId();
      // user.id = 'your-custom-user-id';
    }

  var success = function(response) {
    console.log('user was saved');
  };

  var failure = function(error) {
    console.log('user was NOT saved');
  };

  user.save().then(success, failure);
   

    
    var push = new Ionic.Push({
      "debug": true
    });

    push.register(function(token) {
      console.log("Device token:",token.token);
      $rootScope.pushToken = token.token;
      if($rootScope.appUser.get("pushToken") == undefined || $rootScope.appUser.get("pushToken") == null)
      {
          sendPushId($rootScope.dev_id,$rootScope.pushToken,$rootScope.baseServiceURL + "/checkpush.php")
      }
      $rootScope.appUser.set("pushToken",$rootScope.pushToken);
    });

    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
     if(window.Connection) {
                if(navigator.connection.type == Connection.NONE) {
                    $rootScope.isOffline = true;
                    $ionicScrollDelegate.scrollTop();
                    $ionicPopup.alert({
                        title: "Connection Unavailable",
                        content: "You are not connected to any network source. Please connect to Wifi or use your device's data connection.",
                        okType: "button-calm"
                    })
                    .then(function(result) {
                        if(!result) {
                            ionic.Platform.exitApp();
                        }
                    });
                }
                else
                {
                  $rootScope.isOffline = false;
                }
      }
      else
      {
         $rootScope.isOffline = false;
      }
      document.addEventListener("offline", onOffline, false);
      document.addEventListener("online", onOnline, false);

      function onOffline() {
        $rootScope.isOffline = true;
        $ionicScrollDelegate.scrollTop();
        $ionicPopup.alert({
                        title: "Connection Unavailable",
                        content: "You are not connected to any network source. Please connect to Wifi or use your device's data connection.",
                        okType: "button-calm"
                    })
                    .then(function(result) {
                        if(!result) {
                            ionic.Platform.exitApp();
                        }
          });
      }
      function onOnline() {
        $rootScope.isOffline = false;
        $rootScope.fields.reloadHomeView = true;
        $rootScope.fields.reloadPerfectsView = true;
      }



  });
})
.config(function($stateProvider, $urlRouterProvider,$ionicConfigProvider) {

  //explicitly declare forward cache so that the views are caches when $state.go is called.
  $ionicConfigProvider.views.forwardCache(true);
  //hide the text "back" of the ionic back button
  $ionicConfigProvider.backButton.text('').icon('ion-ios-arrow-left');
  $ionicConfigProvider.navBar.alignTitle('center');

  $stateProvider

  .state('app', {
    url: "/app",
    abstract: true,
    templateUrl: "templates/menu.html",
    controller: 'AppCtrl'
  })
 .state('app.details', {
    url: "/details?ad_id&location_id",
    cache: true,
    params: {"adObject":null},
    views: {
      'menuContent': {
        templateUrl: "templates/details.html",
        controller: 'DetailsCtrl'
      }
    }
  })
 .state('app.googlemap', {
    url: "/googlemap",
    cache: true,
    params: {"glng":null,"glat":null,"dispadd":null},
    views: {
      'menuContent': {
        templateUrl: "templates/googleMap.html",
        controller: 'mapsCtrl'
      }
    }
  })
 .state('app.home', {
    url: "/home",
    views: {
      'menuContent': {
        templateUrl: "templates/home.html",
        controller: 'HomeCtrl'
      }
    }
  })
   .state('app.myperfects', {
    url: "/myperfects",
    cache:true,
    views: {
      'menuContent': {
        templateUrl: "templates/myperfects.html",
        controller: "myPerfectsCtrl"
      }
    }
  })

  .state('app.contactus', {
    url: "/contactus",
    views: {
      'menuContent': {
        templateUrl: "templates/contactUs.html"
      }
    }
  })
  .state('app.browse', {
    url: "/browse",
    cache:true,
    views: {
      'menuContent': {
        templateUrl: "templates/browse.html",
        controller: 'BrowseCtrl'
      }
    }
  }).state('app.browseAds', {
    url: "/browseAds?subcatid&subcatName",
    cache:true,
    views: {
      'menuContent': {
        templateUrl: "templates/browseAds.html",
        controller: 'browseAdsCtrl'
      }
    }
  }).state('app.loginwithemail', {
    url: "/login?email",
    views: {
      'menuContent': {
        templateUrl: "templates/login.html",
        controller: 'OAuthCtrl'
      }
    }
  })
  .state('app.login', {
    url: "/login",
    views: {
      'menuContent': {
        templateUrl: "templates/login.html",
        controller: 'OAuthCtrl'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/home');
});
