import { NgbDate } from "@ng-bootstrap/ng-bootstrap";
import { ISocialLinks } from "./sociallinks.model";

export interface RequestParams {
  headers?;
  observe?;
  responseType?;
}

export interface ServerResponse<T> {
  data: T;
  info: InfoModel;
  error: ErrorModel;
}

export interface InfoModel {
  error: boolean;
  array: boolean;
  time: string;
  near_you: boolean;
  followers_count?: number;
  following_count?: number;
  eventsSearchCount?: number;
  createdSearchCount?: number;
  favoritesEventsCount?: number;
  archiveCount?: number;
  groupInvitationCount?: number;
  userInvitationCount?: number;
  all_count?: number;
  manageCount?: number;
  inCount?: number;
  interestedCount?: number;
  favoritesCount?: number;
  createdCount?: number;
  user_data?: UserInfoModel;
  count?: number;
  eventsCount?: number;
  pageInvitationCount?: number;
  popup?: boolean;
}

export interface UserInfoModel {
  name: string;
  surname?: string;
  type: string;
}

export interface ErrorModel {
  message: string;
  status: number;
}

export interface UserModel {
  _id: string;
  name: string;
  surname: string;
  full_name?: string;
  phone: string;
  phones?: string[];
  createdAt: string;
  updatedAt: string;
  visitors?: number;
  attendees?: any;
  budget?: any;
  budget_type?: string;
  email: string;
  emails?: string[];
  poster: UserImageModel;
  events_count_year?: any;
  employees?: any;
  favorites: Array<any>;
  gender: string;
  categories: CategoryModel[];
  language: string;
  followings: number;
  followers: number;
  fbId: string;
  description?: string;
  pages: UserModel[];
  googleId: string;
  created_events_count: number;
  group_membership: number;
  my_groups_count: number;
  register_type: string;
  past_events_count: number;
  upcoming_events_count: number;
  address: AddressModel;
  location: LocationModel;
  followUsers: UserModel[];
  im_follow: boolean;
  professional_type: string;
  moderators: UserModel[];
  professional_category: string;
  events_count: number;
  followers_count: number;
  dob: string;
  inviteEvents: any[];
  inviteGroups: any[];
  notifications: {
    jogoto: string[];
    push: string[];
  };
  website?: string;
  openTimes?: any;
  open_times_checkbox?: string;
  socialLinks?: ISocialLinks[];
  facebookAutoShare?: boolean;
  twitterAutoShare?: boolean;
  linkedinAutoShare?: boolean;
  userPassword: boolean;
}

export interface UserImageModel {
  original: {
    link: string;
    width: number;
    height: number;
  };
  cropped: {
    link: string;
    width: number;
    height: number;
    x: number;
    y: number;
    x2: number;
    y2: number;
  };
  image_min: string;
  min: string;
}

export interface CategoryModel {
  _id: string;
  name: string;
  styleData: CategoryStyleDataModel;
  subcategories: Array<CategoryModel>;
}

export interface FiltersModel {
  filters: Array<string>;
}

export interface UpdateUserProfileImg {
  cropped: PosterModel;
  success: boolean;
  alertData: SendInfoToAlertMessage;
  type?: string;
  fileName?: string;
}

export interface EventModel {
  _id: string;
  name: string;
  description: string;
  poster: PosterModel;
  group_type?: string;
  category: Array<CategoryModel>;
  organizer: UserModel | GroupModel;
  location: EventLocationModel;
  isOnline: boolean;
  webAddress: String;
  event_link: string;
  dates: Array<DatesOfEvents>;
  joined_users: Array<UserModel>;
  join_mode: string;
  visibility: string;
  views: number;
  fee: FeeModel;
  event_create_type: EventCreateTypeModel;
  im_joined: boolean;
  is_favorite: boolean;
  filters: Array<string>;
  similar: Array<EventModel>;
  im_organaizer: UserDataModel;
  me_invited_user: MeInvitedUser;
  create_date?: string;
  notify: string;
  user_calendar: any[];
  create_type: string;
  added_user?: string;
  event?: any;
  admin?: string;
  moderator?: string;
  standart_users_count?: number;
  adminsAndModeratorsCount?: number;
  professional_category?: string;
  archive?: boolean;
  view_type?: boolean;
  endDateAndTimeHidden?: boolean;
  startTimeHidden?: boolean;
  descriptionLanguage?: string;
  endTimeHidden?: boolean;
}

interface MeInvitedUser {
  _id: number;
  name: string;
  surname: string;
  image: string;
  register_type: string;
}

interface CategoryStyleDataModel {
  color: string;
  icon: string;
}

export interface DatesOfEvents {
  end: string;
  start: string;
  zone?: string;
  text?: string;

  isSameDay?: boolean;
  _id: string;
}

export interface AddressModel {
  zip: number;
  country: string;
  full_address: string;
}

export interface LocationModel {
  type: string;
  coordinates: Array<number>;
}

export class EventLocationModel {
  address: {
    country: string;
    city: string;
    address: string;
    place_name: string;
  };
  place: string;
  coordinates: Array<number>;

  constructor() {
    this.address = {
      country: "",
      city: "",
      address: "",
      place_name: "",
    };
    this.place = "";
    this.coordinates = [];
  }
}

export interface FeeModel {
  price: number;
  currency: string;
}

interface EventCreateTypeModel {
  is_me: boolean;
  site: string;
  event_link: string;
  event_id: number;
  isLogo: boolean;
  logo?: string;
}

