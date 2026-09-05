import { supabase } from './supabase.js';

const teacherName = document.getElementById('teacherName');
const logoutButton = document.getElementById('logoutButton');

const assessmentTitle =
  document.getElementById('assessmentTitle');

const assessmentInfo =
  document.getElementById('assessmentInfo');

const questionCount =
  document.getElementById('questionCount');

const duration =
  document.getElementById('duration');

const assessmentStatus =
  document.getElementById('assessmentStatus');


// ===============================
// AMBIL ID ASESMEN DARI URL
// ===============================

const params = new URLSearchParams(window.location.search);

const assessmentId = params.get('id');


// ===============================
// CEK LOGIN
// ===============================

const { data: { user }, error: userError } =
  await supabase.auth.getUser();

if (userError || !user) {

  window.location.href = 'index.html';

}


// ===============================
// JIKA ID ASESMEN TIDAK ADA
// ===============================

if (!assessmentId) {

  alert('ID asesmen tidak ditemukan.');

  window.location.href = 'asesmen.html';

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

    teacherName.textContent =
      profile.full_name;

  }

}


// ===============================
// AMBIL DATA ASESMEN
// ===============================

async function loadAssessment() {

  const { data, error } =
    await supabase
      .from('assessments')
      .select(`
        id,
        title,
        type,
        description,
        duration_minutes,
        status,
        subjects(name),
        classes(name)
      `)
      .eq('id', assessmentId)
      .eq('teacher_id', user.id)
      .single();


  if (error) {

    console.error(
      'Gagal mengambil asesmen:',
      error
    );

    alert(
      'Data asesmen tidak dapat ditemukan.'
    );

    window.location.href =
      'asesmen.html';

    return;

  }


  // ===============================
  // TAMPILKAN DATA
  // ===============================

  assessmentTitle.textContent =
    data.title;


  const subjectName =
    data.subjects?.name || '-';

  const className =
    data.classes?.name || '-';


  assessmentInfo.textContent =
    `${getTypeName(data.type)} • ${subjectName} • Kelas ${className}`;


  duration.textContent =
    data.duration_minutes
      ? `${data.duration_minutes} menit`
      : '-';


  assessmentStatus.textContent =
    getStatusName(data.status);


  // Untuk sementara jumlah soal 0
  questionCount.textContent = '0';

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
if (assessmentId && user) {

  await loadAssessment();

}
const kelolaSoalButton =
  document.getElementById('kelolaSoalButton');

kelolaSoalButton.addEventListener(
  'click',
  () => {
    window.location.href =
      `kelola-soal.html?id=${assessmentId}`;
  }
);

// ===============================
// LOGOUT
// ===============================

logoutButton.addEventListener(
  'click',
  async () => {

    const { error } =
      await supabase.auth.signOut();

    if (error) {

      alert(
        'Gagal keluar: ' +
        error.message
      );

      return;

    }

    window.location.href =
      'index.html';

  }
);
