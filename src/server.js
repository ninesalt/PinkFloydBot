var http = require('http');
var AutoUpdater = require('auto-updater');

module.exports.run = function(){

    var autoupdater = new AutoUpdater({
        pathToJson: '',
        autoupdate: true,
        checkgit: true,
        jsonhost: 'https://raw.githubusercontent.com/Swailem95/PinkFloydBot/master/package.json',
        contenthost: 'https://github.com/Swailem95/PinkFloydBot/archive/master.zip',
        progressDebounce: 0,
        devmode: false
    });

    autoupdater.on('check.out-dated', function(v_old, v) {
        console.warn("Your version is outdated. " + v_old + " of " + v);
        autoupdater.fire('download-update');
    });


    var server = http.createServer();

    server.on('listening',function(){
        console.log('Server is running');
    });

    server.listen(process.env.PORT || 5050);

    autoupdater.fire('check');

    //to keep the bot awake 

    // setInterval(function(){
    //     http.get("http://pinkfloydbot.herokuapp.com")
    // }, 300000)

}
