# nsq-registry-event-client

A thin abstraction on top of nsqjs providing:

* npm's environment-based approach to configuration (set
  `NSQ_REGISTRY_EVENT_TOPIC`, `NSQ_LOOKUP_ADDRESS`, `NSQ_WRITER_ADDRESS`).
* JSON serialization/deserialization.
* a centralized place to document package events.

## Events

### Package Privacy

Should be emitted when a package's privacy flips.

```js
{
  "event": "package_privacy",
  "package": "@foo/fake-module",
  "private": true | false
}
```

### Package Unpublished

Should be emitted when a package is unpublished.

```js
{
  "event": "package_unpublish",
  "package": "@foo/fake-module"
}
```

## API

* `Client(*String* channel)`: return a client configured to listen for events on `channel`.
* `connectAsReader()`: returns `Promise` which will resolve once the client is ready to read events.
* `sendPackagePrivacyEvent(*String* packageName, *Boolean* private)`: dispatch a package privacy event.
* `sendPackageUnpublishEvent(*String* packageName)`: dispatch a package unpublish event.
* `on(*String* eventName, *Function* handler)`: list for a specific event, and emit payloads to handler.
  Event is one of:
    * `package_unpublish`: emitted by `sendPackageUnpublishEvent()`.
    * `package_privacy`: emitted by `sendPackagePrivacyEvent()`.
* `once(*String* eventName, *Function* handler)`: listen for a single event (useful in tests).

## Environment Variables

* `NSQ_REGISTRY_EVENT_TOPIC`: topic to subscribe to for messges, e.g., `registry_events`.
* `NSQ_LOOKUP_ADDRESS`: address used by reader to lookup queues.
* `NSQ_WRITER_ADDRESS`: address used to dispatch new messages

## Listening for Events as Reader

```js
const client = require('nsq-registry-event-client')('my_application')
client.connectAsReader()
  .then(() => {
    client.on('package_privacy', (event) => {
      // do something with the package privacy event.
    })
  })
```

## Dispatching Events as Writer

```js
const client = require('nsq-registry-event-client')
client.sendPackagePrivacyEvent('@bcoe/foo', true)
```

## Testing

1. Install the newest version of [Docker for Mac](https://docs.docker.com/docker-for-mac/install/).
2. run `docker-compose build`, `docker-compose up -d`, in the project root.
3. run `npm test`.
