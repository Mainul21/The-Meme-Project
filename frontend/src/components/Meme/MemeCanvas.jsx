import React, { useEffect, useRef, useState } from 'react';

const MemeCanvas = ({ template, captions = [], textColor = '#FFFFFF' }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const imageRef = useRef(null); // Store original image
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const [textPositions, setTextPositions] = useState([]);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Initialize text positions when template or captions change
  useEffect(() => {
    if (!template) return;

    const positions = captions.map((_, index) => {
      // Check if we already have a position for this index
      if (textPositions[index]) {
        return textPositions[index];
      }
      
      // Default positions
      if (index === 0) {
        return { x: 50, y: 15 }; // Top center (percentage)
      } else if (index === 1) {
        return { x: 50, y: 85 }; // Bottom center (percentage)
      } else {
        return { x: 50, y: 50 }; // Middle center (percentage)
      }
    });
    
    setTextPositions(positions);
  }, [template, captions.length]);

  // Draw the meme image on canvas
  useEffect(() => {
    if (!template || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = template.url;

    image.onload = () => {
      // Store original image and dimensions
      imageRef.current = image;
      setOriginalDimensions({ width: image.width, height: image.height });
      
      // Calculate aspect ratio to fit within a max width/height while maintaining ratio
      const maxWidth = 600;
      const maxHeight = window.innerHeight * 0.6; // 60% of viewport height to account for header and padding
      
      // Calculate scale based on both width and height constraints
      const scaleWidth = maxWidth / image.width;
      const scaleHeight = maxHeight / image.height;
      const scale = Math.min(scaleWidth, scaleHeight, 1);
      
      canvas.width = image.width * scale;
      canvas.height = image.height * scale;

      setImageDimensions({ width: canvas.width, height: canvas.height });

      // Draw image
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    };
  }, [template]);

  const handleStart = (e, index) => {
    // Prevent default to stop text selection or other default behaviors
    if (e.cancelable) e.preventDefault();
    
    setDraggingIndex(index);
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const textElement = e.currentTarget;
    const textRect = textElement.getBoundingClientRect();
    
    setDragOffset({
      x: clientX - textRect.left,
      y: clientY - textRect.top
    });
  };

  const handleMove = (e) => {
    if (draggingIndex === null || !containerRef.current) return;
    
    if (e.cancelable) e.preventDefault();

    const rect = containerRef.current.getBoundingClientRect();
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    // Calculate new position as percentage
    const x = ((clientX - rect.left - dragOffset.x) / rect.width) * 100;
    const y = ((clientY - rect.top - dragOffset.y) / rect.height) * 100;

    // Clamp values between 0 and 100
    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));

    setTextPositions(prev => {
      const newPositions = [...prev];
      newPositions[draggingIndex] = { x: clampedX, y: clampedY };
      return newPositions;
    });
  };

  const handleEnd = () => {
    setDraggingIndex(null);
  };

  // Add global mouse/touch event listeners
  useEffect(() => {
    if (draggingIndex !== null) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('touchend', handleEnd);
      
      return () => {
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', handleEnd);
        window.removeEventListener('touchmove', handleMove);
        window.removeEventListener('touchend', handleEnd);
      };
    }
  }, [draggingIndex, dragOffset]);

  // Function to export the final meme with text
  const exportMeme = () => {
    if (!imageRef.current || !containerRef.current) return null;

    const originalImage = imageRef.current;
    const exportCanvas = document.createElement('canvas');
    const ctx = exportCanvas.getContext('2d');
    
    // Use original image dimensions for high quality
    exportCanvas.width = originalDimensions.width;
    exportCanvas.height = originalDimensions.height;

    // Draw the original image at full size
    ctx.drawImage(originalImage, 0, 0, originalDimensions.width, originalDimensions.height);

    // Configure text styles based on original dimensions
    ctx.fillStyle = textColor;
    ctx.strokeStyle = 'black';
    ctx.lineWidth = Math.max(2, originalDimensions.width / 200); // Use original size for proper stroke
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = `bold ${originalDimensions.width / 15}px Impact, sans-serif`;
    ctx.lineJoin = 'round';

    // Draw each caption at its position
    captions.forEach((text, index) => {
      if (!text || !textPositions[index]) return;
      
      const x = (textPositions[index].x / 100) * originalDimensions.width;
      const y = (textPositions[index].y / 100) * originalDimensions.height;

      ctx.strokeText(text.toUpperCase(), x, y);
      ctx.fillText(text.toUpperCase(), x, y);
    });

    return exportCanvas;
  };

  // Expose export function to parent
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.exportMeme = exportMeme;
    }
  }, [template, captions, textPositions, textColor]);

  if (!template) {
    return (
      <div className="w-full aspect-square bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-700 flex items-center justify-center text-slate-500">
        Select a template to start
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center bg-slate-900/50 p-4 rounded-xl border border-slate-800">
      <div 
        ref={containerRef}
        className="relative inline-block"
        style={{ 
          width: imageDimensions.width || 'auto',
          height: imageDimensions.height || 'auto'
        }}
      >
        <canvas 
          ref={canvasRef} 
          className="max-w-full h-auto rounded shadow-lg block"
        />
        
        {/* Draggable text overlays */}
        {captions.map((text, index) => {
          if (!text || !textPositions[index]) return null;
          
          return (
            <div
              key={index}
              onMouseDown={(e) => handleStart(e, index)}
              onTouchStart={(e) => handleStart(e, index)}
              style={{
                position: 'absolute',
                left: `${textPositions[index].x}%`,
                top: `${textPositions[index].y}%`,
                cursor: draggingIndex === index ? 'grabbing' : 'grab',
                userSelect: 'none',
                transform: 'translate(0, 0)',
              }}
              className="meme-text"
            >
              <span
                style={{
                  fontFamily: 'Impact, sans-serif',
                  fontSize: `${imageDimensions.width / 15}px`,
                  fontWeight: 'bold',
                  color: textColor,
                  textTransform: 'uppercase',
                  WebkitTextStroke: `${Math.max(1.5, imageDimensions.width / 250)}px black`,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                  whiteSpace: 'nowrap',
                  display: 'inline-block',
                  lineHeight: 1,
                }}
              >
                {text.toUpperCase()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MemeCanvas;
