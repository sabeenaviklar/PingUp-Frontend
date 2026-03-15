import { useState, useRef, useCallback } from 'react';

export default function MessageInput({
  onSend, onTypingStart, onTypingStop,
  roomName, roomSettings, currentUser,
}) {
  const [text, setText]       = useState('');
  const typingRef             = useRef(false);
  const typingTimer           = useRef(null);

  const isOwner    = currentUser?.role === 'owner';
  const isLocked   = roomSettings?.isLocked;
  const isReadOnly = roomSettings?.isReadOnly && !isOwner;
  const isDisabled = isLocked || isReadOnly;

  const getPlaceholder = () => {
    if (isLocked)   return '🔒 This channel is locked';
    if (isReadOnly) return '🔇 This channel is read-only';
    return `Message #${roomName}`;
  };

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!text.trim() || isDisabled) return;
      onSend(text.trim());
      setText('');
      if (typingRef.current) {
        onTypingStop();
        typingRef.current = false;
      }
    }
  }, [text, isDisabled, onSend, onTypingStop]);

  const handleChange = useCallback((e) => {
    setText(e.target.value);
    if (!typingRef.current) {
      typingRef.current = true;
      onTypingStart();
    }
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      typingRef.current = false;
      onTypingStop();
    }, 1500);
  }, [onTypingStart, onTypingStop]);

  return (
    <div className={`msg-input-wrap ${isDisabled ? 'msg-input-disabled' : ''}`}>
      <textarea
        className="msg-input"
        placeholder={getPlaceholder()}
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={isDisabled}
        rows={1}
      />
      <button
        className="msg-send-btn"
        disabled={!text.trim() || isDisabled}
        onClick={() => {
          if (!text.trim() || isDisabled) return;
          onSend(text.trim());
          setText('');
        }}
      >➤</button>
    </div>
  );
}
