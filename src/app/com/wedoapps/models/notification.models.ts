import {UserModel} from './global.models';

type notifyType = 'event' | 'group' | 'user';

export interface INotification {
  _id: string;
  data_id: string;
  invite: boolean;
  notify_type: notifyType;
  read: boolean;
  date: string;
  who_user: UserModel;
  image: string;
  text: string;
}
