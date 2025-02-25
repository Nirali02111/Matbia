import { Component, OnInit } from '@angular/core';
import { Meta, MetaDefinition, Title } from '@angular/platform-browser';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-program-policies-for-users',
  templateUrl: './program-policies-for-users.component.html',
  styleUrls: ['./program-policies-for-users.component.scss'],
  imports: [SharedModule],
})
export class ProgramPoliciesForUsersComponent implements OnInit {
  pageTitle = 'Program policies for users';

  metaInformation: MetaDefinition = {
    name: 'description',
    content: 'Program policies for users',
  };

  constructor(private metaTags: Meta, protected title: Title) {}

  ngOnInit(): void {
    this.metaTags.updateTag(this.metaInformation);
    this.title.setTitle(this.pageTitle);
  }
}
