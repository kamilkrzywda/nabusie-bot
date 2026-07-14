
export interface VehicleType {
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

export interface JobType {
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

export interface VehicleTypeTemplate {
  key: string;
  name: string;
  kind: string;
  price: number;
  capacity: number;
  speedFactor: number;
  fuelPerKm: number;
  upkeepPerTick: number;
}

export interface VehicleQueueJob {
  id: string;
  jobId: string;
  originName: string;
  destName: string;
  payout: number;
  kind: string;
  subtype: string | null;
  urgency: 'EXPRESS' | 'STANDARD' | string;
  originLat: number;
  originLng: number;
  destLat: number;
  destLng: number;
  distanceM: number;
  durationS: number;
  deadline: string;
  isTender: boolean;
}

export interface VehicleState {
  id: string;
  ownerId: string;
  garageId: string;
  homeGarageId: string;
  typeKey: string;
  status: 'IDLE' | 'EN_ROUTE' | 'ON_TRIP' | 'MAINTENANCE' | string;
  stayAfterTrip: boolean;
  nickname: string | null;
  condition: number;
  odometerKm: number;
  startOdometerKm: number;
  lat: number;
  lng: number;
  purchasedAt: string | null;
  scoutFee: number | null;
  scoutCooldownUntil: string | null;
  nightDispatchAt: string | null;
  tenderDispatchAt: string | null;
  leaseId: string | null;
  type: VehicleTypeTemplate;
  queue: VehicleQueueJob[];
  sellValue: number;
  marketValue: number;
  repairCost: number;
}

export interface GarageState {
  id: string;
  ownerId: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
  level: number;
  spec: string;
  routeLengthPref: 'SHORT' | 'MEDIUM' | 'LONG' | string;
  jobsEnabled: boolean;
  investedUpgrades: number;
  sortIndex: number;
  createdAt: string;
}

export interface PlayerState {
  login: string;
  isAdmin: boolean;
  supportVisible: boolean;
  money: number;
  reputation: number;
  repProgress: number;
  level: number;
  xp: number;
  levelXpFloor: number;
  levelXpNext: number;
  tripsDone: number;
  isPremium: boolean;
  premiumUntil: string;
  allowSpeeding: boolean;
  blockHoldingInvites: boolean;
  autoRepairEnabled: boolean;
  autoRepairThreshold: number;
  seenHelp: boolean;
  mutedNicks: string[];
  holdingId: string;
  holdingTag: string;
}

export interface JobInfo {
  originName: string;
  destName: string;
  payout: number;
  penalty: number;
  kind: string;
  demand: number;
  subtype: string | null;
  urgency: 'EXPRESS' | 'STANDARD' | 'NIGHT' | string;
  special: boolean;
  originLat: number;
  originLng: number;
  destLat: number;
  destLng: number;
  nightContract: boolean;
}

export interface TripState {
  id: string;
  vehicleId: string;
  jobId: string | null;
  playerId: string;
  routeGeometry: string;
  startedAt: string;
  endsAt: string;
  durationMs: number;
  arriveDeadline: string | null;
  isReturn: boolean;
  repairOnArrival: boolean;
  repairStationId: string | null;
  avgSpeedKmh: number;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED' | string;
  completedAt: string | null;
  fuelCost: number;
  failReason: string | null;
  incidentType: string;
  incidentAtFrac: number;
  incidentDelayMs: number;
  incidentCost: number;
  sped: boolean;
  speedingFine: number;
  scoutedAt: string | null;
  scoutFee: number | null;
  job: JobInfo | null;
}

export interface FinanceState {
  obligationsPerMin: number;
  hasInsurance: boolean;
  insuranceTier: string;
  activeLoans: number;
  defaultedLoans: number;
  activeLeases: number;
}

export interface NightConvoyState {
  vehicles: number;
}

export interface StockBannerState {
  title: string;
  body: string;
}

export interface SeasonIntroState {
  season: number;
}

export interface AdsState {
  client: string | null;
  show: boolean;
}

export interface JobType {
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

export interface StateType {
  tenderRoute: unknown;
  player: PlayerState;
  garages: GarageState[];
  vehicles: VehicleState[];
  trips: TripState[];
  recent: unknown[];
  activeEvents: unknown[];
  finance: FinanceState;
  timeMultiplier: number;
  serverNow: number;
  ads: AdsState;
  activePoll: unknown;
  nightConvoy: NightConvoyState;
  countdown: unknown;
  pinnedMessage: unknown;
  stockBanner: StockBannerState;
  seasonIntro: SeasonIntroState;
  pollMs: number;
}
