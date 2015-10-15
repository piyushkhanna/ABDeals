myApp.controller('myPerfectsCtrl',['$scope','$rootScope','myperfectsService','$sce','$ionicScrollDelegate','$ionicHistory', function($scope,$rootScope,myperfectsService,$sce,$ionicScrollDelegate,$ionicHistory){
	$scope.listOfCards = new Array();
	$scope.apiExecuted = false;
	$scope.myLocation = {
    lng : '',
    lat: ''
  }
   
	$scope.$on('$ionicView.enter', function() {
    	// code to run each time view is entered
    	if($rootScope.hasLocationChanged || $scope.data == undefined || $rootScope.fields.myPerfectsDealFilterChanged || $rootScope.fields.reloadPerfectsView)
    	{	
    		$rootScope.startingPos_perfects = 0;
    		$rootScope.fields.myPerfectsDealFilterChanged = false;
    		$rootScope.fields.reloadPerfectsView = false;
    		if($rootScope.hasLocationChanged)
    		{
    			 $rootScope.hasLocationChanged = false;
    			 $rootScope.fields.reloadHomeView = true;

    		}
    		$rootScope.showLoadingOverlay();
			myperfectsService.getData($rootScope.startingPos_perfects).success(function(results){
			$scope.data = results;
			$scope.apiExecuted = true;
			if(results.reccount > 0)
			{				
				$scope.listOfCards = results[0];
				$scope.moreDataPresent = true;
				$rootScope.startingPos_perfects = $rootScope.startingPos_perfects + results[0].length;
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
		myperfectsService.getData($rootScope.startingPos_perfects).success(function(results){
			if(results.reccount > 0)
			{
				$scope.data = results;
				$scope.moreDataPresent = true;
				$scope.listOfCards = $scope.listOfCards.concat(results[0]);
				$scope.returnDisplayText  = returnDisplayText;	
				$rootScope.startingPos_perfects = $rootScope.startingPos_perfects + results[0].length;

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
		myperfectsService.markPerfect(dealObj,isUnmark).success(function(){
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
		}).error(function(err){ $rootScope.hideLoadingOverlay(); });		
	}
	
}]);

myApp.service("myperfectsService",function($http,$rootScope){
	this.getData = function(startingPos){
		
		if($rootScope.fields.myPerfectsDealFilter == 0)
		{

			return $http.get($rootScope.baseServiceURL + "/getAds.php?sortorder=distanta&getperfect=p&limit=" + startingPos +  "&dev_id=" + $rootScope.dev_id + "&user_id=" + $rootScope.user_id + "&searchtype=l" + "&ulat=" + $rootScope.lat + "&ulng=" + $rootScope.lng + "&cntrycode=IN&pkms=50");
		}
		else
		{
			return $http.get($rootScope.baseServiceURL + "/getAds.php?sortorder=distanta&getperfect=p&limit=" + startingPos + "&dev_id=" + $rootScope.dev_id + "&user_id=" + $rootScope.user_id + "&searchtype=n" + "&ulat=" + $rootScope.lat + "&ulng=" + $rootScope.lng + "&cntrycode=IN&pkms=50");
		
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