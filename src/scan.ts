import { Command } from "commander";
import Switchbot from "node-switchbot";

interface Advertisement {
  id: string;
  address: string;
  rssi: number;
  serviceData: {
    model: "H";
    modelName: "WoHand";
    mode: boolean;
    state: boolean;
    battery: number;
  };
}

type AdvertisementMap = {
  [id: string]: Advertisement;
};

async function switchbotScan(wait_secs: number) {
  let switchbot = new Switchbot();
  let devices: AdvertisementMap = {};

  switchbot.onadvertisement = (ad: Advertisement) => {
    process.stdout.write(".");
    if (!(ad.id in devices)) {
      devices[ad.id] = ad;
    }
  };

  await switchbot.startScan();
  // Wait 10 seconds
  await switchbot.wait(wait_secs * 1000);
  switchbot.stopScan();
  process.stdout.write("\r");

  return devices;
}

export function add_scan(program: Command) {
  program
    .command("scan")
    .description("Scan for nearby Switchbot devices")
    .option("-t, --time <secs>", "time to wait", "10")
    .action((options) => {
      const wait_time = parseInt(options.time) || 10;
      switchbotScan(wait_time).then((devices: AdvertisementMap) => {
        const ids = Object.keys(devices);
        ids.sort();
        for (const id of ids) {
          const device = devices[id];
          process.stdout.write(
            `${id}: ${device.serviceData.modelName} (battery: ${device.serviceData.battery})\n`
          );
        }
        process.exit(0);
      });
    });
}
