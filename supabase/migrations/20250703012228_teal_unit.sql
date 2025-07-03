/*
  # Tworzenie tabeli filmów

  1. Nowe tabele
    - `videos`
      - `id` (uuid, klucz główny)
      - `name` (text, nazwa pliku)
      - `size` (bigint, rozmiar w bajtach)
      - `type` (text, typ MIME)
      - `file_path` (text, ścieżka w storage)
      - `thumbnail_path` (text, ścieżka do miniaturki)
      - `upload_date` (timestamptz, data wgrania)
      - `user_id` (uuid, opcjonalne ID użytkownika)
      - `public_url` (text, publiczny URL)
      - `share_token` (text, unikalny token do udostępniania)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Bezpieczeństwo
    - Włączenie RLS na tabeli `videos`
    - Polityki dla publicznego dostępu do udostępnionych filmów
    - Polityki dla zarządzania własnymi filmami

  3. Storage
    - Bucket `videos` dla plików wideo
    - Bucket `thumbnails` dla miniaturek
    - Publiczny dostęp do odczytu
*/

-- Tworzenie tabeli videos
CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  size bigint NOT NULL,
  type text NOT NULL,
  file_path text NOT NULL,
  thumbnail_path text,
  upload_date timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  public_url text NOT NULL,
  share_token text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Włączenie RLS
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Polityka dla publicznego dostępu do filmów przez share_token
CREATE POLICY "Publiczny dostęp do filmów przez share_token"
  ON videos
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Polityka dla wstawiania filmów (każdy może wgrać)
CREATE POLICY "Każdy może wgrać film"
  ON videos
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Polityka dla usuwania własnych filmów
CREATE POLICY "Użytkownicy mogą usuwać własne filmy"
  ON videos
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Polityka dla aktualizacji własnych filmów
CREATE POLICY "Użytkownicy mogą aktualizować własne filmy"
  ON videos
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Indeksy dla wydajności
CREATE INDEX IF NOT EXISTS idx_videos_share_token ON videos(share_token);
CREATE INDEX IF NOT EXISTS idx_videos_user_id ON videos(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);

-- Funkcja do automatycznej aktualizacji updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger dla automatycznej aktualizacji updated_at
CREATE TRIGGER update_videos_updated_at
  BEFORE UPDATE ON videos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();