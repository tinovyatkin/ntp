'use strict';

const dgram = require('dgram');

const { getNetworkTime, NTP_REPLY_TIMEOUT } = require('./');

describe('getNetworkTime', () => {
  beforeAll(() => {
    jest.setTimeout(10000);
  });

  it('displays the current time', async () => {
    const res = await getNetworkTime();
    expect(res).toBeInstanceOf(Date);
    expect(isFinite(res)).toBeTruthy();
  });

  it('works with another NTP server', async () => {
    const res = await getNetworkTime({ server: 'de.pool.ntp.org' });
    expect(res).toBeInstanceOf(Date);
    expect(isFinite(res)).toBeTruthy();
  });

  it("won't work with an invalid NTP server", async () => {
    try {
      await getNetworkTime({ server: 'google.com', timeout: 2000 });
    } catch (err) {
      expect(err.message).toContain('Timeout');
    }
  });

  it('should handle server errors', done => {
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
        server.send('byaka', 0, -1, rinfo.port, rinfo.address, err => {
          if (err) throw err;
        });
      }
    });

    server.on('listening', async () => {
      const address = server.address();
      // send request
      await expect(
        getNetworkTime({
          server: typeof address === 'string' ? address : address.address,
          port,
        }),
      ).rejects.toHaveProperty(
        'message',
        expect.stringContaining('is too short: 5'),
      );
      server.close();
      return done();
    });

    server.bind(port);
  });
});
