import { openDB } from "./db.js";
import { syncData } from "./sync.js";

document.addEventListener("DOMContentLoaded", async () => {
  const db = await openDB();
  const tx = db.transaction("guests", "readonly");
  const store = tx.objectStore("guests");

  const req = store.getAll();
  req.onsuccess = () => {
    const tbody = document.getElementById("guestTable");
    req.result.forEach((tamu, i) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${i + 1}</td>
        <td>${tamu.nama}</td>
        <td>${tamu.gender}</td>
        <td>${tamu.pekerjaan}</td>
        <td>${tamu.alamat}</td>
        <td>${tamu.phone}</td>
        <td>${tamu.email}</td>
        <td>${tamu.synced ? "✅" : "⏳"}</td>
      `;
      tbody.appendChild(row);
    });
  };

  document.getElementById("syncBtn")?.addEventListener("click", syncData);
});
