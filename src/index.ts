import { Client, Emoji, Message, TextChannel } from "discord.js";
import { Connection, ConnectionOptions, createConnection } from "typeorm";
import { User } from "./entity/User";
import { Sleep } from "./entity/Sleep";

// Discordクライアント
const client = new Client();

// TypeORMのオプション
const options: ConnectionOptions = {
  type: "sqlite",
  database: "./db/db.sqlite3",
  entities: [User, Sleep],
  synchronize: false,
};

// TypeORMのコネクション 使う前にnullチェックが必要
let connection: Connection | null = null;

async function connectDB() {
  connection = await createConnection(options);
  const userRepository = connection.getRepository(User);
  console.log(await userRepository.count());
  await connection.query("PRAGMA foreign_keys=OFF");
  await connection.synchronize();
  await connection.query("PRAGMA foreign_keys=ON");
}

// コネクションする
connectDB();

// DiscordBotがいい感じになったとき
client.on("ready", () => {
  console.log("Discord Bot Ready");
});

// いろんな定数 TODO コンフィグ化
const neruEmojiID = "803311475502350398";
const okiruEmojiID = "803311475325796434";
const neru = `<:ne:${neruEmojiID}>`;
const okiru = `<:ki:${okiruEmojiID}>`;

const neruRole = "803305899606409258";
const okiruRole = "803305973103329310";

const noChannel = "803321643803213834";
const generalChannel = "606109479003750442";

const guildID = "606109479003750440";

// 今リアクションを待機してるメッセージ
let nowMessage: Message | null = null;

// いずれ消えるもの
let sleepTime: Map<string, ISleep> = new Map();

// リアクションされたときのインターフェース
interface IReaction {
  user_id: string; // Discord uid
  message_id: string; // Message id
  emoji: Emoji; // EmojiResolvable
  channel_id: string; // ChannelID
  guild_id: string; // GuildID
}

// 寝てるオブジェクトのインターフェース いずれ消えるもの
interface ISleep {
  action: string;
  date: number;
}

// Botのメッセージを初期化する 起きるリアクションと寝るリアクションをつける
async function initBotMessage(msg: Message) {
  const msgRes = await (<TextChannel>client.channels.cache.get(noChannel)).send(
    "このメッセージにリアクションしてね(⋈◍＞◡＜◍)。✧♡"
  );
  await msgRes.react(okiru);
  await msgRes.react(neru);
  nowMessage = msgRes;
  await msg.delete();
}

// /no status コマンドの処理 TODO
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

// テスト用リッチメッセージ
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

// メッセージが来たとき
client.on("message", async (msg) => {
  if (msg.author.bot) return;
  if (!msg.content.startsWith("/no")) return;
  // 引数をパース
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

// メッセージにリアクションがあったとき
async function msgReactionAdd(reaction: IReaction) {
  let g = client.guilds.cache.get(reaction.guild_id);
  const general = <TextChannel>g?.channels.cache.get(generalChannel); // TODO

  if (g?.member(reaction.user_id)?.user.bot) return;
  const userRepository = connection?.getRepository(User);
  const sleepRepository = connection?.getRepository(Sleep);
  const user = await userRepository?.findOne({ discordId: reaction.user_id });
  if (!user) {
    // Userが未登録だった時
    const newUser = userRepository?.create({
      discordId: reaction.user_id,
    });
    await userRepository?.save(<User>newUser);
  } else {
    switch (reaction.emoji.name) {
      case "ne":
        await userRepository?.update(
          { discordId: reaction.user_id },
          {
            nowSleeping: true,
            sleepTempTime: new Date().getTime(),
          }
        );
        g?.member(reaction.user_id)?.roles.remove(okiruRole);
        g?.member(reaction.user_id)?.roles.add(neruRole);
        await general.send(
          getNamefromID(reaction.user_id) + "はねました。ぽやしみ"
        );
        initMsg();
        break;
      case "ki":
        g?.member(reaction.user_id)?.roles.remove(neruRole);
        g?.member(reaction.user_id)?.roles.add(okiruRole);
        if (user.nowSleeping) {
          const date = new Date().getTime();
          const sleep = sleepRepository?.create({
            sleepTime: user.sleepTempTime,
            wakeTime: date,
            user: user,
          });
          sleepRepository?.save(<Sleep>sleep);
          await general.send(
            getNamefromID(reaction.user_id) +
              "は" +
              getTimeFromMills(date - user.sleepTempTime) +
              " ねました"
          );
          userRepository?.update(
            { discordId: reaction.user_id },
            { nowSleeping: false }
          );
        }
        initMsg();
        break;
    }
  }
}

// discord uid からニックネームをとってくるメソッド
function getNamefromID(id: string) {
  let g = client.guilds.cache.get(guildID);
  let nickName = g?.member(id)?.nickname?.replace("@", "＠");
  if (!nickName) nickName = g?.member(id)?.displayName;
  return nickName;
}

// リアクションが消されたとき
function msgReactionRemove(reaction: IReaction) {
  // return reaction;
}

// initMeg()
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

// ミリ秒を x時間x分x秒にするやつ いらない単位は消える
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

// rawイベントを取得 リアクションのイベントを発火させてる
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

// tokenを環境変数から読み込み
const token = process.env.D_TOKEN;
// botにログイン
client.login(token);
