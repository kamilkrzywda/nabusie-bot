import type { VehicleState, JobType, StateType, TripState } from './types';
import { BASE_URL, HEADERS, MIN_VEHICLE_CONDITION } from './main';

export class NabusieService {
    private state: StateType | null = null;

    constructor(headers: Record<string, string>, baseUrl: string, minVehicleCondition: number) {
        return this;
    }

    fetchState = async (): Promise<StateType> => {
        try {
            const res = await fetch(`${BASE_URL}/state`, { headers: HEADERS });
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
            const res = await fetch(`${BASE_URL}/jobs`, { headers: HEADERS });
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
            const res = await fetch(`${BASE_URL}/jobs/queue`, {
                method: 'POST',
                headers: HEADERS,
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
        return this.state.trips.filter(trip => trip.vehicleId === vehicle.id) || [];
    }

    isVehicleAvailableForJob = (vehicle: VehicleState, job: JobType): boolean => {
        if (!this.state) {
            console.error('State is not fetched yet. Cannot check vehicle availability.');
            return false;
        }
        const trips = this.getVehicleTrips(vehicle);
        if (
            vehicle.type.capacity >= job.demand
            && (
                (vehicle.status === 'IDLE') ||
                (trips.length > 0 && trips[0]?.jobId === null)
            )
        ) {
            return true;
        }
        return false;
    }

    removeVehicleFromState = (vehicleId: string) => {
        if (!this.state) {
            console.error('State is not fetched yet. Cannot remove vehicle from state.');
            return;
        }
        this.state.vehicles = this.state.vehicles.filter(v => v.id !== vehicleId);
    }

    getJob = async (job: JobType) => {
        await new Promise(resolve => setTimeout(resolve, 100));
        if (!this.state) {
            console.error('State is not fetched yet. Cannot get job.');
            return;
        }
        for (const vehicle of this.state.vehicles.sort((a, b) => a.type.capacity - b.type.capacity)) {
            if (!vehicle.type) {
                console.error(`Vehicle ${vehicle.id} has no type. Skipping.`);
            }
            if (vehicle.condition < MIN_VEHICLE_CONDITION) {
                this.removeVehicleFromState(vehicle.id);
                console.log(`Vehicle ${vehicle.id} condition is too low (${vehicle.condition}). Skipping.`);
            }
            if (this.isVehicleAvailableForJob(vehicle, job)) {
                const res = await this.takeJob(job.id, vehicle.id);
                if (res && res.ok) {
                    const response = await res.json() as any;
                    if (
                        response.warning &&
                        (
                            response.warning.marginMs < 0 ||
                            response.warning.lateMs > 0 ||
                            response.warning.tight
                        )
                    ) {
                        console.log('Warning - we would be late for this job. Skipping.');
                    } else if (response.warning) {
                        console.log(`Warning - skipping job due to warning in response.`, response.warning);
                    } else {
                        console.log(`Successfully took job ${job.originName}-${job.destName} with vehicle ${vehicle.type.name} - ${vehicle.id}`);
                        this.removeVehicleFromState(vehicle.id);
                        return;
                    }
                } else if (res && [403, 409].includes(res.status)) {
                    const response = await res.json() as any;
                    console.log(`Job ${job.id} -`, response.error ?? '');
                    return;
                } else if (res && !res.ok) {
                    console.error(`response not ok, returning: ${res.status} ${res.statusText} ${await res.text()}`);
                } else {
                    console.log('.');
                }
            }
        };
    }
}