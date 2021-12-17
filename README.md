# Overview

A simple, error-tolerant, command line utility for controlling a Switchbot robot.

# Background

I needed a simple command line utility to control a couple of Switchbot robots.
Unfortunately, the standard Python one didn't do everything I needed (mainly to
do with button hold times), and as the code may end up being reused in an
express.js app I decided to build one on top of [node-switchbot](https://github.com/OpenWonderLabs/node-switchbot).

I was seeing quite a few errors when the bot was asked to move and hence added
a retry mechanism.

# Usage

```
Usage: switchbot [options] [command]

Options:
  -V, --version         output the version number
  -d, --debug           debug output
  -h, --help            display help for command

Commands:
  scan [options]        Scan for nearby Switchbot devices
  press [options] <id>  Make Switchbot press button
  help [command]        display help for command
```

```
Usage: switchbot press [options] <id>

Make Switchbot press button

Options:
  -t, --time <millisecs>  time to wait in ms (default: "400")
  -r, --retries <n>       Maximum number of retries (default: "5")
  -h, --help              display help for command
```
