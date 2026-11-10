const { execFileSync } = require('child_process');
const fs = require('fs');

// We can create a tiny test HTML that loads importacion and scrolls down, or use CDP / node script with chrome:
const script = `
const http = require('http');
// Just test that the dev server returns 200 and check form html
`;

