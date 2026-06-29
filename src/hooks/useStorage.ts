import { useEffect, useState } from 'react';
import type { AppState } from '../types';

const STORAGE_KEY = 'badminton-matcher-state-v1';

const defaultState: AppState = {
  players: [],
  matchHistory: [],
};

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as AppState;
    return {
      players: parsed.players ?? [],
      matchHistory: parsed.matchHistory ?? [],
    };
  } catch {
    return defaultState;
  }
}

export function useStorage() {
  const [state, setState] = useState<AppState>(() => loadState());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `badminton-matcher-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const importData = (file: File) =>
    new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(String(reader.result)) as AppState;
          setState({
            players: parsed.players ?? [],
            matchHistory: parsed.matchHistory ?? [],
          });
          resolve();
        } catch {
          reject(new Error('파일 형식이 올바르지 않습니다.'));
        }
      };
      reader.onerror = () => reject(new Error('파일을 읽을 수 없습니다.'));
      reader.readAsText(file);
    });

  return { state, setState, exportData, importData };
}
