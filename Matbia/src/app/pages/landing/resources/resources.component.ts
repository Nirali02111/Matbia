import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-resources',
  templateUrl: './resources.component.html',
  styleUrls: ['./resources.component.scss'],
  imports: [SharedModule],
})
export class ResourcesComponent implements OnInit {
  constructor(protected title: Title) {}

  ngOnInit(): void {
    this.title.setTitle('Resources');
  }
}
