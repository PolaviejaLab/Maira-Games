/** @module Alien **/
"use strict";


/**
 * Returns whether a given sprite should be slippery
 *
 * @param {number} sprite - ID of sprite
 * @returns {boolean} True if slippery, false if not
 */
function isSlippery(sprite)
{
	return (sprite >= 0x0120 && sprite <= 0x012F) ||	// Snow
			   (sprite >= 0x0130 && sprite <= 0x013F);		// Planet
}


/**
 * Returns whether a sprite is an enemy
 *
 * @param {number} sprite - ID of sprite
 * @returns {boolean} True if enemy, false if not
 */
function isEnemy(sprite)
{
	return sprite >= 0x0A00 && sprite <= 0x0B00;
}


var constructors = {
	'enemy': function(array) {
		var enemy = new Enemy();
		enemy.fromArray(array);
		return enemy;
	},

	'player': function(array) {
		var player = new Player();
		player.fromArray(array);
		return player;
	},

	'bomb': function(array) {
		var bomb = new Bomb();
		bomb.fromArray(array);
		return bomb;
	},

	'rock': function(array) {
		var rock = new Rock();
		rock.fromArray(array);
		return rock;
	},

	'worm': function(array) {
		var worm = new Worm();
		worm.fromArray(array);
		return worm;
	},

	'frog': function(array) {
		var frog = new Frog();
		frog.fromArray(array);
		return frog;
	},

	'snail': function(array) {
		var snail = new Snail();
		snail.fromArray(array);
		return snail;
	}
};


