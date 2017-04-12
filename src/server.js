var http = require('http');

var server = http.createServer();

  server.on('listening',function(){
      console.log('Server is running');
    });

server.listen(process.env.PORT || 5050);
