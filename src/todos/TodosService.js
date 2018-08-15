const { ObjectId } = require('mongodb')
const ValidationError = require('../errors/ValidationError')
const ResourceNotFoundError = require('../errors/ResourceNotFoundError')

module.exports = class TodosService {
  constructor(db) {
    this.db = db
  }

  async listTodos() {
    const todos = await this.db
      .collection('todos')
      .find({})
      .sort({ _id: 1 })
      .toArray()

    return todos
  }

  async createTodo(todoData) {
    if (!todoData.title) {
      throw new ValidationError({ title: 'required' })
    }

    if (typeof todoData.title !== 'string') {
      throw new ValidationError({ title: 'must be a string' })
    }

    todoData.title = todoData.title.trim()

    const result = await this.db.collection('todos').insert({
      title: todoData.title,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    const todo = result.ops[0]

    return todo
  }

  async patchTodo(todoId, todoData) {
    if (!ObjectId.isValid(todoId)) {
      throw new ResourceNotFoundError('Todo')
    }

    todoId = new ObjectId(todoId)

    todoData = sanitize(todoData)

    validate(todoData)

    todoData.updatedAt = new Date()

    const result = await this.db
      .collection('todos')
      .findOneAndUpdate(
        { _id: todoId },
        { $set: todoData },
        { returnOriginal: false }
      )

    if (!result.value) {
      throw new ResourceNotFoundError('Todo')
    }

    return result.value

    function sanitize(todoData) {
      const sanitizedTodoData = {}

      if (todoData.title != null) {
        sanitizedTodoData.title = todoData.title
      }

      if (typeof todoData.title === 'string') {
        sanitizedTodoData.title = todoData.title.trim()
      }

      if (todoData.completed != null) {
        sanitizedTodoData.completed = todoData.completed
      }

      return sanitizedTodoData
    }

    function validate(todoData) {
      const invalidFields = {}

      if (todoData.title != null && typeof todoData.title !== 'string') {
        invalidFields.title = 'must be a string'
      } else if (todoData.title === '') {
        invalidFields.title = 'cannot be an empty string'
      }

      if (
        todoData.completed != null &&
        typeof todoData.completed !== 'boolean'
      ) {
        invalidFields.completed = 'must be a boolean'
      }

      if (Object.keys(invalidFields).length > 0) {
        throw new ValidationError(invalidFields)
      }
    }
  }
}
