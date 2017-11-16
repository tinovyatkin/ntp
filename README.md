# NTP Client [![Build Status](https://travis-ci.org/ffflorian/ntpclient.svg)](http://travis-ci.org/ffflorian/ntpclient) [![Greenkeeper badge](https://badges.greenkeeper.io/ffflorian/ntpclient.svg)](https://greenkeeper.io/) [![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

Lightweight (no dependencies) modern Javascript (Node 8 LTS or lates) implementation of the NTP Client Protocol. Based on [node-ntp-client](https://github.com/moonpyk/node-ntp-client).

## Usage
Add the module to your project with `npm install @destinationstransfers/ntp`.

```js
const NTPClient = require('@destinationstransfers/ntp)';

const date = await NTPClient.getNetworkTime();
console.log(date) // 2017-09-20T15:29:09.443Z

```
