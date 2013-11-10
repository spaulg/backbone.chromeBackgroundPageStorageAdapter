
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

(function(){
    describe("A unit test for checking the storage adapter", function() {
        var storageAdapter = new Backbone.ChromeBackgroundPageStorageAdapter();
        var TestModel = Backbone.Model.extend({
            backgroundPageStorage: storageAdapter,

            sync: function(method, model, options)
            {
                return this.backgroundPageStorage.sync(method, model, options);
            }
        });

        var TestCollection = Backbone.Collection.extend({
            model: TestModel,
            backgroundPageStorage: storageAdapter,

            sync: function(method, model, options)
            {
                return this.backgroundPageStorage.sync(method, model, options);
            }
        });

        // Tracking flags
        var operationSuccess;
        var operationFailed;
        var triggerFired;

        // Create and configure model instance
        var model;
        var collection = new TestCollection();
        collection.on('request', function() {
            triggerFired = true;
        });

        // Reset flags on each test
        beforeEach(function() {
            triggerFired = false;
            operationFailed = false;
            operationSuccess = false;
            chrome.runtime.lastError = null;
        });

        it("reads records for a collection from the background page correctly", function() {
            chrome.runtime.backgroundPageCallback = function(extensionId, data, options, callback) {
                expect(data).toEqual({method: "readCollection"});
                callback({records: [{id: 1, name: 'Jim'}, {id: 2, name: 'Bob'}]});
            };

            collection.fetch({
                success: function() {
                    operationSuccess = true;
                },
                error: function() {
                    operationFailed = true;
                }
            });

            expect(operationSuccess).toBe(true);
            expect(operationFailed).toBe(false);
            expect(triggerFired).toBe(true);
        });

        it("reads records for a model contained in a collection from the background page correctly", function() {
            chrome.runtime.backgroundPageCallback = function(extensionId, data, options, callback) {
                expect(data).toEqual({records: [{id: 2}], method: 'readRecord'});
                callback({});
            };

            // Sync data
            model = collection.get(2);

            model.fetch({
                success: function() {
                    operationSuccess = true;
                },
                error: function() {
                    operationFailed = true;
                }
            });

            expect(operationSuccess).toBe(true);
            expect(operationFailed).toBe(false);
            expect(triggerFired).toBe(true);
        });
    });
}());
