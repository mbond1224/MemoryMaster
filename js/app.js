//eslint esversion:6 
//jshint esversion:6
/**
 * We implement it using ES6 Class module
 * various member variable represent the entire state of system
 * console.dir(app) can show you the current state of system
 *  app.setProdMode(false) will start printing the logging statement;
 */
class App {

    constructor() {
        ////['fa-diamond','fa-paper-plane-o','fa-anchor','fa-bolt','fa-cube','fa-leaf','
        //fa-bicycle','fa-bomb'];
        this.ALL_ITEMS = null;
        this.arrCards = this.converttoArray(document.querySelectorAll('.card'));
        this.ratings = this.converttoArray(document.querySelectorAll(".score-panel .fa-star"));
        this.currentCard = null;
        this.left = this.arrCards.length;
        this.score = 0;
        this.scoreCard = null;
        this.pendings = [];
        this.firstMove = true;
        this.startTime = null;
        this.timerSetup = null;
        this.prodMode = true;
        this.modal = null;
        this.easyMode = false;
        this.log("Ratings object", this.ratings);
        this.init();
        //TODO: We can split the stats related object in seperate class
    }
    init() {
        let WelcomeMsg = `**********Welcome to Memory Game ************************\r\n` +
            `So you want to debug the code :) \r\n ` +
            `console.dir(app) can show you the current state of system \r\n` +
            `app.setEasyMode(true) will make game a little bit easy \r\n` +
            `app.setProdMode(false) enable additional logging statements\r\n` +
            `*********************************************************`;
        console.log(WelcomeMsg);

        const btnRestart = document.querySelector('.restart');
        btnRestart.addEventListener("click", this.ensureRefresh.bind(this));

        this.modal = document.getElementById('winModal');
        const closespan = document.querySelector(".close");

        let restartBtn = this
            .modal
            .querySelector(".restart");
        restartBtn.addEventListener("click", (e) => {
            this.modal.style.display = "none";
            this.refresh();
        });

        // When the user clicks the button, close the modal
        closespan.addEventListener("click", (e) => this.modal.style.display = "none");

        this.scoreCard = document.querySelector(".moves");
        this.scoreCard.textContent = this.score;
        this.refresh();
    }
    /**
     * @description Set the rating using the css tricks
     * @param {*} rating
     */
    setRating(rating, ratingsElem) {
        ratingsElem.forEach(star => star.classList.remove("checked"));
        for (let i = 1; i <= rating; i++) {
            ratingsElem[i - 1]
                .classList
                .add("checked");
        }

    }
    /**
     * @description Update the timer every second
     */
    setupTimer() {
        if (this.firstMove) {
            clearInterval(this.timerSetup); // clear the previous timer
            this.startTime = new Date().getTime();
            this.firstMove = false;

        } else {

            let currentTime = new Date().getTime();
            currentTime -= this.startTime;
            this.setTimerVal(currentTime / 1000);

        }
        try {
            this.timerSetup = setTimeout(this.setupTimer.bind(this), 1000);
        } catch (e) {
            clearInterval(this.timerSetup);
            this.log("ignoring error in setting timer");
        }
    }
    /**
     * @description Print the timer time in formatted way
     * @param {*} currentTime
     */
    setTimerVal(currentTime) {

        let minutes = Math.floor(currentTime / 60);
        let seconds = Math.floor(currentTime % 60);
        document
            .querySelector(".score-panel .time")
            .textContent = `${String(minutes).padStart(2, 0)}: ${String(seconds).padStart(2, 0)}`;

    }
    /**
     * @description Reinitialize the state of the system, stats ,rating , timer
     */
    refresh() {
        this.ALL_ITEMS = this.pickItems(8);
        this.shuffle();
        for (let card of this.arrCards) {
            card
                .classList
                .remove("show");
            card
                .classList
                .remove("match");
            this.log(this.getClass(card));
            card.addEventListener("click", e => this.openCard(e, card));

            /** Tough luck :(  by default the easy mode is false */
            if (this.easyMode) {
                card
                    .classList
                    .add("show");
                this
                    .pendings
                    .push(card);
            }

        }
        this.firstMove = true;
        this.score = 0;
        this.scoreCard.textContent = this.score;
        clearInterval(this.timerSetup); // clear the old timer
        this.setTimerVal(0);
        this.left = this.ALL_ITEMS.length / 2;
        this.setRating(5, this.ratings);

    }
    /**
     * @description Picks randomly items to be displayed in the game. we need pair so we will replicate
     * @param {*} desiredCount
     */
    pickItems(desiredCount) {
        let items = new Set();
        const allItems = ALL_FA_ITEMS.length;
        let randomIndex = 0;
        while (items.size < desiredCount) {
            randomIndex = Math.floor(Math.random() * allItems);
            items.add(ALL_FA_ITEMS[randomIndex]);
        }
        let arrItems = new Array(desiredCount * 2);
        let i = 0;
        for (let item of items) {
            arrItems[i] = item;
            arrItems[i + desiredCount] = item;
            i++;
        }
        return arrItems;
    }
    /**
     *  @description converts nodelist to array
     * @param {*} nodelist
     */
    converttoArray(nodelist) {
        let arr = new Array();
        nodelist.forEach(node => arr.push(node));
        return arr;
    }
    /**
     *  @description Give user a warning before  rereshing
     * @param {*} e  click event
     */
    ensureRefresh(e) {
        // A quick check if user is in mid of game . Give him warning
        if (!this.firstMove) {
            const refModal = document.getElementById("WarningModal");
            refModal.style.display = "block";
            const closespan = refModal.querySelector(".close");
            const yesBtn = refModal.querySelector("#refConfirm");

            // When the user clicks the button, open the modal
            closespan.addEventListener("click", (e) => refModal.style.display = "none");
            yesBtn.addEventListener("click", (e) => {
                refModal.style.display = "none";
                this.refresh();
            });
        } else if (this.easyMode)
            this.refresh(); /** if tough mode , user hasn't seen any card as of now. No point of resuffling the cards */

    }
    /**
     * @description User won the game. Congratulate him
     */
    WinGame() {

        clearInterval(this.timerSetup);

        //TODO: Potential Enhancements 1. local Cache capabilities
        //TODO: Potential Enhancements 2.   Animations
        this.modal.style.display = "block";

        let dashboardRatings = this.converttoArray(document.querySelectorAll(".finaldashboard .fa-star"));
        this.log(dashboardRatings);
        let finalRating = this.ensureRating(dashboardRatings, true);

        document
            .querySelector("#finalrating")
            .textContent = finalRating;
        document
            .querySelector('#finaltime')
            .textContent = document
            .querySelector(".score-panel .time")
            .textContent;
        document
            .querySelector('#finalmove')
            .textContent = this.score;
    }
    /**
     * @description flips the cards supposed to be flipped once user click after an unsuccessful match
     */
    hidePendings() {
        for (let card of this.pendings) {
            card
                .classList
                .remove("show");
        }
        this.pendings = [];
    }
    /** @description handles the rating of user
     *   Lets give user 1 additional i.e. TOTAL 9 moves to stay with in Max Ratings
     *   Beyond that For additional 5 moves decrease rating by 1
     *   1-9 :  5 Stars
     *   10-14: 4 Stars
     *   15-19: 3 Stars
     *   20-24: 2 Stars
     *   25-  : 1 star
     */
    ensureRating(ratingsElem, final) {
        let rating = 5;
        if (this.score > 9 && (final || this.score % 5 === 0)) {
            rating = Math.max(1, 5 - (this.score - 5) / 5);
            this.log("Set Rating to:", rating);
            this.setRating(rating, ratingsElem);

        }
        return rating.toFixed(2);
    }
    /**
     * @description Handles the card choose event by the user
     * @param {*} e the click event
     * @param {*} card the selected card
     */
    openCard(e, card) {
        if (this.firstMove) {
            this.setupTimer();
            this.setRating(5, this.ratings);
        }
        if (this.pendings)
            this.hidePendings();

        if (card.classList.contains("match") || card.classList.contains("show")) {
            this.log("Already open. Do nothing");
            return;
        }

        if (this.currentCard) {
            this.score++;
            this.scoreCard.textContent = this.score;

            this.ensureRating(this.ratings);
            let newClass = this.getClass(card);
            let prevClass = this.getClass(this.currentCard);
            if (prevClass === newClass) {
                // We found a match .   Lets change the class

                card
                    .classList
                    .add("match");
                this
                    .currentCard
                    .classList
                    .add("match");
                this.left--;
                if (this.left === 0) {
                    setTimeout(this.WinGame.bind(this), 300);
                    this.log("We won");
                }

            } else {
                /* this.currentCard.classList = "card";*/
                card
                    .classList
                    .add("show");
                this
                    .pendings
                    .push(this.currentCard);
                this
                    .pendings
                    .push(card);

            }
            this.currentCard = null;

        } else {
            this.log('just show the card');
            this.currentCard = card;
            card
                .classList
                .add("show");
        }
    }
    /**
     *  @description Returns the class of the selected card
     * @param {*} card the selected card
     */
    getClass(card) {
        return card
            .querySelector('i')
            .classList
            .item(1);
    }
    /*
     * Create a list that holds all of your cards
     */

