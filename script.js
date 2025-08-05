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

// --- FUNGSI BARU UNTUK MEMAKSA DOWNLOAD ---
async function forceDownload(url, fileName) {
  const statusElement = document.getElementById('download-status');
  try {
    statusElement.textContent = 'Mengunduh data video... (Mungkin perlu waktu)';
    statusElement.style.display = 'block';

    // 1. Ambil data video sebagai blob
    const response = await fetch(url);
    const blob = await response.blob();

    // 2. Buat URL sementara untuk blob
    const blobUrl = window.URL.createObjectURL(blob);

    // 3. Buat link sementara, klik, lalu hapus
    const anchor = document.createElement('a');
    anchor.href = blobUrl;
    anchor.download = fileName;
    document.body.appendChild(anchor); // Diperlukan untuk Firefox
    anchor.click();
    anchor.remove();

    // 4. Hapus URL blob untuk membebaskan memori
    window.URL.revokeObjectURL(blobUrl);
    statusElement.textContent = 'Download dimulai!';
  } catch (err) {
    statusElement.textContent = 'Gagal mengunduh file. Coba putar dan simpan manual.';
    console.error(err);
  }
}

// --- Event Listener ---
downloadBtn.addEventListener('click', handleDownload);

async function handleDownload() {
    const url = urlInput.value.trim();
    if (!url) {
        showError('Silakan masukkan URL TikTok.');
        return;
    }
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
        if (data.status === 'error' || !data.data || !data.data.play) {
             throw new Error(data.message || 'API tidak mengembalikan link video yang valid.');
        }
        displayResult(data.data);
    } catch (error) {
        showError(error.message);
    } finally {
        loader.style.display = 'none';
    }
}

function displayResult(data) {
    const videoUrl = data.play; 
    const videoTitle = data.title || 'tiktok-video';

    // --- PERUBAHAN DI SINI ---
    // Tombol sekarang menjadi <button> biasa, bukan link <a>
    resultDiv.innerHTML = `
        <h3>${videoTitle}</h3>
        <video controls src="${videoUrl}" type="video/mp4"></video>
        <button id="force-download-btn" class="download-link">⬇️ Simpan Video</button>
        <p id="download-status" style="display:none; font-size:14px; color:#555;"></p> 
    `;

    // Tambahkan event listener ke tombol yang baru dibuat
    document.getElementById('force-download-btn').addEventListener('click', () => {
        // Ganti karakter yang tidak valid untuk nama file
        const safeFileName = videoTitle.replace(/[^a-z0-9_.-]/gi, '_').substring(0, 50);
        forceDownload(videoUrl, `${safeFileName}.mp4`);
    });
}

function showError(message) {
    errorDiv.textContent = `Terjadi Kesalahan: ${message}`;
}
