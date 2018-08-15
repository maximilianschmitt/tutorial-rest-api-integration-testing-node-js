/* eslint-env mocha */

const { expect } = require('chai')
const testServer = require('../../../test-helpers/test-server')
const testDb = require('../../../test-helpers/test-db')
const assertResponse = require('../../../test-helpers/assert-response')

function createTodo(api, todoData) {
  return api.post('/todos', todoData)
}

describe('POST /todos', function() {
  testServer.useInTest()
  testDb.useInTest()

  it('responds with 400 ValidationError if title is missing', async function() {
    const api = this.api

    const request = createTodo(api, {})

    return assertResponse.isValidationError(request, { title: 'required' })
  })

  it('responds with 400 ValidationError if title is empty', async function() {
    const api = this.api

    const request = createTodo(api, { title: '' })

    return assertResponse.isValidationError(request, { title: 'required' })
  })

  it('responds with 400 ValidationError if title is not a string', async function() {
    const api = this.api

    const request = createTodo(api, { title: 123 })

    return assertResponse.isValidationError(request, {
      title: 'must be a string'
    })
  })

  it('responds with 200 { todo }', async function() {
    const api = this.api

    const response = await createTodo(api, { title: 'My Test Todo' })

    expect(response).to.have.property('status', 200)
    expect(response.data)
      .to.have.property('todo')
      .that.is.an('object')
    expect(response.data.todo)
      .to.have.property('_id')
      .that.is.a('string')
    expect(response.data.todo).to.have.property('title', 'My Test Todo')
    expect(response.data.todo).to.have.property('completed', false)
    expect(response.data.todo)
      .to.have.property('createdAt')
      .that.is.a('string')
    expect(new Date(response.data.todo.createdAt).valueOf()).to.be.closeTo(
      Date.now(),
      1000
    )
    expect(response.data.todo)
      .to.have.property('updatedAt')
      .that.is.a('string')
    expect(response.data.todo.updatedAt).to.equal(response.data.todo.createdAt)
  })

  it('saves todo to the database', async function() {
    const api = this.api
    const db = this.db

    await createTodo(api, { title: 'My Test Todo' })
    const [latestTodo] = await db
      .collection('todos')
      .find({})
      .sort({ _id: -1 })
      .toArray()

    expect(latestTodo).to.be.ok
    expect(latestTodo).to.have.property('title', 'My Test Todo')
    expect(latestTodo).to.have.property('completed', false)
    expect(latestTodo)
      .to.have.property('createdAt')
      .that.is.an.instanceOf(Date)
    expect(latestTodo.createdAt.valueOf()).to.be.closeTo(Date.now(), 1000)
    expect(latestTodo)
      .to.have.property('updatedAt')
      .that.is.an.instanceOf(Date)
    expect(latestTodo.updatedAt).to.deep.equal(latestTodo.createdAt)
  })

  it('trims title from input', async function() {
    const api = this.api

    const response = await createTodo(api, { title: '  My Test Todo ' })

    expect(response).to.have.property('status', 200)
    expect(response.data.todo).to.have.property('title', 'My Test Todo')
  })
})
