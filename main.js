var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');

var template = {
  HTML : function(title, list, body, controll) {
    var template = `
          <!doctype html>
          <html>
          <head>
            <title>WEB1 - ${title}</title>
            <meta charset="utf-8">
          </head>
          <body>
            <h1><a href="/">Web3</a></h1>
            ${list}
            ${controll}
            <h2>${title}</h2>
            ${body}
          </body>
          </html>
          `;
    return template;
  },
  list : function(files) {
    var list = '<ul>';
    for (var i = 0; i < files.length; i++) {
      list += `<li><a href='/?id=${files[i]}'>${files[i]}</a></li>`;
    }
    list += '</ul>';
    return list;
  }
}

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url,true).query;
    var pathname = url.parse(_url, true).pathname;

    if (pathname === '/') {
      if(queryData.id === undefined) {
        // 홈화면
        fs.readdir('data', function(err, files) {
          var list = template.list(files);
          var title = 'Welcome';
          var description = 'Hello Node.js';
          var html = template.HTML(title, list, 
            `<p>${description}</p>`,
            `<a href="/create">create</a>`
            );
          response.writeHead(200);
          response.end(html);
        });
      } else {
        fs.readdir('data', function(err, files){
          fs.readFile(`data/${queryData.id}`, 'utf-8', function(err, description) {
            var list = template.list(files);
            var title = queryData.id;
            var html = template.HTML(title, list, 
              `<p>${description}</p>`,
              ` <a href="/create">create</a>
                <a href="/update?id=${title}">update</a>
                <form action='/delete_process' method='post'>
                  <input type='hidden' name='id' value='${title}'/>
                  <input type='submit' value='delete'/>
                </form>
               `);
            response.writeHead(200);
            response.end(html);
          });
        });
      }
    } else if(pathname === '/create'){
      fs.readdir('data', function(err, files) {
        var list = template.list(files);
        var title = 'Welcome-create';
        var html = template.HTML(title, list, `
          <form action='/create_process' method='post'>
            <p><input type='text' name='title' placeholder='title' /></p>
            <p><textarea name='description' placeholder='description'></textarea></p>
            <p><input type='submit' /></p>
          </form>
        `, '');
        response.writeHead(200);
        response.end(html);
      });
    } else if (pathname === '/create_process') {
      var body = '';
      request.on('data', function(data) {
        body += data;
      });
      request.on('end', function() {
        var post = qs.parse(body);
        var title = post.title;
        var description = post.description;
        
        fs.writeFile(`data/${title}`, description, 'utf8', function(err) {
          response.writeHead('302', {Location: `/?id=${title}`});
          response.end();
        });
      });
    } else if (pathname === '/update') {
      fs.readdir('data', function(err, files){
        fs.readFile(`data/${queryData.id}`, 'utf-8', function(err, description) {
          var list = template.list(files);
          var title = queryData.id;
          var html = template.HTML(title, list,`
            <form action='/update_process' method='post'>
              <input type='hidden' name='id' value='${title}' />
              <p><input type='text' name='title' placeholder='title' value='${title}' /></p>
              <p><textarea name='description' placeholder='description'>${description}</textarea></p>
              <p><input type='submit' /></p>
            </form>
            `,
            `<a href="/create">create</a> <a href="update?id=${title}">update</a>`);
          response.writeHead(200);
          response.end(html);
        });
      });
    } else if (pathname === '/update_process') {
      var body = '';
      request.on('data', function(data) {
        body += data;
      });
      request.on('end', function() {
        var post = qs.parse(body);
        console.log(post);
        var title = post.title;
        var description = post.description;
        var id = post.id;

        fs.rename(`data/${id}`, `data/${title}`, function(error) {
          fs.writeFile(`data/${title}`, description, 'utf8', function(err) {
            response.writeHead('302', {Location: `/?id=${title}`});
            response.end();
          });  
        });
      });
    } else if (pathname === '/delete_process') {
      var body = '';
      request.on('data', function(data) {
        body += data;
      });
      request.on('end', function() {
        var post = qs.parse(body);
        var id = post.id;

        fs.unlink(`data/${id}`, function(error) {
          response.writeHead('302', {Location: `/`});
          response.end();
        });
      });
    } else {
      response.writeHead(404);
      response.end('Not found');
    }
});
app.listen(3000);