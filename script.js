// --- Elemen DOM ---
const urlInput = document.getElementById('video-url');
const downloadBtn = document.getElementById('download-btn');
const loader = document.getElementById('loader');
const resultDiv = document.getElementById('result');
const errorDiv = document.getElementById('error-message');

// --- Konfigurasi API TikTok (Tidak berubah) ---
const TIKTOK_API_KEY = '9a78c3b0f6msh9054d569a5963b2p1a524djsna749bd035cd5';
const TIKTOK_API_HOST = 'tiktok-download-without-watermark.p.rapidapi.com';
const TIKTOK_API_URL = 'https://tiktok-download-without-watermark.p.rapidapi.com/analysis';

// --- Konfigurasi API Facebook (Tidak berubah) ---
const FACEBOOK_API_KEY = '46b7910bf4msh2cd727db39747b6p1a897djsn99d4bab356b4';
const FACEBOOK_API_HOST = 'free-facebook-downloader.p.rapidapi.com';
const FACEBOOK_API_URL = 'https://free-facebook-downloader.p.rapidapi.com/external-api/facebook-video-downloader';

// --- Fungsi Universal untuk Memaksa Download ---
async function forceDownload(url, fileName) {
    const statusElement = document.getElementById('download-status');
    if (!statusElement) return;
    try {
        statusElement.textContent = 'Mengunduh data video... (Mungkin perlu waktu)';
        statusElement.style.display = 'block';
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = blobUrl;
        anchor.download = fileName;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        window.URL.revokeObjectURL(blobUrl);
        statusElement.textContent = 'Download dimulai!';
    } catch (err) {
        statusElement.textContent = 'Gagal mengunduh file. Browser Anda mungkin memblokirnya.';
        console.error(err);
    }
}

// --- Fungsi Universal untuk Menampilkan Error ---
function showError(message) {
    errorDiv.textContent = `Terjadi Kesalahan: ${message}`;
}

// --- Logika Utama (Deteksi Otomatis) ---
downloadBtn.addEventListener('click', () => {
    const url = urlInput.value.trim();
    if (!url) {
        showError('Silakan masukkan URL video terlebih dahulu.');
        return;
    }
    loader.style.display = 'block';
    resultDiv.innerHTML = '';
    errorDiv.textContent = '';

    if (url.includes('tiktok.com')) {
        fetchTikTok(url);
    } else if (url.includes('facebook.com') || url.includes('fb.watch')) {
        fetchFacebook(url);
    } else {
        showError('URL tidak didukung. Harap masukkan link dari TikTok atau Facebook.');
        loader.style.display = 'none';
    }
});


// --- Fetcher Khusus TikTok ---
async function fetchTikTok(url) {
    const fullApiUrl = `${TIKTOK_API_URL}?url=${encodeURIComponent(url)}`;
    const options = {
        method: 'GET',
        headers: { 'X-RapidAPI-Key': TIKTOK_API_KEY, 'X-RapidAPI-Host': TIKTOK_API_HOST }
    };
    try {
        const response = await fetch(fullApiUrl, options);
        if (!response.ok) throw new Error(`API TikTok merespons dengan error.`);
        const data = await response.json();
        if (data.status === 'error' || !data.data || !data.data.play) {
             throw new Error('API TikTok tidak mengembalikan link video yang valid.');
        }
        displayTikTokResult(data.data);
    } catch (error) { showError(error.message); } finally { loader.style.display = 'none'; }
}

// --- Fetcher Khusus Facebook ---
async function fetchFacebook(url) {
    const fullApiUrl = `${FACEBOOK_API_URL}?url=${encodeURIComponent(url)}`;
    const options = {
        method: 'POST',
        headers: {
            'X-RapidAPI-Key': FACEBOOK_API_KEY,
            'X-RapidAPI-Host': FACEBOOK_API_HOST
        }
    };
    try {
        const response = await fetch(fullApiUrl, options);
        if (!response.ok) throw new Error(`API Facebook merespons dengan error.`);
        const data = await response.json();
        
        // --- PERBAIKAN DI SINI ---
        // Kita cek struktur yang benar: data.links['Download Low Quality']
        if (!data.success || !data.links || !data.links["Download Low Quality"]) {
            throw new Error('API Facebook tidak menemukan link unduhan.');
        }
        displayFacebookResult(data);
    } catch (error) { showError(error.message); } finally { loader.style.display = 'none'; }
}


// --- Display Result Khusus TikTok ---
function displayTikTokResult(data) {
    const videoUrl = data.play; 
    const videoTitle = data.title || 'tiktok-video';
    const safeFileName = videoTitle.replace(/[^a-z0-9_.-]/gi, '_').substring(0, 50);

    resultDiv.innerHTML = `
        <h3>${videoTitle}</h3>
        <video controls src="${videoUrl}" type="video/mp4"></video>
        <button id="force-download-btn" class="download-link">⬇️ Simpan Video</button>
        <p id="download-status" style="display:none;"></p> 
    `;
    document.getElementById('force-download-btn').addEventListener('click', () => {
        forceDownload(videoUrl, `${safeFileName}.mp4`);
    });
}

// --- Display Result Khusus Facebook ---
function displayFacebookResult(data) {
    const title = data.title || 'facebook-video';
    const safeFileName = title.replace(/[^a-z0-9_.-]/gi, '_').substring(0, 50);

    let downloadButtonsHTML = '';
    
    // --- PERBAIKAN DI SINI ---
    // Kita gunakan nama kunci yang benar dari JSON
    const sd_link = data.links["Download Low Quality"];
    const hd_link = data.links["Download High Quality"];

    if (sd_link) {
        downloadButtonsHTML += `<button class="download-link" data-url="${sd_link}" data-quality="sd">⬇️ Unduh SD</button>`;
    }
    if (hd_link) {
        downloadButtonsHTML += `<button class="download-link" data-url="${hd_link}" data-quality="hd">⬇️ Unduh HD</button>`;
    }
    
    // API ini sepertinya tidak menyediakan thumbnail, jadi kita hapus saja
    resultDiv.innerHTML = `
        <h3>${title}</h3>
        <div class="button-group">${downloadButtonsHTML}</div>
        <p id="download-status" style="display:none;"></p> 
    `;
    document.querySelectorAll('.download-link').forEach(button => {
        button.addEventListener('click', (e) => {
            forceDownload(e.target.dataset.url, `${safeFileName}_${e.target.dataset.quality}.mp4`);
        });
    });
}
