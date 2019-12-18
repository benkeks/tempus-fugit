import {Card} from "../objects/game-objects/card";
import {Player} from "../objects/game-objects/player";
import {Enemy} from "../objects/game-objects/enemy";
import {GameState} from "../objects/game-objects/game-state";
import {Mission} from "./mission";
import {Attack} from "../objects/game-objects/attack";

export class TechDemoGame extends Mission {

    constructor() {
        super();

        Mission.player = new Player("player1", 10, 1);

        let e:Enemy = new Enemy("slime1", 5, 2,
            new Attack("Ga", 5), [new Attack("Gb", 10)], "slime1", [64,64]);
        e.description = "A slime that do not like people! Some more Text that is really long!!!";
        e.image = e.name;
        this.enemies = [
            [e.copy(), e.copy()],
                [e.copy(),e.copy(),e.copy()]
        ];

        this.gameState = new GameState();
        this.gameState.maxEnergy = 4;
        this.gameState.setVariable("a", false);
        this.gameState.setVariable("b", false);
        this.gameState.setVariable("c", false);
        this.gameState.setVariable("d", false);

        let c1:Card = new Card("test1", "", "card1", "b&(c|(OEb))", 2, true, 0, 0, "","enemy.takeHit(this.getAttackPower(), mission.gameState, mission.player);");
        this.pushStand(c1.stand);
        let c2:Card = new Card("test2", "","card2", "!#G(a&!b)", 2, false, 5, 1, "Magic Stand","this.stand.spawn(enemy);");
        this.pushStand(c2.stand);
        let c3:Card = new Card("test3", "","card3", "#Oa&(d|!b)", 2, true, 0, 0, "","enemy.takeHit(this.getAttackPower(), mission.gameState, mission.player);");
        this.pushStand(c3.stand);
        let c4:Card = new Card("test4", "","card4", "0Ec", 2, false, 6,2 , "Another Stand","this.stand.spawn(enemy);");
        this.pushStand(c4.stand);
        //0E
        let c5:Card = new Card("test5", "","card5", "OEc&(#Oa|b)", 2, false, 0,0, "",  "enemy.takeHit(this.getAttackPower(), mission.gameState, mission.player);");
        this.pushStand(c5.stand);

        //let c1:Card= new Card("test1", "", "card1", "a", 5);
        //let c2: Card = new Card("test2", "","card2", "a", 2);

        Mission.deck.addCard(c1);
        Mission.deck.addCard(c2);
        Mission.deck.addCard(c3);
        Mission.deck.addCard(c4);
        Mission.deck.addCard(c5);
        Mission.deck.addCard(c1);
        Mission.deck.addCard(c2);
        Mission.deck.addCard(c3);
        Mission.deck.addCard(c4);
        Mission.deck.addCard(c5);
        Mission.deck.addCard(c1);
        Mission.deck.addCard(c2);
        Mission.deck.addCard(c3);
        Mission.deck.addCard(c4);
        Mission.deck.addCard(c5);
        Mission.deck.addCard(c2);
    }
}