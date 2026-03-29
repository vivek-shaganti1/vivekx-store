import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

export default function LandingPage({ theme = "dark" }) {
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  /* SIMPLE PARTICLE BACKGROUND */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    let width = window.innerWidth;
    let height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 2 + 0.5,
      dx: (Math.random() - 0.5) * 0.6,
      dy: (Math.random() - 0.5) * 0.6
    }));

    function animate() {
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.x += p.dx;
        p.y += p.dy;

        if (p.x < 0 || p.x > width) p.dx *= -1;
        if (p.y < 0 || p.y > height) p.dy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = theme === "light"
          ? "rgba(0,0,0,0.4)"
          : "rgba(255,255,255,0.4)";
        ctx.fill();
      });

      requestAnimationFrame(animate);
    }

    animate();

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener("resize", resize);

    return () => window.removeEventListener("resize", resize);

  }, [theme]);

  return (
    <div className={`landing-root ${theme}`}>

      <canvas ref={canvasRef} className="bg-canvas" />

      <div className="landing-content">

        <h1 className="title">
          VIVEKX STORE
        </h1>

        <p className="subtitle">
          Premium Collectibles • Watches • Fashion
        </p>

        <button
          className="enter-btn"
          onClick={() => navigate("/login")}
        >
          Enter Store
        </button>

      </div>

    </div>
  );
}