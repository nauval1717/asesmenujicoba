// ===============================
// DASHBOARD.JS
// ===============================

// Pastikan guru sudah login
async function checkLogin() {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    window.location.href = "index.html";
    return null;
  }

  return data.user;
}


// ===============================
// LOAD PROFIL GURU
// ===============================
async function loadTeacherProfile(user) {
  const teacherNameElement = document.getElementById("teacherName");

  if (!teacherNameElement) return;

  const { data, error } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Gagal mengambil profil guru:", error);
    teacherNameElement.textContent = "Guru";
    return;
  }

  teacherNameElement.textContent =
    data?.full_name || "Guru";
}


// ===============================
// LOGOUT DENGAN KONFIRMASI
// ===============================
function setupLogout() {
  const logoutButton = document.getElementById("logoutButton");

  if (!logoutButton) return;

  logoutButton.addEventListener("click", async () => {

    const yakin = confirm(
      "Apakah Anda yakin ingin keluar?"
    );

    // Jika pilih Cancel
    if (!yakin) {
      return;
    }

    // Jika pilih OK
    logoutButton.disabled = true;
    logoutButton.textContent = "Keluar...";

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

    // Kembali ke halaman login
    window.location.href = "index.html";
  });
}


// ===============================
// JALANKAN DASHBOARD
// ===============================
async function initDashboard() {

  const user = await checkLogin();

  if (!user) return;

  await loadTeacherProfile(user);

  setupLogout();
}


// Jalankan setelah halaman selesai dimuat
document.addEventListener("DOMContentLoaded", initDashboard);
