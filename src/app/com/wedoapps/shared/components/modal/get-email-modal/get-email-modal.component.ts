import {Component, Inject, OnInit, OnDestroy} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';




// This is for testing purposes. Please use your own API KEY. You can get it from https://developers.google.com/calendar/quickstart/js
const API_KEY = 'AIzaSyDwFc-wdOkYOEzmlN-d0CFme5upSKJYAP0';

// This is for testing purposes. Please use your own CLIENT ID. You can get it from https://developers.google.com/calendar/quickstart/js
const CLIENT_ID = '1097538590454-c06lp866krvugnrh3q0ht0s2hn04obr0.apps.googleusercontent.com';

const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'];
const SCOPES = 'https://www.googleapis.com/auth/calendar';
const win: any = window;

let calApiLoaded: boolean;



@Component({
  selector: 'app-get-email-modal',
  templateUrl: './get-email-modal.component.html',
  styleUrls: ['./get-email-modal.component.scss']
})
export class GetEmailModalComponent implements OnInit {
  public loading: boolean = false;
  public errorMessage: string = undefined;
  public invitedEmailsList: Array<string> = [];
  public email: string
  public events = []
  public texts: any = {
    header:"Successfully",
    description: "Exported Events To Your Google Calendar"
  };
  initClient = () => {
    // alert("hi")
    win.gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
    }).then(() => {
        calApiLoaded = true;
        // alert("hi")
        win.gapi.auth2.getAuthInstance().signIn();
        this.loadEvents(new Date, new Date);
    });
}


  constructor(public dialogRef: MatDialogRef<any>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private _dialog: MatDialog) {
  }

  ngOnInit() {


    if(this.data.events){
      this.events = this.data.events
    }

    if(this.data.header){
      this.events = this.data
    }

  }

  // Load the SDK asynchronously
  loadGoogleSDK(): void {
    ((d: any, s: any, id: any) => {
      let js: any;
      const fjs: any = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {
        win.onGoogleLoad();
        return;
      }
      js = d.createElement(s);
      js.id = id;
      js.src = 'https://apis.google.com/js/api.js?onload=onGoogleLoad';
      js.onload = 'onGoogleLoad';
      fjs.parentNode.insertBefore(js, fjs);
    })(document, 'script', 'google-jssdk');
  }



  // Load events from Google Calendar between 2 dates
  loadEvents(first: Date, last: Date): void {
    this._dialog.closeAll();
    // Only load events if the Google API finished loading
    if (calApiLoaded) {
      win.gapi.client.calendar.events.list({
        calendarId: this.email,
        showDeleted: false,
        singleEvents: true,
        maxResults: 100,
        orderBy: 'startTime'
      }).then((response: any) => {
        // alert("resp: "+response)
        console.log("resp: ",response)
        let event;
        const events = response.result.items;
        let end;
        // Process event list
        for (const value of events) {
          event = value;
          end = new Date(event.end.date || event.end.dateTime);

        }
      }).catch(err => console.log("err: ",err));
    }
  }


  addEvents(){

    this.events.map(x => {

    var event = {
      'summary': x.title,
      'location': 'Abbottabad, KPK, Pakistan',
      'description': 'A chance to hear more about Pakistan\'s developer products.',
      'start': {
        'dateTime': x.start,
        'timeZone': 'Asia/Karachi'
      },
      'end': {
        'dateTime': x.end,
        'timeZone': 'Asia/Karachi'
      },
      'attendees': [
        {'email': 'lpage@example.com'},
        {'email': 'sbrin@example.com'}
      ],
      'reminders': {
        'useDefault': false,
        'overrides': [
          {'method': 'email', 'minutes': 24 * 60},
          {'method': 'popup', 'minutes': 10}
        ]
      }
    };

    var request = win.gapi.client.calendar.insert({
      'calendarId': this.email,
      'resource': event
    });

    request.execute(function(event) {
      console.log('Event created: ' , event.htmlLink);
    }, err => {
      console.log("err event create: ", err)
    });

    })
    alert("Successfully Exported Events")


  }




  ngOnDestroy() {
  }
}
