const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  getHistory: () => ipcRenderer.invoke("get-history"),
  restore: (item) => ipcRenderer.invoke("restore", item),
  closeWindow: () => ipcRenderer.invoke("close-window"),
  onClipboardUpdate: (callback) => {
    ipcRenderer.on("clipboard-updated", callback);
  },
});
