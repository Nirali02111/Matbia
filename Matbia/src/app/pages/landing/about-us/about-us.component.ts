import { Component, OnInit } from '@angular/core';
import { Meta, MetaDefinition, Title } from '@angular/platform-browser';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.scss'],
  imports: [SharedModule],
})
export class AboutUsComponent implements OnInit {
  pageTitle = 'About us';

  metaInformation: MetaDefinition = {
    name: 'description',
    content: 'About us',
  };

  constructor(private metaTags: Meta, protected title: Title) {}

  ngOnInit(): void {
    this.metaTags.updateTag(this.metaInformation);
    this.title.setTitle(this.pageTitle);
  }
}
