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

const soalTable =
  document.getElementById('soalTable');

const tambahSoalButton =
  document.getElementById('tambahSoalButton');

const kembaliButton =
  document.getElementById('kembaliButton');


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

  window.location.href =
    'index.html';

}

if (!assessmentId) {

  alert(
    'ID asesmen tidak ditemukan.'
  );

  window.location.href =
    'asesmen.html';

}


// =====================================================
// PROFIL GURU
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
// NAMA TIPE ASESMEN
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
// NAMA TIPE SOAL
// =====================================================

function getQuestionTypeName(type) {

  const types = {

    multiple_choice:
      'Pilihan Ganda',

    multiple_select:
      'Pilihan Ganda Kompleks'

  };

  return types[type] || type;

}


// =====================================================
// LOAD DATA ASESMEN
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

  assessmentInfo.textContent =
    `${getTypeName(data.type)} • ${subjectName} • Kelas ${className}`;

}


// =====================================================
// LOAD DAFTAR SOAL
// =====================================================

async function loadQuestions() {

  soalTable.innerHTML = `

    <tr>

      <td
        colspan="5"
        class="empty-table"
      >
        Memuat soal...
      </td>

    </tr>

  `;


  const {
    data,
    error
  } = await supabase
    .from('assessment_questions')
    .select(`
      id,
      question_number,
      points,
      question_id,
      questions (
        id,
        question_text,
        question_type,
        stimulus_id
      )
    `)
    .eq(
      'assessment_id',
      assessmentId
    )
    .order(
      'question_number',
      {
        ascending: true
      }
    );


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


  soalTable.innerHTML = '';


  data.forEach(
    (item) => {

      const question =
        item.questions;


      if (!question) {
        return;
      }


      const row =
        document.createElement('tr');


      const questionPreview =
        question.question_text.length > 100
          ? question.question_text.substring(
              0,
              100
            ) + '...'
          : question.question_text;


      const stimulusLabel =
        question.stimulus_id
          ? ' 📖 Stimulus'
          : '';


      row.innerHTML = `

        <td>
          ${item.question_number}
        </td>

        <td>

          ${escapeHtml(
            questionPreview
          )}

          ${stimulusLabel}

        </td>

        <td>

          ${getQuestionTypeName(
            question.question_type
          )}

        </td>

        <td>

          ${item.points ?? 0}

        </td>

        <td>

          <div
            style="
              display:flex;
              gap:8px;
              flex-wrap:wrap;
            "
          >

            <button
              type="button"
              class="primary-button edit-question-button"
              data-question-id="${question.id}"
            >
              ✏️ Edit
            </button>

            <button
              type="button"
              class="danger-button delete-question-button"
              data-question-id="${question.id}"
              data-question-number="${item.question_number}"
              data-stimulus-id="${question.stimulus_id || ''}"
            >
              🗑️ Hapus
            </button>

          </div>

        </td>

      `;


      soalTable.appendChild(row);

    }
  );


  // ===================================================
  // EVENT EDIT
  // ===================================================

  const editButtons =
    soalTable.querySelectorAll(
      '.edit-question-button'
    );


  editButtons.forEach(
    (button) => {

      button.addEventListener(
        'click',
        () => {

          const questionId =
            button.dataset.questionId;


          window.location.href =
            `edit-soal.html?id=${questionId}&assessment=${assessmentId}`;

        }
      );

    }
  );


  // ===================================================
  // EVENT HAPUS
  // ===================================================

  const deleteButtons =
    soalTable.querySelectorAll(
      '.delete-question-button'
    );


  deleteButtons.forEach(
    (button) => {

      button.addEventListener(
        'click',
        async () => {

          const questionId =
            button.dataset.questionId;

          const questionNumber =
            button.dataset.questionNumber;

          const stimulusId =
            button.dataset.stimulusId;


          await deleteQuestion(
            questionId,
            questionNumber,
            stimulusId
          );

        }
      );

    }
  );

}


// =====================================================
// HAPUS SOAL
// =====================================================

