const fastify = require('fastify')({ logger: true })
const uuid = require('uuid').v4
const { NotFound } = require('http-errors')

const commandHandler = require('./todos/todo.command-handler')
const { todoEvents } = require('./messaging/event-bus')
const store = require('./store/todo.store')

const createTodoNotFoundResponse = (id) =>
  new NotFound('Todo with id ' + id + ' was not found')

fastify.post('/todo', async req =>
  commandHandler({
    type: 'createTodo',
    payload: {
      id: uuid(),
      ...req.body,
      time: new Date()
    }
  }, true)
)

fastify.get('/todo/:todoId', async req =>
  await store.getById(req.params.todoId) ||
    createTodoNotFoundResponse(req.params.todoId)
)

fastify.get('/todo', async () =>
  store.getAll()
)

fastify.delete('/todo/:todoId', async req =>
  await commandHandler({
    type: 'markAsDone',
    payload: {
      id: req.params.todoId,
      comment: req.body.comment || '',
      time: new Date()
    }
  }) || createTodoNotFoundResponse(req.params.todoId)
)

fastify.post('/todo/:todoId/assign', async req =>
  await commandHandler({
    type: 'assignTodo',
    payload: {
      id: req.params.todoId,
      assignee: req.body.assignee,
      time: new Date()
    }
  }) || createTodoNotFoundResponse(req.params.todoId)
)

fastify.post('/todo/:todoId/dismiss', async req =>
  await commandHandler({
    type: 'dismissTodo',
    payload: {
      id: req.params.todoId,
      time: new Date()
    }
  }) || createTodoNotFoundResponse(req.params.todoId)
)

// Listen domain events dispatched from the
// todo command handler
todoEvents.process(async event => {
  switch (event.data.type) {
    case 'todoCreated': {
      const todo = event.data
      delete todo.type

      store.save(todo)
      break
    }
    case 'todoUpdated': {
      const todo = event.data
      delete todo.type

      // We want viewmodel to contain only not done todos
      if (todo.state === 'done') {
        break
      }

      const existingTodo = await store.getById(todo.id)

      store.save({ ...existingTodo, ...todo })
      break
    }
    case 'todoMarkedAsDone': {
      const todo = event.data

      store.delete(todo.id)
    }
  }
})

;(async () => {
  await fastify.listen(3000)

  fastify.log.info(
    `TODO server listening on ${fastify.server.address().port}`
  )
})()
