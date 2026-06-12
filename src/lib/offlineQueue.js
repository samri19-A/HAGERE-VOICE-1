const QUEUE_KEY = 'hagere_voice_offline_queue';


function readQueue() {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeQueue(queue) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function enqueueCommand(payload) {
  const queue = readQueue();
  const entry = {
    id: crypto.randomUUID(),
    ...payload,
    createdAt: new Date().toISOString(),
  };
  queue.push(entry);
  writeQueue(queue);
  return entry;
}

export function getQueuedCommands() {
  return readQueue();
}

export function removeFromQueue(id) {
  writeQueue(readQueue().filter((e) => e.id !== id));
}

export function clearQueue() {
  localStorage.removeItem(QUEUE_KEY);
}
