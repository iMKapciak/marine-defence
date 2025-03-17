export enum PlayerClass {
    HEAVY = 'HEAVY',
    LIGHT = 'LIGHT',
    ASSAULT = 'ASSAULT',
    ENGINEER = 'ENGINEER'
}

export interface PlayerData {
    id: string;
    name: string;
    class: PlayerClass;
    isReady: boolean;
    isHost?: boolean;
} 