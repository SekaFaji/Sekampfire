# Android-first / iOS-later plan

The project is **not yet an Android or iOS app**. The present migration makes the web source packageable later without a gameplay rewrite.

## What is already mobile-friendly
- Vite bundles React and all CSS/JS into `dist/` rather than relying on runtime CDN access.
- Vite `base: './'` produces relative asset URLs that work under GitHub Pages' `/Sekampfire/` path and future local mobile web assets.
- 320×180 Canvas remains logical rendering resolution; wrapper handles display scaling (more responsive fullscreen work remains in backlog).
- Existing save/checkpoint logic is shared; versioned native storage and lifecycle testing are **not implemented yet**.

## Android — when release work is authorized
1. Decide final package ID, game version, signing owner and release policy.
2. Install Capacitor core/CLI and `@capacitor/android` using verified current compatible versions and generate `capacitor.config.ts` with `webDir: 'dist'`.
3. `npm run build && npx cap sync android` and open the native Android project in Android Studio.
4. Configure proper landscape orientation, fullscreen/edge-to-edge/insets, app icons, splash, touch/audio focus, back navigation, lifecycle pause/resume, and safe storage strategy.
5. Test offline first launches, process death, app updates and run checkpoint integrity on real Android devices; establish signed AAB releases and satisfy Play target SDK, Data safety and testing requirements at submission time.

## iOS — later
1. Use the same web build with `@capacitor/ios` on a Mac/Xcode environment and a separate iOS application ID.
2. Configure orientation, status bar/safe areas, audio session, background/resume, WKWebView storage and signing/certificates.
3. Test actual devices and Apple review requirements before any store submission.

## Don't do prematurely
Do not add Android or iOS generated projects to the repository until the user requests a native-build milestone. Do not add plugins, ads, analytics, cloud saves or permissions by default. Do not promise that an untested WebView will pass store review.
