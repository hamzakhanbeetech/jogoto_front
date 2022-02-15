import {Injectable, NgZone} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {TranslateService} from '@ngx-translate/core';
import {AppService} from '../../../app.service';
import {SubjectsInteractionsService} from './subjects-interactions.service';
import {CookieService} from 'ngx-cookie';
import {Router} from '@angular/router';
import * as moment from 'moment';
import {DatePipe} from '@angular/common';
import * as momentTimeZone from 'moment-timezone';

@Injectable()
export class UtilitesService {

  constructor(private _httpClient: HttpClient,
              private _translate: TranslateService,
              private _appService: AppService,
              private _subjectsIteractionsService: SubjectsInteractionsService,
              private _cookieService: CookieService,
              private _ngZone: NgZone,
              private _router: Router,
              private _datePipe: DatePipe
  ) {

  }

  public _sortDates(dates, checkDate) {
    let newDates = [];
    let incomingDate;
    if (!checkDate || !new Date(checkDate)) {
      checkDate = new Date()
    }
    newDates = dates.sort((a, b) => moment(a.start).unix() - moment(b.start).unix())
      .filter(
        date => {
          let dateA = moment(date.start).format('MM-DD-YYYY HH:mm:ss a');
          let dateB = moment(checkDate).format('MM-DD-YYYY HH:mm:ss a');
          // console.log( dateA, dateB, moment(dateA, 'MM-DD-YYYY HH:mm:ss').isSameOrAfter(moment(checkDate)));
          return moment(dateA, 'MM-DD-YYYY HH:mm:ss').isSameOrAfter(moment(checkDate))
        }
      );
    incomingDate = newDates[0];
    return incomingDate ? incomingDate : null
  }

  public checkDateTimeZone(dates) {
    let finalDates = [];
    for (let date of dates) {
      if (date.zone && !date.zone.match(/[+-][0-9]{2}:[0-9]{2}\b/)) {
          const startTime = this.setTimeZone(date, 'start', date.zone);
          const endTime = this.setTimeZone(date, 'end', date.zone);
        finalDates.push({
          ...date,
          start: startTime,
          end: endTime,
        });
      } else {
        finalDates = dates;
        break
      }
    }
    return finalDates
  }

  public setTimeZone(date, type, zone, revert = false){
      const now = momentTimeZone();
      const localOffset = now.utcOffset();
      now.tz(zone);
      const centralOffset = now.utcOffset();
      const minutes = localOffset - centralOffset;
      if(minutes < 0 && revert){
          return momentTimeZone.utc(date[type]).add(minutes,'minutes').tz(date.zone, true).format('YYYY-MM-DDTHH:mm:ss')
      }else if (revert){
          return momentTimeZone.utc(date[type]).subtract(Math.abs(minutes), 'minutes').tz(date.zone, true).format('YYYY-MM-DDTHH:mm:ss')
      }
      if(minutes > 0){
        return momentTimeZone.utc(date[type]).add(minutes,'minutes').tz(date.zone, true).format('YYYY-MM-DDTHH:mm:ss')
    }else{
        return momentTimeZone.utc(date[type]).subtract(Math.abs(minutes), 'minutes').tz(date.zone, true).format('YYYY-MM-DDTHH:mm:ss')
    }
  }

