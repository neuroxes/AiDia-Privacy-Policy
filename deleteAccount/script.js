// ─────────────────────────────────────────────────────────────
// Firebase configuration
// How to find it:
//   1. Go to https://console.firebase.google.com
//   2. Open your project (ai-dia or similar)
//   3. Click the gear icon ⚙️ → "Project settings"
//   4. Scroll to "Your apps" → click your Web app (</>)
//   5. Copy the firebaseConfig object shown there
// ─────────────────────────────────────────────────────────────
const firebaseConfig = {
    apiKey:            "AIzaSyAM0Lr77YfJLo8smV1bdvDiU1wMKarm1Js",
    authDomain:        "ai-dia.firebaseapp.com",
    databaseURL:       "https://ai-dia-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId:         "ai-dia",
    storageBucket:     "ai-dia.firebasestorage.app",
    messagingSenderId: "662191616693",
    appId:             "1:662191616693:web:26efd79f1fa3e4df0ec4fc",
    measurementId:     "G-QT3ZBSMTYE"
};

firebase.initializeApp(firebaseConfig);
const auth     = firebase.auth();
const database = firebase.database();

// ── DOM refs ──────────────────────────────────
const authSection    = document.getElementById('authSection');
const deleteSection  = document.getElementById('deleteSection');
const successSection = document.getElementById('successSection');

const googleSignInBtn = document.getElementById('googleSignInBtn');
const loginForm       = document.getElementById('loginForm');
const signInBtn       = document.getElementById('signInBtn');
const signInSpinner   = document.getElementById('signInSpinner');
const authError       = document.getElementById('authError');

const userAvatar      = document.getElementById('userAvatar');
const userName        = document.getElementById('userName');
const userEmail       = document.getElementById('userEmail');
const confirmCheckbox = document.getElementById('confirmCheckbox');
const deleteBtn       = document.getElementById('deleteBtn');
const deleteSpinner   = document.getElementById('deleteSpinner');
const cancelBtn       = document.getElementById('cancelBtn');
const deleteError     = document.getElementById('deleteError');

let currentUser = null;

// ── Helpers ───────────────────────────────────
function showSection(section) {
    [authSection, deleteSection, successSection].forEach(s => s.classList.remove('active'));
    section.classList.add('active');
}
function showError(el, msg) { el.textContent = msg; el.classList.add('visible'); }
function clearError(el)     { el.textContent = ''; el.classList.remove('visible'); }
function setLoading(btn, spinner, on) { btn.disabled = on; spinner.classList.toggle('visible', on); }

function populateUserBadge(user) {
    const name     = user.displayName || '';
    const email    = user.email       || '';
    const photo    = user.photoURL    || '';
    const initial  = name ? name[0].toUpperCase() : email ? email[0].toUpperCase() : 'U';

    userName.textContent  = name  || 'Account User';
    userEmail.textContent = email || '';
    userAvatar.innerHTML  = photo
        ? `<img src="${photo}" alt="${initial}">`
        : initial;
}

function getAuthError(code) {
    const map = {
        'auth/invalid-email':           'Invalid email address.',
        'auth/user-disabled':           'This account has been disabled.',
        'auth/user-not-found':          'No account found with this email.',
        'auth/wrong-password':          'Incorrect password.',
        'auth/too-many-requests':       'Too many attempts. Please try again later.',
        'auth/network-request-failed':  'Network error. Check your connection.',
        'auth/invalid-credential':      'Invalid email or password.',
        'auth/popup-closed-by-user':    'Sign-in popup was closed. Please try again.',
        'auth/cancelled-popup-request': 'Only one sign-in popup at a time.',
        'auth/popup-blocked':           'Popup blocked. Please allow popups for this page.',
    };
    return map[code] || 'An error occurred. Please try again.';
}

