const EventEmitter = require('events')
const Defaults = require('./defaults')
const validate = require('aproba')
const Reader = require('./reader')
const Writer = require('./writer')

class NSQRegistryClient {
  constructor (channel) {
    validate('S', arguments)
    this.channel = channel
    this.topic = process.env.NSQ_REGISTRY_EVENT_TOPIC || Defaults.NSQ_REGISTRY_EVENT_TOPIC
    this.writer = null
    this.eventEmitter = new EventEmitter()
  }
  sendPackagePrivacyEvent (pkg, priv) {
    validate('SB', arguments)
    return this._getWriter()
      .then((writer) => {
        this.writer.publish(this.topic, JSON.stringify({
          event: 'package_privacy',
          package: pkg,
          private: priv
        }))
      })
  }
  sendPackageUnpublishEvent (pkg) {
    validate('S', arguments)
    return this._getWriter()
      .then((writer) => {
        this.writer.publish(this.topic, JSON.stringify({
          event: 'package_unpublish',
          package: pkg
        }))
      })
  }
  close () {
    if (this.reader) this.reader.close()
    if (this.writer) this.writer.close()
  }
  _getWriter () {
    return Writer()
      .then((writer) => {
        this.writer = writer
        return writer
      })
  }
  on (event, cb) {
    this.eventEmitter.on(event, cb)
  }
  once (event, cb) {
    this.eventEmitter.once(event, cb)
  }
  connectAsReader () {
    if (this.reader) return Promise.resolve(this.reader)
    return new Promise((resolve, reject) => {
      return Reader(this.channel)
        .then((reader) => {
          this.reader = reader

          // sleep to demonstrate race condition.
          setTimeout(() => {
            return resolve(reader)
          }, 30)

          reader.on('message', (msg) => {
            // TODO: add bole logging here using the standard logging
            // approach we've been converging on?
            try {
              const payload = JSON.parse(msg.body.toString())
              payload.id = msg.id
              msg.finish()
              this.eventEmitter.emit(payload.event, payload)
            } catch (err) {
              console.error(err.message)
            }
          })
        })
    })
  }
}

const clients = {}
module.exports = function (channel) {
  if (!clients[channel]) {
    clients[channel] = new NSQRegistryClient(channel)
  }
  return clients[channel]
}
