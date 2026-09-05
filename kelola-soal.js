import { supabase } from './supabase.js';

const teacherName =
  document.getElementById('teacherName');

const logoutButton =
  document.getElementById('logoutButton');

const assessmentTitle =
  document.getElementById('assessmentTitle');

const assessmentInfo =
  document.getElementById('assessmentInfo');

const kembaliButton =
  document.getElementById('kembaliButton');

const tambahSoalButton =
  document.getElementById('tambahSoalButton');

const soalTable =
  document.getElementById('soalTable');

const params =
  new URLSearchParams(window.location.search);

const assessmentId =
  params.get('id');


// ===============================
// CEK LOGIN
// ===============================

const {
  data: { user },
  error: userError
} = await supabase.auth.getUser();

if (userError || !user) {
  window.location.href = 'index.html';
}


// ===============================
// CEK ID ASESMEN
// ===============================

if (!assessmentId) {

  alert('ID asesmen tidak ditemukan.');

  window.location.href =
    'asesmen.html';
}


// ===============================
// DATA GURU
// ===============================

if (user) {

  const {
    data: profile,
    error: profileError
  } = await supabase
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

  const {
    data,
    error
  } = await supabase
    .from('assessments')
    .select(`
      id,
      title,
      type,
      duration_minutes,
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


  assessmentTitle.textContent =
    data.title;


  const subjectName =
    data.subjects?.name || '-';


  const className =
    data.classes?.name || '-';


  const typeName =
    getTypeName(data.type);


  assessmentInfo.textContent =
    `${typeName} • ${subjectName} • Kelas ${className}`;

}


// ===============================
// NAMA JENIS ASESMEN
// ===============================

function getTypeName(type) {

  const types = {

    daily:
      'Penilaian Harian',

    midterm:
      'PTS',

    final:
      'PAS',

    other:
      'Lainnya'

  };

  return types[type] || type;

}


// ===============================
// TOMBOL KEMBALI
// ===============================

kembaliButton.addEventListener(
  'click',
  () => {

    window.location.href =
      `kelola-asesmen.html?id=${assessmentId}`;

  }
);


// ===============================
// TOMBOL TAMBAH SOAL
// ===============================

tambahSoalButton.addEventListener(
  'click',
  () => {

    alert(
      'Fitur tambah soal akan kita buat pada langkah berikutnya.'
    );

  }
);


// ===============================
// LOGOUT
// ===============================

logoutButton.addEventListener(
  'click',
  async () => {

    const {
      error
    } = await supabase.auth.signOut();


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


// ===============================
// JALANKAN
// ===============================

if (assessmentId && user) {

  await loadAssessment();

}
