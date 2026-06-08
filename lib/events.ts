export const terminalBus = new EventTarget();

// Panel system
export function openPanel(id: string, data?: unknown) {
  terminalBus.dispatchEvent(
    new CustomEvent("open-panel", { detail: { id, data } }),
  );
}

export function closePanel() {
  terminalBus.dispatchEvent(new CustomEvent("close-panel"));
}

// Terrarium (wired up later)
export function connectTerrarium() {
  terminalBus.dispatchEvent(new CustomEvent("terrarium-connect"));
}

export function disconnectTerrarium() {
  terminalBus.dispatchEvent(new CustomEvent("terrarium-disconnect"));
}
