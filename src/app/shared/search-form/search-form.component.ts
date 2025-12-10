import { AsyncPipe, NgFor, NgIf } from "@angular/common";
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { NgbModal, NgbTooltipModule } from "@ng-bootstrap/ng-bootstrap";
import { TranslateModule } from "@ngx-translate/core";
import { BehaviorSubject } from "rxjs";
import { take } from "rxjs/operators";

import { DSONameService } from "../../core/breadcrumbs/dso-name.service";
import { DSpaceObjectDataService } from "../../core/data/dspace-object-data.service";
import { PaginationService } from "../../core/pagination/pagination.service";
import { DSpaceObject } from "../../core/shared/dspace-object.model";
import { getFirstSucceededRemoteDataPayload } from "../../core/shared/operators";
import { SearchService } from "../../core/shared/search/search.service";
import { SearchConfigurationService } from "../../core/shared/search/search-configuration.service";
import { SearchFilterService } from "../../core/shared/search/search-filter.service";
import { hasValue, isNotEmpty } from "../empty.util";
import { BrowserOnlyPipe } from "../utils/browser-only.pipe";
import { currentPath } from "../utils/route.utils";
import { ScopeSelectorModalComponent } from "./scope-selector-modal/scope-selector-modal.component";
import { HelpSearchComponent } from "../help-search/help-search.component";

@Component({
  selector: "ds-base-search-form",
  styleUrls: ["./search-form.component.scss"],
  templateUrl: "./search-form.component.html",
  standalone: true,
  imports: [
    AsyncPipe,
    BrowserOnlyPipe,
    FormsModule,
    NgbTooltipModule,
    TranslateModule,
    HelpSearchComponent,
    NgIf,
    NgFor,
  ],
})
/**
 * Component that represents the search form
 */
export class SearchFormComponent implements OnChanges {
  /**
   * The search query
   */
  @Input() query: string;

  /**
   * True when the search component should show results on the current page
   */
  @Input() inPlaceSearch: boolean;

  /**
   * The currently selected scope object's UUID
   */
  @Input()
  scope = "";

  /**
   * Hides the scope in the url, this can be useful when you hardcode the scope in another way
   */
  @Input() hideScopeInUrl = false;

  selectedScope: BehaviorSubject<DSpaceObject> =
    new BehaviorSubject<DSpaceObject>(undefined);

  @Input() currentUrl: string;

  /**
   * Whether or not the search button should be displayed large
   */
  @Input() large = false;

  /**
   * The brand color of the search button
   */
  @Input() brandColor = "primary";

  /**
   * The placeholder of the search input
   */
  @Input() searchPlaceholder: string;

  /**
   * Defines whether or not to show the scope selector
   */
  @Input() showScopeSelector = false;

  /**
   * Output the search data on submit
   */
  @Output() submitSearch = new EventEmitter<any>();

  @Input() filterFields: string;

  /** kware start edit */
  selectedFilter = "";

  queryFilters: any[];

  isEntitySearch;
  /** kware end edit */

  constructor(
    protected router: Router,
    protected searchService: SearchService,
    protected searchFilterService: SearchFilterService,
    protected paginationService: PaginationService,
    protected searchConfig: SearchConfigurationService,
    protected modalService: NgbModal,
    protected dsoService: DSpaceObjectDataService,
    public dsoNameService: DSONameService,
    protected route: ActivatedRoute
  ) {}

  /**
   * Retrieve the scope object from the URL so we can show its name
   */
  ngOnChanges(): void {
    if (isNotEmpty(this.scope)) {
      this.dsoService
        .findById(this.scope)
        .pipe(getFirstSucceededRemoteDataPayload())
        .subscribe((scope: DSpaceObject) => this.selectedScope.next(scope));
    }
    const tempQuery = this.query?.includes(":")
      ? this.query?.split(":")
      : this.query;
    if (typeof tempQuery !== "string") {
      this.query = tempQuery[1];
      this.selectedFilter = tempQuery[0];
    }
  }

  /**
   * Updates the search when the form is submitted
   * @param data Values submitted using the form
   */
  // onSubmit(data: any) {
  //   if (isNotEmpty(this.scope)) {
  //     data = Object.assign(data, { scope: this.scope });
  //   }
  //   this.updateSearch(data);
  //   this.submitSearch.emit(data);
  // }
  onSubmit(data: any) {
    let filteredQuery = {
      query: `${data.queryFilter !== "" ? `${data.queryFilter}:` : ""}${
        this.query || "*"
      }`,
    };
    if (isNotEmpty(this.scope)) {
      filteredQuery = Object.assign(filteredQuery, { scope: this.scope });
    }
    this.updateSearch(filteredQuery);
    this.submitSearch.emit(filteredQuery);
  }
  /**
   * Updates the search when the current scope has been changed
   * @param {string} scope The new scope
   */
  onScopeChange(scope: DSpaceObject) {
    this.updateSearch({ scope: scope ? scope.uuid : undefined });
    this.searchFilterService.minimizeAll();
  }

  /**
   * Updates the search URL
   * @param data Updated parameters
   */
  // updateSearch(data: any) {
  //   const goToFirstPage = { "spc.page": 1 };

  //   const queryParams = Object.assign(
  //     {
  //       ...goToFirstPage,
  //     },
  //     data
  //   );
  //   if (hasValue(data.scope) && this.hideScopeInUrl) {
  //     delete queryParams.scope;
  //   }

