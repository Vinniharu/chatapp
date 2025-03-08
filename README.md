# Firebase Chat App

A real-time chat application built with Next.js and Firebase, featuring user authentication and online user tracking.

## Features

- User authentication (sign up, sign in, sign out)
- Real-time tracking of online users
- Modern UI with Tailwind CSS
- Responsive design for all screen sizes

## Prerequisites

- Node.js 18 or newer
- Firebase account and project

## Getting Started

1. Clone the repository
```bash
git clone <repository-url>
cd chatapp
```

2. Install dependencies
```bash
npm install
```

3. Set up Firebase

Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)

- Enable Authentication with Email/Password provider
- Set up Realtime Database
- Get your Firebase configuration from Project Settings

4. Configure Firebase

Update the Firebase configuration in `app/firebase/config.ts` with your own values:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com"
};
```

5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

This application can be easily deployed on Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/chatapp)

Remember to add your Firebase environment variables in your Vercel project settings.

## License

MIT
