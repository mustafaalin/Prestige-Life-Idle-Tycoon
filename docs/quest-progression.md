# Quest Progression

Bu dosya oyundaki görev sistemi için hedef progression planını tutar.
Aktif kod artık `10 chapter x 10 görev = 100 görev` yapısını içerir.

## Genel Mantık

- Görev sistemi chapter bazlı ilerler.
- Her chapter `10 görev` içerir.
- Aynı chapter içindeki görevler paralel tamamlanabilir.
- Bir chapter içindeki `10/10` görev tamamlanınca chapter reward açılır.
- Chapter reward claim edilmeden bir sonraki chapter açılmaz.
- Claim edilmemiş görev ödülü varsa quest ikonunda dikkat işareti görünmelidir.
- Chapter reward'leri prestij puanı verir.

## Chapter Reward Mantığı

- Chapter 1 reward: `+3 prestige`
- Chapter 2 reward: `+4 prestige`
- Chapter 3 reward: `+5 prestige`
- Chapter 4 reward: `+5 prestige`
- Chapter 5 reward: `+5 prestige`
- Chapter 6 reward: `+5 prestige`
- Chapter 7 reward: `+5 prestige`
- Chapter 8 reward: `+5 prestige`
- Chapter 9 reward: `+5 prestige`
- Chapter 10 reward: `+5 prestige`

## Görev Ödül Mantığı

- Aksiyon görevleri ağırlıklı olarak para ödülü verir.
- Prestij milestone görevleri gem ödülü verir.
- Ödüller sert katlanmamalı; erken oyunda daha kontrollü büyümelidir.
- Chapter reward, normal görev ödülünden ayrışmalı ve sadece prestij puanı vermelidir.

## Chapter 1: Starting Out

1. İlk işine başla
   - ödül: `$100`
2. Günlük ödülünü al
   - ödül: `$150`
3. İlk işinde toplam 3 dakika çalış
   - ödül: `$250`
4. İkinci işe geç
   - ödül: `$300`
5. İlk aracını satın al
   - ödül: `$400`
6. Level 2 eve geç
   - ödül: `$500`
7. İlk outfit'ini satın al
   - ödül: `$500`
8. Toplam prestijini `10` yap
   - ödül: `2 gem`
9. İlk business'ini satın al
   - ödül: `$750`
10. İlk business upgrade'ini yap
   - ödül: `$900`

## Chapter 2: Moving Up

11. Birikmiş paranı ilk kez claim et
   - ödül: `$1000`
12. Üçüncü işe geç
   - ödül: `$1100`
13. Toplam prestijini `20` yap
   - ödül: `3 gem`
14. İkinci business'ini satın al
   - ödül: `$1250`
15. Level 3 eve geç
   - ödül: `$1400`
16. İkinci outfit'ini satın al
   - ödül: `$1500`
17. İlk investment property'ni satın al
   - ödül: `$1750`
18. İlk investment upgrade'ini yap
   - ödül: `$2000`
19. Dördüncü işe geç
   - ödül: `$2200`
20. Toplam prestijini `35` yap
   - ödül: `5 gem`

## Chapter 3: Building Wealth

21. Üçüncü business'ini satın al
   - ödül: `$2500`
22. Bir business'i level 3 yap
   - ödül: `$2750`
23. Level 4 eve geç
   - ödül: `$3000`
24. İkinci aracını satın al
   - ödül: `$3250`
25. Toplam prestijini `50` yap
   - ödül: `7 gem`
26. Beşinci işe geç
   - ödül: `$3500`
27. Dördüncü business'ini satın al
   - ödül: `$3750`
28. Toplam `2` investment property satın al
   - ödül: `$4000`
29. Level 5 eve geç
   - ödül: `$4250`
30. Toplam prestijini `75` yap
   - ödül: `10 gem`

## Chapter 4: Expansion

31. Altıncı işe geç
   - ödül: `$4500`
32. Toplam `3` earnings claim yap
   - ödül: `$4750`
33. Beşinci business'ini satın al
   - ödül: `$5000`
34. Bir business'i level 4 yap
   - ödül: `$5500`
35. Üçüncü outfit'ini satın al
   - ödül: `$6000`
36. Toplam `3` investment property satın al
   - ödül: `$6500`
37. Bir property'i level 3 yap
   - ödül: `$7000`
38. Toplam prestijini `100` yap
   - ödül: `12 gem`
39. Üçüncü aracını satın al
   - ödül: `$8000`
40. Level 6 eve geç
   - ödül: `$9000`

## Chapter 5: Mid Game Momentum

41. Yedinci işe geç
   - ödül: `$10000`
42. Altıncı business'ini satın al
   - ödül: `$11000`
43. Toplam `5` business sahibi ol
   - ödül: `$12000`
44. Toplam `5` business upgrade yap
   - ödül: `$13000`
45. Toplam `4` investment property satın al
   - ödül: `$14500`
46. Bir property'i level 4 yap
   - ödül: `$16000`
47. Toplam prestijini `125` yap
   - ödül: `14 gem`
