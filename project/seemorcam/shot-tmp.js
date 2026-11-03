const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 500, height: 900 }, deviceScaleFactor: 2 });
  await page.goto('file:///d:/Tool/kiro%20project/project/design/jiangnengfa-liveview.html');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'd:/Tool/kiro project/project/design/_preview_jiangnengfa.png' });
  await browser.close();
})();
