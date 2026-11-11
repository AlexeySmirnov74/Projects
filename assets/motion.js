(() => {
  "use strict";

  const shell = document.querySelector(".dark-shell");
  const hero = shell?.querySelector(".hero");
  if (!hero || shell.querySelector(".hero-wave-field")) return;

  const svgNS = "http://www.w3.org/2000/svg";
  const svgElement = (name, attributes) => {
    const node = document.createElementNS(svgNS, name);
    Object.entries(attributes).forEach(([key, value]) =>
      node.setAttribute(key, value),
    );
    return node;
  };

  const field = document.createElement("div");
  field.className = "hero-wave-field";
  field.setAttribute("aria-hidden", "true");
  const svg = svgElement("svg", {
    viewBox: "0 0 1440 800",
    preserveAspectRatio: "xMidYMid slice",
    focusable: "false",
  });
  const layer = svgElement("g", { class: "hero-wave-layer" });
  const secondary = svgElement("g", {
    class: "hero-wave-layer hero-wave-layer-secondary",
  });

  // Flowing contour lines echo the hardware traces in the existing illustration.
  for (let index = 0; index < 22; index++) {
    const y = 240 + index * 23;
    const path = `M-100 ${y} C260 ${y + 170} 420 ${y - 220} 760 ${y - 102} S1150 ${y + 178} 1550 ${y - 105}`;
    layer.append(
      svgElement("path", {
        d: path,
        class: "hero-wave-line",
        opacity: 0.07 + (index % 5) * 0.025,
      }),
    );
    if (index === 5 || index === 16) {
      layer.append(svgElement("path", { d: path, class: "hero-wave-accent" }));
      layer.append(
        svgElement("path", {
          d: path,
          class: `hero-wave-tracer${index === 16 ? " hero-wave-tracer-secondary" : ""}`,
        }),
      );
    }
  }
  for (let index = 0; index < 9; index++) {
    const y = 170 + index * 42;
    secondary.append(
      svgElement("path", {
        d: `M360 ${y + 330} C650 ${y + 300} 600 ${y - 130} 980 ${y - 70} S1340 ${y + 220} 1570 ${y + 85}`,
        class: "hero-wave-line",
        opacity: 0.055 + (index % 3) * 0.02,
      }),
    );
  }
  svg.append(layer, secondary);
  field.append(svg);
  shell.prepend(field);
  shell.classList.add("motion-ready");

  const map = hero.querySelector(".system-map");
  const mapPath = map?.querySelector(".map-path");
  if (mapPath) {
    const signal = svgElement("path", {
      d: mapPath.getAttribute("d"),
      class: "map-signal",
    });
    mapPath.after(signal);
  }

  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const desktopPointer = matchMedia(
    "(hover: hover) and (pointer: fine) and (min-width: 821px)",
  );
  const art = hero.querySelector(".hero-art");
  let visible = true;
  let listening = false;
  let frame = 0;
  let point = null;

  const resetTilt = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    point = null;
    art?.style.removeProperty("--art-rotate-x");
    art?.style.removeProperty("--art-rotate-y");
  };
  const renderTilt = () => {
    frame = 0;
    if (!point || !art) return;
    const rect = hero.getBoundingClientRect();
    const x = Math.max(
      -1,
      Math.min(1, ((point.x - rect.left) / rect.width - 0.5) * 2),
    );
    const y = Math.max(
      -1,
      Math.min(1, ((point.y - rect.top) / rect.height - 0.5) * 2),
    );
    art.style.setProperty("--art-rotate-x", `${(-y * 2.8).toFixed(2)}deg`);
    art.style.setProperty("--art-rotate-y", `${(x * 4).toFixed(2)}deg`);
  };
  const onPointer = (event) => {
    if (event.pointerType !== "mouse") return;
    point = { x: event.clientX, y: event.clientY };
    // A single frame per input burst; there is no permanent JS animation loop.
    if (!frame) frame = requestAnimationFrame(renderTilt);
  };
  const syncMotion = () => {
    const active = visible && !document.hidden && !reducedMotion.matches;
    shell.classList.toggle("motion-active", active);
    const shouldListen = active && desktopPointer.matches && Boolean(art);
    if (shouldListen === listening) return;
    listening = shouldListen;
    if (listening) {
      hero.addEventListener("pointermove", onPointer, { passive: true });
      hero.addEventListener("pointerleave", resetTilt);
    } else {
      hero.removeEventListener("pointermove", onPointer);
      hero.removeEventListener("pointerleave", resetTilt);
      resetTilt();
    }
  };

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      syncMotion();
    });
    observer.observe(shell);
  }
  document.addEventListener("visibilitychange", syncMotion);
  reducedMotion.addEventListener("change", syncMotion);
  desktopPointer.addEventListener("change", syncMotion);
  window.addEventListener("blur", resetTilt);
  window.addEventListener("pagehide", () => {
    visible = false;
    syncMotion();
  });
  window.addEventListener("pageshow", () => {
    visible =
      shell.getBoundingClientRect().bottom > 0 &&
      shell.getBoundingClientRect().top < innerHeight;
    syncMotion();
  });
  syncMotion();
})();
