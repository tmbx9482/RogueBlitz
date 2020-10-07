//you're getting Phaser from the cdn

//used to test collision boundaries
import debugDraw from "../utils/debug.js";

//import animations stored in separate files
import { createGoblinAnims, createOgreAnims, createDemonAnims, 
    createDemonSmallAnims, 
    createNecromancerAnims} from "../anims/enemyAnims.js";
import { createPlayerAnims } from "../anims/playerAnims.js";

//import enemies
import Goblin from "../enemies/goblin.js";
import Ogre from "../enemies/ogre.js";
import Demon from "../enemies/demon.js";
import demonSmall from "../enemies/demonSmall.js";
import Necromancer from "../enemies/necromancer.js";


//import Player
import "../player/class/playerClass.js";

//events
import { sceneEvents } from "../events/eventCenter.js";
import { eventNames } from "../events/eventNames.js";

export default class Game extends Phaser.Scene {
    constructor() {
        super("game");
        //player character
        this.knight = undefined;
        //arrow keys and space bar get stored in here
        this.cursors = undefined;
        //store refernce to the collider so it can be deleted when player dies
        this.playerEnemyCollisionArray = [];
    }

    preload() {
        //set the arrow keys and space bar to the cursor
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    create() {
        //add health bar
        this.scene.run('game-ui');

        //add animations
        createPlayerAnims(this.anims);
        createGoblinAnims(this.anims);
        createOgreAnims(this.anims);
        createDemonAnims(this.anims);
        createDemonSmallAnims(this.anims);
        createNecromancerAnims(this.anims);

        const map = this.make.tilemap({key: 'dungeon'});
        //extra numbers are because tileset was "extruded" tile-extruder too make them fit together better
        const tileset = map.addTilesetImage("dungeonPack", 'tiles', 16, 16, 1, 2);

        
        //create the floor
        //not storing the Floor layer in a variable, since it won't need to do anything
        map.createStaticLayer("Floor", tileset);
        //store walls in layer to give them properties
        const wallsLayer = map.createStaticLayer("Walls", tileset);
        
        //give walls collision
        wallsLayer.setCollisionByProperty({collides: true});

        //FOR DEBUGGING
        //debugDraw.debugDraw(wallsLayer, this);
        
        //add the knight
        this.knight = this.add.player(this.scene, 200, 200, "knight");
        
        //set camera area
        this.cameras.main.setBounds(0, 0, 800, 560);
        //have it follow the knight
        this.cameras.main.startFollow(this.knight, true, 1, 1, 0, 0);
        //set camera zoom
        this.cameras.main.setZoom(2.5);

        const goblins = this.physics.add.group({
            classType: Goblin,
            createCallback: (gameObject) => {
                //set their hit boxes correctly
                gameObject.body.setSize(10, 10).setOffset(4, 5);
                //have them create an event when they come in collide with something 
                gameObject.body.onCollide = true;
            }
        });

        const ogres = this.physics.add.group({
            classType: Ogre,
            createCallback: (gameObject) => {
                //set their hit boxes correctly
                gameObject.body.setSize(20, 25).setOffset(7, 7);
                //have them create an event when they come in collide with something 
                gameObject.body.onCollide = true;
            }
        });

        const demons = this.physics.add.group({
            classType: Demon,
            createCallback: (gameObject) => {
                //set their hit boxes correctly
                gameObject.body.setSize(13, 20).setOffset(2, 5);
                //have them create an event when they come in collide with something 
                gameObject.body.onCollide = true;
            }
        });

        const demonsSmall = this.physics.add.group({
            classType: demonSmall,
            createCallback: (gameObject) => {
                //set their hit boxes correctly
                gameObject.body.setSize(10, 10).setOffset(4, 5);
                //have them create an event when they come in collide with something 
                gameObject.body.onCollide = true;
            }
        });

        const necromancers = this.physics.add.group({
            classType: Necromancer,
            createCallback: (gameObject) => {
                //set their hit boxes correctly
                gameObject.body.setSize(13, 20).setOffset(2, 5);
                //have them create an event when they come in collide with something 
                gameObject.body.onCollide = true;
            }
        });

        
        goblins.get(125, 125, "goblin");
        ogres.get(400, 350, "ogre");
        demons.get(300, 450, "demon");
        demonsSmall.get(200, 300, "demonSmall");
        necromancers.get(250, 350, "necromancer");

        this.physics.add.collider(this.knight, wallsLayer);
        this.physics.add.collider(goblins, wallsLayer);
        this.physics.add.collider(ogres, wallsLayer);
        this.physics.add.collider(demons, wallsLayer);
        this.physics.add.collider(demonsSmall, wallsLayer);
        this.physics.add.collider(necromancers, wallsLayer);

        //stores all the enemy collisions in an array, to be deleted when the player dies
        this.playerEnemyCollisionArray.push(this.physics.add.collider(goblins, this.knight, this.handleEnemyCollisions, undefined, this));
        this.playerEnemyCollisionArray.push(this.physics.add.collider(ogres, this.knight, this.handleEnemyCollisions, undefined, this));
        this.playerEnemyCollisionArray.push(this.physics.add.collider(demons, this.knight, this.handleEnemyCollisions, undefined, this));
        this.playerEnemyCollisionArray.push(this.physics.add.collider(demonsSmall, this.knight, this.handleEnemyCollisions, undefined, this));
        this.playerEnemyCollisionArray.push(this.physics.add.collider(necromancers, this.knight, this.handleEnemyCollisions, undefined, this));
       
        this.physics.add.collider(goblins, this.knight, this.handleEnemyCollisions, undefined, this);
        this.physics.add.collider(ogres, this.knight, this.handleEnemyCollisions, undefined, this);
        this.physics.add.collider(demons, this.knight, this.handleEnemyCollisions, undefined, this);
        this.physics.add.collider(demonsSmall, this.knight, this.handleEnemyCollisions, undefined, this);
        this.physics.add.collider(necromancers, this.knight, this.handleEnemyCollisions, undefined, this);
    }

    //for when the player collides with an enemy
    handleEnemyCollisions(player, enemy){
        let directionX = player.x - enemy.x;
        let directionY = player.y - enemy.y;

        let directionalVector = new Phaser.Math.Vector2(directionX, directionY).normalize().scale(enemy.knockBack);

        this.knight.takeDamage(directionalVector, enemy.damage);

        sceneEvents.emit(eventNames.playerHealthChanged, this.knight.health);
    }

    update(){
        if(this.knight){
            this.knight.update(this.cursors);
        }
    }
}