// main.js
const form = document.getElementById("guestForm");
const statusMsg = document.getElementById("statusMsg");

// Ganti URL ini dengan Web App URL dari Google Apps Script kamu
const scriptURL =
  "https://script.google.com/macros/s/AKfycbxxxxxxxxxxxxxxx/exec";

form.addEventListener("submit", (e) => {
  e.preventDefault();
  statusMsg.textContent = "Mengirim data...";

  fetch(scriptURL, { method: "POST", body: new FormData(form) })
    .then((response) => {
      if (response.ok) {
        statusMsg.textContent = "✅ Terima kasih! Data berhasil dikirim.";
        form.reset();
      } else {
        throw new Error("Gagal mengirim");
      }
    })
    .catch((error) => {
      statusMsg.textContent = "❌ Terjadi kesalahan. Coba lagi.";
      console.error(error);
    });
});
