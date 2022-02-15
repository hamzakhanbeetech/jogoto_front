export interface IndividualRegistrationDatasForSending {
  name: string;
  surname: string;
  dob: string;
  email: string;
  password: string;
  gender: string;
  user_register_type: string;
  location?: RegistrationLocationModel;
  lang?:string;
  address?: RegistrationAddressModel
}

export interface ProfessionalRegistrationDatasForSending {
  name: string;
  type: string;
  category: string;
  email: string;
  password: string;
  user_register_type: string;
  location: RegistrationLocationModel;
  lang?:string;
  address: RegistrationAddressModel
}

export interface RegistrationLocationModel {
  lat: number | string;
  lon: number | string
}

interface RegistrationAddressModel {
  country?: string;
  city?: string;
  full_address: string
}

export interface BusinessTypesModel {
  public: Array<string>;
  professional: Array<string>
}

export interface SocialUser {
    googleToken?: string;
    facebookToken?:string;
    googleId?: string;
    facebookId?:string
    appleToken?:string;
    appleId?: string;
    name?: string;
    surname?: string;
    email?: string;
    imageLink?: string;
    location?:RegistrationLocationModel;
    lang?:string;
}
