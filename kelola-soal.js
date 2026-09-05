import { supabase } from './supabase.js';


// ===============================
// ELEMENT HALAMAN
// ===============================

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


// ===============================
// AMBIL ID ASESMEN DARI URL
// ===============================

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

  window.location.href =
    'index.html';

}


// ===============================
// CEK ID ASESMEN
// ===============================

if (!assessmentId) {

  alert(
    'ID asesmen tidak ditemukan.'
  );

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
// AMBIL DAFTAR SOAL
// ===============================

async function loadQuestions() {

  const {
    data,
    error
  } = await supabase
    .from('assessment_questions')
    .select(`
      id,
      question_number,
      points,
      questions (
        id,
        question_text,
        question_type
      )
    `)
    .eq('assessment_id', assessmentId)
    .order('question_number', {
      ascending: true
    });


  if (error) {

    console.error(
      'Gagal mengambil daftar soal:',
      error
    );

    soalTable.innerHTML = `
      <tr>
        <td
          colspan="5"
          class="empty-table"
        >
          Gagal memuat soal.
        </td>
      </tr>
    `;

    return;

  }


  // ===============================
  // JIKA BELUM ADA SOAL
  // ===============================

  if (!data || data.length === 0) {

    soalTable.innerHTML = `
      <tr>
        <td
          colspan="5"
          class="empty-table"
        >
          Belum ada soal.
        </td>
      </tr>
    `;

    return;

  }


  // ===============================
  // TAMPILKAN SOAL
  // ===============================

  soalTable.innerHTML = '';


  data.forEach((item, index) => {

    const question =
      item.questions;


    const questionText =
      question?.question_text || '-';


    const questionType =
      question?.question_type ===
      'multiple_choice'
        ? 'Pilihan Ganda'
        : question?.question_type || '-';


    const points =
      item.points ?? 0;


    const row =
      document.createElement('tr');


    row.innerHTML = `
      <td>
        ${item.question_number || index + 1}
      </td>

      <td>
        ${questionText}
      </td>

      <td>
        ${questionType}
      </td>

      <td>
        ${points}
      </td>

      <td>

        <button
          class="secondary-button"
          type="button"
          onclick="alert('Fitur edit soal akan dibuat setelah fitur tambah soal selesai.')"
        >
          Edit
        </button>

      </td>
    `;


    soalTable.appendChild(row);

  });

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

    window.location.href =
      `tambah-soal.html?id=${assessmentId}`;

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
// JALANKAN HALAMAN
// ===============================

if (assessmentId && user) {

  await loadAssessment();

  await loadQuestions();

}
