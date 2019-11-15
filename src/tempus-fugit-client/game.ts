import "phaser";

import {Player, PlayerListener} from "./objects/player";
import {Enemy} from "./objects/enemy";
import {Deck} from "./objects/deck";
import {Card} from "./objects/card";

document.body.innerText = "Start of game.";

const testPlayer = new Player("Superplayer", 150, 15);
const testEnemy = new Enemy("Weird Monster", 100, 8, ["a","b","c"]);
const testDeck = new Deck();
var testCard = new Card("Magic Attack", "This card uses magic to deal 15 damage", "magic_image", "Nx", 25);
testDeck.addCard(testCard);
testCard = new Card("Magic Attack", "This card uses magic to deal 15 damage", "magic_image", "Nx", 25);
testDeck.addCard(testCard);
testCard = new Card("Magic Attack", "This card uses magic to deal 15 damage", "magic_image", "Nx", 25);
testDeck.addCard(testCard);
testCard = new Card("Magic Attack", "This card uses magic to deal 15 damage", "magic_image", "Nx", 25);
testDeck.addCard(testCard);
testCard = new Card("Magic Attack", "This card uses magic to deal 15 damage", "magic_image", "Nx", 25);
testDeck.addCard(testCard);
testCard = new Card("Magic Attack", "This card uses magic to deal 15 damage", "magic_image", "Nx", 25);
testDeck.addCard(testCard);
testCard = new Card("Magic Attack", "This card uses magic to deal 15 damage", "magic_image", "Nx", 25);
testDeck.addCard(testCard);
testCard = new Card("Magic Attack", "This card uses magic to deal 15 damage", "magic_image", "Nx", 25);
testDeck.addCard(testCard);
testCard = new Card("Magic Attack", "This card uses magic to deal 15 damage", "magic_image", "Nx", 25);
testDeck.addCard(testCard);
testCard = new Card("Magic Attack", "This card uses magic to deal 15 damage", "magic_image", "Nx", 25);
testDeck.addCard(testCard);
document.body.innerText = document.body.innerText + "\n\n Added player, an enemy, the deck and ten cards.";
document.body.innerText = document.body.innerText + "\n\n Player has " + testPlayer.getHP() + " HP and enemy has " + testEnemy.getHP() + " HP.";

testPlayer.takeCard(testDeck);
document.body.innerText = document.body.innerText + "\n\n Player took card.";

testPlayer.attack(testEnemy, true,  0);
document.body.innerText = document.body.innerText + "\n\n Player attacked enemy with baseAttack.";
document.body.innerText = document.body.innerText + "\n\n Player has " + testPlayer.getHP() + " HP and enemy has " + testEnemy.getHP() + " HP.";

testPlayer.listener.push(new class implements PlayerListener {
    hpchanged(oldHP: number, newHP: number, enemy: Enemy): void {


    }
});

testEnemy.attack(testPlayer, true, 0);
document.body.innerText = document.body.innerText + "\n\n Enemy attacked player with base attack.";
document.body.innerText = document.body.innerText + "\n\n Player has " + testPlayer.getHP() + " HP and enemy has " + testEnemy.getHP() + " HP.";


testPlayer.attack(testEnemy, false,  0);
document.body.innerText = document.body.innerText + "\n\n Player attacked enemy with his first card.";
document.body.innerText = document.body.innerText + "\n\n Player has " + testPlayer.getHP() + " HP and enemy has " + testEnemy.getHP() + " HP.";


testEnemy.attack(testPlayer, false, 0);
document.body.innerText = document.body.innerText + "\n\n Enemy attacked player with his first special effect.";
document.body.innerText = document.body.innerText + "\n\n Player has " + testPlayer.getHP() + " HP and enemy has " + testEnemy.getHP() + " HP.";

