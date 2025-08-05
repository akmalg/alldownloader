// --- Elemen DOM ---
const urlInput = document.getElementById('tiktok-url');
const downloadBtn = document.getElementById('download-btn');
const loader = document.getElementById('loader');
const resultDiv = document.getElementById('result');
const errorDiv = document.getElementById('error-message');

// --- Konfigurasi API (Diambil dari screenshot Anda) ---
const API_KEY = '7ca2049d59msh55c6b0de88a2cd3p1d7704jsn0047b6556610';
const API_HOST = 'tiktok-download-without-watermark.p.rapidapi.com';
const API_BASE_URL = 'https://tiktok-download-without-watermark.p.rapidapi.com/analysis';

// --- Event Listener ---
downloadBtn.addEventListener('click', handleDownload);

async function handleDownload() {
    const url = urlInput.value.trim();
    if (!url) {
        showError('Silakan masukkan URL TikTok.');
        return;
    }

    // Tampilkan loader dan bersihkan hasil sebelumnya
    loader.style.display = 'block';
    resultDiv.innerHTML = '';
    errorDiv.textContent = '';

    // URL lengkap dengan parameter query untuk metode GET
    const fullApiUrl = `${API_BASE_URL}?url=${encodeURIComponent(url)}`;

    // Opsi untuk request ke API (sekarang menggunakan GET)
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': API_KEY,
            'X-RapidAPI-Host': API_HOST
        }
        // Tidak ada 'body' karena ini adalah request GET
    };

    try {
        const response = await fetch(fullApiUrl, options);
        if (!response.ok) {
            // Coba baca pesan error dari API jika ada
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `Gagal menghubungi API. Status: ${response.status}`);
        }
        const data = await response.json();

        // Cek jika API mengembalikan status 'error' atau data tidak valid
        if (data.status === 'error' || !data.data || !data.data.videos || !data.data.videos[0]) {
             throw new Error(data.message || 'API tidak mengembalikan link video yang valid.');
        }

        // Jika berhasil, tampilkan hasilnya
        displayResult(data.data);

    } catch (error) {
        showError(error.message);
    } finally {
        // Sembunyikan loader setelah selesai
        loader.style.display = 'none';
    }
}

function displayResult(data) {
    // PENTING: Struktur ini ('data.videos[0]') disesuaikan dari pola umum API sejenis.
    // Cek tab "Example Responses" di RapidAPI untuk memastikan path-nya benar.
    const videoUrl = data.videos[0]; 
    const videoTitle = data.title || 'tiktok-video';

    resultDiv.innerHTML = `
        <h3>${videoTitle}</h3>
        <video controls src="${videoUrl}" type="video/mp4"></video>
        <a href="${videoUrl}" class="download-link" download="${videoTitle}.mp4" target="_blank">
            ⬇️ Simpan Video
        </a>
    `;
}

function showError(message) {
    errorDiv.textContent = `Terjadi Kesalahan: ${message}`;
}