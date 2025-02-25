import { Component, OnInit } from '@angular/core';
import { Meta, MetaDefinition, Title } from '@angular/platform-browser';
import { LocalStorageDataService } from '@commons/local-storage-data.service';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-site-map',
  templateUrl: './site-map.component.html',
  styleUrls: ['./site-map.component.scss'],
  imports: [SharedModule],
})
export class SiteMapComponent implements OnInit {
  pageTitle = 'Site map';

  metaInformation: MetaDefinition = {
    name: 'description',
    content: 'site map',
  };

  constructor(
    private metaTags: Meta,
    protected title: Title,
    private localStorageDataService: LocalStorageDataService
  ) {}

  ngOnInit(): void {
    this.metaTags.updateTag(this.metaInformation);
    this.title.setTitle(this.pageTitle);
  }

  isLoggedIn() {
    return this.localStorageDataService.isLoggedIn();
  }
}
