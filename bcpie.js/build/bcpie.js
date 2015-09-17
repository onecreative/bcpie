//! moment.js
//! version : 2.10.6
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    global.moment = factory()
}(this, function () { 'use strict';

    var hookCallback;

    function utils_hooks__hooks () {
        return hookCallback.apply(null, arguments);
    }

    // This is done to register the method called with moment()
    // without creating circular dependencies.
    function setHookCallback (callback) {
        hookCallback = callback;
    }

    function isArray(input) {
        return Object.prototype.toString.call(input) === '[object Array]';
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

    function create_utc__createUTC (input, format, locale, strict) {
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
            iso             : false
        };
    }

    function getParsingFlags(m) {
        if (m._pf == null) {
            m._pf = defaultParsingFlags();
        }
        return m._pf;
    }

    function valid__isValid(m) {
        if (m._isValid == null) {
            var flags = getParsingFlags(m);
            m._isValid = !isNaN(m._d.getTime()) &&
                flags.overflow < 0 &&
                !flags.empty &&
                !flags.invalidMonth &&
                !flags.invalidWeekday &&
                !flags.nullInput &&
                !flags.invalidFormat &&
                !flags.userInvalidated;

            if (m._strict) {
                m._isValid = m._isValid &&
                    flags.charsLeftOver === 0 &&
                    flags.unusedTokens.length === 0 &&
                    flags.bigHour === undefined;
            }
        }
        return m._isValid;
    }

    function valid__createInvalid (flags) {
        var m = create_utc__createUTC(NaN);
        if (flags != null) {
            extend(getParsingFlags(m), flags);
        }
        else {
            getParsingFlags(m).userInvalidated = true;
        }

        return m;
    }

    var momentProperties = utils_hooks__hooks.momentProperties = [];

    function copyConfig(to, from) {
        var i, prop, val;

        if (typeof from._isAMomentObject !== 'undefined') {
            to._isAMomentObject = from._isAMomentObject;
        }
        if (typeof from._i !== 'undefined') {
            to._i = from._i;
        }
        if (typeof from._f !== 'undefined') {
            to._f = from._f;
        }
        if (typeof from._l !== 'undefined') {
            to._l = from._l;
        }
        if (typeof from._strict !== 'undefined') {
            to._strict = from._strict;
        }
        if (typeof from._tzm !== 'undefined') {
            to._tzm = from._tzm;
        }
        if (typeof from._isUTC !== 'undefined') {
            to._isUTC = from._isUTC;
        }
        if (typeof from._offset !== 'undefined') {
            to._offset = from._offset;
        }
        if (typeof from._pf !== 'undefined') {
            to._pf = getParsingFlags(from);
        }
        if (typeof from._locale !== 'undefined') {
            to._locale = from._locale;
        }

        if (momentProperties.length > 0) {
            for (i in momentProperties) {
                prop = momentProperties[i];
                val = from[prop];
                if (typeof val !== 'undefined') {
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
        // Prevent infinite loop in case updateOffset creates new moment
        // objects.
        if (updateInProgress === false) {
            updateInProgress = true;
            utils_hooks__hooks.updateOffset(this);
            updateInProgress = false;
        }
    }

    function isMoment (obj) {
        return obj instanceof Moment || (obj != null && obj._isAMomentObject != null);
    }

    function absFloor (number) {
        if (number < 0) {
            return Math.ceil(number);
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

    function Locale() {
    }

    var locales = {};
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
        if (!locales[name] && typeof module !== 'undefined' &&
                module && module.exports) {
            try {
                oldLocale = globalLocale._abbr;
                require('./locale/' + name);
                // because defineLocale currently also sets the global locale, we
                // want to undo that for lazy loaded locales
                locale_locales__getSetGlobalLocale(oldLocale);
            } catch (e) { }
        }
        return locales[name];
    }

    // This function will load locale and then set the global locale.  If
    // no arguments are passed in, it will simply return the current global
    // locale key.
    function locale_locales__getSetGlobalLocale (key, values) {
        var data;
        if (key) {
            if (typeof values === 'undefined') {
                data = locale_locales__getLocale(key);
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

    function defineLocale (name, values) {
        if (values !== null) {
            values.abbr = name;
            locales[name] = locales[name] || new Locale();
            locales[name].set(values);

            // backwards compat for now: also set the locale
            locale_locales__getSetGlobalLocale(name);

            return locales[name];
        } else {
            // useful for testing
            delete locales[name];
            return null;
        }
    }

    // returns locale data
    function locale_locales__getLocale (key) {
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

    function makeGetSet (unit, keepTime) {
        return function (value) {
            if (value != null) {
                get_set__set(this, unit, value);
                utils_hooks__hooks.updateOffset(this, keepTime);
                return this;
            } else {
                return get_set__get(this, unit);
            }
        };
    }

    function get_set__get (mom, unit) {
        return mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]();
    }

    function get_set__set (mom, unit, value) {
        return mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);
    }

    // MOMENTS

    function getSet (units, value) {
        var unit;
        if (typeof units === 'object') {
            for (unit in units) {
                this.set(unit, units[unit]);
            }
        } else {
            units = normalizeUnits(units);
            if (typeof this[units] === 'function') {
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

    var formattingTokens = /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Q|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g;

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
            var output = '';
            for (i = 0; i < length; i++) {
                output += array[i] instanceof Function ? array[i].call(mom, format) : array[i];
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
    var match1to3      = /\d{1,3}/;       //       0 - 999
    var match1to4      = /\d{1,4}/;       //       0 - 9999
    var match1to6      = /[+-]?\d{1,6}/;  // -999999 - 999999

    var matchUnsigned  = /\d+/;           //       0 - inf
    var matchSigned    = /[+-]?\d+/;      //    -inf - inf

    var matchOffset    = /Z|[+-]\d\d:?\d\d/gi; // +00:00 -00:00 +0000 -0000 or Z

    var matchTimestamp = /[+-]?\d+(\.\d{1,3})?/; // 123456789 123456789.123

    // any word (or two) characters or numbers including two/three word month in arabic.
    var matchWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i;

    var regexes = {};

    function isFunction (sth) {
        // https://github.com/moment/moment/issues/2325
        return typeof sth === 'function' &&
            Object.prototype.toString.call(sth) === '[object Function]';
    }


    function addRegexToken (token, regex, strictRegex) {
        regexes[token] = isFunction(regex) ? regex : function (isStrict) {
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
        return s.replace('\\', '').replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (matched, p1, p2, p3, p4) {
            return p1 || p2 || p3 || p4;
        }).replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    var tokens = {};

    function addParseToken (token, callback) {
        var i, func = callback;
        if (typeof token === 'string') {
            token = [token];
        }
        if (typeof callback === 'number') {
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

    // PARSING

    addRegexToken('M',    match1to2);
    addRegexToken('MM',   match1to2, match2);
    addRegexToken('MMM',  matchWord);
    addRegexToken('MMMM', matchWord);

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

    var defaultLocaleMonths = 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_');
    function localeMonths (m) {
        return this._months[m.month()];
    }

    var defaultLocaleMonthsShort = 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_');
    function localeMonthsShort (m) {
        return this._monthsShort[m.month()];
    }

    function localeMonthsParse (monthName, format, strict) {
        var i, mom, regex;

        if (!this._monthsParse) {
            this._monthsParse = [];
            this._longMonthsParse = [];
            this._shortMonthsParse = [];
        }

        for (i = 0; i < 12; i++) {
            // make the regex if we don't have it already
            mom = create_utc__createUTC([2000, i]);
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

        // TODO: Move this out of here!
        if (typeof value === 'string') {
            value = mom.localeData().monthsParse(value);
            // TODO: Another silent failure?
            if (typeof value !== 'number') {
                return mom;
            }
        }

        dayOfMonth = Math.min(mom.date(), daysInMonth(mom.year(), value));
        mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'Month'](value, dayOfMonth);
        return mom;
    }

    function getSetMonth (value) {
        if (value != null) {
            setMonth(this, value);
            utils_hooks__hooks.updateOffset(this, true);
            return this;
        } else {
            return get_set__get(this, 'Month');
        }
    }

    function getDaysInMonth () {
        return daysInMonth(this.year(), this.month());
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

            getParsingFlags(m).overflow = overflow;
        }

        return m;
    }

    function warn(msg) {
        if (utils_hooks__hooks.suppressDeprecationWarnings === false && typeof console !== 'undefined' && console.warn) {
            console.warn('Deprecation warning: ' + msg);
        }
    }

    function deprecate(msg, fn) {
        var firstTime = true;

        return extend(function () {
            if (firstTime) {
                warn(msg + '\n' + (new Error()).stack);
                firstTime = false;
            }
            return fn.apply(this, arguments);
        }, fn);
    }

    var deprecations = {};

    function deprecateSimple(name, msg) {
        if (!deprecations[name]) {
            warn(msg);
            deprecations[name] = true;
        }
    }

    utils_hooks__hooks.suppressDeprecationWarnings = false;

    var from_string__isoRegex = /^\s*(?:[+-]\d{6}|\d{4})-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/;

    var isoDates = [
        ['YYYYYY-MM-DD', /[+-]\d{6}-\d{2}-\d{2}/],
        ['YYYY-MM-DD', /\d{4}-\d{2}-\d{2}/],
        ['GGGG-[W]WW-E', /\d{4}-W\d{2}-\d/],
        ['GGGG-[W]WW', /\d{4}-W\d{2}/],
        ['YYYY-DDD', /\d{4}-\d{3}/]
    ];

    // iso time formats and regexes
    var isoTimes = [
        ['HH:mm:ss.SSSS', /(T| )\d\d:\d\d:\d\d\.\d+/],
        ['HH:mm:ss', /(T| )\d\d:\d\d:\d\d/],
        ['HH:mm', /(T| )\d\d:\d\d/],
        ['HH', /(T| )\d\d/]
    ];

    var aspNetJsonRegex = /^\/?Date\((\-?\d+)/i;

    // date from iso format
    function configFromISO(config) {
        var i, l,
            string = config._i,
            match = from_string__isoRegex.exec(string);

        if (match) {
            getParsingFlags(config).iso = true;
            for (i = 0, l = isoDates.length; i < l; i++) {
                if (isoDates[i][1].exec(string)) {
                    config._f = isoDates[i][0];
                    break;
                }
            }
            for (i = 0, l = isoTimes.length; i < l; i++) {
                if (isoTimes[i][1].exec(string)) {
                    // match[6] should be 'T' or space
                    config._f += (match[6] || ' ') + isoTimes[i][0];
                    break;
                }
            }
            if (string.match(matchOffset)) {
                config._f += 'Z';
            }
            configFromStringAndFormat(config);
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
            utils_hooks__hooks.createFromInputFallback(config);
        }
    }

    utils_hooks__hooks.createFromInputFallback = deprecate(
        'moment construction falls back to js Date. This is ' +
        'discouraged and will be removed in upcoming major ' +
        'release. Please refer to ' +
        'https://github.com/moment/moment/issues/1407 for more info.',
        function (config) {
            config._d = new Date(config._i + (config._useUTC ? ' UTC' : ''));
        }
    );

    function createDate (y, m, d, h, M, s, ms) {
        //can't just apply() to create a date:
        //http://stackoverflow.com/questions/181348/instantiating-a-javascript-object-by-calling-prototype-constructor-apply
        var date = new Date(y, m, d, h, M, s, ms);

        //the date constructor doesn't accept years < 1970
        if (y < 1970) {
            date.setFullYear(y);
        }
        return date;
    }

    function createUTCDate (y) {
        var date = new Date(Date.UTC.apply(null, arguments));
        if (y < 1970) {
            date.setUTCFullYear(y);
        }
        return date;
    }

    addFormatToken(0, ['YY', 2], 0, function () {
        return this.year() % 100;
    });

    addFormatToken(0, ['YYYY',   4],       0, 'year');
    addFormatToken(0, ['YYYYY',  5],       0, 'year');
    addFormatToken(0, ['YYYYYY', 6, true], 0, 'year');

    // ALIASES

    addUnitAlias('year', 'y');

    // PARSING

    addRegexToken('Y',      matchSigned);
    addRegexToken('YY',     match1to2, match2);
    addRegexToken('YYYY',   match1to4, match4);
    addRegexToken('YYYYY',  match1to6, match6);
    addRegexToken('YYYYYY', match1to6, match6);

    addParseToken(['YYYYY', 'YYYYYY'], YEAR);
    addParseToken('YYYY', function (input, array) {
        array[YEAR] = input.length === 2 ? utils_hooks__hooks.parseTwoDigitYear(input) : toInt(input);
    });
    addParseToken('YY', function (input, array) {
        array[YEAR] = utils_hooks__hooks.parseTwoDigitYear(input);
    });

    // HELPERS

    function daysInYear(year) {
        return isLeapYear(year) ? 366 : 365;
    }

    function isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }

    // HOOKS

    utils_hooks__hooks.parseTwoDigitYear = function (input) {
        return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
    };

    // MOMENTS

    var getSetYear = makeGetSet('FullYear', false);

    function getIsLeapYear () {
        return isLeapYear(this.year());
    }

    addFormatToken('w', ['ww', 2], 'wo', 'week');
    addFormatToken('W', ['WW', 2], 'Wo', 'isoWeek');

    // ALIASES

    addUnitAlias('week', 'w');
    addUnitAlias('isoWeek', 'W');

    // PARSING

    addRegexToken('w',  match1to2);
    addRegexToken('ww', match1to2, match2);
    addRegexToken('W',  match1to2);
    addRegexToken('WW', match1to2, match2);

    addWeekParseToken(['w', 'ww', 'W', 'WW'], function (input, week, config, token) {
        week[token.substr(0, 1)] = toInt(input);
    });

    // HELPERS

    // firstDayOfWeek       0 = sun, 6 = sat
    //                      the day of the week that starts the week
    //                      (usually sunday or monday)
    // firstDayOfWeekOfYear 0 = sun, 6 = sat
    //                      the first week is the week that contains the first
    //                      of this day of the week
    //                      (eg. ISO weeks use thursday (4))
    function weekOfYear(mom, firstDayOfWeek, firstDayOfWeekOfYear) {
        var end = firstDayOfWeekOfYear - firstDayOfWeek,
            daysToDayOfWeek = firstDayOfWeekOfYear - mom.day(),
            adjustedMoment;


        if (daysToDayOfWeek > end) {
            daysToDayOfWeek -= 7;
        }

        if (daysToDayOfWeek < end - 7) {
            daysToDayOfWeek += 7;
        }

        adjustedMoment = local__createLocal(mom).add(daysToDayOfWeek, 'd');
        return {
            week: Math.ceil(adjustedMoment.dayOfYear() / 7),
            year: adjustedMoment.year()
        };
    }

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

    addFormatToken('DDD', ['DDDD', 3], 'DDDo', 'dayOfYear');

    // ALIASES

    addUnitAlias('dayOfYear', 'DDD');

    // PARSING

    addRegexToken('DDD',  match1to3);
    addRegexToken('DDDD', match3);
    addParseToken(['DDD', 'DDDD'], function (input, array, config) {
        config._dayOfYear = toInt(input);
    });

    // HELPERS

    //http://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
    function dayOfYearFromWeeks(year, week, weekday, firstDayOfWeekOfYear, firstDayOfWeek) {
        var week1Jan = 6 + firstDayOfWeek - firstDayOfWeekOfYear, janX = createUTCDate(year, 0, 1 + week1Jan), d = janX.getUTCDay(), dayOfYear;
        if (d < firstDayOfWeek) {
            d += 7;
        }

        weekday = weekday != null ? 1 * weekday : firstDayOfWeek;

        dayOfYear = 1 + week1Jan + 7 * (week - 1) - d + weekday;

        return {
            year: dayOfYear > 0 ? year : year - 1,
            dayOfYear: dayOfYear > 0 ?  dayOfYear : daysInYear(year - 1) + dayOfYear
        };
    }

    // MOMENTS

    function getSetDayOfYear (input) {
        var dayOfYear = Math.round((this.clone().startOf('day') - this.clone().startOf('year')) / 864e5) + 1;
        return input == null ? dayOfYear : this.add((input - dayOfYear), 'd');
    }

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
        var now = new Date();
        if (config._useUTC) {
            return [now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()];
        }
        return [now.getFullYear(), now.getMonth(), now.getDate()];
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
        if (config._dayOfYear) {
            yearToUse = defaults(config._a[YEAR], currentDate[YEAR]);

            if (config._dayOfYear > daysInYear(yearToUse)) {
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
        var w, weekYear, week, weekday, dow, doy, temp;

        w = config._w;
        if (w.GG != null || w.W != null || w.E != null) {
            dow = 1;
            doy = 4;

            // TODO: We need to take the current isoWeekYear, but that depends on
            // how we interpret now (local, utc, fixed offset). So create
            // a now version of current config (take local/utc/offset flags, and
            // create now).
            weekYear = defaults(w.GG, config._a[YEAR], weekOfYear(local__createLocal(), 1, 4).year);
            week = defaults(w.W, 1);
            weekday = defaults(w.E, 1);
        } else {
            dow = config._locale._week.dow;
            doy = config._locale._week.doy;

            weekYear = defaults(w.gg, config._a[YEAR], weekOfYear(local__createLocal(), dow, doy).year);
            week = defaults(w.w, 1);

            if (w.d != null) {
                // weekday -- low day numbers are considered next week
                weekday = w.d;
                if (weekday < dow) {
                    ++week;
                }
            } else if (w.e != null) {
                // local weekday -- counting starts from begining of week
                weekday = w.e + dow;
            } else {
                // default to begining of week
                weekday = dow;
            }
        }
        temp = dayOfYearFromWeeks(weekYear, week, weekday, doy, dow);

        config._a[YEAR] = temp.year;
        config._dayOfYear = temp.dayOfYear;
    }

    utils_hooks__hooks.ISO_8601 = function () {};

    // date from string and format string
    function configFromStringAndFormat(config) {
        // TODO: Move this to another part of the creation flow to prevent circular deps
        if (config._f === utils_hooks__hooks.ISO_8601) {
            configFromISO(config);
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
        if (getParsingFlags(config).bigHour === true &&
                config._a[HOUR] <= 12 &&
                config._a[HOUR] > 0) {
            getParsingFlags(config).bigHour = undefined;
        }
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

            if (!valid__isValid(tempConfig)) {
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
        config._a = [i.year, i.month, i.day || i.date, i.hour, i.minute, i.second, i.millisecond];

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

        config._locale = config._locale || locale_locales__getLocale(config._l);

        if (input === null || (format === undefined && input === '')) {
            return valid__createInvalid({nullInput: true});
        }

        if (typeof input === 'string') {
            config._i = input = config._locale.preparse(input);
        }

        if (isMoment(input)) {
            return new Moment(checkOverflow(input));
        } else if (isArray(format)) {
            configFromStringAndArray(config);
        } else if (format) {
            configFromStringAndFormat(config);
        } else if (isDate(input)) {
            config._d = input;
        } else {
            configFromInput(config);
        }

        return config;
    }

    function configFromInput(config) {
        var input = config._i;
        if (input === undefined) {
            config._d = new Date();
        } else if (isDate(input)) {
            config._d = new Date(+input);
        } else if (typeof input === 'string') {
            configFromString(config);
        } else if (isArray(input)) {
            config._a = map(input.slice(0), function (obj) {
                return parseInt(obj, 10);
            });
            configFromArray(config);
        } else if (typeof(input) === 'object') {
            configFromObject(config);
        } else if (typeof(input) === 'number') {
            // from milliseconds
            config._d = new Date(input);
        } else {
            utils_hooks__hooks.createFromInputFallback(config);
        }
    }

    function createLocalOrUTC (input, format, locale, strict, isUTC) {
        var c = {};

        if (typeof(locale) === 'boolean') {
            strict = locale;
            locale = undefined;
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

    function local__createLocal (input, format, locale, strict) {
        return createLocalOrUTC(input, format, locale, strict, false);
    }

    var prototypeMin = deprecate(
         'moment().min is deprecated, use moment.min instead. https://github.com/moment/moment/issues/1548',
         function () {
             var other = local__createLocal.apply(null, arguments);
             return other < this ? this : other;
         }
     );

    var prototypeMax = deprecate(
        'moment().max is deprecated, use moment.max instead. https://github.com/moment/moment/issues/1548',
        function () {
            var other = local__createLocal.apply(null, arguments);
            return other > this ? this : other;
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
            return local__createLocal();
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

        // representation for dateAddRemove
        this._milliseconds = +milliseconds +
            seconds * 1e3 + // 1000
            minutes * 6e4 + // 1000 * 60
            hours * 36e5; // 1000 * 60 * 60
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

        this._locale = locale_locales__getLocale();

        this._bubble();
    }

    function isDuration (obj) {
        return obj instanceof Duration;
    }

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

    addRegexToken('Z',  matchOffset);
    addRegexToken('ZZ', matchOffset);
    addParseToken(['Z', 'ZZ'], function (input, array, config) {
        config._useUTC = true;
        config._tzm = offsetFromString(input);
    });

    // HELPERS

    // timezone chunker
    // '+10:00' > ['10',  '00']
    // '-1530'  > ['-15', '30']
    var chunkOffset = /([\+\-]|\d\d)/gi;

    function offsetFromString(string) {
        var matches = ((string || '').match(matchOffset) || []);
        var chunk   = matches[matches.length - 1] || [];
        var parts   = (chunk + '').match(chunkOffset) || ['-', 0, 0];
        var minutes = +(parts[1] * 60) + toInt(parts[2]);

        return parts[0] === '+' ? minutes : -minutes;
    }

    // Return a moment from input, that is local/utc/zone equivalent to model.
    function cloneWithOffset(input, model) {
        var res, diff;
        if (model._isUTC) {
            res = model.clone();
            diff = (isMoment(input) || isDate(input) ? +input : +local__createLocal(input)) - (+res);
            // Use low-level api, because this fn is low-level api.
            res._d.setTime(+res._d + diff);
            utils_hooks__hooks.updateOffset(res, false);
            return res;
        } else {
            return local__createLocal(input).local();
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
    utils_hooks__hooks.updateOffset = function () {};

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
    function getSetOffset (input, keepLocalTime) {
        var offset = this._offset || 0,
            localAdjust;
        if (input != null) {
            if (typeof input === 'string') {
                input = offsetFromString(input);
            }
            if (Math.abs(input) < 16) {
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
                    add_subtract__addSubtract(this, create__createDuration(input - offset, 'm'), 1, false);
                } else if (!this._changeInProgress) {
                    this._changeInProgress = true;
                    utils_hooks__hooks.updateOffset(this, true);
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
        if (this._tzm) {
            this.utcOffset(this._tzm);
        } else if (typeof this._i === 'string') {
            this.utcOffset(offsetFromString(this._i));
        }
        return this;
    }

    function hasAlignedHourOffset (input) {
        input = input ? local__createLocal(input).utcOffset() : 0;

        return (this.utcOffset() - input) % 60 === 0;
    }

    function isDaylightSavingTime () {
        return (
            this.utcOffset() > this.clone().month(0).utcOffset() ||
            this.utcOffset() > this.clone().month(5).utcOffset()
        );
    }

    function isDaylightSavingTimeShifted () {
        if (typeof this._isDSTShifted !== 'undefined') {
            return this._isDSTShifted;
        }

        var c = {};

        copyConfig(c, this);
        c = prepareConfig(c);

        if (c._a) {
            var other = c._isUTC ? create_utc__createUTC(c._a) : local__createLocal(c._a);
            this._isDSTShifted = this.isValid() &&
                compareArrays(c._a, other.toArray()) > 0;
        } else {
            this._isDSTShifted = false;
        }

        return this._isDSTShifted;
    }

    function isLocal () {
        return !this._isUTC;
    }

    function isUtcOffset () {
        return this._isUTC;
    }

    function isUtc () {
        return this._isUTC && this._offset === 0;
    }

    var aspNetRegex = /(\-)?(?:(\d*)\.)?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?)?/;

    // from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
    // somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
    var create__isoRegex = /^(-)?P(?:(?:([0-9,.]*)Y)?(?:([0-9,.]*)M)?(?:([0-9,.]*)D)?(?:T(?:([0-9,.]*)H)?(?:([0-9,.]*)M)?(?:([0-9,.]*)S)?)?|([0-9,.]*)W)$/;

    function create__createDuration (input, key) {
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
        } else if (typeof input === 'number') {
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
                d  : toInt(match[DATE])        * sign,
                h  : toInt(match[HOUR])        * sign,
                m  : toInt(match[MINUTE])      * sign,
                s  : toInt(match[SECOND])      * sign,
                ms : toInt(match[MILLISECOND]) * sign
            };
        } else if (!!(match = create__isoRegex.exec(input))) {
            sign = (match[1] === '-') ? -1 : 1;
            duration = {
                y : parseIso(match[2], sign),
                M : parseIso(match[3], sign),
                d : parseIso(match[4], sign),
                h : parseIso(match[5], sign),
                m : parseIso(match[6], sign),
                s : parseIso(match[7], sign),
                w : parseIso(match[8], sign)
            };
        } else if (duration == null) {// checks for null or undefined
            duration = {};
        } else if (typeof duration === 'object' && ('from' in duration || 'to' in duration)) {
            diffRes = momentsDifference(local__createLocal(duration.from), local__createLocal(duration.to));

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

    create__createDuration.fn = Duration.prototype;

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

    function createAdder(direction, name) {
        return function (val, period) {
            var dur, tmp;
            //invert the arguments, but complain about it
            if (period !== null && !isNaN(+period)) {
                deprecateSimple(name, 'moment().' + name  + '(period, number) is deprecated. Please use moment().' + name + '(number, period).');
                tmp = val; val = period; period = tmp;
            }

            val = typeof val === 'string' ? +val : val;
            dur = create__createDuration(val, period);
            add_subtract__addSubtract(this, dur, direction);
            return this;
        };
    }

    function add_subtract__addSubtract (mom, duration, isAdding, updateOffset) {
        var milliseconds = duration._milliseconds,
            days = duration._days,
            months = duration._months;
        updateOffset = updateOffset == null ? true : updateOffset;

        if (milliseconds) {
            mom._d.setTime(+mom._d + milliseconds * isAdding);
        }
        if (days) {
            get_set__set(mom, 'Date', get_set__get(mom, 'Date') + days * isAdding);
        }
        if (months) {
            setMonth(mom, get_set__get(mom, 'Month') + months * isAdding);
        }
        if (updateOffset) {
            utils_hooks__hooks.updateOffset(mom, days || months);
        }
    }

    var add_subtract__add      = createAdder(1, 'add');
    var add_subtract__subtract = createAdder(-1, 'subtract');

    function moment_calendar__calendar (time, formats) {
        // We want to compare the start of today, vs this.
        // Getting start-of-today depends on whether we're local/utc/offset or not.
        var now = time || local__createLocal(),
            sod = cloneWithOffset(now, this).startOf('day'),
            diff = this.diff(sod, 'days', true),
            format = diff < -6 ? 'sameElse' :
                diff < -1 ? 'lastWeek' :
                diff < 0 ? 'lastDay' :
                diff < 1 ? 'sameDay' :
                diff < 2 ? 'nextDay' :
                diff < 7 ? 'nextWeek' : 'sameElse';
        return this.format(formats && formats[format] || this.localeData().calendar(format, this, local__createLocal(now)));
    }

    function clone () {
        return new Moment(this);
    }

    function isAfter (input, units) {
        var inputMs;
        units = normalizeUnits(typeof units !== 'undefined' ? units : 'millisecond');
        if (units === 'millisecond') {
            input = isMoment(input) ? input : local__createLocal(input);
            return +this > +input;
        } else {
            inputMs = isMoment(input) ? +input : +local__createLocal(input);
            return inputMs < +this.clone().startOf(units);
        }
    }

    function isBefore (input, units) {
        var inputMs;
        units = normalizeUnits(typeof units !== 'undefined' ? units : 'millisecond');
        if (units === 'millisecond') {
            input = isMoment(input) ? input : local__createLocal(input);
            return +this < +input;
        } else {
            inputMs = isMoment(input) ? +input : +local__createLocal(input);
            return +this.clone().endOf(units) < inputMs;
        }
    }

    function isBetween (from, to, units) {
        return this.isAfter(from, units) && this.isBefore(to, units);
    }

    function isSame (input, units) {
        var inputMs;
        units = normalizeUnits(units || 'millisecond');
        if (units === 'millisecond') {
            input = isMoment(input) ? input : local__createLocal(input);
            return +this === +input;
        } else {
            inputMs = +local__createLocal(input);
            return +(this.clone().startOf(units)) <= inputMs && inputMs <= +(this.clone().endOf(units));
        }
    }

    function diff (input, units, asFloat) {
        var that = cloneWithOffset(input, this),
            zoneDelta = (that.utcOffset() - this.utcOffset()) * 6e4,
            delta, output;

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

        return -(wholeMonthDiff + adjust);
    }

    utils_hooks__hooks.defaultFormat = 'YYYY-MM-DDTHH:mm:ssZ';

    function toString () {
        return this.clone().locale('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
    }

    function moment_format__toISOString () {
        var m = this.clone().utc();
        if (0 < m.year() && m.year() <= 9999) {
            if ('function' === typeof Date.prototype.toISOString) {
                // native implementation is ~50x faster, use it when we can
                return this.toDate().toISOString();
            } else {
                return formatMoment(m, 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
            }
        } else {
            return formatMoment(m, 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
        }
    }

    function format (inputString) {
        var output = formatMoment(this, inputString || utils_hooks__hooks.defaultFormat);
        return this.localeData().postformat(output);
    }

    function from (time, withoutSuffix) {
        if (!this.isValid()) {
            return this.localeData().invalidDate();
        }
        return create__createDuration({to: this, from: time}).locale(this.locale()).humanize(!withoutSuffix);
    }

    function fromNow (withoutSuffix) {
        return this.from(local__createLocal(), withoutSuffix);
    }

    function to (time, withoutSuffix) {
        if (!this.isValid()) {
            return this.localeData().invalidDate();
        }
        return create__createDuration({from: this, to: time}).locale(this.locale()).humanize(!withoutSuffix);
    }

    function toNow (withoutSuffix) {
        return this.to(local__createLocal(), withoutSuffix);
    }

    function locale (key) {
        var newLocaleData;

        if (key === undefined) {
            return this._locale._abbr;
        } else {
            newLocaleData = locale_locales__getLocale(key);
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
        return this.startOf(units).add(1, (units === 'isoWeek' ? 'week' : units)).subtract(1, 'ms');
    }

    function to_type__valueOf () {
        return +this._d - ((this._offset || 0) * 60000);
    }

    function unix () {
        return Math.floor(+this / 1000);
    }

    function toDate () {
        return this._offset ? new Date(+this) : this._d;
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

    function moment_valid__isValid () {
        return valid__isValid(this);
    }

    function parsingFlags () {
        return extend({}, getParsingFlags(this));
    }

    function invalidAt () {
        return getParsingFlags(this).overflow;
    }

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
        week[token] = utils_hooks__hooks.parseTwoDigitYear(input);
    });

    // HELPERS

    function weeksInYear(year, dow, doy) {
        return weekOfYear(local__createLocal([year, 11, 31 + dow - doy]), dow, doy).week;
    }

    // MOMENTS

    function getSetWeekYear (input) {
        var year = weekOfYear(this, this.localeData()._week.dow, this.localeData()._week.doy).year;
        return input == null ? year : this.add((input - year), 'y');
    }

    function getSetISOWeekYear (input) {
        var year = weekOfYear(this, 1, 4).year;
        return input == null ? year : this.add((input - year), 'y');
    }

    function getISOWeeksInYear () {
        return weeksInYear(this.year(), 1, 4);
    }

    function getWeeksInYear () {
        var weekInfo = this.localeData()._week;
        return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
    }

    addFormatToken('Q', 0, 0, 'quarter');

    // ALIASES

    addUnitAlias('quarter', 'Q');

    // PARSING

    addRegexToken('Q', match1);
    addParseToken('Q', function (input, array) {
        array[MONTH] = (toInt(input) - 1) * 3;
    });

    // MOMENTS

    function getSetQuarter (input) {
        return input == null ? Math.ceil((this.month() + 1) / 3) : this.month((input - 1) * 3 + this.month() % 3);
    }

    addFormatToken('D', ['DD', 2], 'Do', 'date');

    // ALIASES

    addUnitAlias('date', 'D');

    // PARSING

    addRegexToken('D',  match1to2);
    addRegexToken('DD', match1to2, match2);
    addRegexToken('Do', function (isStrict, locale) {
        return isStrict ? locale._ordinalParse : locale._ordinalParseLenient;
    });

    addParseToken(['D', 'DD'], DATE);
    addParseToken('Do', function (input, array) {
        array[DATE] = toInt(input.match(match1to2)[0], 10);
    });

    // MOMENTS

    var getSetDayOfMonth = makeGetSet('Date', true);

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

    // PARSING

    addRegexToken('d',    match1to2);
    addRegexToken('e',    match1to2);
    addRegexToken('E',    match1to2);
    addRegexToken('dd',   matchWord);
    addRegexToken('ddd',  matchWord);
    addRegexToken('dddd', matchWord);

    addWeekParseToken(['dd', 'ddd', 'dddd'], function (input, week, config) {
        var weekday = config._locale.weekdaysParse(input);
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

    // LOCALES

    var defaultLocaleWeekdays = 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_');
    function localeWeekdays (m) {
        return this._weekdays[m.day()];
    }

    var defaultLocaleWeekdaysShort = 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_');
    function localeWeekdaysShort (m) {
        return this._weekdaysShort[m.day()];
    }

    var defaultLocaleWeekdaysMin = 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_');
    function localeWeekdaysMin (m) {
        return this._weekdaysMin[m.day()];
    }

    function localeWeekdaysParse (weekdayName) {
        var i, mom, regex;

        this._weekdaysParse = this._weekdaysParse || [];

        for (i = 0; i < 7; i++) {
            // make the regex if we don't have it already
            if (!this._weekdaysParse[i]) {
                mom = local__createLocal([2000, 1]).day(i);
                regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
                this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
            }
            // test the regex
            if (this._weekdaysParse[i].test(weekdayName)) {
                return i;
            }
        }
    }

    // MOMENTS

    function getSetDayOfWeek (input) {
        var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
        if (input != null) {
            input = parseWeekday(input, this.localeData());
            return this.add(input - day, 'd');
        } else {
            return day;
        }
    }

    function getSetLocaleDayOfWeek (input) {
        var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
        return input == null ? weekday : this.add(input - weekday, 'd');
    }

    function getSetISODayOfWeek (input) {
        // behaves the same as moment#day except
        // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
        // as a setter, sunday should belong to the previous week.
        return input == null ? this.day() || 7 : this.day(this.day() % 7 ? input : input - 7);
    }

    addFormatToken('H', ['HH', 2], 0, 'hour');
    addFormatToken('h', ['hh', 2], 0, function () {
        return this.hours() % 12 || 12;
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

    // PARSING

    function matchMeridiem (isStrict, locale) {
        return locale._meridiemParse;
    }

    addRegexToken('a',  matchMeridiem);
    addRegexToken('A',  matchMeridiem);
    addRegexToken('H',  match1to2);
    addRegexToken('h',  match1to2);
    addRegexToken('HH', match1to2, match2);
    addRegexToken('hh', match1to2, match2);

    addParseToken(['H', 'HH'], HOUR);
    addParseToken(['a', 'A'], function (input, array, config) {
        config._isPm = config._locale.isPM(input);
        config._meridiem = input;
    });
    addParseToken(['h', 'hh'], function (input, array, config) {
        array[HOUR] = toInt(input);
        getParsingFlags(config).bigHour = true;
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

    addFormatToken('m', ['mm', 2], 0, 'minute');

    // ALIASES

    addUnitAlias('minute', 'm');

    // PARSING

    addRegexToken('m',  match1to2);
    addRegexToken('mm', match1to2, match2);
    addParseToken(['m', 'mm'], MINUTE);

    // MOMENTS

    var getSetMinute = makeGetSet('Minutes', false);

    addFormatToken('s', ['ss', 2], 0, 'second');

    // ALIASES

    addUnitAlias('second', 's');

    // PARSING

    addRegexToken('s',  match1to2);
    addRegexToken('ss', match1to2, match2);
    addParseToken(['s', 'ss'], SECOND);

    // MOMENTS

    var getSetSecond = makeGetSet('Seconds', false);

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

    addFormatToken('z',  0, 0, 'zoneAbbr');
    addFormatToken('zz', 0, 0, 'zoneName');

    // MOMENTS

    function getZoneAbbr () {
        return this._isUTC ? 'UTC' : '';
    }

    function getZoneName () {
        return this._isUTC ? 'Coordinated Universal Time' : '';
    }

    var momentPrototype__proto = Moment.prototype;

    momentPrototype__proto.add          = add_subtract__add;
    momentPrototype__proto.calendar     = moment_calendar__calendar;
    momentPrototype__proto.clone        = clone;
    momentPrototype__proto.diff         = diff;
    momentPrototype__proto.endOf        = endOf;
    momentPrototype__proto.format       = format;
    momentPrototype__proto.from         = from;
    momentPrototype__proto.fromNow      = fromNow;
    momentPrototype__proto.to           = to;
    momentPrototype__proto.toNow        = toNow;
    momentPrototype__proto.get          = getSet;
    momentPrototype__proto.invalidAt    = invalidAt;
    momentPrototype__proto.isAfter      = isAfter;
    momentPrototype__proto.isBefore     = isBefore;
    momentPrototype__proto.isBetween    = isBetween;
    momentPrototype__proto.isSame       = isSame;
    momentPrototype__proto.isValid      = moment_valid__isValid;
    momentPrototype__proto.lang         = lang;
    momentPrototype__proto.locale       = locale;
    momentPrototype__proto.localeData   = localeData;
    momentPrototype__proto.max          = prototypeMax;
    momentPrototype__proto.min          = prototypeMin;
    momentPrototype__proto.parsingFlags = parsingFlags;
    momentPrototype__proto.set          = getSet;
    momentPrototype__proto.startOf      = startOf;
    momentPrototype__proto.subtract     = add_subtract__subtract;
    momentPrototype__proto.toArray      = toArray;
    momentPrototype__proto.toObject     = toObject;
    momentPrototype__proto.toDate       = toDate;
    momentPrototype__proto.toISOString  = moment_format__toISOString;
    momentPrototype__proto.toJSON       = moment_format__toISOString;
    momentPrototype__proto.toString     = toString;
    momentPrototype__proto.unix         = unix;
    momentPrototype__proto.valueOf      = to_type__valueOf;

    // Year
    momentPrototype__proto.year       = getSetYear;
    momentPrototype__proto.isLeapYear = getIsLeapYear;

    // Week Year
    momentPrototype__proto.weekYear    = getSetWeekYear;
    momentPrototype__proto.isoWeekYear = getSetISOWeekYear;

    // Quarter
    momentPrototype__proto.quarter = momentPrototype__proto.quarters = getSetQuarter;

    // Month
    momentPrototype__proto.month       = getSetMonth;
    momentPrototype__proto.daysInMonth = getDaysInMonth;

    // Week
    momentPrototype__proto.week           = momentPrototype__proto.weeks        = getSetWeek;
    momentPrototype__proto.isoWeek        = momentPrototype__proto.isoWeeks     = getSetISOWeek;
    momentPrototype__proto.weeksInYear    = getWeeksInYear;
    momentPrototype__proto.isoWeeksInYear = getISOWeeksInYear;

    // Day
    momentPrototype__proto.date       = getSetDayOfMonth;
    momentPrototype__proto.day        = momentPrototype__proto.days             = getSetDayOfWeek;
    momentPrototype__proto.weekday    = getSetLocaleDayOfWeek;
    momentPrototype__proto.isoWeekday = getSetISODayOfWeek;
    momentPrototype__proto.dayOfYear  = getSetDayOfYear;

    // Hour
    momentPrototype__proto.hour = momentPrototype__proto.hours = getSetHour;

    // Minute
    momentPrototype__proto.minute = momentPrototype__proto.minutes = getSetMinute;

    // Second
    momentPrototype__proto.second = momentPrototype__proto.seconds = getSetSecond;

    // Millisecond
    momentPrototype__proto.millisecond = momentPrototype__proto.milliseconds = getSetMillisecond;

    // Offset
    momentPrototype__proto.utcOffset            = getSetOffset;
    momentPrototype__proto.utc                  = setOffsetToUTC;
    momentPrototype__proto.local                = setOffsetToLocal;
    momentPrototype__proto.parseZone            = setOffsetToParsedOffset;
    momentPrototype__proto.hasAlignedHourOffset = hasAlignedHourOffset;
    momentPrototype__proto.isDST                = isDaylightSavingTime;
    momentPrototype__proto.isDSTShifted         = isDaylightSavingTimeShifted;
    momentPrototype__proto.isLocal              = isLocal;
    momentPrototype__proto.isUtcOffset          = isUtcOffset;
    momentPrototype__proto.isUtc                = isUtc;
    momentPrototype__proto.isUTC                = isUtc;

    // Timezone
    momentPrototype__proto.zoneAbbr = getZoneAbbr;
    momentPrototype__proto.zoneName = getZoneName;

    // Deprecations
    momentPrototype__proto.dates  = deprecate('dates accessor is deprecated. Use date instead.', getSetDayOfMonth);
    momentPrototype__proto.months = deprecate('months accessor is deprecated. Use month instead', getSetMonth);
    momentPrototype__proto.years  = deprecate('years accessor is deprecated. Use year instead', getSetYear);
    momentPrototype__proto.zone   = deprecate('moment().zone is deprecated, use moment().utcOffset instead. https://github.com/moment/moment/issues/1779', getSetZone);

    var momentPrototype = momentPrototype__proto;

    function moment__createUnix (input) {
        return local__createLocal(input * 1000);
    }

    function moment__createInZone () {
        return local__createLocal.apply(null, arguments).parseZone();
    }

    var defaultCalendar = {
        sameDay : '[Today at] LT',
        nextDay : '[Tomorrow at] LT',
        nextWeek : 'dddd [at] LT',
        lastDay : '[Yesterday at] LT',
        lastWeek : '[Last] dddd [at] LT',
        sameElse : 'L'
    };

    function locale_calendar__calendar (key, mom, now) {
        var output = this._calendar[key];
        return typeof output === 'function' ? output.call(mom, now) : output;
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
    var defaultOrdinalParse = /\d{1,2}/;

    function ordinal (number) {
        return this._ordinal.replace('%d', number);
    }

    function preParsePostFormat (string) {
        return string;
    }

    var defaultRelativeTime = {
        future : 'in %s',
        past   : '%s ago',
        s  : 'a few seconds',
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

    function relative__relativeTime (number, withoutSuffix, string, isFuture) {
        var output = this._relativeTime[string];
        return (typeof output === 'function') ?
            output(number, withoutSuffix, string, isFuture) :
            output.replace(/%d/i, number);
    }

    function pastFuture (diff, output) {
        var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
        return typeof format === 'function' ? format(output) : format.replace(/%s/i, output);
    }

    function locale_set__set (config) {
        var prop, i;
        for (i in config) {
            prop = config[i];
            if (typeof prop === 'function') {
                this[i] = prop;
            } else {
                this['_' + i] = prop;
            }
        }
        // Lenient ordinal parsing accepts just a number in addition to
        // number + (possibly) stuff coming from _ordinalParseLenient.
        this._ordinalParseLenient = new RegExp(this._ordinalParse.source + '|' + (/\d{1,2}/).source);
    }

    var prototype__proto = Locale.prototype;

    prototype__proto._calendar       = defaultCalendar;
    prototype__proto.calendar        = locale_calendar__calendar;
    prototype__proto._longDateFormat = defaultLongDateFormat;
    prototype__proto.longDateFormat  = longDateFormat;
    prototype__proto._invalidDate    = defaultInvalidDate;
    prototype__proto.invalidDate     = invalidDate;
    prototype__proto._ordinal        = defaultOrdinal;
    prototype__proto.ordinal         = ordinal;
    prototype__proto._ordinalParse   = defaultOrdinalParse;
    prototype__proto.preparse        = preParsePostFormat;
    prototype__proto.postformat      = preParsePostFormat;
    prototype__proto._relativeTime   = defaultRelativeTime;
    prototype__proto.relativeTime    = relative__relativeTime;
    prototype__proto.pastFuture      = pastFuture;
    prototype__proto.set             = locale_set__set;

    // Month
    prototype__proto.months       =        localeMonths;
    prototype__proto._months      = defaultLocaleMonths;
    prototype__proto.monthsShort  =        localeMonthsShort;
    prototype__proto._monthsShort = defaultLocaleMonthsShort;
    prototype__proto.monthsParse  =        localeMonthsParse;

    // Week
    prototype__proto.week = localeWeek;
    prototype__proto._week = defaultLocaleWeek;
    prototype__proto.firstDayOfYear = localeFirstDayOfYear;
    prototype__proto.firstDayOfWeek = localeFirstDayOfWeek;

    // Day of Week
    prototype__proto.weekdays       =        localeWeekdays;
    prototype__proto._weekdays      = defaultLocaleWeekdays;
    prototype__proto.weekdaysMin    =        localeWeekdaysMin;
    prototype__proto._weekdaysMin   = defaultLocaleWeekdaysMin;
    prototype__proto.weekdaysShort  =        localeWeekdaysShort;
    prototype__proto._weekdaysShort = defaultLocaleWeekdaysShort;
    prototype__proto.weekdaysParse  =        localeWeekdaysParse;

    // Hours
    prototype__proto.isPM = localeIsPM;
    prototype__proto._meridiemParse = defaultLocaleMeridiemParse;
    prototype__proto.meridiem = localeMeridiem;

    function lists__get (format, index, field, setter) {
        var locale = locale_locales__getLocale();
        var utc = create_utc__createUTC().set(setter, index);
        return locale[field](utc, format);
    }

    function list (format, index, field, count, setter) {
        if (typeof format === 'number') {
            index = format;
            format = undefined;
        }

        format = format || '';

        if (index != null) {
            return lists__get(format, index, field, setter);
        }

        var i;
        var out = [];
        for (i = 0; i < count; i++) {
            out[i] = lists__get(format, i, field, setter);
        }
        return out;
    }

    function lists__listMonths (format, index) {
        return list(format, index, 'months', 12, 'month');
    }

    function lists__listMonthsShort (format, index) {
        return list(format, index, 'monthsShort', 12, 'month');
    }

    function lists__listWeekdays (format, index) {
        return list(format, index, 'weekdays', 7, 'day');
    }

    function lists__listWeekdaysShort (format, index) {
        return list(format, index, 'weekdaysShort', 7, 'day');
    }

    function lists__listWeekdaysMin (format, index) {
        return list(format, index, 'weekdaysMin', 7, 'day');
    }

    locale_locales__getSetGlobalLocale('en', {
        ordinalParse: /\d{1,2}(th|st|nd|rd)/,
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
    utils_hooks__hooks.lang = deprecate('moment.lang is deprecated. Use moment.locale instead.', locale_locales__getSetGlobalLocale);
    utils_hooks__hooks.langData = deprecate('moment.langData is deprecated. Use moment.localeData instead.', locale_locales__getLocale);

    var mathAbs = Math.abs;

    function duration_abs__abs () {
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

    function duration_add_subtract__addSubtract (duration, input, value, direction) {
        var other = create__createDuration(input, value);

        duration._milliseconds += direction * other._milliseconds;
        duration._days         += direction * other._days;
        duration._months       += direction * other._months;

        return duration._bubble();
    }

    // supports only 2.0-style add(1, 's') or add(duration)
    function duration_add_subtract__add (input, value) {
        return duration_add_subtract__addSubtract(this, input, value, 1);
    }

    // supports only 2.0-style subtract(1, 's') or subtract(duration)
    function duration_add_subtract__subtract (input, value) {
        return duration_add_subtract__addSubtract(this, input, value, -1);
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
    function duration_as__valueOf () {
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

    function duration_get__get (units) {
        units = normalizeUnits(units);
        return this[units + 's']();
    }

    function makeGetter(name) {
        return function () {
            return this._data[name];
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
        s: 45,  // seconds to minute
        m: 45,  // minutes to hour
        h: 22,  // hours to day
        d: 26,  // days to month
        M: 11   // months to year
    };

    // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
    function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {
        return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
    }

    function duration_humanize__relativeTime (posNegDuration, withoutSuffix, locale) {
        var duration = create__createDuration(posNegDuration).abs();
        var seconds  = round(duration.as('s'));
        var minutes  = round(duration.as('m'));
        var hours    = round(duration.as('h'));
        var days     = round(duration.as('d'));
        var months   = round(duration.as('M'));
        var years    = round(duration.as('y'));

        var a = seconds < thresholds.s && ['s', seconds]  ||
                minutes === 1          && ['m']           ||
                minutes < thresholds.m && ['mm', minutes] ||
                hours   === 1          && ['h']           ||
                hours   < thresholds.h && ['hh', hours]   ||
                days    === 1          && ['d']           ||
                days    < thresholds.d && ['dd', days]    ||
                months  === 1          && ['M']           ||
                months  < thresholds.M && ['MM', months]  ||
                years   === 1          && ['y']           || ['yy', years];

        a[2] = withoutSuffix;
        a[3] = +posNegDuration > 0;
        a[4] = locale;
        return substituteTimeAgo.apply(null, a);
    }

    // This function allows you to set a threshold for relative time strings
    function duration_humanize__getSetRelativeTimeThreshold (threshold, limit) {
        if (thresholds[threshold] === undefined) {
            return false;
        }
        if (limit === undefined) {
            return thresholds[threshold];
        }
        thresholds[threshold] = limit;
        return true;
    }

    function humanize (withSuffix) {
        var locale = this.localeData();
        var output = duration_humanize__relativeTime(this, !withSuffix, locale);

        if (withSuffix) {
            output = locale.pastFuture(+this, output);
        }

        return locale.postformat(output);
    }

    var iso_string__abs = Math.abs;

    function iso_string__toISOString() {
        // for ISO strings we do not use the normal bubbling rules:
        //  * milliseconds bubble up until they become hours
        //  * days do not bubble at all
        //  * months bubble up until they become years
        // This is because there is no context-free conversion between hours and days
        // (think of clock changes)
        // and also not between days and months (28-31 days per month)
        var seconds = iso_string__abs(this._milliseconds) / 1000;
        var days         = iso_string__abs(this._days);
        var months       = iso_string__abs(this._months);
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

    var duration_prototype__proto = Duration.prototype;

    duration_prototype__proto.abs            = duration_abs__abs;
    duration_prototype__proto.add            = duration_add_subtract__add;
    duration_prototype__proto.subtract       = duration_add_subtract__subtract;
    duration_prototype__proto.as             = as;
    duration_prototype__proto.asMilliseconds = asMilliseconds;
    duration_prototype__proto.asSeconds      = asSeconds;
    duration_prototype__proto.asMinutes      = asMinutes;
    duration_prototype__proto.asHours        = asHours;
    duration_prototype__proto.asDays         = asDays;
    duration_prototype__proto.asWeeks        = asWeeks;
    duration_prototype__proto.asMonths       = asMonths;
    duration_prototype__proto.asYears        = asYears;
    duration_prototype__proto.valueOf        = duration_as__valueOf;
    duration_prototype__proto._bubble        = bubble;
    duration_prototype__proto.get            = duration_get__get;
    duration_prototype__proto.milliseconds   = milliseconds;
    duration_prototype__proto.seconds        = seconds;
    duration_prototype__proto.minutes        = minutes;
    duration_prototype__proto.hours          = hours;
    duration_prototype__proto.days           = days;
    duration_prototype__proto.weeks          = weeks;
    duration_prototype__proto.months         = months;
    duration_prototype__proto.years          = years;
    duration_prototype__proto.humanize       = humanize;
    duration_prototype__proto.toISOString    = iso_string__toISOString;
    duration_prototype__proto.toString       = iso_string__toISOString;
    duration_prototype__proto.toJSON         = iso_string__toISOString;
    duration_prototype__proto.locale         = locale;
    duration_prototype__proto.localeData     = localeData;

    // Deprecations
    duration_prototype__proto.toIsoString = deprecate('toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)', iso_string__toISOString);
    duration_prototype__proto.lang = lang;

    // Side effect imports

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


    utils_hooks__hooks.version = '2.10.6';

    setHookCallback(local__createLocal);

    utils_hooks__hooks.fn                    = momentPrototype;
    utils_hooks__hooks.min                   = min;
    utils_hooks__hooks.max                   = max;
    utils_hooks__hooks.utc                   = create_utc__createUTC;
    utils_hooks__hooks.unix                  = moment__createUnix;
    utils_hooks__hooks.months                = lists__listMonths;
    utils_hooks__hooks.isDate                = isDate;
    utils_hooks__hooks.locale                = locale_locales__getSetGlobalLocale;
    utils_hooks__hooks.invalid               = valid__createInvalid;
    utils_hooks__hooks.duration              = create__createDuration;
    utils_hooks__hooks.isMoment              = isMoment;
    utils_hooks__hooks.weekdays              = lists__listWeekdays;
    utils_hooks__hooks.parseZone             = moment__createInZone;
    utils_hooks__hooks.localeData            = locale_locales__getLocale;
    utils_hooks__hooks.isDuration            = isDuration;
    utils_hooks__hooks.monthsShort           = lists__listMonthsShort;
    utils_hooks__hooks.weekdaysMin           = lists__listWeekdaysMin;
    utils_hooks__hooks.defineLocale          = defineLocale;
    utils_hooks__hooks.weekdaysShort         = lists__listWeekdaysShort;
    utils_hooks__hooks.normalizeUnits        = normalizeUnits;
    utils_hooks__hooks.relativeTimeThreshold = duration_humanize__getSetRelativeTimeThreshold;

    var _moment = utils_hooks__hooks;

    return _moment;

}));
//! moment-timezone.js
//! version : 0.4.0
//! author : Tim Wood
//! license : MIT
//! github.com/moment/moment-timezone

(function (root, factory) {
	"use strict";

	/*global define*/
	if (typeof define === 'function' && define.amd) {
		define(['moment'], factory);                 // AMD
	} else if (typeof exports === 'object') {
		module.exports = factory(require('moment')); // Node
	} else {
		factory(root.moment);                        // Browser
	}
}(this, function (moment) {
	"use strict";

	// Do not load moment-timezone a second time.
	if (moment.tz !== undefined) {
		logError('Moment Timezone ' + moment.tz.version + ' was already loaded ' + (moment.tz.dataVersion ? 'with data from ' : 'without any data') + moment.tz.dataVersion);
		return moment;
	}

	var VERSION = "0.4.0",
		zones = {},
		links = {},
		names = {},

		momentVersion = moment.version.split('.'),
		major = +momentVersion[0],
		minor = +momentVersion[1];

	// Moment.js version check
	if (major < 2 || (major === 2 && minor < 6)) {
		logError('Moment Timezone requires Moment.js >= 2.6.0. You are using Moment.js ' + moment.version + '. See momentjs.com');
	}

	/************************************
		Unpacking
	************************************/

	function charCodeToInt(charCode) {
		if (charCode > 96) {
			return charCode - 87;
		} else if (charCode > 64) {
			return charCode - 29;
		}
		return charCode - 48;
	}

	function unpackBase60(string) {
		var i = 0,
			parts = string.split('.'),
			whole = parts[0],
			fractional = parts[1] || '',
			multiplier = 1,
			num,
			out = 0,
			sign = 1;

		// handle negative numbers
		if (string.charCodeAt(0) === 45) {
			i = 1;
			sign = -1;
		}

		// handle digits before the decimal
		for (i; i < whole.length; i++) {
			num = charCodeToInt(whole.charCodeAt(i));
			out = 60 * out + num;
		}

		// handle digits after the decimal
		for (i = 0; i < fractional.length; i++) {
			multiplier = multiplier / 60;
			num = charCodeToInt(fractional.charCodeAt(i));
			out += num * multiplier;
		}

		return out * sign;
	}

	function arrayToInt (array) {
		for (var i = 0; i < array.length; i++) {
			array[i] = unpackBase60(array[i]);
		}
	}

	function intToUntil (array, length) {
		for (var i = 0; i < length; i++) {
			array[i] = Math.round((array[i - 1] || 0) + (array[i] * 60000)); // minutes to milliseconds
		}

		array[length - 1] = Infinity;
	}

	function mapIndices (source, indices) {
		var out = [], i;

		for (i = 0; i < indices.length; i++) {
			out[i] = source[indices[i]];
		}

		return out;
	}

	function unpack (string) {
		var data = string.split('|'),
			offsets = data[2].split(' '),
			indices = data[3].split(''),
			untils  = data[4].split(' ');

		arrayToInt(offsets);
		arrayToInt(indices);
		arrayToInt(untils);

		intToUntil(untils, indices.length);

		return {
			name    : data[0],
			abbrs   : mapIndices(data[1].split(' '), indices),
			offsets : mapIndices(offsets, indices),
			untils  : untils
		};
	}

	/************************************
		Zone object
	************************************/

	function Zone (packedString) {
		if (packedString) {
			this._set(unpack(packedString));
		}
	}

	Zone.prototype = {
		_set : function (unpacked) {
			this.name    = unpacked.name;
			this.abbrs   = unpacked.abbrs;
			this.untils  = unpacked.untils;
			this.offsets = unpacked.offsets;
		},

		_index : function (timestamp) {
			var target = +timestamp,
				untils = this.untils,
				i;

			for (i = 0; i < untils.length; i++) {
				if (target < untils[i]) {
					return i;
				}
			}
		},

		parse : function (timestamp) {
			var target  = +timestamp,
				offsets = this.offsets,
				untils  = this.untils,
				max     = untils.length - 1,
				offset, offsetNext, offsetPrev, i;

			for (i = 0; i < max; i++) {
				offset     = offsets[i];
				offsetNext = offsets[i + 1];
				offsetPrev = offsets[i ? i - 1 : i];

				if (offset < offsetNext && tz.moveAmbiguousForward) {
					offset = offsetNext;
				} else if (offset > offsetPrev && tz.moveInvalidForward) {
					offset = offsetPrev;
				}

				if (target < untils[i] - (offset * 60000)) {
					return offsets[i];
				}
			}

			return offsets[max];
		},

		abbr : function (mom) {
			return this.abbrs[this._index(mom)];
		},

		offset : function (mom) {
			return this.offsets[this._index(mom)];
		}
	};

	/************************************
		Global Methods
	************************************/

	function normalizeName (name) {
		return (name || '').toLowerCase().replace(/\//g, '_');
	}

	function addZone (packed) {
		var i, name, normalized;

		if (typeof packed === "string") {
			packed = [packed];
		}

		for (i = 0; i < packed.length; i++) {
			name = packed[i].split('|')[0];
			normalized = normalizeName(name);
			zones[normalized] = packed[i];
			names[normalized] = name;
		}
	}

	function getZone (name, caller) {
		name = normalizeName(name);

		var zone = zones[name];
		var link;
		
		if (zone instanceof Zone) {
			return zone;
		}

		if (typeof zone === 'string') {
			zone = new Zone(zone);
			zones[name] = zone;
			return zone;
		}

		// Pass getZone to prevent recursion more than 1 level deep
		if (links[name] && caller !== getZone && (link = getZone(links[name], getZone))) {
			zone = zones[name] = new Zone();
			zone._set(link);
			zone.name = names[name];
			return zone;
		}

		return null;
	}

	function getNames () {
		var i, out = [];

		for (i in names) {
			if (names.hasOwnProperty(i) && (zones[i] || zones[links[i]]) && names[i]) {
				out.push(names[i]);
			}
		}

		return out.sort();
	}

	function addLink (aliases) {
		var i, alias, normal0, normal1;

		if (typeof aliases === "string") {
			aliases = [aliases];
		}

		for (i = 0; i < aliases.length; i++) {
			alias = aliases[i].split('|');

			normal0 = normalizeName(alias[0]);
			normal1 = normalizeName(alias[1]);

			links[normal0] = normal1;
			names[normal0] = alias[0];

			links[normal1] = normal0;
			names[normal1] = alias[1];
		}
	}

	function loadData (data) {
		addZone(data.zones);
		addLink(data.links);
		tz.dataVersion = data.version;
	}

	function zoneExists (name) {
		if (!zoneExists.didShowError) {
			zoneExists.didShowError = true;
				logError("moment.tz.zoneExists('" + name + "') has been deprecated in favor of !moment.tz.zone('" + name + "')");
		}
		return !!getZone(name);
	}

	function needsOffset (m) {
		return !!(m._a && (m._tzm === undefined));
	}

	function logError (message) {
		if (typeof console !== 'undefined' && typeof console.error === 'function') {
			console.error(message);
		}
	}

	/************************************
		moment.tz namespace
	************************************/

	function tz (input) {
		var args = Array.prototype.slice.call(arguments, 0, -1),
			name = arguments[arguments.length - 1],
			zone = getZone(name),
			out  = moment.utc.apply(null, args);

		if (zone && !moment.isMoment(input) && needsOffset(out)) {
			out.add(zone.parse(out), 'minutes');
		}

		out.tz(name);

		return out;
	}

	tz.version      = VERSION;
	tz.dataVersion  = '';
	tz._zones       = zones;
	tz._links       = links;
	tz._names       = names;
	tz.add          = addZone;
	tz.link         = addLink;
	tz.load         = loadData;
	tz.zone         = getZone;
	tz.zoneExists   = zoneExists; // deprecated in 0.1.0
	tz.names        = getNames;
	tz.Zone         = Zone;
	tz.unpack       = unpack;
	tz.unpackBase60 = unpackBase60;
	tz.needsOffset  = needsOffset;
	tz.moveInvalidForward   = true;
	tz.moveAmbiguousForward = false;

	/************************************
		Interface with Moment.js
	************************************/

	var fn = moment.fn;

	moment.tz = tz;

	moment.defaultZone = null;

	moment.updateOffset = function (mom, keepTime) {
		var zone = moment.defaultZone,
			offset;

		if (mom._z === undefined) {
			if (zone && needsOffset(mom) && !mom._isUTC) {
				mom._d = moment.utc(mom._a)._d;
				mom.utc().add(zone.parse(mom), 'minutes');
			}
			mom._z = zone;
		}
		if (mom._z) {
			offset = mom._z.offset(mom);
			if (Math.abs(offset) < 16) {
				offset = offset / 60;
			}
			if (mom.utcOffset !== undefined) {
				mom.utcOffset(-offset, keepTime);
			} else {
				mom.zone(offset, keepTime);
			}
		}
	};

	fn.tz = function (name) {
		if (name) {
			this._z = getZone(name);
			if (this._z) {
				moment.updateOffset(this);
			} else {
				logError("Moment Timezone has no data for " + name + ". See http://momentjs.com/timezone/docs/#/data-loading/.");
			}
			return this;
		}
		if (this._z) { return this._z.name; }
	};

	function abbrWrap (old) {
		return function () {
			if (this._z) { return this._z.abbr(this); }
			return old.call(this);
		};
	}

	function resetZoneWrap (old) {
		return function () {
			this._z = null;
			return old.apply(this, arguments);
		};
	}

	fn.zoneName = abbrWrap(fn.zoneName);
	fn.zoneAbbr = abbrWrap(fn.zoneAbbr);
	fn.utc      = resetZoneWrap(fn.utc);

	moment.tz.setDefault = function(name) {
		if (major < 2 || (major === 2 && minor < 9)) {
			logError('Moment Timezone setDefault() requires Moment.js >= 2.9.0. You are using Moment.js ' + moment.version + '.');
		}
		moment.defaultZone = name ? getZone(name) : null;
		return moment;
	};

	// Cloning a moment should include the _z property.
	var momentProperties = moment.momentProperties;
	if (Object.prototype.toString.call(momentProperties) === '[object Array]') {
		// moment 2.8.1+
		momentProperties.push('_z');
		momentProperties.push('_a');
	} else if (momentProperties) {
		// moment 2.7.0
		momentProperties._z = null;
	}

	loadData({
		"version": "2015d",
		"zones": [
			"Africa/Abidjan|GMT|0|0|",
			"Africa/Addis_Ababa|EAT|-30|0|",
			"Africa/Algiers|CET|-10|0|",
			"Africa/Bangui|WAT|-10|0|",
			"Africa/Blantyre|CAT|-20|0|",
			"Africa/Cairo|EET EEST|-20 -30|010101010|1Cby0 Fb0 c10 8n0 8Nd0 gL0 e10 mn0",
			"Africa/Casablanca|WET WEST|0 -10|01010101010101010101010101010101010101010|1Cco0 Db0 1zd0 Lz0 1Nf0 wM0 co0 go0 1o00 s00 dA0 vc0 11A0 A00 e00 y00 11A0 uo0 e00 DA0 11A0 rA0 e00 Jc0 WM0 m00 gM0 M00 WM0 jc0 e00 RA0 11A0 dA0 e00 Uo0 11A0 800 gM0 Xc0",
			"Africa/Ceuta|CET CEST|-10 -20|01010101010101010101010|1BWp0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00",
			"Africa/Johannesburg|SAST|-20|0|",
			"Africa/Tripoli|EET CET CEST|-20 -10 -20|0120|1IlA0 TA0 1o00",
			"Africa/Windhoek|WAST WAT|-20 -10|01010101010101010101010|1C1c0 11B0 1nX0 11B0 1nX0 11B0 1qL0 WN0 1qL0 11B0 1nX0 11B0 1nX0 11B0 1nX0 11B0 1nX0 11B0 1qL0 WN0 1qL0 11B0",
			"America/Adak|HST HDT|a0 90|01010101010101010101010|1BR00 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0",
			"America/Anchorage|AKST AKDT|90 80|01010101010101010101010|1BQX0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0",
			"America/Anguilla|AST|40|0|",
			"America/Araguaina|BRT BRST|30 20|010|1IdD0 Lz0",
			"America/Argentina/Buenos_Aires|ART|30|0|",
			"America/Asuncion|PYST PYT|30 40|01010101010101010101010|1C430 1a10 1fz0 1a10 1fz0 1cN0 17b0 1ip0 17b0 1ip0 17b0 1ip0 19X0 1fB0 19X0 1fB0 19X0 1ip0 17b0 1ip0 17b0 1ip0",
			"America/Atikokan|EST|50|0|",
			"America/Bahia|BRT BRST|30 20|010|1FJf0 Rb0",
			"America/Bahia_Banderas|MST CDT CST|70 50 60|01212121212121212121212|1C1l0 1nW0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0",
			"America/Belem|BRT|30|0|",
			"America/Belize|CST|60|0|",
			"America/Boa_Vista|AMT|40|0|",
			"America/Bogota|COT|50|0|",
			"America/Boise|MST MDT|70 60|01010101010101010101010|1BQV0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0",
			"America/Campo_Grande|AMST AMT|30 40|01010101010101010101010|1BIr0 1zd0 On0 1zd0 Rb0 1zd0 Lz0 1C10 Lz0 1C10 On0 1zd0 On0 1zd0 On0 1zd0 On0 1C10 Lz0 1C10 Lz0 1C10",
			"America/Cancun|CST CDT EST|60 50 50|010101010102|1C1k0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 Dd0",
			"America/Caracas|VET|4u|0|",
			"America/Cayenne|GFT|30|0|",
			"America/Chicago|CST CDT|60 50|01010101010101010101010|1BQU0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0",
			"America/Chihuahua|MST MDT|70 60|01010101010101010101010|1C1l0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0",
			"America/Creston|MST|70|0|",
			"America/Dawson|PST PDT|80 70|01010101010101010101010|1BQW0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0",
			"America/Detroit|EST EDT|50 40|01010101010101010101010|1BQT0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0",
			"America/Eirunepe|AMT ACT|40 50|01|1KLE0",
			"America/Glace_Bay|AST ADT|40 30|01010101010101010101010|1BQS0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0",
			"America/Godthab|WGT WGST|30 20|01010101010101010101010|1BWp0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00",
			"America/Goose_Bay|AST ADT|40 30|01010101010101010101010|1BQQ1 1zb0 Op0 1zcX Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0",
			"America/Grand_Turk|EST EDT AST|50 40 40|0101010101012|1BQT0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0",
			"America/Guayaquil|ECT|50|0|",
			"America/Guyana|GYT|40|0|",
			"America/Havana|CST CDT|50 40|01010101010101010101010|1BQR0 1wo0 U00 1zc0 U00 1qM0 Oo0 1zc0 Oo0 1zc0 Oo0 1zc0 Rc0 1zc0 Oo0 1zc0 Oo0 1zc0 Oo0 1zc0 Oo0 1zc0",
			"America/La_Paz|BOT|40|0|",
			"America/Lima|PET|50|0|",
			"America/Merida|CST CDT|60 50|01010101010101010101010|1C1k0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0",
			"America/Metlakatla|PST|80|0|",
			"America/Miquelon|PMST PMDT|30 20|01010101010101010101010|1BQR0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0",
			"America/Montevideo|UYST UYT|20 30|01010101010101010101010|1BQQ0 1ld0 14n0 1ld0 14n0 1o10 11z0 1o10 11z0 1o10 11z0 1o10 14n0 1ld0 14n0 1ld0 14n0 1o10 11z0 1o10 11z0 1o10",
			"America/Noronha|FNT|20|0|",
			"America/North_Dakota/Beulah|MST MDT CST CDT|70 60 60 50|01232323232323232323232|1BQV0 1zb0 Oo0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0",
			"America/Paramaribo|SRT|30|0|",
			"America/Port-au-Prince|EST EDT|50 40|0101010101010101010|1GI70 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0",
			"America/Santa_Isabel|PST PDT|80 70|01010101010101010101010|1C1m0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0",
			"America/Santiago|CLST CLT CLT|30 40 30|010101010102|1C1f0 1fB0 1nX0 G10 1EL0 Op0 1zb0 Rd0 1wn0 Rd0 1wn0",
			"America/Sao_Paulo|BRST BRT|20 30|01010101010101010101010|1BIq0 1zd0 On0 1zd0 Rb0 1zd0 Lz0 1C10 Lz0 1C10 On0 1zd0 On0 1zd0 On0 1zd0 On0 1C10 Lz0 1C10 Lz0 1C10",
			"America/Scoresbysund|EGT EGST|10 0|01010101010101010101010|1BWp0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00",
			"America/St_Johns|NST NDT|3u 2u|01010101010101010101010|1BQPv 1zb0 Op0 1zcX Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0",
			"Antarctica/Casey|CAST AWST|-b0 -80|0101|1BN30 40P0 KL0",
			"Antarctica/Davis|DAVT DAVT|-50 -70|0101|1BPw0 3Wn0 KN0",
			"Antarctica/DumontDUrville|DDUT|-a0|0|",
			"Antarctica/Macquarie|AEDT MIST|-b0 -b0|01|1C140",
			"Antarctica/Mawson|MAWT|-50|0|",
			"Antarctica/McMurdo|NZDT NZST|-d0 -c0|01010101010101010101010|1C120 1a00 1fA0 1a00 1fA0 1cM0 1fA0 1a00 1fA0 1a00 1fA0 1a00 1fA0 1a00 1fA0 1a00 1fA0 1cM0 1fA0 1a00 1fA0 1a00",
			"Antarctica/Rothera|ROTT|30|0|",
			"Antarctica/Syowa|SYOT|-30|0|",
			"Antarctica/Troll|UTC CEST|0 -20|01010101010101010101010|1BWp0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00",
			"Antarctica/Vostok|VOST|-60|0|",
			"Asia/Aden|AST|-30|0|",
			"Asia/Almaty|ALMT|-60|0|",
			"Asia/Amman|EET EEST|-20 -30|010101010101010101010|1BVy0 1qM0 11A0 1o00 11A0 4bX0 Dd0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0",
			"Asia/Anadyr|ANAT ANAST ANAT|-c0 -c0 -b0|0120|1BWe0 1qN0 WM0",
			"Asia/Aqtau|AQTT|-50|0|",
			"Asia/Ashgabat|TMT|-50|0|",
			"Asia/Baku|AZT AZST|-40 -50|01010101010101010101010|1BWo0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00",
			"Asia/Bangkok|ICT|-70|0|",
			"Asia/Beirut|EET EEST|-20 -30|01010101010101010101010|1BWm0 1qL0 WN0 1qL0 WN0 1qL0 11B0 1nX0 11B0 1nX0 11B0 1nX0 11B0 1qL0 WN0 1qL0 WN0 1qL0 11B0 1nX0 11B0 1nX0",
			"Asia/Bishkek|KGT|-60|0|",
			"Asia/Brunei|BNT|-80|0|",
			"Asia/Calcutta|IST|-5u|0|",
			"Asia/Chita|YAKT YAKST YAKT IRKT|-90 -a0 -a0 -80|01023|1BWh0 1qM0 WM0 8Hz0",
			"Asia/Choibalsan|CHOT CHOST|-80 -90|0101010101010|1O8G0 1cJ0 1cP0 1cJ0 1cP0 1fx0 1cP0 1cJ0 1cP0 1cJ0 1cP0 1cJ0",
			"Asia/Chongqing|CST|-80|0|",
			"Asia/Dacca|BDT|-60|0|",
			"Asia/Damascus|EET EEST|-20 -30|01010101010101010101010|1C0m0 1nX0 11B0 1nX0 11B0 1nX0 11B0 1nX0 11B0 1qL0 WN0 1qL0 WN0 1qL0 11B0 1nX0 11B0 1nX0 11B0 1nX0 11B0 1qL0",
			"Asia/Dili|TLT|-90|0|",
			"Asia/Dubai|GST|-40|0|",
			"Asia/Dushanbe|TJT|-50|0|",
			"Asia/Gaza|EET EEST|-20 -30|01010101010101010101010|1BVW1 SKX 1xd1 MKX 1AN0 1a00 1fA0 1cL0 1cN0 1nX0 1210 1nz0 1210 1nz0 14N0 1nz0 1210 1nz0 1210 1nz0 1210 1nz0",
			"Asia/Hebron|EET EEST|-20 -30|0101010101010101010101010|1BVy0 Tb0 1xd1 MKX bB0 cn0 1cN0 1a00 1fA0 1cL0 1cN0 1nX0 1210 1nz0 1210 1nz0 14N0 1nz0 1210 1nz0 1210 1nz0 1210 1nz0",
			"Asia/Hong_Kong|HKT|-80|0|",
			"Asia/Hovd|HOVT HOVST|-70 -80|0101010101010|1O8H0 1cJ0 1cP0 1cJ0 1cP0 1fx0 1cP0 1cJ0 1cP0 1cJ0 1cP0 1cJ0",
			"Asia/Irkutsk|IRKT IRKST IRKT|-80 -90 -90|01020|1BWi0 1qM0 WM0 8Hz0",
			"Asia/Istanbul|EET EEST|-20 -30|01010101010101010101010|1BWp0 1qM0 Xc0 1qo0 WM0 1qM0 11A0 1o00 1200 1nA0 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00",
			"Asia/Jakarta|WIB|-70|0|",
			"Asia/Jayapura|WIT|-90|0|",
			"Asia/Jerusalem|IST IDT|-20 -30|01010101010101010101010|1BVA0 17X0 1kp0 1dz0 1c10 1aL0 1eN0 1oL0 10N0 1oL0 10N0 1oL0 10N0 1rz0 W10 1rz0 W10 1rz0 10N0 1oL0 10N0 1oL0",
			"Asia/Kabul|AFT|-4u|0|",
			"Asia/Kamchatka|PETT PETST PETT|-c0 -c0 -b0|0120|1BWe0 1qN0 WM0",
			"Asia/Karachi|PKT|-50|0|",
			"Asia/Kashgar|XJT|-60|0|",
			"Asia/Kathmandu|NPT|-5J|0|",
			"Asia/Khandyga|VLAT VLAST VLAT YAKT YAKT|-a0 -b0 -b0 -a0 -90|010234|1BWg0 1qM0 WM0 17V0 7zD0",
			"Asia/Krasnoyarsk|KRAT KRAST KRAT|-70 -80 -80|01020|1BWj0 1qM0 WM0 8Hz0",
			"Asia/Kuala_Lumpur|MYT|-80|0|",
			"Asia/Magadan|MAGT MAGST MAGT MAGT|-b0 -c0 -c0 -a0|01023|1BWf0 1qM0 WM0 8Hz0",
			"Asia/Makassar|WITA|-80|0|",
			"Asia/Manila|PHT|-80|0|",
			"Asia/Nicosia|EET EEST|-20 -30|01010101010101010101010|1BWp0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00",
			"Asia/Novokuznetsk|KRAT NOVST NOVT NOVT|-70 -70 -60 -70|01230|1BWj0 1qN0 WM0 8Hz0",
			"Asia/Novosibirsk|NOVT NOVST NOVT|-60 -70 -70|01020|1BWk0 1qM0 WM0 8Hz0",
			"Asia/Omsk|OMST OMSST OMST|-60 -70 -70|01020|1BWk0 1qM0 WM0 8Hz0",
			"Asia/Oral|ORAT|-50|0|",
			"Asia/Pyongyang|KST|-90|0|",
			"Asia/Qyzylorda|QYZT|-60|0|",
			"Asia/Rangoon|MMT|-6u|0|",
			"Asia/Sakhalin|SAKT SAKST SAKT|-a0 -b0 -b0|01020|1BWg0 1qM0 WM0 8Hz0",
			"Asia/Samarkand|UZT|-50|0|",
			"Asia/Singapore|SGT|-80|0|",
			"Asia/Srednekolymsk|MAGT MAGST MAGT SRET|-b0 -c0 -c0 -b0|01023|1BWf0 1qM0 WM0 8Hz0",
			"Asia/Tbilisi|GET|-40|0|",
			"Asia/Tehran|IRST IRDT|-3u -4u|01010101010101010101010|1BTUu 1dz0 1cp0 1dz0 1cp0 1dz0 1cN0 1dz0 1cp0 1dz0 1cp0 1dz0 1cp0 1dz0 1cN0 1dz0 1cp0 1dz0 1cp0 1dz0 1cp0 1dz0",
			"Asia/Thimbu|BTT|-60|0|",
			"Asia/Tokyo|JST|-90|0|",
			"Asia/Ulaanbaatar|ULAT ULAST|-80 -90|0101010101010|1O8G0 1cJ0 1cP0 1cJ0 1cP0 1fx0 1cP0 1cJ0 1cP0 1cJ0 1cP0 1cJ0",
			"Asia/Ust-Nera|MAGT MAGST MAGT VLAT VLAT|-b0 -c0 -c0 -b0 -a0|010234|1BWf0 1qM0 WM0 17V0 7zD0",
			"Asia/Vladivostok|VLAT VLAST VLAT|-a0 -b0 -b0|01020|1BWg0 1qM0 WM0 8Hz0",
			"Asia/Yakutsk|YAKT YAKST YAKT|-90 -a0 -a0|01020|1BWh0 1qM0 WM0 8Hz0",
			"Asia/Yekaterinburg|YEKT YEKST YEKT|-50 -60 -60|01020|1BWl0 1qM0 WM0 8Hz0",
			"Asia/Yerevan|AMT AMST|-40 -50|01010|1BWm0 1qM0 WM0 1qM0",
			"Atlantic/Azores|AZOT AZOST|10 0|01010101010101010101010|1BWp0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00",
			"Atlantic/Canary|WET WEST|0 -10|01010101010101010101010|1BWp0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00",
			"Atlantic/Cape_Verde|CVT|10|0|",
			"Atlantic/South_Georgia|GST|20|0|",
			"Atlantic/Stanley|FKST FKT|30 40|010|1C6R0 U10",
			"Australia/ACT|AEDT AEST|-b0 -a0|01010101010101010101010|1C140 1cM0 1cM0 1cM0 1cM0 1fA0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1cM0 1cM0 1cM0 1cM0",
			"Australia/Adelaide|ACDT ACST|-au -9u|01010101010101010101010|1C14u 1cM0 1cM0 1cM0 1cM0 1fA0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1cM0 1cM0 1cM0 1cM0",
			"Australia/Brisbane|AEST|-a0|0|",
			"Australia/Darwin|ACST|-9u|0|",
			"Australia/Eucla|ACWST|-8J|0|",
			"Australia/LHI|LHDT LHST|-b0 -au|01010101010101010101010|1C130 1cMu 1cLu 1cMu 1cLu 1fAu 1cLu 1cMu 1cLu 1cMu 1cLu 1cMu 1cLu 1cMu 1cLu 1cMu 1cLu 1fAu 1cLu 1cMu 1cLu 1cMu",
			"Australia/Perth|AWST|-80|0|",
			"Chile/EasterIsland|EASST EAST EAST|50 60 50|010101010102|1C1f0 1fB0 1nX0 G10 1EL0 Op0 1zb0 Rd0 1wn0 Rd0 1wn0",
			"Eire|GMT IST|0 -10|01010101010101010101010|1BWp0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00",
			"Etc/GMT+1|GMT+1|10|0|",
			"Etc/GMT+10|GMT+10|a0|0|",
			"Etc/GMT+11|GMT+11|b0|0|",
			"Etc/GMT+12|GMT+12|c0|0|",
			"Etc/GMT+2|GMT+2|20|0|",
			"Etc/GMT+3|GMT+3|30|0|",
			"Etc/GMT+4|GMT+4|40|0|",
			"Etc/GMT+5|GMT+5|50|0|",
			"Etc/GMT+6|GMT+6|60|0|",
			"Etc/GMT+7|GMT+7|70|0|",
			"Etc/GMT+8|GMT+8|80|0|",
			"Etc/GMT+9|GMT+9|90|0|",
			"Etc/GMT-1|GMT-1|-10|0|",
			"Etc/GMT-10|GMT-10|-a0|0|",
			"Etc/GMT-11|GMT-11|-b0|0|",
			"Etc/GMT-12|GMT-12|-c0|0|",
			"Etc/GMT-13|GMT-13|-d0|0|",
			"Etc/GMT-14|GMT-14|-e0|0|",
			"Etc/GMT-2|GMT-2|-20|0|",
			"Etc/GMT-3|GMT-3|-30|0|",
			"Etc/GMT-4|GMT-4|-40|0|",
			"Etc/GMT-5|GMT-5|-50|0|",
			"Etc/GMT-6|GMT-6|-60|0|",
			"Etc/GMT-7|GMT-7|-70|0|",
			"Etc/GMT-8|GMT-8|-80|0|",
			"Etc/GMT-9|GMT-9|-90|0|",
			"Etc/UCT|UCT|0|0|",
			"Etc/UTC|UTC|0|0|",
			"Europe/Belfast|GMT BST|0 -10|01010101010101010101010|1BWp0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00",
			"Europe/Kaliningrad|EET EEST FET|-20 -30 -30|01020|1BWo0 1qM0 WM0 8Hz0",
			"Europe/Minsk|EET EEST FET MSK|-20 -30 -30 -30|01023|1BWo0 1qM0 WM0 8Hy0",
			"Europe/Moscow|MSK MSD MSK|-30 -40 -40|01020|1BWn0 1qM0 WM0 8Hz0",
			"Europe/Samara|SAMT SAMST SAMT|-40 -40 -30|0120|1BWm0 1qN0 WM0",
			"Europe/Simferopol|EET EEST MSK MSK|-20 -30 -40 -30|01010101023|1BWp0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11z0 1nW0",
			"HST|HST|a0|0|",
			"Indian/Chagos|IOT|-60|0|",
			"Indian/Christmas|CXT|-70|0|",
			"Indian/Cocos|CCT|-6u|0|",
			"Indian/Kerguelen|TFT|-50|0|",
			"Indian/Mahe|SCT|-40|0|",
			"Indian/Maldives|MVT|-50|0|",
			"Indian/Mauritius|MUT|-40|0|",
			"Indian/Reunion|RET|-40|0|",
			"Kwajalein|MHT|-c0|0|",
			"MET|MET MEST|-10 -20|01010101010101010101010|1BWp0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00",
			"NZ-CHAT|CHADT CHAST|-dJ -cJ|01010101010101010101010|1C120 1a00 1fA0 1a00 1fA0 1cM0 1fA0 1a00 1fA0 1a00 1fA0 1a00 1fA0 1a00 1fA0 1a00 1fA0 1cM0 1fA0 1a00 1fA0 1a00",
			"Pacific/Apia|SST SDT WSDT WSST|b0 a0 -e0 -d0|01012323232323232323232|1Dbn0 1ff0 1a00 CI0 AQ0 1cM0 1fA0 1a00 1fA0 1a00 1fA0 1a00 1fA0 1a00 1fA0 1a00 1fA0 1cM0 1fA0 1a00 1fA0 1a00",
			"Pacific/Bougainville|PGT BST|-a0 -b0|01|1NwE0",
			"Pacific/Chuuk|CHUT|-a0|0|",
			"Pacific/Efate|VUT|-b0|0|",
			"Pacific/Enderbury|PHOT|-d0|0|",
			"Pacific/Fakaofo|TKT TKT|b0 -d0|01|1Gfn0",
			"Pacific/Fiji|FJST FJT|-d0 -c0|01010101010101010101010|1BWe0 1o00 Rc0 1wo0 Ao0 1Nc0 Ao0 1Q00 xz0 1SN0 uM0 1SM0 xA0 1SM0 uM0 1SM0 uM0 1SM0 uM0 1SM0 uM0 1SM0",
			"Pacific/Funafuti|TVT|-c0|0|",
			"Pacific/Galapagos|GALT|60|0|",
			"Pacific/Gambier|GAMT|90|0|",
			"Pacific/Guadalcanal|SBT|-b0|0|",
			"Pacific/Guam|ChST|-a0|0|",
			"Pacific/Kiritimati|LINT|-e0|0|",
			"Pacific/Kosrae|KOST|-b0|0|",
			"Pacific/Marquesas|MART|9u|0|",
			"Pacific/Midway|SST|b0|0|",
			"Pacific/Nauru|NRT|-c0|0|",
			"Pacific/Niue|NUT|b0|0|",
			"Pacific/Norfolk|NFT|-bu|0|",
			"Pacific/Noumea|NCT|-b0|0|",
			"Pacific/Palau|PWT|-90|0|",
			"Pacific/Pohnpei|PONT|-b0|0|",
			"Pacific/Port_Moresby|PGT|-a0|0|",
			"Pacific/Rarotonga|CKT|a0|0|",
			"Pacific/Tahiti|TAHT|a0|0|",
			"Pacific/Tarawa|GILT|-c0|0|",
			"Pacific/Tongatapu|TOT|-d0|0|",
			"Pacific/Wake|WAKT|-c0|0|",
			"Pacific/Wallis|WFT|-c0|0|"
		],
		"links": [
			"Africa/Abidjan|Africa/Accra",
			"Africa/Abidjan|Africa/Bamako",
			"Africa/Abidjan|Africa/Banjul",
			"Africa/Abidjan|Africa/Bissau",
			"Africa/Abidjan|Africa/Conakry",
			"Africa/Abidjan|Africa/Dakar",
			"Africa/Abidjan|Africa/Freetown",
			"Africa/Abidjan|Africa/Lome",
			"Africa/Abidjan|Africa/Monrovia",
			"Africa/Abidjan|Africa/Nouakchott",
			"Africa/Abidjan|Africa/Ouagadougou",
			"Africa/Abidjan|Africa/Sao_Tome",
			"Africa/Abidjan|Africa/Timbuktu",
			"Africa/Abidjan|America/Danmarkshavn",
			"Africa/Abidjan|Atlantic/Reykjavik",
			"Africa/Abidjan|Atlantic/St_Helena",
			"Africa/Abidjan|Etc/GMT",
			"Africa/Abidjan|Etc/GMT+0",
			"Africa/Abidjan|Etc/GMT-0",
			"Africa/Abidjan|Etc/GMT0",
			"Africa/Abidjan|Etc/Greenwich",
			"Africa/Abidjan|GMT",
			"Africa/Abidjan|GMT+0",
			"Africa/Abidjan|GMT-0",
			"Africa/Abidjan|GMT0",
			"Africa/Abidjan|Greenwich",
			"Africa/Abidjan|Iceland",
			"Africa/Addis_Ababa|Africa/Asmara",
			"Africa/Addis_Ababa|Africa/Asmera",
			"Africa/Addis_Ababa|Africa/Dar_es_Salaam",
			"Africa/Addis_Ababa|Africa/Djibouti",
			"Africa/Addis_Ababa|Africa/Juba",
			"Africa/Addis_Ababa|Africa/Kampala",
			"Africa/Addis_Ababa|Africa/Khartoum",
			"Africa/Addis_Ababa|Africa/Mogadishu",
			"Africa/Addis_Ababa|Africa/Nairobi",
			"Africa/Addis_Ababa|Indian/Antananarivo",
			"Africa/Addis_Ababa|Indian/Comoro",
			"Africa/Addis_Ababa|Indian/Mayotte",
			"Africa/Algiers|Africa/Tunis",
			"Africa/Bangui|Africa/Brazzaville",
			"Africa/Bangui|Africa/Douala",
			"Africa/Bangui|Africa/Kinshasa",
			"Africa/Bangui|Africa/Lagos",
			"Africa/Bangui|Africa/Libreville",
			"Africa/Bangui|Africa/Luanda",
			"Africa/Bangui|Africa/Malabo",
			"Africa/Bangui|Africa/Ndjamena",
			"Africa/Bangui|Africa/Niamey",
			"Africa/Bangui|Africa/Porto-Novo",
			"Africa/Blantyre|Africa/Bujumbura",
			"Africa/Blantyre|Africa/Gaborone",
			"Africa/Blantyre|Africa/Harare",
			"Africa/Blantyre|Africa/Kigali",
			"Africa/Blantyre|Africa/Lubumbashi",
			"Africa/Blantyre|Africa/Lusaka",
			"Africa/Blantyre|Africa/Maputo",
			"Africa/Cairo|Egypt",
			"Africa/Casablanca|Africa/El_Aaiun",
			"Africa/Ceuta|Arctic/Longyearbyen",
			"Africa/Ceuta|Atlantic/Jan_Mayen",
			"Africa/Ceuta|CET",
			"Africa/Ceuta|Europe/Amsterdam",
			"Africa/Ceuta|Europe/Andorra",
			"Africa/Ceuta|Europe/Belgrade",
			"Africa/Ceuta|Europe/Berlin",
			"Africa/Ceuta|Europe/Bratislava",
			"Africa/Ceuta|Europe/Brussels",
			"Africa/Ceuta|Europe/Budapest",
			"Africa/Ceuta|Europe/Busingen",
			"Africa/Ceuta|Europe/Copenhagen",
			"Africa/Ceuta|Europe/Gibraltar",
			"Africa/Ceuta|Europe/Ljubljana",
			"Africa/Ceuta|Europe/Luxembourg",
			"Africa/Ceuta|Europe/Madrid",
			"Africa/Ceuta|Europe/Malta",
			"Africa/Ceuta|Europe/Monaco",
			"Africa/Ceuta|Europe/Oslo",
			"Africa/Ceuta|Europe/Paris",
			"Africa/Ceuta|Europe/Podgorica",
			"Africa/Ceuta|Europe/Prague",
			"Africa/Ceuta|Europe/Rome",
			"Africa/Ceuta|Europe/San_Marino",
			"Africa/Ceuta|Europe/Sarajevo",
			"Africa/Ceuta|Europe/Skopje",
			"Africa/Ceuta|Europe/Stockholm",
			"Africa/Ceuta|Europe/Tirane",
			"Africa/Ceuta|Europe/Vaduz",
			"Africa/Ceuta|Europe/Vatican",
			"Africa/Ceuta|Europe/Vienna",
			"Africa/Ceuta|Europe/Warsaw",
			"Africa/Ceuta|Europe/Zagreb",
			"Africa/Ceuta|Europe/Zurich",
			"Africa/Ceuta|Poland",
			"Africa/Johannesburg|Africa/Maseru",
			"Africa/Johannesburg|Africa/Mbabane",
			"Africa/Tripoli|Libya",
			"America/Adak|America/Atka",
			"America/Adak|US/Aleutian",
			"America/Anchorage|America/Juneau",
			"America/Anchorage|America/Nome",
			"America/Anchorage|America/Sitka",
			"America/Anchorage|America/Yakutat",
			"America/Anchorage|US/Alaska",
			"America/Anguilla|America/Antigua",
			"America/Anguilla|America/Aruba",
			"America/Anguilla|America/Barbados",
			"America/Anguilla|America/Blanc-Sablon",
			"America/Anguilla|America/Curacao",
			"America/Anguilla|America/Dominica",
			"America/Anguilla|America/Grenada",
			"America/Anguilla|America/Guadeloupe",
			"America/Anguilla|America/Kralendijk",
			"America/Anguilla|America/Lower_Princes",
			"America/Anguilla|America/Marigot",
			"America/Anguilla|America/Martinique",
			"America/Anguilla|America/Montserrat",
			"America/Anguilla|America/Port_of_Spain",
			"America/Anguilla|America/Puerto_Rico",
			"America/Anguilla|America/Santo_Domingo",
			"America/Anguilla|America/St_Barthelemy",
			"America/Anguilla|America/St_Kitts",
			"America/Anguilla|America/St_Lucia",
			"America/Anguilla|America/St_Thomas",
			"America/Anguilla|America/St_Vincent",
			"America/Anguilla|America/Tortola",
			"America/Anguilla|America/Virgin",
			"America/Argentina/Buenos_Aires|America/Argentina/Catamarca",
			"America/Argentina/Buenos_Aires|America/Argentina/ComodRivadavia",
			"America/Argentina/Buenos_Aires|America/Argentina/Cordoba",
			"America/Argentina/Buenos_Aires|America/Argentina/Jujuy",
			"America/Argentina/Buenos_Aires|America/Argentina/La_Rioja",
			"America/Argentina/Buenos_Aires|America/Argentina/Mendoza",
			"America/Argentina/Buenos_Aires|America/Argentina/Rio_Gallegos",
			"America/Argentina/Buenos_Aires|America/Argentina/Salta",
			"America/Argentina/Buenos_Aires|America/Argentina/San_Juan",
			"America/Argentina/Buenos_Aires|America/Argentina/San_Luis",
			"America/Argentina/Buenos_Aires|America/Argentina/Tucuman",
			"America/Argentina/Buenos_Aires|America/Argentina/Ushuaia",
			"America/Argentina/Buenos_Aires|America/Buenos_Aires",
			"America/Argentina/Buenos_Aires|America/Catamarca",
			"America/Argentina/Buenos_Aires|America/Cordoba",
			"America/Argentina/Buenos_Aires|America/Jujuy",
			"America/Argentina/Buenos_Aires|America/Mendoza",
			"America/Argentina/Buenos_Aires|America/Rosario",
			"America/Atikokan|America/Cayman",
			"America/Atikokan|America/Coral_Harbour",
			"America/Atikokan|America/Jamaica",
			"America/Atikokan|America/Panama",
			"America/Atikokan|EST",
			"America/Atikokan|Jamaica",
			"America/Belem|America/Fortaleza",
			"America/Belem|America/Maceio",
			"America/Belem|America/Recife",
			"America/Belem|America/Santarem",
			"America/Belize|America/Costa_Rica",
			"America/Belize|America/El_Salvador",
			"America/Belize|America/Guatemala",
			"America/Belize|America/Managua",
			"America/Belize|America/Regina",
			"America/Belize|America/Swift_Current",
			"America/Belize|America/Tegucigalpa",
			"America/Belize|Canada/East-Saskatchewan",
			"America/Belize|Canada/Saskatchewan",
			"America/Boa_Vista|America/Manaus",
			"America/Boa_Vista|America/Porto_Velho",
			"America/Boa_Vista|Brazil/West",
			"America/Boise|America/Cambridge_Bay",
			"America/Boise|America/Denver",
			"America/Boise|America/Edmonton",
			"America/Boise|America/Inuvik",
			"America/Boise|America/Ojinaga",
			"America/Boise|America/Shiprock",
			"America/Boise|America/Yellowknife",
			"America/Boise|Canada/Mountain",
			"America/Boise|MST7MDT",
			"America/Boise|Navajo",
			"America/Boise|US/Mountain",
			"America/Campo_Grande|America/Cuiaba",
			"America/Chicago|America/Indiana/Knox",
			"America/Chicago|America/Indiana/Tell_City",
			"America/Chicago|America/Knox_IN",
			"America/Chicago|America/Matamoros",
			"America/Chicago|America/Menominee",
			"America/Chicago|America/North_Dakota/Center",
			"America/Chicago|America/North_Dakota/New_Salem",
			"America/Chicago|America/Rainy_River",
			"America/Chicago|America/Rankin_Inlet",
			"America/Chicago|America/Resolute",
			"America/Chicago|America/Winnipeg",
			"America/Chicago|CST6CDT",
			"America/Chicago|Canada/Central",
			"America/Chicago|US/Central",
			"America/Chicago|US/Indiana-Starke",
			"America/Chihuahua|America/Mazatlan",
			"America/Chihuahua|Mexico/BajaSur",
			"America/Creston|America/Dawson_Creek",
			"America/Creston|America/Hermosillo",
			"America/Creston|America/Phoenix",
			"America/Creston|MST",
			"America/Creston|US/Arizona",
			"America/Dawson|America/Ensenada",
			"America/Dawson|America/Los_Angeles",
			"America/Dawson|America/Tijuana",
			"America/Dawson|America/Vancouver",
			"America/Dawson|America/Whitehorse",
			"America/Dawson|Canada/Pacific",
			"America/Dawson|Canada/Yukon",
			"America/Dawson|Mexico/BajaNorte",
			"America/Dawson|PST8PDT",
			"America/Dawson|US/Pacific",
			"America/Dawson|US/Pacific-New",
			"America/Detroit|America/Fort_Wayne",
			"America/Detroit|America/Indiana/Indianapolis",
			"America/Detroit|America/Indiana/Marengo",
			"America/Detroit|America/Indiana/Petersburg",
			"America/Detroit|America/Indiana/Vevay",
			"America/Detroit|America/Indiana/Vincennes",
			"America/Detroit|America/Indiana/Winamac",
			"America/Detroit|America/Indianapolis",
			"America/Detroit|America/Iqaluit",
			"America/Detroit|America/Kentucky/Louisville",
			"America/Detroit|America/Kentucky/Monticello",
			"America/Detroit|America/Louisville",
			"America/Detroit|America/Montreal",
			"America/Detroit|America/Nassau",
			"America/Detroit|America/New_York",
			"America/Detroit|America/Nipigon",
			"America/Detroit|America/Pangnirtung",
			"America/Detroit|America/Thunder_Bay",
			"America/Detroit|America/Toronto",
			"America/Detroit|Canada/Eastern",
			"America/Detroit|EST5EDT",
			"America/Detroit|US/East-Indiana",
			"America/Detroit|US/Eastern",
			"America/Detroit|US/Michigan",
			"America/Eirunepe|America/Porto_Acre",
			"America/Eirunepe|America/Rio_Branco",
			"America/Eirunepe|Brazil/Acre",
			"America/Glace_Bay|America/Halifax",
			"America/Glace_Bay|America/Moncton",
			"America/Glace_Bay|America/Thule",
			"America/Glace_Bay|Atlantic/Bermuda",
			"America/Glace_Bay|Canada/Atlantic",
			"America/Havana|Cuba",
			"America/Merida|America/Mexico_City",
			"America/Merida|America/Monterrey",
			"America/Merida|Mexico/General",
			"America/Metlakatla|Pacific/Pitcairn",
			"America/Noronha|Brazil/DeNoronha",
			"America/Santiago|Antarctica/Palmer",
			"America/Santiago|Chile/Continental",
			"America/Sao_Paulo|Brazil/East",
			"America/St_Johns|Canada/Newfoundland",
			"Antarctica/McMurdo|Antarctica/South_Pole",
			"Antarctica/McMurdo|NZ",
			"Antarctica/McMurdo|Pacific/Auckland",
			"Asia/Aden|Asia/Baghdad",
			"Asia/Aden|Asia/Bahrain",
			"Asia/Aden|Asia/Kuwait",
			"Asia/Aden|Asia/Qatar",
			"Asia/Aden|Asia/Riyadh",
			"Asia/Aqtau|Asia/Aqtobe",
			"Asia/Ashgabat|Asia/Ashkhabad",
			"Asia/Bangkok|Asia/Ho_Chi_Minh",
			"Asia/Bangkok|Asia/Phnom_Penh",
			"Asia/Bangkok|Asia/Saigon",
			"Asia/Bangkok|Asia/Vientiane",
			"Asia/Calcutta|Asia/Colombo",
			"Asia/Calcutta|Asia/Kolkata",
			"Asia/Chongqing|Asia/Chungking",
			"Asia/Chongqing|Asia/Harbin",
			"Asia/Chongqing|Asia/Macao",
			"Asia/Chongqing|Asia/Macau",
			"Asia/Chongqing|Asia/Shanghai",
			"Asia/Chongqing|Asia/Taipei",
			"Asia/Chongqing|PRC",
			"Asia/Chongqing|ROC",
			"Asia/Dacca|Asia/Dhaka",
			"Asia/Dubai|Asia/Muscat",
			"Asia/Hong_Kong|Hongkong",
			"Asia/Istanbul|Europe/Istanbul",
			"Asia/Istanbul|Turkey",
			"Asia/Jakarta|Asia/Pontianak",
			"Asia/Jerusalem|Asia/Tel_Aviv",
			"Asia/Jerusalem|Israel",
			"Asia/Kashgar|Asia/Urumqi",
			"Asia/Kathmandu|Asia/Katmandu",
			"Asia/Kuala_Lumpur|Asia/Kuching",
			"Asia/Makassar|Asia/Ujung_Pandang",
			"Asia/Nicosia|EET",
			"Asia/Nicosia|Europe/Athens",
			"Asia/Nicosia|Europe/Bucharest",
			"Asia/Nicosia|Europe/Chisinau",
			"Asia/Nicosia|Europe/Helsinki",
			"Asia/Nicosia|Europe/Kiev",
			"Asia/Nicosia|Europe/Mariehamn",
			"Asia/Nicosia|Europe/Nicosia",
			"Asia/Nicosia|Europe/Riga",
			"Asia/Nicosia|Europe/Sofia",
			"Asia/Nicosia|Europe/Tallinn",
			"Asia/Nicosia|Europe/Tiraspol",
			"Asia/Nicosia|Europe/Uzhgorod",
			"Asia/Nicosia|Europe/Vilnius",
			"Asia/Nicosia|Europe/Zaporozhye",
			"Asia/Pyongyang|Asia/Seoul",
			"Asia/Pyongyang|ROK",
			"Asia/Samarkand|Asia/Tashkent",
			"Asia/Singapore|Singapore",
			"Asia/Tehran|Iran",
			"Asia/Thimbu|Asia/Thimphu",
			"Asia/Tokyo|Japan",
			"Asia/Ulaanbaatar|Asia/Ulan_Bator",
			"Atlantic/Canary|Atlantic/Faeroe",
			"Atlantic/Canary|Atlantic/Faroe",
			"Atlantic/Canary|Atlantic/Madeira",
			"Atlantic/Canary|Europe/Lisbon",
			"Atlantic/Canary|Portugal",
			"Atlantic/Canary|WET",
			"Australia/ACT|Australia/Canberra",
			"Australia/ACT|Australia/Currie",
			"Australia/ACT|Australia/Hobart",
			"Australia/ACT|Australia/Melbourne",
			"Australia/ACT|Australia/NSW",
			"Australia/ACT|Australia/Sydney",
			"Australia/ACT|Australia/Tasmania",
			"Australia/ACT|Australia/Victoria",
			"Australia/Adelaide|Australia/Broken_Hill",
			"Australia/Adelaide|Australia/South",
			"Australia/Adelaide|Australia/Yancowinna",
			"Australia/Brisbane|Australia/Lindeman",
			"Australia/Brisbane|Australia/Queensland",
			"Australia/Darwin|Australia/North",
			"Australia/LHI|Australia/Lord_Howe",
			"Australia/Perth|Australia/West",
			"Chile/EasterIsland|Pacific/Easter",
			"Eire|Europe/Dublin",
			"Etc/UCT|UCT",
			"Etc/UTC|Etc/Universal",
			"Etc/UTC|Etc/Zulu",
			"Etc/UTC|UTC",
			"Etc/UTC|Universal",
			"Etc/UTC|Zulu",
			"Europe/Belfast|Europe/Guernsey",
			"Europe/Belfast|Europe/Isle_of_Man",
			"Europe/Belfast|Europe/Jersey",
			"Europe/Belfast|Europe/London",
			"Europe/Belfast|GB",
			"Europe/Belfast|GB-Eire",
			"Europe/Moscow|Europe/Volgograd",
			"Europe/Moscow|W-SU",
			"HST|Pacific/Honolulu",
			"HST|Pacific/Johnston",
			"HST|US/Hawaii",
			"Kwajalein|Pacific/Kwajalein",
			"Kwajalein|Pacific/Majuro",
			"NZ-CHAT|Pacific/Chatham",
			"Pacific/Chuuk|Pacific/Truk",
			"Pacific/Chuuk|Pacific/Yap",
			"Pacific/Guam|Pacific/Saipan",
			"Pacific/Midway|Pacific/Pago_Pago",
			"Pacific/Midway|Pacific/Samoa",
			"Pacific/Midway|US/Samoa",
			"Pacific/Pohnpei|Pacific/Ponape"
		]
	});


	return moment;
}));

//! moment-timezone-utils.js
//! version : 0.3.1
//! author : Tim Wood
//! license : MIT
//! github.com/moment/moment-timezone

(function (root, factory) {
	"use strict";

	/*global define*/
	if (typeof define === 'function' && define.amd) {
		define(['moment'], factory);                 // AMD
	} else if (typeof exports === 'object') {
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
		return source.name + '|' + packAbbrsAndOffsets(source) + '|' + packUntils(source.untils);
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
		var i, j, a, b, isUnique;

		for (i = 0; i < input.length; i++) {
			isUnique = true;
			a = input[i];

			for (j = 0; j < output.length; j++) {
				b = output[j];

				if (zonesAreEqual(a, b)) {
					links.push(b.name + '|' + a.name);
					isUnique = false;
					continue;
				}
			}

			if (isUnique) {
				output.push(a);
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
			name    : source.name,
			abbrs   : slice.apply(source.abbrs, indices),
			untils  : untils,
			offsets : slice.apply(source.offsets, indices)
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

'use strict';

(function (root, factory) {
  /* global define */
  if (typeof define === 'function' && define.amd) {
    define(['moment'], function (moment) {
      moment.parseFormat = factory(moment);
      return moment.parseFormat;
    });
  } else if (typeof exports === 'object') {
    module.exports = factory(require('moment'));
  } else {
    root.moment.parseFormat = factory(root.moment);
  }
})(this, function (/*moment*/) { // jshint ignore:line
  var dayNames =  [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var abbreviatedDayNames =  [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var shortestDayNames = ['Su','Mo','Tu','We','Th','Fr','Sa'];
  var monthNames =  [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var abbreviatedMonthNames =  [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var amDesignator =  'AM';
  var pmDesignator =  'PM';
  var lowerAMDesignator = 'am';
  var lowerPMDesignator = 'pm';

  var regexDayNames = new RegExp( dayNames.join('|'), 'i' );
  var regexAbbreviatedDayNames = new RegExp( abbreviatedDayNames.join('|'), 'i' );
  var regexShortestDayNames = new RegExp( '\\b('+shortestDayNames.join('|')+')\\b', 'i' );
  var regexMonthNames = new RegExp( monthNames.join('|'), 'i' );
  var regexAbbreviatedMonthNames = new RegExp( abbreviatedMonthNames.join('|'), 'i' );

  var regexFirstSecondThirdFourth = /(\d+)(st|nd|rd|th)\b/i;
  var regexEndian = /(\d{1,4})([\/\.\-])(\d{1,2})[\/\.\-](\d{1,4})/;

  var regexTimezone = /((\+|\-)\d\d:\d\d)$/;
  var amOrPm = '('+[amDesignator,pmDesignator].join('|')+')';
  var lowerAmOrPm = '('+[lowerAMDesignator,lowerPMDesignator].join('|')+')';
  var regexLowerAmOrPm = new RegExp(lowerAmOrPm);
  var regexUpperAmOrPm = new RegExp(amOrPm);
  var regexHoursWithLeadingZeroDigitMinutesSecondsAmPm = new RegExp( '0\\d\\:\\d{1,2}\\:\\d{1,2}(\\s*)' + amOrPm,  'i' );
  var regexHoursWithLeadingZeroDigitMinutesAmPm = new RegExp( '0\\d\\:\\d{1,2}(\\s*)' + amOrPm,  'i' );
  var regexHoursWithLeadingZeroDigitAmPm = new RegExp( '0\\d(\\s*)' + amOrPm,  'i' );
  var regexHoursMinutesSecondsAmPm = new RegExp( '\\d{1,2}\\:\\d{1,2}\\:\\d{1,2}(\\s*)' + amOrPm,  'i' );
  var regexHoursMinutesAmPm = new RegExp( '\\d{1,2}\\:\\d{1,2}(\\s*)' + amOrPm,  'i' );
  var regexHoursAmPm = new RegExp( '\\d{1,2}(\\s*)' + amOrPm,  'i' );

  var regexISO8601HoursWithLeadingZeroMinutesSecondsMilliseconds = /\d{2}:\d{2}:\d{2}\.\d{3}/;
  var regexHoursWithLeadingZeroMinutesSeconds = /0\d:\d{2}:\d{2}/;
  var regexHoursWithLeadingZeroMinutes = /0\d:\d{2}/;
  var regexHoursMinutesSeconds = /\d{1,2}:\d{2}:\d{2}/;
  var regexHoursMinutes = /\d{1,2}:\d{2}/;
  var regexYearLong = /\d{4}/;
  var regexDayLeadingZero = /0\d/;
  var regexDay = /\d{1,2}/;
  var regexYearShort = /\d{2}/;

  var regexFillingWords = /\b(at)\b/i;

  // option defaults
  var defaultOrder = {
    '/': 'MDY',
    '.': 'DMY',
    '-': 'YMD'
  };

  function parseDateFormat(dateString, options) {
    var format = dateString;

    // default options
    options = options || {};
    options.preferredOrder = options.preferredOrder || defaultOrder;

    // escape filling words
    format = format.replace(regexFillingWords, '[$1]');

    //  DAYS

    // Monday ☛ dddd
    format = format.replace( regexDayNames, 'dddd');
    // Mon ☛ ddd
    format = format.replace( regexAbbreviatedDayNames, 'ddd');
    // Mo ☛ dd
    format = format.replace( regexShortestDayNames, 'dd');

    // 1st, 2nd, 23rd ☛ do
    format = format.replace( regexFirstSecondThirdFourth, 'Do');

    // MONTHS

    // January ☛ MMMM
    format = format.replace( regexMonthNames, 'MMMM');
    // Jan ☛ MMM
    format = format.replace( regexAbbreviatedMonthNames, 'MMM');

    // replace endians, like 8/20/2010, 20.8.2010 or 2010-8-20
    format = format.replace( regexEndian, replaceEndian.bind(null, options));

    // TIME

    // timezone +02:00 ☛ Z
    format = format.replace(regexTimezone, 'Z');
    // 23:39:43.331 ☛ 'HH:mm:ss.SS'
    format = format.replace(regexISO8601HoursWithLeadingZeroMinutesSecondsMilliseconds, 'HH:mm:ss.SSS');
    // 05:30:20pm ☛ hh:mm:ssa
    format = format.replace(regexHoursWithLeadingZeroDigitMinutesSecondsAmPm, 'hh:mm:ss$1');
    // 10:30:20pm ☛ h:mm:ssa
    format = format.replace(regexHoursMinutesSecondsAmPm, 'h:mm:ss$1');
    // 05:30pm ☛ hh:mma
    format = format.replace(regexHoursWithLeadingZeroDigitMinutesAmPm, 'hh:mm$1');
    // 10:30pm ☛ h:mma
    format = format.replace(regexHoursMinutesAmPm, 'h:mm$1');
    // 05pm ☛ hha
    format = format.replace(regexHoursWithLeadingZeroDigitAmPm, 'hh$1');
    // 10pm ☛ ha
    format = format.replace(regexHoursAmPm, 'h$1');
    // 05:30:20 ☛ HH:mm:ss
    format = format.replace(regexHoursWithLeadingZeroMinutesSeconds, 'HH:mm:ss');
    // 10:30:20 ☛ H:mm:ss
    format = format.replace(regexHoursMinutesSeconds, 'H:mm:ss');
    // 05:30 ☛ H:mm
    format = format.replace(regexHoursWithLeadingZeroMinutes, 'HH:mm');
    // 10:30 ☛ HH:mm
    format = format.replace(regexHoursMinutes, 'H:mm');

    // Check if AM and determine the case of 'a' we need
    if(regexUpperAmOrPm.test(dateString)) {
      format += 'A';
    } else if(regexLowerAmOrPm.test(dateString)) {
      format += 'a';
    }

    // do we still have numbers left?

    // Lets check for 4 digits first, these are years for sure
    format = format.replace(regexYearLong, 'YYYY');

    // now, the next number, if existing, must be a day
    format = format.replace(regexDayLeadingZero, 'DD');
    format = format.replace(regexDay, 'D');

    // last but not least, there could still be a year left
    format = format.replace(regexYearShort, 'YY');

    return format;
  }

  // if we can't find an endian based on the separator, but
  // there still is a short date with day, month & year,
  // we try to make a smart decision to identify the order
  function replaceEndian(options, matchedPart, first, separator, second, third) {
    var parts;
    var hasSingleDigit = Math.min(first.length, second.length, third.length) === 1;
    var hasQuadDigit = Math.max(first.length, second.length, third.length) === 4;
    var index = -1;
    var preferredOrder = typeof options.preferredOrder === 'string' ? options.preferredOrder : options.preferredOrder[separator];

    first = parseInt(first, 10);
    second = parseInt(second, 10);
    third = parseInt(third, 10);
    parts = [first, second, third];
    preferredOrder = preferredOrder.toUpperCase();

    // If first is a year, order will always be Year-Month-Day
    if (first > 31) {
      parts[0] = hasQuadDigit ? 'YYYY' : 'YY';
      parts[1] = hasSingleDigit ? 'M' : 'MM';
      parts[2] = hasSingleDigit ? 'D' : 'DD';
      return parts.join(separator);
    }

    // Second will never be the year. And if it is a day,
    // the order will always be Month-Day-Year
    if (second > 12) {
      parts[0] = hasSingleDigit ? 'M' : 'MM';
      parts[1] = hasSingleDigit ? 'D' : 'DD';
      parts[2] = hasQuadDigit ? 'YYYY' : 'YY';
      return parts.join(separator);
    }

    // if third is a year ...
    if (third > 31) {
      parts[2] = hasQuadDigit ? 'YYYY' : 'YY';

      // ... try to find day in first and second.
      // If found, the remaining part is the month.
      switch (true) {
        case first > 12:
          parts[0] = hasSingleDigit ? 'D' : 'DD';
          parts[1] = hasSingleDigit ? 'M' : 'MM';
          return parts.join(separator);
        case second > 12:
          parts[0] = hasSingleDigit ? 'M' : 'MM';
          parts[1] = hasSingleDigit ? 'D' : 'DD';
          return parts.join(separator);
        default: // sorry
          if (preferredOrder[0] === 'M') {
            parts[0] = hasSingleDigit ? 'M' : 'MM';
            parts[1] = hasSingleDigit ? 'D' : 'DD';
            return parts.join(separator);
          }
          parts[0] = hasSingleDigit ? 'D' : 'DD';
          parts[1] = hasSingleDigit ? 'M' : 'MM';
          return parts.join(separator);
      }
    }

    // if we had no luck until here, we use the preferred order
    parts[preferredOrder.indexOf('D')] = hasSingleDigit ? 'D' : 'DD';
    parts[preferredOrder.indexOf('M')] = hasSingleDigit ? 'M' : 'MM';
    parts[preferredOrder.indexOf('Y')] = hasQuadDigit ? 'YYYY' : 'YY';

    return parts.join(separator);
  }

  return parseDateFormat;
});

/*! Moment Duration Format v1.3.0
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

(function($) {
  $.fn.caret = function(pos) {
    var target = this[0];
	var isContentEditable = target.contentEditable === 'true';
    //get
    if (arguments.length == 0) {
      //HTML5
      if (window.getSelection) {
        //contenteditable
        if (isContentEditable) {
          target.focus();
          var range1 = window.getSelection().getRangeAt(0),
              range2 = range1.cloneRange();
          range2.selectNodeContents(target);
          range2.setEnd(range1.endContainer, range1.endOffset);
          return range2.toString().length;
        }
        //textarea
        return target.selectionStart;
      }
      //IE<9
      if (document.selection) {
        target.focus();
        //contenteditable
        if (isContentEditable) {
            var range1 = document.selection.createRange(),
                range2 = document.body.createTextRange();
            range2.moveToElementText(target);
            range2.setEndPoint('EndToEnd', range1);
            return range2.text.length;
        }
        //textarea
        var pos = 0,
            range = target.createTextRange(),
            range2 = document.selection.createRange().duplicate(),
            bookmark = range2.getBookmark();
        range.moveToBookmark(bookmark);
        while (range.moveStart('character', -1) !== 0) pos++;
        return pos;
      }
      // Addition for jsdom support
      if (target.selectionStart)
        return target.selectionStart;
      //not supported
      return 0;
    }
    //set
    if (pos == -1)
      pos = this[isContentEditable? 'text' : 'val']().length;
    //HTML5
    if (window.getSelection) {
      //contenteditable
      if (isContentEditable) {
        target.focus();
        window.getSelection().collapse(target.firstChild, pos);
      }
      //textarea
      else
        target.setSelectionRange(pos, pos);
    }
    //IE<9
    else if (document.body.createTextRange) {
      if (isContentEditable) {
        var range = document.body.createTextRange();
        range.moveToElementText(target);
        range.moveStart('character', pos);
        range.collapse(true);
        range.select();
      } else {
        var range = target.createTextRange();
        range.move('character', pos);
        range.select();
      }
    }
    if (!isContentEditable)
      target.focus();
    return pos;
  }
})(jQuery);

// Generated by CoffeeScript 1.7.1
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
    return this.data('defaultPrefix', (_ref = options.allowPhoneWithoutPrefix) != null ? _ref : options.defaultPrefix);
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

/*!
 Based on ndef.parser, by Raphael Graf(r@undefined.ch)
 http://www.undefined.ch/mparser/index.html

 Ported to JavaScript and modified by Matthew Crumley (email@matthewcrumley.com, http://silentmatt.com/)

 You are free to use and modify this code in anyway you find useful. Please leave this comment in the code
 to acknowledge its original source. If you feel like it, I enjoy hearing about projects that use my code,
 but don't feel like you have to let me know or ask permission.
*/

//  Added by stlsmiths 6/13/2011
//  re-define Array.indexOf, because IE doesn't know it ...
//
//  from http://stellapower.net/content/javascript-support-and-arrayindexof-ie
	if (!Array.indexOf) {
		Array.prototype.indexOf = function (obj, start) {
			for (var i = (start || 0); i < this.length; i++) {
				if (this[i] === obj) {
					return i;
				}
			}
			return -1;
		}
	}

var Parser = (function (scope) {
	function object(o) {
		function F() {}
		F.prototype = o;
		return new F();
	}

	var TNUMBER = 0;
	var TOP1 = 1;
	var TOP2 = 2;
	var TVAR = 3;
	var TFUNCALL = 4;

	function Token(type_, index_, prio_, number_) {
		this.type_ = type_;
		this.index_ = index_ || 0;
		this.prio_ = prio_ || 0;
		this.number_ = (number_ !== undefined && number_ !== null) ? number_ : 0;
		this.toString = function () {
			switch (this.type_) {
			case TNUMBER:
				return this.number_;
			case TOP1:
			case TOP2:
			case TVAR:
				return this.index_;
			case TFUNCALL:
				return "CALL";
			default:
				return "Invalid Token";
			}
		};
	}

	function Expression(tokens, ops1, ops2, functions) {
		this.tokens = tokens;
		this.ops1 = ops1;
		this.ops2 = ops2;
		this.functions = functions;
	}

	// Based on http://www.json.org/json2.js
    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\'\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            "'" : "\\'",
            '\\': '\\\\'
        };

	function escapeValue(v) {
		if (typeof v === "string") {
			escapable.lastIndex = 0;
	        return escapable.test(v) ?
	            "'" + v.replace(escapable, function (a) {
	                var c = meta[a];
	                return typeof c === 'string' ? c :
	                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
	            }) + "'" :
	            "'" + v + "'";
		}
		return v;
	}

	Expression.prototype = {
		simplify: function (values) {
			values = values || {};
			var nstack = [];
			var newexpression = [];
			var n1;
			var n2;
			var f;
			var L = this.tokens.length;
			var item;
			var i = 0;
			for (i = 0; i < L; i++) {
				item = this.tokens[i];
				var type_ = item.type_;
				if (type_ === TNUMBER) {
					nstack.push(item);
				}
				else if (type_ === TVAR && (item.index_ in values)) {
					item = new Token(TNUMBER, 0, 0, values[item.index_]);
					nstack.push(item);
				}
				else if (type_ === TOP2 && nstack.length > 1) {
					n2 = nstack.pop();
					n1 = nstack.pop();
					f = this.ops2[item.index_];
					item = new Token(TNUMBER, 0, 0, f(n1.number_, n2.number_));
					nstack.push(item);
				}
				else if (type_ === TOP1 && nstack.length > 0) {
					n1 = nstack.pop();
					f = this.ops1[item.index_];
					item = new Token(TNUMBER, 0, 0, f(n1.number_));
					nstack.push(item);
				}
				else {
					while (nstack.length > 0) {
						newexpression.push(nstack.shift());
					}
					newexpression.push(item);
				}
			}
			while (nstack.length > 0) {
				newexpression.push(nstack.shift());
			}

			return new Expression(newexpression, object(this.ops1), object(this.ops2), object(this.functions));
		},

		substitute: function (variable, expr) {
			if (!(expr instanceof Expression)) {
				expr = new Parser().parse(String(expr));
			}
			var newexpression = [];
			var L = this.tokens.length;
			var item;
			var i = 0;
			for (i = 0; i < L; i++) {
				item = this.tokens[i];
				var type_ = item.type_;
				if (type_ === TVAR && item.index_ === variable) {
					for (var j = 0; j < expr.tokens.length; j++) {
						var expritem = expr.tokens[j];
						var replitem = new Token(expritem.type_, expritem.index_, expritem.prio_, expritem.number_);
						newexpression.push(replitem);
					}
				}
				else {
					newexpression.push(item);
				}
			}

			var ret = new Expression(newexpression, object(this.ops1), object(this.ops2), object(this.functions));
			return ret;
		},

		evaluate: function (values) {
			values = values || {};
			var nstack = [];
			var n1;
			var n2;
			var f;
			var L = this.tokens.length;
			var item;
			var i = 0;
			for (i = 0; i < L; i++) {
				item = this.tokens[i];
				var type_ = item.type_;
				if (type_ === TNUMBER) {
					nstack.push(item.number_);
				}
				else if (type_ === TOP2) {
					n2 = nstack.pop();
					n1 = nstack.pop();
					f = this.ops2[item.index_];
					nstack.push(f(n1, n2));
				}
				else if (type_ === TVAR) {
					if (item.index_ in values) {
						nstack.push(values[item.index_]);
					}
					else if (item.index_ in this.functions) {
						nstack.push(this.functions[item.index_]);
					}
					else {
						throw new Error("undefined variable: " + item.index_);
					}
				}
				else if (type_ === TOP1) {
					n1 = nstack.pop();
					f = this.ops1[item.index_];
					nstack.push(f(n1));
				}
				else if (type_ === TFUNCALL) {
					n1 = nstack.pop();
					f = nstack.pop();
					if (f.apply && f.call) {
						if (Object.prototype.toString.call(n1) == "[object Array]") {
							nstack.push(f.apply(undefined, n1));
						}
						else {
							nstack.push(f.call(undefined, n1));
						}
					}
					else {
						throw new Error(f + " is not a function");
					}
				}
				else {
					throw new Error("invalid Expression");
				}
			}
			if (nstack.length > 1) {
				throw new Error("invalid Expression (parity)");
			}
			return nstack[0];
		},

		toString: function (toJS) {
			var nstack = [];
			var n1;
			var n2;
			var f;
			var L = this.tokens.length;
			var item;
			var i = 0;
			for (i = 0; i < L; i++) {
				item = this.tokens[i];
				var type_ = item.type_;
				if (type_ === TNUMBER) {
					nstack.push(escapeValue(item.number_));
				}
				else if (type_ === TOP2) {
					n2 = nstack.pop();
					n1 = nstack.pop();
					f = item.index_;
					if (toJS && f == "^") {
						nstack.push("Math.pow(" + n1 + "," + n2 + ")");
					}
					else {
						nstack.push("(" + n1 + f + n2 + ")");
					}
				}
				else if (type_ === TVAR) {
					nstack.push(item.index_);
				}
				else if (type_ === TOP1) {
					n1 = nstack.pop();
					f = item.index_;
					if (f === "-") {
						nstack.push("(" + f + n1 + ")");
					}
					else {
						nstack.push(f + "(" + n1 + ")");
					}
				}
				else if (type_ === TFUNCALL) {
					n1 = nstack.pop();
					f = nstack.pop();
					nstack.push(f + "(" + n1 + ")");
				}
				else {
					throw new Error("invalid Expression");
				}
			}
			if (nstack.length > 1) {
				throw new Error("invalid Expression (parity)");
			}
			return nstack[0];
		},

		variables: function () {
			var L = this.tokens.length;
			var vars = [];
			for (var i = 0; i < L; i++) {
				var item = this.tokens[i];
				if (item.type_ === TVAR && (vars.indexOf(item.index_) == -1)) {
					vars.push(item.index_);
				}
			}

			return vars;
		},

		toJSFunction: function (param, variables) {
			var f = new Function(param, "with(Parser.values) { return " + this.simplify(variables).toString(true) + "; }");
			return f;
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
		return "" + a + b;
	}
	function sinh(a) {
		return Math.sinh ? Math.sinh(a) : ((Math.exp(a) - Math.exp(-a)) / 2);
	}
	function cosh(a) {
		return Math.cosh ? Math.cosh(a) : ((Math.exp(a) + Math.exp(-a)) / 2);
	}
	function tanh(a) {
		if (Math.tanh) return Math.tanh(a);
		if(a === Infinity) return 1;
		if(a === -Infinity) return -1;
		return (Math.exp(a) - Math.exp(-a)) / (Math.exp(a) + Math.exp(-a));
	}
	function asinh(a) {
		if (Math.asinh) return Math.asinh(a);
		if(a === -Infinity) return a;
		return Math.log(a + Math.sqrt(a * a + 1));
	}
	function acosh(a) {
		return Math.acosh ? Math.acosh(a) : Math.log(a + Math.sqrt(a * a - 1));
	}
	function atanh(a) {
		return Math.atanh ? Math.atanh(a) : (Math.log((1+a)/(1-a)) / 2);
	}
	function log10(a) {
	      return Math.log(a) * Math.LOG10E;
	}
	function neg(a) {
		return -a;
	}
	function trunc(a) {
		if(Math.trunc) return Math.trunc(a);
		else return x < 0 ? Math.ceil(x) : Math.floor(x);
	}
	function random(a) {
		return Math.random() * (a || 1);
	}
	function fac(a) { //a!
		a = Math.floor(a);
		var b = a;
		while (a > 1) {
			b = b * (--a);
		}
		return b;
	}

	// TODO: use hypot that doesn't overflow
	function hypot() {
		if(Math.hypot) return Math.hypot.apply(this, arguments);
		var y = 0;
		var length = arguments.length;
		for (var i = 0; i < length; i++) {
			if (arguments[i] === Infinity || arguments[i] === -Infinity) {
				return Infinity;
			}
			y += arguments[i] * arguments[i];
		}
		return Math.sqrt(y);
	}

	function append(a, b) {
		if (Object.prototype.toString.call(a) != "[object Array]") {
			return [a, b];
		}
		a = a.slice();
		a.push(b);
		return a;
	}

	function Parser() {
		this.success = false;
		this.errormsg = "";
		this.expression = "";

		this.pos = 0;

		this.tokennumber = 0;
		this.tokenprio = 0;
		this.tokenindex = 0;
		this.tmpprio = 0;

		this.ops1 = {
			"sin": Math.sin,
			"cos": Math.cos,
			"tan": Math.tan,
			"asin": Math.asin,
			"acos": Math.acos,
			"atan": Math.atan,
			"sinh": sinh,
			"cosh": cosh,
			"tanh": tanh,
			"asinh": asinh,
			"acosh": acosh,
			"atanh": atanh,
			"sqrt": Math.sqrt,
			"log": Math.log,
			"lg" : log10,
			"log10" : log10,
			"abs": Math.abs,
			"ceil": Math.ceil,
			"floor": Math.floor,
			"round": Math.round,
			"trunc": trunc,
			"-": neg,
			"exp": Math.exp
		};

		this.ops2 = {
			"+": add,
			"-": sub,
			"*": mul,
			"/": div,
			"%": mod,
			"^": Math.pow,
			",": append,
			"||": concat
		};

		this.functions = {
			"random": random,
			"fac": fac,
			"min": Math.min,
			"max": Math.max,
			"hypot": hypot,
			"pyt": hypot, // backward compat
			"pow": Math.pow,
			"atan2": Math.atan2
		};

		this.consts = {
			"E": Math.E,
			"PI": Math.PI
		};
	}

	Parser.parse = function (expr) {
		return new Parser().parse(expr);
	};

	Parser.evaluate = function (expr, variables) {
		return Parser.parse(expr).evaluate(variables);
	};

	Parser.Expression = Expression;

	Parser.values = {
		sin: Math.sin,
		cos: Math.cos,
		tan: Math.tan,
		asin: Math.asin,
		acos: Math.acos,
		atan: Math.atan,
		sinh: sinh,
		cosh: cosh,
		tanh: tanh,
		asinh: asinh,
		acosh: acosh,
		atanh: atanh,
		sqrt: Math.sqrt,
		log: Math.log,
		lg: log10,
		log10: log10,
		abs: Math.abs,
		ceil: Math.ceil,
		floor: Math.floor,
		round: Math.round,
		trunc: trunc,
		random: random,
		fac: fac,
		exp: Math.exp,
		min: Math.min,
		max: Math.max,
		hypot: hypot,
		pyt: hypot, // backward compat
		pow: Math.pow,
		atan2: Math.atan2,
		E: Math.E,
		PI: Math.PI
	};

	var PRIMARY      = 1 << 0;
	var OPERATOR     = 1 << 1;
	var FUNCTION     = 1 << 2;
	var LPAREN       = 1 << 3;
	var RPAREN       = 1 << 4;
	var COMMA        = 1 << 5;
	var SIGN         = 1 << 6;
	var CALL         = 1 << 7;
	var NULLARY_CALL = 1 << 8;

	Parser.prototype = {
		parse: function (expr) {
			this.errormsg = "";
			this.success = true;
			var operstack = [];
			var tokenstack = [];
			this.tmpprio = 0;
			var expected = (PRIMARY | LPAREN | FUNCTION | SIGN);
			var noperators = 0;
			this.expression = expr;
			this.pos = 0;

			while (this.pos < this.expression.length) {
				if (this.isOperator()) {
					if (this.isSign() && (expected & SIGN)) {
						if (this.isNegativeSign()) {
							this.tokenprio = 2;
							this.tokenindex = "-";
							noperators++;
							this.addfunc(tokenstack, operstack, TOP1);
						}
						expected = (PRIMARY | LPAREN | FUNCTION | SIGN);
					}
					else if (this.isComment()) {

					}
					else {
						if ((expected & OPERATOR) === 0) {
							this.error_parsing(this.pos, "unexpected operator");
						}
						noperators += 2;
						this.addfunc(tokenstack, operstack, TOP2);
						expected = (PRIMARY | LPAREN | FUNCTION | SIGN);
					}
				}
				else if (this.isNumber()) {
					if ((expected & PRIMARY) === 0) {
						this.error_parsing(this.pos, "unexpected number");
					}
					var token = new Token(TNUMBER, 0, 0, this.tokennumber);
					tokenstack.push(token);

					expected = (OPERATOR | RPAREN | COMMA);
				}
				else if (this.isString()) {
					if ((expected & PRIMARY) === 0) {
						this.error_parsing(this.pos, "unexpected string");
					}
					var token = new Token(TNUMBER, 0, 0, this.tokennumber);
					tokenstack.push(token);

					expected = (OPERATOR | RPAREN | COMMA);
				}
				else if (this.isLeftParenth()) {
					if ((expected & LPAREN) === 0) {
						this.error_parsing(this.pos, "unexpected \"(\"");
					}

					if (expected & CALL) {
						noperators += 2;
						this.tokenprio = -2;
						this.tokenindex = -1;
						this.addfunc(tokenstack, operstack, TFUNCALL);
					}

					expected = (PRIMARY | LPAREN | FUNCTION | SIGN | NULLARY_CALL);
				}
				else if (this.isRightParenth()) {
				    if (expected & NULLARY_CALL) {
						var token = new Token(TNUMBER, 0, 0, []);
						tokenstack.push(token);
					}
					else if ((expected & RPAREN) === 0) {
						this.error_parsing(this.pos, "unexpected \")\"");
					}

					expected = (OPERATOR | RPAREN | COMMA | LPAREN | CALL);
				}
				else if (this.isComma()) {
					if ((expected & COMMA) === 0) {
						this.error_parsing(this.pos, "unexpected \",\"");
					}
					this.addfunc(tokenstack, operstack, TOP2);
					noperators += 2;
					expected = (PRIMARY | LPAREN | FUNCTION | SIGN);
				}
				else if (this.isConst()) {
					if ((expected & PRIMARY) === 0) {
						this.error_parsing(this.pos, "unexpected constant");
					}
					var consttoken = new Token(TNUMBER, 0, 0, this.tokennumber);
					tokenstack.push(consttoken);
					expected = (OPERATOR | RPAREN | COMMA);
				}
				else if (this.isOp2()) {
					if ((expected & FUNCTION) === 0) {
						this.error_parsing(this.pos, "unexpected function");
					}
					this.addfunc(tokenstack, operstack, TOP2);
					noperators += 2;
					expected = (LPAREN);
				}
				else if (this.isOp1()) {
					if ((expected & FUNCTION) === 0) {
						this.error_parsing(this.pos, "unexpected function");
					}
					this.addfunc(tokenstack, operstack, TOP1);
					noperators++;
					expected = (LPAREN);
				}
				else if (this.isVar()) {
					if ((expected & PRIMARY) === 0) {
						this.error_parsing(this.pos, "unexpected variable");
					}
					var vartoken = new Token(TVAR, this.tokenindex, 0, 0);
					tokenstack.push(vartoken);

					expected = (OPERATOR | RPAREN | COMMA | LPAREN | CALL);
				}
				else if (this.isWhite()) {
				}
				else {
					if (this.errormsg === "") {
						this.error_parsing(this.pos, "unknown character");
					}
					else {
						this.error_parsing(this.pos, this.errormsg);
					}
				}
			}
			if (this.tmpprio < 0 || this.tmpprio >= 10) {
				this.error_parsing(this.pos, "unmatched \"()\"");
			}
			while (operstack.length > 0) {
				var tmp = operstack.pop();
				tokenstack.push(tmp);
			}
			if (noperators + 1 !== tokenstack.length) {
				//print(noperators + 1);
				//print(tokenstack);
				this.error_parsing(this.pos, "parity");
			}

			return new Expression(tokenstack, object(this.ops1), object(this.ops2), object(this.functions));
		},

		evaluate: function (expr, variables) {
			return this.parse(expr).evaluate(variables);
		},

		error_parsing: function (column, msg) {
			this.success = false;
			this.errormsg = "parse error [column " + (column) + "]: " + msg;
			this.column = column;
			throw new Error(this.errormsg);
		},

//\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\

		addfunc: function (tokenstack, operstack, type_) {
			var operator = new Token(type_, this.tokenindex, this.tokenprio + this.tmpprio, 0);
			while (operstack.length > 0) {
				if (operator.prio_ <= operstack[operstack.length - 1].prio_) {
					tokenstack.push(operstack.pop());
				}
				else {
					break;
				}
			}
			operstack.push(operator);
		},

		isNumber: function () {
			var r = false;
			var str = "";
			while (this.pos < this.expression.length) {
				var code = this.expression.charCodeAt(this.pos);
				if ((code >= 48 && code <= 57) || code === 46) {
					str += this.expression.charAt(this.pos);
					this.pos++;
					this.tokennumber = parseFloat(str);
					r = true;
				}
				else {
					break;
				}
			}
			return r;
		},

		// Ported from the yajjl JSON parser at http://code.google.com/p/yajjl/
		unescape: function(v, pos) {
			var buffer = [];
			var escaping = false;

			for (var i = 0; i < v.length; i++) {
				var c = v.charAt(i);
	
				if (escaping) {
					switch (c) {
					case "'":
						buffer.push("'");
						break;
					case '\\':
						buffer.push('\\');
						break;
					case '/':
						buffer.push('/');
						break;
					case 'b':
						buffer.push('\b');
						break;
					case 'f':
						buffer.push('\f');
						break;
					case 'n':
						buffer.push('\n');
						break;
					case 'r':
						buffer.push('\r');
						break;
					case 't':
						buffer.push('\t');
						break;
					case 'u':
						// interpret the following 4 characters as the hex of the unicode code point
						var codePoint = parseInt(v.substring(i + 1, i + 5), 16);
						buffer.push(String.fromCharCode(codePoint));
						i += 4;
						break;
					default:
						throw this.error_parsing(pos + i, "Illegal escape sequence: '\\" + c + "'");
					}
					escaping = false;
				} else {
					if (c == '\\') {
						escaping = true;
					} else {
						buffer.push(c);
					}
				}
			}
	
			return buffer.join('');
		},

		isString: function () {
			var r = false;
			var str = "";
			var startpos = this.pos;
			if (this.pos < this.expression.length && this.expression.charAt(this.pos) == "'") {
				this.pos++;
				while (this.pos < this.expression.length) {
					var code = this.expression.charAt(this.pos);
					if (code != "'" || str.slice(-1) == "\\") {
						str += this.expression.charAt(this.pos);
						this.pos++;
					}
					else {
						this.pos++;
						this.tokennumber = this.unescape(str, startpos);
						r = true;
						break;
					}
				}
			}
			return r;
		},

		isConst: function () {
			var str;
			for (var i in this.consts) {
				if (true) {
					var L = i.length;
					str = this.expression.substr(this.pos, L);
					if (i === str) {
						this.tokennumber = this.consts[i];
						this.pos += L;
						return true;
					}
				}
			}
			return false;
		},

		isOperator: function () {
			var code = this.expression.charCodeAt(this.pos);
			if (code === 43) { // +
				this.tokenprio = 0;
				this.tokenindex = "+";
			}
			else if (code === 45) { // -
				this.tokenprio = 0;
				this.tokenindex = "-";
			}
			else if (code === 124) { // |
				if (this.expression.charCodeAt(this.pos + 1) === 124) {
					this.pos++;
					this.tokenprio = 0;
					this.tokenindex = "||";
				}
				else {
					return false;
				}
			}
			else if (code === 42 || code === 8729 || code === 8226) { // * or ∙ or •
				this.tokenprio = 1;
				this.tokenindex = "*";
			}
			else if (code === 47) { // /
				this.tokenprio = 2;
				this.tokenindex = "/";
			}
			else if (code === 37) { // %
				this.tokenprio = 2;
				this.tokenindex = "%";
			}
			else if (code === 94) { // ^
				this.tokenprio = 3;
				this.tokenindex = "^";
			}
			else {
				return false;
			}
			this.pos++;
			return true;
		},

		isSign: function () {
			var code = this.expression.charCodeAt(this.pos - 1);
			if (code === 45 || code === 43) { // -
				return true;
			}
			return false;
		},

		isPositiveSign: function () {
			var code = this.expression.charCodeAt(this.pos - 1);
			if (code === 43) { // +
				return true;
			}
			return false;
		},

		isNegativeSign: function () {
			var code = this.expression.charCodeAt(this.pos - 1);
			if (code === 45) { // -
				return true;
			}
			return false;
		},

		isLeftParenth: function () {
			var code = this.expression.charCodeAt(this.pos);
			if (code === 40) { // (
				this.pos++;
				this.tmpprio += 10;
				return true;
			}
			return false;
		},

		isRightParenth: function () {
			var code = this.expression.charCodeAt(this.pos);
			if (code === 41) { // )
				this.pos++;
				this.tmpprio -= 10;
				return true;
			}
			return false;
		},

		isComma: function () {
			var code = this.expression.charCodeAt(this.pos);
			if (code === 44) { // ,
				this.pos++;
				this.tokenprio = -1;
				this.tokenindex = ",";
				return true;
			}
			return false;
		},

		isWhite: function () {
			var code = this.expression.charCodeAt(this.pos);
			if (code === 32 || code === 9 || code === 10 || code === 13) {
				this.pos++;
				return true;
			}
			return false;
		},

		isOp1: function () {
			var str = "";
			for (var i = this.pos; i < this.expression.length; i++) {
				var c = this.expression.charAt(i);
				if (c.toUpperCase() === c.toLowerCase()) {
					if (i === this.pos || (c != '_' && (c < '0' || c > '9'))) {
						break;
					}
				}
				str += c;
			}
			if (str.length > 0 && (str in this.ops1)) {
				this.tokenindex = str;
				this.tokenprio = 5;
				this.pos += str.length;
				return true;
			}
			return false;
		},

		isOp2: function () {
			var str = "";
			for (var i = this.pos; i < this.expression.length; i++) {
				var c = this.expression.charAt(i);
				if (c.toUpperCase() === c.toLowerCase()) {
					if (i === this.pos || (c != '_' && (c < '0' || c > '9'))) {
						break;
					}
				}
				str += c;
			}
			if (str.length > 0 && (str in this.ops2)) {
				this.tokenindex = str;
				this.tokenprio = 5;
				this.pos += str.length;
				return true;
			}
			return false;
		},

		isVar: function () {
			var str = "";
			for (var i = this.pos; i < this.expression.length; i++) {
				var c = this.expression.charAt(i);
				if (c.toUpperCase() === c.toLowerCase()) {
					if (i === this.pos || (c != '_' && (c < '0' || c > '9'))) {
						break;
					}
				}
				str += c;
			}
			if (str.length > 0) {
				this.tokenindex = str;
				this.tokenprio = 4;
				this.pos += str.length;
				return true;
			}
			return false;
		},

		isComment: function () {
			var code = this.expression.charCodeAt(this.pos - 1);
			if (code === 47 && this.expression.charCodeAt(this.pos) === 42) {
				this.pos = this.expression.indexOf("*/", this.pos) + 2;
				if (this.pos === 1) {
					this.pos = this.expression.length;
				}
				return true;
			}
			return false;
		}
	};

	scope.Parser = Parser;
	return Parser
})(typeof exports === 'undefined' ? {} : exports);

var doc = document,body = $(doc.body),win = window,settings;
win.bcpie = {
	active: {
		sdk: '2015.09.16',
		tricks: {} // populated automatically
	},
	globals: {
		path: win.location.pathname.toLowerCase(),
		pathArray: win.location.pathname.toLowerCase().split(/(?=\/#?[a-zA-Z0-9])/g),
		param: win.location.search,
		paramArray: win.location.search.split(/(?=&#?[a-zA-Z0-9])/g),
		hash: win.location.hash,
		countries: {"AF":"Afghanistan","AX":"Aland Islands","AL":"Albania","DZ":"Algeria","AS":"American Samoa","AD":"Andorra","AO":"Angola","AI":"Anguilla","AQ":"Antarctica","AG":"Antigua and Barbuda","AR":"Argentina","AM":"Armenia","AW":"Aruba","AU":"Australia","AT":"Austria","AZ":"Azerbaijan","BS":"Bahamas","BH":"Bahrain","BD":"Bangladesh","BB":"Barbados","BY":"Belarus","BE":"Belgium","BZ":"Belize","BJ":"Benin","BM":"Bermuda","BT":"Bhutan","BO":"Bolivia","BA":"Bosnia and Herzegovina","BW":"Botswana","BV":"Bouvet Island","BR":"Brazil","IO":"British Indian Ocean Territory","VG":"British Virgin Islands","BN":"Brunei Darussalam","BG":"Bulgaria","BF":"Burkina Faso","BI":"Burundi","KH":"Cambodia","CM":"Cameroon","CA":"Canada","CV":"Cape Verde","KY":"Cayman Islands","CF":"Central African Republic","TD":"Chad","CL":"Chile","CN":"China","CX":"Christmas Island","CC":"Cocos (Keeling) Islands","CO":"Colombia","KM":"Comoros","CG":"Congo","CD":"Congo, Democratic Republic of the","CK":"Cook Islands","CR":"Costa Rica","HR":"Croatia","CY":"Cyprus","CZ":"Czech Republic","DK":"Denmark","DJ":"Djibouti","DM":"Dominica","DO":"Dominican Republic","TL":"East Timor","EC":"Ecuador","EG":"Egypt","SV":"El Salvador","GQ":"Equatorial Guinea","ER":"Eritrea","EE":"Estonia","ET":"Ethiopia","FK":"Falkland Islands","FO":"Faroe Islands","FJ":"Fiji","FI":"Finland","FR":"France","GF":"French Guiana","PF":"French Polynesia","TF":"French Southern Territories","GA":"Gabon","GM":"Gambia","GE":"Georgia","DE":"Germany","GH":"Ghana","GI":"Gibraltar","GR":"Greece","GL":"Greenland","GD":"Grenada","GP":"Guadeloupe","GU":"Guam","GT":"Guatemala","GG":"Guernsey","GN":"Guinea","GW":"Guinea-Bissau","GY":"Guyana","HT":"Haiti","HM":"Heard Island and McDonald Islands","VA":"Holy See (Vatican City-State)","HN":"Honduras","HK":"Hong Kong SAR","HU":"Hungary","IS":"Iceland","IN":"India","ID":"Indonesia","IQ":"Iraq","IE":"Ireland","IL":"Israel","IT":"Italy","CI":"Ivory Coast","JM":"Jamaica","JP":"Japan","JE":"Jersey","JO":"Jordan","KZ":"Kazakhstan","KE":"Kenya","KI":"Kiribati","KR":"Korea, Republic Of","KW":"Kuwait","KG":"Kyrgyzstan","LA":"Laos","LV":"Latvia","LB":"Lebanon","LS":"Lesotho","LR":"Liberia","LY":"Libya","LI":"Liechtenstein","LT":"Lithuania","LU":"Luxembourg","MO":"Macao SAR","MK":"Macedonia, Former Yugoslav Republic of","MG":"Madagascar","MW":"Malawi","MY":"Malaysia","MV":"Maldives","ML":"Mali","MT":"Malta","MH":"Marshall Islands","MQ":"Martinique","MR":"Mauritania","MU":"Mauritius","YT":"Mayotte","MX":"Mexico","FM":"Micronesia, Federated States of","MD":"Moldova","MC":"Monaco","MN":"Mongolia","ME":"Montenegro","MS":"Montserrat","MA":"Morocco","MZ":"Mozambique","MM":"Myanmar","NA":"Namibia","NR":"Nauru","NP":"Nepal","NL":"Netherlands","AN":"Netherlands Antilles","NC":"New Caledonia","NZ":"New Zealand","NI":"Nicaragua","NE":"Niger","NG":"Nigeria","NU":"Niue","NF":"Norfolk Island","MP":"Northern Mariana Islands","NO":"Norway","OM":"Oman","PK":"Pakistan","PW":"Palau","PS":"Palestine","PA":"Panama","PG":"Papua New Guinea","PY":"Paraguay","PE":"Peru","PH":"Philippines","PN":"Pitcairn Islands","PL":"Poland","PT":"Portugal","PR":"Puerto Rico","QA":"Qatar","RE":"Reunion","RO":"Romania","RU":"Russian Federation","RW":"Rwanda","BL":"Saint Barthélemy","WS":"Samoa","SM":"San Marino","ST":"Sao Tome and Principe","SA":"Saudi Arabia","SN":"Senegal","RS":"Serbia","CS":"Serbia and Montenegro","SC":"Seychelles","SL":"Sierra Leone","SG":"Singapore","SK":"Slovakia","SI":"Slovenia","SB":"Solomon Islands","SO":"Somalia","ZA":"South Africa","GS":"South Georgia and the South Sandwich Islands","ES":"Spain","LK":"Sri Lanka","SH":"St. Helena","KN":"St. Kitts and Nevis","LC":"St. Lucia","MF":"St. Martin","PM":"St. Pierre and Miquelon","VC":"St. Vincent and the Grenadines","SR":"Suriname","SJ":"Svalbard and Jan Mayen","SZ":"Swaziland","SE":"Sweden","CH":"Switzerland","TW":"Taiwan","TJ":"Tajikistan","TZ":"Tanzania","TH":"Thailand","TG":"Togo","TK":"Tokelau","TO":"Tonga","TT":"Trinidad and Tobago","TN":"Tunisia","TR":"Turkey","TM":"Turkmenistan","TC":"Turks and Caicos Islands","TV":"Tuvalu","UG":"Uganda","UA":"Ukraine","AE":"United Arab Emirates","GB":"United Kingdom","US":"United States","UY":"Uruguay","UM":"US Minor Outlying Islands","VI":"US Virgin Islands","UZ":"Uzbekistan","VU":"Vanuatu","VE":"Venezuela","VN":"Viet Nam","WF":"Wallis and Futuna","EH":"Western Sahara","YE":"Yemen","ZM":"Zambia","ZW":"Zimbabwe"},
		states: {"AL":"Alabama","AK":"Alaska","AS":"American Samoa","AZ":"Arizona","AR":"Arkansas","CA":"California","CO":"Colorado","CT":"Connecticut","DE":"Delaware","DC":"District Of Columbia","FM":"Federated States Of Micronesia","FL":"Florida","GA":"Georgia","GU":"Guam","HI":"Hawaii","ID":"Idaho","IL":"Illinois","IN":"Indiana","IA":"Iowa","KS":"Kansas","KY":"Kentucky","LA":"Louisiana","ME":"Maine","MH":"Marshall Islands","MD":"Maryland","MA":"Massachusetts","MI":"Michigan","MN":"Minnesota","MS":"Mississippi","MO":"Missouri","MT":"Montana","NE":"Nebraska","NV":"Nevada","NH":"New Hampshire","NJ":"New Jersey","NM":"New Mexico","NY":"New York","NC":"North Carolina","ND":"North Dakota","MP":"Northern Mariana Islands","OH":"Ohio","OK":"Oklahoma","OR":"Oregon","PW":"Palau","PA":"Pennsylvania","PR":"Puerto Rico","RI":"Rhode Island","SC":"South Carolina","SD":"South Dakota","TN":"Tennessee","TX":"Texas","UT":"Utah","VT":"Vermont","VI":"Virgin Islands","VA":"Virginia","WA":"Washington","WV":"West Virginia","WI":"Wisconsin","WY":"Wyoming"},
		browser: {
			language: (navigator.languages ? navigator.languages[0] : (navigator.language || navigator.userLanguage)).toLocaleLowerCase()
		}
	},
	ajax: {
		token: function() {
			if (typeof $.cookie('access_token') !== 'undefined') return $.cookie('access_token');
			else return $.cookie('access_token',window.location.hash.replace('#access_token=',''));
		},
		file: {
			get: function(data,options) {
				data = {
					path: data.path || '' // string
				}

				if (typeof options !== 'object') options = {};
				if (data.path.indexOf('/') !== 0) data.path = '/'+data.path;
				if (data.path.charAt(data.path.length - 1) === '/') data.path.slice(0, - 1);

				options.url = '/api/v2/admin/sites/current/storage'+data.path;
				options.headers = {Authorization: bcpie.ajax.token()};
				options.method = 'GET';

				return bcpie.utils.ajax(options);
			},
			save: function(data,options) {
				data = {
					path: data.path || '', // string
					content: data.content || '', // file object, string
					version: data.version || 'draft-publish' // 'draft', 'draft-publish'
				}

				if (typeof options !== 'object') options = {};
				if (data.path.indexOf('/') !== 0) data.path = '/'+data.path;
				if (data.path.charAt(data.path.length - 1) === '/') data.path.slice(0, - 1);

				options.url = '/api/v2/admin/sites/current/storage'+data.path+'?version='+data.version;
				options.headers = {Authorization: bcpie.ajax.token()};

				if (typeof data.content === 'string' || typeof data.content.length === 'undefined') {
					options.method = 'PUT';
					options.contentType = 'application/octet-stream';
					if (typeof data.content.upload !== 'undefined' || typeof data.content.type !== 'undefined') {
						options.processData = false;
						options.url.replace('?version='+data.version,'');
						options.data = data.content;
					}else options.data = JSON.stringify(data.content);
				}else {
					options.method = 'POST';
					options.contentType = false;
					options.cache = false;
					options.processData = false;
					options.data = new FormData();
					options.data.append('file', data.content);
				}

				return bcpie.utils.ajax(options);
			},
			delete: function(data,options) {
				data = {
					path: data.path || '' // string
				}

				if (typeof options !== 'object') options = {};
				if (data.path.indexOf('/') !== 0) data.path = '/'+data.path;
				if (data.path.charAt(data.path.length - 1) === '/') data.path.slice(0, - 1);

				options.url = '/api/v2/admin/sites/current/storage'+data.path;
				options.headers = {Authorization: bcpie.ajax.token()};
				options.method = 'DELETE';

				return bcpie.utils.ajax(options);
			},
			uploadStatus: function() {
				if (typeof options !== 'object') options = {};
				options.url = '/api/v2/admin/sites/current/storage?status';
				options.method = 'GET';
				options.headers = {Authorization: bcpie.ajax.token()};

				return bcpie.utils.ajax(options);
			}
		},
		folder: {
			get: function(data,options) {
				data = {
					path: data.path || ''
				}
				if (typeof options !== 'object') options = {};

				if (data.path.charAt(0) === '/') data.path.slice(1, data.path.length - 1);
				if (data.path.charAt(data.path.length - 1) !== '/') data.path = data.path+'/';

				options.url = '/api/v2/admin/sites/current/storage/'+data.path+'?meta';
				options.method = 'GET';
				options.headers = {Authorization: bcpie.ajax.token()};
				return bcpie.utils.ajax(options);
			}
		},
		webapp: {
			item: {
				get :function(data,options) {
					data = {
						webapp: data.webapp || null, // integer, string
						item: data.item || null // integer
					}

					// Catch data errors
					var errors = bcpie.ajax.webapp.errors(data);
					if (errors.length > 0) return errors;

					if (typeof options !== 'object') options = {};
					options.url = '/api/v2/admin/sites/current/webapps/'+data.webapp+'/items/'+data.item;
					options.headers = {Authorization: bcpie.ajax.token()};
					options.method = 'GET';
					return bcpie.utils.ajax(options);
				},
				save: function(data,options) {
					data = {
						content: data.content || null,  // $, {}
						webapp: data.webapp || null, // integer, string
						item: data.item || null // integer
					}

					// Catch data errors
					var errors = bcpie.ajax.webapp.errors(data);
					if (errors.length > 0) return console.log(errors);

					if (typeof options !== 'object') options = {};

					if (bcpie.ajax.token().length > 10) {
						options.url = '/api/v2/admin/sites/current/webapps/'+data.webapp+'/items';
						if (data.item !== null) options.url += '/'+data.item;
						options.headers = {Authorization: bcpie.ajax.token()};

						var fieldTypes = {name:'String', weight:'Number', releaseDate:'DateTime', expiryDate:'String', enabled:'Boolean', slug:'String', description:'String', roleId:'Number', submittedBy:'Number', templateId:'Number', address:'String', city:'String', state:'String', zipCode:'String', country:'String',fields:{}},
							newData = {name:'', releaseDate:moment().subtract(12,'hour').format('YYYY-MM-DD'), expiryDate:'9999-01-01', enabled:true, country:'US', fields:{}},
							allFields = {name:'', weight:0, releaseDate:moment().subtract(12,'hour').format('YYYY-MM-DD'), expiryDate:'9999-01-01', enabled:true, slug:'', description:'', roleId:null, submittedBy:-1, templateId:-1, address:'', city:'', state:'', zipCode:'', country:'',fields:{}},
							field, result, fields;

						options.data = bcpie.utils.serializeObject(data.content);
						options.processData = false;

						if (typeof bcpie.ajax.webapp.item.save[data.webapp] === 'undefined') {
							// Retrieve the custom fields list from the server
							bcpie.ajax.webapp.item.save[data.webapp] = bcpie.ajax.webapp.fields({webapp: data.webapp},{async:false});
						}


						fields = bcpie.ajax.webapp.item.save[data.webapp].responseJSON;
						if (data.item !== null) {
							options.method = 'PUT';
							delete newData.releaseDate;
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
										if (newData[key] === NaN) delete data[key];
									}else if (fieldTypes[key] === 'Boolean') {
										newData[key] = bcpie.utils.validation.boolean(key,newData[key]);
									}else if (fieldTypes[key] === 'DateTime') {
										newData[key] = bcpie.utils.validation.dateTime(key,newData[key]);
									}
								}
							}
							else if (typeof newData.fields[key] !== 'undefined') {
								if (options.data[key] !== 'undefined') {
									newData.fields[key] = options.data[key];
									if (fieldTypes.fields[key] === 'Number' || fieldTypes.fields[key] === 'DataSource') {
										newData.fields[key] = bcpie.utils.validation.number(key,newData.fields[key]);
										if (newData.fields[key] === NaN) delete newData.fields[key];
									}else if (fieldTypes.fields[key] === 'Boolean') {
										newData.fields[key] = bcpie.utils.validation.boolean(key,newData.fields[key]);
										if (newData.fields[key] === null) delete newData.fields[key];
									}else if (fieldTypes.fields[key] === 'DateTime') {
										newData.fields[key] = bcpie.utils.validation.dateTime(key,newData.fields[key]);
										if (newData.fields[key] === null) delete newData.fields[key];
									}
								}else delete newData.fields[key];
							}
						}

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
					data = {
						webapp: data.webapp || null, // integer, string
						item: data.item || null // integer
					}

					// Catch data errors
					var errors = bcpie.ajax.webapp.errors(data);
					if (errors.length > 0) return errors;

					if (typeof options !== 'object') options = {};

					if (bcpie.ajax.token().length > 10) {
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
					data = {
						mode: data.mode.toLowerCase() || 'get', // 'get', 'save', delete
						webapp: data.webapp || null, // string
						item: data.item || null, // integer
						content: data.content || null  // $, {}
					}
					// Catch data errors
					var errors = bcpie.ajax.webapp.errors(data);
					if (errors.length > 0) return errors;

					if (typeof options !== 'object') options = {};

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
			detail: function(data,options) {
				data = {
					webapp: data.webapp || null
				}
				// Catch data errors
				var errors = bcpie.ajax.webapp.errors(data);
				if (errors.length > 0) return errors;

				if (typeof options !== 'object') options = {};

				options.url = '/api/v2/admin/sites/current/webapps/'+data.webapp;
				options.headers = {'Authorization': bcpie.ajax.token()};
				options.method = 'GET';
				return bcpie.utils.ajax(options);
			},
			fields: function(data,options) {
				data = {
					webapp: data.webapp || null // string
				}
				// Catch data errors
				var errors = bcpie.ajax.webapp.errors(data);
				if (errors.length > 0) return errors;

				if (typeof options !== 'object') options = {};

				options.url = '/api/v2/admin/sites/current/webapps/'+data.webapp+'/fields';
				options.headers = {'Authorization': bcpie.ajax.token()};
				options.method = 'GET';
				return bcpie.utils.ajax(options);
			},
			search: function(data,options) {
				data = {
					webapp: data.webapp || null,
					formID: data.formID || null,
					responsePageID: data.responsePageID || null,
					content: data.content || null
				}
				// Catch data errors
				var errors = bcpie.ajax.webapp.errors(data);
				if (errors.length > 0) return errors;

				if (typeof options !== 'object') options = {};

				if (data.responsePageID !== null) data.responsePageID = '&PageID='+data.responsePageID;
				else data.responsePageID = '';
				options.url = '/Default.aspx?CCID='+data.webapp+'&FID='+data.formID+'&ExcludeBoolFalse=True'+data.responsePageID;
				options.data = $.param(data.content);
				options.contentType = false;
				var response = $(bcpie.utils.ajax(options).responseText).find('.webappsearchresults');
				return (response.children().length > 0) ? response.children() : response.html();
			},
			errors: function(data) {
				data.errors = [];
				if (typeof data.webapp !== 'undefined') {
					if (data.webapp === null) data.errors.push('"webapp" parameter cannot be null.');
					else if (data.webapp.toString().match(/\D/g) === null && bcpie.ajax.token().length > 10) data.errors.push('For API use, the "webapp" parameter should be the Web App name, not the ID.');
					else if (data.webapp.toString().match(/\D/g) !== null && bcpie.ajax.token().length < 10) data.errors.push('For non-API use, the "webapp" parameter should be the Web App ID, not the name.');
				}
				if (typeof data.item !== 'undefined') {
					if (data.item === null) {
						if (data.mode === 'get' || data.mode === 'delete' || (data.mode === 'save' && bcpie.ajax.token().length < 10)) data.errors.push('"item" parameter cannot be null.');
					}else if (data.item.toString().match(/\D/g) !== null) data.errors.push('"item" parameter must be an integer.');
				}
				if (typeof data.formID !== 'undefined') {
					if (data.formID.toString().match(/\D/g) !== null) data.errors.push('"formID" parameter must be an integer.');
				}
				if (data.mode === 'get' && bcpie.ajax.token().length < 10) data.errors.push('"get" mode is for API use only.');
				return data.errors;
			}
		},
		crm: {
			customers: {
				get: function(data,options) {
					data = {
						customerID: data.customerID || null, // integer
						filters: data.filters || null, // object
						content: data.content || null
					}
					if (typeof options !== 'object') options = {};
					options.headers = {'Authorization': bcpie.ajax.token()};
					options.url = '/webresources/api/v3/sites/current/customers';
					if (data.customerID !== null) options.url += '/'+customerID;
					options.method = 'GET';
					if (data.filters !== null) options.url += bcpie.utils.filters(data.filters);
					return bcpie.utils.ajax(options);
				},
				save: function(data,options) {
					data = {
						customerID: data.customerID || null, // integer
						filters: data.filters || null, // object
						content: data.content || null
					}
					if (typeof options !== 'object') options = {};
					options.headers = {'Authorization': bcpie.ajax.token()};
					options.url = '/webresources/api/v3/sites/current/customers';
					if (data.customerID !== null) options.url += '/'+customerID;
					if (bcpie.ajax.token().length > 10) {
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
					data = {
						customerID: data.customerID || null, // integer
						filters: data.filters || null, // object
						content: data.content || null
					}
					if (typeof options !== 'object') options = {};
					options.headers = {'Authorization': bcpie.ajax.token()};
					options.url = '/webresources/api/v3/sites/current/customers';
					if (data.customerID !== null) options.url += '/'+customerID;
					options.method = 'DELETE';
					return bcpie.utils.ajax(options);
				},
				secureZones: function(data,options) {
					data = {
						mode: data.mode.toLowerCase() || 'get', // 'get','subscribe',unsubscribe
						customerID: data.customerID || null, // integer
						filters: data.filters || null, // object
						zones: data.zones || null // object
					}
					if (typeof options !== 'object') options = {};
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
					data = {
						mode: data.mode.toLowerCase() || 'get', // 'get'
						customerID: data.customerID || null, // integer
						filters: data.filters || null, // object
					}
					if (typeof options !== 'object') options = {};
					options.headers = {'Authorization': bcpie.ajax.token()};
					options.url = '/webresources/api/v3/sites/current/customers/'+data.customerID+'/orders'+bcpie.ajax.filters(data.filters);
					options.method = 'GET';
					return bcpie.utils.ajax(options);
				},
				addresses: function(data,options) {
					data = {
						mode: data.mode.toLowerCase() || 'get', // 'get'
						customerID: data.customerID || null, // integer
						filters: data.filters || null, // object
					}
					if (typeof options !== 'object') options = {};
					options.headers = {'Authorization': bcpie.ajax.token()};
					options.url = '/webresources/api/v3/sites/current/customers/'+data.customerID+'/addresses'+bcpie.ajax.filters(filters);
					options.method = 'GET';
					return bcpie.utils.ajax(options);
				}
			}
		}
	},
	utils: {
		_jsonify_brace: /^[{\[]/,
		_jsonify_token: /[^,:{}\[\]]+/g,
		_jsonify_quote: /^['"](.*)['"]$/,
		_jsonify_escap: /(["])/g,
		escape: function(str) { return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g,"\\$&"); },
		jsonify: function(str) {
			// Wrap with `{}` if not JavaScript object literal
			str = $.trim(str);
			if (bcpie.utils._jsonify_brace.test(str) === false) str = '{'+str+'}';

			// Retrieve token and convert to JSON
			return str.replace(bcpie.utils._jsonify_token, function (a) {
				a = $.trim(a);
				// Keep some special strings as they are
				if ('' === a || 'true' === a || 'false' === a || 'null' === a || (!isNaN(parseFloat(a)) && isFinite(a))) return a;
				// For string literal: 1. remove quotes at the top end; 2. escape double quotes in the middle; 3. wrap token with double quotes
				else return '"'+ a.replace(bcpie.utils._jsonify_quote, '$1').replace(bcpie.utils._jsonify_escap, '\\$1')+ '"';
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
		isElement: function(o){
			return (
				typeof HTMLElement === 'object' ? o instanceof HTMLElement : //DOM2
					o && typeof o === 'object' && o !== null && o.nodeType === 1 && typeof o.nodeName==='string'
			);
		},
		serializeObject: function(object) {
			var o = {};
			if (object instanceof jQuery) {
				var a = (object.is('form')) ? object.serializeArray() : $('<div/>').append(object.clone(true)).find('input,select,textarea').serializeArray();
			}else if ($.isArray(object) && typeof object[0].name !== 'undefined' && typeof object[0].value !== 'undefined') {
				var a = object;
			}else if ($.isPlainObject(object) && typeof object.name !== 'undefined' && typeof object.value !== 'undefined') {
				var a = [object];
			}else {
				console.log('Malformed object passed to bcpie.utils.serializeObject method.');
				var a = [];
			}
			for (var i=0; i<a.length; i++) {
				if (o[a[i].name] !== undefined) {
					if (!o[a[i].name].push) o[a[i].name] = [o[a[i].name]];
					o[a[i].name].push(a[i].value || '');
				}
				else o[a[i].name] = a[i].value || '';
			}
			return o;
		},
		closestChildren: function(selector,match,findAll,results) {
			/* the results parameter is used internally by the function */
			var $children = (selector instanceof jQuery) ? selector.children() : $(selector).children();
			if ($children.length === 0) {
				if (typeof results === 'object') return results;
				else return $();
			}
			if (typeof results === 'object') results = results.add($children.filter(match));
			else results = $children.filter(match);

			if (findAll !== true) return (results.length > 0) ? results : $children.closestChildren(match);
			else return bcpie.utils.closestChildren($children.not(results),match,findAll,results);
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
				selector: '.'+classes.replace(/ /g,'.')
			}
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

			string = string.replace(/ /g, '-');

			for (var i = 0; i < string.length; i++) {
				if (valid.indexOf(string.charAt(i)) != -1) output += string.charAt(i);
			}
			return output.toLowerCase();
		},
		executeCallback: function(selector, callback, data, textStatus, xhr){
			if (typeof callback === 'function') {
				function parameter(selector, callback, data, textStatus, xhr){
					var deferred = $.Deferred();
					if (typeof data === 'undefined') deferred.resolve(callback(selector));
					else if (typeof textStatus === 'undefined') deferred.resolve(callback(selector, data));
					else if (typeof xhr === 'undefined') deferred.resolve(callback(selector, data, textStatus));
					else deferred.resolve(callback(selector, data, textStatus, xhr));

					return deferred.promise();
				}

				return $.when(parameter(selector, callback, data, textStatus, xhr));
			}
		},
		filters: function(filters) {
			var response = '?limit=';
			response += filters.limit || 500;
			response += '&skip=';
			response += filters.skip || 0;
			if (typeof filters.order !== 'undefined') response += '&order='+bcpie.utils.encode(filters.order);
			if ($.isArray(filters.fields)) response += '&fields='+bcpie.utils.encode(filters.fields.toString());
			if (typeof filters.where === 'object') response += '&where='+bcpie.utils.encode(JSON.stringify(filters.where));
			return response;
		},
		ajax: function(options) {
			var settings = options || {};
			settings.url = options.url || '';
			settings.method = options.type || options.method || 'POST';
			settings.contentType = (options.contentType !== false) ? options.contentType || 'application/json' : false;
			if (typeof settings.data === 'undefined' && typeof settings.dataType !== 'undefined') delete settings.dataType;
			else if (typeof settings.data !== 'undefined' && typeof settings.dataType === 'undefined' && bcpie.utils.isJson(settings.data)) settings.dataType = 'application/json';
			return $.ajax(settings);
		},
		validation: {
			number: function(fieldName,value) {
				if (value === '') {
					return null;
				}else if (Number(value) === NaN) {
					console.log('The value of "'+fieldName+'" is not a number.');
					return NaN;
				}else return Number(value);
			},
			boolean: function(fieldName,value) {
				if (value.toLowerCase() === 'true' || value === '1') return true;
				else if (value.toLowerCase() === 'false' || value === '0') return false;
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
		engine: function() {
			var tricks = bcpie.extensions.tricks,trick,instances,instance,arr=[],str="",options={},module = [],functions = {},defaults = {};
			for (trick in tricks) {
				arr=[];str="";options={};module = [];functions = {};defaults = {};
				instances = $(doc).find('[data-bcpie-'+trick.toLowerCase()+']');
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
bcpie.globals.currentDomain = (win.location.href.indexOf(bcpie.globals.primaryDomain) > -1) ? bcpie.globals.primaryDomain : bcpie.globals.secureDomain;

// Initialize tricks
$(function() {
	bcpie.extensions.engine();
});
/*
 * "ActiveNav". An awesome trick for BC Pie.
 * http://bcpie.com
 * Copyright 2015, ONE Creative
 * Free to use in BC Pie, or as licensed in Dev-in-a-Box from http://www.bcappstore.com/apps/dev-in-a-box
*/

bcpie.extensions.tricks.ActiveNav = function(selector,options,settings) {
	settings = bcpie.extensions.settings(selector,options,{
		name: 'ActiveNav',
		version: '2015.08.18',
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
			bubble: true
		}
	});

	// vars
	var shortPath = settings.path.toLowerCase() + win.location.search.toLowerCase() + settings.hash.toLowerCase(),
		activeLinks, currentLink, gotIt = 0, first, segment, last, currentHash;

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
			if ($.trim(settings.removeClass.names).length > 0) {
				selector.removeClass(settings.removeClass.names);
			}
		}else if (selector.find(settings.levelClass.selector).size() === 0){
			if (settings.level > 1) {
				selector.children('ul').remove();
			}else {
				selector.children('ul').addClass(settings.levelClass.names);
			}
		}
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
			first = bcpie.utils.closestChildren(first,'li', true);
		}
	}

	// find lastLevel
	if (settings.lastLevel > 0) {
		last = $(selector);
		for (var i = settings.lastLevel; i > 0; i--) {
			last = bcpie.utils.closestChildren(last,'li', true);
		}
	}else last = 0;

	$(last).parent('ul').addClass(settings.lastLevelClass.names);
	if (last !== 0 && settings.removeHidden === true) {
		bcpie.utils.closestChildren(selector.find(settings.lastLevelClass.selector),'ul', true).remove();
	}

	initActiveNav();
};
/*
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
};
/*
 * Date
 * http://bcpie.com
 * Copyright 2015, ONE Creative
 * Free to use in BC Pie, or as licensed in Dev-in-a-Box from http://www.bcappstore.com/apps/dev-in-a-box
*/

bcpie.extensions.tricks.Date = function(selector,options){
	var settings = bcpie.extensions.settings(selector,options,{
		name: 'Date',
		version: '2015.09.16',
		defaults: {
			format: 'YYYY',
			add: '',
			subtract: '',
			moment: 'auto',
			utc: false,
			fromZone: 'local', // specify a valid timezone string (like America/Denver) or use 'local' to automatically detect it. Default is 'local'.
			toZone: '', // specify a valid timezone string (like America/Denver) or use 'local' to automatically detect it
			ref: 'text', // specify an html attribute (inputs will assume 'text' means 'value'). You can also say 'now' to use the current date and time.
			target: 'text', // specify an html attribute (inputs will default to 'value'). Separate multiple targets with commas.
			event: 'load', // specify the window event that triggers Date's behavior
			locale: 'off' // 'off' uses the site's language, 'auto' finds the user's language, or you can specify with a locale abbreviation.
		}
	});

	if (settings.locale === 'off') settings.locale = bcpie.globals.site.language.toLowerCase();
	else if (settings.locale === 'auto') settings.locale = (navigator.languages) ? navigator.languages[0] : (navigator.language || navigator.userLanguage);

	if (settings.add !== '') settings.add = $.parseJSON(bcpie.utils.jsonify(settings.add));
	if (settings.subtract !== '') settings.subtract = $.parseJSON(bcpie.utils.jsonify(settings.subtract));

	var ref,value,targets,parseFormat,order;

	function initLangSupport() {
		if (moment.localeData('es') !== null) { // check for the existence of language data other than 'en'
			moment.locale(settings.locale);
			runDate();
		}else {
			setTimeout(initLangSupport, 100);
		}
	}
	function runDate() {
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
				if (settings.utc === true) value = moment.utc(moment.unix(ref)).local();
				else value = moment.unix(ref);
			}else {
				if (typeof settings.site.countryCode === 'undefined') settings.site.countryCode = 'US';
				switch(settings.site.countryCode) {
					case 'US': order = 'MDY'; break;
					default: order = 'DMY';
				}
				parseFormat = (settings.moment === 'auto') ? moment.parseFormat(ref,{preferredOrder: order}) : settings.moment;
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
				if (settings.toZone === 'local' || settings.toZone === '') value = value.utc().local().format(settings.format);
				else value = value.utc().tz(settings.toZone).format(settings.format);
			}else value = value.format(settings.format);

			targets = settings.target.split(',');
			for (var i=0; i<targets.length; i++) {
				if (targets[i] === 'text' && selector.is('input')) targets[i] = 'value';
				(targets[i] === 'text') ? selector.text(value) : selector.prop(targets[i],value);
			}
		}
	}

	// Initialize Language Support
	if (settings.locale !== 'en') {
		var src = '//cdn.jsdelivr.net/momentjs/'+moment.version+'/locales.min.js';
		if ($(doc).find('script[src="'+src+'"]').length === 0) {
			var momentLocale = document.createElement('script');
			momentLocale.type = 'text/javascript';
			momentLocale.async = true;
			momentLocale.src = src;
			(document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(momentLocale);
		}
		initLangSupport();
	}else runDate();

	if (settings.event !== 'load') {
		body.on(settings.event, selector, function() {
			runDate();
		});
	}

};
/*
 * "FormMagic". An awesome trick for BC Pie.
 * http://bcpie.com
 * Copyright 2015, ONE Creative
 * Free to use in BC Pie, or as licensed in Dev-in-a-Box from http://www.bcappstore.com/apps/dev-in-a-box
*/

bcpie.extensions.tricks.FormMagic = function(selector,options) {
	var settings = bcpie.extensions.settings(selector,options,{
		name: 'FormMagic',
		version: '2015.09.15',
		defaults: {
			'requiredClass' : 'required',
			'errorGroupElement' : 'div',
			'errorGroupClass' : 'error-group',
			'errorMessageElement' : 'small',
			'errorClass' : 'error',
			'messageBox' : 'replace', // 'replace' replaces the form with the message, and 'off' returns no message. Otherwise, a CSS selector indicates where to put the message.
			'restoreMessageBox' : true, // If submission result is empty, the contents of messageBox will be restored. This is particularly helpful with live searches.
			'afterAjax' : 'remove', // 'hide', 'show'
			'useAjax' : false,
			'validateMode' : 'alert', // 'inline', 'off'
			'fieldTitleAttr' : 'label', // or specify a field attribute
			'systemMessageClass' : 'system-message',
			'systemErrorMessageClass' : 'system-error-message',
			'successClass' : 'success',
			'submitEvent' : null,
			'submitField' : '[type="submit"]',
			'validationSuccess' : null, // specify a function to run after validation, but before submission
			'validationError' : null, // specify a function to run after validation returns errors
			'noSubmit' : false, // allow form submission to be bypassed after successful validation.
			'ajaxSuccess' : null, // specify a function to run after an Ajax submission 'success' response
			'ajaxError' : null, // specify a function to run after an Ajax submission 'error' response
			'ajaxComplete' : null, // specify a function to run after an Ajax submission 'complete' response
			'steps' : '', // multistep container selectors, separated by comma
			'continueButton' : '', // Continue button selector for multistep form
			'backButton' : '', // back button selector for multistep form
			'buttonOnLoad' : 'enable', // none,disable,hide
			'buttonOnSubmit' : 'disable', // none,enable,hide
			'buttonAfterSubmit' : 'enable', //none,hide,show,disable
			'customError' : null, // specify a custom validation function to run against a comma delimeted list of selectors
			'customErrorFields' : '' // takes a comma delimited list of selectors to match against during validation
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
		var validatelang = {
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

	function formfield(j, d) {
		switch (d) {
			case "firstupper":
				var b = true;
				var e = true;
				for (var g = 1; g < j.length; g++) {
					var f = j.charCodeAt(g);
					if (f >= 65 && f <= 90) e = false;
					if (f >= 97 && f <= 127) b = false;
				}
				if (b || e) {
					var h = j.split(" ");
					j = "";
					for (var g = 0; g < h.length; g++) {
						if (h[g].length >= 1) j = j + " " + h[g].substring(0, 1).toUpperCase() + h[g].substring(1).toLowerCase();
					}
				}
				j = j.replace(".", "");
				j = j.replace(",", "");
				break;
			case "firstupperspecial":
				var h = j.split(" ");
				j = "";
				for (var g = 0; g < h.length; g++) {
					if (h[g].length >= 1) j = j + " " + h[g].substring(0, 1).toUpperCase() + h[g].substring(1);
				}
				break;
			case "alllower":
				j = j.toLowerCase(); break;
			case "allupper":
				j = j.toUpperCase(); break;
			default: break;
		}
		if (j.substring(0, 1) == " ") j = j.substring(1);
		return j;
	}
	function isCurrency(b, d) {
		var g = "";
		if (b.length === 0) g = "- " + d + validatelang.Currency.MustNumber;
		else {
			for (var f = 0; f < b.length; f++) {
				var e = b.charAt(f);
				if ((e < "0") || (e > "9")) {
					if (e != "." && e != ",") {
						g = "- " + d + validatelang.Currency.NoSymbol;
					}
				}
			}
		}
		return g;
	}
	function isNumeric(b, d) {
		var g = "";
		if (b.length === 0) g = "- " + d + validatelang.Number.MustNumber;
		else {
			var f;
			for (f = 0; f < b.length; f++) {
				var e = b.charAt(f);
				if ((e < "0") || (e > "9")) {
					g = "- " + d + validatelang.Number.NoDecimal;
					return g;
				}
			}
		}
		return g;
	}
	function isFloat(b, d) {
		var g = "";
		var f;
		if (b.length === 0) g = "- " + d + validatelang.Float.MustNumber;
		else {
			for (f = 0; f < b.length; f++) {
				var e = b.charAt(f);
				if (((e < "0") || (e > "9"))) {
					if (e != "." && e != ",") {
						g = "- " + d + validatelang.Float.MustNumber;
						return g;
					}
				}
			}
		}
		return g;
	}
	function isEmpty(d, c) {
		var b = "";
		if (d.trim().length === 0) b = validatelang.Enter.PleaseEnter + c + "\n";
		return b;
	}
	function checkDropdown(d, c) {
		var b = "";
		if (d === null) d = "";
		if (d.length === 0 || d == " " || d === "") b = validatelang.Select.PleaseSelect + c + "\n";
		return b;
	}
	function checkEmail(e) {
		var b = "";
		if (e.length > 0) {
			var c = /^[^@]+@[^@]+\.[^@]{2,6}$/;
			if (!(c.test(e))) b = validatelang.Email.ValidEmail;
			else {
				var d = /[\+\(\)\<\>\,\;\:\\\"\[\]]/;
				if (e.match(d)) b = validatelang.Email.Illegal;
			}
		}else b = validatelang.Email.ValidEmail;
		return b;
	}
	function checkSelected(c, e) {
		var b = "- " + e + validatelang.Select.MustSelect;
		if (c.length > 0) {
			for (var d = 0; d < c.length; d++) {
				if (c[d].disabled === false && c[d].checked === true) b = "";
			}
		}else if (c.disabled === false && c.checked === true) b = "";
		return b;
	}
	function getRadioSelected(b) {
		if (b.length > 0) {
			for (var c = 0; c < b.length; c++) {
				if (b[c].disabled === false && b[c].checked === true) {
					return b[c].value;
				}
			}
		}else if (b.disabled === false && b.checked === true) return b.value;
		return null;
	}
	function checkSelectedX(c, h) {
		var b = "- " + h + validatelang.Select.MustSelect;
		var e = document.getElementById(c);
		var g = e.getElementsByTagName("td");
		var f;
		for (var d = 0; d < g.length; d++) {
			f = g[d].firstChild;
			if (f && (f.type == "checkbox" || f.type == "radio")) {
				if (f.disabled === false && f.checked === true) b = "";
			}
		}
		return b;
	}
	function checkSpaces(e, c) {
		var b = "";
		for (var d = 0; d < e.length; d++) {
			if (e.charAt(d) == " ") b = "- " + c + validatelang.Others.CannotContain + validatelang.Others.WhiteSpace;
		}
		return b;
	}
	function checkUrlChar(f, d) {
		var b = "";
		for (i = 0; i < f.length; i++) {
			var e = f.charAt(i);
			switch (e) {
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
					b = "- " + d + validatelang.Others.CannotContain + "[" + e + "] " + validatelang.Others.Character;
					return b;
			}
		}
		return b;
	}
	function isInteger(b) {
		var e;
		if (b.length === 0) return false;
		for (e = 0; e < b.length; e++) {
			var d = b.charAt(e);
			if (((d < "0") || (d > "9"))) return false;
		}
		return true;
	}
	function checkDate(c, b) {
		var e = "";
		if (c.length === 0) {
			e = validatelang.Enter.PleaseEnter + b + validatelang.CheckDate.ValidDate;
			return e;
		}
		return e;
	}
	function appendBreak(b) {
		return b += "\n";
	}
	String.prototype.trim = function() {
		a = this.replace(/^\s+/, "");
		return a.replace(/\s+$/, "");
	};

	function addEventSimple(d, c, b) {
		if (d.addEventListener) d.addEventListener(c, b, false);
		else if (d.attachEvent) d.attachEvent("on" + c, b);
	}
	function sendRequestSync(d, f, e) {
		var c = createXMLHTTPObject();
		if (!c) return;
		var b = (e) ? "POST" : "GET";
		c.open(b, d, false);
		c.setRequestHeader("User-Agent", "XMLHTTP/1.0");
		if (e) c.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		c.send(e);
		if (c.status === 200) return c.responseText;
	}
	var XMLHttpFactories = [
		function() { return new XMLHttpRequest(); },
		function() { return new ActiveXObject("Msxml2.XMLHTTP"); },
		function() { return new ActiveXObject("Msxml3.XMLHTTP"); },
		function() { return new ActiveXObject("Microsoft.XMLHTTP"); }
	];
	function createXMLHTTPObject() {
		var d = false;
		for (var c = 0; c < XMLHttpFactories.length; c++) {
			try {
				d = XMLHttpFactories[c]();
			} catch (b) {
				continue;
			}
			break;
		}
		return d;
	}
	for (var i = 0; i < document.forms.length; i++) {
		initCaptchaOnForm(document.forms[i]);
	}
	function initCaptchaOnForm(b) {
		if (b._CaptchaHookedUp) return;
		if (!b.CaptchaV2) return;
		if (!b.CaptchaHV2) return;
		b._CaptchaHookedUp = true;
	}
	function captchaIsInvalid(h, e, j) {
		if ((h._CaptchaTextValidated === true) && (h._CaptchaTextIsInvalid === false)) return "";
		if (typeof h.ReCaptchaChallenge != "undefined") {
			var c = Recaptcha.get_challenge();
			var g = Recaptcha.get_response();
			if (g.trim().length === 0) return "- " + e;
			h.ReCaptchaAnswer.value = Recaptcha.get_response();
			h.ReCaptchaChallenge.value = Recaptcha.get_challenge();
			var d = sendRequestSync("/ValidateCaptcha.ashx?key=" + c + "&answer=" + g + "&imageVerificationType=recaptcha");
			h._CaptchaTextIsInvalid = d == "false";
			h._CaptchaTextValidated = true;
			if (h._CaptchaTextIsInvalid) regenerateCaptcha(h);
		}else {
			var c = $(h).find('[name=CaptchaHV2]').val();
			var g = $(h).find('[name=CaptchaV2]').val();
			var b = 6;
			if (g.trim().length === 0) return "- " + e;
			if (g.length != b) h._CaptchaTextIsInvalid = true;
			else {
				var d = sendRequestSync("/ValidateCaptcha.ashx?key=" + c + "&answer=" + g);
				h._CaptchaTextIsInvalid = d == "false";
				h._CaptchaTextValidated = true;
				if (h._CaptchaTextIsInvalid) regenerateCaptcha(h);
			}
		}
		if (h._CaptchaTextIsInvalid) return "- " + j;
		return "";
	}
	function regenerateCaptcha(h) {
		h._CaptchaTextValidated = false;
		h._CaptchaTextIsInvalid = true;
		if (typeof h.ReCaptchaChallenge != "undefined") Recaptcha.reload();
		else {
			var d = sendRequestSync("/CaptchaHandler.ashx?Regenerate=true&rand=" + Math.random());
			h.CaptchaHV2.value = d;
			h.CaptchaV2.value = "";
			var j = h.getElementsByTagName("img");
			if (j.length === 0) {
				if ((h.parentNode.nodeName.toLowerCase() == "p") && (h.parentNode.nextSibling) && (h.parentNode.nextSibling.nodeName.toLowerCase() == "table") && (h.parentNode.nextSibling.className == "webform")) {
					j = h.parentNode.nextSibling.getElementsByTagName("img");
				}
			}
			for (var b = 0; b < j.length; b++) {
				var m = j[b].src;
				var c = m.toLowerCase();
				if (c.indexOf("/captchahandler.ashx") > -1) {
					var g = c.indexOf("?id=") + 4;
					var k = c.indexOf("&", g);
					var l = m.substring(g, k);
					var e = m.replace(l, d);
					j[b].src = e;
					break;
				}
			}
		}
	}
	function isNumericIfVisible(b, d) {
		var g = "";
		if (b.style.display == "inline") {
			if (b.value.length === 0) g = "- " + d + validatelang.Number.MustNumber;
			else {
				var f;
				for (f = 0; f < b.value.length; f++) {
					var e = b.value.charAt(f);
					if ((e < "0") || (e > "9")) {
						g = "- " + d + validatelang.Number.NoDecimal;
						return g;
					}
				}
			}
		}
		return g;
	}
	function checkIPAddress(c) {
		var b = /^\s*((0|[1-9]\d?|1\d{2}|2[0-4]\d|25[0-5])\.){3}(0|[1-9]\d?|1\d{2}|2[0-4]\d|25[0-5])\s*$/;
		if (b.test(c)) return "";
		return validatelang.IP.Illegal;
	}

	if (settings.steps === '' && settings.containers !== '') settings.steps = settings.containers;

	// setup some local variables
	var requiredFields,required=[],submitCount=0,
		errorArray=[],errorElement='<'+settings.errorGroupElement+' class="'+settings.errorGroupClass+'"></'+settings.errorGroupElement+'>',newRequired,pass={},
		errorTarget,successMessage,messageElement,selectorResponse,onChangeBinding,errorElementExists,errorCount=0,autoRequire,currentName,submitField,
		paymentMethods = selector.find('[name="PaymentMethodType"]'), onlyCCMethod = false,
		multistep = {containers: selector.find(settings.steps), step: 0},
		lockSubmit = false, messageBox = (settings.messageBoxID === null) ? $('<div id="ajaxresponse" />') : $('#'+settings.messageBoxID),
		messageBoxContents = $('#'+settings.messageBoxID).html(), customFlag = false,msg,
		labelFallback = {'Title' : 'Title', 'FirstName' : 'First Name', 'LastName' : 'Last Name', 'FullName' : 'Full Name', 'EmailAddress' : 'Email Address', 'Username' : 'Username', 'Password' : 'Password', 'HomePhone' : 'Home Phone Number', 'WorkPhone' : 'Work Phone Number', 'CellPhone' : 'Cell Phone Number', 'HomeFax' : 'Home Fax Number', 'WorkFax' : 'Work Fax Number', 'HomeAddress' : 'Home Address', 'HomeCity' : 'Home City', 'HomeState' : 'Home State', 'HomeZip' : 'Home Zip', 'HomeCountry' : 'Home Country', 'WorkAddress' : 'WorkAddress', 'WorkCity' : 'Work City', 'WorkState' : 'Work State', 'WorkZip' : 'Work Zip', 'WorkCountry' : 'Work Country', 'WebAddress' : 'Web Address', 'Company' : 'Company', 'DOB' : 'Date of Birth', 'PaymentMethodType' : 'Payment Method', 'BillingAddress' : 'Billing Address', 'BillingCity' : 'Billing City', 'BillingState' : 'Billing State', 'BillingZip' : 'Billing Zip Code', 'BillingCountry' : 'Billing Country', 'ShippingAddress' : 'Shipping Address', 'ShippingCity' : 'Shipping City', 'ShippingState' : 'Shipping State', 'ShippingZip' : 'Shipping Zip Code', 'ShippingCountry' : 'Shipping Country', 'ShippingInstructions' : 'Shipping Instructions', 'ShippingAttention' : 'Shipping Attention', 'Friend01' : 'Friend Email 1', 'Friend02' : 'Friend Email 2', 'Friend03' : 'Friend Email 3', 'Friend04' : 'Friend Email 4', 'Friend05' : 'Friend Email 5', 'Message' : 'Friend Message', 'Anniversary1Title' : 'Anniversary Title', 'Anniversary1' : 'Anniversary', 'Anniversary2Title' : 'Anniversary 2 Title', 'Anniversary2' : 'Anniversary 2', 'Anniversary3Title' : 'Anniversary 3 Title', 'Anniversary3' : 'Anniversary 3', 'Anniversary4Title' : 'Anniversary 4 Title', 'Anniversary4' : 'Anniversary 4', 'Anniversary5Title' : 'Anniversary 5 Title', 'Anniversary5' : 'Anniversary 5', 'FileAttachment' : 'File Attachment', 'CAT_Custom_1423_326' : 'Gender', 'CAT_Custom_1424_326' : 'Height', 'CAT_Custom_1425_326' : 'Marital Status', 'CAT_Custom_1426_326' : 'Has Children', 'CAT_Custom_1427_326' : 'Years in Business', 'CAT_Custom_1428_326' : 'Number of Employees', 'CAT_Custom_1429_326' : 'Annual Revenue', 'CAT_Custom_1430_326' : 'Financial Year', 'InvoiceNumber' : 'Invoice Number', 'CardName' : 'Name on Card', 'CardNumber' : 'Card Number', 'CardExpiryMonth' : 'Card Expiry Month', 'CardExpiryYear' : 'Card Expiry Year', 'CardType' : 'Card Type', 'CardCCV' : 'CCV Number', 'CaptchaV2' : 'Captcha'};

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
			CardNumber:			'number',
			CardCCV:			'number',
			Amount:				'currency',
			Password:			'password',
			PasswordConfirm:	'passwordconfirm',
			Days:				'days'
		},
		validation: {
			select:				function (required) {return checkDropdown(required.value, required.label)},
			radio:				function (required) {return checkSelected(selector.find('[name="'+required.name+'"]'), required.label)},
			checkbox:			function (required) {return checkSelected(selector.find('[name="'+required.name+'"]'), required.label)},
			email:				function (required) {return checkEmail(required.value)},
			date:				function (required) {return checkDate(required.value,required.label)},
			password:			function (required) {pass.value = required.value; pass.label = required.label; return (required.value !== "" && required.value.length < 6) ? "- Password must be 6 characters or longer" : isEmpty(required.value,required.label)},
			passwordconfirm:	function (required) {return (pass.value.length > 0 && pass.value !== required.value) ? pass.label+' and '+required.label+' do not match' : ''},
			captcha:			function (required) {return captchaIsInvalid(selector[0], "Enter Word Verification in box", "Please enter the correct Word Verification as seen in the image")},
			currency:			function (required) {return isCurrency(required.value, required.label)},
			number:				function (required) {return isNumeric(required.value, required.label)},
			days:				function (required) {return isNumericIfVisible(required.field, required.label)}
		}
	};

	function runValidation (required,counter,total) {
		var rdoChkFlag = false;
		if (counter===0) {errorCount=0;}

		// Check the field for a value change
		required.value = (typeof required.field.val() === 'undefined' || required.field.val() === null) ? '' : required.field.val();

		// verify field types and make adjustments to them as needed.
		if (required.type === 'text' || required.type === 'hidden' || required.type === 'password') {
			required.type = fieldCheck.types[required.name] || 'text';
		}

		for (var i=0; i<settings.customErrorFields.length; i++) {
			if (required.field.is(settings.customErrorFields[i])) {
				customFlag = true;
				break;
			}else customFlag = false;
		}
		if (customFlag === true && settings.customError !== '') {
			$.when(executeCallback(win[settings.customError],required)).then(function(value) {
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
			switch (required.type) {
				case 'radio' : errorTarget = selector.find('label[for="'+required.name+'"]'); rdoChkFlag=true; break;
				case 'checkbox' : errorTarget = selector.find('label[for="'+required.name+'"]'); rdoChkFlag = true; break;
				case 'captcha' : errorTarget = (selector.find('#recaptcha_widget_div').length > 0) ? selector.find('#recaptcha_widget_div') : required.field; break;
				default : errorTarget = required.field;
			}
			if (errorTarget.parent().is(settings.errorGroupElement+'.'+settings.errorGroupClass.replace(' ','.'))) {
				errorElementExists = true;
			}else {
				errorElementExists = false;
			}

			if (required.message !=='') {
				if (errorElementExists) {
					// just replace the error message
					errorTarget.siblings(settings.errorMessageElement+'.'+settings.errorClass.replace(' ','.')).text(required.message);
				}else {
					// add the message into new element
					messageElement = '<'+settings.errorMessageElement+' class="'+settings.errorClass+'">'+required.message+'</'+settings.errorMessageElement+'>';
					errorTarget.addClass(settings.errorClass).wrap(errorElement);
					if (rdoChkFlag) selector.find('[name="' + required.name + '"]').addClass(settings.errorClass);
					errorTarget.parent().append(messageElement);
				}
			}else if (errorElementExists) {
				// remove the element
				errorTarget.siblings(settings.errorMessageElement+'.'+settings.errorClass.replace(' ','.')).remove();
				errorTarget.removeClass(settings.errorClass).unwrap();
				if (rdoChkFlag) selector.find('[name="' + required.name + '"]').removeClass(settings.errorClass);
			}
		}
	}
	function buttonSubmitBehaviour(behavior){
		var submitButton = selector.find('[type="submit"]');
		switch(behavior){
			case 'show': submitButton.show(); break;
			case 'hide': submitButton.hide(); break;
			case 'disable': submitButton.attr('disabled','disabled'); break;
			case 'enable': submitButton.removeAttr('disabled'); break;
			default: submitButton.removeAttr('disabled').show();
		}
	}
	function submitForm(submitCount) {
		if (submitCount===0) {
			buttonSubmitBehaviour(settings.buttonOnSubmit);
			if (settings.useAjax) {
				$.ajax({
					type: 'POST',
					url: selector.attr('action'),
					data: selector.serialize(),
					success: function(response,status,xhr) {
						var messageClass = '';
						if (response.indexOf(settings.systemMessageClass) > 0) messageClass = settings.systemMessageClass;
						else if (response.indexOf(settings.systemErrorMessageClass) > 0) messageClass = settings.systemErrorMessageClass;

						if (messageClass !== '') msg = $(response).find('.'+messageClass);
						else if ($(response).is('font')) msg = $(response);

						if ($(msg).size() > 0) successMessage = msg;
						else if (messageClass !== '') {
							successMessage = $(response).filter('.'+messageClass);
							showSuccess(selector,successMessage);
						}

						if (response.indexOf(settings.systemMessageClass) > 0 && settings.ajaxSuccess !== null) executeCallback(window[settings.ajaxSuccess],response,status,xhr);
						else if (response.indexOf(settings.systemErrorMessageClass) > 0 && settings.ajaxError !== null) executeCallback(window[settings.ajaxError],xhr,status,error);
					},
					error: function(xhr,status) {
						if (settings.ajaxError !== null) executeCallback(window[settings.ajaxError],xhr,status,error);
						return false;
					},
					complete: function(xhr,status) {
						if (settings.ajaxComplete !== null) executeCallback(window[settings.ajaxComplete],xhr,status);
						buttonSubmitBehaviour(settings.buttonAfterSubmit);
					}
				});
			}else selector.off('submit').submit();
			return submitCount++;
		}else{
			alert("This form has already been submitted. Please refresh the page if you need to submit again.");
			return false;
		}
	}
	function executeCallback(callback,param1,param2,param3){
		if (typeof callback === 'function') {
			var deferred = $.Deferred();
			if (param3) deferred.resolve(callback(selector,param1,param2,param3));
			else if (param2) deferred.resolve(callback(selector,param1,param2));
			else if (param1) deferred.resolve(callback(selector,param1));
			else deferred.resolve(callback(selector));

			return deferred.promise();
		}
	}
	function showSuccess(selector,successMessage) {
		if (settings.afterAjax !== 'show') selector.fadeOut(0);

		if (successMessage.html().replace(/\n/g,'').replace(/	/g,'').replace(/ /g,'').length === 0 && settings.restoreMessageBox === true) successMessage = messageBoxContents;
		else if(successMessage.find('.search-results').length) successMessage = successMessage.find('.search-results').html();

		if (settings.messageBoxID !== null && settings.messageBox === 'replace') {
			if (settings.messageMode !== 'off') {
				if (settings.messageMode === 'append') selector.after(messageBox);
				else if (settings.messageMode === 'prepend') selector.before(messageBox);
				messageBox.html(successMessage).fadeIn();
			}
		}else if (settings.messageBox !== 'off') {
			if (settings.messageBox === 'append') selector.after(successMessage);
			else if (settings.messageBox === 'prepend') selector.before(successMessage);
			else body.find(settings.messageBox).html(successMessage);
		}

		if (settings.afterAjax === 'remove') selector.remove();
	}
	function buildRequiredObject(rField,i) {
		required[i] = {
			name : rField.attr('name'),
			field : rField,
			type : (rField.is('input')) ? rField.attr('type') : rField.get(0).tagName.toLowerCase(),
			value : (rField.val() === undefined) ? '' : rField.val(),
			label : (selector.find('label[for="'+rField.attr('name')+'"]').length > 0) ? selector.find('label[for="'+rField.attr('name')+'"]').text() : rField.attr('placeholder')
		};
		if (required[i].label === undefined) required[i].label = labelFallback[required[i].name];
	}
	function autoRequirePaymentFields(scope) {
		if (paymentMethods.size() == 1 && $(paymentMethods[0]).val() == '1') onlyCCMethod = true;
		if (paymentMethods.filter(':checked').val() == '1' || onlyCCMethod) {
			scope.find('[name="CardName"], [name="CardNumber"], [name="CardExpiryMonth"], [name="CardExpiryYear"], [name="CardType"], [name="CardCCV"]').addClass(settings.requiredClass);
		}else scope.find('[name="CardName"], [name="CardNumber"], [name="CardExpiryMonth"], [name="CardExpiryYear"], [name="CardType"], [name="CardCCV"]').removeClass(settings.requiredClass);
	}
	function BuildRequiredObjectArray(scope) {
		var i = 0,_this = null;
		required=[];
		// Build required array
		requiredFields = scope.find('input, select, button, textarea').filter('.'+settings.requiredClass);

		for(var cnt=0,len = requiredFields.size(); cnt < len; cnt++){
			_this = requiredFields[cnt];
			newRequired = scope.find('[name="'+$(_this).attr("name")+'"]').not('.'+settings.requiredClass);
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
			required.field.siblings(settings.errorMessageElement+'.'+settings.errorClass.replace(' ','.')).remove();
			required.field.removeClass(settings.errorClass).unwrap();
			if (required.type === 'checkbox' || required.type === 'radio') selector.find('[name="' + required.name + '"]').removeClass(settings.errorClass);
			--errorCount;
		}
	}
	function activeValidation(scope) {
		// Set onChangeBinding to true in order to prevent these bindings from occuring multiple times.
		onChangeBinding = true;
		for (var i = 0; i<required.length; i++) {
			scope.on('change','[name="' + required[i].name + '"]', function() {
				for (var i = 0;i<required.length;i++) {
					if ($(this).attr('name') === required[i].name) runValidation(required[i],0,1);
				}
			});
		}
	}
	function moveToContainer(index){
		// show/hide buttons
		if (index === 0) {
			selector.find(settings.submitField +','+ settings.backButton).hide();
			selector.find(settings.continueButton).show();
		}else if (index === multistep.containers.length - 1) {
			selector.find(settings.continueButton).hide();
			selector.find(settings.submitField +','+ settings.backButton).show();
		}else{
			selector.find(settings.continueButton +','+ settings.backButton).show();
			selector.find(settings.submitField).hide();
		}

		// show next step
		selector.find(multistep.containers).removeClass('activeContainer').hide();
		selector.find(multistep.containers[multistep.step]).addClass('activeContainer').show();
		selector.get(0).scrollIntoView();

	}

	buttonSubmitBehaviour(settings.buttonOnLoad);

	// Auto Require certain fields
	autoRequire = ['FirstName','LastName','FullName','EmailAddress','CaptchaV2','ItemName'];
	ccFields = ['CardName','CardNumber','CardExpiryMonth','CardExpiryYear','CardType','CardCCV'];

	for (var i = 0; i< autoRequire.length; i++) {
		autoRequire.field = selector.find('[name="'+autoRequire[i]+'"]');
		if (autoRequire.field.length > 0 && autoRequire.field.not('.'+settings.requiredClass)) autoRequire.field.addClass(settings.requiredClass);
	}

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

		selector.on('click',settings.continueButton,function(event){
			event.preventDefault();
			BuildRequiredObjectArray(selector.find(multistep.containers[multistep.step]));

			for (var i = 0; i<required.length; i++) {
				runValidation(required[i],i,required.length);
			}
			if (errorCount === 0) moveToContainer(++multistep.step);
			else if (settings.validateMode === 'inline') {
				// Now that submission has been attempted, allow active field validation.
				activeValidation(selector.find(multistep.containers[multistep.step]));
			}
		});

		selector.on('click',settings.backButton,function(event){
			event.preventDefault();
			for (var i = 0; i<required.length; i++) {
				resetRequiredField(required[i]);
			}
			moveToContainer(--multistep.step);
		});

		// prevent the enter key from submitting the form until the last step
		selector.on('keypress',function(e) {
			if (e.keyCode == 13) {
				e.preventDefault();
				if (selector.find(settings.continueButton).filter(':visible').size() > 0) selector.find(settings.continueButton).filter(':visible').trigger('click');
				else selector.find('[type="submit"]:visible').trigger('click');
			}
		});

	}

	// bind to the submit event of our form
	selector.on('submit',function(event) {
		event.preventDefault();

		BuildRequiredObjectArray(selector);

		if (lockSubmit) return false;
		else lockSubmit = true;
		if (settings.validateMode !== 'off') {
			for (var i = 0;i<required.length;i++) {
				runValidation(required[i],i,required.length);
			}
		}
		if (errorCount === 0) {
			if (settings.validationSuccess !== null) {
				$.when(executeCallback(win[settings.validationSuccess])).then(function(value) {
					if (value !== 'stop' && settings.noSubmit === false) submitForm(submitCount);
				});
			}else if (settings.noSubmit === false) submitForm(submitCount);
		}
		else
			if (settings.validationError !== null) executeCallback(window[settings.validationError]);
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
	if (settings.submitField !== '[type="submit"]' && settings.submitEvent !== null) {
		submitField = selector.find(settings.submitField);
		if (submitField.length > 0) {
			selector.on(settings.submitEvent,settings.submitField,function(){
				selector.submit();
			});
		}
	}
};

/*
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
		version: '2015.09.01',
		defaults: {
			bothWays : false,
			attributeType : 'name',
			clearOnUncheck : true,
			copy : null,
			altCopy : null,
			checkbox : null,
			altCheckbox : null,
			breakOnChange : false, // Requires bothWays:false
			prefix : '',
			suffix : '',
			copyType : 'simple', // concat,math,simple
			decimals : '', // rounds numbers to specified decimal when copyType is set to math
			scope : 'form', // Uses 'form' or css selectors as values
			event : 'change', // specify the event that triggers the copy
			ref : 'value', // html attribute or 'text'. Default is 'value'.
			target: 'value', // html attribute or 'text'. Default is 'value'.
			trim: false,
			convert: null // 'slug' will change the string to an appropriate url path
		}
	});

	// Setup our variables
	var copyGroup = (settings.scope === 'form') ? selector.closest('form') : $(doc).find(settings.scope),
		copyField, checkbox = copyGroup.find('['+settings.attributeType+'="'+settings.checkbox+'"]'),
		copyFields=[],altCopyFields=[],altCheckbox = copyGroup.find('['+settings.attributeType+'="'+settings.altCheckbox+'"]'),value;

	if (settings.decimals !== '') settings.decimals = parseInt(settings.decimals);

	if(settings.copyType=="simple"){
		settings.copy = settings.copy.replace(/\[/g,"").replace(/\]/g,"");
		copyFields.push(copyGroup.find('['+settings.attributeType+'="'+settings.copy+'"]').not(selector));
	}else{
		settings.bothWays = false;
		GetFieldsExpression(true);
	}

	function copyVal(selector,copyFields) {
		if(settings.copyType == "simple"){

			if (copyFields[0].is('select')) value = copyFields[0].find('option').filter(':selected');
			else if (copyFields[0].is('radio') || copyFields[0].is('checkbox')) value = copyFields[0].filter(':checked');
			else value = copyFields[0];

			if (settings.ref === 'text') value = value.text();
			else if (settings.ref === 'value') value = value.val();
			else if (settings.ref === 'html') value = value.html();
			else value = value.attr(settings.ref);

			if (typeof value !== 'undefined') {
				if (settings.trim === true) value = value.trim();

				if(value.length === 0 || ((settings.prefix.length > 0 || settings.suffix.length > 0) && settings.bothWays === true)) value = value;
				else value = settings.prefix + value + settings.suffix;
			}
		}else value = settings.prefix + GetFieldsExpression() + settings.suffix;

		if (settings.convert !== null) {
			if (settings.convert === 'slug') value = bcpie.utils.makeSlug(value);
			else if (settings.convert === 'lowercase') value = value.toLowerCase();
			else if (settings.convert === 'uppercase') value = value.toUpperCase();
		}

		if (settings.target === 'text' || settings.target === 'value') {
			if (selector.is('select,textarea,input')) selector.val(value);
			else selector.text(value);
		}else {
			selector.attr(settings.target,value);
		}


		if (selector.data('sameAsLastVal') !== selector.val()) {
			selector.trigger(settings.event+'.sameAs').trigger(settings.event);
			if (settings.event !== 'change') selector.trigger('change'); // restores the selector's native change behavior
			selector.data('sameAsLastVal',selector.val());
		}
	}
	function inputChange(selector,copyFields) {
		for (var i = copyFields.length - 1; i >= 0; i--) {
			$(copyFields[i]).on(settings.event+'.sameAs',function() {
				copyVal(selector,copyFields);
			});
		}

		if (settings.bothWays === true) {
			selector.on(settings.event+'.sameAs',function(){
				if (selector.val() !== copyFields[0].val()) {
					copyVal(copyFields[0],[selector]);
				}
			});
		}
	}
	function checkboxChange(chkbox,selector,copyFields) {
		if (chkbox.prop('checked')) {
			if(chkbox.attr(settings.attributeType) == settings.checkbox)
				altCheckbox.removeAttr('checked');
			else if(chkbox.attr(settings.attributeType) == settings.altCheckbox)
				checkbox.removeAttr('checked');

			copyVal(selector,copyFields);
			inputChange(selector,copyFields);
		}else {
			for (var i = copyFields.length - 1; i >= 0; i--) {
				copyFields[i].off(settings.event+'.sameAs');
			}
			selector.off(settings.event+'.sameAs');
			selector.val('');

			if (selector.data('sameAsLastVal') !== selector.val()) {
				selector.trigger(settings.event+'.sameAs').trigger(settings.event);
				if (settings.event !== 'change') selector.trigger('change'); // restores the selector's native change behavior
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
				return Math.round(expr.evaluate()*dec)/dec;
			}
			catch(e){
				return strExpression.replace(/\+/g,'').replace(/\-/g,'').replace(/\//g,'').replace(/\*/g,'').replace(/\)/g,'').replace(/\(/g,'');
			}
		}else if (settings.copyType == "concat") return strExpression;

		function GetfieldVal(str){
			var pattern = /\[.*?\]/g,
				fieldSelectors = str.match(pattern);

			for (var i = 0; i < fieldSelectors.length; i++) {
				copyFields.push(copyGroup.find(fieldSelectors[i].replace('[','['+settings.attributeType+'="').replace(']','"]')));

				if (copyFields[i].is('select')) value = copyFields[i].find('option').filter(':selected');
				else if (copyFields[i].is('radio') || copyFields[i].is('checkbox')) value = copyFields[i].filter(':checked');
				else value = copyFields[i];

				if (settings.ref === 'text') value = value.text();
				else if (settings.ref === 'value') value = value.val();
				else if (settings.ref === 'html') value = value.html();
				else value = value.attr(settings.ref);

				if (typeof value !== 'undefined') {
					if (settings.trim === true) value = value.trim();

					str = str.replace(fieldSelectors[i],value);
				}
			}

			return str;
		}
	}

	selector.data('sameAsLastVal',selector.val());

	// Choose which method to use
	if (checkbox.length || altCheckbox.length) {
		if(checkbox.length){
			checkboxChange(checkbox,selector,copyFields);
			checkbox.on(settings.event+'.sameAs',function(){
				checkboxChange(checkbox,selector,copyFields);
			});
			if (settings.breakOnChange !== false) {
				selector.on('change',function() {
					checkbox.off(settings.event+'.sameAs');
					for (var i = copyFields.length - 1; i >= 0; i--) {
						copyFields[i].off(settings.event+'.sameAs');
					}
					selector.off(settings.event+'.sameAs');
				});
			}
		}
		if(altCheckbox.length){
			checkboxChange(altCheckbox,selector,altCopyFields);
			altCheckbox.on(settings.event+'.sameAs',function(){
				checkboxChange(altCheckbox,selector,altCopyFields);
			});
			if (settings.breakOnChange !== false) {
				selector.on('change',function() {
					altCheckbox.off(settings.event+'.sameAs');
					for (var i = altCopyFields.length - 1; i >= 0; i--) {
						altCopyFields[i].off(settings.event+'.sameAs');
					}
					selector.off(settings.event+'.sameAs');
				});
			}
		}
	}else {
		copyVal(selector,copyFields);
		inputChange(selector,copyFields);
		if (settings.breakOnChange !== false) {
			selector.on('change',function() {
				for (var i = copyFields.length - 1; i >= 0; i--) {
					copyFields[i].off(settings.event+'.sameAs');
				}
				selector.off(settings.event+'.sameAs');
			});
		}
	}
};
/*
 * Secure
 * http://bcpie.com
 * Copyright 2015, ONE Creative
 * Free to use in BC Pie, or as licensed in Dev-in-a-Box from http://www.bcappstore.com/apps/dev-in-a-box
*/

bcpie.extensions.tricks.Secure = function(selector,options) {
	var settings = bcpie.extensions.settings(selector,options,{
		name: 'Secure',
		version: '2015.08.18',
		defaults: {
			unsecureLinks: true,
			onSessionEnd: '',
			sessionEndRedirect: '',
			securePayments: true,
			logoutPage: '',
			detectUser: false
		}
	});

	var blurTime,status,secure = win.location.origin === settings.secureDomain,links,href,interval;

	if (settings.securePayments === true) {
		if (selector.find('[name="Amount"]').length > 0 && secure === false) {
			win.location.href = settings.secureDomain+settings.pageAddress;
		}
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

	function updateCookie(property,value) {
		$.cookie(bcpie.globals.site.host+'-'+property,value,{expires: 365,path: '/'});
	}

	function unsecureLinks () {
		if (secure === true) {
			links = selector.find('a').not('[href^="mailto:"]').not('[href="/LogOutProcess.aspx"]');
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
			url: '/',
			type: 'GET',
			success: function(response) {
				if ($(response).filter('[data-isloggedin]').data('isloggedin') === 0) {
					if (settings.sessionEndRedirect !== '') win.location.href = settings.primaryDomain+settings.sessionEndRedirect;
					if (settings.onSessionEnd !== '') executeCallback(window[settings.onSessionEnd]);
					clearInterval(interval);
				}
			}
		});
	}
	function bindSessionEvents (argument) {
		interval = setInterval(function(){sessionBehavior();},900000); // 15min
		$(win).on('focus',function(){
			sessionBehavior();
		});
	}
	function executeCallback(callback){
		if(typeof callback === 'function') {
			var deferred = $.Deferred();
			deferred.resolve(callback());
			return deferred.promise();
		}
	}
};
/*
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
};
/*
 * "Trigger". An awesome trick for BC Pie.
 * http://bcpie.com
 * Copyright 2015, ONE Creative
 * Free to use in BC Pie, or as licensed in Dev-in-a-Box from http://www.bcappstore.com/apps/dev-in-a-box
*/

bcpie.extensions.tricks.Trigger = function(selector,options) {
	var settings = bcpie.extensions.settings(selector,options,{
		name: 'Trigger',
		version: '2015.09.17',
		defaults: {
			trigger: 'self', // use a css selector to specify which element will trigger the behavior. Default is 'self'.
			event: 'click', // specify an event to cause the trigger
			triggerValue: '', // value to be used in change event. Separate multiple values with commas.
			triggerAttr: 'value', // attribute to obtain the value from when using triggerValue.
			onClass: '', // css class to be applied
			offClass: '', // css class to be applied
			toggle: false, // if true, class will be toggled on events
			onCallback: '', // on callback
			offCallback: '', // off callback
			onValue: null, // specify default value when trigger is on
			offValue: null // specify default value when trigger is off
		}
	});

	var triggerEl = (settings.trigger === 'self') ? selector : $(settings.trigger);
	if (settings.triggerValue === true || settings.triggerValue === false) settings.triggerValue = settings.triggerValue.toString();
		settings.triggerValue = settings.triggerValue.split(',');

	// specified special event change, else a generic event of class application and callbacks will be applied
	switch(settings.event){
		case 'change':
			changeTrigger();
			triggerEl.on(settings.event,changeTrigger); break;
		default:
			triggerEl.on(settings.event,triggerEvent);
	}


	// Generic event for all events
	function triggerEvent(){
		if(settings.toggle === true) {
			if(selector.hasClass(settings.onClass) && settings.onClass !== '') {
				selector.removeClass(settings.onClass);
				changeValue('off');
				executeCallback(settings.offCallback);
			}else {
				selector.addClass(settings.onClass);
				changeValue('on');
				executeCallback(settings.onCallback);
			}
			if(selector.hasClass(settings.offClass) && settings.offClass !== '') {
				selector.removeClass(settings.offClass);
				changeValue('on');
				executeCallback(settings.onCallback);
			}else {
				selector.addClass(settings.offClass);
				changeValue('off');
				executeCallback(settings.offCallback);
			}
		}else {
			selector.addClass(settings.onClass);
			changeValue('on');
			executeCallback(settings.onCallback);
		}
	}
	function changeValue(state) {
		if (state === 'off') state = settings.offValue;
		else if (state === 'on') state = settings.onValue;
		if (state !== null) {
			if (selector.is('input,select,textarea')) selector.val(state);
			else selector.text(state);
		}
	}
	function changeTrigger(){
			var found = 0;
			for (var i=0; i<settings.triggerValue.length; i++) {
				if(GetValue(triggerEl) == settings.triggerValue[i]) found ++;
			}
			if(found > 0){
				selector.removeClass(settings.offClass).addClass(settings.onClass);
				changeValue('on');
				executeCallback(settings.onCallback);
			}else{
				selector.removeClass(settings.onClass).addClass(settings.offClass);
				changeValue('off');
				executeCallback(settings.offCallback);
			}
	}
	function GetValue(triggerElement) {
		var value;
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
			value = triggerElement.attr(settings.triggerAttr);
		}
		if (typeof value === 'undefined') value = '';
		return value.trim();
	}
	function executeCallback(callbackName){
		if(callbackName.length > 0){
			var callback = window[callbackName];
			if(typeof callback === 'function') {
				var deferred = $.Deferred();
				deferred.resolve(callback());
				return deferred.promise();
			}
		}

	}
};
/*
 * "Utility". An awesome trick for BC Pie.
 * http://bcpie.com
 * Copyright 2015, ONE Creative
 * Free to use in BC Pie, or as licensed in Dev-in-a-Box from http://www.bcappstore.com/apps/dev-in-a-box
*/

bcpie.extensions.tricks.Utility = function(selector,options) {
	var settings = bcpie.extensions.settings(selector,options,{
		name: 'Utility',
		version: '2015.09.02',
		defaults: {
			value: '',
			list: '', // options are countries, states, timezones.
		}
	});

	// take care of backwards compatibility first
	settings.value = settings.setValue || settings.value;
	settings.list = settings.getList || settings.list;
	if (settings.value !== '') settings.value = settings.value.toLowerCase();
	if (settings.list !== '') settings.list = settings.list.toLowerCase();

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
	}
	if (settings.list !== '') {
		var list='';
		if (settings.list === 'countries') {
			if (typeof body.data('bcCountries') === 'undefined') body.data('bcCountries',settings.countries);
			var countryData = body.data('bcCountries');
			for (var cc in countryData) {
				if (countryData.hasOwnProperty(cc)) {
					if (selector.is('select')) list += '<option value="'+cc+'">'+countryData[cc].Country+'</option>';
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