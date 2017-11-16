## Version 1.1 - Nov 16, 2017

-   Switched default NPT server to `time.google.com` for better reliability

## Version 1.0 - Nov 13, 2017

-   Switched back to plain Javascript (ES6) for Node 8.x LTS and later
-   Changed API to be `async` / `Promise` based
-   Refactored tests to Jest
-   Simplified payload parsing using `readUInt32BE` (inspired by <https://github.com/Grassboy/NTPServer/blob/master/timeserver.node.js>)
-   Impoved errors handling and increases test coverage
