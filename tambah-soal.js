import { supabase } from './supabase.js';


// ===============================
// ELEMENT HALAMAN
// ===============================

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

const batalButton =
  document.getElementById('batalButton');

const stimulusSelect =
  document.getElementById('stimulusSelect');

const buatStimulusButton =
  document.getElementById('buatStimulusButton');

const batalStimulusButton =
  document.getElementById('batalStimulusButton');

const simpanStimulusButton =
  document.getElementById('simpanStimulusButton');

const stimulusFormContainer =
  document.getElementById('stimulusFormContainer');

const stimulusTitle =
  document.getElementById('stimulusTitle');

const stimulusContent =
  document.getElementById('stimulusContent');

const stimulusImageUrl =
  document.getElementById('stimulusImageUrl');


// ===============================
// AMBIL ID ASESMEN
// ===============================

const params =
  new URLSearchParams(window.location.search);

const assessmentId =
  params.get('id');


// ===============================
// CEK LOGIN
// ===============================

const {
  data: { user },
  error: userError
} = await supabase.auth.getUser();


if (userError || !user) {

  window.location.href =
    'index.html';

}


// ===============================
// CEK ID ASESMEN
// ===============================

if (!assessmentId) {

  alert(
    'ID asesmen tidak ditemukan.'
  );

  window.location.href =
    'asesmen.html';

}


// ===============================
// NAMA GURU
// ===============================

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


// ===============================
// NAMA JENIS ASESMEN
// ===============================

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


// ===============================
// AMBIL DATA ASESMEN
// ===============================

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


// ===============================
// AMBIL DAFTAR STIMULUS
// ===============================

async function loadStimuli() {

  const {
    data,
    error
  } = await supabase
    .from('stimuli')
    .select(`
      id,
      title,
      content,
      image_url
    `)
    .eq('teacher_id', user.id)
    .order('created_at', {
      ascending: false
    });


  if (error) {

    console.error(
      'Gagal mengambil stimulus:',
      error
    );

    return;

  }


  stimulusSelect.innerHTML = `
    <option value="">
      -- Soal tanpa stimulus --
    </option>
  `;


  if (!data || data.length === 0) {

    return;

  }


  data.forEach((stimulus) => {

    const option =
      document.createElement('option');


    option.value =
      stimulus.id;


    option.textContent =
      stimulus.title ||
      'Stimulus tanpa judul';


    stimulusSelect.appendChild(option);

  });

}


// ===============================
// TAMPILKAN FORM STIMULUS
// ===============================

buatStimulusButton.addEventListener(
  'click',
  () => {

    stimulusFormContainer.style.display =
      'block';

    stimulusTitle.focus();

  }
);


// ===============================
// BATAL MEMBUAT STIMULUS
// ===============================

batalStimulusButton.addEventListener(
  'click',
  () => {

    stimulusFormContainer.style.display =
      'none';


    stimulusTitle.value =
      '';

    stimulusContent.value =
      '';

    stimulusImageUrl.value =
      '';

  }
);


// ===============================
// SIMPAN STIMULUS BARU
// ===============================

simpanStimulusButton.addEventListener(
  'click',
  async () => {

    const title =
      stimulusTitle.value.trim();

    const content =
      stimulusContent.value.trim();

    const imageUrl =
      stimulusImageUrl.value.trim();


    if (!title && !content && !imageUrl) {

      alert(
        'Silakan isi minimal judul atau isi stimulus.'
      );

      return;

    }


    simpanStimulusButton.disabled =
      true;

    simpanStimulusButton.textContent =
      'Menyimpan...';


    const {
      data: stimulus,
      error
    } = await supabase
      .from('stimuli')
      .insert({

        teacher_id:
          user.id,

        title:
          title || null,

        content:
          content || null,

        image_url:
          imageUrl || null

      })
      .select(`
        id,
        title
      `)
      .single();


    if (error) {

      console.error(
        'Gagal menyimpan stimulus:',
        error
      );

      alert(
        'Gagal menyimpan stimulus: ' +
        error.message
      );


      simpanStimulusButton.disabled =
        false;

      simpanStimulusButton.textContent =
        'Simpan Stimulus';

      return;

    }


    // Muat ulang daftar stimulus
    await loadStimuli();


    // Pilih stimulus yang baru dibuat
    stimulusSelect.value =
      stimulus.id;


    // Bersihkan form
    stimulusTitle.value =
      '';

    stimulusContent.value =
      '';

    stimulusImageUrl.value =
      '';


    // Sembunyikan form
    stimulusFormContainer.style.display =
      'none';


    simpanStimulusButton.disabled =
      false;

    simpanStimulusButton.textContent =
      'Simpan Stimulus';


    alert(
      'Stimulus berhasil dibuat dan dipilih.'
    );

  }
);


