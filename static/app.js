/* =============================================================
   JavaScript principal da nossa app To‑Do
   ============================================================= */

/* 1. Obter referências aos elementos do DOM (HTML) */
const todoList = document.getElementById("todo-list");
const todoForm = document.getElementById("todo-form");
const todoInput = document.getElementById("todo-input");

/* -------------------------------------------------------------
   2. Função auxiliar para chamar a API
   (torna mais curto fazer fetch + JSON em vários sítios)
   ------------------------------------------------------------- */
function callApi(url, options = {}) {
  /* Valores por defeito que todos os pedidos vão usar */
  const defaults = {
    headers: { "Content-Type": "application/json" },
  };

  /* Juntamos as opções extra enviadas pelo caller (POST, PUT, etc.) */
  const opts = Object.assign({}, defaults, options);

  /* fetch devolve uma promise; transformamos resposta em JSON se ok */
  return fetch(url, opts).then((response) => {
    if (!response.ok) {
      /* Se a API devolveu erro (HTTP 4xx ou 5xx) … */
      return Promise.reject(response);
    }
    /* … caso contrário, converte para JSON e devolve */
    return response.json();
  });
}

/* -------------------------------------------------------------
   3. Funções relacionadas com o DOM (criar e mostrar tarefas)
   ------------------------------------------------------------- */

/* Cria um <li> (tarefa) a partir de um objecto recebido da API */
function createTodoElement(todo) {
  /* <li> principal */
  const li = document.createElement("li");
  li.dataset.id = todo.id; // guardamos o id no próprio <li>

  /* se a tarefa está concluída, adicionamos classe "done" */
  if (todo.done) {
    li.classList.add("done");
  }

  /* Span que mostra o texto da tarefa */
  const span = document.createElement("span");
  span.textContent = todo.text;
  li.appendChild(span);

  /* Botão para alternar entre feito / por fazer */
  const toggleButton = document.createElement("button");
  toggleButton.textContent = todo.done ? "↺" : "✓";
  toggleButton.addEventListener("click", function () {
    toggleTodoDone(todo.id, !todo.done);
  });
  li.appendChild(toggleButton);

  /* Botão para apagar a tarefa */
  const deleteButton = document.createElement("button");
  deleteButton.textContent = "🗑️";
  deleteButton.addEventListener("click", function () {
    deleteTodo(todo.id);
  });
  li.appendChild(deleteButton);

  return li;
}

/* Mostra todas as tarefas vindas da API dentro da <ul> */
function renderTodoList(todos) {
  /* Limpa o que existe atualmente */
  todoList.innerHTML = "";

  /* Para cada tarefa cria um <li> e junta-o à <ul> */
  todos.forEach(function (todo) {
    const li = createTodoElement(todo);
    /* Colocamos no início da lista (tarefas recentes primeiro) */
    todoList.prepend(li);
  });
}

/* -------------------------------------------------------------
   4. Funções que comunicam com a API Flask
   ------------------------------------------------------------- */

/* Buscar todas as tarefas (GET /api/todos) */
function fetchTodos() {
  callApi("/api/todos")
    .then(function (data) {
      renderTodoList(data);
    })
    .catch(function () {
      alert("Erro ao obter tarefas 😢");
    });
}

/* Adicionar nova tarefa (POST /api/todos) */
function addTodo(text) {
  callApi("/api/todos", {
    method: "POST",
    body: JSON.stringify({ text: text }),
  })
    .then(fetchTodos) /* Depois de adicionar, vamos buscar tudo de novo */
    .catch(function () {
      alert("Erro ao adicionar tarefa 😢");
    });
}

/* Alternar tarefa entre concluída / pendente (PUT /api/todos/:id) */
function toggleTodoDone(id, done) {
  callApi("/api/todos/" + id, {
    method: "PUT",
    body: JSON.stringify({ done: done }),
  })
    .then(fetchTodos)
    .catch(function () {
      alert("Erro ao atualizar tarefa 😢");
    });
}

/* Apagar tarefa (DELETE /api/todos/:id) */
function deleteTodo(id) {
  /* Aqui não precisamos de resposta JSON, por isso fetch simples */
  fetch("/api/todos/" + id, { method: "DELETE" })
    .then(function (response) {
      if (response.ok) {
        fetchTodos();
      } else {
        alert("Erro ao apagar tarefa 😢");
      }
    })
    .catch(function () {
      alert("Erro ao apagar tarefa 😢");
    });
}

/* -------------------------------------------------------------
   5. Configurar eventos
   ------------------------------------------------------------- */

/* Quando o formulário for submetido… */
todoForm.addEventListener("submit", function (event) {
  event.preventDefault(); // evita recarregar a página

  const text = todoInput.value.trim(); // tira espaços em branco
  if (text.length === 0) {
    return; // se vazio, não faz nada
  }

  addTodo(text); // envia para API
  todoInput.value = ""; // limpa a caixa de texto
});

/* -------------------------------------------------------------
   6. Vamos lá buscar as tarefas logo que a página carregar
   ------------------------------------------------------------- */
fetchTodos();
