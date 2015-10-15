myApp.controller('browseAdsCtrl',['$scope','$rootScope','browseAdsService','$sce','$ionicScrollDelegate','$ionicHistory','$state','$stateParams', function($scope,$rootScope,browseAdsService,$sce,$ionicScrollDelegate,$ionicHistory,$state,$stateParams){
	$scope.listOfCards = new Array();
	$scope.apiExecuted = false;
	$scope.myLocation = {
    lng : '',
    lat: ''
  }
   
	$scope.$on('$ionicView.enter', function() {
    	// code to run each time view is entered
    	$scope.subCategoryId =  $stateParams.subcatid;
    	$scope.subCategoryName = $stateParams.subcatName;

    	if($rootScope.hasLocationChanged || $scope.data == undefined || $rootScope.fields.browseAdsDealFilterChanged || $rootScope.fields.reloadBrowseAdsView || $scope.browseAdsDealFilterValue != Number($rootScope.fields.browseAdsDealFilter))
    	{	
    		$rootScope.startingPos_browseAds = 0;
    		$scope.data = undefined;
    		$rootScope.fields.browseAdsDealFilterChanged = false;
    		$rootScope.fields.reloadBrowseAdsView = false;
    		if($rootScope.hasLocationChanged)
    		{
    			 $rootScope.hasLocationChanged = false;
    			 $rootScope.fields.reloadHomeView = true;
    			 $rootScope.fields.reloadPerfectsView = true;

    		}
    		$rootScope.showLoadingOverlay();
			browseAdsService.getData($rootScope.startingPos_browseAds,$scope.subCategoryId).success(function(results){
			$scope.data = results;
			$scope.apiExecuted = true;
			$scope.browseAdsDealFilterValue = 0;
			$scope.browseAdsDealFilterValue += Number($rootScope.fields.browseAdsDealFilter);
			if(results.reccount > 0)
			{				
				$scope.listOfCards = results[0];
				$scope.moreDataPresent = true;
				$rootScope.startingPos_browseAds = $rootScope.startingPos_browseAds + results[0].length;
			}
			else
			{
				$scope.moreDataPresent = false;
			}
			$scope.returnDisplayText  = returnDisplayText;	
			$rootScope.hideLoadingOverlay();

		}).error(function(err){ $rootScope.hideLoadingOverlay(); });

		}
	});
	 $scope.refreshView = function()
	 {
	 	$scope.data = undefined;
	    $rootScope.$state.go($rootScope.$state.current,{},{reload:true});
	 }
	$scope.loadResults = function(){		
		browseAdsService.getData($rootScope.startingPos_browseAds,$scope.subCategoryId).success(function(results){
			if(results.reccount > 0)
			{
				$scope.data = results;
				$scope.moreDataPresent = true;
				$scope.listOfCards = $scope.listOfCards.concat(results[0]);
				$scope.returnDisplayText  = returnDisplayText;	
				$rootScope.startingPos_browseAds = $rootScope.startingPos_browseAds + results[0].length;

			}	
			else
			{
				$scope.moreDataPresent = false;
			}
			$scope.$broadcast('scroll.infiniteScrollComplete');
		}).error(function(err){ $rootScope.hideLoadingOverlay(); });
	}
	$scope.moreDataCanBeLoaded = function()
	{
		return $scope.moreDataPresent;
	}
	$scope.markPerfect = function(dealObj,isUnmark)
	{
		browseAdsService.markPerfect(dealObj,isUnmark).success(function(){
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
	  		$rootScope.fields.reloadHomeView = true;
	  		$rootScope.fields.reloadPerfectsView = true;
	  		
		}).error(function(err){ $rootScope.hideLoadingOverlay(); });		
	}
	
}]);

myApp.service("browseAdsService",function($http,$rootScope){
	this.getData = function(startingPos,subCat){
		
		if($rootScope.fields.browseAdsDealFilter == 0)
		{

			return $http.get($rootScope.baseServiceURL + "/getAds.php?sortorder=start_date&subcat=" + subCat + "&limit=" + startingPos +  "&dev_id=" + $rootScope.dev_id + "&user_id=" + $rootScope.user_id + "&searchtype=l" + "&ulat=" + $rootScope.lat + "&ulng=" + $rootScope.lng + "&cntrycode=IN&pkms=50");

		}
		else
		{
			return $http.get($rootScope.baseServiceURL + "/getAds.php?sortorder=start_date&subcat=" + subCat + "&limit=" + startingPos + "&dev_id=" + $rootScope.dev_id + "&user_id=" + $rootScope.user_id + "&searchtype=n" + "&ulat=" + $rootScope.lat + "&ulng=" + $rootScope.lng + "&cntrycode=IN&pkms=50");
		
		}
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