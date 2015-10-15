myApp.controller('app.locationCtrl', function($scope,$rootScope, $ionicModal,$timeout) {
  
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});
  
  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/location.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the location selection modal to close it
  $scope.closeLocationModal = function() {
    $scope.modal.hide();
  };

  // Open the location selection modal
  $scope.chooseLocation = function() {
    $scope.modal.show();
    // initialize google autocomplete textbox for location search
    if(googleSearchBox == null)
    { 
       var input = document.getElementById('txt_LocationLookup');
      googleSearchBox = new google.maps.places.Autocomplete(input,{types: ['geocode']});     
      google.maps.event.addListener(googleSearchBox, 'place_changed', function() {
        var place = googleSearchBox.getPlace();
        var loc =place.geometry.location;
        setLocationBox(loc.A,loc.F);
      });
    }
    $("body").css("pointer-events","auto");

  };
  
  $scope.disableTap = function(){
    container = document.getElementsByClassName('pac-container');
    // disable ionic data tab
    angular.element(container).attr('data-tap-disabled', 'true');
    // leave input field if google-address-entry is selected
    angular.element(container).on("click", function(){
        document.getElementById('txt_LocationLookup').blur();
    });
    $("#btn_currentLocation").parent().hide();
    $("#lbl_LocationMsg").hide();

  };

  $scope.showLocateMeButton = function()
  {
    $("#btn_currentLocation").parent().show();
    $("#lbl_LocationMsg").show();
  }

  // Perform the login action when the user submits the login form
  $scope.useCurrentLocation = function() {
    
  console.log('Fetching Current Location');

  //get User's current location using device coordinates and google maps API
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      // Save coordinates in rootScope and update Local Storage
      setLocationBox(position.coords.latitude,position.coords.longitude);
      
    });
  }
    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLocationModal();
    }, 1000);
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
          for(var i=0; i<len; i++) {
          var ac = results[i];
          if(ac.types.indexOf("locality") >= 0)  city = ac.address_components[0].long_name;
          if(ac.types.indexOf("postal_code") >= 0) postalCode = ac.address_components[0].long_name;         
        }
         $rootScope.savedLocation = city + ", " + postalCode;
         $rootScope.lat = lat;
         $rootScope.lng = lng;

         localStorage.setItem("savedLocation", $rootScope.savedLocation);
         localStorage.setItem("lat",$rootScope.lat);
         localStorage.setItem("lng", $rootScope.lng);

        }else {
          console.log('No results found');
        }
        } else {
         console.log('Geocoder failed due to: ' + status);
        }
    });

  }

});