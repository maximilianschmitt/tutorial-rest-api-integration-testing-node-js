const ValidationError = require('../errors/ValidationError')

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
}
