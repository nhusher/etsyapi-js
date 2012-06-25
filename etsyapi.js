(function() {
	var ETSY_URL = "http://beta-api.etsy.com/v1/", SUFFIX = ".js", c = 0, readyQueue = [], isReady = false;
	
	var jsonp = function(url, params, callback, callbackParam) {
		var functionName = "JSONP_FUNC_" + (c++);
		callbackParam = callbackParam || "callback";
		
		window[functionName] = function(data) {
			var environment = {
				"url": url,
				"parameters": params
			};
			
			callback.call(environment, data);
			
			delete window[functionName];
			var el = document.getElementById(functionName);
			el.parentNode.removeChild(el);
		};

		var parameters = [];
		parameters[parameters.length] = callbackParam + '=' + functionName;

		if(params) {
			for(var param in params) {
				parameters[parameters.length] = param + "=" + encodeURIComponent(params[param]);
			}
		}
		
		parameters = parameters.join('&');
		
		var el = document.createElement('script');
		el.id = functionName;
		el.type = 'text/javascript';
		el.src = url + "?" + parameters;
		
		ready(function() { document.body.appendChild(el) });
	};
	
	var ready = function(f, context) {
		context = context || window;
		if(isReady) {
			f.call(context);
		} else {
			readyQueue[readyQueue.length] = { fn: f, c: context };
		}
	};
	
	var handleReadyQueue = function() {
		for(var i = 0, l = readyQueue.length; i < l; i++) {
			readyQueue[i].fn.call(readyQueue[i].fn.c);
		}
	};

	// lifted from jQuery 1.3 source code.
	if ( document.addEventListener ) {
		document.addEventListener( "DOMContentLoaded", function(){
			document.removeEventListener( "DOMContentLoaded", arguments.callee, false );
			handleReadyQueue();
		}, false );
	} else if ( document.attachEvent ) {
		document.attachEvent("onreadystatechange", function(){
			if ( document.readyState === "complete" ) {
				document.detachEvent( "onreadystatechange", arguments.callee );
				handleReadyQueue();
			}
		});
		if ( document.documentElement.doScroll && window == window.top ) (function(){
			if ( isReady ) return;
			try {
				document.documentElement.doScroll("left");
			} catch( error ) {
				setTimeout( arguments.callee, 0 );
				return;
			}
			handleReadyQueue();
		})();
	}
	
	Etsy = function(apiKey) {
		this._apiKey = apiKey;
	};	
	
	Etsy.prototype = {
		_apiKey: null,
		_detailLevel: "low",
		api: function(p, o, c, useDetailLevel) {
			var url = ETSY_URL + p + SUFFIX;
			
			if(!o) { o = {} };
			o.api_key = this._apiKey;
			
			if(!o.detail_level && useDetailLevel !== false) {
				o.detail_level = this._detailLevel;
			}
			
			if(typeof c === "function") {
				var callback = { success: c, failure: c };
			} else if(typeof c === "object") {
				if(!c.success) {
					throw "Callback object missing success function.";
				}
				if(!c.failure) {
					throw "Callback object missing failure function.";
				}
				var callback = c;
			}
			
			jsonp(url, o, function(data) {
				if(data.status !== 200) {
					callback.failure.call(this, data);
				} else {
					callback.success.call(this, data);
				}
			});			
		},
		setDetailLevel: function(detailLevel) {
			if((/^low|medium|high$/).test(detailLevel)) {
				this._detailLevel = detailLevel;
			} else {
				throw "Invalid detail level.";
			}
		},
		/*
		=====================================================================
		User Commands
		=====================================================================
		*/
		user_getUserDetails: function(o,c) {
			if(!o.user_id) { throw "user_id null or undefined." }
			var path = 'users/' + o.user_id;
			delete o.user_id;
			
			this.api(path, o, c);
		},
		user_getUsersByName: function(o,c) {
			if(!o.search_name) { throw "search_name null or undefined." }
			var path = 'users/keywords/' + o.search_name;
			delete o.search_name;
			
			this.api(path, o, c);
		},
		/*
		=====================================================================
		Shop Commands
		=====================================================================
		*/
		shop_getShopDetails: function(o,c) {
			if(!o.user_id) { throw "user_id null or undefined."; }
			var path = "shops/" + o.user_id;
			delete o.user_id;
			
			this.api(path, o, c);
		},
		shop_getShopListings: function(o,c) {
			if(!o.user_id) { throw "user_id null or undefined."; }
			var path = "shops/" + o.user_id + "/listings";
			delete o.user_id;
			
			this.api(path, o, c)
		},
		shop_getFeaturedDetails: function(o,c) {
			if(!o.user_id) { throw "user_id null or undefined."; }
			var path = "shops/" + o.user_id + "/listings/featured";
			delete o.user_id;
			
			this.api(path, o, c)
		},
		shop_getFeaturedSellers: function(o,c) {
			var path = "shops/featured";			
			this.api(path, o, c)
		},
		shop_getShopsByName: function(o,c) {
			if(!o.search_name) { throw "search_name null or undefined."; }
			var path = "shops/keywords/" + o.search_name;
			delete o.search_name;
			
			this.api(path, o, c);
		},
		/*
		=====================================================================
		Listing Commands
		=====================================================================
		*/
		listing_getListingDetails: function(o,c) {
			if(!o.listing_id) { throw "listing_id null or undefined."; }
			var path = "listings/" + o.listing_id;
			delete o.listing_id;
			
			this.api(path, o, c);
		},
		listing_getAllListings: function(o,c) {
			var path = "listings/all";
			this.api(path, o, c);			
		},
		listing_getListingsByCategory: function(o,c) {
			if(!o.category) { throw "category null or undefined."; }
			var path = "listings/category/" + o.category;
			delete o.category;
			
			this.api(path, o, c);
		},
		listing_getListingsByColor: function(o,c) {
			if(!o.color) { throw "color null or undefined."; }
			if(jQuery.isArray(o.color)) {
				o.color = o.color.join(';');
			} else if(o.color.charAt(0) == '#') {
				o.color = o.color.substring(1);
			}

			var path = "listings/color/" + o.color;
			delete o.color;
			
			this.api(path, o, c);			
		},
		listing_getListingsByColorAndKeywords: function(o,c) {
			if(!o.color) { throw "color null or undefined."; }
			if(!o.search_terms) { throw "search_terms null or undefined."; }
			if(jQuery.isArray(o.color)) {
				o.color = o.color.join(';');
			} else if(o.color.charAt(0) == '#') {
				o.color = o.color.substring(1);
			}
			if(jQuery.isArray(o.search_terms)) {
				o.search_terms = o.search_terms.join(';');
			}
			
			var path = "listings/color/" + o.color;
			path += "/keywords/" + o.search_terms;
			delete o.color;
			delete o.search_terms;
			
			this.api(path, o, c);			
		},
		listing_getFrontFeaturedListings: function(o,c) {
			var path = "listings/featured/front";
			this.api(path, o, c);
		},
		listing_getListingsByKeyword: function(o,c) {
			if(!o.search_terms) { throw "search_terms null or undefined."; }
			if(jQuery.isArray(o.search_terms)) {
				o.search_terms = o.search_terms.join(';');
			}
			var path = "listings/keywords/" + o.search_terms;
			delete o.search_terms;
			
			this.api(path, o, c);
		},
		listing_getListingsByMaterials: function(o,c) {
			if(!o.materials) { throw "materials null or undefined."; }
			if(jQuery.isArray(o.materials)) {
				o.materials = o.materials.join(';');
			}
			var path = "listings/materials/" + o.materials;
			delete o.materials;
			
			this.api(path, o, c);
		},
		listing_getListingsByTags: function(o,c) {
			if(!o.tags) { throw "tags null or undefined."; }
			if(jQuery.isArray(o.tags)) {
				o.tags = o.tags.join(';');
			}
			var path = "listings/tags/" + o.tags;
			delete o.tags;
			
			this.api(path, o, c);
		},
		/*
		=====================================================================
		Feedback Commands
		=====================================================================
		*/
		feedback_getFeedback: function(o,c) {
			if(!o.feedback_id) { throw "feedback_id null or undefined."; }
			var path = "feedback/" + o.feedback_id;
			delete o.feedback_id;
			
			this.api(path, o, c, false);
		},
		feedback_getFeedbackForUser: function(o,c) {
			if(!o.user_id) { throw "user_id null or undefined."; }
			var path = "users/" + o.user_id + "/feedback";
			delete o.color;
			
			this.api(path, o, c, false);
		},
		feedback_getFeedbackAsBuyer: function(o,c) {
			if(!o.user_id) { throw "user_id null or undefined."; }
			var path = "users/" + o.user_id + "/feedback/buyer";
			delete o.color;
			
			this.api(path, o, c, false);
		},
		feedback_getFeedbackForOthers: function(o,c) {
			if(!o.user_id) { throw "user_id null or undefined."; }
			var path = "users/" + o.user_id + "/feedback/others";
			delete o.color;
			
			this.api(path, o, c, false);
		},
		feedback_getFeedbackAsSeller: function(o,c) {
			if(!o.user_id) { throw "user_id null or undefined."; }
			var path = "users/" + o.user_id + "/feedback/seller";
			delete o.color;
			
			this.api(path, o, c, false);
		},
		/*
		=====================================================================
		Tag and Category Commands
		=====================================================================
		*/
		category_getTopCategories: function(o,c) {
			var path = "categories";
			this.api(path, o, c, false);
		},
		category_getChildCategories: function(o,c) {
			if(!o.category) { throw "category null or undefined."; }
			var path = "categories/" + o.category + "/children";
			delete o.category;
			
			this.api(path, o, c, false);
		},
		tag_getTopTags: function(o,c) {
			var path = "tags";
			this.api(path, o, c, false);
		},
		tag_getChildTags: function(o,c) {
			if(!o.tag) { throw "tag null or undefined."; }
			var path = "tags/" + o.tag + "/children";
			delete o.tag;
			
			this.api(path, o, c, false);
		},
		/*
		=====================================================================
		Favorites Commands
		=====================================================================
		*/
		favorite_getFavorersOfListing: function(o,c) {
			if(!o.listing_id) { throw "listing_id null or undefined."; }
			var path = "listings/" + o.listing_id + "/favorers";
			delete o.listing_id;
			
			this.api(path, o, c);
		},
		favorite_getFavorersOfShop: function(o,c) {
			if(!o.user_id) { throw "user_id null or undefined."; }
			var path = "shops/" + o.user_id + "/favorers";
			delete o.listing_id;
			
			this.api(path, o, c);
		},
		favorite_getFavoriteListingsOfUser: function(o,c) {
			if(!o.user_id) { throw "user_id null or undefined."; }
			var path = "users/" + o.user_id + "/favorites/listings";
			delete o.listing_id;
			
			this.api(path, o, c);
		},
		favorite_getFavoriteShopsOfUser: function(o,c) {
			if(!o.user_id) { throw "user_id null or undefined."; }
			var path = "users/" + o.user_id + "/favorites/shops";
			delete o.listing_id;
			
			this.api(path, o, c);
		},
		/*
		=====================================================================
		Gift Guide Commands
		=====================================================================
		*/
		giftguide_getGiftGuides: function(o,c) {
			var path = "gift-guides";
			this.api(path, o, c, false);
		},
		giftguide_getGuiftGuideListings: function(o,c) {
			if(!o.guide_id) { throw "guide_id null or undefined."; }
			var path = "gift-guides/" + o.guide_id + "/listings";
			delete o.guide_id;
			
			this.api(path, o, c);
		},
		/*
		=====================================================================
		Server Commands
		=====================================================================
		*/
		server_getMethodTable: function(o,c) {
			var path = "";
			this.api(path, o, c);
		},
		server_getServerEpoch: function(o,c) {
			var path = "server/epoch";
			this.api(path, o, c);
		},
		server_ping: function(o,c) {
			var path = "server/ping";
			this.api(path, o, c);
		}
	}
})();