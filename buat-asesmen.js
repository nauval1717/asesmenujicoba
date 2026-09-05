import { supabase } from './supabase.js';

const teacherName = document.getElementById('teacherName');
const logoutButton = document.getElementById('logoutButton');

const subjectSelect = document.getElementById('subject');
const classSelect = document.getElementById('class');
const asesmenForm = document.getElementById('asesmenForm');


// ===============================
// CEK LOGIN
// ===============================

const { data: { user }, error: userError } =
  await supabase.auth.getUser();

if (userError || !user) {
  window.location.href = 'index.html';
}


// ===============================
// AMBIL PROFIL GURU
// ===============================

if (user) {

  const { data: profile, error: profileError } =
    await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

  if (!profileError && profile) {
    teacherName.textContent = profile.full_name;
  }

}


// ===============================
// AMBIL MATA PELAJARAN
// ===============================

async function loadSubjects() {

  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .order('name');

  if (error) {
    console.error('Gagal mengambil mata pelajaran:', error);
    return;
  }

  data.forEach(subject => {

    const option = document.createElement('option');

    option.value = subject.id;
    option.textContent = subject.name;

    subjectSelect.appendChild(option);

  });

}


// ===============================
// AMBIL KELAS
// ===============================

async function loadClasses() {

  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .order('name');

  if (error) {
    console.error('Gagal mengambil kelas:', error);
    return;
  }

  data.forEach(item => {

    const option = document.createElement('option');

    option.value = item.id;
    option.textContent = item.name;

    classSelect.appendChild(option);

  });

}


// Jalankan
await loadSubjects();
await loadClasses();


// ===============================
// SIMPAN ASESMEN
// ===============================

asesmenForm.addEventListener('submit', async (event) => {

  event.preventDefault();

  const title = document.getElementById('title').value.trim();
  const type = document.getElementById('type').value;
  const subjectId = subjectSelect.value;
  const classId = classSelect.value;
  const description =
    document.getElementById('description').value.trim();

  const durationValue =
    document.getElementById('duration').value;

  const durationMinutes =
    durationValue ? Number(durationValue) : null;


  if (!title || !type || !subjectId || !classId) {

    alert('Mohon lengkapi data asesmen.');

    return;
  }


  const { error } = await supabase
    .from('assessments')
    .insert({

      teacher_id: user.id,
      subject_id: subjectId,
      class_id: classId,

      title: title,
      type: type,

      description: description || null,

      duration_minutes: durationMinutes,

      status: 'draft'

    });


  if (error) {

    console.error(error);

    alert('Gagal menyimpan asesmen: ' + error.message);

    return;
  }


  alert('Asesmen berhasil dibuat.');

  window.location.href = 'asesmen.html';

});


// ===============================
// LOGOUT
// ===============================

logoutButton.addEventListener('click', async () => {

  const { error } = await supabase.auth.signOut();

  if (error) {

    alert('Gagal keluar: ' + error.message);

    return;
  }

  window.location.href = 'index.html';

});
