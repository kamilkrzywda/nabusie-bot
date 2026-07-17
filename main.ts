import { NabusieService } from './nabusie.service';
import * as dotenv from 'dotenv';

dotenv.config();

export const BASE_URL = 'https://nabusie.pl/api';
export const HEADERS = { Cookie: `busiarz_session=${process.env.COOKIE}` };
export const MAX_GARAGE_DISTANCE = process.env.MAX_GARAGE_DISTANCE ? parseInt(process.env.MAX_GARAGE_DISTANCE) : 50; // km
export const MAX_JOB_DISTANCE = process.env.MAX_JOB_DISTANCE ? parseInt(process.env.MAX_JOB_DISTANCE) : 50_000; // meters
export const MIN_JOB_TIME = process.env.MIN_JOB_TIME ? parseInt(process.env.MIN_JOB_TIME) : 300; // seconds
export const MIN_VEHICLE_CONDITION = process.env.MIN_VEHICLE_CONDITION ? parseFloat(process.env.MIN_VEHICLE_CONDITION) : 0.5; // percent

class NabusieBOT {
  main = async () => {
    const service = new NabusieService(HEADERS, BASE_URL, MIN_VEHICLE_CONDITION);
    try {
      const jobs = await service.fetchJobs();
      await service.fetchState();
      for (const job of jobs.sort((a, b) => b.payout - a.payout)) {
        if (job.status !== 'OPEN') {
          console.log(`Job ${job.id} is not open. Skipping.`);
        } else if (job.durationS < MIN_JOB_TIME) {
          console.log(`Job ${job.id} is too short (${job.durationS}s). Skipping.`);
        } else if (job.nearestGarageKm > MAX_GARAGE_DISTANCE) {
          console.log(`Job ${job.id} is too far away (${job.nearestGarageKm}km). Skipping.`);
        } else if (job.distanceM > MAX_JOB_DISTANCE) {
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
