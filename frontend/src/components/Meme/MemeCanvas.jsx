import React, { useEffect, useRef, useState } from 'react';

const MemeCanvas = ({ template, textFields = [], onUpdateField, fontSizeMultiplier = 1 }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const [draggingId, setDraggingId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Load and draw image
  useEffect(() => {
    if (!template || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = template.url;

    image.onload = () => {
      imageRef.current = image;
      setOriginalDimensions({ width: image.width, height: image.height });

      const maxWidth = 800; // Increased max width for better visibility
      const maxHeight = window.innerHeight * 0.7;

      const scaleWidth = maxWidth / image.width;
      const scaleHeight = maxHeight / image.height;
      const scale = Math.min(scaleWidth, scaleHeight, 1);

      canvas.width = image.width * scale;
      canvas.height = image.height * scale;

      setImageDimensions({ width: canvas.width, height: canvas.height });
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    };
  }, [template]);

  const handleStart = (e, id) => {
    if (e.cancelable) e.preventDefault();
    setDraggingId(id);

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
    if (draggingId === null || !containerRef.current) return;

    if (e.cancelable) e.preventDefault();

    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    // Calculate new position as percentage
    const x = ((clientX - rect.left - dragOffset.x) / rect.width) * 100;
    const y = ((clientY - rect.top - dragOffset.y) / rect.height) * 100;

    // Clamp values
    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));

    if (onUpdateField) {
      onUpdateField(draggingId, { x: clampedX, y: clampedY });
    }
  };

  const handleEnd = () => {
    setDraggingId(null);
  };

  useEffect(() => {
    if (draggingId !== null) {
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
  }, [draggingId, dragOffset]);

  const exportMeme = () => {
    if (!imageRef.current) return null;

    const originalImage = imageRef.current;
    const exportCanvas = document.createElement('canvas');
    const ctx = exportCanvas.getContext('2d');

    exportCanvas.width = originalDimensions.width;
    exportCanvas.height = originalDimensions.height;
    ctx.drawImage(originalImage, 0, 0, originalDimensions.width, originalDimensions.height);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';

    textFields.forEach((field) => {
      if (!field.text) return;

      const fontSize = field.fontSize * fontSizeMultiplier * (originalDimensions.width / imageDimensions.width);
      ctx.font = `bold ${fontSize}px Impact, sans-serif`;
      ctx.fillStyle = field.color;
      ctx.strokeStyle = 'black';
      ctx.lineWidth = fontSize / 15;

      const x = (field.x / 100) * originalDimensions.width;
      const y = (field.y / 100) * originalDimensions.height;

      ctx.strokeText(field.text.toUpperCase(), x, y);
      ctx.fillText(field.text.toUpperCase(), x, y);
    });

    return exportCanvas;
  };

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.exportMeme = exportMeme;
    }
  }, [template, textFields, fontSizeMultiplier, originalDimensions, imageDimensions]);

  if (!template) {
    return (
      <div className="w-full h-96 bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-700 flex items-center justify-center text-slate-500 font-medium">
        <div className="text-center">
          <p>No template selected</p>
          <p className="text-sm text-slate-600 mt-2 italic">Please go back and pick one</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center bg-slate-900/40 p-6 rounded-2xl border border-slate-800 shadow-inner overflow-hidden">
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
          className="max-w-full h-auto rounded-lg shadow-2xl block border border-slate-700/50"
        />

        {textFields.map((field) => {
          if (!field.text) return null;

          const displayFontSize = field.fontSize * fontSizeMultiplier;

          return (
            <div
              key={field.id}
              onMouseDown={(e) => handleStart(e, field.id)}
              onTouchStart={(e) => handleStart(e, field.id)}
              style={{
                position: 'absolute',
                left: `${field.x}%`,
                top: `${field.y}%`,
                cursor: draggingId === field.id ? 'grabbing' : 'grab',
                userSelect: 'none',
                transform: 'translate(-50%, -50%)', // Center the text on coordinates
                maxWidth: '90%',
              }}
            >
              <span
                style={{
                  fontFamily: 'Impact, sans-serif',
                  fontSize: `${displayFontSize}px`,
                  fontWeight: 'bold',
                  color: field.color,
                  textTransform: 'uppercase',
                  WebkitTextStroke: `${displayFontSize / 15}px black`,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                  whiteSpace: 'nowrap',
                  display: 'inline-block',
                  lineHeight: 1.2,
                  textAlign: 'center',
                }}
              >
                {field.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MemeCanvas;
