var Queue = require('bull')

const todoEvents = new Queue('todo-events', 'redis://127.0.0.1:6379')

const dispatchMany = events => {
  for (const event of events) {
    todoEvents.add(event)
  }
}

module.exports = { dispatchMany, todoEvents }
