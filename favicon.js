const TIMEOUT = 2000;
const prefix = "data:image/x-icon;base64,";
const worliner = "data:image/x-icon;base64, notfound notfound notfound notfound notfound notfound notfound notfound notfound notfound notfound notfound notfound notfound notfound notfound "

exports.loadBase64Image = function (url, callback) {
    var request = require('request');
    console.log(url);
    request({url: url, encoding: null}, function (err, res, body) {
        if (!err && res.statusCode == 200) {
            var base64prefix = 'data:image/x-icon;base64,'
                , image = body.toString('base64');
            if (typeof callback == 'function') {
                callback(base64prefix + image);
            }
        } else {
            //throw new Error('Can not download image');
            callback(null);
        }
    });
};

//loadBase64Image('http://www.yahoo.co.jp/favicon.ico', function (uri) {
//    console.log( "<img src=\"%s\"/>", uri);
//});