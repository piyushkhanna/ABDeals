var myApp = angular.module('starter.controllers',['uiGmapgoogle-maps'])


.controller('AppCtrl', function($scope,$rootScope, $ionicModal,$timeout,$state,$ionicHistory,ngFB,promotionsService) {
  
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});


  $scope.$on('changeContent', function (event, newval) {
   $rootScope.adExpiredate = "Expires on " + getReadableDate(newval);
  });

  $ionicModal.fromTemplateUrl('templates/Promotions.html', {
    scope: $scope,
  }).then(function(modal) {
    $scope.promotionsModal = modal;
  });

  $scope.showPromotionModal = function()
  {
    $scope.promotionsModal.show();

  }
   $scope.closePromotionModal = function()
  {
   $scope.promotionsModal.hide();
  }
  
  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/location.html', {
    scope: $scope,
  }).then(function(modal) {
    $scope.modal = modal;
    if($rootScope.savedLocation == undefined || $rootScope.savedLocation == null)
    {
      $scope.chooseLocation();
    }
  });

  // Triggered in the location selection modal to close it
  $scope.closeLocationModal = function() {
    if($rootScope.savedLocation == undefined || $rootScope.savedLocation == null)
    {
       $('#txt_LocationLookup').focus();
    }
    else
    {
      $scope.modal.hide();
    }
  };
  $scope.$on('modal.hidden', function() {
    setTimeout(function(){ $rootScope.isLocationModalVisible = false; },100);
  });
  // Open the location selection modal
  $scope.chooseLocation = function() {
    $scope.modal.show();
    $('#txt_LocationLookup').val("");
    $rootScope.isLocationModalVisible = true;
    // initialize google autocomplete textbox for location search
    if(googleSearchBox == null)
    { 
       var input = document.getElementById('txt_LocationLookup');
      googleSearchBox = new google.maps.places.Autocomplete(input,{types: ['geocode']});     
      google.maps.event.addListener(googleSearchBox, 'place_changed', function() {
        var place = googleSearchBox.getPlace();
        var loc =place.geometry.location;
        setLocationBox(loc.lat(),loc.lng());
      });
    }
    $("body").css("pointer-events","auto");
  };

  // This function is used to fix the google location suggestion tap issue on phones  
  $scope.disableTap = function(){
    if($rootScope.isCordovaapp != undefined)
    {
     document.getElementById('txt_LocationLookup').selectionStart=0;
     document.getElementById('txt_LocationLookup').selectionEnd= document.getElementById('txt_LocationLookup').value.length;
    }
    else
    {
      $("#txt_LocationLookup").select();
    }
    container = document.getElementsByClassName('pac-container');
    // disable ionic data tab
    angular.element(container).attr('data-tap-disabled', 'true');
    // leave input field if google-address-entry is selected
    if($(container).attr("onclick") == undefined)
    {
      angular.element(container).on("click", function(){
          document.getElementById('txt_LocationLookup').blur();
      });
    }
    $("#btn_currentLocation").parent().hide();
    $("#lbl_LocationMsg").hide();
    $("#locationMessage").hide();


  };

  $scope.showLocateMeButton = function()
  {
    $("#btn_currentLocation").parent().show();
    $("#lbl_LocationMsg").show();
    $("#locationMessage").show();
  }
  
  $scope.clearTextBox = function()
  {
    setTimeout(function(){
    $('#txt_LocationLookup').val('').focus(); 
    cordova.plugins.Keyboard.show();
  },100);
    event.stopPropagation();
  }

  // Perform the login action when the user submits the login form
  $scope.useCurrentLocation = function() {
  console.log('Fetching Current Location');

  //get User's current location using device coordinates and google maps API
  if(navigator.geolocation) {
      
      var positionOptions = {
        enableHighAccuracy: true,
        timeout: 60 * 1000,
        maxAge:0
      };
      navigator.geolocation.getCurrentPosition(function(position) {
      // Save coordinates in rootScope and update Local Storage
      setLocationBox(position.coords.latitude,position.coords.longitude);      
      },function(e){alert(e.message);},positionOptions);
  }
  else
  {
    alert("Sorry, Cannot get your current location. Please use the textbox above to search your location");
  }
}

  function setLocationBox(lat,lng)
  {
   
     var pos = new google.maps.LatLng(lat,lng);
     var geocoder = new google.maps.Geocoder();
    
     geocoder.geocode({'latLng': pos}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
        if (results[1]) {
          var len = results.length;
          var city = "";
          var postalCode = "";
          var countryCode = "";
          var varType='';
          var country = '';
        //alert("0:" + results[0].formatted_address + "<BR>" + "1:" + results[1].formatted_address + "<BR>" + "2:" + results[2].formatted_address + "<BR>" + "3:" + results[3].formatted_address + "<BR>" + "4:" + results[4].formatted_address + "<BR>" + "5:" + results[5].formatted_address + "<BR>" + "6:" + results[6].formatted_address + "<BR>" + "8:" + results[0].address_components[2].long_name + ", " + results[0].address_components[5].long_name);
        for (var k = 0; k < results.length; k++) {
        for (var i = 0; i < results[k].address_components.length; i++) {
        for (var j = 0; j < results[k].address_components[i].types.length; j++) {
          varType=varType+'-'+results[k].address_components[i].types[j];
          }
          if (varType.indexOf("locality") >= 0 && varType.indexOf("colloquial_area") == -1) {
            locality = results[k].address_components[i].long_name;
          }
          if (varType.indexOf("country") >= 0) {
            country = results[k].address_components[i].long_name;
              countryCode = results[k].address_components[i].short_name;
          }
          if (varType.indexOf("postal_code") >= 0) {
            postal = results[k].address_components[i].long_name;
          }
          varType = '';
         }
        }

        if($rootScope.savedLocation == undefined)
        {
          sendInitRecs(lat,lng,countryCode,country,$rootScope.dev_id,$rootScope.dev_model,$rootScope.dev_platform,$rootScope.dev_version,$rootScope.baseServiceURL +"/checkuser.php");
        }

         $rootScope.savedLocation = locality + ', ' + postal;
         $rootScope.lat = lat;
         $rootScope.lng = lng;
         $rootScope.countryCode = countryCode;
         $rootScope.country = country;

         localStorage.setItem("savedLocation", $rootScope.savedLocation);
         localStorage.setItem("lat",$rootScope.lat);
         localStorage.setItem("lng", $rootScope.lng);
         localStorage.setItem("countryCode", $rootScope.countryCode);
         localStorage.setItem("country", $rootScope.country);

        }else {
          console.log('No results found');
        }
        } else {
         console.log('Geocoder failed due to: ' + status);
        }
        // Simulate a login delay. Remove this and replace with your login
        // code if using a login system
        $timeout(function() {

          $rootScope.hasLocationChanged = true;
          $state.go($state.current, {}, {reload: true});
          $scope.closeLocationModal();
           promotionsService.getPromotions().success(function(result){
            alert(result.promotionid);
            if(result != undefined && result.promotionid != undefined)
            {
                $rootScope.promotionObject = new Object();
                $rootScope.promotionObject.heading = result.heading;
                $rootScope.promotionObject.message = result.message;
                $rootScope.promotionObject.otherbuttontext = result.otherbuttontext;
                $rootScope.promotionObject.prmotion = result.promotion;
                $rootScope.promotionObject.skipbutton = result.skipbutton;                 
            }
            $timeout(function(){ $scope.showPromotionModal(); },1000);
          });

        }, 100);

       
    });


  }

})

