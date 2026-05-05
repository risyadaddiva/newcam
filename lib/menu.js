// Path gambar menu berdasarkan kode kategori dan nama menu
const imageMenu = {
  'Signature_BSS': '/menu/signature_BSS.png',
  'Signature_eskopi': '/menu/signature_eskopi.png',
  'Signature_KopiSusuCreamCheese': '/menu/signature_Kopi Susu Cream Cheese.png',
  'Signature_JPSL': '/menu/signature_JPSL.png',
  'Mocktail_Berrycano': '/menu/Mocktail_Berrycano.jpg',
  'Mocktail_BlackPeachcano': '/menu/Mocktail_Black Peachcano.png',
  'Mocktail_EspressoLemon': '/menu/Mocktail_Espresso Lemon.png',
  'Mocktail_MontBlanc': '/menu/Mocktail_Mont Blanc.png',
  'BC_Americano': '/menu/BC_Americano.jpg',
  'BC_EspressoSingle': '/menu/BC_Espresso Single.jpg',
  'BC_EspressoDouble': '/menu/BC_Espresso Double.jpg',
  'BC_Longblack': '/menu/BC_Long Black.jpg',
  'WC_CaffeeLatte': '/menu/WC_Caffee Latte.jpg',
  'WC_CharamelMacchiato': '/menu/WC_Charamel Macchiato.jpg',
  'WC_DepressoIce': '/menu/WC_Depresso Ice.png',
  'WC_HotMagic': '/menu/WC_Magic.jpg',
  'WC_MoccacinoIce': '/menu/WC_Moccachino.jpg',
  'Manual_KopiTubruk': '/menu/Manual_Tubruk.jpg',
  'Manual_V60': '/menu/Manual_V60.jpeg',
  'Manual_VietnamDrip': '/menu/Manual_Vidrip.jpg',
  'Manual_Japanese': '/menu/Manual_Japanese.jpeg',
  'NC_Chocolate': '/menu/NC_Chocolate.jpeg',
  'NC_FreshmilkOriginal': '/menu/NC_Freshmilk Ori.png',
  'NC_IceOreo': '/menu/NC_Oreo.jpg',
  'NC_Intel': '/menu/NC_Lychee Tea.jpg',
  'NC_LemonTea': '/menu/NC_Lemon Tea.png',
  'NC_Matcha': '/menu/NC_Matcha.png',
  'NC_RedVelvet': '/menu/NC_Red Velvet.jpeg',
  'NC_MineralWater': '/menu/logo newcam.jpeg',
  'NC_ExtraJossHuhu': '/menu/logo newcam.jpeg',
};
export const menuCategories = [
 
  {
    id: 'signature-coffee',
    name: 'Signature Coffee',
    emoji: '⭐',
    items: [
      { id: 15, name: 'Es Kopi Susu Nu Kamari', price: 20000, description: 'Kopi susu khas Coffee New Cammary', tag: 'Best Seller', image: imageMenu['Signature_eskopi'] },
      { id: 14, name: 'Buttersoul Sea Salt', price: 25000, description: 'Kopi susu dengan butter & taburan sea salt', tag: 'Terbaru', image: imageMenu['Signature_BSS'] },
      { id: 16, name: 'Kopi Susu Cream Cheese', price: 22000, description: 'Kopi susu dengan topping cream cheese gurih', tag: 'Terbaru', image: imageMenu['Signature_KopiSusuCreamCheese'] },
      { id: 30, name: 'Japanese Sweet Lemon', price: 20000, description: 'Japanese drink dengan citrus lemon manis', tag:'Signature', image: imageMenu['Signature_JPSL'] },    
    ],
  },
  {
    id: 'mocktail-coffee',
    name: 'Mocktail Coffee',
    emoji: '🍹',
    items: [
      { id: 17, name: 'Berrycanoo', price: 25000, description: 'Perpaduan kopi & berry segar yang unik', image: imageMenu['Mocktail_Berrycano'] },
      { id: 18, name: 'Black Peachano', price: 25000, description: 'Kopi hitam dengan sentuhan peach yang segar', image: imageMenu['Mocktail_BlackPeachcano'] },
      { id: 20, name: 'Mont Blanc', price: 25000, description: 'Kreasi mocktail kopi dengan lapisan elegant', image: imageMenu['Mocktail_MontBlanc'] },
      { id: 19, name: 'Espresso Lemon (Tonic)', price: 22000, description: 'Espresso dengan tonic water & perasan lemon', image: imageMenu['Mocktail_EspressoLemon'] },
    ],
  },
  {
    id: 'black-coffee',
    name: 'Black Coffee',
    emoji: '🖤',
    items: [
      { id: 1, name: 'Americano', price: 17000, description: 'Espresso dengan air panas, bersih & kuat', image: imageMenu['BC_Americano'] },
      { id: 2, name: 'Espresso Single', price: 10000, description: 'Single shot espresso pekat & aromatik', image: imageMenu['BC_EspressoSingle'] },
      { id: 3, name: 'Espresso Double', price: 17000, description: 'Double shot espresso, intens & bold', image: imageMenu['BC_EspressoDouble'] },
      { id: 4, name: 'Longblack', price: 20000, description: 'Espresso over hot water, crema terjaga', image: imageMenu['BC_Longblack'] },
      // { id: 5, name: 'Lychee Tea', price: 18000, description: 'Teh segar dengan aroma leci manis', image: '/menu/BC_Lychee Tea.jpg' },
    ],
  },
  {
    id: 'white-coffee',
    name: 'White Coffee',
    emoji: '🤍',
    items: [
      { id: 5, name: 'Cafe Latte Original', price: 18000, description: 'Espresso lembut dengan steamed milk', image: imageMenu['WC_CaffeeLatte'] },
      { id: 6, name: 'Caramel Machiato', price: 20000, description: 'Latte vanilla dengan drizzle caramel', image: imageMenu['WC_CharamelMacchiato'] },
      { id: 7, name: 'Depresso Ice', price: 18000, description: 'Kopi susu dingin yang melegakan', image: imageMenu['WC_DepressoIce'] },
      { id: 8, name: 'Hot Magic', price: 20000, description: 'Racikan kopi susu spesial, tersaji hangat', image: imageMenu['WC_HotMagic'] },
      { id: 9, name: 'Moccacino Ice', price: 20000, description: 'Perpaduan espresso & cokelat', image: imageMenu['WC_MoccacinoIce'] },
    ],
  },

  {
    id: 'manual-brew',
    name: 'Manual Brew',
    emoji: '🫗',
    items: [
      { id: 21, name: 'Kopi Tubruk', price: 13000, description: 'Kopi tubruk tradisional, kental & otentik', image: imageMenu['Manual_KopiTubruk'] },
      { id: 22, name: 'V60', price: 16000, description: 'Pour over V60, bright & clean flavor', image: imageMenu['Manual_V60'] },
      { id: 23, name: 'Vietnam Drip', price: 15000, description: 'Drip kopi Vietnam klasik, pekat & harum', image: imageMenu['Manual_VietnamDrip'] },
      { id: 29, name: 'Japanese', price: 18000, description: 'Minuman ala Jepang yang menyegarkan', image: imageMenu['Manual_Japanese'] },
      ],
  },
  {
    id: 'non-coffee',
    name: 'Non Coffee',
    emoji: '🥤',
    items: [
      { id: 24, name: 'Chocolate', price: 18000, description: 'Minuman cokelat creamy & lezat', image: imageMenu['NC_Chocolate'] },
      { id: 26, name: 'Freshmilk Original', price: 16000, description: 'Susu segar original, murni & menyehatkan', image: imageMenu['NC_FreshmilkOriginal'] },
      { id: 27, name: 'Ice Oreo', price: 18000, description: 'Minuman susu dengan crumble oreo & es', image: imageMenu['NC_IceOreo'] },
      { id: 28, name: 'Lychee Tea', price: 12000, description: 'Minuman segar rahasia barista kami', image: imageMenu['NC_Intel'] },
      { id: 31, name: 'Lemon Tea', price: 15000, description: 'Teh lemon segar & ringan', image: imageMenu['NC_LemonTea'] },
      { id: 32, name: 'Matcha', price: 18000, description: 'Matcha Jepang premium, earthy & creamy', image: imageMenu['NC_Matcha'] },
      { id: 34, name: 'Red Velvet', price: 18000, description: 'Minuman red velvet creamy & cantik', image: imageMenu['NC_RedVelvet'] },
      { id: 25, name: 'Extra Joss Huhu', price: 10000, description: 'Minuman energi seger buat yang butuh boost', image: imageMenu['NC_ExtraJossHuhu'] },
      { id: 33, name: 'Mineral Water', price: 5000, description: 'Air mineral segar', image: imageMenu['NC_MineralWater'] },
    ],
  },
  {
    id: 'food',
    name: 'Makanan',
    emoji: '🍽️',
    items: [
      { id: 41, name: 'Cireng', price: 10000, description: 'Cireng renyah, cocok teman kopi' },
      { id: 42, name: 'Otak Otak', price: 10000, description: 'Otak-otak gurih & kenyal, cemilan favorit' },
      { id: 35, name: 'Kentang', price: 15000, description: 'Kentang goreng renyah, cocok teman kopi' },
      { id: 40, name: 'Tempe Goreng', price: 10000, description: 'Tempe goreng crispy, sederhana & nikmat' },
      { id: 43, name: 'Pisang Crispy', price: 14000, description: 'Pisang crispy, manis, cocok teman kopi' },
      { id: 38, name: 'Mix Plate', price: 15000, description: 'sepiring campur pilihan lauk terbaik kami' },
      { id: 36, name: 'Mie Bangladesh (+Add)', price: 17000, description: 'Mie pedas ala Bangladesh, bisa tambah topping' },
      { id: 37, name: 'Mie Tek-Tek (+Add)', price: 17000, description: 'Mie nyemek kuah minimal, bisa tambah topping' },
      { id: 39, name: 'Mie Intel (Kuah/Goreng)', price: 10000, description: 'Mie Intel kuah atau goreng, pilihan terbaik' },
      
    ],
  },
];

export const formatRupiah = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};
