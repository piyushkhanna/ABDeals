function loginGoogle() 
{
	localStorage['eml.prevaccessedpage_n']='login.html';
	localStorage['eml.prevaccessedpage_l']='login.html';
	function getJsonFromUrl(urlString) {
		var parameterQuery = urlString.split("?");
		var data = parameterQuery[1].split("&");
		var result = {};
		for(var i=0; i<data.length; i++) {
		var item = data[i].split("=");
		result[item[0]] = decodeURIComponent(item[1]);
		}
		return result;
	}
	
    //var $loginButton = $('#googlelogin');
    //var $loginStatus = $('#googleloginstatus');
	var authWindow;
	$('#loginstatus').html('');
	$('#fbloginstatus').html('');
    $('#googlelogin').click(function() {
	chkConn = checkConnection();
	if(chkConn=="offline")
	{
		$('#loginstatus').html('Internet connectivity issue. Try again');
	}
	else
	{
		$('#loginstatus').html('');
		$('#googlelogin').css("display", "none");
		$('#fbLogin').css("display", "none");
		$('#loginwait').css("display", "");
		googleapi.authorize({
           client_id: '636345154127-jlqmo58n34ocgttoif8cjupgop6l9gbp.apps.googleusercontent.com',
		  client_secret: 'gLA_wAdOTsls1gFh3FRSH6NO',
		  redirect_uri: 'http://localhost',
		  scope: 'https://www.googleapis.com/auth/userinfo.profile  https://www.googleapis.com/auth/userinfo.email',
		}).done(function(){
		googleapi.getToken({
            client_id: this.client_id,
            client_secret: this.client_secret
        }).then(function(data) {
            //Pass the token to the API call and return a new promise object
			return googleapi.userInfo({ access_token: data.access_token });
        }).done(function(user) {
            //Display a greeting if the API call was successful
            //$('#greet h1').html('Hello ' + user.name + '!');
			authWindow.close();
			localStorage["googleaccessed"]="y";
			var str=user.name;
			var fname = str.substr(0,str.indexOf(' '));
			var lname = str.substr(str.indexOf(' ')+1); 
			if(assignLogin("google", user.email, fname, lname))
			{
				if(localStorage["eml.lastaccessedpage"] == "myinterests.html")
				{
					location.href="myinterests.html";
				}
				else
				{
					window.history.back();
				}
			}
        }).fail(function() {
            //If getting the token fails, or the token has been
            //revoked, show the login view.
            $('#loginstatus').html('Login Failed. Please try again!!!');
        });
	}).fail(function(data) {
            $('#loginstatus').html(data.error);
        });
	}
    });

	var googleapi = {
    authorize: function(options) {
        var deferred = $.Deferred();

        //Build the OAuth consent page URL
        var authUrl = 'https://accounts.google.com/o/oauth2/auth?' + $.param({
            client_id: options.client_id,
            redirect_uri: options.redirect_uri,
            response_type: 'code',
            scope: options.scope
        });
		//Open the OAuth consent page in the InAppBrowser
		if (localStorage.getItem("googleaccessed") === null || localStorage["googleaccessed"]=="n") {
		authWindow = window.open(authUrl, '_blank', 'location=no,toolbar=no');
		}
		else
		{
		authWindow = window.open(authUrl, '_blank', 'hidden=yes');
		}
        //The recommendation is to use the redirect_uri "urn:ietf:wg:oauth:2.0:oob"
        //which sets the authorization code in the browser's title. However, we can't
        //access the title of the InAppBrowser.
        //
        //Instead, we pass a bogus redirect_uri of "http://localhost", which means the
        //authorization code will get set in the url. We can access the url in the
        //loadstart and loadstop events. So if we bind the loadstart event, we can
        //find the authorization code and close the InAppBrowser after the user
        //has granted us access to their data.
        $(authWindow).on('loadstart', function(e) { 
            var url = e.originalEvent.url;
            var code = /\?code=(.+)$/.exec(url);
            var error = /\?error=(.+)$/.exec(url);
			if (code || error) {
                //Always close the browser when match is found
				authWindow.close();
		    }

            if (code) {
                //Exchange the authorization code for an access token
                $.post('https://accounts.google.com/o/oauth2/token', {
                    code: code[1],
                    client_id: options.client_id,
                    client_secret: options.client_secret,
                    redirect_uri: options.redirect_uri,
                    grant_type: 'authorization_code'
                }).done(function(data) { 
					googleapi.setToken(data);
                    deferred.resolve(data);
                }).fail(function(response) { 
                    deferred.reject(response.responseJSON);
                });
            } else if (error) { 
                //The user denied access to the app
                deferred.reject({
                    error: error[1]
                });
            }
			setTimeout(function(){
			if(localStorage["googleaccessed"]=="y")
			{
				$('#googlelogin').css("display", "");
				$('#fbLogin').css("display", "");
				$('#loginwait').css("display", "none");
				$('#loginstatus').html('Login Failed. Please try again!!!');
			}}, 8000);
        });
		
        return deferred.promise();
    },
    getToken: function(options) {
        var deferred = $.Deferred();
	if (new Date().getTime() < localStorage.expires_at) {
            deferred.resolve({
                access_token: localStorage.access_token
            });
        } 
		/*else if (localStorage.refresh_token) {
            $.post('https://accounts.google.com/o/oauth2/token', {
                refresh_token: localStorage.refresh_token,
                client_id: options.client_id,
                client_secret: options.client_secret,
                grant_type: 'refresh_token'
            }).done(function(data) {alert("gettoken"+data);
				 googleapi.setToken(data);
                deferred.resolve(data);
            }).fail(function(response) {
                deferred.reject(response.responseJSON);
            });
        } */
		else {
            deferred.reject();
        }
        return deferred.promise();
    },
	setToken: function(data) {
        //Cache the token
        localStorage.access_token = data.access_token;
        //Cache the refresh token, if there is one
        //localStorage.refresh_token = data.refresh_token || localStorage.refresh_token;
        //Figure out when the token will expire by using the current
        //time, plus the valid time (in seconds), minus a 1 minute buffer
        var expiresAt = new Date().getTime() + parseInt(data.expires_in, 10) * 1000 - 60000;
        localStorage.expires_at = expiresAt;
    },
    userInfo: function(options) {
        return $.getJSON('https://www.googleapis.com/oauth2/v1/userinfo', options);
    }
}

