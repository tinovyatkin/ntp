# NTP Client [![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

Lightweight (no dependencies) modern Javascript (Node 8 LTS or lates) implementation of the NTP Client Protocol. Based on [node-ntp-client](https://github.com/moonpyk/node-ntp-client) and [NTPServer](https://github.com/Grassboy/NTPServer).

## Usage

Add the module to your project with `npm install @destinationstransfers/ntp`.

```js
const NTPClient = require('@destinationstransfers/ntp)';

const date = await NTPClient.getNetworkTime();
console.log(date) // 2017-09-20T15:29:09.443Z
```

## API

`getNetworkTime` accepts hash of parameters, below they are with default values:

```js
const { getNetworkTime } = require('@destinationstransfers/ntp)';

const date = await getNetworkTime({
  timeout = 10000, // timeout in ms, default is 10sec
  server = 'pool.ntp.org', // ntp server address
  port = 123, // NTP server port
})
```

You also can override default values using env variables `NPT_PORT`, `NTP_SERVER` and `NTP_REPLY_TIMEOUT`.
