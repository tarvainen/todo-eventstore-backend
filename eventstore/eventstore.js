const { promisify } = require('util')

const es = require('eventstore')({
  type: 'redis',
  host: 'localhost',
  port: 6379,
  db: 0,
  prefix: 'eventstore',
  eventsCollectionName: 'events',
  snapshotsCollectionName: 'snapshots',
  timeout: 10000
})

es.getEventStream = promisify(es.getEventStream)
es.getFromSnapshot = promisify(es.getFromSnapshot)

es.init()

es.on('connect', () => console.log('Connected'))
es.on('disconnect', () => console.log('Disconnected'))

module.exports = es
