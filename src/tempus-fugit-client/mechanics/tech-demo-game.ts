import {Card} from "../objects/game-objects/card";
import {Player} from "../objects/game-objects/player";
import {Enemy} from "../objects/game-objects/enemy";
import {Formula} from "../temporal-logic/formula";
import {GameState} from "../objects/game-objects/game-state";
import {Mission} from "./mission";
import {Stand} from "../objects/game-objects/stand";

export class TechDemoGame extends Mission {

    constructor() {
        super();

        this.player = new Player("player1", 10, 1);

        this.enemies = {
            0:[new Enemy("e1", 5, 2,4, new Formula("Ga"))]
        };

        this.gameState = new GameState();
        this.gameState.maxEnergy = 4;
        this.gameState.setVariable("a", false);
        this.gameState.setVariable("b", false);
        this.gameState.setVariable("c", false);
        this.gameState.setVariable("d", false);

        let c1:Card = new Card(this, "test1", "", "card1", "b&(c|(OEb))", 2, true, 0, 0, "","enemy.takeHit(this.getAttackPower());");
        let c2:Card = new Card(this,"test2", "","card2", "!#G(a&!b)", 2, false, 5, 1, "Magic Stand","this.stand.spawn(enemy);");
        let c3:Card = new Card(this,"test3", "","card3", "#Oa&(d|!b)", 2, true, 0, 0, "","enemy.takeHit(this.getAttackPower());");
        let c4:Card = new Card(this,"test4", "","card4", "c", 2, false, 6,2 , "Another Stand","this.stand.spawn(enemy);");
        //0E
        let c5:Card = new Card(this,"test5", "","card5", "OEc&(#Oa|b)", 2, false, 0,0, "",  "enemy.takeHit(this.getAttackPower());");

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