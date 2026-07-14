import type { VehicleState, JobType, StateType, TripState } from './types';

export class NabusieService {
    private readonly baseUrl: string;
    private readonly headers: Record<string, string>;
    private state: StateType | null = null;

    constructor(headers: Record<string, string>, baseUrl: string) {
        this.headers = headers;
        this.baseUrl = baseUrl;
        return this;
    }

    fetchState = async (): Promise<StateType> => {
        try {
            const res = await fetch(`${this.baseUrl}/state`, { headers: this.headers });
            const state = (await res.json()) as StateType;
            this.state = state;
            return state;
        } catch (error) {
            console.error('Error fetching state:', error);
            return {} as StateType;
        }
    }

    fetchJobs = async (): Promise<JobType[]> => {
        try {
            const res = await fetch(`${this.baseUrl}/jobs`, { headers: this.headers });
            const jobs = (await res.json()) as { jobs: JobType[] };
            console.log(`Fetched ${jobs.jobs.length} jobs.`);
            return jobs.jobs;
        } catch (error) {
            console.error('Error fetching jobs:', error);
            return [];
        }
    }

    takeJob = async (jobId: string, vehicleId: string) => {
        try {
            const res = await fetch(`${this.baseUrl}/jobs/queue`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify({ jobId, vehicleId, force: false }),
            });
            return res;
        } catch (error) {
            return false;
        }
    }

    getVehicleTrips = (vehicle: VehicleState): TripState[] => {
        if (!this.state) {
            console.error('State is not fetched yet. Cannot get vehicle trips.');
            return [];
        }
        const trips = this.state.trips.filter(trip => trip.vehicleId === vehicle.id);
        return trips;
    }

    ifVehicleAvailable = (job: JobType): boolean => {
        if (!this.state) {
            console.error('State is not fetched yet. Cannot check vehicle availability.');
            return false;
        }
        for (const vehicle of this.state.vehicles) {
            if (
                vehicle.type.capacity >= job.demand
                && (
                    (vehicle.status === 'IDLE')
                    || this.getVehicleTrips(vehicle)[0]?.jobId === null
                )
            ) {
                return true;
            }
        }
        return false;
    }

    getJob = async (job: JobType) => {
        await new Promise(resolve => setTimeout(resolve, 100));
        if (!this.state) {
            console.error('State is not fetched yet. Cannot get job.');
            return;
        }
        for (const vehicle of this.state.vehicles.sort((a, b) => a.type.capacity - b.type.capacity)) {
            if (!vehicle.type) {
                return console.error(`Vehicle ${vehicle.id} has no type. Skipping.`);
            }
            if (this.ifVehicleAvailable(job)) {
                const res = await this.takeJob(job.id, vehicle.id);
                if (res && res.ok) {
                    const response = await res.text() as any;
                    if (response.includes('warning')) {
                        console.log('Warning - skipping job due to warning in response.');
                    } else {
                        console.log(`Successfully took job ${job.originName}-${job.destName} with vehicle ${vehicle.type.name} - ${vehicle.id}`);
                        this.state.vehicles = this.state.vehicles.filter(v => v.id !== vehicle.id);
                        return;
                    }
                } else if (res && [403, 409].includes(res.status)) {
                    console.log(`Job ${job.id} - .`, await (res.json() as any)?.error ?? '');
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
}