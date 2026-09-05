import { supabase } from './supabase.js';

const params = new URLSearchParams(window.location.search);
const assessmentId = params.get('id');

// Elemen halaman
const assessmentTitle = document.getElementById('assessmentTitle');
const assessmentType = document.getElementById('assessmentType');
const assessmentSubject = document.getElementById('assessmentSubject');
const assessmentClass = document.getElementById('assessmentClass');
const assessmentDuration = document.getElementById('assessmentDuration');
const assessmentStatus = document.getElementById('assessmentStatus');
const questionCount = document.getElementById('questionCount');
const teacherName = document.getElementById('teacherName');

const kelolaSoalButton = document.getElementById('kelolaSoalButton');
const pengaturanButton = document.getElementById('pengaturanButton');
const kembaliButton = document.getElementById('kembaliButton');
const aktifkanButton = document.getElementById('aktifkanButton');


// ===============================
// CEK LOGIN
// ===============================

async function checkLogin() {
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    window.location.href = 'index.html';
    return null;
  }

  return user;
}


// ===============================
// FORMAT DATA
// ===============================

function getTypeName(type) {
  const types = {
    daily: 'Ulangan Harian',
    midterm: 'PTS / Ujian Tengah Semester',
    final: 'PAS / Ujian Akhir Semester',
    practice: 'Latihan',
    other: 'Lainnya'
  };

  return types[type] || type || '-';
}


function getStatusName(status) {
  const statuses = {
    draft: 'Draft',
    ready: 'Siap',
    active: 'Aktif',
    completed: 'Selesai'
  };

  return statuses[status] || status || '-';
}


function getDurationText(minutes) {
  if (!minutes) {
    return 'Tidak dibatasi';
  }

  return `${minutes} menit`;
}


// ===============================
// LOAD PROFIL GURU
// ===============================

async function loadTeacherProfile(user) {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Gagal mengambil profil guru:', error);

    teacherName.textContent = 'Guru';
    return;
  }

  teacherName.textContent = profile?.full_name || 'Guru';
}


// ===============================
// LOAD NAMA MATA PELAJARAN
// ===============================

async function loadSubjectName(subjectId) {
  if (!subjectId) {
    return '-';
  }

  const { data, error } = await supabase
    .from('subjects')
    .select('name')
    .eq('id', subjectId)
    .maybeSingle();

  if (error) {
    console.error('Gagal mengambil mata pelajaran:', error);
    return '-';
  }

  return data?.name || '-';
}


// ===============================
// LOAD NAMA KELAS
// ===============================

async function loadClassName(classId) {
  if (!classId) {
    return '-';
  }

  const { data, error } = await supabase
    .from('classes')
    .select('name')
    .eq('id', classId)
    .maybeSingle();

  if (error) {
    console.error('Gagal mengambil kelas:', error);
    return '-';
  }

  return data?.name || '-';
}


// ===============================
// LOAD ASESMEN
// ===============================

async function loadAssessment(user) {

  assessmentTitle.textContent = 'Memuat asesmen...';
  assessmentSubject.textContent = '-';
  assessmentClass.textContent = '-';
  assessmentDuration.textContent = '-';
  assessmentStatus.textContent = 'Memuat...';

  const { data: assessment, error } = await supabase
    .from('assessments')
    .select(`
      id,
      teacher_id,
      title,
      type,
      description,
      duration_minutes,
      status,
      subject_id,
      class_id
    `)
    .eq('id', assessmentId)
    .eq('teacher_id', user.id)
    .maybeSingle();

  if (error) {
    console.error('Gagal mengambil asesmen:', error);

    assessmentTitle.textContent = 'Gagal memuat asesmen';
    assessmentStatus.textContent = '-';

    alert(
      'Gagal mengambil data asesmen.\n\n' +
      error.message
    );

    return false;
  }

  if (!assessment) {
    console.error('Asesmen tidak ditemukan.');

    assessmentTitle.textContent = 'Asesmen tidak ditemukan';
    assessmentStatus.textContent = '-';

    alert(
      'Asesmen tidak ditemukan atau Anda tidak memiliki akses.'
    );

    return false;
  }

  console.log('Data asesmen berhasil:', assessment);

  // Tampilkan data utama
  assessmentTitle.textContent =
    assessment.title || 'Tanpa Judul';

  assessmentType.textContent =
    getTypeName(assessment.type);

  assessmentDuration.textContent =
    getDurationText(assessment.duration_minutes);

  assessmentStatus.textContent =
    getStatusName(assessment.status);


  // Ambil mata pelajaran dan kelas secara terpisah
  const subjectName = await loadSubjectName(
    assessment.subject_id
  );

  const className = await loadClassName(
    assessment.class_id
  );

  assessmentSubject.textContent = subjectName;
  assessmentClass.textContent = className;

  return true;
}


// ===============================
// LOAD JUMLAH SOAL
// ===============================

async function loadQuestionCount() {

  questionCount.textContent = '...';

  const { count, error } = await supabase
    .from('assessment_questions')
    .select('id', {
      count: 'exact',
      head: true
    })
    .eq('assessment_id', assessmentId);

  if (error) {
    console.error(
      'Gagal menghitung jumlah soal:',
      error
    );

    questionCount.textContent = '0';
    return;
  }

  questionCount.textContent = count ?? 0;
}


// ===============================
// TOMBOL KELOLA SOAL
// ===============================

kelolaSoalButton.addEventListener('click', () => {
  window.location.href =
    `kelola-soal.html?id=${assessmentId}`;
});


// ===============================
// TOMBOL PENGATURAN
// ===============================

pengaturanButton.addEventListener('click', () => {
  window.location.href =
    `pengaturan-asesmen.html?id=${assessmentId}`;
});


// ===============================
// TOMBOL KEMBALI
// ===============================

kembaliButton.addEventListener('click', () => {
  window.location.href = 'asesmen.html';
});


// ===============================
// TOMBOL AKTIFKAN
// ===============================

aktifkanButton.addEventListener('click', () => {
  alert(
    'Fitur aktivasi asesmen akan kita buat pada tahap berikutnya.'
  );
});


// ===============================
// INIT
// ===============================

async function init() {

  // Pastikan ID asesmen ada
  if (!assessmentId) {
    alert('ID asesmen tidak ditemukan.');

    window.location.href = 'asesmen.html';

    return;
  }

  console.log(
    'ID asesmen:',
    assessmentId
  );

  // Cek login
  const user = await checkLogin();

  if (!user) {
    return;
  }

  console.log(
    'Guru login:',
    user.id
  );

  // Load profil
  await loadTeacherProfile(user);

  // Load asesmen
  const assessmentLoaded =
    await loadAssessment(user);

  // Kalau asesmen gagal dimuat,
  // jangan lanjutkan proses lain
  if (!assessmentLoaded) {
    return;
  }

  // Load jumlah soal
  await loadQuestionCount();
}

init();
