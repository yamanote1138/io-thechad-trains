// Simple script to test the app and capture console logs
import puppeteer from 'puppeteer';

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Capture console messages
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    console.log(`[BROWSER ${type.toUpperCase()}]:`, text);
  });

  // Capture page errors
  page.on('pageerror', error => {
    console.error('[BROWSER ERROR]:', error.message);
  });

  // Navigate to the app
  console.log('Navigating to http://localhost:5173...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });

  // Wait a bit for the app to initialize
  await page.waitForTimeout(2000);

  console.log('\n=== PAGE LOADED ===\n');

  // Try to click the power button
  console.log('Looking for power button...');
  const powerButton = await page.$('button.btn-lg');

  if (powerButton) {
    console.log('Found power button, clicking...');
    await powerButton.click();

    // Wait to see the result
    await page.waitForTimeout(2000);
  } else {
    console.log('Power button not found!');
  }

  console.log('\n=== TEST COMPLETE ===\n');

  await browser.close();
})();
