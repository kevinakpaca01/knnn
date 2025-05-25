const express = require("express");
const puppeteer = require("puppeteer");
const app = express();
app.use(express.json());

app.post("/extract-job", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).send("Missing URL");

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    const job = await page.evaluate(() => {
      return {
        title: document.querySelector("h1")?.innerText || "No title found",
        description: document.body.innerText || "No content extracted"
      };
    });

    await browser.close();
    res.json(job);
  } catch (err) {
    res.status(500).send("Error extracting job content: " + err.message);
  }
});

app.listen(8080, () => console.log("Server running on port 8080"));
