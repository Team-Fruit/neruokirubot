import { Client, Emoji, Message, TextChannel } from "discord.js";
import { Connection, ConnectionOptions, createConnection } from "typeorm";
import { User } from "./entity/User";
import { Sleep } from "./entity/Sleep";

const client = new Client();

const options: ConnectionOptions = {
  type: "sqlite",
  database: "../db/db.sqlite3",
  entities: [User, Sleep],
  synchronize: true,
};

let connection: Connection | null = null;

async function connectDB() {
  connection = await createConnection(options);
  const userRepository = connection.getRepository(User);
  console.log(await userRepository.count());
}

connectDB();

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

async function initBotMessage(msg: Message) {
  const msgRes = await (<TextChannel>client.channels.cache.get(noChannel)).send(
    "このメッセージにリアクションしてね(⋈◍＞◡＜◍)。✧♡"
  );
  await msgRes.react(okiru);
  await msgRes.react(neru);
  nowMessage = msgRes;
  await msg.delete();
}

async function sendUserStatus(msg: Message) {
  let returnMsg = "";
  sleepTime.forEach((value, key) => {
    let nickName = g?.member(key)?.nickname?.replace("@", "＠");
    if (!nickName) nickName = g?.member(key)?.displayName;
    if (value.action == "ne") {
      const neTime = getTimeFromMills(new Date().getTime() - value.date);
      returnMsg += nickName + ":" + neTime + " ねてる \n";
    } else {
      returnMsg += nickName + ": おきてる\n";
    }
  });
  let g = client.guilds.cache.get(guildID);
  const c = <TextChannel>g?.channels.cache.get(generalChannel);
  await c.send(returnMsg);
}

async function test(msg: Message) {
  await msg.channel.send({
    embed: {
      title: "おねんねリスト",
      color: 11715384,
      fields: [
        {
          name: "kano_ichinose#3333",
          value: "🟢 おきてる\n⏲️ 3時間34分19秒",
        },
        {
          name: "I A#1234",
          value: "🟣 ねてる\n⏲️ 13時間24分49秒",
        },
      ],
    },
  });
}

client.on("message", async (msg) => {
  if (msg.author.bot) return;
  const args = msg.content.replace(/　+/g, " ").slice(3).trim().split(/ + /);
  switch (args[0]) {
    case "init":
      await initBotMessage(msg);
      break;
    case "status":
      await sendUserStatus(msg);
      break;
    case "test":
      await test(msg);
      break;
  }
});

async function msgReactionAdd(reaction: IReaction) {
  const userRepository = connection?.getRepository(User);
  const user = await userRepository?.findOne({ discordId: reaction.user_id });
  if (!user) {
    // Userが未登録だった時
    const newUser = userRepository?.create({
      discordId: reaction.user_id,
    });
    await userRepository?.save(<User>newUser);
  } else {
  }

  /*
  let g = client.guilds.cache.get(guildID);
  const c = <TextChannel>g?.channels.cache.get(generalChannel);
  let nickName = g?.member(reaction.user_id)?.nickname?.replace("@", "＠");
  if (!nickName) nickName = g?.member(reaction.user_id)?.displayName;
  if (g?.member(reaction.user_id)?.user.bot) return;
  switch (reaction.emoji.name) {
    case "ne":
      g?.member(reaction.user_id)?.roles.remove(okiruRole);
      g?.member(reaction.user_id)?.roles.add(neruRole);
      updateUserStatus(reaction.user_id, "ne");
      c.send(nickName + "はねました。ぽやしみ");
      break;
    case "ki":
      g?.member(reaction.user_id)?.roles.remove(neruRole);
      g?.member(reaction.user_id)?.roles.add(okiruRole);
      const res = updateUserStatus(reaction.user_id, "ki");
      console.log(res);
      if (res) {
        const netaTime = getTimeFromMills(res);
        c.send(nickName + "は" + netaTime + "ねました。");
      }
      break;
  }
   */
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
      sleepTime.set(id, s);
      return diff;
    } else {
      sleepTime.set(id, s);
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
  let byo: number = Math.floor(m / 1000) % 60;
  let hun: number = Math.floor(m / 60000) % 60;
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
