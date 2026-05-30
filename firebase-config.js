// =====================================================
// Firebase Compat SDK — works without ES modules
// No need to import/export — loaded as regular script
// =====================================================

const firebaseConfig = {
  apiKey:            "AIzaSyBzilZdIyYRGPa8tnED9-vE9z6Y7j30pWw",
  authDomain:        "mr-upvc-website-d22fb.firebaseapp.com",
  projectId:         "mr-upvc-website-d22fb",
  storageBucket:     "mr-upvc-website-d22fb.firebasestorage.app",
  messagingSenderId: "174040865975",
  appId:             "1:174040865975:web:84f8281a60117071460132"
};

// Initialize Firebase (guard against duplicate init)
if (!firebase.apps || !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// ── Load & stream reviews ──────────────────────────────
function initReviews() {
  const container = document.getElementById('liveReviews');
  const emptyMsg  = document.getElementById('reviewsEmpty');
  if (!container) return;

  db.collection('reviews')
    .orderBy('createdAt', 'desc')
    .onSnapshot(snapshot => {
      container.innerHTML = '';
      if (snapshot.empty) {
        if (emptyMsg) emptyMsg.style.display = 'block';
        return;
      }
      if (emptyMsg) emptyMsg.style.display = 'none';

      snapshot.forEach(doc => {
        const r       = doc.data();
        const stars   = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
        const initial = (r.name || 'A')[0].toUpperCase();
        const date    = r.createdAt?.toDate
          ? r.createdAt.toDate().toLocaleDateString('en-IN',
              { day: 'numeric', month: 'short', year: 'numeric' })
          : '';

        const card = document.createElement('div');
        card.className = 'review-mini review-live';
        card.innerHTML = `
          <div class="review-mini-top">
            <div class="testimonial-avatar">${escHtml(initial)}</div>
            <div>
              <strong>${escHtml(r.name)}</strong>
              <span class="review-stars-live">${stars}</span>
            </div>
            ${date ? `<span class="review-date">${date}</span>` : ''}
          </div>
          <p class="review-mini-text">"${escHtml(r.text)}"</p>`;
        container.appendChild(card);
      });
    }, err => {
      console.error('Firestore error:', err);
    });
}

// ── Submit a new review ────────────────────────────────
function submitReview(name, rating, text) {
  return db.collection('reviews').add({
    name:      name.trim().substring(0, 60),
    text:      text.trim().substring(0, 400),
    rating:    Number(rating),
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
}

function escHtml(str) {
  return String(str)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;');
}

// ── Wire up form when DOM is ready ────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initReviews();

  // Star rating
  let selectedRating = 0;
  const starBtns = document.querySelectorAll('.star-btn');
  function highlightStars(n) {
    starBtns.forEach(s => s.classList.toggle('active', +s.dataset.val <= n));
  }
  starBtns.forEach(s => {
    s.addEventListener('mouseenter', () => highlightStars(+s.dataset.val));
    s.addEventListener('mouseleave', () => highlightStars(selectedRating));
    s.addEventListener('click', () => {
      selectedRating = +s.dataset.val;
      highlightStars(selectedRating);
    });
  });

  // Char count
  const reviewTextEl = document.getElementById('reviewText');
  const charCountEl  = document.getElementById('reviewCharCount');
  reviewTextEl?.addEventListener('input', function () {
    if (charCountEl) charCountEl.textContent = this.value.length + '/400';
  });

  // Submit
  document.getElementById('reviewSubmitBtn')?.addEventListener('click', async () => {
    const name  = document.getElementById('reviewerName')?.value.trim();
    const text  = reviewTextEl?.value.trim();
    const msgEl = document.getElementById('reviewFormMsg');
    const btn   = document.getElementById('reviewSubmitBtn');

    if (!name)            { showMsg(msgEl, '⚠️ Please enter your name.', 'error'); return; }
    if (selectedRating < 1){ showMsg(msgEl, '⚠️ Please select a star rating.', 'error'); return; }
    if (!text)            { showMsg(msgEl, '⚠️ Please write your review.', 'error'); return; }

    btn.disabled    = true;
    btn.textContent = 'Submitting...';
    try {
      await submitReview(name, selectedRating, text);
      showMsg(msgEl, '✅ Your review is live!', 'success');
      document.getElementById('reviewerName').value = '';
      reviewTextEl.value = '';
      if (charCountEl) charCountEl.textContent = '0/400';
      selectedRating = 0;
      highlightStars(0);
    } catch (e) {
      showMsg(msgEl, '❌ Could not submit. Try again.', 'error');
      console.error(e);
    } finally {
      btn.disabled    = false;
      btn.textContent = 'Post Review';
    }
  });

  function showMsg(el, text, type) {
    if (!el) return;
    el.textContent = text;
    el.className   = 'review-form-msg ' + type;
    setTimeout(() => { el.textContent = ''; el.className = 'review-form-msg'; }, 4000);
  }
});
