import { Component, OnInit } from '@angular/core';
import { Meta, MetaDefinition, Title } from '@angular/platform-browser';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-legal-page',
  templateUrl: './legal-page.component.html',
  styleUrls: ['./legal-page.component.scss'],
  imports: [SharedModule],
})
export class LegalPageComponent implements OnInit {
  pageTitle = 'Legal';

  metaInformation: MetaDefinition = {
    name: 'description',
    content: 'Legal',
  };
  constructor(private metaTags: Meta, protected title: Title) {}

  ngOnInit(): void {
    this.metaTags.updateTag(this.metaInformation);
    this.title.setTitle(this.pageTitle);
  }
}
