const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../data/lesson_components');

// Function to wrap array in object
function wrapFile(filename) {
  const filepath = path.join(dir, filename);
  if (!fs.existsSync(filepath)) return;
  const content = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  if (Array.isArray(content)) {
    fs.writeFileSync(filepath, JSON.stringify({ lessonFlow: content }, null, 2));
    console.log(`Wrapped ${filename}`);
  }
}

// Wrap individual files
wrapFile('chuong1_bai7.json');
wrapFile('chuong1_bai8.json');
wrapFile('chuong2_khung_hoang_vat_ly.json');

// Combine Bai 3, 4, 5, 6
const b3 = JSON.parse(fs.readFileSync(path.join(dir, 'chuong1_bai3.json'), 'utf8'));
const b4 = JSON.parse(fs.readFileSync(path.join(dir, 'chuong1_bai4.json'), 'utf8'));
const b5 = JSON.parse(fs.readFileSync(path.join(dir, 'chuong1_bai5.json'), 'utf8'));
const b6 = JSON.parse(fs.readFileSync(path.join(dir, 'chuong1_bai6.json'), 'utf8'));

// If they are wrapped already, take .lessonFlow
const getArray = (data) => Array.isArray(data) ? data : (data.lessonFlow || []);

const combined = [
  ...getArray(b3),
  ...getArray(b4),
  ...getArray(b5),
  ...getArray(b6)
];

fs.writeFileSync(path.join(dir, 'chuong1_su_ra_doi_va_phat_trien.json'), JSON.stringify({ lessonFlow: combined }, null, 2));
console.log('Combined Bai 3,4,5,6 into chuong1_su_ra_doi_va_phat_trien.json');

// Modify manifest.json
const manifestPath = path.join(dir, 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

manifest.lessons.push({
  key: "1.2",
  title: "Sự ra đời và phát triển",
  file: "chuong1_su_ra_doi_va_phat_trien.json",
  status: "converted"
});
manifest.lessons.push({
  key: "1.3",
  title: "Đối tượng và chức năng",
  file: "chuong1_bai7.json",
  status: "converted"
});
manifest.lessons.push({
  key: "1.4",
  title: "Vai trò trong đời sống xã hội",
  file: "chuong1_bai8.json",
  status: "converted"
});
manifest.lessons.push({
  key: "2.1",
  title: "Phạm trù vật chất",
  file: "chuong2_khung_hoang_vat_ly.json",
  status: "converted"
});

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log('Updated manifest.json');
