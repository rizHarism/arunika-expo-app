import { openDB } from "./db.js";
import { syncData } from "./sync.js";

document.addEventListener("DOMContentLoaded", async () => {
  const db = await openDB();
  const form = document.getElementById("guestForm");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    data.timestamp = new Date().toISOString();
    data.synced = false;

    const tx = db.transaction("guests", "readwrite");
    tx.objectStore("guests").add(data);

    tx.oncomplete = () => {
      alert("Data tersimpan offline ✅");
      form.reset();
      if (navigator.onLine) syncData();
    };
  });

  window.addEventListener("online", syncData);
});
