/* eslint-env mocha */

const { expect } = require('chai')
const { ObjectId } = require('mongodb')
const testServer = require('../../../test-helpers/test-server')
const testDb = require('../../../test-helpers/test-db')
const assertResponse = require('../../../test-helpers/assert-response')

// createTodo is a utility function that lets us create a todo via HTTP request
// and returns the todo as it was saved to the database
async function createTodo(mochaContext, todoData = {}) {
  const { api, db } = mochaContext

  todoData = Object.assign({}, todoData, { title: 'My Todo' })

  const response = await api.post('/todos', todoData)

  const todoId = new ObjectId(response.data.todo._id)

  return db.collection('todos').findOne({ _id: todoId })
}

describe('PATCH /todos/:todoId', function() {
  testServer.useInTest()
  testDb.useInTest()

  it('responds with 404 ResourceNotFoundError { Todo } if no todo exists with given id', async function() {
    const api = this.api

    // Test with non-Object ID
    const request1 = api.patch('/todos/1', { completed: true })
    await assertResponse.isResourceNotFoundError(request1, 'Todo')

    // Test with non-existent Object ID
    const request2 = api.patch('/todos/5b72ecfdbf16f1384b053639', {
      completed: true
    })
    await assertResponse.isResourceNotFoundError(request2, 'Todo')
  })

  it('responds with 400 ValidationError if completed is not a boolean', async function() {
    const api = this.api

    const todo = await createTodo(this)

    const request = api.patch(`/todos/${todo._id}`, { completed: 'true' })

    return assertResponse.isValidationError(request, {
      completed: 'must be a boolean'
    })
  })

  it('responds with 400 ValidationError if title is not a string', async function() {
    const api = this.api

    const todo = await createTodo(this)

    const request = api.patch(`/todos/${todo._id}`, { title: 123 })

    return assertResponse.isValidationError(request, {
      title: 'must be a string'
    })
  })

  it('responds with 400 ValidationError if title is an empty string', async function() {
    const api = this.api

    const todo = await createTodo(this)

    const request = api.patch(`/todos/${todo._id}`, { title: '' })

    return assertResponse.isValidationError(request, {
      title: 'cannot be an empty string'
    })
  })

  it('responds with 200 { todo }', async function() {
    const api = this.api

    const todo = await createTodo(this)

    const response = await api.patch(`/todos/${todo._id}`, {
      completed: true,
      title: 'My Updated Todo'
    })

    expect(response).to.have.property('status', 200)
    expect(response.data)
      .to.have.property('todo')
      .that.is.an('object')
    expect(response.data.todo)
      .to.have.property('_id')
      .that.is.a('string')
    expect(response.data.todo).to.have.property('title', 'My Updated Todo')
    expect(response.data.todo).to.have.property('completed', true)
    expect(response.data.todo)
      .to.have.property('createdAt')
      .that.is.a('string')
    expect(response.data.todo)
      .to.have.property('updatedAt')
      .that.is.a('string')
    expect(new Date(response.data.todo.updatedAt).valueOf()).to.be.closeTo(
      Date.now(),
      1000
    )
    expect(response.data.todo.updatedAt).to.not.equal(
      response.data.todo.createdAt
    )
  })

  it('only updates fields that are sent in the request body', async function() {
    const api = this.api
    const db = this.db

    const todo = await createTodo(this, { title: 'My Todo' })

    await api.patch(`/todos/${todo._id}`, { completed: true })

    const todoV2 = await db.collection('todos').findOne({ _id: todo._id })

    expect(todoV2).to.have.property('completed', true)
    expect(todoV2).to.have.property('title', 'My Todo')

    await api.patch(`/todos/${todo._id}`, { title: 'Updated Title' })

    const todoV3 = await db.collection('todos').findOne({ _id: todo._id })

    expect(todoV3).to.have.property('completed', true)
    expect(todoV3).to.have.property('title', 'Updated Title')
  })

  it('updates todo in the database', async function() {
    const api = this.api
    const db = this.db

    const todo = await createTodo(this)

    await api.patch(`/todos/${todo._id}`, {
      completed: true,
      title: 'My Updated Todo'
    })

    const updatedTodo = await db.collection('todos').findOne({ _id: todo._id })

    expect(updatedTodo).to.have.property('completed', true)
    expect(updatedTodo).to.have.property('title', 'My Updated Todo')
    expect(updatedTodo.updatedAt.valueOf()).to.be.closeTo(Date.now(), 1000)
    expect(updatedTodo.updatedAt).to.not.deep.equal(updatedTodo.createdAt)
  })

  it('trims title from input', async function() {
    const api = this.api

    const todo = await createTodo(this)

    const response = await api.patch(`/todos/${todo._id}`, {
      completed: true,
      title: '  My Updated Todo '
    })

    expect(response).to.have.property('status', 200)
    expect(response.data.todo).to.have.property('title', 'My Updated Todo')
  })
})
