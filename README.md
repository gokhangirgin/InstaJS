## [InstaJS](https://github.com/gokhangirgin/InstaJS)

InstaJS is an native javascript OAuth2 consumer for Instagram API

### How to use

#### Authentication

InstaJS.js also contains authentication functionality like

```javascript
  var auth = new InstaOAuth({ client_id : "your client_id",
				redirect_uri:encodeURIComponent("http://localhost"),
				scope:"basic+likes", result: function(token){
					console.log(token);
					//API requests through access token.
					var api = new InstaJS({ access_token:token });
					  api.Users.Search({q:"girgin",result:function(d){
      			console.log("Search users");
      			console.log(d);
      		}});
				}});
```

#### API Requests

Once you've got the access token you can make api requests the same of [Endpoints](http://instagram.com/developer/endpoints/)

for example

```javascript
  var api = new InstaJS({ access_token:"token",client_id:"" }); //you can make api requests for some endpoints using just your client_id
  //Search users 'girgin'
  api.Users.Search({q:"girgin",result:function(d){ //
			console.log("Search users");
			console.log(d);
		}});
		//Get Popular media on Instagram
	api.Media.Popular({count:50,result:function(data){
			console.log("Popular media on Instagram");
			console.log(data);
		}});
```

each method has a callback **result** so you need to use the callback in order to take the responses of the api.

#### Structure

```
InstaJS
├── Users
├── Media
├── Relationships
├── Comments
├── Likes
├── Tags
├── Locations
├── Geographies
├── Token

```
