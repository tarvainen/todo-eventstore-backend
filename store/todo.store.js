const redis = require('redis')
const { promisify } = require('util')

const db = redis.createClient()
db.get = promisify(db.get)
db.sismember = promisify(db.sismember)
db.smembers = promisify(db.smembers)
db.sadd = promisify(db.sadd)
db.set = promisify(db.set)
db.srem = promisify(db.srem)
db.del = promisify(db.del)

const store = {
  getById: async id => JSON.parse(await db.get(`objects:${id}`)),
  save: async item => {
    if (!await db.sismember('objects:all', item.id)) {
      await db.sadd('objects:all', item.id)
    }

    await db.set(`objects:${item.id}`, JSON.stringify(item))
  },
  getAll: async () => {
    const output = []

    const items = await db.smembers('objects:all')

    for (const id of items) {
      output.push(await store.getById(id))
    }

    return output
  },
  delete: async (id) => {
    await db.srem('objects:all', id)
    await db.del(`objects:${id}`)

    console.log('deleted ' + id)
  }
}

module.exports = store
