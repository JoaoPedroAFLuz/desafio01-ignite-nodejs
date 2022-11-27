const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: 'User not found' });
  }

  request.user = user;

  next();
}

app.get('/users', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  response.json(user);
});

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some((user) => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: 'Username already exists' });
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(newUser);

  response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(newTodo);

  response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;
  const { user } = request;

  const todo = user.todos.find((todo) => {
    return todo.id === id;
  });

  if (!todo) {
    return response.status(404).json({ error: 'To do not found' });
  }

  const updatedTodo = {
    ...todo,
    title,
    deadline,
  };

  user.todos = user.todos.map((todo) => (todo.id === id ? updatedTodo : todo));

  response.status(201).json(updatedTodo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find((todo) => {
    return todo.id === id;
  });

  if (!todo) {
    return response.status(404).json({ error: 'To do not found' });
  }

  const patchedTodo = {
    ...todo,
    done: true,
  };

  user.todos = user.todos.map((todo) => (todo.id === id ? patchedTodo : todo));

  return response.status(201).json(patchedTodo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find((todo) => {
    return todo.id === id;
  });

  if (!todo) {
    return response.status(404).json({ error: 'To do not found' });
  }

  user.todos = user.todos.filter((todo) => todo.id !== id);

  response.sendStatus(204);
});

module.exports = app;
