import { supabase } from './supabase.js';

const params = new URLSearchParams(window.location.search);
const assessmentId = params.get('id');

const assessmentTitle =
  document.getElementById('assessmentTitle');

const assessmentInfo =
  document.getElementById('assessmentInfo');

const teacherName =
  document.getElementById('teacherName');

const shuffleQuestions =
  document.getElementById('shuffleQuestions');

const shuffleOptions =
  document.getElementById('shuffleOptions');

const keepStimulusOrder =
  document.getElementById('keepStimulusOrder');

const simpanButton =
  document.getElementById('simpanButton');

const statusMessage =
  document.getElementById('statusMessage');

const kembaliButton =
  document.getElementById('kembaliButton');

const logoutButton =
  document.getElementById('logoutButton');


// ========================================
// CEK LOGIN
// ========================================

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


// ========================================
// TAMPILKAN PESAN
// ========================================

function showStatus(message, type) {

  statusMessage.textContent = message;

  statusMessage.className =
    `status-message ${type}`;

}


// ========================================
// FORMAT JENIS ASESMEN
// ========================================

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


// ========================================
// FORMAT DURASI
// ========================================

function getDurationText(minutes) {

  if (!minutes) {
    return 'Tidak dibatasi';
  }

  return `${minutes} menit`;

}


// ========================================
// LOAD DATA ASESMEN
// ========================================

async function loadAssessment(user) {

  const {
    data: assessment,
    error
  } = await supabase
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
      class_id,
      subjects (
        name
      ),
      classes (
        name
      ),
      shuffle_questions,
      shuffle_options,
      keep_stimulus_order
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
      'Asesmen tidak ditemukan atau Anda tidak memiliki akses.'
    );

    window.location.href =
      'asesmen.html';

    return;

  }


  // ========================================
  // INFORMASI ASESMEN
  // ========================================

  assessmentTitle.textContent =
    assessment.title;

  const subjectName =
    assessment.subjects?.name || '-';

  const className =
    assessment.classes?.name || '-';

  assessmentInfo.textContent =
    `${getTypeName(assessment.type)} • ` +
    `${subjectName} • ` +
    `${className} • ` +
    `${getDurationText(assessment.duration_minutes)}`;


  // ========================================
  // PENGATURAN
  // ========================================

  shuffleQuestions.checked =
    assessment.shuffle_questions ?? true;

  shuffleOptions.checked =
    assessment.shuffle_options ?? true;

  keepStimulusOrder.checked =
    assessment.keep_stimulus_order ?? true;

}


// ========================================
// LOAD PROFIL GURU
// ========================================

async function loadTeacherProfile(user) {

  const {
    data: profile,
    error
  } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  if (error) {

    console.error(
      'Gagal mengambil profil guru:',
      error
    );

    return;

  }

  teacherName.textContent =
    profile?.full_name || 'Guru';

}


// ========================================
// SIMPAN PENGATURAN
// ========================================

async function saveSettings(user) {

  simpanButton.disabled = true;

  simpanButton.textContent =
    '⏳ Menyimpan...';

  statusMessage.className =
    'status-message';

  const settings = {

    shuffle_questions:
      shuffleQuestions.checked,

    shuffle_options:
      shuffleOptions.checked,

    keep_stimulus_order:
      keepStimulusOrder.checked

  };


  const {
    error
  } = await supabase
    .from('assessments')
    .update(settings)
    .eq('id', assessmentId)
    .eq('teacher_id', user.id);


  if (error) {

    console.error(
      'Gagal menyimpan pengaturan:',
      error
    );

    showStatus(
      `Gagal menyimpan pengaturan: ${error.message}`,
      'error'
    );

    simpanButton.disabled = false;

    simpanButton.textContent =
      '💾 Simpan Pengaturan';

    return;

  }


  showStatus(
    '✅ Pengaturan berhasil disimpan.',
    'success'
  );

  simpanButton.disabled = false;

  simpanButton.textContent =
    '💾 Simpan Pengaturan';

}


// ========================================
// KEMBALI
// ========================================

kembaliButton.addEventListener(
  'click',
  () => {

    window.location.href =
      `kelola-asesmen.html?id=${assessmentId}`;

  }
);


// ========================================
// LOGOUT
// ========================================

logoutButton.addEventListener(
  'click',
  async () => {

    await supabase.auth.signOut();

    window.location.href =
      'index.html';

  }
);


// ========================================
// MULAI
// ========================================

async function init() {

  if (!assessmentId) {

    alert(
      'ID asesmen tidak ditemukan.'
    );

    window.location.href =
      'asesmen.html';

    return;

  }


  const user =
    await checkLogin();

  if (!user) {
    return;
  }


  await loadTeacherProfile(user);

  await loadAssessment(user);


  simpanButton.addEventListener(
    'click',
    () => saveSettings(user)
  );

}


init();
