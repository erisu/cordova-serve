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

describe('browser', () => {
    let browser;
    beforeEach(() => {
        browser = require('../src/browser');
    });

    describe('buildBrowserVerifyCommand', () => {
        it('should build darwin command to verify Chrome', async () => {
            const opts = {
                target: 'chrome',
                url: 'https://cordova.apache.org',
                dataDir: 'temp_chrome_user_data_dir_for_cordova',
                userArgs: '',
                _platform: 'darwin'
            };

            const cmd = browser.buildBrowserVerifyCommand(opts);
            expect(cmd).toContain('open -Ra "Google Chrome"');
        });

        it('should build linux command to verify Chrome', async () => {
            const opts = {
                target: 'chrome',
                url: 'https://cordova.apache.org',
                dataDir: 'temp_chrome_user_data_dir_for_cordova',
                userArgs: '',
                _platform: 'linux'
            };

            const cmd = browser.buildBrowserVerifyCommand(opts);
            expect(cmd).toContain('which google-chrome');
        });

        it('should build win32 command to verify Chrome', async () => {
            const opts = {
                target: 'chrome',
                url: 'https://cordova.apache.org',
                dataDir: 'temp_chrome_user_data_dir_for_cordova',
                userArgs: '',
                _platform: 'win32'
            };

            const cmd = browser.buildBrowserVerifyCommand(opts);
            expect(cmd).toContain('where chrome');
        });
    });

    describe('buildOpenBrowserCommand', () => {
        it('should build darwin command to verify Chrome', async () => {
            const opts = {
                target: 'chrome',
                url: 'https://cordova.apache.org',
                dataDir: 'temp_chrome_user_data_dir_for_cordova',
                userArgs: '',
                _platform: 'darwin'
            };

            const cmd = browser.buildOpenBrowserCommand(opts);
            expect(cmd).toContain('open -a -n "Google Chrome" --args --user-data-dir=/tmp/temp_chrome_user_data_dir_for_cordova "https://cordova.apache.org"');
        });

        it('should build linux command to verify Chrome', async () => {
            const opts = {
                target: 'chrome',
                url: 'https://cordova.apache.org',
                dataDir: 'temp_chrome_user_data_dir_for_cordova',
                userArgs: '',
                _platform: 'linux'
            };

            const cmd = browser.buildOpenBrowserCommand(opts);
            expect(cmd).toContain('google-chrome "https://cordova.apache.org"');
        });

        it('should build win32 command to verify Chrome', async () => {
            const opts = {
                target: 'chrome',
                url: 'https://cordova.apache.org',
                dataDir: 'temp_chrome_user_data_dir_for_cordova',
                userArgs: '',
                _platform: 'win32'
            };

            const cmd = browser.buildOpenBrowserCommand(opts);
            expect(cmd).toContain('start "" chrome "https://cordova.apache.org"');
        });
    });
});
