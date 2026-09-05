// ===============================
// DASHBOARD.JS
// ===============================

import { supabase } from "./supabase.js";


// ===============================
// SAAT HALAMAN SUDAH SIAP
// ===============================
document.addEventListener("DOMContentLoaded", async () => {

  console.log("Dashboard JS berjalan.");

  // ===============================
  // CEK USER
  // ===============================
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  console.log("USER:", user);
  console.log("USER ERROR:", userError);

  // Jangan langsung dilempar ke login.
  // Kalau tidak ada user, tampilkan pesan di console.
  if (!user) {

    console.error("User tidak ditemukan.");

    return;
  }


  // ===============================
  // TAMPILKAN NAMA GURU
  // ===============================
  const teacherName =
    document.getElementById("teacherName");

  if (teacherName) {

    const {
      data: profile,
      error: profileError
    } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {

      console.error(
        "Gagal mengambil profil:",
        profileError
      );

    } else if (profile) {

      teacherName.textContent =
        profile.full_name || "Guru";
    }
  }


  // ===============================
  // LOGOUT
  // ===============================
  const logoutButton =
    document.getElementById("logoutButton");

  if (logoutButton) {

    logoutButton.addEventListener(
      "click",
      async () => {

        const yakin = window.confirm(
          "Apakah Anda yakin ingin keluar?"
        );

        if (!yakin) {
          return;
        }

        logoutButton.disabled = true;
        logoutButton.textContent =
          "🚪 Keluar...";

        const { error } =
          await supabase.auth.signOut();

        if (error) {

          console.error(
            "Gagal logout:",
            error
          );

          alert(
            "Gagal keluar: " +
            error.message
          );

          logoutButton.disabled = false;
          logoutButton.textContent =
            "🚪 Keluar";

          return;
        }

        window.location.href = "index.html";
      }
    );
  }

});
