export class CreateEventModel {
  name: string;
  description: string;
  poster?: Poster;
  category: string[];
  filters: string[];
  isOnline: boolean;
  location: CreateLocationModel;
  address: Address;
  webAddress: String;
  event_create_type: {
    event_link: string,
    isLogo: boolean,
    is_me: boolean,
    site: ""

  }
  dates: Date[];
  visibility: string;
  create_type: string;
  group_id: string;
  default_image?: boolean;
}

export interface Poster {
  original: {
    data: string;
    width: number;
    height: number;
  };
  type: string;
  cropped?: {
    data: string;
    width: number;
    height: number;
    x: number;
    y: number;
    x2: number;
    y2: number;
  };
  default_image?: boolean;
  fileName?: string;
  fileType?: string;
  file?: any;
  min?: string;
}

export interface CreateLocationModel {
  lat: number;
  lon: number;
}

interface Address {
  country: string;
  city: string;
  place_name: string;
  address: string;
}

interface Date {
  start: string | Date;
  end: string | Date;
}