  //   void this.router.navigate(this.getSearchLinkParts(), {
  //     queryParams: queryParams,
  //     queryParamsHandling: "merge",
  //   });
  // }
  updateSearch(data: any) {
    const goToFirstPage = { "spc.page": 1 };

    const queryParams = Object.assign(
      {
        ...goToFirstPage,
      },
      data
    );
    if (hasValue(data.scope) && this.hideScopeInUrl) {
      delete queryParams.scope;
    }
    switch (true) {
      case this.selectedFilter === "dc.title":
        queryParams.category = "Publication";
        break;
      case this.selectedFilter === "dc.contributor.author":
        queryParams.category = "Publication";
        break;
      case this.selectedFilter === "dc.contributor.copier":
        queryParams.category = "Publication";
        break;
      case this.selectedFilter === "dc.subject":
        queryParams.category = "Publication";
        break;
      case this.selectedFilter === "dc.relation.holding":
        queryParams.category = "Publication";
        break;
      case this.selectedFilter === "":
        queryParams.category = "Publication";
        break;
      case this.selectedFilter === "organization.legalName":
        queryParams.category = "OrgUnit";
        break;
      case this.selectedFilter === "personName":
        queryParams.category = "Person";
        break;
      case this.selectedFilter === "subject.title":
        queryParams.category = "Subject";
        break;
      case this.selectedFilter === "dc.identifier.dewey":
        queryParams.category = "Subject";
        break;
      case this.selectedFilter === "project.name":
        queryParams.category = "Project";
        break;
      case this.selectedFilter === "dc.title":
        queryParams.category = "Journal";
        break;
      case this.selectedFilter === "place.legalName":
        queryParams.category = "Place";
        break;
      case this.selectedFilter === "event.title":
        queryParams.category = "Event";
        break;
      case this.selectedFilter === "era.title":
        queryParams.category = "Era";
        break;
      case this.selectedFilter === "series.name":
        queryParams.category = "Series";
        break;
      case this.selectedFilter === "journalTitle":
        queryParams.category = "Journal";
        break;
      default:
        queryParams.category = "Publication";
        break;
    }

    void this.router.navigate(this.getSearchLinkParts(), {
      queryParams: queryParams,
      queryParamsHandling: "merge",
    });
  }

  /**
   * @returns {string} The base path to the search page, or the current page when inPlaceSearch is true
   */
  public getSearchLink(): string {
    if (this.inPlaceSearch) {
      return currentPath(this.router);
    }
    return this.searchService.getSearchLink();
  }

  /**
   * @returns {string[]} The base path to the search page, or the current page when inPlaceSearch is true, split in separate pieces
   */
  public getSearchLinkParts(): string[] {
    if (this.inPlaceSearch) {
      return [];
    }
    return this.getSearchLink().split("/");
  }

  /**
   * Open the scope modal so the user can select DSO as scope
   */
  openScopeModal() {
    const ref = this.modalService.open(ScopeSelectorModalComponent);
    ref.componentInstance.scopeChange
      .pipe(take(1))
      .subscribe((scope: DSpaceObject) => {
        this.selectedScope.next(scope);
        this.onScopeChange(scope);
      });
  }

  clearText() {
    this.query = null;
  }

