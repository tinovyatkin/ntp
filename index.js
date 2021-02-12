'use strict';

const { createSocket } = require('dgram');
const { promisify } = require('util');
const { once } = require('events');

/**
 * Amount of acceptable time to await for a response from the remote server.
 * Configured default to 10 seconds.
 */
const { NTP_SERVER = 'time.google.com' } = process.env;

const NPT_PORT = parseInt(process.env.NPT_PORT, 10) || 123;
const NTP_REPLY_TIMEOUT =
  parseInt(process.env.NTP_REPLY_TIMEOUT, 10) || 10 * 1000;
const NPT_MESSAGE_LENGTH = 48;

module.exports.NTP_REPLY_TIMEOUT = NTP_REPLY_TIMEOUT;

/**
 * Fetches the current NTP Time from the given server and port.
 *
 * @param {{timeout?: number, server?: string, port?: number}} [opts]
 * @returns {Promise<Date>}
 */
async function getNetworkTime({
  timeout = NTP_REPLY_TIMEOUT,
  server = NTP_SERVER,
  port = NPT_PORT,
} = {}) {
  const client = createSocket('udp4');
  client.unref();

  const ntpData = Buffer.alloc(NPT_MESSAGE_LENGTH);

  // RFC 2030 -> LI = 0 (no warning, 2 bits), VN = 3 (IPv4 only, 3 bits), Mode = 3 (Client Mode, 3 bits) -> 1 byte
  // -> rtol(LI, 6) ^ rotl(VN, 3) ^ rotl(Mode, 0)
  // -> = 0x00 ^ 0x18 ^ 0x03
  ntpData[0] = 0x1b;

  let tm;
  const res = await Promise.race([
    // if an error occurred
    once(client, 'error'),
    // or timeout
    new Promise(resolve => {
      tm = setTimeout(resolve, timeout);
    }),
    // or successful message
    Promise.all([
      once(client, 'message'),
      promisify(client.send).bind(client)(
        ntpData,
        0,
        ntpData.length,
        port,
        server,
      ),
    ]),
  ]);
  clearTimeout(tm);
  client.close();
  if (!res)
    throw new Error(`Timeout waiting for NTP response from ${server}:${port}`);
  else if (res[0] instanceof Error) throw res[0];

  /**
   * @type {[[Buffer]]}
   */
  const [[msg]] = res;
  if (msg.length < NPT_MESSAGE_LENGTH)
    throw new RangeError(
      `Received NTP response from ${server}:${port} is too short: ${
        msg.length
      }`,
    );

  // thats inspired by https://github.com/Grassboy/NTPServer/blob/master/timeserver.node.js
  const intpart = msg.readUInt32BE(msg.length - 8);
  const fractpart = msg.readUInt32BE(msg.length - 4);
  const milliseconds = intpart * 1000 + (fractpart * 1000) / 0x100000000;

  // **UTC** time
  const date = new Date('Jan 01 1900 GMT');
  date.setUTCMilliseconds(date.getUTCMilliseconds() + milliseconds);

  return date;
}
module.exports.getNetworkTime = getNetworkTime;
