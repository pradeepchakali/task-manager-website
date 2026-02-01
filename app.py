from flask import Flask, render_template, request, jsonify
from datetime import datetime

app = Flask(__name__)

tasks = []

@app.route('/')
def index():
    return render_template('index.html', tasks=tasks)

@app.route('/add', methods=['POST'])
def add_task():
    data = request.json
    tasks.append({
        'id': len(tasks) + 1,
        'title': data['title'],
        'status': 'todo',
        'created_at': datetime.now().strftime("%Y-%m-%d %H:%M"),
        'due_time': data['dueTime']
    })
    return jsonify(success=True)

@app.route('/move/<int:id>', methods=['POST'])
def move_task(id):
    for task in tasks:
        if task['id'] == id:
            if task['status'] == 'todo':
                task['status'] = 'inprogress'
            elif task['status'] == 'inprogress':
                task['status'] = 'done'
    return jsonify(success=True)

@app.route('/delete/<int:id>', methods=['POST'])
def delete_task(id):
    global tasks
    tasks = [t for t in tasks if t['id'] != id]
    return jsonify(success=True)


if __name__ == "__main__":
    app.run(debug=True)








