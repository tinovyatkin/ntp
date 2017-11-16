'use strict';

const { createSocket } = require('dgram');

/**
 * Amount of acceptable time to await for a response from the remote server.
 * Configured default to 10 seconds.
 */
const {
  NPT_PORT = 123,
  NTP_SERVER = 'pool.ntp.org',
  NTP_REPLY_TIMEOUT = 10 * 1000,
} = process.env;

exports.NTP_REPLY_TIMEOUT = NTP_REPLY_TIMEOUT;

const NPT_MESSAGE_LENGTH = 48;

/**
 * Fetches the current NTP Time from the given server and port.
 *
 * @param {{ntpReplyTimeout: number, server: string, port: number}} opts
 * @returns {Promise<Date>}
 */
function getNetworkTime(
  { timeout = NTP_REPLY_TIMEOUT, server = NTP_SERVER, port = NPT_PORT } = {},
) {
  return new Promise((resolve, reject) => {
    const client = createSocket('udp4');
    const ntpData = Buffer.alloc(NPT_MESSAGE_LENGTH);

    // RFC 2030 -> LI = 0 (no warning, 2 bits), VN = 3 (IPv4 only, 3 bits), Mode = 3 (Client Mode, 3 bits) -> 1 byte
    // -> rtol(LI, 6) ^ rotl(VN, 3) ^ rotl(Mode, 0)
    // -> = 0x00 ^ 0x18 ^ 0x03
    ntpData[0] = 0x1b;

    const tm = setTimeout(() => {
      client.close();
      reject(
        new Error(`Timeout waiting for NTP response from ${server}:${port}`),
      );
    }, timeout);

    /*
      * Some errors can happen before/after send() or cause send() to break.
      * Some errors will also be given to send()
      * NOTE: the error rejection is not generalised, as the client has to
      * lose the connection also, apparently.
    */
    let errorFired = false;

    client.on('error', err => {
      if (errorFired) return;

      errorFired = true;
      clearTimeout(tm);
      reject(err);
    });

    client.send(ntpData, 0, ntpData.length, port, server, err => {
      if (err) {
        if (errorFired) return;
        clearTimeout(tm);
        errorFired = true;
        client.close();
        reject(err);
        return;
      }

      client.once('message', msg => {
        clearTimeout(tm);
        client.close();
        if (msg.length < NPT_MESSAGE_LENGTH) {
          errorFired = true;
          reject(
            new RangeError(
              `Received NTP response from ${server}:${port} is too short: ${
                msg.length
              }`,
            ),
          );
          return;
        }

        // thats inspired by https://github.com/Grassboy/NTPServer/blob/master/timeserver.node.js
        const intpart = msg.readUInt32BE(msg.length - 16);
        const fractpart = msg.readUInt32BE(msg.length - 8);
        const milliseconds = intpart * 1000 + fractpart * 1000 / 0x100000000;

        // **UTC** time
        const date = new Date('Jan 01 1900 GMT');
        date.setUTCMilliseconds(date.getUTCMilliseconds() + milliseconds);

        resolve(date);
      });
    });
  });
}
exports.getNetworkTime = getNetworkTime;