    /*
     * Display the cards on the page
     *   - shuffle the list of cards using the provided "shuffle" method below
     *   - loop through each card and create its HTML
     *   - add each card's HTML to the page
     */

    // Shuffle function from http://stackoverflow.com/a/2450976
    shuffle() {
        let currentIndex = this.ALL_ITEMS.length,
            temporaryValue,
            randomIndex;

        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = this.ALL_ITEMS[currentIndex];
            this.ALL_ITEMS[currentIndex] = this.ALL_ITEMS[randomIndex];
            this.ALL_ITEMS[randomIndex] = temporaryValue;
        }
        let i = 0;
        for (let card of this.arrCards) {

            card
                .querySelector('i')
                .classList = "";
            card
                .querySelector('i')
                .classList
                .add('fa');
            card
                .querySelector('i')
                .classList
                .add(this.ALL_ITEMS[i++]);

        }
    }
    /**
     * @description filtered logging module
     * @param {*} stmts logging statments to be printed if prod mode is disabled
     */
    log(...stmts) {
        if (!this.prodMode)
            console.log(stmts);
    }
    /**
     *  @description Set the production Mode
     * @param {*} fprodMode boolean indicating production mode
     */
    setProdMode(fprodMode) {
        this.prodMode = fprodMode;
    }

    //TODO: Make it a choice through UI elements
    /** backdoor hack for nerds for now*/
    setEasyMode(feasyMode) {
        this.easyMode = feasyMode;
        this.refresh();
    }

    /*
     * set up the event listener for a card. If a card is clicked:
     *  - display the card's symbol (put this functionality in another function that you call from this one)
     *  - add the card to a *list* of "open" cards (put this functionality in another function that you call from this one)
     *  - if the list already has another card, check to see if the two cards match
     *    + if the cards do match, lock the cards in the open position (put this functionality in another function that you call from this one)
     *    + if the cards do not match, remove the cards from the list and hide the card's symbol (put this functionality in another function that you call from this one)
     *    + increment the move counter and display it on the page (put this functionality in another function that you call from this one)
     *    + if all cards have matched, display a message with the final score (put this functionality in another function that you call from this one)
     */
}

var far = far || new faResources();
var ALL_FA_ITEMS = far.getItems();
var app = app || new App();