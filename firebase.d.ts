declare module 'firebase/app' {
  export function initializeApp(config: any): any;
  export function getApps(): any[];
}

declare module 'firebase/auth' {
  export function getAuth(app: any): any;
  export class GoogleAuthProvider {
    constructor();
  }
  export function signInWithPopup(auth: any, provider: any): any;
  export function signOut(auth: any): any;
  export function onAuthStateChanged(auth: any, callback: (user: any) => void): () => void;
  export type User = any;
}