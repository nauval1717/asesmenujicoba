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

const editSoalForm =
  document.getElementById('editSoalForm');

const stimulusSection =
  document.getElementById('stimulusSection');

const stimulusTitle =
  document.getElementById('stimulusTitle');

const stimulusContent =
  document.getElementById('stimulusContent');

const stimulusImageUrl =
  document.getElementById('stimulusImageUrl');

const stimulusImagePreview =
  document.getElementById('stimulusImagePreview');

const questionContainer =
  document.getElementById('questionContainer');

const tambahSoalButton =
  document.getElementById('tambahSoalButton');

const batalButton =
  document.getElementById('batalButton');

const kembaliButton =
  document.getElementById('kembaliButton');

const simpanButton =
  document.getElementById('simpanButton');


// =====================================================
// PARAMETER URL
// =====================================================

const params =
  new URLSearchParams(
    window.location.search
  );

const questionId =
  params.get('id');

const assessmentId =
  params.get('assessment');


// =====================================================
// DATA GLOBAL
// =====================================================

let user = null;

let assessmentData = null;

let stimulusId = null;

let isStimulusMode = false;


// =====================================================
// CEK LOGIN
// =====================================================

const {
  data: authData,
  error: userError
} = await supabase.auth.getUser();

user =
  authData?.user || null;


if (userError || !user) {

  window.location.href =
    'index.html';

}


// =====================================================
// VALIDASI PARAMETER
// =====================================================

if (
  !questionId ||
  !assessmentId
) {

  alert(
    'ID soal atau ID asesmen tidak ditemukan.'
  );

  window.location.href =
    'asesmen.html';

}


// =====================================================
// PROFIL GURU
// =====================================================

async function loadProfile() {

  const {
    data: profile,
    error
  } = await supabase
    .from('profiles')
    .select('full_name')
    .eq(
      'id',
      user.id
    )
    .single();


  if (
    !error &&
    profile
  ) {

    teacherName.textContent =
      profile.full_name;

  }

}


// =====================================================
// TIPE ASESMEN
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
// TIPE SOAL
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
// LABEL PILIHAN
// =====================================================

