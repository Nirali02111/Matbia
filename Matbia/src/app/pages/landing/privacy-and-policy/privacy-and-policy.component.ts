import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Meta, MetaDefinition, Title } from '@angular/platform-browser';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-privacy-and-policy',
  templateUrl: './privacy-and-policy.component.html',
  styleUrls: ['./privacy-and-policy.component.scss'],
  imports: [SharedModule],
})
export class PrivacyAndPolicyComponent implements OnInit, AfterViewInit {
  pageTitle = 'Privacy and Policy';
  metaInformation: MetaDefinition = {
    name: 'description',
    content: 'Privacy and Policy',
  };

  constructor(private metaTags: Meta, protected title: Title) {}

  ngOnInit(): void {
    this.metaTags.updateTag(this.metaInformation);
    this.title.setTitle(this.pageTitle);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 150);
  }
}
