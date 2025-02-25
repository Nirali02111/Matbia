import { Component, OnInit } from '@angular/core';
import { Meta, MetaDefinition, Title } from '@angular/platform-browser';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-non-profits',
  templateUrl: './non-profits.component.html',
  styleUrls: ['./non-profits.component.scss'],
  imports: [SharedModule],
})
export class NonProfitsComponent implements OnInit {
  pageTitle = 'Non profits';
  metaInformation: MetaDefinition = {
    name: 'description',
    content: 'non profits',
  };

  constructor(private metaTags: Meta, protected title: Title) {}

  ngOnInit(): void {
    this.metaTags.updateTag(this.metaInformation);
    this.title.setTitle(this.pageTitle);
  }
}
