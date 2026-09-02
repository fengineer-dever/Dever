// ============================================
// Dever — Interview Detail Page
// ============================================

const InterviewPage = {
    data: null,
    interviews: [],

    async init() {
        const id = new URLSearchParams(window.location.search).get('id');
        if (!id) {
            this.showError('인터뷰 ID가 지정되지 않았습니다.');
            return;
        }

        await Promise.all([
            this.loadInterview(id),
            this.loadInterviews()
        ]);

        if (this.data) {
            this.renderHero();
            this.renderContent();
            this.renderGiscus();
            this.updateMeta();
            ScrollAnimator.init();
        }
    },

    async loadInterviews() {
        try {
            const res = await fetch('data/interviews.json');
            if (!res.ok) throw new Error('Not found');
            this.interviews = await res.json();
        } catch (err) {
            console.error('인터뷰 목록 로드 실패:', err);
            this.interviews = [];
        }
    },

    async loadInterview(id) {
        try {
            const res = await fetch(`data/interviews/${id}.json`);
            if (!res.ok) throw new Error('Not found');
            this.data = await res.json();
        } catch (err) {
            console.error('인터뷰 데이터 로드 실패:', err);
            this.showError('인터뷰를 찾을 수 없습니다.');
        }
    },

    showError(message) {
        const content = document.getElementById('interviewContent');
        if (content) {
            content.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">😢</div>
          <p class="empty-state__text">${message}</p>
          <a href="index.html" style="margin-top: 1rem; display: inline-block;">← 목록으로 돌아가기</a>
        </div>
      `;
        }
    },

    renderHero() {
        const hero = document.getElementById('interviewHero');
        if (!hero) return;

        const d = this.data;
        const qaCount = (d.sections || []).filter((section) => section.type === 'qa').length;
        const published = formatDate(d.publishedAt);

        hero.innerHTML = `
      <div class="interview-hero__inner container">
        <div class="hex interview-hero__portrait">
          <div class="hex__inner">${d.profileImage
                ? `<img src="${d.profileImage}" alt="${d.name}">`
                : getInitials(d.name)}</div>
        </div>
        <div class="interview-hero__info">
          <span class="interview-hero__eyebrow">INTERVIEW</span>
          <span class="interview-hero__role">${d.role}${d.company ? ' · ' + d.company : ''}</span>
          <h1 class="interview-hero__name">${d.name}</h1>
          <p class="interview-hero__tagline">${d.tagline}</p>
          <div class="interview-hero__meta">
            <span>발행 ${published}</span>
            <span>Q&A ${qaCount}개</span>
          </div>
          <div class="interview-hero__tags">
            ${d.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
        </div>
      </div>
    `;
    },

    renderContent() {
        const content = document.getElementById('interviewContent');
        if (!content) return;

        const d = this.data;
        let html = '';
        let qaIndex = 0;

        // Bio
        if (d.bio) {
            html += `<div class="interview-bio">${renderParagraphs(d.bio)}</div>`;
        }

        // Sections
        if (d.sections) {
            d.sections.forEach(section => {
                switch (section.type) {
                    case 'qa':
                        qaIndex += 1;
                        html += this.renderQA(section, qaIndex);
                        break;
                    case 'workspace':
                        html += this.renderWorkspace(section);
                        break;
                    case 'project':
                        html += this.renderProjects(section);
                        break;
                    case 'photos':
                        html += this.renderPhotos(section);
                        break;
                }
            });
        }

        html += this.renderRelated();

        // Share
        html += this.renderShare();

        // Comments (giscus)
        html += `
      <section class="comments-section">
        <h2 class="comments-section__title">응원과 댓글</h2>
        <p class="comments-section__hint">GitHub 계정으로 하트와 댓글을 남길 수 있어요.</p>
        <div id="giscusContainer"></div>
      </section>
    `;

        // Back link
        html += `
      <div style="text-align: center; padding: var(--space-5) 0;">
        <a href="index.html" class="back-link">← 목록으로 돌아가기</a>
      </div>
    `;

        content.innerHTML = html;
    },

    renderQA(section, index) {
        let imageHtml = '';
        if (section.image) {
            imageHtml = `
        <div class="qa-image">
          <img src="${section.image}" alt="${section.imageCaption || ''}" loading="lazy">
          ${section.imageCaption ? `<p class="qa-image__caption">${section.imageCaption}</p>` : ''}
        </div>
      `;
        }

        return `
      <div class="qa-section">
        <div class="qa-item" data-animate>
          <span class="qa-number">Q.${String(index).padStart(2, '0')}</span>
          <h3 class="qa-question">${section.question}</h3>
          <div class="qa-answer">${renderParagraphs(section.answer)}</div>
          ${imageHtml}
        </div>
      </div>
    `;
    },

    renderWorkspace(section) {
        const d = this.data;
        return `
      <div class="workspace-section" data-animate>
        <h2 class="workspace-section__title">${section.title || '워크스페이스'}</h2>
        ${d.workspaceImage ? `<img class="workspace-image" src="${d.workspaceImage}" alt="워크스페이스" loading="lazy">` : ''}
        <div class="workspace-grid">
          ${section.items.map(item => `
            <div class="workspace-item">
              <span class="workspace-item__category">${item.category}</span>
              <span class="workspace-item__name">${item.name}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    },

    renderProjects(section) {
        return `
      <div class="project-section" data-animate>
        <h2 class="project-section__title">${section.title || '프로젝트'}</h2>
        ${section.projects.map(p => `
          <div class="project-card">
            <h3 class="project-card__name">${p.name}</h3>
            <p class="project-card__description">${p.description}</p>
            ${p.url ? `<a href="${p.url}" class="project-card__link" target="_blank" rel="noopener">바로가기 →</a>` : ''}
          </div>
        `).join('')}
      </div>
    `;
    },

    renderRelated() {
        if (!this.interviews || this.interviews.length === 0) return '';

        const related = this.interviews
            .filter((item) => item.id !== this.data.id)
            .slice(0, 2);

        if (related.length === 0) {
            return `
        <section class="related-section" data-animate>
          <h2 class="related-section__title">다른 인터뷰</h2>
          <p class="related-section__empty">다른 인터뷰가 추가되면 여기에 함께 표시됩니다.</p>
        </section>
      `;
        }

        return `
      <section class="related-section" data-animate>
        <h2 class="related-section__title">다른 인터뷰</h2>
        <div class="related-grid">
          ${related.map((item) => `
            <a href="interview.html?id=${item.id}" class="related-card">
              <span class="related-card__date">${formatDate(item.publishedAt)}</span>
              <span class="related-card__name">${item.name}</span>
              <span class="related-card__tagline">${item.tagline}</span>
            </a>
          `).join('')}
        </div>
      </section>
    `;
    },

    renderPhotos(section) {
        if (!section.images || section.images.length === 0) return '';

        return `
      <div class="photo-gallery" data-animate>
        <h2 class="photo-gallery__title">${section.title || '포토'}</h2>
        <div class="photo-gallery__grid">
          ${section.images.map(img => `
            <div class="photo-gallery__item">
              <img src="${img.src}" alt="${img.caption || ''}" loading="lazy">
              ${img.caption ? `<div class="photo-gallery__caption">${img.caption}</div>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
    },

    renderGiscus() {
        const container = document.getElementById('giscusContainer');
        if (!container || !this.data) return;

        // innerHTML로 넣은 <script>는 실행되지 않으므로 직접 주입한다.
        const script = document.createElement('script');
        script.src = 'https://giscus.app/client.js';
        script.async = true;
        script.crossOrigin = 'anonymous';

        const attrs = {
            'data-repo': 'fengineer-dever/Dever',
            'data-repo-id': 'R_kgDOROaEjQ',
            'data-category': 'Announcements',
            'data-category-id': 'DIC_kwDOROaEjc4DEsFu',
            // interview.html?id=<id> 는 pathname이 모두 같으므로
            // 인터뷰별로 스레드가 분리되도록 id 기반 specific 매핑을 쓴다.
            'data-mapping': 'specific',
            'data-term': `interview:${this.data.id}`,
            'data-strict': '0',
            'data-reactions-enabled': '1',
            'data-emit-metadata': '0',
            'data-input-position': 'bottom',
            // 커스텀 테마(라이트 기반 + 리액션 버튼 확대). iframe 내부라
            // 페이지 CSS가 닿지 않으므로 테마 CSS URL로 스타일링한다.
            'data-theme': 'https://fengineer-dever.github.io/Dever/css/giscus-theme.css',
            'data-lang': 'ko'
        };
        Object.entries(attrs).forEach(([k, v]) => script.setAttribute(k, v));

        container.appendChild(script);
    },

    renderShare() {
        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent(`Dever 데버 — ${this.data.name}`);

        return `
      <div class="share-section">
        <span class="share-section__label">공유하기</span>
        <button class="share-btn" onclick="window.open('https://twitter.com/intent/tweet?url=${url}&text=${title}', '_blank')" title="Twitter 공유">𝕏</button>
        <button class="share-btn" onclick="navigator.clipboard.writeText(window.location.href).then(() => alert('링크가 복사되었습니다!'))" title="링크 복사">🔗</button>
      </div>
    `;
    },

    updateMeta() {
        if (!this.data) return;
        const title = `${this.data.name} — Dever 데버`;
        const description = `${this.data.tagline} — 대전 로컬 개발자 인터뷰`;

        document.title = title;

        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.content = description;

        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.content = title;

        const ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc) ogDesc.content = description;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    InterviewPage.init();
});
