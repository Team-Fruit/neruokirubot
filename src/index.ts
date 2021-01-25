import { Client, Emoji, Message, TextChannel } from "discord.js";

const client = new Client();

client.on("ready", () => {
  console.log("Discord Bot Ready");
});

const neru = "<:ne:803311475502350398>";
const neruEmojiID = "803311475502350398";
const okiru = "<:ki:803311475325796434>";
const okiruEmojiID = "803311475325796434";

const neruRole = "803305899606409258";
const okiruRole = "803305973103329310";

const noChannel = "803321643803213834";
const generalChannel = "606109479003750442";

const guildID = "606109479003750440";

let nowMessage: Message | null = null;

let sleepTime: Map<string, ISleep> = new Map();

interface IReaction {
  user_id: string;
  message_id: string;
  emoji: Emoji;
  channel_id: string;
  guild_id: string;
}

interface ISleep {
  action: string;
  date: number;
}

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

function msgReactionAdd(reaction: IReaction) {
  let g = client.guilds.cache.get(guildID);
  if (g?.member(reaction.user_id)?.user.bot) return;
  switch (reaction.emoji.name) {
    case "ne":
      g?.member(reaction.user_id)?.roles.remove(okiruRole);
      g?.member(reaction.user_id)?.roles.add(neruRole);
      updateUserStatus(reaction.user_id, "ne");
      break;
    case "ki":
      g?.member(reaction.user_id)?.roles.remove(neruRole);
      g?.member(reaction.user_id)?.roles.add(okiruRole);
      const res = updateUserStatus(reaction.user_id, "ki");
      console.log(res);
      if (res) {
        const c = <TextChannel>g?.channels.cache.get(generalChannel);
        const netaTime = getTimeFromMills(res);
        let nickName = g
          ?.member(reaction.user_id)
          ?.nickname?.replace("@", "＠");
        if (!nickName) nickName = g?.member(reaction.user_id)?.displayName;
        c.send(nickName + "は" + netaTime + "ねました。");
      }
      break;
  }
  initMsg();
}
function msgReactionRemove(reaction: IReaction) {
  // return reaction;
}

function updateUserStatus(id: string, status: string) {
  const s: ISleep = {
    action: status,
    date: new Date().getTime(),
  };
  if (sleepTime.has(id)) {
    const b: ISleep = <ISleep>sleepTime.get(id);
    if (b.action == "ne" && status == "ki") {
      const now = new Date().getTime();
      const diff = now - b.date;
      return diff;
    } else {
      return null;
    }
  } else {
    sleepTime.set(id, s);
    return null;
  }
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

function getTimeFromMills(m: number) {
  let byo: number = Math.floor(m / 1000);
  let hun: number = Math.floor(m / 60000);
  let ji: number = Math.floor(m / 3600000);
  let result = "";
  if (ji != 0) result += ji + "時間 ";
  if (hun != 0) result += hun + "分 ";
  if (byo != 0) result += byo + "秒";
  return result;
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
