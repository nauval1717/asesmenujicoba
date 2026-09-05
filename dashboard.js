import { supabase } from './supabase.js';

const logoutButton = document.getElementById('logoutButton');
const teacherName = document.getElementById('teacherName');


// CEK LOGIN
const { data: { user } } = await supabase.auth.getUser();

if (!user) {
  window.location.href = 'index.html';
}


// AMBIL DATA PROFIL GURU
if (user) {

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  if (!error && profile) {
    teacherName.textContent = profile.full_name;
  }

}


// LOGOUT
logoutButton.addEventListener('click', async () => {

  const { error } = await supabase.auth.signOut();

  if (error) {
    alert('Gagal keluar: ' + error.message);
    return;
  }

  window.location.href = 'index.html';

});
