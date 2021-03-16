const puppeteer = require('puppeteer');

class NotePlayer {

    screenShot() {
        (async () => {
            const browser = await puppeteer.launch({ headless: false });
            //const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.goto('http://localhost/player.html');
            await page.mouse.down({ button: 'left' });
            //await page.screenshot({path: 'screenshot.png',fullPage: true});

            //await browser.close();
        })();
    }
}

module.exports = NotePlayer;
