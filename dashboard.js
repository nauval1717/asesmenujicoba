import { supabase } from './supabase.js';

const logoutButton = document.getElementById('logoutButton');
const teacherName = document.getElementById('teacherName');


// CEK LOGIN
const { data: { user }, error: userError } =
  await supabase.auth.getUser();

if (userError) {
  teacherName.textContent = 'Error login';
  console.error('USER ERROR:', userError);
}

if (!user) {
  window.location.href = 'index.html';
}


// AMBIL DATA PROFIL
if (user) {

  teacherName.textContent = 'Memuat...';

  console.log('USER ID:', user.id);

  const { data: profile, error: profileError } =
    await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', user.id)
      .single();

  console.log('PROFILE:', profile);
  console.log('PROFILE ERROR:', profileError);

  if (profileError) {

    teacherName.textContent = 'Gagal membaca profil';

    alert(
      'Gagal membaca profil guru:\n' +
      profileError.message
    );

  } else if (profile) {

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
