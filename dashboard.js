// ===============================
// DASHBOARD.JS
// ===============================

import { supabase } from "./supabase.js";


// ===============================
// LOGOUT
// ===============================

function setupLogout() {
  const logoutButton = document.getElementById("logoutButton");

  if (!logoutButton) {
    console.error("Tombol logout tidak ditemukan.");
    return;
  }

  logoutButton.addEventListener("click", async () => {

    // Konfirmasi sebelum logout
    const yakin = window.confirm(
      "Apakah Anda yakin ingin keluar?"
    );

    // Jika pilih Batal / Tidak
    if (!yakin) {
      return;
    }

    // Ubah tombol sementara
    logoutButton.disabled = true;
    logoutButton.textContent = "🚪 Keluar...";

    // Logout dari Supabase
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Gagal logout:", error);

      alert(
        "Terjadi kesalahan saat keluar. Silakan coba lagi."
      );

      logoutButton.disabled = false;
      logoutButton.textContent = "🚪 Keluar";

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
