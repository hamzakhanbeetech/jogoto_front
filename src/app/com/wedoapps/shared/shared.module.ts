import { NgModule } from "@angular/core";
import { TranslateModule } from "@ngx-translate/core";
import { FilterWhereComponent } from "./components/filter-where/filter-where.component";
import { FilterWhenComponent } from "./components/filter-when/filter-when.component";
import { FilterComponent } from "./components/filter/filter.component";
import { FilterCategoryComponent } from "./components/filter-category/filter-category.component";
import { BsDropdownModule } from "ngx-bootstrap";
import { EventRowComponent } from "./components/event-row/event-row.component";
import { EventCategoryBtnComponent } from "./components/event-category-btn/event-category-btn.component";
import { CommonModule, DatePipe } from "@angular/common";
import { EventColumnComponent } from "./components/event-column/event-column.component";
import { EventShortDescriptiopnComponent } from "./components/event-short-descriptiopn/event-short-descriptiopn.component";
import { EventIterestedSectionComponent } from "./components/event-iterested-section/event-iterested-section.component";
import { EventCategoriesSectionComponent } from "./components/event-categories-section/event-categories-section.component";
import { BlockTitleSeeMoreComponent } from "./components/block-title-see-more/block-title-see-more.component";
import { GroupColumnComponent } from "./components/group-column/group-column.component";
import { CheckboxComponent } from "./components/checkbox/checkbox.component";
import { MatSliderComponent } from "./components/mat-slider/mat-slider.component";
import {
  MatSliderModule,
  MatFormFieldModule,
  MatInputModule,
  MatRadioModule,
} from "@angular/material";
import { MatAutocompleteComponent } from "./components/mat-autocomplete/mat-autocomplete.component";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";
import { CalendarComponent } from "./components/calendar/calendar.component";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { MatModalComponent } from "./components/mat-modal/mat-modal.component";
import { MatDialogModule } from "@angular/material/dialog";
import { EventFilterContentComponent } from "./components/event-filter-content/event-filter-content.component";
import { EventFilterWhereContentComponent } from "./components/event-filter-where-content/event-filter-where-content.component";
import { EventFilterCategoriesContentComponent } from "./components/event-filter-categories-content/event-filter-categories-content.component";
import { RouterModule } from "@angular/router";
import { StatisticsComponent } from "./components/statistics/statistics.component";
import { HomeFilterSectionComponent } from "./components/home-filter-section/home-filter-section.component";
import { MapComponent } from "./components/map/map.component";
import { EventDateComponent } from "./components/event-date/event-date.component";
import { AddToCalendarModalComponent } from "./components/add-to-calendar-modal/add-to-calendar-modal.component";
import { TruncatePipe } from "../pipes";
import { UserBlockComponent } from "./components/user-block/user-block.component";
import { OnboardingHeaderComponent } from "./components/onboarding-header/onboarding-header.component";
import { OnboardingFooterComponent } from "./components/onboarding-footer/onboarding-footer.component";
import { AllertMessageComponent } from "./components/allert-message/allert-message.component";
import { ClickOutsideModule } from "ng-click-outside";
import { LoadingComponent } from "./components/loading/loading.component";
import { UsersModalComponent } from "./components/users-modal/users-modal.component";
import { GiveFeedbackModalComponent } from "./components/give-feedback-modal/give-feedback-modal.component";
import { ShareOnGroupModalComponent } from "./components/share-on-group-modal/share-on-group-modal.component";
import { IviteModalComponent } from "./components/modal/ivite-modal/ivite-modal.component";
import { NotificationSettingsModalComponent } from "./components/modal/notification-settings-modal/notification-settings-modal.component";
import { ImageCropperModule } from "ngx-image-cropper";
import { InfiniteScrollModule } from "ngx-infinite-scroll";
import { NoResultComponent } from "./components/no-result/no-result.component";
import { NoSearchResultComponent } from "../views/main/search/components/no-search-result/no-search-result.component";
import {
  CreatedPagesTypeComponent,
  CropImageComponent,
  CreateNameComponent,
  CreateLocationComponent,
} from "../views/main/basic/components";
import { ReportEventModalComponent } from "./components/report-event-modal/report-event-modal.component";
import { InviteByEmailComponent } from "./components/modal/invite-by-email/invite-by-email.component";
import { UsersListComponent } from "./components/users-list/users-list.component";
import { CalendarModuleComponent } from "./components/calendar-module/calendar-module.component";
import { GroupSidebarComponent } from "./components/group-sidebar/group-sidebar.component";
import { ImportFileComponent } from "./components/modal/import-file/import-file.component";
import { UploadFileComponent } from "./components/upload-file/upload-file.component";
import { AboutGroupComponent } from "./components/about-group/about-group.component";
import { EventSidebarComponent } from "./components/event-sidebar/event-sidebar.component";
import { FullCalendarModule } from "@fullcalendar/angular";
import { AutocompleteLibModule } from "angular-ng-autocomplete";
import { CalendarDropdownComponent } from "./components/calendar-dropdown/calendar-dropdown.component";
import { NoEventComponent } from "./components/no-event/no-event.component";
import { SidebarSuggestedGroupsComponent } from "./components/sidebar-suggested-groups/sidebar-suggested-groups.component";
import { GroupService } from "../views/main/group/group.service";
import { ProfileImageModalComponent } from "./components/modal/profile-image-modal/profile-image-modal.component";
import { DropdownModule } from "primeng/dropdown";
import { DeleteComponent } from "./components/modal/delete/delete.component";
import { DeleteService, FiltersService } from "../services";
import { InviteBtnComponent } from "./components/modal/invite-btn/invite-btn.component";
import { MapImageComponent } from "./components/map-image/map-image.component";
import { MembersComponent } from "./components/members/members.component";
import { SocialLinksComponent } from "./components/social-links/social-links.component";
import { IncomingEventsComponent } from "./components/incoming-events/incoming-events.component";
import { SocialLinksJogotoComponent } from "./components/social-links-jogoto/social-links-jogoto.component";
import { AboutFooterComponent } from "./components/about-footer/about-footer.component";
import { LazyLoadImageModule, scrollPreset } from "ng-lazyload-image";
import { LocalizePipe } from "../pipes";
import { SearchUsersComponent } from "./components/search-users/search-users.component";
import { NotAvailableComponent } from "./components/not-available/not-available.component";
import { ContactOrganizorComponent } from "./components/modal/contact-organizor/contact-organizor.component";
import { AddToCalendarComponent } from "./components/modal/add-to-calendar/add-to-calendar.component";