.controller('PlaylistsCtrl', function($scope) {
  $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
})

.controller('PlaylistCtrl', function($scope, $stateParams) {
})
.controller('mapsCtrl', function($scope, $stateParams) {
    //$scope.$apply is needed to trigger the digest cycle when the geolocation arrives and to update all the watchers
    $scope.myLocation = new Object();
    $scope.dispadd = $stateParams.dispadd;
    $scope.myLocation.lng = $stateParams.glng;
    $scope.myLocation.lat = $stateParams.glat;

    $scope.map = {
      center: {
        latitude: $scope.myLocation.lat,
        longitude: $scope.myLocation.lng
      },
      zoom: 14,
      pan: 1
    };

    $scope.marker = {
      id: 0,
      coords: {
        latitude: $scope.myLocation.lat,
        longitude: $scope.myLocation.lng
      }
    }; 
     
    $scope.marker.options = {
      draggable: false,
      labelAnchor: "80 120",
      labelClass: "marker-labels"
    };  
    
    $(".angular-google-map-container ").height($(window).height()-40);
    

});
myApp.service("promotionsService",function($http,$rootScope){
  this.getPromotions = function(){
    return $http.get($rootScope.baseServiceURL + "/checkpromo.php?&dev_id=11" + $rootScope.dev_id + "&dev_model=" + $rootScope.dev_model + "&dev_platform=" + $rootScope.dev_platform + "&dev_version=" + $rootScope.dev_version + "&ulat=" + $rootScope.lat + "&ulng=" + $rootScope.lng + "&cntrycode=IN&cuntry=" + $rootScope.country + "&preslocn=575013");
  }
});
myApp.filter('escape', function() {
  return window.encodeURIComponent;
});