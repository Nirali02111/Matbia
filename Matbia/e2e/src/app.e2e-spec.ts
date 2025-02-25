import { browser, logging, element, by } from 'protractor';

describe('workspace-project App', () => {
  beforeAll(() => browser.get(''));

  function getPageElts() {
    return {
      loginNavButton: element(
        by.css(
          'app-root app-layout div.header-section.header-home nav ul.sign-link li.nav-item a.nav-link.btn.btn-primary',
        ),
      ),

      startWithMatbiaLink: element(
        by.css(
          'app-root app-layout app-home #main-banner > div > div.caption-text > div.buttons-group > a.btn.btn-primary.btn-active-card',
        ),
      ),

      activateCardLink: element(
        by.css(
          'app-root app-layout app-home #main-banner > div > div.caption-text > div.buttons-group > a.btn.btn-secondary.btn-active-card',
        ),
      ),

      requestCardLink: element(
        by.css(
          'app-root app-layout app-home #main-banner > div > div.caption-text > div.buttons-group > a.btn.btn-secondary.btn-request-card',
        ),
      ),
    };
  }

  it('has title', async () => {
    expect(await browser.getTitle()).toEqual('Matbia');
  });

  it('Login Button visible', async () => {
    expect(await getPageElts().loginNavButton.isPresent()).toBeTruthy();

    it('Login Button content', async () => {
      expect(await getPageElts().loginNavButton.getTitle()).toEqual('login/signup');
    });
  });

  it('Start with visible visible', async () => {
    expect(await getPageElts().startWithMatbiaLink.isPresent()).toBeTruthy();

    it('Start with visible visible content', async () => {
      expect(await getPageElts().startWithMatbiaLink.getTitle()).toEqual('Start with matbia now');
    });
  });

  it('Activated card link will be hide on banner without ShulKiosk parameter', async () => {
    expect(await getPageElts().activateCardLink.isPresent()).toBeFalsy();
  });

  it('Request card link will be hide on banner without ShulKiosk parameter', async () => {
    expect(await getPageElts().requestCardLink.isPresent()).toBeFalsy();
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(
      jasmine.objectContaining({
        level: logging.Level.SEVERE,
      } as logging.Entry),
    );
  });
});
