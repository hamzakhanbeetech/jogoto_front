import {PosterModel} from '../../../../models/global.models';
import {CreateLocationModel} from '../create-event/create-event.models';

export interface UsersFileModel{
    extname:string;
    data:string;
    error?:boolean
}

export interface CreateGroupModel {
  name: string;
  description: string;
  group_type: string;
  file_data: UsersFileModel;
  poster?: PosterModel;
  location: CreateLocationModel;
  address: Address;
  members: string[];
  group_id?:string;
  default_image?:boolean;
}

interface Address {
  full: string
}


