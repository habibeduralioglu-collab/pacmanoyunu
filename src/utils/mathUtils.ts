/**
 * Türkiye Yüzyılı Maarif Modeli (TYMM) 6. Sınıf Matematik
 * "Çarpanlar ve Katlar / Asal Sayılar" Pedagojik Matematik Motoru
 */

// 1 ile 100 arasındaki tüm asal sayılar (Toplam 25 adet)
export const PRIMES_UP_TO_100: number[] = [
  2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97
];

export const TRICKY_COMPOSITES: number[] = [
  1, 9, 15, 21, 25, 27, 33, 35, 39, 49, 51, 55, 57, 63, 65, 77, 81, 85, 91, 93, 95, 99
];

/**
 * Bir sayının asal olup olmadığını kontrol eder.
 * Tanım: 1'den büyük, sadece 1'e ve kendisine bölünebilen doğal sayılar.
 */
export function isPrime(n: number): boolean {
  if (n <= 1) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  for (let i = 3; i * i <= n; i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}

/**
 * Sayının tüm pozitif bölenlerini/çarpanlarını bulur.
 */
export function getFactors(n: number): number[] {
  if (n <= 0) return [];
  const factors: number[] = [];
  for (let i = 1; i <= n; i++) {
    if (n % i === 0) {
      factors.push(i);
    }
  }
  return factors;
}

/**
 * 6. Sınıf öğrencisi için pedagojik açıklama üretir.
 */
export function getPedagogicalFeedback(n: number): {
  isNumberPrime: boolean;
  shortLabel: string;
  detail: string;
  equation?: string;
} {
  if (n === 1) {
    return {
      isNumberPrime: false,
      shortLabel: "1 ASAL DEĞİLDİR!",
      detail: "1 sayısının sadece 1 tane pozitif böleni vardır. Bir sayının asal olması için 'tam 2 farklı' böleni (1 ve kendisi) olmalıdır.",
      equation: "Böleni: { 1 }"
    };
  }

  if (n === 2) {
    return {
      isNumberPrime: true,
      shortLabel: "2 ASALDIR! (+10)",
      detail: "Tebrikler! 2, en küçük asal sayıdır ve ÇİFT olan TEK asal sayıdır!",
      equation: "Bölenleri: { 1, 2 }"
    };
  }

  if (isPrime(n)) {
    return {
      isNumberPrime: true,
      shortLabel: `+10 PUAN! (${n} ASALDIR)`,
      detail: `${n} sadece 1'e ve kendisine tam bölünür. Başka hiçbir çarpanı yoktur.`,
      equation: `Bölenleri: { 1, ${n} }`
    };
  }

  // Bileşik sayı - çarpanlarını ve pedagogik sebebi göster
  const factors = getFactors(n);
  let factorA = 2;
  while (factorA < n && n % factorA !== 0) {
    factorA++;
  }
  const factorB = n / factorA;

  let hint = "";
  if (n % 2 === 0) {
    hint = "2'den büyük hiçbir çift sayı asal olamaz (çünkü hepsi 2'ye bölünür).";
  } else if (n % 3 === 0) {
    hint = "Rakamları toplamı 3'ün katı olduğu için 3'e tam bölünür.";
  } else if (n % 5 === 0) {
    hint = "Son basamağı 5 olduğu için 5'e tam bölünür.";
  } else if (n % 7 === 0) {
    hint = "7'ye kalansız bölünür.";
  }

  return {
    isNumberPrime: false,
    shortLabel: `${n} BİLEŞİK SAYI! (-5 & -1 CAN)`,
    detail: `${n} asal değildir çünkü 1 ve kendisi dışında başka bölenleri de vardır. ${hint}`,
    equation: `${n} = ${factorA} × ${factorB} (Bölenleri: ${factors.join(", ")})`
  };
}

/**
 * Labirente yerleştirilmek üzere dengeli ve öğretici bir sayı seçer.
 * - Ekranda en az 3 asal sayı kalması için asal gerekiyorsa forcePrime = true yapılabilir.
 */
export function generateMazeNumber(forcePrime: boolean = false): number {
  if (forcePrime) {
    const randomIndex = Math.floor(Math.random() * PRIMES_UP_TO_100.length);
    return PRIMES_UP_TO_100[randomIndex];
  }

  const roll = Math.random();

  // %35 ihtimalle Asal Sayı
  if (roll < 0.35) {
    const randomIndex = Math.floor(Math.random() * PRIMES_UP_TO_100.length);
    return PRIMES_UP_TO_100[randomIndex];
  }

  // %25 ihtimalle öğrencilerin sıklıkla karıştırdığı özel tek/bileşik sayılar (1, 9, 15, 21, 27, 33, 49, 91 vb.)
  if (roll < 0.60) {
    const randomIndex = Math.floor(Math.random() * TRICKY_COMPOSITES.length);
    return TRICKY_COMPOSITES[randomIndex];
  }

  // %40 ihtimalle 1-100 arasında genel rastgele sayı (özellikle çift sayılar ve diğer bileşikler)
  const num = Math.floor(Math.random() * 99) + 2; // 2..100
  return num;
}
