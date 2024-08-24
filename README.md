# NTP Client ![node](https://img.shields.io/node/v/@destinationstransfers/ntp.svg) [![Build Status](https://dev.azure.com/destinationstransfers/ntp/_apis/build/status/destinationstransfers.ntp?branchName=master)](https://dev.azure.com/destinationstransfers/ntp/_build/latest?definitionId=5&branchName=master) [![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier) [![codecov](https://codecov.io/gh/destinationstransfers/ntp/branch/master/graph/badge.svg)](https://codecov.io/gh/destinationstransfers/ntp)

Lightweight (no dependencies) modern Javascript implementation of the NTP Client Protocol.

We use it in production at <https://transfers.do> for webhooks timestamps checking (like [Stripe](https://stripe.com/docs/webhooks/signatures#replay-attacks) and so on) where VM time is not reliable enough.

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
  timeout : 10000, // timeout in ms, default is 10sec
  server : 'time.google.com', // ntp server address
  port : 123, // NTP server port
})
```

You also can override default values using env variables `NPT_PORT`, `NTP_SERVER` and `NTP_REPLY_TIMEOUT`.

## Credits

- [RFC 2030](https://tools.ietf.org/html/rfc2030)
- [node-ntp-client](https://github.com/moonpyk/node-ntp-client)
- [NTPServer](https://github.com/Grassboy/NTPServer)
