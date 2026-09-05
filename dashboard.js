// ===============================
// DASHBOARD.JS
// ===============================


// ===============================
// LOGOUT
// Dipasang langsung saat halaman dimuat
// ===============================
function setupLogout() {
  const logoutButton = document.getElementById("logoutButton");

  if (!logoutButton) {
    console.error("Tombol logout tidak ditemukan.");
    return;
  }

  logoutButton.addEventListener("click", async function (event) {
    event.preventDefault();

    const yakin = confirm("Apakah Anda yakin ingin keluar?");

    if (!yakin) {
      return;
    }

    logoutButton.disabled = true;
    logoutButton.textContent = "🚪 Keluar...";

    try {
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

    } catch (error) {
      console.error("Kesalahan saat logout:", error);

      alert(
        "Terjadi kesalahan saat keluar. Silakan coba lagi."
      );

      logoutButton.disabled = false;
      logoutButton.textContent = "🚪 Keluar";
    }
  });
}


// ===============================
// CEK LOGIN
// ===============================
async function checkLogin() {
  try {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      window.location.href = "index.html";
      return null;
    }

    return data.user;

  } catch (error) {
    console.error("Gagal memeriksa login:", error);

    window.location.href = "index.html";
    return null;
  }
}


// ===============================
// LOAD PROFIL GURU
// ===============================
async function loadTeacherProfile(user) {

  const teacherNameElement =
    document.getElementById("teacherName");

  if (!teacherNameElement) {
    return;
  }

  try {

    const { data, error } = await supabase
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

  } catch (error) {

    console.error(
      "Kesalahan mengambil profil:",
      error
    );

    teacherNameElement.textContent = "Guru";
  }
}


// ===============================
// INISIALISASI DASHBOARD
// ===============================
async function initDashboard() {

  const user = await checkLogin();

  if (!user) {
    return;
  }

  await loadTeacherProfile(user);
}


// ===============================
// PASANG LOGOUT SECEPATNYA
// ===============================
setupLogout();


// ===============================
// JALANKAN DASHBOARD
// ===============================
if (document.readyState === "loading") {

  document.addEventListener(
    "DOMContentLoaded",
    initDashboard
  );

} else {

  initDashboard();

}
