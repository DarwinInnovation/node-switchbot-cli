import { Command } from "commander";
import Switchbot from "node-switchbot";

type PressStateMachineStates =
  | "idle"
  | "down"
  | "wait"
  | "up"
  | "done"
  | "error";

class PressStateMachine {
  state: PressStateMachineStates;
  retries: number = 5;
  switchbot: Switchbot | null;
  device: any | null;
  handlers: {
    [key: string]: any;
  };
  error_message: string;

  constructor(
    readonly id: string,
    readonly wait_ms: number,
    readonly debug: boolean
  ) {
    this.switchbot = new Switchbot();
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

  async run() {
    while (this.state != "done") {
      let next_state: PressStateMachineStates;
      try {
        next_state = await this.handlers[this.state]();
      } catch (err: any) {
        this.error_message = err.message;
        next_state = this._fail(err.message);
      }
      this._set_state(next_state);

      if (this.state == "error") {
        throw new Error(this.error_message);
      }
    }
  }

  async _state_IDLE() {
    const bot_list = await this.switchbot.discover({
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
  }

  async _state_DOWN() {
    await this.device.down();

    return "wait";
  }

  async _state_WAIT() {
    await this.switchbot.wait(this.wait_ms);

    return "up";
  }

  async _state_UP() {
    await this.device.up();

    return "done";
  }

  _set_state(new_state: PressStateMachineStates) {
    if (this.debug) {
      console.log(`State change ${this.state} -> ${new_state}`);
    }
    this.state = new_state;
  }

  _fail(msg: string) {
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

export function add_press(program: Command) {
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
