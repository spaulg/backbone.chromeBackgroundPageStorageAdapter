
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
    describe("A unit test for checking the storage adapter when using alternative key names", function() {
        var TestModel = Backbone.Model.extend({
            backgroundPageStorage: new Backbone.ChromeBackgroundPageStorageAdapter({
                keyName:     'function',
                createRecordKey:   'insert',
                readRecordKey:     'select',
                updateRecordKey:   'update',
                deleteRecordKey:   'delete',

                reqKeyName:  'records',
                respKeyName: 'records'
            }),

            sync: function(method, model, options)
            {
                return this.backgroundPageStorage.sync(method, model, options);
            }
        });

        // Tracking flags
        var idCounter = 0;
        var operationSuccess;
        var operationFailed;
        var triggerFired;

        // Create and configure model instance
        var model = new TestModel();
        model.on('request', function() {
            triggerFired = true;
        });

        // Reset flags on each test
        beforeEach(function() {
            triggerFired = false;
            operationFailed = false;
            operationSuccess = false;
            chrome.runtime.lastError = null;
        });

        it("creates records in the background page correctly", function() {
            chrome.runtime.backgroundPageCallback = function(extensionId, data, options, callback) {
                expect(data).toEqual({records: {name: 'Jim'}, function: 'insert'});
                callback({records: {id: ++idCounter}});
            };

            // Add attribute and save
            model.save('name', 'Jim', {
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

        it("reads records from the background page correctly", function() {
            chrome.runtime.backgroundPageCallback = function(extensionId, data, options, callback) {
                expect(data).toEqual({records: [{id: 1}], function: 'select'});
                callback({});
            };

            // Sync data
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

        it("updates records to the background page correctly", function() {
            chrome.runtime.backgroundPageCallback = function(extensionId, data, options, callback) {
                expect(data).toEqual({records: {id: 1, name: 'Bob'}, function: 'update'});
                callback({});
            };

            // Update attribute and save
            model.save('name', 'Bob', {
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

        it("delete records from the background page correctly", function() {
            chrome.runtime.backgroundPageCallback = function(extensionId, data, options, callback) {
                expect(data).toEqual({records: {id: 1}, function: 'delete'});
                callback({});
            };

            model.destroy({
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
