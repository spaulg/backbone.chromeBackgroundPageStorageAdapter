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

var Backbone = Backbone || {};

(function(){
    'use strict';

    Backbone.chromeBackgroundPageStorageAdapter = function(options)
    {
        this._options = {
            /*
              Set the key name and the value that is used when performing each CRUD operation
             */
            keyName:     'method',
            createKey:   'createRecord',
            readKey:     'readRecord',
            updateKey:   'updateRecord',
            deleteKey:   'deleteRecord',

            /*
              Response key name for finding items to send in the sync success callback
             */
            respKeyName: 'items',

            /*
              Array of additional static data sent in each request to the background page
             */
            extraKeys:   {}
        };

        this._options = this._options.concat(options);
    };

    Backbone.chromeBackgroundPageStorageAdapter.prototype = {
        /**
         * Options for adapter configuration
         */
        _options: {},

        /**
         * Send the background page message with the relevant data
         * and return callback. Fires the Backbone request trigger
         * before doing so.
         *
         * @param modelOrCollection Model or collection
         * @param data
         * @param callback
         * @private
         */
        _sendBackgroundPageMessage: function(modelOrCollection, data, callback)
        {
            modelOrCollection.trigger('request', model, data, options);
            chrome.runtime.sendMessage(data, callback);
        },

        /**
         * Add or update an existing model in storage
         *
         * @param model Model of data to update
         * @param options Storage options
         * @private
         */
        _createRecord: function(model, options)
        {
            function callback(resp)
            {
                if (chrome.runtime.lastError == null) {
                    options.success(resp[this._options['respKeyName']]);
                } else {
                    options.error(chrome.runtime.lastError);
                }
            }

            var data = this._options['extraKeys'].concat(model.attributes);
            data[this._options['keyName']] = this._options['createKey'];
            this._sendBackgroundPageMessage(model, data, callback);
        },

        /**
         * Read a model or collection from storage
         *
         * @param modelOrCollection Model with id to read
         * @param options Storage options
         * @private
         */
        _readRecord: function(modelOrCollection, options)
        {
            function callback(resp)
            {
                if (chrome.runtime.lastError == null) {
                    options.success(resp[this._options['respKeyName']]);
                } else {
                    options.error(chrome.runtime.lastError);
                }
            }

            var data;
            if (modelOrCollection instanceof Backbone.Collection) {
                data = this._options['extraKeys'].concat();
            } else {
                data = this._options['extraKeys'].concat({id: modelOrCollection.id});
            }
            data[this._options['keyName']] = this._options['readKey'];
            this._sendBackgroundPageMessage(modelOrCollection, data, callback);
        },

        /**
         * Add or update an existing model in storage
         *
         * @param model Model of data to update
         * @param options Storage options
         * @private
         */
        _updateRecord: function(model, options)
        {
            function callback(resp)
            {
                if (chrome.runtime.lastError == null) {
                    options.success(resp[this._options['respKeyName']]);
                } else {
                    options.error(chrome.runtime.lastError);
                }
            }

            var data = this._options['extraKeys'].concat(model.attributes);
            data[this._options['keyName']] = this._options['updateKey'];
            this._sendBackgroundPageMessage(model, data, callback);
        },

        /**
         * Remove a model from storage
         *
         * @param model Model of data to remove
         * @param options Storage options
         * @private
         */
        _deleteRecord: function(model, options)
        {
            function callback()
            {
                if (chrome.runtime.lastError == null) {
                    options.success({});
                } else {
                    options.error(chrome.runtime.lastError);
                }
            }

            var data = this._options['extraKeys'].concat({id: model.id});
            data[this._options['keyName']] = this._options['deleteKey'];
            this._sendBackgroundPageMessage(model, data, callback);
        },

        /**
         * Implement Backbone.sync function signature.
         *
         * @param method Sync method
         * @param modelOrCollection Backbone model or collection
         * @param options Options
         */
        sync: function(method, modelOrCollection, options)
        {
            switch (method) {
                case 'update':  return this._updateRecord(modelOrCollection, options);
                case 'create':  return this._createRecord(modelOrCollection, options);
                case 'read':    return this._readRecord(modelOrCollection, options);
                case 'delete':  return this._deleteRecord(modelOrCollection, options);
            }

            throw new TypeError('Unknown method ' + method + ' in sync');
        }
    };
}());
