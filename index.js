// TODO: do not import packages in the middle of the code
// TODO: use camel case instead
// TODO: add an additional line before return statements
// TODO: use `` syntax instead of string concatnation (e.g. "foo" + text -> `foo${text}`)
// TODO: format the code. do not leave meaningless extra lines
// TODO: do not use process.exit. create main() function to avoid running the code instead
// TODO: use arrow function syntax () => instead of normal function syntax as callback functions instead
// TODO: use for-of statement syntax instead
// TODO: use Array#includes() instead

const botkit = require("botkit");
const fs = require("fs");

const jsonFile = "./notificationList.json";
const UTF8 = "utf8";

const createMessage = (word, channel, text, url) =>
  `Listed word( ${word} ) is posted in channel( ${channel} ) \n content: ${text} \n message url is <${url}> \n`;

const createUrl = (siteUrl, channelId, eventTs) =>
  `${siteUrl}/archives/${channelId}/${eventTs}`;

const main = () => {
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
};

main();
