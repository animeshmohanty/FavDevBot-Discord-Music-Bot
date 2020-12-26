// const {Client, Attachment} = require('discord.js');const bot = new Client();

// const ytdl = require("ytdl-core");

// const token = 'NzkwMjgzNzAwMjY4NTY0NTQx.X9-XDA.7x03WK5UtW1n17zX3Vw9tBULt5U';

// const PREFIX = '!';

// var version = '1.0.1';

// var servers = {};

// bot.on('ready', () => {
//     console.log('Fav Devs bot is online woohoo!');
// })

// bot.on('message', message=>{
    
//     let args = message.content.substring(PREFIX.length).split(" ");

//     switch(args[0]){ 

//         case 'play':

//             function play(connection, message){ 
//                 var server = servers[message.guild.id];

//                 server.dispatcher = connection.playStream(ytdl(server.queue[0], {filter: "audioonly"})); 

//                 server.queue.shift();     

//                 server.dispatcher.on("end", function(){
//                     if(server.queue[0]){
//                         play(connection, message);
//                     }else {
//                         connection.disconnect();
//                     }
//                 });
            
//             }

//             if(!args[1]) {
//                 message.channel.send("you need to provide a link!");
//                 return;
//             }

//             if(!message.member.voiceChannel) {
//                 message.channel.send("You must be in a channel to pwayy!");
//                 return;
//             }

//             if(!servers[message.guild.id]) servers[message.guild.id] = {
//                 queue: []
//             }

//             var server = servers[message.guild.id];

//             server.queue.push(args[1]);

//             if(!message.guild.voiceConnection) message.member.voiceChannel.join().then(function(connection){
//                 play(connection, message);
//             })

//         break;
        
//         case 'ding':
//             message.reply('dong!')
//             break;

//         case 'stuti':
//             message.reply('https://www.linkedin.com/in/stutisehgal/')
//             break;     

//         case 'animesh':
//             message.reply('https://www.linkedin.com/in/hokage7')
//             break;
            
//         case 'info' :
//             if(args[1] === 'version') {
//                 message.reply('Version ' + version);
//             }
//             else if(args[1] === 'authors') {
//                 message.reply('Animesh Mohanty');
//             }   
//             else if (args[1] === 'validators') {
//                 message.reply('Stuti Sehgal, Incoming Summer-21 intern @ Google, ML Researcher @ SRM IST');
//             }        
//             else {
//                 message.reply('Invalid Args')
//             }
//         break;
        
//         case 'clear':
//         if (!args[1]) return message.reply('Awwww that was sweet but please define a second Arg')   
//         message.channel.bulkDelete(args[1]);
//         break;
//     }
// });

// bot.login(token);




const Discord = require("discord.js");
const { prefix, token } = require("./config.json");
const ytdl = require("ytdl-core");

const client = new Discord.Client();

const queue = new Map();

client.once("ready", () => {
  console.log("Ready!");
});

client.once("reconnecting", () => {
  console.log("Reconnecting!");
});

client.once("disconnect", () => {
  console.log("Disconnect!");
});

client.on("message", async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const serverQueue = queue.get(message.guild.id);

  if (message.content.startsWith(`${prefix}play`)) {
    execute(message, serverQueue);
    return;
  } else if (message.content.startsWith(`${prefix}skip`)) {
    skip(message, serverQueue);
    return;
  } else if (message.content.startsWith(`${prefix}stop`)) {
    stop(message, serverQueue);
    return;
  } else if (message.content.startsWith(`${prefix}ding`)) {
    message.reply(`dong!`);
    return;
  } 
  else if (message.content.startsWith(`${prefix}stuti`)) {
    message.reply(`https://www.linkedin.com/in/stutisehgal/`);
    return;
  } 
  else if (message.content.startsWith(`${prefix}animesh`)) {
    message.reply(`https://www.linkedin.com/in/hokage7/`);
    return;
  }
  else if (message.content.startsWith(`${prefix}author`)) {
    message.reply(`Animesh Mohanty`);
    return;
  }
  else if (message.content.startsWith(`${prefix}validator`)) {
    message.reply(`Stuti Sehgal, Incoming Summer-21 intern @ Google, ML Researcher @ SRM IST`);
    return;
  }else {
    message.channel.send("You need to enter a valid command!");
  }
});

async function execute(message, serverQueue) {
  const args = message.content.split(" ");

  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel)
    return message.channel.send(
      "You need to be in a voice channel to play music!"
    );
  const permissions = voiceChannel.permissionsFor(message.client.user);
  if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
    return message.channel.send(
      "I need the permissions to join and speak in your voice channel!"
    );
  }

  const songInfo = await ytdl.getInfo(args[1]);
  const song = {
        title: songInfo.videoDetails.title,
        url: songInfo.videoDetails.video_url,
   };

  if (!serverQueue) {
    const queueContruct = {
      textChannel: message.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 5,
      playing: true
    };

    queue.set(message.guild.id, queueContruct);

    queueContruct.songs.push(song);

    try {
      var connection = await voiceChannel.join();
      queueContruct.connection = connection;
      play(message.guild, queueContruct.songs[0]);
    } catch (err) {
      console.log(err);
      queue.delete(message.guild.id);
      return message.channel.send(err);
    }
  } else {
    serverQueue.songs.push(song);
    return message.channel.send(`${song.title} has been added to the queue!`);
  }
}

function skip(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send(
      "You have to be in a voice channel to stop the music!"
    );
  if (!serverQueue)
    return message.channel.send("There is no song that I could skip!");
  serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send(
      "You have to be in a voice channel to stop the music!"
    );
    
  if (!serverQueue)
    return message.channel.send("There is no song that I could stop!");
    
  serverQueue.songs = [];
  serverQueue.connection.dispatcher.end();
}

function play(guild, song) {
  const serverQueue = queue.get(guild.id);
  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }

  const dispatcher = serverQueue.connection
    .play(ytdl(song.url))
    .on("finish", () => {
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0]);
    })
    .on("error", error => console.error(error));
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  serverQueue.textChannel.send(`Start playing: **${song.title}**`);
}

client.login(token);