var spriteTable = [
	{key: 0x0001, src: 'clipping', collision: true},
	{key: 0x0002, src: 'sara/idle/r/1', collision: false, type: 'player'},

	{key: 0x0010, src: 'sara/idle_left',  frames: 3, toolbox: false},
	{key: 0x0011, src: 'sara/idle_right', frames: 3, toolbox: false},
	{key: 0x0012, src: 'sara/walk_left',  frames: 3, toolbox: false},
	{key: 0x0013, src: 'sara/walk_right', frames: 3, toolbox: false},
	{key: 0x0014, src: 'sara/jump_left',  frames: 3, toolbox: false},
	{key: 0x0015, src: 'sara/jump_right', frames: 3, toolbox: false},

	/* Grass */
	{key: 0x0101, src: 'grass/grassLeft', collision: true},
	{key: 0x0102, src: 'grass/grassMid', collision: true},
	{key: 0x0103, src: 'grass/grassRight', collision: true},
	{key: 0x0104, src: 'grass/grassCenter', collision: true},
	{key: 0x0105, src: 'grass/grassCliff_left', collision: true},
	{key: 0x0106, src: 'grass/grassCliff_right', collision: true},
	{key: 0x0107, src: 'grass/grassCliffAlt_left', collision: true},
	{key: 0x0108, src: 'grass/grassCliffAlt_right', collision: true},
	{key: 0x0109, src: 'grass/grassCorner_left', collision: true},
	{key: 0x010A, src: 'grass/grassCorner_right', collision: true},
	{key: 0x010B, src: 'grass/grassHill_left', collision: 'hillUp'},
	{key: 0x010C, src: 'grass/grassHill_right', collision: 'hillDown'},
	{key: 0x010D, src: 'grass/grassHalf', collision: 'topHalf'},
	{key: 0x010E, src: 'grass/grassHalf_left', collision: 'topHalf'},
	{key: 0x010F, src: 'grass/grassHalf_mid', collision: 'topHalf'},
	{key: 0x0110, src: 'grass/grassHalf_right', collision: 'topHalf'},


	/* Snow */
	{key: 0x0120, src: 'snow/snowLeft', collision: true},
	{key: 0x0121, src: 'snow/snowMid', collision: true},
	{key: 0x0122, src: 'snow/snowRight', collision: true},
	{key: 0x0123, src: 'snow/snowCenter', collision: true},
	{key: 0x0124, src: 'snow/snowCliff_left', collision: true},
	{key: 0x0125, src: 'snow/snowCliff_right', collision: true},
	{key: 0x0126, src: 'snow/snowCliffAlt_left', collision: true},
	{key: 0x0127, src: 'snow/snowCliffAlt_right', collision: true},
	{key: 0x0128, src: 'snow/snowCorner_left', collision: true},
	{key: 0x0129, src: 'snow/snowCorner_right', collision: true},
	{key: 0x012A, src: 'snow/snowHill_left', collision: 'hillUp'},
	{key: 0x012B, src: 'snow/snowHill_right', collision: 'hillDown'},
	{key: 0x012C, src: 'snow/snowHalf', collision: 'topHalf'},
	{key: 0x012D, src: 'snow/snowHalf_left', collision: 'topHalf'},
	{key: 0x012E, src: 'snow/snowHalf_mid', collision: 'topHalf'},
	{key: 0x012F, src: 'snow/snowHalf_right', collision: 'topHalf'},

	/* Planet */
	{key: 0x0130, src: 'planet/planetLeft', collision: true},
	{key: 0x0131, src: 'planet/planetMid', collision: true},
	{key: 0x0132, src: 'planet/planetRight', collision: true},
	{key: 0x0133, src: 'planet/planetCenter', collision: true},
	{key: 0x0134, src: 'planet/planetCliff_left', collision: true},
	{key: 0x0135, src: 'planet/planetCliff_right', collision: true},
	{key: 0x0136, src: 'planet/planetCliffAlt_left', collision: true},
	{key: 0x0137, src: 'planet/planetCliffAlt_right', collision: true},
	{key: 0x0138, src: 'planet/planetCorner_left', collision: true},
	{key: 0x0139, src: 'planet/planetCorner_right', collision: true},
	{key: 0x013A, src: 'planet/planetHill_left', collision: 'hillUp'},
	{key: 0x013B, src: 'planet/planetHill_right', collision: 'hillDown'},
	{key: 0x013C, src: 'planet/planetHalf', collision: 'topHalf'},
	{key: 0x013D, src: 'planet/planetHalf_left', collision: 'topHalf'},
	{key: 0x013E, src: 'planet/planetHalf_mid', collision: 'topHalf'},
	{key: 0x013F, src: 'planet/planetHalf_right', collision: 'topHalf'},


	/* Sand */
	{key: 0x0140, src: 'sand/sandLeft', collision: true},
	{key: 0x0141, src: 'sand/sandMid', collision: true},
	{key: 0x0142, src: 'sand/sandRight', collision: true},
	{key: 0x0143, src: 'sand/sandCenter', collision: true},
	{key: 0x0144, src: 'sand/sandCliffLeft', collision: true},
	{key: 0x0145, src: 'sand/sandCliffRight', collision: true},
	{key: 0x0146, src: 'sand/sandCliffLeftAlt', collision: true},
	{key: 0x0147, src: 'sand/sandCliffRightAlt', collision: true},
	{key: 0x0148, src: 'sand/sandHillLeft2', collision: true},
	{key: 0x0149, src: 'sand/sandHillRight2', collision: true},
	{key: 0x014A, src: 'sand/sandHillLeft', collision: 'hillUp'},
	{key: 0x014B, src: 'sand/sandHillRight', collision: 'hillDown'},
	{key: 0x014C, src: 'sand/sandHalf', collision: 'topHalf'},
	{key: 0x014D, src: 'sand/sandHalfLeft', collision: 'topHalf'},
	{key: 0x014E, src: 'sand/sandHalfMid', collision: 'topHalf'},
	{key: 0x014F, src: 'sand/sandHalfRight', collision: 'topHalf'},

	{key: 0x0115, src: 'sand/sand_liquid', collision: 'water'},
	{key: 0x0114, src: 'metalCenter', collision: true},

	{key: 0x0204, src: 'water/no_waves2_top', frames: 7, collision: 'water'},
	{key: 0x0206, src: 'water/no_waves2_body', frames: 7, collision: 'waterBody'},

	{key: 0x0201, src: 'water/normal_waves2_top', frames: 6, collision: 'water'},
	{key: 0x0202, src: 'water/normal_waves2_body', frames: 6, collision: 'waterBody'},

	{key: 0x0203, src: 'water/big_waves2_top', frames: 3, collision: 'water'},
	{key: 0x0205, src: 'water/big_waves2_body', frames: 3, collision: 'waterBody'},

	{key: 0x0301, src: 'plant', collision: false},
	{key: 0x0302, src: 'pineSapling', collision: false},
	{key: 0x0303, src: 'pineSaplingAlt', collision: false},
	{key: 0x0304, src: 'cactus', collision: false},

	{key: 0x0401, src: 'spikes', collision: 'water'},
	{key: 0x0402, src: 'doorOpen', collision: 'Door'},
	{key: 0x0403, src: 'doorOpenTop', collision: false},

	{key: 0x0404, src: 'springboardDown', collision: 'boardDown'},
	{key: 0x0405, src: 'springboardUp', collision: 'boardUp'},


	{key: 0x0504, src: 'signRight', collision: false},
	{key: 0x0505, src: 'signExit', collision: 'exit'},

	{key: 0x0601, src: 'cloud1-left', collision: true},
	{key: 0x0602, src: 'cloud1-right', collision: true},

	{key: 0x0701, src: 'bomb', collision: true, type: 'bomb'},
	{key: 0x0702, src: 'rock', collision: true, type: 'rock'},
	{key: 0x0703, src: 'weight', collision: true},
	{key: 0x0704, src: 'switchRight', collision: false},
	{key: 0x0705, src: 'switchMid', collision: false},
	{key: 0x0706, src: 'switchLeft', collision: false},

	{key: 0x0901, src: 'numbers/1', collision: true},
	{key: 0x0902, src: 'numbers/2', collision: true},
	{key: 0x0903, src: 'numbers/3', collision: true},
	{key: 0x0904, src: 'numbers/4', collision: true},
	{key: 0x0905, src: 'numbers/5', collision: true},

	{key: 0x0A00, src: 'fly/fly', frames: 2, collision: 'Fly', type: 'enemy'},

	{key: 0x0A01, src: 'fly/fly_dead', collision: true, toolbox: false},

	{key: 0x0A03, src: 'bee/bee', frames: 2, collision: 'Bee', type: 'enemy'},
	{key: 0x0A04, src: 'bee/bee_dead', collision: true, toolbox: false},

	{key: 0x0A06, src: 'bat/bat', frames: 2, collision: 'Bat', type: 'enemy'},
	{key: 0x0A07, src: 'bat/bat_dead', collision: true, toolbox: false},
	{key: 0x0A08, src: 'bat/bat_hang', collision: true, toolbox: false},

	{key: 0x0A0A, src: 'bug/ladybug', collision: true, type: 'enemy'},
	{key: 0x0A0B, src: 'bug/ladybug_move', collision: true, toolbox: false},
	{key: 0x0A0C, src: 'bug/ladybug_fly', collision: true, toolbox: false},

	{key: 0x0A0E, src: 'worm/wormGreen', frames: 2, collision: true, type: 'worm'},
	{key: 0x0A0F, src: 'worm/wormGreen_dead', collision: true, toolbox: false},

	{key: 0x0A10, src: 'slime/snakeSlime', collision: true, toolbox: false},
	{key: 0x0A11, src: 'slime/snakeSlime_ani', collision: true, toolbox: false},
	{key: 0x0A12, src: 'slime/snakeSlime_dead', collision: true, toolbox: false},

	{key: 0x0A1A, src: 'frog/frog', collision: true, type: 'frog'},
	{key: 0x0A1B, src: 'frog/frog_move', collision: true, toolbox: false},
	{key: 0x0A1C, src: 'frog/frog_dead', collision: true, toolbox: false},

	{key: 0x0A20, src: 'snail/snail', frames: 2, collision: true, type: 'snail'},
	//{key: 0x0A21, src: 'snail/snail', frames: 2, collision: true, type: 'snail'},
];
