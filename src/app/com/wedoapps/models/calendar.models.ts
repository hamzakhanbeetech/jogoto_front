export class EventInCalendar {
  public title: string;
  public start: string;
  public end: string;
  public color: string;
  public eventId: string;
  public creatorId: string;
  public allDay: boolean;

  constructor(allDay: boolean,
              title: string,
              start: string,
              end: string,
              color: string,
              eventId: string,
              creatorId: string,) {
    this.allDay = allDay;
    this.title = title;
    this.start = start;
    this.end = end;
    this.color = !!color ? color : '#378006';
    this.eventId = eventId;
    this.creatorId = creatorId;
  }

}
