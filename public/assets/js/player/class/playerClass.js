export default class Player extends Phaser.Physics.Arcade.Sprite{
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);
        
        this.health = 6;
        this.attackDamage = 5; 
        this.speed = 125;

        this.hpUpgrades = 0;
        this.dmgUpgrades = 0;
        this.luckUpgrades = 0;

        //used for invincibility frames and knockback
        this.takenDamageState = false;
        this.damageTime = 0;
    }

    preUpdate(time, deltaTime){
        super.preUpdate(time, deltaTime);
        if(this.takenDamageState){
            this.damageTime += deltaTime;
            // knockback period in milliseconds
            if(this.damageTime >= 200){
                this.takenDamageState = false;
                this.setTint(0xffffff);
                this.damageTime = 0;
            }
        }
    }

    update(cursors){
        this.managePlayerMovement(cursors);
    }

    takeDamage(direction, damage){
        //make sure you won't take damage during knockback
        if(!this.takenDamageState){
            //change color
            this.setTint(0xff0000);
                    
            //knockback
            this.setVelocity(direction.x, direction.y);
            this.takenDamageState = true;
            this.damageTime = 0;
        }
    }

    managePlayerMovement(cursors){
         //do nothing if can't find controls or player
         if(!cursors || this.takenDamageState){
            return;
        }

        //stop movement from previous frame
        this.setVelocity(0, 0);

        //horizontal movement
        if(cursors.left?.isDown){
            this.setVelocityX(-this.speed);
        }else if(cursors.right?.isDown){
            this.setVelocityX(this.speed);
        }

        if(cursors.up?.isDown){
            this.setVelocityY(-this.speed);
        }else if(cursors.down?.isDown){
            this.setVelocityY(this.speed);
        }

        this.body.velocity.normalize().scale(this.speed);

        //knight animation
        if(cursors.left.isDown){
            this.flipX = true;
            this.anims.play("knight-run", true);
        }else if(cursors.right.isDown){
            this.flipX = false;
            this.anims.play("knight-run", true);
        }else if(cursors.up.isDown || cursors.down.isDown){
            this.anims.play("knight-run", true);
        }else{
            this.anims.play("knight-idle", true);
        }
    }
}


//can now create this object with the this.add method
Phaser.GameObjects.GameObjectFactory.register("player", function (phaser, x, y, texture, frame){
    var player = new Player(phaser.scene, x, y, texture, frame);

    this.displayList.add(player);
    this.updateList.add(player);

    this.scene.physics.world.enableBody(player, Phaser.Physics.Arcade.DYNAMIC_BODY);

    //set their collider properly
    player.body.setSize(14, 20).setOffset(0, 8);

    return player;
});