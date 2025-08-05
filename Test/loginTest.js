const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { expect } = require('chai');

describe('Login Page Selenium Test', function () {
  this.timeout(80000); // Increase timeout for setup + test

  let driver;

  before(async function () {
    try {
      const options = new chrome.Options();
      options.addArguments('--start-maximized');
      driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
    } catch (err) {
      console.error('Error initializing WebDriver:', err);
      throw err;
    }
  });

  after(async function () {
    if (driver) await driver.quit();
  });

  it('should login successfully and navigate to home page', async function () {
    await driver.get('http://localhost:3000/login');

    const emailInput = await driver.findElement(By.id('email'));
    await emailInput.sendKeys('test@example.com');

    const passwordInput = await driver.findElement(By.id('password'));
    await passwordInput.sendKeys('test123');

    const loginButton = await driver.findElement(By.css('button[type="submit"]'));
    await loginButton.click();

    // Wait for navigation to /
    await driver.wait(until.urlIs('http://localhost:3000/'), 10000);

    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).to.equal('http://localhost:3000/');
  });
});
