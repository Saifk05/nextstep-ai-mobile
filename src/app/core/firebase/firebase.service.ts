import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
} from 'firebase/auth';

import { firebaseApp } from './firebase.config';
import { SocialLogin } from '@capgo/capacitor-social-login';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  private readonly auth = getAuth(firebaseApp);
  private googleInitialized = false;

  async initializeGoogleLogin(): Promise<void> {
    if (!Capacitor.isNativePlatform() || this.googleInitialized) {
      return;
    }

    await SocialLogin.initialize({
      google: {
        webClientId:
          '93550905418-kat5mag54h6dfuuinggcgivie23np5jc.apps.googleusercontent.com',
      },
    });

    this.googleInitialized = true;

    console.log('Native Google login initialized');
  }

  async googleLogin(): Promise<string> {
    if (Capacitor.isNativePlatform()) {
      await this.initializeGoogleLogin();
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

    return result.user.getIdToken();
  }

  private async googleLoginAndroid(): Promise<string> {
    try {
      const result: any = await SocialLogin.login({
        provider: 'google',
        options: {
          scopes: ['email', 'profile'],
        },
      });

      console.log('Google native login result:', result);

      const googleIdToken =
        result?.result?.idToken ??
        result?.result?.authentication?.idToken ??
        result?.idToken;

      if (!googleIdToken) {
        throw new Error('Google ID token not found in native login result');
      }

      const credential =
        GoogleAuthProvider.credential(googleIdToken);

      const firebaseResult = await signInWithCredential(
        this.auth,
        credential
      );

      return firebaseResult.user.getIdToken();
    } catch (error) {
      console.error('Native Google login failed:', error);
      throw error;
    }
  }

  async facebookLogin(): Promise<string> {
    throw new Error('Facebook login not configured yet');
  }
}