// ===============================
// DASHBOARD.JS
// ===============================

import { supabase } from "./supabase.js";


// ===============================
// LOGOUT
// ===============================

function setupLogout() {
  const logoutButton = document.getElementById("logoutButton");
  const modal = document.getElementById("logoutModal");
  const cancelBtn = document.getElementById("cancelLogout");
  const confirmBtn = document.getElementById("confirmLogout");

  if (!logoutButton || !modal || !cancelBtn || !confirmBtn) {
    console.error("Tombol logout atau modal tidak ditemukan.");
    return;
  }

  // Tampilkan modal saat tombol logout diklik
  logoutButton.addEventListener("click", () => {
    modal.style.display = "flex";
  });

  // Tutup modal jika tombol Batal diklik
  cancelBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Jalankan logout jika tombol Ya, Keluar diklik
  confirmBtn.addEventListener("click", async () => {

    // Ubah tombol sementara
    confirmBtn.disabled = true;
    confirmBtn.textContent = "🚪 Keluar...";

    // Logout dari Supabase
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Gagal logout:", error);

      alert(
        "Terjadi kesalahan saat keluar. Silakan coba lagi."
      );

      confirmBtn.disabled = false;
      confirmBtn.textContent = "Ya, Keluar";

      return;
    }

    // Berhasil logout
    window.location.href = "index.html";
  });
}


// ===============================
// LOAD NAMA GURU
// ===============================

async function loadTeacherProfile() {
  const teacherNameElement =
    document.getElementById("teacherName");

  if (!teacherNameElement) {
    return;
  }

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error(
      "Gagal mendapatkan user:",
      userError
    );
    return;
  }

  const { data, error } =
    await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();

  if (error) {
    console.error(
      "Gagal mengambil profil:",
      error
    );
    return;
  }

  teacherNameElement.textContent =
    data?.full_name || "Guru";
}


// ===============================
// JALANKAN DASHBOARD
// ===============================

async function initDashboard() {

  // Pasang fungsi tombol Keluar
  setupLogout();

  // Tampilkan nama guru
  await loadTeacherProfile();
}


// ===============================
// TUNGGU HALAMAN SELESAI DIMUAT
// ===============================

if (document.readyState === "loading") {

  document.addEventListener(
    "DOMContentLoaded",
    initDashboard
  );

} else {

  initDashboard();

}
