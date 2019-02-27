const botkit = require("botkit");
const fs = require("fs");

const jsonFile = "./notificationList.json";
const UTF8 = "utf8";

const createMessage = (word, channel, text, url) =>
  `Listed word( ${word} ) is posted in channel( ${channel} ) \n content: \n ${text} \n message url is <${url}> \n`;

const createUrl = (siteUrl, channelId, eventTs) =>
  `${siteUrl}/archives/${channelId}/${eventTs}`;

if(!fs.existsSync(jsonFile)) {
  console.log(`Path (${jsonFile}) is not exist.`);
}

if(!process.env.token) {
  console.log('You have to give me token.')
}
const json = JSON.parse(fs.readFileSync(jsonFile, UTF8));

const controller = botkit.slackbot({
  debug: false
});

controller
  .spawn({
    token: process.env.token
  })
  .startRTM(function(err) {
    if (err) {
      throw new Error(err);
    }
  });

controller.on("ambient", function(bot, message) {
  const post = message["text"].toLowerCase();
  for (let listedWord of json.list) {
    if (!post.includes(listedWord)) {
      continue;
    }

    const msgUrl = createUrl(
      json.slackUrl,
      message["channel"],
      message["event_ts"].replace(".", "")
    );

    // TODO: msgChannel should be name not id
    const textContent = createMessage(
      listedWord,
      message["channel"],
      message["text"],
      msgUrl
    );

    bot.say({
      channel: json.msgRecieveUserId,
      text: textContent
    });
  }
});

controller.hears('hi', 'direct_message', function(bot, message){
  bot.reply(message.user);
});

