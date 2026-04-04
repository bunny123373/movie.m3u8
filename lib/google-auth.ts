const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '619031945525-88no8kr8i5t6goe9l5e6v363oufltcqn.apps.googleusercontent.com';
const REDIRECT_URI = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

interface GoogleUser {
  id: string;
  name: string;
  picture: string;
  email: string;
}

function loadGoogleScript(): Promise<void> {
  return new Promise((resolve) => {
    if (window.google?.accounts?.oauth2) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = () => resolve();
    script.onerror = () => resolve();
    document.body.appendChild(script);
  });
}

export async function signInWithGoogle(): Promise<GoogleUser | null> {
  try {
    await loadGoogleScript();
    
    return new Promise((resolve) => {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'openid email profile',
        callback: async (response: any) => {
          if (response.error) {
            resolve(null);
            return;
          }
          
          const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
              Authorization: `Bearer ${response.access_token}`,
            },
          });
          
          const userInfo = await userInfoResponse.json();
          resolve({
            id: userInfo.id,
            name: userInfo.name,
            picture: userInfo.picture,
            email: userInfo.email,
          });
        },
      });
      
      client.requestAccessToken();
    });
  } catch (error) {
    console.error('Error signing in with Google:', error);
    return null;
  }
}

export function signOut(): void {
  const token = localStorage.getItem('google_token');
  if (token) {
    localStorage.removeItem('google_token');
    window.google?.accounts?.id?.disableAutoSelect();
  }
}

declare global {
  interface Window {
    google: any;
  }
}