48. Dördüncü outfit'ini satın al
   - ödül: `$18000`
49. Dördüncü aracını satın al
   - ödül: `$20000`
50. Level 7 eve geç
   - ödül: `$22000`

## Chapter 6: Stronger Lifestyle

51. Sekizinci işe geç
   - ödül: `$24000`
52. Toplam `6` investment property satın al
   - ödül: `$26000`
53. Yedinci business'ini satın al
   - ödül: `$28000`
54. Bir business'i max level'e ulaştır
   - ödül: `$32000`
55. Lüks ev bandına ilk kez geç
   - koşul: yüksek house level
   - ödül: `$36000`
56. Toplam prestijini `150` yap
   - ödül: `16 gem`
57. Beşinci outfit'ini satın al
   - ödül: `$40000`
58. Toplam `10` görev ödülü claim et
   - ödül: `$45000`
59. Günlük ödülde 7. güne ulaş
   - ödül: `$50000`
60. Beşinci aracını satın al
   - ödül: `$55000`

## Chapter 7: Real Estate Power

61. Dokuzuncu işe geç
   - ödül: `$60000`
62. Toplam `8` investment property satın al
   - ödül: `$65000`
63. Sekizinci business'ini satın al
   - ödül: `$70000`
64. Toplam prestijini `200` yap
   - ödül: `18 gem`
65. Bir property'i full upgrade yap
   - ödül: `$80000`
66. `2` property'i level 3+ yap
   - ödül: `$90000`
67. Level 8 eve geç
   - ödül: `$100000`
68. Altıncı outfit'ini satın al
   - ödül: `$110000`
69. Toplam `5` earnings claim yap
   - ödül: `$120000`
70. Altıncı aracını satın al
   - ödül: `$130000`

## Chapter 8: Upper Class

71. Onuncu işe geç
   - ödül: `$140000`
72. Toplam `10` investment property satın al
   - ödül: `$155000`
73. Dokuzuncu business'ini satın al
   - ödül: `$170000`
74. Toplam prestijini `250` yap
   - ödül: `20 gem`
75. `3` business'i level 4+ yap
   - ödül: `$190000`
76. `2` property'i full upgrade yap
   - ödül: `$210000`
77. Level 9 eve geç
   - ödül: `$230000`
78. Yedinci outfit'ini satın al
   - ödül: `$250000`
79. Yedinci aracını satın al
   - ödül: `$275000`
80. Günlük ödülde 15. güne ulaş
   - ödül: `$300000`

## Chapter 9: Prestige Life

81. On birinci işe geç
   - ödül: `$325000`
82. Toplam `12` investment property satın al
   - ödül: `$350000`
83. Onuncu business'ini satın al
   - ödül: `$375000`
84. Toplam prestijini `325` yap
   - ödül: `22 gem`
85. Toplam `8+` business sahibi ol
   - ödül: `$425000`
86. `3` property'i full upgrade yap
   - ödül: `$475000`
87. Level 10 veya üstü eve geç
   - ödül: `$525000`
88. Sekizinci outfit'ini satın al
   - ödül: `$575000`
89. Sekizinci aracını satın al
   - ödül: `$650000`
90. Çok yüksek rental income eşiğine ulaş
   - ödül: `$725000`

## Chapter 10: Idle Guy Elite

91. On ikinci işe geç
   - ödül: `$800000`
92. Toplam `15` investment property satın al
   - ödül: `$900000`
93. Toplam `12` business sahibi ol
   - ödül: `$1000000`
94. Toplam prestijini `400` yap
   - ödül: `25 gem`
95. Toplam `10` araç sahibi ol
   - ödül: `$1150000`
96. Toplam `10` outfit sahibi ol
   - ödül: `$1300000`
97. `5` property'i full upgrade yap
   - ödül: `$1450000`
98. Çok yüksek seviye house bandına geç
   - ödül: `$1600000`
99. Toplam prestijini `500` yap
   - ödül: `30 gem`
100. Idle Guy Elite statüsüne ulaş
   - final milestone görevi
   - ödül: `$2000000 + 50 gem`

## UI Notları

- Quest modal chapter tablı çalışmalıdır.
- Her chapter üstünde sadece o chapter'a ait `x/10` progress bar görünmelidir.
- Genel toplam ilerleme ayrı bir sayaç olarak gösterilmek zorunda değildir.
- Chapter reward kartı progress barın yanında görünmelidir.
- Chapter reward kilitliyse lock göstermeli, açıldıysa `Claim`, alındıysa tik/claimed durumu göstermelidir.
- Bir chapter reward claim edilince sonraki chapter sekmesinin kilidi açılmalıdır.

## Uygulama Notları

- İleri chapter görevleri için eklenen condition tipleri:
  - toplam earnings claim sayısı
  - toplam claim edilmiş quest sayısı
  - daily streak eşiği
  - business toplam upgrade sayısı
  - belirli level üstü business sayısı
  - belirli level üstü property sayısı
  - full-upgraded property sayısı
  - rental income eşiği
