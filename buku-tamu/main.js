import { openDB } from "./db.js";
import { syncData } from "./sync.js";

document.addEventListener("DOMContentLoaded", async () => {
  const db = await openDB();
  const form = document.getElementById("guestForm");
  const statusMsg = document.getElementById("statusMsg");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Ambil semua data form
    const data = Object.fromEntries(new FormData(form).entries());
    data.id = crypto.randomUUID(); // id unik untuk setiap tamu
    data.timestamp = new Date().toISOString();
    data.synced = false;

    // Simpan ke IndexedDB
    const tx = db.transaction("guests", "readwrite");
    const store = tx.objectStore("guests");
    await store.add(data);

    statusMsg.textContent = "📦 Data tersimpan offline";
    form.reset();

    // Jika online, langsung sync
    if (navigator.onLine) {
      statusMsg.textContent = "🔄 Sinkronisasi data...";
      await syncData();
      statusMsg.textContent = "✅ Data tersinkron ke server";
    }
  });

  await syncData();
  // Jalankan sync otomatis ketika koneksi kembali online
  window.addEventListener("online", async () => {
    statusMsg.textContent = "🌐 Koneksi kembali online, sinkronisasi data...";
    await syncData();
    statusMsg.textContent = "✅ Semua data sudah sinkron";
  });
});