async function deleteQuestion(
  questionId,
  questionNumber,
  stimulusId
) {


  // ---------------------------------------------------
  // KONFIRMASI
  // ---------------------------------------------------

  let confirmed;


  if (stimulusId) {

    confirmed =
      confirm(

        `⚠️ INI ADALAH SOAL STIMULUS.\n\n` +

        `Soal nomor ${questionNumber} ` +
        `menggunakan stimulus.\n\n` +

        `Menghapus soal ini TIDAK otomatis ` +
        `menghapus stimulusnya.\n\n` +

        `Apakah Anda yakin ingin menghapus soal ini?`

      );

  } else {

    confirmed =
      confirm(

        `Apakah Anda yakin ingin menghapus ` +
        `soal nomor ${questionNumber}?`

      );

  }


  if (!confirmed) {
    return;
  }


  // ---------------------------------------------------
  // CEK APAKAH SOAL MASIH DIPAKAI ASESMEN LAIN
  // ---------------------------------------------------

  const {
    data: otherLinks,
    error: otherLinksError
  } = await supabase
    .from('assessment_questions')
    .select(`
      id,
      assessment_id
    `)
    .eq(
      'question_id',
      questionId
    );


  if (otherLinksError) {

    console.error(
      'Gagal memeriksa penggunaan soal:',
      otherLinksError
    );

    alert(
      'Gagal memeriksa penggunaan soal: ' +
      otherLinksError.message
    );

    return;

  }


  // ---------------------------------------------------
  // HAPUS HUBUNGAN SOAL DARI ASESMEN INI
  // ---------------------------------------------------

  const {
    error: linkDeleteError
  } = await supabase
    .from('assessment_questions')
    .delete()
    .eq(
      'assessment_id',
      assessmentId
    )
    .eq(
      'question_id',
      questionId
    );


  if (linkDeleteError) {

    console.error(
      'Gagal menghapus soal dari asesmen:',
      linkDeleteError
    );

    alert(
      'Gagal menghapus soal: ' +
      linkDeleteError.message
    );

    return;

  }


  // ---------------------------------------------------
  // CEK APAKAH MASIH TERHUBUNG DENGAN ASESMEN LAIN
  // ---------------------------------------------------

  const remainingLinks =
    (otherLinks || []).filter(
      link =>
        link.assessment_id !==
        assessmentId
    );


  // ---------------------------------------------------
  // JIKA TIDAK DIPAKAI ASESMEN LAIN,
  // HAPUS SOAL DARI BANK SOAL
  // ---------------------------------------------------

  if (
    remainingLinks.length === 0
  ) {

    const {
      error: questionDeleteError
    } = await supabase
      .from('questions')
      .delete()
      .eq(
        'id',
        questionId
      )
      .eq(
        'teacher_id',
        user.id
      );


    if (questionDeleteError) {

      console.error(
        'Gagal menghapus soal:',
        questionDeleteError
      );

      alert(
        'Hubungan soal sudah dihapus, ' +
        'tetapi data soal gagal dihapus: ' +
        questionDeleteError.message
      );

      await loadQuestions();

      return;

    }

  }


  // ---------------------------------------------------
  // RAPIKAN NOMOR SOAL
  // ---------------------------------------------------

  await renumberQuestions();


  // ---------------------------------------------------
  // MUAT ULANG
  // ---------------------------------------------------

  await loadQuestions();

}


// =====================================================
// RAPIKAN NOMOR SOAL
// =====================================================

async function renumberQuestions() {

  const {
    data,
    error
  } = await supabase
    .from('assessment_questions')
    .select('id')
    .eq(
      'assessment_id',
      assessmentId
    )
    .order(
      'question_number',
      {
        ascending: true
      }
    );


  if (error) {

    console.error(
      'Gagal mengambil nomor soal:',
      error
    );

    return;

  }


  if (!data) {
    return;
  }


  for (
    let index = 0;
    index < data.length;
    index++
  ) {

    const newNumber =
      index + 1;


    const {
      error: updateError
    } = await supabase
      .from('assessment_questions')
      .update({
        question_number:
          newNumber
      })
      .eq(
        'id',
        data[index].id
      );


    if (updateError) {

      console.error(
        'Gagal merapikan nomor soal:',
        updateError
      );

    }

  }

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHtml(text) {

  if (!text) {
    return '';
  }

  return text
    .replace(
      /&/g,
      '&amp;'
    )
    .replace(
      /</g,
      '&lt;'
    )
    .replace(
      />/g,
      '&gt;'
    )
    .replace(
      /"/g,
      '&quot;'
    )
    .replace(
      /'/g,
      '&#039;'
    );

}


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
// MULAI
// =====================================================

if (
  assessmentId &&
  user
) {

  await loadAssessment();

  await loadQuestions();

}
