import * as fs from "fs";
import * as yaml from "js-yaml";
import { Config } from "./types";

const path = "../config/config.yml"

export default function load() {
	const config = yaml.load(fs.readFileSync(path, "utf8")) as Config;

	return config;
}
