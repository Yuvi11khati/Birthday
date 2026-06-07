import os
import sqlite3
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/v1/health', methods=['GET'])
@app.route('/health', methods=['GET'])
@app.route('/test', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "birthday-memory-book"}), 200

DB_PATH = os.path.join(os.path.dirname(__file__), 'memory_book.db')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_db() as conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                message TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        ''')
        conn.execute('''
            CREATE TABLE IF NOT EXISTS wishes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                wish TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        ''')
        conn.commit()

        conn.commit()

@app.route('/api/messages', methods=['GET'])
def get_messages():
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM messages ORDER BY id DESC")
            rows = cursor.fetchall()
            messages = [dict(row) for row in rows]
            return jsonify(messages), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/messages', methods=['POST'])
def add_message():
    try:
        data = request.get_json()
        if not data or 'name' not in data or 'message' not in data:
            return jsonify({"error": "Missing 'name' or 'message'"}), 400
        
        name = data['name'].strip()
        message = data['message'].strip()
        
        if not name or not message:
            return jsonify({"error": "Name and message cannot be empty"}), 400
        
        created_at = datetime.utcnow().isoformat() + "Z"
        
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO messages (name, message, created_at) VALUES (?, ?, ?)",
                (name, message, created_at)
            )
            conn.commit()
            new_id = cursor.lastrowid
            
            return jsonify({
                "id": new_id,
                "name": name,
                "message": message,
                "created_at": created_at
            }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/wishes', methods=['GET'])
def get_wishes():
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM wishes ORDER BY id DESC")
            rows = cursor.fetchall()
            wishes = [dict(row) for row in rows]
            return jsonify(wishes), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/wishes', methods=['POST'])
def add_wish():
    try:
        data = request.get_json()
        if not data or 'name' not in data or 'wish' not in data:
            return jsonify({"error": "Missing 'name' or 'wish'"}), 400
        
        name = data['name'].strip()
        wish = data['wish'].strip()
        
        if not name or not wish:
            return jsonify({"error": "Name and wish cannot be empty"}), 400
        
        created_at = datetime.utcnow().isoformat() + "Z"
        
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO wishes (name, wish, created_at) VALUES (?, ?, ?)",
                (name, wish, created_at)
            )
            conn.commit()
            new_id = cursor.lastrowid
            
            return jsonify({
                "id": new_id,
                "name": name,
                "wish": wish,
                "created_at": created_at
            }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/messages/<int:message_id>', methods=['DELETE'])
def delete_message(message_id):
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM messages WHERE id = ?", (message_id,))
            conn.commit()
            if cursor.rowcount == 0:
                return jsonify({"error": "Message not found"}), 404
            return jsonify({"success": True, "message": "Message deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/wishes/<int:wish_id>', methods=['DELETE'])
def delete_wish(wish_id):
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM wishes WHERE id = ?", (wish_id,))
            conn.commit()
            if cursor.rowcount == 0:
                return jsonify({"error": "Wish not found"}), 404
            return jsonify({"success": True, "message": "Wish deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    init_db()
    # Running on 5000 to match frontend's proxy
    app.run(host='0.0.0.0', port=5000, debug=True, use_reloader=False)
