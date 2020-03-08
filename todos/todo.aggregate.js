class TodoAggregate {
  constructor (id) {
    this.id = id || null
    this.description = null
    this.state = null
    this.createdAt = null
    this.modifiedAt = null
    this.comment = null
    this.assignee = null
  }

  apply (event) {
    return (this['_' + event.type] || (() => {})).bind(this)(event.payload)
  }

  loadFromHistory (events) {
    for (const { payload } of events) {
      this.apply(payload)
    }

    return this
  }

  loadFromSnapshot (snapshot) {
    snapshot = snapshot || {}

    this.id = snapshot.id
    this.description = snapshot.description
    this.state = snapshot.state
    this.createdAt = snapshot.createdAt
    this.modifiedAt = snapshot.modifiedAt
    this.comment = snapshot.comment
    this.assignee = snapshot.assignee

    return this
  }

  createSnapshot () {
    return {
      id: this.id,
      description: this.description || null,
      state: this.state || null,
      createdAt: this.createdAt || null,
      modifiedAt: this.modifiedAt || null,
      comment: this.comment || null,
      assignee: this.assignee || null
    }
  }

  _createTodo (payload) {
    this.id = payload.id
    this.description = payload.description
    this.state = 'todo'
    this.createdAt = payload.time
  }

  _assignTodo (payload) {
    this.state = 'in-progress'
    this.modifiedAt = payload.time
    this.assignee = payload.assignee || 'unknown'
  }

  _dismissTodo (payload) {
    this.state = 'todo'
    this.modifiedAt = payload.time
    delete this.assignee
  }

  _markAsDone (payload) {
    this.state = 'done'
    this.modifiedAt = payload.time
    this.comment = payload.comment
  }
}

module.exports = TodoAggregate
