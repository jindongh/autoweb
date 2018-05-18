const puppeteer = require('puppeteer');
const user = require('./servicenow.json');

(async () => {
	const browser = await puppeteer.launch();

	const page = await browser.newPage();
	// open developer page, navigate to Login url
	await page.goto('https://developer.servicenow.com/app.do#!/home');
	var navigationPromise = page.waitForNavigation();
	await page.waitForSelector('#dp-hdr-login-link');
	console.log('stage 1: found login link');
	await page.click('#dp-hdr-login-link')
	await navigationPromise;
	await page.waitForNavigation();

	// enter username & password, click Login
	console.log('stage 2: enter login page');
	await page.type('#username', user.username);
	await page.type('#password', user.password);
	navigationPromise = page.waitForNavigation();
	await page.click('#submitButton');
	await navigationPromise;
	await page.waitForNavigation();

	// dashboard -> instance page
	console.log('stage 2: enter dashboard');
	await page.waitForSelector('#dp-hdr-userinfo-link');
	await page.goto('https://developer.servicenow.com/app.do#!/instance');

	async function refreshStatus() {
		await page.waitForSelector('#refresh_status', {'visible': true});
		await page.click('#refresh_status');
	}
	async function wakeup() {
		await page.waitForSelector('#instanceWakeUpBtn', {'visible': true});
		await page.click('#instanceWakeUpBtn');
	}
	// wake up
	console.log('stage 3: enter instance page');
	try {
		console.log('stage 3: refresh status');
		await refreshStatus();
	} catch (e) {
		console.log('stage 3: failed to refresh status, try to wake up');
		console.log(e);
		await wakeup();
	}

	console.log(await page.content());
	await page.screenshot({path: 'screenshot.png'});

	await browser.close();
})();
