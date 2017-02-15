// Link to add bot to your server/guild:
// https://discordapp.com/api/oauth2/authorize?client_id=276798082857828354&scope=bot&permissions=0

var fs = require("fs");
var _ = require('lodash');
var http = require('http');
const Discord = require('discord.js');
var request = require('request');
const client = new Discord.Client();

var botID = "276798082857828354";

var albums = [];   //has attributes album name and year
var songs = [];      //non instrumentals only, has attributes (song) name, album, lyrics

var sessions = {};

var correctSongName;
var correctSongIndex;
var lyricsMode = false;
var chatbrainID;

client.on('ready', () => {

    var content = fs.readFileSync('DiscographyWithLyrics.json');
    content = JSON.parse(content);

    for (var album in content) {

        albums.push({name: album, year: content[album].year});
        var songsInAlbum = content[album].songs;

        for(i in songsInAlbum){

            var song = songsInAlbum[i];

            if(!song.instrumental){
                songs.push({name: song.songName, album: album, lyrics: song.lyrics.replace(/&quot;/g, "'")});
            }

        }

    }

    console.log("Ready");

});

client.on('message', message =>{

    //to only read messages sent by other users
    if(message.author.id != botID){

        var serverID = message.channel.guild.id;

        //new server
        if(sessions[serverID] == undefined){

            sessions[serverID] =
            {
                correctSongName,
                correctSongIndex,
                lyricsMode: false,
                chatbrainID: serverID,
                scores: {}
            };
        }

        //session with server already exists, get data
        else{
            correctSongName = sessions[serverID].correctSongName;
            correctSongIndex = sessions[serverID].correctSongIndex;
            lyricsMode = sessions[serverID].lyricsMode;
            chatbrainID = sessions[serverID].chatbrainID;
        }

        //expecting answer
        if(lyricsMode){

            var answer = message.content;

            if(answer.length == 1 && !isNaN(answer) && parseInt(answer) < 6 && parseInt(answer) > 0){

                answer = parseInt(answer);
                var authorID = message.author.id;

                if(answer == correctSongIndex){

                    message.channel.sendMessage("Yep! That's the correct answer.");

                    if(sessions[serverID].scores[authorID] == undefined){
                        sessions[serverID].scores[authorID] = 1;
                    }

                    else{
                        sessions[serverID].scores[authorID]++;
                    }
                    var score = sessions[serverID].scores[authorID];
                }
                else{
                    message.channel.sendMessage("Nope. The correct answer was: '" + correctSongName + "'");
                    sessions[serverID].scores[authorID] = 0;
                }
                message.reply("Your current score is: " + sessions[serverID].scores[authorID]);
                sessions[serverID].lyricsMode = false;
            }

        }

        if(message.content == "]]help"){

            var help = "Here are all the commands for this bot: " + "\n \n" +
            "*]]lyrics* : Starts the lyrics game" + "\n" +
            "*]]lyrics* *song name*: returns the lyrics of the specified song." + "\n" +
            "*]]help*: Sends author of message a PM containing commands." + "\n" +
            "*]]]whatever*: Triggers the smart bot. Type anything after ]]] (three not two) and you should get a reply. ie: ]]]hello"

            message.author.sendMessage(help);
            message.reply("I've sent you a PM with all the useful commands.");
        }

        if(message.content == "]]who is the most awesome person ever?"){
            message.reply('LuciferSam is. He is also my father.')
        }

        //show lyrics of song
        if(message.content.indexOf(']]lyrics') != -1 && message.content != "]]lyrics"){

            var songName = message.content.substring("]]lyrics".length).trim().toLowerCase();

            var lyrics;
            var formattedName;

            for(var i = 0; i < songs.length ; i++){

                if(songs[i].name.toLowerCase() == songName){
                    lyrics = songs[i].lyrics;
                    formattedName = songs[i].name;
                }
            }

            if(lyrics == undefined){
                message.channel.sendMessage("Sorry I couldn't find that song. Check for spelling mistakes.")
            }
            else{
                message.channel.sendMessage("Here are the lyrics to *" + formattedName + "*" + "\n"+ lyrics);
            }

        }

        //lyrics game
        if(message.content ==  "]]lyrics"){

            do {
                var randomIndex = Math.floor(Math.random() * songs.length);
                var randomSong = songs[randomIndex];
                var lyrics = randomSong.lyrics;
            }
            while(lyrics == "Lyrics not found" || lyrics.split("\n").length - 1 < 3);

            var songLyrics = randomSong.lyrics.split("\n");

            var randLyricsIndex = Math.floor(1 + (Math.random() * songLyrics.length - 3));

            var line1 = songLyrics[randLyricsIndex];
            var line2 = songLyrics[randLyricsIndex + 1];
            var line3 = songLyrics[randLyricsIndex + 2];

            //lyrics to send to server
            var lyrics = [line1, line2, line3];

            //choices
            var correctAnswer = randomSong.name;  //one of the choices

            var choices = [];
            choices.push(correctAnswer);

            while(choices.length != 5){

                var choice = songs[Math.floor(Math.random() * songs.length)].name;

                //to avoid duplicate choices (although very unlikely)
                if(choices.indexOf(choice) == -1){
                    choices.push(choice);
                }
            }

            var shuffled = _.shuffle(choices);
            var correctIndex = shuffled.indexOf(correctAnswer) + 1;

            var i = 0;

            shuffled = shuffled.map(function(a){
                return "**" + (++i) + "**: " + a;
            });

            message.channel.sendMessage("*What song are these lyrics from? Choose an answer by sending `1`, `2`, etc.*" );
            message.channel.sendMessage(lyrics);
            message.channel.sendMessage(shuffled);

            sessions[serverID].correctSongIndex = correctIndex;
            sessions[serverID].correctSongName = correctAnswer;
            sessions[serverID].lyricsMode = true;
        }

        //smart bot for other replies
        if(message.content.indexOf("]]]") != -1){

            var mess = message.content.substring(3, message.length).replace(" ", "+");
            var id = sessions[serverID].chatbrainID;
            var url = "http://api.acobot.net/get?bid=539&key=UUNCBClsR71hvZG9&uid=" + id + "&msg=" + mess;
            request(url, function(error, response, body) {
                var reply = JSON.parse(body)['cnt'];
                message.channel.sendMessage(reply);
            });
        }

    }

});

client.login('Mjc2Nzk4MDgyODU3ODI4MzU0.C3UgIA.0oIt6ovSpBTcBBf83xqsl4MrphA');

var server = http.createServer(function(req,res){

    //

});

server.on('listening',function(){
    console.log('Server is running');
});

server.listen(process.env.PORT || 5050);

//to keep the bot always awake
setInterval(function(){
    http.get("http://pinkfloydbot.herokuapp.com")
}, 300000)
