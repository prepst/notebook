import React, { useState, useRef, useEffect } from 'react';
import { createTextResponseShape } from '../utils/textShapeManager';

const isMac = () => {
  return typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
};

export default function PromptInputWrapper({ editor }) {
  const [isFocused, setIsFocused] = useState(false);
  const [prompt, setPrompt] = useState('');
  const showMacKeybinds = isMac();
  const inputRef = useRef(null);

  // Register keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (inputRef.current) {
          inputRef.current.focus();
          setIsFocused(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const onInputSubmit = async (promptText) => {
    if (!promptText.trim()) return;
    
    setPrompt('');
    setIsFocused(false);
    if (inputRef.current) inputRef.current.blur();
    
    try {
      await createTextResponseShape(editor, {
        searchQuery: promptText.trim(),
        width: 600,
        height: 300,
        centerCamera: true,
        animationDuration: 200,
      });
    } catch (error) {
      console.error('Failed to create text response shape:', error);
    }
  };

  return (
    <form
      style={{
        display: 'flex',
        alignItems: 'center',
        position: 'fixed',
        left: '50%',
        bottom: '16px',
        transform: 'translateX(-50%)',
        padding: '12px 20px',
        borderRadius: '16px',
        border: '1px solid #E5E7EB',
        fontSize: '16px',
        transition: 'width 0.3s ease-in-out',
        gap: '8px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        minHeight: '60px',
        width: isFocused ? '50%' : '400px',
        background: '#FFFFFF',
        color: '#111827',
        zIndex: 1000,
      }}
      onSubmit={(e) => {
        e.preventDefault();
        onInputSubmit(prompt);
      }}
    >
      <input
        name="prompt-input"
        ref={inputRef}
        type="text"
        placeholder="Ask AI anything... (⌘K or Ctrl+K)"
        style={{
          flex: 1,
          border: 'none',
          outline: 'none',
          background: 'transparent',
          color: 'inherit',
          fontSize: 'inherit',
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      {isFocused ? (
        <button
          type="submit"
          disabled={!prompt.trim()}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            border: 'none',
            background: prompt.trim() ? '#3B82F6' : '#CBD5E1',
            color: '#FFFFFF',
            cursor: prompt.trim() ? 'pointer' : 'not-allowed',
          }}
          onMouseDown={(e) => {
            e.preventDefault();
          }}
        >
          ↑
        </button>
      ) : (
        <span style={{ fontSize: '12px', opacity: 0.3 }}>
          {showMacKeybinds ? '⌘ + K' : 'Ctrl + K'}
        </span>
      )}
    </form>
  );
}
