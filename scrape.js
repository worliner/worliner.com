const API_KEY = 'ABQIAAAAKl1hv9gunT7c7fghyrO54xTfFarIsvho0mhMeiZmG-x8X50Gng';
const HTML_TIMEOUT = 2000;

var util    = require("util");
var urlutil = require("url");
var http    = require('http');
var maxreq = 100;
var counter = 0;
var https   = require('https');
var Iconv   = require("iconv").Iconv;
var cheerio = require('cheerio');
var fs = require('fs');
var googleSafe = require('safe-browse');
var charsetDetector = require("node-icu-charset-detector");
var CharsetMatch = charsetDetector.CharsetMatch;

var reHead = new RegExp('<head[\\s>]([\\s\\S]*?)<\\/head>', 'i');
var reCharset = new RegExp('<meta[^>]*[\\s;]+charset\\s*=\\s*["\']?([\\w\\-_]+)["\']?', 'i');
var reDesc = new RegExp('<meta.*?name="description".*?content="(.*?)".*?>|<meta.*?content="(.*?)".*?name="description".*?>', 'i');

var getWebPageTitle = function(url, callback) {
	var web = new Object();
  	var urlElements = urlutil.parse(url, false);
  	web.url = url;
  	web.favicon_url = util.format("http://%s/favicon.ico", urlElements.host);
  	console.log(web.favicon_url);
  	var requester = (urlElements.protocol === 'https:') ? https : http;
	var options = {
		host: urlElements.hostname,
		port: urlElements.port,
		path: urlElements.path,
		headers: {'user-agent': 'node title fetcher'}
	};


	var request = requester.get(options, function(response) {
		var binaryText = '';
		response.setEncoding('binary');
		response.on('data', function(chunk) {
			binaryText += chunk
		});

		response.on('end',function() {
			if(binaryText)
			{
				var textBuffer = new Buffer(binaryText, 'binary');
				var charsetMatch = new CharsetMatch(textBuffer);
				var text = bufferToString(textBuffer, charsetMatch.getName());
				var $ = cheerio.load(text);

				web.head = text.match(reHead);
				web.body = $('body');
				web.title = $('title').text().replace(/\n/g, '');
				web.title = (web.title === '') ? util.format("couldn't find title from %s", url) : web.title;
				if(text.match(reDesc) && text.match(reDesc).length > 0)
					web.description = text.match(reDesc)[1];
				web.charset = charsetMatch.getName();
			}
			//console.log("FInish Scraping");
			console.log("FInish Scraping:" + web.url);
			callback(web);
				//callback(web);
			//}
			//else 
			//{
			//	callback(web);
			//}
		});
	});

		request.setTimeout(2000, function() {
			console.log("REQUEST TIMEOUT:getWebPageTitle:" + web.url);
			request.end();
		});

		request.on('error', function(error) {
			console.log("REQUEST ERROR:getWebPageTitle:" + error + web.url);
			request.end();
			//callback(util.format("couldn't fetch web page from %s", url));
			
		});
	};

function reqGoogleSafeBrowseAPI(web, callback){
	var api = new googleSafe.Api(API_KEY);
	api.lookup(web.url)
	.on('success', function(){
		web.isSafe = true;
		callback(web);
	})
	.on('error', function(){
		web.isSafe = false;
		callback(web);
	});
}

function reqFaviconURI(web, callback){
	var fav = require('./favicon');
	fav.loadBase64Image(web.favicon_uri, function(uri){
		web.favicon_uri = uri;
		callback(web);
		//if(callback) callback(web)
	})
}

var bufferToString = function(buffer, charset) {
  try {
    return buffer.toString(charset);
  } catch(error) {
    charsetConverter = new Iconv(charset, 'UTF-8//TRANSLIT//IGNORE');
    return charsetConverter.convert(buffer).toString();
  }
};

exports.getWebData = function (url, opt_callback){
	getWebPageTitle(url, function(web) {
		//var fav = require('./favicon');
		//fav.loadBase64Image(web.favicon_url, function(uri){
		//	web.favicon_uri = uri;
		opt_callback(web);
	});
	
};

