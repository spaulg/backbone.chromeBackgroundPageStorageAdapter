
/*
 Copyright 2013 Simon Paulger <spaulger@codezen.co.uk>

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

var chrome = {
    runtime: {
        /**
         * The callback used for triggering a simulated message event for a background page
         */
        backgroundPageCallback: null,

        /**
         * Last error message to occur
         */
        lastError: null,

        /**
         * Send a message to the background page
         *
         * @param {string=undefined} extensionId Extension id
         * @param data Message data
         * @param {object=undefined} options Options
         * @param callback Callback on successful delivery
         */
        sendMessage: function(/*optional*/ extensionId, data, /*optional*/ options, callback)
        {
            if (arguments.length < 4) {
                // Re-order parameters
                /*
                 Undefined options

                 string
                 string|object
                 function
                 undefined
                 */
                if (typeof extensionId === 'string' &&
                    (typeof data === 'string' || typeof data === 'object') &&
                    typeof options === 'function') {
                    callback = options;
                    options = undefined;

                /*
                 Undefined extensionId

                 string|object
                 object
                 function
                 undefined
                 */
                } else if ((typeof extensionId === 'string' || typeof extensionId === 'object') &&
                            typeof data === 'object' &&
                            typeof options === 'function') {
                    callback = options;
                    options = data;
                    data = extensionId;
                    extensionId = undefined;

                 /*
                   Undefined extensionId and options

                   string|object
                   function
                   undefined
                   undefined
                  */
                } else if (typeof data === 'function') {
                    callback = data;
                    data = extensionId;
                    options = undefined;
                    extensionId = undefined;
                }
            }

            backgroundPageCallback(extensionId, data, options, callback);
        }
    }
};
