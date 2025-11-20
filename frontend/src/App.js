import React, { useState, useEffect } from 'react';
import Canvas from './components/Canvas';
import { Toaster } from './components/ui/sonner';
import './App.css';

function BadgeRemover() {
  useEffect(() => {
    const removeBadge = () => {
      const badge = document.querySelector("#emergent-badge");
      if (badge) {
        badge.remove();
      }
    };

    // Remove immediately
    removeBadge();

    // Set up MutationObserver to catch dynamically added badge
    const observer = new MutationObserver(() => {
      removeBadge();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Also check periodically as fallback
    const interval = setInterval(removeBadge, 50);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  return null;
}

export default function App() {
  return (
    <>
      <BadgeRemover />
      <Canvas />
      <Toaster position="top-right" />
    </>
  );
}