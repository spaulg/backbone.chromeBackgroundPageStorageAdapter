
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
    describe("A unit test for checking the model", function() {
        var TestModel = Backbone.Model.extend({
            backgroundPageStorage: new Backbone.ChromeBackgroundPageStorageAdapter(),

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
                expect(data).toEqual({items: {name: 'Jim'}, method: 'createRecord'});
                callback({items: {id: ++idCounter}});
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
                expect(data).toEqual({items: [{id: 1}], method: 'readRecord'});
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
                expect(data).toEqual({items: {id: 1, name: 'Bob'}, method: 'updateRecord'});
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
                expect(data).toEqual({items: {id: 1}, method: 'deleteRecord'});
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
