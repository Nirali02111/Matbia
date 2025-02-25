import { Component, OnInit } from '@angular/core';
import { Meta, MetaDefinition, Title } from '@angular/platform-browser';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-donor-guide',
  templateUrl: './donor-guide.component.html',
  styleUrls: ['./donor-guide.component.scss'],
  imports: [SharedModule],
})
export class DonorGuideComponent implements OnInit {
  pageTitle = 'Donor guide';
  metaInformation: MetaDefinition = {
    name: 'description',
    content: 'Donor guide',
  };

  constructor(private metaTags: Meta, protected title: Title) {}

  ngOnInit(): void {
    this.metaTags.updateTag(this.metaInformation);
    this.title.setTitle(this.pageTitle);
  }
}
