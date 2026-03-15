import { useState } from 'react';

export default function Login({ onLogin, onSwitch }) {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res  = await fetch('http://localhost:3001/api/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Login failed.'); return; }
      onLogin(data.user, data.token);
    } catch { setError('Cannot reach server.'); }
    finally   { setLoading(false); }
  }

  return (
    <div className="auth-split">

      {/* Left — form panel */}
      <div className="auth-panel">
        <div className="auth-form-wrap">
          <h1 className="auth-title">Welcome back!</h1>
          <p  className="auth-subtitle">We're so excited to see you again!</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label>Email or Username <span className="auth-req">*</span></label>
              <input
                type="text"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="auth-field">
              <label>
                Password <span className="auth-req">*</span>
                <span className="auth-forgot" onClick={() => {}}>Forgot your password?</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? 'Logging in…' : 'Login'}
            </button>
          </form>

          <p className="auth-switch">
            Need an account?{' '}
            <span className="auth-link" onClick={onSwitch}>Register an account</span>
          </p>
        </div>
      </div>

      {/* Right — illustration */}
      <div className="auth-illustration">
        <div className="auth-illus-content">
          <div className="illus-mountains">
            <div className="illus-mountain illus-m1" />
            <div className="illus-mountain illus-m2" />
            <div className="illus-mountain illus-m3" />
            <div className="illus-mountain illus-m4" />
          </div>
          <div className="illus-trees">
            <div className="illus-tree illus-t1" />
            <div className="illus-tree illus-t2" />
            <div className="illus-tree illus-t3" />
            <div className="illus-tree illus-t4" />
            <div className="illus-tree illus-t5" />
          </div>
          <div className="illus-ground" />
          <div className="illus-clouds">
            <div className="illus-cloud illus-c1" />
            <div className="illus-cloud illus-c2" />
          </div>
        </div>
      </div>

    </div>
  );
}
