from flask import Flask, render_template, request, redirect, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from datetime import datetime
import random

app = Flask(__name__)

# Configuração do MySQL
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://todo_user:troca_esta_password@localhost/todo_app'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'pool_pre_ping': True,
    'pool_recycle': 3600
}

db = SQLAlchemy(app)
migrate = Migrate(app, db)

# Modelos
class Category(db.Model):
    __tablename__ = 'categories'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    color = db.Column(db.String(7), default='#cccccc')

class Todo(db.Model):
    __tablename__ = 'todos'
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(255), nullable=False)
    done = db.Column(db.Boolean, default=False)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'))
    category = db.relationship('Category', backref='todos')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime)

# Rotas
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/todos')
def todo_app():
    todos = Todo.query.order_by(Todo.id.desc()).all()
    categories = Category.query.all()
    return render_template('todo_app.html', todos=todos, categories=categories)

@app.route('/add', methods=['POST'])
def add_todo():
    try:
        text = request.form.get('text')
        category_id = request.form.get('category')
        
        if not text:
            return redirect('/todos')
            
        new_todo = Todo(text=text, category_id=category_id if category_id else None)
        db.session.add(new_todo)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        print(f"Error: {e}")
    return redirect('/todos')

@app.route('/complete/<int:todo_id>')
def complete_todo(todo_id):
    try:
        todo = Todo.query.get_or_404(todo_id)
        todo.done = not todo.done
        if todo.done:
            todo.completed_at = datetime.utcnow()
        else:
            todo.completed_at = None
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        print(f"Error: {e}")
    return redirect('/todos')

@app.route('/delete/<int:todo_id>')
def delete_todo(todo_id):
    try:
        todo = Todo.query.get_or_404(todo_id)
        db.session.delete(todo)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        print(f"Error: {e}")
    return redirect('/todos')

@app.route('/random')
def random_number():
    return jsonify({'random_number': random.randint(1, 100)})

# Inicialização - apenas para criar categorias iniciais
def init_db():
    with app.app_context():
        # Não precisamos criar tabelas aqui, as migrações cuidarão disso
        if not Category.query.first():
            categories = [
                Category(name="Trabalho", color="#3b82f6"),
                Category(name="Pessoal", color="#10b981"),
                Category(name="Estudo", color="#f59e0b")
            ]
            db.session.bulk_save_objects(categories)
            db.session.commit()

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5000, debug=True)