interface VehicleTypeTemplate {
  capacity: number;
  fuelPerKm: number;
  key: string;
  kind: string;
  name: string;
  price: number;
  speedFactor: number;
  upkeepPerTick: number;
}

interface VehicleType {
  id: string;
  ownerId: string;
  garageId: string;
  homeGarageId: string;
  typeKey: 'bus_mid' | 'bus_long' | 'bus_short' | string;
  status: 'IDLE' | 'ON_TRIP' | 'MAINTENANCE' | string;
  stayAfterTrip: boolean;
  nickname: string;
  condition: number;
  odometerKm: number;
  startOdometerKm: number;
  lat: number;
  lng: number;
  purchasedAt: string | null;
  nightDispatchAt: string | null;
  leaseId: string | null;
  type: VehicleTypeTemplate;
  garage: unknown;
  sellValue: number;
}

interface JobType {
  id: string;
  kind: 'PASSENGER' | 'FREIGHT' | string;
  originLat: number;
  originLng: number;
  originName: string;
  destLat: number;
  destLng: number;
  destName: string;
  distanceM: number;
  durationS: number;
  payout: number;
  demand: number;
  reputationRequired: number;
  subtype: string | null;
  urgency: 'EXPRESS' | 'STANDARD' | 'NIGHT' | string;
  levelRequired: number;
  special: boolean;
  penalty: number;
  status: 'OPEN' | 'TAKEN' | 'COMPLETED' | 'EXPIRED' | string;
  expiresAt: string;
  deadline: string;
  takenByPlayerId: string | null;
  scoutedByPlayerId: string | null;
  nightContract: boolean;
  createdAt: string;
  nearestGarageKm: number;
}


const COOKIE = 'eyJhbGciOiJIUzI1NiJ9.eyJ1aWQiOiJjbXIwYW14NG8wMHJ2bngzNHVvYTZhbXdkIiwiaWF0IjoxNzgyODAyNTk4LCJleHAiOjE3ODUzOTQ1OTh9.5uMXu5sifmdYLr8jFxjFOh-Dzy5WwqKKYx4NIByi2es';

const BASE_URL = 'https://nabusie.pl/api';

const headers = { Cookie: `busiarz_session=${COOKIE}` };


class NabusieBOT {
  vehicles: VehicleType[] = [];

  fetchJobs = async (): Promise<JobType[]> => {
    const res = await fetch(`${BASE_URL}/jobs`, { headers });
    const jobs = (await res.json()) as { jobs: JobType[] };
    console.log(`Fetched ${jobs.jobs.length} jobs.`);
    return jobs.jobs;
  }

  fetchVehicles = async (): Promise<VehicleType[]> => {
    const res = await fetch(`${BASE_URL}/vehicles`, { headers });
    const vehicles = (await res.json()) as { vehicles: VehicleType[] };
    console.log(`Fetched ${vehicles.vehicles.length} vehicles.`);
    return vehicles.vehicles;
  }

  takeJob = async (jobId: string, vehicleId: string) => {
    try {
      const res = await fetch(`${BASE_URL}/jobs/queue`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobId, vehicleId, force: false }),
      });
      return res;
    } catch (error) {
      return false;
    }
  }

  getJob = async (job: JobType) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    for (const vehicle of this.vehicles.sort((a, b) => a.type.capacity - b.type.capacity)) {
      if(vehicle.type.capacity >= job.demand && vehicle.status === 'IDLE') {
        const res = await this.takeJob(job.id, vehicle.id);
        if (res && res.ok) {
          const response = await res.text() as any;
          if(response.includes('warning')) {
            console.log('Warning - skipping job due to warning in response.');
          }else {
            console.log(`Successfully took job ${job.originName}-${job.destName} with vehicle ${vehicle.type.name} - ${vehicle.id}`);
            this.vehicles = this.vehicles.filter(v => v.id !== vehicle.id);
            return;
          }
        } else if (res && res.status === 409) {
          console.log(`Job ${job.id} is already taken.`);
          return;
        } else if (res && res.status === 403) {
          console.log(`Job ${job.id} is not available - too low reputation.`);
          return;
        } else if (res && !res.ok) {
          console.error(`response not ok, returning: ${res.status} ${res.statusText} ${await res.text()}`);
          return;
        } else {
          console.log('.');
        }
      }
    };
  }

  main = async () => {
    try {
      const jobs = await this.fetchJobs();
      this.vehicles = await this.fetchVehicles();
      for (const job of jobs.sort((a, b) => b.payout - a.payout)) {
        if (job.status !== 'OPEN') {
          console.log(`Job ${job.id} is not open. Skipping.`);
        } else if ( job.durationS < 250) {
          console.log(`Job ${job.id} is too short (${job.durationS}s). Skipping.`);
        } else if ( job.nearestGarageKm > 28) {
          console.log(`Job ${job.id} is too far away (${job.nearestGarageKm}km). Skipping.`);
        } else if ( job.distanceM > 50_000) {
          console.log(`Job ${job.id} is too long (${job.distanceM/1000}km). Skipping.`);
        } else {
          await this.getJob(job);
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
