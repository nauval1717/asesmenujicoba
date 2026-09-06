import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabaseUrl = 'https://zwiygbrztjxyixgarghe.supabase.co';
const supabaseKey = 'sb_publishable_iQu9fh12URcdy7o7U7nTvA_SX2rt7q-';

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);


// ===============================
// LOGIN
// ===============================

const loginForm = document.getElementById('loginForm');

if (loginForm) {

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

    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 500);

  });

}


// ===============================
// GLOBAL LOGOUT MODAL
// ===============================

function setupGlobalLogoutListener() {
  document.addEventListener('click', async (e) => {
    // Tangkap tombol logout baik lewat id (#logoutButton) atau class (.logout)
    const btn = e.target.closest('#logoutButton, .logout');
    if (!btn) return;

    e.preventDefault();

    // Buat modal jika belum ada di dokumen
    let modal = document.getElementById('globalLogoutModal');
    if (!modal) {
      const modalHtml = `
        <div id="globalLogoutModal" style="display:flex; position:fixed; inset:0; background:rgba(0,0,0,0.5); align-items:center; justify-content:center; z-index:999999; font-family:inherit;">
          <div style="background:#ffffff; padding:24px; border-radius:8px; text-align:center; max-width:320px; width:90%; box-shadow:0 4px 16px rgba(0,0,0,0.25);">
            <h3 style="margin:0 0 10px 0; color:#111; font-size:1.2rem;">Konfirmasi Keluar</h3>
            <p style="margin:0 0 20px 0; color:#555; font-size:0.95rem;">Apakah kamu yakin keluar?</p>
            <div style="display:flex; justify-content:center; gap:12px;">
              <button id="cancelGlobalLogout" type="button" style="padding:8px 16px; border:none; border-radius:4px; background:#e0e0e0; color:#333; cursor:pointer; font-weight:500;">Batal</button>
              <button id="confirmGlobalLogout" type="button" style="padding:8px 16px; border:none; border-radius:4px; background:#d32f2f; color:#ffffff; cursor:pointer; font-weight:500;">Ya, Keluar</button>
            </div>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', modalHtml);
      modal = document.getElementById('globalLogoutModal');

      // Tombol Batal
      document.getElementById('cancelGlobalLogout').addEventListener('click', () => {
        modal.style.display = 'none';
      });

      // Klik latar gelap untuk tutup
      modal.addEventListener('click', (evt) => {
        if (evt.target === modal) modal.style.display = 'none';
      });

      // Tombol Ya, Keluar
      document.getElementById('confirmGlobalLogout').addEventListener('click', async () => {
        const confirmBtn = document.getElementById('confirmGlobalLogout');
        confirmBtn.disabled = true;
        confirmBtn.textContent = '🚪 Keluar...';

        const { error } = await supabase.auth.signOut();

        if (error) {
          alert('Gagal keluar. Silakan coba lagi.');
          confirmBtn.disabled = false;
          confirmBtn.textContent = 'Ya, Keluar';
          return;
        }

        window.location.href = 'index.html';
      });
    } else {
      modal.style.display = 'flex';
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupGlobalLogoutListener);
} else {
  setupGlobalLogoutListener();
}
