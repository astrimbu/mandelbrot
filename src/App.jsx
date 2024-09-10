import React, { useState, useEffect, useRef } from 'react';
import './App.css'

const FractalVisualizer = () => {
  const canvasRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [maxIterations, setMaxIterations] = useState(16);
  const [canvasSize, setCanvasSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [fractalType, setFractalType] = useState('mandelbrot');

  useEffect(() => {
    const handleResize = () => {
      setCanvasSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    drawFractal();
  }, [zoom, position, maxIterations, canvasSize, fractalType]);

  const drawFractal = (hideUI = false) => {
    if (fractalType === 'mandelbrot') {
      drawMandelbrot(hideUI);
    } else {
      drawBarnsleyFern(hideUI);
    }
  };

  const drawMandelbrot = (hideUI = false) => {
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

    if (!hideUI) {
      drawReticle(ctx, width, height);
    }
  };

  const drawBarnsleyFern = (hideUI = false) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);

    const xMin = position.x - 2 / zoom;
    const xMax = position.x + 2 / zoom;
    const yMin = position.y - 2 / zoom;
    const yMax = position.y + 2 / zoom;

    const scaleX = width / (xMax - xMin);
    const scaleY = height / (yMax - yMin);

    let x = 0;
    let y = 0;

    ctx.fillStyle = 'green';

    for (let i = 0; i < maxIterations * 5000; i++) {
      const r = Math.random();
      let nx, ny;

      if (r < 0.01) {
        nx = 0;
        ny = 0.16 * y;
      } else if (r < 0.86) {
        nx = 0.85 * x + 0.04 * y;
        ny = -0.04 * x + 0.85 * y + 1.6;
      } else if (r < 0.93) {
        nx = 0.2 * x - 0.26 * y;
        ny = 0.23 * x + 0.22 * y + 1.6;
      } else {
        nx = -0.15 * x + 0.28 * y;
        ny = 0.26 * x + 0.24 * y + 0.44;
      }

      x = nx;
      y = ny;

      const px = Math.floor((x - xMin) * scaleX);
      const py = Math.floor((yMax - y) * scaleY);

      if (px >= 0 && px < width && py >= 0 && py < height) {
        ctx.fillRect(px, py, 1, 1);
      }
    }

    if (!hideUI) {
      drawReticle(ctx, width, height);
    }
  };

  const drawReticle = (ctx, width, height) => {
    const reticleSize = 20;
    const centerX = width / 2;
    const centerY = height / 2;

    ctx.save();
    ctx.globalCompositeOperation = 'difference';
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX - reticleSize / 2, centerY);
    ctx.lineTo(centerX + reticleSize / 2, centerY);
    ctx.moveTo(centerX, centerY - reticleSize / 2);
    ctx.lineTo(centerX, centerY + reticleSize / 2);
    ctx.stroke();
    ctx.restore();
  };

  const handleZoom = (factor, clientX, clientY) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) / canvas.width;
    const y = (clientY - rect.top) / canvas.height;

    const newZoom = zoom * factor;
    const newPosition = {
      x: position.x + (x - 0.5) * 4 / zoom * (1 - 1 / factor),
      y: position.y + (y - 0.5) * 4 / zoom * (1 - 1 / factor)
    }

    setZoom(newZoom);
    setPosition(newPosition);
  };

  const handleWheel = (e) => {
    const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
    handleZoom(factor, e.clientX, e.clientY);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const startX = touch.clientX;
      const startY = touch.clientY;

      const handleTouchMove = (e) => {
        const touch = e.touches[0];
        const dx = ((touch.clientX - startX) / zoom) / 150;
        const dy = ((touch.clientY - startY) / zoom) / 150;
        setPosition({ x: position.x - dx, y: position.y - dy });
      }

      const handleTouchEnd = () => {
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      }

      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);

    } else if (e.touches.length == 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const startDistance = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);

      const handleTouchMove = (e) => {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const newDistance = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
        const factor = newDistance / startDistance;

        const centerX = (touch1.clientX + touch2.clientX) / 2;
        const centerY = (touch1.clientY + touch2.clientY) / 2;

        handleZoom(factor, centerX, centerY);
      };

      const handleTouchEnd = () => {
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };

      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
    }
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

  const handleResetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleTakePicture = () => {
    const canvas = canvasRef.current;
    drawFractal(true);
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = `${fractalType}.png`;
    link.click();
    drawFractal(false);
  };

  const toggleFractalType = () => {
    setFractalType(fractalType === 'mandelbrot' ? 'barnsley' : 'mandelbrot');
    handleResetZoom();
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden'
      }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        style={{
          position: 'absolute',
          top: '0',
          left: '0',
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
        {[2, 4, 8, 16, 32, 64, 128, 256, 512].map((value) => (
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
        {fractalType === 'mandelbrot' ? 'Mandelbrot fractal' : 'Barnsley fern'}<br/>
        <button onClick={handleResetZoom}>
          Reset Zoom
        </button>
        <button onClick={handleTakePicture}>
          Take Picture
        </button>
        <button onClick={toggleFractalType}>
          Toggle Fractal
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
      <div
        style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          textAlign: 'right',
        }}
      >
        x:{position.x.toFixed(6)}<br/>
        y:{position.y.toFixed(6)}<br/>
        {zoom.toFixed(0)}
      </div>
    </div>
  );
};

function App() {
  return (
    <>
      <div>
        <FractalVisualizer />
      </div>
    </>
  )
}

export default App;