  ngOnInit(): void {
    this.isEntitySearch =
      document.URL.includes("source=browseCategory") &&
      document.URL.includes("value");

    if (hasValue(this.filterFields)) {
      switch (true) {
        case this.filterFields === "Publication":
          this.queryFilters = [
            {
              label: "query.filter.publicationTitle",
              value: "dc.title",
            },
            {
              label: "query.filter.author",
              value: "dc.contributor.author",
            },
            {
              label: "query.filter.advisor",
              value: "dc.contributor.advisor",
            },
            {
              label: "query.filter.publisher",
              value: "dc.publisher",
            },
            {
              label: "query.filter.subject",
              value: "dc.subject",
            },

            {
              label: "query.filter.holding",
              value: "dc.relation.holding",
            },
            {
              label: "query.filter.doi",
              value: "dc.identifier.doi",
            },
            {
              label: "query.filter.all",
              value: "",
            },
            // {
            //   label: 'query.filter.date',
            //   value: 'dc.date.issued',
            // },
          ];
          break;

        case this.filterFields === "Group":
          this.queryFilters = [
            // {
            //   label: 'query.filter.all',
            //   value: '',
            // },
            {
              label: "query.filter.groupTitle",
              value: "dc.title.group",
            },
            {
              label: "query.filter.copier",
              value: "dc.contributor.copier",
            },

            {
              label: "query.filter.source",
              value: "dc.source",
            },
            {
              label: "query.filter.subject",
              value: "dc.subject",
            },

            {
              label: "query.filter.holding",
              value: "dc.relation.holding",
            },
            {
              label: "query.filter.organizationName",
              value: "organization.legalName",
            },
            {
              label: "query.filter.saveNumber",
              value: "dc.identifier.saveNumber",
            },
            {
              label: "query.filter.all",
              value: "",
            },
            // {
            //   label: 'query.filter.copyDate',
            //   value: 'dc.date.copy',
            // },
          ];
          break;
        case this.filterFields === "Person":
          this.queryFilters = [
            // {
            //   label: 'query.filter.all',
            //   value: '',
            // },
            {
              label: "query.filter.personName",
              value: "personName",
            },
            {
              label: "query.filter.jobTitle",
              value: "person.jobTitle",
            },
            {
              label: "query.filter.organizationName",
              value: "organization.legalName",
            },
            {
              label: "query.filter.college",
              value: "item.page.college",
            },
            {
              label: "item.page.department",
              value: "dc.relation.department",
            },

            {
              label: "query.filter.nationality",
              value: "person.nationality",
            },

            {
              label: "query.filter.birthPlace",
              value: "person.birthPlace",
            },
            {
              label: "query.filter.orcid",
              value: "person.identifier.orcid",
            },
            {
              label: "query.filter.all",
              value: "",
            },
          ];
          break;
        case this.filterFields === "Place":
          this.queryFilters = [
            // {
            //   label: 'query.filter.all',
            //   value: '',
            // },
            {
              label: "query.filter.placeName",
              value: "place.legalName",
            },
            // {
            //   label: 'query.filter.siteName',
            //   value: 'place.childLegalName',
            // },
            {
              label: "query.filter.addressCountry",
              value: "place.country",
            },
            {
              label: "query.filter.addressLocality",
              value: "place.city",
            },
            {
              label: "query.filter.slogan",
              value: "place.slogan",
            },

            {
              label: "query.filter.subject",
              value: "dc.subject",
            },
            {
              label: "query.filter.all",
              value: "",
            },
          ];
          break;
        case this.filterFields === "Site":
          this.queryFilters = [
            // {
            //   label: 'query.filter.all',
            //   value: '',
            // },
            {
              label: "query.filter.siteName",
              value: "place.legalName",
            },
            // {
            //   label: 'query.filter.placeName',
            //   value: 'place.legalName',
            // },
            {
              label: "query.filter.addressCountry",
              value: "place.country",
            },
            {
              label: "query.filter.addressLocality",
              value: "place.city",
            },
            {
              label: "query.filter.slogan",
              value: "place.slogan",
            },

            {
              label: "query.filter.subject",
              value: "dc.subject",
            },
            {
              label: "query.filter.all",
              value: "",
            },
          ];
          break;
        case this.filterFields === "OrgUnit":
          this.queryFilters = [
            // {
            //   label: 'query.filter.all',
            //   value: '',
            // },
            {
              label: "query.filter.organizationName",
              value: "organization.legalName",
            },
            // {
            //   label: 'query.filter.administrationName',
            //   value: 'organization.childLegalName',
            // },
            {
              label: "query.filter.addressCountry",
              value: "organization.address.addressCountry",
            },
            {
              label: "query.filter.addressLocality",
              value: "organization.address.addressLocality",
            },
            {
              label: "query.filter.ror",
              value: "organization.identifier.ror",
            },
            {
              label: "query.filter.all",
              value: "",
            },
          ];
          break;
        case this.filterFields === "Administration":
          this.queryFilters = [
            // {
            //   label: 'query.filter.all',
            //   value: '',
            // },
            {
              label: "query.filter.administrationName",
              value: "organization.legalName",
            },
            // {
            //   label: 'query.filter.organizationName',
            //   value: 'organization.legalName',
            // },

            {
              label: "query.filter.addressCountry",
              value: "organization.address.addressCountry",
            },
            {
              label: "query.filter.addressLocality",
              value: "organization.address.addressLocality",
            },
            {
              label: "query.filter.college",
              value: "dc.relation.college",
            },
            // {
            //   label: 'query.filter.specialization',
            //   value: 'dc.relation.specialization',
            // },
            {
              label: "query.filter.ror",
              value: "organization.identifier.ror",
            },
            {
              label: "query.filter.all",
              value: "",
            },
          ];
          break;
        case this.filterFields === "college":
          this.queryFilters = [
            // {
            //   label: 'query.filter.all',
            //   value: '',
            // },
            {
              label: "query.filter.collegeName",
              value: "organization.legalName",
            },
            // {
            //   label: 'query.filter.organizationName',
            //   value: 'organization.legalName',
            // },

            {
              label: "query.filter.addressCountry",
              value: "organization.address.addressCountry",
            },
            {
              label: "query.filter.addressLocality",
              value: "organization.address.addressLocality",
            },
            // {
            //   label: 'query.filter.college',
            //   value: 'dc.relation.college',
            // },
            // {
            //   label: 'query.filter.specialization',
            //   value: 'dc.relation.specialization',
            // },
            {
              label: "query.filter.ror",
              value: "organization.identifier.ror",
            },
            {
              label: "query.filter.all",
              value: "",
            },
          ];
          break;
        case this.filterFields === "department":
          this.queryFilters = [
            // {
            //   label: 'query.filter.all',
            //   value: '',
            // },
            {
              label: "query.filter.departmentName",
              value: "organization.legalName",
            },
            // {
            //   label: 'query.filter.organizationName',
            //   value: 'organization.legalName',
            // },

            {
              label: "query.filter.addressCountry",
              value: "organization.address.addressCountry",
            },
            {
              label: "query.filter.addressLocality",
              value: "organization.address.addressLocality",
            },
            {
              label: "query.filter.college",
              value: "dc.relation.college",
            },
            {
              label: "query.filter.specialization",
              value: "dc.relation.specialization",
            },
            {
              label: "query.filter.ror",
              value: "organization.identifier.ror",
            },
            {
              label: "query.filter.all",
              value: "",
            },
          ];
          break;
        case this.filterFields === "Era":
          this.queryFilters = [
            // {
            //   label: 'query.filter.all',
            //   value: '',
            // },
            {
              label: "query.filter.eraName",
              value: "era.title",
            },
            {
              label: "query.filter.century",
              value: "era.century",
            },
            {
              label: "query.filter.decade",
              value: "era.decade",
            },
            {
              label: "query.filter.personName",
              value: "dc.contributor.person",
            },

            {
              label: "query.filter.subject",
              value: "dc.subject",
            },
            {
              label: "query.filter.all",
              value: "",
            },
          ];
          break;
        case this.filterFields === "Event":
          this.queryFilters = [
            // {
            //   label: 'query.filter.all',
            //   value: '',
            // },
            {
              label: "query.filter.eventTitle",
              value: "event.title",
            },
            // {
            //   label: 'query.filter.activityTitle',
            //   value: 'event.childTitle',
            // },

            {
              label: "query.filter.subject",
              value: "dc.subject",
            },
            {
              label: "query.filter.all",
              value: "",
            },
          ];
          break;

        case this.filterFields === "Activity":
          this.queryFilters = [
            // {
            //   label: 'query.filter.all',
            //   value: '',
            // },
            {
              label: "query.filter.activityTitle",
              value: "event.title",
            },
            // {
            //   label: 'query.filter.eventTitle',
            //   value: 'event.title',
            // },

            {
              label: "query.filter.subject",
              value: "dc.subject",
            },
            {
              label: "query.filter.all",
              value: "",
            },
          ];
          break;

        case this.filterFields === "Series":
          this.queryFilters = [
            // {
            //   label: 'query.filter.all',
            //   value: '',
            // },
            {
              label: "query.filter.seriesTitle",
              value: "series.name",
            },
            {
              label: "query.filter.publisher",
              value: "dc.publisher",
            },
            {
              label: "query.filter.seriesType",
              value: "series.type",
            },

            {
              label: "query.filter.subject",
              value: "dc.subject",
            },
            {
              label: "query.filter.all",
              value: "",
            },
            // {
            //   label: 'query.filter.date',
            //   value: 'dc.date.issued',
            // },
          ];
          break;
        case this.filterFields === "Project":
          this.queryFilters = [
            // {
            //   label: 'query.filter.all',
            //   value: '',
            // },
            {
              label: "query.filter.projectName",
              value: "project.name",
            },
            {
              label: "query.filter.projectType",
              value: "project.type",
            },
            {
              label: "query.filter.fundType",
              value: "project.fund.type",
            },
            {
              label: "query.filter.funder",
              value: "project.funder.name",
            },
            {
              label: "query.filter.placeName",
              value: "place.legalName",
            },
            {
              label: "query.filter.organizationName",
              value: "organization.legalName",
            },

            {
              label: "query.filter.personName",
              value: "dc.contributor.author",
            },
            {
              label: "query.filter.subject",
              value: "dc.subject",
            },
            {
              label: "query.filter.all",
              value: "",
            },
            // {
            //   label: 'query.filter.date',
            //   value: 'dc.date.issued',
            // },
          ];
          break;
        case this.filterFields === "Series":
          this.queryFilters = [
            // {
            //   label: 'query.filter.all',
            //   value: '',
            // },
            {
              label: "query.filter.seriesTitle",
              value: "series.name",
            },
            {
              label: "query.filter.publisher",
              value: "dc.publisher",
            },
            {
              label: "query.filter.seriesType",
              value: "series.type",
            },

            {
              label: "query.filter.subject",
              value: "dc.subject",
            },
            {
              label: "query.filter.all",
              value: "",
            },
            // {
            //   label: 'query.filter.date',
            //   value: 'dc.date.issued',
            // },
          ];
          break;
        case this.filterFields === "Subject":
          this.queryFilters = [
            {
              label: "query.filter.subjectName",
              value: "subject.title",
            },
            {
              label: "query.filter.broaderSubject",
              value: "subject.broader",
            },
            {
              label: "query.filter.narrowerSubject",
              value: "subject.narrower",
            },

            {
              label: "query.filter.relatedSubject",
              value: "subject.related",
            },
            {
              label: "query.filter.subjectHeading",
              value: "subject.heading.name",
            },
                        {
              label: "query.filter.dewey",
              value: "dc.identifier.dewey",
            },
            {
              label: "query.filter.all",
              value: "",
            },
          ];
          break;
        case this.filterFields === "JournalIssue":
          this.queryFilters = [
            // {
            //   label: 'query.filter.all',
            //   value: '',
            // },
            {
              label: "query.filter.titleIssue",
              value: "dc.title",
            },
            {
              label: "query.filter.mainTitle",
              value: "publicationissue.title.theme",
            },
            {
              label: "query.filter.subject",
              value: "dc.subject",
            },

            {
              label: "query.filter.titleVolume",
              value: "journalvolume.title",
            },
            {
              label: "query.filter.titleJournal",
              value: "journal.title",
            },

            {
              label: "query.filter.issn",
              value: "creativeworkseries.issn",
            },
            {
              label: "query.filter.all",
              value: "",
            },
          ];
          break;
        case this.filterFields === "JournalVolume":
          this.queryFilters = [
            // {
            //   label: 'query.filter.all',
            //   value: '',
            // },
            {
              label: "query.filter.titleVolume",
              value: "dc.title",
            },
            {
              label: "query.filter.titleJournal",
              value: "journal.title",
            },

            {
              label: "query.filter.subject",
              value: "dc.subject",
            },

            {
              label: "query.filter.issn",
              value: "creativeworkseries.issn",
            },
            {
              label: "query.filter.all",
              value: "",
            },
            // {
            //   label: 'query.filter.datePublished',
            //   value: 'creativework.datePublished',
            // },
          ];
          break;
        case this.filterFields === "Journal":
          this.queryFilters = [
            // {
            //   label: 'query.filter.all',
            //   value: '',
            // },
            {
              label: "query.filter.titleJournal",
              value: "dc.title",
            },
            {
              label: "query.filter.publisher",
              value: "creativework.publisher",
            },
            {
              label: "query.filter.editor",
              value: "creativework.editor",
            },
            {
              label: "query.filter.generalSupervisor",
              value: "creativework.generalSupervisor",
            },
            {
              label: "query.filter.deputy",
              value: "creativework.deputy",
            },
            {
              label: "query.filter.editorialBoard",
              value: "creativework.editorialBoard",
            },
            {
              label: "query.filter.subject",
              value: "dc.subject",
            },

            {
              label: "query.filter.issn",
              value: "creativeworkseries.issn",
            },
            {
              label: "query.filter.all",
              value: "",
            },
            // {
            //   label: 'query.filter.datePublished',
            //   value: 'creativework.datePublished',
            // },
          ];
          break;
        case this.filterFields.includes("Manuscript"):
          this.queryFilters = [
            // {
            //   label: 'query.filter.all',
            //   value: '',
            // },
            {
              label: "query.filter.manuscriptTitle",
              value: "dc.title",
            },
            {
              label: "query.filter.author",
              value: "dc.contributor.author",
            },
            {
              label: "query.filter.publisher",
              value: "dc.publisher",
            },
            {
              label: "query.filter.copier",
              value: "dc.contributor.copier",
            },
            {
              label: "query.filter.subject",
              value: "dc.subject",
            },

            // {
            //   label: 'query.filter.holding',
            //   value: 'dc.relation.holding',
            // },

            {
              label: "query.filter.introduction",
              value: "dc.description.introduction",
            },

            {
              label: "query.filter.conclusion",
              value: "dc.description.conclusion",
            },

            {
              label: "query.filter.saveNumber",
              value: "dc.identifier.saveNumber",
            },
            {
              label: "query.filter.doi",
              value: "dc.identifier.doi",
            },
            {
              label: "query.filter.all",
              value: "",
            },
            // {
            //   label: 'query.filter.date',
            //   value: 'dc.date.issued',
            // },
            // {
            //   label: 'query.filter.copyDate',
            //   value: 'dc.date.copy',
            // },
          ];
          break;

        case this.filterFields.includes("Book"):
          this.queryFilters = [
            // {
            //   label: 'query.filter.all',
            //   value: '',
            // },
            {
              label: "query.filter.bookTitle",
              value: "dc.title",
            },
            {
              label: "query.filter.author",
              value: "dc.contributor.author",
            },
            {
              label: "query.filter.publisher",
              value: "dc.publisher",
            },
            {
              label: "query.filter.subject",
              value: "dc.subject",
            },

            {
              label: "query.filter.isbn",
              value: "dc.identifier.isbn",
            },

            {
              label: "query.filter.saveNumber",
              value: "dc.identifier.saveNumber",
            },
            {
              label: "query.filter.doi",
              value: "dc.identifier.doi",
            },
            {
              label: "query.filter.all",
              value: "",
            },
            // {
            //   label: 'query.filter.date',
            //   value: 'dc.date.issued',
            // },
          ];
          break;
        case this.filterFields.includes("Article"):
          this.queryFilters = [
            // {
            //   label: 'query.filter.all',
            //   value: '',
            // },
            {
              label: "query.filter.articleTitle",
              value: "dc.title",
            },
            {
              label: "query.filter.author",
              value: "dc.contributor.author",
            },
            {
              label: "query.filter.publisher",
              value: "dc.publisher",
            },
            {
              label: "query.filter.subject",
              value: "dc.subject",
            },

            {
              label: "query.filter.isbnArticle",
              value: "dc.identifier.isbn",
            },

            // {
            //   label: 'query.filter.saveNumber',
            //   value: 'dc.identifier.saveNumber',
            // },

            {
              label: "query.filter.doi",
              value: "dc.identifier.doi",
            },

            {
              label: "query.filter.all",
              value: "",
            },
            // {
            //   label: 'query.filter.date',
            //   value: 'dc.date.issued',
            // },
          ];
          break;
        case this.filterFields.includes("Dissertation"):
          this.queryFilters = [
            // {
            //   label: 'query.filter.all',
            //   value: '',
            // },
            {
              label: "query.filter.dissertationTitle",
              value: "dc.title",
            },
            {
              label: "query.filter.author",
              value: "dc.contributor.author",
            },
            {
              label: "query.filter.advisor",
              value: "dc.contributor.advisor",
            },
            {
              label: "query.filter.publisher",
              value: "dc.publisher",
            },
            {
              label: "query.filter.subject",
              value: "dc.subject",
            },
            {
              label: "query.filter.saveNumber",
              value: "dc.identifier.saveNumber",
            },
            {
              label: "query.filter.doi",
              value: "dc.identifier.doi",
            },
            {
              label: "query.filter.all",
              value: "",
            },
            // {
            //   label: 'query.filter.date',
            //   value: 'dc.date.issued',
            // },
          ];
          break;

        default:
          this.queryFilters = [
            {
              label: "query.filter.all",
              value: "",
            },
            {
              label: "query.filter.title",
              value: "dc.title",
            },
            {
              label: "query.filter.author",
              value: "dc.contributor.author",
            },
            {
              label: "query.filter.advisor",
              value: "dc.contributor.advisor",
            },
            {
              label: "query.filter.publisher",
              value: "dc.publisher",
            },
            {
              label: "query.filter.subject",
              value: "dc.subject",
            },

                        {
              label: "query.filter.dewey",
              value: "dc.identifier.dewey",
            },

            {
              label: "query.filter.holding",
              value: "dc.relation.holding",
            },
            {
              label: "query.filter.date",
              value: "dc.date.issued",
            },
          ];
      }
    } else if (this.isEntitySearch) {
      let value = this.route.snapshot.queryParams.value;
      switch (true) {
        case value === "Publication":
          this.queryFilters = [
            // {
            //   label: 'query.filter.all',
            //   value: '',
            // },
            {
              label: "query.filter.publicationTitle",
              value: "dc.title",
            },
            {
              label: "query.filter.author",
              value: "dc.contributor.author",
            },
            {
              label: "query.filter.advisor",
              value: "dc.contributor.advisor",
            },
            {
              label: "query.filter.publisher",
              value: "dc.publisher",
            },
            {
              label: "query.filter.subject",
              value: "dc.subject",
            },

            {
              label: "query.filter.holding",
              value: "dc.relation.holding",
            },
            {
              label: "query.filter.doi",
              value: "dc.identifier.doi",
            },
            {
              label: "query.filter.all",
              value: "",
            },
            // {
            //   label: 'query.filter.date',
            //   value: 'dc.date.issued',
            // },
          ];
          break;

        case value === "Group":
          this.queryFilters = [
            // {
            //   label: 'query.filter.all',
            //   value: '',
            // },
            {
              label: "query.filter.groupTitle",
              value: "dc.title.group",
            },
            {
              label: "query.filter.copier",
              value: "dc.contributor.copier",
            },

            {
              label: "query.filter.source",
              value: "dc.source",
            },
            {
              label: "query.filter.subject",
              value: "dc.subject",
            },

            {
              label: "query.filter.holding",
              value: "dc.relation.holding",
            },
            {
              label: "query.filter.organizationName",
              value: "organization.legalName",
            },
            {
              label: "query.filter.saveNumber",
              value: "dc.identifier.saveNumber",
            },

            {
              label: "query.filter.all",
              value: "",
            },
            // {
            //   label: 'query.filter.copyDate',
            //   value: 'dc.date.copy',
            // },
          ];
          break;
        case value === "Person":
          this.queryFilters = [
            // {
            //   label: 'query.filter.all',
            //   value: '',
            // },
            {
              label: "query.filter.personName",
              value: "personName",
            },
            {
              label: "query.filter.jobTitle",
              value: "person.jobTitle",
            },
            {
              label: "query.filter.organizationName",
              value: "organization.legalName",
            },
            {
              label: "query.filter.college",
              value: "item.page.college",
            },
            {
              label: "item.page.department",
              value: "dc.relation.department",
            },

            {
              label: "query.filter.nationality",
              value: "person.nationality",
            },

            {
              label: "query.filter.birthPlace",
              value: "person.birthPlace",
            },
            {
              label: "query.filter.orcid",
              value: "person.identifier.orcid",
            },
            {
              label: "query.filter.all",
              value: "",
            },
          ];
          break;
        case value === "Place":
          this.queryFilters = [
            // {
            //   label: 'query.filter.all',
            //   value: '',
            // },
            {
              label: "query.filter.placeName",
              value: "place.legalName",
            },
            {
              label: "query.filter.siteName",
              value: "place.childLegalName",
            },
            {
              label: "query.filter.addressCountry",
              value: "place.country",
            },
            {
              label: "query.filter.addressLocality",
              value: "place.city",
            },
            {
              label: "query.filter.slogan",
              value: "place.slogan",
            },

            {
              label: "query.filter.subject",
              value: "dc.subject",
            },
            {
              label: "query.filter.all",
              value: "",
            },
          ];
          break;
        case value === "Subject":
          this.queryFilters = [
            {
              label: "query.filter.subjectName",
              value: "subject.title",
            },
            {
              label: "query.filter.broaderSubject",
              value: "subject.broader",
            },
            {
              label: "query.filter.narrowerSubject",
              value: "subject.narrower",
            },

            {
              label: "query.filter.relatedSubject",
              value: "subject.related",
            },
            {
              label: "query.filter.subjectHeading",
              value: "subject.heading.name",
            },
            {
              label: "query.filter.dewey",
              value: "dc.identifier.dewey",
            },
            {
              label: "query.filter.all",
              value: "",
            },
          ];
          break;
        case value === "Site":
          this.queryFilters = [
            // {
            //   label: 'query.filter.all',
            //   value: '',
            // },
            {
              label: "query.filter.siteName",
              value: "place.childLegalName",
            },
            {
              label: "query.filter.placeName",
              value: "place.legalName",
            },
            {
              label: "query.filter.addressCountry",
              value: "place.country",
            },
            {
              label: "query.filter.addressLocality",
              value: "place.city",
            },
            {
              label: "query.filter.slogan",
              value: "place.slogan",
            },

            {
              label: "query.filter.subject",
              value: "dc.subject",
            },
            {
              label: "query.filter.all",
              value: "",
            },
          ];
          break;
        case value === "OrgUnit":
          this.queryFilters = [
            // {
            //   label: 'query.filter.all',
            //   value: '',
            // },
            {
              label: "query.filter.organizationName",
              value: "organization.legalName",
            },
            {
              label: "query.filter.administrationName",
              value: "organization.childLegalName",
            },
            {
              label: "query.filter.addressCountry",
              value: "organization.address.addressCountry",
            },
            {
              label: "query.filter.addressLocality",
              value: "organization.address.addressLocality",
            },
            {
              label: "query.filter.ror",
              value: "organization.identifier.ror",
            },
            {
              label: "query.filter.all",
              value: "",
            },
          ];
          break;
        case value === "Administration":
          this.queryFilters = [
            // {
            //   label: 'query.filter.all',
            //   value: '',
            // },
            {
              label: "query.filter.administrationName",
              value: "organization.childLegalName",
            },
            {
              label: "query.filter.organizationName",
              value: "organization.legalName",
            },

            {
              label: "query.filter.addressCountry",
              value: "organization.address.addressCountry",
            },
            {
              label: "query.filter.addressLocality",
              value: "organization.address.addressLocality",
            },
            {
              label: "query.filter.college",
              value: "dc.relation.college",
            },
            {
              label: "query.filter.specialization",
              value: "dc.relation.specialization",
            },
            {
              label: "query.filter.ror",
              value: "organization.identifier.ror",
            },
            {
              label: "query.filter.all",
              value: "",
            },
          ];
          break;
        case value === "Era":
          this.queryFilters = [
            // {
            //   label: 'query.filter.all',
            //   value: '',
            // },
            {
              label: "query.filter.eraName",
              value: "era.title",
            },
            {
              label: "query.filter.century",
              value: "era.century",
            },
            {
              label: "query.filter.decade",
              value: "era.decade",
            },
            {
              label: "query.filter.personName",
              value: "dc.contributor.person",
            },

            {
              label: "query.filter.subject",
              value: "dc.subject",
            },
            {
              label: "query.filter.all",
              value: "",
            },
          ];
          break;
        case value === "Event":
          this.queryFilters = [
            // {
            //   label: 'query.filter.all',
            //   value: '',
            // },
            {
              label: "query.filter.eventTitle",
              value: "event.title",
            },
            {
              label: "query.filter.activityTitle",
              value: "event.childTitle",
            },

            {
              label: "query.filter.subject",
              value: "dc.subject",
            },
            {
              label: "query.filter.all",
              value: "",
            },
          ];
          break;

        case value === "Activity":
          this.queryFilters = [
            // {
            //   label: 'query.filter.all',
            //   value: '',
            // },
            {
              label: "query.filter.activityTitle",
              value: "event.childTitle",
            },
            {
              label: "query.filter.eventTitle",
              value: "event.title",
            },

            {
              label: "query.filter.subject",
              value: "dc.subject",
            },
            {
              label: "query.filter.all",
              value: "",
            },
          ];
          break;

        case value === "Series":
          this.queryFilters = [
            // {
            //   label: 'query.filter.all',
            //   value: '',
            // },
            {
              label: "query.filter.seriesTitle",
              value: "series.name",
            },
            {
              label: "query.filter.publisher",
              value: "dc.publisher",
            },
            {
              label: "query.filter.seriesType",
              value: "series.type",
            },

            {
              label: "query.filter.subject",
              value: "dc.subject",
            },
            {
              label: "query.filter.all",
              value: "",
            },
            // {
            //   label: 'query.filter.date',
            //   value: 'dc.date.issued',
            // },
          ];
          break;
        case value === "Project":
          this.queryFilters = [
            // {
            //   label: 'query.filter.all',
            //   value: '',
            // },
            {
              label: "query.filter.projectName",
              value: "project.name",
            },
            {
              label: "query.filter.projectType",
              value: "project.type",
            },
            {
              label: "query.filter.fundType",
              value: "project.fund.type",
            },
            {
              label: "query.filter.funder",
              value: "project.funder.name",
            },
            {
              label: "query.filter.placeName",
              value: "place.legalName",
            },
            {
              label: "query.filter.organizationName",
              value: "organization.legalName",
            },

            {
              label: "query.filter.personName",
              value: "dc.contributor.author",
            },
            {
              label: "query.filter.subject",
              value: "dc.subject",
            },
            {
              label: "query.filter.all",
              value: "",
            },
            // {
            //   label: 'query.filter.date',
            //   value: 'dc.date.issued',
            // },
          ];
          break;
        case value === "Series":
          this.queryFilters = [
            // {
            //   label: 'query.filter.all',
            //   value: '',
            // },
            {
              label: "query.filter.seriesTitle",
              value: "series.name",
            },
            {
              label: "query.filter.publisher",
              value: "dc.publisher",
            },
            {
              label: "query.filter.seriesType",
              value: "series.type",
            },

            {
              label: "query.filter.subject",
              value: "dc.subject",
            },
            {
              label: "query.filter.all",
              value: "",
            },
            // {
            //   label: 'query.filter.date',
            //   value: 'dc.date.issued',
            // },
          ];
          break;
        case value === "JournalIssue":
          this.queryFilters = [
            // {
            //   label: 'query.filter.all',
            //   value: '',
            // },
            {
              label: "query.filter.titleIssue",
              value: "dc.title",
            },
            {
              label: "query.filter.mainTitle",
              value: "publicationissue.title.theme",
            },
            {
              label: "query.filter.subject",
              value: "dc.subject",
            },

            {
              label: "query.filter.titleVolume",
              value: "journalvolume.title",
            },
            {
              label: "query.filter.titleJournal",
              value: "journal.title",
            },

            {
              label: "query.filter.issn",
              value: "creativeworkseries.issn",
            },
            {
              label: "query.filter.all",
              value: "",
            },
          ];
          break;
        case value === "JournalVolume":
          this.queryFilters = [
            // {
            //   label: 'query.filter.all',
            //   value: '',
            // },
            {
              label: "query.filter.titleVolume",
              value: "dc.title",
            },
            {
              label: "query.filter.titleJournal",
              value: "journal.title",
            },

            {
              label: "query.filter.subject",
              value: "dc.subject",
            },

            {
              label: "query.filter.issn",
              value: "creativeworkseries.issn",
            },
            {
              label: "query.filter.all",
              value: "",
            },
            // {
            //   label: 'query.filter.datePublished',
            //   value: 'creativework.datePublished',
            // },
          ];
          break;
        case value === "Journal":
          this.queryFilters = [
            // {
            //   label: 'query.filter.all',
            //   value: '',
            // },
            {
              label: "query.filter.titleJournal",
              value: "dc.title",
            },
            {
              label: "query.filter.publisher",
              value: "creativework.publisher",
            },
            {
              label: "query.filter.editor",
              value: "creativework.editor",
            },
            {
              label: "query.filter.generalSupervisor",
              value: "creativework.generalSupervisor",
            },
            {
              label: "query.filter.deputy",
              value: "creativework.deputy",
            },
            {
              label: "query.filter.editorialBoard",
              value: "creativework.editorialBoard",
            },
            {
              label: "query.filter.subject",
              value: "dc.subject",
            },

            {
              label: "query.filter.issn",
              value: "creativeworkseries.issn",
            },
            {
              label: "query.filter.all",
              value: "",
            },
            // {
            //   label: 'query.filter.datePublished',
            //   value: 'creativework.datePublished',
            // },
          ];
          break;
        case value.includes("Manuscript"):
          this.queryFilters = [
            // {
            //   label: 'query.filter.all',
            //   value: '',
            // },
            {
              label: "query.filter.manuscriptTitle",
              value: "dc.title",
            },
            {
              label: "query.filter.author",
              value: "dc.contributor.author",
            },
            {
              label: "query.filter.publisher",
              value: "dc.publisher",
            },
            {
              label: "query.filter.copier",
              value: "dc.contributor.copier",
            },
            {
              label: "query.filter.subject",
              value: "dc.subject",
            },

            // {
            //   label: 'query.filter.holding',
            //   value: 'dc.relation.holding',
            // },

            {
              label: "query.filter.introduction",
              value: "dc.description.introduction",
            },

            {
              label: "query.filter.conclusion",
              value: "dc.description.conclusion",
            },

            {
              label: "query.filter.saveNumber",
              value: "dc.identifier.saveNumber",
            },
            {
              label: "query.filter.doi",
              value: "dc.identifier.doi",
            },
            {
              label: "query.filter.all",
              value: "",
            },
            // {
            //   label: 'query.filter.date',
            //   value: 'dc.date.issued',
            // },
            // {
            //   label: 'query.filter.copyDate',
            //   value: 'dc.date.copy',
            // },
          ];
          break;

        case value.includes("Book"):
          this.queryFilters = [
            // {
            //   label: 'query.filter.all',
            //   value: '',
            // },
            {
              label: "query.filter.bookTitle",
              value: "dc.title",
            },
            {
              label: "query.filter.author",
              value: "dc.contributor.author",
            },
            {
              label: "query.filter.publisher",
              value: "dc.publisher",
            },
            {
              label: "query.filter.subject",
              value: "dc.subject",
            },

            {
              label: "query.filter.isbn",
              value: "dc.identifier.isbn",
            },

            {
              label: "query.filter.saveNumber",
              value: "dc.identifier.saveNumber",
            },
            {
              label: "query.filter.doi",
              value: "dc.identifier.doi",
            },
            {
              label: "query.filter.all",
              value: "",
            },
            // {
            //   label: 'query.filter.date',
            //   value: 'dc.date.issued',
            // },
          ];
          break;
        case value.includes("Article"):
          this.queryFilters = [
            // {
            //   label: 'query.filter.all',
            //   value: '',
            // },
            {
              label: "query.filter.articleTitle",
              value: "dc.title",
            },
            {
              label: "query.filter.author",
              value: "dc.contributor.author",
            },
            {
              label: "query.filter.publisher",
              value: "dc.publisher",
            },
            {
              label: "query.filter.subject",
              value: "dc.subject",
            },

            {
              label: "query.filter.isbnArticle",
              value: "dc.identifier.isbn",
            },
            {
              label: "query.filter.doi",
              value: "dc.identifier.doi",
            },
            {
              label: "query.filter.all",
              value: "",
            },

            // {
            //   label: 'query.filter.saveNumber',
            //   value: 'dc.identifier.saveNumber',
            // },
            // {
            //   label: 'query.filter.date',
            //   value: 'dc.date.issued',
            // },
          ];
          break;
        case value.includes("Dissertation"):
          this.queryFilters = [
            // {
            //   label: 'query.filter.all',
            //   value: '',
            // },
            {
              label: "query.filter.dissertationTitle",
              value: "dc.title",
            },
            {
              label: "query.filter.author",
              value: "dc.contributor.author",
            },
            {
              label: "query.filter.advisor",
              value: "dc.contributor.advisor",
            },
            {
              label: "query.filter.publisher",
              value: "dc.publisher",
            },
            {
              label: "query.filter.subject",
              value: "dc.subject",
            },
            {
              label: "query.filter.saveNumber",
              value: "dc.identifier.saveNumber",
            },
            {
              label: "query.filter.doi",
              value: "dc.identifier.doi",
            },
            {
              label: "query.filter.all",
              value: "",
            },
            // {
            //   label: 'query.filter.date',
            //   value: 'dc.date.issued',
            // },
          ];
          break;

        default:
          this.queryFilters = [
            {
              label: "query.filter.all",
              value: "",
            },
            {
              label: "query.filter.title",
              value: "dc.title",
            },
            {
              label: "query.filter.author",
              value: "dc.contributor.author",
            },
            {
              label: "query.filter.advisor",
              value: "dc.contributor.advisor",
            },
            {
              label: "query.filter.publisher",
              value: "dc.publisher",
            },
            {
              label: "query.filter.subject",
              value: "dc.subject",
            },

            {
              label: "query.filter.holding",
              value: "dc.relation.holding",
            },
            {
              label: "query.filter.date",
              value: "dc.date.issued",
            },
          ];
      }
    } else {
      this.queryFilters = [
        {
          label: "query.filter.all",
          value: "",
        },
        {
          label: "query.filter.title",
          value: "dc.title",
        },
        {
          label: "query.filter.author",
          value: "dc.contributor.author",
        },
        {
          label: "query.filter.copier",
          value: "dc.contributor.copier",
        },
        {
          label: "query.filter.subject",
          value: "dc.subject",
        },

                    {
              label: "query.filter.dewey",
              value: "dc.identifier.dewey",
            },

        {
          label: "query.filter.holding",
          value: "dc.relation.holding",
        },
        {
          label: "query.filter.organizationName",
          value: "organization.legalName",
        },
        {
          label: "query.filter.personName",
          value: "personName",
        },
        {
          label: "query.filter.subjectName",
          value: "subject.title",
        },
        {
          label: "query.filter.projectName",
          value: "project.name",
        },
        // {
        //   label: 'query.filter.titleIssue',
        //   value: 'dc.title',
        // },
        // {
        //   label: 'query.filter.titleVolume',
        //   value: 'dc.title',
        // },
        {
          label: "query.filter.titleJournal",
          value: "journalTitle",
        },
        {
          label: "query.filter.placeName",
          value: "place.legalName",
        },
        {
          label: "query.filter.eventTitle",
          value: "event.title",
        },
        {
          label: "query.filter.eraName",
          value: "era.title",
        },
        {
          label: "query.filter.seriesTitle",
          value: "series.name",
        },
      ];
    }

    this.selectedFilter = this.queryFilters[0].value;
  }
}
