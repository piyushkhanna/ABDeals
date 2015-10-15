myApp.controller('HomeCtrl',['$scope','$rootScope','homeService','$sce','$ionicScrollDelegate','$ionicHistory', function($scope,$rootScope,homeService,$sce,$ionicScrollDelegate,$ionicHistory){
	
	$scope.listOfCards = new Array();
	$scope.ionicHistory = $ionicHistory;
	$scope.apiExecuted = false;
	$scope.myLocation = {
    lng : '',
    lat: ''
  }
   
	$scope.moreDataPresent = true;
	$scope.$on('$ionicView.enter', function() {
    	// code to run each time view is entered
    	
    	if(($rootScope.hasLocationChanged || $scope.data == undefined || $rootScope.fields.homeDealFilterChanged || $rootScope.fields.reloadHomeView) && $rootScope.savedLocation != undefined)
    	{	
    		$scope.apiExecuted = false;
    		$rootScope.fields.homeDealFilterChanged = false;
    		$rootScope.fields.reloadHomeView = false;
    		$rootScope.startingPos_Home = 0;	
    		$ionicScrollDelegate.scrollTop();
    		if($rootScope.hasLocationChanged)
    		{
    			 $rootScope.hasLocationChanged = false;
    			 $rootScope.fields.reloadPerfectsView = true;

    		}
    		$rootScope.showLoadingOverlay();
			homeService.getData($rootScope.startingPos_Home,$rootScope.fields.homeSearchText).success(function(results){
			$scope.data = results;
			$scope.apiExecuted = true;
			if(results.reccount > 0)
			{				
				$scope.listOfCards = results[0];				
				$scope.moreDataPresent = true;
				$rootScope.startingPos_Home = $rootScope.startingPos_Home + results[0].length;
			}
			else
			{
				$scope.moreDataPresent = false;
			}
			$scope.returnDisplayText  = returnDisplayText;	
			$rootScope.hideLoadingOverlay();
			$scope.apiExecuted = true;
			if($rootScope.fields.homeIsSearchCleared)
    		{
    			$rootScope.fields.homeIsSearchCleared = false;
    			$("#homeSearchBox").focus();
    		}
		}).error(function(err){ $rootScope.hideLoadingOverlay(); });

		}
	});
	 $scope.clearSearchResults = function(id)
	 {
	    $("#" + id).val("");
	    $rootScope.fields.homeIsSearchCleared = true;
	    $rootScope.fields.homeSearchText = "";
	    $scope.refreshView(true);
	 }
	 $scope.refreshView = function(forceClearText)
	 {
	 	if($rootScope.fields.homeSearchText != "" || forceClearText)
	 	{
		 	$scope.data = undefined;
		    $rootScope.$state.go($rootScope.$state.current,{},{reload:true});
	    }
	 }
	$scope.loadResults = function(){		
		homeService.getData($rootScope.startingPos_Home,$rootScope.fields.homeSearchText).success(function(results){
			if(results.reccount > 0)
			{
				$scope.data = results;
				$scope.moreDataPresent = true;
				$scope.listOfCards = $scope.listOfCards.concat(results[0]);
				$scope.returnDisplayText  = returnDisplayText;	
				$rootScope.startingPos_Home = $rootScope.startingPos_Home + results[0].length;

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
		homeService.markPerfect(dealObj,isUnmark).success(function(){
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
	  		$rootScope.fields.reloadPerfectsView = true;	 
		}).error(function(err){ $rootScope.hideLoadingOverlay(); });		
	}
	
}]);

myApp.service("homeService",function($http,$rootScope){
	this.getData = function(startingPos,srchTxt){
	if(srchTxt == "")
	{		
		if($rootScope.fields.homeDealFilter == 0)
		{
			return $http.get($rootScope.baseServiceURL + "/getAds.php?sortorder=distanta&limit=" + startingPos + "&dev_id=" + $rootScope.dev_id + "&user_id=" + $rootScope.user_id + "&dev_model=" + $rootScope.dev_model + "&dev_platform=" + $rootScope.dev_platform + "&dev_version=" + $rootScope.dev_version + "&ulat=" + $rootScope.lat + "&ulng=" + $rootScope.lng + "&cntrycode=IN&pkms=50");
		}
		else
		{
			return $http.get($rootScope.baseServiceURL + "/getAds.php?sortorder=start_date&limit=" + startingPos + "&dev_id=" + $rootScope.dev_id + "&user_id=" + $rootScope.user_id + "&dev_model=" + $rootScope.dev_model + "&dev_platform=" + $rootScope.dev_platform + "&dev_version=" + $rootScope.dev_version + "&ulat=" + $rootScope.lat + "&ulng=" + $rootScope.lng + "&cntrycode=IN&getnational=n");
		
		}
	}
	else
	{
		if($rootScope.fields.homeDealFilter == 0)
		{
			return $http.get($rootScope.baseServiceURL + "/getAds.php?sortorder=distanta&limit=" + startingPos + "&dev_id=" + $rootScope.dev_id + "&user_id=" + $rootScope.user_id + "&ulat=" + $rootScope.lat + "&ulng=" + $rootScope.lng + "&cntrycode=IN&pkms=50&searchtype=l&searchstr="+ srchTxt);
		}
		else
		{
			return $http.get($rootScope.baseServiceURL + "/getAds.php?sortorder=start_date&limit=" + startingPos + "&dev_id=" + $rootScope.dev_id + "&user_id=" + $rootScope.user_id + "&ulat=" + $rootScope.lat + "&ulng=" + $rootScope.lng + "&cntrycode=IN&getnational=n&searchtype=n&searchstr="+ srchTxt);
		
		}
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