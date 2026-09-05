import { supabase } from './supabase.js';

const params = new URLSearchParams(window.location.search);
const assessmentId = params.get('id');

const assessmentTitle = document.getElementById('assessmentTitle');
const assessmentInfo = document.getElementById('assessmentInfo');
const teacherName = document.getElementById('teacherName');

// Pengaturan soal
const shuffleQuestions = document.getElementById('shuffleQuestions');
const shuffleOptions = document.getElementById('shuffleOptions');
const keepStimulusOrder = document.getElementById('keepStimulusOrder');

// Pengaturan anti-kecurangan
const antiCheatEnabled = document.getElementById('antiCheatEnabled');
const requireFullscreen = document.getElementById('requireFullscreen');
const detectTabSwitch = document.getElementById('detectTabSwitch');
const detectFocusLoss = document.getElementById('detectFocusLoss');
const maxViolations = document.getElementById('maxViolations');
const autoSubmitOnViolation = document.getElementById('autoSubmitOnViolation');

const simpanButton = document.getElementById('simpanButton');
const statusMessage = document.getElementById('statusMessage');
const kembaliButton = document.getElementById('kembaliButton');
const logoutButton = document.getElementById('logoutButton');

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

function showStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type}`;
}

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

function getDurationText(minutes) {
  if (!minutes) return 'Tidak dibatasi';
  return `${minutes} menit`;
}

async function loadAssessment(user) {
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
      class_id,
      subjects ( name ),
      classes ( name ),
      shuffle_questions,
      shuffle_options,
      keep_stimulus_order,
      anti_cheat_enabled,
      require_fullscreen,
      detect_tab_switch,
      detect_focus_loss,
      max_violations,
      auto_submit_on_violation
    `)
    .eq('id', assessmentId)
    .eq('teacher_id', user.id)
    .single();

  if (error) {
    console.error('Gagal mengambil asesmen:', error);

    alert(
      'Asesmen tidak ditemukan atau Anda tidak memiliki akses.'
    );

    window.location.href = 'asesmen.html';
    return null;
  }

  assessmentTitle.textContent = assessment.title;

  const subjectName = assessment.subjects?.name || '-';
  const className = assessment.classes?.name || '-';

  assessmentInfo.textContent =
    `${getTypeName(assessment.type)} • ` +
    `${subjectName} • ` +
    `${className} • ` +
    `${getDurationText(assessment.duration_minutes)}`;

  // Pengaturan soal
  shuffleQuestions.checked =
    assessment.shuffle_questions ?? true;

  shuffleOptions.checked =
    assessment.shuffle_options ?? true;

  keepStimulusOrder.checked =
    assessment.keep_stimulus_order ?? true;

  // Pengaturan anti-kecurangan
  antiCheatEnabled.checked =
    assessment.anti_cheat_enabled ?? true;

  requireFullscreen.checked =
    assessment.require_fullscreen ?? true;

  detectTabSwitch.checked =
    assessment.detect_tab_switch ?? true;

  detectFocusLoss.checked =
    assessment.detect_focus_loss ?? true;

  maxViolations.value =
    assessment.max_violations ?? 3;

  autoSubmitOnViolation.checked =
    assessment.auto_submit_on_violation ?? true;

  return assessment;
}

async function loadTeacherProfile(user) {
  const { data: profile, error } = await supabase
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

async function saveSettings(user) {
  let violationLimit = Number(maxViolations.value);

  // Validasi batas pelanggaran
  if (!Number.isInteger(violationLimit)) {
    showStatus(
      '❌ Batas pelanggaran harus berupa angka bulat.',
      'error'
    );
    return;
  }

  if (violationLimit < 1 || violationLimit > 20) {
    showStatus(
      '❌ Batas pelanggaran harus antara 1 sampai 20.',
      'error'
    );
    return;
  }

  simpanButton.disabled = true;
  simpanButton.textContent = '⏳ Menyimpan...';
  statusMessage.className = 'status-message';

  const settings = {
    // Pengaturan soal
    shuffle_questions: shuffleQuestions.checked,
    shuffle_options: shuffleOptions.checked,
    keep_stimulus_order: keepStimulusOrder.checked,

    // Pengaturan anti-kecurangan
    anti_cheat_enabled: antiCheatEnabled.checked,
    require_fullscreen: requireFullscreen.checked,
    detect_tab_switch: detectTabSwitch.checked,
    detect_focus_loss: detectFocusLoss.checked,
    max_violations: violationLimit,
    auto_submit_on_violation:
      autoSubmitOnViolation.checked
  };

  const { error } = await supabase
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
      `❌ Gagal menyimpan pengaturan: ${error.message}`,
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

kembaliButton.addEventListener('click', () => {
  window.location.href =
    `kelola-asesmen.html?id=${assessmentId}`;
});

logoutButton.addEventListener('click', async () => {
  await supabase.auth.signOut();
  window.location.href = 'index.html';
});

async function init() {
  if (!assessmentId) {
    alert('ID asesmen tidak ditemukan.');
    window.location.href = 'asesmen.html';
    return;
  }

  const user = await checkLogin();

  if (!user) return;

  await loadTeacherProfile(user);
  await loadAssessment(user);

  simpanButton.addEventListener('click', () => {
    saveSettings(user);
  });
}

init();
