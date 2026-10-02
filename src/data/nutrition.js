// Per 330 ml can. Placeholder values — replace with lab-verified figures before launch.
export const nutritionRows = [
  { key: 'serving', label: 'Serving Size' },
  { key: 'calories', label: 'Calories' },
  { key: 'sugar', label: 'Natural Sugar' },
  { key: 'potassium', label: 'Potassium' },
  { key: 'sodium', label: 'Sodium' },
  { key: 'magnesium', label: 'Magnesium' },
  { key: 'vitaminC', label: 'Vitamin C' },
  { key: 'hydration', label: 'Hydration Index' },
];

export const nutrition = {
  'natural-pure':     { serving: '330 ml', calories: '45 kcal', sugar: '9 g', potassium: '520 mg', sodium: '40 mg', magnesium: '25 mg', vitaminC: '100% DV', hydration: 9.8 },
  'golden-pineapple': { serving: '330 ml', calories: '50 kcal', sugar: '10 g', potassium: '480 mg', sodium: '38 mg', magnesium: '22 mg', vitaminC: '120% DV', hydration: 9.4 },
  'ruby-watermelon':  { serving: '330 ml', calories: '48 kcal', sugar: '10 g', potassium: '500 mg', sodium: '36 mg', magnesium: '24 mg', vitaminC: '110% DV', hydration: 9.7 },
  'tropical-guava':   { serving: '330 ml', calories: '47 kcal', sugar: '9 g', potassium: '490 mg', sodium: '37 mg', magnesium: '23 mg', vitaminC: '140% DV', hydration: 9.5 },
  'lush-lychee':      { serving: '330 ml', calories: '46 kcal', sugar: '9 g', potassium: '475 mg', sodium: '35 mg', magnesium: '21 mg', vitaminC: '115% DV', hydration: 9.5 },
  'alphonso-mango':   { serving: '330 ml', calories: '52 kcal', sugar: '11 g', potassium: '510 mg', sodium: '39 mg', magnesium: '24 mg', vitaminC: '125% DV', hydration: 9.3 },
};

export const stats = [
  { value: 500, unit: 'MG', label: 'Of Potassium' },
  { value: 100, unit: '%', label: 'Natural Hydration' },
  { value: 0, unit: 'GM', label: 'Of Sugar' },
  { value: 45, unit: 'KCL', label: 'Per 200Ml' },
];
