import { Component, OnInit } from '@angular/core';
import { Meta, MetaDefinition, Title } from '@angular/platform-browser';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-contact-page',
  templateUrl: './contact-page.component.html',
  styleUrls: ['./contact-page.component.scss'],
  imports: [SharedModule],
})
export class ContactPageComponent implements OnInit {
  pageTitle = 'Contact page';

  metaInformation: MetaDefinition = {
    name: 'description',
    content: 'Contact page',
  };

  constructor(private metaTags: Meta, protected title: Title) {}

  ngOnInit(): void {
    this.metaTags.updateTag(this.metaInformation);
    this.title.setTitle(this.pageTitle);
  }
}
