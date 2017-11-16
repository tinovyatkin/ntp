'use strict';

const dgram = require('dgram');

const { getNetworkTime, NTP_REPLY_TIMEOUT } = require('./');

describe('getNetworkTime', () => {
  beforeAll(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = NTP_REPLY_TIMEOUT + 1000;
  });

  test('displays the current time', async () => {
    const res = await getNetworkTime();
    expect(res).toBeInstanceOf(Date);
  });

  test('works with another NTP server', async () => {
    const res = await getNetworkTime({ server: 'de.pool.ntp.org' });
    expect(res).toBeInstanceOf(Date);
  });

  test("won't work with an invalid NTP server", async () => {
    await expect(
      getNetworkTime({ server: 'google.com', timeout: 4000 }),
    ).rejects.toBeDefined();
  });

  test('should handle server errors', done => {
    // creating a server
    const port = 41234;
    const server = dgram.createSocket('udp4');

    server.on('error', err => {
      server.close();
      throw err;
    });

    server.once('message', (msg, rinfo) => {
      console.log(new Date());
      console.log(['  message from ', rinfo.address, ':', rinfo.port].join(''));
      if (rinfo.address) {
        // time sync request from client
        // simulate broken response
        server.send(Buffer.alloc(10), 0, 10, rinfo.port, rinfo.address, err => {
          if (err) throw err;
        });
      }
    });

    server.on('listening', async () => {
      const address = server.address();
      // send request
      await expect(
        getNetworkTime({ server: address, port }),
      ).rejects.toBeDefined();
      server.close();
      return done();
    });

    server.bind(port);
  });
});
