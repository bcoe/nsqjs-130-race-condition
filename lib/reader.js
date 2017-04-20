const Defaults = require('./defaults')
const nsq = require('nsqjs')

const readers = {} // readers by channel.
function Reader (channel) {
  return new Promise((resolve, reject) => {
    if (!readers[channel]) {
      readers[channel] = new nsq.Reader(process.env.NSQ_REGISTRY_EVENT_TOPIC || Defaults.NSQ_REGISTRY_EVENT_TOPIC, channel, {
        lookupdHTTPAddresses: process.env.NSQ_LOOKUP_ADDRESS || '127.0.0.1:4161',
        maxInFlight: 200
      })

      try {
        readers[channel].connect()
        readers[channel].on('nsqd_connected', () => {
          return resolve(readers[channel])
        })
      } catch (err) {
        return reject(err)
      }
    } else {
      return resolve(readers[channel])
    }
  })
}

module.exports = Reader
