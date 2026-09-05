import { supabase } from './supabase.js';

const teacherName = document.getElementById('teacherName');
const logoutButton = document.getElementById('logoutButton');
const buatAsesmenButton = document.getElementById('buatAsesmenButton');
const asesmenTable = document.getElementById('asesmenTable');


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

  const { data: profile, error: profileError } =
    await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

  if (!profileError && profile) {
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
// AMBIL DAFTAR ASESMEN
// ===============================

async function loadAssessments() {

  const { data, error } = await supabase
    .from('assessments')
    .select(`
      id,
      title,
      type,
      status,
      subjects(name),
      classes(name)
    `)
    .eq('teacher_id', user.id)
    .order('created_at', { ascending: false });


  if (error) {

    console.error('Gagal mengambil asesmen:', error);

    asesmenTable.innerHTML = `
      <tr>
        <td colspan="6" class="empty-table">
          Gagal mengambil data asesmen.
        </td>
      </tr>
    `;

    return;
  }


  if (!data || data.length === 0) {

    asesmenTable.innerHTML = `
      <tr>
        <td colspan="6" class="empty-table">
          Belum ada asesmen.
        </td>
      </tr>
    `;

    return;
  }


  asesmenTable.innerHTML = '';


  data.forEach(assessment => {

    const row = document.createElement('tr');

    row.innerHTML = `
      <td>${assessment.title}</td>

      <td>${getTypeName(assessment.type)}</td>

      <td>${assessment.classes?.name || '-'}</td>

      <td>0</td>

      <td>${getStatusName(assessment.status)}</td>

      <td>
        <button
          class="primary-button"
          onclick="alert('Halaman detail asesmen akan kita buat berikutnya.')"
        >
          Kelola
        </button>
      </td>
    `;

    asesmenTable.appendChild(row);

  });

}


// ===============================
// NAMA JENIS ASESMEN
// ===============================

function getTypeName(type) {

  const types = {

    daily: 'Penilaian Harian',

    midterm: 'PTS',

    final: 'PAS',

    other: 'Lainnya'

  };

  return types[type] || type;

}


// ===============================
// NAMA STATUS
// ===============================

function getStatusName(status) {

  const statuses = {

    draft: 'Draft',

    ready: 'Siap',

    active: 'Aktif',

    completed: 'Selesai'

  };

  return statuses[status] || status;

}


// Jalankan
await loadAssessments();


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
