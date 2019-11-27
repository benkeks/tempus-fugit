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

        this.player = new Player("player1", 10, 3);
        this.enemys.push(new Enemy("e1", 5, 2,4, new Formula("Ga")));
        this.hand = this.player.hand;

        this.gameState = new GameState();
        this.gameState.setVariable("a", false);
        this.gameState.setVariable("b", false);
        this.gameState.setVariable("c", false);
        this.gameState.setVariable("d", false);

        let c1:Card = new Card("test1", "", "card1", "b&(c|(OEb))", 2);
        let c2:Card = new Card("test2", "","card2", "!#G(a&!b)", 2);
        let c3:Card = new Card("test3", "","card3", "#Oa&(d|!b)", 2);
        let c4:Card = new Card("test4", "","card4", "OEc", 2);
        let c5:Card = new Card("test5", "","card5", "OEc&(#Oa|b)", 2);

        //let c1:Card= new Card("test1", "", "card1", "a", 5);
        //let c2: Card = new Card("test2", "","card2", "a", 2);

        this.deck.addCard(c1);
        this.deck.addCard(c2);
        this.deck.addCard(c3);
        this.deck.addCard(c4);
        this.deck.addCard(c5);
        this.cards.push(c1);
        this.deck.addCard(c2);
    }
}