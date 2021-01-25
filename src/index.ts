import { Client, Message } from "discord.js";

const client = new Client();

const token = process.env.D_TOKEN;
client.login(token);
