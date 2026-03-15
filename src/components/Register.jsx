import { useState } from 'react';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];
const DAYS  = Array.from({ length: 31 }, (_, i) => i + 1);
const YEARS = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);

export default function Register({ onLogin, onSwitch }) {
  const [form, setForm] = useState({
    email:       '',
    displayName: '',
    username:    '',
    password:    '',
    dobMonth:    '',
    dobDay:      '',
    dobYear:     '',
    emailOptIn:  true,
  });
  const [error,   setError]   = useState('');
  const [diceMsg, setDiceMsg] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.username.trim() || !form.password) {
      setError('Username and password are required.');
      return;
    }
    if (!form.dobMonth || !form.dobDay || !form.dobYear) {
      setError('Please select your date of birth.');
      return;
    }
    setLoading(true);
    try {
      const res  = await fetch('https://pingup-backend-1.onrender.com/api/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username:    form.username.trim(),
          password:    form.password,
          email:       form.email.trim(),
          displayName: form.displayName.trim() || form.username.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Registration failed.'); return; }
      if (data.roleMessage) setDiceMsg(data.roleMessage);
      setTimeout(() => onLogin(data.user, data.token), data.roleMessage ? 1800 : 0);
    } catch {
      setError('Cannot reach server. Is it running?');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="reg-bg">

      {/* ── Illustrated background scene ── */}
      <div className="reg-scene" aria-hidden="true">

        {/* Sky gradient handled by .reg-bg */}

        {/* Floating shapes / blobs */}
        <div className="reg-blob reg-blob-1" />
        <div className="reg-blob reg-blob-2" />
        <div className="reg-blob reg-blob-3" />

        {/* Decorative geometric leaves */}
        <div className="reg-leaf reg-leaf-1" />
        <div className="reg-leaf reg-leaf-2" />
        <div className="reg-leaf reg-leaf-3" />
        <div className="reg-leaf reg-leaf-4" />

        {/* Floating particles */}
        <div className="reg-particle reg-p1" />
        <div className="reg-particle reg-p2" />
        <div className="reg-particle reg-p3" />
        <div className="reg-particle reg-p4" />
        <div className="reg-particle reg-p5" />
        <div className="reg-particle reg-p6" />

        {/* Bottom ground strip */}
        <div className="reg-ground" />

        {/* Left illustration figure — abstract circle person */}
        <div className="reg-figure reg-figure-left">
          <div className="reg-fig-head" />
          <div className="reg-fig-body" />
          <div className="reg-fig-bubble">
            <span />
            <span />
            <span />
          </div>
        </div>

        {/* Right illustration — abstract round figure */}
        <div className="reg-figure reg-figure-right">
          <div className="reg-fig-head reg-fig-head-r" />
          <div className="reg-fig-body reg-fig-body-r" />
        </div>

        {/* Mini floating icons */}
        <div className="reg-icon reg-icon-1">🌿</div>
        <div className="reg-icon reg-icon-2">✦</div>
        <div className="reg-icon reg-icon-3">🍃</div>
        <div className="reg-icon reg-icon-4">✦</div>
        <div className="reg-icon reg-icon-5">◆</div>
      </div>

      {/* ── Modal card ── */}
      <div className="reg-card">
        <h1 className="reg-title">Create an account</h1>

        {error   && <div className="reg-error">{error}</div>}
        {diceMsg && <div className="reg-dice">{diceMsg}</div>}

        <form onSubmit={handleSubmit} noValidate>

          <div className="reg-field">
            <label>Email <span className="reg-req">*</span></label>
            <input
              name="email" type="email"
              value={form.email} onChange={handleChange}
              autoFocus required
            />
          </div>

          <div className="reg-field">
            <label>Display Name</label>
            <input
              name="displayName" type="text"
              value={form.displayName} onChange={handleChange}
              placeholder="How others see you"
            />
          </div>

          <div className="reg-field">
            <label>Username <span className="reg-req">*</span></label>
            <input
              name="username" type="text"
              value={form.username} onChange={handleChange}
              required
            />
          </div>

          <div className="reg-field">
            <label>Password <span className="reg-req">*</span></label>
            <input
              name="password" type="password"
              value={form.password} onChange={handleChange}
              required
            />
          </div>

          <div className="reg-field">
            <label>Date of Birth <span className="reg-req">*</span></label>
            <div className="reg-dob-row">
              <select name="dobMonth" value={form.dobMonth} onChange={handleChange}>
                <option value="">Month</option>
                {MONTHS.map((m, i) => <option key={m} value={i+1}>{m}</option>)}
              </select>
              <select name="dobDay" value={form.dobDay} onChange={handleChange}>
                <option value="">Day</option>
                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select name="dobYear" value={form.dobYear} onChange={handleChange}>
                <option value="">Year</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          <label className="reg-checkbox-row">
            <input
              type="checkbox" name="emailOptIn"
              checked={form.emailOptIn} onChange={handleChange}
            />
            <span>
              (Optional) It's okay to send me emails with updates, tips, and special offers.
              You can opt out at any time.
            </span>
          </label>

          <p className="reg-tos">
            By clicking "Create Account," you agree to our{' '}
            <span className="reg-link">Terms of Service</span> and have read the{' '}
            <span className="reg-link">Privacy Policy</span>.
          </p>

          <button className="reg-btn" type="submit" disabled={loading}>
            {loading ? 'Creating Account…' : 'Create Account'}
          </button>
        </form>

        <p className="reg-switch">
          Already have an account?{' '}
          <span className="reg-link" onClick={onSwitch}>Log in</span>
        </p>
      </div>
    </div>
  );
}
