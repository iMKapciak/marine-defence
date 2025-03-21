import { PlayerData, PlayerAttributes, PlayerLevelData, DEFAULT_ATTRIBUTES, ATTRIBUTE_SCALING } from '../types/PlayerData';

export class LevelingService {
    private static readonly XP_PER_LEVEL = [
        0,    // Level 1
        100,  // Level 2
        250,  // Level 3
        450,  // Level 4
        700,  // Level 5
        1000, // Level 6
        1400, // Level 7
        1900, // Level 8
        2500, // Level 9
        3200  // Level 10
    ];

    public static initializePlayerLevelData(player: PlayerData): PlayerData {
        const defaultAttributes = DEFAULT_ATTRIBUTES[player.class];
        
        player.levelData = {
            currentLevel: 1,
            experiencePoints: 0,
            attributes: { ...defaultAttributes },
            availableAttributePoints: 0
        };

        return player;
    }

    public static addExperience(player: PlayerData, xpAmount: number): PlayerData {
        player.levelData.experiencePoints += xpAmount;
        
        // Check for level up
        const nextLevel = player.levelData.currentLevel + 1;
        if (nextLevel <= LevelingService.XP_PER_LEVEL.length && 
            player.levelData.experiencePoints >= LevelingService.XP_PER_LEVEL[nextLevel - 1]) {
            return this.levelUp(player);
        }

        return player;
    }

    public static levelUp(player: PlayerData): PlayerData {
        player.levelData.currentLevel++;
        player.levelData.availableAttributePoints++;
        return player;
    }

    public static upgradeAttribute(
        player: PlayerData, 
        attribute: keyof PlayerAttributes, 
        amount: number = 1
    ): PlayerData {
        if (player.levelData.availableAttributePoints < amount) {
            throw new Error('Not enough attribute points available');
        }

        const scaling = ATTRIBUTE_SCALING[attribute];
        const currentValue = player.levelData.attributes[attribute];
        const newValue = currentValue + (scaling.perPoint * amount);

        if (newValue > scaling.max) {
            throw new Error(`Cannot exceed maximum value for ${attribute}`);
        }

        player.levelData.attributes[attribute] = newValue;
        player.levelData.availableAttributePoints -= amount;

        return player;
    }

    public static getExperienceForNextLevel(player: PlayerData): number {
        const nextLevel = player.levelData.currentLevel + 1;
        if (nextLevel <= LevelingService.XP_PER_LEVEL.length) {
            return LevelingService.XP_PER_LEVEL[nextLevel - 1];
        }
        return Infinity;
    }

    public static getExperienceProgress(player: PlayerData): number {
        const currentLevelXP = LevelingService.XP_PER_LEVEL[player.levelData.currentLevel - 1] || 0;
        const nextLevelXP = LevelingService.getExperienceForNextLevel(player);
        const currentXP = player.levelData.experiencePoints;
        
        return (currentXP - currentLevelXP) / (nextLevelXP - currentLevelXP);
    }
} 