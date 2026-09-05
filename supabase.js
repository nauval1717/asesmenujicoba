import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabaseUrl = 'https://zwiygbrztjxyixgarghe.supabase.co/rest/v1/';
const supabaseKey = 'sb_publishable_iQu9fh12URcdy7o7U7nTvA_SX2rt7q-';

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);

const loginForm = document.getElementById('loginForm');
const message = document.getElementById('message');
const loginButton = document.getElementById('loginButton');

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  loginButton.disabled = true;
  loginButton.textContent = 'Memproses...';
  message.textContent = '';

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password
  });

  if (error) {
    message.textContent = 'Login gagal: ' + error.message;
    loginButton.disabled = false;
    loginButton.textContent = 'Masuk';
    return;
  }

  message.textContent = 'Login berhasil!';

  console.log('User berhasil login:', data.user);
});