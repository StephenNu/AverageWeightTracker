function refreshAuthDisplay() {
    var isLoggedIn = client.currentUser !== null;
    $("#logged-in").toggle(isLoggedIn);
    $("#logged-out").toggle(!isLoggedIn);
    $("#logged-in-b").toggle(isLoggedIn);
    $("#logged-out-b").toggle(!isLoggedIn);

}
var code;
var authapi = {
	    authorize: function(options) {
	    	var deferred = $.Deferred();
	    	var authUrl = 'https://accounts.google.com/o/oauth2/auth?' + $.param({
	    	//var authUrl = 'https://www.facebook.com/dialog/oauth?' + $.param({
	    	    client_id: options.client_id,
	    	    redirect_uri: options.redirect_uri,
	    	    response_type: 'code',
	    	    scope: options.scope

	    	});

	    	var authWindow = window.open(authUrl, '_blank', 'location=no,toolbar=no');
	    	$(authWindow).on('loadstart', function(e) {
	    		  var url = e.originalEvent.url;
	    		  code = /\?code=(.+)$/.exec(url);
	    		  var error = /\?error=(.+)$/.exec(url);

	    		  if (code || error) {
	    		    authWindow.close();
	    		  }

	    		  //TODO - exchange code for access token...
	    		  if (code) {
	    			    $.post('https://accounts.google.com/o/oauth2/token', {
	    			    //$.post('https://graph.facebook.com/oauth/access_token?', {
	    			    code: code[1],
	    			    client_id: options.client_id,
	    			    client_secret: options.client_secret,
	    			    redirect_uri: options.redirect_uri,
	    			    grant_type: 'authorization_code'
	    			  }).done(function(data) {
	    			    deferred.resolve(data);
	    			  }).fail(function(response) {
	    			    deferred.reject(response.responseJSON);
	    			  });
	    			} else if (error) {
	    			  deferred.reject({
	    			    error: error[1]
	    			  });
	    			}
	    		});

	        return deferred.promise();
	    }
};
function getUserId(token)
{
	var req = new XMLHttpRequest();
	req.open('GET', 'https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=' + token, true);

	req.onreadystatechange = function (e) {
	  if (req.readyState == 4) {
	     if(req.status == 200){
	    	 var payloadString = e.target.responseText;
	    	 var payload = $.parseJSON(payloadString);
	    	 client.currentUser = { 'accessTokens' : { "google" : token }, 'level' : 'authenticated', 'userId' : payload.user_id };
	    	 sync();
	    	 refreshAuthDisplay();
	   }
	  else if(req.status == 400) {
	        alert('There was an error processing the token.')
	    }
	    else {
	      alert('something else other than 200 was returned')
	    }
	  }
	};
	req.send(null);
}
function find(str)
{
	for (var i = 0; i < str.length; i++)
	{
		if (str[i] == ' ' || str[i] == '\n')//'ɭ')
			{
				return str.substring((i-5 >= 0) ? i-5 : 0, (i+5 < str.length) ? i+5 : i);
			}
	}
	return "none";
}
var token;
function logIn() {

	//var popup = window.open("https://averageweighttracker.azure-mobile.net/login/facebook"); // option token if already gotten
	//console.log(popup.location);
	//repeat(popup);
	var $loginStatus = $('#logged-out p');
	authapi.authorize({
	      client_id: '316339286311-ihvnohodocdnno3li452ii8guftegjqh.apps.googleusercontent.com', // google
		  //client_id: '654790161272852', // facebook
	      client_secret: 'IgU62BqeOPVrQCfw2RRUf4C7', // google
		  //client_secret: 'f39bddd662fa9ee355831d8c0e6c4c6f', // facebook
	      redirect_uri: 'https://localhost',
	      //redirect_uri: 'https://averageweighttracker.azure-mobile.net/login/google',
	      scope: 'openid profile' // google
	      //scope: 'manage_pages' // facebook
	    }).done(function(data) {
	    	//console.log(data.length);
	    	token = data.access_token;
	    	getUserId(token);
	    	
	    	//var token = data.access_token;
	    	//var token = data.substring(13);
	      //$loginStatus.html('code ' + code[1] +'++++++!!!!!!<br />Access Token: ' + token + '++++++!!!!!!');
	      //client.login("google", { "id_token" : token,"code" : code[1],  "access_token" : token} ).then(function() { refreshAuthDisplay(); console.log("logged in"); }, function(error) { alert(error); })
	    }).fail(function(data) {
	      $loginStatus.html(data.error);
	    });
	
	//client.login("windowsazureactivedirectory").then(refreshAuthDisplay, function (error) {
    //    alert(error);
    //});
}
function revokeToken(token)
{
	var req = new XMLHttpRequest();
	req.open('GET', 'https://accounts.google.com/o/oauth2/revoke?token=' + token, true);

	req.onreadystatechange = function (e) {
	  if (req.readyState == 4) {
	     if(req.status == 200){
	    	 console.log("revoked token");
	   }
	  else if(req.status == 400) {
	        alert('There was an error processing the token.')
	    }
	    else {
	      alert('something else other than 200 was returned')
	    }
	  }
	};
	req.send(null);
}
function logOut() {
	revokeToken(token);
    client.logout();
    client.currentUser = null;
    refreshAuthDisplay();
}

