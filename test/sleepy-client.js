/* global describe, it */

const Client = require('../lib/sleepy-client')
const Reader = require('../lib/reader')
const uuid = require('uuid')

require('chai').should()

describe('NSQLRegistryClient', () => {
  describe('sendPackagePrivacyEvent', () => {
    const channel = `channel_${uuid.v4()}`
    it('dispatches a package privacy event', (done) => {
      const client = Client(channel)
      Reader(channel)
        .then((reader) => {
          reader.once('message', (msg) => {
            const body = JSON.parse(msg.body.toString())
            body.package.should.equal('@bcoe/foo')
            body.event.should.equal('package_privacy')
            body.private.should.equal(true)
            return done()
          })
          client.sendPackagePrivacyEvent('@bcoe/foo', true)
        })
    })
  })

  describe("on('package_privacy')", () => {
    const channel = `channel_${uuid.v4()}`
    it('emits package_privacy events', (done) => {
      const client = Client(channel)
      client.connectAsReader()
        .then(() => {
          client.once('package_privacy', (event) => {
            event.package.should.equal('@bcoe/foo')
            event.event.should.equal('package_privacy')
            event.private.should.equal(true)
            return done()
          })
          client.sendPackagePrivacyEvent('@bcoe/foo', true)
        })
    })
  })

  describe("on('package_unpublish')", () => {
    const channel = `channel_${uuid.v4()}`
    it('emits package_privacy events', (done) => {
      const client = Client(channel)
      client.connectAsReader()
        .then(() => {
          client.once('package_unpublish', (event) => {
            event.package.should.equal('@bcoe/bar')
            event.event.should.equal('package_unpublish')
            return done()
          })
          client.sendPackageUnpublishEvent('@bcoe/bar')
        })
    })
  })

  describe('test edge cases', () => {
    const channel = `channel_${uuid.v4()}`
    it('allows two clients to listen for different events on the same channel', (done) => {
      const client = Client(channel)
      const client2 = Client(channel)
      client.connectAsReader()
        .then(() => {
          return client2.connectAsReader()
        })
        .then(() => {
          let called = 0
          client.once('package_privacy', (event) => {
            called++
            event.event.should.equal('package_privacy')
            if (called === 2) return done()
          })
          client2.once('package_unpublish', (event) => {
            called++
            event.event.should.equal('package_unpublish')
            if (called === 2) return done()
          })
          client.sendPackagePrivacyEvent('@bcoe/foo', true)
          client.sendPackageUnpublishEvent('@bcoe/snuh')
        })
    })
  })
})
