import { supabase } from './supabase.js';

const params = new URLSearchParams(window.location.search);
const assessmentId = params.get('id');

// =====================================================
// ELEMEN HALAMAN
// =====================================================

const assessmentTitle =
  document.getElementById('assessmentTitle');

const assessmentInfo =
  document.getElementById('assessmentInfo');

const teacherName =
  document.getElementById('teacherName');

// Pengaturan soal
const shuffleQuestions =
  document.getElementById('shuffleQuestions');

const shuffleOptions =
  document.getElementById('shuffleOptions');

const keepStimulusOrder =
  document.getElementById('keepStimulusOrder');

// Anti-kecurangan
const antiCheatEnabled =
  document.getElementById('antiCheatEnabled');

const requireFullscreen =
  document.getElementById('requireFullscreen');

const detectTabSwitch =
  document.getElementById('detectTabSwitch');

const detectFocusLoss =
  document.getElementById('detectFocusLoss');

const maxViolations =
  document.getElementById('maxViolations');

const autoSubmitOnViolation =
  document.getElementById('autoSubmitOnViolation');

// Tombol
const simpanButton =
  document.getElementById('simpanButton');

const kembaliButton =
  document.getElementById('kembaliButton');

const statusMessage =
  document.getElementById('statusMessage');


// =====================================================
// CEK ELEMEN
// =====================================================

function checkElements() {

  const requiredElements = {
    assessmentTitle,
    assessmentInfo,
    teacherName,
    shuffleQuestions,
    shuffleOptions,
    keepStimulusOrder,
    antiCheatEnabled,
    requireFullscreen,
    detectTabSwitch,
    detectFocusLoss,
    maxViolations,
    autoSubmitOnViolation,
    simpanButton,
    kembaliButton,
    statusMessage
  };

  for (const [name, element] of Object.entries(requiredElements)) {

    if (!element) {

      console.error(
        `Elemen HTML tidak ditemukan: ${name}`
      );

      return false;
    }
  }

  return true;
}


// =====================================================
// CEK LOGIN
// =====================================================

async function checkLogin() {

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error) {

    console.error(
      'Gagal memeriksa login:',
      error
    );

    window.location.href = 'index.html';

    return null;
  }

  if (!user) {

    window.location.href = 'index.html';

    return null;
  }

  return user;
}


// =====================================================
// PESAN STATUS
// =====================================================

function showStatus(message, type) {

  statusMessage.textContent = message;

  statusMessage.className =
    `status-message ${type}`;
}


// =====================================================
// FORMAT JENIS ASESMEN
// =====================================================

function getTypeName(type) {

  const types = {

    daily:
      'Ulangan Harian',

    midterm:
      'PTS / Ujian Tengah Semester',

    final:
      'PAS / Ujian Akhir Semester',

    practice:
      'Latihan',

    other:
      'Lainnya'
  };

  return types[type] || type || '-';
}


// =====================================================
// FORMAT DURASI
// =====================================================

function getDurationText(minutes) {

  if (!minutes) {

    return 'Tidak dibatasi';
  }

  return `${minutes} menit`;
}


// =====================================================
// LOAD PROFIL GURU
// =====================================================

async function loadTeacherProfile(user) {

  const {
    data: profile,
    error
  } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .maybeSingle();


  if (error) {

    console.error(
      'Gagal mengambil profil guru:',
      error
    );

    teacherName.textContent =
      'Guru';

    return;
  }


  teacherName.textContent =
    profile?.full_name || 'Guru';
}


// =====================================================
// LOAD ASESMEN
// =====================================================

async function loadAssessment(user) {

  assessmentTitle.textContent =
    'Memuat asesmen...';

  assessmentInfo.textContent =
    'Memuat informasi asesmen...';


  console.log(
    '================================='
  );

  console.log(
    'MEMUAT PENGATURAN ASESMEN'
  );

  console.log(
    'Assessment ID:',
    assessmentId
  );

  console.log(
    'Teacher ID:',
    user.id
  );


  // ===================================================
  // AMBIL DATA ASESMEN
  // ===================================================

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
    .maybeSingle();


  // ===================================================
  // ERROR
  // ===================================================

  if (error) {

    console.error(
      'ERROR SUPABASE:',
      error
    );


    assessmentTitle.textContent =
      'Gagal memuat asesmen';


    assessmentInfo.textContent =
      error.message;


    showStatus(
      `❌ Gagal memuat asesmen: ${error.message}`,
      'error'
    );


    return false;
  }


  // ===================================================
  // TIDAK DITEMUKAN
  // ===================================================

  if (!assessment) {

    console.error(
      'Asesmen tidak ditemukan.'
    );


    assessmentTitle.textContent =
      'Asesmen tidak ditemukan';


    assessmentInfo.textContent =
      'Asesmen tidak ditemukan atau Anda tidak memiliki akses.';


    showStatus(
      '❌ Asesmen tidak ditemukan.',
      'error'
    );


    return false;
  }


  console.log(
    'Data asesmen berhasil:',
    assessment
  );


  // ===================================================
  // NAMA MATA PELAJARAN
  // ===================================================

  let subjectName = '-';


  if (assessment.subject_id) {

    const {
      data: subject,
      error: subjectError
    } = await supabase
      .from('subjects')
      .select('name')
      .eq('id', assessment.subject_id)
      .maybeSingle();


    if (subjectError) {

      console.error(
        'Gagal mengambil mata pelajaran:',
        subjectError
      );

    } else {

      subjectName =
        subject?.name || '-';
    }
  }


  // ===================================================
  // NAMA KELAS
  // ===================================================

  let className = '-';


  if (assessment.class_id) {

    const {
      data: classData,
      error: classError
    } = await supabase
      .from('classes')
      .select('name')
      .eq('id', assessment.class_id)
      .maybeSingle();


    if (classError) {

      console.error(
        'Gagal mengambil kelas:',
        classError
      );

    } else {

      className =
        classData?.name || '-';
    }
  }


  // ===================================================
  // TAMPILKAN INFORMASI ASESMEN
  // ===================================================

  assessmentTitle.textContent =
    assessment.title || 'Tanpa Judul';


  assessmentInfo.textContent =
    `${getTypeName(assessment.type)} • ` +
    `${subjectName} • ` +
    `${className} • ` +
    `${getDurationText(assessment.duration_minutes)}`;


  // ===================================================
  // PENGATURAN SOAL
  // ===================================================

  shuffleQuestions.checked =
    assessment.shuffle_questions ?? true;


  shuffleOptions.checked =
    assessment.shuffle_options ?? true;


  keepStimulusOrder.checked =
    assessment.keep_stimulus_order ?? true;


  // ===================================================
  // ANTI-KECURANGAN
  // =====================================================

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


  console.log(
    'Pengaturan berhasil dimuat.'
  );


  console.log(
    '================================='
  );


  return true;
}


