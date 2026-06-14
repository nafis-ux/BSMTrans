-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `whatsapp` VARCHAR(191) NOT NULL,
    `fotoKTP` VARCHAR(191) NULL,
    `fotoSIM` VARCHAR(191) NULL,
    `role` ENUM('CUSTOMER', 'ADMIN') NOT NULL DEFAULT 'CUSTOMER',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Mobil` (
    `id` VARCHAR(191) NOT NULL,
    `namaMobil` VARCHAR(191) NOT NULL,
    `tipe` VARCHAR(191) NOT NULL,
    `hargaPerHari` INTEGER NOT NULL,
    `biayaDriver` INTEGER NOT NULL DEFAULT 0,
    `statusTersedia` BOOLEAN NOT NULL DEFAULT true,
    `kursi` INTEGER NOT NULL,
    `bagasi` INTEGER NOT NULL,
    `transmisi` VARCHAR(191) NOT NULL,
    `fiturLain` VARCHAR(191) NULL,
    `image` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RuteTravel` (
    `id` VARCHAR(191) NOT NULL,
    `asal` VARCHAR(191) NOT NULL,
    `tujuan` VARCHAR(191) NOT NULL,
    `hargaTiket` INTEGER NOT NULL,
    `jadwal` VARCHAR(191) NOT NULL,
    `armada` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Transaksi` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `jenisLayanan` ENUM('SEWA_MOBIL', 'TRAVEL', 'DROP_OFF') NOT NULL,
    `mobilId` VARCHAR(191) NULL,
    `ruteTravelId` VARCHAR(191) NULL,
    `tanggalLayanan` DATE NOT NULL,
    `durasi` INTEGER NOT NULL DEFAULT 1,
    `alamatJemput` TEXT NULL,
    `detailManifest` JSON NOT NULL,
    `totalHarga` INTEGER NOT NULL,
    `sisaTagihan` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'VERIFIKASI_DP', 'DP_DIBAYAR', 'VERIFIKASI_SISA', 'LUNAS', 'BATAL') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DokumenValidasi` (
    `id` VARCHAR(191) NOT NULL,
    `transaksiId` VARCHAR(191) NOT NULL,
    `buktiResiDP` VARCHAR(191) NULL,
    `buktiResiSisa` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `DokumenValidasi_transaksiId_key`(`transaksiId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Transaksi` ADD CONSTRAINT `Transaksi_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaksi` ADD CONSTRAINT `Transaksi_mobilId_fkey` FOREIGN KEY (`mobilId`) REFERENCES `Mobil`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaksi` ADD CONSTRAINT `Transaksi_ruteTravelId_fkey` FOREIGN KEY (`ruteTravelId`) REFERENCES `RuteTravel`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DokumenValidasi` ADD CONSTRAINT `DokumenValidasi_transaksiId_fkey` FOREIGN KEY (`transaksiId`) REFERENCES `Transaksi`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
