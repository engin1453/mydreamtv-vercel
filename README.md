# MyDreamTV - Vercel Backend

Bu proje Vercel'e deploy edilmek için hazırlanmıştır.

## Özellikler

- PostgreSQL veritabanı kullanır (çalışan APK ile çakışmaz)
- Tablo adı: `mydreamtv_playlists` (benzersiz)
- Vercel Serverless Functions

## Gerekli Environment Variables

Vercel'de Settings > Environment Variables bölümüne ekleyin:

| Değişken | Açıklama | Örnek |
|----------|----------|-------|
| `DATABASE_URL` | PostgreSQL bağlantı URL'si | `postgres://user:pass@host:5432/dbname` |
| `ADMIN_PASSWORD` | Admin panel şifresi | `19971983` |

## Deploy Adımları

1. Bu repo'yu Vercel'de import edin
2. Settings > Environment Variables bölümüne `DATABASE_URL` ve `ADMIN_PASSWORD` ekleyin
3. Deploy

## DATABASE_URL Nasıl Bulunur

Railway'de:
1. `clever-adventure` projesine tıklayın
2. `Postgres` servisine tıklayın
3. **Variables** sekmesinde **DATABASE_URL**'yi kopyalayın
4. Vercel'de Environment Variables'a yapıştırın

Bu aynı veritabanını kullanacak ama `mydreamtv_playlists` tablosu oluşturacak — mevcut tablolara zarar vermez.

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
