'use client';

import { type CSSProperties, useCallback, useEffect, useMemo, useRef } from 'react';

const dialDefaults = {
  grid: { columns: 16, rows: 10 },
  motion: {
    zDepth: 1520,
    spread: 32,
    rotate: 60,
    duration: 4075,
    stagger: 180,
    formationSplit: 0.09,
    formationStagger: 0.86,
    formationScale: 0.987,
  },
  shape: { cornerRadius: 0.06 },
  material: {
    thickness: 0.065,
    roughness: 0.79,
    metalness: 0.09,
    sideColor: '#0a0a0a',
  },
  lighting: { ambient: 0.1, key: 0.83, envIntensity: 0.22 },
  camera: { orbit: false, autoRotate: false, autoRotateSpeed: 0.6 },
  hover: { radius: 1.8, falloff: 1.4, rotation: 30, lift: 0.2 },
  cta: { hoverColor: '#ff7a3d' },
  fx: {
    barrel: 0.4,
    bloomIntensity: 3,
    bloomThreshold: 0.33,
    bloomSmoothing: 0.62,
    caOffset: 0,
    caModulation: 0.53,
    vignetteDarkness: 0.33,
    vignetteOffset: 0.32,
  },
  code: { fontSize: 21, lineHeight: 1.6, opacity: 0.79 },
};

const codeRows = [
  'const user = await auth.verify(credentials)',
  'workspace.route("/hub")',
  'apps.filter((app) => app.enabled)',
  'permissions.resolve({ scope: "humanresource" })',
  'session.touch(Date.now())',
  'queryClient.invalidateQueries()',
  'employee.feed.sync()',
  'attendance.status.readOnly()',
  'leave.balance.calculate()',
  'documents.pending.approval()',
];

type Tile = {
  column: number;
  row: number;
  delay: number;
  text: string;
};

type CursorPoint = {
  clientX: number;
  clientY: number;
};

