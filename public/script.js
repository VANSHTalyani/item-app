const viewPage = document.getElementById('viewItemsPage');
const addPage = document.getElementById('addItemsPage');

document.getElementById('navHome').addEventListener('click', () => {
  viewPage.style.display = 'block';
  addPage.style.display = 'none';
  loadItems();
});

document.getElementById('navAdd').addEventListener('click', () => {
  viewPage.style.display = 'none';
  addPage.style.display = 'block';
});

async function loadItems() {
  const container = document.getElementById('itemsContainer');
  container.innerHTML = '';
  const res = await axios.get('/api/items');
  res.data.forEach((item) => {
    const col = document.createElement('div');
    col.className = 'col-md-3 mb-3';
    col.innerHTML = `<div class="card" data-id="${item.id}"><img src="/uploads/${item.cover_image}" class="card-img-top"><div class="card-body"><h5 class="card-title">${item.name}</h5></div></div>`;
    col.querySelector('.card').addEventListener('click', () => showModal(item));
    container.appendChild(col);
  });
}

document.getElementById('addItemForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const res = await axios.post('/api/items', formData);
  if (res.status === 200) {
    document.getElementById('successMsg').classList.remove('d-none');
    e.target.reset();
    loadItems();
  }
});

function showModal(item) {
  const titleEl = document.getElementById('modalTitle');
  titleEl.innerText = `${item.name} (${item.type})`;
  titleEl.dataset.id = item.id;
  document.getElementById('modalDescription').innerText = item.description;
  const carouselInner = document.getElementById('carouselInner');
  carouselInner.innerHTML = '';
  const images = [item.cover_image, ...item.additional_images];
  images.forEach((img, idx) => {
    const div = document.createElement('div');
    div.className = 'carousel-item' + (idx === 0 ? ' active' : '');
    div.innerHTML = `<img src="/uploads/${img}" class="d-block w-100 view-full" data-src="/uploads/${img}" />`;
    carouselInner.appendChild(div);
  });
  const imgModalEl = document.getElementById('imgModal');
const imgModalInstance = new bootstrap.Modal(imgModalEl, { keyboard: true });
// attach click for full view
  carouselInner.querySelectorAll('.view-full').forEach(imgEl => {
    imgEl.addEventListener('click', () => {
      document.getElementById('fullImage').src = imgEl.dataset.src;
      new bootstrap.Modal(document.getElementById('imgModal')).show();
    });
  });
  const modal = new bootstrap.Modal(document.getElementById('itemModal'));
  modal.show();
}

// enquire - open mail client
document.getElementById('enquireBtn').addEventListener('click', async () => {
  const email = prompt('Enter your email for enquiry:');
  if (!email) return;
  const itemId = document.querySelector('#itemModal .modal-title').dataset.id;
  try {
    await axios.post('/api/enquire', { itemId, email });
    alert('Enquiry sent!');
  } catch (e) {
    alert('Failed to send enquiry');
  }
});

// initial load
loadItems();
