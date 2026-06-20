import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';

import { firebaseApp } from './firebase.config';
import { SocialLogin } from '@capgo/capacitor-social-login';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  private auth = getAuth(firebaseApp);

  async initializeGoogleLogin(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      await SocialLogin.initialize({
        google: {
          webClientId: '93550905418-kat5mag54h6dfuuinggcgivie23np5jc.apps.googleusercontent.com',
        },
      });
    }
  }

  async googleLogin(): Promise<string> {
    if (Capacitor.isNativePlatform()) {
      return this.googleLoginAndroid();
    }

    return this.googleLoginWeb();
  }

  private async googleLoginWeb(): Promise<string> {
    const provider = new GoogleAuthProvider();

    provider.setCustomParameters({
      prompt: 'select_account',
    });

    const result = await signInWithPopup(this.auth, provider);

    return await result.user.getIdToken();
  }

  private async googleLoginAndroid(): Promise<string> {
    const result: any = await SocialLogin.login({
      provider: 'google',
      options: {},
    });

    const idToken =
      result?.result?.idToken ||
      result?.result?.authentication?.idToken ||
      result?.idToken;

    if (!idToken) {
      console.error('Google native login result:', result);
      throw new Error('Google ID token not found');
    }

    return idToken;
  }

  async facebookLogin(): Promise<string> {
    throw new Error('Facebook login not configured yet');
  }
}