const express = require('express')
const TodosService = require('./TodosService')

const router = express.Router()

router.get('/todos', function(req, res, next) {
  const { db } = req

  const todosService = new TodosService(db)

  todosService
    .listTodos()
    .then(todos => res.status(200).json({ todos }))
    .catch(next)
})

router.post('/todos', function(req, res, next) {
  const { db, body } = req

  const todosService = new TodosService(db)

  todosService
    .createTodo(body)
    .then(todo => res.status(200).json({ todo }))
    .catch(next)
})

router.patch('/todos/:todoId', function(req, res, next) {
  const { db, body } = req

  const { todoId } = req.params

  const todosService = new TodosService(db)

  todosService
    .patchTodo(todoId, body)
    .then(todo => res.status(200).json({ todo }))
    .catch(next)
})

module.exports = router
