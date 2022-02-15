export const environment = {
  production: true,
  BASE_URL: 'https://jogoto.com:3000/',
  socketIoUrl: 'https://jogoto.com:3008/',
  oauth2: {
    google: {
      client_id: '705773148611-j3af4m0rgamktotrvn7u1p9uh5mn60st.apps.googleusercontent.com',
      cookiepolicy: 'single_host_origin',
      scope: 'profile email'
    }
  },
    firbaseConfig:{
        apiKey: "AIzaSyBPDOvCqSACTpnjssl8utaBcPZFefDf6OQ",
        authDomain: "jogoto.firebaseapp.com",
        databaseURL: "https://jogoto.firebaseio.com",
        projectId: "jogoto",
        storageBucket: "jogoto.appspot.com",
        messagingSenderId: "705773148611",
        appId: "1:705773148611:web:af74766675be915caec576",
        measurementId: "G-Y2R2T4N5L4"
    }
};
