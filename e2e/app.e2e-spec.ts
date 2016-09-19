import { HttpAppPage } from './app.po';

describe('http-app App', function() {
  let page: HttpAppPage;

  beforeEach(() => {
    page = new HttpAppPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
