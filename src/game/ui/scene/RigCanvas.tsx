import { useEffect, useRef, type CSSProperties } from 'react';
import type { Rive } from '@rive-app/canvas-lite';
import wasmUrl from '@rive-app/canvas-lite/rive.wasm?url';
import type { Rig, RigInputs } from './rigs';

// One Rive rig on a canvas. The runtime (~1.2 MB with its wasm) loads only when the scene first draws
// a rig, so the game's first screen does not wait for it. The wasm ships with the game and is handed
// over as bytes: the phone's web view need not know its file type and nothing is fetched from a CDN
// (the game works offline). If anything fails the rig reports it and the scene keeps its pictures.

export type RigStatus = 'loading' | 'ready' | 'failed';

/** The rigs' one state machine (gen3.py, sans_rig.py). */
const STATE_MACHINE = 'State Machine 1';
/** Sharper than this costs a low-end phone more than it shows. */
const MAX_PIXEL_RATIO = 2;

let runtime: Promise<typeof import('@rive-app/canvas-lite')> | null = null;

function loadRuntime() {
  runtime ??= Promise.all([
    import('@rive-app/canvas-lite'),
    fetch(wasmUrl).then((response) => {
      if (!response.ok) throw new Error(`rive.wasm ${response.status}`);
      return response.arrayBuffer();
    }),
  ]).then(([rive, wasm]) => {
    rive.RuntimeLoader.setWasmFallbackUrl(null);
    rive.RuntimeLoader.setWasmBinary(wasm);
    return rive;
  });
  // A failed load may be tried again by the next rig (the next time the scene opens).
  runtime.catch(() => {
    runtime = null;
  });
  return runtime;
}

function apply(rive: Rive, inputs: RigInputs) {
  const model = rive.viewModelInstance;
  if (!model) return;
  for (const [name, value] of Object.entries(inputs.numbers ?? {})) {
    const property = model.number(name);
    if (property && property.value !== value) property.value = value;
  }
  for (const [name, value] of Object.entries(inputs.booleans ?? {})) {
    const property = model.boolean(name);
    if (property && property.value !== value) property.value = value;
  }
}

interface RigCanvasProps {
  rig: Rig;
  inputs: RigInputs;
  /** Stops drawing (a sheet covers the scene); the rig picks up where it was. */
  paused?: boolean;
  onStatus: (status: RigStatus) => void;
  className?: string;
  style?: CSSProperties;
}

export function RigCanvas({ rig, inputs, paused = false, onStatus, className, style }: RigCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const riveRef = useRef<Rive | null>(null);
  // The latest values, for the moment the file has loaded.
  const latest = useRef({ inputs, paused, onStatus });
  latest.current = { inputs, paused, onStatus };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let gone = false;
    let resize: ResizeObserver | null = null;
    latest.current.onStatus('loading');
    loadRuntime()
      .then(({ Rive, Layout, Fit, Alignment }) => {
        if (gone) return;
        const rive: Rive = new Rive({
          src: rig.src,
          canvas,
          stateMachine: STATE_MACHINE,
          autoplay: true,
          autoBind: true,
          layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
          shouldDisableRiveListeners: true,
          onLoad: () => {
            if (gone) return;
            const fit = () => rive.resizeDrawingSurfaceToCanvas(Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO));
            fit();
            resize = new ResizeObserver(fit);
            resize.observe(canvas);
            apply(rive, latest.current.inputs);
            if (latest.current.paused) rive.stopRendering();
            riveRef.current = rive;
            latest.current.onStatus('ready');
          },
          onLoadError: () => {
            if (!gone) latest.current.onStatus('failed');
          },
        });
        riveRef.current = rive;
      })
      .catch(() => {
        if (!gone) latest.current.onStatus('failed');
      });
    return () => {
      gone = true;
      resize?.disconnect();
      riveRef.current?.cleanup();
      riveRef.current = null;
    };
  }, [rig.src]);

  useEffect(() => {
    if (riveRef.current) apply(riveRef.current, inputs);
  }, [inputs]);

  useEffect(() => {
    const rive = riveRef.current;
    if (!rive) return;
    if (paused) rive.stopRendering();
    else rive.startRendering();
  }, [paused]);

  return <canvas ref={canvasRef} className={className} style={style} />;
}
