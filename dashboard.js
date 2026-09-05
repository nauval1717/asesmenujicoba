import { supabase } from './supabase.js';

const logoutButton = document.getElementById('logoutButton');

logoutButton.addEventListener('click', async () => {

  const { error } = await supabase.auth.signOut();

  if (error) {
    alert('Gagal keluar: ' + error.message);
    return;
  }

  window.location.href = 'index.html';

});
