import { supabase } from './supabase.js';

const params = new URLSearchParams(window.location.search);
const assessmentId = params.get('id');

const assessmentTitle =
  document.getElementById('assessmentTitle');

const assessmentType =
  document.getElementById('assessmentType');

const assessmentSubject =
  document.getElementById('assessmentSubject');

const assessmentClass =
  document.getElementById('assessmentClass');

const assessmentDuration =
  document.getElementById('assessmentDuration');

const assessmentStatus =
  document.getElementById('assessmentStatus');

const questionCount =
  document.getElementById('questionCount');

const teacherName =
  document.getElementById('teacherName');

const kelolaSoalButton =
  document.getElementById('kelolaSoalButton');

const pengaturanButton =
  document.getElementById('pengaturanButton');

const logoutButton =
  document.getElementById('logoutButton');

const kembaliButton =
  document.getElementById('kembaliButton');

const aktifkanButton =
  document.getElementById('aktifkanButton');

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
      subjects (
        name
      ),
      classes (
        name
      )
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

    return null;
  }

  assessmentTitle.textContent =
    assessment.title;

  assessmentType.textContent =
    getTypeName(assessment.type);

  assessmentSubject.textContent =
    assessment.subjects?.name || '-';

  assessmentClass.textContent =
    assessment.classes?.name || '-';

  assessmentDuration.textContent =
    getDurationText(
      assessment.duration_minutes
    );

  assessmentStatus.textContent =
    getStatusName(
      assessment.status
    );

  return assessment;
}

async function loadQuestionCount() {
  const {
    count,
    error
  } = await supabase
    .from('assessment_questions')
    .select(
      'id',
      {
        count: 'exact',
        head: true
      }
    )
    .eq('assessment_id', assessmentId);

  if (error) {
    console.error(
      'Gagal menghitung jumlah soal:',
      error
    );

    questionCount.textContent = '0';

    return;
  }

  questionCount.textContent =
    count ?? 0;
}

kelolaSoalButton.addEventListener(
  'click',
  () => {
    window.location.href =
      `kelola-soal.html?id=${assessmentId}`;
  }
);

pengaturanButton.addEventListener(
  'click',
  () => {
    window.location.href =
      `pengaturan-asesmen.html?id=${assessmentId}`;
  }
);

kembaliButton.addEventListener(
  'click',
  () => {
    window.location.href =
      'asesmen.html';
  }
);

logoutButton.addEventListener(
  'click',
  async () => {
    await supabase.auth.signOut();

    window.location.href =
      'index.html';
  }
);

aktifkanButton.addEventListener(
  'click',
  () => {
    alert(
      'Fitur aktivasi asesmen akan kita buat pada tahap berikutnya.'
    );
  }
);

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

  await loadQuestionCount();
}

init();
