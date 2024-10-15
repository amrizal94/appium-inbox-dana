const {remote} = require('webdriverio');

const capabilities = {
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': '58932bc5',
    // 'appium:appPackage': 'com.android.settings',
    // 'appium:appActivity': '.Settings',
    'appium:appPackage': 'id.dana',
    'appium:appActivity': '.onboarding.splash.DanaSplashActivity',
    'appium:noReset': true,
};

const wdOpts = {
    hostname: process.env.APPIUM_HOST || 'localhost',
    port: parseInt(process.env.APPIUM_PORT, 10) || 4723,
    logLevel: 'info',
    capabilities,
};

async function runTest() {
    const driver = await remote(wdOpts);
    // let allMessages = [];
    let data = [];
    let previousTime = ''; // Variabel untuk menyimpan waktu sebelumnya
    let lastCount = 0;
    try {
        const inboxItem = await driver.$('//android.widget.ImageView[@content-desc="btn-feeds"]');
        await inboxItem.click();
        while (true) {
            try {
                await driver.$('//android.widget.TextView[@resource-id="id.dana:id/tv_desc"]').waitForDisplayed({ timeout: 3000 });
            } catch (error) {
                console.log("Tidak ada elemen yang ditemukan atau tidak muncul dalam 3 detik");
            }

            const messages = await driver.$$('//*[@resource-id="id.dana:id/tv_desc"]'); // Ganti dengan resource-id atau XPath yang sesuai
            const times = await driver.$$('//*[@resource-id="id.dana:id/tv_date"]'); 
            // Loop melalui pesan dan simpan datanya
            // for (let message of messages) {
            //     const messageText = await message.getText();
            //     if (!allMessages.includes(messageText)) {
            //         allMessages.push(messageText);
            //     }
            // }

            // Loop untuk mengiterasi elemen times dan messages
            for (let i = 0; i < times.length; i++) {
                const timeText = await times[i].getText(); // Ambil teks waktu
                try {
                const messageText = await messages[i].getText(); // Ambil teks pesan

                // Jika waktu sekarang berbeda dengan waktu sebelumnya
                if (timeText !== previousTime) {
                    // Masukkan objek waktu dan pesan ke dalam array data
                    data.push({
                        time: timeText,
                        message: messageText
                    });
                    
                    // Update waktu sebelumnya
                    previousTime = timeText;
                }
                } catch (error) {
                    break;
                }
            }

            // Jika tidak ada elemen baru yang dimuat setelah scroll, hentikan loop
            if (lastCount == 3) {
                break;
            }
            // if (messages.length === lastCount) {
            //     break;
            // }

            // lastCount = messages.length;
            lastCount++;

            // Scroll ke bawah menggunakan UiScrollable
            await driver.$('android=new UiScrollable(new UiSelector().scrollable(true)).scrollForward()');
        }

        // Cetak semua pesan yang sudah diambil
        console.log("Semua pesan yang ditemukan:");
        console.log(data);
        await driver.back();
    } finally {
        await driver.pause(1000);
        await driver.deleteSession();
    }
}

runTest().catch(console.error);