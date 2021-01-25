import {
  Client,
  Emoji,
  EmojiResolvable,
  Message,
  TextChannel,
} from "discord.js";

const client = new Client();

client.on("ready", () => console.log("Discord Bot Ready"));

const neru = "<:ne:803311475502350398>";
const neruEmojiID = "803311475502350398";
const okiru = "<:ki:803311475325796434>";
const okiruEmojiID = "803311475325796434";

const neruRole = "803305899606409258";
const okiruRole = "803305973103329310";

const noChannel = "803321643803213834";

const guildID = "606109479003750440";

let nowMessage: Message | null = null;

client.on("message", async (msg) => {
  if (msg.author.bot) return;
  if (msg.content == "/no init") {
    const msgRes = await (<TextChannel>(
      client.channels.cache.get(noChannel)
    )).send("このメッセージにリアクションしてね(⋈◍＞◡＜◍)。✧♡");
    msgRes.react(okiru);
    msgRes.react(neru);
    nowMessage = msgRes;
    msg.delete();
  }
});

interface IReaction {
  user_id: string;
  message_id: string;
  emoji: Emoji;
  channel_id: string;
  guild_id: string;
}

function msgReactionAdd(reaction: IReaction) {
  let g = client.guilds.cache.get(guildID);
  if (g?.member(reaction.user_id)?.user.bot) return;
  switch (reaction.emoji.name) {
    case "ne":
      g?.member(reaction.user_id)?.roles.remove(okiruRole);
      g?.member(reaction.user_id)?.roles.add(neruRole);
      break;
    case "ki":
      g?.member(reaction.user_id)?.roles.remove(neruRole);
      g?.member(reaction.user_id)?.roles.add(okiruRole);
      break;
  }
  initMsg();
}
function msgReactionRemove(reaction: IReaction) {
  // return reaction;
}

function initMsg() {
  if (!nowMessage) {
    console.log("not initialized");
    return;
  }
  nowMessage.reactions.removeAll().then(() => {
    nowMessage?.react(okiru);
    nowMessage?.react(neru);
  });
}

client.on("raw", (reaction) => {
  switch (reaction.t) {
    case "MESSAGE_REACTION_ADD":
      msgReactionAdd(reaction.d);
      break;
    case "MESSAGE_REACTION_REMOVE":
      msgReactionRemove(reaction.d);
      break;
  }
});

const token = process.env.D_TOKEN;
client.login(token);
