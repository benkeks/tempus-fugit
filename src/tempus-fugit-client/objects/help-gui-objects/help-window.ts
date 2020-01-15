export class HelpDialog {
    private scene: Phaser.Scene;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.scene.rexUI.add.dialog({
            x:100,
            y:100,
            height:100,
            width:100,
            background: 'stand'
        })
    }

}