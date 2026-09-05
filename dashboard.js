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

  logoutButton.addEventListener("click", async function () {

    const yakin = window.confirm(
      "Apakah Anda yakin ingin keluar?"
    );

    if (!yakin) {
      return;
    }

    logoutButton.disabled = true;
    logoutButton.textContent = "🚪 Keluar...";

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

    window.location.href = "index.html";
  });
}


// ===============================
// CEK LOGIN
// ===============================
async function checkLogin() {

  const { data, error } =
    await supabase.auth.getUser();

  if (error) {

    console.error(
      "Gagal memeriksa login:",
      error
    );

    // JANGAN otomatis keluar
    return null;
  }

  if (!data.user) {

    console.warn("Belum ada user yang login.");

    // JANGAN otomatis keluar
    return null;
  }

  return data.user;
}


// ===============================
// LOAD PROFIL GURU
// ===============================
async function loadTeacherProfile(user) {

  const teacherNameElement =
    document.getElementById("teacherName");

  if (!teacherNameElement || !user) {
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
      "Gagal mengambil profil guru:",
      error
    );

    teacherNameElement.textContent = "Guru";

    return;
  }

  teacherNameElement.textContent =
    data?.full_name || "Guru";
}


// ===============================
// INISIALISASI
// ===============================
async function initDashboard() {

  // Pasang logout setelah halaman siap
  setupLogout();

  // Cek login
  const user = await checkLogin();

  if (!user) {
    console.warn(
      "Dashboard dibuka tanpa user aktif."
    );
    return;
  }

  // Tampilkan nama guru
  await loadTeacherProfile(user);
}


// ===============================
// JALANKAN SETELAH DOM SIAP
// ===============================
if (document.readyState === "loading") {

  document.addEventListener(
    "DOMContentLoaded",
    initDashboard
  );

} else {

  initDashboard();

}
