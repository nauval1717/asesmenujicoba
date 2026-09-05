import { supabase } from './supabase.js';

// =====================================================
// ELEMENT HALAMAN
// =====================================================

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


// =====================================================
// AMBIL ID ASESMEN DARI URL
// =====================================================

const params =
  new URLSearchParams(window.location.search);

const assessmentId =
  params.get('id');


// =====================================================
// CEK LOGIN
// =====================================================

const {
  data: { user },
  error: userError
} = await supabase.auth.getUser();

if (userError || !user) {
  window.location.href = 'index.html';
}


// =====================================================
// CEK ID ASESMEN
// =====================================================

if (!assessmentId) {

  alert('ID asesmen tidak ditemukan.');

  window.location.href =
    'asesmen.html';

}


// =====================================================
// DATA GURU
// =====================================================

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


// =====================================================
// NAMA JENIS ASESMEN
// =====================================================

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


// =====================================================
// AMBIL DATA ASESMEN
// =====================================================

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


// =====================================================
// RAPKAN NOMOR SOAL
// =====================================================

async function renumberAssessmentQuestions() {

  const {
    data,
    error
  } = await supabase
    .from('assessment_questions')
    .select('id, question_number')
    .eq('assessment_id', assessmentId)
    .order('question_number', {
      ascending: true
    });

  if (error) {

    console.error(
      'Gagal mengambil nomor soal:',
      error
    );

    return;

  }

  if (!data || data.length === 0) {
    return;
  }

  for (
    let index = 0;
    index < data.length;
    index++
  ) {

    const newNumber =
      index + 1;

    const item =
      data[index];

    if (
      item.question_number !== newNumber
    ) {

      const {
        error: updateError
      } = await supabase
        .from('assessment_questions')
        .update({
          question_number:
            newNumber
        })
        .eq('id', item.id);

      if (updateError) {

        console.error(
          'Gagal merapikan nomor soal:',
          updateError
        );

      }

    }

  }

}


// =====================================================
// HAPUS SOAL
// =====================================================

async function deleteQuestion(
  assessmentQuestionId,
  questionId,
  stimulusId,
  questionNumber
) {

  let confirmationMessage;

  if (stimulusId) {

    confirmationMessage =
      `⚠️ INI ADALAH SOAL STIMULUS.\n\n` +
      `Soal nomor ${questionNumber} menggunakan stimulus.\n\n` +
      `Apakah Anda yakin ingin menghapus soal ini?`;

  } else {

    confirmationMessage =
      `Apakah Anda yakin ingin menghapus soal nomor ${questionNumber}?`;

  }

  const confirmed =
    confirm(confirmationMessage);

  if (!confirmed) {
    return;
  }

  // ---------------------------------------------------
  // HAPUS DARI ASSESSMENT QUESTIONS
  // ---------------------------------------------------

  const {
    error: assessmentQuestionError
  } = await supabase
    .from('assessment_questions')
    .delete()
    .eq('id', assessmentQuestionId)
    .eq('assessment_id', assessmentId);

  if (assessmentQuestionError) {

    console.error(
      'Gagal menghapus soal dari asesmen:',
      assessmentQuestionError
    );

    alert(
      'Gagal menghapus soal dari asesmen:\n' +
      assessmentQuestionError.message
    );

    return;

  }


  // ---------------------------------------------------
  // HAPUS SOAL
  // ---------------------------------------------------

  const {
    error: questionError
  } = await supabase
    .from('questions')
    .delete()
    .eq('id', questionId)
    .eq('teacher_id', user.id);

  if (questionError) {

    console.error(
      'Gagal menghapus soal:',
      questionError
    );

    alert(
      'Soal sudah dilepas dari asesmen, tetapi gagal menghapus data soal:\n' +
      questionError.message
    );

    await loadQuestions();

    return;

  }


  // ---------------------------------------------------
  // STIMULUS TIDAK DIHAPUS
  // ---------------------------------------------------
  //
  // Stimulus sengaja tidak langsung dihapus.
  //
  // Alasannya:
  // stimulus mungkin masih digunakan oleh
  // soal lain.
  //
  // Nanti kita bisa membuat fitur pengelolaan stimulus
  // secara khusus.
  // ---------------------------------------------------


  // ---------------------------------------------------
  // RAPKAN NOMOR
  // ---------------------------------------------------

  await renumberAssessmentQuestions();


  // ---------------------------------------------------
  // TAMPILKAN PESAN
  // ---------------------------------------------------

  alert(
    stimulusId
      ? 'Soal stimulus berhasil dihapus.'
      : 'Soal berhasil dihapus.'
  );


  // ---------------------------------------------------
  // MUAT ULANG DAFTAR SOAL
  // ---------------------------------------------------

  await loadQuestions();

}


