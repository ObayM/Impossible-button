import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css'

const App = () => {
  const [buttons, setButtons] = useState([{ id: 'main', position: { x: 50, y: 50 }, z: 0, rotateX: 0, rotateY: 0, scale: 1 }]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [distortionEffect, setDistortionEffect] = useState(0);
  const [visualEffects, setVisualEffects] = useState([]);
  const [perspective, setPerspective] = useState({ x: 0, y: 0 });
  const [gravity, setGravity] = useState({ x: 0, y: 0 });
  const [timeWarp, setTimeWarp] = useState(1);
  const [failureCount, setFailureCount] = useState(0);
  const containerRef = useRef(null);
  const [warpField, setWarpField] = useState(false);
  const [vortexAngle, setVortexAngle] = useState(0);
  const [buttonText, setButtonText] = useState("Try to Click Me! 😈");
  const lastTauntTime = useRef(Date.now());

  const evilTaunts = [
    "Too slow! 🏃‍♂️",
    "Nice try, human! 👻",
    "In your dreams! 💤",
    "ERROR: Human too slow! 🐌",
    "Loading skill... 404! 💀",
    "You'll never catch me! 🏃‍♂️",
    "Physics.exe has crashed! 💫",
    "*evil laughter* 😈",
    "Maybe next time! ⏰",
    "Are you even trying? 🤔"
  ];

  const movementPatterns = [
    (t) => ({
      x: Math.sin(t/1000) * Math.cos(t/500) * 150 * timeWarp,
      y: Math.cos(t/750) * Math.sin(t/400) * 150 * timeWarp,
      z: Math.sin(t/600) * 50 * timeWarp 
    }),
    (t) => ({
      x: Math.sin(t/500) * 200 * Math.cos(t/1000) * timeWarp,
      y: Math.cos(t/400) * 200 * Math.sin(t/800) * timeWarp,
      z: Math.cos(t/300) * 30 * timeWarp 
    }),
    (t) => ({
      x: Math.sin(t/300 + Math.cos(t/500)) * 250 * timeWarp,
      y: Math.cos(t/250 + Math.sin(t/400)) * 250 * timeWarp,
      z: Math.sin(t/200) * 40 * timeWarp 
    })
  ];
  const updateButtonText = (newText) => {
    const currentTime = Date.now();
    if (currentTime - lastTauntTime.current > 2000) {
      setButtonText(newText);
      lastTauntTime.current = currentTime;
    }
  };

  const handleClick = useCallback((buttonId) => {
    setScore(prev => prev + 1);
    setBestScore(prev => Math.max(prev, score + 1));
    setTimeWarp(prev => prev * 1.2);
    
    const button = buttons.find(b => b.id === buttonId);
    if (button) {
      createVisualEffect(button.position.x, button.position.y, 'explosion');
    }
    
    updateButtonText("IMPOSSIBLE! 🤯");
    setTimeout(() => updateButtonText(evilTaunts[Math.floor(Math.random() * evilTaunts.length)]), 2000);
  }, [buttons, score]);

  const createVisualEffect = (x, y, type = 'default') => {
    const effect = {
      id: Date.now(),
      x,
      y,
      size: type === 'explosion' ? 200 : Math.random() * 100 + 50,
      color: type === 'explosion' 
        ? `hsl(${Math.random() * 60 + 300}, 100%, 50%)`
        : `hsl(${Math.random() * 360}, 100%, 50%)`,
      duration: type === 'explosion' ? 1500 : Math.random() * 1000 + 500,
      type: type === 'explosion' ? 'explosion' : (Math.random() > 0.5 ? 'ripple' : 'vortex')
    };
    
    setVisualEffects(prev => [...prev, effect]);
    setTimeout(() => {
      setVisualEffects(prev => prev.filter(e => e.id !== effect.id));
    }, effect.duration);
  };

  const handleMouseMove = useCallback((e) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setPerspective({
      x: (mouseX / rect.width - 0.5) * 30,
      y: (mouseY / rect.height - 0.5) * 30 
    });

    setGravity({
      x: (mouseX / rect.width - 0.5) * 1.5,
      y: (mouseY / rect.height - 0.5) * 1.5
    });

    if (Math.random() < 0.05) { 
      createVisualEffect(mouseX, mouseY);
    }

    setButtons(prevButtons => {
      return prevButtons.map(button => {
        const dx = mouseX - button.position.x;
        const dy = mouseY - button.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 200) {
          setFailureCount(prev => prev + 1);
          if (failureCount > 10 && Math.random() < 0.1) {
            updateButtonText("Getting frustrated? 😈");
          }

          const angle = Math.atan2(dy, dx) + Math.PI;
          const speed = (200 - distance) / 2 * timeWarp;
          const pattern = movementPatterns[Math.floor(Math.random() * movementPatterns.length)](Date.now());

          const limitedRotateX = Math.max(-45, Math.min(45, (dy / distance) * 45));
          const limitedRotateY = Math.max(-45, Math.min(45, (dx / distance) * 45));

          return {
            ...button,
            position: {
              x: Math.max(0, Math.min(rect.width - 100, 
                button.position.x + Math.cos(angle) * speed + pattern.x + gravity.x
              )),
              y: Math.max(0, Math.min(rect.height - 100, 
                button.position.y + Math.sin(angle) * speed + pattern.y + gravity.y
              ))
            },
            z: pattern.z,
            rotateX: limitedRotateX,
            rotateY: limitedRotateY,
            scale: 0.9 + Math.sin(Date.now() / 1000) * 0.1
          };
        }
        return button;
      });
    });

    setDistortionEffect(prev => Math.min(0.7, prev + 0.05));
    setVortexAngle(prev => prev + 0.1);
    setWarpField(true);

    if (Math.random() < 0.02) {
      updateButtonText(evilTaunts[Math.floor(Math.random() * evilTaunts.length)]);
    }
  }, [failureCount, timeWarp, gravity]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDistortionEffect(prev => Math.max(0, prev - 0.05));
      setWarpField(false);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black p-4">
      <div className="mb-4 text-white text-xl font-bold">
        <span className="mr-4">Score: {score}</span>
        <span>Best: {bestScore}</span>
      </div>

      <div 
        ref={containerRef}
        className="relative w-full max-w-4xl h-[600px] bg-gradient-to-br from-gray-900/50 to-black/50 rounded-xl overflow-hidden backdrop-blur-sm border border-purple-500/30"
        onMouseMove={handleMouseMove}
        style={{
          perspective: '1200px',
          transform: `rotateX(${perspective.y}deg) rotateY(${perspective.x}deg)`,
          transition: 'transform 0.2s ease-out'
        }}
      >
        {visualEffects.map(effect => (
          <div
            key={effect.id}
            className={`absolute pointer-events-none ${
              effect.type === 'explosion' ? 'animate-explosion' :
              effect.type === 'ripple' ? 'animate-ripple' : 'animate-vortex'
            }`}
            style={{
              left: effect.x - effect.size/2,
              top: effect.y - effect.size/2,
              width: effect.size,
              height: effect.size,
              border: `2px solid ${effect.color}`,
              borderRadius: '50%',
              opacity: 0.5,
              boxShadow: effect.type === 'explosion' ? `0 0 30px ${effect.color}` : 'none'
            }}
          />
        ))}

        {warpField && (
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 50% 50%, 
                transparent 0%,
                rgba(255,0,255,0.1) 20%,
                transparent 70%
              )`,
              transform: `rotate(${vortexAngle}rad)`
            }}
          />
        )}

        {buttons.map(button => (
          <button
            key={button.id}
            onClick={() => handleClick(button.id)}
            className="absolute px-6 py-3 rounded-full font-bold text-white bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 hover:from-purple-600 hover:via-red-600 hover:to-blue-600"
            style={{
              left: `${button.position.x}px`,
              top: `${button.position.y}px`,
              transform: `
                translateZ(${button.z}px)
                rotateX(${button.rotateX}deg)
                rotateY(${button.rotateY}deg)
                scale(${button.scale})
              `,
              transition: 'all 0.15s ease-out',
              boxShadow: `
                0 0 20px rgba(255,0,255,${0.2 + distortionEffect * 0.3}),
                0 0 40px rgba(255,0,255,${0.1 + distortionEffect * 0.2})
              `
            }}
          >
            {buttonText}
          </button>
        ))}
      </div>
    </div>
  );
};

export default App;
