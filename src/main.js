const {
  app,
  BrowserWindow,
  ipcMain,
  clipboard,
  nativeImage,
  globalShortcut,
} = require("electron");
const path = require("path");
const fs = require("fs");
const os = require("os");
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

// Monitor Desktop for new screenshots
const desktopPath = path.join(os.homedir(), "Desktop");
let knownScreenshots = new Set();

// Initialize known screenshots
const initializeScreenshots = () => {
  if (fs.existsSync(desktopPath)) {
    const files = fs.readdirSync(desktopPath);
    files.forEach((file) => {
      if (file.startsWith("Screenshot ") && file.endsWith(".png")) {
        knownScreenshots.add(file);
      }
    });
  }
};

// Process a new screenshot
const processNewScreenshot = (filename) => {
  // Skip if already processed
  if (knownScreenshots.has(filename)) {
    return;
  }

  knownScreenshots.add(filename);
  const screenshotPath = path.join(desktopPath, filename);

  // Check if file exists
  if (!fs.existsSync(screenshotPath)) {
    return;
  }

  // Try to read and save the screenshot
  try {
    const buffer = fs.readFileSync(screenshotPath);
    saveImage(buffer);
    enforceLimit();
    console.log("Auto-captured screenshot:", filename);

    // Notify renderer to refresh
    if (window && window.webContents) {
      window.webContents.send("clipboard-updated");
    }
  } catch (err) {
    console.error("Failed to capture screenshot:", err);
  }
};

// Check if file is a screenshot
const isScreenshotFile = (filename) => {
  return (
    filename && filename.startsWith("Screenshot ") && filename.endsWith(".png")
  );
};

const watchScreenshots = () => {
  if (!fs.existsSync(desktopPath)) {
    return;
  }

  fs.watch(desktopPath, (eventType, filename) => {
    if (eventType !== "rename" || !isScreenshotFile(filename)) {
      return;
    }

    setTimeout(() => {
      processNewScreenshot(filename);
    }, 500);
  });
};

// Monitor Clipboard
let lastText = "";
let lastImageHash = "";

setInterval(() => {
  const text = clipboard.readText();
  if (text && text !== lastText) {
    saveText(text);
    enforceLimit();
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
      enforceLimit();
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

  // Start monitoring screenshots
  initializeScreenshots();
  watchScreenshots();
  console.log("Monitoring Desktop for screenshots...");
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
