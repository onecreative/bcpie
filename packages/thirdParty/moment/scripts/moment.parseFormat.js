/* istanbul ignore next */
(function (root, factory) {
  /* istanbul ignore next */
  if (typeof exports === 'object') {
    module.exports = factory()
  } else {
    root.moment.parseFormat = factory()
  }
})(this, function () {
  var dayNames = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  var abbreviatedDayNames = [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  var shortestDayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
  var monthNames = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  var abbreviatedMonthNames = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  var amDesignator = 'AM'
  var pmDesignator = 'PM'
  var lowerAMDesignator = 'am'
  var lowerPMDesignator = 'pm'

  var regexDayNames = new RegExp(dayNames.join('|'), 'i')
  var regexAbbreviatedDayNames = new RegExp(abbreviatedDayNames.join('|'), 'i')
  var regexShortestDayNames = new RegExp('\\b(' + shortestDayNames.join('|') + ')\\b', 'i')
  var regexMonthNames = new RegExp(monthNames.join('|'), 'i')
  var regexAbbreviatedMonthNames = new RegExp(abbreviatedMonthNames.join('|'), 'i')

  var regexFirstSecondThirdFourth = /(\d+)(st|nd|rd|th)\b/i
  var regexEndian = /(\d{1,4})([\/\.\-])(\d{1,2})[\/\.\-](\d{1,4})/

  var regexTimezone = /((\+|\-)\d\d:\d\d)$/
  var amOrPm = '(' + [amDesignator, pmDesignator].join('|') + ')'
  var lowerAmOrPm = '(' + [lowerAMDesignator, lowerPMDesignator].join('|') + ')'
  var regexLowerAmOrPm = new RegExp(lowerAmOrPm)
  var regexUpperAmOrPm = new RegExp(amOrPm)
  var regexHoursWithLeadingZeroDigitMinutesSecondsAmPm = new RegExp('0\\d\\:\\d{1,2}\\:\\d{1,2}(\\s*)' + amOrPm, 'i')
  var regexHoursWithLeadingZeroDigitMinutesAmPm = new RegExp('0\\d\\:\\d{1,2}(\\s*)' + amOrPm, 'i')
  var regexHoursWithLeadingZeroDigitAmPm = new RegExp('0\\d(\\s*)' + amOrPm, 'i')
  var regexHoursMinutesSecondsAmPm = new RegExp('\\d{1,2}\\:\\d{1,2}\\:\\d{1,2}(\\s*)' + amOrPm, 'i')
  var regexHoursMinutesAmPm = new RegExp('\\d{1,2}\\:\\d{1,2}(\\s*)' + amOrPm, 'i')
  var regexHoursAmPm = new RegExp('\\d{1,2}(\\s*)' + amOrPm, 'i')

  var regexISO8601HoursWithLeadingZeroMinutesSecondsMilliseconds = /\d{2}:\d{2}:\d{2}\.\d{3}/
  var regexHoursWithLeadingZeroMinutesSeconds = /0\d:\d{2}:\d{2}/
  var regexHoursWithLeadingZeroMinutes = /0\d:\d{2}/
  var regexHoursMinutesSeconds = /\d{1,2}:\d{2}:\d{2}/
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

  var regexFillingWords = /\b(at)\b/i

  var regexUnixMillisecondTimestamp = /\d{13}/
  var regexUnixTimestamp = /\d{10}/

  // option defaults
  var defaultOrder = {
    '/': 'MDY',
    '.': 'DMY',
    '-': 'YMD'
  }

  function parseDateFormat (dateString, options) {
    var format = dateString

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
    // 23:39:43.331 ☛ 'HH:mm:ss.SS'
    format = format.replace(regexISO8601HoursWithLeadingZeroMinutesSecondsMilliseconds, 'HH:mm:ss.SSS')
    // 05:30:20pm ☛ hh:mm:ssa
    format = format.replace(regexHoursWithLeadingZeroDigitMinutesSecondsAmPm, 'hh:mm:ss$1')
    // 10:30:20pm ☛ h:mm:ssa
    format = format.replace(regexHoursMinutesSecondsAmPm, 'h:mm:ss$1')
    // 05:30pm ☛ hh:mma
    format = format.replace(regexHoursWithLeadingZeroDigitMinutesAmPm, 'hh:mm$1')
    // 10:30pm ☛ h:mma
    format = format.replace(regexHoursMinutesAmPm, 'h:mm$1')
    // 05pm ☛ hha
    format = format.replace(regexHoursWithLeadingZeroDigitAmPm, 'hh$1')
    // 10pm ☛ ha
    format = format.replace(regexHoursAmPm, 'h$1')
    // 05:30:20 ☛ HH:mm:ss
    format = format.replace(regexHoursWithLeadingZeroMinutesSeconds, 'HH:mm:ss')
    // 10:30:20 ☛ H:mm:ss
    format = format.replace(regexHoursMinutesSeconds, 'H:mm:ss')
    // 05:30 ☛ H:mm
    format = format.replace(regexHoursWithLeadingZeroMinutes, 'HH:mm')
    // 10:30 ☛ HH:mm
    format = format.replace(regexHoursMinutes, 'H:mm')

    // Check if AM and determine the case of 'a' we need
    if (regexUpperAmOrPm.test(dateString)) {
      format += 'A'
    } else if (regexLowerAmOrPm.test(dateString)) {
      format += 'a'
    }

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

    // now, the next number, if existing, must be a day
    format = format.replace(regexDayLeadingZero, 'DD')
    format = format.replace(regexDay, 'D')

    // last but not least, there could still be a year left
    format = format.replace(regexYearShort, 'YY')

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
      if (preferredOrder[0] === 'M') {
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

  return parseDateFormat
})