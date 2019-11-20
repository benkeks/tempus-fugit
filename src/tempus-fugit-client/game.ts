import "phaser";

import {Player, PlayerListener} from "./objects/game-objects/player";
import {Enemy} from "./objects/game-objects/enemy";
import {Deck} from "./objects/game-objects/deck";
import {Card} from "./objects/game-objects/card";
import {Display} from "./objects/game-objects/display";
import {Formula} from "./temporal-logic/Formula";




const testPlayer = new Player("Superplayer", 150, 15);
const testEnemy = new Enemy("Weird Monster", 100, 8, ["a","b","c"]);
const display = new Display("Start of game.", testPlayer.getName(), testEnemy.getName(), testPlayer.getHP(), testEnemy.getHP(), 5, testPlayer.hand.cards, 0);
window.alert("Next");
const testDeck = new Deck();
testPlayer.listener.push(display);
testEnemy.listener.push(display);
testPlayer.hand.listener.push(display);
testDeck.listener.push(display);


function showDisplay(): void {
    document.body.innerText = display.state + "\n\n" + display.name1 + ": " + display.hp1 + "\n\n" + display.name2 + ": " + display.hp2;
    for (var i = 0; i < display.handSize; i += 1) {
        document.body.innerText = document.body.innerText + "\n\n Card number " + i + ": " + display.cardNames[i];
    }
    document.body.innerText = document.body.innerText + "\n\n Cards on Deck: " + display.cardsOnDeck;
}

function step(): void {
    window.alert("Next");
    showDisplay();
}

step();


var testCard = new Card("Magic Attack", "This card uses magic to deal 15 damage", "magic_image", "Ea", 25);
testDeck.addCard(testCard);
step();
testCard = new Card("Magic Attack", "This card uses magic to deal 15 damage", "magic_image", "Ea", 25);
testDeck.addCard(testCard);
step();
testCard = new Card("Magic Attack", "This card uses magic to deal 15 damage", "magic_image", "Ea", 25);
testDeck.addCard(testCard);
step();
testCard = new Card("Magic Attack", "This card uses magic to deal 15 damage", "magic_image", "Ea", 25);
testDeck.addCard(testCard);
testCard = new Card("Magic Attack", "This card uses magic to deal 15 damage", "magic_image", "Ea", 25);
testDeck.addCard(testCard);
testCard = new Card("Magic Attack", "This card uses magic to deal 15 damage", "magic_image", "Ea", 25);
testDeck.addCard(testCard);
testCard = new Card("Magic Attack", "This card uses magic to deal 15 damage", "magic_image", "Ea", 25);
testDeck.addCard(testCard);
testCard = new Card("Magic Attack", "This card uses magic to deal 15 damage", "magic_image", "Ea", 25);
testDeck.addCard(testCard);
testCard = new Card("Magic Attack", "This card uses magic to deal 15 damage", "magic_image", "Ea", 25);
testDeck.addCard(testCard);
testCard = new Card("Magic Attack", "This card uses magic to deal 15 damage", "magic_image", "Ea", 25);
testDeck.addCard(testCard);
display.state = "Added player, an enemy, the deck and ten cards.";
step();


testPlayer.takeCard(testDeck);
display.state = "Player took card.";
step();

var gameState = [false, false, false]
testPlayer.attack(testEnemy, true,  0, gameState);
display.state = "Player attacked enemy with baseAttack.";
step();


testEnemy.attack(testPlayer, true, 0);
display.state = "Enemy attacked player with base attack.";
step();


testPlayer.attack(testEnemy, false,  0, gameState);
display.state = "Player attacked enemy with his first card.";
step();

gameState = [false, false, true]
testPlayer.attack(testEnemy, false,  0, gameState);
display.state = "Player attacked enemy again with his first card and different game state.";
step();

testEnemy.attack(testPlayer, false, 0);
display.state = "Enemy attacked player with his first special effect.";step();
//document.body.innerText = document.body.innerText + "\n\n Player has " + testPlayer.getHP() + " HP and enemy has " + testEnemy.getHP() + " HP.";



let f:Formula = new Formula();
f.parse("#EOa");
f.variables['a'].values = [false, false, false];
f.variables['a'].finiteStates = false;
document.body.innerText = document.body.innerText + "\n\n"+ f.evaluate(0);


