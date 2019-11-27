import {Game} from "./game";
import {Card} from "../objects/game-objects/card";
import {Hand} from "../objects/game-objects/hand";
import {Player} from "../objects/game-objects/player";
import {Enemy} from "../objects/game-objects/enemy";
import {Formula} from "../temporal-logic/formula";
import {GameState} from "../objects/game-objects/game-state";

export class TechDemoGame extends Game{

    constructor() {
        super();

        this.hand = new Hand(5);
        this.player = new Player("player1", 10, 3);
        this.enemys.push(new Enemy("e1", 5, 2,2, new Formula("Ga")));

        this.gameState = new GameState();
        this.gameState.setVariable("a", false);

        let c1:Card= new Card("test1", "", "none", "#Ga", 5);
        let c2: Card = new Card("test2", "","none", "a", 2);

        this.deck.addCard(c1);
        this.deck.addCard(c2);
        this.cards.push(c1);
        this.deck.addCard(c2);
    }
}