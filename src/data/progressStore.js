const STORAGE_KEY = 'athkar-progress-v1';

function loadMap() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function saveMap(map) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

const progressMap = loadMap();

export function getReadCount(id) {
  const value = progressMap[id];
  return typeof value === 'number' && value >= 0 ? value : 0;
}

export function incrementReadCount(id, targetCount) {
  const next = Math.min(getReadCount(id) + 1, targetCount);
  progressMap[id] = next;
  saveMap(progressMap);
  return next;
}

export function getProgress(id, targetCount) {
  if (!targetCount || targetCount <= 0) {
    return 0;
  }
  return Math.min((getReadCount(id) / targetCount) * 100, 100);
}
