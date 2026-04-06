// 自动化任务的共享内存状态（独立模块，避免从 Route 文件直接 export）

export const taskStatus: Record<string, { isRunning: boolean; config: Record<string, unknown> }> = {};
export const taskLogs: Record<string, Array<{ timestamp: string; type: string; message: string }>> = {};

export function addLog(taskId: string, type: string, message: string) {
  const timestamp = new Date().toLocaleTimeString('zh-CN', { hour12: false });
  if (!taskLogs[taskId]) taskLogs[taskId] = [];
  taskLogs[taskId].push({ timestamp, type, message });
  if (taskLogs[taskId].length > 200) taskLogs[taskId] = taskLogs[taskId].slice(-200);
  console.log(`[${taskId}][${type}] ${message}`);
}
