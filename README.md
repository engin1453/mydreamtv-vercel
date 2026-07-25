# MyDreamTV - Vercel Backend

Bu proje Vercel'e deploy edilmek için hazırlanmıştır.

## Gerekli Environment Variables

Vercel'de Settings > Environment Variables bölümüne ekleyin:

| Değişken | Açıklama | Örnek |
|----------|----------|-------|
| `DATABASE_URL` | MySQL bağlantı URL'si | `mysql://user:pass@host:3306/dbname` |
| `ADMIN_PASSWORD` | Admin panel şifresi | `19971983` |

## Deploy Adımları

1. Bu klasörü zip olarak indirin
2. Vercel'de yeni proje oluşturun
3. Zip'i Vercel'e yükleyin (Import from Git veya ZIP upload)
4. Environment variables'ı ekleyin
5. Deploy

## API Endpoints

| Endpoint | Açıklama |
|----------|----------|
| `GET /api/data?type=stats` | İstatistikler |
| `GET /api/data?type=live-categories` | Canlı TV kategorileri |
| `GET /api/data?type=channels&category=...` | Kategori kanalları |
| `GET /api/data?type=movie-categories` | Film kategorileri |
| `GET /api/data?type=movies&category=...` | Kategori filmleri |
| `GET /api/data?type=series-categories` | Dizi kategorileri |
| `GET /api/data?type=series&category=...` | Kategori dizileri |
| `POST /api/upload` | Dosya yükleme |
| `POST /api/upload-m3u` | M3U URL yükleme |
| `POST /api/upload-xtream` | Xtream yükleme |
| `GET /api/admin?action=list` | Cihaz listesi |
| `GET /api/admin?action=stats` | Admin istatistikleri |
| `/upload` | Yükleme sayfası |

## APK Kullanımı

APK'da sunucu URL'sini Vercel deploy URL'sine değiştirin:
`https://sizin-projeniz.vercel.app`

Upload sayfası: `https://sizin-projeniz.vercel.app/upload`
