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
exports.add_scan = void 0;
const node_switchbot_1 = __importDefault(require("node-switchbot"));
function switchbotScan(wait_secs) {
    return __awaiter(this, void 0, void 0, function* () {
        let switchbot = new node_switchbot_1.default();
        let devices = {};
        switchbot.onadvertisement = (ad) => {
            process.stdout.write(".");
            if (!(ad.id in devices)) {
                devices[ad.id] = ad;
            }
        };
        yield switchbot.startScan();
        // Wait 10 seconds
        yield switchbot.wait(wait_secs * 1000);
        switchbot.stopScan();
        process.stdout.write("\n");
        return devices;
    });
}
function add_scan(program) {
    program
        .command("scan")
        .description("Scan for nearby Switchbot devices")
        .option("-t, --time <secs>", "time to wait", "10")
        .action((options) => {
        const wait_time = parseInt(options.time) || 10;
        switchbotScan(wait_time).then((devices) => {
            const ids = Object.keys(devices);
            ids.sort();
            for (const id of ids) {
                const device = devices[id];
                process.stdout.write(`${id}: ${device.serviceData.modelName} (battery: ${device.serviceData.battery})\n`);
            }
            process.exit(0);
        });
    });
}
exports.add_scan = add_scan;
//# sourceMappingURL=scan.js.map