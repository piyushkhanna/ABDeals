myApp.controller('BrowseCtrl',['$scope','$rootScope','browseService','$sce','$state','$stateParams','$ionicSlideBoxDelegate','$ionicHistory', function($scope,$rootScope,browseService,$sce,$state,$stateParams,$ionicSlideBoxDelegate,$ionicHistory){
	// Do nothing
	$scope.toggleGroup = function(category) {
	    if ($scope.isGroupShown(category)) {
	      $scope.shownGroup = null;
	    } else {
	      $scope.shownGroup = category;
	      if(category.subCategories == undefined)
	      {
	      	$scope.getSubCategories(category);
	      }
	    }

  	};
  	$scope.getSubCategories = function(categoryObject)
  	{
  		 browseService.getSubCategories(categoryObject.id).success(function(results){
	      	 categoryObject.subCategories = results;
	      	 $rootScope.hideLoadingOverlay();	      	 
	      });
  	}
	$scope.isGroupShown = function(category) {

	    return $scope.shownGroup === category;
	};
	$rootScope.showLoadingOverlay();
	browseService.getCategories().success(function(results){
			$scope.categories = results;
			$rootScope.hideLoadingOverlay();
	});


}]);

myApp.service("browseService",function($http,$rootScope){
	//DO nothing
	this.getCategories = function(){
		return $http.get($rootScope.baseServiceURL + "/getCategories.php");
	}
	this.getSubCategories = function(idCategory)
	{
		var data = $.param({
            "id": idCategory
        });
        $rootScope.showLoadingOverlay();
        $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";        
		return $http.post($rootScope.baseServiceURL + "/getSubCategories.php",data);
	}
	
});