// =====================================================
// SIMPAN PENGATURAN
// =====================================================

async function saveSettings(user) {

  const violationLimit =
    Number(maxViolations.value);


  // ===================================================
  // VALIDASI
  // ===================================================

  if (
    !Number.isInteger(violationLimit) ||
    violationLimit < 1 ||
    violationLimit > 20
  ) {

    showStatus(
      '❌ Batas pelanggaran harus berupa angka 1 sampai 20.',
      'error'
    );

    return;
  }


  // ===================================================
  // DISABLE TOMBOL
  // ===================================================

  simpanButton.disabled = true;

  simpanButton.textContent =
    '⏳ Menyimpan...';


  // ===================================================
  // DATA YANG DISIMPAN
  // ===================================================

  const settings = {

    // Pengaturan soal
    shuffle_questions:
      shuffleQuestions.checked,

    shuffle_options:
      shuffleOptions.checked,

    keep_stimulus_order:
      keepStimulusOrder.checked,


    // Anti-kecurangan
    anti_cheat_enabled:
      antiCheatEnabled.checked,

    require_fullscreen:
      requireFullscreen.checked,

    detect_tab_switch:
      detectTabSwitch.checked,

    detect_focus_loss:
      detectFocusLoss.checked,

    max_violations:
      violationLimit,

    auto_submit_on_violation:
      autoSubmitOnViolation.checked
  };


  console.log(
    'Menyimpan pengaturan:',
    settings
  );


  // ===================================================
  // UPDATE SUPABASE
  // ===================================================

  const {
    error
  } = await supabase
    .from('assessments')
    .update(settings)
    .eq('id', assessmentId)
    .eq('teacher_id', user.id);


  // ===================================================
  // ERROR
  // ===================================================

  if (error) {

    console.error(
      'Gagal menyimpan pengaturan:',
      error
    );


    showStatus(
      `❌ Gagal menyimpan: ${error.message}`,
      'error'
    );


    simpanButton.disabled = false;

    simpanButton.textContent =
      '💾 Simpan Pengaturan';

    return;
  }


  // ===================================================
  // BERHASIL
  // ===================================================

  console.log(
    'Pengaturan berhasil disimpan.'
  );


  showStatus(
    '✅ Pengaturan berhasil disimpan.',
    'success'
  );


  simpanButton.disabled = false;

  simpanButton.textContent =
    '💾 Simpan Pengaturan';
}


// =====================================================
// TOMBOL SIMPAN
// =====================================================

simpanButton.addEventListener(
  'click',
  async () => {

    const user =
      await checkLogin();

    if (!user) {
      return;
    }

    await saveSettings(user);
  }
);


// =====================================================
// TOMBOL KEMBALI
// =====================================================

kembaliButton.addEventListener(
  'click',
  () => {

    window.location.href =
      `kelola-asesmen.html?id=${assessmentId}`;
  }
);


// =====================================================
// INIT
// =====================================================

async function init() {

  console.log(
    '================================='
  );

  console.log(
    'INIT PENGATURAN ASESMEN'
  );


  // ===================================================
  // CEK ELEMEN
  // ===================================================

  if (!checkElements()) {

    alert(
      'Ada elemen halaman yang tidak ditemukan. Silakan periksa Console.'
    );

    return;
  }


  // ===================================================
  // CEK ID ASESMEN
  // ===================================================

  if (!assessmentId) {

    alert(
      'ID asesmen tidak ditemukan.'
    );


    window.location.href =
      'asesmen.html';


    return;
  }


  // ===================================================
  // CEK LOGIN
  // ===================================================

  const user =
    await checkLogin();


  if (!user) {
    return;
  }


  // ===================================================
  // LOAD PROFIL
  // ===================================================

  await loadTeacherProfile(user);


  // ===================================================
  // LOAD ASESMEN
  // ===================================================

  await loadAssessment(user);


  console.log(
    'INIT SELESAI'
  );

  console.log(
    '================================='
  );
}


init();