export interface PosterModel {
  type: string;
  original: ImageLinkModel;
  cropped: ImageLinkModel;
  min?: string;
  default_image?: boolean;
  image_min?: string;
}

interface ImageLinkModel {
  link: string;
  data?: string;
  width: number;
  height: number;
  x?: number;
  y?: number;
  x2?: number;
  y2?: number;
  orientation?: number;
}

export interface EventCategoryModel {
  is_me: boolean;
  name: string;
  styleData: CategoryStyleDataModel;
  subcategories: Array<Subcategories>;
  __v: number;
  _id: string;
}

interface Subcategories {
  eventsCount: number;
  name: string;
  sub_subs: Array<any>;
  _id: string;
}

export interface SendInfoToAlertMessage {
  type: string;
  messageText: string;
  display?: boolean;
}

export interface UserDataModel {
  _id: string;
  name: string;
  surname: string;
  poster: UserImageModel;
  email: string;
  favorites: Array<string>;
  gender: string;
  language: string;
  register_type: string;
  address: UserAddressModel;
  location: LocationModel;
  login: boolean;
  token: string;
}

interface UserAddressModel {
  country: string;
  city: string;
  full_address: string;
  full: string;
}

export interface ServerErrorModel {
  error: ErrorFromServer<Error>;
  headers: any;
  message: string;
  name: string;
  ok: boolean;
  status: number;
  statusText: string;
  url: string;
}

interface ErrorFromServer<T> {
  data: {};
  info: T;
  error: ErrorModel;
}

interface Error {
  message: string;
  status: number;
}

export class HomeFilterModel {
  distance: string;
  categoryFilter: string;
  fromDate: string;
  toDate: string;
  autocomplete: string;
  filter: string;
  isOnline: boolean;
  latLng: { lat: string; lng: string };

  constructor() {
    this.distance = "";
    this.categoryFilter = "";
    this.fromDate = "";
    this.toDate = "";
    this.autocomplete = "";
    this.filter = "";
    this.latLng = { lat: "", lng: "" };
  }
}

interface Error {
  message: string;
  status: number;
}

export interface ReportEventSendingDataModel {
  event_id: string;
  text: string;
}

export interface GroupModel {
  address: UserAddressModel;
  creator: CreatorModel;
  members_count: number;
  adminsAndModeratorsCount: number;
  standart_users_count: number;
  description: string;
  events: Array<EventModel>;
  group_type: string;
  location: Array<number>;
  admins: Array<MemberModel>;
  moderators: Array<MemberModel>;
  members: Array<MemberModel>;
  name: string;
  poster: PosterModel;
  _id: string;
  imJoined: boolean;
  admin?: boolean;
  moderator?: boolean;
  im_follow: boolean;
  events_count?: number;
  category: Array<CategoryModel>;
  notify?: string;
  state?: boolean;
  alreadyAdded?: boolean;
  viewType?: boolean;
  archive?: boolean;
}

interface CropperModel {
  link: string;
  width: number;
  height: number;
  x: number;
  y: number;
}

interface OriginalModel {
  link: string;
  width: number;
  height: number;
}

interface CreatorModel {
  _id: string;
  name: string;
  surname: string;
  image: string;
  favorites: Array<any>;
  imCreator: boolean;
  register_type: string;
}

export interface MemberModel {
  name?: string;
  surname?: string;
  poster?: UserImageModel;
  im_follow: boolean;
  moderator: boolean;
  admin: boolean;
  state: boolean;
  user: string;
  _id: string;
  im_creator: boolean;
  register_type?: string;
}

export interface CalendarEventModel {
  title: string;
  color: string;
  start: string;
  end: string;
  eventId: string;
}

export interface AddEventToGroupModel {
  event_id: string;
  group_id: string;
}

export interface InviteByEmails {
  event_id?: string;
  group_id?: string;
  emails: Array<string>;
}

export interface InviteUsers {
  event_id: string;
  group_id?: string;
  users: Array<string>;
}

export interface InviteUsers {
  event_id: string;
  users: Array<string>;
}

export interface CheckInterestedOrNot {
  interested: boolean;
  notInterested: boolean;
}

export interface NoResultModel {
  icon: string;
  text: string;
  description?: string;
}

export class SelectedFilters {
  filters: SelectedFiltersModel;
  categories: SelectedCategoriesModel;
  distance: number;
  isOnline: boolean
  autocomplete: SelectedAutocompleteModel;
  calendar: { fromDate: any; toDate: any };

  constructor() {
    this.filters = new SelectedFiltersModel();
    this.categories = new SelectedCategoriesModel();
    this.distance = 50;
    this.autocomplete = new SelectedAutocompleteModel();
    this.calendar = {} as any;
  }
}

export class SelectedAutocompleteModel {
  autocomplete: string;
  latLng: { lat: number | string; lng: number | string };
  isAddress?: boolean;

  constructor() {
    this.autocomplete = "";
    this.latLng = {
      lat: 0,
      lng: 0,
    };
  }
}

export class SelectedFiltersModel {
  checkAll: boolean;
  filters: string[];

  constructor() {
    this.checkAll = false;
    this.filters = [];
  }
}

export class SelectedCategoriesModel {
  checkAll: boolean;
  categories: string[];

  constructor() {
    this.checkAll = false;
    this.categories = [];
  }
}

export interface ContactUsModel {
  name: string;
  text: string;
  email: string;
}
