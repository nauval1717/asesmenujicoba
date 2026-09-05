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

const soalForm =
  document.getElementById('soalForm');

const creationMode =
  document.getElementById('creationMode');

const stimulusSection =
  document.getElementById('stimulusSection');

const questionContainer =
  document.getElementById('questionContainer');

const tambahSoalButton =
  document.getElementById('tambahSoalButton');

const batalButton =
  document.getElementById('batalButton');

const stimulusTitle =
  document.getElementById('stimulusTitle');

const stimulusContent =
  document.getElementById('stimulusContent');

const stimulusImageUrl =
  document.getElementById('stimulusImageUrl');

const stimulusImagePreview =
  document.getElementById('stimulusImagePreview');


// =====================================================
// AMBIL ID ASESMEN
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


// =====================================================
// CEK ID ASESMEN
// =====================================================

if (!assessmentId) {

  alert(
    'ID asesmen tidak ditemukan.'
  );

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
// PILIH MODE
// =====================================================

creationMode.addEventListener(
  'change',
  () => {

    if (
      creationMode.value ===
      'stimulus'
    ) {

      stimulusSection.classList.remove(
        'hidden'
      );

    } else {

      stimulusSection.classList.add(
        'hidden'
      );

      stimulusTitle.value = '';
      stimulusContent.value = '';
      stimulusImageUrl.value = '';

      if (stimulusImagePreview) {

        stimulusImagePreview.style.display =
          'none';

        stimulusImagePreview.src =
          '';

      }

    }

  }
);


// =====================================================
// PREVIEW GAMBAR STIMULUS
// =====================================================

if (stimulusImageUrl) {

  stimulusImageUrl.addEventListener(
    'input',
    () => {

      const url =
        stimulusImageUrl.value.trim();

      if (!stimulusImagePreview) {
        return;
      }

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
  );

}


// =====================================================
// DATA PILIHAN
// =====================================================

function getOptionLabel(index) {

  return String.fromCharCode(
    65 + index
  );

}


// =====================================================
// BUAT FORM SOAL
// =====================================================

function createQuestionCard(questionNumber) {

  const card =
    document.createElement('div');

  card.className =
    'question-card';

  card.dataset.questionNumber =
    questionNumber;


  card.innerHTML = `

    <div class="question-card-header">

      <h3>
        Soal ${questionNumber}
      </h3>

      ${
        questionNumber > 1
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


    <!-- JENIS SOAL -->

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


    <!-- PERTANYAAN -->

    <div class="form-group">

      <label>
        Pertanyaan
      </label>

      <textarea
        class="question-text"
        rows="5"
        placeholder="Tuliskan pertanyaan..."
        required
      ></textarea>

    </div>


    <!-- GAMBAR SOAL -->

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
        Gambar soal bersifat opsional.
        Upload gambar langsung akan dibuat pada tahap berikutnya.
      </small>

      <img
        class="image-preview question-image-preview"
        alt="Preview gambar soal"
      >

    </div>


    <!-- PILIHAN -->

    <div class="form-group">

      <label>
        Pilihan Jawaban
      </label>

      <div class="options-container">
      </div>

    </div>


    <!-- TAMBAH PILIHAN -->

    <div class="form-actions">

      <button
        type="button"
        class="secondary-button add-option-button"
      >
        + Tambah Pilihan
      </button>

    </div>


    <!-- JAWABAN BENAR -->

    <div class="form-group">

      <label>
        Jawaban Benar
      </label>

      <div class="correct-options">
      </div>

      <small class="correct-help">
        Pilih satu jawaban yang benar.
      </small>

    </div>


    <!-- BOBOT -->

    <div class="form-group">

      <label>
        Bobot Soal
      </label>

      <input
        type="number"
        class="question-points"
        value="1"
        min="0"
        step="0.1"
        required
      >

    </div>

  `;


  questionContainer.appendChild(
    card
  );


  // -------------------------------------------------
  // TAMBAH 4 PILIHAN AWAL
  // -------------------------------------------------

  const optionsContainer =
    card.querySelector(
      '.options-container'
    );

  for (
    let i = 0;
    i < 4;
    i++
  ) {

    addOption(
      card
    );

  }


  // -------------------------------------------------
  // EVENT JENIS SOAL
  // -------------------------------------------------

  const questionType =
    card.querySelector(
      '.question-type'
    );

  questionType.addEventListener(
    'change',
    () => {

      updateCorrectOptions(
        card
      );

    }
  );


  // -------------------------------------------------
  // EVENT TAMBAH PILIHAN
  // -------------------------------------------------

  const addOptionButton =
    card.querySelector(
      '.add-option-button'
    );

  addOptionButton.addEventListener(
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
        card
      );

    }
  );


  // -------------------------------------------------
  // EVENT HAPUS SOAL
  // -------------------------------------------------

  const removeQuestionButton =
    card.querySelector(
      '.remove-question-button'
    );

  if (removeQuestionButton) {

    removeQuestionButton.addEventListener(
      'click',
      () => {

        card.remove();

        renumberQuestions();

      }
    );

  }


  // -------------------------------------------------
  // UPDATE JAWABAN BENAR
  // -------------------------------------------------

  updateCorrectOptions(
    card
  );

}


