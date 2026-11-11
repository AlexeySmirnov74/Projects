(() => {
  "use strict";

  const start = () => {
    const body = document.body;
    const motionButton = document.getElementById("motion-toggle");
    if (motionButton) motionButton.hidden = false;
    const smallScreen = window.matchMedia("(max-width: 700px)");
    let canvas = document.getElementById("neural-canvas");
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.id = "neural-canvas";
      body.prepend(canvas);
    }
    canvas.setAttribute("aria-hidden", "true");
    document.querySelectorAll(".cyber-grid").forEach((grid) => {
      grid.setAttribute("aria-hidden", "true");
    });

    const context = canvas.getContext("2d", { alpha: true });
    // This local preview explicitly starts in motion on every page opening.
    // Pause applies to the current page; an earlier pause never blocks startup.
    let enabled = true;
    let width = 0;
    let height = 0;
    let nodes = [];
    let signals = [];
    let connections = [];
    let frame = 0;
    let lastFrame = 0;
    let elapsed = 0;
    let signalTimer = 0;
    let resizeTimer = 0;
    let nextSeed = 42119;
    const pointer = { x: 0, y: 0, active: false };
    const frameDuration = 1000 / 30;
    const turquoise = "0, 255, 200";

    const random = () => {
      nextSeed = (nextSeed * 16807) % 2147483647;
      return (nextSeed - 1) / 2147483646;
    };

    const reset = () => {
      if (!context) return;
      width = Math.max(1, window.innerWidth);
      height = Math.max(1, window.innerHeight);
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      nextSeed = 42119 + Math.round(width * 3 + height);
      const count = smallScreen.matches ? 40 : 90;
      nodes = Array.from({ length: count }, (_, index) => {
        const direction = random() * Math.PI * 2;
        const speed = 12 + random() * 16;
        return {
          x: random() * width,
          y: random() * height,
          vx: Math.cos(direction) * speed,
          vy: Math.sin(direction) * speed,
          baseVx: Math.cos(direction) * speed,
          baseVy: Math.sin(direction) * speed,
          radius: 0.9 + random() * 1.9,
          phase: random() * Math.PI * 2,
          bright: index % 7 === 0,
        };
      });
      signals = [];
      signalTimer = 0;
      pointer.active = false;
      draw(false);
      signals = connections.slice(0, 6).map((pair, index) => ({
        from: pair[0],
        to: pair[1],
        progress: index / 6,
        speed: 0.55 + random() * 0.35,
      }));
    };

    const move = (delta) => {
      const attractionRadius = Math.min(320, Math.max(210, width * 0.22));
      const attracted = new Set(
        pointer.active
          ? nodes
              .map((node) => ({
                node,
                distance: Math.hypot(pointer.x - node.x, pointer.y - node.y),
              }))
              .filter(({ distance }) => distance < attractionRadius)
              .sort((a, b) => a.distance - b.distance)
              .slice(0, smallScreen.matches ? 4 : 8)
              .map(({ node }) => node)
          : [],
      );
      nodes.forEach((node) => {
        const isAttracted = attracted.has(node);
        const relaxation = Math.min(delta * (isAttracted ? 1.5 : 1.1), 1);
        node.vx += (node.baseVx - node.vx) * relaxation;
        node.vy += (node.baseVy - node.vy) * relaxation;
        if (isAttracted) {
          const dx = pointer.x - node.x;
          const dy = pointer.y - node.y;
          const distance = Math.hypot(dx, dy);
          if (distance > 1) {
            const pull = (1 - distance / attractionRadius) * delta * 320;
            node.vx += (dx / distance) * pull;
            node.vy += (dy / distance) * pull;
            if (distance < 30) {
              node.vx *= Math.max(0, 1 - delta * 4);
              node.vy *= Math.max(0, 1 - delta * 4);
            }
          }
        }
        const speed = Math.hypot(node.vx, node.vy);
        const maxSpeed = isAttracted ? 155 : 70;
        if (speed > maxSpeed) {
          node.vx *= maxSpeed / speed;
          node.vy *= maxSpeed / speed;
        }
        node.x += node.vx * delta;
        node.y += node.vy * delta;
        if (node.x < -20) node.x = width + 20;
        if (node.x > width + 20) node.x = -20;
        if (node.y < -20) node.y = height + 20;
        if (node.y > height + 20) node.y = -20;
      });
      signals = signals.filter((signal) => {
        signal.progress += delta * signal.speed;
        return signal.progress <= 1;
      });
      signalTimer += delta;
      if (signalTimer > 0.2 && connections.length && signals.length < 20) {
        signalTimer = 0;
        const pair = connections[Math.floor(random() * connections.length)];
        signals.push({
          from: pair[0],
          to: pair[1],
          progress: 0,
          speed: 0.55 + random() * 0.35,
        });
      }
    };

    const drawGlow = (x, y, radius, opacity) => {
      const glow = context.createRadialGradient(x, y, 0, x, y, radius);
      glow.addColorStop(0, `rgba(${turquoise}, ${opacity})`);
      glow.addColorStop(0.2, `rgba(${turquoise}, ${opacity * 0.32})`);
      glow.addColorStop(1, `rgba(${turquoise}, 0)`);
      context.fillStyle = glow;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    };

    const draw = (animate) => {
      if (!context) return;
      context.clearRect(0, 0, width, height);
      connections = [];
      const reach = smallScreen.matches
        ? 145
        : Math.min(260, Math.max(185, width * 0.13));
      const reachSquared = reach * reach;
      context.lineWidth = 0.7;
      // At most 4,005 comparisons per frame (90 desktop nodes).
      for (let first = 0; first < nodes.length; first++) {
        for (let second = first + 1; second < nodes.length; second++) {
          const a = nodes[first];
          const b = nodes[second];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const squared = dx * dx + dy * dy;
          if (squared > reachSquared) continue;
          const strength = 1 - Math.sqrt(squared) / reach;
          context.strokeStyle = `rgba(${turquoise}, ${strength * 0.24})`;
          context.beginPath();
          context.moveTo(a.x, a.y);
          context.lineTo(b.x, b.y);
          context.stroke();
          connections.push([a, b]);
        }
      }
      nodes.forEach((node) => {
        const pulse = animate
          ? 1 + Math.sin(elapsed * 1.2 + node.phase) * 0.25
          : 1;
        const radius = node.radius * pulse;
        drawGlow(
          node.x,
          node.y,
          radius * (node.bright ? 7.5 : 5),
          node.bright ? 0.4 : 0.22,
        );
        context.fillStyle = `rgba(${turquoise}, ${node.bright ? 0.85 : 0.56})`;
        context.beginPath();
        context.arc(node.x, node.y, radius, 0, Math.PI * 2);
        context.fill();
      });
      if (animate) {
        signals.forEach((signal) => {
          const { from, to, progress } = signal;
          if (Math.hypot(from.x - to.x, from.y - to.y) > reach * 1.2) return;
          const x = from.x + (to.x - from.x) * progress;
          const y = from.y + (to.y - from.y) * progress;
          drawGlow(x, y, 9, 0.78 * Math.sin(Math.PI * progress));
          context.fillStyle = `rgba(190, 255, 241, ${Math.sin(Math.PI * progress) * 0.9})`;
          context.beginPath();
          context.arc(x, y, 1.5, 0, Math.PI * 2);
          context.fill();
        });
      }
    };

    const tick = (timestamp) => {
      if (!enabled || document.hidden) {
        frame = 0;
        return;
      }
      if (!lastFrame) lastFrame = timestamp - frameDuration;
      const difference = timestamp - lastFrame;
      if (difference >= frameDuration - 0.5) {
        const delta = Math.min(difference / 1000, 0.07);
        lastFrame = timestamp - (difference % frameDuration);
        elapsed += delta;
        move(delta);
        draw(true);
      }
      frame = requestAnimationFrame(tick);
    };

    const sync = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      lastFrame = 0;
      const active = enabled && !document.hidden;
      body.classList.toggle("neural-active", active);
      body.classList.toggle("motion-paused", !enabled);
      body.classList.toggle("motion-suspended", document.hidden);
      if (motionButton) {
        motionButton.setAttribute("aria-pressed", String(enabled));
        motionButton.setAttribute(
          "aria-label",
          enabled ? "Приостановить анимацию" : "Включить движение",
        );
        motionButton.title = enabled
          ? "Приостановить движение фона и схемы"
          : "Включить движение фона и схемы";
        const label = motionButton.querySelector("[data-motion-label]");
        if (label)
          label.textContent = enabled ? "Пауза анимации" : "Включить движение";
      }
      if (active && context) frame = requestAnimationFrame(tick);
      else draw(false);
    };

    motionButton?.addEventListener("click", () => {
      enabled = !enabled;
      pointer.active = false;
      sync();
    });
    document.addEventListener("visibilitychange", sync);
    window.addEventListener(
      "pointermove",
      (event) => {
        if (!enabled || event.pointerType === "touch") return;
        pointer.x = event.clientX;
        pointer.y = event.clientY;
        pointer.active = true;
      },
      { passive: true },
    );
    document.documentElement.addEventListener("pointerleave", () => {
      pointer.active = false;
    });
    window.addEventListener("blur", () => {
      pointer.active = false;
    });
    window.addEventListener(
      "resize",
      () => {
        clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(reset, 120);
      },
      { passive: true },
    );

    const onScreenChange = () => reset();
    if (smallScreen.addEventListener) {
      smallScreen.addEventListener("change", onScreenChange);
    } else {
      smallScreen.addListener(onScreenChange);
    }
    reset();
    sync();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
