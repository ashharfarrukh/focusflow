import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import useAuthStore from '../store/useAuthStore';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/login', form);
      login({ name: res.data.name, email: res.data.email }, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="bg-gray-900 p-8 rounded-2xl w-full max-w-md shadow-xl">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome back 👋</h1>
        <p className="text-gray-400 mb-6">Login to FocusFlow</p>
        {error && <p className="text-red-400 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-violet-500"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-violet-500"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <button
            type="submit"
            className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 rounded-xl transition"
          >
            Login
          </button>
        </form>
        <p className="text-gray-400 mt-4 text-center">
          Don't have an account?{' '}
          <Link to="/register" className="text-violet-400 hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}