function getOptionLabel(index) {

  return String.fromCharCode(
    65 + index
  );

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHtml(text) {

  if (!text) {
    return '';
  }

  return String(text)
    .replace(
      /&/g,
      '&amp;'
    )
    .replace(
      /&lt;/g,
      '&lt;'
    )
    .replace(
      /&gt;/g,
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
// LOAD ASESMEN
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
    .eq(
      'id',
      assessmentId
    )
    .eq(
      'teacher_id',
      user.id
    )
    .single();


  if (error) {

    console.error(
      'Gagal mengambil asesmen:',
      error
    );

    alert(
      'Data asesmen tidak ditemukan.'
    );

    window.location.href =
      'asesmen.html';

    return;

  }


  assessmentData =
    data;


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
// AMBIL DATA SOAL YANG DIPILIH
// =====================================================

async function loadTargetQuestion() {

  const {
    data,
    error
  } = await supabase
    .from('questions')
    .select(`
      id,
      teacher_id,
      question_text,
      question_type,
      points,
      stimulus_id,
      question_options (
        id,
        option_label,
        option_text,
        is_correct
      )
    `)
    .eq(
      'id',
      questionId
    )
    .eq(
      'teacher_id',
      user.id
    )
    .single();


  if (error) {

    console.error(
      'Gagal mengambil soal:',
      error
    );

    alert(
      'Data soal tidak ditemukan.'
    );

    window.location.href =
      `kelola-soal.html?id=${assessmentId}`;

    return null;

  }


  return data;

}


// =====================================================
// CEK SOAL ADA DI ASESMEN
// =====================================================

async function checkQuestionInAssessment() {

  const {
    data,
    error
  } = await supabase
    .from('assessment_questions')
    .select(`
      id,
      question_id,
      question_number,
      points
    `)
    .eq(
      'assessment_id',
      assessmentId
    )
    .eq(
      'question_id',
      questionId
    )
    .single();


  if (error || !data) {

    alert(
      'Soal ini tidak ditemukan dalam asesmen tersebut.'
    );

    window.location.href =
      `kelola-soal.html?id=${assessmentId}`;

    return null;

  }


  return data;

}


// =====================================================
// LOAD SOAL
// =====================================================

async function loadQuestions() {

  const targetQuestion =
    await loadTargetQuestion();


  if (!targetQuestion) {
    return;
  }


  const targetLink =
    await checkQuestionInAssessment();


  if (!targetLink) {
    return;
  }


  stimulusId =
    targetQuestion.stimulus_id;


  isStimulusMode =
    Boolean(stimulusId);


  // ===================================================
  // JIKA SOAL STIMULUS
  // AMBIL SEMUA SOAL DALAM STIMULUS YANG SAMA
  // ===================================================

  if (isStimulusMode) {

    stimulusSection.classList.remove(
      'hidden'
    );


    const {
      data: stimulus,
      error: stimulusError
    } = await supabase
      .from('stimuli')
      .select(`
        id,
        title,
        content,
        image_url
      `)
      .eq(
        'id',
        stimulusId
      )
      .eq(
        'teacher_id',
        user.id
      )
      .single();


    if (stimulusError) {

      console.error(
        'Gagal mengambil stimulus:',
        stimulusError
      );

      alert(
        'Data stimulus tidak ditemukan.'
      );

      return;

    }


    stimulusTitle.value =
      stimulus.title || '';

    stimulusContent.value =
      stimulus.content || '';

    stimulusImageUrl.value =
      stimulus.image_url || '';


    updateStimulusPreview();


    // -----------------------------------------------
    // Ambil semua soal dengan stimulus yang sama
    // dalam asesmen ini
    // -----------------------------------------------

    const {
      data: links,
      error: linksError
    } = await supabase
      .from('assessment_questions')
      .select(`
        id,
        question_id,
        question_number,
        points,
        questions (
          id,
          question_text,
          question_type,
          points,
          stimulus_id,
          question_options (
            id,
            option_label,
            option_text,
            is_correct
          )
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


    if (linksError) {

      console.error(
        'Gagal mengambil soal stimulus:',
        linksError
      );

      alert(
        'Gagal mengambil soal stimulus.'
      );

      return;

    }


    const stimulusQuestions =
      (links || []).filter(
        item =>
          item.questions &&
          item.questions.stimulus_id ===
          stimulusId
      );


    questionContainer.innerHTML =
      '';


    stimulusQuestions.forEach(
      (item) => {

        createQuestionCard(
          item.questions,
          item
        );

      }
    );


  } else {

    // =================================================
    // SOAL BIASA
    // =================================================

    stimulusSection.classList.add(
      'hidden'
    );


    questionContainer.innerHTML =
      '';


    createQuestionCard(
      targetQuestion,
      targetLink
    );

  }

}


// =====================================================
// UPDATE PREVIEW STIMULUS
// =====================================================

function updateStimulusPreview() {

  if (!stimulusImagePreview) {
    return;
  }


  const url =
    stimulusImageUrl.value.trim();


  if (!url) {

    stimulusImagePreview.style.display =
      'none';

    stimulusImagePreview.src =
      '';

    return;

  }


  stimulusImagePreview.src =
    url;

  stimulusImagePreview.style.display =
    'block';

}


// =====================================================
// BUAT CARD SOAL
// =====================================================

function createQuestionCard(
  question,
  assessmentQuestion
) {

  const card =
    document.createElement('div');


  card.className =
    'question-card';


  card.dataset.questionId =
    question.id;


  card.dataset.assessmentQuestionId =
    assessmentQuestion.id;


  card.dataset.originalQuestionNumber =
    assessmentQuestion.question_number;


  const isFirstQuestion =
    questionContainer
      .querySelectorAll('.question-card')
      .length === 0;


  card.innerHTML = `

    <div class="question-card-header">

      <h3>
        Soal ${assessmentQuestion.question_number}
      </h3>

      ${
        isStimulusMode
          ? `
            <button
              type="button"
              class="danger-button remove-question-button"
            >
              Hapus Soal
            </button>
          `
          : ''
      }

    </div>


    <div class="form-group">

      <label>
        Jenis Soal
      </label>

      <select
        class="question-type"
      >

        <option value="multiple_choice">
          Pilihan Ganda
        </option>

        <option value="multiple_select">
          Pilihan Ganda Kompleks
        </option>

      </select>

    </div>


    <div class="form-group">

      <label>
        Pertanyaan
      </label>

      <textarea
        class="question-text"
        rows="5"
        required
      ></textarea>

    </div>


    <div class="form-group">

      <label>
        Gambar Soal
      </label>

      <input
        type="url"
        class="question-image-url"
        placeholder="https://..."
      >

      <small>
        Penyimpanan gambar soal akan kita aktifkan
        pada tahap berikutnya.
      </small>

      <img
        class="image-preview question-image-preview"
        alt="Preview gambar soal"
      >

    </div>


    <div class="form-group">

      <label>
        Pilihan Jawaban
      </label>

      <div class="options-container">
      </div>

    </div>


    <div class="form-actions">

      <button
        type="button"
        class="secondary-button add-option-button"
      >
        + Tambah Pilihan
      </button>

    </div>


    <div class="form-group">

      <label>
        Jawaban Benar
      </label>

      <div class="correct-options">
      </div>

      <small class="correct-help">
      </small>

    </div>


    <div class="form-group">

      <label>
        Bobot Soal
      </label>

      <input
        type="number"
        class="question-points"
        min="0"
        step="0.1"
        required
      >

    </div>

  `;


  questionContainer.appendChild(
    card
  );


  // ===================================================
  // ISI DATA SOAL
  // ===================================================

  card.querySelector(
    '.question-type'
  ).value =
    question.question_type;


  card.querySelector(
    '.question-text'
  ).value =
    question.question_text || '';


  card.querySelector(
    '.question-points'
  ).value =
    assessmentQuestion.points ??
    question.points ??
    1;


  // ===================================================
  // OPSI
  // ===================================================

  const options =
    (question.question_options || [])
      .sort(
        (a, b) =>
          a.option_label.localeCompare(
            b.option_label
          )
      );


  options.forEach(
    option => {

      addOption(
        card,
        option
      );

    }
  );


  // Pastikan minimal 4 pilihan

  while (
    card.querySelectorAll(
      '.option-row'
    ).length < 4
  ) {

    addOption(
      card,
      null
    );

  }


  // Tampilkan jawaban benar yang tersimpan
  updateCorrectOptions(
    card,
    options
      .filter(option => option.is_correct)
      .map(option => option.option_label)
  );


  // ===================================================
  // TIPE SOAL BERUBAH
  // ===================================================

  card.querySelector(
    '.question-type'
  ).addEventListener(
    'change',
    () => {

      updateCorrectOptions(
        card
      );

    }
  );


  // ===================================================
  // TAMBAH OPSI
  // ===================================================

  card.querySelector(
    '.add-option-button'
  ).addEventListener(
    'click',
    () => {

      const count =
        card.querySelectorAll(
          '.option-row'
        ).length;


      if (count >= 6) {

        alert(
          'Maksimal 6 pilihan jawaban.'
        );

        return;

      }


      addOption(
        card,
        null
      );

    }
  );


  // ===================================================
  // HAPUS SOAL
  // ===================================================

  const removeButton =
    card.querySelector(
      '.remove-question-button'
    );


  if (removeButton) {

    removeButton.addEventListener(
      'click',
      async () => {

        await removeQuestionCard(
          card
        );

      }
    );

  }

}


// =====================================================
// TAMBAH PILIHAN
// =====================================================

function addOption(
  card,
  existingOption
) {

  const optionsContainer =
    card.querySelector(
      '.options-container'
    );


  const optionCount =
    optionsContainer
      .querySelectorAll(
        '.option-row'
      )
      .length;


  if (optionCount >= 6) {
    return;
  }


  const label =
    getOptionLabel(
      optionCount
    );


  const row =
    document.createElement('div');


  row.className =
    'option-row';


  row.innerHTML = `

    <div class="option-label">
      ${label}
    </div>


    <div class="option-content">

      <input
        type="text"
        class="option-text"
        placeholder="Masukkan pilihan ${label}"
        required
      >

      <input
        type="url"
        class="option-image-url"
        placeholder="URL gambar pilihan (opsional)"
      >

      <img
        class="image-preview option-image-preview"
        alt="Preview gambar pilihan"
      >

    </div>


    ${
      optionCount >= 4
        ? `
          <button
            type="button"
            class="remove-option-button"
            title="Hapus pilihan"
          >
            ✕
          </button>
        `
        : ''
    }

  `;


  optionsContainer.appendChild(
    row
  );


  const textInput =
    row.querySelector(
      '.option-text'
    );


  const imageInput =
    row.querySelector(
      '.option-image-url'
    );


  const imagePreview =
    row.querySelector(
      '.option-image-preview'
    );


  if (existingOption) {

    textInput.value =
      existingOption.option_text || '';

  }


  imageInput.addEventListener(
    'input',
    () => {

      const url =
        imageInput.value.trim();


      if (!url) {

        imagePreview.style.display =
          'none';

        imagePreview.src =
          '';

        return;

      }


      imagePreview.src =
        url;

      imagePreview.style.display =
        'block';

    }
  );


  const removeButton =
    row.querySelector(
      '.remove-option-button'
    );


  if (removeButton) {

    removeButton.addEventListener(
      'click',
      () => {

        const total =
          card.querySelectorAll(
            '.option-row'
          ).length;


        if (total <= 4) {

          alert(
            'Minimal 4 pilihan jawaban.'
          );

          return;

        }


        row.remove();


        renumberOptions(
          card
        );

      }
    );

  }

}


// =====================================================
// RENAME OPSI
// =====================================================

function renumberOptions(card) {

  const rows =
    card.querySelectorAll(
      '.option-row'
    );


  rows.forEach(
    (row, index) => {

      const label =
        getOptionLabel(
          index
        );


      row.querySelector(
        '.option-label'
      ).textContent =
        label;


      row.querySelector(
        '.option-text'
      ).placeholder =
        `Masukkan pilihan ${label}`;

    }
  );


  updateCorrectOptions(
    card
  );

}


// =====================================================
// UPDATE JAWABAN BENAR
// =====================================================

function updateCorrectOptions(
  card,
  initialSelected = null
) {

  const container =
    card.querySelector(
      '.correct-options'
    );


  const questionType =
    card.querySelector(
      '.question-type'
    ).value;


  const previousSelected =
    initialSelected !== null
      ? initialSelected
      : Array.from(
          container.querySelectorAll(
            'input:checked'
          )
        ).map(
          input => input.value
        );


  container.innerHTML =
    '';


  const rows =
    card.querySelectorAll(
      '.option-row'
    );


  rows.forEach(
    (row, index) => {

      const label =
        getOptionLabel(
          index
        );


      const wrapper =
        document.createElement(
          'label'
        );


      wrapper.className =
        'correct-option';


      const input =
        document.createElement(
          'input'
        );


      input.type =
        questionType ===
        'multiple_select'
          ? 'checkbox'
          : 'radio';


      input.name =
        `correct-${card.dataset.questionId}`;


      input.value =
        label;


      if (
        previousSelected.includes(
          label
        )
      ) {

        input.checked =
          true;

      }


      wrapper.appendChild(
        input
      );


      wrapper.appendChild(
        document.createTextNode(
          ` ${label}`
        )
      );


      container.appendChild(
        wrapper
      );

    }
  );


  const help =
    card.querySelector(
      '.correct-help'
    );


  if (
    questionType ===
    'multiple_select'
  ) {

    help.textContent =
      'Centang semua jawaban yang benar.';

  } else {

    help.textContent =
      'Pilih satu jawaban yang benar.';

  }

}


// =====================================================
// HAPUS CARD SOAL
// =====================================================

async function removeQuestionCard(
  card
) {

  const questionIdToDelete =
    card.dataset.questionId;


  const questionNumber =
    card.querySelector(
      '.question-card-header h3'
    ).textContent;


  const confirmed =
    confirm(
      `Apakah Anda yakin ingin menghapus ${questionNumber} dari kelompok ini?`
    );


  if (!confirmed) {
    return;
  }


  const {
    data: links,
    error: linksError
  } = await supabase
    .from('assessment_questions')
    .select(
      'id, assessment_id'
    )
    .eq(
      'question_id',
      questionIdToDelete
    );


  if (linksError) {

    alert(
      'Gagal memeriksa penggunaan soal: ' +
      linksError.message
    );

    return;

  }


  // -----------------------------------------------
  // Hapus hubungan dari asesmen saat ini
  // -----------------------------------------------

  const {
    error: deleteLinkError
  } = await supabase
    .from('assessment_questions')
    .delete()
    .eq(
      'assessment_id',
      assessmentId
    )
    .eq(
      'question_id',
      questionIdToDelete
    );


  if (deleteLinkError) {

    alert(
      'Gagal menghapus soal dari asesmen: ' +
      deleteLinkError.message
    );

    return;

  }


  // -----------------------------------------------
  // Jika tidak digunakan asesmen lain,
  // hapus soal
  // -----------------------------------------------

  const otherLinks =
    (links || []).filter(
      link =>
        link.assessment_id !==
        assessmentId
    );


  if (
    otherLinks.length === 0
  ) {

    const {
      error: deleteQuestionError
    } = await supabase
      .from('questions')
      .delete()
      .eq(
        'id',
        questionIdToDelete
      )
      .eq(
        'teacher_id',
        user.id
      );


    if (deleteQuestionError) {

      alert(
        'Soal terlepas dari asesmen, ' +
        'tetapi gagal dihapus dari bank soal: ' +
        deleteQuestionError.message
      );

      return;

    }

  }


  card.remove();


  renumberQuestionCards();

}


// =====================================================
// NOMOR ULANG SOAL
// =====================================================

function renumberQuestionCards() {

  const cards =
    questionContainer.querySelectorAll(
      '.question-card'
    );


  cards.forEach(
    (card, index) => {

      const title =
        card.querySelector(
          '.question-card-header h3'
        );


      title.textContent =
        `Soal ${index + 1}`;

    }
  );

}


// =====================================================
// TAMBAH SOAL BARU
// =====================================================

tambahSoalButton.addEventListener(
  'click',
  () => {

    if (!isStimulusMode) {

      alert(
        'Soal biasa tidak menggunakan kelompok stimulus. Jika ingin membuat soal baru, gunakan halaman Tambah Soal.'
      );

      return;

    }


    const currentCount =
      questionContainer.querySelectorAll(
        '.question-card'
      ).length;


    const newQuestion =
      createNewQuestionData(
        currentCount + 1
      );


    createQuestionCard(
      newQuestion.question,
      newQuestion.assessmentQuestion
    );

  }
);


// =====================================================
// DATA SOAL BARU
// =====================================================

function createNewQuestionData(
  number
) {

  const fakeQuestionId =
    `new-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 8)}`;


  return {

    question: {

      id:
        fakeQuestionId,

      question_text:
        '',

      question_type:
        'multiple_choice',

      points:
        1,

      stimulus_id:
        stimulusId,

      question_options: []

    },


    assessmentQuestion: {

      id:
        `new-${Date.now()}`,

      question_id:
        fakeQuestionId,

      question_number:
        number,

      points:
        1,

      isNew:
        true

    }

  };

}


// =====================================================
// TANDAI SOAL BARU
// =====================================================

const originalCreateQuestionCard =
  createQuestionCard;


// =====================================================
// SIMPAN PERUBAHAN
// =====================================================

editSoalForm.addEventListener(
  'submit',
  async (event) => {

    event.preventDefault();


    const cards =
      questionContainer.querySelectorAll(
        '.question-card'
      );


    if (cards.length === 0) {

      alert(
        'Tidak ada soal untuk disimpan.'
      );

      return;

    }


    // -----------------------------------------------
    // Validasi stimulus
    // -----------------------------------------------

    const useStimulus =
      isStimulusMode;


    if (useStimulus) {

      const title =
        stimulusTitle.value.trim();

      const content =
        stimulusContent.value.trim();

      const image =
        stimulusImageUrl.value.trim();


      if (
        !title &&
        !content &&
        !image
      ) {

        alert(
          'Stimulus tidak boleh kosong seluruhnya.'
        );

        return;

      }

    }


    // -----------------------------------------------
    // Kumpulkan data
    // -----------------------------------------------

    const questionData =
      [];


    for (
      const card of cards
    ) {

      const questionIdValue =
        card.dataset.questionId;


      const isNew =
        questionIdValue.startsWith(
          'new-'
        );


      const questionText =
        card.querySelector(
          '.question-text'
        ).value.trim();


      const questionType =
        card.querySelector(
          '.question-type'
        ).value;


      const points =
        Number(
          card.querySelector(
            '.question-points'
          ).value
        );


      const optionRows =
        card.querySelectorAll(
          '.option-row'
        );


      const options =
        [];


      optionRows.forEach(
        (row, index) => {

          const label =
            getOptionLabel(
              index
            );


          const text =
            row.querySelector(
              '.option-text'
            ).value.trim();


          options.push({

            label,

            text

          });

        }
      );


      const correctAnswers =
        Array.from(
          card.querySelectorAll(
            '.correct-options input:checked'
          )
        ).map(
          input =>
            input.value
        );


      // ---------------------------------------------
      // Validasi pertanyaan
      // ---------------------------------------------

      if (!questionText) {

        alert(
          `Soal ${card.querySelector('.question-card-header h3').textContent} belum memiliki pertanyaan.`
        );

        return;

      }


      // ---------------------------------------------
      // Validasi bobot
      // ---------------------------------------------

      if (
        !Number.isFinite(points) ||
        points < 0
      ) {

        alert(
          `Bobot soal tidak valid.`
        );

        return;

      }


      // ---------------------------------------------
      // Validasi jumlah pilihan
      // ---------------------------------------------

      if (
        options.length < 4 ||
        options.length > 6
      ) {

        alert(
          `Setiap soal harus memiliki 4 sampai 6 pilihan.`
        );

        return;

      }


      // ---------------------------------------------
      // Validasi isi pilihan
      // ---------------------------------------------

      for (
        const option of options
      ) {

        if (!option.text) {

          alert(
            `Pilihan ${option.label} belum diisi.`
          );

          return;

        }

      }


      // ---------------------------------------------
      // Validasi jawaban
      // ---------------------------------------------

      if (
        questionType ===
        'multiple_choice'
      ) {

        if (
          correctAnswers.length !== 1
        ) {

          alert(
            `Pilihan Ganda harus memiliki tepat 1 jawaban benar.`
          );

          return;

        }

      } else {

        if (
          correctAnswers.length < 2
        ) {

          alert(
            `Pilihan Ganda Kompleks harus memiliki minimal 2 jawaban benar.`
          );

          return;

        }

      }


      questionData.push({

        card,

        questionId:
          questionIdValue,

        isNew,

        questionText,

        questionType,

        points,

        options,

        correctAnswers

      });

    }


    // -----------------------------------------------
    // Tombol loading
    // -----------------------------------------------

    simpanButton.disabled =
      true;

    simpanButton.textContent =
      'Menyimpan...';


    try {

      // =============================================
      // SIMPAN STIMULUS
      // =============================================

      if (useStimulus) {

        const {
          error: stimulusError
        } = await supabase
          .from('stimuli')
          .update({

            title:
              stimulusTitle.value.trim() ||
              null,

            content:
              stimulusContent.value.trim() ||
              null,

            image_url:
              stimulusImageUrl.value.trim() ||
              null

          })
          .eq(
            'id',
            stimulusId
          )
          .eq(
            'teacher_id',
            user.id
          );


        if (stimulusError) {

          throw new Error(
            'Gagal menyimpan stimulus: ' +
            stimulusError.message
          );

        }

      }


      // =============================================
      // SIMPAN SETIAP SOAL
      // =============================================

      let nextQuestionNumber =
        await getNextQuestionNumber();


      for (
        const item of questionData
      ) {

        // ===========================================
        // SOAL BARU
        // ===========================================

        if (item.isNew) {

          const {
            data: newQuestion,
            error: insertQuestionError
          } = await supabase
            .from('questions')
            .insert({

              teacher_id:
                user.id,

              question_text:
                item.questionText,

              question_type:
                item.questionType,

              points:
                item.points,

              stimulus_id:
                stimulusId

            })
            .select('id')
            .single();


          if (insertQuestionError) {

            throw new Error(
              'Gagal menambahkan soal baru: ' +
              insertQuestionError.message
            );

          }


          // -----------------------------------------
          // Simpan pilihan
          // -----------------------------------------

          const optionRows =
            item.options.map(
              option => ({

                question_id:
                  newQuestion.id,

                option_label:
                  option.label,

                option_text:
                  option.text,

                is_correct:
                  item.correctAnswers.includes(
                    option.label
                  )

              })
            );


          const {
            error: optionError
          } = await supabase
            .from('question_options')
            .insert(
              optionRows
            );


          if (optionError) {

            throw new Error(
              'Gagal menyimpan pilihan soal baru: ' +
              optionError.message
            );

          }


          // -----------------------------------------
          // Hubungkan ke asesmen
          // -----------------------------------------

          const {
            error: linkError
          } = await supabase
            .from('assessment_questions')
            .insert({

              assessment_id:
                assessmentId,

              question_id:
                newQuestion.id,

              question_number:
                nextQuestionNumber,

              points:
                item.points

            });


          if (linkError) {

            throw new Error(
              'Gagal menghubungkan soal baru ke asesmen: ' +
              linkError.message
            );

          }


          nextQuestionNumber++;

        } else {

          // =========================================
          // UPDATE SOAL LAMA
          // =========================================

          const {
            error: updateQuestionError
          } = await supabase
            .from('questions')
            .update({

              question_text:
                item.questionText,

              question_type:
                item.questionType,

              points:
                item.points

            })
            .eq(
              'id',
              item.questionId
            )
            .eq(
              'teacher_id',
              user.id
            );


          if (updateQuestionError) {

            throw new Error(
              'Gagal memperbarui soal: ' +
              updateQuestionError.message
            );

          }


          // -----------------------------------------
          // Ambil pilihan lama
          // -----------------------------------------

          const {
            data: oldOptions,
            error: oldOptionsError
          } = await supabase
            .from('question_options')
            .select(
              'id'
            )
            .eq(
              'question_id',
              item.questionId
            );


          if (oldOptionsError) {

            throw new Error(
              'Gagal mengambil pilihan lama: ' +
              oldOptionsError.message
            );

          }


          // -----------------------------------------
          // Hapus pilihan lama
          // -----------------------------------------

          if (
            oldOptions &&
            oldOptions.length > 0
          ) {

            const {
              error: deleteOptionsError
            } = await supabase
              .from('question_options')
              .delete()
              .eq(
                'question_id',
                item.questionId
              );


            if (deleteOptionsError) {

              throw new Error(
                'Gagal menghapus pilihan lama: ' +
                deleteOptionsError.message
              );

            }

          }


          // -----------------------------------------
          // Masukkan pilihan terbaru
          // -----------------------------------------

          const newOptionRows =
            item.options.map(
              option => ({

                question_id:
                  item.questionId,

                option_label:
                  option.label,

                option_text:
                  option.text,

                is_correct:
                  item.correctAnswers.includes(
                    option.label
                  )

              })
            );


          const {
            error: insertOptionsError
          } = await supabase
            .from('question_options')
            .insert(
              newOptionRows
            );


          if (insertOptionsError) {

            throw new Error(
              'Gagal menyimpan pilihan terbaru: ' +
              insertOptionsError.message
            );

          }


          // -----------------------------------------
          // Update bobot di asesmen
          // -----------------------------------------

          const {
            error: updateLinkError
          } = await supabase
            .from('assessment_questions')
            .update({

              points:
                item.points

            })
            .eq(
              'assessment_id',
              assessmentId
            )
            .eq(
              'question_id',
              item.questionId
            );


          if (updateLinkError) {

            throw new Error(
              'Gagal memperbarui bobot soal: ' +
              updateLinkError.message
            );

          }

        }

      }


      // =============================================
      // RAPATKAN NOMOR SOAL
      // =============================================

      await renumberAssessmentQuestions();


      // =============================================
      // BERHASIL
      // =============================================

      alert(
        useStimulus
          ? 'Berhasil menyimpan perubahan stimulus dan soal.'
          : 'Berhasil menyimpan perubahan soal.'
      );


      window.location.href =
        `kelola-soal.html?id=${assessmentId}`;


    } catch (error) {

      console.error(
        'Gagal menyimpan perubahan:',
        error
      );


      alert(
        error.message ||
        'Terjadi kesalahan saat menyimpan perubahan.'
      );


      simpanButton.disabled =
        false;

      simpanButton.textContent =
        '💾 Simpan Perubahan';

    }

  }
);


// =====================================================
// NOMOR SOAL BERIKUTNYA
// =====================================================

async function getNextQuestionNumber() {

  const {
    data,
    error
  } = await supabase
    .from('assessment_questions')
    .select(
      'question_number'
    )
    .eq(
      'assessment_id',
      assessmentId
    )
    .order(
      'question_number',
      {
        ascending: false
      }
    )
    .limit(1);


  if (error) {

    throw new Error(
      'Gagal menentukan nomor soal berikutnya: ' +
      error.message
    );

  }


  if (
    !data ||
    data.length === 0
  ) {

    return 1;

  }


  return (
    Number(
      data[0].question_number
    ) + 1
  );

}


// =====================================================
// RAPIKAN NOMOR SOAL DI ASESMEN
// =====================================================

async function renumberAssessmentQuestions() {

  const {
    data,
    error
  } = await supabase
    .from('assessment_questions')
    .select(
      'id'
    )
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

    throw new Error(
      'Gagal merapikan nomor soal: ' +
      error.message
    );

  }


  for (
    let index = 0;
    index < data.length;
    index++
  ) {

    const {
      error: updateError
    } = await supabase
      .from('assessment_questions')
      .update({

        question_number:
          index + 1

      })
      .eq(
        'id',
        data[index].id
      );


    if (updateError) {

      throw new Error(
        'Gagal mengubah nomor soal: ' +
        updateError.message
      );

    }

  }

}


// =====================================================
// PREVIEW GAMBAR STIMULUS
// =====================================================

stimulusImageUrl.addEventListener(
  'input',
  () => {

    updateStimulusPreview();

  }
);


// =====================================================
// BATAL
// =====================================================

batalButton.addEventListener(
  'click',
  () => {

    window.location.href =
      `kelola-soal.html?id=${assessmentId}`;

  }
);


// =====================================================
// KEMBALI
// =====================================================

kembaliButton.addEventListener(
  'click',
  () => {

    window.location.href =
      `kelola-soal.html?id=${assessmentId}`;

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
  user &&
  questionId &&
  assessmentId
) {

  await loadProfile();

  await loadAssessment();

  await loadQuestions();

}
