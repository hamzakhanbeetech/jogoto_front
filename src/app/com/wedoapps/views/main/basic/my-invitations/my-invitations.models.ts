import {EventModel, UserModel} from '../../../../models/global.models';

export interface MyInvitationsModels {
  event?: EventModel;
  group?: EventModel;
  page?: EventModel;
  who_invited: UserModel;
  date: string;
  followersCount?: number;
  eventsCount?: number;
  address: any
}
