# tutorial-rest-api-integration-testing-node-js

This repository contains the code to follow along with my [tutorial on writing integration tests for REST APIs](https://maximilianschmitt.me/posts/tutorial-rest-api-integration-testing-node-js/).

- [Code for Part 1](https://github.com/maximilianschmitt/tutorial-rest-api-integration-testing-node-js/tree/part-1)
- [Code for Part 2](https://github.com/maximilianschmitt/tutorial-rest-api-integration-testing-node-js/tree/part-2)
- [Code for Part 3](https://github.com/maximilianschmitt/tutorial-rest-api-integration-testing-node-js/tree/part-3)

## Built on Top of These Core Libraries:

- express
- mocha
- chai

## Endpoints

- `POST /todos` - To create a todo
- `GET /todos` - To list all todos
- `PATCH /todos/:todoId` - To update a todo

## Directory Structure

```
src/
  errors/
    ValidationError.js
    ResourceNotFoundError.js
  todos/
    __http-tests__
      create-todo.test.js
      list-todos.test.js
      patch-todo.test.js
    routes.js
    TodosService.js
  main.js
test-helpers/
  test-db.js
  test-server.js
package.json
yarn.lock
```
