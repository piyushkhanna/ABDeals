myApp.controller('DetailsCtrl',['$scope','$rootScope','detailsService','$sce','$state','$stateParams','$ionicSlideBoxDelegate','$ionicHistory', function($scope,$rootScope,detailsService,$sce,$state,$stateParams,$ionicSlideBoxDelegate,$ionicHistory){
	$rootScope.adExpiredate = "";
	$scope.$on('$ionicView.beforeEnter', function() {
		$scope.adData = $rootScope.$state.params.adObject;
	});	
	$rootScope.showLoadingOverlay();
	$(".item-avatar").parent().hide();
	detailsService.getAdData($stateParams.ad_id,$stateParams.location_id).success(function(result){
		var adObj =  $stateParams.adObject;
		$scope.priceTag = returnDisplayText(adObj.adverttype,adObj.adverttypeval1,adObj.adverttypeval2,adObj.adverttypeval3,adObj.ccode,adObj.csymbol);
		$scope.ad = result;

		// broadcast the change in expire date on subheader in menu.html
		$scope.$emit('changeContent',  result.end_date);
		if(result[0] != undefined)
		{
			$scope.imagesMedium = result[0];
			$ionicSlideBoxDelegate.update();
		}
		// Add location to Scope
		$scope.myLocation = new Object();
	    $scope.myLocation.lng = result.avail_lng;
	    $scope.myLocation.lat = result.avail_lat;

	    $scope.map = {
	      center: {
	        latitude: $scope.myLocation.lat,
	        longitude: $scope.myLocation.lng
	      },
	      zoom: 15,
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

	    $scope.markPerfect = function(dealObj,isUnmark)
		{
			detailsService.markPerfect(dealObj,isUnmark).success(function(){
				if(isUnmark)
				{
					dealObj.myperfect = '0';
			  		dealObj.perfect = Number(dealObj.perfect) -1;
				}
				else	
				{
					dealObj.myperfect = '1';
			  		dealObj.perfect = Number(dealObj.perfect) + 1;
		  		}
		  		if($ionicHistory.backView().stateName == "app.home")
		  		{
			  		$rootScope.fields.reloadHomeView = false;
			  		$rootScope.fields.reloadPerfectsView = true;
			  		$rootScope.fields.reloadBrowseAdsView = true;
		  		}
		  		else if($ionicHistory.backView().stateName == "app.myperfects")
		  		{
		  			$rootScope.fields.reloadHomeView = true;
		  			$rootScope.fields.reloadPerfectsView = false;
		  			$rootScope.fields.reloadBrowseAdsView = true;
		  		}
		  		else if($ionicHistory.backView().stateName == "app.browseAds")
		  		{
		  			$rootScope.fields.reloadHomeView = true;
		  			$rootScope.fields.reloadPerfectsView = true;
		  			$rootScope.fields.reloadBrowseAdsView = false;
		  		}
		  		



			}).error(function(err){ $rootScope.hideLoadingOverlay(); });	
			
		}

		$rootScope.hideLoadingOverlay();
		$(".item-avatar").parent().show();
		// End Location addition to scope

	}).error(function(err){ $rootScope.hideLoadingOverlay(); });
	
}]);

myApp.service("detailsService",function($http,$rootScope){
	this.getAdData = function(ad_id,location_id){		
		return $http.get($rootScope.baseServiceURL + "/getAds.php?ad_id=" + ad_id + "&location_id=" + location_id);
	}
	this.markPerfect = function(dealObj,isUnmark)
	{
		if(isUnmark)
		{
			return $http.get($rootScope.baseServiceURL + "/getAds.php?ad_id=" + dealObj.ad_id + "&location_id=" + dealObj.location_id +  "&perfect=n&dev_id=" + $rootScope.dev_id + "&user_id=" + $rootScope.user_id);
		}
		else
		{
			return $http.get($rootScope.baseServiceURL + "/getAds.php?ad_id=" + dealObj.ad_id + "&location_id=" + dealObj.location_id +  "&perfect=p&dev_id=" + $rootScope.dev_id + "&user_id=" + $rootScope.user_id);
		}

	}
});