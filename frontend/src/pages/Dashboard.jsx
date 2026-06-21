import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import useAuthStore from '../store/useAuthStore';
import PomodoroTimer from '../components/PomodoroTimer';


export default function Dashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', priority: 'medium', deadline: '', tags: ''
  });

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    try {
      const res = await API.get('/tasks/');
      setTasks(res.data);
    } catch (err) { console.error(err); }
  };

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    setLoading(true);
    try {
      await API.post('/tasks/', {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()) : []
      });
      setForm({ title: '', description: '', priority: 'medium', deadline: '', tags: '' });
      setShowForm(false);
      fetchTasks();
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleComplete = async (task) => {
    try {
      await API.put(`/tasks/${task._id}`, { completed: !task.completed });
      fetchTasks();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/tasks/${id}`);
      fetchTasks();
    } catch (err) { console.error(err); }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleAIPrioritize = async () => {
  setAiLoading(true);
  setAiResult([]);
  try {
    const res = await API.post('/ai/prioritize');
    setAiResult(res.data.prioritized);
  } catch (err) {
    console.error(err);
  }
  setAiLoading(false);
};

  const priorityColor = (p) => ({
    high: 'bg-red-500', medium: 'bg-yellow-500', low: 'bg-green-500'
  }[p] || 'bg-gray-500');

  const pending = tasks.filter(t => !t.completed);
  const completed = tasks.filter(t => t.completed);

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          <span className="text-xl font-bold text-violet-400">FocusFlow</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400">Hey, {user?.name} 👋</span>
          <button
            onClick={handleLogout}
            className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
            <p className="text-gray-400 text-sm">Total Tasks</p>
            <p className="text-3xl font-bold text-white mt-1">{tasks.length}</p>
          </div>
          <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
            <p className="text-gray-400 text-sm">Pending</p>
            <p className="text-3xl font-bold text-yellow-400 mt-1">{pending.length}</p>
          </div>
          <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
            <p className="text-gray-400 text-sm">Completed</p>
            <p className="text-3xl font-bold text-green-400 mt-1">{completed.length}</p>
          </div>
        </div>

        <PomodoroTimer tasks={tasks} />

        {/* AI Prioritize Section */}
<div className="mb-6">
  <button
    onClick={handleAIPrioritize}
    disabled={aiLoading}
    className="bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 px-6 py-2 rounded-xl font-semibold transition disabled:opacity-50 flex items-center gap-2"
  >
    {aiLoading ? '🤖 Analyzing...' : '🤖 AI Prioritize My Tasks'}
  </button>

  {aiResult.length > 0 && (
    <div className="mt-4 bg-gray-900 border border-violet-800 rounded-2xl p-5">
      <h3 className="text-violet-400 font-semibold mb-3">🧠 AI Recommended Order</h3>
      <div className="space-y-3">
        {aiResult.map((item, index) => (
          <div key={item.id} className="flex items-start gap-3">
            <span className="text-violet-400 font-bold text-lg w-6">{index + 1}.</span>
            <div>
              <p className="font-semibold">{item.title}</p>
              <p className="text-gray-400 text-sm">{item.reason}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )}
</div>

        {/* Add Task Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">My Tasks</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-violet-600 hover:bg-violet-700 px-5 py-2 rounded-xl font-medium transition"
          >
            {showForm ? 'Cancel' : '+ Add Task'}
          </button>
        </div>

        {/* Add Task Form */}
        {showForm && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">New Task</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Task title *"
                className="w-full bg-gray-800 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-violet-500"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
              />
              <textarea
                placeholder="Description (optional)"
                className="w-full bg-gray-800 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 resize-none h-20"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  className="bg-gray-800 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-violet-500"
                  value={form.priority}
                  onChange={e => setForm({ ...form, priority: e.target.value })}
                >
                  <option value="high">🔴 High Priority</option>
                  <option value="medium">🟡 Medium Priority</option>
                  <option value="low">🟢 Low Priority</option>
                </select>
                <input
                  type="date"
                  className="bg-gray-800 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-violet-500"
                  value={form.deadline}
                  onChange={e => setForm({ ...form, deadline: e.target.value })}
                />
              </div>
              <input
                type="text"
                placeholder="Tags (comma separated e.g. work, urgent)"
                className="w-full bg-gray-800 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-violet-500"
                value={form.tags}
                onChange={e => setForm({ ...form, tags: e.target.value })}
              />
              <button
                onClick={handleCreate}
                disabled={loading}
                className="w-full bg-violet-600 hover:bg-violet-700 py-3 rounded-xl font-semibold transition disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Task'}
              </button>
            </div>
          </div>
        )}

        {/* Task List */}
        {tasks.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-5xl mb-4">📋</p>
            <p className="text-lg">No tasks yet. Add your first task!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map(task => (
              <div
                key={task._id}
                className={`bg-gray-900 border rounded-2xl p-5 flex items-start gap-4 transition ${
                  task.completed ? 'border-gray-800 opacity-60' : 'border-gray-700'
                }`}
              >
                {/* Checkbox */}
                <button
                  onClick={() => handleComplete(task)}
                  className={`mt-1 w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition ${
                    task.completed
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-500 hover:border-violet-400'
                  }`}
                >
                  {task.completed && <span className="text-xs">✓</span>}
                </button>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`w-2 h-2 rounded-full ${priorityColor(task.priority)}`} />
                    <h3 className={`font-semibold ${task.completed ? 'line-through text-gray-500' : ''}`}>
                      {task.title}
                    </h3>
                    <span className="text-xs bg-gray-800 px-2 py-0.5 rounded-full text-gray-400 capitalize">
                      {task.priority}
                    </span>
                  </div>
                  {task.description && (
                    <p className="text-gray-400 text-sm mt-1">{task.description}</p>
                  )}
                  <div className="flex gap-2 flex-wrap mt-2">
                    {task.deadline && (
                      <span className="text-xs text-gray-500">📅 {task.deadline}</span>
                    )}
                    {task.tags?.map(tag => (
                      <span key={tag} className="text-xs bg-violet-900 text-violet-300 px-2 py-0.5 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(task._id)}
                  className="text-gray-600 hover:text-red-400 transition text-lg"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}