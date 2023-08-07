export interface Competition {
  [year: string]: CompetitionData[];
}

export interface CompetitionData {
  id: string;
  name: string;
  dates: string[];
  timestamp: string;
}
