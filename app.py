from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
import mysql.connector
import os

app = Flask(__name__, static_folder="static", template_folder="templates")
CORS(app)

DB = {
    "host":     "localhost",
    "user":     "todo_user",
    "password": "troca_esta_password",
    "database": "todo_app",
    "auth_plugin": "mysql_native_password"
}

def get_db():
    """Abre ligação por pedido (sem pool, suficiente para dev)."""
    return mysql.connector.connect(**DB)

@app.route("/")
def index():
    return render_template("index.html")

# ---------- API ----------
@app.route("/api/todos", methods=["GET"])
def list_todos():
    conn = get_db(); cur = conn.cursor(dictionary=True)
    cur.execute("SELECT id, text, done FROM todos ORDER BY id DESC")
    rows = cur.fetchall()
    cur.close(); conn.close()
    return jsonify(rows)

@app.route("/api/todos", methods=["POST"])
def add_todo():
    text = request.json.get("text", "").strip()
    if not text:
        return jsonify({"error": "texto vazio"}), 400
    conn = get_db(); cur = conn.cursor()
    cur.execute("INSERT INTO todos (text) VALUES (%s)", (text,))
    conn.commit()
    todo_id = cur.lastrowid
    cur.close(); conn.close()
    return jsonify({"id": todo_id, "text": text, "done": 0}), 201

@app.route("/api/todos/<int:todo_id>", methods=["PUT"])
def update_todo(todo_id):
    done = int(bool(request.json.get("done", 0)))
    conn = get_db(); cur = conn.cursor()
    cur.execute("UPDATE todos SET done=%s WHERE id=%s", (done, todo_id))
    conn.commit()
    cur.close(); conn.close()
    return jsonify({"id": todo_id, "done": done})

@app.route("/api/todos/<int:todo_id>", methods=["DELETE"])
def delete_todo(todo_id):
    conn = get_db(); cur = conn.cursor()
    cur.execute("DELETE FROM todos WHERE id=%s", (todo_id,))
    conn.commit()
    cur.close(); conn.close()
    return "", 204

# ---------- run ----------
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
