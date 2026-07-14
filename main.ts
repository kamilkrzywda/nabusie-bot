import { NabusieService } from './nabusie.service';
import * as dotenv from 'dotenv';

dotenv.config();

const BASE_URL = 'https://nabusie.pl/api';
const headers = { Cookie: `busiarz_session=${process.env.COOKIE}` };
const maxGarageDistance = process.env.MAX_GARAGE_DISTANCE ? parseInt(process.env.MAX_GARAGE_DISTANCE) : 50; // km
const maxJobDistance = process.env.MAX_JOB_DISTANCE ? parseInt(process.env.MAX_JOB_DISTANCE) : 50_000; // meters
const minJobTime = process.env.MIN_JOB_TIME ? parseInt(process.env.MIN_JOB_TIME) : 300; // seconds

class NabusieBOT {
  main = async () => {
    const service = new NabusieService(headers, BASE_URL);
    try {
      const jobs = await service.fetchJobs();
      await service.fetchState();
      for (const job of jobs.sort((a, b) => b.payout - a.payout)) {
        if (job.status !== 'OPEN') {
          console.log(`Job ${job.id} is not open. Skipping.`);
        } else if (job.durationS < minJobTime) {
          console.log(`Job ${job.id} is too short (${job.durationS}s). Skipping.`);
        } else if (job.nearestGarageKm > maxGarageDistance) {
          console.log(`Job ${job.id} is too far away (${job.nearestGarageKm}km). Skipping.`);
        } else if (job.distanceM > maxJobDistance) {
          console.log(`Job ${job.id} is too long (${job.distanceM / 1000}km). Skipping.`);
        } else {
          await service.getJob(job);
        }
      }
    } catch (error) {
      console.error('Error in main function:', error);
    }
    const wait = Math.floor(Math.random() * 5_000) + 5_000;
    console.log(`Waiting ${wait / 1000} seconds before next loop...`);
    setTimeout(this.main, wait);
  }
}

const nabusieBOT = new NabusieBOT();
nabusieBOT.main();
