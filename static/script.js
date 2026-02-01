let chart;
let currentFilter = "all";

/* ---------- TASK ACTIONS ---------- */

function addTask() {
    const title = document.getElementById("taskInput").value.trim();
    const dueTime = document.getElementById("dueTime").value;

    if (!title || !dueTime) {
        alert("Please enter task and due time");
        return;
    }

    fetch("/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, dueTime })
    }).then(() => location.reload());
}

function moveTask(id) {
    fetch(`/move/${id}`, { method: "POST" })
        .then(() => location.reload());
}

function deleteTask(id) {
    if (!confirm("Are you sure you want to delete this task?")) return;

    fetch(`/delete/${id}`, { method: "POST" })
        .then(() => location.reload());
}

/* ---------- HELPERS ---------- */

function isOverdue(task) {
    if (task.status === "done") return false;
    return new Date(task.due_time) < new Date();
}

function setFilter(type) {
    currentFilter = type;
    renderTasks();
}

function applyFilter(task) {
    if (currentFilter === "all") return true;
    if (currentFilter === "done") return task.status === "done";
    if (currentFilter === "overdue") return isOverdue(task);
    if (currentFilter === "today") {
        const today = new Date().toISOString().split("T")[0];
        return task.due_time.startsWith(today);
    }
}

/* ---------- RENDER TASKS ---------- */

function renderTasks() {
    ["todo", "inprogress", "done"].forEach(id => {
        document.getElementById(id).innerHTML = "";
    });

    tasks.filter(applyFilter).forEach(task => {
        const div = document.createElement("div");
        div.className = "task";
        if (isOverdue(task)) div.classList.add("overdue");

        div.innerHTML = `
            <strong>${task.title}</strong>
            <small>Created: ${task.created_at}</small>
            <small>Due: ${task.due_time}</small>
            <div style="margin-top:8px">
                ${task.status !== "done"
                    ? `<button onclick="moveTask(${task.id})">Next ➡️</button>`
                    : ""}
                <button onclick="deleteTask(${task.id})" style="background:#ef4444">🗑</button>
            </div>
        `;

        document.getElementById(task.status).appendChild(div);
    });
}

/* ---------- STATS + CHART ---------- */

function updateStats() {
    const todo = tasks.filter(t => t.status === "todo").length;
    const progress = tasks.filter(t => t.status === "inprogress").length;
    const done = tasks.filter(t => t.status === "done").length;
    const overdue = tasks.filter(t => isOverdue(t)).length;

    document.getElementById("total").innerText = tasks.length;
    document.getElementById("todoCount").innerText = todo;
    document.getElementById("progressCount").innerText = progress;
    document.getElementById("doneCount").innerText = done;
    document.getElementById("overdueCount").innerText = overdue;

    renderChart(todo, progress, done, overdue);
}

function renderChart(todo, progress, done, overdue) {
    const canvas = document.getElementById("taskChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Todo", "In Progress", "Done", "Overdue"],
            datasets: [{
                label: "Tasks",
                data: [todo, progress, done, overdue],
                backgroundColor: [
                    "#38bdf8",
                    "#facc15",
                    "#22c55e",
                    "#ef4444"
                ],
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: { ticks: { color: "white" } },
                y: {
                    ticks: { color: "white" },
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    labels: { color: "white" }
                }
            }
        }
    });
}

/* ---------- INIT ---------- */

renderTasks();
updateStats();















