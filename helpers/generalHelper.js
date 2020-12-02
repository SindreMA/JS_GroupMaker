const momentdur = require('moment-duration-format');
const moment = require('moment');
const logger = require('../globals').logger


module.exports = {
    FormatTimeUsed(time) {
        return moment.duration(time).format("hh:mm:ss");
      },
      FormatTimeAgo(time) {
        return moment((time - 5 ) * 1000).fromNow();
      },
      capitalize(s) {
        if (typeof s !== 'string') return ''
        return s.charAt(0).toUpperCase() + s.slice(1)
      },
      
   string_to_slug (str) {
  str = str.replace(/^\s+|\s+$/g, ''); // trim
  str = str.replace(/[']+/g, '')
  str = str.toLowerCase();

  // remove accents, swap ñ for n, etc
  var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
  var to   = "aaaaeeeeiiiioooouuuunc------";
  for (var i=0, l=from.length ; i<l ; i++) {
      str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  }

  str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
      .replace(/\s+/g, '-') // collapse whitespace and replace by -
      .replace(/-+/g, '-'); // collapse dashes

  return str;
}
}