---
layout: default
title: Etsy API (deprecated)
---

**NOTE:** This library is hideously out-of-date. It was the latest-greatest when I wrote it in 2009 or whatever, but the ETSY API has since gone from beta (when this was written) to v2.

**[The generated JS documentation](./doc)**

While messing around working on a friend's website, I realized that it would be relatively simple to whip up a Javascript client for [Etsy's excellent and simple API](http://developer.etsy.com/docs). It's mostly a set of function wrappers and pass-throughs for the built-in libraries, but aside from maybe wanting a lightweight object mapper (being able to call thisListing.getFavorites would be cool), that's all I really need.

I decided that I'd release it out there onto the web so others can use it. It's license free--do whatever you want with it, although if you claim that you wrote it, you're going to a [special hell](http://www.youtube.com/watch?v=NVxLz6O6MaI).

The only prerequisite is an Etsy API key. At some future date, I'll write my own JSONP function for it, as that's the only thing that really keeps it tied to jQuery. Aside from that, it should just be a drop-in-and-go type deal. The only thing it adds to the global namespace is Etsy, an object that exposes the API.

To use the library, you just need to create a new instance of Etsy with your API key as the only parameter.

    var e = new Etsy("your api key");

After that, there the API calls are divided up in the same way as they are on the [Etsy API documentation](http://developer.etsy.com/docs#commands). To use a function in the shop category, simply call shop_(function name) with the requisite parameters as a JSON object. This JSON object must contain any non-optional parameters as defined in the API docs, as well as any number of optional parameters. For example, to get listings in a shop, you'd call:

    e.shop_getShopListings({ user_id: "horseshoecrab" }, function(data) { ... });

Notice that the second argument is a callback function. The argument data is the JSON object returned by the Etsy API call you just made. You can optionally pass the second parameter as an object with two properties, success and failure. Success will be called if the API call completed successfully while failure will be called if it was not.

The Etsy API also has a notion of detail level, which can be low, medium or high. You can set this detail level by calling `setDetailLevel("[low|medium|high]")`. Pretty straightforward, I think. The library throws a clearly-worded exception if you do anything wrong, mainly to prevent any silent code death, which is the bane of all callback- and event-based javascript.

Also note that API parameters that accept the array data type are supported. That is, you can search for multiple keys (for instance) by passing `{ search_terms: ['term1','term2'] }` and it will format it correctly when requesting information. HSL colors are supported in the same way.
