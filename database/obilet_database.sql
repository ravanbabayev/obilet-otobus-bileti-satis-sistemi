-- =================================================================
-- OBİLET OTOBÜS BİLETİ SATIŞ SİSTEMİ VERİTABANI
-- BTS304 - Veritabanı Yönetim Sistemleri II
-- Bartın Üniversitesi - Bilgisayar Teknolojisi ve Bilişim Sistemleri
-- =================================================================

-- Veritabanı oluşturma
DROP DATABASE IF EXISTS obilet_db;
CREATE DATABASE obilet_db CHARACTER SET utf8mb4 COLLATE utf8mb4_turkish_ci;
USE obilet_db;

-- =================================================================
-- TABLOLAR (Raporda belirtilen varlıklar)
-- =================================================================

-- Kullanıcılar tablosu
CREATE TABLE kullanicilar (
    kullanici_id INT AUTO_INCREMENT PRIMARY KEY,
    tc_kimlik_no VARCHAR(11) NOT NULL UNIQUE,
    ad VARCHAR(50) NOT NULL,
    soyad VARCHAR(50) NOT NULL,
    dogum_tarihi DATE NOT NULL,
    cinsiyet ENUM('E', 'K') NOT NULL,
    telefon VARCHAR(15) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    sifre VARCHAR(255) NOT NULL,
    kayit_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    son_giris_tarihi TIMESTAMP NULL,
    aktif_mi BOOLEAN DEFAULT TRUE,
    CONSTRAINT chk_tc_kimlik_no CHECK (LENGTH(tc_kimlik_no) = 11),
    CONSTRAINT chk_email CHECK (email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_telefon CHECK (telefon REGEXP '^[0-9+() -]+$')
);

-- Firmalar tablosu
CREATE TABLE firmalar (
    firma_id INT AUTO_INCREMENT PRIMARY KEY,
    firma_adi VARCHAR(100) NOT NULL,
    logo_url VARCHAR(255),
    telefon VARCHAR(15) NOT NULL,
    email VARCHAR(100) NOT NULL,
    adres TEXT NOT NULL,
    website VARCHAR(255),
    vergi_no VARCHAR(10) NOT NULL UNIQUE,
    aktif_mi BOOLEAN DEFAULT TRUE,
    kayit_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- İstasyonlar tablosu
CREATE TABLE istasyonlar (
    istasyon_id INT AUTO_INCREMENT PRIMARY KEY,
    istasyon_adi VARCHAR(100) NOT NULL,
    sehir VARCHAR(50) NOT NULL,
    adres TEXT NOT NULL,
    telefon VARCHAR(15),
    koordinat_x DECIMAL(10, 8),
    koordinat_y DECIMAL(11, 8),
    aktif_mi BOOLEAN DEFAULT TRUE,
    INDEX idx_sehir (sehir)
);

-- Otobüsler tablosu
CREATE TABLE otobusler (
    otobus_id INT AUTO_INCREMENT PRIMARY KEY,
    firma_id INT NOT NULL,
    plaka VARCHAR(10) NOT NULL UNIQUE,
    model VARCHAR(50) NOT NULL,
    koltuk_sayisi INT NOT NULL,
    wifi_var_mi BOOLEAN DEFAULT FALSE,
    tv_var_mi BOOLEAN DEFAULT FALSE,
    klima_var_mi BOOLEAN DEFAULT FALSE,
    wc_var_mi BOOLEAN DEFAULT FALSE,
    aktif_mi BOOLEAN DEFAULT TRUE,
    kayit_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (firma_id) REFERENCES firmalar(firma_id) ON DELETE CASCADE,
    CONSTRAINT chk_koltuk_sayisi CHECK (koltuk_sayisi > 0 AND koltuk_sayisi <= 60),
    CONSTRAINT chk_plaka CHECK (plaka REGEXP '^[0-9]{2}[A-Z]{1,3}[0-9]{1,4}$')
);

-- Seferler tablosu
CREATE TABLE seferler (
    sefer_id INT AUTO_INCREMENT PRIMARY KEY,
    firma_id INT NOT NULL,
    otobus_id INT NOT NULL,
    kalkis_istasyon_id INT NOT NULL,
    varis_istasyon_id INT NOT NULL,
    kalkis_zamani DATETIME NOT NULL,
    varis_zamani DATETIME NOT NULL,
    mesafe INT NOT NULL,
    temel_ucret DECIMAL(10, 2) NOT NULL,
    aktif_mi BOOLEAN DEFAULT TRUE,
    kayit_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (firma_id) REFERENCES firmalar(firma_id),
    FOREIGN KEY (otobus_id) REFERENCES otobusler(otobus_id),
    FOREIGN KEY (kalkis_istasyon_id) REFERENCES istasyonlar(istasyon_id),
    FOREIGN KEY (varis_istasyon_id) REFERENCES istasyonlar(istasyon_id),
    CONSTRAINT chk_istasyon_farkli CHECK (kalkis_istasyon_id != varis_istasyon_id),
    CONSTRAINT chk_tarih_sira CHECK (varis_zamani > kalkis_zamani),
    CONSTRAINT chk_ucret CHECK (temel_ucret > 0),
    CONSTRAINT chk_mesafe CHECK (mesafe > 0),
    INDEX idx_kalkis_tarih (kalkis_zamani),
    INDEX idx_kalkis_varis (kalkis_istasyon_id, varis_istasyon_id)
);

-- Koltuklar tablosu
CREATE TABLE koltuklar (
    koltuk_id INT AUTO_INCREMENT PRIMARY KEY,
    sefer_id INT NOT NULL,
    koltuk_no INT NOT NULL,
    durum ENUM('boş', 'dolu', 'rezerve') DEFAULT 'boş',
    cinsiyet ENUM('E', 'K') NULL,
    rezerve_eden_kullanici_id INT NULL,
    rezerve_tarihi TIMESTAMP NULL,
    FOREIGN KEY (sefer_id) REFERENCES seferler(sefer_id) ON DELETE CASCADE,
    FOREIGN KEY (rezerve_eden_kullanici_id) REFERENCES kullanicilar(kullanici_id),
    UNIQUE KEY uk_sefer_koltuk (sefer_id, koltuk_no),
    CONSTRAINT chk_koltuk_no CHECK (koltuk_no > 0)
);

-- Biletler tablosu
CREATE TABLE biletler (
    bilet_id INT AUTO_INCREMENT PRIMARY KEY,
    sefer_id INT NOT NULL,
    kullanici_id INT NOT NULL,
    koltuk_no INT NOT NULL,
    ucret DECIMAL(10, 2) NOT NULL,
    satin_alma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    durum ENUM('aktif', 'iptal', 'kullanildi') DEFAULT 'aktif',
    iptal_tarihi TIMESTAMP NULL,
    iptal_nedeni TEXT NULL,
    bilet_kodu VARCHAR(20) NOT NULL UNIQUE,
    FOREIGN KEY (sefer_id) REFERENCES seferler(sefer_id),
    FOREIGN KEY (kullanici_id) REFERENCES kullanicilar(kullanici_id),
    UNIQUE KEY uk_sefer_koltuk (sefer_id, koltuk_no),
    CONSTRAINT chk_bilet_ucret CHECK (ucret > 0),
    INDEX idx_bilet_kodu (bilet_kodu),
    INDEX idx_kullanici_tarih (kullanici_id, satin_alma_tarihi)
);

-- Ödemeler tablosu
CREATE TABLE odemeler (
    odeme_id INT AUTO_INCREMENT PRIMARY KEY,
    bilet_id INT NOT NULL,
    kullanici_id INT NOT NULL,
    tutar DECIMAL(10, 2) NOT NULL,
    odeme_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    odeme_yontemi ENUM('kredi_karti', 'nakit', 'havale') NOT NULL,
    kart_no_son4 VARCHAR(4) NULL,
    banka_adi VARCHAR(50) NULL,
    durum ENUM('başarılı', 'başarısız', 'iade', 'beklemede') DEFAULT 'beklemede',
    islem_id VARCHAR(50) NULL,
    hata_mesaji TEXT NULL,
    FOREIGN KEY (bilet_id) REFERENCES biletler(bilet_id),
    FOREIGN KEY (kullanici_id) REFERENCES kullanicilar(kullanici_id),
    CONSTRAINT chk_odeme_tutar CHECK (tutar > 0),
    INDEX idx_odeme_tarihi (odeme_tarihi),
    INDEX idx_durum (durum)
);

-- =================================================================
-- BAŞLANGIÇ VERİLERİ
-- =================================================================

-- Firmalar
INSERT INTO firmalar (firma_adi, telefon, email, adres, website, vergi_no) VALUES
('Metro Turizm', '0212 444 3455', 'info@metroturizm.com.tr', 'İstanbul', 'www.metroturizm.com.tr', '1234567890'),
('Ulusoy', '0212 444 1888', 'info@ulusoy.com.tr', 'İstanbul', 'www.ulusoy.com.tr', '1234567891'),
('Kamil Koç', '0212 444 0562', 'info@kamilkoc.com.tr', 'İstanbul', 'www.kamilkoc.com.tr', '1234567892'),
('Pamukkale Turizm', '0258 444 3535', 'info@pamukkale.com.tr', 'Denizli', 'www.pamukkale.com.tr', '1234567893'),
('Varan Turizm', '0212 444 8999', 'info@varan.com.tr', 'İstanbul', 'www.varan.com.tr', '1234567894');

-- İstasyonlar
INSERT INTO istasyonlar (istasyon_adi, sehir, adres, telefon) VALUES
('Büyük İstanbul Otogarı', 'İstanbul', 'Bayrampaşa/İstanbul', '0212 658 0505'),
('Ankara AŞTİ', 'Ankara', 'Altındağ/Ankara', '0312 310 5454'),
('İzmir Büyük Otogar', 'İzmir', 'Pınarbaşı/İzmir', '0232 472 1010'),
('Antalya Otogarı', 'Antalya', 'Muratpaşa/Antalya', '0242 331 1254'),
('Bursa Terminali', 'Bursa', 'Osmangazi/Bursa', '0224 261 5400'),
('Adana Otogarı', 'Adana', 'Seyhan/Adana', '0322 428 2020'),
('Konya Otogarı', 'Konya', 'Karatay/Konya', '0332 265 1515'),
('Trabzon Otogarı', 'Trabzon', 'Ortahisar/Trabzon', '0462 325 7575'),
('Erzurum Otogarı', 'Erzurum', 'Palandöken/Erzurum', '0442 218 1818'),
('Bartın Otogarı', 'Bartın', 'Merkez/Bartın', '0378 227 1010');

-- Otobüsler
INSERT INTO otobusler (firma_id, plaka, model, koltuk_sayisi, wifi_var_mi, tv_var_mi, klima_var_mi, wc_var_mi) VALUES
(1, '34MT1001', 'Mercedes Travego', 42, TRUE, TRUE, TRUE, TRUE),
(1, '34MT1002', 'Mercedes Travego', 42, TRUE, TRUE, TRUE, TRUE),
(2, '34UL2001', 'MAN Lion''s Coach', 45, TRUE, TRUE, TRUE, TRUE),
(2, '34UL2002', 'Setra S515 HD', 40, TRUE, TRUE, TRUE, TRUE),
(3, '34KK3001', 'Mercedes Tourismo', 48, TRUE, TRUE, TRUE, TRUE),
(3, '34KK3002', 'Volvo 9700', 45, TRUE, TRUE, TRUE, TRUE),
(4, '20PM4001', 'Mercedes Travego', 42, TRUE, TRUE, TRUE, TRUE),
(5, '34VR5001', 'Setra S516 HD', 38, TRUE, TRUE, TRUE, TRUE);

-- =================================================================
-- SAKLANANMIŞ YORDAMLAR (STORED PROCEDURES)
-- =================================================================

DELIMITER $$

-- Kullanıcı girişi
CREATE PROCEDURE sp_kullanici_giris(
    IN p_email VARCHAR(100),
    IN p_sifre VARCHAR(255)
)
BEGIN
    DECLARE kullanici_sayisi INT DEFAULT 0;
    
    SELECT COUNT(*) INTO kullanici_sayisi
    FROM kullanicilar 
    WHERE email = p_email AND sifre = p_sifre AND aktif_mi = TRUE;
    
    IF kullanici_sayisi > 0 THEN
        UPDATE kullanicilar 
        SET son_giris_tarihi = NOW() 
        WHERE email = p_email AND sifre = p_sifre;
        
        SELECT 
            kullanici_id,
            tc_kimlik_no,
            ad,
            soyad,
            dogum_tarihi,
            cinsiyet,
            telefon,
            email,
            kayit_tarihi,
            son_giris_tarihi
        FROM kullanicilar
        WHERE email = p_email AND sifre = p_sifre;
    ELSE
        SELECT NULL as kullanici_id, 'Geçersiz email veya şifre' as hata_mesaji;
    END IF;
END $$

-- Kullanıcı kaydı
CREATE PROCEDURE sp_kullanici_kayit(
    IN p_tc_kimlik_no VARCHAR(11),
    IN p_ad VARCHAR(50),
    IN p_soyad VARCHAR(50),
    IN p_dogum_tarihi DATE,
    IN p_cinsiyet ENUM('E', 'K'),
    IN p_telefon VARCHAR(15),
    IN p_email VARCHAR(100),
    IN p_sifre VARCHAR(255)
)
BEGIN
    DECLARE tc_sayisi INT DEFAULT 0;
    DECLARE email_sayisi INT DEFAULT 0;
    DECLARE yeni_kullanici_id INT;
    
    -- TC ve email kontrolü
    SELECT COUNT(*) INTO tc_sayisi FROM kullanicilar WHERE tc_kimlik_no = p_tc_kimlik_no;
    SELECT COUNT(*) INTO email_sayisi FROM kullanicilar WHERE email = p_email;
    
    IF tc_sayisi > 0 THEN
        SELECT NULL as kullanici_id, 'Bu TC kimlik numarası zaten kayıtlı' as hata_mesaji;
    ELSEIF email_sayisi > 0 THEN
        SELECT NULL as kullanici_id, 'Bu email adresi zaten kayıtlı' as hata_mesaji;
    ELSE
        INSERT INTO kullanicilar (
            tc_kimlik_no, ad, soyad, dogum_tarihi, 
            cinsiyet, telefon, email, sifre
        ) VALUES (
            p_tc_kimlik_no, p_ad, p_soyad, p_dogum_tarihi,
            p_cinsiyet, p_telefon, p_email, p_sifre
        );
        
        SET yeni_kullanici_id = LAST_INSERT_ID();
        
        SELECT 
            kullanici_id,
            tc_kimlik_no,
            ad,
            soyad,
            dogum_tarihi,
            cinsiyet,
            telefon,
            email,
            kayit_tarihi
        FROM kullanicilar
        WHERE kullanici_id = yeni_kullanici_id;
    END IF;
END $$

-- Sefer arama
CREATE PROCEDURE sp_sefer_ara(
    IN p_kalkis_il VARCHAR(50),
    IN p_varis_il VARCHAR(50),
    IN p_tarih DATE
)
BEGIN
    SELECT 
        s.sefer_id,
        s.otobus_id,
        o.plaka,
        f.firma_adi,
        s.kalkis_istasyon_id,
        ki.istasyon_adi AS kalkis_istasyon_adi,
        ki.sehir AS kalkis_il,
        s.varis_istasyon_id,
        vi.istasyon_adi AS varis_istasyon_adi,
        vi.sehir AS varis_il,
        s.kalkis_zamani,
        s.varis_zamani,
        s.mesafe,
        s.temel_ucret,
        o.wifi_var_mi,
        o.tv_var_mi,
        o.klima_var_mi,
        o.wc_var_mi,
        fn_sefer_doluluk_orani(s.sefer_id) AS doluluk_orani
    FROM seferler s
    JOIN otobusler o ON s.otobus_id = o.otobus_id
    JOIN firmalar f ON s.firma_id = f.firma_id
    JOIN istasyonlar ki ON s.kalkis_istasyon_id = ki.istasyon_id
    JOIN istasyonlar vi ON s.varis_istasyon_id = vi.istasyon_id
    WHERE ki.sehir = p_kalkis_il 
    AND vi.sehir = p_varis_il 
    AND DATE(s.kalkis_zamani) = p_tarih
    AND s.aktif_mi = TRUE
    AND s.kalkis_zamani > NOW()
    ORDER BY s.kalkis_zamani;
END $$

-- Koltuk durumları
CREATE PROCEDURE sp_koltuk_durumlari(
    IN p_sefer_id INT
)
BEGIN
    DECLARE sefer_sayisi INT DEFAULT 0;
    DECLARE v_otobus_id INT;
    DECLARE v_koltuk_sayisi INT;
    
    SELECT COUNT(*) INTO sefer_sayisi FROM seferler WHERE sefer_id = p_sefer_id;
    
    IF sefer_sayisi = 0 THEN
        SELECT NULL as sefer_id, 'Sefer bulunamadı' as hata_mesaji;
    ELSE
        SELECT o.otobus_id, o.koltuk_sayisi 
        INTO v_otobus_id, v_koltuk_sayisi
        FROM seferler s 
        JOIN otobusler o ON s.otobus_id = o.otobus_id 
        WHERE s.sefer_id = p_sefer_id;
        
        -- Sefer bilgileri
        SELECT 
            s.sefer_id,
            s.kalkis_zamani,
            s.varis_zamani,
            s.temel_ucret,
            f.firma_adi,
            o.plaka,
            ki.istasyon_adi as kalkis_istasyon_adi,
            ki.sehir as kalkis_il,
            vi.istasyon_adi as varis_istasyon_adi,
            vi.sehir as varis_il,
            o.koltuk_sayisi
        FROM seferler s
        JOIN otobusler o ON s.otobus_id = o.otobus_id
        JOIN firmalar f ON s.firma_id = f.firma_id
        JOIN istasyonlar ki ON s.kalkis_istasyon_id = ki.istasyon_id
        JOIN istasyonlar vi ON s.varis_istasyon_id = vi.istasyon_id
        WHERE s.sefer_id = p_sefer_id;
        
        -- Koltuk durumları
        SELECT 
            koltuk_no,
            CASE 
                WHEN b.bilet_id IS NOT NULL AND b.durum = 'aktif' THEN 'dolu'
                WHEN k.durum = 'rezerve' THEN 'rezerve'
                ELSE 'boş'
            END as durum,
            CASE 
                WHEN b.bilet_id IS NOT NULL THEN u.cinsiyet
                WHEN k.durum = 'rezerve' THEN k.cinsiyet
                ELSE NULL
            END as cinsiyet
        FROM (
            SELECT n as koltuk_no
            FROM (
                SELECT 1 n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION
                SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION
                SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15 UNION
                SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19 UNION SELECT 20 UNION
                SELECT 21 UNION SELECT 22 UNION SELECT 23 UNION SELECT 24 UNION SELECT 25 UNION
                SELECT 26 UNION SELECT 27 UNION SELECT 28 UNION SELECT 29 UNION SELECT 30 UNION
                SELECT 31 UNION SELECT 32 UNION SELECT 33 UNION SELECT 34 UNION SELECT 35 UNION
                SELECT 36 UNION SELECT 37 UNION SELECT 38 UNION SELECT 39 UNION SELECT 40 UNION
                SELECT 41 UNION SELECT 42 UNION SELECT 43 UNION SELECT 44 UNION SELECT 45 UNION
                SELECT 46 UNION SELECT 47 UNION SELECT 48 UNION SELECT 49 UNION SELECT 50 UNION
                SELECT 51 UNION SELECT 52 UNION SELECT 53 UNION SELECT 54 UNION SELECT 55 UNION
                SELECT 56 UNION SELECT 57 UNION SELECT 58 UNION SELECT 59 UNION SELECT 60
            ) numbers
            WHERE n <= v_koltuk_sayisi
        ) all_seats
        LEFT JOIN koltuklar k ON k.sefer_id = p_sefer_id AND k.koltuk_no = all_seats.koltuk_no
        LEFT JOIN biletler b ON b.sefer_id = p_sefer_id AND b.koltuk_no = all_seats.koltuk_no AND b.durum = 'aktif'
        LEFT JOIN kullanicilar u ON b.kullanici_id = u.kullanici_id
        ORDER BY koltuk_no;
    END IF;
END $$

-- Bilet satın alma
CREATE PROCEDURE sp_bilet_satin_al(
    IN p_kullanici_id INT,
    IN p_sefer_id INT,
    IN p_koltuk_no INT,
    IN p_ucret DECIMAL(10, 2),
    IN p_odeme_yontemi ENUM('kredi_karti', 'nakit', 'havale'),
    IN p_kart_no_son4 VARCHAR(4)
)
BEGIN
    DECLARE sefer_tarihi DATETIME;
    DECLARE koltuk_durumu VARCHAR(10);
    DECLARE yeni_bilet_id INT;
    DECLARE bilet_kodu_val VARCHAR(20);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SELECT NULL as bilet_id, 'İşlem sırasında hata oluştu' as hata_mesaji;
    END;
    
    START TRANSACTION;
    
    -- Sefer tarihini kontrol et
    SELECT kalkis_zamani INTO sefer_tarihi
    FROM seferler
    WHERE sefer_id = p_sefer_id AND aktif_mi = TRUE;
    
    IF sefer_tarihi IS NULL THEN
        ROLLBACK;
        SELECT NULL as bilet_id, 'Sefer bulunamadı veya aktif değil' as hata_mesaji;
    ELSEIF sefer_tarihi < NOW() THEN
        ROLLBACK;
        SELECT NULL as bilet_id, 'Bu sefer için bilet satın alınamaz. Sefer tarihi geçmiş.' as hata_mesaji;
    ELSE
        -- Koltuk durumunu kontrol et
        SELECT 
            CASE 
                WHEN b.bilet_id IS NOT NULL AND b.durum = 'aktif' THEN 'dolu'
                WHEN k.durum = 'rezerve' THEN 'rezerve'
                ELSE 'boş'
            END INTO koltuk_durumu
        FROM (SELECT p_koltuk_no as koltuk_no) seat
        LEFT JOIN koltuklar k ON k.sefer_id = p_sefer_id AND k.koltuk_no = seat.koltuk_no
        LEFT JOIN biletler b ON b.sefer_id = p_sefer_id AND b.koltuk_no = seat.koltuk_no AND b.durum = 'aktif';
        
        IF koltuk_durumu != 'boş' THEN
            ROLLBACK;
            SELECT NULL as bilet_id, 'Bu koltuk zaten satılmış veya rezerve edilmiş.' as hata_mesaji;
        ELSE
            -- Bilet kodu oluştur
            SET bilet_kodu_val = CONCAT('OB', DATE_FORMAT(NOW(), '%Y%m%d'), LPAD(p_sefer_id, 4, '0'), LPAD(p_koltuk_no, 2, '0'));
            
            -- Bileti oluştur
            INSERT INTO biletler (
                sefer_id, kullanici_id, koltuk_no, ucret, bilet_kodu
            ) VALUES (
                p_sefer_id, p_kullanici_id, p_koltuk_no, p_ucret, bilet_kodu_val
            );
            
            SET yeni_bilet_id = LAST_INSERT_ID();
            
            -- Ödeme kaydı oluştur
            INSERT INTO odemeler (
                bilet_id, kullanici_id, tutar, odeme_yontemi, kart_no_son4, durum
            ) VALUES (
                yeni_bilet_id, p_kullanici_id, p_ucret, p_odeme_yontemi, p_kart_no_son4, 'başarılı'
            );
            
            COMMIT;
            
            SELECT 
                b.bilet_id,
                b.bilet_kodu,
                b.sefer_id,
                b.koltuk_no,
                b.ucret,
                b.satin_alma_tarihi,
                s.kalkis_zamani,
                s.varis_zamani,
                f.firma_adi,
                ki.istasyon_adi as kalkis_istasyon_adi,
                vi.istasyon_adi as varis_istasyon_adi,
                u.ad,
                u.soyad,
                u.tc_kimlik_no
            FROM biletler b
            JOIN seferler s ON b.sefer_id = s.sefer_id
            JOIN firmalar f ON s.firma_id = f.firma_id
            JOIN istasyonlar ki ON s.kalkis_istasyon_id = ki.istasyon_id
            JOIN istasyonlar vi ON s.varis_istasyon_id = vi.istasyon_id
            JOIN kullanicilar u ON b.kullanici_id = u.kullanici_id
            WHERE b.bilet_id = yeni_bilet_id;
        END IF;
    END IF;
END $$

-- Bilet iptal etme
CREATE PROCEDURE sp_bilet_iptal(
    IN p_bilet_id INT,
    IN p_kullanici_id INT,
    IN p_iptal_nedeni TEXT
)
BEGIN
    DECLARE bilet_durumu VARCHAR(20);
    DECLARE sefer_tarihi DATETIME;
    DECLARE bilet_kullanici_id INT;
    DECLARE iptal_suresi INT;
    
    -- Bilet bilgilerini kontrol et
    SELECT b.durum, s.kalkis_zamani, b.kullanici_id
    INTO bilet_durumu, sefer_tarihi, bilet_kullanici_id
    FROM biletler b
    JOIN seferler s ON b.sefer_id = s.sefer_id
    WHERE b.bilet_id = p_bilet_id;
    
    IF bilet_kullanici_id IS NULL THEN
        SELECT FALSE as basarili, 'Bilet bulunamadı' as hata_mesaji;
    ELSEIF bilet_kullanici_id != p_kullanici_id THEN
        SELECT FALSE as basarili, 'Bu bilet size ait değil' as hata_mesaji;
    ELSEIF bilet_durumu != 'aktif' THEN
        SELECT FALSE as basarili, 'Bu bilet zaten iptal edilmiş veya kullanılmış' as hata_mesaji;
    ELSE
        -- İptal süresini kontrol et (3 saat öncesine kadar iptal edilebilir)
        SET iptal_suresi = TIMESTAMPDIFF(HOUR, NOW(), sefer_tarihi);
        
        IF iptal_suresi < 3 THEN
            SELECT FALSE as basarili, 'Bilet iptal süresi geçmiş. Hareket saatine 3 saatten az kaldığı için bilet iptal edilemez.' as hata_mesaji;
        ELSE
            -- Bileti iptal et
            UPDATE biletler
            SET 
                durum = 'iptal',
                iptal_tarihi = NOW(),
                iptal_nedeni = p_iptal_nedeni
            WHERE bilet_id = p_bilet_id;
            
            -- Ödeme durumunu güncelle
            UPDATE odemeler
            SET durum = 'iade'
            WHERE bilet_id = p_bilet_id;
            
            SELECT TRUE as basarili, 'Bilet başarıyla iptal edildi' as mesaj;
        END IF;
    END IF;
END $$

-- Kullanıcı biletleri
CREATE PROCEDURE sp_kullanici_biletleri(
    IN p_kullanici_id INT
)
BEGIN
    SELECT 
        b.bilet_id,
        b.bilet_kodu,
        b.sefer_id,
        b.koltuk_no,
        b.ucret,
        b.satin_alma_tarihi,
        b.durum as bilet_durumu,
        b.iptal_tarihi,
        s.kalkis_zamani,
        s.varis_zamani,
        f.firma_adi,
        o.plaka,
        ki.istasyon_adi as kalkis_istasyon_adi,
        ki.sehir as kalkis_il,
        vi.istasyon_adi as varis_istasyon_adi,
        vi.sehir as varis_il,
        od.durum as odeme_durumu
    FROM biletler b
    JOIN seferler s ON b.sefer_id = s.sefer_id
    JOIN otobusler o ON s.otobus_id = o.otobus_id
    JOIN firmalar f ON s.firma_id = f.firma_id
    JOIN istasyonlar ki ON s.kalkis_istasyon_id = ki.istasyon_id
    JOIN istasyonlar vi ON s.varis_istasyon_id = vi.istasyon_id
    LEFT JOIN odemeler od ON b.bilet_id = od.bilet_id
    WHERE b.kullanici_id = p_kullanici_id
    ORDER BY b.satin_alma_tarihi DESC;
END $$

DELIMITER ;

-- =================================================================
-- KULLANICI TANIMLI FONKSİYONLAR
-- =================================================================

DELIMITER $$

-- Sefer doluluk oranını hesaplayan fonksiyon
CREATE FUNCTION fn_sefer_doluluk_orani(p_sefer_id INT) 
RETURNS DECIMAL(5,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE toplam_koltuk INT;
    DECLARE dolu_koltuk INT;
    DECLARE doluluk_orani DECIMAL(5,2);
    
    -- Otobüsün toplam koltuk sayısını al
    SELECT o.koltuk_sayisi INTO toplam_koltuk
    FROM seferler s
    JOIN otobusler o ON s.otobus_id = o.otobus_id
    WHERE s.sefer_id = p_sefer_id;
    
    -- Seferdeki dolu koltuk sayısını hesapla
    SELECT COUNT(*) INTO dolu_koltuk
    FROM biletler
    WHERE sefer_id = p_sefer_id AND durum = 'aktif';
    
    -- Doluluk oranını hesapla
    IF toplam_koltuk > 0 THEN
        SET doluluk_orani = (dolu_koltuk / toplam_koltuk) * 100;
    ELSE
        SET doluluk_orani = 0;
    END IF;
    
    RETURN doluluk_orani;
END $$

-- Şehirler arası mesafe hesaplayan fonksiyon (basit hesaplama)
CREATE FUNCTION fn_sehirler_arasi_mesafe(p_kalkis_sehir VARCHAR(50), p_varis_sehir VARCHAR(50))
RETURNS INT
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE mesafe INT DEFAULT 0;
    
    -- Basit mesafe hesaplaması (gerçek uygulamada harita API'si kullanılabilir)
    CASE 
        WHEN (p_kalkis_sehir = 'İstanbul' AND p_varis_sehir = 'Ankara') OR 
             (p_kalkis_sehir = 'Ankara' AND p_varis_sehir = 'İstanbul') THEN
            SET mesafe = 450;
        WHEN (p_kalkis_sehir = 'İstanbul' AND p_varis_sehir = 'İzmir') OR 
             (p_kalkis_sehir = 'İzmir' AND p_varis_sehir = 'İstanbul') THEN
            SET mesafe = 565;
        WHEN (p_kalkis_sehir = 'İstanbul' AND p_varis_sehir = 'Antalya') OR 
             (p_kalkis_sehir = 'Antalya' AND p_varis_sehir = 'İstanbul') THEN
            SET mesafe = 725;
        WHEN (p_kalkis_sehir = 'Ankara' AND p_varis_sehir = 'İzmir') OR 
             (p_kalkis_sehir = 'İzmir' AND p_varis_sehir = 'Ankara') THEN
            SET mesafe = 550;
        WHEN (p_kalkis_sehir = 'Ankara' AND p_varis_sehir = 'Antalya') OR 
             (p_kalkis_sehir = 'Antalya' AND p_varis_sehir = 'Ankara') THEN
            SET mesafe = 550;
        WHEN (p_kalkis_sehir = 'İstanbul' AND p_varis_sehir = 'Bartın') OR 
             (p_kalkis_sehir = 'Bartın' AND p_varis_sehir = 'İstanbul') THEN
            SET mesafe = 320;
        ELSE
            SET mesafe = 500; -- Varsayılan mesafe
    END CASE;
    
    RETURN mesafe;
END $$

DELIMITER ;

-- =================================================================
-- TETİKLEYİCİLER (TRIGGERS)
-- =================================================================

DELIMITER $$

-- Bilet eklendiğinde koltuk durumunu güncelleyen tetikleyici
CREATE TRIGGER trg_bilet_after_insert
AFTER INSERT ON biletler
FOR EACH ROW
BEGIN
    -- Koltuk kaydı yoksa oluştur ve dolu yap
    INSERT INTO koltuklar (sefer_id, koltuk_no, durum, cinsiyet)
    SELECT NEW.sefer_id, NEW.koltuk_no, 'dolu', u.cinsiyet
    FROM kullanicilar u
    WHERE u.kullanici_id = NEW.kullanici_id
    ON DUPLICATE KEY UPDATE 
        durum = 'dolu',
        cinsiyet = (SELECT cinsiyet FROM kullanicilar WHERE kullanici_id = NEW.kullanici_id);
END $$

-- Bilet iptal edildiğinde koltuk durumunu güncelleyen tetikleyici
CREATE TRIGGER trg_bilet_after_update
AFTER UPDATE ON biletler
FOR EACH ROW
BEGIN
    -- Eğer bilet durumu IPTAL olarak değiştiyse
    IF NEW.durum = 'iptal' AND OLD.durum != 'iptal' THEN
        -- Koltuk durumunu güncelle
        UPDATE koltuklar
        SET durum = 'boş', cinsiyet = NULL
        WHERE sefer_id = NEW.sefer_id AND koltuk_no = NEW.koltuk_no;
    END IF;
END $$

-- Yeni sefer eklendiğinde koltuk kayıtlarını oluşturan tetikleyici
CREATE TRIGGER trg_sefer_after_insert
AFTER INSERT ON seferler
FOR EACH ROW
BEGIN
    DECLARE i INT DEFAULT 1;
    DECLARE koltuk_sayisi_val INT;
    
    -- Otobüsün koltuk sayısını al
    SELECT koltuk_sayisi INTO koltuk_sayisi_val
    FROM otobusler
    WHERE otobus_id = NEW.otobus_id;
    
    -- Tüm koltuklar için boş kayıt oluştur
    WHILE i <= koltuk_sayisi_val DO
        INSERT INTO koltuklar (sefer_id, koltuk_no, durum)
        VALUES (NEW.sefer_id, i, 'boş');
        SET i = i + 1;
    END WHILE;
END $$

DELIMITER ;

-- =================================================================
-- ÖRNEK SEFERLER VE TEST VERİLERİ
-- =================================================================

-- Bugünden sonraki tarihlerde örnek seferler
INSERT INTO seferler (firma_id, otobus_id, kalkis_istasyon_id, varis_istasyon_id, kalkis_zamani, varis_zamani, mesafe, temel_ucret) VALUES
-- İstanbul-Ankara seferleri
(1, 1, 1, 2, DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 8 HOUR, DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 13 HOUR, 450, 150.00),
(1, 2, 1, 2, DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 14 HOUR, DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 19 HOUR, 450, 160.00),
(2, 3, 1, 2, DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 10 HOUR, DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 15 HOUR, 450, 180.00),

-- İstanbul-İzmir seferleri
(1, 1, 1, 3, DATE_ADD(CURDATE(), INTERVAL 2 DAY) + INTERVAL 9 HOUR, DATE_ADD(CURDATE(), INTERVAL 2 DAY) + INTERVAL 18 HOUR, 565, 200.00),
(3, 5, 1, 3, DATE_ADD(CURDATE(), INTERVAL 2 DAY) + INTERVAL 22 HOUR, DATE_ADD(CURDATE(), INTERVAL 3 DAY) + INTERVAL 7 HOUR, 565, 190.00),

-- İstanbul-Bartın seferleri
(2, 4, 1, 10, DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 7 HOUR, DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 12 HOUR, 320, 120.00),
(3, 6, 1, 10, DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 15 HOUR, DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 20 HOUR, 320, 130.00);

-- Test kullanıcısı
INSERT INTO kullanicilar (tc_kimlik_no, ad, soyad, dogum_tarihi, cinsiyet, telefon, email, sifre) VALUES
('12345678901', 'Test', 'Kullanıcı', '1990-01-01', 'E', '05551234567', 'test@test.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'); -- password: password

-- =================================================================
-- İNDEXLER VE OPTİMİZASYON
-- =================================================================

-- Performans için ek indexler
CREATE INDEX idx_biletler_durum ON biletler(durum);
CREATE INDEX idx_biletler_tarih ON biletler(satin_alma_tarihi);
CREATE INDEX idx_seferler_tarih_aktif ON seferler(kalkis_zamani, aktif_mi);
CREATE INDEX idx_kullanicilar_email ON kullanicilar(email);
CREATE INDEX idx_kullanicilar_tc ON kullanicilar(tc_kimlik_no);

-- =================================================================
-- TAMAMLANDI
-- =================================================================

SELECT 'OBilet Veritabanı başarıyla oluşturuldu!' as mesaj; 