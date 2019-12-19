import { Card } from "../objects/game-objects/card";
import { Player } from "../objects/game-objects/player";
import { Enemy } from "../objects/game-objects/enemy";
import { GameState } from "../objects/game-objects/game-state";
import { Mission } from "./mission";
import { Attack } from "../objects/game-objects/attack";
import { StoryDialog } from "./story-dialog";

export class TechDemoGame extends Mission {

    constructor() {
        super();

        this.player = new Player("player1", 10, 1);

        let e: Enemy = new Enemy("slime1", 5, 2,
            new Card(this, "slime1", "...", "slime1", "Ga", "directed", false, 4, "return;"), []);
        e.description = "A slime that do not like people! Some more Text that is really long!!!";
        e.image = e.name;
        this.enemies = {
            0: [e.copy(), e.copy()],
            1: [e.copy(), e.copy(), e.copy()]
        };
        let sd = new StoryDialog([["slime1", "Hi"], ["slime2", "Hello good sir!"]]);
        sd.parsetriggerFunctionString("return true;");
        this.dialogue.push(sd);

        this.gameState = new GameState();
        this.gameState.maxEnergy = 4;
        this.gameState.setVariable("a", false);
        this.gameState.setVariable("b", false);
        this.gameState.setVariable("c", false);
        this.gameState.setVariable("d", false);

        let c1: Card = new Card(this, "test1", "", "card1", "b&(c|(OEb))", "directed", true, 0,   "enemy.takeHit(this.getAttackPower(), mission.gameState, mission.player);");
        let c2: Card = new Card(this, "test2", "", "card2", "!#G(a&!b)", "directed", false, 5,   "this.stand.spawn(enemy);");
        let c3: Card = new Card(this, "test3", "", "card3", "#Oa&(d|!b)", "directed", true, 0,  "enemy.takeHit(this.getAttackPower(), mission.gameState, mission.player);");
        let c4: Card = new Card(this, "test4", "", "card4", "0Ec", "directed", false, 6, "this.stand.spawn(enemy);");
        //0E
        let c5: Card = new Card(this, "test5", "", "card5", "OEc&(#Oa|b)", "directed", false, 0,  "enemy.takeHit(this.getAttackPower(), mission.gameState, mission.player);");

        //let c1:Card= new Card("test1", "", "card1", "a", 5);
        //let c2: Card = new Card("test2", "","card2", "a", 2);

        this.deck.addCard(c1);
        this.deck.addCard(c2);
        this.deck.addCard(c3);
        this.deck.addCard(c4);
        this.deck.addCard(c5);
        this.deck.addCard(c1);
        this.deck.addCard(c2);
        this.deck.addCard(c3);
        this.deck.addCard(c4);
        this.deck.addCard(c5);
        this.deck.addCard(c1);
        this.deck.addCard(c2);
        this.deck.addCard(c3);
        this.deck.addCard(c4);
        this.deck.addCard(c5);
        this.cards.push(c1);
        this.deck.addCard(c2);
    }
}