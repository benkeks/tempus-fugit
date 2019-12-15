import {Card} from "../objects/game-objects/card";
import {Player} from "../objects/game-objects/player";
import {Enemy} from "../objects/game-objects/enemy";
import {GameState} from "../objects/game-objects/game-state";
import {Mission} from "./mission";
import {Attack} from "../objects/game-objects/attack";

export class TechDemoGame extends Mission {

    constructor() {
        super();

        this.player = new Player("player1", 10, 1);

        let e:Enemy = new Enemy("slime1", 5, 2,
            new Attack("Ga", 5), [new Attack("Gb", 10)]);
        e.description = "A slime that do not like people! Some more Text that is really long!!!";
        e.image = e.name;
        this.enemies = {
            0:[e, e],
                1:[e,e,e]
        };

        this.gameState = new GameState();
        this.gameState.maxEnergy = 4;
        this.gameState.setVariable("a", false);
        this.gameState.setVariable("b", false);
        this.gameState.setVariable("c", false);
        this.gameState.setVariable("d", false);

        let c1:Card = new Card(this, "test1", "", "card1", "b&(c|(OEb))", 2, true, 0, 0, "","enemy.takeHit(this.getAttackPower(), mission.gameState, mission.player);");
        let c2:Card = new Card(this,"test2", "","card2", "!#G(a&!b)", 2, false, 5, 1, "Magic Stand","this.stand.spawn(enemy);");
        let c3:Card = new Card(this,"test3", "","card3", "#Oa&(d|!b)", 2, true, 0, 0, "","enemy.takeHit(this.getAttackPower(), mission.gameState, mission.player);");
        let c4:Card = new Card(this,"test4", "","card4", "0Ec", 2, false, 6,2 , "Another Stand","this.stand.spawn(enemy);");
        //0E
        let c5:Card = new Card(this,"test5", "","card5", "OEc&(#Oa|b)", 2, false, 0,0, "",  "enemy.takeHit(this.getAttackPower(), mission.gameState, mission.player);");

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