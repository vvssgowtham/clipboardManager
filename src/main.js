const {
  app,
  BrowserWindow,
  ipcMain,
  clipboard,
  nativeImage,
  globalShortcut,
} = require("electron");
const path = require("path");
const {
  saveText,
  saveImage,
  getHistory,
  clearAll,
  enforceLimit,
} = require("./db");

let window;

const createWindow = () => {
  window = new BrowserWindow({
    width: 480,
    height: 640,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    show: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    vibrancy: "under-window",
    visualEffectState: "active",
  });

  window.loadFile(path.join(__dirname, "index.html"));

  window.on("blur", () => {
    window.hide();
  });
};

const toggleWindow = () => {
  if (!window) return;

  if (window.isVisible()) {
    window.hide();
  } else {
    window.show();
    window.center();
    window.focus();
  }
};

// Monitor Clipboard
let lastText = "";
let lastImageHash = "";

setInterval(() => {
  const text = clipboard.readText();
  if (text && text !== lastText) {
    saveText(text);
    enforceLimit(); // Keep only 50 most recent items
    lastText = text;
    console.log("Saved Text:", text.substring(0, 20) + "...");

    // Notify renderer to refresh
    if (window && window.webContents) {
      window.webContents.send("clipboard-updated");
    }
  }

  const img = clipboard.readImage();
  if (!img.isEmpty()) {
    const buffer = img.toPNG();
    const currentHash = require("crypto")
      .createHash("md5")
      .update(buffer)
      .digest("hex");

    if (currentHash !== lastImageHash) {
      saveImage(buffer);
      enforceLimit(); // Keep only 50 most recent items
      lastImageHash = currentHash;
      console.log("Saved Image");

      if (window && window.webContents) {
        window.webContents.send("clipboard-updated");
      }
    }
  }
}, 1000);

ipcMain.handle("get-history", () => {
  return getHistory();
});

ipcMain.handle("restore", (event, item) => {
  if (item.type === "text") {
    clipboard.writeText(item.content);
  } else if (item.type === "image") {
    const img = nativeImage.createFromPath(item.imagePath);
    clipboard.writeImage(img);
  }

  if (window) {
    window.hide();
  }
});

ipcMain.handle("close-window", () => {
  if (window) {
    window.hide();
  }
});

app.whenReady().then(() => {
  // Clear all clipboard history on startup
  clearAll();

  createWindow();
  window.once("ready-to-show", () => {
    window.show();
    window.focus();
  });

  const registered = globalShortcut.register("CommandOrControl+Shift+V", () => {
    toggleWindow();
  });

  if (!registered) {
    console.error("Shortcut registration failed");
  }
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
