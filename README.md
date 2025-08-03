# 🚀 Space Defender & Pixel Todo - FullStack Python

Aplicação FullStack que combina um jogo espacial com um sistema de gestão de tarefas, utilizando Python (Flask) no backend e vanilla JavaScript no frontend com estilo pixel art.

## 🌟 Funcionalidades

### 🎮 Space Defender Game
- Controles de nave com teclado (← → e SPACE)
- Sistema de pontuação e vidas
- Power-ups (tiro rápido, escudo, vida extra)
- Geração dinâmica de asteroides
- Dificuldade progressiva

### ✅ Pixel Todo App
- CRUD completo de tarefas
- Categorias com cores personalizadas
- Marcação de tarefas completas
- Interface pixel art responsiva
- Geração de números aleatórios (API)

## 🛠️ Tecnologias

**Backend:**
- Python 3.10+
- Flask
- Flask-SQLAlchemy
- Flask-Migrate
- MySQL

**Frontend:**
- HTML5/CSS3 (puro)
- JavaScript (ES6)
- Design pixel art
- Layout responsivo

**Banco de Dados:**
- MySQL 8.0+

## 🚀 Instalação e Execução

### Pré-requisitos
- Python 3.10+
- MySQL Server
- pip

### Passo a Passo

1. **Clonar repositório:**
   ```bash
   git clone https://github.com/CarolinaFM96/FullStack_Python.git
   cd FullStack_Python
Criar ambiente virtual:

bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
Instalar dependências:

bash
pip install -r requirements.txt
Configurar banco de dados:

sql
CREATE DATABASE todo_app;
CREATE USER 'todo_user'@'localhost' IDENTIFIED BY 'senha_segura';
GRANT ALL PRIVILEGES ON todo_app.* TO 'todo_user'@'localhost';
FLUSH PRIVILEGES;
Atualizar conexão MySQL (app.py):

python
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://todo_user:senha_segura@localhost/todo_app'
Executar migrações:

bash
flask db init
flask db migrate
flask db upgrade
Iniciar aplicação:

bash
python app.py
Acessar no navegador:
Jogo: http://localhost:5000

Todo App: http://localhost:5000/todos

🗄️ Estrutura do Banco de Dados
Diagrama de Entidades
erDiagram
    CATEGORIES ||--o{ TODOS : contém
    CATEGORIES {
        int id PK
        varchar(50) name
        varchar(7) color
    }
    TODOS {
        int id PK
        varchar(255) text
        bool done
        datetime created_at
        datetime completed_at
        int category_id FK
    }
    
Script SQL
sql
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    color VARCHAR(7) DEFAULT '#cccccc'
);

CREATE TABLE todos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    text VARCHAR(255) NOT NULL,
    done BOOLEAN DEFAULT FALSE,
    category_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

📂 Estrutura de Arquivos
text
FullStack_Python/
├── app.py                 # Aplicação principal Flask
├── requirements.txt       # Dependências Python
├── static/
│   ├── game.css           # Estilos para o jogo
│   ├── game.js            # Lógica do jogo
│   ├── todo.css           # Estilos para o Todo App
│   └── todo.js            # Script para o Todo App
├── templates/
│   ├── index.html         # Página inicial (jogo)
│   └── todo_app.html      # Página do Todo App
├── migrations/            # Migrações de banco de dados
└── README.md              # Documentação

🌐 Rotas da API
Método	Endpoint	Descrição
GET	/	Página inicial (jogo)
GET	/todos	Todo App com lista de tarefas
POST	/add	Adicionar nova tarefa
GET	/complete/<id>	Alternar estado da tarefa
GET	/delete/<id>	Excluir tarefa
GET	/random	Gerar número aleatório (JSON)

🕹️ Como Jogar (Space Defender)
Controles:

← → : Movimentar nave

SPACE : Atirar

Objetivo: Destruir asteroides antes que atinjam sua nave

Power-ups:

🟢 Verde: Tiro rápido (10s)

🔵 Azul: Escudo (15s)

🟡 Amarelo: Vida extra

Pontuação:

+10 pontos por asteroide destruído

Vida extra a cada 500 pontos
