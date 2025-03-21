import { LevelingService } from '../services/LevelingService';
import { PlayerData, PlayerClass } from '../types/PlayerData';

describe('LevelingService', () => {
    let testPlayer: PlayerData;

    beforeEach(() => {
        testPlayer = {
            id: 'test-id',
            name: 'Test Player',
            class: PlayerClass.ASSAULT,
            isReady: false,
            levelData: {
                currentLevel: 1,
                experiencePoints: 0,
                attributes: {
                    damagePerShot: 20,
                    fireRate: 0.7,
                    movementSpeed: 5,
                    shieldAmount: 75
                },
                availableAttributePoints: 0
            }
        };
    });

    test('should initialize player with correct default attributes', () => {
        const newPlayer: Omit<PlayerData, 'levelData'> = {
            id: 'new-player',
            name: 'New Player',
            class: PlayerClass.HEAVY,
            isReady: false
        };
        
        const player = LevelingService.initializePlayerLevelData(newPlayer as PlayerData);

        expect(player.levelData.currentLevel).toBe(1);
        expect(player.levelData.experiencePoints).toBe(0);
        expect(player.levelData.availableAttributePoints).toBe(0);
        expect(player.levelData.attributes.damagePerShot).toBe(15);
        expect(player.levelData.attributes.fireRate).toBe(0.8);
        expect(player.levelData.attributes.movementSpeed).toBe(4);
        expect(player.levelData.attributes.shieldAmount).toBe(100);
    });

    test('should add experience points correctly', () => {
        const updatedPlayer = LevelingService.addExperience(testPlayer, 50);
        expect(updatedPlayer.levelData.experiencePoints).toBe(50);
    });

    test('should level up when enough experience is gained', () => {
        const updatedPlayer = LevelingService.addExperience(testPlayer, 100);
        expect(updatedPlayer.levelData.currentLevel).toBe(2);
        expect(updatedPlayer.levelData.availableAttributePoints).toBe(1);
    });

    test('should upgrade attribute correctly', () => {
        testPlayer.levelData.availableAttributePoints = 1;
        const updatedPlayer = LevelingService.upgradeAttribute(testPlayer, 'damagePerShot');
        
        expect(updatedPlayer.levelData.attributes.damagePerShot).toBe(22); // 20 + 2
        expect(updatedPlayer.levelData.availableAttributePoints).toBe(0);
    });

    test('should not allow attribute upgrade without available points', () => {
        expect(() => {
            LevelingService.upgradeAttribute(testPlayer, 'damagePerShot');
        }).toThrow('Not enough attribute points available');
    });

    test('should not allow attribute to exceed maximum value', () => {
        testPlayer.levelData.availableAttributePoints = 100;
        testPlayer.levelData.attributes.damagePerShot = 98;
        
        expect(() => {
            LevelingService.upgradeAttribute(testPlayer, 'damagePerShot', 2);
        }).toThrow('Cannot exceed maximum value for damagePerShot');
    });

    test('should calculate experience progress correctly', () => {
        const progress = LevelingService.getExperienceProgress(testPlayer);
        expect(progress).toBe(0);

        const playerWithXP = LevelingService.addExperience(testPlayer, 50);
        const progressWithXP = LevelingService.getExperienceProgress(playerWithXP);
        expect(progressWithXP).toBe(0.5);
    });

    test('should handle multiple level ups correctly', () => {
        let player = LevelingService.addExperience(testPlayer, 100); // Level 2
        player = LevelingService.addExperience(player, 150); // Level 3
        
        expect(player.levelData.currentLevel).toBe(3);
        expect(player.levelData.availableAttributePoints).toBe(2);
    });
}); 