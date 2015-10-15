myApp.directive("cardsList",function(){
	return{
		restrict: 'AE',
    	replace: true,
    	templateUrl: "templates/listOfDeals.html"
	}
});
myApp.directive('ngEnter', function() {
        return function(scope, element, attrs) {
            element.bind("keydown keypress", function(event) {
                if(event.which === 13) {
                        scope.$apply(function(){
                                scope.$eval(attrs.ngEnter);
                        });
                        
                        event.preventDefault();
                }
            });
        };
});
myApp.directive('gMap', function() {
        return {
	        restrict: 'AE',
	    	templateURL: "templates/googleMap.html",
	    	controller: 'mapsCtrl',
	    	scope: {
	    		glng: '@glng',
	    		glat: '@glat'
	    	}
        }
});
