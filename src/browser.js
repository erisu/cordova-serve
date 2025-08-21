/**
    Licensed to the Apache Software Foundation (ASF) under one
    or more contributor license agreements.  See the NOTICE file
    distributed with this work for additional information
    regarding copyright ownership.  The ASF licenses this file
    to you under the Apache License, Version 2.0 (the
    "License"); you may not use this file except in compliance
    with the License.  You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing,
    software distributed under the License is distributed on an
    "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, either express or implied.  See the License for the
    specific language governing permissions and limitations
    under the License.
*/

const { exec } = require('node:child_process');
const { promisify } = require('node:util');

const browsers = {
    chrome: {
        darwin: 'Google Chrome',
        linux: 'google-chrome',
        win32: 'chrome'
    },
    chromium: {
        darwin: 'Chromium',
        linux: 'chromium-browser', // Except for some linux platforms "chromium"
        win32: 'chromium'
    },
    brave: {
        darwin: 'Brave Browser',
        linux: 'brave-browser',
        win32: 'brave'
    },
    firefox: {
        darwin: 'Firefox',
        linux: 'firefox',
        win32: 'firefox'
    },
    'firefox-dev': {
        darwin: 'Firefox Developer Edition',
        linux: 'firefox-developer-edition',
        win32: 'firefox-developer-edition'
    },
    opera: {
        darwin: 'Opera',
        linux: 'opera',
        win32: 'opera'
    },
    edge: {
        darwin: 'Microsoft Edge',
        linux: 'microsoft-edge',
        win32: 'msedge'
    },
    safari: {
        darwin: 'Safari'
    }
};

let useOverrideCmd;

/**
 * Launches the specified browser with the given URL.
 * Based on https://github.com/domenic/opener
 * @param {Object} opts
 * @param {?string} [opts.target=default] target browser (E.g chrome, safari, opera, firefox or chromium)
 * @param {?string} [opts.url=] url to open
 * @param {?string} [opts.dataDir=temp_chrome_user_data_dir_for_cordova] a data dir to provide to Chrome (can be used to force it to open in a new window)
 * @param {?string} [opts.userArgs=]
 * @return {Promise} Promise to launch the specified browser
 */
module.exports = async function (opts) {
    opts = opts || {};
    opts.target = (opts.target || 'default').toLowerCase();
    opts.url = opts.url || '';
    opts.dataDir = opts.dataDir || 'temp_chrome_user_data_dir_for_cordova';
    opts.userArgs = opts.userArgs || '';
    opts._platform = process.platform;

    if (!opts.url) {
        throw new Error('Missing URL argument');
    }

    try {
        opts.url = new URL(opts.url).toString();
    } catch {
        throw new Error(`The following URL argument is invalid: ${opts.url}`);
    }

    // If default target then open only URL.
    if (opts.target === 'default') {
        const open = (await import('open')).default;
        return open(opts.url);
    }

    // Check if its a supported browser.
    if (!browsers[opts.target]) {
        throw new Error(`The browser target is not supported: ${opts.target}`);
    }

    // Check if browser is installed.
    try {
        const verifyInstalledBrowserCmd = buildBrowserVerifyCommand(opts);
        await execAsync(verifyInstalledBrowserCmd);
    } catch {
        if (opts._platform === 'linux' && opts.target === 'chromium') {
            try {
                // Some Linux uses "chromium" as command and not "chromium-browser"
                const verifyInstalledBrowserCmd = buildBrowserVerifyCommand(opts, 'chromium');
                await execAsync(verifyInstalledBrowserCmd);
                useOverrideCmd = 'chromium';
            } catch {
                throw new Error(`The browser target is not installed: ${opts.target}`);
            }
        } else {
            throw new Error(`The browser target is not installed: ${opts.target}`);
        }
    }

    try {
        const openInstalledBrowserCmd = buildOpenBrowserCommand(opts);
        return await execAsync(openInstalledBrowserCmd);
    } catch {
        throw new Error(`Error occured trying to launch browser: ${opts.target}`);
    }
};

async function execAsync (command) {
    return await promisify(exec)(command, { shell: process.platform === 'win32' ? 'cmd.exe' : true });
}

function buildBrowserVerifyCommand (opts, overrideCmd = undefined) {
    const browser = overrideCmd || browsers[opts.target][opts._platform];
    let cmd;
    switch (opts._platform) {
    case 'darwin':
        cmd = `open -Ra "${browser}"`;
        break;
    case 'linux':
        cmd = `which ${browser}`;
        break;
    case 'win32':
        cmd = `where ${browser}`;
        break;
    }

    return cmd;
}

function buildOpenBrowserCommand (opts) {
    let browser = browsers[opts.target][opts._platform];
    // Base args from your browser definition
    let browserArgs = [];
    const openArgs = [];

    if (opts._platform === 'darwin') {
        openArgs.push('-a');
    }

    if (['chrome', 'chromium'].includes(opts.target)) {
        if (opts._platform === 'win32') {
            browserArgs.push(`--user-data-dir=%TEMP%\\${opts.dataDir}`);
        } else {
            browserArgs.push(`--user-data-dir=/tmp/${opts.dataDir}`);
        }

        if (opts._platform === 'darwin') {
            openArgs.push('-n');
        }
    }

    if (opts.userArgs.length > 0) {
        const userArgSplit = opts?.userArgs?.split(' ') ?? [];
        browserArgs = [].concat(browserArgs, userArgSplit);
    }

    if (browserArgs.length > 0 && opts._platform === 'darwin') {
        browserArgs = ['--args'].concat(browserArgs);
    }

    let cmd;
    switch (opts._platform) {
    case 'darwin':
        cmd = ['open']
            .concat(openArgs, [`"${browser}"`], browserArgs, [`"${opts.url}"`])
            .join(' ');
        break;

    case 'linux':
        if (opts.target === 'chromium' && useOverrideCmd) {
            browser = 'chromium';
        }

        cmd = [browser]
            .concat(openArgs, [`"${opts.url}"`])
            .join(' ');
        break;

    case 'win32':
        cmd = ['start', '""', browser]
            .concat(openArgs, [`"${opts.url}"`])
            .join(' ');
        break;
    }

    return cmd;
}

module.exports.buildBrowserVerifyCommand = buildBrowserVerifyCommand;
module.exports.buildOpenBrowserCommand = buildOpenBrowserCommand;
