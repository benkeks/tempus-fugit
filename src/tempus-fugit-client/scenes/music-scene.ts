import { Scene } from "phaser";

export class MusicScene extends Scene {

    get muted():boolean {
        return this._muted;
    }

    set muted(val:boolean) {
        this._muted = val;

        if (this.activeMusic) this.activeMusic.setMute(val);
    }

    private _muted:boolean = false;
    private music = {};
    private activeMusic;

    public musicKeys = [];

    public static instance:MusicScene;
    
    constructor() {
        super({
            key:"MusicScene"
        });

        MusicScene.instance = this;
    }

    public mute(val:boolean) {
        this.muted = val;

        if (val) this
    }

    public play(key:string) {
        if (this.activeMusic) this.activeMusic.stop();
        this.activeMusic = this.music[key];
        this.activeMusic.play();
        this.activeMusic.setMute(this.muted);
    }

    preload() {
        this.musicKeys = ["navigationscene", "battle_theme", "boss_theme"]

        this.load.audio(this.musicKeys[0], "assets/songs/navigationscene.wav")
        this.load.audio(this.musicKeys[1], "assets/songs/battle_theme.wav")
        this.load.audio(this.musicKeys[2], "assets/songs/boss_theme.wav")

    }

    create(data?) {
        for (let k of this.musicKeys) {
            this.music[k] = this.sound.add(k, {
                mute: false,
                volume: 1,
                rate: 1,
                detune: 0,
                seek: 0,
                loop: true,
                delay: 0
            });
        }

        if (data.startSong) this.play(data.startSong);
    }

}