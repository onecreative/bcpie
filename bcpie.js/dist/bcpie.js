/*!
 * JavaScript Cookie v2.1.4
 * https://github.com/js-cookie/js-cookie
 *
 * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
 * Released under the MIT license
 */
;(function (factory) {
	var registeredInModuleLoader = false;
	if (typeof define === 'function' && define.amd) {
		define(factory);
		registeredInModuleLoader = true;
	}
	if (typeof exports === 'object') {
		module.exports = factory();
		registeredInModuleLoader = true;
	}
	if (!registeredInModuleLoader) {
		var OldCookies = window.Cookies;
		var api = window.Cookies = factory();
		api.noConflict = function () {
			window.Cookies = OldCookies;
			return api;
		};
	}
}(function () {
	function extend () {
		var i = 0;
		var result = {};
		for (; i < arguments.length; i++) {
			var attributes = arguments[ i ];
			for (var key in attributes) {
				result[key] = attributes[key];
			}
		}
		return result;
	}

	function init (converter) {
		function api (key, value, attributes) {
			var result;
			if (typeof document === 'undefined') {
				return;
			}

			// Write

			if (arguments.length > 1) {
				attributes = extend({
					path: '/'
				}, api.defaults, attributes);

				if (typeof attributes.expires === 'number') {
					var expires = new Date();
					expires.setMilliseconds(expires.getMilliseconds() + attributes.expires * 864e+5);
					attributes.expires = expires;
				}

				// We're using "expires" because "max-age" is not supported by IE
				attributes.expires = attributes.expires ? attributes.expires.toUTCString() : '';

				try {
					result = JSON.stringify(value);
					if (/^[\{\[]/.test(result)) {
						value = result;
					}
				} catch (e) {}

				if (!converter.write) {
					value = encodeURIComponent(String(value))
						.replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);
				} else {
					value = converter.write(value, key);
				}

				key = encodeURIComponent(String(key));
				key = key.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent);
				key = key.replace(/[\(\)]/g, escape);

				var stringifiedAttributes = '';

				for (var attributeName in attributes) {
					if (!attributes[attributeName]) {
						continue;
					}
					stringifiedAttributes += '; ' + attributeName;
					if (attributes[attributeName] === true) {
						continue;
					}
					stringifiedAttributes += '=' + attributes[attributeName];
				}
				return (document.cookie = key + '=' + value + stringifiedAttributes);
			}

			// Read

			if (!key) {
				result = {};
			}

			// To prevent the for loop in the first place assign an empty array
			// in case there are no cookies at all. Also prevents odd result when
			// calling "get()"
			var cookies = document.cookie ? document.cookie.split('; ') : [];
			var rdecode = /(%[0-9A-Z]{2})+/g;
			var i = 0;

			for (; i < cookies.length; i++) {
				var parts = cookies[i].split('=');
				var cookie = parts.slice(1).join('=');

				if (cookie.charAt(0) === '"') {
					cookie = cookie.slice(1, -1);
				}

				try {
					var name = parts[0].replace(rdecode, decodeURIComponent);
					cookie = converter.read ?
						converter.read(cookie, name) : converter(cookie, name) ||
						cookie.replace(rdecode, decodeURIComponent);

					if (this.json) {
						try {
							cookie = JSON.parse(cookie);
						} catch (e) {}
					}

					if (key === name) {
						result = cookie;
						break;
					}

					if (!key) {
						result[name] = cookie;
					}
				} catch (e) {}
			}

			return result;
		}

		api.set = api;
		api.get = function (key) {
			return api.call(api, key);
		};
		api.getJSON = function () {
			return api.apply({
				json: true
			}, [].slice.call(arguments));
		};
		api.defaults = {};

		api.remove = function (key, attributes) {
			api(key, '', extend(attributes, {
				expires: -1
			}));
		};

		api.withConverter = init;

		return api;
	}

	return init(function () {});
}));
;/**
 * alertify-js
 * An unobtrusive customizable JavaScript notification system
 *
 * @author Fabien Doiron <fabien.doiron@gmail.com>
 * @copyright Fabien Doiron 2015
 * @license MIT <http://opensource.org/licenses/mit-license.php>
 * @link https://github.com/ppoliani/alertify.js
 * @module alertify-js
 * @version 0.3.11
 */
/*jslint browser: true*/
(function (global, undefined) {
	"use strict";

	var document = global.document,
	    Alertify;

	Alertify = function () {

		var _alertify = {},
		    dialogs   = {},
		    isopen    = false,
		    keys      = { ENTER: 13, ESC: 27, SPACE: 32 },
		    queue     = [],
		    $, btnCancel, btnOK, btnReset, btnResetBack, btnFocus, elCallee, elCover, elDialog, elLog, form, input, getTransitionEvent;

		/**
		 * Markup pieces
		 * @type {Object}
		 */
		dialogs = {
			buttons : {
				holder : "<nav class=\"alertify-buttons\">{{buttons}}</nav>",
				submit : "<button type=\"submit\" class=\"alertify-button alertify-button-ok\" id=\"alertify-ok\">{{ok}}</button>",
				ok     : "<button class=\"alertify-button alertify-button-ok\" id=\"alertify-ok\">{{ok}}</button>",
				cancel : "<button class=\"alertify-button alertify-button-cancel\" id=\"alertify-cancel\">{{cancel}}</button>"
			},
			input   : "<div class=\"alertify-text-wrapper\"><input type=\"text\" class=\"alertify-text\" id=\"alertify-text\"></div>",
			message : "<p class=\"alertify-message\">{{message}}</p>",
			log     : "<article class=\"alertify-log{{class}}\">{{message}}</article>"
		};

		/**
		 * Return the proper transitionend event
		 * @return {String}    Transition type string
		 */
		getTransitionEvent = function () {
			var t,
			    type,
			    supported   = false,
			    el          = document.createElement("fakeelement"),
			    transitions = {
				    "WebkitTransition" : "webkitTransitionEnd",
				    "MozTransition"    : "transitionend",
				    "OTransition"      : "otransitionend",
				    "transition"       : "transitionend"
			    };

			for (t in transitions) {
				if (el.style[t] !== undefined) {
					type      = transitions[t];
					supported = true;
					break;
				}
			}

			return {
				type      : type,
				supported : supported
			};
		};

		/**
		 * Shorthand for document.getElementById()
		 *
		 * @param  {String} id    A specific element ID
		 * @return {Object}       HTML element
		 */
		$ = function (id) {
			return document.getElementById(id);
		};

		/**
		 * Alertify private object
		 * @type {Object}
		 */
		_alertify = {

			/**
			 * Labels object
			 * @type {Object}
			 */
			labels : {
				ok     : "OK",
				cancel : "Cancel"
			},

			/**
			 * Delay number
			 * @type {Number}
			 */
			delay : 5000,

			/**
			 * Whether buttons are reversed (default is secondary/primary)
			 * @type {Boolean}
			 */
			buttonReverse : false,

			/**
			 * Which button should be focused by default
			 * @type {String}	"ok" (default), "cancel", or "none"
			 */
			buttonFocus : "ok",

			/**
			 * Set the transition event on load
			 * @type {[type]}
			 */
			transition : undefined,

			/**
			 * Set the proper button click events
			 *
			 * @param {Function} fn    [Optional] Callback function
			 *
			 * @return {undefined}
			 */
			addListeners : function (fn) {
				var hasOK     = (typeof btnOK !== "undefined"),
				    hasCancel = (typeof btnCancel !== "undefined"),
				    hasInput  = (typeof input !== "undefined"),
				    val       = "",
				    self      = this,
				    ok, cancel, common, key, reset;

				// ok event handler
				ok = function (event) {
					if (typeof event.preventDefault !== "undefined") event.preventDefault();
					common(event);
					if (typeof input !== "undefined") val = input.value;
					if (typeof fn === "function") {
						if (typeof input !== "undefined") {
							fn(true, val);
						}
						else fn(true);
					}
					return false;
				};

				// cancel event handler
				cancel = function (event) {
					if (typeof event.preventDefault !== "undefined") event.preventDefault();
					common(event);
					if (typeof fn === "function") fn(false);
					return false;
				};

				// common event handler (keyup, ok and cancel)
				common = function (event) {
					self.hide();
					self.unbind(document.body, "keyup", key);
					self.unbind(btnReset, "focus", reset);
					if (hasOK) self.unbind(btnOK, "click", ok);
					if (hasCancel) self.unbind(btnCancel, "click", cancel);
				};

				// keyup handler
				key = function (event) {
					var keyCode = event.keyCode;
					if ((keyCode === keys.SPACE && !hasInput) || (hasInput && keyCode === keys.ENTER)) ok(event);
					if (keyCode === keys.ESC && hasCancel) cancel(event);
				};

				// reset focus to first item in the dialog
				reset = function (event) {
					if (hasInput) input.focus();
					else if (!hasCancel || self.buttonReverse) btnOK.focus();
					else btnCancel.focus();
				};

				// handle reset focus link
				// this ensures that the keyboard focus does not
				// ever leave the dialog box until an action has
				// been taken
				this.bind(btnReset, "focus", reset);
				this.bind(btnResetBack, "focus", reset);
				// handle OK click
				if (hasOK) this.bind(btnOK, "click", ok);
				// handle Cancel click
				if (hasCancel) this.bind(btnCancel, "click", cancel);
				// listen for keys, Cancel => ESC
				this.bind(document.body, "keyup", key);
				if (!this.transition.supported) {
					this.setFocus();
				}
			},

			/**
			 * Bind events to elements
			 *
			 * @param  {Object}   el       HTML Object
			 * @param  {Event}    event    Event to attach to element
			 * @param  {Function} fn       Callback function
			 *
			 * @return {undefined}
			 */
			bind : function (el, event, fn) {
				if (typeof el.addEventListener === "function") {
					el.addEventListener(event, fn, false);
				} else if (el.attachEvent) {
					el.attachEvent("on" + event, fn);
				}
			},

			/**
			 * Use alertify as the global error handler (using window.onerror)
			 *
			 * @return {boolean} success
			 */
			handleErrors : function () {
				if (typeof global.onerror !== "undefined") {
					var self = this;
					global.onerror = function (msg, url, line) {
						self.error("[" + msg + " on line " + line + " of " + url + "]", 0);
					};
					return true;
				} else {
					return false;
				}
			},

			/**
			 * Append button HTML strings
			 *
			 * @param {String} secondary    The secondary button HTML string
			 * @param {String} primary      The primary button HTML string
			 *
			 * @return {String}             The appended button HTML strings
			 */
			appendButtons : function (secondary, primary) {
				return this.buttonReverse ? primary + secondary : secondary + primary;
			},

			/**
			 * Build the proper message box
			 *
			 * @param  {Object} item    Current object in the queue
			 *
			 * @return {String}         An HTML string of the message box
			 */
			build : function (item) {
				var html    = "",
				    type    = item.type,
				    message = item.message,
				    css     = item.cssClass || "";

				html += "<div class=\"alertify-dialog\">";
				html += "<a id=\"alertify-resetFocusBack\" class=\"alertify-resetFocus\" href=\"#\">Reset Focus</a>";

				if (_alertify.buttonFocus === "none") html += "<a href=\"#\" id=\"alertify-noneFocus\" class=\"alertify-hidden\"></a>";

				// doens't require an actual form
				if (type === "prompt") html += "<div id=\"alertify-form\">";

				html += "<article class=\"alertify-inner\">";
				html += dialogs.message.replace("{{message}}", message);

				if (type === "prompt") html += dialogs.input;

				html += dialogs.buttons.holder;
				html += "</article>";

				if (type === "prompt") html += "</div>";

				html += "<a id=\"alertify-resetFocus\" class=\"alertify-resetFocus\" href=\"#\">Reset Focus</a>";
				html += "</div>";

				switch (type) {
				case "confirm":
					html = html.replace("{{buttons}}", this.appendButtons(dialogs.buttons.cancel, dialogs.buttons.ok));
					html = html.replace("{{ok}}", this.labels.ok).replace("{{cancel}}", this.labels.cancel);
					break;
				case "prompt":
					html = html.replace("{{buttons}}", this.appendButtons(dialogs.buttons.cancel, dialogs.buttons.submit));
					html = html.replace("{{ok}}", this.labels.ok).replace("{{cancel}}", this.labels.cancel);
					break;
				case "alert":
					html = html.replace("{{buttons}}", dialogs.buttons.ok);
					html = html.replace("{{ok}}", this.labels.ok);
					break;
				default:
					break;
				}

				elDialog.className = "alertify alertify-" + type + " " + css;
				elCover.className  = "alertify-cover";
				return html;
			},

			/**
			 * Close the log messages
			 *
			 * @param  {Object} elem    HTML Element of log message to close
			 * @param  {Number} wait    [optional] Time (in ms) to wait before automatically hiding the message, if 0 never hide
			 *
			 * @return {undefined}
			 */
			close : function (elem, wait) {
				// Unary Plus: +"2" === 2
				var timer = (wait && !isNaN(wait)) ? +wait : this.delay,
				    self  = this,
				    hideElement, transitionDone;

				// set click event on log messages
				this.bind(elem, "click", function () {
					hideElement(elem);
				});
				// Hide the dialog box after transition
				// This ensure it doens't block any element from being clicked
				transitionDone = function (event) {
					event.stopPropagation();
					// unbind event so function only gets called once
					self.unbind(this, self.transition.type, transitionDone);
					// remove log message
					elLog.removeChild(this);
					if (!elLog.hasChildNodes()) elLog.className += " alertify-logs-hidden";
				};
				// this sets the hide class to transition out
				// or removes the child if css transitions aren't supported
				hideElement = function (el) {
					// ensure element exists
					if (typeof el !== "undefined" && el.parentNode === elLog) {
						// whether CSS transition exists
						if (self.transition.supported) {
							self.bind(el, self.transition.type, transitionDone);
							el.className += " alertify-log-hide";
						} else {
							elLog.removeChild(el);
							if (!elLog.hasChildNodes()) elLog.className += " alertify-logs-hidden";
						}
					}
				};
				// never close (until click) if wait is set to 0
				if (wait === 0) return;
				// set timeout to auto close the log message
				setTimeout(function () { hideElement(elem); }, timer);
			},

			/**
			 * Create a dialog box
			 *
			 * @param  {String}   message        The message passed from the callee
			 * @param  {String}   type           Type of dialog to create
			 * @param  {Function} fn             [Optional] Callback function
			 * @param  {String}   placeholder    [Optional] Default value for prompt input field
			 * @param  {String}   cssClass       [Optional] Class(es) to append to dialog box
			 *
			 * @return {Object}
			 */
			dialog : function (message, type, fn, placeholder, cssClass) {
				// set the current active element
				// this allows the keyboard focus to be resetted
				// after the dialog box is closed
				elCallee = document.activeElement;
				// check to ensure the alertify dialog element
				// has been successfully created
				var check = function () {
					if ((elLog && elLog.scrollTop !== null) && (elCover && elCover.scrollTop !== null)) return;
					else check();
				};
				// error catching
				if (typeof message !== "string") throw new Error("message must be a string");
				if (typeof type !== "string") throw new Error("type must be a string");
				if (typeof fn !== "undefined" && typeof fn !== "function") throw new Error("fn must be a function");
				// initialize alertify if it hasn't already been done
				this.init();
				check();

				queue.push({ type: type, message: message, callback: fn, placeholder: placeholder, cssClass: cssClass });
				if (!isopen) this.setup();

				return this;
			},

			/**
			 * Extend the log method to create custom methods
			 *
			 * @param  {String} type    Custom method name
			 *
			 * @return {Function}
			 */
			extend : function (type) {
				if (typeof type !== "string") throw new Error("extend method must have exactly one parameter");
				return function (message, wait) {
					this.log(message, type, wait);
					return this;
				};
			},

			/**
			 * Hide the dialog and rest to defaults
			 *
			 * @return {undefined}
			 */
			hide : function () {
				var transitionDone,
				    self = this;
				// remove reference from queue
				queue.splice(0,1);
				// if items remaining in the queue
				if (queue.length > 0) this.setup(true);
				else {
					isopen = false;
					// Hide the dialog box after transition
					// This ensure it doens't block any element from being clicked
					transitionDone = function (event) {
						event.stopPropagation();
						// unbind event so function only gets called once
						self.unbind(elDialog, self.transition.type, transitionDone);
					};
					// whether CSS transition exists
					if (this.transition.supported) {
						this.bind(elDialog, this.transition.type, transitionDone);
						elDialog.className = "alertify alertify-hide alertify-hidden";
					} else {
						elDialog.className = "alertify alertify-hide alertify-hidden alertify-isHidden";
					}
					elCover.className  = "alertify-cover alertify-cover-hidden";
					// set focus to the last element or body
					// after the dialog is closed
					elCallee.focus();
				}
			},

			/**
			 * Initialize Alertify
			 * Create the 2 main elements
			 *
			 * @return {undefined}
			 */
			init : function () {
				// ensure legacy browsers support html5 tags
				document.createElement("nav");
				document.createElement("article");
				document.createElement("section");
				// cover
				if ($("alertify-cover") == null) {
					elCover = document.createElement("div");
					elCover.setAttribute("id", "alertify-cover");
					elCover.className = "alertify-cover alertify-cover-hidden";
					document.body.appendChild(elCover);
				}
				// main element
				if ($("alertify") == null) {
					isopen = false;
					queue = [];
					elDialog = document.createElement("section");
					elDialog.setAttribute("id", "alertify");
					elDialog.className = "alertify alertify-hidden";
					document.body.appendChild(elDialog);
				}
				// log element
				if ($("alertify-logs") == null) {
					elLog = document.createElement("section");
					elLog.setAttribute("id", "alertify-logs");
					elLog.className = "alertify-logs alertify-logs-hidden";
					document.body.appendChild(elLog);
				}
				// set tabindex attribute on body element
				// this allows script to give it focus
				// after the dialog is closed
				document.body.setAttribute("tabindex", "0");
				// set transition type
				this.transition = getTransitionEvent();
			},

			/**
			 * Show a new log message box
			 *
			 * @param  {String} message    The message passed from the callee
			 * @param  {String} type       [Optional] Optional type of log message
			 * @param  {Number} wait       [Optional] Time (in ms) to wait before auto-hiding the log
			 *
			 * @return {Object}
			 */
			log : function (message, type, wait) {
				// check to ensure the alertify dialog element
				// has been successfully created
				var check = function () {
					if (elLog && elLog.scrollTop !== null) return;
					else check();
				};
				// initialize alertify if it hasn't already been done
				this.init();
				check();

				elLog.className = "alertify-logs";
				this.notify(message, type, wait);
				return this;
			},

			/**
			 * Add new log message
			 * If a type is passed, a class name "alertify-log-{type}" will get added.
			 * This allows for custom look and feel for various types of notifications.
			 *
			 * @param  {String} message    The message passed from the callee
			 * @param  {String} type       [Optional] Type of log message
			 * @param  {Number} wait       [Optional] Time (in ms) to wait before auto-hiding
			 *
			 * @return {undefined}
			 */
			notify : function (message, type, wait) {
				var log = document.createElement("article");
				log.className = "alertify-log" + ((typeof type === "string" && type !== "") ? " alertify-log-" + type : "");
				log.innerHTML = message;
				// append child
				elLog.appendChild(log);
				// triggers the CSS animation
				setTimeout(function() { log.className = log.className + " alertify-log-show"; }, 50);
				this.close(log, wait);
			},

			/**
			 * Set properties
			 *
			 * @param {Object} args     Passing parameters
			 *
			 * @return {undefined}
			 */
			set : function (args) {
				var k;
				// error catching
				if (typeof args !== "object" && args instanceof Array) throw new Error("args must be an object");
				// set parameters
				for (k in args) {
					if (args.hasOwnProperty(k)) {
						this[k] = args[k];
					}
				}
			},

			/**
			 * Common place to set focus to proper element
			 *
			 * @return {undefined}
			 */
			setFocus : function () {
				if (input) {
					input.focus();
					input.select();
				}
				else btnFocus.focus();
			},

			/**
			 * Initiate all the required pieces for the dialog box
			 *
			 * @return {undefined}
			 */
			setup : function (fromQueue) {
				var item = queue[0],
				    self = this,
				    transitionDone;

				// dialog is open
				isopen = true;
				// Set button focus after transition
				transitionDone = function (event) {
					event.stopPropagation();
					self.setFocus();
					// unbind event so function only gets called once
					self.unbind(elDialog, self.transition.type, transitionDone);
				};
				// whether CSS transition exists
				if (this.transition.supported && !fromQueue) {
					this.bind(elDialog, this.transition.type, transitionDone);
				}
				// build the proper dialog HTML
				elDialog.innerHTML = this.build(item);
				// assign all the common elements
				btnReset  = $("alertify-resetFocus");
				btnResetBack  = $("alertify-resetFocusBack");
				btnOK     = $("alertify-ok")     || undefined;
				btnCancel = $("alertify-cancel") || undefined;
				btnFocus  = (_alertify.buttonFocus === "cancel") ? btnCancel : ((_alertify.buttonFocus === "none") ? $("alertify-noneFocus") : btnOK),
				input     = $("alertify-text")   || undefined;
				form      = $("alertify-form")   || undefined;
				// add placeholder value to the input field
				if (typeof item.placeholder === "string" && item.placeholder !== "") input.value = item.placeholder;
				if (fromQueue) this.setFocus();
				this.addListeners(item.callback);
			},

			/**
			 * Unbind events to elements
			 *
			 * @param  {Object}   el       HTML Object
			 * @param  {Event}    event    Event to detach to element
			 * @param  {Function} fn       Callback function
			 *
			 * @return {undefined}
			 */
			unbind : function (el, event, fn) {
				if (typeof el.removeEventListener === "function") {
					el.removeEventListener(event, fn, false);
				} else if (el.detachEvent) {
					el.detachEvent("on" + event, fn);
				}
			}
		};

		return {
			alert   : function (message, fn, cssClass) { _alertify.dialog(message, "alert", fn, "", cssClass); return this; },
			confirm : function (message, fn, cssClass) { _alertify.dialog(message, "confirm", fn, "", cssClass); return this; },
			extend  : _alertify.extend,
			init    : _alertify.init,
			log     : function (message, type, wait) { _alertify.log(message, type, wait); return this; },
			prompt  : function (message, fn, placeholder, cssClass) { _alertify.dialog(message, "prompt", fn, placeholder, cssClass); return this; },
			success : function (message, wait) { _alertify.log(message, "success", wait); return this; },
			error   : function (message, wait) { _alertify.log(message, "error", wait); return this; },
			set     : function (args) { _alertify.set(args); },
			labels  : _alertify.labels,
			debug   : _alertify.handleErrors
		};
	};

	// AMD and window support
	if (typeof define === "function") {
		define([], function () { return new Alertify(); });
	} else if (typeof global.alertify === "undefined") {
		global.alertify = new Alertify();
	}

}(window));
;//! moment.js
//! version : 2.18.1
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com

;(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    global.moment = factory()
}(this, (function () { 'use strict';

var hookCallback;

function hooks () {
    return hookCallback.apply(null, arguments);
}

// This is done to register the method called with moment()
// without creating circular dependencies.
function setHookCallback (callback) {
    hookCallback = callback;
}

function isArray(input) {
    return input instanceof Array || Object.prototype.toString.call(input) === '[object Array]';
}

function isObject(input) {
    // IE8 will treat undefined and null as object if it wasn't for
    // input != null
    return input != null && Object.prototype.toString.call(input) === '[object Object]';
}

function isObjectEmpty(obj) {
    var k;
    for (k in obj) {
        // even if its not own property I'd still call it non-empty
        return false;
    }
    return true;
}

function isUndefined(input) {
    return input === void 0;
}

function isNumber(input) {
    return typeof input === 'number' || Object.prototype.toString.call(input) === '[object Number]';
}

function isDate(input) {
    return input instanceof Date || Object.prototype.toString.call(input) === '[object Date]';
}

function map(arr, fn) {
    var res = [], i;
    for (i = 0; i < arr.length; ++i) {
        res.push(fn(arr[i], i));
    }
    return res;
}

function hasOwnProp(a, b) {
    return Object.prototype.hasOwnProperty.call(a, b);
}

function extend(a, b) {
    for (var i in b) {
        if (hasOwnProp(b, i)) {
            a[i] = b[i];
        }
    }

    if (hasOwnProp(b, 'toString')) {
        a.toString = b.toString;
    }

    if (hasOwnProp(b, 'valueOf')) {
        a.valueOf = b.valueOf;
    }

    return a;
}

function createUTC (input, format, locale, strict) {
    return createLocalOrUTC(input, format, locale, strict, true).utc();
}

function defaultParsingFlags() {
    // We need to deep clone this object.
    return {
        empty           : false,
        unusedTokens    : [],
        unusedInput     : [],
        overflow        : -2,
        charsLeftOver   : 0,
        nullInput       : false,
        invalidMonth    : null,
        invalidFormat   : false,
        userInvalidated : false,
        iso             : false,
        parsedDateParts : [],
        meridiem        : null,
        rfc2822         : false,
        weekdayMismatch : false
    };
}

function getParsingFlags(m) {
    if (m._pf == null) {
        m._pf = defaultParsingFlags();
    }
    return m._pf;
}

var some;
if (Array.prototype.some) {
    some = Array.prototype.some;
} else {
    some = function (fun) {
        var t = Object(this);
        var len = t.length >>> 0;

        for (var i = 0; i < len; i++) {
            if (i in t && fun.call(this, t[i], i, t)) {
                return true;
            }
        }

        return false;
    };
}

var some$1 = some;

function isValid(m) {
    if (m._isValid == null) {
        var flags = getParsingFlags(m);
        var parsedParts = some$1.call(flags.parsedDateParts, function (i) {
            return i != null;
        });
        var isNowValid = !isNaN(m._d.getTime()) &&
            flags.overflow < 0 &&
            !flags.empty &&
            !flags.invalidMonth &&
            !flags.invalidWeekday &&
            !flags.nullInput &&
            !flags.invalidFormat &&
            !flags.userInvalidated &&
            (!flags.meridiem || (flags.meridiem && parsedParts));

        if (m._strict) {
            isNowValid = isNowValid &&
                flags.charsLeftOver === 0 &&
                flags.unusedTokens.length === 0 &&
                flags.bigHour === undefined;
        }

        if (Object.isFrozen == null || !Object.isFrozen(m)) {
            m._isValid = isNowValid;
        }
        else {
            return isNowValid;
        }
    }
    return m._isValid;
}

function createInvalid (flags) {
    var m = createUTC(NaN);
    if (flags != null) {
        extend(getParsingFlags(m), flags);
    }
    else {
        getParsingFlags(m).userInvalidated = true;
    }

    return m;
}

// Plugins that add properties should also add the key here (null value),
// so we can properly clone ourselves.
var momentProperties = hooks.momentProperties = [];

function copyConfig(to, from) {
    var i, prop, val;

    if (!isUndefined(from._isAMomentObject)) {
        to._isAMomentObject = from._isAMomentObject;
    }
    if (!isUndefined(from._i)) {
        to._i = from._i;
    }
    if (!isUndefined(from._f)) {
        to._f = from._f;
    }
    if (!isUndefined(from._l)) {
        to._l = from._l;
    }
    if (!isUndefined(from._strict)) {
        to._strict = from._strict;
    }
    if (!isUndefined(from._tzm)) {
        to._tzm = from._tzm;
    }
    if (!isUndefined(from._isUTC)) {
        to._isUTC = from._isUTC;
    }
    if (!isUndefined(from._offset)) {
        to._offset = from._offset;
    }
    if (!isUndefined(from._pf)) {
        to._pf = getParsingFlags(from);
    }
    if (!isUndefined(from._locale)) {
        to._locale = from._locale;
    }

    if (momentProperties.length > 0) {
        for (i = 0; i < momentProperties.length; i++) {
            prop = momentProperties[i];
            val = from[prop];
            if (!isUndefined(val)) {
                to[prop] = val;
            }
        }
    }

    return to;
}

var updateInProgress = false;

// Moment prototype object
function Moment(config) {
    copyConfig(this, config);
    this._d = new Date(config._d != null ? config._d.getTime() : NaN);
    if (!this.isValid()) {
        this._d = new Date(NaN);
    }
    // Prevent infinite loop in case updateOffset creates new moment
    // objects.
    if (updateInProgress === false) {
        updateInProgress = true;
        hooks.updateOffset(this);
        updateInProgress = false;
    }
}

function isMoment (obj) {
    return obj instanceof Moment || (obj != null && obj._isAMomentObject != null);
}

function absFloor (number) {
    if (number < 0) {
        // -0 -> 0
        return Math.ceil(number) || 0;
    } else {
        return Math.floor(number);
    }
}

function toInt(argumentForCoercion) {
    var coercedNumber = +argumentForCoercion,
        value = 0;

    if (coercedNumber !== 0 && isFinite(coercedNumber)) {
        value = absFloor(coercedNumber);
    }

    return value;
}

// compare two arrays, return the number of differences
function compareArrays(array1, array2, dontConvert) {
    var len = Math.min(array1.length, array2.length),
        lengthDiff = Math.abs(array1.length - array2.length),
        diffs = 0,
        i;
    for (i = 0; i < len; i++) {
        if ((dontConvert && array1[i] !== array2[i]) ||
            (!dontConvert && toInt(array1[i]) !== toInt(array2[i]))) {
            diffs++;
        }
    }
    return diffs + lengthDiff;
}

function warn(msg) {
    if (hooks.suppressDeprecationWarnings === false &&
            (typeof console !==  'undefined') && console.warn) {
        console.warn('Deprecation warning: ' + msg);
    }
}

function deprecate(msg, fn) {
    var firstTime = true;

    return extend(function () {
        if (hooks.deprecationHandler != null) {
            hooks.deprecationHandler(null, msg);
        }
        if (firstTime) {
            var args = [];
            var arg;
            for (var i = 0; i < arguments.length; i++) {
                arg = '';
                if (typeof arguments[i] === 'object') {
                    arg += '\n[' + i + '] ';
                    for (var key in arguments[0]) {
                        arg += key + ': ' + arguments[0][key] + ', ';
                    }
                    arg = arg.slice(0, -2); // Remove trailing comma and space
                } else {
                    arg = arguments[i];
                }
                args.push(arg);
            }
            warn(msg + '\nArguments: ' + Array.prototype.slice.call(args).join('') + '\n' + (new Error()).stack);
            firstTime = false;
        }
        return fn.apply(this, arguments);
    }, fn);
}

var deprecations = {};

function deprecateSimple(name, msg) {
    if (hooks.deprecationHandler != null) {
        hooks.deprecationHandler(name, msg);
    }
    if (!deprecations[name]) {
        warn(msg);
        deprecations[name] = true;
    }
}

hooks.suppressDeprecationWarnings = false;
hooks.deprecationHandler = null;

function isFunction(input) {
    return input instanceof Function || Object.prototype.toString.call(input) === '[object Function]';
}

function set (config) {
    var prop, i;
    for (i in config) {
        prop = config[i];
        if (isFunction(prop)) {
            this[i] = prop;
        } else {
            this['_' + i] = prop;
        }
    }
    this._config = config;
    // Lenient ordinal parsing accepts just a number in addition to
    // number + (possibly) stuff coming from _dayOfMonthOrdinalParse.
    // TODO: Remove "ordinalParse" fallback in next major release.
    this._dayOfMonthOrdinalParseLenient = new RegExp(
        (this._dayOfMonthOrdinalParse.source || this._ordinalParse.source) +
            '|' + (/\d{1,2}/).source);
}

function mergeConfigs(parentConfig, childConfig) {
    var res = extend({}, parentConfig), prop;
    for (prop in childConfig) {
        if (hasOwnProp(childConfig, prop)) {
            if (isObject(parentConfig[prop]) && isObject(childConfig[prop])) {
                res[prop] = {};
                extend(res[prop], parentConfig[prop]);
                extend(res[prop], childConfig[prop]);
            } else if (childConfig[prop] != null) {
                res[prop] = childConfig[prop];
            } else {
                delete res[prop];
            }
        }
    }
    for (prop in parentConfig) {
        if (hasOwnProp(parentConfig, prop) &&
                !hasOwnProp(childConfig, prop) &&
                isObject(parentConfig[prop])) {
            // make sure changes to properties don't modify parent config
            res[prop] = extend({}, res[prop]);
        }
    }
    return res;
}

function Locale(config) {
    if (config != null) {
        this.set(config);
    }
}

var keys;

if (Object.keys) {
    keys = Object.keys;
} else {
    keys = function (obj) {
        var i, res = [];
        for (i in obj) {
            if (hasOwnProp(obj, i)) {
                res.push(i);
            }
        }
        return res;
    };
}

var keys$1 = keys;

var defaultCalendar = {
    sameDay : '[Today at] LT',
    nextDay : '[Tomorrow at] LT',
    nextWeek : 'dddd [at] LT',
    lastDay : '[Yesterday at] LT',
    lastWeek : '[Last] dddd [at] LT',
    sameElse : 'L'
};

function calendar (key, mom, now) {
    var output = this._calendar[key] || this._calendar['sameElse'];
    return isFunction(output) ? output.call(mom, now) : output;
}

var defaultLongDateFormat = {
    LTS  : 'h:mm:ss A',
    LT   : 'h:mm A',
    L    : 'MM/DD/YYYY',
    LL   : 'MMMM D, YYYY',
    LLL  : 'MMMM D, YYYY h:mm A',
    LLLL : 'dddd, MMMM D, YYYY h:mm A'
};

function longDateFormat (key) {
    var format = this._longDateFormat[key],
        formatUpper = this._longDateFormat[key.toUpperCase()];

    if (format || !formatUpper) {
        return format;
    }

    this._longDateFormat[key] = formatUpper.replace(/MMMM|MM|DD|dddd/g, function (val) {
        return val.slice(1);
    });

    return this._longDateFormat[key];
}

var defaultInvalidDate = 'Invalid date';

function invalidDate () {
    return this._invalidDate;
}

var defaultOrdinal = '%d';
var defaultDayOfMonthOrdinalParse = /\d{1,2}/;

function ordinal (number) {
    return this._ordinal.replace('%d', number);
}

var defaultRelativeTime = {
    future : 'in %s',
    past   : '%s ago',
    s  : 'a few seconds',
    ss : '%d seconds',
    m  : 'a minute',
    mm : '%d minutes',
    h  : 'an hour',
    hh : '%d hours',
    d  : 'a day',
    dd : '%d days',
    M  : 'a month',
    MM : '%d months',
    y  : 'a year',
    yy : '%d years'
};

function relativeTime (number, withoutSuffix, string, isFuture) {
    var output = this._relativeTime[string];
    return (isFunction(output)) ?
        output(number, withoutSuffix, string, isFuture) :
        output.replace(/%d/i, number);
}

function pastFuture (diff, output) {
    var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
    return isFunction(format) ? format(output) : format.replace(/%s/i, output);
}

var aliases = {};

function addUnitAlias (unit, shorthand) {
    var lowerCase = unit.toLowerCase();
    aliases[lowerCase] = aliases[lowerCase + 's'] = aliases[shorthand] = unit;
}

function normalizeUnits(units) {
    return typeof units === 'string' ? aliases[units] || aliases[units.toLowerCase()] : undefined;
}

function normalizeObjectUnits(inputObject) {
    var normalizedInput = {},
        normalizedProp,
        prop;

    for (prop in inputObject) {
        if (hasOwnProp(inputObject, prop)) {
            normalizedProp = normalizeUnits(prop);
            if (normalizedProp) {
                normalizedInput[normalizedProp] = inputObject[prop];
            }
        }
    }

    return normalizedInput;
}

var priorities = {};

function addUnitPriority(unit, priority) {
    priorities[unit] = priority;
}

function getPrioritizedUnits(unitsObj) {
    var units = [];
    for (var u in unitsObj) {
        units.push({unit: u, priority: priorities[u]});
    }
    units.sort(function (a, b) {
        return a.priority - b.priority;
    });
    return units;
}

function makeGetSet (unit, keepTime) {
    return function (value) {
        if (value != null) {
            set$1(this, unit, value);
            hooks.updateOffset(this, keepTime);
            return this;
        } else {
            return get(this, unit);
        }
    };
}

function get (mom, unit) {
    return mom.isValid() ?
        mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]() : NaN;
}

function set$1 (mom, unit, value) {
    if (mom.isValid()) {
        mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);
    }
}

// MOMENTS

function stringGet (units) {
    units = normalizeUnits(units);
    if (isFunction(this[units])) {
        return this[units]();
    }
    return this;
}


function stringSet (units, value) {
    if (typeof units === 'object') {
        units = normalizeObjectUnits(units);
        var prioritized = getPrioritizedUnits(units);
        for (var i = 0; i < prioritized.length; i++) {
            this[prioritized[i].unit](units[prioritized[i].unit]);
        }
    } else {
        units = normalizeUnits(units);
        if (isFunction(this[units])) {
            return this[units](value);
        }
    }
    return this;
}

function zeroFill(number, targetLength, forceSign) {
    var absNumber = '' + Math.abs(number),
        zerosToFill = targetLength - absNumber.length,
        sign = number >= 0;
    return (sign ? (forceSign ? '+' : '') : '-') +
        Math.pow(10, Math.max(0, zerosToFill)).toString().substr(1) + absNumber;
}

var formattingTokens = /(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g;

var localFormattingTokens = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g;

var formatFunctions = {};

var formatTokenFunctions = {};

// token:    'M'
// padded:   ['MM', 2]
// ordinal:  'Mo'
// callback: function () { this.month() + 1 }
function addFormatToken (token, padded, ordinal, callback) {
    var func = callback;
    if (typeof callback === 'string') {
        func = function () {
            return this[callback]();
        };
    }
    if (token) {
        formatTokenFunctions[token] = func;
    }
    if (padded) {
        formatTokenFunctions[padded[0]] = function () {
            return zeroFill(func.apply(this, arguments), padded[1], padded[2]);
        };
    }
    if (ordinal) {
        formatTokenFunctions[ordinal] = function () {
            return this.localeData().ordinal(func.apply(this, arguments), token);
        };
    }
}

function removeFormattingTokens(input) {
    if (input.match(/\[[\s\S]/)) {
        return input.replace(/^\[|\]$/g, '');
    }
    return input.replace(/\\/g, '');
}

function makeFormatFunction(format) {
    var array = format.match(formattingTokens), i, length;

    for (i = 0, length = array.length; i < length; i++) {
        if (formatTokenFunctions[array[i]]) {
            array[i] = formatTokenFunctions[array[i]];
        } else {
            array[i] = removeFormattingTokens(array[i]);
        }
    }

    return function (mom) {
        var output = '', i;
        for (i = 0; i < length; i++) {
            output += isFunction(array[i]) ? array[i].call(mom, format) : array[i];
        }
        return output;
    };
}

// format date using native date object
function formatMoment(m, format) {
    if (!m.isValid()) {
        return m.localeData().invalidDate();
    }

    format = expandFormat(format, m.localeData());
    formatFunctions[format] = formatFunctions[format] || makeFormatFunction(format);

    return formatFunctions[format](m);
}

function expandFormat(format, locale) {
    var i = 5;

    function replaceLongDateFormatTokens(input) {
        return locale.longDateFormat(input) || input;
    }

    localFormattingTokens.lastIndex = 0;
    while (i >= 0 && localFormattingTokens.test(format)) {
        format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
        localFormattingTokens.lastIndex = 0;
        i -= 1;
    }

    return format;
}

var match1         = /\d/;            //       0 - 9
var match2         = /\d\d/;          //      00 - 99
var match3         = /\d{3}/;         //     000 - 999
var match4         = /\d{4}/;         //    0000 - 9999
var match6         = /[+-]?\d{6}/;    // -999999 - 999999
var match1to2      = /\d\d?/;         //       0 - 99
var match3to4      = /\d\d\d\d?/;     //     999 - 9999
var match5to6      = /\d\d\d\d\d\d?/; //   99999 - 999999
var match1to3      = /\d{1,3}/;       //       0 - 999
var match1to4      = /\d{1,4}/;       //       0 - 9999
var match1to6      = /[+-]?\d{1,6}/;  // -999999 - 999999

var matchUnsigned  = /\d+/;           //       0 - inf
var matchSigned    = /[+-]?\d+/;      //    -inf - inf

var matchOffset    = /Z|[+-]\d\d:?\d\d/gi; // +00:00 -00:00 +0000 -0000 or Z
var matchShortOffset = /Z|[+-]\d\d(?::?\d\d)?/gi; // +00 -00 +00:00 -00:00 +0000 -0000 or Z

var matchTimestamp = /[+-]?\d+(\.\d{1,3})?/; // 123456789 123456789.123

// any word (or two) characters or numbers including two/three word month in arabic.
// includes scottish gaelic two word and hyphenated months
var matchWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i;


var regexes = {};

function addRegexToken (token, regex, strictRegex) {
    regexes[token] = isFunction(regex) ? regex : function (isStrict, localeData) {
        return (isStrict && strictRegex) ? strictRegex : regex;
    };
}

function getParseRegexForToken (token, config) {
    if (!hasOwnProp(regexes, token)) {
        return new RegExp(unescapeFormat(token));
    }

    return regexes[token](config._strict, config._locale);
}

// Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
function unescapeFormat(s) {
    return regexEscape(s.replace('\\', '').replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (matched, p1, p2, p3, p4) {
        return p1 || p2 || p3 || p4;
    }));
}

function regexEscape(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

var tokens = {};

function addParseToken (token, callback) {
    var i, func = callback;
    if (typeof token === 'string') {
        token = [token];
    }
    if (isNumber(callback)) {
        func = function (input, array) {
            array[callback] = toInt(input);
        };
    }
    for (i = 0; i < token.length; i++) {
        tokens[token[i]] = func;
    }
}

function addWeekParseToken (token, callback) {
    addParseToken(token, function (input, array, config, token) {
        config._w = config._w || {};
        callback(input, config._w, config, token);
    });
}

function addTimeToArrayFromToken(token, input, config) {
    if (input != null && hasOwnProp(tokens, token)) {
        tokens[token](input, config._a, config, token);
    }
}

var YEAR = 0;
var MONTH = 1;
var DATE = 2;
var HOUR = 3;
var MINUTE = 4;
var SECOND = 5;
var MILLISECOND = 6;
var WEEK = 7;
var WEEKDAY = 8;

var indexOf;

if (Array.prototype.indexOf) {
    indexOf = Array.prototype.indexOf;
} else {
    indexOf = function (o) {
        // I know
        var i;
        for (i = 0; i < this.length; ++i) {
            if (this[i] === o) {
                return i;
            }
        }
        return -1;
    };
}

var indexOf$1 = indexOf;

function daysInMonth(year, month) {
    return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

// FORMATTING

addFormatToken('M', ['MM', 2], 'Mo', function () {
    return this.month() + 1;
});

addFormatToken('MMM', 0, 0, function (format) {
    return this.localeData().monthsShort(this, format);
});

addFormatToken('MMMM', 0, 0, function (format) {
    return this.localeData().months(this, format);
});

// ALIASES

addUnitAlias('month', 'M');

// PRIORITY

addUnitPriority('month', 8);

// PARSING

addRegexToken('M',    match1to2);
addRegexToken('MM',   match1to2, match2);
addRegexToken('MMM',  function (isStrict, locale) {
    return locale.monthsShortRegex(isStrict);
});
addRegexToken('MMMM', function (isStrict, locale) {
    return locale.monthsRegex(isStrict);
});

addParseToken(['M', 'MM'], function (input, array) {
    array[MONTH] = toInt(input) - 1;
});

addParseToken(['MMM', 'MMMM'], function (input, array, config, token) {
    var month = config._locale.monthsParse(input, token, config._strict);
    // if we didn't find a month name, mark the date as invalid.
    if (month != null) {
        array[MONTH] = month;
    } else {
        getParsingFlags(config).invalidMonth = input;
    }
});

// LOCALES

var MONTHS_IN_FORMAT = /D[oD]?(\[[^\[\]]*\]|\s)+MMMM?/;
var defaultLocaleMonths = 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_');
function localeMonths (m, format) {
    if (!m) {
        return isArray(this._months) ? this._months :
            this._months['standalone'];
    }
    return isArray(this._months) ? this._months[m.month()] :
        this._months[(this._months.isFormat || MONTHS_IN_FORMAT).test(format) ? 'format' : 'standalone'][m.month()];
}

var defaultLocaleMonthsShort = 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_');
function localeMonthsShort (m, format) {
    if (!m) {
        return isArray(this._monthsShort) ? this._monthsShort :
            this._monthsShort['standalone'];
    }
    return isArray(this._monthsShort) ? this._monthsShort[m.month()] :
        this._monthsShort[MONTHS_IN_FORMAT.test(format) ? 'format' : 'standalone'][m.month()];
}

function handleStrictParse(monthName, format, strict) {
    var i, ii, mom, llc = monthName.toLocaleLowerCase();
    if (!this._monthsParse) {
        // this is not used
        this._monthsParse = [];
        this._longMonthsParse = [];
        this._shortMonthsParse = [];
        for (i = 0; i < 12; ++i) {
            mom = createUTC([2000, i]);
            this._shortMonthsParse[i] = this.monthsShort(mom, '').toLocaleLowerCase();
            this._longMonthsParse[i] = this.months(mom, '').toLocaleLowerCase();
        }
    }

    if (strict) {
        if (format === 'MMM') {
            ii = indexOf$1.call(this._shortMonthsParse, llc);
            return ii !== -1 ? ii : null;
        } else {
            ii = indexOf$1.call(this._longMonthsParse, llc);
            return ii !== -1 ? ii : null;
        }
    } else {
        if (format === 'MMM') {
            ii = indexOf$1.call(this._shortMonthsParse, llc);
            if (ii !== -1) {
                return ii;
            }
            ii = indexOf$1.call(this._longMonthsParse, llc);
            return ii !== -1 ? ii : null;
        } else {
            ii = indexOf$1.call(this._longMonthsParse, llc);
            if (ii !== -1) {
                return ii;
            }
            ii = indexOf$1.call(this._shortMonthsParse, llc);
            return ii !== -1 ? ii : null;
        }
    }
}

function localeMonthsParse (monthName, format, strict) {
    var i, mom, regex;

    if (this._monthsParseExact) {
        return handleStrictParse.call(this, monthName, format, strict);
    }

    if (!this._monthsParse) {
        this._monthsParse = [];
        this._longMonthsParse = [];
        this._shortMonthsParse = [];
    }

    // TODO: add sorting
    // Sorting makes sure if one month (or abbr) is a prefix of another
    // see sorting in computeMonthsParse
    for (i = 0; i < 12; i++) {
        // make the regex if we don't have it already
        mom = createUTC([2000, i]);
        if (strict && !this._longMonthsParse[i]) {
            this._longMonthsParse[i] = new RegExp('^' + this.months(mom, '').replace('.', '') + '$', 'i');
            this._shortMonthsParse[i] = new RegExp('^' + this.monthsShort(mom, '').replace('.', '') + '$', 'i');
        }
        if (!strict && !this._monthsParse[i]) {
            regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
            this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
        }
        // test the regex
        if (strict && format === 'MMMM' && this._longMonthsParse[i].test(monthName)) {
            return i;
        } else if (strict && format === 'MMM' && this._shortMonthsParse[i].test(monthName)) {
            return i;
        } else if (!strict && this._monthsParse[i].test(monthName)) {
            return i;
        }
    }
}

// MOMENTS

function setMonth (mom, value) {
    var dayOfMonth;

    if (!mom.isValid()) {
        // No op
        return mom;
    }

    if (typeof value === 'string') {
        if (/^\d+$/.test(value)) {
            value = toInt(value);
        } else {
            value = mom.localeData().monthsParse(value);
            // TODO: Another silent failure?
            if (!isNumber(value)) {
                return mom;
            }
        }
    }

    dayOfMonth = Math.min(mom.date(), daysInMonth(mom.year(), value));
    mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'Month'](value, dayOfMonth);
    return mom;
}

function getSetMonth (value) {
    if (value != null) {
        setMonth(this, value);
        hooks.updateOffset(this, true);
        return this;
    } else {
        return get(this, 'Month');
    }
}

function getDaysInMonth () {
    return daysInMonth(this.year(), this.month());
}

var defaultMonthsShortRegex = matchWord;
function monthsShortRegex (isStrict) {
    if (this._monthsParseExact) {
        if (!hasOwnProp(this, '_monthsRegex')) {
            computeMonthsParse.call(this);
        }
        if (isStrict) {
            return this._monthsShortStrictRegex;
        } else {
            return this._monthsShortRegex;
        }
    } else {
        if (!hasOwnProp(this, '_monthsShortRegex')) {
            this._monthsShortRegex = defaultMonthsShortRegex;
        }
        return this._monthsShortStrictRegex && isStrict ?
            this._monthsShortStrictRegex : this._monthsShortRegex;
    }
}

var defaultMonthsRegex = matchWord;
function monthsRegex (isStrict) {
    if (this._monthsParseExact) {
        if (!hasOwnProp(this, '_monthsRegex')) {
            computeMonthsParse.call(this);
        }
        if (isStrict) {
            return this._monthsStrictRegex;
        } else {
            return this._monthsRegex;
        }
    } else {
        if (!hasOwnProp(this, '_monthsRegex')) {
            this._monthsRegex = defaultMonthsRegex;
        }
        return this._monthsStrictRegex && isStrict ?
            this._monthsStrictRegex : this._monthsRegex;
    }
}

function computeMonthsParse () {
    function cmpLenRev(a, b) {
        return b.length - a.length;
    }

    var shortPieces = [], longPieces = [], mixedPieces = [],
        i, mom;
    for (i = 0; i < 12; i++) {
        // make the regex if we don't have it already
        mom = createUTC([2000, i]);
        shortPieces.push(this.monthsShort(mom, ''));
        longPieces.push(this.months(mom, ''));
        mixedPieces.push(this.months(mom, ''));
        mixedPieces.push(this.monthsShort(mom, ''));
    }
    // Sorting makes sure if one month (or abbr) is a prefix of another it
    // will match the longer piece.
    shortPieces.sort(cmpLenRev);
    longPieces.sort(cmpLenRev);
    mixedPieces.sort(cmpLenRev);
    for (i = 0; i < 12; i++) {
        shortPieces[i] = regexEscape(shortPieces[i]);
        longPieces[i] = regexEscape(longPieces[i]);
    }
    for (i = 0; i < 24; i++) {
        mixedPieces[i] = regexEscape(mixedPieces[i]);
    }

    this._monthsRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
    this._monthsShortRegex = this._monthsRegex;
    this._monthsStrictRegex = new RegExp('^(' + longPieces.join('|') + ')', 'i');
    this._monthsShortStrictRegex = new RegExp('^(' + shortPieces.join('|') + ')', 'i');
}

// FORMATTING

addFormatToken('Y', 0, 0, function () {
    var y = this.year();
    return y <= 9999 ? '' + y : '+' + y;
});

addFormatToken(0, ['YY', 2], 0, function () {
    return this.year() % 100;
});

addFormatToken(0, ['YYYY',   4],       0, 'year');
addFormatToken(0, ['YYYYY',  5],       0, 'year');
addFormatToken(0, ['YYYYYY', 6, true], 0, 'year');

// ALIASES

addUnitAlias('year', 'y');

// PRIORITIES

addUnitPriority('year', 1);

// PARSING

addRegexToken('Y',      matchSigned);
addRegexToken('YY',     match1to2, match2);
addRegexToken('YYYY',   match1to4, match4);
addRegexToken('YYYYY',  match1to6, match6);
addRegexToken('YYYYYY', match1to6, match6);

addParseToken(['YYYYY', 'YYYYYY'], YEAR);
addParseToken('YYYY', function (input, array) {
    array[YEAR] = input.length === 2 ? hooks.parseTwoDigitYear(input) : toInt(input);
});
addParseToken('YY', function (input, array) {
    array[YEAR] = hooks.parseTwoDigitYear(input);
});
addParseToken('Y', function (input, array) {
    array[YEAR] = parseInt(input, 10);
});

// HELPERS

function daysInYear(year) {
    return isLeapYear(year) ? 366 : 365;
}

function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

// HOOKS

hooks.parseTwoDigitYear = function (input) {
    return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
};

// MOMENTS

var getSetYear = makeGetSet('FullYear', true);

function getIsLeapYear () {
    return isLeapYear(this.year());
}

function createDate (y, m, d, h, M, s, ms) {
    // can't just apply() to create a date:
    // https://stackoverflow.com/q/181348
    var date = new Date(y, m, d, h, M, s, ms);

    // the date constructor remaps years 0-99 to 1900-1999
    if (y < 100 && y >= 0 && isFinite(date.getFullYear())) {
        date.setFullYear(y);
    }
    return date;
}

function createUTCDate (y) {
    var date = new Date(Date.UTC.apply(null, arguments));

    // the Date.UTC function remaps years 0-99 to 1900-1999
    if (y < 100 && y >= 0 && isFinite(date.getUTCFullYear())) {
        date.setUTCFullYear(y);
    }
    return date;
}

// start-of-first-week - start-of-year
function firstWeekOffset(year, dow, doy) {
    var // first-week day -- which january is always in the first week (4 for iso, 1 for other)
        fwd = 7 + dow - doy,
        // first-week day local weekday -- which local weekday is fwd
        fwdlw = (7 + createUTCDate(year, 0, fwd).getUTCDay() - dow) % 7;

    return -fwdlw + fwd - 1;
}

// https://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
function dayOfYearFromWeeks(year, week, weekday, dow, doy) {
    var localWeekday = (7 + weekday - dow) % 7,
        weekOffset = firstWeekOffset(year, dow, doy),
        dayOfYear = 1 + 7 * (week - 1) + localWeekday + weekOffset,
        resYear, resDayOfYear;

    if (dayOfYear <= 0) {
        resYear = year - 1;
        resDayOfYear = daysInYear(resYear) + dayOfYear;
    } else if (dayOfYear > daysInYear(year)) {
        resYear = year + 1;
        resDayOfYear = dayOfYear - daysInYear(year);
    } else {
        resYear = year;
        resDayOfYear = dayOfYear;
    }

    return {
        year: resYear,
        dayOfYear: resDayOfYear
    };
}

function weekOfYear(mom, dow, doy) {
    var weekOffset = firstWeekOffset(mom.year(), dow, doy),
        week = Math.floor((mom.dayOfYear() - weekOffset - 1) / 7) + 1,
        resWeek, resYear;

    if (week < 1) {
        resYear = mom.year() - 1;
        resWeek = week + weeksInYear(resYear, dow, doy);
    } else if (week > weeksInYear(mom.year(), dow, doy)) {
        resWeek = week - weeksInYear(mom.year(), dow, doy);
        resYear = mom.year() + 1;
    } else {
        resYear = mom.year();
        resWeek = week;
    }

    return {
        week: resWeek,
        year: resYear
    };
}

function weeksInYear(year, dow, doy) {
    var weekOffset = firstWeekOffset(year, dow, doy),
        weekOffsetNext = firstWeekOffset(year + 1, dow, doy);
    return (daysInYear(year) - weekOffset + weekOffsetNext) / 7;
}

// FORMATTING

addFormatToken('w', ['ww', 2], 'wo', 'week');
addFormatToken('W', ['WW', 2], 'Wo', 'isoWeek');

// ALIASES

addUnitAlias('week', 'w');
addUnitAlias('isoWeek', 'W');

// PRIORITIES

addUnitPriority('week', 5);
addUnitPriority('isoWeek', 5);

// PARSING

addRegexToken('w',  match1to2);
addRegexToken('ww', match1to2, match2);
addRegexToken('W',  match1to2);
addRegexToken('WW', match1to2, match2);

addWeekParseToken(['w', 'ww', 'W', 'WW'], function (input, week, config, token) {
    week[token.substr(0, 1)] = toInt(input);
});

// HELPERS

// LOCALES

function localeWeek (mom) {
    return weekOfYear(mom, this._week.dow, this._week.doy).week;
}

var defaultLocaleWeek = {
    dow : 0, // Sunday is the first day of the week.
    doy : 6  // The week that contains Jan 1st is the first week of the year.
};

function localeFirstDayOfWeek () {
    return this._week.dow;
}

function localeFirstDayOfYear () {
    return this._week.doy;
}

// MOMENTS

function getSetWeek (input) {
    var week = this.localeData().week(this);
    return input == null ? week : this.add((input - week) * 7, 'd');
}

function getSetISOWeek (input) {
    var week = weekOfYear(this, 1, 4).week;
    return input == null ? week : this.add((input - week) * 7, 'd');
}

// FORMATTING

addFormatToken('d', 0, 'do', 'day');

addFormatToken('dd', 0, 0, function (format) {
    return this.localeData().weekdaysMin(this, format);
});

addFormatToken('ddd', 0, 0, function (format) {
    return this.localeData().weekdaysShort(this, format);
});

addFormatToken('dddd', 0, 0, function (format) {
    return this.localeData().weekdays(this, format);
});

addFormatToken('e', 0, 0, 'weekday');
addFormatToken('E', 0, 0, 'isoWeekday');

// ALIASES

addUnitAlias('day', 'd');
addUnitAlias('weekday', 'e');
addUnitAlias('isoWeekday', 'E');

// PRIORITY
addUnitPriority('day', 11);
addUnitPriority('weekday', 11);
addUnitPriority('isoWeekday', 11);

// PARSING

addRegexToken('d',    match1to2);
addRegexToken('e',    match1to2);
addRegexToken('E',    match1to2);
addRegexToken('dd',   function (isStrict, locale) {
    return locale.weekdaysMinRegex(isStrict);
});
addRegexToken('ddd',   function (isStrict, locale) {
    return locale.weekdaysShortRegex(isStrict);
});
addRegexToken('dddd',   function (isStrict, locale) {
    return locale.weekdaysRegex(isStrict);
});

addWeekParseToken(['dd', 'ddd', 'dddd'], function (input, week, config, token) {
    var weekday = config._locale.weekdaysParse(input, token, config._strict);
    // if we didn't get a weekday name, mark the date as invalid
    if (weekday != null) {
        week.d = weekday;
    } else {
        getParsingFlags(config).invalidWeekday = input;
    }
});

addWeekParseToken(['d', 'e', 'E'], function (input, week, config, token) {
    week[token] = toInt(input);
});

// HELPERS

function parseWeekday(input, locale) {
    if (typeof input !== 'string') {
        return input;
    }

    if (!isNaN(input)) {
        return parseInt(input, 10);
    }

    input = locale.weekdaysParse(input);
    if (typeof input === 'number') {
        return input;
    }

    return null;
}

function parseIsoWeekday(input, locale) {
    if (typeof input === 'string') {
        return locale.weekdaysParse(input) % 7 || 7;
    }
    return isNaN(input) ? null : input;
}

// LOCALES

var defaultLocaleWeekdays = 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_');
function localeWeekdays (m, format) {
    if (!m) {
        return isArray(this._weekdays) ? this._weekdays :
            this._weekdays['standalone'];
    }
    return isArray(this._weekdays) ? this._weekdays[m.day()] :
        this._weekdays[this._weekdays.isFormat.test(format) ? 'format' : 'standalone'][m.day()];
}

var defaultLocaleWeekdaysShort = 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_');
function localeWeekdaysShort (m) {
    return (m) ? this._weekdaysShort[m.day()] : this._weekdaysShort;
}

var defaultLocaleWeekdaysMin = 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_');
function localeWeekdaysMin (m) {
    return (m) ? this._weekdaysMin[m.day()] : this._weekdaysMin;
}

function handleStrictParse$1(weekdayName, format, strict) {
    var i, ii, mom, llc = weekdayName.toLocaleLowerCase();
    if (!this._weekdaysParse) {
        this._weekdaysParse = [];
        this._shortWeekdaysParse = [];
        this._minWeekdaysParse = [];

        for (i = 0; i < 7; ++i) {
            mom = createUTC([2000, 1]).day(i);
            this._minWeekdaysParse[i] = this.weekdaysMin(mom, '').toLocaleLowerCase();
            this._shortWeekdaysParse[i] = this.weekdaysShort(mom, '').toLocaleLowerCase();
            this._weekdaysParse[i] = this.weekdays(mom, '').toLocaleLowerCase();
        }
    }

    if (strict) {
        if (format === 'dddd') {
            ii = indexOf$1.call(this._weekdaysParse, llc);
            return ii !== -1 ? ii : null;
        } else if (format === 'ddd') {
            ii = indexOf$1.call(this._shortWeekdaysParse, llc);
            return ii !== -1 ? ii : null;
        } else {
            ii = indexOf$1.call(this._minWeekdaysParse, llc);
            return ii !== -1 ? ii : null;
        }
    } else {
        if (format === 'dddd') {
            ii = indexOf$1.call(this._weekdaysParse, llc);
            if (ii !== -1) {
                return ii;
            }
            ii = indexOf$1.call(this._shortWeekdaysParse, llc);
            if (ii !== -1) {
                return ii;
            }
            ii = indexOf$1.call(this._minWeekdaysParse, llc);
            return ii !== -1 ? ii : null;
        } else if (format === 'ddd') {
            ii = indexOf$1.call(this._shortWeekdaysParse, llc);
            if (ii !== -1) {
                return ii;
            }
            ii = indexOf$1.call(this._weekdaysParse, llc);
            if (ii !== -1) {
                return ii;
            }
            ii = indexOf$1.call(this._minWeekdaysParse, llc);
            return ii !== -1 ? ii : null;
        } else {
            ii = indexOf$1.call(this._minWeekdaysParse, llc);
            if (ii !== -1) {
                return ii;
            }
            ii = indexOf$1.call(this._weekdaysParse, llc);
            if (ii !== -1) {
                return ii;
            }
            ii = indexOf$1.call(this._shortWeekdaysParse, llc);
            return ii !== -1 ? ii : null;
        }
    }
}

function localeWeekdaysParse (weekdayName, format, strict) {
    var i, mom, regex;

    if (this._weekdaysParseExact) {
        return handleStrictParse$1.call(this, weekdayName, format, strict);
    }

    if (!this._weekdaysParse) {
        this._weekdaysParse = [];
        this._minWeekdaysParse = [];
        this._shortWeekdaysParse = [];
        this._fullWeekdaysParse = [];
    }

    for (i = 0; i < 7; i++) {
        // make the regex if we don't have it already

        mom = createUTC([2000, 1]).day(i);
        if (strict && !this._fullWeekdaysParse[i]) {
            this._fullWeekdaysParse[i] = new RegExp('^' + this.weekdays(mom, '').replace('.', '\.?') + '$', 'i');
            this._shortWeekdaysParse[i] = new RegExp('^' + this.weekdaysShort(mom, '').replace('.', '\.?') + '$', 'i');
            this._minWeekdaysParse[i] = new RegExp('^' + this.weekdaysMin(mom, '').replace('.', '\.?') + '$', 'i');
        }
        if (!this._weekdaysParse[i]) {
            regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
            this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
        }
        // test the regex
        if (strict && format === 'dddd' && this._fullWeekdaysParse[i].test(weekdayName)) {
            return i;
        } else if (strict && format === 'ddd' && this._shortWeekdaysParse[i].test(weekdayName)) {
            return i;
        } else if (strict && format === 'dd' && this._minWeekdaysParse[i].test(weekdayName)) {
            return i;
        } else if (!strict && this._weekdaysParse[i].test(weekdayName)) {
            return i;
        }
    }
}

// MOMENTS

function getSetDayOfWeek (input) {
    if (!this.isValid()) {
        return input != null ? this : NaN;
    }
    var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
    if (input != null) {
        input = parseWeekday(input, this.localeData());
        return this.add(input - day, 'd');
    } else {
        return day;
    }
}

function getSetLocaleDayOfWeek (input) {
    if (!this.isValid()) {
        return input != null ? this : NaN;
    }
    var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
    return input == null ? weekday : this.add(input - weekday, 'd');
}

function getSetISODayOfWeek (input) {
    if (!this.isValid()) {
        return input != null ? this : NaN;
    }

    // behaves the same as moment#day except
    // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
    // as a setter, sunday should belong to the previous week.

    if (input != null) {
        var weekday = parseIsoWeekday(input, this.localeData());
        return this.day(this.day() % 7 ? weekday : weekday - 7);
    } else {
        return this.day() || 7;
    }
}

var defaultWeekdaysRegex = matchWord;
function weekdaysRegex (isStrict) {
    if (this._weekdaysParseExact) {
        if (!hasOwnProp(this, '_weekdaysRegex')) {
            computeWeekdaysParse.call(this);
        }
        if (isStrict) {
            return this._weekdaysStrictRegex;
        } else {
            return this._weekdaysRegex;
        }
    } else {
        if (!hasOwnProp(this, '_weekdaysRegex')) {
            this._weekdaysRegex = defaultWeekdaysRegex;
        }
        return this._weekdaysStrictRegex && isStrict ?
            this._weekdaysStrictRegex : this._weekdaysRegex;
    }
}

var defaultWeekdaysShortRegex = matchWord;
function weekdaysShortRegex (isStrict) {
    if (this._weekdaysParseExact) {
        if (!hasOwnProp(this, '_weekdaysRegex')) {
            computeWeekdaysParse.call(this);
        }
        if (isStrict) {
            return this._weekdaysShortStrictRegex;
        } else {
            return this._weekdaysShortRegex;
        }
    } else {
        if (!hasOwnProp(this, '_weekdaysShortRegex')) {
            this._weekdaysShortRegex = defaultWeekdaysShortRegex;
        }
        return this._weekdaysShortStrictRegex && isStrict ?
            this._weekdaysShortStrictRegex : this._weekdaysShortRegex;
    }
}

var defaultWeekdaysMinRegex = matchWord;
function weekdaysMinRegex (isStrict) {
    if (this._weekdaysParseExact) {
        if (!hasOwnProp(this, '_weekdaysRegex')) {
            computeWeekdaysParse.call(this);
        }
        if (isStrict) {
            return this._weekdaysMinStrictRegex;
        } else {
            return this._weekdaysMinRegex;
        }
    } else {
        if (!hasOwnProp(this, '_weekdaysMinRegex')) {
            this._weekdaysMinRegex = defaultWeekdaysMinRegex;
        }
        return this._weekdaysMinStrictRegex && isStrict ?
            this._weekdaysMinStrictRegex : this._weekdaysMinRegex;
    }
}


function computeWeekdaysParse () {
    function cmpLenRev(a, b) {
        return b.length - a.length;
    }

    var minPieces = [], shortPieces = [], longPieces = [], mixedPieces = [],
        i, mom, minp, shortp, longp;
    for (i = 0; i < 7; i++) {
        // make the regex if we don't have it already
        mom = createUTC([2000, 1]).day(i);
        minp = this.weekdaysMin(mom, '');
        shortp = this.weekdaysShort(mom, '');
        longp = this.weekdays(mom, '');
        minPieces.push(minp);
        shortPieces.push(shortp);
        longPieces.push(longp);
        mixedPieces.push(minp);
        mixedPieces.push(shortp);
        mixedPieces.push(longp);
    }
    // Sorting makes sure if one weekday (or abbr) is a prefix of another it
    // will match the longer piece.
    minPieces.sort(cmpLenRev);
    shortPieces.sort(cmpLenRev);
    longPieces.sort(cmpLenRev);
    mixedPieces.sort(cmpLenRev);
    for (i = 0; i < 7; i++) {
        shortPieces[i] = regexEscape(shortPieces[i]);
        longPieces[i] = regexEscape(longPieces[i]);
        mixedPieces[i] = regexEscape(mixedPieces[i]);
    }

    this._weekdaysRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
    this._weekdaysShortRegex = this._weekdaysRegex;
    this._weekdaysMinRegex = this._weekdaysRegex;

    this._weekdaysStrictRegex = new RegExp('^(' + longPieces.join('|') + ')', 'i');
    this._weekdaysShortStrictRegex = new RegExp('^(' + shortPieces.join('|') + ')', 'i');
    this._weekdaysMinStrictRegex = new RegExp('^(' + minPieces.join('|') + ')', 'i');
}

// FORMATTING

function hFormat() {
    return this.hours() % 12 || 12;
}

function kFormat() {
    return this.hours() || 24;
}

addFormatToken('H', ['HH', 2], 0, 'hour');
addFormatToken('h', ['hh', 2], 0, hFormat);
addFormatToken('k', ['kk', 2], 0, kFormat);

addFormatToken('hmm', 0, 0, function () {
    return '' + hFormat.apply(this) + zeroFill(this.minutes(), 2);
});

addFormatToken('hmmss', 0, 0, function () {
    return '' + hFormat.apply(this) + zeroFill(this.minutes(), 2) +
        zeroFill(this.seconds(), 2);
});

addFormatToken('Hmm', 0, 0, function () {
    return '' + this.hours() + zeroFill(this.minutes(), 2);
});

addFormatToken('Hmmss', 0, 0, function () {
    return '' + this.hours() + zeroFill(this.minutes(), 2) +
        zeroFill(this.seconds(), 2);
});

function meridiem (token, lowercase) {
    addFormatToken(token, 0, 0, function () {
        return this.localeData().meridiem(this.hours(), this.minutes(), lowercase);
    });
}

meridiem('a', true);
meridiem('A', false);

// ALIASES

addUnitAlias('hour', 'h');

// PRIORITY
addUnitPriority('hour', 13);

// PARSING

function matchMeridiem (isStrict, locale) {
    return locale._meridiemParse;
}

addRegexToken('a',  matchMeridiem);
addRegexToken('A',  matchMeridiem);
addRegexToken('H',  match1to2);
addRegexToken('h',  match1to2);
addRegexToken('k',  match1to2);
addRegexToken('HH', match1to2, match2);
addRegexToken('hh', match1to2, match2);
addRegexToken('kk', match1to2, match2);

addRegexToken('hmm', match3to4);
addRegexToken('hmmss', match5to6);
addRegexToken('Hmm', match3to4);
addRegexToken('Hmmss', match5to6);

addParseToken(['H', 'HH'], HOUR);
addParseToken(['k', 'kk'], function (input, array, config) {
    var kInput = toInt(input);
    array[HOUR] = kInput === 24 ? 0 : kInput;
});
addParseToken(['a', 'A'], function (input, array, config) {
    config._isPm = config._locale.isPM(input);
    config._meridiem = input;
});
addParseToken(['h', 'hh'], function (input, array, config) {
    array[HOUR] = toInt(input);
    getParsingFlags(config).bigHour = true;
});
addParseToken('hmm', function (input, array, config) {
    var pos = input.length - 2;
    array[HOUR] = toInt(input.substr(0, pos));
    array[MINUTE] = toInt(input.substr(pos));
    getParsingFlags(config).bigHour = true;
});
addParseToken('hmmss', function (input, array, config) {
    var pos1 = input.length - 4;
    var pos2 = input.length - 2;
    array[HOUR] = toInt(input.substr(0, pos1));
    array[MINUTE] = toInt(input.substr(pos1, 2));
    array[SECOND] = toInt(input.substr(pos2));
    getParsingFlags(config).bigHour = true;
});
addParseToken('Hmm', function (input, array, config) {
    var pos = input.length - 2;
    array[HOUR] = toInt(input.substr(0, pos));
    array[MINUTE] = toInt(input.substr(pos));
});
addParseToken('Hmmss', function (input, array, config) {
    var pos1 = input.length - 4;
    var pos2 = input.length - 2;
    array[HOUR] = toInt(input.substr(0, pos1));
    array[MINUTE] = toInt(input.substr(pos1, 2));
    array[SECOND] = toInt(input.substr(pos2));
});

// LOCALES

function localeIsPM (input) {
    // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
    // Using charAt should be more compatible.
    return ((input + '').toLowerCase().charAt(0) === 'p');
}

var defaultLocaleMeridiemParse = /[ap]\.?m?\.?/i;
function localeMeridiem (hours, minutes, isLower) {
    if (hours > 11) {
        return isLower ? 'pm' : 'PM';
    } else {
        return isLower ? 'am' : 'AM';
    }
}


// MOMENTS

// Setting the hour should keep the time, because the user explicitly
// specified which hour he wants. So trying to maintain the same hour (in
// a new timezone) makes sense. Adding/subtracting hours does not follow
// this rule.
var getSetHour = makeGetSet('Hours', true);

// months
// week
// weekdays
// meridiem
var baseConfig = {
    calendar: defaultCalendar,
    longDateFormat: defaultLongDateFormat,
    invalidDate: defaultInvalidDate,
    ordinal: defaultOrdinal,
    dayOfMonthOrdinalParse: defaultDayOfMonthOrdinalParse,
    relativeTime: defaultRelativeTime,

    months: defaultLocaleMonths,
    monthsShort: defaultLocaleMonthsShort,

    week: defaultLocaleWeek,

    weekdays: defaultLocaleWeekdays,
    weekdaysMin: defaultLocaleWeekdaysMin,
    weekdaysShort: defaultLocaleWeekdaysShort,

    meridiemParse: defaultLocaleMeridiemParse
};

// internal storage for locale config files
var locales = {};
var localeFamilies = {};
var globalLocale;

function normalizeLocale(key) {
    return key ? key.toLowerCase().replace('_', '-') : key;
}

// pick the locale from the array
// try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
// substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
function chooseLocale(names) {
    var i = 0, j, next, locale, split;

    while (i < names.length) {
        split = normalizeLocale(names[i]).split('-');
        j = split.length;
        next = normalizeLocale(names[i + 1]);
        next = next ? next.split('-') : null;
        while (j > 0) {
            locale = loadLocale(split.slice(0, j).join('-'));
            if (locale) {
                return locale;
            }
            if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {
                //the next array item is better than a shallower substring of this one
                break;
            }
            j--;
        }
        i++;
    }
    return null;
}

function loadLocale(name) {
    var oldLocale = null;
    // TODO: Find a better way to register and load all the locales in Node
    if (!locales[name] && (typeof module !== 'undefined') &&
            module && module.exports) {
        try {
            oldLocale = globalLocale._abbr;
            require('./locale/' + name);
            // because defineLocale currently also sets the global locale, we
            // want to undo that for lazy loaded locales
            getSetGlobalLocale(oldLocale);
        } catch (e) { }
    }
    return locales[name];
}

// This function will load locale and then set the global locale.  If
// no arguments are passed in, it will simply return the current global
// locale key.
function getSetGlobalLocale (key, values) {
    var data;
    if (key) {
        if (isUndefined(values)) {
            data = getLocale(key);
        }
        else {
            data = defineLocale(key, values);
        }

        if (data) {
            // moment.duration._locale = moment._locale = data;
            globalLocale = data;
        }
    }

    return globalLocale._abbr;
}

function defineLocale (name, config) {
    if (config !== null) {
        var parentConfig = baseConfig;
        config.abbr = name;
        if (locales[name] != null) {
            deprecateSimple('defineLocaleOverride',
                    'use moment.updateLocale(localeName, config) to change ' +
                    'an existing locale. moment.defineLocale(localeName, ' +
                    'config) should only be used for creating a new locale ' +
                    'See http://momentjs.com/guides/#/warnings/define-locale/ for more info.');
            parentConfig = locales[name]._config;
        } else if (config.parentLocale != null) {
            if (locales[config.parentLocale] != null) {
                parentConfig = locales[config.parentLocale]._config;
            } else {
                if (!localeFamilies[config.parentLocale]) {
                    localeFamilies[config.parentLocale] = [];
                }
                localeFamilies[config.parentLocale].push({
                    name: name,
                    config: config
                });
                return null;
            }
        }
        locales[name] = new Locale(mergeConfigs(parentConfig, config));

        if (localeFamilies[name]) {
            localeFamilies[name].forEach(function (x) {
                defineLocale(x.name, x.config);
            });
        }

        // backwards compat for now: also set the locale
        // make sure we set the locale AFTER all child locales have been
        // created, so we won't end up with the child locale set.
        getSetGlobalLocale(name);


        return locales[name];
    } else {
        // useful for testing
        delete locales[name];
        return null;
    }
}

function updateLocale(name, config) {
    if (config != null) {
        var locale, parentConfig = baseConfig;
        // MERGE
        if (locales[name] != null) {
            parentConfig = locales[name]._config;
        }
        config = mergeConfigs(parentConfig, config);
        locale = new Locale(config);
        locale.parentLocale = locales[name];
        locales[name] = locale;

        // backwards compat for now: also set the locale
        getSetGlobalLocale(name);
    } else {
        // pass null for config to unupdate, useful for tests
        if (locales[name] != null) {
            if (locales[name].parentLocale != null) {
                locales[name] = locales[name].parentLocale;
            } else if (locales[name] != null) {
                delete locales[name];
            }
        }
    }
    return locales[name];
}

// returns locale data
function getLocale (key) {
    var locale;

    if (key && key._locale && key._locale._abbr) {
        key = key._locale._abbr;
    }

    if (!key) {
        return globalLocale;
    }

    if (!isArray(key)) {
        //short-circuit everything else
        locale = loadLocale(key);
        if (locale) {
            return locale;
        }
        key = [key];
    }

    return chooseLocale(key);
}

function listLocales() {
    return keys$1(locales);
}

function checkOverflow (m) {
    var overflow;
    var a = m._a;

    if (a && getParsingFlags(m).overflow === -2) {
        overflow =
            a[MONTH]       < 0 || a[MONTH]       > 11  ? MONTH :
            a[DATE]        < 1 || a[DATE]        > daysInMonth(a[YEAR], a[MONTH]) ? DATE :
            a[HOUR]        < 0 || a[HOUR]        > 24 || (a[HOUR] === 24 && (a[MINUTE] !== 0 || a[SECOND] !== 0 || a[MILLISECOND] !== 0)) ? HOUR :
            a[MINUTE]      < 0 || a[MINUTE]      > 59  ? MINUTE :
            a[SECOND]      < 0 || a[SECOND]      > 59  ? SECOND :
            a[MILLISECOND] < 0 || a[MILLISECOND] > 999 ? MILLISECOND :
            -1;

        if (getParsingFlags(m)._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
            overflow = DATE;
        }
        if (getParsingFlags(m)._overflowWeeks && overflow === -1) {
            overflow = WEEK;
        }
        if (getParsingFlags(m)._overflowWeekday && overflow === -1) {
            overflow = WEEKDAY;
        }

        getParsingFlags(m).overflow = overflow;
    }

    return m;
}

// iso 8601 regex
// 0000-00-00 0000-W00 or 0000-W00-0 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000 or +00)
var extendedIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/;
var basicIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/;

var tzRegex = /Z|[+-]\d\d(?::?\d\d)?/;

var isoDates = [
    ['YYYYYY-MM-DD', /[+-]\d{6}-\d\d-\d\d/],
    ['YYYY-MM-DD', /\d{4}-\d\d-\d\d/],
    ['GGGG-[W]WW-E', /\d{4}-W\d\d-\d/],
    ['GGGG-[W]WW', /\d{4}-W\d\d/, false],
    ['YYYY-DDD', /\d{4}-\d{3}/],
    ['YYYY-MM', /\d{4}-\d\d/, false],
    ['YYYYYYMMDD', /[+-]\d{10}/],
    ['YYYYMMDD', /\d{8}/],
    // YYYYMM is NOT allowed by the standard
    ['GGGG[W]WWE', /\d{4}W\d{3}/],
    ['GGGG[W]WW', /\d{4}W\d{2}/, false],
    ['YYYYDDD', /\d{7}/]
];

// iso time formats and regexes
var isoTimes = [
    ['HH:mm:ss.SSSS', /\d\d:\d\d:\d\d\.\d+/],
    ['HH:mm:ss,SSSS', /\d\d:\d\d:\d\d,\d+/],
    ['HH:mm:ss', /\d\d:\d\d:\d\d/],
    ['HH:mm', /\d\d:\d\d/],
    ['HHmmss.SSSS', /\d\d\d\d\d\d\.\d+/],
    ['HHmmss,SSSS', /\d\d\d\d\d\d,\d+/],
    ['HHmmss', /\d\d\d\d\d\d/],
    ['HHmm', /\d\d\d\d/],
    ['HH', /\d\d/]
];

var aspNetJsonRegex = /^\/?Date\((\-?\d+)/i;

// date from iso format
function configFromISO(config) {
    var i, l,
        string = config._i,
        match = extendedIsoRegex.exec(string) || basicIsoRegex.exec(string),
        allowTime, dateFormat, timeFormat, tzFormat;

    if (match) {
        getParsingFlags(config).iso = true;

        for (i = 0, l = isoDates.length; i < l; i++) {
            if (isoDates[i][1].exec(match[1])) {
                dateFormat = isoDates[i][0];
                allowTime = isoDates[i][2] !== false;
                break;
            }
        }
        if (dateFormat == null) {
            config._isValid = false;
            return;
        }
        if (match[3]) {
            for (i = 0, l = isoTimes.length; i < l; i++) {
                if (isoTimes[i][1].exec(match[3])) {
                    // match[2] should be 'T' or space
                    timeFormat = (match[2] || ' ') + isoTimes[i][0];
                    break;
                }
            }
            if (timeFormat == null) {
                config._isValid = false;
                return;
            }
        }
        if (!allowTime && timeFormat != null) {
            config._isValid = false;
            return;
        }
        if (match[4]) {
            if (tzRegex.exec(match[4])) {
                tzFormat = 'Z';
            } else {
                config._isValid = false;
                return;
            }
        }
        config._f = dateFormat + (timeFormat || '') + (tzFormat || '');
        configFromStringAndFormat(config);
    } else {
        config._isValid = false;
    }
}

// RFC 2822 regex: For details see https://tools.ietf.org/html/rfc2822#section-3.3
var basicRfcRegex = /^((?:Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s)?(\d?\d\s(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(?:\d\d)?\d\d\s)(\d\d:\d\d)(\:\d\d)?(\s(?:UT|GMT|[ECMP][SD]T|[A-IK-Za-ik-z]|[+-]\d{4}))$/;

// date and time from ref 2822 format
function configFromRFC2822(config) {
    var string, match, dayFormat,
        dateFormat, timeFormat, tzFormat;
    var timezones = {
        ' GMT': ' +0000',
        ' EDT': ' -0400',
        ' EST': ' -0500',
        ' CDT': ' -0500',
        ' CST': ' -0600',
        ' MDT': ' -0600',
        ' MST': ' -0700',
        ' PDT': ' -0700',
        ' PST': ' -0800'
    };
    var military = 'YXWVUTSRQPONZABCDEFGHIKLM';
    var timezone, timezoneIndex;

    string = config._i
        .replace(/\([^\)]*\)|[\n\t]/g, ' ') // Remove comments and folding whitespace
        .replace(/(\s\s+)/g, ' ') // Replace multiple-spaces with a single space
        .replace(/^\s|\s$/g, ''); // Remove leading and trailing spaces
    match = basicRfcRegex.exec(string);

    if (match) {
        dayFormat = match[1] ? 'ddd' + ((match[1].length === 5) ? ', ' : ' ') : '';
        dateFormat = 'D MMM ' + ((match[2].length > 10) ? 'YYYY ' : 'YY ');
        timeFormat = 'HH:mm' + (match[4] ? ':ss' : '');

        // TODO: Replace the vanilla JS Date object with an indepentent day-of-week check.
        if (match[1]) { // day of week given
            var momentDate = new Date(match[2]);
            var momentDay = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][momentDate.getDay()];

            if (match[1].substr(0,3) !== momentDay) {
                getParsingFlags(config).weekdayMismatch = true;
                config._isValid = false;
                return;
            }
        }

        switch (match[5].length) {
            case 2: // military
                if (timezoneIndex === 0) {
                    timezone = ' +0000';
                } else {
                    timezoneIndex = military.indexOf(match[5][1].toUpperCase()) - 12;
                    timezone = ((timezoneIndex < 0) ? ' -' : ' +') +
                        (('' + timezoneIndex).replace(/^-?/, '0')).match(/..$/)[0] + '00';
                }
                break;
            case 4: // Zone
                timezone = timezones[match[5]];
                break;
            default: // UT or +/-9999
                timezone = timezones[' GMT'];
        }
        match[5] = timezone;
        config._i = match.splice(1).join('');
        tzFormat = ' ZZ';
        config._f = dayFormat + dateFormat + timeFormat + tzFormat;
        configFromStringAndFormat(config);
        getParsingFlags(config).rfc2822 = true;
    } else {
        config._isValid = false;
    }
}

// date from iso format or fallback
function configFromString(config) {
    var matched = aspNetJsonRegex.exec(config._i);

    if (matched !== null) {
        config._d = new Date(+matched[1]);
        return;
    }

    configFromISO(config);
    if (config._isValid === false) {
        delete config._isValid;
    } else {
        return;
    }

    configFromRFC2822(config);
    if (config._isValid === false) {
        delete config._isValid;
    } else {
        return;
    }

    // Final attempt, use Input Fallback
    hooks.createFromInputFallback(config);
}

hooks.createFromInputFallback = deprecate(
    'value provided is not in a recognized RFC2822 or ISO format. moment construction falls back to js Date(), ' +
    'which is not reliable across all browsers and versions. Non RFC2822/ISO date formats are ' +
    'discouraged and will be removed in an upcoming major release. Please refer to ' +
    'http://momentjs.com/guides/#/warnings/js-date/ for more info.',
    function (config) {
        config._d = new Date(config._i + (config._useUTC ? ' UTC' : ''));
    }
);

// Pick the first defined of two or three arguments.
function defaults(a, b, c) {
    if (a != null) {
        return a;
    }
    if (b != null) {
        return b;
    }
    return c;
}

function currentDateArray(config) {
    // hooks is actually the exported moment object
    var nowValue = new Date(hooks.now());
    if (config._useUTC) {
        return [nowValue.getUTCFullYear(), nowValue.getUTCMonth(), nowValue.getUTCDate()];
    }
    return [nowValue.getFullYear(), nowValue.getMonth(), nowValue.getDate()];
}

// convert an array to a date.
// the array should mirror the parameters below
// note: all values past the year are optional and will default to the lowest possible value.
// [year, month, day , hour, minute, second, millisecond]
function configFromArray (config) {
    var i, date, input = [], currentDate, yearToUse;

    if (config._d) {
        return;
    }

    currentDate = currentDateArray(config);

    //compute day of the year from weeks and weekdays
    if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
        dayOfYearFromWeekInfo(config);
    }

    //if the day of the year is set, figure out what it is
    if (config._dayOfYear != null) {
        yearToUse = defaults(config._a[YEAR], currentDate[YEAR]);

        if (config._dayOfYear > daysInYear(yearToUse) || config._dayOfYear === 0) {
            getParsingFlags(config)._overflowDayOfYear = true;
        }

        date = createUTCDate(yearToUse, 0, config._dayOfYear);
        config._a[MONTH] = date.getUTCMonth();
        config._a[DATE] = date.getUTCDate();
    }

    // Default to current date.
    // * if no year, month, day of month are given, default to today
    // * if day of month is given, default month and year
    // * if month is given, default only year
    // * if year is given, don't default anything
    for (i = 0; i < 3 && config._a[i] == null; ++i) {
        config._a[i] = input[i] = currentDate[i];
    }

    // Zero out whatever was not defaulted, including time
    for (; i < 7; i++) {
        config._a[i] = input[i] = (config._a[i] == null) ? (i === 2 ? 1 : 0) : config._a[i];
    }

    // Check for 24:00:00.000
    if (config._a[HOUR] === 24 &&
            config._a[MINUTE] === 0 &&
            config._a[SECOND] === 0 &&
            config._a[MILLISECOND] === 0) {
        config._nextDay = true;
        config._a[HOUR] = 0;
    }

    config._d = (config._useUTC ? createUTCDate : createDate).apply(null, input);
    // Apply timezone offset from input. The actual utcOffset can be changed
    // with parseZone.
    if (config._tzm != null) {
        config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);
    }

    if (config._nextDay) {
        config._a[HOUR] = 24;
    }
}

function dayOfYearFromWeekInfo(config) {
    var w, weekYear, week, weekday, dow, doy, temp, weekdayOverflow;

    w = config._w;
    if (w.GG != null || w.W != null || w.E != null) {
        dow = 1;
        doy = 4;

        // TODO: We need to take the current isoWeekYear, but that depends on
        // how we interpret now (local, utc, fixed offset). So create
        // a now version of current config (take local/utc/offset flags, and
        // create now).
        weekYear = defaults(w.GG, config._a[YEAR], weekOfYear(createLocal(), 1, 4).year);
        week = defaults(w.W, 1);
        weekday = defaults(w.E, 1);
        if (weekday < 1 || weekday > 7) {
            weekdayOverflow = true;
        }
    } else {
        dow = config._locale._week.dow;
        doy = config._locale._week.doy;

        var curWeek = weekOfYear(createLocal(), dow, doy);

        weekYear = defaults(w.gg, config._a[YEAR], curWeek.year);

        // Default to current week.
        week = defaults(w.w, curWeek.week);

        if (w.d != null) {
            // weekday -- low day numbers are considered next week
            weekday = w.d;
            if (weekday < 0 || weekday > 6) {
                weekdayOverflow = true;
            }
        } else if (w.e != null) {
            // local weekday -- counting starts from begining of week
            weekday = w.e + dow;
            if (w.e < 0 || w.e > 6) {
                weekdayOverflow = true;
            }
        } else {
            // default to begining of week
            weekday = dow;
        }
    }
    if (week < 1 || week > weeksInYear(weekYear, dow, doy)) {
        getParsingFlags(config)._overflowWeeks = true;
    } else if (weekdayOverflow != null) {
        getParsingFlags(config)._overflowWeekday = true;
    } else {
        temp = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy);
        config._a[YEAR] = temp.year;
        config._dayOfYear = temp.dayOfYear;
    }
}

// constant that refers to the ISO standard
hooks.ISO_8601 = function () {};

// constant that refers to the RFC 2822 form
hooks.RFC_2822 = function () {};

// date from string and format string
function configFromStringAndFormat(config) {
    // TODO: Move this to another part of the creation flow to prevent circular deps
    if (config._f === hooks.ISO_8601) {
        configFromISO(config);
        return;
    }
    if (config._f === hooks.RFC_2822) {
        configFromRFC2822(config);
        return;
    }
    config._a = [];
    getParsingFlags(config).empty = true;

    // This array is used to make a Date, either with `new Date` or `Date.UTC`
    var string = '' + config._i,
        i, parsedInput, tokens, token, skipped,
        stringLength = string.length,
        totalParsedInputLength = 0;

    tokens = expandFormat(config._f, config._locale).match(formattingTokens) || [];

    for (i = 0; i < tokens.length; i++) {
        token = tokens[i];
        parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
        // console.log('token', token, 'parsedInput', parsedInput,
        //         'regex', getParseRegexForToken(token, config));
        if (parsedInput) {
            skipped = string.substr(0, string.indexOf(parsedInput));
            if (skipped.length > 0) {
                getParsingFlags(config).unusedInput.push(skipped);
            }
            string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
            totalParsedInputLength += parsedInput.length;
        }
        // don't parse if it's not a known token
        if (formatTokenFunctions[token]) {
            if (parsedInput) {
                getParsingFlags(config).empty = false;
            }
            else {
                getParsingFlags(config).unusedTokens.push(token);
            }
            addTimeToArrayFromToken(token, parsedInput, config);
        }
        else if (config._strict && !parsedInput) {
            getParsingFlags(config).unusedTokens.push(token);
        }
    }

    // add remaining unparsed input length to the string
    getParsingFlags(config).charsLeftOver = stringLength - totalParsedInputLength;
    if (string.length > 0) {
        getParsingFlags(config).unusedInput.push(string);
    }

    // clear _12h flag if hour is <= 12
    if (config._a[HOUR] <= 12 &&
        getParsingFlags(config).bigHour === true &&
        config._a[HOUR] > 0) {
        getParsingFlags(config).bigHour = undefined;
    }

    getParsingFlags(config).parsedDateParts = config._a.slice(0);
    getParsingFlags(config).meridiem = config._meridiem;
    // handle meridiem
    config._a[HOUR] = meridiemFixWrap(config._locale, config._a[HOUR], config._meridiem);

    configFromArray(config);
    checkOverflow(config);
}


function meridiemFixWrap (locale, hour, meridiem) {
    var isPm;

    if (meridiem == null) {
        // nothing to do
        return hour;
    }
    if (locale.meridiemHour != null) {
        return locale.meridiemHour(hour, meridiem);
    } else if (locale.isPM != null) {
        // Fallback
        isPm = locale.isPM(meridiem);
        if (isPm && hour < 12) {
            hour += 12;
        }
        if (!isPm && hour === 12) {
            hour = 0;
        }
        return hour;
    } else {
        // this is not supposed to happen
        return hour;
    }
}

// date from string and array of format strings
function configFromStringAndArray(config) {
    var tempConfig,
        bestMoment,

        scoreToBeat,
        i,
        currentScore;

    if (config._f.length === 0) {
        getParsingFlags(config).invalidFormat = true;
        config._d = new Date(NaN);
        return;
    }

    for (i = 0; i < config._f.length; i++) {
        currentScore = 0;
        tempConfig = copyConfig({}, config);
        if (config._useUTC != null) {
            tempConfig._useUTC = config._useUTC;
        }
        tempConfig._f = config._f[i];
        configFromStringAndFormat(tempConfig);

        if (!isValid(tempConfig)) {
            continue;
        }

        // if there is any input that was not parsed add a penalty for that format
        currentScore += getParsingFlags(tempConfig).charsLeftOver;

        //or tokens
        currentScore += getParsingFlags(tempConfig).unusedTokens.length * 10;

        getParsingFlags(tempConfig).score = currentScore;

        if (scoreToBeat == null || currentScore < scoreToBeat) {
            scoreToBeat = currentScore;
            bestMoment = tempConfig;
        }
    }

    extend(config, bestMoment || tempConfig);
}

function configFromObject(config) {
    if (config._d) {
        return;
    }

    var i = normalizeObjectUnits(config._i);
    config._a = map([i.year, i.month, i.day || i.date, i.hour, i.minute, i.second, i.millisecond], function (obj) {
        return obj && parseInt(obj, 10);
    });

    configFromArray(config);
}

function createFromConfig (config) {
    var res = new Moment(checkOverflow(prepareConfig(config)));
    if (res._nextDay) {
        // Adding is smart enough around DST
        res.add(1, 'd');
        res._nextDay = undefined;
    }

    return res;
}

function prepareConfig (config) {
    var input = config._i,
        format = config._f;

    config._locale = config._locale || getLocale(config._l);

    if (input === null || (format === undefined && input === '')) {
        return createInvalid({nullInput: true});
    }

    if (typeof input === 'string') {
        config._i = input = config._locale.preparse(input);
    }

    if (isMoment(input)) {
        return new Moment(checkOverflow(input));
    } else if (isDate(input)) {
        config._d = input;
    } else if (isArray(format)) {
        configFromStringAndArray(config);
    } else if (format) {
        configFromStringAndFormat(config);
    }  else {
        configFromInput(config);
    }

    if (!isValid(config)) {
        config._d = null;
    }

    return config;
}

function configFromInput(config) {
    var input = config._i;
    if (isUndefined(input)) {
        config._d = new Date(hooks.now());
    } else if (isDate(input)) {
        config._d = new Date(input.valueOf());
    } else if (typeof input === 'string') {
        configFromString(config);
    } else if (isArray(input)) {
        config._a = map(input.slice(0), function (obj) {
            return parseInt(obj, 10);
        });
        configFromArray(config);
    } else if (isObject(input)) {
        configFromObject(config);
    } else if (isNumber(input)) {
        // from milliseconds
        config._d = new Date(input);
    } else {
        hooks.createFromInputFallback(config);
    }
}

function createLocalOrUTC (input, format, locale, strict, isUTC) {
    var c = {};

    if (locale === true || locale === false) {
        strict = locale;
        locale = undefined;
    }

    if ((isObject(input) && isObjectEmpty(input)) ||
            (isArray(input) && input.length === 0)) {
        input = undefined;
    }
    // object construction must be done this way.
    // https://github.com/moment/moment/issues/1423
    c._isAMomentObject = true;
    c._useUTC = c._isUTC = isUTC;
    c._l = locale;
    c._i = input;
    c._f = format;
    c._strict = strict;

    return createFromConfig(c);
}

function createLocal (input, format, locale, strict) {
    return createLocalOrUTC(input, format, locale, strict, false);
}

var prototypeMin = deprecate(
    'moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/',
    function () {
        var other = createLocal.apply(null, arguments);
        if (this.isValid() && other.isValid()) {
            return other < this ? this : other;
        } else {
            return createInvalid();
        }
    }
);

var prototypeMax = deprecate(
    'moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/',
    function () {
        var other = createLocal.apply(null, arguments);
        if (this.isValid() && other.isValid()) {
            return other > this ? this : other;
        } else {
            return createInvalid();
        }
    }
);

// Pick a moment m from moments so that m[fn](other) is true for all
// other. This relies on the function fn to be transitive.
//
// moments should either be an array of moment objects or an array, whose
// first element is an array of moment objects.
function pickBy(fn, moments) {
    var res, i;
    if (moments.length === 1 && isArray(moments[0])) {
        moments = moments[0];
    }
    if (!moments.length) {
        return createLocal();
    }
    res = moments[0];
    for (i = 1; i < moments.length; ++i) {
        if (!moments[i].isValid() || moments[i][fn](res)) {
            res = moments[i];
        }
    }
    return res;
}

// TODO: Use [].sort instead?
function min () {
    var args = [].slice.call(arguments, 0);

    return pickBy('isBefore', args);
}

function max () {
    var args = [].slice.call(arguments, 0);

    return pickBy('isAfter', args);
}

var now = function () {
    return Date.now ? Date.now() : +(new Date());
};

var ordering = ['year', 'quarter', 'month', 'week', 'day', 'hour', 'minute', 'second', 'millisecond'];

function isDurationValid(m) {
    for (var key in m) {
        if (!(ordering.indexOf(key) !== -1 && (m[key] == null || !isNaN(m[key])))) {
            return false;
        }
    }

    var unitHasDecimal = false;
    for (var i = 0; i < ordering.length; ++i) {
        if (m[ordering[i]]) {
            if (unitHasDecimal) {
                return false; // only allow non-integers for smallest unit
            }
            if (parseFloat(m[ordering[i]]) !== toInt(m[ordering[i]])) {
                unitHasDecimal = true;
            }
        }
    }

    return true;
}

function isValid$1() {
    return this._isValid;
}

function createInvalid$1() {
    return createDuration(NaN);
}

function Duration (duration) {
    var normalizedInput = normalizeObjectUnits(duration),
        years = normalizedInput.year || 0,
        quarters = normalizedInput.quarter || 0,
        months = normalizedInput.month || 0,
        weeks = normalizedInput.week || 0,
        days = normalizedInput.day || 0,
        hours = normalizedInput.hour || 0,
        minutes = normalizedInput.minute || 0,
        seconds = normalizedInput.second || 0,
        milliseconds = normalizedInput.millisecond || 0;

    this._isValid = isDurationValid(normalizedInput);

    // representation for dateAddRemove
    this._milliseconds = +milliseconds +
        seconds * 1e3 + // 1000
        minutes * 6e4 + // 1000 * 60
        hours * 1000 * 60 * 60; //using 1000 * 60 * 60 instead of 36e5 to avoid floating point rounding errors https://github.com/moment/moment/issues/2978
    // Because of dateAddRemove treats 24 hours as different from a
    // day when working around DST, we need to store them separately
    this._days = +days +
        weeks * 7;
    // It is impossible translate months into days without knowing
    // which months you are are talking about, so we have to store
    // it separately.
    this._months = +months +
        quarters * 3 +
        years * 12;

    this._data = {};

    this._locale = getLocale();

    this._bubble();
}

function isDuration (obj) {
    return obj instanceof Duration;
}

function absRound (number) {
    if (number < 0) {
        return Math.round(-1 * number) * -1;
    } else {
        return Math.round(number);
    }
}

// FORMATTING

function offset (token, separator) {
    addFormatToken(token, 0, 0, function () {
        var offset = this.utcOffset();
        var sign = '+';
        if (offset < 0) {
            offset = -offset;
            sign = '-';
        }
        return sign + zeroFill(~~(offset / 60), 2) + separator + zeroFill(~~(offset) % 60, 2);
    });
}

offset('Z', ':');
offset('ZZ', '');

// PARSING

addRegexToken('Z',  matchShortOffset);
addRegexToken('ZZ', matchShortOffset);
addParseToken(['Z', 'ZZ'], function (input, array, config) {
    config._useUTC = true;
    config._tzm = offsetFromString(matchShortOffset, input);
});

// HELPERS

// timezone chunker
// '+10:00' > ['10',  '00']
// '-1530'  > ['-15', '30']
var chunkOffset = /([\+\-]|\d\d)/gi;

function offsetFromString(matcher, string) {
    var matches = (string || '').match(matcher);

    if (matches === null) {
        return null;
    }

    var chunk   = matches[matches.length - 1] || [];
    var parts   = (chunk + '').match(chunkOffset) || ['-', 0, 0];
    var minutes = +(parts[1] * 60) + toInt(parts[2]);

    return minutes === 0 ?
      0 :
      parts[0] === '+' ? minutes : -minutes;
}

// Return a moment from input, that is local/utc/zone equivalent to model.
function cloneWithOffset(input, model) {
    var res, diff;
    if (model._isUTC) {
        res = model.clone();
        diff = (isMoment(input) || isDate(input) ? input.valueOf() : createLocal(input).valueOf()) - res.valueOf();
        // Use low-level api, because this fn is low-level api.
        res._d.setTime(res._d.valueOf() + diff);
        hooks.updateOffset(res, false);
        return res;
    } else {
        return createLocal(input).local();
    }
}

function getDateOffset (m) {
    // On Firefox.24 Date#getTimezoneOffset returns a floating point.
    // https://github.com/moment/moment/pull/1871
    return -Math.round(m._d.getTimezoneOffset() / 15) * 15;
}

// HOOKS

// This function will be called whenever a moment is mutated.
// It is intended to keep the offset in sync with the timezone.
hooks.updateOffset = function () {};

// MOMENTS

// keepLocalTime = true means only change the timezone, without
// affecting the local hour. So 5:31:26 +0300 --[utcOffset(2, true)]-->
// 5:31:26 +0200 It is possible that 5:31:26 doesn't exist with offset
// +0200, so we adjust the time as needed, to be valid.
//
// Keeping the time actually adds/subtracts (one hour)
// from the actual represented time. That is why we call updateOffset
// a second time. In case it wants us to change the offset again
// _changeInProgress == true case, then we have to adjust, because
// there is no such time in the given timezone.
function getSetOffset (input, keepLocalTime, keepMinutes) {
    var offset = this._offset || 0,
        localAdjust;
    if (!this.isValid()) {
        return input != null ? this : NaN;
    }
    if (input != null) {
        if (typeof input === 'string') {
            input = offsetFromString(matchShortOffset, input);
            if (input === null) {
                return this;
            }
        } else if (Math.abs(input) < 16 && !keepMinutes) {
            input = input * 60;
        }
        if (!this._isUTC && keepLocalTime) {
            localAdjust = getDateOffset(this);
        }
        this._offset = input;
        this._isUTC = true;
        if (localAdjust != null) {
            this.add(localAdjust, 'm');
        }
        if (offset !== input) {
            if (!keepLocalTime || this._changeInProgress) {
                addSubtract(this, createDuration(input - offset, 'm'), 1, false);
            } else if (!this._changeInProgress) {
                this._changeInProgress = true;
                hooks.updateOffset(this, true);
                this._changeInProgress = null;
            }
        }
        return this;
    } else {
        return this._isUTC ? offset : getDateOffset(this);
    }
}

function getSetZone (input, keepLocalTime) {
    if (input != null) {
        if (typeof input !== 'string') {
            input = -input;
        }

        this.utcOffset(input, keepLocalTime);

        return this;
    } else {
        return -this.utcOffset();
    }
}

function setOffsetToUTC (keepLocalTime) {
    return this.utcOffset(0, keepLocalTime);
}

function setOffsetToLocal (keepLocalTime) {
    if (this._isUTC) {
        this.utcOffset(0, keepLocalTime);
        this._isUTC = false;

        if (keepLocalTime) {
            this.subtract(getDateOffset(this), 'm');
        }
    }
    return this;
}

function setOffsetToParsedOffset () {
    if (this._tzm != null) {
        this.utcOffset(this._tzm, false, true);
    } else if (typeof this._i === 'string') {
        var tZone = offsetFromString(matchOffset, this._i);
        if (tZone != null) {
            this.utcOffset(tZone);
        }
        else {
            this.utcOffset(0, true);
        }
    }
    return this;
}

function hasAlignedHourOffset (input) {
    if (!this.isValid()) {
        return false;
    }
    input = input ? createLocal(input).utcOffset() : 0;

    return (this.utcOffset() - input) % 60 === 0;
}

function isDaylightSavingTime () {
    return (
        this.utcOffset() > this.clone().month(0).utcOffset() ||
        this.utcOffset() > this.clone().month(5).utcOffset()
    );
}

function isDaylightSavingTimeShifted () {
    if (!isUndefined(this._isDSTShifted)) {
        return this._isDSTShifted;
    }

    var c = {};

    copyConfig(c, this);
    c = prepareConfig(c);

    if (c._a) {
        var other = c._isUTC ? createUTC(c._a) : createLocal(c._a);
        this._isDSTShifted = this.isValid() &&
            compareArrays(c._a, other.toArray()) > 0;
    } else {
        this._isDSTShifted = false;
    }

    return this._isDSTShifted;
}

function isLocal () {
    return this.isValid() ? !this._isUTC : false;
}

function isUtcOffset () {
    return this.isValid() ? this._isUTC : false;
}

function isUtc () {
    return this.isValid() ? this._isUTC && this._offset === 0 : false;
}

// ASP.NET json date format regex
var aspNetRegex = /^(\-)?(?:(\d*)[. ])?(\d+)\:(\d+)(?:\:(\d+)(\.\d*)?)?$/;

// from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
// somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
// and further modified to allow for strings containing both week and day
var isoRegex = /^(-)?P(?:(-?[0-9,.]*)Y)?(?:(-?[0-9,.]*)M)?(?:(-?[0-9,.]*)W)?(?:(-?[0-9,.]*)D)?(?:T(?:(-?[0-9,.]*)H)?(?:(-?[0-9,.]*)M)?(?:(-?[0-9,.]*)S)?)?$/;

function createDuration (input, key) {
    var duration = input,
        // matching against regexp is expensive, do it on demand
        match = null,
        sign,
        ret,
        diffRes;

    if (isDuration(input)) {
        duration = {
            ms : input._milliseconds,
            d  : input._days,
            M  : input._months
        };
    } else if (isNumber(input)) {
        duration = {};
        if (key) {
            duration[key] = input;
        } else {
            duration.milliseconds = input;
        }
    } else if (!!(match = aspNetRegex.exec(input))) {
        sign = (match[1] === '-') ? -1 : 1;
        duration = {
            y  : 0,
            d  : toInt(match[DATE])                         * sign,
            h  : toInt(match[HOUR])                         * sign,
            m  : toInt(match[MINUTE])                       * sign,
            s  : toInt(match[SECOND])                       * sign,
            ms : toInt(absRound(match[MILLISECOND] * 1000)) * sign // the millisecond decimal point is included in the match
        };
    } else if (!!(match = isoRegex.exec(input))) {
        sign = (match[1] === '-') ? -1 : 1;
        duration = {
            y : parseIso(match[2], sign),
            M : parseIso(match[3], sign),
            w : parseIso(match[4], sign),
            d : parseIso(match[5], sign),
            h : parseIso(match[6], sign),
            m : parseIso(match[7], sign),
            s : parseIso(match[8], sign)
        };
    } else if (duration == null) {// checks for null or undefined
        duration = {};
    } else if (typeof duration === 'object' && ('from' in duration || 'to' in duration)) {
        diffRes = momentsDifference(createLocal(duration.from), createLocal(duration.to));

        duration = {};
        duration.ms = diffRes.milliseconds;
        duration.M = diffRes.months;
    }

    ret = new Duration(duration);

    if (isDuration(input) && hasOwnProp(input, '_locale')) {
        ret._locale = input._locale;
    }

    return ret;
}

createDuration.fn = Duration.prototype;
createDuration.invalid = createInvalid$1;

function parseIso (inp, sign) {
    // We'd normally use ~~inp for this, but unfortunately it also
    // converts floats to ints.
    // inp may be undefined, so careful calling replace on it.
    var res = inp && parseFloat(inp.replace(',', '.'));
    // apply sign while we're at it
    return (isNaN(res) ? 0 : res) * sign;
}

function positiveMomentsDifference(base, other) {
    var res = {milliseconds: 0, months: 0};

    res.months = other.month() - base.month() +
        (other.year() - base.year()) * 12;
    if (base.clone().add(res.months, 'M').isAfter(other)) {
        --res.months;
    }

    res.milliseconds = +other - +(base.clone().add(res.months, 'M'));

    return res;
}

function momentsDifference(base, other) {
    var res;
    if (!(base.isValid() && other.isValid())) {
        return {milliseconds: 0, months: 0};
    }

    other = cloneWithOffset(other, base);
    if (base.isBefore(other)) {
        res = positiveMomentsDifference(base, other);
    } else {
        res = positiveMomentsDifference(other, base);
        res.milliseconds = -res.milliseconds;
        res.months = -res.months;
    }

    return res;
}

// TODO: remove 'name' arg after deprecation is removed
function createAdder(direction, name) {
    return function (val, period) {
        var dur, tmp;
        //invert the arguments, but complain about it
        if (period !== null && !isNaN(+period)) {
            deprecateSimple(name, 'moment().' + name  + '(period, number) is deprecated. Please use moment().' + name + '(number, period). ' +
            'See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info.');
            tmp = val; val = period; period = tmp;
        }

        val = typeof val === 'string' ? +val : val;
        dur = createDuration(val, period);
        addSubtract(this, dur, direction);
        return this;
    };
}

function addSubtract (mom, duration, isAdding, updateOffset) {
    var milliseconds = duration._milliseconds,
        days = absRound(duration._days),
        months = absRound(duration._months);

    if (!mom.isValid()) {
        // No op
        return;
    }

    updateOffset = updateOffset == null ? true : updateOffset;

    if (milliseconds) {
        mom._d.setTime(mom._d.valueOf() + milliseconds * isAdding);
    }
    if (days) {
        set$1(mom, 'Date', get(mom, 'Date') + days * isAdding);
    }
    if (months) {
        setMonth(mom, get(mom, 'Month') + months * isAdding);
    }
    if (updateOffset) {
        hooks.updateOffset(mom, days || months);
    }
}

var add      = createAdder(1, 'add');
var subtract = createAdder(-1, 'subtract');

function getCalendarFormat(myMoment, now) {
    var diff = myMoment.diff(now, 'days', true);
    return diff < -6 ? 'sameElse' :
            diff < -1 ? 'lastWeek' :
            diff < 0 ? 'lastDay' :
            diff < 1 ? 'sameDay' :
            diff < 2 ? 'nextDay' :
            diff < 7 ? 'nextWeek' : 'sameElse';
}

function calendar$1 (time, formats) {
    // We want to compare the start of today, vs this.
    // Getting start-of-today depends on whether we're local/utc/offset or not.
    var now = time || createLocal(),
        sod = cloneWithOffset(now, this).startOf('day'),
        format = hooks.calendarFormat(this, sod) || 'sameElse';

    var output = formats && (isFunction(formats[format]) ? formats[format].call(this, now) : formats[format]);

    return this.format(output || this.localeData().calendar(format, this, createLocal(now)));
}

function clone () {
    return new Moment(this);
}

function isAfter (input, units) {
    var localInput = isMoment(input) ? input : createLocal(input);
    if (!(this.isValid() && localInput.isValid())) {
        return false;
    }
    units = normalizeUnits(!isUndefined(units) ? units : 'millisecond');
    if (units === 'millisecond') {
        return this.valueOf() > localInput.valueOf();
    } else {
        return localInput.valueOf() < this.clone().startOf(units).valueOf();
    }
}

function isBefore (input, units) {
    var localInput = isMoment(input) ? input : createLocal(input);
    if (!(this.isValid() && localInput.isValid())) {
        return false;
    }
    units = normalizeUnits(!isUndefined(units) ? units : 'millisecond');
    if (units === 'millisecond') {
        return this.valueOf() < localInput.valueOf();
    } else {
        return this.clone().endOf(units).valueOf() < localInput.valueOf();
    }
}

function isBetween (from, to, units, inclusivity) {
    inclusivity = inclusivity || '()';
    return (inclusivity[0] === '(' ? this.isAfter(from, units) : !this.isBefore(from, units)) &&
        (inclusivity[1] === ')' ? this.isBefore(to, units) : !this.isAfter(to, units));
}

function isSame (input, units) {
    var localInput = isMoment(input) ? input : createLocal(input),
        inputMs;
    if (!(this.isValid() && localInput.isValid())) {
        return false;
    }
    units = normalizeUnits(units || 'millisecond');
    if (units === 'millisecond') {
        return this.valueOf() === localInput.valueOf();
    } else {
        inputMs = localInput.valueOf();
        return this.clone().startOf(units).valueOf() <= inputMs && inputMs <= this.clone().endOf(units).valueOf();
    }
}

function isSameOrAfter (input, units) {
    return this.isSame(input, units) || this.isAfter(input,units);
}

function isSameOrBefore (input, units) {
    return this.isSame(input, units) || this.isBefore(input,units);
}

function diff (input, units, asFloat) {
    var that,
        zoneDelta,
        delta, output;

    if (!this.isValid()) {
        return NaN;
    }

    that = cloneWithOffset(input, this);

    if (!that.isValid()) {
        return NaN;
    }

    zoneDelta = (that.utcOffset() - this.utcOffset()) * 6e4;

    units = normalizeUnits(units);

    if (units === 'year' || units === 'month' || units === 'quarter') {
        output = monthDiff(this, that);
        if (units === 'quarter') {
            output = output / 3;
        } else if (units === 'year') {
            output = output / 12;
        }
    } else {
        delta = this - that;
        output = units === 'second' ? delta / 1e3 : // 1000
            units === 'minute' ? delta / 6e4 : // 1000 * 60
            units === 'hour' ? delta / 36e5 : // 1000 * 60 * 60
            units === 'day' ? (delta - zoneDelta) / 864e5 : // 1000 * 60 * 60 * 24, negate dst
            units === 'week' ? (delta - zoneDelta) / 6048e5 : // 1000 * 60 * 60 * 24 * 7, negate dst
            delta;
    }
    return asFloat ? output : absFloor(output);
}

function monthDiff (a, b) {
    // difference in months
    var wholeMonthDiff = ((b.year() - a.year()) * 12) + (b.month() - a.month()),
        // b is in (anchor - 1 month, anchor + 1 month)
        anchor = a.clone().add(wholeMonthDiff, 'months'),
        anchor2, adjust;

    if (b - anchor < 0) {
        anchor2 = a.clone().add(wholeMonthDiff - 1, 'months');
        // linear across the month
        adjust = (b - anchor) / (anchor - anchor2);
    } else {
        anchor2 = a.clone().add(wholeMonthDiff + 1, 'months');
        // linear across the month
        adjust = (b - anchor) / (anchor2 - anchor);
    }

    //check for negative zero, return zero if negative zero
    return -(wholeMonthDiff + adjust) || 0;
}

hooks.defaultFormat = 'YYYY-MM-DDTHH:mm:ssZ';
hooks.defaultFormatUtc = 'YYYY-MM-DDTHH:mm:ss[Z]';

function toString () {
    return this.clone().locale('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
}

function toISOString() {
    if (!this.isValid()) {
        return null;
    }
    var m = this.clone().utc();
    if (m.year() < 0 || m.year() > 9999) {
        return formatMoment(m, 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
    }
    if (isFunction(Date.prototype.toISOString)) {
        // native implementation is ~50x faster, use it when we can
        return this.toDate().toISOString();
    }
    return formatMoment(m, 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
}

/**
 * Return a human readable representation of a moment that can
 * also be evaluated to get a new moment which is the same
 *
 * @link https://nodejs.org/dist/latest/docs/api/util.html#util_custom_inspect_function_on_objects
 */
function inspect () {
    if (!this.isValid()) {
        return 'moment.invalid(/* ' + this._i + ' */)';
    }
    var func = 'moment';
    var zone = '';
    if (!this.isLocal()) {
        func = this.utcOffset() === 0 ? 'moment.utc' : 'moment.parseZone';
        zone = 'Z';
    }
    var prefix = '[' + func + '("]';
    var year = (0 <= this.year() && this.year() <= 9999) ? 'YYYY' : 'YYYYYY';
    var datetime = '-MM-DD[T]HH:mm:ss.SSS';
    var suffix = zone + '[")]';

    return this.format(prefix + year + datetime + suffix);
}

function format (inputString) {
    if (!inputString) {
        inputString = this.isUtc() ? hooks.defaultFormatUtc : hooks.defaultFormat;
    }
    var output = formatMoment(this, inputString);
    return this.localeData().postformat(output);
}

function from (time, withoutSuffix) {
    if (this.isValid() &&
            ((isMoment(time) && time.isValid()) ||
             createLocal(time).isValid())) {
        return createDuration({to: this, from: time}).locale(this.locale()).humanize(!withoutSuffix);
    } else {
        return this.localeData().invalidDate();
    }
}

function fromNow (withoutSuffix) {
    return this.from(createLocal(), withoutSuffix);
}

function to (time, withoutSuffix) {
    if (this.isValid() &&
            ((isMoment(time) && time.isValid()) ||
             createLocal(time).isValid())) {
        return createDuration({from: this, to: time}).locale(this.locale()).humanize(!withoutSuffix);
    } else {
        return this.localeData().invalidDate();
    }
}

function toNow (withoutSuffix) {
    return this.to(createLocal(), withoutSuffix);
}

// If passed a locale key, it will set the locale for this
// instance.  Otherwise, it will return the locale configuration
// variables for this instance.
function locale (key) {
    var newLocaleData;

    if (key === undefined) {
        return this._locale._abbr;
    } else {
        newLocaleData = getLocale(key);
        if (newLocaleData != null) {
            this._locale = newLocaleData;
        }
        return this;
    }
}

var lang = deprecate(
    'moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.',
    function (key) {
        if (key === undefined) {
            return this.localeData();
        } else {
            return this.locale(key);
        }
    }
);

function localeData () {
    return this._locale;
}

function startOf (units) {
    units = normalizeUnits(units);
    // the following switch intentionally omits break keywords
    // to utilize falling through the cases.
    switch (units) {
        case 'year':
            this.month(0);
            /* falls through */
        case 'quarter':
        case 'month':
            this.date(1);
            /* falls through */
        case 'week':
        case 'isoWeek':
        case 'day':
        case 'date':
            this.hours(0);
            /* falls through */
        case 'hour':
            this.minutes(0);
            /* falls through */
        case 'minute':
            this.seconds(0);
            /* falls through */
        case 'second':
            this.milliseconds(0);
    }

    // weeks are a special case
    if (units === 'week') {
        this.weekday(0);
    }
    if (units === 'isoWeek') {
        this.isoWeekday(1);
    }

    // quarters are also special
    if (units === 'quarter') {
        this.month(Math.floor(this.month() / 3) * 3);
    }

    return this;
}

function endOf (units) {
    units = normalizeUnits(units);
    if (units === undefined || units === 'millisecond') {
        return this;
    }

    // 'date' is an alias for 'day', so it should be considered as such.
    if (units === 'date') {
        units = 'day';
    }

    return this.startOf(units).add(1, (units === 'isoWeek' ? 'week' : units)).subtract(1, 'ms');
}

function valueOf () {
    return this._d.valueOf() - ((this._offset || 0) * 60000);
}

function unix () {
    return Math.floor(this.valueOf() / 1000);
}

function toDate () {
    return new Date(this.valueOf());
}

function toArray () {
    var m = this;
    return [m.year(), m.month(), m.date(), m.hour(), m.minute(), m.second(), m.millisecond()];
}

function toObject () {
    var m = this;
    return {
        years: m.year(),
        months: m.month(),
        date: m.date(),
        hours: m.hours(),
        minutes: m.minutes(),
        seconds: m.seconds(),
        milliseconds: m.milliseconds()
    };
}

function toJSON () {
    // new Date(NaN).toJSON() === null
    return this.isValid() ? this.toISOString() : null;
}

function isValid$2 () {
    return isValid(this);
}

function parsingFlags () {
    return extend({}, getParsingFlags(this));
}

function invalidAt () {
    return getParsingFlags(this).overflow;
}

function creationData() {
    return {
        input: this._i,
        format: this._f,
        locale: this._locale,
        isUTC: this._isUTC,
        strict: this._strict
    };
}

// FORMATTING

addFormatToken(0, ['gg', 2], 0, function () {
    return this.weekYear() % 100;
});

addFormatToken(0, ['GG', 2], 0, function () {
    return this.isoWeekYear() % 100;
});

function addWeekYearFormatToken (token, getter) {
    addFormatToken(0, [token, token.length], 0, getter);
}

addWeekYearFormatToken('gggg',     'weekYear');
addWeekYearFormatToken('ggggg',    'weekYear');
addWeekYearFormatToken('GGGG',  'isoWeekYear');
addWeekYearFormatToken('GGGGG', 'isoWeekYear');

// ALIASES

addUnitAlias('weekYear', 'gg');
addUnitAlias('isoWeekYear', 'GG');

// PRIORITY

addUnitPriority('weekYear', 1);
addUnitPriority('isoWeekYear', 1);


// PARSING

addRegexToken('G',      matchSigned);
addRegexToken('g',      matchSigned);
addRegexToken('GG',     match1to2, match2);
addRegexToken('gg',     match1to2, match2);
addRegexToken('GGGG',   match1to4, match4);
addRegexToken('gggg',   match1to4, match4);
addRegexToken('GGGGG',  match1to6, match6);
addRegexToken('ggggg',  match1to6, match6);

addWeekParseToken(['gggg', 'ggggg', 'GGGG', 'GGGGG'], function (input, week, config, token) {
    week[token.substr(0, 2)] = toInt(input);
});

addWeekParseToken(['gg', 'GG'], function (input, week, config, token) {
    week[token] = hooks.parseTwoDigitYear(input);
});

// MOMENTS

function getSetWeekYear (input) {
    return getSetWeekYearHelper.call(this,
            input,
            this.week(),
            this.weekday(),
            this.localeData()._week.dow,
            this.localeData()._week.doy);
}

function getSetISOWeekYear (input) {
    return getSetWeekYearHelper.call(this,
            input, this.isoWeek(), this.isoWeekday(), 1, 4);
}

function getISOWeeksInYear () {
    return weeksInYear(this.year(), 1, 4);
}

function getWeeksInYear () {
    var weekInfo = this.localeData()._week;
    return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
}

function getSetWeekYearHelper(input, week, weekday, dow, doy) {
    var weeksTarget;
    if (input == null) {
        return weekOfYear(this, dow, doy).year;
    } else {
        weeksTarget = weeksInYear(input, dow, doy);
        if (week > weeksTarget) {
            week = weeksTarget;
        }
        return setWeekAll.call(this, input, week, weekday, dow, doy);
    }
}

function setWeekAll(weekYear, week, weekday, dow, doy) {
    var dayOfYearData = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy),
        date = createUTCDate(dayOfYearData.year, 0, dayOfYearData.dayOfYear);

    this.year(date.getUTCFullYear());
    this.month(date.getUTCMonth());
    this.date(date.getUTCDate());
    return this;
}

// FORMATTING

addFormatToken('Q', 0, 'Qo', 'quarter');

// ALIASES

addUnitAlias('quarter', 'Q');

// PRIORITY

addUnitPriority('quarter', 7);

// PARSING

addRegexToken('Q', match1);
addParseToken('Q', function (input, array) {
    array[MONTH] = (toInt(input) - 1) * 3;
});

// MOMENTS

function getSetQuarter (input) {
    return input == null ? Math.ceil((this.month() + 1) / 3) : this.month((input - 1) * 3 + this.month() % 3);
}

// FORMATTING

addFormatToken('D', ['DD', 2], 'Do', 'date');

// ALIASES

addUnitAlias('date', 'D');

// PRIOROITY
addUnitPriority('date', 9);

// PARSING

addRegexToken('D',  match1to2);
addRegexToken('DD', match1to2, match2);
addRegexToken('Do', function (isStrict, locale) {
    // TODO: Remove "ordinalParse" fallback in next major release.
    return isStrict ?
      (locale._dayOfMonthOrdinalParse || locale._ordinalParse) :
      locale._dayOfMonthOrdinalParseLenient;
});

addParseToken(['D', 'DD'], DATE);
addParseToken('Do', function (input, array) {
    array[DATE] = toInt(input.match(match1to2)[0], 10);
});

// MOMENTS

var getSetDayOfMonth = makeGetSet('Date', true);

// FORMATTING

addFormatToken('DDD', ['DDDD', 3], 'DDDo', 'dayOfYear');

// ALIASES

addUnitAlias('dayOfYear', 'DDD');

// PRIORITY
addUnitPriority('dayOfYear', 4);

// PARSING

addRegexToken('DDD',  match1to3);
addRegexToken('DDDD', match3);
addParseToken(['DDD', 'DDDD'], function (input, array, config) {
    config._dayOfYear = toInt(input);
});

// HELPERS

// MOMENTS

function getSetDayOfYear (input) {
    var dayOfYear = Math.round((this.clone().startOf('day') - this.clone().startOf('year')) / 864e5) + 1;
    return input == null ? dayOfYear : this.add((input - dayOfYear), 'd');
}

// FORMATTING

addFormatToken('m', ['mm', 2], 0, 'minute');

// ALIASES

addUnitAlias('minute', 'm');

// PRIORITY

addUnitPriority('minute', 14);

// PARSING

addRegexToken('m',  match1to2);
addRegexToken('mm', match1to2, match2);
addParseToken(['m', 'mm'], MINUTE);

// MOMENTS

var getSetMinute = makeGetSet('Minutes', false);

// FORMATTING

addFormatToken('s', ['ss', 2], 0, 'second');

// ALIASES

addUnitAlias('second', 's');

// PRIORITY

addUnitPriority('second', 15);

// PARSING

addRegexToken('s',  match1to2);
addRegexToken('ss', match1to2, match2);
addParseToken(['s', 'ss'], SECOND);

// MOMENTS

var getSetSecond = makeGetSet('Seconds', false);

// FORMATTING

addFormatToken('S', 0, 0, function () {
    return ~~(this.millisecond() / 100);
});

addFormatToken(0, ['SS', 2], 0, function () {
    return ~~(this.millisecond() / 10);
});

addFormatToken(0, ['SSS', 3], 0, 'millisecond');
addFormatToken(0, ['SSSS', 4], 0, function () {
    return this.millisecond() * 10;
});
addFormatToken(0, ['SSSSS', 5], 0, function () {
    return this.millisecond() * 100;
});
addFormatToken(0, ['SSSSSS', 6], 0, function () {
    return this.millisecond() * 1000;
});
addFormatToken(0, ['SSSSSSS', 7], 0, function () {
    return this.millisecond() * 10000;
});
addFormatToken(0, ['SSSSSSSS', 8], 0, function () {
    return this.millisecond() * 100000;
});
addFormatToken(0, ['SSSSSSSSS', 9], 0, function () {
    return this.millisecond() * 1000000;
});


// ALIASES

addUnitAlias('millisecond', 'ms');

// PRIORITY

addUnitPriority('millisecond', 16);

// PARSING

addRegexToken('S',    match1to3, match1);
addRegexToken('SS',   match1to3, match2);
addRegexToken('SSS',  match1to3, match3);

var token;
for (token = 'SSSS'; token.length <= 9; token += 'S') {
    addRegexToken(token, matchUnsigned);
}

function parseMs(input, array) {
    array[MILLISECOND] = toInt(('0.' + input) * 1000);
}

for (token = 'S'; token.length <= 9; token += 'S') {
    addParseToken(token, parseMs);
}
// MOMENTS

var getSetMillisecond = makeGetSet('Milliseconds', false);

// FORMATTING

addFormatToken('z',  0, 0, 'zoneAbbr');
addFormatToken('zz', 0, 0, 'zoneName');

// MOMENTS

function getZoneAbbr () {
    return this._isUTC ? 'UTC' : '';
}

function getZoneName () {
    return this._isUTC ? 'Coordinated Universal Time' : '';
}

var proto = Moment.prototype;

proto.add               = add;
proto.calendar          = calendar$1;
proto.clone             = clone;
proto.diff              = diff;
proto.endOf             = endOf;
proto.format            = format;
proto.from              = from;
proto.fromNow           = fromNow;
proto.to                = to;
proto.toNow             = toNow;
proto.get               = stringGet;
proto.invalidAt         = invalidAt;
proto.isAfter           = isAfter;
proto.isBefore          = isBefore;
proto.isBetween         = isBetween;
proto.isSame            = isSame;
proto.isSameOrAfter     = isSameOrAfter;
proto.isSameOrBefore    = isSameOrBefore;
proto.isValid           = isValid$2;
proto.lang              = lang;
proto.locale            = locale;
proto.localeData        = localeData;
proto.max               = prototypeMax;
proto.min               = prototypeMin;
proto.parsingFlags      = parsingFlags;
proto.set               = stringSet;
proto.startOf           = startOf;
proto.subtract          = subtract;
proto.toArray           = toArray;
proto.toObject          = toObject;
proto.toDate            = toDate;
proto.toISOString       = toISOString;
proto.inspect           = inspect;
proto.toJSON            = toJSON;
proto.toString          = toString;
proto.unix              = unix;
proto.valueOf           = valueOf;
proto.creationData      = creationData;

// Year
proto.year       = getSetYear;
proto.isLeapYear = getIsLeapYear;

// Week Year
proto.weekYear    = getSetWeekYear;
proto.isoWeekYear = getSetISOWeekYear;

// Quarter
proto.quarter = proto.quarters = getSetQuarter;

// Month
proto.month       = getSetMonth;
proto.daysInMonth = getDaysInMonth;

// Week
proto.week           = proto.weeks        = getSetWeek;
proto.isoWeek        = proto.isoWeeks     = getSetISOWeek;
proto.weeksInYear    = getWeeksInYear;
proto.isoWeeksInYear = getISOWeeksInYear;

// Day
proto.date       = getSetDayOfMonth;
proto.day        = proto.days             = getSetDayOfWeek;
proto.weekday    = getSetLocaleDayOfWeek;
proto.isoWeekday = getSetISODayOfWeek;
proto.dayOfYear  = getSetDayOfYear;

// Hour
proto.hour = proto.hours = getSetHour;

// Minute
proto.minute = proto.minutes = getSetMinute;

// Second
proto.second = proto.seconds = getSetSecond;

// Millisecond
proto.millisecond = proto.milliseconds = getSetMillisecond;

// Offset
proto.utcOffset            = getSetOffset;
proto.utc                  = setOffsetToUTC;
proto.local                = setOffsetToLocal;
proto.parseZone            = setOffsetToParsedOffset;
proto.hasAlignedHourOffset = hasAlignedHourOffset;
proto.isDST                = isDaylightSavingTime;
proto.isLocal              = isLocal;
proto.isUtcOffset          = isUtcOffset;
proto.isUtc                = isUtc;
proto.isUTC                = isUtc;

// Timezone
proto.zoneAbbr = getZoneAbbr;
proto.zoneName = getZoneName;

// Deprecations
proto.dates  = deprecate('dates accessor is deprecated. Use date instead.', getSetDayOfMonth);
proto.months = deprecate('months accessor is deprecated. Use month instead', getSetMonth);
proto.years  = deprecate('years accessor is deprecated. Use year instead', getSetYear);
proto.zone   = deprecate('moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/', getSetZone);
proto.isDSTShifted = deprecate('isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information', isDaylightSavingTimeShifted);

function createUnix (input) {
    return createLocal(input * 1000);
}

function createInZone () {
    return createLocal.apply(null, arguments).parseZone();
}

function preParsePostFormat (string) {
    return string;
}

var proto$1 = Locale.prototype;

proto$1.calendar        = calendar;
proto$1.longDateFormat  = longDateFormat;
proto$1.invalidDate     = invalidDate;
proto$1.ordinal         = ordinal;
proto$1.preparse        = preParsePostFormat;
proto$1.postformat      = preParsePostFormat;
proto$1.relativeTime    = relativeTime;
proto$1.pastFuture      = pastFuture;
proto$1.set             = set;

// Month
proto$1.months            =        localeMonths;
proto$1.monthsShort       =        localeMonthsShort;
proto$1.monthsParse       =        localeMonthsParse;
proto$1.monthsRegex       = monthsRegex;
proto$1.monthsShortRegex  = monthsShortRegex;

// Week
proto$1.week = localeWeek;
proto$1.firstDayOfYear = localeFirstDayOfYear;
proto$1.firstDayOfWeek = localeFirstDayOfWeek;

// Day of Week
proto$1.weekdays       =        localeWeekdays;
proto$1.weekdaysMin    =        localeWeekdaysMin;
proto$1.weekdaysShort  =        localeWeekdaysShort;
proto$1.weekdaysParse  =        localeWeekdaysParse;

proto$1.weekdaysRegex       =        weekdaysRegex;
proto$1.weekdaysShortRegex  =        weekdaysShortRegex;
proto$1.weekdaysMinRegex    =        weekdaysMinRegex;

// Hours
proto$1.isPM = localeIsPM;
proto$1.meridiem = localeMeridiem;

function get$1 (format, index, field, setter) {
    var locale = getLocale();
    var utc = createUTC().set(setter, index);
    return locale[field](utc, format);
}

function listMonthsImpl (format, index, field) {
    if (isNumber(format)) {
        index = format;
        format = undefined;
    }

    format = format || '';

    if (index != null) {
        return get$1(format, index, field, 'month');
    }

    var i;
    var out = [];
    for (i = 0; i < 12; i++) {
        out[i] = get$1(format, i, field, 'month');
    }
    return out;
}

// ()
// (5)
// (fmt, 5)
// (fmt)
// (true)
// (true, 5)
// (true, fmt, 5)
// (true, fmt)
function listWeekdaysImpl (localeSorted, format, index, field) {
    if (typeof localeSorted === 'boolean') {
        if (isNumber(format)) {
            index = format;
            format = undefined;
        }

        format = format || '';
    } else {
        format = localeSorted;
        index = format;
        localeSorted = false;

        if (isNumber(format)) {
            index = format;
            format = undefined;
        }

        format = format || '';
    }

    var locale = getLocale(),
        shift = localeSorted ? locale._week.dow : 0;

    if (index != null) {
        return get$1(format, (index + shift) % 7, field, 'day');
    }

    var i;
    var out = [];
    for (i = 0; i < 7; i++) {
        out[i] = get$1(format, (i + shift) % 7, field, 'day');
    }
    return out;
}

function listMonths (format, index) {
    return listMonthsImpl(format, index, 'months');
}

function listMonthsShort (format, index) {
    return listMonthsImpl(format, index, 'monthsShort');
}

function listWeekdays (localeSorted, format, index) {
    return listWeekdaysImpl(localeSorted, format, index, 'weekdays');
}

function listWeekdaysShort (localeSorted, format, index) {
    return listWeekdaysImpl(localeSorted, format, index, 'weekdaysShort');
}

function listWeekdaysMin (localeSorted, format, index) {
    return listWeekdaysImpl(localeSorted, format, index, 'weekdaysMin');
}

getSetGlobalLocale('en', {
    dayOfMonthOrdinalParse: /\d{1,2}(th|st|nd|rd)/,
    ordinal : function (number) {
        var b = number % 10,
            output = (toInt(number % 100 / 10) === 1) ? 'th' :
            (b === 1) ? 'st' :
            (b === 2) ? 'nd' :
            (b === 3) ? 'rd' : 'th';
        return number + output;
    }
});

// Side effect imports
hooks.lang = deprecate('moment.lang is deprecated. Use moment.locale instead.', getSetGlobalLocale);
hooks.langData = deprecate('moment.langData is deprecated. Use moment.localeData instead.', getLocale);

var mathAbs = Math.abs;

function abs () {
    var data           = this._data;

    this._milliseconds = mathAbs(this._milliseconds);
    this._days         = mathAbs(this._days);
    this._months       = mathAbs(this._months);

    data.milliseconds  = mathAbs(data.milliseconds);
    data.seconds       = mathAbs(data.seconds);
    data.minutes       = mathAbs(data.minutes);
    data.hours         = mathAbs(data.hours);
    data.months        = mathAbs(data.months);
    data.years         = mathAbs(data.years);

    return this;
}

function addSubtract$1 (duration, input, value, direction) {
    var other = createDuration(input, value);

    duration._milliseconds += direction * other._milliseconds;
    duration._days         += direction * other._days;
    duration._months       += direction * other._months;

    return duration._bubble();
}

// supports only 2.0-style add(1, 's') or add(duration)
function add$1 (input, value) {
    return addSubtract$1(this, input, value, 1);
}

// supports only 2.0-style subtract(1, 's') or subtract(duration)
function subtract$1 (input, value) {
    return addSubtract$1(this, input, value, -1);
}

function absCeil (number) {
    if (number < 0) {
        return Math.floor(number);
    } else {
        return Math.ceil(number);
    }
}

function bubble () {
    var milliseconds = this._milliseconds;
    var days         = this._days;
    var months       = this._months;
    var data         = this._data;
    var seconds, minutes, hours, years, monthsFromDays;

    // if we have a mix of positive and negative values, bubble down first
    // check: https://github.com/moment/moment/issues/2166
    if (!((milliseconds >= 0 && days >= 0 && months >= 0) ||
            (milliseconds <= 0 && days <= 0 && months <= 0))) {
        milliseconds += absCeil(monthsToDays(months) + days) * 864e5;
        days = 0;
        months = 0;
    }

    // The following code bubbles up values, see the tests for
    // examples of what that means.
    data.milliseconds = milliseconds % 1000;

    seconds           = absFloor(milliseconds / 1000);
    data.seconds      = seconds % 60;

    minutes           = absFloor(seconds / 60);
    data.minutes      = minutes % 60;

    hours             = absFloor(minutes / 60);
    data.hours        = hours % 24;

    days += absFloor(hours / 24);

    // convert days to months
    monthsFromDays = absFloor(daysToMonths(days));
    months += monthsFromDays;
    days -= absCeil(monthsToDays(monthsFromDays));

    // 12 months -> 1 year
    years = absFloor(months / 12);
    months %= 12;

    data.days   = days;
    data.months = months;
    data.years  = years;

    return this;
}

function daysToMonths (days) {
    // 400 years have 146097 days (taking into account leap year rules)
    // 400 years have 12 months === 4800
    return days * 4800 / 146097;
}

function monthsToDays (months) {
    // the reverse of daysToMonths
    return months * 146097 / 4800;
}

function as (units) {
    if (!this.isValid()) {
        return NaN;
    }
    var days;
    var months;
    var milliseconds = this._milliseconds;

    units = normalizeUnits(units);

    if (units === 'month' || units === 'year') {
        days   = this._days   + milliseconds / 864e5;
        months = this._months + daysToMonths(days);
        return units === 'month' ? months : months / 12;
    } else {
        // handle milliseconds separately because of floating point math errors (issue #1867)
        days = this._days + Math.round(monthsToDays(this._months));
        switch (units) {
            case 'week'   : return days / 7     + milliseconds / 6048e5;
            case 'day'    : return days         + milliseconds / 864e5;
            case 'hour'   : return days * 24    + milliseconds / 36e5;
            case 'minute' : return days * 1440  + milliseconds / 6e4;
            case 'second' : return days * 86400 + milliseconds / 1000;
            // Math.floor prevents floating point math errors here
            case 'millisecond': return Math.floor(days * 864e5) + milliseconds;
            default: throw new Error('Unknown unit ' + units);
        }
    }
}

// TODO: Use this.as('ms')?
function valueOf$1 () {
    if (!this.isValid()) {
        return NaN;
    }
    return (
        this._milliseconds +
        this._days * 864e5 +
        (this._months % 12) * 2592e6 +
        toInt(this._months / 12) * 31536e6
    );
}

function makeAs (alias) {
    return function () {
        return this.as(alias);
    };
}

var asMilliseconds = makeAs('ms');
var asSeconds      = makeAs('s');
var asMinutes      = makeAs('m');
var asHours        = makeAs('h');
var asDays         = makeAs('d');
var asWeeks        = makeAs('w');
var asMonths       = makeAs('M');
var asYears        = makeAs('y');

function get$2 (units) {
    units = normalizeUnits(units);
    return this.isValid() ? this[units + 's']() : NaN;
}

function makeGetter(name) {
    return function () {
        return this.isValid() ? this._data[name] : NaN;
    };
}

var milliseconds = makeGetter('milliseconds');
var seconds      = makeGetter('seconds');
var minutes      = makeGetter('minutes');
var hours        = makeGetter('hours');
var days         = makeGetter('days');
var months       = makeGetter('months');
var years        = makeGetter('years');

function weeks () {
    return absFloor(this.days() / 7);
}

var round = Math.round;
var thresholds = {
    ss: 44,         // a few seconds to seconds
    s : 45,         // seconds to minute
    m : 45,         // minutes to hour
    h : 22,         // hours to day
    d : 26,         // days to month
    M : 11          // months to year
};

// helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {
    return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
}

function relativeTime$1 (posNegDuration, withoutSuffix, locale) {
    var duration = createDuration(posNegDuration).abs();
    var seconds  = round(duration.as('s'));
    var minutes  = round(duration.as('m'));
    var hours    = round(duration.as('h'));
    var days     = round(duration.as('d'));
    var months   = round(duration.as('M'));
    var years    = round(duration.as('y'));

    var a = seconds <= thresholds.ss && ['s', seconds]  ||
            seconds < thresholds.s   && ['ss', seconds] ||
            minutes <= 1             && ['m']           ||
            minutes < thresholds.m   && ['mm', minutes] ||
            hours   <= 1             && ['h']           ||
            hours   < thresholds.h   && ['hh', hours]   ||
            days    <= 1             && ['d']           ||
            days    < thresholds.d   && ['dd', days]    ||
            months  <= 1             && ['M']           ||
            months  < thresholds.M   && ['MM', months]  ||
            years   <= 1             && ['y']           || ['yy', years];

    a[2] = withoutSuffix;
    a[3] = +posNegDuration > 0;
    a[4] = locale;
    return substituteTimeAgo.apply(null, a);
}

// This function allows you to set the rounding function for relative time strings
function getSetRelativeTimeRounding (roundingFunction) {
    if (roundingFunction === undefined) {
        return round;
    }
    if (typeof(roundingFunction) === 'function') {
        round = roundingFunction;
        return true;
    }
    return false;
}

// This function allows you to set a threshold for relative time strings
function getSetRelativeTimeThreshold (threshold, limit) {
    if (thresholds[threshold] === undefined) {
        return false;
    }
    if (limit === undefined) {
        return thresholds[threshold];
    }
    thresholds[threshold] = limit;
    if (threshold === 's') {
        thresholds.ss = limit - 1;
    }
    return true;
}

function humanize (withSuffix) {
    if (!this.isValid()) {
        return this.localeData().invalidDate();
    }

    var locale = this.localeData();
    var output = relativeTime$1(this, !withSuffix, locale);

    if (withSuffix) {
        output = locale.pastFuture(+this, output);
    }

    return locale.postformat(output);
}

var abs$1 = Math.abs;

function toISOString$1() {
    // for ISO strings we do not use the normal bubbling rules:
    //  * milliseconds bubble up until they become hours
    //  * days do not bubble at all
    //  * months bubble up until they become years
    // This is because there is no context-free conversion between hours and days
    // (think of clock changes)
    // and also not between days and months (28-31 days per month)
    if (!this.isValid()) {
        return this.localeData().invalidDate();
    }

    var seconds = abs$1(this._milliseconds) / 1000;
    var days         = abs$1(this._days);
    var months       = abs$1(this._months);
    var minutes, hours, years;

    // 3600 seconds -> 60 minutes -> 1 hour
    minutes           = absFloor(seconds / 60);
    hours             = absFloor(minutes / 60);
    seconds %= 60;
    minutes %= 60;

    // 12 months -> 1 year
    years  = absFloor(months / 12);
    months %= 12;


    // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
    var Y = years;
    var M = months;
    var D = days;
    var h = hours;
    var m = minutes;
    var s = seconds;
    var total = this.asSeconds();

    if (!total) {
        // this is the same as C#'s (Noda) and python (isodate)...
        // but not other JS (goog.date)
        return 'P0D';
    }

    return (total < 0 ? '-' : '') +
        'P' +
        (Y ? Y + 'Y' : '') +
        (M ? M + 'M' : '') +
        (D ? D + 'D' : '') +
        ((h || m || s) ? 'T' : '') +
        (h ? h + 'H' : '') +
        (m ? m + 'M' : '') +
        (s ? s + 'S' : '');
}

var proto$2 = Duration.prototype;

proto$2.isValid        = isValid$1;
proto$2.abs            = abs;
proto$2.add            = add$1;
proto$2.subtract       = subtract$1;
proto$2.as             = as;
proto$2.asMilliseconds = asMilliseconds;
proto$2.asSeconds      = asSeconds;
proto$2.asMinutes      = asMinutes;
proto$2.asHours        = asHours;
proto$2.asDays         = asDays;
proto$2.asWeeks        = asWeeks;
proto$2.asMonths       = asMonths;
proto$2.asYears        = asYears;
proto$2.valueOf        = valueOf$1;
proto$2._bubble        = bubble;
proto$2.get            = get$2;
proto$2.milliseconds   = milliseconds;
proto$2.seconds        = seconds;
proto$2.minutes        = minutes;
proto$2.hours          = hours;
proto$2.days           = days;
proto$2.weeks          = weeks;
proto$2.months         = months;
proto$2.years          = years;
proto$2.humanize       = humanize;
proto$2.toISOString    = toISOString$1;
proto$2.toString       = toISOString$1;
proto$2.toJSON         = toISOString$1;
proto$2.locale         = locale;
proto$2.localeData     = localeData;

// Deprecations
proto$2.toIsoString = deprecate('toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)', toISOString$1);
proto$2.lang = lang;

// Side effect imports

// FORMATTING

addFormatToken('X', 0, 0, 'unix');
addFormatToken('x', 0, 0, 'valueOf');

// PARSING

addRegexToken('x', matchSigned);
addRegexToken('X', matchTimestamp);
addParseToken('X', function (input, array, config) {
    config._d = new Date(parseFloat(input, 10) * 1000);
});
addParseToken('x', function (input, array, config) {
    config._d = new Date(toInt(input));
});

// Side effect imports


hooks.version = '2.18.1';

setHookCallback(createLocal);

hooks.fn                    = proto;
hooks.min                   = min;
hooks.max                   = max;
hooks.now                   = now;
hooks.utc                   = createUTC;
hooks.unix                  = createUnix;
hooks.months                = listMonths;
hooks.isDate                = isDate;
hooks.locale                = getSetGlobalLocale;
hooks.invalid               = createInvalid;
hooks.duration              = createDuration;
hooks.isMoment              = isMoment;
hooks.weekdays              = listWeekdays;
hooks.parseZone             = createInZone;
hooks.localeData            = getLocale;
hooks.isDuration            = isDuration;
hooks.monthsShort           = listMonthsShort;
hooks.weekdaysMin           = listWeekdaysMin;
hooks.defineLocale          = defineLocale;
hooks.updateLocale          = updateLocale;
hooks.locales               = listLocales;
hooks.weekdaysShort         = listWeekdaysShort;
hooks.normalizeUnits        = normalizeUnits;
hooks.relativeTimeRounding = getSetRelativeTimeRounding;
hooks.relativeTimeThreshold = getSetRelativeTimeThreshold;
hooks.calendarFormat        = getCalendarFormat;
hooks.prototype             = proto;

return hooks;

})));
;//! moment.js locale configuration
//! locale : Spanish [es]
//! author : Julio Napurí : https://github.com/julionc

;(function (global, factory) {
   typeof exports === 'object' && typeof module !== 'undefined'
       && typeof require === 'function' ? factory(require('../moment')) :
   typeof define === 'function' && define.amd ? define(['../moment'], factory) :
   factory(global.moment)
}(this, (function (moment) { 'use strict';


var monthsShortDot = 'ene._feb._mar._abr._may._jun._jul._ago._sep._oct._nov._dic.'.split('_');
var monthsShort = 'ene_feb_mar_abr_may_jun_jul_ago_sep_oct_nov_dic'.split('_');

var es = moment.defineLocale('es', {
    months : 'enero_febrero_marzo_abril_mayo_junio_julio_agosto_septiembre_octubre_noviembre_diciembre'.split('_'),
    monthsShort : function (m, format) {
        if (!m) {
            return monthsShortDot;
        } else if (/-MMM-/.test(format)) {
            return monthsShort[m.month()];
        } else {
            return monthsShortDot[m.month()];
        }
    },
    monthsParseExact : true,
    weekdays : 'domingo_lunes_martes_miércoles_jueves_viernes_sábado'.split('_'),
    weekdaysShort : 'dom._lun._mar._mié._jue._vie._sáb.'.split('_'),
    weekdaysMin : 'do_lu_ma_mi_ju_vi_sá'.split('_'),
    weekdaysParseExact : true,
    longDateFormat : {
        LT : 'H:mm',
        LTS : 'H:mm:ss',
        L : 'DD/MM/YYYY',
        LL : 'D [de] MMMM [de] YYYY',
        LLL : 'D [de] MMMM [de] YYYY H:mm',
        LLLL : 'dddd, D [de] MMMM [de] YYYY H:mm'
    },
    calendar : {
        sameDay : function () {
            return '[hoy a la' + ((this.hours() !== 1) ? 's' : '') + '] LT';
        },
        nextDay : function () {
            return '[mañana a la' + ((this.hours() !== 1) ? 's' : '') + '] LT';
        },
        nextWeek : function () {
            return 'dddd [a la' + ((this.hours() !== 1) ? 's' : '') + '] LT';
        },
        lastDay : function () {
            return '[ayer a la' + ((this.hours() !== 1) ? 's' : '') + '] LT';
        },
        lastWeek : function () {
            return '[el] dddd [pasado a la' + ((this.hours() !== 1) ? 's' : '') + '] LT';
        },
        sameElse : 'L'
    },
    relativeTime : {
        future : 'en %s',
        past : 'hace %s',
        s : 'unos segundos',
        m : 'un minuto',
        mm : '%d minutos',
        h : 'una hora',
        hh : '%d horas',
        d : 'un día',
        dd : '%d días',
        M : 'un mes',
        MM : '%d meses',
        y : 'un año',
        yy : '%d años'
    },
    dayOfMonthOrdinalParse : /\d{1,2}º/,
    ordinal : '%dº',
    week : {
        dow : 1, // Monday is the first day of the week.
        doy : 4  // The week that contains Jan 4th is the first week of the year.
    }
});

return es;

})));
;//! moment.js locale configuration
//! locale : German [de]
//! author : lluchs : https://github.com/lluchs
//! author: Menelion Elensúle: https://github.com/Oire
//! author : Mikolaj Dadela : https://github.com/mik01aj

;(function (global, factory) {
   typeof exports === 'object' && typeof module !== 'undefined'
       && typeof require === 'function' ? factory(require('../moment')) :
   typeof define === 'function' && define.amd ? define(['../moment'], factory) :
   factory(global.moment)
}(this, (function (moment) { 'use strict';


function processRelativeTime(number, withoutSuffix, key, isFuture) {
    var format = {
        'm': ['eine Minute', 'einer Minute'],
        'h': ['eine Stunde', 'einer Stunde'],
        'd': ['ein Tag', 'einem Tag'],
        'dd': [number + ' Tage', number + ' Tagen'],
        'M': ['ein Monat', 'einem Monat'],
        'MM': [number + ' Monate', number + ' Monaten'],
        'y': ['ein Jahr', 'einem Jahr'],
        'yy': [number + ' Jahre', number + ' Jahren']
    };
    return withoutSuffix ? format[key][0] : format[key][1];
}

var de = moment.defineLocale('de', {
    months : 'Januar_Februar_März_April_Mai_Juni_Juli_August_September_Oktober_November_Dezember'.split('_'),
    monthsShort : 'Jan._Febr._Mrz._Apr._Mai_Jun._Jul._Aug._Sept._Okt._Nov._Dez.'.split('_'),
    monthsParseExact : true,
    weekdays : 'Sonntag_Montag_Dienstag_Mittwoch_Donnerstag_Freitag_Samstag'.split('_'),
    weekdaysShort : 'So._Mo._Di._Mi._Do._Fr._Sa.'.split('_'),
    weekdaysMin : 'So_Mo_Di_Mi_Do_Fr_Sa'.split('_'),
    weekdaysParseExact : true,
    longDateFormat : {
        LT: 'HH:mm',
        LTS: 'HH:mm:ss',
        L : 'DD.MM.YYYY',
        LL : 'D. MMMM YYYY',
        LLL : 'D. MMMM YYYY HH:mm',
        LLLL : 'dddd, D. MMMM YYYY HH:mm'
    },
    calendar : {
        sameDay: '[heute um] LT [Uhr]',
        sameElse: 'L',
        nextDay: '[morgen um] LT [Uhr]',
        nextWeek: 'dddd [um] LT [Uhr]',
        lastDay: '[gestern um] LT [Uhr]',
        lastWeek: '[letzten] dddd [um] LT [Uhr]'
    },
    relativeTime : {
        future : 'in %s',
        past : 'vor %s',
        s : 'ein paar Sekunden',
        m : processRelativeTime,
        mm : '%d Minuten',
        h : processRelativeTime,
        hh : '%d Stunden',
        d : processRelativeTime,
        dd : processRelativeTime,
        M : processRelativeTime,
        MM : processRelativeTime,
        y : processRelativeTime,
        yy : processRelativeTime
    },
    dayOfMonthOrdinalParse: /\d{1,2}\./,
    ordinal : '%d.',
    week : {
        dow : 1, // Monday is the first day of the week.
        doy : 4  // The week that contains Jan 4th is the first week of the year.
    }
});

return de;

})));
;//! moment.js locale configuration
//! locale : Italian [it]
//! author : Lorenzo : https://github.com/aliem
//! author: Mattia Larentis: https://github.com/nostalgiaz

;(function (global, factory) {
   typeof exports === 'object' && typeof module !== 'undefined'
       && typeof require === 'function' ? factory(require('../moment')) :
   typeof define === 'function' && define.amd ? define(['../moment'], factory) :
   factory(global.moment)
}(this, (function (moment) { 'use strict';


var it = moment.defineLocale('it', {
    months : 'gennaio_febbraio_marzo_aprile_maggio_giugno_luglio_agosto_settembre_ottobre_novembre_dicembre'.split('_'),
    monthsShort : 'gen_feb_mar_apr_mag_giu_lug_ago_set_ott_nov_dic'.split('_'),
    weekdays : 'domenica_lunedì_martedì_mercoledì_giovedì_venerdì_sabato'.split('_'),
    weekdaysShort : 'dom_lun_mar_mer_gio_ven_sab'.split('_'),
    weekdaysMin : 'do_lu_ma_me_gi_ve_sa'.split('_'),
    longDateFormat : {
        LT : 'HH:mm',
        LTS : 'HH:mm:ss',
        L : 'DD/MM/YYYY',
        LL : 'D MMMM YYYY',
        LLL : 'D MMMM YYYY HH:mm',
        LLLL : 'dddd, D MMMM YYYY HH:mm'
    },
    calendar : {
        sameDay: '[Oggi alle] LT',
        nextDay: '[Domani alle] LT',
        nextWeek: 'dddd [alle] LT',
        lastDay: '[Ieri alle] LT',
        lastWeek: function () {
            switch (this.day()) {
                case 0:
                    return '[la scorsa] dddd [alle] LT';
                default:
                    return '[lo scorso] dddd [alle] LT';
            }
        },
        sameElse: 'L'
    },
    relativeTime : {
        future : function (s) {
            return ((/^[0-9].+$/).test(s) ? 'tra' : 'in') + ' ' + s;
        },
        past : '%s fa',
        s : 'alcuni secondi',
        m : 'un minuto',
        mm : '%d minuti',
        h : 'un\'ora',
        hh : '%d ore',
        d : 'un giorno',
        dd : '%d giorni',
        M : 'un mese',
        MM : '%d mesi',
        y : 'un anno',
        yy : '%d anni'
    },
    dayOfMonthOrdinalParse : /\d{1,2}º/,
    ordinal: '%dº',
    week : {
        dow : 1, // Monday is the first day of the week.
        doy : 4  // The week that contains Jan 4th is the first week of the year.
    }
});

return it;

})));
;//! moment.js locale configuration
//! locale : French [fr]
//! author : John Fischer : https://github.com/jfroffice

;(function (global, factory) {
   typeof exports === 'object' && typeof module !== 'undefined'
       && typeof require === 'function' ? factory(require('../moment')) :
   typeof define === 'function' && define.amd ? define(['../moment'], factory) :
   factory(global.moment)
}(this, (function (moment) { 'use strict';


var fr = moment.defineLocale('fr', {
    months : 'janvier_février_mars_avril_mai_juin_juillet_août_septembre_octobre_novembre_décembre'.split('_'),
    monthsShort : 'janv._févr._mars_avr._mai_juin_juil._août_sept._oct._nov._déc.'.split('_'),
    monthsParseExact : true,
    weekdays : 'dimanche_lundi_mardi_mercredi_jeudi_vendredi_samedi'.split('_'),
    weekdaysShort : 'dim._lun._mar._mer._jeu._ven._sam.'.split('_'),
    weekdaysMin : 'Di_Lu_Ma_Me_Je_Ve_Sa'.split('_'),
    weekdaysParseExact : true,
    longDateFormat : {
        LT : 'HH:mm',
        LTS : 'HH:mm:ss',
        L : 'DD/MM/YYYY',
        LL : 'D MMMM YYYY',
        LLL : 'D MMMM YYYY HH:mm',
        LLLL : 'dddd D MMMM YYYY HH:mm'
    },
    calendar : {
        sameDay : '[Aujourd’hui à] LT',
        nextDay : '[Demain à] LT',
        nextWeek : 'dddd [à] LT',
        lastDay : '[Hier à] LT',
        lastWeek : 'dddd [dernier à] LT',
        sameElse : 'L'
    },
    relativeTime : {
        future : 'dans %s',
        past : 'il y a %s',
        s : 'quelques secondes',
        m : 'une minute',
        mm : '%d minutes',
        h : 'une heure',
        hh : '%d heures',
        d : 'un jour',
        dd : '%d jours',
        M : 'un mois',
        MM : '%d mois',
        y : 'un an',
        yy : '%d ans'
    },
    dayOfMonthOrdinalParse: /\d{1,2}(er|)/,
    ordinal : function (number, period) {
        switch (period) {
            // TODO: Return 'e' when day of month > 1. Move this case inside
            // block for masculine words below.
            // See https://github.com/moment/moment/issues/3375
            case 'D':
                return number + (number === 1 ? 'er' : '');

            // Words with masculine grammatical gender: mois, trimestre, jour
            default:
            case 'M':
            case 'Q':
            case 'DDD':
            case 'd':
                return number + (number === 1 ? 'er' : 'e');

            // Words with feminine grammatical gender: semaine
            case 'w':
            case 'W':
                return number + (number === 1 ? 're' : 'e');
        }
    },
    week : {
        dow : 1, // Monday is the first day of the week.
        doy : 4  // The week that contains Jan 4th is the first week of the year.
    }
});

return fr;

})));
;//! moment.js locale configuration
//! locale : Portuguese [pt]
//! author : Jefferson : https://github.com/jalex79

;(function (global, factory) {
   typeof exports === 'object' && typeof module !== 'undefined'
       && typeof require === 'function' ? factory(require('../moment')) :
   typeof define === 'function' && define.amd ? define(['../moment'], factory) :
   factory(global.moment)
}(this, (function (moment) { 'use strict';


var pt = moment.defineLocale('pt', {
    months : 'Janeiro_Fevereiro_Março_Abril_Maio_Junho_Julho_Agosto_Setembro_Outubro_Novembro_Dezembro'.split('_'),
    monthsShort : 'Jan_Fev_Mar_Abr_Mai_Jun_Jul_Ago_Set_Out_Nov_Dez'.split('_'),
    weekdays : 'Domingo_Segunda-Feira_Terça-Feira_Quarta-Feira_Quinta-Feira_Sexta-Feira_Sábado'.split('_'),
    weekdaysShort : 'Dom_Seg_Ter_Qua_Qui_Sex_Sáb'.split('_'),
    weekdaysMin : 'Do_2ª_3ª_4ª_5ª_6ª_Sá'.split('_'),
    weekdaysParseExact : true,
    longDateFormat : {
        LT : 'HH:mm',
        LTS : 'HH:mm:ss',
        L : 'DD/MM/YYYY',
        LL : 'D [de] MMMM [de] YYYY',
        LLL : 'D [de] MMMM [de] YYYY HH:mm',
        LLLL : 'dddd, D [de] MMMM [de] YYYY HH:mm'
    },
    calendar : {
        sameDay: '[Hoje às] LT',
        nextDay: '[Amanhã às] LT',
        nextWeek: 'dddd [às] LT',
        lastDay: '[Ontem às] LT',
        lastWeek: function () {
            return (this.day() === 0 || this.day() === 6) ?
                '[Último] dddd [às] LT' : // Saturday + Sunday
                '[Última] dddd [às] LT'; // Monday - Friday
        },
        sameElse: 'L'
    },
    relativeTime : {
        future : 'em %s',
        past : 'há %s',
        s : 'segundos',
        m : 'um minuto',
        mm : '%d minutos',
        h : 'uma hora',
        hh : '%d horas',
        d : 'um dia',
        dd : '%d dias',
        M : 'um mês',
        MM : '%d meses',
        y : 'um ano',
        yy : '%d anos'
    },
    dayOfMonthOrdinalParse: /\d{1,2}º/,
    ordinal : '%dº',
    week : {
        dow : 1, // Monday is the first day of the week.
        doy : 4  // The week that contains Jan 4th is the first week of the year.
    }
});

return pt;

})));
;//! moment.js locale configuration
//! locale : Russian [ru]
//! author : Viktorminator : https://github.com/Viktorminator
//! Author : Menelion Elensúle : https://github.com/Oire
//! author : Коренберг Марк : https://github.com/socketpair

;(function (global, factory) {
   typeof exports === 'object' && typeof module !== 'undefined'
       && typeof require === 'function' ? factory(require('../moment')) :
   typeof define === 'function' && define.amd ? define(['../moment'], factory) :
   factory(global.moment)
}(this, (function (moment) { 'use strict';


function plural(word, num) {
    var forms = word.split('_');
    return num % 10 === 1 && num % 100 !== 11 ? forms[0] : (num % 10 >= 2 && num % 10 <= 4 && (num % 100 < 10 || num % 100 >= 20) ? forms[1] : forms[2]);
}
function relativeTimeWithPlural(number, withoutSuffix, key) {
    var format = {
        'mm': withoutSuffix ? 'минута_минуты_минут' : 'минуту_минуты_минут',
        'hh': 'час_часа_часов',
        'dd': 'день_дня_дней',
        'MM': 'месяц_месяца_месяцев',
        'yy': 'год_года_лет'
    };
    if (key === 'm') {
        return withoutSuffix ? 'минута' : 'минуту';
    }
    else {
        return number + ' ' + plural(format[key], +number);
    }
}
var monthsParse = [/^янв/i, /^фев/i, /^мар/i, /^апр/i, /^ма[йя]/i, /^июн/i, /^июл/i, /^авг/i, /^сен/i, /^окт/i, /^ноя/i, /^дек/i];

// http://new.gramota.ru/spravka/rules/139-prop : § 103
// Сокращения месяцев: http://new.gramota.ru/spravka/buro/search-answer?s=242637
// CLDR data:          http://www.unicode.org/cldr/charts/28/summary/ru.html#1753
var ru = moment.defineLocale('ru', {
    months : {
        format: 'января_февраля_марта_апреля_мая_июня_июля_августа_сентября_октября_ноября_декабря'.split('_'),
        standalone: 'январь_февраль_март_апрель_май_июнь_июль_август_сентябрь_октябрь_ноябрь_декабрь'.split('_')
    },
    monthsShort : {
        // по CLDR именно "июл." и "июн.", но какой смысл менять букву на точку ?
        format: 'янв._февр._мар._апр._мая_июня_июля_авг._сент._окт._нояб._дек.'.split('_'),
        standalone: 'янв._февр._март_апр._май_июнь_июль_авг._сент._окт._нояб._дек.'.split('_')
    },
    weekdays : {
        standalone: 'воскресенье_понедельник_вторник_среда_четверг_пятница_суббота'.split('_'),
        format: 'воскресенье_понедельник_вторник_среду_четверг_пятницу_субботу'.split('_'),
        isFormat: /\[ ?[Вв] ?(?:прошлую|следующую|эту)? ?\] ?dddd/
    },
    weekdaysShort : 'вс_пн_вт_ср_чт_пт_сб'.split('_'),
    weekdaysMin : 'вс_пн_вт_ср_чт_пт_сб'.split('_'),
    monthsParse : monthsParse,
    longMonthsParse : monthsParse,
    shortMonthsParse : monthsParse,

    // полные названия с падежами, по три буквы, для некоторых, по 4 буквы, сокращения с точкой и без точки
    monthsRegex: /^(январ[ья]|янв\.?|феврал[ья]|февр?\.?|марта?|мар\.?|апрел[ья]|апр\.?|ма[йя]|июн[ья]|июн\.?|июл[ья]|июл\.?|августа?|авг\.?|сентябр[ья]|сент?\.?|октябр[ья]|окт\.?|ноябр[ья]|нояб?\.?|декабр[ья]|дек\.?)/i,

    // копия предыдущего
    monthsShortRegex: /^(январ[ья]|янв\.?|феврал[ья]|февр?\.?|марта?|мар\.?|апрел[ья]|апр\.?|ма[йя]|июн[ья]|июн\.?|июл[ья]|июл\.?|августа?|авг\.?|сентябр[ья]|сент?\.?|октябр[ья]|окт\.?|ноябр[ья]|нояб?\.?|декабр[ья]|дек\.?)/i,

    // полные названия с падежами
    monthsStrictRegex: /^(январ[яь]|феврал[яь]|марта?|апрел[яь]|ма[яй]|июн[яь]|июл[яь]|августа?|сентябр[яь]|октябр[яь]|ноябр[яь]|декабр[яь])/i,

    // Выражение, которое соотвествует только сокращённым формам
    monthsShortStrictRegex: /^(янв\.|февр?\.|мар[т.]|апр\.|ма[яй]|июн[ья.]|июл[ья.]|авг\.|сент?\.|окт\.|нояб?\.|дек\.)/i,
    longDateFormat : {
        LT : 'HH:mm',
        LTS : 'HH:mm:ss',
        L : 'DD.MM.YYYY',
        LL : 'D MMMM YYYY г.',
        LLL : 'D MMMM YYYY г., HH:mm',
        LLLL : 'dddd, D MMMM YYYY г., HH:mm'
    },
    calendar : {
        sameDay: '[Сегодня в] LT',
        nextDay: '[Завтра в] LT',
        lastDay: '[Вчера в] LT',
        nextWeek: function (now) {
            if (now.week() !== this.week()) {
                switch (this.day()) {
                    case 0:
                        return '[В следующее] dddd [в] LT';
                    case 1:
                    case 2:
                    case 4:
                        return '[В следующий] dddd [в] LT';
                    case 3:
                    case 5:
                    case 6:
                        return '[В следующую] dddd [в] LT';
                }
            } else {
                if (this.day() === 2) {
                    return '[Во] dddd [в] LT';
                } else {
                    return '[В] dddd [в] LT';
                }
            }
        },
        lastWeek: function (now) {
            if (now.week() !== this.week()) {
                switch (this.day()) {
                    case 0:
                        return '[В прошлое] dddd [в] LT';
                    case 1:
                    case 2:
                    case 4:
                        return '[В прошлый] dddd [в] LT';
                    case 3:
                    case 5:
                    case 6:
                        return '[В прошлую] dddd [в] LT';
                }
            } else {
                if (this.day() === 2) {
                    return '[Во] dddd [в] LT';
                } else {
                    return '[В] dddd [в] LT';
                }
            }
        },
        sameElse: 'L'
    },
    relativeTime : {
        future : 'через %s',
        past : '%s назад',
        s : 'несколько секунд',
        m : relativeTimeWithPlural,
        mm : relativeTimeWithPlural,
        h : 'час',
        hh : relativeTimeWithPlural,
        d : 'день',
        dd : relativeTimeWithPlural,
        M : 'месяц',
        MM : relativeTimeWithPlural,
        y : 'год',
        yy : relativeTimeWithPlural
    },
    meridiemParse: /ночи|утра|дня|вечера/i,
    isPM : function (input) {
        return /^(дня|вечера)$/.test(input);
    },
    meridiem : function (hour, minute, isLower) {
        if (hour < 4) {
            return 'ночи';
        } else if (hour < 12) {
            return 'утра';
        } else if (hour < 17) {
            return 'дня';
        } else {
            return 'вечера';
        }
    },
    dayOfMonthOrdinalParse: /\d{1,2}-(й|го|я)/,
    ordinal: function (number, period) {
        switch (period) {
            case 'M':
            case 'd':
            case 'DDD':
                return number + '-й';
            case 'D':
                return number + '-го';
            case 'w':
            case 'W':
                return number + '-я';
            default:
                return number;
        }
    },
    week : {
        dow : 1, // Monday is the first day of the week.
        doy : 7  // The week that contains Jan 1st is the first week of the year.
    }
});

return ru;

})));
;//! moment-timezone-utils.js
//! version : 0.5.13
//! Copyright (c) JS Foundation and other contributors
//! license : MIT
//! github.com/moment/moment-timezone

(function (root, factory) {
	"use strict";

	/*global define*/
	if (typeof define === 'function' && define.amd) {
		define(['moment'], factory);                 // AMD
	} else if (typeof module === 'object' && module.exports) {
		module.exports = factory(require('./'));     // Node
	} else {
		factory(root.moment);                        // Browser
	}
}(this, function (moment) {
	"use strict";

	if (!moment.tz) {
		throw new Error("moment-timezone-utils.js must be loaded after moment-timezone.js");
	}

	/************************************
		Pack Base 60
	************************************/

	var BASE60 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWX',
		EPSILON = 0.000001; // Used to fix floating point rounding errors

	function packBase60Fraction(fraction, precision) {
		var buffer = '.',
			output = '',
			current;

		while (precision > 0) {
			precision  -= 1;
			fraction   *= 60;
			current     = Math.floor(fraction + EPSILON);
			buffer     += BASE60[current];
			fraction   -= current;

			// Only add buffer to output once we have a non-zero value.
			// This makes '.000' output '', and '.100' output '.1'
			if (current) {
				output += buffer;
				buffer  = '';
			}
		}

		return output;
	}

	function packBase60(number, precision) {
		var output = '',
			absolute = Math.abs(number),
			whole = Math.floor(absolute),
			fraction = packBase60Fraction(absolute - whole, Math.min(~~precision, 10));

		while (whole > 0) {
			output = BASE60[whole % 60] + output;
			whole = Math.floor(whole / 60);
		}

		if (number < 0) {
			output = '-' + output;
		}

		if (output && fraction) {
			return output + fraction;
		}

		if (!fraction && output === '-') {
			return '0';
		}

		return output || fraction || '0';
	}

	/************************************
		Pack
	************************************/

	function packUntils(untils) {
		var out = [],
			last = 0,
			i;

		for (i = 0; i < untils.length - 1; i++) {
			out[i] = packBase60(Math.round((untils[i] - last) / 1000) / 60, 1);
			last = untils[i];
		}

		return out.join(' ');
	}

	function packAbbrsAndOffsets(source) {
		var index = 0,
			abbrs = [],
			offsets = [],
			indices = [],
			map = {},
			i, key;

		for (i = 0; i < source.abbrs.length; i++) {
			key = source.abbrs[i] + '|' + source.offsets[i];
			if (map[key] === undefined) {
				map[key] = index;
				abbrs[index] = source.abbrs[i];
				offsets[index] = packBase60(Math.round(source.offsets[i] * 60) / 60, 1);
				index++;
			}
			indices[i] = packBase60(map[key], 0);
		}

		return abbrs.join(' ') + '|' + offsets.join(' ') + '|' + indices.join('');
	}

	function packPopulation (number) {
		if (!number) {
			return '';
		}
		if (number < 1000) {
			return '|' + number;
		}
		var exponent = String(number | 0).length - 2;
		var precision = Math.round(number / Math.pow(10, exponent));
		return '|' + precision + 'e' + exponent;
	}

	function validatePackData (source) {
		if (!source.name)    { throw new Error("Missing name"); }
		if (!source.abbrs)   { throw new Error("Missing abbrs"); }
		if (!source.untils)  { throw new Error("Missing untils"); }
		if (!source.offsets) { throw new Error("Missing offsets"); }
		if (
			source.offsets.length !== source.untils.length ||
			source.offsets.length !== source.abbrs.length
		) {
			throw new Error("Mismatched array lengths");
		}
	}

	function pack (source) {
		validatePackData(source);
		return [
			source.name,
			packAbbrsAndOffsets(source),
			packUntils(source.untils) + packPopulation(source.population)
		].join('|');
	}

	/************************************
		Create Links
	************************************/

	function arraysAreEqual(a, b) {
		var i;

		if (a.length !== b.length) { return false; }

		for (i = 0; i < a.length; i++) {
			if (a[i] !== b[i]) {
				return false;
			}
		}
		return true;
	}

	function zonesAreEqual(a, b) {
		return arraysAreEqual(a.offsets, b.offsets) && arraysAreEqual(a.abbrs, b.abbrs) && arraysAreEqual(a.untils, b.untils);
	}

	function findAndCreateLinks (input, output, links) {
		var i, j, a, b, group, foundGroup, groups = [];

		for (i = 0; i < input.length; i++) {
			foundGroup = false;
			a = input[i];

			for (j = 0; j < groups.length; j++) {
				group = groups[j];
				b = group[0];
				if (zonesAreEqual(a, b)) {
					if (a.population > b.population) {
						group.unshift(a);
					} else {
						group.push(a);
					}
					foundGroup = true;
				}
			}

			if (!foundGroup) {
				groups.push([a]);
			}
		}

		for (i = 0; i < groups.length; i++) {
			group = groups[i];
			output.push(group[0]);
			for (j = 1; j < group.length; j++) {
				links.push(group[0].name + '|' + group[j].name);
			}
		}
	}

	function createLinks (source) {
		var zones = [],
			links = [];

		if (source.links) {
			links = source.links.slice();
		}

		findAndCreateLinks(source.zones, zones, links);

		return {
			version : source.version,
			zones   : zones,
			links   : links.sort()
		};
	}

	/************************************
		Filter Years
	************************************/

	function findStartAndEndIndex (untils, start, end) {
		var startI = 0,
			endI = untils.length + 1,
			untilYear,
			i;

		if (!end) {
			end = start;
		}

		if (start > end) {
			i = start;
			start = end;
			end = i;
		}

		for (i = 0; i < untils.length; i++) {
			if (untils[i] == null) {
				continue;
			}
			untilYear = new Date(untils[i]).getUTCFullYear();
			if (untilYear < start) {
				startI = i + 1;
			}
			if (untilYear > end) {
				endI = Math.min(endI, i + 1);
			}
		}

		return [startI, endI];
	}

	function filterYears (source, start, end) {
		var slice     = Array.prototype.slice,
			indices   = findStartAndEndIndex(source.untils, start, end),
			untils    = slice.apply(source.untils, indices);

		untils[untils.length - 1] = null;

		return {
			name       : source.name,
			abbrs      : slice.apply(source.abbrs, indices),
			untils     : untils,
			offsets    : slice.apply(source.offsets, indices),
			population : source.population
		};
	}

	/************************************
		Filter, Link, and Pack
	************************************/

	function filterLinkPack (input, start, end) {
		var i,
			inputZones = input.zones,
			outputZones = [],
			output;

		for (i = 0; i < inputZones.length; i++) {
			outputZones[i] = filterYears(inputZones[i], start, end);
		}

		output = createLinks({
			zones : outputZones,
			links : input.links.slice(),
			version : input.version
		});

		for (i = 0; i < output.zones.length; i++) {
			output.zones[i] = pack(output.zones[i]);
		}

		return output;
	}

	/************************************
		Exports
	************************************/

	moment.tz.pack           = pack;
	moment.tz.packBase60     = packBase60;
	moment.tz.createLinks    = createLinks;
	moment.tz.filterYears    = filterYears;
	moment.tz.filterLinkPack = filterLinkPack;

	return moment;
}));
;(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.momentParseformat = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var parseFormat = require('./lib/parseformat')
module.exports = parseFormat

/* istanbul ignore next */
if (typeof window !== 'undefined' && window.moment) {
  window.moment.parseFormat = parseFormat
}

},{"./lib/parseformat":2}],2:[function(require,module,exports){
module.exports = parseFormat

var dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
var abbreviatedDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
var shortestDayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
var abbreviatedMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

var regexDayNames = new RegExp(dayNames.join('|'), 'i')
var regexAbbreviatedDayNames = new RegExp(abbreviatedDayNames.join('|'), 'i')
var regexShortestDayNames = new RegExp('\\b(' + shortestDayNames.join('|') + ')\\b', 'i')
var regexMonthNames = new RegExp(monthNames.join('|'), 'i')
var regexAbbreviatedMonthNames = new RegExp(abbreviatedMonthNames.join('|'), 'i')

var regexFirstSecondThirdFourth = /(\d+)(st|nd|rd|th)\b/i
var regexEndian = /(\d{1,4})([/.-])(\d{1,2})[/.-](\d{1,4})/

var regexTimezone = /((\+|-)\d\d:?\d\d)$/
var amOrPm = '(' + ['AM?', 'PM?'].join('|') + ')'
var regexHoursWithLeadingZeroDigitMinutesSecondsAmPm = new RegExp('0\\d\\:\\d{1,2}\\:\\d{1,2}(\\s*)' + amOrPm, 'i')
var regexHoursWithLeadingZeroDigitMinutesAmPm = new RegExp('0\\d\\:\\d{1,2}(\\s*)' + amOrPm, 'i')
var regexHoursWithLeadingZeroDigitAmPm = new RegExp('0\\d(\\s*)' + amOrPm, 'i')
var regexHoursMinutesSecondsAmPm = new RegExp('\\d{1,2}\\:\\d{1,2}\\:\\d{1,2}(\\s*)' + amOrPm, 'i')
var regexHoursMinutesAmPm = new RegExp('\\d{1,2}\\:\\d{1,2}(\\s*)' + amOrPm, 'i')
var regexHoursAmPm = new RegExp('\\d{1,2}(\\s*)' + amOrPm, 'i')

var regexISO8601HoursWithLeadingZeroMinutesSecondsMilliseconds = /\d{2}:\d{2}:\d{2}\.\d{3}/
var regexISO8601HoursWithLeadingZeroMinutesSecondsCentiSeconds = /\d{2}:\d{2}:\d{2}\.\d{2}/
var regexISO8601HoursWithLeadingZeroMinutesSecondsDeciSeconds = /\d{2}:\d{2}:\d{2}\.\d{1}/
var regexHoursWithLeadingZeroMinutesSeconds = /0\d:\d{2}:\d{2}/
var regexHoursWithLeadingZeroMinutes = /0\d:\d{2}/
var regexHoursMinutesSeconds = /\d{1,2}:\d{2}:\d{2}/
var regexHoursMinutesSecondsMilliseconds = /\d{1,2}:\d{2}:\d{2}\.\d{3}/
var regexHoursMinutesSecondsCentiSeconds = /\d{1,2}:\d{2}:\d{2}\.\d{2}/
var regexHoursMinutesSecondsDeciSeconds = /\d{1,2}:\d{2}:\d{2}\.\d{1}/
var regexHoursMinutes = /\d{1,2}:\d{2}/
var regexYearLong = /\d{4}/
var regexDayLeadingZero = /0\d/
var regexDay = /\d{1,2}/
var regexYearShort = /\d{2}/

var regexDayShortMonthShort = /^([1-9])\/([1-9]|0[1-9])$/
var regexDayShortMonth = /^([1-9])\/(1[012])$/
var regexDayMonthShort = /^(0[1-9]|[12][0-9]|3[01])\/([1-9])$/
var regexDayMonth = /^(0[1-9]|[12][0-9]|3[01])\/(1[012]|0[1-9])$/

var regexMonthShortYearShort = /^([1-9])\/([1-9][0-9])$/
var regexMonthYearShort = /^(0[1-9]|1[012])\/([1-9][0-9])$/

var formatIncludesMonth = /([/][M]|[M][/]|[MM]|[MMMM])/

var regexFillingWords = /\b(at)\b/i

var regexUnixMillisecondTimestamp = /\d{13}/
var regexUnixTimestamp = /\d{10}/

// option defaults
var defaultOrder = {
  '/': 'MDY',
  '.': 'DMY',
  '-': 'YMD'
}

function parseFormat (dateString, options) {
  var format = dateString.toString()

  // default options
  options = options || {}
  options.preferredOrder = options.preferredOrder || defaultOrder

  // Unix Millisecond Timestamp ☛ x
  format = format.replace(regexUnixMillisecondTimestamp, 'x')
  // Unix Timestamp ☛ X
  format = format.replace(regexUnixTimestamp, 'X')

  // escape filling words
  format = format.replace(regexFillingWords, '[$1]')

  //  DAYS

  // Monday ☛ dddd
  format = format.replace(regexDayNames, 'dddd')
  // Mon ☛ ddd
  format = format.replace(regexAbbreviatedDayNames, 'ddd')
  // Mo ☛ dd
  format = format.replace(regexShortestDayNames, 'dd')

  // 1st, 2nd, 23rd ☛ do
  format = format.replace(regexFirstSecondThirdFourth, 'Do')

  // MONTHS

  // January ☛ MMMM
  format = format.replace(regexMonthNames, 'MMMM')
  // Jan ☛ MMM
  format = format.replace(regexAbbreviatedMonthNames, 'MMM')

  // replace endians, like 8/20/2010, 20.8.2010 or 2010-8-20
  format = format.replace(regexEndian, replaceEndian.bind(null, options))

  // TIME

  // timezone +02:00 ☛ Z
  format = format.replace(regexTimezone, 'Z')
  // 23:39:43.331 ☛ 'HH:mm:ss.SSS'
  format = format.replace(regexISO8601HoursWithLeadingZeroMinutesSecondsMilliseconds, 'HH:mm:ss.SSS')
  // 23:39:43.33 ☛ 'HH:mm:ss.SS'
  format = format.replace(regexISO8601HoursWithLeadingZeroMinutesSecondsCentiSeconds, 'HH:mm:ss.SS')
  // 23:39:43.3 ☛ 'HH:mm:ss.S'
  format = format.replace(regexISO8601HoursWithLeadingZeroMinutesSecondsDeciSeconds, 'HH:mm:ss.S')
  function replaceWithAmPm (timeFormat) {
    return function (match, whitespace, amPm) {
      return timeFormat + whitespace + (amPm[0].toUpperCase() === amPm[0] ? 'A' : 'a')
    }
  }
  // 05:30:20pm ☛ hh:mm:ssa
  format = format.replace(regexHoursWithLeadingZeroDigitMinutesSecondsAmPm, replaceWithAmPm('hh:mm:ss'))
  // 10:30:20pm ☛ h:mm:ssa
  format = format.replace(regexHoursMinutesSecondsAmPm, replaceWithAmPm('h:mm:ss'))
  // 05:30pm ☛ hh:mma
  format = format.replace(regexHoursWithLeadingZeroDigitMinutesAmPm, replaceWithAmPm('hh:mm'))
  // 10:30pm ☛ h:mma
  format = format.replace(regexHoursMinutesAmPm, replaceWithAmPm('h:mm'))
  // 05pm ☛ hha
  format = format.replace(regexHoursWithLeadingZeroDigitAmPm, replaceWithAmPm('hh'))
  // 10pm ☛ ha
  format = format.replace(regexHoursAmPm, replaceWithAmPm('h'))
  // 05:30:20 ☛ HH:mm:ss
  format = format.replace(regexHoursWithLeadingZeroMinutesSeconds, 'HH:mm:ss')
  // 5:30:20.222 ☛ H:mm:ss.SSS
  format = format.replace(regexHoursMinutesSecondsMilliseconds, 'H:mm:ss.SSS')
  // 5:30:20.22 ☛ H:mm:ss.SS
  format = format.replace(regexHoursMinutesSecondsCentiSeconds, 'H:mm:ss.SS')
  // 5:30:20.2 ☛ H:mm:ss.S
  format = format.replace(regexHoursMinutesSecondsDeciSeconds, 'H:mm:ss.S')
  // 10:30:20 ☛ H:mm:ss
  format = format.replace(regexHoursMinutesSeconds, 'H:mm:ss')
  // 05:30 ☛ H:mm
  format = format.replace(regexHoursWithLeadingZeroMinutes, 'HH:mm')
  // 10:30 ☛ HH:mm
  format = format.replace(regexHoursMinutes, 'H:mm')

  // do we still have numbers left?

  // Lets check for 4 digits first, these are years for sure
  format = format.replace(regexYearLong, 'YYYY')

  // check if both numbers are < 13, then it must be D/M
  format = format.replace(regexDayShortMonthShort, 'D/M')

  // check if first number is < 10 && last < 13, then it must be D/MM
  format = format.replace(regexDayShortMonth, 'D/MM')

  // check if last number is < 32 && last < 10, then it must be DD/M
  format = format.replace(regexDayMonthShort, 'DD/M')

  // check if both numbers are > 10, but first < 32 && last < 13, then it must be DD/MM
  format = format.replace(regexDayMonth, 'DD/MM')

  // check if first < 10 && last > 12, then it must be M/YY
  format = format.replace(regexMonthShortYearShort, 'M/YY')

  // check if first < 13 && last > 12, then it must be MM/YY
  format = format.replace(regexMonthYearShort, 'MM/YY')

  // to prevent 9.20 gets formated to D.Y, we format the complete date first, then go for the time
  if (format.match(formatIncludesMonth)) {
    var regexHoursDotWithLeadingZeroOrDoubleDigitMinutes = /0\d.\d{2}|\d{2}.\d{2}/
    var regexHoursDotMinutes = /\d{1}.\d{2}/

    format = format.replace(regexHoursDotWithLeadingZeroOrDoubleDigitMinutes, 'H.mm')
    format = format.replace(regexHoursDotMinutes, 'h.mm')
  }

  // now, the next number, if existing, must be a day
  format = format.replace(regexDayLeadingZero, 'DD')
  format = format.replace(regexDay, 'D')

  // last but not least, there could still be a year left
  format = format.replace(regexYearShort, 'YY')

  if (format.length < 1) {
    format = undefined
  }

  return format
}

// if we can't find an endian based on the separator, but
// there still is a short date with day, month & year,
// we try to make a smart decision to identify the order
function replaceEndian (options, matchedPart, first, separator, second, third) {
  var parts
  var hasSingleDigit = Math.min(first.length, second.length, third.length) === 1
  var hasQuadDigit = Math.max(first.length, second.length, third.length) === 4
  var preferredOrder = typeof options.preferredOrder === 'string' ? options.preferredOrder : options.preferredOrder[separator]

  first = parseInt(first, 10)
  second = parseInt(second, 10)
  third = parseInt(third, 10)
  parts = [first, second, third]
  preferredOrder = preferredOrder.toUpperCase()

  // If first is a year, order will always be Year-Month-Day
  if (first > 31) {
    parts[0] = hasQuadDigit ? 'YYYY' : 'YY'
    parts[1] = hasSingleDigit ? 'M' : 'MM'
    parts[2] = hasSingleDigit ? 'D' : 'DD'
    return parts.join(separator)
  }

  // Second will never be the year. And if it is a day,
  // the order will always be Month-Day-Year
  if (second > 12) {
    parts[0] = hasSingleDigit ? 'M' : 'MM'
    parts[1] = hasSingleDigit ? 'D' : 'DD'
    parts[2] = hasQuadDigit ? 'YYYY' : 'YY'
    return parts.join(separator)
  }

  // if third is a year ...
  if (third > 31) {
    parts[2] = hasQuadDigit ? 'YYYY' : 'YY'

    // ... try to find day in first and second.
    // If found, the remaining part is the month.
    if (preferredOrder[0] === 'M' && first < 13) {
      parts[0] = hasSingleDigit ? 'M' : 'MM'
      parts[1] = hasSingleDigit ? 'D' : 'DD'
      return parts.join(separator)
    }
    parts[0] = hasSingleDigit ? 'D' : 'DD'
    parts[1] = hasSingleDigit ? 'M' : 'MM'
    return parts.join(separator)
  }

  // if we had no luck until here, we use the preferred order
  parts[preferredOrder.indexOf('D')] = hasSingleDigit ? 'D' : 'DD'
  parts[preferredOrder.indexOf('M')] = hasSingleDigit ? 'M' : 'MM'
  parts[preferredOrder.indexOf('Y')] = hasQuadDigit ? 'YYYY' : 'YY'

  return parts.join(separator)
}

},{}]},{},[1])(1)
});;/*! Moment Duration Format v1.3.0
 *  https://github.com/jsmreese/moment-duration-format 
 *  Date: 2014-07-15
 *
 *  Duration format plugin function for the Moment.js library
 *  http://momentjs.com/
 *
 *  Copyright 2014 John Madhavan-Reese
 *  Released under the MIT license
 */

(function (root, undefined) {

	// repeatZero(qty)
	// returns "0" repeated qty times
	function repeatZero(qty) {
		var result = "";
		
		// exit early
		// if qty is 0 or a negative number
		// or doesn't coerce to an integer
		qty = parseInt(qty, 10);
		if (!qty || qty < 1) { return result; }
		
		while (qty) {
			result += "0";
			qty -= 1;
		}
		
		return result;
	}
	
	// padZero(str, len [, isRight])
	// pads a string with zeros up to a specified length
	// will not pad a string if its length is aready
	// greater than or equal to the specified length
	// default output pads with zeros on the left
	// set isRight to `true` to pad with zeros on the right
	function padZero(str, len, isRight) {
		if (str == null) { str = ""; }
		str = "" + str;
		
		return (isRight ? str : "") + repeatZero(len - str.length) + (isRight ? "" : str);
	}
	
	// isArray
	function isArray(array) {
		return Object.prototype.toString.call(array) === "[object Array]";
	}
	
	// isObject
	function isObject(obj) {
		return Object.prototype.toString.call(obj) === "[object Object]";
	}
	
	// findLast
	function findLast(array, callback) {
		var index = array.length;

		while (index -= 1) {
			if (callback(array[index])) { return array[index]; }
		}
	}

	// find
	function find(array, callback) {
		var index = 0,
			max = array.length,
			match;
			
		if (typeof callback !== "function") {
			match = callback;
			callback = function (item) {
				return item === match;
			};
		}

		while (index < max) {
			if (callback(array[index])) { return array[index]; }
			index += 1;
		}
	}
	
	// each
	function each(array, callback) {
		var index = 0,
			max = array.length;
			
		if (!array || !max) { return; }

		while (index < max) {
			if (callback(array[index], index) === false) { return; }
			index += 1;
		}
	}
	
	// map
	function map(array, callback) {
		var index = 0,
			max = array.length,
			ret = [];

		if (!array || !max) { return ret; }
				
		while (index < max) {
			ret[index] = callback(array[index], index);
			index += 1;
		}
		
		return ret;
	}
	
	// pluck
	function pluck(array, prop) {
		return map(array, function (item) {
			return item[prop];
		});
	}
	
	// compact
	function compact(array) {
		var ret = [];
		
		each(array, function (item) {
			if (item) { ret.push(item); }
		});
		
		return ret;
	}
	
	// unique
	function unique(array) {
		var ret = [];
		
		each(array, function (_a) {
			if (!find(ret, _a)) { ret.push(_a); }
		});
		
		return ret;
	}
	
	// intersection
	function intersection(a, b) {
		var ret = [];
		
		each(a, function (_a) {
			each(b, function (_b) {
				if (_a === _b) { ret.push(_a); }
			});
		});
		
		return unique(ret);
	}
	
	// rest
	function rest(array, callback) {
		var ret = [];
		
		each(array, function (item, index) {
			if (!callback(item)) {
				ret = array.slice(index);
				return false;
			}
		});
		
		return ret;
	}

	// initial
	function initial(array, callback) {
		var reversed = array.slice().reverse();
		
		return rest(reversed, callback).reverse();
	}
	
	// extend
	function extend(a, b) {
		for (var key in b) {
			if (b.hasOwnProperty(key)) { a[key] = b[key]; }
		}
		
		return a;
	}
			
	// define internal moment reference
	var moment;

	if (typeof require === "function") {
		try { moment = require('moment'); } 
		catch (e) {}
	} 
	
	if (!moment && root.moment) {
		moment = root.moment;
	}
	
	if (!moment) {
		throw "Moment Duration Format cannot find Moment.js";
	}
	
	// moment.duration.format([template] [, precision] [, settings])
	moment.duration.fn.format = function () {

		var tokenizer, tokens, types, typeMap, momentTypes, foundFirst, trimIndex,
			args = [].slice.call(arguments),
			settings = extend({}, this.format.defaults),
			// keep a shadow copy of this moment for calculating remainders
			remainder = moment.duration(this);

		// add a reference to this duration object to the settings for use
		// in a template function
		settings.duration = this;

		// parse arguments
		each(args, function (arg) {
			if (typeof arg === "string" || typeof arg === "function") {
				settings.template = arg;
				return;
			}

			if (typeof arg === "number") {
				settings.precision = arg;
				return;
			}

			if (isObject(arg)) {
				extend(settings, arg);
			}
		});

		// types
		types = settings.types = (isArray(settings.types) ? settings.types : settings.types.split(" "));

		// template
		if (typeof settings.template === "function") {
			settings.template = settings.template.apply(settings);
		}

		// tokenizer regexp
		tokenizer = new RegExp(map(types, function (type) {
			return settings[type].source;
		}).join("|"), "g");

		// token type map function
		typeMap = function (token) {
			return find(types, function (type) {
				return settings[type].test(token);
			});
		};

		// tokens array
		tokens = map(settings.template.match(tokenizer), function (token, index) {
			var type = typeMap(token),
				length = token.length;

			return {
				index: index,
				length: length,

				// replace escaped tokens with the non-escaped token text
				token: (type === "escape" ? token.replace(settings.escape, "$1") : token),

				// ignore type on non-moment tokens
				type: ((type === "escape" || type === "general") ? null : type)

				// calculate base value for all moment tokens
				//baseValue: ((type === "escape" || type === "general") ? null : this.as(type))
			};
		}, this);

		// unique moment token types in the template (in order of descending magnitude)
		momentTypes = intersection(types, unique(compact(pluck(tokens, "type"))));

		// exit early if there are no momentTypes
		if (!momentTypes.length) {
			return pluck(tokens, "token").join("");
		}

		// calculate values for each token type in the template
		each(momentTypes, function (momentType, index) {
			var value, wholeValue, decimalValue, isLeast, isMost;

			// calculate integer and decimal value portions
			value = remainder.as(momentType);
			wholeValue = (value > 0 ? Math.floor(value) : Math.ceil(value));
			decimalValue = value - wholeValue;

			// is this the least-significant moment token found?
			isLeast = ((index + 1) === momentTypes.length);

			// is this the most-significant moment token found?
			isMost = (!index);

			// update tokens array
			// using this algorithm to not assume anything about
			// the order or frequency of any tokens
			each(tokens, function (token) {
				if (token.type === momentType) {
					extend(token, {
						value: value,
						wholeValue: wholeValue,
						decimalValue: decimalValue,
						isLeast: isLeast,
						isMost: isMost
					});

					if (isMost) {
						// note the length of the most-significant moment token:
						// if it is greater than one and forceLength is not set, default forceLength to `true`
						if (settings.forceLength == null && token.length > 1) {
							settings.forceLength = true;
						}

						// rationale is this:
						// if the template is "h:mm:ss" and the moment value is 5 minutes, the user-friendly output is "5:00", not "05:00"
						// shouldn't pad the `minutes` token even though it has length of two
						// if the template is "hh:mm:ss", the user clearly wanted everything padded so we should output "05:00"
						// if the user wanted the full padded output, they can set `{ trim: false }` to get "00:05:00"
					}
				}
			});

			// update remainder
			remainder.subtract(wholeValue, momentType);
		});
	
		// trim tokens array
		if (settings.trim) {
			tokens = (settings.trim === "left" ? rest : initial)(tokens, function (token) {
				// return `true` if:
				// the token is not the least moment token (don't trim the least moment token)
				// the token is a moment token that does not have a value (don't trim moment tokens that have a whole value)
				return !(token.isLeast || (token.type != null && token.wholeValue));
			});
		}
		
		
		// build output

		// the first moment token can have special handling
		foundFirst = false;

		// run the map in reverse order if trimming from the right
		if (settings.trim === "right") {
			tokens.reverse();
		}

		tokens = map(tokens, function (token) {
			var val,
				decVal;

			if (!token.type) {
				// if it is not a moment token, use the token as its own value
				return token.token;
			}

			// apply negative precision formatting to the least-significant moment token
			if (token.isLeast && (settings.precision < 0)) {
				val = (Math.floor(token.wholeValue * Math.pow(10, settings.precision)) * Math.pow(10, -settings.precision)).toString();
			} else {
				val = token.wholeValue.toString();
			}
			
			// remove negative sign from the beginning
			val = val.replace(/^\-/, "");

			// apply token length formatting
			// special handling for the first moment token that is not the most significant in a trimmed template
			if (token.length > 1 && (foundFirst || token.isMost || settings.forceLength)) {
				val = padZero(val, token.length);
			}

			// add decimal value if precision > 0
			if (token.isLeast && (settings.precision > 0)) {
				decVal = token.decimalValue.toString().replace(/^\-/, "").split(/\.|e\-/);
				switch (decVal.length) {
					case 1:
						val += "." + padZero(decVal[0], settings.precision, true).slice(0, settings.precision);
						break;
						
					case 2:
						val += "." + padZero(decVal[1], settings.precision, true).slice(0, settings.precision);		
						break;
						
					case 3:
						val += "." + padZero(repeatZero((+decVal[2]) - 1) + (decVal[0] || "0") + decVal[1], settings.precision, true).slice(0, settings.precision);		
						break;
					
					default:
						throw "Moment Duration Format: unable to parse token decimal value.";
				}
			}
			
			// add a negative sign if the value is negative and token is most significant
			if (token.isMost && token.value < 0) {
				val = "-" + val;
			}

			foundFirst = true;

			return val;
		});

		// undo the reverse if trimming from the right
		if (settings.trim === "right") {
			tokens.reverse();
		}

		return tokens.join("");
	};

	moment.duration.fn.format.defaults = {
		// token definitions
		escape: /\[(.+?)\]/,
		years: /[Yy]+/,
		months: /M+/,
		weeks: /[Ww]+/,
		days: /[Dd]+/,
		hours: /[Hh]+/,
		minutes: /m+/,
		seconds: /s+/,
		milliseconds: /S+/,
		general: /.+?/,

		// token type names
		// in order of descending magnitude
		// can be a space-separated token name list or an array of token names
		types: "escape years months weeks days hours minutes seconds milliseconds general",

		// format options

		// trim
		// "left" - template tokens are trimmed from the left until the first moment token that has a value >= 1
		// "right" - template tokens are trimmed from the right until the first moment token that has a value >= 1
		// (the final moment token is not trimmed, regardless of value)
		// `false` - template tokens are not trimmed
		trim: "left",

		// precision
		// number of decimal digits to include after (to the right of) the decimal point (positive integer)
		// or the number of digits to truncate to 0 before (to the left of) the decimal point (negative integer)
		precision: 0,

		// force first moment token with a value to render at full length even when template is trimmed and first moment token has length of 1
		forceLength: null,

		// template used to format duration
		// may be a function or a string
		// template functions are executed with the `this` binding of the settings object
		// so that template strings may be dynamically generated based on the duration object
		// (accessible via `this.duration`)
		// or any of the other settings
		template: function () {
			var types = this.types,
				dur = this.duration,
				lastType = findLast(types, function (type) {
					return dur._data[type];
				});

			// default template strings for each duration dimension type
			switch (lastType) {
				case "seconds":
					return "h:mm:ss";
				case "minutes":
					return "d[d] h:mm";
				case "hours":
					return "d[d] h[h]";
				case "days":
					return "M[m] d[d]";
				case "weeks":
					return "y[y] w[w]";
				case "months":
					return "y[y] M[m]";
				case "years":
					return "y[y]";
				default:
					return "y[y] M[m] d[d] h:mm:ss";
			}
		}
	};

})(this);
;// Generated by CoffeeScript 1.7.1
(function() {
  var $, checkForCountryChange_, formatBack_, formatForPhone_, formatUp_, format_, formats, formattedPhoneNumber_, formattedPhone_, isEventAllowedChar_, isEventAllowed_, mobilePhoneNumber, prefixesAreSubsets_, restrictEventAndFormat_, supportSelectionEnd, withTimeout,
    __slice = [].slice;

  $ = jQuery;

  supportSelectionEnd = 'selectionEnd' in document.createElement('input');

  withTimeout = function(fn) {
    return setTimeout(fn, 50);
  };

  formatForPhone_ = function(phone, defaultPrefix) {
    var bestFormat, format, k, precision, prefix, v;
    if (defaultPrefix == null) {
      defaultPrefix = null;
    }
    if (phone.indexOf('+') !== 0 && defaultPrefix) {
      phone = defaultPrefix + phone.replace(/[^0-9]/g, '');
    } else {
      phone = '+' + phone.replace(/[^0-9]/g, '');
    }
    bestFormat = null;
    precision = 0;
    for (prefix in formats) {
      format = formats[prefix];
      if (phone.length >= prefix.length && phone.substring(0, prefix.length) === prefix && prefix.length > precision) {
        bestFormat = {};
        for (k in format) {
          v = format[k];
          bestFormat[k] = v;
        }
        bestFormat.prefix = prefix;
        precision = prefix.length;
      }
    }
    return bestFormat;
  };

  prefixesAreSubsets_ = function(prefixA, prefixB) {
    if (prefixA === prefixB) {
      return true;
    }
    if (prefixA.length < prefixB.length) {
      return prefixB.substring(0, prefixA.length) === prefixA;
    }
    return prefixA.substring(0, prefixB.length) === prefixB;
  };

  formattedPhoneNumber_ = function(phone, lastChar, defaultPrefix) {
    var format, formatChar, formatDigitCount, formattedPhone, i, phoneDigits, phoneFormat, phonePrefix, prefixPhoneFormat, _i, _j, _len, _ref;
    if (defaultPrefix == null) {
      defaultPrefix = null;
    }
    if (phone.length !== 0 && (phone.substring(0, 1) === "+" || defaultPrefix)) {
      format = formatForPhone_(phone, defaultPrefix);
      if (format && format.format) {
        phoneFormat = format.format;
        phonePrefix = format.prefix;
        if (defaultPrefix) {
          if ((defaultPrefix === phonePrefix || prefixesAreSubsets_(phonePrefix, defaultPrefix)) && (phone.indexOf('+') !== 0 || phone.length === 0)) {
            phoneFormat = phoneFormat.substring(Math.min(phonePrefix.length, defaultPrefix.length) + 1);
            if (format.nationalPrefix != null) {
              prefixPhoneFormat = "";
              for (i = _i = 0, _ref = format.nationalPrefix.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
                prefixPhoneFormat += ".";
              }
              phoneFormat = prefixPhoneFormat + phoneFormat;
            }
          }
        }
        if (phone.substring(0, 1) === "+") {
          phoneDigits = phone.substring(1);
        } else {
          phoneDigits = phone;
        }
        formatDigitCount = phoneFormat.match(/\./g).length;
        formattedPhone = "";
        for (_j = 0, _len = phoneFormat.length; _j < _len; _j++) {
          formatChar = phoneFormat[_j];
          if (formatChar === ".") {
            if (phoneDigits.length === 0) {
              break;
            }
            formattedPhone += phoneDigits.substring(0, 1);
            phoneDigits = phoneDigits.substring(1);
          } else if (lastChar || phoneDigits.length > 0) {
            formattedPhone += formatChar;
          }
        }
        phone = formattedPhone + phoneDigits;
      }
    }
    return phone;
  };

  isEventAllowed_ = function(e) {
    if (e.metaKey) {
      return true;
    }
    if (e.which === 32) {
      return false;
    }
    if (e.which === 0) {
      return true;
    }
    if (e.which < 33) {
      return true;
    }
    return isEventAllowedChar_(e);
  };

  isEventAllowedChar_ = function(e) {
    var char;
    char = String.fromCharCode(e.which);
    return !!/[\d\s+]/.test(char);
  };

  restrictEventAndFormat_ = function(e) {
    var caretEnd, value;
    if (!isEventAllowed_(e)) {
      return e.preventDefault();
    }
    if (!isEventAllowedChar_(e)) {
      return;
    }
    value = this.val();
    caretEnd = supportSelectionEnd ? this.get(0).selectionEnd : this.caret();
    value = value.substring(0, this.caret()) + String.fromCharCode(e.which) + value.substring(caretEnd, value.length);
    format_.call(this, value, e);
    return withTimeout((function(_this) {
      return function() {
        return _this.caret(_this.val().length);
      };
    })(this));
  };

  formatUp_ = function(e) {
    var value;
    checkForCountryChange_.call(this);
    value = this.val();
    if (e.keyCode === 8 && this.caret() === value.length) {
      return;
    }
    return format_.call(this, value, e);
  };

  formatBack_ = function(e) {
    var phone, value;
    if (!e) {
      return;
    }
    if (e.meta) {
      return;
    }
    value = this.val();
    if (value.length === 0) {
      return;
    }
    if (!(this.caret() === value.length)) {
      return;
    }
    if (e.keyCode !== 8) {
      return;
    }
    value = value.substring(0, value.length - 1);
    e.preventDefault();
    phone = formattedPhone_.call(this, value, false);
    if (this.val() !== phone) {
      return this.val(phone);
    }
  };

  format_ = function(value, e) {
    var phone, selection, selectionAtEnd;
    phone = formattedPhone_.call(this, value, true);
    if (phone !== this.val()) {
      selection = this.caret();
      selectionAtEnd = selection === this.val().length;
      e.preventDefault();
      this.val(phone);
      if (!selectionAtEnd) {
        return withTimeout((function(_this) {
          return function() {
            return _this.caret(selection);
          };
        })(this));
      }
    }
  };

  formattedPhone_ = function(phone, lastChar) {
    if (phone.indexOf('+') !== 0 && this.data('defaultPrefix')) {
      phone = phone.replace(/[^0-9]/g, '');
    } else {
      phone = '+' + phone.replace(/[^0-9]/g, '');
    }
    return formattedPhoneNumber_(phone, lastChar, this.data('defaultPrefix'));
  };

  checkForCountryChange_ = function() {
    var country, format, phone;
    phone = this.val();
    format = formatForPhone_(phone, this.data('defaultPrefix'));
    country = null;
    if (format) {
      country = format.country;
    }
    if (this.data('mobilePhoneCountry') !== country) {
      this.data('mobilePhoneCountry', country);
      return this.trigger('country.mobilePhoneNumber', country);
    }
  };

  mobilePhoneNumber = {};

  mobilePhoneNumber.init = function(options) {
    var _ref;
    if (options == null) {
      options = {};
    }
    if (!this.data('mobilePhoneNumberInited')) {
      this.data('mobilePhoneNumberInited', true);
      this.bind('keypress', (function(_this) {
        return function() {
          return restrictEventAndFormat_.apply($(_this), arguments);
        };
      })(this));
      this.bind('keyup', (function(_this) {
        return function() {
          return formatUp_.apply($(_this), arguments);
        };
      })(this));
      this.bind('keydown', (function(_this) {
        return function() {
          return formatBack_.apply($(_this), arguments);
        };
      })(this));
    }
    this.data('defaultPrefix', (_ref = options.allowPhoneWithoutPrefix) != null ? _ref : options.defaultPrefix);
    if (this.val() !== '') {
      this.val(formattedPhone_.call(this, this.val(), false));
    }
    return this;
  };

  mobilePhoneNumber.val = function() {
    var format, val;
    val = this.val().replace(/[^0-9]/g, '');
    format = formatForPhone_(val, this.data('defaultPrefix'));
    if (this.val().indexOf('+') === 0 || (this.data('defaultPrefix') == null)) {
      return '+' + val;
    } else {
      return this.data('defaultPrefix') + val;
    }
  };

  mobilePhoneNumber.validate = function() {
    var format, val;
    val = this.mobilePhoneNumber('val');
    format = formatForPhone_(val, this.data('defaultPrefix'));
    if (!format) {
      return true;
    }
    return val.length > format.prefix.length;
  };

  mobilePhoneNumber.country = function() {
    var format;
    format = formatForPhone_(this.mobilePhoneNumber('val'));
    if (format) {
      return format.country;
    }
  };

  mobilePhoneNumber.prefix = function() {
    var countryCode;
    countryCode = this.mobilePhoneNumber('country');
    if (countryCode == null) {
      return "";
    }
    return $.mobilePhoneNumberPrefixFromCountryCode(countryCode);
  };

  $.fn.mobilePhoneNumber = function() {
    var args, method;
    method = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    if ((method == null) || !(typeof method === 'string')) {
      if (method != null) {
        args = [method];
      }
      method = 'init';
    }
    return mobilePhoneNumber[method].apply(this, args);
  };

  $.formatMobilePhoneNumber = function(phone) {
    phone = '+' + phone.replace(/[^0-9\*]/g, '');
    return formattedPhoneNumber_(phone, true);
  };

  $.mobilePhoneNumberPrefixFromCountryCode = function(countryCode) {
    var format, prefix;
    for (prefix in formats) {
      format = formats[prefix];
      if (format.country.toLowerCase() === countryCode.toLowerCase()) {
        if (prefix.length === 5 && prefix[1] === '1') {
          return '+1';
        }
        return prefix;
      }
    }
    return null;
  };

  formats = {
    '+247': {
      country: 'AC'
    },
    '+376': {
      country: 'AD',
      format: '+... ... ...'
    },
    '+971': {
      country: 'AE',
      format: '+... .. ... ....'
    },
    '+93': {
      country: 'AF',
      format: '+.. .. ... ....'
    },
    '+1268': {
      country: 'AG'
    },
    '+1264': {
      country: 'AI'
    },
    '+355': {
      country: 'AL',
      format: '+... .. ... ....'
    },
    '+374': {
      country: 'AM',
      format: '+... .. ......'
    },
    '+244': {
      country: 'AO',
      format: '+... ... ... ...'
    },
    '+54': {
      country: 'AR',
      format: '+.. .. ..-....-....'
    },
    '+1684': {
      country: 'AS'
    },
    '+43': {
      country: 'AT',
      format: '+.. ... ......'
    },
    '+61': {
      country: 'AU',
      format: '+.. ... ... ...'
    },
    '+297': {
      country: 'AW',
      format: '+... ... ....'
    },
    '+994': {
      country: 'AZ',
      format: '+... .. ... .. ..'
    },
    '+387': {
      country: 'BA',
      format: '+... .. ...-...'
    },
    '+1246': {
      country: 'BB'
    },
    '+880': {
      country: 'BD',
      format: '+... ....-......'
    },
    '+32': {
      country: 'BE',
      format: '+.. ... .. .. ..'
    },
    '+226': {
      country: 'BF',
      format: '+... .. .. .. ..'
    },
    '+359': {
      country: 'BG',
      format: '+... ... ... ..'
    },
    '+973': {
      country: 'BH',
      format: '+... .... ....'
    },
    '+257': {
      country: 'BI',
      format: '+... .. .. .. ..'
    },
    '+229': {
      country: 'BJ',
      format: '+... .. .. .. ..'
    },
    '+1441': {
      country: 'BM'
    },
    '+673': {
      country: 'BN',
      format: '+... ... ....'
    },
    '+591': {
      country: 'BO',
      format: '+... ........'
    },
    '+55': {
      country: 'BR',
      format: '+.. .. .....-....'
    },
    '+1242': {
      country: 'BS'
    },
    '+975': {
      country: 'BT',
      format: '+... .. .. .. ..'
    },
    '+267': {
      country: 'BW',
      format: '+... .. ... ...'
    },
    '+375': {
      country: 'BY',
      format: '+... .. ...-..-..'
    },
    '+501': {
      country: 'BZ',
      format: '+... ...-....'
    },
    '+243': {
      country: 'CD',
      format: '+... ... ... ...'
    },
    '+236': {
      country: 'CF',
      format: '+... .. .. .. ..'
    },
    '+242': {
      country: 'CG',
      format: '+... .. ... ....'
    },
    '+41': {
      country: 'CH',
      format: '+.. .. ... .. ..'
    },
    '+225': {
      country: 'CI',
      format: '+... .. .. .. ..'
    },
    '+682': {
      country: 'CK',
      format: '+... .. ...'
    },
    '+56': {
      country: 'CL',
      format: '+.. . .... ....'
    },
    '+237': {
      country: 'CM',
      format: '+... .. .. .. ..'
    },
    '+86': {
      country: 'CN',
      format: '+.. ... .... ....'
    },
    '+57': {
      country: 'CO',
      format: '+.. ... .......'
    },
    '+506': {
      country: 'CR',
      format: '+... .... ....'
    },
    '+53': {
      country: 'CU',
      format: '+.. . .......'
    },
    '+238': {
      country: 'CV',
      format: '+... ... .. ..'
    },
    '+599': {
      country: 'CW',
      format: '+... . ... ....'
    },
    '+537': {
      country: 'CY'
    },
    '+357': {
      country: 'CY',
      format: '+... .. ......'
    },
    '+420': {
      country: 'CZ',
      format: '+... ... ... ...'
    },
    '+49': {
      country: 'DE',
      format: '+.. .... .......'
    },
    '+253': {
      country: 'DJ',
      format: '+... .. .. .. ..'
    },
    '+45': {
      country: 'DK',
      format: '+.. .. .. .. ..'
    },
    '+1767': {
      country: 'DM'
    },
    '+1849': {
      country: 'DO'
    },
    '+213': {
      country: 'DZ',
      format: '+... ... .. .. ..'
    },
    '+593': {
      country: 'EC',
      format: '+... .. ... ....'
    },
    '+372': {
      country: 'EE',
      format: '+... .... ....'
    },
    '+20': {
      country: 'EG',
      format: '+.. ... ... ....'
    },
    '+291': {
      country: 'ER',
      format: '+... . ... ...'
    },
    '+34': {
      country: 'ES',
      format: '+.. ... .. .. ..'
    },
    '+251': {
      country: 'ET',
      format: '+... .. ... ....'
    },
    '+358': {
      country: 'FI',
      format: '+... .. ... .. ..'
    },
    '+679': {
      country: 'FJ',
      format: '+... ... ....'
    },
    '+500': {
      country: 'FK'
    },
    '+691': {
      country: 'FM',
      format: '+... ... ....'
    },
    '+298': {
      country: 'FO',
      format: '+... ......'
    },
    '+33': {
      country: 'FR',
      format: '+.. . .. .. .. ..'
    },
    '+241': {
      country: 'GA',
      format: '+... .. .. .. ..'
    },
    '+44': {
      country: 'GB',
      format: '+.. .... ......'
    },
    '+1473': {
      country: 'GD'
    },
    '+995': {
      country: 'GE',
      format: '+... ... .. .. ..'
    },
    '+594': {
      country: 'GF',
      format: '+... ... .. .. ..'
    },
    '+233': {
      country: 'GH',
      format: '+... .. ... ....'
    },
    '+350': {
      country: 'GI',
      format: '+... ... .....'
    },
    '+299': {
      country: 'GL',
      format: '+... .. .. ..'
    },
    '+220': {
      country: 'GM',
      format: '+... ... ....'
    },
    '+224': {
      country: 'GN',
      format: '+... ... .. .. ..'
    },
    '+240': {
      country: 'GQ',
      format: '+... ... ... ...'
    },
    '+30': {
      country: 'GR',
      format: '+.. ... ... ....'
    },
    '+502': {
      country: 'GT',
      format: '+... .... ....'
    },
    '+1671': {
      country: 'GU'
    },
    '+245': {
      country: 'GW',
      format: '+... ... ....'
    },
    '+592': {
      country: 'GY',
      format: '+... ... ....'
    },
    '+852': {
      country: 'HK',
      format: '+... .... ....'
    },
    '+504': {
      country: 'HN',
      format: '+... ....-....'
    },
    '+385': {
      country: 'HR',
      format: '+... .. ... ....'
    },
    '+509': {
      country: 'HT',
      format: '+... .. .. ....'
    },
    '+36': {
      country: 'HU',
      format: '+.. .. ... ....'
    },
    '+62': {
      country: 'ID',
      format: '+.. ...-...-...'
    },
    '+353': {
      country: 'IE',
      format: '+... .. ... ....'
    },
    '+972': {
      country: 'IL',
      format: '+... ..-...-....'
    },
    '+91': {
      country: 'IN',
      format: '+.. .. .. ......'
    },
    '+246': {
      country: 'IO',
      format: '+... ... ....'
    },
    '+964': {
      country: 'IQ',
      format: '+... ... ... ....'
    },
    '+98': {
      country: 'IR',
      format: '+.. ... ... ....'
    },
    '+354': {
      country: 'IS',
      format: '+... ... ....'
    },
    '+39': {
      country: 'IT',
      format: '+.. .. .... ....'
    },
    '+1876': {
      country: 'JM'
    },
    '+962': {
      country: 'JO',
      format: '+... . .... ....'
    },
    '+81': {
      country: 'JP',
      format: '+.. ..-....-....',
      nationalPrefix: '0'
    },
    '+254': {
      country: 'KE',
      format: '+... .. .......'
    },
    '+996': {
      country: 'KG',
      format: '+... ... ... ...'
    },
    '+855': {
      country: 'KH',
      format: '+... .. ... ...'
    },
    '+686': {
      country: 'KI'
    },
    '+269': {
      country: 'KM',
      format: '+... ... .. ..'
    },
    '+1869': {
      country: 'KN'
    },
    '+850': {
      country: 'KP',
      format: '+... ... ... ....'
    },
    '+82': {
      country: 'KR',
      format: '+.. ..-....-....'
    },
    '+965': {
      country: 'KW',
      format: '+... ... .....'
    },
    '+345': {
      country: 'KY'
    },
    '+77': {
      country: 'KZ'
    },
    '+856': {
      country: 'LA',
      format: '+... .. .. ... ...'
    },
    '+961': {
      country: 'LB',
      format: '+... .. ... ...'
    },
    '+1758': {
      country: 'LC'
    },
    '+423': {
      country: 'LI',
      format: '+... ... ... ...'
    },
    '+94': {
      country: 'LK',
      format: '+.. .. . ......'
    },
    '+231': {
      country: 'LR',
      format: '+... ... ... ...'
    },
    '+266': {
      country: 'LS',
      format: '+... .... ....'
    },
    '+370': {
      country: 'LT',
      format: '+... ... .....'
    },
    '+352': {
      country: 'LU',
      format: '+... .. .. .. ...'
    },
    '+371': {
      country: 'LV',
      format: '+... .. ... ...'
    },
    '+218': {
      country: 'LY',
      format: '+... ..-.......'
    },
    '+212': {
      country: 'MA',
      format: '+... ...-......'
    },
    '+377': {
      country: 'MC',
      format: '+... . .. .. .. ..'
    },
    '+373': {
      country: 'MD',
      format: '+... ... .. ...'
    },
    '+382': {
      country: 'ME',
      format: '+... .. ... ...'
    },
    '+590': {
      country: 'MF'
    },
    '+261': {
      country: 'MG',
      format: '+... .. .. ... ..'
    },
    '+692': {
      country: 'MH',
      format: '+... ...-....'
    },
    '+389': {
      country: 'MK',
      format: '+... .. ... ...'
    },
    '+223': {
      country: 'ML',
      format: '+... .. .. .. ..'
    },
    '+95': {
      country: 'MM',
      format: '+.. . ... ....'
    },
    '+976': {
      country: 'MN',
      format: '+... .... ....'
    },
    '+853': {
      country: 'MO',
      format: '+... .... ....'
    },
    '+1670': {
      country: 'MP'
    },
    '+596': {
      country: 'MQ',
      format: '+... ... .. .. ..'
    },
    '+222': {
      country: 'MR',
      format: '+... .. .. .. ..'
    },
    '+1664': {
      country: 'MS'
    },
    '+356': {
      country: 'MT',
      format: '+... .... ....'
    },
    '+230': {
      country: 'MU',
      format: '+... .... ....'
    },
    '+960': {
      country: 'MV',
      format: '+... ...-....'
    },
    '+265': {
      country: 'MW',
      format: '+... ... .. .. ..'
    },
    '+52': {
      country: 'MX',
      format: '+.. ... ... ... ....'
    },
    '+60': {
      country: 'MY',
      format: '+.. ..-... ....'
    },
    '+258': {
      country: 'MZ',
      format: '+... .. ... ....'
    },
    '+264': {
      country: 'NA',
      format: '+... .. ... ....'
    },
    '+687': {
      country: 'NC',
      format: '+... ........'
    },
    '+227': {
      country: 'NE',
      format: '+... .. .. .. ..'
    },
    '+672': {
      country: 'NF',
      format: '+... .. ....'
    },
    '+234': {
      country: 'NG',
      format: '+... ... ... ....'
    },
    '+505': {
      country: 'NI',
      format: '+... .... ....'
    },
    '+31': {
      country: 'NL',
      format: '+.. . ........'
    },
    '+47': {
      country: 'NO',
      format: '+.. ... .. ...'
    },
    '+977': {
      country: 'NP',
      format: '+... ...-.......'
    },
    '+674': {
      country: 'NR',
      format: '+... ... ....'
    },
    '+683': {
      country: 'NU'
    },
    '+64': {
      country: 'NZ',
      format: '+.. .. ... ....'
    },
    '+968': {
      country: 'OM',
      format: '+... .... ....'
    },
    '+507': {
      country: 'PA',
      format: '+... ....-....'
    },
    '+51': {
      country: 'PE',
      format: '+.. ... ... ...'
    },
    '+689': {
      country: 'PF',
      format: '+... .. .. ..'
    },
    '+675': {
      country: 'PG',
      format: '+... ... ....'
    },
    '+63': {
      country: 'PH',
      format: '+.. .... ......'
    },
    '+92': {
      country: 'PK',
      format: '+.. ... .......'
    },
    '+48': {
      country: 'PL',
      format: '+.. .. ... .. ..'
    },
    '+508': {
      country: 'PM',
      format: '+... .. .. ..'
    },
    '+872': {
      country: 'PN'
    },
    '+1939': {
      country: 'PR'
    },
    '+970': {
      country: 'PS',
      format: '+... ... ... ...'
    },
    '+351': {
      country: 'PT',
      format: '+... ... ... ...'
    },
    '+680': {
      country: 'PW',
      format: '+... ... ....'
    },
    '+595': {
      country: 'PY',
      format: '+... .. .......'
    },
    '+974': {
      country: 'QA',
      format: '+... .... ....'
    },
    '+262': {
      country: 'RE'
    },
    '+40': {
      country: 'RO',
      format: '+.. .. ... ....'
    },
    '+381': {
      country: 'RS',
      format: '+... .. .......'
    },
    '+7': {
      country: 'RU',
      format: '+. ... ...-..-..'
    },
    '+250': {
      country: 'RW',
      format: '+... ... ... ...'
    },
    '+966': {
      country: 'SA',
      format: '+... .. ... ....'
    },
    '+677': {
      country: 'SB',
      format: '+... ... ....'
    },
    '+248': {
      country: 'SC',
      format: '+... . ... ...'
    },
    '+249': {
      country: 'SD',
      format: '+... .. ... ....'
    },
    '+46': {
      country: 'SE',
      format: '+.. ..-... .. ..'
    },
    '+65': {
      country: 'SG',
      format: '+.. .... ....'
    },
    '+290': {
      country: 'SH'
    },
    '+386': {
      country: 'SI',
      format: '+... .. ... ...'
    },
    '+421': {
      country: 'SK',
      format: '+... ... ... ...'
    },
    '+232': {
      country: 'SL',
      format: '+... .. ......'
    },
    '+378': {
      country: 'SM',
      format: '+... .. .. .. ..'
    },
    '+221': {
      country: 'SN',
      format: '+... .. ... .. ..'
    },
    '+252': {
      country: 'SO',
      format: '+... .. .......'
    },
    '+597': {
      country: 'SR',
      format: '+... ...-....'
    },
    '+211': {
      country: 'SS',
      format: '+... ... ... ...'
    },
    '+239': {
      country: 'ST',
      format: '+... ... ....'
    },
    '+503': {
      country: 'SV',
      format: '+... .... ....'
    },
    '+963': {
      country: 'SY',
      format: '+... ... ... ...'
    },
    '+268': {
      country: 'SZ',
      format: '+... .... ....'
    },
    '+1649': {
      country: 'TC'
    },
    '+235': {
      country: 'TD',
      format: '+... .. .. .. ..'
    },
    '+228': {
      country: 'TG',
      format: '+... .. .. .. ..'
    },
    '+66': {
      country: 'TH',
      format: '+.. .. ... ....'
    },
    '+992': {
      country: 'TJ',
      format: '+... ... .. ....'
    },
    '+690': {
      country: 'TK'
    },
    '+670': {
      country: 'TL',
      format: '+... .... ....'
    },
    '+993': {
      country: 'TM',
      format: '+... .. ..-..-..'
    },
    '+216': {
      country: 'TN',
      format: '+... .. ... ...'
    },
    '+676': {
      country: 'TO',
      format: '+... ... ....'
    },
    '+90': {
      country: 'TR',
      format: '+.. ... ... ....'
    },
    '+1868': {
      country: 'TT'
    },
    '+688': {
      country: 'TV'
    },
    '+886': {
      country: 'TW',
      format: '+... ... ... ...'
    },
    '+255': {
      country: 'TZ',
      format: '+... ... ... ...'
    },
    '+380': {
      country: 'UA',
      format: '+... .. ... ....'
    },
    '+256': {
      country: 'UG',
      format: '+... ... ......'
    },
    '+1': {
      country: 'US'
    },
    '+598': {
      country: 'UY',
      format: '+... .... ....'
    },
    '+998': {
      country: 'UZ',
      format: '+... .. ... .. ..'
    },
    '+379': {
      country: 'VA'
    },
    '+1784': {
      country: 'VC'
    },
    '+58': {
      country: 'VE',
      format: '+.. ...-.......'
    },
    '+1284': {
      country: 'VG'
    },
    '+1340': {
      country: 'VI'
    },
    '+84': {
      country: 'VN',
      format: '+.. .. ... .. ..'
    },
    '+678': {
      country: 'VU',
      format: '+... ... ....'
    },
    '+681': {
      country: 'WF',
      format: '+... .. .. ..'
    },
    '+685': {
      country: 'WS'
    },
    '+967': {
      country: 'YE',
      format: '+... ... ... ...'
    },
    '+27': {
      country: 'ZA',
      format: '+.. .. ... ....'
    },
    '+260': {
      country: 'ZM',
      format: '+... .. .......'
    },
    '+263': {
      country: 'ZW',
      format: '+... .. ... ....'
    }
  };

  (function(formats) {
    var canadaPrefixes, format, prefix, _i, _len, _results;
    canadaPrefixes = [403, 587, 780, 250, 604, 778, 204, 506, 709, 902, 226, 249, 289, 343, 416, 519, 613, 647, 705, 807, 905, 418, 438, 450, 514, 579, 581, 819, 873, 306, 867];
    for (_i = 0, _len = canadaPrefixes.length; _i < _len; _i++) {
      prefix = canadaPrefixes[_i];
      formats['+1' + prefix] = {
        country: 'CA'
      };
    }
    _results = [];
    for (prefix in formats) {
      format = formats[prefix];
      if (prefix.substring(0, 2) === "+1") {
        _results.push(format.format = '+. (...) ...-....');
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  })(formats);

}).call(this);
;(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.exprEval = factory());
}(this, (function () { 'use strict';

var INUMBER = 'INUMBER';
var IOP1 = 'IOP1';
var IOP2 = 'IOP2';
var IOP3 = 'IOP3';
var IVAR = 'IVAR';
var IFUNCALL = 'IFUNCALL';
var IEXPR = 'IEXPR';
var IMEMBER = 'IMEMBER';

function Instruction(type, value) {
  this.type = type;
  this.value = (value !== undefined && value !== null) ? value : 0;
}

Instruction.prototype.toString = function () {
  switch (this.type) {
    case INUMBER:
    case IOP1:
    case IOP2:
    case IOP3:
    case IVAR:
      return this.value;
    case IFUNCALL:
      return 'CALL ' + this.value;
    case IMEMBER:
      return '.' + this.value;
    default:
      return 'Invalid Instruction';
  }
};

function unaryInstruction(value) {
  return new Instruction(IOP1, value);
}

function binaryInstruction(value) {
  return new Instruction(IOP2, value);
}

function ternaryInstruction(value) {
  return new Instruction(IOP3, value);
}

function simplify(tokens, unaryOps, binaryOps, ternaryOps, values) {
  var nstack = [];
  var newexpression = [];
  var n1, n2, n3;
  var f;
  for (var i = 0; i < tokens.length; i++) {
    var item = tokens[i];
    var type = item.type;
    if (type === INUMBER) {
      nstack.push(item);
    } else if (type === IVAR && values.hasOwnProperty(item.value)) {
      item = new Instruction(INUMBER, values[item.value]);
      nstack.push(item);
    } else if (type === IOP2 && nstack.length > 1) {
      n2 = nstack.pop();
      n1 = nstack.pop();
      f = binaryOps[item.value];
      item = new Instruction(INUMBER, f(n1.value, n2.value));
      nstack.push(item);
    } else if (type === IOP3 && nstack.length > 2) {
      n3 = nstack.pop();
      n2 = nstack.pop();
      n1 = nstack.pop();
      if (item.value === '?') {
        nstack.push(n1.value ? n2.value : n3.value);
      } else {
        f = ternaryOps[item.value];
        item = new Instruction(INUMBER, f(n1.value, n2.value, n3.value));
        nstack.push(item);
      }
    } else if (type === IOP1 && nstack.length > 0) {
      n1 = nstack.pop();
      f = unaryOps[item.value];
      item = new Instruction(INUMBER, f(n1.value));
      nstack.push(item);
    } else if (type === IEXPR) {
      while (nstack.length > 0) {
        newexpression.push(nstack.shift());
      }
      newexpression.push(new Instruction(IEXPR, simplify(item.value, unaryOps, binaryOps, ternaryOps, values)));
    } else if (type === IMEMBER && nstack.length > 0) {
      n1 = nstack.pop();
      nstack.push(new Instruction(INUMBER, n1.value[item.value]));
    } else {
      while (nstack.length > 0) {
        newexpression.push(nstack.shift());
      }
      newexpression.push(item);
    }
  }
  while (nstack.length > 0) {
    newexpression.push(nstack.shift());
  }
  return newexpression;
}

function substitute(tokens, variable, expr) {
  var newexpression = [];
  for (var i = 0; i < tokens.length; i++) {
    var item = tokens[i];
    var type = item.type;
    if (type === IVAR && item.value === variable) {
      for (var j = 0; j < expr.tokens.length; j++) {
        var expritem = expr.tokens[j];
        var replitem;
        if (expritem.type === IOP1) {
          replitem = unaryInstruction(expritem.value);
        } else if (expritem.type === IOP2) {
          replitem = binaryInstruction(expritem.value);
        } else if (expritem.type === IOP3) {
          replitem = ternaryInstruction(expritem.value);
        } else {
          replitem = new Instruction(expritem.type, expritem.value);
        }
        newexpression.push(replitem);
      }
    } else if (type === IEXPR) {
      newexpression.push(new Instruction(IEXPR, substitute(item.value, variable, expr)));
    } else {
      newexpression.push(item);
    }
  }
  return newexpression;
}

function evaluate(tokens, expr, values) {
  var nstack = [];
  var n1, n2, n3;
  var f;
  for (var i = 0; i < tokens.length; i++) {
    var item = tokens[i];
    var type = item.type;
    if (type === INUMBER) {
      nstack.push(item.value);
    } else if (type === IOP2) {
      n2 = nstack.pop();
      n1 = nstack.pop();
      f = expr.binaryOps[item.value];
      nstack.push(f(n1, n2));
    } else if (type === IOP3) {
      n3 = nstack.pop();
      n2 = nstack.pop();
      n1 = nstack.pop();
      if (item.value === '?') {
        nstack.push(evaluate(n1 ? n2 : n3, expr, values));
      } else {
        f = expr.ternaryOps[item.value];
        nstack.push(f(n1, n2, n3));
      }
    } else if (type === IVAR) {
      if (item.value in expr.functions) {
        nstack.push(expr.functions[item.value]);
      } else {
        var v = values[item.value];
        if (v !== undefined) {
          nstack.push(v);
        } else {
          throw new Error('undefined variable: ' + item.value);
        }
      }
    } else if (type === IOP1) {
      n1 = nstack.pop();
      f = expr.unaryOps[item.value];
      nstack.push(f(n1));
    } else if (type === IFUNCALL) {
      var argCount = item.value;
      var args = [];
      while (argCount-- > 0) {
        args.unshift(nstack.pop());
      }
      f = nstack.pop();
      if (f.apply && f.call) {
        nstack.push(f.apply(undefined, args));
      } else {
        throw new Error(f + ' is not a function');
      }
    } else if (type === IEXPR) {
      nstack.push(item.value);
    } else if (type === IMEMBER) {
      n1 = nstack.pop();
      nstack.push(n1[item.value]);
    } else {
      throw new Error('invalid Expression');
    }
  }
  if (nstack.length > 1) {
    throw new Error('invalid Expression (parity)');
  }
  return nstack[0];
}

function expressionToString(tokens, toJS) {
  var nstack = [];
  var n1, n2, n3;
  var f;
  for (var i = 0; i < tokens.length; i++) {
    var item = tokens[i];
    var type = item.type;
    if (type === INUMBER) {
      if (typeof item.value === 'number' && item.value < 0) {
        nstack.push('(' + item.value + ')');
      } else {
        nstack.push(escapeValue(item.value));
      }
    } else if (type === IOP2) {
      n2 = nstack.pop();
      n1 = nstack.pop();
      f = item.value;
      if (toJS) {
        if (f === '^') {
          nstack.push('Math.pow(' + n1 + ', ' + n2 + ')');
        } else if (f === 'and') {
          nstack.push('(!!' + n1 + ' && !!' + n2 + ')');
        } else if (f === 'or') {
          nstack.push('(!!' + n1 + ' || !!' + n2 + ')');
        } else if (f === '||') {
          nstack.push('(String(' + n1 + ') + String(' + n2 + '))');
        } else if (f === '==') {
          nstack.push('(' + n1 + ' === ' + n2 + ')');
        } else if (f === '!=') {
          nstack.push('(' + n1 + ' !== ' + n2 + ')');
        } else {
          nstack.push('(' + n1 + ' ' + f + ' ' + n2 + ')');
        }
      } else {
        nstack.push('(' + n1 + ' ' + f + ' ' + n2 + ')');
      }
    } else if (type === IOP3) {
      n3 = nstack.pop();
      n2 = nstack.pop();
      n1 = nstack.pop();
      f = item.value;
      if (f === '?') {
        nstack.push('(' + n1 + ' ? ' + n2 + ' : ' + n3 + ')');
      } else {
        throw new Error('invalid Expression');
      }
    } else if (type === IVAR) {
      nstack.push(item.value);
    } else if (type === IOP1) {
      n1 = nstack.pop();
      f = item.value;
      if (f === '-' || f === '+') {
        nstack.push('(' + f + n1 + ')');
      } else if (toJS) {
        if (f === 'not') {
          nstack.push('(' + '!' + n1 + ')');
        } else if (f === '!') {
          nstack.push('fac(' + n1 + ')');
        } else {
          nstack.push(f + '(' + n1 + ')');
        }
      } else if (f === '!') {
        nstack.push('(' + n1 + '!)');
      } else {
        nstack.push('(' + f + ' ' + n1 + ')');
      }
    } else if (type === IFUNCALL) {
      var argCount = item.value;
      var args = [];
      while (argCount-- > 0) {
        args.unshift(nstack.pop());
      }
      f = nstack.pop();
      nstack.push(f + '(' + args.join(', ') + ')');
    } else if (type === IMEMBER) {
      n1 = nstack.pop();
      nstack.push(n1 + '.' + item.value);
    } else if (type === IEXPR) {
      nstack.push('(' + expressionToString(item.value, toJS) + ')');
    } else {
      throw new Error('invalid Expression');
    }
  }
  if (nstack.length > 1) {
    throw new Error('invalid Expression (parity)');
  }
  return String(nstack[0]);
}

function escapeValue(v) {
  if (typeof v === 'string') {
    return JSON.stringify(v).replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  }
  return v;
}

function contains(array, obj) {
  for (var i = 0; i < array.length; i++) {
    if (array[i] === obj) {
      return true;
    }
  }
  return false;
}

function getSymbols(tokens, symbols, options) {
  options = options || {};
  var withMembers = !!options.withMembers;
  var prevVar = null;

  for (var i = 0; i < tokens.length; i++) {
    var item = tokens[i];
    if (item.type === IVAR && !contains(symbols, item.value)) {
      if (!withMembers) {
        symbols.push(item.value);
      } else if (prevVar !== null) {
        if (!contains(symbols, prevVar)) {
          symbols.push(prevVar);
        }
        prevVar = item.value;
      } else {
        prevVar = item.value;
      }
    } else if (item.type === IMEMBER && withMembers && prevVar !== null) {
      prevVar += '.' + item.value;
    } else if (item.type === IEXPR) {
      getSymbols(item.value, symbols, options);
    } else if (prevVar !== null) {
      if (!contains(symbols, prevVar)) {
        symbols.push(prevVar);
      }
      prevVar = null;
    }
  }

  if (prevVar !== null && !contains(symbols, prevVar)) {
    symbols.push(prevVar);
  }
}

function Expression(tokens, parser) {
  this.tokens = tokens;
  this.parser = parser;
  this.unaryOps = parser.unaryOps;
  this.binaryOps = parser.binaryOps;
  this.ternaryOps = parser.ternaryOps;
  this.functions = parser.functions;
}

Expression.prototype.simplify = function (values) {
  values = values || {};
  return new Expression(simplify(this.tokens, this.unaryOps, this.binaryOps, this.ternaryOps, values), this.parser);
};

Expression.prototype.substitute = function (variable, expr) {
  if (!(expr instanceof Expression)) {
    expr = this.parser.parse(String(expr));
  }

  return new Expression(substitute(this.tokens, variable, expr), this.parser);
};

Expression.prototype.evaluate = function (values) {
  values = values || {};
  return evaluate(this.tokens, this, values);
};

Expression.prototype.toString = function () {
  return expressionToString(this.tokens, false);
};

Expression.prototype.symbols = function (options) {
  options = options || {};
  var vars = [];
  getSymbols(this.tokens, vars, options);
  return vars;
};

Expression.prototype.variables = function (options) {
  options = options || {};
  var vars = [];
  getSymbols(this.tokens, vars, options);
  var functions = this.functions;
  return vars.filter(function (name) {
    return !(name in functions);
  });
};

Expression.prototype.toJSFunction = function (param, variables) {
  var expr = this;
  var f = new Function(param, 'with(this.functions) with (this.ternaryOps) with (this.binaryOps) with (this.unaryOps) { return ' + expressionToString(this.simplify(variables).tokens, true) + '; }'); // eslint-disable-line no-new-func
  return function () {
    return f.apply(expr, arguments);
  };
};

var TEOF = 'TEOF';
var TOP = 'TOP';
var TNUMBER = 'TNUMBER';
var TSTRING = 'TSTRING';
var TPAREN = 'TPAREN';
var TCOMMA = 'TCOMMA';
var TNAME = 'TNAME';

function Token(type, value, index) {
  this.type = type;
  this.value = value;
  this.index = index;
}

Token.prototype.toString = function () {
  return this.type + ': ' + this.value;
};

function TokenStream(parser, expression) {
  this.pos = 0;
  this.current = null;
  this.unaryOps = parser.unaryOps;
  this.binaryOps = parser.binaryOps;
  this.ternaryOps = parser.ternaryOps;
  this.consts = parser.consts;
  this.expression = expression;
  this.savedPosition = 0;
  this.savedCurrent = null;
  this.options = parser.options;
}

TokenStream.prototype.newToken = function (type, value, pos) {
  return new Token(type, value, pos != null ? pos : this.pos);
};

TokenStream.prototype.save = function () {
  this.savedPosition = this.pos;
  this.savedCurrent = this.current;
};

TokenStream.prototype.restore = function () {
  this.pos = this.savedPosition;
  this.current = this.savedCurrent;
};

TokenStream.prototype.next = function () {
  if (this.pos >= this.expression.length) {
    return this.newToken(TEOF, 'EOF');
  }

  if (this.isWhitespace() || this.isComment()) {
    return this.next();
  } else if (this.isRadixInteger() ||
      this.isNumber() ||
      this.isOperator() ||
      this.isString() ||
      this.isParen() ||
      this.isComma() ||
      this.isNamedOp() ||
      this.isConst() ||
      this.isName()) {
    return this.current;
  } else {
    this.parseError('Unknown character "' + this.expression.charAt(this.pos) + '"');
  }
};

TokenStream.prototype.isString = function () {
  var r = false;
  var startPos = this.pos;
  var quote = this.expression.charAt(startPos);

  if (quote === '\'' || quote === '"') {
    var index = this.expression.indexOf(quote, startPos + 1);
    while (index >= 0 && this.pos < this.expression.length) {
      this.pos = index + 1;
      if (this.expression.charAt(index - 1) !== '\\') {
        var rawString = this.expression.substring(startPos + 1, index);
        this.current = this.newToken(TSTRING, this.unescape(rawString), startPos);
        r = true;
        break;
      }
      index = this.expression.indexOf(quote, index + 1);
    }
  }
  return r;
};

TokenStream.prototype.isParen = function () {
  var c = this.expression.charAt(this.pos);
  if (c === '(' || c === ')') {
    this.current = this.newToken(TPAREN, c);
    this.pos++;
    return true;
  }
  return false;
};

TokenStream.prototype.isComma = function () {
  var c = this.expression.charAt(this.pos);
  if (c === ',') {
    this.current = this.newToken(TCOMMA, ',');
    this.pos++;
    return true;
  }
  return false;
};

TokenStream.prototype.isConst = function () {
  var startPos = this.pos;
  var i = startPos;
  for (; i < this.expression.length; i++) {
    var c = this.expression.charAt(i);
    if (c.toUpperCase() === c.toLowerCase()) {
      if (i === this.pos || (c !== '_' && c !== '.' && (c < '0' || c > '9'))) {
        break;
      }
    }
  }
  if (i > startPos) {
    var str = this.expression.substring(startPos, i);
    if (str in this.consts) {
      this.current = this.newToken(TNUMBER, this.consts[str]);
      this.pos += str.length;
      return true;
    }
  }
  return false;
};

TokenStream.prototype.isNamedOp = function () {
  var startPos = this.pos;
  var i = startPos;
  for (; i < this.expression.length; i++) {
    var c = this.expression.charAt(i);
    if (c.toUpperCase() === c.toLowerCase()) {
      if (i === this.pos || (c !== '_' && (c < '0' || c > '9'))) {
        break;
      }
    }
  }
  if (i > startPos) {
    var str = this.expression.substring(startPos, i);
    if (this.isOperatorEnabled(str) && (str in this.binaryOps || str in this.unaryOps || str in this.ternaryOps)) {
      this.current = this.newToken(TOP, str);
      this.pos += str.length;
      return true;
    }
  }
  return false;
};

TokenStream.prototype.isName = function () {
  var startPos = this.pos;
  var i = startPos;
  var hasLetter = false;
  for (; i < this.expression.length; i++) {
    var c = this.expression.charAt(i);
    if (c.toUpperCase() === c.toLowerCase()) {
      if (i === this.pos && c === '$') {
        continue;
      } else if (i === this.pos || !hasLetter || (c !== '_' && (c < '0' || c > '9'))) {
        break;
      }
    } else {
      hasLetter = true;
    }
  }
  if (hasLetter) {
    var str = this.expression.substring(startPos, i);
    this.current = this.newToken(TNAME, str);
    this.pos += str.length;
    return true;
  }
  return false;
};

TokenStream.prototype.isWhitespace = function () {
  var r = false;
  var c = this.expression.charAt(this.pos);
  while (c === ' ' || c === '\t' || c === '\n' || c === '\r') {
    r = true;
    this.pos++;
    if (this.pos >= this.expression.length) {
      break;
    }
    c = this.expression.charAt(this.pos);
  }
  return r;
};

var codePointPattern = /^[0-9a-f]{4}$/i;

TokenStream.prototype.unescape = function (v) {
  var index = v.indexOf('\\');
  if (index < 0) {
    return v;
  }

  var buffer = v.substring(0, index);
  while (index >= 0) {
    var c = v.charAt(++index);
    switch (c) {
      case '\'':
        buffer += '\'';
        break;
      case '"':
        buffer += '"';
        break;
      case '\\':
        buffer += '\\';
        break;
      case '/':
        buffer += '/';
        break;
      case 'b':
        buffer += '\b';
        break;
      case 'f':
        buffer += '\f';
        break;
      case 'n':
        buffer += '\n';
        break;
      case 'r':
        buffer += '\r';
        break;
      case 't':
        buffer += '\t';
        break;
      case 'u':
        // interpret the following 4 characters as the hex of the unicode code point
        var codePoint = v.substring(index + 1, index + 5);
        if (!codePointPattern.test(codePoint)) {
          this.parseError('Illegal escape sequence: \\u' + codePoint);
        }
        buffer += String.fromCharCode(parseInt(codePoint, 16));
        index += 4;
        break;
      default:
        throw this.parseError('Illegal escape sequence: "\\' + c + '"');
    }
    ++index;
    var backslash = v.indexOf('\\', index);
    buffer += v.substring(index, backslash < 0 ? v.length : backslash);
    index = backslash;
  }

  return buffer;
};

TokenStream.prototype.isComment = function () {
  var c = this.expression.charAt(this.pos);
  if (c === '/' && this.expression.charAt(this.pos + 1) === '*') {
    this.pos = this.expression.indexOf('*/', this.pos) + 2;
    if (this.pos === 1) {
      this.pos = this.expression.length;
    }
    return true;
  }
  return false;
};

TokenStream.prototype.isRadixInteger = function () {
  var pos = this.pos;

  if (pos >= this.expression.length - 2 || this.expression.charAt(pos) !== '0') {
    return false;
  }
  ++pos;

  var radix;
  var validDigit;
  if (this.expression.charAt(pos) === 'x') {
    radix = 16;
    validDigit = /^[0-9a-f]$/i;
    ++pos;
  } else if (this.expression.charAt(pos) === 'b') {
    radix = 2;
    validDigit = /^[01]$/i;
    ++pos;
  } else {
    return false;
  }

  var valid = false;
  var startPos = pos;

  while (pos < this.expression.length) {
    var c = this.expression.charAt(pos);
    if (validDigit.test(c)) {
      pos++;
      valid = true;
    } else {
      break;
    }
  }

  if (valid) {
    this.current = this.newToken(TNUMBER, parseInt(this.expression.substring(startPos, pos), radix));
    this.pos = pos;
  }
  return valid;
};

TokenStream.prototype.isNumber = function () {
  var valid = false;
  var pos = this.pos;
  var startPos = pos;
  var resetPos = pos;
  var foundDot = false;
  var foundDigits = false;
  var c;

  while (pos < this.expression.length) {
    c = this.expression.charAt(pos);
    if ((c >= '0' && c <= '9') || (!foundDot && c === '.')) {
      if (c === '.') {
        foundDot = true;
      } else {
        foundDigits = true;
      }
      pos++;
      valid = foundDigits;
    } else {
      break;
    }
  }

  if (valid) {
    resetPos = pos;
  }

  if (c === 'e' || c === 'E') {
    pos++;
    var acceptSign = true;
    var validExponent = false;
    while (pos < this.expression.length) {
      c = this.expression.charAt(pos);
      if (acceptSign && (c === '+' || c === '-')) {
        acceptSign = false;
      } else if (c >= '0' && c <= '9') {
        validExponent = true;
        acceptSign = false;
      } else {
        break;
      }
      pos++;
    }

    if (!validExponent) {
      pos = resetPos;
    }
  }

  if (valid) {
    this.current = this.newToken(TNUMBER, parseFloat(this.expression.substring(startPos, pos)));
    this.pos = pos;
  } else {
    this.pos = resetPos;
  }
  return valid;
};

TokenStream.prototype.isOperator = function () {
  var startPos = this.pos;
  var c = this.expression.charAt(this.pos);

  if (c === '+' || c === '-' || c === '*' || c === '/' || c === '%' || c === '^' || c === '?' || c === ':' || c === '.') {
    this.current = this.newToken(TOP, c);
  } else if (c === '∙' || c === '•') {
    this.current = this.newToken(TOP, '*');
  } else if (c === '>') {
    if (this.expression.charAt(this.pos + 1) === '=') {
      this.current = this.newToken(TOP, '>=');
      this.pos++;
    } else {
      this.current = this.newToken(TOP, '>');
    }
  } else if (c === '<') {
    if (this.expression.charAt(this.pos + 1) === '=') {
      this.current = this.newToken(TOP, '<=');
      this.pos++;
    } else {
      this.current = this.newToken(TOP, '<');
    }
  } else if (c === '|') {
    if (this.expression.charAt(this.pos + 1) === '|') {
      this.current = this.newToken(TOP, '||');
      this.pos++;
    } else {
      return false;
    }
  } else if (c === '=') {
    if (this.expression.charAt(this.pos + 1) === '=') {
      this.current = this.newToken(TOP, '==');
      this.pos++;
    } else {
      return false;
    }
  } else if (c === '!') {
    if (this.expression.charAt(this.pos + 1) === '=') {
      this.current = this.newToken(TOP, '!=');
      this.pos++;
    } else {
      this.current = this.newToken(TOP, c);
    }
  } else {
    return false;
  }
  this.pos++;

  if (this.isOperatorEnabled(this.current.value)) {
    return true;
  } else {
    this.pos = startPos;
    return false;
  }
};

var optionNameMap = {
  '+': 'add',
  '-': 'subtract',
  '*': 'multiply',
  '/': 'divide',
  '%': 'remainder',
  '^': 'power',
  '!': 'factorial',
  '<': 'comparison',
  '>': 'comparison',
  '<=': 'comparison',
  '>=': 'comparison',
  '==': 'comparison',
  '!=': 'comparison',
  '||': 'concatenate',
  'and': 'logical',
  'or': 'logical',
  'not': 'logical',
  '?': 'conditional',
  ':': 'conditional'
};

function getOptionName(op) {
  return optionNameMap.hasOwnProperty(op) ? optionNameMap[op] : op;
}

TokenStream.prototype.isOperatorEnabled = function (op) {
  var optionName = getOptionName(op);
  var operators = this.options.operators || {};

  // in is a special case for now because it's disabled by default
  if (optionName === 'in') {
    return !!operators['in'];
  }

  return !(optionName in operators) || !!operators[optionName];
};

TokenStream.prototype.getCoordinates = function () {
  var line = 0;
  var column;
  var newline = -1;
  do {
    line++;
    column = this.pos - newline;
    newline = this.expression.indexOf('\n', newline + 1);
  } while (newline >= 0 && newline < this.pos);

  return {
    line: line,
    column: column
  };
};

TokenStream.prototype.parseError = function (msg) {
  var coords = this.getCoordinates();
  throw new Error('parse error [' + coords.line + ':' + coords.column + ']: ' + msg);
};

function ParserState(parser, tokenStream, options) {
  this.parser = parser;
  this.tokens = tokenStream;
  this.current = null;
  this.nextToken = null;
  this.next();
  this.savedCurrent = null;
  this.savedNextToken = null;
  this.allowMemberAccess = options.allowMemberAccess !== false;
}

ParserState.prototype.next = function () {
  this.current = this.nextToken;
  return (this.nextToken = this.tokens.next());
};

ParserState.prototype.tokenMatches = function (token, value) {
  if (typeof value === 'undefined') {
    return true;
  } else if (Array.isArray(value)) {
    return contains(value, token.value);
  } else if (typeof value === 'function') {
    return value(token);
  } else {
    return token.value === value;
  }
};

ParserState.prototype.save = function () {
  this.savedCurrent = this.current;
  this.savedNextToken = this.nextToken;
  this.tokens.save();
};

ParserState.prototype.restore = function () {
  this.tokens.restore();
  this.current = this.savedCurrent;
  this.nextToken = this.savedNextToken;
};

ParserState.prototype.accept = function (type, value) {
  if (this.nextToken.type === type && this.tokenMatches(this.nextToken, value)) {
    this.next();
    return true;
  }
  return false;
};

ParserState.prototype.expect = function (type, value) {
  if (!this.accept(type, value)) {
    var coords = this.tokens.getCoordinates();
    throw new Error('parse error [' + coords.line + ':' + coords.column + ']: Expected ' + (value || type));
  }
};

ParserState.prototype.parseAtom = function (instr) {
  if (this.accept(TNAME)) {
    instr.push(new Instruction(IVAR, this.current.value));
  } else if (this.accept(TNUMBER)) {
    instr.push(new Instruction(INUMBER, this.current.value));
  } else if (this.accept(TSTRING)) {
    instr.push(new Instruction(INUMBER, this.current.value));
  } else if (this.accept(TPAREN, '(')) {
    this.parseExpression(instr);
    this.expect(TPAREN, ')');
  } else {
    throw new Error('unexpected ' + this.nextToken);
  }
};

ParserState.prototype.parseExpression = function (instr) {
  this.parseConditionalExpression(instr);
};

ParserState.prototype.parseConditionalExpression = function (instr) {
  this.parseOrExpression(instr);
  while (this.accept(TOP, '?')) {
    var trueBranch = [];
    var falseBranch = [];
    this.parseConditionalExpression(trueBranch);
    this.expect(TOP, ':');
    this.parseConditionalExpression(falseBranch);
    instr.push(new Instruction(IEXPR, trueBranch));
    instr.push(new Instruction(IEXPR, falseBranch));
    instr.push(ternaryInstruction('?'));
  }
};

ParserState.prototype.parseOrExpression = function (instr) {
  this.parseAndExpression(instr);
  while (this.accept(TOP, 'or')) {
    this.parseAndExpression(instr);
    instr.push(binaryInstruction('or'));
  }
};

ParserState.prototype.parseAndExpression = function (instr) {
  this.parseComparison(instr);
  while (this.accept(TOP, 'and')) {
    this.parseComparison(instr);
    instr.push(binaryInstruction('and'));
  }
};

var COMPARISON_OPERATORS = ['==', '!=', '<', '<=', '>=', '>', 'in'];

ParserState.prototype.parseComparison = function (instr) {
  this.parseAddSub(instr);
  while (this.accept(TOP, COMPARISON_OPERATORS)) {
    var op = this.current;
    this.parseAddSub(instr);
    instr.push(binaryInstruction(op.value));
  }
};

var ADD_SUB_OPERATORS = ['+', '-', '||'];

ParserState.prototype.parseAddSub = function (instr) {
  this.parseTerm(instr);
  while (this.accept(TOP, ADD_SUB_OPERATORS)) {
    var op = this.current;
    this.parseTerm(instr);
    instr.push(binaryInstruction(op.value));
  }
};

var TERM_OPERATORS = ['*', '/', '%'];

ParserState.prototype.parseTerm = function (instr) {
  this.parseFactor(instr);
  while (this.accept(TOP, TERM_OPERATORS)) {
    var op = this.current;
    this.parseFactor(instr);
    instr.push(binaryInstruction(op.value));
  }
};

ParserState.prototype.parseFactor = function (instr) {
  var unaryOps = this.tokens.unaryOps;
  function isPrefixOperator(token) {
    return token.value in unaryOps;
  }

  this.save();
  if (this.accept(TOP, isPrefixOperator)) {
    if ((this.current.value !== '-' && this.current.value !== '+' && this.nextToken.type === TPAREN && this.nextToken.value === '(')) {
      this.restore();
      this.parseExponential(instr);
    } else {
      var op = this.current;
      this.parseFactor(instr);
      instr.push(unaryInstruction(op.value));
    }
  } else {
    this.parseExponential(instr);
  }
};

ParserState.prototype.parseExponential = function (instr) {
  this.parsePostfixExpression(instr);
  while (this.accept(TOP, '^')) {
    this.parseFactor(instr);
    instr.push(binaryInstruction('^'));
  }
};

ParserState.prototype.parsePostfixExpression = function (instr) {
  this.parseFunctionCall(instr);
  while (this.accept(TOP, '!')) {
    instr.push(unaryInstruction('!'));
  }
};

ParserState.prototype.parseFunctionCall = function (instr) {
  var unaryOps = this.tokens.unaryOps;
  function isPrefixOperator(token) {
    return token.value in unaryOps;
  }

  if (this.accept(TOP, isPrefixOperator)) {
    var op = this.current;
    this.parseAtom(instr);
    instr.push(unaryInstruction(op.value));
  } else {
    this.parseMemberExpression(instr);
    while (this.accept(TPAREN, '(')) {
      if (this.accept(TPAREN, ')')) {
        instr.push(new Instruction(IFUNCALL, 0));
      } else {
        var argCount = this.parseArgumentList(instr);
        instr.push(new Instruction(IFUNCALL, argCount));
      }
    }
  }
};

ParserState.prototype.parseArgumentList = function (instr) {
  var argCount = 0;

  while (!this.accept(TPAREN, ')')) {
    this.parseExpression(instr);
    ++argCount;
    while (this.accept(TCOMMA)) {
      this.parseExpression(instr);
      ++argCount;
    }
  }

  return argCount;
};

ParserState.prototype.parseMemberExpression = function (instr) {
  this.parseAtom(instr);
  while (this.accept(TOP, '.')) {
    if (!this.allowMemberAccess) {
      throw new Error('unexpected ".", member access is not permitted');
    }

    this.expect(TNAME);
    instr.push(new Instruction(IMEMBER, this.current.value));
  }
};

function add(a, b) {
  return Number(a) + Number(b);
}

function sub(a, b) {
  return a - b;
}

function mul(a, b) {
  return a * b;
}

function div(a, b) {
  return a / b;
}

function mod(a, b) {
  return a % b;
}

function concat(a, b) {
  return '' + a + b;
}

function equal(a, b) {
  return a === b;
}

function notEqual(a, b) {
  return a !== b;
}

function greaterThan(a, b) {
  return a > b;
}

function lessThan(a, b) {
  return a < b;
}

function greaterThanEqual(a, b) {
  return a >= b;
}

function lessThanEqual(a, b) {
  return a <= b;
}

function andOperator(a, b) {
  return Boolean(a && b);
}

function orOperator(a, b) {
  return Boolean(a || b);
}

function inOperator(a, b) {
  return contains(b, a);
}

function sinh(a) {
  return ((Math.exp(a) - Math.exp(-a)) / 2);
}

function cosh(a) {
  return ((Math.exp(a) + Math.exp(-a)) / 2);
}

function tanh(a) {
  if (a === Infinity) return 1;
  if (a === -Infinity) return -1;
  return (Math.exp(a) - Math.exp(-a)) / (Math.exp(a) + Math.exp(-a));
}

function asinh(a) {
  if (a === -Infinity) return a;
  return Math.log(a + Math.sqrt((a * a) + 1));
}

function acosh(a) {
  return Math.log(a + Math.sqrt((a * a) - 1));
}

function atanh(a) {
  return (Math.log((1 + a) / (1 - a)) / 2);
}

function log10(a) {
  return Math.log(a) * Math.LOG10E;
}

function neg(a) {
  return -a;
}

function not(a) {
  return !a;
}

function trunc(a) {
  return a < 0 ? Math.ceil(a) : Math.floor(a);
}

function random(a) {
  return Math.random() * (a || 1);
}

function factorial(a) { // a!
  return gamma(a + 1);
}

function isInteger(value) {
  return isFinite(value) && (value === Math.round(value));
}

var GAMMA_G = 4.7421875;
var GAMMA_P = [
  0.99999999999999709182,
  57.156235665862923517, -59.597960355475491248,
  14.136097974741747174, -0.49191381609762019978,
  0.33994649984811888699e-4,
  0.46523628927048575665e-4, -0.98374475304879564677e-4,
  0.15808870322491248884e-3, -0.21026444172410488319e-3,
  0.21743961811521264320e-3, -0.16431810653676389022e-3,
  0.84418223983852743293e-4, -0.26190838401581408670e-4,
  0.36899182659531622704e-5
];

// Gamma function from math.js
function gamma(n) {
  var t, x;

  if (isInteger(n)) {
    if (n <= 0) {
      return isFinite(n) ? Infinity : NaN;
    }

    if (n > 171) {
      return Infinity; // Will overflow
    }

    var value = n - 2;
    var res = n - 1;
    while (value > 1) {
      res *= value;
      value--;
    }

    if (res === 0) {
      res = 1; // 0! is per definition 1
    }

    return res;
  }

  if (n < 0.5) {
    return Math.PI / (Math.sin(Math.PI * n) * gamma(1 - n));
  }

  if (n >= 171.35) {
    return Infinity; // will overflow
  }

  if (n > 85.0) { // Extended Stirling Approx
    var twoN = n * n;
    var threeN = twoN * n;
    var fourN = threeN * n;
    var fiveN = fourN * n;
    return Math.sqrt(2 * Math.PI / n) * Math.pow((n / Math.E), n) *
      (1 + (1 / (12 * n)) + (1 / (288 * twoN)) - (139 / (51840 * threeN)) -
      (571 / (2488320 * fourN)) + (163879 / (209018880 * fiveN)) +
      (5246819 / (75246796800 * fiveN * n)));
  }

  --n;
  x = GAMMA_P[0];
  for (var i = 1; i < GAMMA_P.length; ++i) {
    x += GAMMA_P[i] / (n + i);
  }

  t = n + GAMMA_G + 0.5;
  return Math.sqrt(2 * Math.PI) * Math.pow(t, n + 0.5) * Math.exp(-t) * x;
}

function stringLength(s) {
  return String(s).length;
}

function hypot() {
  var sum = 0;
  var larg = 0;
  for (var i = 0; i < arguments.length; i++) {
    var arg = Math.abs(arguments[i]);
    var div;
    if (larg < arg) {
      div = larg / arg;
      sum = (sum * div * div) + 1;
      larg = arg;
    } else if (arg > 0) {
      div = arg / larg;
      sum += div * div;
    } else {
      sum += arg;
    }
  }
  return larg === Infinity ? Infinity : larg * Math.sqrt(sum);
}

function condition(cond, yep, nope) {
  return cond ? yep : nope;
}

/**
* Decimal adjustment of a number.
* From @escopecz.
*
* @param {Number} value The number.
* @param {Integer} exp  The exponent (the 10 logarithm of the adjustment base).
* @return {Number} The adjusted value.
*/
function roundTo(value, exp) {
  // If the exp is undefined or zero...
  if (typeof exp === 'undefined' || +exp === 0) {
    return Math.round(value);
  }
  value = +value;
  exp = -(+exp);
  // If the value is not a number or the exp is not an integer...
  if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
    return NaN;
  }
  // Shift
  value = value.toString().split('e');
  value = Math.round(+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
  // Shift back
  value = value.toString().split('e');
  return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
}

function Parser(options) {
  this.options = options || {};
  this.unaryOps = {
    sin: Math.sin,
    cos: Math.cos,
    tan: Math.tan,
    asin: Math.asin,
    acos: Math.acos,
    atan: Math.atan,
    sinh: Math.sinh || sinh,
    cosh: Math.cosh || cosh,
    tanh: Math.tanh || tanh,
    asinh: Math.asinh || asinh,
    acosh: Math.acosh || acosh,
    atanh: Math.atanh || atanh,
    sqrt: Math.sqrt,
    log: Math.log,
    ln: Math.log,
    lg: Math.log10 || log10,
    log10: Math.log10 || log10,
    abs: Math.abs,
    ceil: Math.ceil,
    floor: Math.floor,
    round: Math.round,
    trunc: Math.trunc || trunc,
    '-': neg,
    '+': Number,
    exp: Math.exp,
    not: not,
    length: stringLength,
    '!': factorial
  };

  this.binaryOps = {
    '+': add,
    '-': sub,
    '*': mul,
    '/': div,
    '%': mod,
    '^': Math.pow,
    '||': concat,
    '==': equal,
    '!=': notEqual,
    '>': greaterThan,
    '<': lessThan,
    '>=': greaterThanEqual,
    '<=': lessThanEqual,
    and: andOperator,
    or: orOperator,
    'in': inOperator
  };

  this.ternaryOps = {
    '?': condition
  };

  this.functions = {
    random: random,
    fac: factorial,
    min: Math.min,
    max: Math.max,
    hypot: Math.hypot || hypot,
    pyt: Math.hypot || hypot, // backward compat
    pow: Math.pow,
    atan2: Math.atan2,
    'if': condition,
    gamma: gamma,
    roundTo: roundTo
  };

  this.consts = {
    E: Math.E,
    PI: Math.PI,
    'true': true,
    'false': false
  };
}

Parser.prototype.parse = function (expr) {
  var instr = [];
  var parserState = new ParserState(
    this,
    new TokenStream(this, expr),
    { allowMemberAccess: this.options.allowMemberAccess }
  );

  parserState.parseExpression(instr);
  parserState.expect(TEOF, 'EOF');

  return new Expression(instr, this);
};

Parser.prototype.evaluate = function (expr, variables) {
  return this.parse(expr).evaluate(variables);
};

var sharedParser = new Parser();

Parser.parse = function (expr) {
  return sharedParser.parse(expr);
};

Parser.evaluate = function (expr, variables) {
  return sharedParser.parse(expr).evaluate(variables);
};

/*!
 Based on ndef.parser, by Raphael Graf(r@undefined.ch)
 http://www.undefined.ch/mparser/index.html

 Ported to JavaScript and modified by Matthew Crumley (email@matthewcrumley.com, http://silentmatt.com/)

 You are free to use and modify this code in anyway you find useful. Please leave this comment in the code
 to acknowledge its original source. If you feel like it, I enjoy hearing about projects that use my code,
 but don't feel like you have to let me know or ask permission.
*/

var index = {
  Parser: Parser,
  Expression: Expression
};

return index;

})));
;(function($){
    /**
     * Register ajax transports for blob send/recieve and array buffer send/receive via XMLHttpRequest Level 2
     * within the comfortable framework of the jquery ajax request, with full support for promises.
     *
     * Notice the +* in the dataType string? The + indicates we want this transport to be prepended to the list
     * of potential transports (so it gets first dibs if the request passes the conditions within to provide the
     * ajax transport, preventing the standard transport from hogging the request), and the * indicates that
     * potentially any request with any dataType might want to use the transports provided herein.
     *
     * Remember to specify 'processData:false' in the ajax options when attempting to send a blob or arraybuffer -
     * otherwise jquery will try (and fail) to convert the blob or buffer into a query string.
     *
     * This revision now includes sending headers, resolves the stack overflow in abort(), and sets the status text
     * into the response if the request is unsuccessful.
     */
    $.ajaxTransport("+*", function(options, originalOptions, jqXHR){
        // Test for the conditions that mean we can/want to send/receive blobs or arraybuffers - we need XMLHttpRequest
        // level 2 (so feature-detect against window.FormData), feature detect against window.Blob or window.ArrayBuffer,
        // and then check to see if the dataType is blob/arraybuffer or the data itself is a Blob/ArrayBuffer
        if (window.FormData && ((options.dataType && (options.dataType == 'blob' || options.dataType == 'arraybuffer')) || (options.data && ((window.Blob && options.data instanceof Blob) || (window.ArrayBuffer && options.data instanceof ArrayBuffer)))
            ))
        {
            var xhr;

            return {
                /**
                 * Return a transport capable of sending and/or receiving blobs - in this case, we instantiate
                 * a new XMLHttpRequest and use it to actually perform the request, and funnel the result back
                 * into the jquery complete callback (such as the success function, done blocks, etc.)
                 *
                 * @param headers
                 * @param completeCallback
                 */
                send: function(headers, completeCallback){
                    var url = options.url || window.location.href,
                        type = options.type || 'GET',
                        dataType = options.dataType || 'text',
                        data = options.data || null,
                        async = options.async || true;

                    xhr = new XMLHttpRequest();
                    xhr.addEventListener('load', function(){
                        var res = {},
                            success = xhr.status >= 200 && xhr.status < 300 || xhr.status === 304;

                        if (success){
                            res[dataType] = xhr.response;
                        } else {
                            res.text = xhr.statusText;
                        }

                        completeCallback(xhr.status, xhr.statusText, res, xhr.getAllResponseHeaders());
                    });

                    xhr.open(type, url, async);
                    xhr.responseType = dataType;

                    for (var key in headers){
                        if (headers.hasOwnProperty(key)){
                            xhr.setRequestHeader(key, headers[key]);
                        }
                    }

                    xhr.send(data);
                },
                abort: function(){
                    if (xhr){
                        xhr.abort();
                    }
                }
            };
        }
    });
})(jQuery);

var doc = document,
	body = $(doc.body),
	win = window,settings, 
	browserLanguage = (navigator.languages) ? navigator.languages[0] : (navigator.language || navigator.userLanguage);
if (typeof browserLanguage === 'undefined') browserLanguage = 'EN';
browserLanguage = browserLanguage.toLocaleLowerCase();

body.data('bcpie',{});
body.data('bcpie').ajax = {}; // for ajax results
win.bcpie = {
	active: {
		sdk: '2017.09.29',
		tricks: {} // populated automatically
	},
	globals: {
		path: win.location.pathname.toLowerCase(),
		pathArray: win.location.pathname.toLowerCase().split(/(?=\/#?[a-zA-Z0-9])/g),
		param: win.location.search,
		paramArray: win.location.search.split(/(?=&#?[a-zA-Z0-9])/g),
		hash: win.location.hash,
		browser: {
			language: browserLanguage
		}
	},
	ajax: {
		token: function() {
			if (typeof Cookies('access_token') !== 'undefined') return Cookies('access_token');
			else return Cookies('access_token',window.location.hash.replace('#access_token=',''));
		},
		user: {
			get: function(data,options) {
				if (typeof data === 'undefined') data = {};
				if (typeof options !== 'object') options = {};
				data = {
					id: data.id || 'me' // user id
				};
				options.url = '/webresources/api/v3/sites/current/users/'+data.id;
				options.headers = {Authorization: bcpie.ajax.token()};
				options.method = 'GET';

				return bcpie.utils.ajax(options);
			}
		},
		file: {
			get: function(data,options) {
				if (typeof data === 'undefined') data = {};
				if (typeof options !== 'object') options = {};
				data = {
					path: data.path || '' // string
				};
				if (data.path.indexOf('/') !== 0) data.path = '/'+data.path;
				if (data.path.split('/').pop().indexOf('.') === -1) {
					if (data.path.charAt(data.path.length - 1) !== '/') data.path = data.path+'/';
					if (bcpie.utils.isAdmin() === true) data.path = data.path+'?meta';
				}else data.path = data.path+'?version='+moment().format('x');
				if (bcpie.utils.isAdmin() === true) {
					options.url = '/api/v2/admin/sites/current/storage'+data.path;
					options.headers = {Authorization: bcpie.ajax.token()};
				}else options.url = data.path;
				options.method = 'GET';
				if (typeof options.dataType !== 'undefined' && (options.dataType.toLowerCase() === 'binary' || options.dataType.toLowerCase() === 'arraybuffer')) options.processData = false;

				return bcpie.utils.ajax(options);
			},
			save: function(data,options) {
				if (typeof data === 'undefined') data = {};
				if (typeof options !== 'object') options = {};
				data = {
					path: data.path || '', // string
					content: data.content || '', // file object, string
					version: data.version || 'draft-publish' // 'draft', 'draft-publish'
				};

				
				if (data.path.indexOf('/') !== 0) data.path = '/'+data.path;
				
				if (bcpie.utils.isAdmin() === true) {
					options.url = '/api/v2/admin/sites/current/storage'+data.path;
					if (data.path.charAt(data.path.length - 1) === '/' || data.type === 'folder') options.url += '?type=folder';
					else options.url += '?version='+data.version;
					options.headers = {Authorization: bcpie.ajax.token()};
				}else options.url = data.path;

				if (bcpie.utils.isAdmin() === true && (typeof data.content === 'string' || typeof data.content.length === 'undefined')) {
					options.method = 'PUT';
					options.contentType = 'application/octet-stream';
					options.processData = false;
					if (typeof data.content.upload !== 'undefined' || typeof data.content.type !== 'undefined') {
						options.url.replace('?version='+data.version,'');
						options.data = data.content;
					}else if (typeof data.content === 'string') options.data = data.content;
					else options.data = JSON.stringify(data.content);
				}else {
					options.method = 'POST';
					options.contentType = false;
					options.cache = false;
					options.data = new FormData();
					options.data.append('file', data.content);
				}

				return bcpie.utils.ajax(options);
			},
			delete: function(data,options) {
				if (typeof data === 'undefined') data = {};
				if (typeof options !== 'object') options = {};
				data = {
					path: data.path || '', // string
					force: data.force || '' // folders only
				};
				if (data.path.indexOf('/') !== 0) data.path = '/'+data.path;
				if (data.path.charAt(data.path.length - 1) === '/') data.path.slice(0, - 1);
				if (data.force !== '') data.path = data.path+'&force='+data.force;

				options.url = '/api/v2/admin/sites/current/storage'+data.path;
				options.headers = {Authorization: bcpie.ajax.token()};
				options.method = 'DELETE';

				return bcpie.utils.ajax(options);
			},
			uploadStatus: function() {
				if (typeof data === 'undefined') data = {};
				if (typeof options !== 'object') options = {};
				options.url = '/api/v2/admin/sites/current/storage?status';
				options.method = 'GET';
				options.headers = {Authorization: bcpie.ajax.token()};

				return bcpie.utils.ajax(options);
			}
		},
		folder: {
			save: function(data,options) {
				if (typeof data === 'undefined') data = {};
				if (typeof options !== 'object') options = {};
				data.type = 'folder';
				return bcpie.ajax.file.save(data,options);
			},
			delete: function(data,options) {
				if (typeof data === 'undefined') data = {};
				if (typeof options !== 'object') options = {};
				data.force = data.force || false;
				return bcpie.ajax.file.delete(data,options);
			},
			get: function(data,options) {
				if (typeof data === 'undefined') data = {};
				if (typeof options !== 'object') options = {};
				return bcpie.ajax.file.get(data,options);
			}
		},
		template: {
			save: function(data,options) {
				if (typeof options === 'undefined') options = {};
				if (typeof data === 'undefined') data = {};
				data = {
					id: data.id || null,
					categoryId: data.categoryId || -1,
					name: data.name || null,
					displayFileName: data.displayFileName || null,
					printerView: data.printerView || false,
					displayable: data.displayable || true,
					enabled: data.enabled || true,
					default: data.default || false,
					noHeaders: data.noHeaders || true,
					desktopContent: {content:data.content || null}
				};

				options.url = '/webresources/api/v3/sites/current/templates';
				if (data.id !== null) {
					options.url += '/'+data.id;
					options.method = 'PUT';
				}else options.method = 'POST';
				delete data.id;
				options.data = JSON.stringify(data);
				options.headers = {Authorization: bcpie.ajax.token()};
				options.mimeType = 'application/json';
				options.processData = false;

				return bcpie.utils.ajax(options);
			}
		},
		webapp: {
			save: function(data,options) {
				if (typeof data === 'undefined') data = {};
				if (typeof options !== 'object') options = {};
				data = {
					webapp: data.webapp || undefined,
					content: data.content || {}
				};
				options.url = '/api/v2/admin/sites/current/webapps';
				if (typeof data.webapp !== 'undefined') options.url += '/'+data.webapp;
				options.data = bcpie.utils.serializeObject(data.content);
				options.data = JSON.stringify(options.data);
				options.headers = {'Authorization': bcpie.ajax.token()};
				options.method = 'POST';
				options.processData = false;
				return bcpie.utils.ajax(options);
			},
			get: function(data,options) {
				if (typeof data === 'undefined') data = {};
				if (typeof options !== 'object') options = {};
				data = {
					webapp: data.webapp || undefined
				};
				// Catch data errors
				var errors = bcpie.ajax.webapp.errors(data);
				if (errors.length > 0) return errors;

				options.url = '/api/v2/admin/sites/current/webapps';
				if (typeof data.webapp !== 'undefined') options.url += '/'+data.webapp;
				options.headers = {'Authorization': bcpie.ajax.token()};
				options.method = 'GET';
				return bcpie.utils.ajax(options);
			},
			delete: function(data,options) {
				if (typeof data === 'undefined') data = {};
				if (typeof options !== 'object') options = {};
				data = {
					webapp: data.webapp || null // string
				};

				// Catch data errors
				var errors = bcpie.ajax.webapp.errors(data);
				if (errors.length > 0) return errors;

				options.url = '/api/v2/admin/sites/current/webapps/'+data.webapp;
				options.headers = {Authorization: bcpie.ajax.token()};
				options.method = 'DELETE';
				return bcpie.utils.ajax(options);
			},
			field: {
				get: function(data,options) {
					if (typeof data === 'undefined') data = {};
					if (typeof options !== 'object') options = {};
					data = {
						webapp: data.webapp || null, // string
						field: data.field || null // string
					};
					// Catch data errors
					var errors = bcpie.ajax.webapp.errors(data);
					if (errors.length > 0) return errors;

					options.url = '/api/v2/admin/sites/current/webapps/'+data.webapp+'/fields';
					if (data.field !== null) options.url += '/' + data.field;
					options.headers = {'Authorization': bcpie.ajax.token()};
					options.method = 'GET';
					return bcpie.utils.ajax(options);
				},
				save: function(data,options) {
					if (typeof data === 'undefined') data = {};
					if (typeof options !== 'object') options = {};
					data = {
						webapp: data.webapp || null, // string
						field: data.field || null, // integer
						content: data.content || null // object
					};
					
					// Catch data errors
					var errors = bcpie.ajax.webapp.errors(data);
					if (errors.length > 0) return errors;

					options.url = '/api/v2/admin/sites/current/webapps/'+data.webapp+'/fields';
					if (data.field !== null) options.url += '/' + data.field;
					if (data.field === null && data.content !== null && typeof data.content.id === 'undefined') data.content.id = 0;
					if (data.content !== null) {
						options.data = bcpie.utils.serializeObject(data.content);
						options.data = JSON.stringify(options.data);
					}				
					options.headers = {'Authorization': bcpie.ajax.token()};
					options.method = 'POST';
					options.processData = false;
					return bcpie.utils.ajax(options);
				},
				delete: function(data,options) {
					if (typeof data === 'undefined') data = {};
					if (typeof options !== 'object') options = {};
					data = {
						webapp: data.webapp || null, // string
						field: data.field || null // integer or blank
					};
					
					// Catch data errors
					var errors = bcpie.ajax.webapp.errors(data);
					if (errors.length > 0) return errors;

					options.url = '/api/v2/admin/sites/current/webapps/'+data.webapp+'/fields';
					if (data.field !== null) options.url += '/' + data.field;
					options.headers = {'Authorization': bcpie.ajax.token()};
					options.method = 'DELETE';
					return bcpie.utils.ajax(options);
				}
			},
			search: function(data,options) {
				if (typeof data === 'undefined') data = {};
				if (typeof options !== 'object') options = {};
				data = {
					webapp: data.webapp || null,
					formID: data.formID || null,
					responsePageID: data.responsePageID || null,
					content: data.content || null,
					json: data.json || true
				};
				// Catch data errors
				var errors = bcpie.ajax.webapp.errors(data);
				if (errors.length > 0) return errors;

				if (data.responsePageID !== null) data.responsePageID = '&PageID='+data.responsePageID;
				else data.responsePageID = '';

				if (data.json === true) data.json = '&json='+data.json;
				else data.json = '';

				options.url = '/Default.aspx?CCID='+data.webapp+'&FID='+data.formID+'&ExcludeBoolFalse=True'+data.responsePageID+data.json;
				options.data = $.param(data.content);
				// options.contentType = false;
				options.contentType = options.contentType || 'application/x-www-form-urlencoded'; /* is this better than false? */ 
				options.method = 'POST';
				return bcpie.utils.ajax(options);
				// var response = $(bcpie.utils.ajax(options).responseText).find('.webappsearchresults');
				// return (response.children().length > 0) ? response.children() : response.html();
			},
			item: {
				all: function(data,options) {
					if (typeof data === 'undefined') data = {};
					if (typeof options !== 'object') options = {};
					data.call = bcpie.ajax.webapp.item.get;
					return bcpie.utils.getAll(data,options);
				},
				get: function(data,options) {
					if (typeof data === 'undefined') data = {};
					if (typeof options !== 'object') options = {};
					data = {
						webapp: data.webapp || null, // integer, string
						item: data.item || null, // integer
						filters: data.filters || {limit:null} // object
					};
					if (data.filters.limit === 'all' && data.item === null) {
						data.call = bcpie.ajax.webapp.item.get;
						return bcpie.utils.getAll(data,options);
					}else {
						// Catch data errors
						var errors = bcpie.ajax.webapp.errors(data);
						if (errors.length > 0) return errors;

						options.url = '/api/v2/admin/sites/current/webapps/'+data.webapp+'/items';
						if (data.item !== null) options.url += '/'+data.item;
						else options.url += bcpie.utils.filters(data.filters);
						options.headers = {Authorization: bcpie.ajax.token()};
						options.method = 'GET';
						return bcpie.utils.ajax(options);
					}
				},
				save: function(data,options) {
					if (typeof data === 'undefined') data = {};
					if (typeof options !== 'object') options = {};
					data = {
						content: data.content || null,  // $, {}
						webapp: data.webapp || null, // integer, string
						item: data.item || null // integer
					};

					// Catch data errors
					var errors = bcpie.ajax.webapp.errors(data);
					if (errors.length > 0) return console.log(errors);

					if (bcpie.utils.isAdmin() === true) {
						options.url = '/api/v2/admin/sites/current/webapps/'+data.webapp+'/items';
						if (data.item !== null) options.url += '/'+data.item;
						options.headers = {Authorization: bcpie.ajax.token()};

						var fieldTypes = {name:'String', weight:'Number', releaseDate:'DateTime', expiryDate:'String', enabled:'Boolean', slug:'String', description:'String', roleId:'Number', submittedBy:'Number', templateId:'Number', address:'String', city:'String', state:'String', zipCode:'String', country:'String',fields:{}},
							newData = {name:'', releaseDate:moment().subtract(12,'hour').format('YYYY-MM-DD'), expiryDate:'9999-01-01', enabled:true, country:bcpie.globals.site.countryCode, fields:{}},
							allFields = {name:'', weight:0, releaseDate:moment().subtract(12,'hour').format('YYYY-MM-DD'), expiryDate:'9999-01-01', enabled:true, slug:'', description:'', roleId:null, submittedBy:-1, templateId:-1, address:'', city:'', state:'', zipCode:'', country:bcpie.globals.visitor.country,fields:{}},
							field, result, fields;

						options.data = bcpie.utils.serializeObject(data.content);
						options.processData = false;

						if (typeof bcpie.ajax.webapp.item.save[data.webapp] === 'undefined') {
							// Retrieve the custom fields list from the server
							bcpie.ajax.webapp.item.save[data.webapp] = bcpie.ajax.webapp.field.get({webapp: data.webapp},{async:false});
						}


						fields = bcpie.ajax.webapp.item.save[data.webapp].responseJSON;
						if (data.item !== null) {
							options.method = 'PUT';
							newData = {fields:{}};
						}else options.url = options.url.replace('/'+data.item,'');

						// Add custom fields to newData object
						for (var i=0; i<fields.items.length; i++) {
							if (typeof options.data[fields.items[i].name] !== 'undefined') {
								newData.fields[fields.items[i].name] = '';
								fieldTypes.fields[fields.items[i].name] = fields.items[i].type;
							}
						}

						// Fill the data object with form values
						for (var key in options.data) {
							if (typeof allFields[key] !== 'undefined') {
								if (options.data[key] !== 'undefined') {
									newData[key] = options.data[key];
									if (key === 'country' && newData[key] === ' ' ) newData[key] = '';
									if (key === 'state' && newData[key] === ' ' ) newData[key] = '';
									if (fieldTypes[key] === 'Number') {
										newData[key] = bcpie.utils.validation.number(key,newData[key]);
										if (isNaN(newData[key])) delete data[key];
									}else if (fieldTypes[key] === 'Boolean') {
										newData[key] = bcpie.utils.validation.boolean(key,newData[key]);
									}else if (fieldTypes[key] === 'DateTime') {
										newData[key] = bcpie.utils.validation.dateTime(key,newData[key]);
									}
								}
							}else if (typeof newData.fields[key] !== 'undefined') {
								if (options.data[key] !== 'undefined') {
									newData.fields[key] = options.data[key];
									if (fieldTypes.fields[key] === 'Number' || fieldTypes.fields[key] === 'DataSource') {
										newData.fields[key] = bcpie.utils.validation.number(key,newData.fields[key]);
										if (fieldTypes.fields[key] === 'DataSource' && newData.fields[key] === 0) newData.fields[key] = null;
										if (isNaN(newData.fields[key])) delete newData.fields[key];
									}else if (fieldTypes.fields[key] === 'Boolean') {
										newData.fields[key] = bcpie.utils.validation.boolean(key,newData.fields[key]);
										if (isNaN(newData.fields[key])) delete newData.fields[key];
									}else if (fieldTypes.fields[key] === 'DateTime') {
										newData.fields[key] = bcpie.utils.validation.dateTime(key,newData.fields[key]);
										if (isNaN(newData.fields[key])) delete newData.fields[key];
									}
								}else delete newData.fields[key];
							}
						}
						if (typeof options.data.country === 'undefined') newData.country = allFields.country;
						options.data = JSON.stringify(newData);
					}else {
						if (data.item === null) options.url = '/CustomContentProcess.aspx?CCID='+data.webapp+'&OTYPE=1';
						else options.url = '/CustomContentProcess.aspx?A=EditSave&CCID='+data.webapp+'&OID='+data.item+'&OTYPE=35';

						if (body.find('[name=Amount]').length > 0) options.url = bcpie.globals.secureDomain + options.url;
						if (data.content instanceof $) {
							if (data.content.is('form') || data.content.is('input,select,textarea')) options.data = data.content.serialize();
							else options.data = data.content.find('input,select,textarea').serialize();
						}else if (bcpie.utils.isElement(data.content)) {
							data.content = $(data.content);
							if (data.content.is('form') || data.content.is('input,select,textarea')) options.data = data.content.serialize();
							else options.data = data.content.find('input,select,textarea').serialize();
						}else if (typeof data.content === 'object' && data.content.constructor.toString().indexOf('Array') == -1) options.data = $.param(data.content);
						else return 'Content may not be in the correct form.';

						options.contentType = 'application/x-www-form-urlencoded';
					}
					return bcpie.utils.ajax(options);
				},
				delete: function(data,options) {
					if (typeof data === 'undefined') data = {};
					if (typeof options !== 'object') options = {};
					data = {
						webapp: data.webapp || null, // integer, string
						item: data.item || null // integer
					};

					// Catch data errors
					var errors = bcpie.ajax.webapp.errors(data);
					if (errors.length > 0) return errors;

					if (bcpie.utils.isAdmin() === true) {
						options.url = '/api/v2/admin/sites/current/webapps/'+data.webapp+'/items/'+data.item;
						options.headers = {Authorization: bcpie.ajax.token()};
						options.method = 'DELETE';
					}else {
						options.url = '/CustomContentProcess.aspx?CCID='+data.webapp+'&OID='+data.item+'&A=Delete';
						options.contentType = false;
					}
					return bcpie.utils.ajax(options);
				},
				categories: function(data,options) {
					if (typeof data === 'undefined') data = {};
					if (typeof options !== 'object') options = {};
					data = {
						mode: data.mode.toLowerCase() || 'get', // 'get', 'save', delete
						webapp: data.webapp || null, // string
						item: data.item || null, // integer
						content: data.content || null  // $, {}
					};
					// Catch data errors
					var errors = bcpie.ajax.webapp.errors(data);
					if (errors.length > 0) return errors;

					options.url = '/api/v2/admin/sites/current/webapps/'+data.webapp+'/items/'+data.item+'/categories';
					options.headers = {'Authorization': bcpie.ajax.token()};

					if (data.mode === 'get') options.method = 'GET';
					else if (data.mode === 'save') {
						options.method = 'PUT';
						options.data = JSON.stringify(data.content);
						options.processData = false;
					}
					return bcpie.utils.ajax(options);
				}
			},
			errors: function(data) {
				if (typeof data === 'undefined') data = {};
				data.errors = [];
				if (typeof data.webapp !== 'undefined') {
					if (data.webapp === null) data.errors.push('"webapp" parameter cannot be null.');
					else if (data.webapp.toString().match(/\D/g) === null && bcpie.utils.isAdmin() === true) data.errors.push('For API use, the "webapp" parameter should be the Web App name, not the ID.');
					else if (data.webapp.toString().match(/\D/g) !== null && bcpie.utils.isAdmin() === false) data.errors.push('For non-API use, the "webapp" parameter should be the Web App ID, not the name.');
				}
				if (typeof data.item !== 'undefined') {
					if (data.item === null) {
						if (data.mode === 'get' || data.mode === 'delete' || (data.mode === 'save' && bcpie.utils.isAdmin() === false)) data.errors.push('"item" parameter cannot be null.');
					}else if (data.item.toString().match(/\D/g) !== null) data.errors.push('"item" parameter must be an integer.');
				}
				if (typeof data.formID !== 'undefined') {
					if (data.formID.toString().match(/\D/g) !== null) data.errors.push('"formID" parameter must be an integer.');
				}
				if (data.mode === 'get' && bcpie.utils.isAdmin() === false) data.errors.push('"get" mode is for API use only.');
				return data.errors;
			}
		},
		crm: {
			customers: {
				get: function(data,options) {
					if (typeof data === 'undefined') data = {};
					if (typeof options !== 'object') options = {};
					data = {
						customerID: data.customerID || null, // integer
						filters: data.filters || null // object
					};
					if (data.filters !== null && data.filters.limit === 'all' && data.customerID === null) {
						data.call = bcpie.ajax.crm.customers.get;
						return bcpie.utils.getAll(data,options);
					}else {
						options.headers = {'Authorization': bcpie.ajax.token()};
						options.url = '/webresources/api/v3/sites/current/customers';
						if (data.customerID !== null) options.url += '/'+data.customerID;
						else options.url += bcpie.utils.filters(data.filters);
						options.method = 'GET';
						options.mimeType = 'application/json';
						return bcpie.utils.ajax(options);
					}
				},
				logout: function() {
					if (typeof options !== 'object') options = {};
					options.url = '/logoutprocess.aspx';
					options.method = 'POST';
					return bcpie.utils.ajax(options);
				},
				save: function(data,options) {
					if (typeof data === 'undefined') data = {};
					if (typeof options !== 'object') options = {};
					data = {
						customerID: data.customerID || null, // integer
						content: data.content || null
					};
					options.headers = {'Authorization': bcpie.ajax.token()};
					options.url = '/webresources/api/v3/sites/current/customers';
					if (data.customerID !== null) options.url += '/'+data.customerID;
					if (bcpie.utils.isAdmin() === true) {
						options.data = JSON.stringify(data.content);
						options.processData = false;
						if (data.customerID !== null) options.method = 'PUT';
						else options.method = 'POST';
					}else {
						options.url = '/MemberProcess.aspx';
						options.data = $.param(data.content);
						options.contentType = false;
					}
					return bcpie.utils.ajax(options);
				},
				delete: function(data,options) {
					if (typeof data === 'undefined') data = {};
					if (typeof options !== 'object') options = {};
					data = {
						customerID: data.customerID || null, // integer
					};
					options.headers = {'Authorization': bcpie.ajax.token()};
					options.url = '/webresources/api/v3/sites/current/customers';
					if (data.customerID !== null) options.url += '/'+data.customerID;
					options.method = 'DELETE';
					return bcpie.utils.ajax(options);
				},
				secureZones: function(data,options) {
					if (typeof data === 'undefined') data = {};
					if (typeof options !== 'object') options = {};
					data = {
						mode: data.mode.toLowerCase() || 'get', // 'get','subscribe',unsubscribe
						customerID: data.customerID || null, // integer
						filters: data.filters || null, // object
						zones: data.zones || null // object
					};
					options.headers = {'Authorization': bcpie.ajax.token()};
					options.url = '/webresources/api/v3/sites/current/customers/'+data.customerID+'/securezones';

					if (data.mode === 'get') options.method = 'GET';
					else if (data.mode === 'subscribe') {
						options.method = 'POST';
						options.data = JSON.stringify(data);
						options.processData = false;
					}else if (data.mode === 'unsubscribe') {
						options.method = 'DELETE';
						options.url += '&items='+bcpie.utils.jsonify(data.zones);
					}
					return bcpie.utils.ajax(options);
				},
				orders: function(data,options) {
					if (typeof data === 'undefined') data = {};
					if (typeof options !== 'object') options = {};
					data = {
						mode: data.mode.toLowerCase() || 'get', // 'get'
						customerID: data.customerID || null, // integer
						filters: data.filters || null, // object
					};
					options.headers = {'Authorization': bcpie.ajax.token()};
					options.url = '/webresources/api/v3/sites/current/customers/'+data.customerID+'/orders'+bcpie.utils.filters(data.filters);
					options.method = 'GET';
					return bcpie.utils.ajax(options);
				},
				addresses: function(data,options) {
					if (typeof data === 'undefined') data = {};
					if (typeof options !== 'object') options = {};
					data = {
						mode: data.mode.toLowerCase() || 'get', // 'get'
						customerID: data.customerID || null, // integer
						filters: data.filters || null, // object
					};
					options.headers = {'Authorization': bcpie.ajax.token()};
					options.url = '/webresources/api/v3/sites/current/customers/'+data.customerID+'/addresses'+bcpie.utils.filters(data.filters);
					options.method = 'GET';
					return bcpie.utils.ajax(options);
				}
			}
		},
		dataList: function(data) {
			if (typeof data === 'undefined') data = {};
			if (typeof options !== 'object') options = {};
			data = {
				collectionID: data.collectionID || null // integer
			};
			if (typeof body.data('bcpie').ajax.dataList === 'undefined') {
				body.data('bcpie').ajax.dataList = bcpie.ajax.file.get({path:'/_system/apps/bcpie-bcpie/public/utilities/ajax/dataList.json'},{async:false});
				if (body.data('bcpie').ajax.dataList.status === 200) {
					body.data('bcpie').ajax.dataList = JSON.parse(body.data('bcpie').ajax.dataList.responseText) || null;
					if (body.data('bcpie').ajax.dataList === null) delete body.data('bcpie').ajax.dataList;
				}
			}
			if (data.collectionID !== null) return body.data('bcpie').ajax.dataList[data.collectionID];
			else return body.data('bcpie').ajax.dataList;
		}
	},
	utils: {
		isAdmin: function() { return bcpie.ajax.token().length > 10 && win.location.origin.match(/https:\/\/.*?-apps.worldsecuresystems.com/) !== null;},
		escape: function(str) { 
			var entityMap = {
				'&': '&amp;',
				'<': '&lt;',
				'>': '&gt;',
				'"': '&quot;',
				"'": '&#39;',
				'/': '&#x2F;',
				'`': '&#x60;',
				'=': '&#x3D;'
			};
			return (typeof str === 'undefined') ? '' : String(str).replace(/[&<>"'`=\/]/g, function (s) {return entityMap[s];}); 
		},
		unescape: function(str) {return (typeof str === 'undefined') ? '' : $('<div/>').html(str).text();},
		jsonify: function(str) {
			bcpie.utils.jsonify.brace = /^[{\[]/;
			bcpie.utils.jsonify.token = /[^,(:){}\[\]]+/g;
			bcpie.utils.jsonify.quote = /^['"](.*)['"]$/;
			bcpie.utils.jsonify.escap = /(["])/g;
			bcpie.utils.jsonify.comma = {};
			bcpie.utils.jsonify.comma.curly = /,(\s*)}/g;
			bcpie.utils.jsonify.comma.square = /,(\s*)]/g;

			// Wrap with '{}' if not JavaScript object literal
			str = $.trim(str);
			if (bcpie.utils.jsonify.brace.test(str) === false) str = '{'+str+'}';

			// Fix trailing commas
			str = str.replace(bcpie.utils.jsonify.comma.curly, '}').replace(bcpie.utils.jsonify.comma.square, ']');

			// Retrieve token and convert to JSON
			return str.replace(bcpie.utils.jsonify.token, function (a) {
				a = $.trim(a);
				// Keep some special strings as they are
				if ('' === a || 'true' === a || 'false' === a || 'null' === a || (!isNaN(parseFloat(a)) && isFinite(a))) return a;
				// For string literal: 1. remove quotes at the top end; 2. escape double quotes in the middle; 3. wrap token with double quotes
				else return '"'+ a.replace(bcpie.utils.jsonify.quote, '$1').replace(bcpie.utils.jsonify.escap, '\\$1')+ '"';
			});
		},
		encode: function(str) {
			return encodeURIComponent(str).replace(/'/g,"%27").replace(/"/g,"%22");
		},
		decode: function(str) {
			return decodeURIComponent(str.replace(/\+/g,  " "));
		},
		guid: function() {
			function s4() {
				return Math.floor((1+Math.random()) * 0x10000).toString(16).substring(1);
			}
			return s4()+s4()+'-'+s4()+'-'+s4()+'-'+s4()+'-'+s4()+s4()+s4();
		},
		isElement: function(object){
			return (
				typeof HTMLElement === 'object' ? object instanceof HTMLElement : //DOM2
					object && typeof object === 'object' && object !== null && object.nodeType === 1 && typeof object.nodeName==='string'
			);
		},
		serializeObject: function(object) {
			var o = '',boolFalse,a,i;
			if (object instanceof jQuery) {
				if (object.is('form')) a = object.serializeArray();
				else if (object.is('select,textarea,input')) a = object.serializeArray(); // [{name:object.attr('name'),value:object.val()}];
				else a = object.find('input,select,textarea').serializeArray();
				boolFalse = object.find('[type=checkbox]').filter(function(){return $(this).prop('checked') === false;});
				for (i = 0; i < boolFalse.length; i++) {
					a.push({name: $(boolFalse[i]).attr('name'), value:null});
				}
			}else if ($.isArray(object) && typeof object[0].name !== 'undefined' && typeof object[0].value !== 'undefined') {
				a = object;
			}else if ($.isPlainObject(object) && typeof object.name !== 'undefined' && typeof object.value !== 'undefined') {
				a = [object];
			}else if ($.isPlainObject(object)) {
				o = object;
			}else {
				console.log('Malformed object passed to bcpie.utils.serializeObject method.');
				a = [];
			}
			if (o === '') {
				o = {};
				for (i=0; i<a.length; i++) {
					if (o[a[i].name] !== undefined) {
						if (!o[a[i].name].push) o[a[i].name] = [o[a[i].name]];
						o[a[i].name].push(a[i].value || '');
					}
					else o[a[i].name] = a[i].value || '';
				}
			}
			return o;
		},
		closestChildren: function(data,depricatedMatch,depricatedFindAll) {
			var depricatedSelector;
			if (data instanceof jQuery) {depricatedSelector = data;} // for backwards compatibility

			data = {
				selector: data.selector || depricatedSelector || null,
				match: data.match || depricatedMatch || null,
				findAll: data.findAll || depricatedFindAll || false,
				results: data.results || null // the results property is used internally by the method
			};

			var children = (data.selector instanceof jQuery) ? data.selector.children() : $(data.selector).children();
			if (children.length === 0) {
				if (data.results !== null) return data.results;
				else return $();
			}
			if (data.results !== null) data.results = data.results.add(children.filter(data.match));
			else data.results = children.filter(data.match);

			if (data.findAll !== true) return (data.results.length > 0) ? data.results : bcpie.utils.closestChildren({
				selector: children,
				match: data.match
			});
			else return bcpie.utils.closestChildren({
				selector: children.not(data.results),
				match: data.match,
				findAll: data.findAll,
				results: data.results
			});
		},
		searchArray: function(array,value) {
			// Best for large arrays. For tiny arrays, use indexOf.
			for (var i = 0; i < array.length; i++) {
				if (array[i] === value) return i;
			}
			return -1;
		},
		classObject: function(classes) {
			return {
				names: classes,
				selector: '.'+classes.replace(/\s/g,'.')
			};
		},
		xml2json: function(xml) {
			var obj = {};

			if (xml.nodeType == 1) { // element
				// do attributes
				if (xml.attributes.length > 0) {
				obj['@attributes'] = {};
					for (var j = 0; j < xml.attributes.length; j++) {
						var attribute = xml.attributes.item(j);
						obj['@attributes'][attribute.nodeName] = attribute.nodeValue;
					}
				}
			} else if (xml.nodeType == 3) { // text
				obj = xml.nodeValue;
			}

			// do children
			if (xml.hasChildNodes()) {
				for(var i = 0; i < xml.childNodes.length; i++) {
					var item = xml.childNodes.item(i);
					var nodeName = item.nodeName;
					if (typeof(obj[nodeName]) == 'undefined') {
						obj[nodeName] = bcpie.utils.xml2json(item);
					} else {
						if (typeof(obj[nodeName].push) == 'undefined') {
							var old = obj[nodeName];
							obj[nodeName] = [];
							obj[nodeName].push(old);
						}
						obj[nodeName].push(bcpie.utils.xml2json(item));
					}
				}
			}
			return obj;
		},
		isJson: function(str) {
			try {
				JSON.parse(str);
			} catch (e) {
				return false;
			}
			return true;
		},
		makeSlug: function(string) {
			var output = '',
				valid = '-0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

			string = string.replace(/\s/g, '-').replace().replace(/-{2,}/g, "-");

			for (var i = 0; i < string.length; i++) {
				if (valid.indexOf(string.charAt(i)) != -1) output += string.charAt(i);
			}
			return output.toLowerCase();
		},
		camelCase: function(string) {
			// remove all characters that should not be in a variable name
			// as well underscores an numbers from the beginning of the string
			string = string.replace(/([^a-zA-Z0-9_\-\s])|^[_0-9]+/g, "").trim().substr(0, 1).toLowerCase() + string.substr(1);
			// uppercase letters preceeded by a hyphen or a space
			string = string.replace(/([ -]+)([a-zA-Z0-9])/g, function(a,b,c) {
				return c.toUpperCase();
			});
			// uppercase letters following numbers
			string = string.replace(/([0-9]+)([a-zA-Z])/g, function(a,b,c) {
				return b + c.toUpperCase();
			});
			return string;
		},
		executeCallback: function(data, depricatedCallback, depricatedData, depricatedStatus, depricatedXhr) {
			function parameter(selector, settings, callback, data, status, xhr) {
				var deferred = $.Deferred();
				deferred.resolve(callback({
					selector: selector || null,
					settings: settings || null,
					content: data || null,
					status: status || null,
					xhr: xhr || null
				}));
				return deferred.promise();
			}
			var depricatedSelector;
			if (data instanceof jQuery) depricatedSelector = data;
			data = {
				selector: data.selector || depricatedSelector || null,
				settings: data.settings || null,
				callback: data.callback || depricatedCallback || null,
				content: data.content || depricatedData || null,
				status: data.status || depricatedStatus || null,
				xhr: data.xhr || depricatedXhr || null
			};
			if ([undefined,null,''].indexOf(data.callback) === -1 && typeof data.callback === 'string' && typeof win[data.callback] === 'function') {
				return $.when(parameter(data.selector, data.settings, win[data.callback], data.content, data.status, data.xhr));
			}
		},
		filters: function(filters) {
			var response = '?limit=';
			response += (typeof filters.limit !== 'undefined' && filters.limit !== 'all') ? filters.limit : 500;
			response += '&skip=';
			response += filters.skip || 0;
			if (typeof filters.order !== 'undefined') response += '&order='+bcpie.utils.encode(filters.order);
			if ($.isArray(filters.fields)) response += '&fields='+bcpie.utils.encode(filters.fields.toString());
			if (typeof filters.where === 'object') response += '&where='+bcpie.utils.encode(JSON.stringify(filters.where));
			return response;
		},
		getAll: function(data,options) {
			if (typeof data === 'undefined') data = {};
			if (typeof options !== 'object') options = {};
			data.call = data.call || null;
			data.filters = data.filters || {};
			data.items = data.items || [];
			data.finished = data.finished || false;

			options.async = false;
			data.filters.limit = (typeof data.filters.limit !== 'number') ? 500 : data.filters.limit;
			data.filters.skip = (data.items.length === 0) ? 0 : data.filters.skip + data.filters.limit;
			if (data.finished === false) {
				var response = data.call(data,options).responseJSON;
				data.items = data.items.concat(response.items);
				data.filters.limit = response.limit;
				if (typeof response.totalItemsCount === 'undefined') return false;
				else if (response.totalItemsCount === data.items.length) return {
					totalItemsCount: data.items.length,
					items: data.items,
					skip: 0,
					limit: 'all'
				};
				else return bcpie.utils.getAll(data,options);
			}
		},
		ajax: function(options) {
			var settings = options || {};
			settings.url = options.url || '';
			settings.method = options.type || options.method || 'POST';
			settings.contentType = (options.contentType !== false) ? options.contentType || 'application/json' : false;
			if (bcpie.utils.isAdmin() === true) settings.connection = options.connection || 'keep-alive';
			if (typeof settings.data === 'undefined' && typeof settings.dataType !== 'undefined' && settings.dataType.toLowerCase() !== 'binary' && settings.dataType.toLowerCase() !== 'arraybuffer' && settings.dataType.toLowerCase() !== 'blob') delete settings.dataType;
			else if (typeof settings.data !== 'undefined' && typeof settings.dataType === 'undefined' && bcpie.utils.isJson(settings.data)) settings.dataType = 'application/json';
			return $.ajax(settings);
		},
		validation: {
			number: function(fieldName,value) {
				if (value === '') {
					return null;
				}else if (isNaN(Number(value))) {
					console.log('The value of "'+fieldName+'" is not a number.');
					return NaN;
				}else return Number(value);
			},
			boolean: function(fieldName,value) {
				if (value === null || value.trim() === '' || value.toLowerCase() === 'false' || value == '0' || value === 'off') return false;
				else if (value.toLowerCase() === 'true' || value === '1' || value === 'on') return true;

				else return null;
			},
			dateTime: function(fieldName,value) {
				if (value.trim() === '') return null;
				else if (value.match(/([0-9]{4})-((0[1-9])|(1[0-2]))-((0[1-9])|([1-2][0-9])|(3[0-1]))T(([0-1][0-9])|(2[0-4])):([0-5][0-9]):([0-5][0-9])/)) return value;
				else {
					console.log('The value of "'+fieldName+'" is an invalid dateTime format.');
					return 'Invalid Date';
				}
			}
		}
	},
	extensions: {
		settings: function(selector,options,settings) {
			if (typeof settings.name === 'string' && settings.name.toLowerCase() !== 'engine' && settings.name.toLowerCase() !== 'settings') {
				if (typeof settings.defaults === 'undefined') settings.defaults = {};
				selector.data('bcpie-'+settings.name.toLowerCase()+'-settings', $.extend({}, settings.defaults, options, bcpie.globals));
				bcpie.active.tricks[settings.name] = settings.version;
				return selector.data('bcpie-'+settings.name.toLowerCase()+'-settings');
			}
		},
		engine: function(scope) {
			if (typeof scope === 'undefined') scope = $(doc);
			var tricks = bcpie.extensions.tricks,trick,instances,instance,arr=[],str="",options={},module = [],functions = {},defaults = {};
			for (trick in tricks) {
				arr=[];str="";options={};module = [];functions = {};defaults = {};
				instances = scope.find('[data-bcpie-'+trick.toLowerCase()+']');
				for (var a = 0; a<instances.length; a++) {
					options = {};instance = $(instances[a]);
					str = instance.data('bcpie-'+trick.toLowerCase());
					if (typeof str === 'string' && str.indexOf(':') > -1) {
						if (str.indexOf(';') > -1) {
							str = str.split(';');
							for (var e=0;e<str.length;e++){
								arr = str[e].split(':');
								options[$.trim(arr[0])] = GetOptionValue($.trim(arr.slice(1).join(':')));
							}
						}else {
							arr = str.split(':');
							options[$.trim(arr[0])] = GetOptionValue($.trim(arr.slice(1).join(':')));
						}
					}
					bcpie.extensions.tricks[trick](instance,options);
				}
			}
			function GetOptionValue(valstr){
				switch(valstr.toLowerCase()){
					case 'true': return true;
					case 'false': return false;
					default: return valstr;
				}
			}
		},
		tricks: {} // populated automatically
	}
};
bcpie.globals = $.extend({},bcpie.globals,globals);
bcpie.globals.currentDomain = (win.location.origin.indexOf(bcpie.globals.primaryDomain) > -1) ? bcpie.globals.primaryDomain : bcpie.globals.secureDomain;

// Initialize tricks
$(function() {
	bcpie.extensions.engine();
});;/*
 * "ActiveNav". An awesome trick for BC Pie.
 * http://bcpie.com
 * Copyright 2015, ONE Creative
 * Free to use in BC Pie, or as licensed in Dev-in-a-Box from http://www.bcappstore.com/apps/dev-in-a-box
*/

bcpie.extensions.tricks.ActiveNav = function(selector,options,settings) {
	settings = bcpie.extensions.settings(selector,options,{
		name: 'ActiveNav',
		version: '2016.4.25',
		defaults: {
			navClass: 'activenav',
			activeClass: 'active',
			level: 1, // specify a number
			levelClass: 'level',
			lastLevel: 0, // specify a number. 0 will turn off limiting.
			lastLevelClass: 'lastlevel',
			currentActiveClass: 'current',
			levelTitle: false,
			levelTitleClass: 'leveltitle',
			unlinkTitle: false,
			onlyLevelTitle: false,
			removeHidden: true,
			activeHash: false,
			hashSupport: true,
			hashOffset: 30,
			removeClass: '',
			paramSupport: true,
			bubble: true,
			crumbs: false
		}
	});

	// vars
	var shortPath = settings.path.toLowerCase() + win.location.search.toLowerCase() + settings.hash.toLowerCase(),
		activeLinks, currentLink, gotIt = 0, first, segment, last, currentHash, crumbs;

	settings.navClass = classObject(settings.navClass);
	settings.activeClass = classObject(settings.activeClass);
	settings.levelClass = classObject(settings.levelClass);
	settings.lastLevelClass = classObject(settings.lastLevelClass);
	settings.levelTitleClass = classObject(settings.levelTitleClass);
	settings.removeClass = classObject(settings.removeClass);
	settings.primaryDomain = settings.primaryDomain.replace('http:','');
	settings.secureDomain = settings.secureDomain.replace('https:','');
	settings.currentActiveClass = classObject(settings.currentActiveClass);


	function classObject(classes) {
		return {
			names: classes,
			selector: '.'+classes.replace(/ /g,'.')
		};
	}
	function makeActive(activeLinks, first) {
		for(var i=0, len = $(activeLinks).size(); i<len;i++){
			var _this = activeLinks[i];
			if (settings.bubble === false) {
				$(_this).parent('li').addClass(settings.activeClass.names);
			}else {
				$(_this).parentsUntil(first, 'li').addClass(settings.activeClass.names);
			}
			$(_this).closest(first).children('ul').addClass(settings.levelClass.names);
			if ($(_this).parent().find('li').filter(settings.activeClass.selector).length === 0 && $(_this).parent().is(settings.activeClass.selector)) $(_this).parent().addClass(settings.currentActiveClass.names);
		}

		if (settings.level > 1 && settings.levelTitle !== false) {
			selector.find(settings.levelClass.selector).parent('li').addClass(settings.levelTitleClass.names);
			if (settings.levelTitle !== false && settings.unlinkTitle !== false) {
				selector.find(settings.levelTitleClass.selector).children('a').replaceWith('<span>' + selector.find(settings.levelTitleClass.selector).children('a').html() + '</span>');
			}
		}
		if (settings.level > 1 && settings.removeHidden === true) {
			if (settings.levelTitle !== false) {
				segment = selector.find(settings.levelTitleClass.selector).detach();
				if (settings.onlyLevelTitle !== false) segment.children('ul').remove();
				selector.children('ul').html(segment);
			} else {
				segment = selector.find(settings.levelClass.selector).detach();
				selector.html(segment);
			}
		}
	}
	function updateHashUrl(hash) {
		if (settings.activeHash) history.pushState({}, "", hash);
	}

	function initHashChange(hash) {
		settings.hash = hash || win.location.hash;

		currentHash = settings.hash;
		settings.pathArray = $.grep(settings.pathArray, function(el) {
			return (el.indexOf('#') == -1 || el == settings.hash);
		});
		initActiveNav();
	}

	function findActiveMatches(first, shortPath) {
		return first.find('a').filter(function() {
			if (settings.paramSupport === true) currentLink = $(this).attr('href');
			else currentLink = $(this).attr('href').split('?')[0];
			currentLink = currentLink.toLowerCase().replace('https:','').replace('http:','').replace(settings.primaryDomain,'').replace(settings.secureDomain,'');
			if (currentLink.indexOf('/') !== 0) currentLink = '/'+currentLink;

			if (currentLink === shortPath) {
				gotIt = 1;
				return true;
			}
		});
	}

	function initActiveNav() {
		shortPath = settings.path.toLowerCase() + win.location.search.toLowerCase() + settings.hash.toLowerCase();
		selector.find(settings.activeClass.selector).removeClass(settings.activeClass.names);
		if (settings.paramSupport === true && win.location.search !== '') settings.pathArray.push(win.location.search);
		if (settings.hash !== '') settings.pathArray.push(settings.hash.toLowerCase());
		gotIt = 0;

		// This loop returns all matching links from the first iteration that has a match (within level), then exits the loop;
		for (var i = settings.pathArray.length - 1; i >= 0; i--) {
			// Go through each link
			activeLinks = findActiveMatches(first, shortPath);
			if (gotIt === 1 || settings.bubble === false) {
				break;
			} else {
				// shorten shortPath and go through the loop again.
				shortPath = shortPath.replace(settings.pathArray[i], '');
			}
		}
		if (activeLinks.length > 1) {
			// Filter remaining activeLinks
			activeLinks = activeLinks.filter(function() {
				// shortPath needs to be reset for each link we go through
				shortPath = settings.path.toLowerCase();
				if (settings.path === '/') {
					return true;
				} else {
					for (var i = settings.pathArray.length - 1; i >= 0; i--) {
						if (settings.paramSupport === true) currentLink = $(this).attr('href').toLowerCase();
						else currentLink = $(this).attr('href').split('?')[0].toLowerCase();
						if (currentLink === shortPath) {
							return true;
						} else if (shortPath !== "") {
							shortPath = shortPath.replace(settings.pathArray[i], '');
						}
					}
				}
			});
		}
		if (activeLinks.length > 0) {
			makeActive(activeLinks, first);
			if (settings.crumbs === true) {
				selector.find('li').not(settings.activeClass.selector).remove();
				selector.find(settings.currentActiveClass.selector).text(selector.find(settings.currentActiveClass.selector).children('a').text());
			}
			if ($.trim(settings.removeClass.names).length > 0) selector.removeClass(settings.removeClass.names);
		}else if (selector.find(settings.levelClass.selector).size() === 0){
			if (settings.level > 1) {
				selector.children('ul').remove();
			}else {
				selector.children('ul').addClass(settings.levelClass.names);
			}
		}
		if (settings.level === 1 && activeLinks.length === 0 && $.trim(settings.removeClass.names).length > 0) selector.removeClass(settings.removeClass.names);
	}

	function outOfView(elem) {
		var docViewTop = $(win).scrollTop();
		var docViewBottom = docViewTop + $(win).height();

		var elemTop = $(elem).offset().top;
		return (elemTop > docViewBottom);
	}
	function inViewTopBottom(elem) {
		var docViewTop = $(win).scrollTop();
		var elemTop = $(elem).offset().top;
		var elemBottom = elemTop + $(elem).height();
		return (docViewTop < elemBottom && docViewTop > elemTop - settings.hashOffset);
	}

	// Add the window hashchange event, to add the active class on hash change
	$(win).off('hashchange');
	$(win).on('hashchange', function() {
		initHashChange();
	});

	if (settings.hashSupport) { // If hashSupport is true. url and navigation automatically updates on page scroll at certain positions
		currentHash = settings.hash;
		var hashLinks = selector.find('a[href*="' + settings.path + '#"]');
		for(var i=0,len = $(hashLinks).size(); i<len;i++){
			$('#' + $(hashLinks[i]).attr('href').split('#')[1]).addClass('hash');
		}

		$(doc).off('scroll.ActiveNav');
		$(doc).on('scroll.ActiveNav', function() {
			for(var i=0, len = body.find('.hash').size(); i<len; i++){
				var top = win.pageYOffset, _this=$(body.find('.hash')[i]);
				var distance = top - _this.offset().top;
				var hash = _this.attr('id');
				//if (distance < settings.hashOffset && distance > (-1 * settings.hashOffset) && (currentHash != hash || currentHash.length == 0)) {
				if (inViewTopBottom(_this) && (currentHash != hash || currentHash.length === 0)) {
					currentHash = '#' + hash;
					initHashChange(currentHash);
					updateHashUrl('#' + hash);
				}
			}
			if ($('.hash').size() > 0){
				if (outOfView($('.hash')[0])) {
					currentHash = '';
					initHashChange(currentHash);
					updateHashUrl('#');
				}
			}
		});
	}

	// Add .activenav to the selector element
	selector.addClass(settings.navClass.names);

	// find level
	first = $(selector);
	if (settings.level > 1) {
		for (var i = settings.level - 1; i > 0; i--) {
			first = bcpie.utils.closestChildren({
				selector: first,
				match: 'li',
				findAll: true
			});
		}
	}

	// find lastLevel
	if (settings.lastLevel > 0) {
		last = $(selector);
		for (var i = settings.lastLevel; i > 0; i--) {
			last = bcpie.utils.closestChildren({
				selector: last,
				match: 'li',
				findAll: true
			});
		}
	}else last = 0;

	$(last).parent('ul').addClass(settings.lastLevelClass.names);
	if (last !== 0 && settings.removeHidden === true) {
		bcpie.utils.closestChildren({
			selector: selector.find(settings.lastLevelClass.selector),
			match: 'ul',
			findAll: true
		}).remove();
	}

	if (settings.crumbs === true && selector.children().length === 0) {
		var breadcrumbs = '',
			pathString = '',
			path = '',
			pages;
		for (var i=0; i<settings.pathArray.length; i++) {
			path += settings.pathArray[i];
			pathString += ','+path;
		}
		$.get('/_system/apps/bcpie-bcpie/public/utilities/ajax/crumbs.html?paths='+pathString).done(function(data,status,xhr) {
			pages = $(data).filter('[data-pages]').data('pages').items;
			for (var i=pages.length-1; i>-1; i--) {
				breadcrumbs = '<ul><li><a href="'+pages[i].pageUrl+'">'+pages[i].name+'</a>'+breadcrumbs+'</li></ul>';
			}
			selector.html(breadcrumbs);
			initActiveNav();
		});
	}else initActiveNav();
};;/*
 * "Crumbs". An awesome trick for BC Pie.
 * http://bcpie.com
 * Copyright 2015, ONE Creative
 * Free to use in BC Pie, or as licensed in Dev-in-a-Box from http://www.bcappstore.com/apps/dev-in-a-box
*/

bcpie.extensions.tricks.Crumbs = function(selector,options) {
	var settings = bcpie.extensions.settings(selector,options,{
		name: 'Crumbs',
		version: '2015.04.06',
		defaults: {
			separator: '/',
			makespace: '-',
			ajax: true,
			showHome: false,
			homeTitle: 'Home'
		}
	});

	/* define variables */
		var separator = ' '+settings.separator+' ',crumbArray,crumbURL,crumb,
		reg,pageArray,paramArray,path,breadcrumbs = '',i=0,useAjax = (settings.ajax===true || settings.ajax==='true') ? true : false;
		crumbArray = settings.pathArray; // This may change its value later in the script, so it's best not to use our global.
		paramArray = settings.paramArray;
		path = settings.path; // This may change its value later in the script, so it's best not to use our global.
		reg = new RegExp(settings.makespace,'g'); // create array of pagenames based on the url
		pageArray = path.replace(reg,' ').split('/');
		pageArray.shift(); // remove the first item (it's empty)
		if (settings.showHome !== false) pageArray.unshift(settings.homeTitle);
		crumbURL = bcpie.globals.currentDomain;
	/* end variable definitions */

	/* cleanup messy paths */
		switch (path) {
			case '/ForumRetrieve.aspx':
				crumbURL += '/ForumRetrieve.aspx';
				crumbArray = paramArray;
				if (settings.param.contains('NoTemplate')) {
					crumbArray.pop();
				}
				break;
			case '/FAQRetrieve.aspx':
				crumbURL += '/FAQRetrieve.aspx';
				crumbArray = paramArray;
				break;
			default: crumbArray = crumbArray;
		}
	/* end cleanup messy paths */

	/* define functions */
		function urlCrumbName (i,crumb,pageArray,paramArray) {
			// choolse the information source for crumb
			crumb = pageArray[i];

			// create rules for special pages
			switch (crumb) {
				case 'OrderRetrievev2.aspx' : crumb = 'shopping cart';break;
				case 'ForumRetrieve.aspx' : crumb = 'forum';break;
				case 'ForumRegister.aspx' : crumb = 'forum registration';break;
				default : crumb = crumb;
			}
			if (paramArray!==undefined) {
				switch (paramArray[0]) {
					case '?Step=13' : crumb = 'checkout';break;
					default : crumb = crumb;
				}
			}
			return crumb;
		}
		function ajaxCrumbName (crumb,response,bcID,pagenameAttr) {
			// choolse the information source for crumb
			crumb = response.pagename.name;
			return crumb;
		}
		function breadcrumb (i,crumbArray,breadcrumbs,crumbURL,crumb,separator) {
			// put the current breadcrumb together
			if (i<crumbArray.length-1) breadcrumbs = '<a href="'+crumbURL+'">'+crumb+'</a>'+separator;
			else breadcrumbs = '<span class="this_crumb">'+crumb+'</span>';
			return breadcrumbs;
		}
	/* end function definitions */

	/* build breadcrumbs */
		if (useAjax) {
			// build crumbs with Ajax
			while (i<crumbArray.length) {
				crumbURL += crumbArray[i];
				if (path === '/FAQRetrieve.aspx' && i===0) crumbURL = '/faq';	// workaround for FAQs module
				else if (i === crumbArray.length-1) breadcrumbs += '<span class="this_crumb">'+settings.pageName+'</span>';
				else {
					$.ajax({
						url: crumbURL+'?json=true',
						type: 'GET',
						dataType: 'json',
						async: false,
						success: function(response) {
							if (bcpie.globals.currentDomain+settings.pageAddress+'?json=true' === response.pageaddress.pageUrl) return;
							if (crumbArray[i] === '/' && settings.showHome !== false && settings.homeTitle !== null) {
								crumb = crumb;
							}else {
								crumb = ajaxCrumbName (crumb,response,settings.modulesID,settings.pageNameAttr);
							}
							breadcrumbs += breadcrumb (i,crumbArray,breadcrumbs,crumbURL,crumb,separator);
						},
						error: function (response){
							if(response.status===404) {
								// Skip this crumb. Breadcrumbs are meant to show us the way back, not match the menu or URL structure.
								// crumb = urlCrumbName (i,crumb,pageArray,paramArray);
								// breadcrumbs += breadcrumb (i,crumbArray,breadcrumbs,crumbURL,crumb,separator);
							}
						}
					});
				}
				i++;
			}
		}else {
			// build crumbs from URL
			while (i<crumbArray.length) {
				crumbURL += crumbArray[i];
				if (crumbArray[i] === '/' && settings.showHome !== false && settings.homeTitle !== null) {
					crumb = crumb;
				}else {
					crumb = urlCrumbName (i,crumb,pageArray,paramArray);
				}
				breadcrumbs += breadcrumb (i,crumbArray,breadcrumbs,crumbURL,crumb,separator);
				i++;
			}
		}
		if (settings.showHome === true) breadcrumbs = '<a href="/">'+settings.homeTitle+'</a>'+separator+breadcrumbs;
		breadcrumbs = '<span>'+breadcrumbs+'</span>';
	/* end build breadcrumbs */
	return selector.html(breadcrumbs);
};;/*
 * Date
 * http://bcpie.com
 * Copyright 2015, ONE Creative
 * Free to use in BC Pie, or as licensed in Dev-in-a-Box from http://www.bcappstore.com/apps/dev-in-a-box
*/

bcpie.extensions.tricks.Date = function(selector,options){
	var settings = bcpie.extensions.settings(selector,options,{
		name: 'Date',
		version: '2017.01.03',
		defaults: {
			format: 'YYYY', // use Moment parsing, 'calendar', or 'utc'
			add: '',
			subtract: '',
			moment: 'auto',
			utc: false, // deprecated in favor of format:utc;
			fromZone: 'local', // specify a valid timezone string (like America/Denver) or use 'local' to automatically detect it. Default is 'local'.
			toZone: '', // specify a valid timezone string (like America/Denver) or use 'local' to automatically detect it
			ref: 'text', // specify an html attribute (inputs will assume 'text' means 'value'). You can also say 'now' to use the current date and time.
			target: 'text', // specify an html attribute (inputs will default to 'value'). Separate multiple targets with commas.
			event: undefined, // specify the window event that triggers Date's behavior.
			triggerOnLoad: true, // determines if the trick fires on page load.
			locale: 'off', // 'off' uses the site's language, 'auto' finds the user's language, or you can specify with a locale abbreviation.
			triggeredEvent: 'change', // specify an event to trigger when the trick is finished.
			eventNamespace: 'date' // specify a suffix to add to triggeredEvent (event.suffix).
		}
	});

	var ref,value,targets,parseFormat,order,addSplit,subtractSplit;

	if (settings.eventNamespace !== '') settings.eventNamespace = '.'+settings.eventNamespace;

	if (settings.locale === 'off') settings.locale = bcpie.globals.site.language.toLowerCase();
	else if (settings.locale === 'auto') settings.locale = (navigator.languages) ? navigator.languages[0] : (navigator.language || navigator.userLanguage);

	if (settings.add !== '') {
		addSplit = settings.add.split(',');
		for (var i = 0; i < addSplit.length; i++) {
			if ($.isNumeric(addSplit[i].charAt(0))) {
				if (addSplit[i].split(':').length === 2) addSplit[i] = addSplit[i].split(':')[1]+':'+addSplit[i].split(':')[0];
				else addSplit[i] = 'years:'+addSplit[i];
			}
		}
		addSplit = addSplit.join(',');
		settings.add = $.parseJSON(bcpie.utils.jsonify(addSplit));
	}
	if (settings.subtract !== '') {
		subtractSplit = settings.subtract.split(',');
		for (var i = 0; i < subtractSplit.length; i++) {
			if ($.isNumeric(subtractSplit[i].charAt(0))) {
				if (subtractSplit[i].split(':').length === 2) subtractSplit[i] = subtractSplit[i].split(':')[1]+':'+subtractSplit[i].split(':')[0];
				else subtractSplit[i] = 'years:'+subtractSplit[i];
			}
		}
		subtractSplit = subtractSplit.join(',');
		settings.subtract = $.parseJSON(bcpie.utils.jsonify(subtractSplit));
	}

	if (settings.utc === true) settings.format = 'utc';

	function initLangSupport() {
		if (moment.localeData(settings.locale) !== null) { // check for the existence of language data other than 'en'
			moment.locale(settings.locale);
		}else setTimeout(initLangSupport, 100);
	}
	function runDate(load) {
		if (typeof load === 'undefined') load = false;
		
		// determine the reference
		if (settings.ref === 'text' && selector.is('input')) settings.ref = 'value';
		ref = (settings.ref === 'text') ? selector.text() : selector.prop(settings.ref);

		if (settings.ref === 'now') {
			if (settings.fromZone !== 'local' && settings.fromZone !== '') {
				value = moment.tz(settings.fromZone);
			}else {
				value = moment();
			}
		}

		else if (ref !== '') {
			if (settings.moment === 'auto' && $.isNumeric(ref) && ref.length === 10) {
				if (settings.format === 'utc') value = moment.utc(moment.unix(ref)).local();
				else value = moment.unix(ref);
			}else {
				if (typeof settings.site.countryCode === 'undefined') settings.site.countryCode = 'US';
				switch(settings.site.countryCode) {
					case 'US': order = 'MDY'; break;
					default: order = 'DMY';
				}
				if (settings.moment === 'auto') parseFormat = (ref.match(/[0-9]{4}(-[0-9]{2}){2}T[0-9]{2}(:[0-9]{2}){2}(\+|-)[0-9]{2}:[0-9]{2}/)) ? 'YYYY-MM-DD[T]HH:mm:ssZZ;' : moment.parseFormat(ref,{preferredOrder: order});
				else parseFormat = settings.moment;
				if (settings.fromZone !== 'local') {
					value = moment.tz(ref,parseFormat,settings.fromZone);
				}else {
					value = moment(ref,parseFormat);
				}
			}

			if (!ref.match(/[0-9]{4}/) && value.isAfter(moment().add(5,'year')) && ref.match(/(?:\/|-)([0-9]{2})$/)) {
				value = value.subtract(100,'year');
			}
		}

		if (typeof value !== 'undefined' && value._isAMomentObject === true) {
			value = value.add(settings.add).subtract(settings.subtract);

			if (settings.toZone !== '') {
				if (settings.toZone === 'local' || settings.toZone === '') {
					value = value.tz(moment.tz.guess());
				}else value = value.tz(settings.toZone);
			}

			if (settings.format === 'calendar') value = value.calendar();
			else if (settings.format === 'utc') value = value.utc().format();
			else value = value.format(settings.format);

			targets = settings.target.split(',');
			for (var i=0; i<targets.length; i++) {
				if (targets[i] === 'text' && selector.is('input,textarea')) targets[i] = 'value';
				if (targets[i] === 'text') selector.text(value);
				else selector.prop(targets[i],value);
				if (load === false) selector.trigger(settings.triggeredEvent+settings.eventNamespace);
			}
		}
	}

	// Initialize Language Support
	if (moment.localeData(settings.locale) === null) {
		var src = '//cdn.jsdelivr.net/momentjs/'+moment.version+'/locales.min.js';
		if ($(doc).find('script[src="'+src+'"]').length === 0) {
			var momentLocale = document.createElement('script');
			momentLocale.type = 'text/javascript';
			momentLocale.async = true;
			momentLocale.src = src;
			(document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(momentLocale);
		}
	}
	initLangSupport();

	if (settings.triggerOnLoad === true) runDate(true);
	if (typeof settings.event !== 'undefined') {
		selector.on(settings.event, function() {
			runDate();
		});
	}
};;/*
 * "FormMagic". An awesome trick for BC Pie.
 * http://bcpie.com
 * Copyright 2015, ONE Creative
 * Free to use in BC Pie, or as licensed in Dev-in-a-Box from http://www.bcappstore.com/apps/dev-in-a-box
*/

bcpie.extensions.tricks.FormMagic = function(selector,options) {
	var settings = bcpie.extensions.settings(selector,options,{
		name: 'FormMagic',
		version: '2017.10.04',
		defaults: {
			'submitMode' : 'standard', // 'ajax', 'webapp', 'webapp.item', 'off'
			'submitEvent' : 'submit',
			'submitField' : '[type="submit"]', // comma separated list of fields that can be used to submit the form. CSS syntax.
			'validateMode' : 'inline', // 'alert', 'off'
			'steps' : '', // multistep container selectors, separated by comma
			'prev' : '', // back button selector for multistep form
			'next' : '', // Continue button selector for multistep form
			'beforeResponseMode' : 'off', // off, prepend, append, before, append, replace
			'beforeResponseMessage' : null, // a css selector with a message to display during the submission process.
			'beforeResponseTarget' : selector, // selector, alert, css selector
			'responseMode' : 'replace', // off, prepend, append, before, append, replace
			'responseTarget' : selector, // where to show an ajax response after submission. 'selector' replaces the form with the message, 'off' returns no message, 'alert' displays the message in a temporary alert box, 'dialog' displays the message in a dialog box. Otherwise, a CSS selector indicates where to put the message.
			'restoreTarget' : true, // If ajax submission result is empty, the contents of the responseTarget will be restored. This is particularly helpful with live searches.
			'successMessage': null, // null tells FormMagic to find the message via ajax, using the 'systemMessageClass'. Otherwise, text in this option will be used for the success message, and shown in an Alertify notification.
			'errorMessage': null, // null tells FormMagic to find the message via ajax, using the 'systemErrorMessageClass'. Otherwise, text in this option will be used for the error message, and shown in an Alertify notification.
			'formBeforeResponse' : null, // null, 'hide'
			'formOnSuccessResponse' : null, // null, 'hide', 'show'
			'formOnErrorResponse' : null, // null, 'hide', 'show'
			'buttonOnSubmit' : 'off', // disable,hide
			'buttonOnResponse' : 'off', // disable,hide
			'validationGroupElement' : 'div', // the default parent element to receive the validationGroupClass. It will be the closest matching parent.
			'validationGroupClass' : 'validation-group',
			'validationMessageElement' : 'small',
			'validationMessageClass' : 'validation-message',
			'validationInputClass' : 'validation-input',
			'errorClass' : 'error',
			'validClass' : 'valid',
			'requiredClass' : 'required',
			'systemMessageClass' : 'system-message',
			'systemErrorMessageClass' : 'system-error-message',
			'fieldTitleAttr' : 'label', // or specify a field attribute
			'fieldNameAttr' : 'name', // specify which attribute has the field name
			'customErrorFields' : '', // takes a comma delimited list of selectors to match against during validation
			'customError' : null, // specify a custom validation function to run against a comma delimeted list of selectors
			'beforeValidation' : null, // specify a function to run before validation
			'validationSuccess' : null, // specify a function to run after validation, but before submission
			'validationError' : null, // specify a function to run after validation returns errors
			'ajaxSuccess' : null, // specify a function to run after an Ajax submission 'success' response. Or 'refresh' to reload the page.
			'ajaxError' : null, // specify a function to run after an Ajax submission 'error' response
			'ajaxComplete' : null, // specify a function to run after an Ajax submission 'complete' response
			'async' : true, // if submitMode:ajax, this determines the async mode
			'onStep' : null, // specify a function to run on multistep step (either direction)
			'onPrev' : null, // specify a function to run on step backwards
			'onNext' : null // specify a function to run on step forward
		}
	});

	// validationFunctions.js and EN validatelang
	var jslang = bcpie.globals.site.language;
	if (typeof jslang == "undefined") jslang = ("EN");
	else {
		if (jslang == "JP") jslang = "JA";
		if (jslang == "CS") jslang = "CZ";
		if (jslang == "SI") jslang = "SL";
	}

	if (typeof validatelang === 'undefined' && jslang === 'EN') {
		validatelang = {
			Currency: { MustNumber: " must be a number and cannot be empty\n", NoSymbol: " amount you entered must be a number without currency symbol\n" },
			Number: { MustNumber: " must be a number and cannot be empty\n", NoDecimal: " must be a number (no decimal points) and cannot be empty\n" },
			Float: { MustNumber: " must be a number and may contain a decimal point.\n" },
			Enter: { PleaseEnter: "- Please enter " },
			Select: { PleaseSelect: "- Please select ", MustSelect: " must be selected\n" },
			Email: { ValidEmail: "- Please enter a valid email address\n", Illegal: "- The email address contains illegal characters\n" },
			CheckDate: { ValidDate: " as a valid date.\n" },
			Others: { CannotContain: " cannot contain ", WhiteSpace: "white spaces\n", Character: "character.\n" },
			IP: { Illegal: "- Please enter a valid IP Address" }
		};
	}else if (typeof validatelang === 'undefined') eval($.ajax({url:'/BcJsLang/ValidationFunctions.aspx?lang='+jslang,method:'get',async:false}).responseText);
	if (selector.find('[type=submit]').length > 0 && settings.fieldNameAttr !== 'type') selector.find('[type=submit]').removeAttr(settings.fieldNameAttr);

	function formfield(strng, actiontype) {

		switch (actiontype) {
			// makes first letter upper and all else lower, removes (.) and (,)
			case 'firstupper':
				var allCaps = true;
				var allLower = true;
				// handle surnames properly, e.g. McDermon, deCaprio, if all lower or all upper, we change, otherwise we don't
				// we ignore the first character, e.g. Johnson
				for (var i = 1; i < strng.length; i++) {
					var c = strng.charCodeAt(i);
					if (c >= 65 && c <= 90)
						allLower = false;
					if (c >= 97 && c <= 127)
						allCaps = false;
				}
				if (allCaps || allLower) {
					var word = strng.split(" ");
					strng = "";
					for (var i = 0; i < word.length; i++) {
						if (word[i].length >= 1) {
							strng = strng + " " + word[i].substring(0, 1).toUpperCase() + word[i].substring(1).toLowerCase();
						}
					}
				}
				strng = strng.replace(".", "");
				strng = strng.replace(",", "");
				break;

				// makes first letter upper only and does not affect any other letters or punctuation
			case 'firstupperspecial':
				var word = strng.split(" ");
				strng = ""
				for (var i = 0; i < word.length; i++) {
					if (word[i].length >= 1) {
						strng = strng + " " + word[i].substring(0, 1).toUpperCase() + word[i].substring(1);
					}
				}
				break;

			case 'alllower':
				strng = strng.toLowerCase();
				break;

			case 'allupper':
				strng = strng.toUpperCase();
				break;

			default:
				break;
		}
		if (strng.substring(0, 1) == " ") {
			strng = strng.substring(1);
		}
		return strng;
	}

	function isCurrency(s, FieldName) {
		var error = "";
		if (s.length == 0) {
			error = "- " + FieldName + validatelang.Currency.MustNumber;
		} else {
			for (var i = 0; i < s.length; i++) {
				var c = s.charAt(i);
				if ((c < "0") || (c > "9")) {
					if (c != "." && c != ",") // with multilingual in europe $3.33 = $3,33
						error = "- " + FieldName + validatelang.Currency.NoSymbol;
				}
			}
		}
		return error;
	}

	function isNumeric(s, FieldName) {
		var error = "";
		if (s.length == 0) {
			error = "- " + FieldName + validatelang.Number.MustNumber;
		} else {
			var i;
			for (i = 0; i < s.length; i++) {
				var c = s.charAt(i);
				if ((c < "0") || (c > "9")) {
					error = "- " + FieldName + validatelang.Number.NoDecimal;
					return error;
				}
			}
		}
		return error;
	}

	function isNumericGreaterThan(s, FieldName, minValue) {
		var error = "";
		var inputNumber = 0;
		
		if (s.length == 0) {
			error = "- " + FieldName + validatelang.Number.MustNumber;
		} else {
			var i;
			for (i = 0; i < s.length; i++) {
				var c = s.charAt(i);
				if ((c < "0") || (c > "9")) {
					error = "- " + FieldName + validatelang.Number.NoDecimal;
					return error;
				}
				inputNumber = inputNumber * 10 + parseInt(c);
			}
			
			if (inputNumber <= minValue){
				error = "- " + FieldName + validatelang.Number.GreaterThan.replace(/\{0\}/g, minValue)  ;
				return error;
			}
		}
		return error;
	}

	function isFloat(s, FieldName) {
		var error = "";
		var i;
		if (s.length == 0) {
			error = "- " + FieldName + validatelang.Float.MustNumber;
		} else {
			for (i = 0; i < s.length; i++) {
				var c = s.charAt(i);
				if (((c < "0") || (c > "9"))) {

					if (c != "." && c != ",") {
						error = "- " + FieldName + validatelang.Float.MustNumber;
						return error;
					}
				}
			}
		}
		return error;
	}

	function isEmpty(strng, FieldName) {
		var error = "";
		if (strng.trim().length == 0) {
			error = validatelang.Enter.PleaseEnter + FieldName + "\n";
		}
		return error;
	}

	function isCharacterLimitExceededGeneric(strng, limit, FieldName, message) {
		var error = "";
		if (strng.length > limit) {
			error = '- ' + FieldName + message.replace(/\{0\}/g, limit) + "\n";
		}
		return error;
	}

	function isCharacterLimitExceeded(strng, limit, FieldName) {
		return isCharacterLimitExceededGeneric(strng, limit, FieldName, validatelang.TextMultiline.MaxCharacters);
	}

	function isCharacterLimitExceededRich(strng, limit, FieldName) {
		return isCharacterLimitExceededGeneric(strng, limit, FieldName, validatelang.TextMultiline.MaxCharactersRich);
	}

	function checkDropdown(strng, FieldName) {
		var error = "";
		if (strng.length == 0 || strng == " ") { // we put a space to ensure value attribute is not stripped by browser in WYSIWYG editor
			error = validatelang.Select.PleaseSelect + FieldName + "\n";
		}
		return error;
	}

	function checkEmail(strng) {
		var error = "";
		if (strng.length > 0) {
			// TLDs from http://data.iana.org/TLD/tlds-alpha-by-domain.txt 
			var emailFilter = new RegExp('^[a-zA-Z0-9._-]+@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+(?:aaa|abb|abbott|abogado|ac|academy|accenture|accountant|accountants|aco|active|actor|ad|ads|adult|ae|aeg|aero|af|afl|ag|agency|ai|aig|airforce|airtel|al|allfinanz|alsace|am|amica|amsterdam|android|ao|apartments|app|aq|aquarelle|ar|archi|army|arpa|as|asia|associates|at|attorney|au|auction|audio|auto|autos|aw|ax|axa|az|azure|ba|band|bank|bar|barcelona|barclaycard|barclays|bargains|bauhaus|bayern|bb|bbc|bbva|bcn|bd|be|beer|bentley|berlin|best|bet|bf|bg|bh|bharti|bi|bible|bid|bike|bing|bingo|bio|biz|bj|black|blackfriday|bloomberg|blue|bm|bms|bmw|bn|bnl|bnpparibas|bo|boats|bom|bond|boo|boots|boutique|br|bradesco|bridgestone|broker|brother|brussels|bs|bt|budapest|build|builders|business|buzz|bv|bw|by|bz|bzh|ca|cab|cafe|cal|camera|camp|cancerresearch|canon|capetown|capital|car|caravan|cards|care|career|careers|cars|cartier|casa|cash|casino|cat|catering|cba|cbn|cc|cd|ceb|center|ceo|cern|cf|cfa|cfd|cg|ch|chanel|channel|chat|cheap|chloe|christmas|chrome|church|ci|cipriani|cisco|citic|city|ck|cl|claims|cleaning|click|clinic|clothing|cloud|club|clubmed|cm|cn|co|coach|codes|coffee|college|cologne|com|commbank|community|company|computer|condos|construction|consulting|contractors|cooking|cool|coop|corsica|country|coupons|courses|cr|credit|creditcard|cricket|crown|crs|cruises|csc|cu|cuisinella|cv|cw|cx|cy|cymru|cyou|cz|dabur|dad|dance|date|dating|datsun|day|dclk|de|deals|degree|delivery|dell|delta|democrat|dental|dentist|desi|design|dev|diamonds|diet|digital|direct|directory|discount|dj|dk|dm|dnp|do|docs|dog|doha|domains|doosan|download|drive|durban|dvag|dz|earth|eat|ec|edu|education|ee|eg|email|emerck|energy|engineer|engineering|enterprises|epson|equipment|er|erni|es|esq|estate|et|eu|eurovision|eus|events|everbank|exchange|expert|exposed|express|fage|fail|faith|family|fan|fans|farm|fashion|feedback|fi|film|final|finance|financial|firmdale|fish|fishing|fit|fitness|fj|fk|flights|florist|flowers|flsmidth|fly|fm|fo|foo|football|forex|forsale|forum|foundation|fr|frl|frogans|fund|furniture|futbol|fyi|ga|gal|gallery|game|garden|gb|gbiz|gd|gdn|ge|gea|gent|genting|gf|gg|ggee|gh|gi|gift|gifts|gives|giving|gl|glass|gle|global|globo|gm|gmail|gmo|gmx|gn|gold|goldpoint|golf|goo|goog|google|gop|gov|gp|gq|gr|graphics|gratis|green|gripe|group|gs|gt|gu|guge|guide|guitars|guru|gw|gy|hamburg|hangout|haus|healthcare|help|here|hermes|hiphop|hitachi|hiv|hk|hm|hn|hockey|holdings|holiday|homedepot|homes|honda|horse|host|hosting|hoteles|hotmail|house|how|hr|hsbc|ht|hu|hyundai|ibm|icbc|ice|icu|id|ie|ifm|iinet|il|im|immo|immobilien|in|industries|infiniti|info|ing|ink|institute|insure|int|international|investments|io|ipiranga|iq|ir|irish|is|ist|istanbul|it|itau|iwc|java|jcb|je|jetzt|jewelry|jlc|jll|jm|jo|jobs|joburg|jp|jprs|juegos|kaufen|kddi|ke|kg|kh|ki|kia|kim|kinder|kitchen|kiwi|km|kn|koeln|komatsu|kp|kr|krd|kred|kw|ky|kyoto|kz|la|lacaixa|lancaster|land|lasalle|lat|latrobe|law|lawyer|lb|lc|lds|lease|leclerc|legal|lexus|lgbt|li|liaison|lidl|life|lighting|limited|limo|linde|link|live|lixil|lk|loan|loans|lol|london|lotte|lotto|love|lr|ls|lt|ltd|ltda|lu|lupin|luxe|luxury|lv|ly|ma|madrid|maif|maison|man|management|mango|market|marketing|markets|marriott|mba|mc|md|me|media|meet|melbourne|meme|memorial|men|menu|mg|mh|miami|microsoft|mil|mini|mk|ml|mm|mma|mn|mo|mobi|moda|moe|moi|mom|monash|money|montblanc|mormon|mortgage|moscow|motorcycles|mov|movie|movistar|mp|mq|mr|ms|mt|mtn|mtpc|mtr|mu|museum|mv|mw|mx|my|mz|na|nadex|nagoya|name|navy|nc|ne|nec|net|netbank|network|neustar|new|news|nexus|nf|ng|ngo|nhk|ni|nico|ninja|nissan|nl|no|nokia|np|nr|nra|nrw|ntt|nu|nyc|nz|obi|office|okinawa|om|omega|one|ong|onl|online|ooo|oracle|orange|org|organic|osaka|otsuka|ovh|pa|page|panerai|paris|partners|parts|party|pe|pet|pf|pg|ph|pharmacy|philips|photo|photography|photos|physio|piaget|pics|pictet|pictures|pink|pizza|pk|pl|place|play|plumbing|plus|pm|pn|pohl|poker|porn|post|pr|praxi|press|pro|prod|productions|prof|properties|property|protection|ps|pt|pub|pw|py|qa|qpon|quebec|racing|re|realtor|realty|recipes|red|redstone|rehab|reise|reisen|reit|ren|rent|rentals|repair|report|republican|rest|restaurant|review|reviews|rich|ricoh|rio|rip|ro|rocks|rodeo|rs|rsvp|ru|ruhr|run|rw|ryukyu|sa|saarland|sakura|sale|samsung|sandvik|sandvikcoromant|sanofi|sap|sarl|saxo|sb|sc|sca|scb|schmidt|scholarships|school|schule|schwarz|science|scor|scot|sd|se|seat|security|seek|sener|services|seven|sew|sex|sexy|sg|sh|shiksha|shoes|show|shriram|si|singles|site|sj|sk|ski|sky|skype|sl|sm|sn|sncf|so|soccer|social|software|sohu|solar|solutions|sony|soy|space|spiegel|spreadbetting|sr|srl|st|stada|starhub|statoil|stc|stcgroup|stockholm|studio|study|style|su|sucks|supplies|supply|support|surf|surgery|suzuki|sv|swatch|swiss|sx|sy|sydney|systems|sz|taipei|tatamotors|tatar|tattoo|tax|taxi|tc|td|team|tech|technology|tel|telefonica|temasek|tennis|tf|tg|th|thd|theater|theatre|tickets|tienda|tips|tires|tirol|tj|tk|tl|tm|tn|to|today|tokyo|tools|top|toray|toshiba|tours|town|toyota|toys|tr|trade|trading|training|travel|trust|tt|tui|tv|tw|tz|ua|ubs|ug|uk|university|uno|uol|us|uy|uz|va|vacations|vc|ve|vegas|ventures|versicherung|vet|vg|vi|viajes|video|villas|vin|virgin|vision|vista|vistaprint|viva|vlaanderen|vn|vodka|vote|voting|voto|voyage|vu|wales|walter|wang|watch|webcam|website|wed|wedding|weir|wf|whoswho|wien|wiki|williamhill|win|windows|wine|wme|work|works|world|ws|wtc|wtf|xbox|xerox|xin|xn--11b4c3d|xn--1qqw23a|xn--30rr7y|xn--3bst00m|xn--3ds443g|xn--3e0b707e|xn--3pxu8k|xn--42c2d9a|xn--45brj9c|xn--45q11c|xn--4gbrim|xn--55qw42g|xn--55qx5d|xn--6frz82g|xn--6qq986b3xl|xn--80adxhks|xn--80ao21a|xn--80asehdb|xn--80aswg|xn--90a3ac|xn--90ais|xn--9dbq2a|xn--9et52u|xn--b4w605ferd|xn--c1avg|xn--c2br7g|xn--cg4bki|xn--clchc0ea0b2g2a9gcd|xn--czr694b|xn--czrs0t|xn--czru2d|xn--d1acj3b|xn--d1alf|xn--efvy88h|xn--estv75g|xn--fhbei|xn--fiq228c5hs|xn--fiq64b|xn--fiqs8s|xn--fiqz9s|xn--fjq720a|xn--flw351e|xn--fpcrj9c3d|xn--fzc2c9e2c|xn--gecrj9c|xn--h2brj9c|xn--hxt814e|xn--i1b6b1a6a2e|xn--imr513n|xn--io0a7i|xn--j1aef|xn--j1amh|xn--j6w193g|xn--kcrx77d1x4a|xn--kprw13d|xn--kpry57d|xn--kput3i|xn--l1acc|xn--lgbbat1ad8j|xn--mgb9awbf|xn--mgba3a4f16a|xn--mgbaam7a8h|xn--mgbab2bd|xn--mgbayh7gpa|xn--mgbbh1a71e|xn--mgbc0a9azcg|xn--mgberp4a5d4ar|xn--mgbpl2fh|xn--mgbx4cd0ab|xn--mk1bu44c|xn--mxtq1m|xn--ngbc5azd|xn--node|xn--nqv7f|xn--nqv7fs00ema|xn--nyqy26a|xn--o3cw4h|xn--ogbpf8fl|xn--p1acf|xn--p1ai|xn--pgbs0dh|xn--pssy2u|xn--q9jyb4c|xn--qcka1pmc|xn--rhqv96g|xn--s9brj9c|xn--ses554g|xn--t60b56a|xn--tckwe|xn--unup4y|xn--vermgensberater-ctb|xn--vermgensberatung-pwb|xn--vhquv|xn--vuq861b|xn--wgbh1c|xn--wgbl6a|xn--xhq521b|xn--xkc2al3hye2a|xn--xkc2dl3a5ee0h|xn--y9a3aq|xn--yfro4i67o|xn--ygbi2ammx|xn--zfr164b|xperia|xxx|xyz|yachts|yamaxun|yandex|ye|yodobashi|yoga|yokohama|youtube|yt|za|zip|zm|zone|zuerich|zw)$', 'i');
			if (!(emailFilter.test(strng)))
				error = validatelang.Email.ValidEmail;
			else {
				// Check email for illegal characters
				var illegalChars = /[\(\)\<\>\,\;\:\\\"\[\]]/
				if (strng.match(illegalChars))
					error = validatelang.Email.Illegal;
			}
		} else
			error = validatelang.Email.ValidEmail;

		return error;
	}

	// Checks in a checkbox or radio list that at least one item is selected
	function checkSelected(FieldName, strng) {
		var error = "- " + strng + validatelang.Select.MustSelect;
		if (FieldName.length > 0) {
			for (var i = 0; i < FieldName.length; i++) {
				if (FieldName[i].disabled == false && FieldName[i].checked == true) error = "";
			}
		} else
		if (FieldName.disabled == false && FieldName.checked == true) error = "";
		return error;
	}

	// returns the selected value from a radio list or nothing
	function getRadioSelected(FieldName) {
		if (FieldName.length > 0) {
			for (var i = 0; i < FieldName.length; i++) {
				if (FieldName[i].disabled == false && FieldName[i].checked == true)
					return FieldName[i].value;
			}
		} else
		if (FieldName.disabled == false && FieldName.checked == true)
			return FieldName.value;
		return null;
	}

	// Checks asp.net checkbox lists as the elements of a checkbox have 2 extra characters
	// appended to each one which makes the name no longer unique
	function checkSelectedX(FieldName, strng) {
		var error = "- " + strng + validatelang.Select.MustSelect;
		var table = document.getElementById(FieldName);
		var cells = table.getElementsByTagName("td");
		var ctrl;
		for (var i = 0; i < cells.length; i++) {
			ctrl = cells[i].firstChild;
			if (ctrl && (ctrl.type == 'checkbox' || ctrl.type == 'radio'))
				if (ctrl.disabled == false && ctrl.checked == true)
					error = "";
		}
		return error;
	}

	function checkSpaces(strng, FieldName) {
		var error = "";
		for (var i = 0; i < strng.length; i++) {
			if (strng.charAt(i) == " ")
				error = "- " + FieldName + validatelang.Others.CannotContain + validatelang.Others.WhiteSpace;
		}
		return error;
	}

	// consistent with General->Check_URLChar()
	function checkUrlChar(strng, FieldName) {
		var error = "";
		for (i = 0; i < strng.length; i++) {
			var c = strng.charAt(i);
			switch (c) {
				case "/":
				case "\\":
				case "#":
				case "?":
				case ":":
				case "@":
				case "=":
				case "&":
				case '"':
				case "|":
				case "_":
				case ".":
				case "%":
					error = "- " + FieldName + validatelang.Others.CannotContain + "[" + c + "] " + validatelang.Others.Character;
					return error;
			}
		}
		return error;
	}

	function isInteger(s) {
		var i;

		if (s.length == 0)
			return false;

		for (i = 0; i < s.length; i++) {
			// Check that current character is number.
			var c = s.charAt(i);
			if (((c < "0") || (c > "9"))) return false;
		}
		// All characters are numbers.
		return true;
	}

	// Checks to see if a date is valid. All date fields inside admin are readonly, if this function
	// is called and no value is entered then the date is invalid, otherwise always valid
	function checkDate(d, FieldName) {
		var error = "";

		if (d.length == 0) {
			error = validatelang.Enter.PleaseEnter + FieldName + validatelang.CheckDate.ValidDate;
			return error;
		}
		return error;
	}

	function appendBreak(msg) {
		return msg = msg + '\n';
	}

	String.prototype.trim = function() {
		a = this.replace(/^\s+/, '');
		return a.replace(/\s+$/, '');
	}



	function addEventSimple(obj, evt, fn) {
		if (obj.addEventListener)
			obj.addEventListener(evt, fn, false);
		else if (obj.attachEvent)
			obj.attachEvent('on' + evt, fn);
	}

	function sendRequestSync(url, callback, postData) {
		var req = createXMLHTTPObject();
		if (!req) return;
		var method = (postData) ? "POST" : "GET";
		req.open(method, url, false);
		if (postData)
			req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

		req.send(postData);

		if (req.status === 200) {
			return req.responseText;
		}
	}

	var XMLHttpFactories = [
		function() {
			return new XMLHttpRequest()
		},
		function() {
			return new ActiveXObject("Msxml2.XMLHTTP")
		},
		function() {
			return new ActiveXObject("Msxml3.XMLHTTP")
		},
		function() {
			return new ActiveXObject("Microsoft.XMLHTTP")
		}
	];

	function createXMLHTTPObject() {
		var xmlhttp = false;
		for (var i = 0; i < XMLHttpFactories.length; i++) {
			try {
				xmlhttp = XMLHttpFactories[i]();
			} catch (e) {
				continue;
			}
			break;
		}
		return xmlhttp;
	}

	for (var i = 0; i < document.forms.length; i++) {
		initCaptchaOnForm(document.forms[i]);
	}

	function initCaptchaOnForm(f) {
		if (f._CaptchaHookedUp)
			return;

		if (!f.CaptchaV2)
			return;

		if (!f.CaptchaHV2)
			return;

		f._CaptchaHookedUp = true;
	}

	function reCaptchaV2IsInvalid(f, messageWhenRobot) {
		if (typeof f['g-recaptcha-response'] != "undefined") {
			var hidden = f['bc-recaptcha-token'];
			var captchaId = hidden.getAttribute('data-recaptcha-id');
			var isValid = reCaptchaV2Manager.isInstanceVerified(captchaId);

			if (!isValid)
				return "- " + messageWhenRobot;
		}
		return "";
	}

	function captchaIsInvalid(f, messageWhenEmpty, messageWhenInvalid) {
		if ((f._CaptchaTextValidated === true) && (f._CaptchaTextIsInvalid === false)) {
			return "";
		}

		if (typeof f.ReCaptchaChallenge != "undefined") {
			var key = Recaptcha.get_challenge();
			var answer = Recaptcha.get_response();

			if (answer.trim().length == 0)
				return "- " + messageWhenEmpty;

			f.ReCaptchaAnswer.value = Recaptcha.get_response();
			f.ReCaptchaChallenge.value = Recaptcha.get_challenge();

			var response = sendRequestSync('/ValidateCaptcha.ashx?key=' + key + '&answer=' + answer + '&imageVerificationType=recaptcha');
			f._CaptchaTextIsInvalid = response == 'false';
			f._CaptchaTextValidated = true;
			if (f._CaptchaTextIsInvalid) {
				regenerateCaptcha(f);
			}
		} else {
			var key = f.CaptchaHV2.value;
			var answer = f.CaptchaV2.value;
			var correctCaptchaLength = 6;

			if (answer.trim().length == 0)
				return "- " + messageWhenEmpty;

			if (answer.length != correctCaptchaLength) {
				f._CaptchaTextIsInvalid = true;
			} else {
				var response = sendRequestSync('/ValidateCaptcha.ashx?key=' + key + '&answer=' + answer);
				f._CaptchaTextIsInvalid = response == 'false';
				f._CaptchaTextValidated = true;
				if (f._CaptchaTextIsInvalid) {
					regenerateCaptcha(f);
				}
			}
		}


		if (f._CaptchaTextIsInvalid)
			return "- " + messageWhenInvalid;

		return "";
	}

	function regenerateCaptcha(f) {
		f._CaptchaTextValidated = false;
		f._CaptchaTextIsInvalid = true;

		if (typeof f.ReCaptchaChallenge != "undefined") {
			Recaptcha.reload();
		} else {
			var key = sendRequestSync('/CaptchaHandler.ashx?Regenerate=true&rand=' + Math.random());

			f.CaptchaHV2.value = key;
			f.CaptchaV2.value = "";

			var imgs = f.getElementsByTagName("img");
			if (imgs.length == 0) { // fix for broken dom in ie9
				if ((f.parentNode.nodeName.toLowerCase() == "p") && (f.parentNode.nextSibling) && (f.parentNode.nextSibling.nodeName.toLowerCase() == "table") && (f.parentNode.nextSibling.className == "webform")) {
					imgs = f.parentNode.nextSibling.getElementsByTagName("img");
				}
			}

			for (var i = 0; i < imgs.length; i++) {
				var src = imgs[i].src;
				var srcLower = src.toLowerCase();
				if (srcLower.indexOf("/captchahandler.ashx") > -1) {
					var p1 = srcLower.indexOf("?id=") + 4;
					var p2 = srcLower.indexOf("&", p1);
					var oldKey = src.substring(p1, p2);
					var newSrc = src.replace(oldKey, key);

					imgs[i].src = newSrc;

					break;
				}
			}
		}
	}

	function isNumericIfVisible(s, FieldName) {
		var error = "";
		if (s.style.display == 'inline') {
			if (s.value.length == 0) {
				error = "- " + FieldName + validatelang.Number.MustNumber;
			} else {
				var i;
				for (i = 0; i < s.value.length; i++) {
					var c = s.value.charAt(i);
					if ((c < "0") || (c > "9")) {
						error = "- " + FieldName + validatelang.Number.NoDecimal;
						return error;
					}
				}
			}
		}
		return error;
	}

	function checkIPAddress(text) {
		var reg = /^\s*((0|[1-9]\d?|1\d{2}|2[0-4]\d|25[0-5])\.){3}(0|[1-9]\d?|1\d{2}|2[0-4]\d|25[0-5])\s*$/;
		if (reg.test(text)) return '';
		return validatelang.IP.Illegal;
	}

	/* reCaptchaV2Manager - manages all ReCaptcha V2 operations 
	*/
	var reCaptchaV2Manager = (function(){
		var _controlInstances = {};
		var _dataObjects = [];

		function initializeControls() {
			if (_dataObjects.length == 0) {
				return;
			}

			retrieveTokensWithAjax(_dataObjects.length, function(tokens) {
				for(var i=0; i<_dataObjects.length && i<tokens.length; i++) {
					var crtDataObject = _dataObjects[i];

					var hidden = document.getElementById('token' + crtDataObject.id);
					hidden.value = tokens[i];

					var renderParams = {
						'sitekey': crtDataObject.sitekey,
						'type': crtDataObject.type,
						'theme': crtDataObject.theme,
						'size': crtDataObject.size
					};

					if (typeof _controlInstances[crtDataObject.id] == "undefined") {
						_controlInstances[crtDataObject.id] = grecaptcha.render('recaptcha' + crtDataObject.id, renderParams);
					}
					else {
						grecaptcha.reset(_controlInstances[crtDataObject.id], renderParams);
					}
				}
			});
		}

		function retrieveTokensWithAjax(count, callback) {
			var req = new XMLHttpRequest();
			req.onreadystatechange = function() {
				if (req.readyState == 4 && req.status == 200) {
					var tokens = req.responseText.split(';');
					callback(tokens);
				}
			};

			req.open('GET', '/CaptchaHandler.ashx?RegenerateV2=true&count=' + count + '&rand=' + Math.random(), true);
			req.send();
		}

		return {
			/* Needs to be assigned as the onload handler for the google reCaptcha V2 library.
			*/
			onLoadHandler: function() {
				window.setTimeout(initializeControls, 1);
			},
			/* Use this method to register the parameters for each reCaptcha instance that will be rendered as a control 
			** during the onLoadHandler.
			*/
			registerInstance: function(data) {
				if(data) {
					_dataObjects.push(data);
				}
			},
			/* Call this method reinitialize all ReCaptcha V2 controls corresponding to the registered instances.
			*/
			reloadControls: function() {
				initializeControls();
			},
			/* Checks if the validation has been performed on the given captcha control.
			*/
			isInstanceVerified: function(captchaId){
				if(typeof _controlInstances[captchaId] != "undefined") {
					var googleAnswer = grecaptcha.getResponse(_controlInstances[captchaId]);

					// The google answer will be an empty string if the recaptcha instance has 
					// not been validated
					return googleAnswer.trim().length != 0;
				}
				else {
					return false;
				}
			}
		};
	})();

	if (settings.steps === '' && typeof settings.containers !== 'undefined') settings.steps = settings.containers;
	if (settings.prev === ''  && typeof settings.backButton !== 'undefined') settings.prev = settings.backButton;
	if (settings.next === ''  && typeof settings.continueButton !== 'undefined') settings.next = settings.continueButton;
	if (settings.onPrev === ''  && typeof settings.onBack !== 'undefined') settings.onPrev = settings.onBack;
	if (settings.onNext === ''  && typeof settings.onContinue !== 'undefined') settings.onNext = settings.onContinue;
	if (settings.responseMode === 'replace'  && typeof settings.messageMode !== 'undefined') settings.responseMode = settings.messageMode;
	if (settings.responseTarget === selector  && typeof settings.messageBox !== 'undefined') settings.responseTarget = settings.messageBox;
	if (settings.restoreTarget === true  && typeof settings.restoreMessageBox !== 'undefined') settings.restoreTarget = settings.restoreMessageBox;
	if (settings.formOnSuccessResponse === null  && typeof settings.afterAjax !== 'undefined') settings.formOnSuccessResponse = settings.afterAjax;
	if (settings.formOnErrorResponse === null  && typeof settings.afterAjax !== 'undefined') settings.formOnErrorResponse = settings.afterAjax;
	if (settings.buttonOnResponse === null  && typeof settings.buttonAfterSubmit !== 'undefined') settings.buttonOnResponse = settings.buttonAfterSubmit;
	if (settings.submitMode === 'standard') {
		if (typeof settings.mode !== 'undefined') settings.submitMode = settings.mode;
		else if (typeof settings.noSubmit !== 'undefined' && settings.noSubmit === true) settings.submitMode = 'off';
		else if (typeof settings.useAjax !== 'undefined' && settings.useAjax === true) settings.submitMode = 'ajax';
	}
	

	// setup some local variables
	var requiredFields,required=[],submitCount=0,
		errorArray=[],errorElement='<'+settings.validationGroupElement+' class="'+settings.validationGroupClass+'"></'+settings.validationGroupElement+'>',newRequired,pass={},
		validationTarget,successMessage,messageElement,selectorResponse,onChangeBinding,errorElementExists,errorCount=0,autoRequire,currentName,submitField,
		paymentMethods = selector.find('['+settings.fieldNameAttr+'="PaymentMethodType"]'), onlyCCMethod = false,
		multistep = {containers: selector.find(settings.steps), step: 0},
		lockSubmit = false, messageBoxContents = (body.find(settings.responseTarget).length > 0) ? body.find(settings.responseTarget).html() : selector.html(), customFlag = false,msg,
		labelFallback = {'Title' : 'Title', 'FirstName' : 'First Name', 'LastName' : 'Last Name', 'FullName' : 'Full Name', 'EmailAddress' : 'Email Address', 'Username' : 'Username', 'Password' : 'Password', 'HomePhone' : 'Home Phone Number', 'WorkPhone' : 'Work Phone Number', 'CellPhone' : 'Cell Phone Number', 'HomeFax' : 'Home Fax Number', 'WorkFax' : 'Work Fax Number', 'HomeAddress' : 'Home Address', 'HomeCity' : 'Home City', 'HomeState' : 'Home State', 'HomeZip' : 'Home Zip', 'HomeCountry' : 'Home Country', 'WorkAddress' : 'WorkAddress', 'WorkCity' : 'Work City', 'WorkState' : 'Work State', 'WorkZip' : 'Work Zip', 'WorkCountry' : 'Work Country', 'WebAddress' : 'Web Address', 'Company' : 'Company', 'DOB' : 'Date of Birth', 'PaymentMethodType' : 'Payment Method', 'BillingAddress' : 'Billing Address', 'BillingCity' : 'Billing City', 'BillingState' : 'Billing State', 'BillingZip' : 'Billing Zip Code', 'BillingCountry' : 'Billing Country', 'ShippingAddress' : 'Shipping Address', 'ShippingCity' : 'Shipping City', 'ShippingState' : 'Shipping State', 'ShippingZip' : 'Shipping Zip Code', 'ShippingCountry' : 'Shipping Country', 'ShippingInstructions' : 'Shipping Instructions', 'ShippingAttention' : 'Shipping Attention', 'Friend01' : 'Friend Email 1', 'Friend02' : 'Friend Email 2', 'Friend03' : 'Friend Email 3', 'Friend04' : 'Friend Email 4', 'Friend05' : 'Friend Email 5', 'Message' : 'Friend Message', 'Anniversary1Title' : 'Anniversary Title', 'Anniversary1' : 'Anniversary', 'Anniversary2Title' : 'Anniversary 2 Title', 'Anniversary2' : 'Anniversary 2', 'Anniversary3Title' : 'Anniversary 3 Title', 'Anniversary3' : 'Anniversary 3', 'Anniversary4Title' : 'Anniversary 4 Title', 'Anniversary4' : 'Anniversary 4', 'Anniversary5Title' : 'Anniversary 5 Title', 'Anniversary5' : 'Anniversary 5', 'FileAttachment' : 'File Attachment', 'CAT_Custom_1423_326' : 'Gender', 'CAT_Custom_1424_326' : 'Height', 'CAT_Custom_1425_326' : 'Marital Status', 'CAT_Custom_1426_326' : 'Has Children', 'CAT_Custom_1427_326' : 'Years in Business', 'CAT_Custom_1428_326' : 'Number of Employees', 'CAT_Custom_1429_326' : 'Annual Revenue', 'CAT_Custom_1430_326' : 'Financial Year', 'InvoiceNumber' : 'Invoice Number', 'CardName' : 'Name on Card', 'CardNumber' : 'Card Number', 'CardExpiryMonth' : 'Card Expiry Month', 'CardExpiryYear' : 'Card Expiry Year', 'CardType' : 'Card Type', 'CardCCV' : 'CCV Number', 'CaptchaV2' : 'Captcha', 'g-recaptcha-response' : 'Captcha'};

	if (settings.customErrorFields !== '') settings.customErrorFields = settings.customErrorFields.split(',');

	var fieldCheck = {
		types: {
			EmailAddress:		'email',
			Friend01:			'email',
			Friend02:			'email',
			Friend03:			'email',
			Friend04:			'email',
			Friend05:			'email',
			DOB:				'date',
			Anniversary1:		'date',
			Anniversary2:		'date',
			Anniversary3:		'date',
			Anniversary4:		'date',
			Anniversary5:		'date',
			CaptchaV2:			'captcha',
			'g-recaptcha-response' : 'recaptcha',
			CardNumber:			'number',
			CardCCV:			'number',
			Amount:				'currency',
			Password:			'password',
			PasswordConfirm:	'passwordconfirm',
			Days:				'days'
		},
		validation: {
			select:				function (required) {return checkDropdown(required.value, required.label);},
			radio:				function (required) {return checkSelected(selector.find('['+settings.fieldNameAttr+'="'+required.name+'"]'), required.label);},
			checkbox:			function (required) {return checkSelected(selector.find('['+settings.fieldNameAttr+'="'+required.name+'"]'), required.label);},
			email:				function (required) {return checkEmail(required.value);},
			date:				function (required) {return checkDate(required.value,required.label);},
			password:			function (required) {pass.value = required.value; pass.label = required.label; return (required.value !== "" && required.value.length < 6) ? "- Password must be 6 characters or longer" : isEmpty(required.value,required.label);},
			passwordconfirm:	function (required) {return (pass.value.length > 0 && pass.value !== required.value) ? pass.label+' and '+required.label+' do not match' : '';},
			captcha:			function (required) {return captchaIsInvalid(selector[0], "Enter Word Verification in box", "Please enter the correct Word Verification as seen in the image");},
			recaptcha:			function (required) {return (grecaptcha.getResponse($('.g-recaptcha').index(selector.find('.g-recaptcha'))) === '') ? 'Please prove you\'re not a robot' : '';},
			currency:			function (required) {return isCurrency(required.value, required.label);},
			number:				function (required) {return isNumeric(required.value, required.label);},
			days:				function (required) {return isNumericIfVisible(required.field, required.label);}
		}
	};

	function runValidation (required,counter,total) {
		var rdoChkFlag = false;
		if (counter===0) {errorCount=0;}

		// Check the field for a value change
		required.value = (typeof required.field.val() === 'undefined' || required.field.val() === null) ? '' : required.field.val();

		// verify field types and make adjustments to them as needed.
		required.type = fieldCheck.types[required.name] || required.type || 'text';
		if (required.type === 'hidden' || required.type === 'password') required.type = 'text';

		for (var i=0; i<settings.customErrorFields.length; i++) {
			if (required.field.is(settings.customErrorFields[i])) {
				customFlag = true;
				break;
			}else customFlag = false;
		}
		if (customFlag === true && settings.customError !== '') {
			$.when(bcpie.utils.executeCallback({
				selector: selector,
				settings: settings,
				callback: settings.customError,
				content: required
			})).then(function(value) {
				required.message = (typeof value === 'undefined') ? '' : value;
			});
		}else {
			// Run the appropriate validator for the field type
			required.message = (typeof fieldCheck.validation[required.type] !== 'undefined') ? fieldCheck.validation[required.type](required) : isEmpty(required.value,required.label);
		}

		required.message = required.message.replace('- ','').replace('\n','');
		if (required.message !=='') {errorCount++;}

		if (settings.validateMode==='alert') {
			if (required.message !=='') {
				if (errorCount===1) {
					errorArray = '- '+required.message+'\n';
				}else {
					errorArray += '- '+required.message+'\n';
				}
			}
			if (counter===total-1 && errorCount !== 0) {
				alert(errorArray);
			}
		}else if (settings.validateMode==='inline') {
			validationTarget = (required.field.is('[data-validation-group]') && required.field.data('validationGroup') !== '') ? required.field.closest(required.field.data('validationGroup')) : required.field.closest(settings.validationGroupElement);
			if (validationTarget.length > -1) {
				if (!validationTarget.is('.'+settings.validationGroupClass)) validationTarget.addClass(settings.validationGroupClass);
				if (!required.field.is('.'+settings.validationInputClass)) required.field.addClass(settings.validationInputClass);
				if (validationTarget.find('.'+settings.validationMessageClass).length === 0) validationTarget.append('<'+settings.validationMessageElement+' class="'+settings.validationMessageClass+'" />');
				validationTarget.find('.'+settings.validationMessageClass).text(required.message);
				if (required.message !== '') {
					if (validationTarget.is('.'+settings.validClass)) validationTarget.removeClass(settings.validClass);
					if (!validationTarget.is('.'+settings.errorClass)) validationTarget.addClass(settings.errorClass);
				}else {
					if (validationTarget.is('.'+settings.errorClass)) validationTarget.removeClass(settings.errorClass);
					if (!validationTarget.is('.'+settings.validClass)) validationTarget.addClass(settings.validClass);
				}
			}
		}
	}
	function buttonSubmitBehaviour(behavior){
		var submitButton = selector.find('[type="submit"]');
		switch(behavior){
			case 'hide': submitButton.hide(); break;
			case 'disable': submitButton.attr('disabled','disabled'); break;
			default: submitButton.removeAttr('disabled').show();
		}
	}
	function submitForm(submitCount) {
		if (submitCount===0) {
			buttonSubmitBehaviour(settings.buttonOnSubmit);
			var otherURL,
				thisURL = selector.attr('action'),
				loggingIn = (bcpie.globals.user.isLoggedIn === false && selector.find('['+settings.fieldNameAttr+'=Username]').length > 0 && selector.find('['+settings.fieldNameAttr+'=Password]').length > 0) ? true : false;
			if (loggingIn === true) {
				thisURL = thisURL.replace(bcpie.globals.secureDomain,'').replace(bcpie.globals.primaryDomain,'');
				otherURL = (bcpie.globals.currentDomain === bcpie.globals.secureDomain) ? bcpie.globals.currentDomain : bcpie.globals.secureDomain;
				otherURL += thisURL+'&callback=?';
			}
			if (settings.submitMode === 'ajax') {
				if (settings.formBeforeResponse === 'hide') selector.hide();
				if (settings.beforeResponseMode !== 'off' && settings.beforeResponseMessage !== null) {
					settings.beforeResponseMessage = body.find(settings.beforeResponseMessage);
					if (settings.beforeResponseMessage.length > 0) {
						if (settings.beforeResponseTarget !== selector) settings.beforeResponseTarget = body.find(settings.beforeResponseTarget);
						if (settings.beforeResponseMode === 'replace') settings.beforeResponseTarget = settings.beforeResponseTarget.html(settings.beforeResponseMessage).fadeIn();
						else if (settings.beforeResponseMode === 'append') settings.beforeResponseTarget = settings.beforeResponseTarget.append(settings.beforeResponseMessage).fadeIn();
						else if (settings.beforeResponseMode === 'prepend') settings.beforeResponseTarget = settings.beforeResponseTarget.prepend(settings.beforeResponseMessage).fadeIn();
						else if (settings.beforeResponseMode === 'before') settings.beforeResponseTarget = settings.beforeResponseTarget.before(settings.beforeResponseMessage).fadeIn();
						else if (settings.beforeResponseMode === 'after') settings.beforeResponseTarget = settings.beforeResponseTarget.after(settings.beforeResponseMessage).fadeIn();
					}
				}
				$.ajax({
					type: 'POST',
					url: thisURL,
					data: selector.serialize(),
					async: settings.async,
					success: function(response,status,xhr) {

						// Retrieve Message
						var messageClass = '';
						if (response.indexOf(settings.systemMessageClass) > 0) messageClass = settings.systemMessageClass;
						else if (response.indexOf(settings.systemErrorMessageClass) > 0) {
							messageClass = settings.systemErrorMessageClass;
							errorCount += 1;
						}
						if (errorCount === 0 && loggingIn === true) {
							$.ajax({
								url: otherURL,
								method:'POST',
								dataType:'jsonp',
								data: {
									Username: selector.find('['+settings.fieldNameAttr+'=Username]').val(),
									Password: selector.find('['+settings.fieldNameAttr+'=Password]').val()
								}
							});
						}
						if (errorCount > 0 && settings.errorMessage !== null) responseMessage = settings.errorMessage;
						else if (errorCount === 0 && settings.successMessage !== null) responseMessage = settings.successMessage;
						else {
							if (messageClass !== '') {
								if ($(response).is('.'+messageClass)) msg = $(response);
								else msg = $(response).find('.'+messageClass);
							}else if ($(response).is('font')) msg = $(response);

							if (typeof msg !== 'undefined' && typeof msg.size !== 'undefined' && messageClass !== '') responseMessage = msg.filter('.'+messageClass);
							else if (messageClass !== '') responseMessage = $(response).filter('.'+messageClass);
							
							if (typeof responseMessage === 'object') {
								if (responseMessage.html().replace(/\n/g,'').trim().length === 0 && settings.restoreTarget === true) responseMessage = messageBoxContents;
								else if(responseMessage.find('.search-results').length > 0) responseMessage = responseMessage.find('.search-results').html();
								else if(responseMessage.find('.webappsearchresults').length > 0) responseMessage = responseMessage.find('.webappsearchresults').html();
							}
						}
						if (typeof responseMessage === 'undefined') responseMessage = '';

						// Response Status
						if (settings.beforeResponseMode !== 'off' && settings.beforeResponseMessage.length > 0) settings.beforeResponseTarget.remove();
						if (settings.responseMode !== 'off') {
							if (settings.responseTarget === 'alert') {
								if (errorCount > 0) alertify.error(responseMessage);
								else alertify.success(responseMessage);
							}else if (settings.responseTarget === 'dialog') {
								// put dialog code here
							}else {
								if (settings.responseTarget !== selector) settings.responseTarget = body.find(settings.responseTarget);
								if (settings.responseMode === 'replace') settings.responseTarget = settings.responseTarget.html(responseMessage).fadeIn();
								else if (settings.responseMode === 'append') settings.responseTarget = settings.responseTarget.append(responseMessage).fadeIn();
								else if (settings.responseMode === 'prepend') settings.responseTarget = settings.responseTarget.prepend(responseMessage).fadeIn();
								else if (settings.responseMode === 'before') settings.responseTarget = settings.responseTarget.before(responseMessage).fadeIn();
								else if (settings.responseMode === 'after') settings.responseTarget = settings.responseTarget.after(responseMessage).fadeIn();
							}
						}
						
						if (errorCount === 0) {
							if (settings.formOnSuccessResponse === 'remove') selector.remove();
							else if (settings.formOnSuccessResponse === 'hide') selector.fadeOut(0);
							else if (settings.formOnSuccessResponse === 'show') selector.fadeIn();
						}else {
							if (settings.formOnErrorResponse === 'hide') selector.fadeOut(0);
							else if (settings.formOnErrorResponse === 'show') selector.fadeIn();
						}

						submitCount = 0;
						lockSubmit = false;

						// Callbacks
						if (errorCount === 0 && settings.ajaxSuccess !== null) {
							if (settings.ajaxSuccess === 'refresh') win.location.reload();
							else bcpie.utils.executeCallback({
									selector: selector,
									settings: settings,
									callback: settings.ajaxSuccess,
									content: response,
									status: status,
									xhr: xhr
								});
						}else if (errorCount > 0 && settings.ajaxError !== null) bcpie.utils.executeCallback({
								selector: selector,
								settings: settings,
								callback: window[settings.ajaxError],
								content: response,
								status: status,
								xhr: xhr
							});
					},
					error: function(xhr,status,error) {
						if (settings.successMessage !== null && settings.responseTarget === 'alert') alertify.error(settings.errorMessage);
						if (settings.ajaxError !== null) bcpie.utils.executeCallback({
								selector: selector,
								settings: settings,
								callback: settings.ajaxError,
								content: error,
								status: status,
								xhr: xhr
							});
						return false;
					},
					complete: function(xhr,status) {
						if (settings.ajaxComplete !== null) bcpie.utils.executeCallback({
							selector: selector,
							settings: settings,
							callback: settings.ajaxComplete,
							status: status,
							xhr: xhr
						});
						buttonSubmitBehaviour(settings.buttonOnResponse);
					}
				});
			}else if (settings.submitMode === 'webapp.item' && typeof settings.webapp !== 'undefined') {
				var data = {};
				data.webapp = settings.webapp;
				if (typeof settings.item !== 'undefined') data.item = settings.item;
				data.content = selector;
				bcpie.ajax.webapp.item.save(data).always(function(data, status, xhr){
					if (typeof xhr.status === 'undefined') xhr = data;
					if (xhr.status.toString().indexOf('20') === 0) {
						if (settings.ajaxSuccess !== null) bcpie.utils.executeCallback({
							selector: selector,
							settings: settings,
							callback: settings.ajaxSuccess,
							status: status,
							xhr: xhr
						});
					}else {
						if (settings.ajaxError !== null) bcpie.utils.executeCallback({
							selector: selector,
							settings: settings,
							callback: settings.ajaxError,
							status: status,
							xhr: xhr
						});
					}
					if (settings.ajaxComplete !== null) bcpie.utils.executeCallback({
						selector: selector,
						settings: settings,
						callback: settings.ajaxComplete,
						status: status,
						xhr: xhr
					});
					buttonSubmitBehaviour(settings.buttonOnResponse);
				});
			}else selector.off('submit').submit();

			return submitCount++;
		}else{
			alert("This form has already been submitted. Please refresh the page if you need to submit again.");
			return false;
		}
	}
	function buildRequiredObject(rField,i) {
		required[i] = {
			name : rField.attr(settings.fieldNameAttr),
			field : rField,
			type : (rField.is('input')) ? rField.attr('type') : rField.get(0).tagName.toLowerCase(),
			value : (typeof rField.val() === 'undefined') ? '' : rField.val(),
			label : (selector.find('label[for="'+rField.attr(settings.fieldNameAttr)+'"]').length > 0) ? selector.find('label[for="'+rField.attr(settings.fieldNameAttr)+'"]').text() : rField.attr('placeholder')
		};
		if (typeof required[i].label === 'undefined') required[i].label = labelFallback[required[i].name];
	}
	function autoRequirePaymentFields(scope) {
		if (paymentMethods.size() == 1 && $(paymentMethods[0]).val() == '1') onlyCCMethod = true;
		if (paymentMethods.filter(':checked').val() == '1' || onlyCCMethod) {
			scope.find('['+settings.fieldNameAttr+'="CardName"], ['+settings.fieldNameAttr+'="CardNumber"], ['+settings.fieldNameAttr+'="CardExpiryMonth"], ['+settings.fieldNameAttr+'="CardExpiryYear"], ['+settings.fieldNameAttr+'="CardType"], ['+settings.fieldNameAttr+'="CardCCV"]').addClass(settings.requiredClass);
		}else scope.find('['+settings.fieldNameAttr+'="CardName"], ['+settings.fieldNameAttr+'="CardNumber"], ['+settings.fieldNameAttr+'="CardExpiryMonth"], ['+settings.fieldNameAttr+'="CardExpiryYear"], ['+settings.fieldNameAttr+'="CardType"], ['+settings.fieldNameAttr+'="CardCCV"]').removeClass(settings.requiredClass);
	}
	function BuildRequiredObjectArray(scope) {
		var i = 0,_this = null;
		required=[];
		
		// Build required array
		for (var e = 0; e< autoRequire.length; e++) {
			autoRequire.field = selector.find('['+settings.fieldNameAttr+'="'+autoRequire[e]+'"]');
			if (autoRequire.field.length > 0 && autoRequire.field.not('.'+settings.requiredClass)) autoRequire.field.addClass(settings.requiredClass);
		}
		requiredFields = scope.find('input, select, button, textarea').filter('.'+settings.requiredClass);

		for(var cnt=0,len = requiredFields.size(); cnt < len; cnt++){
			_this = requiredFields[cnt];
			newRequired = scope.find('['+settings.fieldNameAttr+'="'+$(_this).attr(settings.fieldNameAttr)+'"]').not('.'+settings.requiredClass);
			if (newRequired.length > 0) {
				for(var cnt2=0, len2 = $(newRequired).size(); cnt2<len2; cnt2++){
					var newRequiredItem = $(newRequired[cnt2]);
					newRequiredItem.addClass(settings.requiredClass);
					buildRequiredObject(newRequiredItem,i);
					i++;
				}
			}
			buildRequiredObject($(_this),i);
			i++;
		}
	}
	function resetRequiredField(required) {
		if (required.field.is('.'+settings.errorClass)) {
			required.field.siblings(settings.validationMessageElement+'.'+settings.errorClass.replace(' ','.')).remove();
			required.field.removeClass(settings.errorClass).unwrap();
			if (required.type === 'checkbox' || required.type === 'radio') selector.find('['+settings.fieldNameAttr+'="' + required.name + '"]').removeClass(settings.errorClass);
			--errorCount;
		}
	}
	function activeValidation(scope) {
		// Set onChangeBinding to true in order to prevent these bindings from occuring multiple times.
		onChangeBinding = true;
		for (var i = 0; i<required.length; i++) {
			scope.on('change','['+settings.fieldNameAttr+'="' + required[i].name + '"]', function() {
				for (var i = 0;i<required.length;i++) {
					if ($(this).attr(settings.fieldNameAttr) === required[i].name) runValidation(required[i],0,1);
				}
			});
		}
	}
	function moveToContainer(index){
		// show/hide buttons
		if (index === 0) {
			selector.find(settings.submitField +','+ settings.prev).hide();
			selector.find(settings.next).show();
		}else if (index === multistep.containers.length - 1) {
			selector.find(settings.next).hide();
			selector.find(settings.submitField +','+ settings.prev).show();
		}else{
			selector.find(settings.next +','+ settings.prev).show();
			selector.find(settings.submitField).hide();
		}

		// show next step
		selector.find(multistep.containers).removeClass('activeContainer').hide();
		selector.find(multistep.containers[multistep.step]).addClass('activeContainer').show();
		if (index !== 0) selector.get(0).scrollIntoView();
	}

	buttonSubmitBehaviour('');

	// Auto Require certain fields
	autoRequire = ['EmailAddress','CaptchaV2','g-recaptcha-response','ItemName'];
	ccFields = ['CardName','CardNumber','CardExpiryMonth','CardExpiryYear','CardType','CardCCV'];

	// Auto require credit card fields depending upon payment method
	autoRequirePaymentFields(selector);
	selector.on('change',paymentMethods,function() {
		autoRequirePaymentFields(selector);
		if (multistep.containers.length > 0) BuildRequiredObjectArray(selector.find(multistep.containers[multistep.step]));
		else BuildRequiredObjectArray(selector);
	});


	// If multistep true configure validations on containers
	if (multistep.containers.length > 0) {

		// start on the first container
		moveToContainer(multistep.step);

		selector.on('click',settings.next,function(event){
			event.preventDefault();
			BuildRequiredObjectArray(selector.find(multistep.containers[multistep.step]));

			for (var i = 0; i<required.length; i++) {
				runValidation(required[i],i,required.length);
			}
			if (errorCount === 0) {
				moveToContainer(++multistep.step);
				if (settings.onStep !== null) {
					bcpie.utils.executeCallback({
					selector: selector,
					settings: settings,
					callback: settings.onStep
				});
				}
				if (settings.onNext !== null) {
					bcpie.utils.executeCallback({
					selector: selector,
					settings: settings,
					callback: settings.onNext
				});
				}
			}else if (settings.validateMode === 'inline') {
				// Now that submission has been attempted, allow active field validation.
				activeValidation(selector.find(multistep.containers[multistep.step]));
			}
		});

		selector.on('click',settings.prev,function(event){
			event.preventDefault();
			for (var i = 0; i<required.length; i++) {
				resetRequiredField(required[i]);
			}
			moveToContainer(--multistep.step);
			if (settings.onPrev !== null) {
				bcpie.utils.executeCallback({
					selector: selector,
					settings: settings,
					callback: settings.onPrev
				});
			}
		});

		// prevent the enter key from submitting the form until the last step
		selector.on('keypress',function(e) {
			if (e.keyCode == 13) {
				e.preventDefault();
				if (selector.find(settings.next).filter(':visible').size() > 0) selector.find(settings.next).filter(':visible').trigger('click');
				else selector.find('[type="submit"]:visible').trigger('click');
			}
		});

	}

	// bind to the submit event of our form
	selector.on('submit',function(event) {
		event.preventDefault();
		if (settings.beforeValidation !== null) {
			bcpie.utils.executeCallback({
				selector: selector,
				settings: settings,
				callback: settings.beforeValidation
			});
		}
		BuildRequiredObjectArray(selector);

		if (lockSubmit) return false;
		else lockSubmit = true;
		if (settings.validateMode !== 'off') {
			for (var i = 0;i<required.length;i++) {
				runValidation(required[i],i,required.length);
			}
		}
		if (selector.find('.g-recaptcha-response').length > 0 && grecaptcha.getResponse() === '') errorCount ++;
		if (errorCount === 0) {
			if (settings.validationSuccess !== null) {
				$.when(bcpie.utils.executeCallback({
					selector: selector,
					settings: settings,
					callback: settings.validationSuccess
				})).then(function(value) {
					if (value !== 'stop' && settings.submitMode !== 'off') submitForm(submitCount);
				});
			}else if (settings.submitMode !== 'off') submitForm(submitCount);
		}
		else
			if (settings.validationError !== null) bcpie.utils.executeCallback({
				selector: selector,
				settings: settings,
				callback: settings.validationError
			});
		// Now that submission has been attempted, allow active field validation.
		if (settings.validateMode === 'inline' && onChangeBinding !== true) {
			activeValidation(selector);
		}
		lockSubmit = false;
	});

	// Autosubmit
	if (settings.submitEvent === 'ready') {
		selector.submit();
	}

	// Activate submitEvent
	if (settings.submitField !== '[type="submit"]' && settings.submitEvent !== 'submit') {
		selector.on(settings.submitEvent,settings.submitField,function(){
			selector.submit();
		});
	}
};
;/*
 * "Foundation". An awesome trick for BC Pie.
 * http://bcpie.com
 * Copyright 2015, ONE Creative
 * Free to use in BC Pie
*/

bcpie.extensions.tricks.Foundation = function(selector,options) {
	var settings = bcpie.extensions.settings(selector,options,{
		name: 'Foundation',
		version: '2015.01.31',
		defaults: {
			feature: null
		}
	});

	if (settings.feature === 'topbar') {
		selector.find('li').filter(function(){
			return $(this).children('ul').length > 0 && !$(this).is('.has-dropdown');
		}).addClass('has-dropdown');
		selector.find('.has-dropdown').filter(function(){
			return $(this).children('.dropdown').length === 0;
		}).removeClass('has-dropdown');
	}
};;/* 
  * To Title Case 2.1 – http://individed.com/code/to-title-case/
  * Copyright © 2008–2013 David Gouch. Licensed under the MIT License.
 */

String.prototype.toTitleCase = function(){
  var smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|vs?\.?|via)$/i;

  return this.replace(/[A-Za-z0-9\u00C0-\u00FF]+[^\s-]*/g, function(match, index, title){
    if (index > 0 && index + match.length !== title.length &&
      match.search(smallWords) > -1 && title.charAt(index - 2) !== ":" &&
      (title.charAt(index + match.length) !== '-' || title.charAt(index - 1) === '-') &&
      title.charAt(index - 1).search(/[^\s-]/) < 0) {
      return match.toLowerCase();
    }

    if (match.substr(1).search(/[A-Z]|\../) > -1) {
      return match;
    }

    return match.charAt(0).toUpperCase() + match.substr(1);
  });
};

/*
 * "SameAs". An awesome trick for BC Pie.
 * http://bcpie.com
 * Copyright 2015, ONE Creative
 * Free to use in BC Pie, or as licensed in Dev-in-a-Box from http://www.bcappstore.com/apps/dev-in-a-box
*/

bcpie.extensions.tricks.SameAs = function(selector,options) {
	var settings = bcpie.extensions.settings(selector,options,{
		name: 'SameAs',
		version: '2017.06.24',
		defaults: {
			copy: null,
			copyType: 'concat', // concat,math
			expressAttr: 'name',
			refAttr: 'value', // html attribute or 'text'. Default is 'value'.
			targetAttr: 'value', // html attribute or 'text'. Default is 'value'.
			scope: 'form', // Uses 'form' or css selectors as values, or use 'parent' to get the selector's parent
			scopeMode: 'closest', // or 'find', 'sibling'
			checkbox: 'off',
			checkboxLogic: 'and', // or
			clearOnUncheck: true,
			decimals: 'off', // rounds numbers to specified decimal when copyType is set to math
			convert: 'off', // 'upper', 'lower', 'title', 'camel' and 'slug'. 'slug' will change the string to an appropriate url path.
			encoding: 'off', // 'escape', 'unescape', 'url' or 'off'
			trim: false,
			bothWays: false,
			breakOnChange: false, // Requires bothWays:false
			copyOnLoad: true, // determines whether the trick initiates on load, or instead waits for the event to trigger.
			event: 'change', // specify the event that triggers the copy
			eventNamespace: 'sameas' // specify an event to trigger when the trick is finished.
		}
	});

	// Backwards compatibility
	if (settings.copyOnLoad === true && typeof settings.loadEvent !== 'undefined') settings.copyOnLoad = settings.loadEvent;
	if (settings.expressAttr === 'name' && typeof settings.attributeType !== 'undefined') settings.expressAttr = settings.attributeType;
	if (settings.refAttr === 'value' && typeof settings.ref !== 'undefined') settings.refAttr = settings.ref;
	if (settings.targetAttr === 'value' && typeof settings.target !== 'undefined') settings.targetAttr = settings.target;
	if (settings.copyType === 'simple') settings.copyType = 'concat';
	if (settings.copy === null) {
		settings.copy = selector.attr(settings.expressAttr);
		settings.scope = 'parent';
	}
	if (settings.copy !== '' && settings.copy.indexOf('[') === -1) settings.copy = '['+settings.copy+']';
	if (typeof settings.prefix !== 'undefined') settings.copy = settings.prefix + settings.copy;
	if (typeof settings.suffix !== 'undefined') settings.copy = settings.copy + settings.suffix;
	if (settings.convert !== 'off') settings.convert = settings.convert.replace('case','').replace('Case','');

	// Setup our variables
	var copyGroup;
	if (settings.scope === 'parent') copyGroup = selector.parent();
	else if (settings.scopeMode === 'closest') copyGroup = selector.closest(settings.scope);
	else if (settings.scopeMode === 'sibling' || settings.scopeMode === 'siblings') copyGroup = selector.siblings(settings.scope);
	else copyGroup = $(doc).find(settings.scope);

	if (settings.targetAttr === 'text' || settings.targetAttr === 'value') {
		if (selector.is('select,textarea,input')) settings.targetAttr = 'value';
		else settings.targetAttr = 'text';
	}

	if (copyGroup.length > 0) {
		var copyField, changed, checkbox,
			copyFields=[],value,boolean;

		if (settings.checkbox !== 'off') {
			checkbox = settings.checkbox.split(',');
			for (var i = 0; i < checkbox.length; i++) {
				checkbox[i] = checkbox[i].replace('[','').replace(']','');
				if (checkbox[i].indexOf('=') === -1) checkbox[i] = settings.expressAttr+'="'+checkbox[i]+'"';
				checkbox[i] = copyGroup.find('['+checkbox[i]+']');
			}
		}

		if (settings.decimals !== 'off') settings.decimals = parseInt(settings.decimals);
		if (settings.eventNamespace !== '') settings.eventNamespace = '.'+settings.eventNamespace;

		selector.data('sameAsLastVal',selector.val());
		GetFieldsExpression(true);

		// Choose which method to use
		if (settings.checkbox !== 'off' && checkbox.length > 0) {
			checkboxChange(checkbox,copyFields);
			for (var e = 0; e < checkbox.length; e++) {
				checkbox[e].on(settings.event,function() {
					checkboxChange(checkbox,copyFields);
				});
			}
			
			if (settings.breakOnChange !== false) {
				selector.on(settings.event,function() {
					for (var f = 0; f < checkbox.length; f++) {
						checkbox[f].off(settings.event);
					}
					for (var g = copyFields.length - 1; g >= 0; g--) {
						copyFields[g].off(settings.event);
					}
					selector.off(settings.event);
				});
			}
		}else {
			if (settings.copyOnLoad === true) {
				copyVal(selector,copyFields);
				inputChange(selector,copyFields);
			}
			
			if (settings.breakOnChange !== false) {
				selector.on(settings.event,function() {
					for (var i = copyFields.length - 1; i >= 0; i--) {
						copyFields[i].off(settings.event);
					}
					selector.off(settings.event);
				});
			}
		}
	}

	function copyVal(selector,copyFields) {
		changed = false;
		boolean = copyFields[0].is('input[type=checkbox]') && !copyFields[0][0].hasAttribute('value') && selector.is('input[type=checkbox]');
		value = GetFieldsExpression();

		if (settings.convert !== 'off' && typeof value !== 'undefined') {
			if (settings.convert === 'slug') value = bcpie.utils.makeSlug(value);
			else if (settings.convert === 'lower') value = value.toLowerCase();
			else if (settings.convert === 'upper') value = value.toUpperCase();
			else if (settings.convert === 'camel') value = bcpie.utils.camelCase(value);
			else if (settings.convert === 'title') value = value.toTitleCase();
		}

		if (settings.encoding !== 'off' && typeof value !== 'undefined') {
			if (settings.encoding === 'escape') value = bcpie.utils.escape(value);
			else if (settings.encoding === 'unescape') value = bcpie.utils.unescape(value);
			else if (settings.encoding === 'encode') value = bcpie.utils.encode(value);
			else if (settings.encoding === 'decode') value = bcpie.utils.decode(value);
			else if (settings.encoding === 'json') value = bcpie.utils.jsonify(value);
		}

		if (settings.targetAttr === 'text' || settings.targetAttr === 'value') {
			if (boolean === true) {
				if (copyFields[0].is(':checked') && !selector.is(':checked')) {
					selector.prop('checked',true);
					changed = true;
				}else if (!copyFields[0].is(':checked') && selector.is(':checked')) {
					selector.prop('checked',false);
					changed = true;
				}
			}else if (settings.targetAttr === 'value') selector.val(value);
			else selector.text(value);
		}else selector.attr(settings.targetAttr,value).prop(settings.targetAttr,value);

		if (boolean === false) {
			if (settings.targetAttr === 'value' && selector.data('sameAsLastVal') !== selector.val()) changed = true;
			else if (settings.targetAttr === 'text' && selector.data('sameAsLastVal') !== selector.text()) changed = true;
			else if (selector.data('sameAsLastVal') !== selector.attr(settings.targetAttr)) changed = true;
		}
		
		if (changed === true) {
			selector.trigger(settings.event+settings.eventNamespace);
			if (settings.event !== 'change' && selector.is('select,textarea,input')) selector.trigger('change'+settings.eventNamespace); // restores the selector's native change behavior
			selector.data('sameAsLastVal',selector.val());
		}
	}
	function inputChange(selector,copyFields) {
		for (var i = copyFields.length - 1; i >= 0; i--) {
			$(copyFields[i]).on(settings.event,function() {
				copyVal(selector,copyFields);
			});
		}

		if (settings.bothWays === true) {
			selector.on(settings.event,function(){
				if (selector.val() !== copyFields[0].val()) {
					copyVal(copyFields[0],[selector]);
				}
			});
		}
	}
	function checkboxChange(checkbox,copyFields) {
		var checked = 0;
		for (var i = 0; i < checkbox.length; i++) {
			if (checkbox[i].prop('checked')) checked += 1;
		}

		if (settings.checkboxLogic === 'and' && checkbox.length === checked) checked = true;
		else if (settings.checkboxLogic === 'or' && checked > 0) checked = true;
		else checked = false;

		if (checked) {
			copyVal(selector,copyFields);
			inputChange(selector,copyFields);
		}else {
			for (var e = copyFields.length - 1; e >= 0; e--) {
				copyFields[e].off(settings.event);
			}
			selector.off(settings.event);
			selector.val('');

			if (selector.data('sameAsLastVal') !== selector.val()) {
				selector.trigger(settings.event+settings.eventNamespace);
				if (settings.event !== 'change') selector.trigger('change'+settings.eventNamespace); // restores the selector's native change behavior
				selector.data('sameAsLastVal',selector.val());
			}
		}
	}
	function GetFieldsExpression(init){
		var strExpression = settings.copy,expr,dec = 1;
		
		strExpression = GetfieldVal(strExpression);
		if (typeof settings.decimals == 'number') {
			for (var i = 0; i<settings.decimals; i++) {
				dec = dec*10;
			}
		}
		
		if (settings.copyType == "math") {
			try {
				expr = Parser.parse(strExpression);
				return ((Math.round(expr.evaluate()*dec)/dec)+0).toFixed(settings.decimals);
			}
			catch(e){
				return strExpression.replace(/\+/g,'').replace(/\-/g,'').replace(/\//g,'').replace(/\*/g,'').replace(/\)/g,'').replace(/\(/g,'');
			}
		}else if (settings.copyType == "concat") return strExpression;
	}
	function GetfieldVal(str) {
		var pattern = /\[.*?\]/g,newSelector,
			fieldSelectors = str.match(pattern),
			individualField;

		for (var i = 0; i < fieldSelectors.length; i++) {
			newSelector = fieldSelectors[i].replace('[','').replace(']','');
			if (newSelector.indexOf('=') === -1) newSelector = settings.expressAttr+'="'+newSelector+'"';
			newSelector = copyGroup.find('['+newSelector+']');
			copyFields.push(copyGroup.find(newSelector));
			value = '';
			combinedVal = '';
			for (var e = 0; e < copyFields[i].length; e++) {
				individualField = $(copyFields[i][e]);
				if (individualField.is('select')) value = individualField.find('option').filter(':selected');
				else if (individualField.is('input[type=radio]') || individualField.is('input[type=checkbox]')) {
					if (individualField.filter(':checked').length > 0) value = individualField.filter(':checked');
					else value = '';
				} 
				else value = individualField;

				if (value !== '') {
					if (settings.refAttr === 'text') value = value.text();
					else if (settings.refAttr === 'value') value = value.val();
					else if (settings.refAttr === 'html') value = value.html();
					else value = value.attr(settings.refAttr);
				}

				if (typeof value !== 'undefined' && settings.trim === true) value = value.trim();
				if (settings.copyType === 'math' && e > 0) combinedVal += '+'+value;
				else if (settings.copyType === 'concat' && e > 0) combinedVal += value;
				else combinedVal = value;
			}
			if (typeof combinedVal !== 'undefined') str = str.replace(fieldSelectors[i],combinedVal);
		}
		return str;
	}
};;/*
 * Secure
 * http://bcpie.com
 * Copyright 2015, ONE Creative
 * Free to use in BC Pie, or as licensed in Dev-in-a-Box from http://www.bcappstore.com/apps/dev-in-a-box
*/

bcpie.extensions.tricks.Secure = function(selector,options) {
	var settings = bcpie.extensions.settings(selector,options,{
		name: 'Secure',
		version: '2017.03.15',
		defaults: {
			unsecureLinks: true,
			onSessionEnd: '', // callback function to call when a session ends.
			sessionEndRedirect: '', // site relative url of a page to redirect to when a session ends.
			memberProcessRedirect: '', // site relative url of a page to redirect to after a user updates their profile. 'same' points it back to the page where submission occurred.
			securePayments: true, // forces a non-secure page to reload on the secure domain if it has an Amount field.
			logoutPage: '', // site relative url or 'same' to indicate where to redirect to after a logout link is clicked.
			detectUser: false, // creates a cookie that remembers a user's first name.
			securePages: '' // comma separated list of relative links that should be secure
		}
	});

	var blurTime,status,secure = win.location.origin === settings.secureDomain,links,href,interval,makeSecure;
	settings.securePages = settings.securePages.split(',');

	if (secure === false) {
		if (settings.securePayments === true && selector.find('[name="Amount"]').length > 0) makeSecure = true;
		else if (settings.securePages !== '' && settings.securePages.indexOf(settings.pageAddress) > 0) makeSecure = true;

		if (makeSecure === true) win.location.href = settings.secureDomain+settings.pageAddress;
	}
	if (settings.onSessionEnd !== '' || settings.sessionEndRedirect !== '') {
		if(settings.user.isLoggedIn === true) {
			sessionBehavior();
			bindSessionEvents();
		}
	}
	if (settings.unsecureLinks === true) unsecureLinks();
	if (settings.logoutPage !== '') {
		body.find('a').filter(function(){
			return this.href.toLowerCase().indexOf('/logoutprocess.aspx') > -1 ;
		}).on('click', function(event) {
			event.preventDefault();
			$.ajax({
				url: '/logoutprocess.aspx'
			}).done(function() {
				if (settings.logoutPage === 'same') doc.location.reload();
				else win.location.href = settings.logoutPage;
			});
		});
	}
	if (settings.detectUser === true) {
		if (bcpie.globals.user.isLoggedIn) {
			updateCookie('firstname',globals.user.firstname);
		}
	}
	if (settings.memberProcessRedirect !== '' && bcpie.globals.path === '/memberprocess.aspx') {
		if (settings.memberProcessRedirect === 'same') win.location.href = doc.referrer;
		else win.location.href = settings.memberProcessRedirect;
	}

	function updateCookie(property,value) {
		Cookies(bcpie.globals.site.host+'-'+property,value,{expires: 365,path: '/'});
	}
	function unsecureLinks () {
		if (secure === true) {
			links = selector.find('a').not('[href^="mailto:"]').not('[href="/LogOutProcess.aspx"]').not('[href^="javascript:"]');
			for (var i=0; i<links.length; i++) {
				href = $(links[i]).attr("href") || '';
				if (href.indexOf('http') === -1 && href.indexOf('//') === -1 && href.indexOf('#') === -1) {
					href = (href.indexOf('/') !== 0) ? settings.primaryDomain+'/'+href : settings.primaryDomain+href;
					$(links[i]).attr('href', href);
				}
			}
		}
	}
	function sessionBehavior() {
		$.ajax({
			url: '/_system/apps/bcpie-bcpie/public/utilities/ajax/loggedinstatus.html',
			type: 'GET',
			success: function(response) {
				onAutoLogout(response);
			},
			error: function() {
				$.ajax({
					url: '/',
					type: 'GET',
					success: function(response) {
						onAutoLogout(response);
					}
				});
			}
		});
	}
	function onAutoLogout (response) {
		if ($(response).filter('[data-loggedin]').data('loggedin') === false) {
			if (settings.onSessionEnd !== '') bcpie.utils.executeCallback({
				selector: selector,
				callback: settings.onSessionEnd
			});
			if (settings.sessionEndRedirect !== '') win.location.href = settings.primaryDomain+settings.sessionEndRedirect;
			clearInterval(interval);
		}
	}
	function bindSessionEvents (argument) {
		interval = setInterval(function(){sessionBehavior();},900000); // 15min
		$(win).on('focus',function(){
			sessionBehavior();
		});
	}
};;/*
 * ThemeClean
 * http://bcpie.com
 * Copyright 2015, ONE Creative
 * Free to use in BC Pie
*/

bcpie.extensions.tricks.ThemeClean = function(selector,options) {
	var settings = bcpie.extensions.settings(selector,options,{
		name: 'ThemeClean',
		version: '2015.01.28'
	});

	$('link').filter(function(){
		return $(this).attr('href').toLowerCase().indexOf('.css') > -1;
	}).not(function(){
		return ['modulestylesheets.css','theme.css'].indexOf($(this).attr('href').toLowerCase()) > -1;
	}).remove();
};;/*
 * "Trigger". An awesome trick for BC Pie.
 * http://bcpie.com
 * Copyright 2017, ONE Creative
 * Free to use in BC Pie, or as licensed in Dev-in-a-Box from http://www.bcappstore.com/apps/dev-in-a-box
*/

bcpie.extensions.tricks.Trigger = function(selector,options) {
	var settings = bcpie.extensions.settings(selector,options,{
		name: 'Trigger',
		version: '2017.04.08',
		defaults: {
			trigger: 'self', // use a css selector to specify which element will trigger the behavior. Default is 'self'.
			event: 'click', // specify a comma separated list of events to cause the trigger
			eventNamespace: 'trigger',
			scope: body, // specify the parent element to search within for a trigger.
			scopeMode: 'find', // closest, siblings
			triggerValue: '', // value to be used in change event. Separate multiple values with commas. Or use 'boolean' to indicate a checkbox checked state. If left empty, any change will trigger the behavior.
			triggerMode: 'or', // 'or' or 'and'. For multiple triggers when event is set to 'change', this determines whether one or all triggers need to meet the condition.
			triggerAttr: 'value', // attribute to obtain the value from when using triggerValue.
			state: 'class', // beginning state of the trigger. Options are 'on', 'off', 'class', and 'value'. 'class' and 'value' automatically determine the state by whether the onClass/offClass or onValue/offValue is applied to the element.
			onClass: '', // css class(es) to be applied. Separate multiples with a space.
			offClass: '', // css class(es) to be applied. Separate multiples with a space.
			toggle: true, // if true, on and off states will be toggled on events. Otherwise, only the on state will occur.
			onCallback: '', // on callback
			offCallback: '', // off callback
			onValue: null, // specify default value when trigger is on, or use 'boolean' to indicate a checked state.
			offValue: null, // specify default value when trigger is off
			loadEvent: true // determines whether the trick initiates on load, or instead waits for the event to trigger.
		}
	});

	settings.methods = {
		executeTrigger: function(state) {
			if (state === 'on') {
				if (settings.onClass !== '') selector.addClass(settings.onClass.names);
				if (settings.offClass !== '') selector.removeClass(settings.offClass.names);
				bcpie.utils.executeCallback({
					selector: selector,
					settings: settings,
					callback: settings.onCallback,
				});
				settings.methods.changeValue(settings.state);
			}else if (settings.toggle === true) {
				if (settings.onClass !== '') selector.removeClass(settings.onClass.names);
				if (settings.offClass !== '') selector.addClass(settings.offClass.names);
				bcpie.utils.executeCallback({
					selector: selector,
					settings: settings,
					callback: settings.offCallback,
				});
				settings.methods.changeValue(settings.state);
			}
		},
		changeValue: function(state) {
			if (settings.onValue === 'boolean' && state === 'on') selector.prop('checked',true).attr('checked','checked');
			else if (settings.offValue === 'boolean' && state === 'off') selector.prop('checked',false).removeAttr('checked');
			else {
				if (state === 'off') state = settings.offValue;
				else if (state === 'on') state = settings.onValue;
				if (state !== null) {
					if (selector.is('input,select,textarea')) selector.val(state);
					else selector.text(state);
				}
			}
			if (selector.is('select,textarea,input')) selector.trigger('change'+settings.eventNamespace); // restores the selector's native change behavior
			
		},
		changeTrigger: function(){
			var matchedValues = 0;
			if (settings.triggerValue === '') matchedValues = settings.trigger.length;
			else {
				for (var e = 0; e < settings.trigger.length; e++) {
					for (var i=0; i<settings.triggerValue.length; i++) {
						if ((settings.triggerValue[i] === 'boolean' || settings.triggerValue[i] === 'boolean:on') && $(settings.trigger[e]).is(':checked')) matchedValues ++;
						else if (settings.triggerValue[i] === 'boolean:off' && !$(settings.trigger[e]).is(':checked')) matchedValues ++;
						else if (typeof settings.methods.getValue($(settings.trigger[e])) === 'object') {
							if (settings.methods.getValue($(settings.trigger[e])).indexOf(settings.triggerValue[i]) > -1) matchedValues ++;
						}else if (settings.methods.getValue($(settings.trigger[e])) == settings.triggerValue[i]) matchedValues ++;
					}
				}
			}
			if (settings.triggerMode === 'or' && matchedValues > 0) settings.state = 'on';
			else if (settings.triggerMode === 'and' && matchedValues === settings.trigger.length) settings.state = 'on';
			else settings.state = 'off';

			settings.methods.executeTrigger(settings.state);
		},
		getValue: function(triggerElement) {
			var value,tempArray = [];
			if (settings.triggerAttr === 'value') {
				if(triggerElement.is('[type=radio]'))
					value = triggerElement.filter(':checked').val();
				else if(triggerElement.is('[type=checkbox]')) {
					for (var i = 0; i < settings.triggerValue.length; i++) {
						if(settings.triggerValue[i] === '' && triggerElement.filter(':checked').size() > 0)
							value = '';
						if(triggerElement.filter("[value='" + settings.triggerValue[i] + "']:checked").size() > 0)
							value = triggerElement.filter("[value='" + settings.triggerValue[i] + "']:checked").val();
					}
				}else value = triggerElement.val();
			}
			else {
				if (triggerElement.is('select')) {
					value = triggerElement.find('option').filter(':selected');
					if (value.length > 1) {
						for (var e = 0; e < value.length; e++) {
							tempArray.push($(value[e]).attr(settings.triggerAttr));
						}
						value = tempArray;
					}else value = value.attr(settings.triggerAttr);
				}else value = triggerElement.attr(settings.triggerAttr);
			}
			if (typeof value === 'undefined' || value === null) value = '';
			if (typeof value === 'string') value = value.trim();
			return value;
		}
	};

	if (settings.trigger === 'self') settings.trigger = selector;
	else if (settings.scopeMode === 'closest') settings.trigger = selector.closest(settings.scope).find(settings.trigger);
	else if (settings.scopeMode === 'siblings' || settings.scopeMode === 'sibling') settings.trigger = selector.siblings(settings.scope).find(settings.trigger);
	else settings.trigger = $(doc).find(settings.scope).find(settings.trigger);

	if (settings.triggerValue === true || settings.triggerValue === false) settings.triggerValue = settings.triggerValue.toString();
	if (settings.triggerValue !== '' && settings.event === 'click') settings.event = 'change';
	settings.triggerValue = settings.triggerValue.split(',');

	if (settings.onClass !== '') settings.onClass = bcpie.utils.classObject(settings.onClass);
	if (settings.offClass !== '') settings.offClass = bcpie.utils.classObject(settings.offClass);

	if (settings.eventNamespace !== '') settings.eventNamespace = '.'+settings.eventNamespace;

	if (settings.state === 'class') {
		if (selector.is(settings.onClass.selector)) settings.state = 'on';
		else settings.state = 'off';
	}else if (settings.state === 'value') {
		if (selector.val() === settings.onValue || selector.text() === settings.onValue) settings.state = 'on';
		else settings.state = 'off';
	}
	selector.data('bcpie-trigger-state',settings.state);

	// specified special event change, else a generic event of class application and callbacks will be applied
	if (settings.event === 'change') {
		if (settings.loadEvent === true) settings.methods.changeTrigger();
		settings.trigger.on(settings.event,settings.methods.changeTrigger);
	}else {
		if (settings.loadEvent === true) settings.methods.executeTrigger(settings.state);
		settings.trigger.on(settings.event.replace(',',' '),function(){
			if (selector.data('bcpie-trigger-state') === 'off') {
				selector.data('bcpie-trigger-state','on');
				settings.state = selector.data('bcpie-trigger-state');
			}else if (settings.toggle === true) {
				selector.data('bcpie-trigger-state','off');
				settings.state = selector.data('bcpie-trigger-state');
			}
			settings.methods.executeTrigger(settings.state);
		});
	}
};;/*
 * "Utility". An awesome trick for BC Pie.
 * http://bcpie.com
 * Copyright 2015, ONE Creative
 * Free to use in BC Pie, or as licensed in Dev-in-a-Box from http://www.bcappstore.com/apps/dev-in-a-box
*/

bcpie.extensions.tricks.Utility = function(selector,options) {
	var settings = bcpie.extensions.settings(selector,options,{
		name: 'Utility',
		version: '2015.09.25',
		defaults: {
			value: '',
			list: '', // options are countries, states, timezones.
		}
	});

	// take care of backwards compatibility first
	settings.value = settings.setValue || settings.value;
	settings.list = settings.getList || settings.list;
	// if (settings.value !== '') settings.value = settings.value.toLowerCase();
	// if (settings.list !== '') settings.list = settings.list.toLowerCase();

	function setValue() {
		if (selector.is('select')) {
			selector.find('option').filter(function(){
				return $(this).is('[value="'+settings.value+'"]');
			}).attr('selected','selected').prop('selected',true);
		}else if (selector.is('input[type=text]') || selector.is('textarea')) {
			selector.val(settings.value);
		}else if (selector.is('input[type=radio]')) {
			selector.closest('form').find('[name="'+selector.attr('name')+'"]').filter(function(){
				return $(this).is('[value="'+settings.value+'"]');
			}).attr('checked','checked').prop('checked',true);
		}else if (selector.is('input[type=checkbox]')) {
			settings.value = settings.value.split(',');
			for (var i=0; i<settings.value.length; i++) {
				selector.closest('form').find('[name="'+selector.attr('name')+'"]').filter('[value="'+settings.value[i]+'"]').attr('checked','checked').prop('checked',true);
			}
		}
		selector.trigger('change.utility');
	}
	if (settings.list !== '') {
		var list='';
		if (settings.list === 'countries') {
			if (typeof body.data('bcCountries') === 'undefined') body.data('bcCountries',settings.countries);
			var countryData = body.data('bcCountries');
			for (var cc in countryData) {
				if (countryData.hasOwnProperty(cc)) {
					if (selector.is('select')) list += '<option value="'+cc+'">'+countryData[cc]+'</option>';
				}
			}
		}else if (settings.list === 'timezones') {
			if (typeof body.data('bcTimezones') === 'undefined') body.data('bcTimezones',moment.tz.names());
			var zoneData = body.data('bcTimezones');
			for (var i=0; i<zoneData.length; i++) {
				if (selector.is('select')) list += '<option value="'+zoneData[i]+'">'+zoneData[i]+'</option>';
			}
		}else if (settings.list === 'states') {
			if (typeof body.data('bcStates') === 'undefined') body.data('bcStates',settings.states);
			var stateData = body.data('bcStates');
			for (var abbrev in stateData) {
				if (stateData.hasOwnProperty(abbrev)) {
					if (selector.is('select')) list += '<option value="'+abbrev+'">'+stateData[abbrev]+'</option>';
				}
			}
		}
		selector.append(list);
		if (settings.value !== '') setValue();

	}else if (settings.value !== '') setValue();
};