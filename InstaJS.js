var InstaOAuth = function(req){
	var url = location.href;
	if(url.indexOf("access_token") === -1)
	{
		var url = "https://instagram.com/oauth/authorize/?";
		for(var key in req)
		{
			if(req[key] != undefined && req[key] != null)
				url += key + "=" + req[key] + "&";
		}
		url += "response_type=token";
		location.href=url;
	}
	else
	{
		var accessToken = location.href.split("#")[1];
		accessToken = accessToken.split("=")[1];
		req.result(accessToken);
	}
}

var InstaJS = function(token)
{
	if(token.access_token == undefined && token.client_id == undefined)
	{
		alert("Access Token or ClientId must be provided");
		return;
	}
	this.Token = token;
	var self = this;
	this.MakeRequest = function(baseURI,paths,query,method,requiresAT,result)
	{
		if(requiresAT && (self.access_token == undefined || self.access_token == null)){
			console.log("This method requires access token");
			return;
		}
		
		if((self.Token.access_token== undefined || self.Token.access_token==null) && (self.Token.client_id == undefined || self.Token.client_id == null))
		{
			console.log("Access Token or Client Id must be provided to make api requests");
			return;
		}
		
		function createScript(uri,resultId)
		{
			var s = document.createElement('script');
			s.src = uri;
			s.type = 'text/javascript';
			if(document.getElementsByTagName('head').length > 0)
				document.getElementsByTagName('head')[0].appendChild(s);
				
			window["_loaded_" + resultId] = function (response) {
				  result(response);
			};
		}
		
		var uri = baseURI + paths.join("/");
		uri += "?";
		uri += (self.Token.access_token != undefined && self.Token.access_token != null && self.Token.access_token.length > 1) ? "access_token=" + self.Token.access_token : "client_id=" + self.Token.client_id;		
		if (window.XMLHttpRequest)
		  	http=new XMLHttpRequest();
		else
		  http=new ActiveXObject("Microsoft.XMLHTTP");
		  
		var resultId = Math.floor((Math.random()*1000)+1);
		http.onreadystatechange = function() {
		    if(http.readyState == 4) {
		        result(JSON.parse(http.target.response));
		    }
		}
    	if(method == "POST")
    	{
    		postData = "";
    		if(query != undefined && query != null)
    		{
    			for(var key in query)
    			{
    				if(query[key] != undefined && query[key] != null)
    					postData += key + "=" + query[key] + "&"; 
    			}
				uri += "&callback=_loaded_" + resultId;
				createScript(uri,resultId);
    		}
    		http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			http.setRequestHeader("Content-length", postData.length);
			http.setRequestHeader("Connection", "close");
			http.open("POST",uri,true);
			http.send(postData);
    	}
    	else
    	{
    		if(query != undefined && query != null)
    		{
    			for(var key in query)
    			{
    				if(query[key] != undefined && query[key] != null)
    					uri += "&" + key + "=" + query[key]; 
    			}
				uri += "&callback=_loaded_" + resultId;
				createScript(uri,resultId);
    		}
			http.open(method,uri,true);
			//http.send();
		}
		
	};
	this.Users = {
		BaseURL : "https://api.instagram.com/v1/users/",
		Info : function(opts){
			self.MakeRequest(this.BaseURL,[opts.id],null,"GET",false);
		},
		Stream : function(opts){
			self.MakeRequest(this.BaseURL,["self","feed"],{ count:opts.count,min_id:opts.min_id,max_id:opts.max_id },"GET",false,opts.result);
		},
		RecentMedia : function(opts){
			self.MakeRequest(this.BaseURL,[user_id,"self","feed"],{ count:opts.count,min_id:opts.min_id,max_id:opts.max_id,max_timestamp:opts.max_timestamp, min_timestamp:opts.min_timestamp },"GET",false,opts.result);
		},
		Likes : function(opts)
		{
			self.MakeRequest(this.BaseURL,["self","media","liked"],{ count:opts.count,max_like_id:opts.max_like_id },"GET",true,opts.result);
		},
		Search: function(opts)
		{
			self.MakeRequest(this.BaseURL,["search"],{ q:opts.q,count:opts.count },"GET",false,opts.result);
		}
		
	};
	this.Media = {
		BaseURL : "https://api.instagram.com/v1/media/",
		Get: function(opts)
		{
			self.MakeRequest(this.BaseURL,[opts.media_id],null,"GET",false,opts.result);
		},
		Search:function(opts)
		{
			self.MakeRequest(this.BaseURL,["search"],{ lat:opts.lat,lng:opts.lng,distance:opts.distance,min_timestamp:opts.min_timestamp,max_timestamp:opts.max_timestamp },"GET",false,opts.result);
		},
		Popular:function(opts){
			self.MakeRequest(this.BaseURL,["popular"],{ count:opts.count,min_id:opts.min_id,max_id:opts.max_id },"GET",false,opts.result);
		}
	};
	
	this.Relationships = {
		BaseURL : "https://api.instagram.com/v1/users/",
		Follows: function(opts){
		   self.MakeRequest(this.BaseURL,[opts.user_id,"follows"],null,"GET",false,opts.result);
		},
		FollowedBy : function(opts){
			self.MakeRequest(this.BaseURL,[opts.user_id,"followed-by"],null,"GET",false,opts.result);
		},
		RequestedBy : function(){
			self.MakeRequest(this.BaseURL,["self","requested-by"],null,"GET",true);
		},
		Status:function(opts){
			self.MakeRequest(this.BaseURL,[opts.user_id, "relationship"],null,"GET",true,opts.result);
		},
		New:function(opts){
			self.MakeRequest(this.BaseURL,[opts.user_id, "relationship"],{action:action},null,"POST",true,opts.result);
		}
	};
	this.Comments = {
		BaseURL : "https://api.instagram.com/v1/media/",
		Get:function(opts){
			self.MakeRequest(this.BaseURL,[opts.media_id, "comments"],null,"GET",false,opts.result);
		},
		New:function(opts){
			self.MakeRequest(this.BaseURL,[opts.media_id, "comments"],{text:opts.text},"POST",true,opts.result);
		},
		Remove:function(opts){
			self.MakeRequest(this.BaseURL,[opts.media_id, "comments",opts.comment_id],null,"DELETE",true,opts.result);
		}
	};
	this.Likes = {
		BaseURL : "https://api.instagram.com/v1/media/",
		Get:function(opts){
			self.MakeRequest(this.BaseURL,[ opts.media_id, "likes"],null,"GET",false,opts.result);
		},
		New:function(opts){
			self.MakeRequest(this.BaseURL,[opts.media_id, "likes"],null,"POST",true,opts.result);
		},
		Remove: function(media_id){
			self.MakeRequest(this.BaseURL,[opts.media_id, "likes" ],null,"DELETE",true,opts.result);

		}
	};
	
	this.Tags = {
		BaseURL : "https://api.instagram.com/v1/tags/",
		Info:function(opts){
			self.MakeRequest(this.BaseURL,[opts.tag_name],null,"GET",false,opts.result);
		},
		Feeds:function(opts){
			self.MakeRequest(this.BaseURL,[opts.tag_name, "media", "recent"],{max_id:opts.max_id,min_id:opts.min_id},"GET",false,opts.result);
		},
		Search:function(opts){
			self.MakeRequest(this.BaseURL,["search"],{q:opts.q},"GET",false,opts.result);
		}
	};
	this.Locations = {
		BaseURL : "https://api.instagram.com/v1/locations/",
		Get:function(opts){
			self.MakeRequest(this.BaseURL,[opts.location_id],null,"GET",false,opts.result);
		},
		Feeds:function(opts){
			self.MakeRequest(this.BaseURL,[opts.location_id, "media", "recent"],null,"GET",false,opts.result);
		},
		Search:function(opts){
			self.MakeRequest(this.BaseURL,["search"],{lat:opts.lat,lng:opts.lng,distance:opts.distance,foursquare_id:opts.foursquare_id,foursquare_v2_id:opts.foursquare_v2_id},"GET",false,opts.result);
		}
		
	};
	this.Geographies = {
		BaseURL : "https://api.instagram.com/v1/geographies/",
		Media:function(opts){
			self.MakeRequest(this.BaseURL,[opts.geo_id,"media","recent"],{geo_id:opts.geo_id,count:opts.count,min_id:opts.min_id},"GET",false,opts.result);
		}
	};
}
