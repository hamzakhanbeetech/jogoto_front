// This api will come in the next version

export const authConfig = {
  // Url of the Identity Provider
  issuer: 'https://www.linkedin.com/oauth/v2',

  // URL of the SPA to redirect the user to after login
  redirectUri: window.location.origin + '/basic/settings',

  // The SPA's id. The SPA is registerd with this id at the auth-server
  clientId: '77qi0snwzuq30i',
  clientSecret: 'YUpCNgD8W73dJtdb',

  scope: 'r_emailaddress,r_liteprofile,w_member_social'
};
