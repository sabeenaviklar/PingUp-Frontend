import { useState, useRef } from 'react';

export default function MessageInput({ onSend, onTypingStart, onTypingStop, roomName }) {
  const [text, setText]     = useState('');
  const typingRef           = useRef(false);
  const timeoutRef          = useRef(null);

  function handleChange(e) {
    setText(e.target.value);
    if (!typingRef.current) { typingRef.current = true; onTypingStart(); }
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => { typingRef.current = false; onTypingStop(); }, 1200);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
    typingRef.current = false;
    clearTimeout(timeoutRef.current);
    onTypingStop();
  }

  return (
    <div className="input-area">
      <form className="input-box" onSubmit={handleSubmit}>
        <input
          value={text}
          onChange={handleChange}
          placeholder={roomName ? `Message #${roomName}  (try /help)` : 'Select a room first'}
          disabled={!roomName}
          autoFocus
        />
        <button type="submit" className="btn-send" disabled={!roomName}>➤</button>
      </form>
    </div>
  );
}