// =====================================================
// AMBIL DAFTAR SOAL
// =====================================================

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
        question_type,
        stimulus_id
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


  // ---------------------------------------------------
  // BELUM ADA SOAL
  // ---------------------------------------------------

  if (
    !data ||
    data.length === 0
  ) {

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


  // ---------------------------------------------------
  // TAMPILKAN SOAL
  // ---------------------------------------------------

  soalTable.innerHTML = '';


  data.forEach(
    (item, index) => {

      const question =
        item.questions;

      const questionText =
        question?.question_text || '-';


      // -----------------------------------------------
      // TIPE SOAL
      // -----------------------------------------------

      let questionType =
        question?.question_type;


      if (
        questionType ===
        'multiple_choice'
      ) {

        questionType =
          'Pilihan Ganda';

      } else if (
        questionType ===
        'multiple_select'
      ) {

        questionType =
          'Pilihan Ganda Kompleks';

      } else {

        questionType =
          questionType || '-';

      }


      // -----------------------------------------------
      // STIMULUS
      // -----------------------------------------------

      const stimulusId =
        question?.stimulus_id || null;


      // -----------------------------------------------
      // BOBOT
      // -----------------------------------------------

      const points =
        item.points ?? 0;


      // -----------------------------------------------
      // BARIS TABEL
      // -----------------------------------------------

      const row =
        document.createElement('tr');


      // -----------------------------------------------
      // NOMOR
      // -----------------------------------------------

      const numberCell =
        document.createElement('td');

      numberCell.textContent =
        item.question_number ||
        index + 1;


      // -----------------------------------------------
      // SOAL
      // -----------------------------------------------

      const questionCell =
        document.createElement('td');

      questionCell.textContent =
        questionText;


      // -----------------------------------------------
      // TIPE
      // -----------------------------------------------

      const typeCell =
        document.createElement('td');

      typeCell.textContent =
        questionType;


      // -----------------------------------------------
      // BOBOT
      // -----------------------------------------------

      const pointsCell =
        document.createElement('td');

      pointsCell.textContent =
        points;


      // -----------------------------------------------
      // AKSI
      // -----------------------------------------------

      const actionCell =
        document.createElement('td');


      // -----------------------------------------------
      // TOMBOL EDIT
      // -----------------------------------------------

      const editButton =
        document.createElement('button');

      editButton.type =
        'button';

      editButton.className =
        'secondary-button';

      editButton.textContent =
        'Edit';

      editButton.addEventListener(
        'click',
        () => {

          alert(
            'Fitur Edit Soal akan kita buat setelah fitur Hapus selesai.'
          );

        }
      );


      // -----------------------------------------------
      // SPASI
      // -----------------------------------------------

      const spacer =
        document.createTextNode(' ');


      // -----------------------------------------------
      // TOMBOL HAPUS
      // -----------------------------------------------

      const deleteButton =
        document.createElement('button');

      deleteButton.type =
        'button';

      deleteButton.className =
        'danger-button';

      deleteButton.textContent =
        'Hapus';


      deleteButton.addEventListener(
        'click',
        async () => {

          deleteButton.disabled =
            true;

          deleteButton.textContent =
            'Menghapus...';

          await deleteQuestion(

            item.id,

            question?.id,

            stimulusId,

            item.question_number ||
            index + 1

          );

          deleteButton.disabled =
            false;

          deleteButton.textContent =
            'Hapus';

        }
      );


      // -----------------------------------------------
      // MASUKKAN KE CELL
      // -----------------------------------------------

      actionCell.appendChild(
        editButton
      );

      actionCell.appendChild(
        spacer
      );

      actionCell.appendChild(
        deleteButton
      );


      // -----------------------------------------------
      // MASUKKAN KE BARIS
      // -----------------------------------------------

      row.appendChild(
        numberCell
      );

      row.appendChild(
        questionCell
      );

      row.appendChild(
        typeCell
      );

      row.appendChild(
        pointsCell
      );

      row.appendChild(
        actionCell
      );


      soalTable.appendChild(
        row
      );

    }
  );

}


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
// TOMBOL TAMBAH SOAL
// =====================================================

tambahSoalButton.addEventListener(
  'click',
  () => {

    window.location.href =
      `tambah-soal.html?id=${assessmentId}`;

  }
);


// =====================================================
// LOGOUT
// =====================================================

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


// =====================================================
// JALANKAN HALAMAN
// =====================================================

if (
  assessmentId &&
  user
) {

  await loadAssessment();

  await loadQuestions();

}
