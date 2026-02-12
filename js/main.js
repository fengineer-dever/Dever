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
      this.interviews = await res.json();
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

    hero.innerHTML = `
      <div class="hero__inner container">
        <div class="hero__kicker">ISSUE ${String(count).padStart(2, '0')}</div>
        <h1 class="hero__title">Dever</h1>
        <p class="hero__description">
          대전에서 활동하는 개발자와 크리에이터의 작업 방식과 일상을 기록합니다.
        </p>
        <div class="hero__meta">
          <span>총 ${count}건</span>
          <span>최신 업데이트 ${latest ? formatDate(latest.publishedAt) : '-'}</span>
        </div>
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

    list.innerHTML = filtered.map((interview, i) => `
      <a href="interview.html?id=${interview.id}" class="list-item animate-in" data-animate style="animation-delay: ${i * 0.04}s">
        <div class="list-item__meta">
          <span class="list-item__index">${String(i + 1).padStart(2, '0')}</span>
          <span class="list-item__date">${formatDate(interview.publishedAt)}</span>
        </div>
        <div class="list-item__body">
          <span class="list-item__name">${interview.name}</span>
          <span class="list-item__role">${interview.role}${interview.company ? ` · ${interview.company}` : ''}</span>
          <span class="list-item__tagline">${interview.tagline}</span>
        </div>
        <div class="list-item__tags">
          ${interview.tags.slice(0, 2).map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
      </a>
    `).join('');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  MainPage.init();
});
