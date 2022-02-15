import {
  UserModel,
  EventModel,
  EventCategoryModel,
  FeeModel,
  EventLocationModel,
  PosterModel
} from '../../../models/global.models';

export interface GroupModel {
  _id: string;
  location: Array<number>;
  members: Array<UserModel>;
  group_type: string;
  events: Array<EventModel>;
  name: string;
  description: string;
  creator: GroupCreatorModel;
  poster: PosterModel;
  imJoined: boolean;
  viewType?: boolean;
}

interface GroupCreatorModel {
  _id: string;
  favorites: Array<any>;
  im_creator?: boolean;
}

export class EventDataModel {
  id: string;
  name: string;
  description: string;
  location: EventLocationModel;
  link: string;
  archive: boolean;
  start?: '';
  end?: '';
  date: {
    start: string;
    end: string
  };
  endDateAndTimeHidden : boolean;
  startTimeHidden  : boolean;
  endTimeHidden?  : boolean;

  constructor() {
    this.id = '';
    this.name = '';
    this.description = '';
    this.link = '';
    this.location = new EventLocationModel();
    this.date = {
      start: '',
      end: ''
    };
    this.endDateAndTimeHidden = null;
    this.startTimeHidden = null;
    this.endTimeHidden = null;
  }
}

export interface NearEventsDataModel {
  name: string;
  description: string;
  location: string;
  date: string;
}

export interface EventsNearYou {
  category: Array<EventCategoryModel>;
  dates: Array<DatesOfNearEvents>;
  description: string;
  event_create_type: EventCreateType;
  fee: FeeModel;
  join_mode: string;
  joined_users: Array<any>
  location: EventLocationModel;
  name: string;
  organizer: Object;
  poster: PosterModel;
  views: number;
  visibility: string;
  _id: string;
  im_joined: boolean;
  im_organaizer: boolean;
  endDateAndTimeHidden: boolean;
  endTimeHidden?: boolean;
  startTimeHidden: boolean;
}

interface DatesOfNearEvents {
  end: string;
  start: string;
  _id: string
}

interface EventCreateType {
  is_me: boolean
}

