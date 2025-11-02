import { openDB } from "./db.js";
import { syncData } from "./sync.js";

// Detect environment
const isCordova = typeof window.cordova !== "undefined";

function initApp() {
  (async () => {
    const db = await openDB();
    const form = document.getElementById("guestForm");

    // ✅ TOAST CONTAINER
    const toastContainer = document.createElement("div");
    toastContainer.id = "toast-wrapper";
    toastContainer.className =
      "fixed top-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center space-y-2";
    document.body.appendChild(toastContainer);

    function showToast(message, color = "bg-blue-600") {
      const toast = document.createElement("div");
      toast.textContent = message;
      toast.className = `${color} text-white px-6 py-3 rounded-lg shadow-lg text-center opacity-0 transition duration-300`;
      toastContainer.appendChild(toast);

      requestAnimationFrame(() => toast.classList.add("opacity-100"));

      setTimeout(() => {
        toast.classList.remove("opacity-100");
        setTimeout(() => toast.remove(), 300);
      }, 2500);
    }

    // ✅ Expose to global
    window.showToast = showToast;

    // ✅ LOADING INSIDE FORM
    function showLoading(show = true) {
      let loader = document.getElementById("form-loader");
      if (!loader) {
        loader = document.createElement("div");
        loader.id = "form-loader";
        loader.className =
          "absolute inset-0 bg-white/60 flex items-center justify-center rounded-3xl backdrop-blur-sm";
        loader.innerHTML = `<span class="text-lg font-semibold text-gray-800">💾 Menyimpan...</span>`;
        form.parentElement.appendChild(loader);
      }
      loader.style.display = show ? "flex" : "none";
    }

    // ✅ SAVE + SYNC
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      showLoading(true);

      const data = Object.fromEntries(new FormData(form).entries());
      data.id = crypto.randomUUID();
      data.timestamp = new Date().toISOString();
      data.synced = false;

      try {
        const tx = db.transaction("guests", "readwrite");
        await tx.objectStore("guests").add(data);
        await tx.done;

        form.reset();
        showLoading(false);
        showToast("📦 Data tersimpan", "bg-green-600");

        if (navigator.onLine) {
          showToast("🔄 Sinkronisasi…", "bg-yellow-600");
          await syncData();
          showToast("✅ Data tersinkron", "bg-green-600");
        } else {
          showToast("📴 Offline — data disimpan lokal", "bg-gray-700");
        }
      } catch (err) {
        showLoading(false);
        console.error(err);
        showToast("⚠️ Gagal menyimpan", "bg-red-600");
      }
    });

    // ✅ NETWORK EVENTS (MUST be outside inner deviceready)
    function registerNetworkEvents() {
      window.addEventListener("online", async () => {
        console.log("✅ ONLINE event detected");
        showToast("🌐 Online — sinkronisasi…", "bg-yellow-600");
        await syncData();
        showToast("✅ Semua data sinkron", "bg-green-600");
      });

      window.addEventListener("offline", () => {
        console.log("❌ OFFLINE event detected");
        showToast("📴 Offline — data disimpan lokal", "bg-gray-700");
      });
    }
    window.registerNetworkEvents = registerNetworkEvents;

    // ✅ AUTO SYNC every 30s
    setInterval(async () => {
      if (navigator.onLine) await syncData();
    }, 30000);

    registerNetworkEvents(); // ✅ Attach here once
    if (navigator.onLine) {
      await syncData();
    }
  })();
}

// ✅ CORDOVA FIRST — Browser fallback
if (isCordova) {
  document.addEventListener("deviceready", initApp);
} else {
  document.addEventListener("DOMContentLoaded", initApp);
}
