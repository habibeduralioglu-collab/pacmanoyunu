/**
 * pacman-asal-sayilar.html dosyasını doğrudan tarayıcı üzerinden kullanıcı bilgisayarına indiren yardımcı fonksiyon
 */
export async function downloadGameHtml(onSuccess?: () => void) {
  try {
    const res = await fetch('/pacman-asal-sayilar.html');
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const htmlText = await res.text();
    const blob = new Blob([htmlText], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pacman-asal-sayilar.html';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 200);

    if (onSuccess) onSuccess();
    return true;
  } catch (err) {
    console.error('Doğrudan indirme başarısız, alternatif açılıyor:', err);
    // Alternatif olarak yeni sekmede dosyayı açar
    window.open('/pacman-asal-sayilar.html', '_blank');
    return false;
  }
}
