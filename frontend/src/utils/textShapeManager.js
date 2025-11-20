import { createShapeId } from 'tldraw';
import { getOptimalShapePosition, centerCameraOnShape } from './shapePositioning';
import { makeApiCall } from '../helpers/api';

// Throttle function to limit update frequency
function throttle(func, limit) {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export async function createTextResponseShape(editor, options) {
  const {
    searchQuery,
    width = 600,
    height = 300,
    centerCamera = true,
    animationDuration = 200,
  } = options;

  const shapeId = createShapeId();
  const position = getOptimalShapePosition(editor, {
    width,
    height,
    padding: 50,
  });

  // Create the shape
  editor.createShape({
    id: shapeId,
    type: 'text-response',
    x: position.x,
    y: position.y,
    props: {
      w: width,
      h: height,
      prompt: searchQuery,
      response: '',
      isStreaming: false,
    },
  });

  // Center camera
  if (centerCamera) {
    centerCameraOnShape(editor, shapeId, { duration: animationDuration });
  }

  // Accumulate response to batch updates
  let accumulatedResponse = '';
  let lastUpdateTime = 0;
  const UPDATE_THROTTLE_MS = 50; // Update at most every 50ms

  // Throttled update function
  const throttledUpdate = throttle((response) => {
    editor.batch(() => {
      editor.updateShape({
        id: shapeId,
        type: 'text-response',
        props: {
          response,
          isStreaming: true,
        },
      });
    });
  }, UPDATE_THROTTLE_MS);

  // Make API call
  await makeApiCall({
    searchQuery,
    onResponseStreamStart: () => {
      // Use batch for initial update
      editor.batch(() => {
        editor.updateShape({
          id: shapeId,
          type: 'text-response',
          props: { isStreaming: true },
        });
      });
    },
    onResponseUpdate: (response) => {
      accumulatedResponse = response;
      
      // Only update if enough time has passed (throttling)
      const now = Date.now();
      if (now - lastUpdateTime >= UPDATE_THROTTLE_MS) {
        throttledUpdate(response);
        lastUpdateTime = now;
      }
    },
    onResponseStreamEnd: () => {
      // Final update with all accumulated content
      const currentShape = editor.getShape(shapeId);
      if (!currentShape) return;

      editor.batch(() => {
        editor.updateShape({
          id: shapeId,
          type: 'text-response',
          props: {
            ...currentShape.props,
            response: accumulatedResponse, // Ensure final content is set
            isStreaming: false,
          },
        });
      });
    },
  });

  return shapeId;
}
