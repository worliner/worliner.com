
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , url = require('url');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.get('/:id', function(request, response){
  var requrl = url.parse(request.params.id).pathname;
  var scrape = require('./scrape');
  scrape.getWebData("http://" + requrl, function(data){
    //if(data.favicon_uri)
    //    data.favicon_uri = data.favicon_uri.substring(0, 50) + "...";
    response.send("\n--------------------REQUEST:" + requrl + " RESPONSE--------------------\nURL:" + data.url + "\nTitle:" + data.title + "\nDescription:" + data.description + "\nCharset:" + data.charset + "\nIsSafe:" + data.isSafe + "\nFaviconURILength:" + data.favicon_uri + "\n");
    console.log("responsed:" + data.url);
  });
});

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
//app.use(express.static(path.join(__dirname, 'public')));


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});