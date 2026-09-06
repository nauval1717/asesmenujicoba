import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabaseUrl = 'https://zwiygbrztjxyixgarghe.supabase.co';
const supabaseKey = 'sb_publishable_iQu9fh12URcdy7o7U7nTvA_SX2rt7q-';

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);


// ===============================
// POP-UP KONFIRMASI GLOBAL & PROTEKSI SIGNOUT
// ===============================

// Simpan fungsi signOut asli bawaan Supabase
const originalSignOut = supabase.auth.signOut.bind(supabase.auth);
let isLogoutConfirmed = false;

// Fungsi untuk menampilkan pop-up konfirmasi
function showConfirmPopup() {
  return new Promise((resolve) => {
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
        resolve(false);
      });

      // Klik latar belakang gelap di luar kotak
      modal.addEventListener('click', (evt) => {
        if (evt.target === modal) {
          modal.style.display = 'none';
          resolve(false);
        }
      });

      // Tombol Ya, Keluar
      document.getElementById('confirmGlobalLogout').addEventListener('click', () => {
        const confirmBtn = document.getElementById('confirmGlobalLogout');
        confirmBtn.disabled = true;
        confirmBtn.textContent = '🚪 Keluar...';
        resolve(true);
      });
    } else {
      modal.style.display = 'flex';
      const confirmBtn = document.getElementById('confirmGlobalLogout');
      confirmBtn.disabled = false;
      confirmBtn.textContent = 'Ya, Keluar';

      // Pasang handler satu kali untuk klik ulang
      document.getElementById('cancelGlobalLogout').onclick = () => {
        modal.style.display = 'none';
        resolve(false);
      };
      confirmBtn.onclick = () => {
        confirmBtn.disabled = true;
        confirmBtn.textContent = '🚪 Keluar...';
        resolve(true);
      };
    }
  });
}

// Cegat fungsi signOut Supabase agar WAJIB menunggu konfirmasi pop-up
supabase.auth.signOut = async function (...args) {
  if (isLogoutConfirmed) {
    return await originalSignOut(...args);
  }

  const setuju = await showConfirmPopup();

  if (setuju) {
    isLogoutConfirmed = true;
    const result = await originalSignOut(...args);
    window.location.href = 'index.html';
    return result;
  } else {
    // Kembalikan error buatan agar kode lama yang memicu redirect terhenti
    return { error: new Error('Logout dibatalkan oleh pengguna.') };
  }
};


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
