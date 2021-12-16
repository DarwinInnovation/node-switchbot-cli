"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.add_press = void 0;
const node_switchbot_1 = __importDefault(require("node-switchbot"));
class PressStateMachine {
    constructor(id, wait_ms, debug) {
        this.id = id;
        this.wait_ms = wait_ms;
        this.debug = debug;
        this.retries = 5;
        this.switchbot = new node_switchbot_1.default();
        this.device = null;
        this.handlers = {
            idle: this._state_IDLE.bind(this),
            down: this._state_DOWN.bind(this),
            wait: this._state_WAIT.bind(this),
            up: this._state_UP.bind(this),
        };
        this.state = "idle";
        this.error_message = "No error";
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            while (this.state != "done") {
                let next_state;
                try {
                    next_state = yield this.handlers[this.state]();
                }
                catch (err) {
                    this.error_message = err.message;
                    next_state = this._fail(err.message);
                }
                this._set_state(next_state);
                if (this.state == "error") {
                    throw new Error(this.error_message);
                }
            }
        });
    }
    _state_IDLE() {
        return __awaiter(this, void 0, void 0, function* () {
            const bot_list = yield this.switchbot.discover({
                model: "H",
                id: this.id,
                quick: true,
            });
            if (bot_list.length === 0) {
                throw new Error(`Switchbot '${this.id}' not found.`);
            }
            // The `SwitchbotDeviceWoHand` object representing the found Bot.
            this.device = bot_list[0];
            return "down";
        });
    }
    _state_DOWN() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.device.down();
            return "wait";
        });
    }
    _state_WAIT() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.switchbot.wait(this.wait_ms);
            return "up";
        });
    }
    _state_UP() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.device.up();
            return "done";
        });
    }
    _set_state(new_state) {
        if (this.debug) {
            console.log(`State change ${this.state} -> ${new_state}`);
        }
        this.state = new_state;
    }
    _fail(msg) {
        if (this.debug) {
            console.log(`Fail with '${msg}' (${this.retries} retries left)`);
        }
        this.retries -= 1;
        if (this.retries == 0) {
            return "error";
        }
        return this.state;
    }
}
function add_press(program) {
    program
        .command("press <id>")
        .description("Make Switchbot press button")
        .option("-t, --time <millisecs>", "time to wait in ms", "400")
        .action((id, options) => {
        const dbg = program.opts().debug;
        const wait_time = parseInt(options.time) || 10;
        if (dbg) {
            console.log(`Press device ${id} for ${wait_time}ms`);
        }
        const sm = new PressStateMachine(id, wait_time, dbg);
        sm.run()
            .then(() => {
            process.exit(0);
        })
            .catch((err) => {
            console.error(`Failed: '${err.message}'`);
            process.exit(1);
        });
    });
}
exports.add_press = add_press;
//# sourceMappingURL=press.js.map