export function LoginCodeSliceBackground() {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const tileRefs = useRef<Array<HTMLDivElement | null>>([]);
  const { columns, rows } = dialDefaults.grid;

  const tiles = useMemo<Tile[]>(
    () =>
      Array.from({ length: columns * rows }, (_, index) => {
        const column = index % columns;
        const row = Math.floor(index / columns);

        return {
          column,
          row,
          delay: (column + row) * dialDefaults.motion.formationStagger,
          text: codeRows[row % codeRows.length],
        };
      }),
    [columns, rows],
  );

  const updateTiles = useCallback((event: CursorPoint) => {
    const stage = stageRef.current;
    if (!stage) return;

    const rect = stage.getBoundingClientRect();
    const pointerColumn = ((event.clientX - rect.left) / rect.width) * columns;
    const pointerRow = ((event.clientY - rect.top) / rect.height) * rows;
    const radius = dialDefaults.hover.radius * 1.32;
    const falloff = dialDefaults.hover.falloff * 0.86;
    const tileWidth = rect.width / columns;
    const tileHeight = rect.height / rows;
    const tileSize = Math.min(tileWidth, tileHeight);
    const spreadScale = tileSize * (dialDefaults.motion.spread / 100);
    const liftScale =
      tileSize *
      dialDefaults.hover.lift *
      (dialDefaults.motion.zDepth / 1520);

    tileRefs.current.forEach((tile, index) => {
      if (!tile) return;

      const column = index % columns;
      const row = Math.floor(index / columns);
      const dx = column + 0.5 - pointerColumn;
      const dy = row + 0.5 - pointerRow;
      const distance = Math.hypot(dx, dy);
      const rawForce =
        distance < radius
          ? Math.pow(1 - distance / radius, falloff)
          : 0;
      const force = rawForce > 0.012 ? rawForce : 0;
      const directionX = distance ? dx / distance : 0;
      const directionY = distance ? dy / distance : 0;
      const spread = spreadScale * 0.3 * force;
      const lift = liftScale * 1.16 * force;
      const rotateX = -directionY * dialDefaults.hover.rotation * 0.62 * force;
      const rotateY = directionX * dialDefaults.hover.rotation * 0.62 * force;
      const rotateZ = (directionX + directionY * 0.35) * dialDefaults.motion.rotate * 0.05 * force;
      const shadow = force * 0.38;
      const thickness = force * 0.26;
      const shadowX = directionX * force * 14;
      const shadowY = force * 34;
      const shadowBlur = force ? 18 + lift * 0.6 : 0;
      const border = force * 0.12;
      const seam = force * 0.22;
      const highlight = force * 0.26;
      tile.style.setProperty('--tile-force', `${force}`);
      tile.style.setProperty('--tile-x', `${directionX * spread}px`);
      tile.style.setProperty('--tile-y', `${directionY * spread}px`);
      tile.style.setProperty('--tile-z', `${lift}px`);
      tile.style.setProperty('--tile-rx', `${rotateX}deg`);
      tile.style.setProperty('--tile-ry', `${rotateY}deg`);
      tile.style.setProperty('--tile-rz', `${rotateZ}deg`);
      tile.style.setProperty('--tile-light', `${0.72 + force * 0.28}`);
      tile.style.setProperty('--tile-shadow', `${shadow}`);
      tile.style.setProperty('--tile-thickness', `${thickness}rem`);
      tile.style.setProperty('--tile-shadow-x', `${shadowX}px`);
      tile.style.setProperty('--tile-shadow-y', `${shadowY}px`);
      tile.style.setProperty('--tile-shadow-blur', `${shadowBlur}px`);
      tile.style.setProperty('--tile-border', `${border}`);
      tile.style.setProperty('--tile-seam', `${seam}`);
      tile.style.setProperty('--tile-highlight', `${highlight}`);
      tile.style.zIndex = force > 0 ? `${Math.round(force * 100) + 2}` : '1';
    });
  }, [columns, rows]);

  const resetTiles = useCallback(() => {
    tileRefs.current.forEach((tile) => {
      if (!tile) return;
      tile.style.setProperty('--tile-force', '0');
      tile.style.setProperty('--tile-x', '0px');
      tile.style.setProperty('--tile-y', '0px');
      tile.style.setProperty('--tile-z', '0px');
      tile.style.setProperty('--tile-rx', '0deg');
      tile.style.setProperty('--tile-ry', '0deg');
      tile.style.setProperty('--tile-rz', '0deg');
      tile.style.setProperty('--tile-light', '0.72');
      tile.style.setProperty('--tile-shadow', '0');
      tile.style.setProperty('--tile-thickness', '0rem');
      tile.style.setProperty('--tile-shadow-x', '0px');
      tile.style.setProperty('--tile-shadow-y', '0px');
      tile.style.setProperty('--tile-shadow-blur', '0px');
      tile.style.setProperty('--tile-border', '0');
      tile.style.setProperty('--tile-seam', '0');
      tile.style.setProperty('--tile-highlight', '0');
      tile.style.zIndex = '1';
    });
  }, []);

  useEffect(() => {
    const handlePointerMove = (event: globalThis.PointerEvent) => updateTiles(event);
    const handlePointerOut = (event: globalThis.PointerEvent) => {
      if (!event.relatedTarget) {
        resetTiles();
      }
    };
    const handleVisibilityChange = () => {
      if (document.hidden) {
        resetTiles();
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('blur', resetTiles);
    window.addEventListener('pointercancel', resetTiles);
    document.documentElement.addEventListener('pointerleave', resetTiles);
    document.documentElement.addEventListener('pointerout', handlePointerOut);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('blur', resetTiles);
      window.removeEventListener('pointercancel', resetTiles);
      document.documentElement.removeEventListener('pointerleave', resetTiles);
      document.documentElement.removeEventListener('pointerout', handlePointerOut);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [resetTiles, updateTiles]);

  return (
    <div className="login-code-bg" aria-hidden="true">
      <div className="login-code-bg__grid" />
      <div className="login-code-bg__glow login-code-bg__glow--cyan" />
      <div className="login-code-bg__glow login-code-bg__glow--blue" />
      <div className="login-code-bg__beam" />
      <div
        ref={stageRef}
        className="login-code-puzzle"
        style={
          {
            '--puzzle-columns': columns,
            '--puzzle-rows': rows,
            '--puzzle-duration': `${dialDefaults.motion.duration}ms`,
            '--puzzle-radius': `${dialDefaults.shape.cornerRadius}rem`,
        } as CSSProperties
        }
      >
        {tiles.map((tile, index) => (
          <div
            key={`${tile.column}-${tile.row}`}
            ref={(node) => {
              tileRefs.current[index] = node;
            }}
            className="login-code-puzzle__tile"
            style={
              {
                '--tile-column': tile.column,
                '--tile-row': tile.row,
                '--tile-delay': `${tile.delay * dialDefaults.motion.stagger}ms`,
                '--tile-force': 0,
                '--tile-light': 0.72,
                '--tile-shadow': 0,
                '--tile-thickness': '0rem',
                '--tile-shadow-x': '0px',
                '--tile-shadow-y': '0px',
                '--tile-shadow-blur': '0px',
                '--tile-border': 0,
                '--tile-seam': 0,
                '--tile-highlight': 0,
              } as CSSProperties
            }
          >
            <span className="login-code-puzzle__code">{tile.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
