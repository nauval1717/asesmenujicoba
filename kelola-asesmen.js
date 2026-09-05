import { supabase } from './supabase.js';

const params = new URLSearchParams(window.location.search);
const assessmentId = params.get('id');

// ===============================
// ELEMEN HALAMAN
// ===============================

const assessmentTitle = document.getElementById('assessmentTitle');
const assessmentInfo = document.getElementById('assessmentInfo');

const questionCount = document.getElementById('questionCount');
const duration = document.getElementById('duration');
const tokenStatus = document.getElementById('tokenStatus');
const assessmentStatus = document.getElementById('assessmentStatus');

const teacherName = document.getElementById('teacherName');

const kelolaSoalButton = document.getElementById('kelolaSoalButton');
const pengaturanButton = document.getElementById('pengaturanButton');
const aktifkanButton = document.getElementById('aktifkanButton');


// ===============================
// CEK LOGIN
// ===============================

async function checkLogin() {

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error) {
    console.error('Gagal memeriksa login:', error);

    alert('Terjadi masalah saat memeriksa login.');

    window.location.href = 'index.html';

    return null;
  }

  if (!user) {

    window.location.href = 'index.html';

    return null;
  }

  return user;
}


// ===============================
// FORMAT JENIS ASESMEN
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


// ===============================
// FORMAT STATUS
// ===============================

function getStatusName(status) {

  const statuses = {
    draft: 'Draft',
    ready: 'Siap',
    active: 'Aktif',
    completed: 'Selesai'
  };

  return statuses[status] || status || '-';
}


// ===============================
// FORMAT DURASI
// ===============================

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

  if (!teacherName) {
    return;
  }

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

    teacherName.textContent = 'Guru';

    return;
  }

  teacherName.textContent =
    profile?.full_name || 'Guru';
}


// ===============================
// LOAD NAMA MATA PELAJARAN
// ===============================

async function loadSubjectName(subjectId) {

  if (!subjectId) {
    return '-';
  }

  const {
    data,
    error
  } = await supabase
    .from('subjects')
    .select('name')
    .eq('id', subjectId)
    .maybeSingle();

  if (error) {

    console.error(
      'Gagal mengambil mata pelajaran:',
      error
    );

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

  const {
    data,
    error
  } = await supabase
    .from('classes')
    .select('name')
    .eq('id', classId)
    .maybeSingle();

  if (error) {

    console.error(
      'Gagal mengambil kelas:',
      error
    );

    return '-';
  }

  return data?.name || '-';
}


// ===============================
// LOAD ASESMEN
// ===============================

async function loadAssessment(user) {

  if (assessmentTitle) {
    assessmentTitle.textContent =
      'Memuat asesmen...';
  }

  if (assessmentInfo) {
    assessmentInfo.textContent =
      'Memuat informasi asesmen...';
  }

  if (duration) {
    duration.textContent = '-';
  }

  if (assessmentStatus) {
    assessmentStatus.textContent = 'Memuat...';
  }


  console.log(
    'Memuat asesmen dengan ID:',
    assessmentId
  );


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
      class_id
    `)
    .eq('id', assessmentId)
    .eq('teacher_id', user.id)
    .maybeSingle();


  // ===============================
  // JIKA ERROR
  // ===============================

  if (error) {

    console.error(
      'Gagal mengambil asesmen:',
      error
    );

    if (assessmentTitle) {
      assessmentTitle.textContent =
        'Gagal memuat asesmen';
    }

    if (assessmentInfo) {
      assessmentInfo.textContent =
        error.message;
    }

    if (assessmentStatus) {
      assessmentStatus.textContent = '-';
    }

    alert(
      'Gagal mengambil data asesmen.\n\n' +
      error.message
    );

    return false;
  }


  // ===============================
  // JIKA ASESMEN TIDAK DITEMUKAN
  // ===============================

  if (!assessment) {

    console.error(
      'Asesmen tidak ditemukan.'
    );

    if (assessmentTitle) {
      assessmentTitle.textContent =
        'Asesmen tidak ditemukan';
    }

    if (assessmentInfo) {
      assessmentInfo.textContent =
        'Asesmen tidak ditemukan atau Anda tidak memiliki akses.';
    }

    if (assessmentStatus) {
      assessmentStatus.textContent = '-';
    }

    alert(
      'Asesmen tidak ditemukan atau Anda tidak memiliki akses.'
    );

    return false;
  }


  console.log(
    'Data asesmen berhasil:',
    assessment
  );


  // ===============================
  // AMBIL SUBJECT & CLASS
  // ===============================

  const subjectName =
    await loadSubjectName(
      assessment.subject_id
    );

  const className =
    await loadClassName(
      assessment.class_id
    );


  // ===============================
  // TAMPILKAN DATA
  // ===============================

  if (assessmentTitle) {

    assessmentTitle.textContent =
      assessment.title || 'Tanpa Judul';

  }


  if (assessmentInfo) {

    const typeName =
      getTypeName(assessment.type);

    const durationText =
      getDurationText(
        assessment.duration_minutes
      );

    assessmentInfo.textContent =
      `${typeName} • ${subjectName} • ${className} • ${durationText}`;

  }


  if (duration) {

    duration.textContent =
      getDurationText(
        assessment.duration_minutes
      );

  }


  if (assessmentStatus) {

    assessmentStatus.textContent =
      getStatusName(
        assessment.status
      );

  }


  return true;
}


// ===============================
// LOAD JUMLAH SOAL
// ===============================

async function loadQuestionCount() {

  if (questionCount) {
    questionCount.textContent = '...';
  }


  const {
    count,
    error
  } = await supabase
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

    if (questionCount) {
      questionCount.textContent = '0';
    }

    return;
  }


  if (questionCount) {

    questionCount.textContent =
      count ?? 0;

  }
}


// ===============================
// TOMBOL KELOLA SOAL
// ===============================

if (kelolaSoalButton) {

  kelolaSoalButton.addEventListener(
    'click',
    () => {

      window.location.href =
        `kelola-soal.html?id=${assessmentId}`;

    }
  );

}


// ===============================
// TOMBOL PENGATURAN
// ===============================

if (pengaturanButton) {

  pengaturanButton.addEventListener(
    'click',
    () => {

      window.location.href =
        `pengaturan-asesmen.html?id=${assessmentId}`;

    }
  );

}


// ===============================
// TOMBOL AKTIFKAN
// ===============================

if (aktifkanButton) {

  aktifkanButton.addEventListener(
    'click',
    () => {

      alert(
        'Fitur aktivasi asesmen akan kita buat pada tahap berikutnya.'
      );

    }
  );

}


// ===============================
// INIT
// ===============================

async function init() {

  console.log(
    '=== MULAI HALAMAN KELOLA ASESMEN ==='
  );


  // Cek ID
  if (!assessmentId) {

    alert(
      'ID asesmen tidak ditemukan.'
    );

    window.location.href =
      'asesmen.html';

    return;
  }


  console.log(
    'ID asesmen:',
    assessmentId
  );


  // Cek login
  const user =
    await checkLogin();


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


  if (!assessmentLoaded) {
    return;
  }


  // Load jumlah soal
  await loadQuestionCount();


  console.log(
    '=== HALAMAN SELESAI DIMUAT ==='
  );
}


init();
