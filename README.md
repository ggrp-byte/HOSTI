# VideoStream Pro - Oracle Cloud Edition

Nowoczesna platforma hostingu wideo w chmurze Oracle Cloud, umożliwiająca wgrywanie, strumieniowanie i publiczne udostępnianie filmów do 30GB.

## 🚀 Funkcje

- **Hosting w chmurze Oracle**: Prawdziwe publiczne udostępnianie
- **Duże pliki**: Obsługa filmów do 30GB
- **Wszystkie formaty**: MP4, WebM, OGG, AVI, MOV, WMV, FLV, **MKV**, 3GP, QuickTime
- **Publiczne linki**: Działają na wszystkich urządzeniach na świecie
- **Drag & Drop**: Intuicyjne wgrywanie z paskiem postępu
- **Streaming**: Odtwarzanie bez pobierania
- **Responsywny design**: Działa na desktop, tablet i mobile

## 🛠️ Stos technologiczny

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Storage)
- **Hosting**: Oracle Cloud Infrastructure
- **Ikony**: Lucide React

## 📋 Wymagania Oracle Cloud

### Dane które musisz mi udostępnić:

1. **Oracle Cloud Account**:
   - Tenancy OCID
   - User OCID
   - Region (np. eu-frankfurt-1)
   - Compartment OCID

2. **API Keys**:
   - Private Key (plik .pem)
   - Public Key Fingerprint

3. **Object Storage**:
   - Namespace
   - Bucket Name (zostanie utworzony automatycznie)

4. **Compute Instance** (opcjonalne):
   - Instance OCID (jeśli chcesz użyć istniejącej)
   - Public IP

### Konfiguracja Supabase (darmowa):

1. **Utwórz konto na [supabase.com](https://supabase.com)**
2. **Utwórz nowy projekt**
3. **Skopiuj dane**:
   - Project URL
   - Anon Key

## 🚀 Instalacja i wdrożenie

### Krok 1: Klonowanie i instalacja
```bash
git clone <your-repo>
cd videostream-pro
npm install
```

### Krok 2: Konfiguracja środowiska
```bash
cp .env.example .env
```

Wypełnij plik `.env`:
```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Oracle Cloud (opcjonalne - dla zaawansowanych funkcji)
VITE_ORACLE_NAMESPACE=your-namespace
VITE_ORACLE_BUCKET=video-storage
```

### Krok 3: Konfiguracja bazy danych
```bash
# Uruchom migracje w Supabase Dashboard > SQL Editor
# Skopiuj zawartość z supabase/migrations/create_videos_table.sql
```

### Krok 4: Konfiguracja Storage w Supabase
1. Przejdź do **Storage** w Supabase Dashboard
2. Utwórz bucket o nazwie `videos`
3. Ustaw **Public bucket** na `true`
4. Dodaj politykę:
```sql
-- Pozwól wszystkim na upload
CREATE POLICY "Allow public uploads" ON storage.objects
FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'videos');

-- Pozwól wszystkim na pobieranie
CREATE POLICY "Allow public downloads" ON storage.objects
FOR SELECT TO anon, authenticated
USING (bucket_id = 'videos');
```

### Krok 5: Uruchomienie lokalnie
```bash
npm run dev
```

### Krok 6: Wdrożenie na Oracle Cloud

#### Opcja A: Netlify (najprostsze)
1. Połącz repozytorium z Netlify
2. Ustaw zmienne środowiskowe w Netlify
3. Deploy automatyczny

#### Opcja B: Oracle Cloud Compute
```bash
# Build aplikacji
npm run build

# Upload na Oracle Cloud Instance
scp -r dist/* opc@your-oracle-ip:/var/www/html/
```

## 🔧 Konfiguracja Oracle Cloud

### 1. Utwórz Compute Instance
```bash
# W Oracle Cloud Console:
# Compute > Instances > Create Instance
# Shape: VM.Standard.E2.1.Micro (Always Free)
# Image: Oracle Linux 8
# Networking: Assign public IP
```

### 2. Zainstaluj serwer web
```bash
sudo dnf install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 3. Konfiguracja SSL (opcjonalne)
```bash
sudo dnf install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 📊 Monitoring i analityka

### Supabase Dashboard
- Statystyki użycia storage
- Logi zapytań do bazy
- Metryki wydajności

### Oracle Cloud Monitoring
- Wykorzystanie compute
- Transfer danych
- Koszty

## 💰 Koszty

### Supabase (darmowy tier):
- 500MB storage
- 2GB transfer/miesiąc
- 50,000 zapytań/miesiąc

### Oracle Cloud (Always Free):
- 2x VM.Standard.E2.1.Micro
- 200GB storage
- 10TB transfer/miesiąc

## 🔒 Bezpieczeństwo

- **RLS (Row Level Security)** w Supabase
- **HTTPS** wymuszony
- **CORS** skonfigurowany
- **Rate limiting** w Supabase
- **Backup** automatyczny w Oracle Cloud

## 🚀 Skalowanie

### Dla większego ruchu:
1. **Upgrade Supabase** do płatnego planu
2. **Oracle Cloud Load Balancer**
3. **CDN** (Oracle Cloud CDN)
4. **Multiple regions**

## 📞 Wsparcie

Aby skonfigurować Oracle Cloud, udostępnij mi:
1. **Dane dostępowe Oracle Cloud** (bezpiecznie)
2. **Preferowany region**
3. **Domenę** (jeśli masz)

Pomogę Ci skonfigurować kompletne rozwiązanie!

## 🔗 Przydatne linki

- [Oracle Cloud Free Tier](https://www.oracle.com/cloud/free/)
- [Supabase Documentation](https://supabase.com/docs)
- [Oracle Cloud Documentation](https://docs.oracle.com/en-us/iaas/)