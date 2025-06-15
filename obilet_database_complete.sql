-- =============================================
-- OBilet Otobüs Bileti Satış Sistemi
-- Yazhane Modeli - Tek SQL Dosyası
-- MySQL 8.0+ uyumlu
-- Charset: utf8mb4, Collation: utf8mb4_general_ci
-- =============================================

-- Veritabanı oluşturma ve karakter seti ayarlama
DROP DATABASE IF EXISTS obilet_db;
CREATE DATABASE obilet_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_general_ci;

USE obilet_db;

-- Oturum karakter seti ayarları
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET character_set_connection=utf8mb4;

-- =============================================
-- TABLO YAPILARININ OLUŞTURULMASI
-- =============================================

-- Otobüs firması tablosu
CREATE TABLE otobus_firmasi (
    firma_id INT AUTO_INCREMENT PRIMARY KEY,
    firma_adi VARCHAR(100) NOT NULL,
    telefon VARCHAR(15) NOT NULL,
    email VARCHAR(100) NOT NULL,
    vergi_no VARCHAR(10) NOT NULL UNIQUE,
    merkez_adres TEXT NOT NULL,
    aktif_mi BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- İstasyon tablosu
CREATE TABLE istasyon (
    istasyon_id INT AUTO_INCREMENT PRIMARY KEY,
    istasyon_adi VARCHAR(100) NOT NULL,
    il VARCHAR(50) NOT NULL,
    ilce VARCHAR(50) NOT NULL,
    adres TEXT NOT NULL,
    aktif_mi BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_il (il),
    INDEX idx_istasyon_adi (istasyon_adi)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Otobüs tablosu
CREATE TABLE otobus (
    otobus_id INT AUTO_INCREMENT PRIMARY KEY,
    firma_id INT NOT NULL,
    plaka VARCHAR(10) NOT NULL UNIQUE,
    model VARCHAR(50) NOT NULL,
    koltuk_sayisi INT NOT NULL,
    ozellikler TEXT,
    aktif_mi BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (firma_id) REFERENCES otobus_firmasi(firma_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_koltuk_sayisi CHECK (koltuk_sayisi > 0 AND koltuk_sayisi <= 60)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Sefer tablosu
CREATE TABLE sefer (
    sefer_id INT AUTO_INCREMENT PRIMARY KEY,
    otobus_id INT NOT NULL,
    kalkis_istasyon_id INT NOT NULL,
    varis_istasyon_id INT NOT NULL,
    kalkis_tarihi DATETIME NOT NULL,
    varis_tarihi DATETIME NOT NULL,
    ucret DECIMAL(10, 2) NOT NULL,
    aktif_mi BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (otobus_id) REFERENCES otobus(otobus_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (kalkis_istasyon_id) REFERENCES istasyon(istasyon_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (varis_istasyon_id) REFERENCES istasyon(istasyon_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_ucret CHECK (ucret > 0),
    INDEX idx_kalkis_varis_tarih (kalkis_istasyon_id, varis_istasyon_id, kalkis_tarihi),
    INDEX idx_tarih (kalkis_tarihi)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Koltuk düzeni tablosu
CREATE TABLE koltuk_duzeni (
    koltuk_id INT AUTO_INCREMENT PRIMARY KEY,
    otobus_id INT NOT NULL,
    koltuk_no INT NOT NULL,
    durum ENUM('BOŞ', 'DOLU', 'REZERVE') DEFAULT 'BOŞ',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (otobus_id) REFERENCES otobus(otobus_id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE KEY uk_otobus_koltuk (otobus_id, koltuk_no),
    CONSTRAINT chk_koltuk_no CHECK (koltuk_no > 0),
    INDEX idx_otobus_durum (otobus_id, durum)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Müşteri tablosu (yazhane için basit müşteri bilgileri)
CREATE TABLE musteri (
    musteri_id INT AUTO_INCREMENT PRIMARY KEY,
    ad VARCHAR(50) NOT NULL,
    soyad VARCHAR(50) NOT NULL,
    tc_kimlik_no VARCHAR(11) NOT NULL,
    telefon VARCHAR(15) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_tc_kimlik_no CHECK (LENGTH(tc_kimlik_no) = 11),
    INDEX idx_tc_kimlik (tc_kimlik_no),
    INDEX idx_telefon (telefon)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Bilet tablosu
CREATE TABLE bilet (
    bilet_id INT AUTO_INCREMENT PRIMARY KEY,
    musteri_id INT NOT NULL,
    sefer_id INT NOT NULL,
    koltuk_no INT NOT NULL,
    bilet_tarihi DATETIME DEFAULT CURRENT_TIMESTAMP,
    bilet_durumu ENUM('AKTIF', 'IPTAL', 'KULLANILDI') DEFAULT 'AKTIF',
    ucret DECIMAL(10, 2) NOT NULL,
    satis_yapan_personel VARCHAR(100) NOT NULL,
    notlar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (musteri_id) REFERENCES musteri(musteri_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (sefer_id) REFERENCES sefer(sefer_id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE KEY uk_sefer_koltuk (sefer_id, koltuk_no),
    CONSTRAINT chk_bilet_ucret CHECK (ucret > 0),
    INDEX idx_musteri_tarih (musteri_id, bilet_tarihi),
    INDEX idx_sefer_durum (sefer_id, bilet_durumu)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Ödeme tablosu
CREATE TABLE odeme (
    odeme_id INT AUTO_INCREMENT PRIMARY KEY,
    bilet_id INT NOT NULL,
    tutar DECIMAL(10, 2) NOT NULL,
    odeme_tarihi DATETIME DEFAULT CURRENT_TIMESTAMP,
    odeme_turu ENUM('NAKİT', 'KREDİ_KARTI', 'BANKA_HAVALESI') NOT NULL,
    durum ENUM('BAŞARILI', 'BAŞARISIZ', 'İADE') DEFAULT 'BAŞARILI',
    aciklama TEXT,
    FOREIGN KEY (bilet_id) REFERENCES bilet(bilet_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_odeme_tutar CHECK (tutar > 0),
    INDEX idx_bilet_tarih (bilet_id, odeme_tarihi)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =============================================
-- ÖRNEK VERİLERİN EKLENMESİ
-- =============================================

-- Otobüs firmaları
INSERT INTO otobus_firmasi (firma_adi, telefon, email, vergi_no, merkez_adres) VALUES
('Metro Turizm', '0212-444-3455', 'info@metroturizm.com.tr', '1234567890', 'İstanbul Otogarı, Bayrampaşa/İstanbul'),
('Pamukkale Turizm', '0212-444-0724', 'info@pamukkale.com.tr', '2345678901', 'Esenler Otogarı, İstanbul'),
('Ulusoy Seyahat', '0212-444-1888', 'info@ulusoy.com.tr', '3456789012', 'Büyük İstanbul Otogarı, İstanbul'),
('Kamil Koç', '0212-444-0562', 'info@kamilkoc.com.tr', '4567890123', 'Esenler Otogarı, İstanbul'),
('Varan Turizm', '0212-251-7474', 'info@varan.com.tr', '5678901234', 'Harem Otogarı, İstanbul'),
('Özkaymak Petrol Turizm', '0212-444-6060', 'info@ozkaymak.com.tr', '6789012345', 'Ankara AŞTİ Otogarı, Altındağ/Ankara'),
('Ben Turizm', '0232-444-7070', 'info@benturizm.com.tr', '7890123456', 'İzmir Otogarı, Bornova/İzmir'),
('Süha Turizm', '0242-444-8080', 'info@suha.com.tr', '8901234567', 'Antalya Otogarı, Kepez/Antalya'),
('Prenses Koç', '0224-444-9090', 'info@prenseskoc.com.tr', '9012345678', 'Bursa Otogarı, Osmangazi/Bursa'),
('Balıkesir Uludağ', '0266-444-1010', 'info@balikesiruludag.com.tr', '0123456789', 'Balıkesir Otogarı, Karesi/Balıkesir'),
('Tokat Yıldızı', '0356-444-2020', 'info@tokatyildizi.com.tr', '1357924680', 'Tokat Otogarı, Merkez/Tokat'),
('Ege Ekspres', '0232-444-3030', 'info@egeekspres.com.tr', '2468013579', 'İzmir Alsancak, Konak/İzmir');

-- İstasyonlar
INSERT INTO istasyon (istasyon_adi, il, ilce, adres) VALUES
-- İstanbul
('Esenler Otogarı', 'İstanbul', 'Esenler', 'Otogar Mah. Bayraktar Bulvarı No:1'),
('Harem Otogarı', 'İstanbul', 'Üsküdar', 'Harem Sahil Yolu No:1'),
('Büyük İstanbul Otogarı', 'İstanbul', 'Bayrampaşa', 'Otogar Mah. Terminal Cad. No:1'),

-- Ankara
('AŞTİ Otogarı', 'Ankara', 'Altındağ', 'Hipodrom Cad. No:1 Altındağ'),
('Ankara Kızılay', 'Ankara', 'Çankaya', 'Kızılay Meydanı'),

-- İzmir
('İzmir Otogarı', 'İzmir', 'Bornova', 'Şehir İçi Otogarı Bornova'),
('Alsancak Garı', 'İzmir', 'Konak', 'Alsancak Mah. Atatürk Cad.'),

-- Antalya
('Antalya Otogarı', 'Antalya', 'Kepez', 'Otogar Mah. Terminal Cad.'),
('Antalya Kalekapısı', 'Antalya', 'Muratpaşa', 'Kalekapısı Mah.'),

-- Bursa
('Bursa Otogarı', 'Bursa', 'Osmangazi', 'Terminal Cad. Osmangazi'),

-- Adana
('Adana Otogarı', 'Adana', 'Seyhan', 'Otogar Mah. Seyhan'),

-- Konya
('Konya Otogarı', 'Konya', 'Selçuklu', 'Otogar Mah. Selçuklu'),

-- Trabzon
('Trabzon Otogarı', 'Trabzon', 'Ortahisar', 'Otogar Mah. Ortahisar'),

-- Samsun
('Samsun Otogarı', 'Samsun', 'İlkadım', 'Otogar Mah. İlkadım'),

-- Gaziantep
('Gaziantep Otogarı', 'Gaziantep', 'Şahinbey', 'Otogar Mah. Şahinbey');

-- Otobüsler
INSERT INTO otobus (firma_id, plaka, model, koltuk_sayisi, ozellikler) VALUES
(1, '34ABC123', 'Mercedes Travego', 45, 'WiFi, TV, Klima, İkram'),
(1, '34ABC124', 'Mercedes Travego', 45, 'WiFi, TV, Klima, İkram'),
(2, '35DEF456', 'Setra S516', 50, 'WiFi, TV, Klima, İkram, USB'),
(2, '35DEF457', 'Setra S516', 50, 'WiFi, TV, Klima, İkram, USB'),
(3, '06GHI789', 'Neoplan Tourliner', 48, 'WiFi, TV, Klima, İkram'),
(3, '06GHI790', 'Neoplan Tourliner', 48, 'WiFi, TV, Klima, İkram'),
(4, '16JKL012', 'Mercedes Tourismo', 52, 'WiFi, TV, Klima, İkram'),
(4, '16JKL013', 'Mercedes Tourismo', 52, 'WiFi, TV, Klima, İkram'),
(5, '34MNO345', 'Setra S515', 46, 'WiFi, TV, Klima, İkram, Masaj'),
(5, '34MNO346', 'Setra S515', 46, 'WiFi, TV, Klima, İkram, Masaj');

-- Seferler (önümüzdeki 7 gün için)
INSERT INTO sefer (otobus_id, kalkis_istasyon_id, varis_istasyon_id, kalkis_tarihi, varis_tarihi, ucret) VALUES
-- İstanbul - Ankara seferleri
(1, 1, 4, '2025-06-08 08:00:00', '2025-06-08 13:30:00', 250.00),
(2, 1, 4, '2025-06-08 14:00:00', '2025-06-08 19:30:00', 250.00),
(3, 1, 4, '2025-06-08 20:00:00', '2025-06-09 01:30:00', 280.00),
(1, 1, 4, '2025-06-09 08:00:00', '2025-06-09 13:30:00', 250.00),
(2, 1, 4, '2025-06-09 14:00:00', '2025-06-09 19:30:00', 250.00),

-- Ankara - İstanbul seferleri
(4, 4, 1, '2025-06-08 09:00:00', '2025-06-08 14:30:00', 250.00),
(5, 4, 1, '2025-06-08 15:00:00', '2025-06-08 20:30:00', 250.00),
(6, 4, 1, '2025-06-08 21:00:00', '2025-06-09 02:30:00', 280.00),

-- İstanbul - İzmir seferleri
(7, 1, 6, '2025-06-08 10:00:00', '2025-06-08 18:00:00', 300.00),
(8, 1, 6, '2025-06-08 22:00:00', '2025-06-09 06:00:00', 320.00),
(9, 1, 6, '2025-06-09 10:00:00', '2025-06-09 18:00:00', 300.00),

-- İzmir - İstanbul seferleri
(10, 6, 1, '2025-06-08 11:00:00', '2025-06-08 19:00:00', 300.00),
(1, 6, 1, '2025-06-08 23:00:00', '2025-06-09 07:00:00', 320.00),

-- İstanbul - Antalya seferleri
(2, 1, 8, '2025-06-08 12:00:00', '2025-06-09 01:00:00', 400.00),
(3, 1, 8, '2025-06-09 12:00:00', '2025-06-10 01:00:00', 400.00),

-- Antalya - İstanbul seferleri
(4, 8, 1, '2025-06-08 13:00:00', '2025-06-09 02:00:00', 400.00),
(5, 8, 1, '2025-06-09 13:00:00', '2025-06-10 02:00:00', 400.00),

-- Ankara - İzmir seferleri
(6, 4, 6, '2025-06-08 14:00:00', '2025-06-08 22:00:00', 350.00),
(7, 4, 6, '2025-06-09 14:00:00', '2025-06-09 22:00:00', 350.00),

-- İzmir - Ankara seferleri
(8, 6, 4, '2025-06-08 15:00:00', '2025-06-08 23:00:00', 350.00),
(9, 6, 4, '2025-06-09 15:00:00', '2025-06-09 23:00:00', 350.00);

-- =============================================
-- SAKLI YORDAMLAR (STORED PROCEDURES)
-- =============================================

-- Sefer ara
DELIMITER $$
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
        ki.il AS kalkis_il,
        s.varis_istasyon_id,
        vi.istasyon_adi AS varis_istasyon_adi,
        vi.il AS varis_il,
        s.kalkis_tarihi,
        s.varis_tarihi,
        s.ucret,
        o.koltuk_sayisi,
        (SELECT COUNT(*) FROM bilet b WHERE b.sefer_id = s.sefer_id AND b.bilet_durumu = 'AKTIF') AS dolu_koltuk_sayisi,
        (o.koltuk_sayisi - (SELECT COUNT(*) FROM bilet b WHERE b.sefer_id = s.sefer_id AND b.bilet_durumu = 'AKTIF')) AS bos_koltuk_sayisi
    FROM sefer s
    JOIN otobus o ON s.otobus_id = o.otobus_id
    JOIN otobus_firmasi f ON o.firma_id = f.firma_id
    JOIN istasyon ki ON s.kalkis_istasyon_id = ki.istasyon_id
    JOIN istasyon vi ON s.varis_istasyon_id = vi.istasyon_id
    WHERE ki.il = p_kalkis_il 
    AND vi.il = p_varis_il 
    AND DATE(s.kalkis_tarihi) = p_tarih
    AND s.aktif_mi = TRUE
    AND s.kalkis_tarihi > NOW()
    ORDER BY s.kalkis_tarihi;
END $$
DELIMITER ;

-- Sefer ekle (validasyon ile)
DELIMITER $$
CREATE PROCEDURE sp_sefer_ekle(
    IN p_otobus_id INT,
    IN p_kalkis_istasyon_id INT,
    IN p_varis_istasyon_id INT,
    IN p_kalkis_tarihi DATETIME,
    IN p_varis_tarihi DATETIME,
    IN p_ucret DECIMAL(10, 2)
)
BEGIN
    DECLARE v_sefer_id INT;
    DECLARE v_error_msg VARCHAR(255);
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        GET DIAGNOSTICS CONDITION 1
            v_error_msg = MESSAGE_TEXT;
        SELECT 'HATA' AS durum, v_error_msg AS mesaj, 0 AS sefer_id;
    END;
    
    START TRANSACTION;
    
    -- İstasyon kontrolü
    IF p_kalkis_istasyon_id = p_varis_istasyon_id THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Kalkış ve varış istasyonları aynı olamaz.';
    END IF;
    
    -- Tarih kontrolü
    IF p_varis_tarihi <= p_kalkis_tarihi THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Varış tarihi kalkış tarihinden sonra olmalıdır.';
    END IF;
    
    -- Otobüs mevcut mu kontrolü
    IF NOT EXISTS (SELECT 1 FROM otobus WHERE otobus_id = p_otobus_id AND aktif_mi = TRUE) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Otobüs bulunamadı veya aktif değil.';
    END IF;
    
    -- İstasyonlar mevcut mu kontrolü
    IF NOT EXISTS (SELECT 1 FROM istasyon WHERE istasyon_id = p_kalkis_istasyon_id AND aktif_mi = TRUE) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Kalkış istasyonu bulunamadı veya aktif değil.';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM istasyon WHERE istasyon_id = p_varis_istasyon_id AND aktif_mi = TRUE) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Varış istasyonu bulunamadı veya aktif değil.';
    END IF;
    
    INSERT INTO sefer (
        otobus_id,
        kalkis_istasyon_id,
        varis_istasyon_id,
        kalkis_tarihi,
        varis_tarihi,
        ucret,
        aktif_mi
    ) VALUES (
        p_otobus_id,
        p_kalkis_istasyon_id,
        p_varis_istasyon_id,
        p_kalkis_tarihi,
        p_varis_tarihi,
        p_ucret,
        TRUE
    );
    
    SET v_sefer_id = LAST_INSERT_ID();
    
    COMMIT;
    
    SELECT 'BAŞARILI' AS durum, 'Sefer başarıyla eklendi.' AS mesaj, v_sefer_id AS sefer_id;
END $$
DELIMITER ;

-- Sefer detayı getir
DELIMITER $$
CREATE PROCEDURE sp_sefer_detay(
    IN p_sefer_id INT
)
BEGIN
    SELECT 
        s.sefer_id,
        s.otobus_id,
        o.plaka,
        o.model,
        o.ozellikler,
        f.firma_adi,
        s.kalkis_istasyon_id,
        ki.istasyon_adi AS kalkis_istasyon_adi,
        ki.il AS kalkis_il,
        ki.adres AS kalkis_adres,
        s.varis_istasyon_id,
        vi.istasyon_adi AS varis_istasyon_adi,
        vi.il AS varis_il,
        vi.adres AS varis_adres,
        s.kalkis_tarihi,
        s.varis_tarihi,
        s.ucret,
        o.koltuk_sayisi
    FROM sefer s
    JOIN otobus o ON s.otobus_id = o.otobus_id
    JOIN otobus_firmasi f ON o.firma_id = f.firma_id
    JOIN istasyon ki ON s.kalkis_istasyon_id = ki.istasyon_id
    JOIN istasyon vi ON s.varis_istasyon_id = vi.istasyon_id
    WHERE s.sefer_id = p_sefer_id;
END $$
DELIMITER ;

-- Koltuk durumları getir
DELIMITER $$
CREATE PROCEDURE sp_koltuk_durumları(
    IN p_sefer_id INT
)
BEGIN
    SELECT 
        kd.koltuk_no,
        CASE 
            WHEN b.bilet_id IS NOT NULL AND b.bilet_durumu = 'AKTIF' THEN 'DOLU'
            ELSE 'BOŞ'
        END AS durum,
        CASE 
            WHEN b.bilet_id IS NOT NULL AND b.bilet_durumu = 'AKTIF' THEN CONCAT(m.ad, ' ', m.soyad)
            ELSE NULL
        END AS yolcu_adi
    FROM koltuk_duzeni kd
    JOIN sefer s ON kd.otobus_id = s.otobus_id
    LEFT JOIN bilet b ON s.sefer_id = b.sefer_id AND kd.koltuk_no = b.koltuk_no AND b.bilet_durumu = 'AKTIF'
    LEFT JOIN musteri m ON b.musteri_id = m.musteri_id
    WHERE s.sefer_id = p_sefer_id
    ORDER BY kd.koltuk_no;
END $$
DELIMITER ;

-- Müşteri ekle veya güncelle
DELIMITER $$
CREATE PROCEDURE sp_musteri_ekle_guncelle(
    IN p_ad VARCHAR(50),
    IN p_soyad VARCHAR(50),
    IN p_tc_kimlik_no VARCHAR(11),
    IN p_telefon VARCHAR(15),
    IN p_email VARCHAR(100)
)
BEGIN
    DECLARE v_musteri_id INT;
    
    -- Önce TC kimlik numarasına göre müşteri var mı kontrol et
    SELECT musteri_id INTO v_musteri_id
    FROM musteri
    WHERE tc_kimlik_no = p_tc_kimlik_no
    LIMIT 1;
    
    IF v_musteri_id IS NOT NULL THEN
        -- Müşteri varsa güncelle
        UPDATE musteri
        SET 
            ad = p_ad,
            soyad = p_soyad,
            telefon = p_telefon,
            email = p_email
        WHERE musteri_id = v_musteri_id;
        
        SELECT v_musteri_id AS musteri_id, 'GÜNCELLENDI' AS durum;
    ELSE
        -- Müşteri yoksa yeni ekle
        INSERT INTO musteri (ad, soyad, tc_kimlik_no, telefon, email)
        VALUES (p_ad, p_soyad, p_tc_kimlik_no, p_telefon, p_email);
        
        SELECT LAST_INSERT_ID() AS musteri_id, 'EKLENDİ' AS durum;
    END IF;
END $$
DELIMITER ;

-- Bilet sat
DELIMITER $$
CREATE PROCEDURE sp_bilet_sat(
    IN p_musteri_id INT,
    IN p_sefer_id INT,
    IN p_koltuk_no INT,
    IN p_ucret DECIMAL(10, 2),
    IN p_satis_yapan_personel VARCHAR(100),
    IN p_odeme_turu ENUM('NAKİT', 'KREDİ_KARTI', 'BANKA_HAVALESI'),
    IN p_notlar TEXT
)
BEGIN
    DECLARE v_koltuk_durumu VARCHAR(10);
    DECLARE v_sefer_tarihi DATETIME;
    DECLARE v_bilet_id INT;
    DECLARE v_error_msg VARCHAR(255);
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        GET DIAGNOSTICS CONDITION 1
            v_error_msg = MESSAGE_TEXT;
        SELECT 'HATA' AS durum, v_error_msg AS mesaj;
    END;
    
    START TRANSACTION;
    
    -- Seferin tarihini kontrol et
    SELECT kalkis_tarihi INTO v_sefer_tarihi
    FROM sefer
    WHERE sefer_id = p_sefer_id AND aktif_mi = TRUE;
    
    IF v_sefer_tarihi IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Sefer bulunamadı veya aktif değil.';
    END IF;
    
    IF v_sefer_tarihi <= NOW() THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Bu sefer için bilet satışı yapılamaz. Sefer tarihi geçmiş.';
    END IF;
    
    -- Koltuğun durumunu kontrol et
    SELECT 
        CASE 
            WHEN b.bilet_id IS NOT NULL AND b.bilet_durumu = 'AKTIF' THEN 'DOLU'
            ELSE 'BOŞ'
        END INTO v_koltuk_durumu
    FROM koltuk_duzeni kd
    JOIN sefer s ON kd.otobus_id = s.otobus_id
    LEFT JOIN bilet b ON s.sefer_id = b.sefer_id AND kd.koltuk_no = b.koltuk_no AND b.bilet_durumu = 'AKTIF'
    WHERE s.sefer_id = p_sefer_id AND kd.koltuk_no = p_koltuk_no;
    
    IF v_koltuk_durumu = 'DOLU' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Bu koltuk zaten satılmış.';
    END IF;
    
    -- Bileti oluştur
    INSERT INTO bilet (
        musteri_id,
        sefer_id,
        koltuk_no,
        ucret,
        satis_yapan_personel,
        notlar
    ) VALUES (
        p_musteri_id,
        p_sefer_id,
        p_koltuk_no,
        p_ucret,
        p_satis_yapan_personel,
        p_notlar
    );
    
    SET v_bilet_id = LAST_INSERT_ID();
    
    -- Ödeme kaydı oluştur
    INSERT INTO odeme (
        bilet_id,
        tutar,
        odeme_turu,
        aciklama
    ) VALUES (
        v_bilet_id,
        p_ucret,
        p_odeme_turu,
        CONCAT('Bilet satışı - ', p_satis_yapan_personel)
    );
    
    COMMIT;
    
    SELECT 'BAŞARILI' AS durum, v_bilet_id AS bilet_id, 'Bilet başarıyla satıldı.' AS mesaj;
END $$
DELIMITER ;

-- Bilet iptal et
DELIMITER $$
CREATE PROCEDURE sp_bilet_iptal(
    IN p_bilet_id INT,
    IN p_iptal_eden_personel VARCHAR(100),
    IN p_iptal_nedeni TEXT
)
BEGIN
    DECLARE v_bilet_durumu VARCHAR(10);
    DECLARE v_sefer_tarihi DATETIME;
    DECLARE v_iptal_suresi INT;
    DECLARE v_ucret DECIMAL(10,2);
    DECLARE v_error_msg VARCHAR(255);
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        GET DIAGNOSTICS CONDITION 1
            v_error_msg = MESSAGE_TEXT;
        SELECT 'HATA' AS durum, v_error_msg AS mesaj;
    END;
    
    START TRANSACTION;
    
    -- Biletin durumunu ve sefer tarihini kontrol et
    SELECT b.bilet_durumu, s.kalkis_tarihi, b.ucret
    INTO v_bilet_durumu, v_sefer_tarihi, v_ucret
    FROM bilet b
    JOIN sefer s ON b.sefer_id = s.sefer_id
    WHERE b.bilet_id = p_bilet_id;
    
    IF v_bilet_durumu IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Bilet bulunamadı.';
    END IF;
    
    IF v_bilet_durumu != 'AKTIF' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Bu bilet zaten iptal edilmiş veya kullanılmış.';
    END IF;
    
    -- İptal süresini kontrol et (2 saat öncesine kadar iptal edilebilir)
    SET v_iptal_suresi = TIMESTAMPDIFF(HOUR, NOW(), v_sefer_tarihi);
    
    IF v_iptal_suresi < 2 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Bilet iptal süresi geçmiş. Hareket saatine 2 saatten az kaldığı için bilet iptal edilemez.';
    END IF;
    
    -- Bileti iptal et
    UPDATE bilet
    SET 
        bilet_durumu = 'IPTAL',
        notlar = CONCAT(IFNULL(notlar, ''), '\nİPTAL: ', NOW(), ' - ', p_iptal_eden_personel, ' - ', p_iptal_nedeni)
    WHERE bilet_id = p_bilet_id;
    
    -- İade kaydı oluştur
    INSERT INTO odeme (
        bilet_id,
        tutar,
        odeme_turu,
        durum,
        aciklama
    ) VALUES (
        p_bilet_id,
        v_ucret,
        'NAKİT',
        'İADE',
        CONCAT('Bilet iptali - ', p_iptal_eden_personel, ' - ', p_iptal_nedeni)
    );
    
    COMMIT;
    
    SELECT 'BAŞARILI' AS durum, 'Bilet başarıyla iptal edildi.' AS mesaj, v_ucret AS iade_tutari;
END $$
DELIMITER ;

-- Bilet ara
DELIMITER $$
CREATE PROCEDURE sp_bilet_ara(
    IN p_arama_kriteri VARCHAR(100)
)
BEGIN
    SELECT 
        b.bilet_id,
        CONCAT(m.ad, ' ', m.soyad) AS yolcu_adi,
        m.tc_kimlik_no,
        m.telefon,
        f.firma_adi,
        ki.il AS kalkis_il,
        ki.istasyon_adi AS kalkis_istasyon,
        vi.il AS varis_il,
        vi.istasyon_adi AS varis_istasyon,
        s.kalkis_tarihi,
        s.varis_tarihi,
        b.koltuk_no,
        b.ucret,
        b.bilet_durumu,
        b.satis_yapan_personel,
        b.bilet_tarihi
    FROM bilet b
    JOIN musteri m ON b.musteri_id = m.musteri_id
    JOIN sefer s ON b.sefer_id = s.sefer_id
    JOIN otobus o ON s.otobus_id = o.otobus_id
    JOIN otobus_firmasi f ON o.firma_id = f.firma_id
    JOIN istasyon ki ON s.kalkis_istasyon_id = ki.istasyon_id
    JOIN istasyon vi ON s.varis_istasyon_id = vi.istasyon_id
    WHERE 
        b.bilet_id = p_arama_kriteri
        OR m.tc_kimlik_no = p_arama_kriteri
        OR m.telefon = p_arama_kriteri
        OR CONCAT(m.ad, ' ', m.soyad) LIKE CONCAT('%', p_arama_kriteri, '%')
    ORDER BY b.bilet_tarihi DESC;
END $$
DELIMITER ;

-- İstasyonları listele
DELIMITER $$
CREATE PROCEDURE sp_istasyon_listele()
BEGIN
    SELECT DISTINCT il
    FROM istasyon
    WHERE aktif_mi = TRUE
    ORDER BY il;
END $$
DELIMITER ;

-- Firmaları listele
DELIMITER $$
CREATE PROCEDURE sp_firma_listele()
BEGIN
    SELECT 
        firma_id,
        firma_adi,
        telefon,
        email
    FROM otobus_firmasi
    WHERE aktif_mi = TRUE
    ORDER BY firma_adi;
END $$
DELIMITER ;

-- Firma CRUD işlemleri

-- Tüm firmaları getir (yönetim paneli için)
DELIMITER $$
CREATE PROCEDURE sp_firma_tumunu_getir(
    IN p_search VARCHAR(100),
    IN p_durum VARCHAR(10)
)
BEGIN
    SELECT 
        f.firma_id,
        f.firma_adi,
        f.telefon,
        f.email,
        f.vergi_no,
        f.merkez_adres,
        f.aktif_mi,
        f.created_at,
        f.updated_at,
        COUNT(o.otobus_id) AS otobus_sayisi,
        COUNT(DISTINCT s.sefer_id) AS toplam_sefer_sayisi,
        ROUND(AVG(CASE WHEN b.bilet_durumu = 'AKTIF' THEN 5.0 ELSE 4.0 END), 1) AS ortalama_puan
    FROM otobus_firmasi f
    LEFT JOIN otobus o ON f.firma_id = o.firma_id AND o.aktif_mi = TRUE
    LEFT JOIN sefer s ON o.otobus_id = s.otobus_id AND s.aktif_mi = TRUE
    LEFT JOIN bilet b ON s.sefer_id = b.sefer_id
    WHERE 
        (p_search IS NULL OR p_search = '' OR 
         f.firma_adi LIKE CONCAT('%', p_search, '%') OR
         f.telefon LIKE CONCAT('%', p_search, '%') OR
         f.email LIKE CONCAT('%', p_search, '%'))
    AND 
        (p_durum IS NULL OR p_durum = '' OR p_durum = 'TUMU' OR
         (p_durum = 'AKTIF' AND f.aktif_mi = TRUE) OR
         (p_durum = 'PASIF' AND f.aktif_mi = FALSE))
    GROUP BY f.firma_id
    ORDER BY f.firma_adi;
END $$
DELIMITER ;

-- Firma detayını getir
DELIMITER $$
CREATE PROCEDURE sp_firma_detay(
    IN p_firma_id INT
)
BEGIN
    SELECT 
        f.firma_id,
        f.firma_adi,
        f.telefon,
        f.email,
        f.vergi_no,
        f.merkez_adres,
        f.aktif_mi,
        f.created_at,
        f.updated_at,
        COUNT(o.otobus_id) AS otobus_sayisi,
        COUNT(DISTINCT s.sefer_id) AS toplam_sefer_sayisi,
        COUNT(CASE WHEN s.kalkis_tarihi >= CURDATE() THEN 1 END) AS aktif_sefer_sayisi,
        SUM(CASE WHEN b.bilet_durumu = 'AKTIF' AND DATE(b.bilet_tarihi) = CURDATE() THEN 1 ELSE 0 END) AS bugun_satis_adedi,
        SUM(CASE WHEN b.bilet_durumu = 'AKTIF' AND DATE(b.bilet_tarihi) = CURDATE() THEN b.ucret ELSE 0 END) AS bugun_gelir
    FROM otobus_firmasi f
    LEFT JOIN otobus o ON f.firma_id = o.firma_id
    LEFT JOIN sefer s ON o.otobus_id = s.otobus_id
    LEFT JOIN bilet b ON s.sefer_id = b.sefer_id
    WHERE f.firma_id = p_firma_id
    GROUP BY f.firma_id;
END $$
DELIMITER ;

-- Firma ekle
DELIMITER $$
CREATE PROCEDURE sp_firma_ekle(
    IN p_firma_adi VARCHAR(100),
    IN p_telefon VARCHAR(15),
    IN p_email VARCHAR(100),
    IN p_vergi_no VARCHAR(10),
    IN p_merkez_adres TEXT
)
BEGIN
    DECLARE v_firma_id INT;
    DECLARE v_error_msg VARCHAR(255);
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        GET DIAGNOSTICS CONDITION 1
            v_error_msg = MESSAGE_TEXT;
        SELECT 'HATA' AS durum, v_error_msg AS mesaj, 0 AS firma_id;
    END;
    
    START TRANSACTION;
    
    -- Vergi numarası kontrolü
    IF EXISTS (SELECT 1 FROM otobus_firmasi WHERE vergi_no = p_vergi_no) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Bu vergi numarası zaten kayıtlı.';
    END IF;
    
    -- Firma adı kontrolü
    IF EXISTS (SELECT 1 FROM otobus_firmasi WHERE firma_adi = p_firma_adi AND aktif_mi = TRUE) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Bu firma adı zaten kayıtlı.';
    END IF;
    
    -- Email kontrolü
    IF EXISTS (SELECT 1 FROM otobus_firmasi WHERE email = p_email AND aktif_mi = TRUE) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Bu email adresi zaten kayıtlı.';
    END IF;
    
    INSERT INTO otobus_firmasi (
        firma_adi,
        telefon,
        email,
        vergi_no,
        merkez_adres,
        aktif_mi
    ) VALUES (
        p_firma_adi,
        p_telefon,
        p_email,
        p_vergi_no,
        p_merkez_adres,
        TRUE
    );
    
    SET v_firma_id = LAST_INSERT_ID();
    
    COMMIT;
    
    SELECT 'BAŞARILI' AS durum, 'Firma başarıyla eklendi.' AS mesaj, v_firma_id AS firma_id;
END $$
DELIMITER ;

-- Firma güncelle
DELIMITER $$
CREATE PROCEDURE sp_firma_guncelle(
    IN p_firma_id INT,
    IN p_firma_adi VARCHAR(100),
    IN p_telefon VARCHAR(15),
    IN p_email VARCHAR(100),
    IN p_vergi_no VARCHAR(10),
    IN p_merkez_adres TEXT
)
BEGIN
    DECLARE v_mevcut_firma_id INT;
    DECLARE v_error_msg VARCHAR(255);
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        GET DIAGNOSTICS CONDITION 1
            v_error_msg = MESSAGE_TEXT;
        SELECT 'HATA' AS durum, v_error_msg AS mesaj;
    END;
    
    START TRANSACTION;
    
    -- Firma var mı kontrol et
    SELECT firma_id INTO v_mevcut_firma_id
    FROM otobus_firmasi
    WHERE firma_id = p_firma_id;
    
    IF v_mevcut_firma_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Firma bulunamadı.';
    END IF;
    
    -- Vergi numarası kontrolü (kendi kaydı hariç)
    IF EXISTS (SELECT 1 FROM otobus_firmasi WHERE vergi_no = p_vergi_no AND firma_id != p_firma_id) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Bu vergi numarası başka bir firmada kayıtlı.';
    END IF;
    
    -- Firma adı kontrolü (kendi kaydı hariç)
    IF EXISTS (SELECT 1 FROM otobus_firmasi WHERE firma_adi = p_firma_adi AND firma_id != p_firma_id AND aktif_mi = TRUE) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Bu firma adı başka bir firmada kayıtlı.';
    END IF;
    
    -- Email kontrolü (kendi kaydı hariç)
    IF EXISTS (SELECT 1 FROM otobus_firmasi WHERE email = p_email AND firma_id != p_firma_id AND aktif_mi = TRUE) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Bu email adresi başka bir firmada kayıtlı.';
    END IF;
    
    UPDATE otobus_firmasi
    SET 
        firma_adi = p_firma_adi,
        telefon = p_telefon,
        email = p_email,
        vergi_no = p_vergi_no,
        merkez_adres = p_merkez_adres,
        updated_at = CURRENT_TIMESTAMP
    WHERE firma_id = p_firma_id;
    
    COMMIT;
    
    SELECT 'BAŞARILI' AS durum, 'Firma başarıyla güncellendi.' AS mesaj;
END $$
DELIMITER ;

-- Firma sil (soft delete)
DELIMITER $$
CREATE PROCEDURE sp_firma_sil(
    IN p_firma_id INT
)
BEGIN
    DECLARE v_mevcut_firma_id INT;
    DECLARE v_aktif_sefer_sayisi INT;
    DECLARE v_error_msg VARCHAR(255);
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        GET DIAGNOSTICS CONDITION 1
            v_error_msg = MESSAGE_TEXT;
        SELECT 'HATA' AS durum, v_error_msg AS mesaj;
    END;
    
    START TRANSACTION;
    
    -- Firma var mı kontrol et
    SELECT firma_id INTO v_mevcut_firma_id
    FROM otobus_firmasi
    WHERE firma_id = p_firma_id AND aktif_mi = TRUE;
    
    IF v_mevcut_firma_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Firma bulunamadı veya zaten pasif.';
    END IF;
    
    -- Aktif seferleri kontrol et
    SELECT COUNT(*) INTO v_aktif_sefer_sayisi
    FROM sefer s
    JOIN otobus o ON s.otobus_id = o.otobus_id
    WHERE o.firma_id = p_firma_id 
    AND s.aktif_mi = TRUE 
    AND s.kalkis_tarihi > NOW();
    
    IF v_aktif_sefer_sayisi > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Bu firmaya ait aktif seferler bulunmaktadır. Önce seferleri iptal edin.';
    END IF;
    
    -- Soft delete yap
    UPDATE otobus_firmasi
    SET 
        aktif_mi = FALSE,
        updated_at = CURRENT_TIMESTAMP
    WHERE firma_id = p_firma_id;
    
    -- İlgili otobüsleri de pasif yap
    UPDATE otobus
    SET 
        aktif_mi = FALSE,
        updated_at = CURRENT_TIMESTAMP
    WHERE firma_id = p_firma_id;
    
    COMMIT;
    
    SELECT 'BAŞARILI' AS durum, 'Firma başarıyla silindi.' AS mesaj;
END $$
DELIMITER ;

-- Firma durumunu değiştir (aktif/pasif)
DELIMITER $$
CREATE PROCEDURE sp_firma_durum_degistir(
    IN p_firma_id INT,
    IN p_aktif_mi BOOLEAN
)
BEGIN
    DECLARE v_mevcut_firma_id INT;
    DECLARE v_error_msg VARCHAR(255);
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        GET DIAGNOSTICS CONDITION 1
            v_error_msg = MESSAGE_TEXT;
        SELECT 'HATA' AS durum, v_error_msg AS mesaj;
    END;
    
    START TRANSACTION;
    
    -- Firma var mı kontrol et
    SELECT firma_id INTO v_mevcut_firma_id
    FROM otobus_firmasi
    WHERE firma_id = p_firma_id;
    
    IF v_mevcut_firma_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Firma bulunamadı.';
    END IF;
    
    UPDATE otobus_firmasi
    SET 
        aktif_mi = p_aktif_mi,
        updated_at = CURRENT_TIMESTAMP
    WHERE firma_id = p_firma_id;
    
    -- Eğer firma pasif yapılıyorsa otobüsleri de pasif yap
    IF p_aktif_mi = FALSE THEN
        UPDATE otobus
        SET 
            aktif_mi = FALSE,
            updated_at = CURRENT_TIMESTAMP
        WHERE firma_id = p_firma_id;
    END IF;
    
    COMMIT;
    
    SELECT 'BAŞARILI' AS durum, 
           CASE WHEN p_aktif_mi THEN 'Firma aktif edildi.' ELSE 'Firma pasif edildi.' END AS mesaj;
END $$
DELIMITER ;

-- Günlük satış raporu
DELIMITER $$
CREATE PROCEDURE sp_gunluk_satis_raporu(
    IN p_tarih DATE
)
BEGIN
    SELECT 
        f.firma_adi,
        COUNT(b.bilet_id) AS satis_adedi,
        SUM(b.ucret) AS toplam_gelir,
        COUNT(CASE WHEN b.bilet_durumu = 'IPTAL' THEN 1 END) AS iptal_adedi,
        SUM(CASE WHEN b.bilet_durumu = 'IPTAL' THEN b.ucret ELSE 0 END) AS iptal_tutari
    FROM bilet b
    JOIN sefer s ON b.sefer_id = s.sefer_id
    JOIN otobus o ON s.otobus_id = o.otobus_id
    JOIN otobus_firmasi f ON o.firma_id = f.firma_id
    WHERE DATE(b.bilet_tarihi) = p_tarih
    GROUP BY f.firma_id, f.firma_adi
    ORDER BY toplam_gelir DESC;
END $$
DELIMITER ;

-- =============================================
-- KULLANICI TANIMLI FONKSİYONLAR
-- =============================================

-- Seferin doluluk oranını hesaplayan fonksiyon
DELIMITER $$
CREATE FUNCTION fn_sefer_doluluk_orani(p_sefer_id INT) 
RETURNS DECIMAL(5,2)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_toplam_koltuk INT;
    DECLARE v_dolu_koltuk INT;
    DECLARE v_doluluk_orani DECIMAL(5,2);
    DECLARE v_otobus_id INT;
    
    -- Seferin otobüs ID'sini al
    SELECT otobus_id INTO v_otobus_id
    FROM sefer
    WHERE sefer_id = p_sefer_id;
    
    IF v_otobus_id IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Otobüsün toplam koltuk sayısını al
    SELECT koltuk_sayisi INTO v_toplam_koltuk
    FROM otobus
    WHERE otobus_id = v_otobus_id;
    
    -- Seferdeki dolu koltuk sayısını hesapla
    SELECT COUNT(*) INTO v_dolu_koltuk
    FROM bilet
    WHERE sefer_id = p_sefer_id AND bilet_durumu = 'AKTIF';
    
    -- Doluluk oranını hesapla
    IF v_toplam_koltuk > 0 THEN
        SET v_doluluk_orani = (v_dolu_koltuk / v_toplam_koltuk) * 100;
    ELSE
        SET v_doluluk_orani = 0;
    END IF;
    
    RETURN v_doluluk_orani;
END $$
DELIMITER ;

-- İki şehir arasındaki tahmini mesafeyi hesaplayan fonksiyon
DELIMITER $$
CREATE FUNCTION fn_sehirler_arasi_mesafe(p_kalkis_il VARCHAR(50), p_varis_il VARCHAR(50)) 
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE v_mesafe INT;
    
    -- Örnek mesafe verileri (gerçek uygulamada koordinatlar veya mesafe tablosu kullanılabilir)
    CASE 
        WHEN (p_kalkis_il = 'İstanbul' AND p_varis_il = 'Ankara') OR (p_kalkis_il = 'Ankara' AND p_varis_il = 'İstanbul') THEN
            SET v_mesafe = 450;
        WHEN (p_kalkis_il = 'İstanbul' AND p_varis_il = 'İzmir') OR (p_kalkis_il = 'İzmir' AND p_varis_il = 'İstanbul') THEN
            SET v_mesafe = 480;
        WHEN (p_kalkis_il = 'Ankara' AND p_varis_il = 'İzmir') OR (p_kalkis_il = 'İzmir' AND p_varis_il = 'Ankara') THEN
            SET v_mesafe = 580;
        WHEN (p_kalkis_il = 'İstanbul' AND p_varis_il = 'Antalya') OR (p_kalkis_il = 'Antalya' AND p_varis_il = 'İstanbul') THEN
            SET v_mesafe = 700;
        WHEN (p_kalkis_il = 'Ankara' AND p_varis_il = 'Antalya') OR (p_kalkis_il = 'Antalya' AND p_varis_il = 'Ankara') THEN
            SET v_mesafe = 500;
        WHEN (p_kalkis_il = 'İzmir' AND p_varis_il = 'Antalya') OR (p_kalkis_il = 'Antalya' AND p_varis_il = 'İzmir') THEN
            SET v_mesafe = 450;
        WHEN (p_kalkis_il = 'İstanbul' AND p_varis_il = 'Bursa') OR (p_kalkis_il = 'Bursa' AND p_varis_il = 'İstanbul') THEN
            SET v_mesafe = 230;
        WHEN (p_kalkis_il = 'İstanbul' AND p_varis_il = 'Adana') OR (p_kalkis_il = 'Adana' AND p_varis_il = 'İstanbul') THEN
            SET v_mesafe = 920;
        ELSE
            SET v_mesafe = 300; -- Varsayılan mesafe
    END CASE;
    
    RETURN v_mesafe;
END $$
DELIMITER ;

-- =============================================
-- TETİKLEYİCİLER (TRIGGERS)
-- =============================================

-- Otobüs eklendiğinde otomatik olarak koltuk düzeni oluşturan tetikleyici
DELIMITER $$
CREATE TRIGGER trg_otobus_after_insert
AFTER INSERT ON otobus
FOR EACH ROW
BEGIN
    DECLARE i INT DEFAULT 1;
    
    WHILE i <= NEW.koltuk_sayisi DO
        INSERT INTO koltuk_duzeni (otobus_id, koltuk_no, durum)
        VALUES (NEW.otobus_id, i, 'BOŞ');
        SET i = i + 1;
    END WHILE;
END $$
DELIMITER ;

-- Bilet iptal edildiğinde koltuk durumunu güncelleyen tetikleyici
DELIMITER $$
CREATE TRIGGER trg_bilet_after_update
AFTER UPDATE ON bilet
FOR EACH ROW
BEGIN
    -- Eğer bilet durumu IPTAL olarak değiştiyse, koltuk durumunu güncellemeye gerek yok
    -- Çünkü koltuk_duzeni tablosu sadece otobüs bazında koltuk yapısını tutuyor
    -- Gerçek koltuk durumu bilet tablosundan hesaplanıyor
    
    -- Log kaydı için kullanılabilir (opsiyonel)
    IF NEW.bilet_durumu = 'IPTAL' AND OLD.bilet_durumu != 'IPTAL' THEN
        -- Burada log tablosuna kayıt eklenebilir
        SET @log_message = CONCAT('Bilet iptal edildi: ', NEW.bilet_id);
    END IF;
END $$
DELIMITER ;

-- Sefer silindiğinde ilgili biletleri iptal eden tetikleyici
DELIMITER $$
CREATE TRIGGER trg_sefer_before_delete
BEFORE DELETE ON sefer
FOR EACH ROW
BEGIN
    -- İlgili biletleri iptal et
    UPDATE bilet
    SET bilet_durumu = 'IPTAL',
        notlar = CONCAT(IFNULL(notlar, ''), '\nSEFER İPTAL EDİLDİ: ', NOW())
    WHERE sefer_id = OLD.sefer_id AND bilet_durumu = 'AKTIF';
END $$
DELIMITER ;

-- =============================================
-- VERİTABANI PERFORMANS OPTİMİZASYONU
-- =============================================

-- Ek indeksler
CREATE INDEX idx_bilet_tarih_durum ON bilet(bilet_tarihi, bilet_durumu);
CREATE INDEX idx_sefer_kalkis_tarih ON sefer(kalkis_tarihi);
CREATE INDEX idx_musteri_tc ON musteri(tc_kimlik_no);
CREATE INDEX idx_istasyon_il_aktif ON istasyon(il, aktif_mi);

-- =============================================
-- VERİTABANI KURULUM TAMAMLANDI
-- =============================================

-- Kurulum bilgileri
SELECT 
    'OBilet Veritabanı başarıyla kuruldu!' AS mesaj,
    VERSION() AS mysql_version,
    @@character_set_database AS charset,
    @@collation_database AS collation,
    NOW() AS kurulum_tarihi;

-- Tablo sayıları
SELECT 
    'Firmalar' AS tablo, COUNT(*) AS kayit_sayisi FROM otobus_firmasi
UNION ALL
SELECT 'İstasyonlar', COUNT(*) FROM istasyon
UNION ALL
SELECT 'Otobüsler', COUNT(*) FROM otobus
UNION ALL
SELECT 'Seferler', COUNT(*) FROM sefer
UNION ALL
SELECT 'Koltuk Düzeni', COUNT(*) FROM koltuk_duzeni;