  public checkHashtags(string): string {
    return string.replace(/(^|\s)#([\S\d_]+)/ig, `$1<a href="/search?query=$2" class='hash_tag'>#$2</a>`)
      .replace(/\n/g, '<br/>');
  }

  public checkURL(string): string {
    const url_pattern = /(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\x{00a1}\-\x{ffff}0-9]+-?)*[a-z\x{00a1}\-\x{ffff}0-9]+)(?:\.(?:[a-z\x{00a1}\-\x{ffff}0-9]+-?)*[a-z\x{00a1}\-\x{ffff}0-9]+)*(?:\.(?:[a-z\x{00a1}\-\x{ffff}]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?/ig;
    return string.replace(url_pattern, (url) => {
      const protocol_pattern = /^(?:(?:https?|ftp):\/\/)/i;
      const href = protocol_pattern.test(url) ? url : 'http://' + url;
      return '<a href="' + href + '" target="_blank">' + url + '</a>';
    });
  }

  public unwrapLinkFromTag(text: string): string {
    return text.replace(/<[^>]*>?/gm, '');
  }

  public getImage(url: string): Observable<Blob> {
    return this._httpClient.get(url, {responseType: 'blob'});
  }

  public cropToBlob() {
    if (!HTMLCanvasElement.prototype.toBlob) {
      Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
        value: function (callback, type, quality) {
          const dataURL = this.toDataURL(type, quality).split(',')[1];
          setTimeout(function () {

            const binStr = atob(dataURL),
              len = binStr.length,
              arr = new Uint8Array(len);

            for (let i = 0; i < len; i++) {
              arr[i] = binStr.charCodeAt(i);
            }

            callback(new Blob([arr], {type: type || 'image/png'}));

          });
        }
      });
    }
  }

  public checkDevice() {
    const userAg = navigator.userAgent;
    const types = ['Android', 'Windows', 'Mac OS', 'webOS', 'iPhone', 'iPad', 'iPod', 'BlackBerry', 'Windows Phone'];
    let os = 'Windows';
    let device = 'web';

    if (window.innerWidth <= 992) {
      device = 'mobile'
    }

    for (let type of types) {
      const regexp = new RegExp(`${type}`);
      if (regexp.test(userAg)) {
        os = type;
        break
      }
    }

    return {device, os};
  }

  public _setUserState(data) {
    localStorage.setItem('user_data', JSON.stringify(data.data));
    this._translate.use(data.data.language || 'en');
    localStorage.setItem('currentLanguage', data.data.language || 'en');
    this._appService.setIsAuthorized(true);
    this._subjectsIteractionsService.authorization.next({
      isAuthorized: true
    });
    this._cookieService.put('user_id', data.data._id);
    this._cookieService.put('user_token', data.data.token);
    this._subjectsIteractionsService.changeUserState(true);
    this._ngZone.run(() => {
      const localUrl = this.localizeRouter('');
      this._router.navigate([localUrl]);
    });
  }

  public getOrientation(file, callback) {
    let reader = new FileReader();
    reader.onload = function (event: any) {
      let view = new DataView(event.target.result);

      if (view.getUint16(0, false) != 0xFFD8) return callback(-2);
      let length = view.byteLength,
        offset = 2;

      while (offset < length) {
        let marker = view.getUint16(offset, false);
        offset += 2;

        if (marker == 0xFFE1) {
          if (view.getUint32(offset += 2, false) != 0x45786966) {
            return callback(-1);
          }
          let little = view.getUint16(offset += 6, false) == 0x4949;
          offset += view.getUint32(offset + 4, little);
          let tags = view.getUint16(offset, little);
          offset += 2;

          for (let i = 0; i < tags; i++)
            if (view.getUint16(offset + (i * 12), little) == 0x0112)
              return callback(view.getUint16(offset + (i * 12) + 8, little));
        } else if ((marker & 0xFF00) != 0xFF00) break;
        else offset += view.getUint16(offset, false);
      }
      return callback(-1);
    };

    reader.readAsArrayBuffer(file.slice(0, 64 * 1024));
  };

  public getDefaultDates() {
    const startDate = new Date();
    const endDate = new Date();
    const numberOfDaysToAdd = 10;
    endDate.setDate(endDate.getDate() + numberOfDaysToAdd);
    const mm = startDate.getMonth() + 1;
    const endMM = endDate.getMonth() + 1;
    const endy = endDate.getFullYear();
    const y = startDate.getFullYear();

    const start_date = this._datePipe.transform(`${y}-${mm}-${startDate.getDate()}`, "yyyy-MM-dd")
    const end_date = this._datePipe.transform(`${endy}-${endMM}-${endDate.getDate()}`, "yyyy-MM-dd");
    return {
      start_date,
      end_date
    }
  }

  public localizeRouter(url: string, lng: string = ''): string {
    url = url[0] == '/' ? url.substring(1) : url;
    const lang = lng || localStorage.getItem('currentLanguage') || this._translate.currentLang || 'en';
    return `/${lang}/${url}`
  }
}