// =====================================================
// TAMBAH PILIHAN
// =====================================================

function addOption(card) {

  const optionsContainer =
    card.querySelector(
      '.options-container'
    );

  const optionCount =
    optionsContainer.querySelectorAll(
      '.option-row'
    ).length;

  if (optionCount >= 6) {

    alert(
      'Maksimal 6 pilihan jawaban.'
    );

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


  // -------------------------------------------------
  // PREVIEW GAMBAR PILIHAN
  // -------------------------------------------------

  const imageInput =
    row.querySelector(
      '.option-image-url'
    );

  const imagePreview =
    row.querySelector(
      '.option-image-preview'
    );

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


  // -------------------------------------------------
  // HAPUS PILIHAN
  // -------------------------------------------------

  const removeButton =
    row.querySelector(
      '.remove-option-button'
    );

  if (removeButton) {

    removeButton.addEventListener(
      'click',
      () => {

        row.remove();

        renumberOptions(
          card
        );

      }
    );

  }


  updateCorrectOptions(
    card
  );

}


// =====================================================
// NOMOR ULANG PILIHAN
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

      const textInput =
        row.querySelector(
          '.option-text'
        );

      textInput.placeholder =
        `Masukkan pilihan ${label}`;

    }
  );


  updateCorrectOptions(
    card
  );

}


// =====================================================
// JAWABAN BENAR
// =====================================================

