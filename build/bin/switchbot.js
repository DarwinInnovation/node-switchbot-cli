#! /usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const scan_1 = require("../src/scan");
const press_1 = require("../src/press");
commander_1.program.version(require("../../package.json").version);
commander_1.program.option("-d, --debug", "debug output");
(0, scan_1.add_scan)(commander_1.program);
(0, press_1.add_press)(commander_1.program);
commander_1.program.parse();
//# sourceMappingURL=switchbot.js.map