@NgModule({
  imports: [
    TranslateModule,
    BsDropdownModule.forRoot(),
    CommonModule,
    MatSliderModule,
    InfiniteScrollModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    BsDatepickerModule.forRoot(),
    NgbModule,
    MatDialogModule,
    RouterModule,
    ClickOutsideModule,
    MatRadioModule,
    ImageCropperModule,
    FullCalendarModule,
    AutocompleteLibModule,
    LazyLoadImageModule.forRoot({
      preset: scrollPreset, // <-- tell LazyLoadImage that you want to use scrollPreset
    }),
  ],
  declarations: [
    NoResultComponent,
    FilterWhereComponent,
    FilterWhenComponent,
    FilterComponent,
    TruncatePipe,
    FilterCategoryComponent,
    SocialLinksComponent,
    EventRowComponent,
    EventCategoryBtnComponent,
    EventColumnComponent,
    EventShortDescriptiopnComponent,
    EventIterestedSectionComponent,
    EventCategoriesSectionComponent,
    BlockTitleSeeMoreComponent,
    GroupColumnComponent,
    CheckboxComponent,
    MatSliderComponent,
    MatAutocompleteComponent,
    CalendarComponent,
    MatModalComponent,
    EventFilterContentComponent,
    EventFilterWhereContentComponent,
    EventFilterCategoriesContentComponent,
    StatisticsComponent,
    UserBlockComponent,
    OnboardingHeaderComponent,
    OnboardingFooterComponent,
    AllertMessageComponent,
    MapComponent,
    HomeFilterSectionComponent,
    EventDateComponent,
    AddToCalendarModalComponent,
    LoadingComponent,
    UsersModalComponent,
    GiveFeedbackModalComponent,
    ReportEventModalComponent,
    ShareOnGroupModalComponent,
    IviteModalComponent,
    NoSearchResultComponent,
    NotificationSettingsModalComponent,
    InviteByEmailComponent,
    CreatedPagesTypeComponent,
    UsersListComponent,
    CalendarModuleComponent,
    GroupSidebarComponent,
    ImportFileComponent,
    UploadFileComponent,
    AboutGroupComponent,
    EventSidebarComponent,
    CropImageComponent,
    CreateNameComponent,
    CreateLocationComponent,
    CalendarDropdownComponent,
    NoEventComponent,
    SidebarSuggestedGroupsComponent,
    DeleteComponent,
    ContactOrganizorComponent,
    ProfileImageModalComponent,
    InviteBtnComponent,
    MapImageComponent,
    MembersComponent,
    IncomingEventsComponent,
    SocialLinksJogotoComponent,
    AboutFooterComponent,
    LocalizePipe,
    SearchUsersComponent,
    NotAvailableComponent,
    ContactOrganizorComponent,
    AddToCalendarComponent,
  ],
  exports: [
    TranslateModule,
    DropdownModule,
    FilterWhereComponent,
    BsDropdownModule,
    FilterWhenComponent,
    FilterComponent,
    FilterCategoryComponent,
    EventRowComponent,
    EventColumnComponent,
    EventShortDescriptiopnComponent,
    EventIterestedSectionComponent,
    SocialLinksComponent,
    NgbModule,
    BlockTitleSeeMoreComponent,
    GroupColumnComponent,
    CheckboxComponent,
    MatSliderComponent,
    MatAutocompleteComponent,
    CalendarComponent,
    MatModalComponent,
    MatDialogModule,
    UsersListComponent,
    EventFilterContentComponent,
    EventFilterWhereContentComponent,
    EventFilterCategoriesContentComponent,
    StatisticsComponent,
    TruncatePipe,
    UserBlockComponent,
    OnboardingHeaderComponent,
    OnboardingFooterComponent,
    AllertMessageComponent,
    HomeFilterSectionComponent,
    MapComponent,
    EventDateComponent,
    AddToCalendarModalComponent,
    LoadingComponent,
    InfiniteScrollModule,
    ImageCropperModule,
    CreatedPagesTypeComponent,
    CropImageComponent,
    CreateNameComponent,
    CreateLocationComponent,
    CalendarModuleComponent,
    GroupSidebarComponent,
    UploadFileComponent,
    AboutGroupComponent,
    NoSearchResultComponent,
    EventSidebarComponent,
    ReactiveFormsModule,
    FormsModule,
    CalendarDropdownComponent,
    NoEventComponent,
    SidebarSuggestedGroupsComponent,
    MatRadioModule,
    ClickOutsideModule,
    InviteBtnComponent,
    MapImageComponent,
    MembersComponent,
    IncomingEventsComponent,
    SocialLinksJogotoComponent,
    AboutFooterComponent,
    EventCategoryBtnComponent,
    LocalizePipe,
    SearchUsersComponent,
    NotAvailableComponent,
  ],
  entryComponents: [
    MatModalComponent,
    AddToCalendarModalComponent,
    UsersModalComponent,
    GiveFeedbackModalComponent,
    ReportEventModalComponent,
    ShareOnGroupModalComponent,
    IviteModalComponent,
    NotificationSettingsModalComponent,
    InviteByEmailComponent,
    ImportFileComponent,
    CalendarDropdownComponent,
    DeleteComponent,
    ContactOrganizorComponent,
    ProfileImageModalComponent,
    AddToCalendarComponent,
  ],
  providers: [DatePipe, GroupService, DeleteService, FiltersService],
})
export class SharedModule {}