function updateCorrectOptions(card) {

  const container =
    card.querySelector(
      '.correct-options'
    );

  const questionType =
    card.querySelector(
      '.question-type'
    ).value;

  const rows =
    card.querySelectorAll(
      '.option-row'
    );


  container.innerHTML =
    '';


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
        `correct-${card.dataset.questionNumber}`;


      input.value =
        label;


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
// NOMOR ULANG SOAL
// =====================================================

function renumberQuestions() {

  const cards =
    questionContainer.querySelectorAll(
      '.question-card'
    );

  cards.forEach(
    (card, index) => {

      const number =
        index + 1;

      card.dataset.questionNumber =
        number;

      const title =
        card.querySelector(
          '.question-card-header h3'
        );

      title.textContent =
        `Soal ${number}`;

      const removeButton =
        card.querySelector(
          '.remove-question-button'
        );

      if (number === 1) {

        if (removeButton) {

          removeButton.remove();

        }

      } else {

        if (!removeButton) {

          const button =
            document.createElement(
              'button'
            );

          button.type =
            'button';

          button.className =
            'danger-button remove-question-button';

          button.textContent =
            'Hapus Soal';

          button.addEventListener(
            'click',
            () => {

              card.remove();

              renumberQuestions();

            }
          );

          card
            .querySelector(
              '.question-card-header'
            )
            .appendChild(
              button
            );

        }

      }

    }
  );

}


// =====================================================
// TAMBAH SOAL
// =====================================================

tambahSoalButton.addEventListener(
  'click',
  () => {

    const number =
      questionContainer.querySelectorAll(
        '.question-card'
      ).length + 1;

    createQuestionCard(
      number
    );

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
// SIMPAN SOAL
// =====================================================

soalForm.addEventListener(
  'submit',
  async (event) => {

    event.preventDefault();


    const cards =
      questionContainer.querySelectorAll(
        '.question-card'
      );


    if (cards.length === 0) {

      alert(
        'Belum ada soal.'
      );

      return;

    }


    // -------------------------------------------------
    // VALIDASI STIMULUS
    // -------------------------------------------------

    const useStimulus =
      creationMode.value ===
      'stimulus';


    const stimulusTitleValue =
      stimulusTitle.value.trim();

    const stimulusContentValue =
      stimulusContent.value.trim();

    const stimulusImageValue =
      stimulusImageUrl.value.trim();


    if (useStimulus) {

      if (
        !stimulusTitleValue &&
        !stimulusContentValue &&
        !stimulusImageValue
      ) {

        alert(
          'Silakan isi minimal judul, isi, atau gambar stimulus.'
        );

        return;

      }

    }


    // -------------------------------------------------
    // KUMPULKAN DATA SOAL
    // -------------------------------------------------

    const questionData =
      [];


    for (
      const card of cards
    ) {

      const questionText =
        card
          .querySelector(
            '.question-text'
          )
          .value
          .trim();


      const questionType =
        card
          .querySelector(
            '.question-type'
          )
          .value;


      const questionImageUrl =
        card
          .querySelector(
            '.question-image-url'
          )
          .value
          .trim();


      const points =
        Number(
          card
            .querySelector(
              '.question-points'
            )
            .value
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
            row
              .querySelector(
                '.option-text'
              )
              .value
              .trim();


          const imageUrl =
            row
              .querySelector(
                '.option-image-url'
              )
              .value
              .trim();


          options.push({
            label,
            text,
            imageUrl
          });

        }
      );


      const selectedCorrect =
        Array.from(
          card.querySelectorAll(
            '.correct-options input:checked'
          )
        ).map(
          input =>
            input.value
        );


      // -------------------------------------------------
      // VALIDASI
      // -------------------------------------------------

      if (!questionText) {

        alert(
          `Pertanyaan pada Soal ${card.dataset.questionNumber} belum diisi.`
        );

        return;

      }


      if (
        !Number.isFinite(points) ||
        points < 0
      ) {

        alert(
          `Bobot pada Soal ${card.dataset.questionNumber} tidak valid.`
        );

        return;

      }


      if (
        options.length < 4 ||
        options.length > 6
      ) {

        alert(
          `Soal ${card.dataset.questionNumber} harus memiliki 4 sampai 6 pilihan.`
        );

        return;

      }


      for (
        const option of options
      ) {

        if (!option.text) {

          alert(
            `Pilihan ${option.label} pada Soal ${card.dataset.questionNumber} belum diisi.`
          );

          return;

        }

      }


      if (
        questionType ===
        'multiple_choice'
      ) {

        if (
          selectedCorrect.length !== 1
        ) {

          alert(
            `Soal ${card.dataset.questionNumber} harus memiliki tepat 1 jawaban benar.`
          );

          return;

        }

      } else {

        if (
          selectedCorrect.length < 2
        ) {

          alert(
            `Soal ${card.dataset.questionNumber} harus memiliki minimal 2 jawaban benar.`
          );

          return;

        }

      }


      questionData.push({

        questionText,

        questionType,

        questionImageUrl,

        points,

        options,

        selectedCorrect

      });

    }


    // -------------------------------------------------
    // DISABLE TOMBOL
    // -------------------------------------------------

    const submitButton =
      soalForm.querySelector(
        'button[type="submit"]'
      );


    submitButton.disabled =
      true;

    submitButton.textContent =
      'Menyimpan...';


    let stimulusId =
      null;


    // =================================================
    // SIMPAN STIMULUS
    // =================================================

    if (useStimulus) {

      const {
        data: stimulus,
        error: stimulusError
      } = await supabase
        .from('stimuli')
        .insert({

          teacher_id:
            user.id,

          title:
            stimulusTitleValue ||
            null,

          content:
            stimulusContentValue ||
            null,

          image_url:
            stimulusImageValue ||
            null

        })
        .select('id')
        .single();


      if (stimulusError) {

        console.error(
          'Gagal menyimpan stimulus:',
          stimulusError
        );

        alert(
          'Gagal menyimpan stimulus: ' +
          stimulusError.message
        );

        submitButton.disabled =
          false;

        submitButton.textContent =
          '💾 Simpan Soal';

        return;

      }


      stimulusId =
        stimulus.id;

    }


    // =================================================
    // CARI NOMOR SOAL BERIKUTNYA
    // =================================================

    const {
      count,
      error: countError
    } = await supabase
      .from('assessment_questions')
      .select(
        'id',
        {
          count: 'exact',
          head: true
        }
      )
      .eq(
        'assessment_id',
        assessmentId
      );


    if (countError) {

      console.error(
        'Gagal menentukan nomor soal:',
        countError
      );

      alert(
        'Gagal menentukan nomor soal: ' +
        countError.message
      );

      submitButton.disabled =
        false;

      submitButton.textContent =
        '💾 Simpan Soal';

      return;

    }


    let nextNumber =
      (count || 0) + 1;


    const savedQuestionIds =
      [];


    // =================================================
    // SIMPAN SEMUA SOAL
    // =================================================

    for (
      const item of questionData
    ) {


      // ------------------------------------------------
      // SIMPAN SOAL
      // ------------------------------------------------

      const {
        data: question,
        error: questionError
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


      if (questionError) {

        console.error(
          'Gagal menyimpan soal:',
          questionError
        );

        alert(
          'Gagal menyimpan soal: ' +
          questionError.message
        );

        submitButton.disabled =
          false;

        submitButton.textContent =
          '💾 Simpan Soal';

        return;

      }


      savedQuestionIds.push(
        question.id
      );


      // ------------------------------------------------
      // SIMPAN PILIHAN
      // ------------------------------------------------

      const options =
        item.options.map(
          option => ({

            question_id:
              question.id,

            option_label:
              option.label,

            option_text:
              option.text,

            is_correct:
              item.selectedCorrect.includes(
                option.label
              )

          })
        );


      const {
        error: optionsError
      } = await supabase
        .from('question_options')
        .insert(
          options
        );


      if (optionsError) {

        console.error(
          'Gagal menyimpan pilihan:',
          optionsError
        );

        await supabase
          .from('questions')
          .delete()
          .eq(
            'id',
            question.id
          );


        alert(
          'Gagal menyimpan pilihan jawaban: ' +
          optionsError.message
        );

        submitButton.disabled =
          false;

        submitButton.textContent =
          '💾 Simpan Soal';

        return;

      }


      // ------------------------------------------------
      // SIMPAN KE ASESMEN
      // ------------------------------------------------

      const {
        error: linkError
      } = await supabase
        .from('assessment_questions')
        .insert({

          assessment_id:
            assessmentId,

          question_id:
            question.id,

          question_number:
            nextNumber,

          points:
            item.points

        });


      if (linkError) {

        console.error(
          'Gagal menghubungkan soal:',
          linkError
        );

        await supabase
          .from('questions')
          .delete()
          .eq(
            'id',
            question.id
          );


        alert(
          'Gagal menghubungkan soal ke asesmen: ' +
          linkError.message
        );

        submitButton.disabled =
          false;

        submitButton.textContent =
          '💾 Simpan Soal';

        return;

      }


      nextNumber++;

    }


    // =================================================
    // BERHASIL
    // =================================================

    alert(
      useStimulus
        ? `Berhasil menyimpan stimulus dan ${questionData.length} soal.`
        : `Berhasil menyimpan ${questionData.length} soal.`
    );


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
// MULAI DENGAN 1 SOAL
// =====================================================

if (
  assessmentId &&
  user
) {

  await loadAssessment();

  createQuestionCard(1);

}
