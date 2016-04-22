'use strict';

(function($){

	var MEDIA_QUERY_CHANGE_EVENT = {

		allMediaTextsArray: [],

		exe: function() {
			var that = MEDIA_QUERY_CHANGE_EVENT;
			that.getStyleSheets();
		},
		getStyleSheets: function() {
			var that = MEDIA_QUERY_CHANGE_EVENT;
			var styleSheets = document.styleSheets;
			that.matchedMediaTextsArray = [];
			$.each(styleSheets, that.searchByStyleSheet);
		},

		searchByStyleSheet: function() {
			var that = MEDIA_QUERY_CHANGE_EVENT;
			var styleSheet = this;
			var cssRules = styleSheet.cssRules;
			$.each(cssRules, that.searchByCssRule);
		},

		searchByCssRule: function() {
			var that = MEDIA_QUERY_CHANGE_EVENT;
			var cssRule = this;
			that.bindMediaQueryChange(cssRule);
			that.handleCssRule(cssRule);
		},

		bindMediaQueryChange: function(cssRule) {
			var that = MEDIA_QUERY_CHANGE_EVENT;
			if(cssRule.media) {
				var mediaText = cssRule.media.mediaText;
				var mediaQueryList = matchMedia(mediaText);

				if(that.allMediaTextsArray.indexOf(mediaText) < 0) {
					if('addEventListener' in mediaQueryList) {
						mediaQueryList.addEventListener('change', that.mediaQueryEventHandler);
					} else {
						mediaQueryList.addListener(that.mediaQueryEventHandler);
					}
					that.allMediaTextsArray.push(mediaText);
				}
			}
		},

		mediaQueryEventHandler: function(event) {
			var that = MEDIA_QUERY_CHANGE_EVENT;
			var matchedMediaTextsArray = [];
			$.each(that.allMediaTextsArray, function() {
				var mediaText = this;
				var mediaQueryList = matchMedia(mediaText);
				if(mediaQueryList.matches) {
					if(matchedMediaTextsArray.indexOf(mediaText) < 0) {
						matchedMediaTextsArray.push(mediaText);
					}
				}
			});

			$(window).trigger({
				type: 'mediaquery:change',
				media: event.media,
				matchedMedia: matchedMediaTextsArray,
				matches: event.matches,
				srcElement: event.srcElement,
				target: event.target,
				currentTarget: event.currentTarget
			});
		},

		handleCssRule: function(cssRule) {
			var that = MEDIA_QUERY_CHANGE_EVENT;

			switch(cssRule.type) {
				case CSSRule.STYLE_RULE:
					break;

				case CSSRule.MEDIA_RULE:
					var mediaText = cssRule.media.mediaText;
					var mediaQueryList = matchMedia(mediaText);
					if(mediaQueryList.matches) {
						$.each(cssRule.cssRules, that.searchByCssRule);
					}
					return true;
					break;

				default:
					return true;
					break;
			}
		}
	};


	MEDIA_QUERY_CHANGE_EVENT.exe();

}(jQuery));