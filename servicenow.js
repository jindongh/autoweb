const puppeteer = require('puppeteer');
const config = require('./servicenow.json');

(async () => {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();

	console.log('stage 0: check instance');
	await page.goto(config.instanceUrl);
	await page.screenshot({path: 'home.png'});
	navigationPromise = page.waitForNavigation();
	for (let iframe of page.mainFrame().childFrames()) {
		console.log('stage 0: try to find login button');
		await iframe.waitForSelector('#user_name');
		await iframe.type('#user_name', config.instanceUsername);
		await iframe.type('#user_password', config.instancePassword);
		await iframe.click('#sysverb_login');
	}
	console.log('stage 0: instance opened, stay for 20 minutes');
	await navigationPromise;
	function sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
	await sleep(20 * 60 * 1000);
	console.log('stage 0: wakeup from sleep');
	await page.screenshot({path: 'instance.png'});

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
	await page.type('#username', config.username);
	await page.type('#password', config.password);
	navigationPromise = page.waitForNavigation();
	await page.click('#submitButton');
	await navigationPromise;
	await page.waitForNavigation();

	// dashboard -> instance page
	console.log('stage 2: enter dashboard');
	await page.waitForSelector('#dp-hdr-userinfo-link');
	await page.goto('https://developer.servicenow.com/app.do#!/instance');

	async function extendInstance() {
		await page.waitForSelector('#dp-instance-extend-button', {'visible': true});
		await page.click('#dp-instance-extend-button');
	}
	async function wakeup() {
		await page.waitForSelector('#instanceWakeUpBtn', {'visible': true});
		await page.click('#instanceWakeUpBtn');
	}
	// wake up
	console.log('stage 3: enter instance page');
	try {
		console.log('stage 3: wakeup');
		await wakeup();
	} catch (e) {
		console.log(e);
		console.log('stage 3: failed to wakeup, try to refresh');
		try {
			await extendInstance();
			console.log('stage 3: instance extended');
		} catch(e) {
			console.log(e);
			console.log('stage 3: instance not extended');
		}
	}
	console.log('stage 4: succeed.');

	await page.screenshot({path: 'wakeup.png'});

	await browser.close();
})();
