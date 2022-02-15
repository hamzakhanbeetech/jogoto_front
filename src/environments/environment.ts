// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  BASE_URL: "https://ec2-34-251-189-63.eu-west-1.compute.amazonaws.com:3000/",
  socketIoUrl: "https://dev.jogoto.com:3008/",
  oauth2: {
    google: {
      client_id:
        "705773148611-j3af4m0rgamktotrvn7u1p9uh5mn60st.apps.googleusercontent.com",
      cookiepolicy: "single_host_origin",
      scope: "openid profile email",
    },
  },
  firbaseConfig: {
    apiKey: "AIzaSyBPDOvCqSACTpnjssl8utaBcPZFefDf6OQ",
    authDomain: "jogoto.firebaseapp.com",
    databaseURL: "https://jogoto.firebaseio.com",
    projectId: "jogoto",
    storageBucket: "jogoto.appspot.com",
    messagingSenderId: "705773148611",
    appId: "1:705773148611:web:af74766675be915caec576",
    measurementId: "G-Y2R2T4N5L4",
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have biysk negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
