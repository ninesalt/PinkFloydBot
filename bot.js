var fs = require("fs");
var _ = require('lodash');

var express = require('express');
const app = express();

const Discord = require('discord.js');
var request = require('request');
const client = new Discord.Client();

var albums = [];   //has attributes album name and year
var songs = [];      //non instrumentals only, has attributes (song) name, album, lyrics

var correctSongName;
var correctSongIndex;

var chatbrainID = Math.floor(Math.random()  * 1000000);

client.on('ready', () => {

    var content = fs.readFileSync('DiscographyWithLyrics.json');
    content = JSON.parse(content);

    for (var album in content) {

        albums.push({name: album, year: content[album].year});
        var songsInAlbum = content[album].songs;

        for(i in songsInAlbum){

            var song = songsInAlbum[i];

            if(!song.instrumental){
                songs.push({name: song.songName, album: album, lyrics: song.lyrics});
            }

        }

    }

    console.log("I am ready");
});

client.on('message', message =>{

    if(message.content == "]]who is the most awesome person ever?"){
        message.reply('You are, LuciferSam. You are also my father.')
    }

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
        correctSongName = correctAnswer;
        var choice2 = songs[Math.floor(Math.random() * songs.length)].name;
        var choice3 = songs[Math.floor(Math.random() * songs.length)].name;
        var choice4 = songs[Math.floor(Math.random() * songs.length)].name;
        var choice5 = songs[Math.floor(Math.random() * songs.length)].name;

        var choices = [correctAnswer, choice2, choice3, choice4, choice5];
        var shuffled = _.shuffle(choices);
        var correctIndex = shuffled.indexOf(correctAnswer) + 1;
        correctSongIndex = correctIndex;

        var i = 0;

        shuffled = shuffled.map(function(a){
            return "**" + (++i) + "**: " + a;
        });


        message.channel.sendMessage("*What song are these lyrics from? Choose an answer by sending ]]1, ]]2, etc.*");
        message.channel.sendMessage(lyrics);
        message.channel.sendMessage(shuffled);

    }

    //smart bot for other replies
    if(message.content.indexOf("]]]") != -1){

        var mess = message.content.substring(3, message.length).replace(" ", "+");
        var url = "http://api.acobot.net/get?bid=539&key=UUNCBClsR71hvZG9&uid=" + chatbrainID+ "&msg=" + mess;
        request(url, function(error, response, body) {
            var reply = JSON.parse(body)['cnt'];
            message.channel.sendMessage(reply);
        });
    }



});

client.login('Mjc2Nzk4MDgyODU3ODI4MzU0.C3UgIA.0oIt6ovSpBTcBBf83xqsl4MrphA');
app.listen('port', (process.env.PORT || 5000));