// ── Google Sign-In ────────────────────────────
googleSignInBtn.addEventListener('click', async () => {
    clearError(authError);
    googleSignInBtn.disabled = true;
    googleSignInBtn.querySelector('span') && (googleSignInBtn.querySelector('span').textContent = 'Signing in…');

    try {
        const provider   = new firebase.auth.GoogleAuthProvider();
        const credential = await auth.signInWithPopup(provider);
        currentUser      = credential.user;
        populateUserBadge(currentUser);
        confirmCheckbox.checked = false;
        deleteBtn.disabled = true;
        showSection(deleteSection);
    } catch (err) {
        showError(authError, getAuthError(err.code));
    } finally {
        googleSignInBtn.disabled = false;
        // Restore button text
        googleSignInBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.2l6.8-6.8C35.8 2.3 30.2 0 24 0 14.7 0 6.7 5.4 2.8 13.3l7.9 6.1C12.6 13 17.9 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4 6.9-9.9 6.9-17z"/>
                <path fill="#FBBC05" d="M10.7 28.6A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.1.7-4.6l-7.9-6.1A23.9 23.9 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l8.1-6.2z"/>
                <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.5-5.8c-2 1.4-4.6 2.2-7.7 2.2-6.1 0-11.3-4.1-13.2-9.6l-8.1 6.2C6.7 42.6 14.7 48 24 48z"/>
            </svg>
            Continue with Google`;
    }
});

// ── Email/Password Sign-In ────────────────────
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearError(authError);
    setLoading(signInBtn, signInSpinner, true);
    try {
        const cred  = await auth.signInWithEmailAndPassword(
            document.getElementById('email').value.trim(),
            document.getElementById('password').value
        );
        currentUser = cred.user;
        populateUserBadge(currentUser);
        confirmCheckbox.checked = false;
        deleteBtn.disabled = true;
        showSection(deleteSection);
    } catch (err) {
        showError(authError, getAuthError(err.code));
    } finally {
        setLoading(signInBtn, signInSpinner, false);
    }
});

// ── Confirm checkbox ──────────────────────────
confirmCheckbox.addEventListener('change', () => {
    deleteBtn.disabled = !confirmCheckbox.checked;
});

// ── Cancel ────────────────────────────────────
cancelBtn.addEventListener('click', () => {
    auth.signOut();
    currentUser = null;
    loginForm.reset();
    confirmCheckbox.checked = false;
    deleteBtn.disabled = true;
    clearError(deleteError);
    showSection(authSection);
});

// ── Delete account ────────────────────────────
deleteBtn.addEventListener('click', async () => {
    if (!confirmCheckbox.checked || !currentUser) return;
    clearError(deleteError);
    setLoading(deleteBtn, deleteSpinner, true);
    try {
        await deleteUserData(currentUser.uid);
        await currentUser.delete();
        showSection(successSection);
    } catch (err) {
        if (err.code === 'auth/requires-recent-login') {
            showError(deleteError,
                'For security, please sign out and sign back in before deleting your account.');
        } else {
            showError(deleteError, 'Could not delete account: ' + err.message);
        }
    } finally {
        setLoading(deleteBtn, deleteSpinner, false);
    }
});

// ─────────────────────────────────────────────────────────────
// deleteUserData(uid)
//
// Deletes every database node that belongs to the user,
// based on the actual DB rules structure in database rules.json.
//
// NODES DELETED (user has write/delete permission per rules):
//   ✅ users/{uid}                      — profile, meals, referral data
//   ✅ subscription_renewals/{uid}       — renewal history
//   ✅ subscription_cancellations/{uid}  — cancellation history
//   ✅ referral_pending/{uid}            — pending referral rewards (as referrer)
//
// NODES NOT DELETED (no client-side delete permission in rules):
//   ⚠️  devices/{deviceId}              — keyed by device ID, not uid;
//                                         no uid→deviceId reverse-lookup in DB
//   ⚠️  referral_codes/{code}           — write rule blocks deletion (only allows create)
//   ⚠️  referral_redemptions/{uid}      — write rule blocks deletion (only allows create)
//   ⚠️  purchase_tokens/{purchaseId}    — keyed by purchaseId, no reverse-lookup by uid
//   ⚠️  feature_request_upvotes        — scattered across request IDs, not practical to scan
//
// The ⚠️ nodes should be cleaned up by a backend Cloud Function
// triggered on user.delete (Firebase Auth trigger) for full GDPR compliance.
// ─────────────────────────────────────────────────────────────
async function deleteUserData(uid) {
    await Promise.all([
        // Main user profile + meals + referral credits + FCM tokens
        database.ref(`users/${uid}`).remove(),

        // Subscription history nodes (rules explicitly allow user to delete own)
        database.ref(`subscription_renewals/${uid}`).remove(),
        database.ref(`subscription_cancellations/${uid}`).remove(),

        // Referral pending rewards queued for this user (as referrer)
        database.ref(`referral_pending/${uid}`).remove(),
    ]);
}
