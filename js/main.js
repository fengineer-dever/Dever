// ============================================
// Dever — Main Page
// ============================================

const MainPage = {
  interviews: [],

  async init() {
    await this.loadInterviews();
    this.renderHero();
    this.renderCards();
    ScrollAnimator.init();
  },

  async loadInterviews() {
    try {
      const res = await fetch('data/interviews.json');
      this.interviews = sortByNewest(await res.json());
    } catch (err) {
      console.error('인터뷰 데이터 로드 실패:', err);
      this.interviews = [];
    }
  },

  renderHero() {
    const hero = document.getElementById('hero');
    if (!hero) return;

    const count = this.interviews.length;
    const latest = this.interviews[0];

    const featured = latest ? `
      <a href="interview.html?id=${latest.id}" class="hero__featured">
        <span class="hero__featured-eyebrow">LATEST INTERVIEW</span>
        <div class="hero__featured-body">
          <div class="hex hero__featured-portrait">
            <div class="hex__inner">${latest.profileImage
              ? `<img src="${latest.profileImage}" alt="${latest.name}">`
              : getInitials(latest.name)}</div>
          </div>
          <div class="hero__featured-info">
            <span class="hero__featured-name">${latest.name}</span>
            <span class="hero__featured-role">${latest.role}${latest.company ? ` · ${latest.company}` : ''}</span>
            <span class="hero__featured-tagline">${latest.tagline}</span>
          </div>
        </div>
        <span class="hero__featured-cta">인터뷰 읽기 →</span>
      </a>` : `
      <div class="hero__featured hero__featured--empty">
        <span class="hero__featured-eyebrow">PREPARING</span>
        <p class="hero__featured-tagline">첫 번째 인터뷰를 준비하고 있습니다.</p>
        <a href="about.html" class="hero__featured-cta">인터뷰 제안하기 →</a>
      </div>`;

    hero.innerHTML = `
      <div class="hero__inner container">
        <div class="hero__masthead">
          <div class="hero__kicker">DAEJEON LOCAL DEVELOPER ARCHIVE</div>
          <h1 class="hero__title">Dever <span class="hero__title-ko">데버</span></h1>
          <p class="hero__description">
            대전에서 활동하는 개발자와 크리에이터의 작업 방식과 일상을 기록합니다.
          </p>
          <div class="hero__meta">
            <span>기록 ${count}건</span>
            <span>최근 업데이트 ${latest ? formatDate(latest.publishedAt) : '준비 중'}</span>
          </div>
        </div>
        ${featured}
      </div>
    `;
  },

  renderCards() {
    const list = document.getElementById('listView');
    if (!list) return;

    const filtered = this.interviews;

    if (filtered.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <p class="empty-state__text">아직 등록된 인터뷰가 없습니다.</p>
        </div>
      `;
      return;
    }

    // 인덱스 번호는 발행 순서(오래된 것이 01) — 목록 표시는 최신순
    const total = filtered.length;

    list.innerHTML = `
      <div class="list-head">
        <span class="list-head__label">INDEX</span>
        <span class="list-head__count">전체 ${filtered.length}건</span>
      </div>
    ` + filtered.map((interview, i) => `
      <a href="interview.html?id=${interview.id}" class="list-item animate-in" data-animate style="animation-delay: ${i * 0.04}s">
        <div class="list-item__meta">
          <span class="list-item__index">${String(total - i).padStart(2, '0')}</span>
          <span class="list-item__date">${formatDate(interview.publishedAt)}</span>
        </div>
        <div class="list-item__body">
          <span class="list-item__name">${interview.name}</span>
          <span class="list-item__role">${interview.role}${interview.company ? ` · ${interview.company}` : ''}</span>
          <span class="list-item__tagline">${interview.tagline}</span>
          <div class="list-item__tags">
            ${interview.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
        </div>
        <span class="list-item__arrow" aria-hidden="true">→</span>
      </a>
    `).join('');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  MainPage.init();
});
