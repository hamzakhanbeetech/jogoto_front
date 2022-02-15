import { NgModule } from "@angular/core";
import { BsDropdownModule, TabsModule } from "ngx-bootstrap";
import { CommonModule } from "@angular/common";
import { MatRadioModule } from "@angular/material/radio";
import { TranslateModule } from "@ngx-translate/core";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { AutocompleteLibModule } from "angular-ng-autocomplete";

import { OrganizationUsersListComponent } from "./components/organization-users-list/organization-users-list.component";
import { OrganizationMembersComponent } from "./components/organization-members/organization-members.component";
import { EditBusinessInfoComponent } from "./components/edit-business-info/edit-business-info.component";
import { SocialIconsModalComponent } from "./components/social-icons-modal/social-icons-modal.component";
import { OrganizationTabsComponent } from "./components/organization-tabs/organization-tabs.component";
import { SharedInfoDetailModule } from "../../../shared/shared-info-detail/shared-info-detail.module";
import { AboutPageEditComponent } from "./components/about-page-edit/about-page-edit.component";
import { OrganizationComponent } from "./components/organization/organization.component";
import { AboutPublicComponent } from "./components/about-public/about-public.component";
import {
  AutoCompleteModule,
  CalendarModule,
  DropdownModule,
} from "primeng/primeng";
import { PageAboutComponent } from "./components/page-about/page-about.component";
import { OrganizationRoutingModule } from "./organization-routing.module";
import { SharedModule } from "../../../shared/shared.module";
import { SearchService } from "../search/search.service";
import { EventService } from "../event/event.service";
import { UserService } from "../../../services";
import { NgxIntlTelInputModule } from "ngx-intl-tel-input";
import { PhoneControlComponent } from './components/phone-control/phone-control.component';

@NgModule({
  declarations: [
    OrganizationComponent,
    OrganizationTabsComponent,
    PageAboutComponent,
    AboutPublicComponent,
    AboutPageEditComponent,
    SocialIconsModalComponent,
    EditBusinessInfoComponent,
    OrganizationMembersComponent,
    OrganizationUsersListComponent,
    PhoneControlComponent,
  ],
  imports: [
    CommonModule,
    TranslateModule,
    SharedModule,
    SharedInfoDetailModule,
    TabsModule.forRoot(),
    MatRadioModule,
    AutoCompleteModule,
    CalendarModule,
    DropdownModule,
    AutocompleteLibModule,
    NgxIntlTelInputModule,
    OrganizationRoutingModule,
  ],
  providers: [UserService, SearchService, EventService],
  entryComponents: [SocialIconsModalComponent],
})
export class OrganizationModule {}
