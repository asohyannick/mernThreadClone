import cron from 'cron';
import https from 'https';
import { StatusCodes } from 'http-status-codes';
const URL = 'https://threads-clone-9if3.onrender.com';
const job = new cron.CronJob('*/14 * * * * ', function() {
    https .get(URL, (res) => {
        if(res.statusCode === StatusCodes.OK) {
            console.log('GET request sent successfully!');
        } else {
            console.log('Get request failed', res.statusCode);
        }
    })
    .on('error', (e) => {
        console.log('Error while sending request', e)
    });
});

export default job;
