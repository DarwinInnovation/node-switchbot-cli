import { program } from "commander";
import { add_scan } from "../src/scan";
import { add_press } from "../src/press";

program.version(require("../../package.json").version);
program.option("-d, --debug", "debug output");

add_scan(program);
add_press(program);

program.parse();
