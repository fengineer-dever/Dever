// ============================================
// Dever — Common Utilities
// ============================================

// Navigation
const Nav = {
  init() {
    this.render();
    this.bindEvents();
  },

  render() {
    const nav = document.querySelector('.nav');
    if (!nav) return;

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    nav.innerHTML = `
      <div class="nav__inner">
        <a href="index.html" class="nav__logo">
          <img src="images/BEE_logo.svg" alt="" class="nav__logo-icon">
          <span>Dever 데버</span>
        </a>
        <ul class="nav__links" id="navLinks">
          <li><a href="index.html" class="nav__link ${currentPage === 'index.html' || currentPage === '' ? 'nav__link--active' : ''}">인터뷰</a></li>
          <li><a href="about.html" class="nav__link ${currentPage === 'about.html' ? 'nav__link--active' : ''}">소개</a></li>
        </ul>
        <button class="nav__hamburger" id="navHamburger" aria-label="메뉴 열기">☰</button>
      </div>
    `;
  },

  bindEvents() {
    const hamburger = document.getElementById('navHamburger');
    const links = document.getElementById('navLinks');

    if (hamburger && links) {
      hamburger.addEventListener('click', () => {
        links.classList.toggle('nav__links--open');
        hamburger.textContent = links.classList.contains('nav__links--open') ? '✕' : '☰';
      });

      links.querySelectorAll('.nav__link').forEach(link => {
        link.addEventListener('click', () => {
          links.classList.remove('nav__links--open');
          hamburger.textContent = '☰';
        });
      });
    }
  }
};

// Footer
const Footer = {
  render() {
    const footer = document.querySelector('.footer');
    if (!footer) return;

    footer.innerHTML = `
      <div class="footer__inner">
        <span class="footer__text">© 2026 Dever — 대전 로컬 개발자를 소개합니다</span>
        <div class="footer__links">
          <a href="https://github.com/fengineer-dever/Dever" class="footer__link" target="_blank" rel="noopener">GitHub</a>
          <a href="about.html" class="footer__link">소개</a>
        </div>
      </div>
      <div class="footer__signature">
        <div class="footer__bee" aria-label="fengineer">
          <img src="images/BEE_logo.svg?v=1" class="footer__bee-image" alt="">
          <span class="footer__bee-text">Fengineer</span>
        </div>
      </div>
    `;
  }
};

// Utility: Animate elements on scroll
const ScrollAnimator = {
  init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('[data-animate]').forEach(el => {
      observer.observe(el);
    });
  }
};

// Utility: Format date
function formatDate(dateStr) {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

// Utility: Get initials
function getInitials(name) {
  return name.charAt(0);
}

// Utility: Convert plain text with newlines to paragraphs
// (빈 줄 = 문단 구분, 단일 줄바꿈 = <br>)
function renderParagraphs(text) {
  if (!text) return '';
  return text
    .split(/\n\s*\n/)
    .map(p => `<p>${p.trim().replace(/\n/g, '<br>')}</p>`)
    .join('');
}

// Utility: Build interview request mailto on about page
function setupInterviewRequestMailto() {
  const link = document.getElementById('interviewRequestLink');
  if (!link) return;

  const to = 'fengineers042@gmail.com';
  const subject = '[인터뷰 신청]';
  const body = `==안내 사항==
- 가능한 한 모든 분을 소개해드리고 싶지만, 운영 여건상 모든 신청을 인터뷰로 진행하기 어려운 점 너그럽게 양해 부탁드립니다.
- 선정된 경우에만 개별 회신드립니다.
- 아래 문구를 그대로 작성해주셔야 접수가 완료됩니다.
  "안내 사항을 안내받았고 동의합니다"

*표시 항목은 필수 입력 사항입니다.
- 동의 문구 작성*: 

- 신청자 성함(닉네임)*: 
- 신청자 연락처*: (전화/메일/sns계정 등) 
- 직군: (개발자/웹디자이너/학생/취준생 등)
- 현재 신청자 거주지가 대전이십니까?*: (예/아니오)
- 현재 거주지가 아니신 경우 대전에서 근무/거주 경험이 있으십니까?: (예/아니오)
- 신청 사연*: (신청하시는 이유, 소개하시고 싶은 내용 등 작성)`;

  link.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

// Init on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  Nav.init();
  Footer.render();
  setupInterviewRequestMailto();
});
