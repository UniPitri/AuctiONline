var http = require('http');
var port = 3000;
var requestHandler = function(request, response) {
const { method, url, headers } = request;
console.log(request.url);
response.end('Hello World!');
}
var server = http.createServer(requestHandler);
server.listen(port);