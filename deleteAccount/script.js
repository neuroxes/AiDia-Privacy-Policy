// Firebase configuration - REPLACE WITH YOUR ACTUAL CONFIG
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// DOM elements
const loginForm = document.getElementById('loginForm');
const authSection = document.getElementById('authSection');
const deleteSection = document.getElementById('deleteSection');
const successSection = document.getElementById('successSection');
const signInBtn = document.getElementById('signInBtn');
const deleteBtn = document.getElementById('deleteBtn');
const cancelBtn = document.getElementById('cancelBtn');
const confirmCheckbox = document.getElementById('confirmCheckbox');
const userEmailDisplay = document.getElementById('userEmail');
const errorMessage = document.getElementById('errorMessage');
const deleteError = document.getElementById('deleteError');

let currentUser = null;

// Sign in form submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    showLoading(signInBtn, true);
    hideError(errorMessage);
    
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        currentUser = userCredential.user;
        
        // Show delete section
        userEmailDisplay.textContent = currentUser.email;
        authSection.classList.add('hidden');
        deleteSection.classList.remove('hidden');
        
    } catch (error) {
        showError(errorMessage, getErrorMessage(error.code));
    } finally {
        showLoading(signInBtn, false);
    }
});

// Confirmation checkbox handler
confirmCheckbox.addEventListener('change', (e) => {
    deleteBtn.disabled = !e.target.checked;
});

// Cancel button
cancelBtn.addEventListener('click', () => {
    auth.signOut();
    deleteSection.classList.add('hidden');
    authSection.classList.remove('hidden');
    loginForm.reset();
    confirmCheckbox.checked = false;
    deleteBtn.disabled = true;
});

// Delete account button
deleteBtn.addEventListener('click', async () => {
    if (!confirmCheckbox.checked || !currentUser) return;
    
    // Double confirmation
    const confirmed = confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.');
    if (!confirmed) return;
    
    showLoading(deleteBtn, true);
    hideError(deleteError);
    
    try {
        const uid = currentUser.uid;
        
        // Delete user data from database
        await deleteUserData(uid);
        
        // Delete the user account
        await currentUser.delete();
        
        // Show success message
        deleteSection.classList.add('hidden');
        successSection.classList.remove('hidden');
        
    } catch (error) {
        if (error.code === 'auth/requires-recent-login') {
            showError(deleteError, 'For security reasons, please sign out and sign in again before deleting your account.');
        } else {
            showError(deleteError, 'Failed to delete account: ' + error.message);
        }
    } finally {
        showLoading(deleteBtn, false);
    }
});

// Delete user data from database
async function deleteUserData(uid) {
    const deletions = [];
    
    // Delete user data from /users/{uid}
    deletions.push(
        database.ref(`users/${uid}`).remove()
    );
    
    // Delete device credits if they exist
    // Note: The devices are keyed by device ID, not user ID
    // You may need to store a mapping of device IDs to user IDs
    // For now, we'll just delete the user node
    
    await Promise.all(deletions);
}

// Helper functions
function showLoading(button, isLoading) {
    const btnText = button.querySelector('.btn-text');
    const spinner = button.querySelector('.spinner');
    
    if (isLoading) {
        btnText.classList.add('hidden');
        spinner.classList.remove('hidden');
        button.disabled = true;
    } else {
        btnText.classList.remove('hidden');
        spinner.classList.add('hidden');
        button.disabled = false;
    }
}

function showError(element, message) {
    element.textContent = message;
    element.classList.remove('hidden');
}

function hideError(element) {
    element.classList.add('hidden');
}

function getErrorMessage(errorCode) {
    const errorMessages = {
        'auth/invalid-email': 'Invalid email address.',
        'auth/user-disabled': 'This account has been disabled.',
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password.',
        'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
        'auth/network-request-failed': 'Network error. Please check your connection.',
        'auth/invalid-credential': 'Invalid email or password.'
    };
    
    return errorMessages[errorCode] || 'An error occurred. Please try again.';
}