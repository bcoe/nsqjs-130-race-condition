const Defaults = require('./defaults')
const nsq = require('nsqjs')

let writer = null
function Writer () {
  return new Promise((resolve, reject) => {
    if (!writer) {
      const [writerIP, writerPort] = (process.env.NSQ_WRITER_ADDRESS || Defaults.NSQ_WRITER_ADDRESS).split(':')
      writer = new nsq.Writer(writerIP, Number(writerPort))
      try {
        writer.connect()
      } catch (err) {
        return reject(err)
      }
      writer.on('ready', () => {
        return resolve(writer)
      })
    } else {
      return resolve(writer)
    }
  })
}

module.exports = Writer
