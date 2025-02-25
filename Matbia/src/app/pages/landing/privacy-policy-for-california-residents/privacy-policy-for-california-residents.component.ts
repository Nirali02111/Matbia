import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Meta, MetaDefinition, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-privacy-policy-for-california-residents',
  templateUrl: './privacy-policy-for-california-residents.component.html',
  styleUrls: ['./privacy-policy-for-california-residents.component.scss'],
  imports: [SharedModule],
})
export class PrivacyPolicyForCaliforniaResidentsComponent implements OnInit, AfterViewInit {
  @ViewChild('ccpaTitle') ccpaTitle!: ElementRef;

  pageTitle = 'CCPA - Matbia Privacy Policy for California Residents';

  metaInformation: MetaDefinition = {
    name: 'description',
    content: 'Matbia Privacy Policy for California Residents',
  };

  constructor(private metaTags: Meta, protected title: Title, private router: Router) {}

  ngOnInit(): void {
    this.metaTags.updateTag(this.metaInformation);
    this.title.setTitle(this.pageTitle);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 150);
  }

  scrollTo(el: HTMLElement) {
    el.scrollIntoView();
  }
}
