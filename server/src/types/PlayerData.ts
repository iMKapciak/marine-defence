export enum PlayerClass {
    HEAVY = 'HEAVY',
    LIGHT = 'LIGHT',
    ASSAULT = 'ASSAULT',
    ENGINEER = 'ENGINEER'
}

export interface PlayerAttributes {
    damagePerShot: number;
    fireRate: number;
    movementSpeed: number;
    shieldAmount: number;
}

export interface PlayerLevelData {
    currentLevel: number;
    experiencePoints: number;
    attributes: PlayerAttributes;
    availableAttributePoints: number;
}

export interface PlayerData {
    id: string;
    name: string;
    class: PlayerClass;
    isReady: boolean;
    isHost?: boolean;
    levelData: PlayerLevelData;
}

// Default attribute values based on class
export const DEFAULT_ATTRIBUTES: Record<PlayerClass, PlayerAttributes> = {
    [PlayerClass.HEAVY]: {
        damagePerShot: 15,
        fireRate: 0.8,
        movementSpeed: 4,
        shieldAmount: 100
    },
    [PlayerClass.LIGHT]: {
        damagePerShot: 8,
        fireRate: 1.5,
        movementSpeed: 7,
        shieldAmount: 50
    },
    [PlayerClass.ASSAULT]: {
        damagePerShot: 20,
        fireRate: 0.7,
        movementSpeed: 5,
        shieldAmount: 75
    },
    [PlayerClass.ENGINEER]: {
        damagePerShot: 10,
        fireRate: 1.2,
        movementSpeed: 6,
        shieldAmount: 60
    }
};

// Attribute scaling configuration
export const ATTRIBUTE_SCALING = {
    damagePerShot: {
        base: 10,
        max: 100,
        perPoint: 2
    },
    fireRate: {
        base: 1.0,
        max: 5.0,
        perPoint: 0.2
    },
    movementSpeed: {
        base: 5,
        max: 15,
        perPoint: 0.5
    },
    shieldAmount: {
        base: 50,
        max: 200,
        perPoint: 10
    }
}; 