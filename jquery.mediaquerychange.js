'use strict';

(function($){

	var MEDIA_QUERY_CHANGE_EVENT = {

		exe: function() {
			var that = this;

			that.getStyleSheets();
		},
		each: function(target, fn) {

			var isCorrectParameters = target && typeof target === 'object' && typeof fn === 'function';
			var returnedValue;
			var i = 0;

			if(!isCorrectParameters) {
				return;
			}

			function loopArray(length) {
				for(; i < length; i = (i+1)|0) {

					var data = target[i];

					returnedValue = fn(data, i);

					if(returnedValue === 'continue') {
						continue;
					}
					if(returnedValue === 'break') {
						break;
					}
				}
			}

			function loopObject() {
				for(var key in target) {
					if(target.hasOwnProperty(key)) {

						var value = target[key];

						returnedValue = fn(key, value, (i+1)|0);

						if(returnedValue === 'continue') {
							continue;
						}
						if(returnedValue === 'break') {
							break;
						}
					}
				}
			}

			if('length' in target) {
				var length = target.length || null;
				if(length) {
					loopArray(length);
				} else if(!(target instanceof Array)) {
					loopObject();
				}

			} else if(!(target instanceof Array)) {
				loopObject();
			}
		},

		getStyleSheets: function() {
			var that = this;
			var styleSheets = document.styleSheets;
			that.matchedMediaTextsArray = [];

			return new Promise(function(resolve, reject) {
				that.each(styleSheets, that.searchByStyleSheet(document));
				resolve();
			});
		},

		searchByStyleSheet: function(doc) {
			var that = this;
			return function(styleSheet) {
				var cssRules = styleSheet.cssRules;
				//TODO: remove?
				if(cssRules === null) {
					return 'continue';
				}
				that.each(cssRules, that.searchByCssRule(doc));
			};
		},

		searchByCssRule: function(doc) {
			var that = this;
			return function(cssRule) {
				that.bindMediaQueryChange(cssRule);
				that.handleCssRule(cssRule, doc);
			}
		},

		allMediaTextsArray: [],
		bindMediaQueryChange: function(cssRule) {
			var that = this;
			if(cssRule.media) {
				var mediaText = cssRule.media.mediaText;
				var mediaQueryList = matchMedia(mediaText);

				if(that.allMediaTextsArray.indexOf(mediaText) < 0) {
					mediaQueryList.addEventListener('change', that.mediaQueryEventHandler.bind(that));
					that.allMediaTextsArray.push(mediaText);
				}
				if(mediaQueryList.matches) {
					if(that.matchedMediaTextsArray.indexOf(mediaText) < 0) {
						that.matchedMediaTextsArray.push(mediaText);
					}
				}
			}
		},

		//TODO: support muliple mediaquery
		mediaQueryEventHandler: function(event) {
			var that = this;
			var matchedMediaTextsArray = [];
			that.each(that.allMediaTextsArray, function(mediaText) {
				var mediaQueryList = matchMedia(mediaText);
				if(mediaQueryList.matches) {
					matchedMediaTextsArray.push(mediaText);
				}
			})

			$(window).trigger({
				type: 'mediaquerychange',
				media: event.media,
				matchedMedia: matchedMediaTextsArray,
				matches: event.matches,
				srcElement: event.srcElement,
				target: event.target,
				currentTarget: event.currentTarget
			});
		},

		handleCssRule: function(cssRule, doc) {
			var that = this;
			//TODO: support @support
			switch(cssRule.type) {

				case CSSRule.STYLE_RULE:
					break;

				case CSSRule.MEDIA_RULE:
					var mediaText = cssRule.media.mediaText;
					var mediaQueryList = matchMedia(mediaText);
					if(mediaQueryList.matches) {
						that.each(cssRule.cssRules, that.searchByCssRule(doc));
					}
					return 'continue';
					break;

				default:
					return 'continue';
					break;
			}
		}
	};


	MEDIA_QUERY_CHANGE_EVENT.exe();

}(jQuery));