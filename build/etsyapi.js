/*
Copyright (C) 2012 Nicholas Husher

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/**
A module for interacting with the etsy public API

@module etsy-api
**/

(function() {
    var ETSY_URL = "http://beta-api.etsy.com/v1/",
        SUFFIX = ".js",
        c = 0,
        readyQueue = [],
        isReady = false;
    
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
    
    /**
    The ETSY API endpoint.
    
    @class Etsy
    @contructor
    @param apiKey {String} The Etsy API key to use
    **/
    Etsy = function(apiKey) {
        this._apiKey = apiKey;
    };  
    
    Etsy.prototype = {
        /**
        @property _apiKey {String} The API key
        @private
        **/
        _apiKey: null,
        
        /**
        @property _detailLevel {String} The default detail level
        @private
        **/
        _detailLevel: "low",
        
        /**
        @method api
        @param p {String} The GET path to the etsy API call
        @param o {Object} The arguments object
        @param c {Function|Object} The callback function/object
        @param useDetailLevel {Boolean} 
        **/
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
        
        /**
        @method setDetailLevel
        @param detailLevel {String} The new detail level, one of "low", "medium", or "high"
        **/
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
        
        /**
        @method user_getUserDetails
        @param o {Object} The arguments object
        
        * **user_id** - Required. The user ID of the details to get
        
        @param c {Function|Object} The callback object/function
        **/
        user_getUserDetails: function(o,c) {
            if(!o.user_id) { throw "user_id null or undefined." }
            var path = 'users/' + o.user_id;
            delete o.user_id;
            
            this.api(path, o, c);
        },
        
        /**
        @method user_getUsersByName
        @param o {Object} The arguments object
        
        * **search_name** - The search query to run.
        
        @param c {Function|Object} The callback object/function
        **/
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
        
        /**
        @method shop_getShopDetails
        @param o {Object} The arguments object
        @param c {Function|Object} The callback object/function
        **/
        shop_getShopDetails: function(o,c) {
            if(!o.user_id) { throw "user_id null or undefined."; }
            var path = "shops/" + o.user_id;
            delete o.user_id;
            
            this.api(path, o, c);
        },
        
        /**
        @method shop_getShopListings
        @param o {Object} The arguments object
        @param c {Function|Object} The callback object/function
        **/
        shop_getShopListings: function(o,c) {
            if(!o.user_id) { throw "user_id null or undefined."; }
            var path = "shops/" + o.user_id + "/listings";
            delete o.user_id;
            
            this.api(path, o, c)
        },
        
        /**
        @method shop_getFeaturedDetails
        @param o {Object} The arguments object
        @param c {Function|Object} The callback object/function
        **/
        shop_getFeaturedDetails: function(o,c) {
            if(!o.user_id) { throw "user_id null or undefined."; }
            var path = "shops/" + o.user_id + "/listings/featured";
            delete o.user_id;
            
            this.api(path, o, c)
        },
        
        /**
        @method shop_getFeaturedSellers
        @param o {Object} The arguments object
        @param c {Function|Object} The callback object/function
        **/
        shop_getFeaturedSellers: function(o,c) {
            var path = "shops/featured";            
            this.api(path, o, c)
        },
        
        /**
        @method shop_getShopDetails
        @param o {Object} The arguments object
        @param c {Function|Object} The callback object/function
        **/
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
        
        /**
        @method listing_getListingDetails
        @param o {Object} The arguments object
        @param c {Function|Object} The callback object/function
        **/
        listing_getListingDetails: function(o,c) {
            if(!o.listing_id) { throw "listing_id null or undefined."; }
            var path = "listings/" + o.listing_id;
            delete o.listing_id;
            
            this.api(path, o, c);
        },
        
        /**
        @method listing_getAllListings
        @param o {Object} The arguments object
        @param c {Function|Object} The callback object/function
        **/
        listing_getAllListings: function(o,c) {
            var path = "listings/all";
            this.api(path, o, c);           
        },
        
        /**
        @method listing_getListingsByCategory
        @param o {Object} The arguments object
        @param c {Function|Object} The callback object/function
        **/
        listing_getListingsByCategory: function(o,c) {
            if(!o.category) { throw "category null or undefined."; }
            var path = "listings/category/" + o.category;
            delete o.category;
            
            this.api(path, o, c);
        },
        
        /**
        @method listing_getListingsByColor
        @param o {Object} The arguments object
        @param c {Function|Object} The callback object/function
        **/
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
        
        /**
        @method listing_getListingsByColorAndKeywords
        @param o {Object} The arguments object
        @param c {Function|Object} The callback object/function
        **/
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
        
        /**
        @method listing_getFrontFeaturedListings
        @param o {Object} The arguments object
        @param c {Function|Object} The callback object/function
        **/
        listing_getFrontFeaturedListings: function(o,c) {
            var path = "listings/featured/front";
            this.api(path, o, c);
        },
        
        /**
        @method listing_getListingsByKeyword
        @param o {Object} The arguments object
        @param c {Function|Object} The callback object/function
        **/
        listing_getListingsByKeyword: function(o,c) {
            if(!o.search_terms) { throw "search_terms null or undefined."; }
            if(jQuery.isArray(o.search_terms)) {
                o.search_terms = o.search_terms.join(';');
            }
            var path = "listings/keywords/" + o.search_terms;
            delete o.search_terms;
            
            this.api(path, o, c);
        },
        
        /**
        @method listing_getListingsByMaterials
        @param o {Object} The arguments object
        @param c {Function|Object} The callback object/function
        **/
        listing_getListingsByMaterials: function(o,c) {
            if(!o.materials) { throw "materials null or undefined."; }
            if(jQuery.isArray(o.materials)) {
                o.materials = o.materials.join(';');
            }
            var path = "listings/materials/" + o.materials;
            delete o.materials;
            
            this.api(path, o, c);
        },
        
        /**
        @method listing_getListingsByTags
        @param o {Object} The arguments object
        @param c {Function|Object} The callback object/function
        **/
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
        
        /**
        @method feedback_getFeedback
        @param o {Object} The arguments object
        @param c {Function|Object} The callback object/function
        **/
        feedback_getFeedback: function(o,c) {
            if(!o.feedback_id) { throw "feedback_id null or undefined."; }
            var path = "feedback/" + o.feedback_id;
            delete o.feedback_id;
            
            this.api(path, o, c, false);
        },

        /**
        @method feedback_getFeedbackForUser
        @param o {Object} The arguments object
        @param c {Function|Object} The callback object/function
        **/
        feedback_getFeedbackForUser: function(o,c) {
            if(!o.user_id) { throw "user_id null or undefined."; }
            var path = "users/" + o.user_id + "/feedback";
            delete o.color;
            
            this.api(path, o, c, false);
        },
        
        /**
        @method feedback_getFeedbackAsBuyer
        @param o {Object} The arguments object
        @param c {Function|Object} The callback object/function
        **/
        feedback_getFeedbackAsBuyer: function(o,c) {
            if(!o.user_id) { throw "user_id null or undefined."; }
            var path = "users/" + o.user_id + "/feedback/buyer";
            delete o.color;
            
            this.api(path, o, c, false);
        },
        
        /**
        @method feedback_getFeedbackForOthers
        @param o {Object} The arguments object
        @param c {Function|Object} The callback object/function
        **/
        feedback_getFeedbackForOthers: function(o,c) {
            if(!o.user_id) { throw "user_id null or undefined."; }
            var path = "users/" + o.user_id + "/feedback/others";
            delete o.color;
            
            this.api(path, o, c, false);
        },
        
        /**
        @method feedback_getFeedbackAsSeller
        @param o {Object} The arguments object
        @param c {Function|Object} The callback object/function
        **/
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
        
        /**
        @method category_getTopCategories
        @param o {Object} The arguments object
        @param c {Function|Object} The callback object/function
        **/
        category_getTopCategories: function(o,c) {
            var path = "categories";
            this.api(path, o, c, false);
        },
        
        /**
        @method category_getChildCategories
        @param o {Object} The arguments object
        @param c {Function|Object} The callback object/function
        **/
        category_getChildCategories: function(o,c) {
            if(!o.category) { throw "category null or undefined."; }
            var path = "categories/" + o.category + "/children";
            delete o.category;
            
            this.api(path, o, c, false);
        },
        
        /**
        @method tag_getTopTags
        @param o {Object} The arguments object
        @param c {Function|Object} The callback object/function
        **/
        tag_getTopTags: function(o,c) {
            var path = "tags";
            this.api(path, o, c, false);
        },
        
        /**
        @method tag_getChildTags
        @param o {Object} The arguments object
        @param c {Function|Object} The callback object/function
        **/
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

        /**
        @method favorites_getFavorersOfListing
        @param o {Object} The arguments object
        @param c {Function|Object} The callback object/function
        **/
        favorite_getFavorersOfListing: function(o,c) {
            if(!o.listing_id) { throw "listing_id null or undefined."; }
            var path = "listings/" + o.listing_id + "/favorers";
            delete o.listing_id;
            
            this.api(path, o, c);
        },
        
        /**
        @method favorites_getFavorersOfShop
        @param o {Object} The arguments object
        @param c {Function|Object} The callback object/function
        **/
        favorite_getFavorersOfShop: function(o,c) {
            if(!o.user_id) { throw "user_id null or undefined."; }
            var path = "shops/" + o.user_id + "/favorers";
            delete o.listing_id;
            
            this.api(path, o, c);
        },
        
        /**
        @method favorites_getFavoriteListingsOfUser
        @param o {Object} The arguments object
        @param c {Function|Object} The callback object/function
        **/
        favorite_getFavoriteListingsOfUser: function(o,c) {
            if(!o.user_id) { throw "user_id null or undefined."; }
            var path = "users/" + o.user_id + "/favorites/listings";
            delete o.listing_id;
            
            this.api(path, o, c);
        },
        
        /**
        @method favorites_getFavoriteShopsOfUser
        @param o {Object} The arguments object
        @param c {Function|Object} The callback object/function
        **/
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
        
        /**
        @method giftguide_getGiftGuides
        @param o {Object} The arguments object
        @param c {Function|Object} The callback object/function
        **/
        giftguide_getGiftGuides: function(o,c) {
            var path = "gift-guides";
            this.api(path, o, c, false);
        },
        
        /**
        @method giftguide_getGiftGuideListings
        @param o {Object} The arguments object
        @param c {Function|Object} The callback object/function
        **/
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
        
        /**
        @method server_getMethodTable
        @param o {Object} The arguments object
        @param c {Function|Object} The callback object/function
        **/
        server_getMethodTable: function(o,c) {
            var path = "";
            this.api(path, o, c);
        },
        
        /**
        @method server_getServerEpoch
        @param o {Object} The arguments object
        @param c {Function|Object} The callback object/function
        **/
        server_getServerEpoch: function(o,c) {
            var path = "server/epoch";
            this.api(path, o, c);
        },
        
        /**
        @method server_ping
        @param o {Object} The arguments object
        @param c {Function|Object} The callback object/function
        **/
        server_ping: function(o,c) {
            var path = "server/ping";
            this.api(path, o, c);
        }
    }
})();