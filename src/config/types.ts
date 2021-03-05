import { type } from "os";

export type Config ={
  emoji: {
    neruEmojiID: number;
    okiruEmojiID: number;
    neru: string;
    okiru: string;
  };
  guild: {
    guildID: number;
    noChannel: number;
    generalChannel: number;
    neruRole: number;
    okiruRole: number;
  };
}