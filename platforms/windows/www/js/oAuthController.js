myApp.controller("OAuthCtrl",['$scope', '$cordovaOauth','ngFB','$stateParams',function($scope, $cordovaOauth,ngFB,$stateParams) {

    if($stateParams.email != undefined)
    {
       alert($stateParams.email);
    }

    $scope.fbLogin = function () {
    ngFB.login({scope: 'email'}).then(
        function (response) {
            if (response.status === 'connected') {
                console.log('Facebook login succeeded');
                 alert("success");
                
            } else {
                alert('Facebook login failed');
            }
        });
    }
    $scope.loginfb = function(){ 
        $cordovaOauth.facebook("1635481623363200", ["email"]).then(function(result) {
          alert("success");
        }, function(error) {
            alert("There was a problem signing in!  See the console for logs");
            console.log(error);
        });
    }
    $scope.fbredirect = function (){
        var url = "https://fbredirect.azurewebsites.net/default.aspx?return=" + encodeURIComponent(window.location.href);
        alert(url);
        window.location.href = url;
        return false;
    }


}]);