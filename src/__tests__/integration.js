import puppeteer from "puppeteer";

describe("integration", () => {
  let browser;
  beforeAll(async () => {
    browser = await puppeteer.launch({ headless: false });
  });
  afterAll(async () => {
    await browser.close();
  });
  test("goes thru flow", async () => {
    const page = await browser.newPage();
    await page.goto("http://localhost:3000/");

    for (const { select, option } of [
      {
        select: "select",
        option: "select option:nth-child(2)",
      },
      {
        select: "select:nth-child(2)",
        option: "select:nth-child(2) option:nth-child(2)",
      },
      {
        select: "select:nth-child(3)",
        option: "select:nth-child(3) option:nth-child(2)",
      },
    ]) {
      await page.waitForSelector(select);
      await page.click(select);
      const id = await page.$eval(option, (e) => e.value);
      await page.select(select, id);
      await page.click(select);
    }

    await page.waitForSelector("#map");
    const handle = await page.$("#map");
    expect(handle).not.toBeNull();
  });
});
