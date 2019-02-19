const botkit = require("botkit");
const fs = require("fs");

const jsonFile = "./notificationList.json";
const UTF8 = "utf8";

const createMessage = (word, channel, text, url) =>
  `Listed word( ${word} ) is posted in channel( ${channel} ) \n content: \n ${text} \n message url is <${url}> \n`;

const createUrl = (siteUrl, channelId, eventTs) =>
  `${siteUrl}/archives/${channelId}/${eventTs}`;

const main = () => {
  try{
    if (!fs.existsSync(jsonFile)){
      throw 91;
    }
    const json = JSON.parse(fs.readFileSync(jsonFile, UTF8));
  
    const controller = botkit.slackbot({
      debug: false
    });
  
    controller
      .spawn({
        token: json.token
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
  
    return 0;

  } catch(err) {

    if (err === 91) {
      console.log(`Path (${jsonFile}) is not exist.`);
    } else {
      console.log(err);
    }; 

    return 1;

  }
};
main();
