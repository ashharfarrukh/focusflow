import { useState, useEffect, useRef } from 'react';

const MODES = {
  focus: { label: 'Focus Time', duration: 25 * 60, color: 'text-violet-400', ring: 'stroke-violet-500' },
  short: { label: 'Short Break', duration: 5 * 60, color: 'text-green-400', ring: 'stroke-green-500' },
  long:  { label: 'Long Break',  duration: 15 * 60, color: 'text-blue-400',  ring: 'stroke-blue-500'  },
};

export default function PomodoroTimer({ tasks = [] }) {
  const [mode, setMode] = useState('focus');
  const [timeLeft, setTimeLeft] = useState(MODES.focus.duration);
  const [running, setRunning] = useState(false);
  const [selectedTask, setSelectedTask] = useState('');
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef(null);

  const current = MODES[mode];
  const total = current.duration;
  const progress = (timeLeft / total) * 100;

  // Circle math
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress / 100);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            if (mode === 'focus') setSessions(s => s + 1);
            // Play sound notification
            try { new Audio('https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3').play(); } catch {}
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, mode]);

  const switchMode = (newMode) => {
    setMode(newMode);
    setTimeLeft(MODES[newMode].duration);
    setRunning(false);
  };

  const reset = () => {
    setTimeLeft(current.duration);
    setRunning(false);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const pendingTasks = tasks.filter(t => !t.completed);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        ⏱️ <span>Pomodoro Timer</span>
        {sessions > 0 && (
          <span className="text-sm bg-violet-900 text-violet-300 px-2 py-0.5 rounded-full ml-2">
            {sessions} session{sessions > 1 ? 's' : ''} done 🔥
          </span>
        )}
      </h3>

      {/* Mode Switcher */}
      <div className="flex gap-2 mb-6">
        {Object.entries(MODES).map(([key, val]) => (
          <button
            key={key}
            onClick={() => switchMode(key)}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium transition ${
              mode === key
                ? 'bg-violet-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {val.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row items-center gap-8">

        {/* Circle Timer */}
        <div className="relative flex items-center justify-center">
          <svg width="220" height="220" className="-rotate-90">
            <circle
              cx="110" cy="110" r={radius}
              fill="none" stroke="#1f2937" strokeWidth="10"
            />
            <circle
              cx="110" cy="110" r={radius}
              fill="none"
              className={current.ring}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className={`text-5xl font-bold font-mono ${current.color}`}>
              {formatTime(timeLeft)}
            </span>
            <span className="text-gray-400 text-sm mt-1">{current.label}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex-1 w-full space-y-4">

          {/* Task selector */}
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Focusing on:</label>
            <select
              className="w-full bg-gray-800 text-white px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-violet-500"
              value={selectedTask}
              onChange={e => setSelectedTask(e.target.value)}
            >
              <option value="">— Select a task —</option>
              {pendingTasks.map(task => (
                <option key={task._id} value={task._id}>
                  {task.title}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setRunning(r => !r)}
              className={`flex-1 py-3 rounded-xl font-semibold text-white transition ${
                running
                  ? 'bg-yellow-600 hover:bg-yellow-700'
                  : 'bg-violet-600 hover:bg-violet-700'
              }`}
            >
              {running ? '⏸ Pause' : timeLeft === current.duration ? '▶ Start' : '▶ Resume'}
            </button>
            <button
              onClick={reset}
              className="px-5 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold transition"
            >
              ↺ Reset
            </button>
          </div>

          {/* Session dots */}
          <div>
            <p className="text-gray-400 text-sm mb-2">Today's sessions:</p>
            <div className="flex gap-2 flex-wrap">
              {Array.from({ length: Math.max(sessions, 4) }).map((_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full ${
                    i < sessions ? 'bg-violet-500' : 'bg-gray-700'
                  }`}
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}