const eventstore = require('../eventstore/eventstore')
const TodoAggregate = require('./todo.aggregate')

const loadTodoById = async todoId => new Promise(resolve => {
  eventstore.getFromSnapshot(`todos/${todoId}`, (err, snapshot, stream) => {
    if (err) {
      throw err
    }

    const history = stream.events

    if (!snapshot && history.length === 0) {
      return resolve(null)
    }

    const aggregate = new TodoAggregate(todoId)
      .loadFromSnapshot(snapshot ? snapshot.data : {})
      .loadFromHistory(history)

    if (!snapshot || history.length > 5) {
      eventstore.createSnapshot({
        streamId: `todos/${todoId}`,
        data: aggregate.createSnapshot(),
        revision: stream.lastRevision
      })
    }

    resolve(aggregate)
  })
})

module.exports = {
  loadTodoById
}
