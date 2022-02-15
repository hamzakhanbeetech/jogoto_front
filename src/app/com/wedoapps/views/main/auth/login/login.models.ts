export interface DatasForLogin{
    email: string;
    password: string;
    device?: string;
    os?: string;
    lang:string;
}


export interface LoginDataModel {
  address: LoginAddress
  email: string
  favorites: Array<any>
  gender: string
  image: string
  language: string
  location: LoginLocation
  login: true
  name: string
  register_type: string
  surname: string
  token: string
  _id: string
}



interface LoginLocation{
  type: string;
  coordinates: Array<number>
}
interface LoginAddress{
  country: string;
  full_address: string
}