// ===============================
// BATAL TAMBAH SOAL
// ===============================

batalButton.addEventListener(
  'click',
  () => {

    window.location.href =
      `kelola-soal.html?id=${assessmentId}`;

  }
);


// ===============================
// SIMPAN SOAL
// ===============================

soalForm.addEventListener(
  'submit',
  async (event) => {

    event.preventDefault();


    const questionText =
      document
        .getElementById('questionText')
        .value
        .trim();


    const optionA =
      document
        .getElementById('optionA')
        .value
        .trim();


    const optionB =
      document
        .getElementById('optionB')
        .value
        .trim();


    const optionC =
      document
        .getElementById('optionC')
        .value
        .trim();


    const optionD =
      document
        .getElementById('optionD')
        .value
        .trim();


    const correctAnswer =
      document
        .getElementById('correctAnswer')
        .value;


    const points =
      Number(
        document
          .getElementById('points')
          .value
      );


    const stimulusId =
      stimulusSelect.value || null;


    // ===============================
    // VALIDASI
    // ===============================

    if (
      !questionText ||
      !optionA ||
      !optionB ||
      !optionC ||
      !optionD ||
      !correctAnswer ||
      !Number.isFinite(points) ||
      points < 0
    ) {

      alert(
        'Mohon lengkapi data soal.'
      );

      return;

    }


    // ===============================
    // NONAKTIFKAN TOMBOL
    // ===============================

    const submitButton =
      soalForm.querySelector(
        'button[type="submit"]'
      );


    submitButton.disabled =
      true;

    submitButton.textContent =
      'Menyimpan...';


    // ===============================
    // SIMPAN SOAL
    // ===============================

    const {
      data: question,
      error: questionError
    } = await supabase
      .from('questions')
      .insert({

        teacher_id:
          user.id,

        question_text:
          questionText,

        question_type:
          'multiple_choice',

        points:
          points,

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
        'Simpan Soal';

      return;

    }


    // ===============================
    // SIMPAN PILIHAN JAWABAN
    // ===============================

    const options = [

      {
        question_id:
          question.id,

        option_label:
          'A',

        option_text:
          optionA,

        is_correct:
          correctAnswer === 'A'
      },

      {
        question_id:
          question.id,

        option_label:
          'B',

        option_text:
          optionB,

        is_correct:
          correctAnswer === 'B'
      },

      {
        question_id:
          question.id,

        option_label:
          'C',

        option_text:
          optionC,

        is_correct:
          correctAnswer === 'C'
      },

      {
        question_id:
          question.id,

        option_label:
          'D',

        option_text:
          optionD,

        is_correct:
          correctAnswer === 'D'
      }

    ];


    const {
      error: optionsError
    } = await supabase
      .from('question_options')
      .insert(options);


    if (optionsError) {

      console.error(
        'Gagal menyimpan pilihan jawaban:',
        optionsError
      );


      await supabase
        .from('questions')
        .delete()
        .eq('id', question.id);


      alert(
        'Gagal menyimpan pilihan jawaban: ' +
        optionsError.message
      );


      submitButton.disabled =
        false;

      submitButton.textContent =
        'Simpan Soal';

      return;

    }


    // ===============================
    // TENTUKAN NOMOR SOAL
    // ===============================

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


      await supabase
        .from('questions')
        .delete()
        .eq('id', question.id);


      alert(
        'Gagal menentukan nomor soal: ' +
        countError.message
      );


      submitButton.disabled =
        false;

      submitButton.textContent =
        'Simpan Soal';

      return;

    }


    const nextNumber =
      (count || 0) + 1;


    // ===============================
    // HUBUNGKAN SOAL KE ASESMEN
    // ===============================

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
          points

      });


    if (linkError) {

      console.error(
        'Gagal menghubungkan soal ke asesmen:',
        linkError
      );


      await supabase
        .from('questions')
        .delete()
        .eq('id', question.id);


      alert(
        'Gagal menghubungkan soal ke asesmen: ' +
        linkError.message
      );


      submitButton.disabled =
        false;

      submitButton.textContent =
        'Simpan Soal';

      return;

    }


    // ===============================
    // BERHASIL
    // ===============================

    alert(
      'Soal berhasil disimpan.'
    );


    window.location.href =
      `kelola-soal.html?id=${assessmentId}`;

  }
);


// ===============================
// LOGOUT
// ===============================

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


// ===============================
// JALANKAN HALAMAN
// ===============================

if (assessmentId && user) {

  await loadAssessment();

  await loadStimuli();

}
