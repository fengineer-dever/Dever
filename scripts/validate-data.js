#!/usr/bin/env node
// ============================================
// Dever — 데이터 검증 스크립트
// 사용법: node scripts/validate-data.js
// 목록(data/interviews.json)과 상세(data/interviews/<id>.json)의
// 정합성을 검사하고, 어긋나면 종료 코드 1로 실패합니다.
// ============================================

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const INDEX_PATH = path.join(ROOT, 'data', 'interviews.json');
const DETAIL_DIR = path.join(ROOT, 'data', 'interviews');

const SHARED_FIELDS = ['name', 'role', 'company', 'profileImage', 'tagline', 'publishedAt'];
const REQUIRED_INDEX_FIELDS = ['id', 'name', 'role', 'tagline', 'tags', 'publishedAt'];
const SECTION_TYPES = ['qa', 'workspace', 'project', 'photos'];

const errors = [];
const warnings = [];

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

let index;
try {
  index = readJson(INDEX_PATH);
} catch (err) {
  console.error(`✗ ${path.relative(ROOT, INDEX_PATH)} 파싱 실패: ${err.message}`);
  process.exit(1);
}

if (!Array.isArray(index)) {
  console.error('✗ data/interviews.json 은 배열이어야 합니다.');
  process.exit(1);
}

const seenIds = new Set();

index.forEach((entry, i) => {
  const label = `interviews.json[${i}]${entry.id ? ` (${entry.id})` : ''}`;

  REQUIRED_INDEX_FIELDS.forEach((field) => {
    if (entry[field] === undefined || entry[field] === '') {
      errors.push(`${label}: 필수 필드 "${field}" 가 비어 있습니다.`);
    }
  });

  if (entry.id) {
    if (!/^[a-z0-9-]+$/.test(entry.id)) {
      errors.push(`${label}: id는 소문자/숫자/하이픈만 사용해야 합니다. (URL로 쓰입니다)`);
    }
    if (seenIds.has(entry.id)) {
      errors.push(`${label}: id가 중복되었습니다.`);
    }
    seenIds.add(entry.id);
    if (entry.id.includes('placeholder')) {
      warnings.push(`${label}: placeholder 항목이 공개 목록에 들어 있습니다.`);
    }
  }

  if (entry.publishedAt && !/^\d{4}-\d{2}-\d{2}$/.test(entry.publishedAt)) {
    errors.push(`${label}: publishedAt은 YYYY-MM-DD 형식이어야 합니다.`);
  }

  if (entry.tags && !Array.isArray(entry.tags)) {
    errors.push(`${label}: tags는 배열이어야 합니다.`);
  }

  if (!entry.id) return;

  const detailPath = path.join(DETAIL_DIR, `${entry.id}.json`);
  if (!fs.existsSync(detailPath)) {
    errors.push(`${label}: 상세 파일 data/interviews/${entry.id}.json 이 없습니다.`);
    return;
  }

  let detail;
  try {
    detail = readJson(detailPath);
  } catch (err) {
    errors.push(`data/interviews/${entry.id}.json 파싱 실패: ${err.message}`);
    return;
  }

  SHARED_FIELDS.forEach((field) => {
    const a = entry[field] ?? '';
    const b = detail[field] ?? '';
    if (a !== b) {
      errors.push(`${entry.id}: "${field}" 가 목록(${JSON.stringify(a)})과 상세(${JSON.stringify(b)})에서 다릅니다.`);
    }
  });

  if (JSON.stringify(entry.tags ?? []) !== JSON.stringify(detail.tags ?? [])) {
    errors.push(`${entry.id}: tags가 목록과 상세에서 다릅니다.`);
  }

  (detail.sections ?? []).forEach((section, si) => {
    const sLabel = `${entry.id} sections[${si}]`;
    if (!SECTION_TYPES.includes(section.type)) {
      errors.push(`${sLabel}: 알 수 없는 type "${section.type}" (허용: ${SECTION_TYPES.join(', ')})`);
      return;
    }
    if (section.type === 'qa' && (!section.question || !section.answer)) {
      errors.push(`${sLabel}: qa 섹션에는 question과 answer가 필요합니다.`);
    }
    if (section.type === 'workspace' && !Array.isArray(section.items)) {
      errors.push(`${sLabel}: workspace 섹션에는 items 배열이 필요합니다.`);
    }
    if (section.type === 'project' && !Array.isArray(section.projects)) {
      errors.push(`${sLabel}: project 섹션에는 projects 배열이 필요합니다.`);
    }
    if (section.type === 'photos' && !Array.isArray(section.images)) {
      errors.push(`${sLabel}: photos 섹션에는 images 배열이 필요합니다.`);
    }
  });
});

// 목록에 없는 고아 상세 파일 검사
if (fs.existsSync(DETAIL_DIR)) {
  fs.readdirSync(DETAIL_DIR)
    .filter((f) => f.endsWith('.json'))
    .forEach((f) => {
      const id = f.replace(/\.json$/, '');
      if (!seenIds.has(id)) {
        warnings.push(`data/interviews/${f}: 목록(interviews.json)에 없는 파일입니다. 공개 목록에는 표시되지 않습니다.`);
      }
    });
}

warnings.forEach((w) => console.warn(`⚠ ${w}`));
errors.forEach((e) => console.error(`✗ ${e}`));

if (errors.length > 0) {
  console.error(`\n검증 실패: 오류 ${errors.length}건, 경고 ${warnings.length}건`);
  process.exit(1);
}
console.log(`검증 통과: 인터뷰 ${index.length}건, 경고 ${warnings.length}건`);
