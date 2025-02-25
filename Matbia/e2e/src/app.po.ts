import { browser, by, element } from 'protractor';

export class AppPage {
  async navigateTo(): Promise<unknown> {
    return browser.get(browser.baseUrl);
  }

  async getTitleText(): Promise<string> {
    return element(
      by.css(
        'app-root app-layout div.header-section.header-home nav ul.sign-link li.nav-item a.nav-link.btn.btn-primary',
      ),
    ).getText();
  }
}
