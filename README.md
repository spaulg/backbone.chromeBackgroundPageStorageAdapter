# Google Chrome background messaging API Storage Adapter

A storage adapter for Google Chrome web browser extension writers that treats the
background page as a storage backend.

Designed to optionally be used with the backbone.storageProxy.js plugin.

## Usage
```html
<script src="backbone.js"></script>
<script src="backbone.chromeBackgroundPageStorageAdapter.js"></script>
```

To send data to the background page for later storage (e.g. using the chrome storage APIs):
```html
var model = Backbone.Model.extend({
     backgroundPageStorage: new Backbone.ChromeBackgroundPageStorageAdapter(),

     sync: function(method, model, options)
     {
         return this.backgroundPageStorage.sync(method, model, options);
     }
});
```

To use alongside backbone.storageProxy.js:
```javascript
var model = Backbone.Model.extend({
    initialize: function()
    {
        this.storageProxy = new Backbone.StorageProxy(this, new Backbone.ChromeBackgroundPageStorageAdapter();
    }
});
```

Any subsequent call to the sync method on a model or collection with the storage adapter applied will
have its data sent to the background page for storage. As the save, fetch or destroy methods forward
to the sync method associated to their respective model or collection, those calls will also be handled
by the storage adapter and thus the background page.

### Background page

The background page must register an event handler to receive messages via a callback. For example:

```javascript
function onMessageCallback(request, sender, sendResponse) {
    switch (request.method) {
        case 'readCollection':
            // ... do something to fetch the data and populate the
            // sendResponse object with the items key
            // e.g. sendResponse = {records: [{id: 1, name: 'Jim'}, {id: 2, name: 'Bob'}]}
            break;

        case 'readRecord':
            // ... do something to fetch the data and populate the
            // sendResponse object with the items key
            // e.g. sendResponse = {records: {id: 1, name: 'Jim'}}
            break;

        case 'createRecord':
            // ... do something to create the record. Make sure to populate
            // the sendResponse object with an id attribute.
            // e.g. sendResponse = {records: {id: 1}}
            break;

        case 'updateRecord':
            // ... do something to update the record, no need to
            // return any data here
            break;

        case 'deleteRecord':
            // ... do something to delete the record, no need to
            // return any data here
            break;
    }
}

chrome.runtime.onMessage.addListener(onMessageCallback);
```

### Object key names

You can change the key names and values used in the request object passed to background page by defining the
keys to use when attaching an instance of the ChromeBackgroundPageStorageAdapter class to your models and
collections.

## License

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
