import { useState } from 'react';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];
const DAYS   = Array.from({ length: 31 }, (_, i) => i + 1);
const YEARS  = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'

  return (
    <div className="discord-bg">
      <div className="discord-stars" />
      {mode === 'login'
        ? <LoginForm onLogin={onLogin} onSwitch={() => setMode('register')} />
        : <RegisterForm onLogin={onLogin} onSwitch={() => setMode('login')} />
      }
    </div>
  );
}

/* ── Login Form ── */
function LoginForm({ onLogin, onSwitch }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return setError('Please fill in all fields.');
    setLoading(true); setError('');
    try {
      const res  = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || 'Login failed.');
      localStorage.setItem('token', data.token);
      localStorage.setItem('user',  JSON.stringify(data.user));
      onLogin(data.user, data.token);
    } catch {
      setError('Cannot reach server. Is it running?');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dc-card">
      <div className="dc-card-header">
        <h1>Welcome back!</h1>
        <p>We're so excited to see you again!</p>
      </div>

      {error && <div className="dc-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="dc-field">
          <label>USERNAME OR EMAIL <span className="dc-required">*</span></label>
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            autoFocus
          />
        </div>

        <div className="dc-field">
          <label>
            PASSWORD <span className="dc-required">*</span>
            <span className="dc-forgot" onClick={() => {}}>Forgot your password?</span>
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        <button className="dc-btn-primary" disabled={loading}>
          {loading ? 'Logging in…' : 'Log In'}
        </button>
      </form>

      <p className="dc-switch-text">
        Need an account?{' '}
        <span className="dc-link" onClick={onSwitch}>Register</span>
      </p>
    </div>
  );
}

/* ── Register Form ── */
function RegisterForm({ onLogin, onSwitch }) {
  const [form, setForm] = useState({
    email: '', displayName: '', username: '',
    password: '', month: '', day: '', year: '',
    emailOptIn: true,
  });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  function set(field) {
    return e => setForm(f => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.username.trim() || !form.password.trim())
      return setError('Username and password are required.');
    setLoading(true); setError('');
    try {
      const res  = await fetch('http://localhost:3001/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.username.trim(), password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || 'Registration failed.');
      localStorage.setItem('token', data.token);
      localStorage.setItem('user',  JSON.stringify(data.user));
      onLogin(data.user, data.token);
    } catch {
      setError('Cannot reach server. Is it running?');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dc-card dc-card-register">
      <div className="dc-card-header">
        <h1>Create an account</h1>
      </div>

      {error && <div className="dc-error">{error}</div>}

      <form onSubmit={handleSubmit}>

        <div className="dc-field">
          <label>EMAIL <span className="dc-required">*</span></label>
          <input type="email" value={form.email} onChange={set('email')} autoFocus />
        </div>

        <div className="dc-field">
          <label>DISPLAY NAME</label>
          <input value={form.displayName} onChange={set('displayName')} />
        </div>

        <div className="dc-field">
          <label>USERNAME <span className="dc-required">*</span></label>
          <input value={form.username} onChange={set('username')} />
        </div>

        <div className="dc-field">
          <label>PASSWORD <span className="dc-required">*</span></label>
          <input type="password" value={form.password} onChange={set('password')} />
        </div>

        <div className="dc-field">
          <label>DATE OF BIRTH <span className="dc-required">*</span></label>
          <div className="dc-dob-row">
            <select value={form.month} onChange={set('month')} className="dc-select">
              <option value="" disabled>Month</option>
              {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
            <select value={form.day} onChange={set('day')} className="dc-select">
              <option value="" disabled>Day</option>
              {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={form.year} onChange={set('year')} className="dc-select">
              <option value="" disabled>Year</option>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        <label className="dc-checkbox-row">
          <input
            type="checkbox"
            checked={form.emailOptIn}
            onChange={e => setForm(f => ({ ...f, emailOptIn: e.target.checked }))}
          />
          <span>
            (Optional) It's okay to send me emails with updates, tips, and special offers.
            You can opt out at any time.
          </span>
        </label>

        <button className="dc-btn-primary" disabled={loading}>
          {loading ? 'Creating…' : 'Create Account'}
        </button>

        <p className="dc-tos">
          By clicking "Create Account," you agree to our{' '}
          <span className="dc-link">Terms of Service</span> and have read the{' '}
          <span className="dc-link">Privacy Policy</span>.
        </p>
      </form>

      <p className="dc-switch-text">
        Already have an account?{' '}
        <span className="dc-link" onClick={onSwitch}>Log In</span>
      </p>
    </div>
  );
}
