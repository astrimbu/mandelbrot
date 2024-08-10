import React, { useState, useEffect, useRef } from 'react';
import './App.css'

const MandelbrotSet = () => {
  const canvasRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [maxIterations, setMaxIterations] = useState(20);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const xMin = position.x - 2 / zoom;
    const xMax = position.x + 2 / zoom;
    const yMin = position.y - 2 / zoom;
    const yMax = position.y + 2 / zoom;

    const scaleX = (xMax - xMin) / width;
    const scaleY = (yMax - yMin) / height;

    const colors = new Uint8ClampedArray(width * height * 4);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const a = x * scaleX + xMin;
        const b = y * scaleY + yMin;
        let ca = a;
        let cb = b;
        let n = 0;

        while (n < maxIterations && ca * ca + cb * cb <= 4) {
          const temp = ca * ca - cb * cb + a;
          cb = 2 * ca * cb + b;
          ca = temp;
          n ++;
        }

        const index = (x + y * width) * 4;
        const color = n === maxIterations ? 0 : Math.floor(n * 255 / maxIterations);

        colors[index] = color;
        colors[index + 1] = color;
        colors[index + 2] = color;
        colors[index + 3] = 255;
      }
    }

    const imageData = new ImageData(colors, width, height);
    ctx.putImageData(imageData, 0, 0);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 10, height / 2);
    ctx.lineTo(width / 2 + 10, height / 2);
    ctx.moveTo(width / 2, height / 2 - 10);
    ctx.lineTo(width / 2, height / 2 + 10);
    ctx.stroke();
  }, [zoom, position, maxIterations]);

  const handleWheel = (e) => {
    const newZoom = e.deltaY < 0 ? zoom * 1.15 : zoom / 1.15;
    setZoom(newZoom);
  };

  const handleMouseDown = (e) => {
    const startX = e.clientX;
    const startY = e.clientY;

    const handleMouseMove = (e) => {
      const dx = ((e.clientX - startX) / zoom) / 150;
      const dy = ((e.clientY - startY) / zoom) / 150;
      setPosition({ x: position.x - dx, y: position.y - dy });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleIterationsChange = (value) => {
    setMaxIterations(value);
  };

  const handleResetView = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setMaxIterations(16);
  };

  return (
    <div
      style={{
        width: '100%',
        height: '600px',
        position: 'relative',
        overflow: 'hidden'
      }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
    >
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}
      >
        Iterations
        {[2,4,8,16, 32, 64, 128, 256].map((value) => (
          <button
            key={value}
            className={`btn ${maxIterations === value ? 'selected' : ''}`}
            onClick={() => handleIterationsChange(value)}
          >
            {value}
          </button>
        ))}
      </div>
      <div
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          gap: '10px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          textAlign: 'left',
        }}
      >
        Mandelbrot set<br/>
        Fractal visualization<br/>
        <button onClick={handleResetView}>
          Reset View
        </button>
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          textAlign: 'left',
        }}
      >
        <a href="https://alan.computer">alan.computer</a>
      </div>
    </div>
  );
};

function App() {
  return (
    <>
      <div style={{ width: '800px' }}>
        <MandelbrotSet />
      </div>
    </>
  )
}

export default App;
