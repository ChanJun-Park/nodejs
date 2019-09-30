var http = require('http');
var fs = require('fs');
var url = require('url');

function templateHTML(title, list, body) {
  var template = `
        <!doctype html>
        <html>
        <head>
          <title>WEB1 - ${title}</title>
          <meta charset="utf-8">
        </head>
        <body>
          <h1><a href="/">Web</a></h1>
          ${list}
          <h2>${title}</h2>
          ${body}
        </body>
        </html>
        `;
  return template;
}

function templateList(files) {
  var list = '<ul>';
  for (var i = 0; i < files.length; i++) {
    list += `<li><a href='/?id=${files[i]}'>${files[i]}</a></li>`;
  }
  list += '</ul>';
  return list;
}

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url,true).query;
    var pathname = url.parse(_url, true).pathname;

    if (pathname === '/') {
      if(queryData.id === undefined) {
        // 홈화면
        fs.readdir('data', function(err, files) {
          var list = templateList(files);
          var title = 'Welcome';
          var description = 'Hello Node.js';
          var template = templateHTML(title, list, `<p>${description}</p>`);
          response.writeHead(200);
          response.end(template);
        });
      } else {
        fs.readFile(`data/${queryData.id}`, 'utf-8', function(err, description) {
          fs.readdir('data', function(err, files){
            var list = templateList(files);
            var title = queryData.id;
            var template = templateHTML(title, list, `<p>${description}</p>`);
            response.writeHead(200);
            response.end(template);
          });
        });
      }
      
    } else {
      response.writeHead(404);
      response.end('Not found');
    }
});
app.listen(3000);