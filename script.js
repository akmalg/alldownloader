// --- Elemen DOM ---
const urlInput = document.getElementById('tiktok-url');
const downloadBtn = document.getElementById('download-btn');
const loader = document.getElementById('loader');
const resultDiv = document.getElementById('result');
const errorDiv = document.getElementById('error-message');

// --- Konfigurasi API (Milik Anda, sudah benar) ---
const API_KEY = '9a78c3b0f6msh9054d569a5963b2p1a524djsna749bd035cd5';
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

    const fullApiUrl = `${API_BASE_URL}?url=${encodeURIComponent(url)}`;

    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': API_KEY,
            'X-RapidAPI-Host': API_HOST
        }
    };

    try {
        const response = await fetch(fullApiUrl, options);
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `Gagal menghubungi API. Status: ${response.status}`);
        }
        const data = await response.json();

        // --- PERBAIKAN DI SINI ---
        // Kita sekarang memeriksa 'data.data.play'
        if (data.status === 'error' || !data.data || !data.data.play) {
             throw new Error(data.message || 'API tidak mengembalikan link video yang valid.');
        }

        // Jika berhasil, tampilkan hasilnya
        displayResult(data.data);

    } catch (error) {
        showError(error.message);
    } finally {
        loader.style.display = 'none';
    }
}

function displayResult(data) {
    // --- PERBAIKAN DI SINI ---
    // Kita sekarang mengambil link video dari 'data.play'
    const videoUrl = data.play; 
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