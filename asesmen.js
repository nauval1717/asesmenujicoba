import { supabase } from './supabase.js';

const teacherName = document.getElementById('teacherName');
const logoutButton = document.getElementById('logoutButton');
const buatAsesmenButton = document.getElementById('buatAsesmenButton');


// ===============================
// CEK LOGIN
// ===============================

const { data: { user }, error: userError } =
  await supabase.auth.getUser();

if (userError || !user) {
  window.location.href = 'index.html';
}


// ===============================
// AMBIL PROFIL GURU
// ===============================

if (user) {

  teacherName.textContent = 'Memuat...';

  const { data: profile, error: profileError } =
    await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', user.id)
      .single();

  if (profileError) {

    teacherName.textContent = 'Guru';
    console.error('Gagal mengambil profil:', profileError);

  } else if (profile) {

    teacherName.textContent = profile.full_name;

  }

}


// ===============================
// TOMBOL BUAT ASESMEN
// ===============================

buatAsesmenButton.addEventListener('click', () => {

 window.location.href = 'buat-asesmen.html';

});


// ===============================
// LOGOUT
// ===============================

logoutButton.addEventListener('click', async () => {

  const { error } = await supabase.auth.signOut();

  if (error) {

    alert('Gagal keluar: ' + error.message);
    return;

  }

  window.location.href = 'index.html';

});
