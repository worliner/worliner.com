const API_KEY = 'ABQIAAAAKl1hv9gunT7c7fghyrO54xTfFarIsvho0mhMeiZmG-x8X50Gng';
const TIMEOUT = 2000;

var reqCount = 0;
var util    = require("util");
var urlutil = require("url");
var http    = require('http');
var https   = require('https');
var Iconv   = require("iconv").Iconv;
var cheerio = require('cheerio');
var hash = require('./hashgen');
var fs = require('fs');
var googleSafe = require('safe-browse');
var charsetDetector = require("node-icu-charset-detector");
var CharsetMatch = charsetDetector.CharsetMatch;
var web = new Object();
var reHead = new RegExp('<head[\\s>]([\\s\\S]*?)<\\/head>', 'i');
var reCharset = new RegExp('<meta[^>]*[\\s;]+charset\\s*=\\s*["\']?([\\w\\-_]+)["\']?', 'i');
var reDesc = new RegExp('<meta.*?name="description".*?content="(.*?)".*?>|<meta.*?content="(.*?)".*?name="description".*?>', 'i');

function getMetaData(url, callback) {
	
  	var urlElements = urlutil.parse(url, false);
  	web.url = url;
  	web.favicon_url = util.format("http://%s/favicon.ico", urlElements.host);

  	//getFaviconURI(web, function(web, callback){
	//	isFinishGetIsSafety = true;
	//	validateWebData(web, callback);
  	//});

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
			//getIsSafety(web,callback);
			web.shorten_url = hash.randuid(5);
			callback(web);
		});
	});

		request.setTimeout(5000, function() {
			console.log("REQUEST TIMEOUT:getWebPageTitle:" + web.url);
			request.end();
			callback(web);
		});

		request.on('error', function(error) {
			console.log("REQUEST ERROR:getWebPageTitle:" + error + web.url);
			request.end();
			callback(web);
		});
	};

function getIsSafety(web, callback){
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

function getFaviconURI(web, callback){
	var fav = require('./favicon');
	fav.loadBase64Image(web.favicon_url, function(uri){
		web.favicon_uri = uri;
		callback(web);
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

var isFinishGetMetaData = false;
var isFinishGetIsSafety = false;
var isFinishGetFaviconURI = false;

exports.getWebData = function (url, opt_callback){
	reqCount += 1;
	web = new Object();
  	var urlElements = urlutil.parse(url, false);
  	web.url = url;
  	web.favicon_url = util.format("http://%s/favicon.ico", urlElements.host);

	isFinishGetMetaData = false;
	isFinishGetIsSafety = false;
	isFinishGetFaviconURI = false;

	getMetaData(url, function(web, callback){
		isFinishGetMetaData = true;
		validateWebData(web, opt_callback);
	});

	getIsSafety(web, function(web, callback){
		isFinishGetIsSafety = true;
		validateWebData(web, opt_callback);
	});

	getFaviconURI(web, function(web, callback){
		isFinishGetFaviconURI = true;
		validateWebData(web, opt_callback);
	});

	console.log(reqCount);
};

function validateWebData(web, opt_callback){
	if(isFinishGetMetaData && isFinishGetMetaData && isFinishGetFaviconURI)
		opt_callback(web);
}


