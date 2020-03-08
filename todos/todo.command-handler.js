const TodoAggregate = require('./todo.aggregate')
const eventstore = require('../eventstore/eventstore')
const { dispatchMany } = require('../messaging/event-bus')

const handleCommand = async (command, allowCreate = false) => {
  const { payload } = command

  const aggregate = new TodoAggregate(payload.id)

  const stream = await eventstore
    .getEventStream(`todos/${aggregate.id}`)

  // No events for resource found yet => 404
  if (!allowCreate && stream.events.length === 0) {
    return null
  }

  aggregate.loadFromHistory(stream.events)

  const domainEvents = aggregate.apply(command)

  stream.addEvent(command)
  stream.commit()

  dispatchMany(domainEvents)

  return aggregate
}

module.exports = handleCommand
