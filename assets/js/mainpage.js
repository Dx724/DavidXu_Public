var msnry = new Masonry(document.querySelector(".card-container"), {
    itemSelector: ".tiled-card", //.tiled-card:not(.active-card)
    columnWidth: ".project-card",
    gutter: "#gutter-sizer",
    percentPosition: true,
    transitionDuration: "0.7s",
    stagger: "0.07s"
});

if (document.fonts) {
    document.fonts.ready.then(() => {
        msnry.nextIsInitial = true;
        msnry.layout();
    });
}

var lastActive = null;

function getScContent(card) {
    return card.getElementsByClassName("card-content")[0];
}

function getElemWidth(element) {
    return element.getBoundingClientRect().width;
}

function getCardWidth(cols) {
    return cols * getElemWidth(document.getElementById("card-sizer")) +
        (cols - 1) * getElemWidth(document.getElementById("gutter-sizer"));
}

function deactivate(card) {
    card.classList.remove("active-card");
    someCardActive = false;
    getScContent(card).style.height = 0;
    //card.style.width = getCardWidth(1) + "px";
}

function getCardsNotBelow(card) { //Note: Returns Masonry.Item's, not elements -- was used for custom staggering before Masonry was modified
    var resItems = [];
    var minY = msnry.getItem(card).position.y;
    for (let c of msnry.items) {
        if (c.position.y <= minY) {
            resItems.push(c);
        }
    }
    return resItems;
}

function isInViewport(el, vPad = 0) { //Returns whether the element is partially in the viewport
    var elRect = el.getBoundingClientRect();
    var vpHeight = window.innerHeight || document.documentElement.clientHeight;
    var vpWidth = window.innerWidth || document.documentElement.clientWidth;
    return (elRect.top - vPad) > -elRect.height && elRect.left > -elRect.width
        && (elRect.bottom + vPad) < (vpHeight + elRect.height) && elRect.right < vpWidth + elRect.width;
}

const SCROLL_OFFSET_HEIGHT = 5;
const supportsSmoothScroll = 'scrollBehavior' in document.documentElement.style;
function scrollToElement(el) {
    var elRect = el.getBoundingClientRect();
    var scrollTarget = [window.scrollX + elRect.left, window.scrollY + elRect.top - document.getElementsByClassName("pageHeader")[0].getBoundingClientRect().height - SCROLL_OFFSET_HEIGHT];
    //console.log(scrollTarget);
    if (supportsSmoothScroll) {
        window.scrollTo({
            left: scrollTarget[0],
            top: scrollTarget[1],
            behavior: "smooth"
        });
    }
    else {
        window.scrollTo(scrollTarget[0], scrollTarget[1]); //Note: IE doesn't support spread operator, so not used here
    }
}

function restyleActiveCard(card, isRefresh = false) {
    var scContent = getScContent(card);
    var targetHeight = scContent.scrollHeight + "px";
    if (isRefresh) {
        var prevHeight = scContent.style.height;
        scContent.style.height = "initial"; //Reset height so element is able to shrink
        targetHeight = scContent.scrollHeight + "px";
        scContent.style.height = prevHeight; //Snap back to height before so animation plays (for px to px transition)
    }
    scContent.style.height = targetHeight;
}

const TRANSITION_DURATION = 0.3;
var someCardActive = false;
for (var smallCard of document.getElementsByClassName("small-card")) {
    smallCard.addEventListener("click", function() {
        var scContent = getScContent(this);
        if (scContent.style.height != "0px" && scContent.style.height != "") { //If expanded already
            if ((window.getSelection && window.getSelection().toString().length > 0) //Check if text is selected
                || (document.selection && document.selection.type != "Control" && document.selection.createRange().text.length > 0)) { //Fallback for IE <= 8
                //Don't close the expanded view --> allows text to be copied
            }
            else {
                deactivate(this);
            }
        }
        else {
            if (lastActive) {
                deactivate(lastActive);
            }
            restyleActiveCard(this);
            lastActive = this;
            //this.style.width = getCardWidth(3) + "px";
            this.classList.add("active-card");
            someCardActive = true;
        }
        trackActiveCard(); //Update active card in view status
    });
    smallCard.addEventListener("transitionend", function(evt) {
        if (!someCardActive || this.classList.contains("active-card")) {
            if (evt.propertyName == "height") {
                msnry.layout(msnry.getItem(this));
            }
        }
    });
    // smallCard.animate([
    //     {opacity: 0},
    //     {opacity: 1}], {duration: 1000, iterations: 1});
}

//Prevent cards from expanding when link clicked
for (var hostedLink of document.getElementsByTagName("a")) {
    hostedLink.addEventListener("click", (evt) => {
        evt.stopPropagation();
    });
}

window.onload = () => {
    //Load in animation
    var firstStoryCard = document.getElementsByClassName("story-card")[0];
    if (firstStoryCard.animate) { //Support Microsoft Edge
        firstStoryCard.animate([
            {transform: "scale(1)"},
            {transform: "scale(1.1)"},
            {transform: "scale(1)"}], {duration: 1000, iterations: 1, easing: "ease"});
    }
    
    window.setTimeout(() => { //Fallback
        msnry.nextIsInitial = true;
        msnry.layout();
    }, 1500);
};

var hasForceScrolled = true;

/* Rewritten to scroll upon item layout
msnry.on("layoutComplete", function() { //After layout, scroll to active card if not in view
    if (someCardActive) {
        var aCard = document.getElementsByClassName("active-card")[0];
        if (!hasForceScrolled && !isInViewport(aCard)) {
            scrollToElement(aCard);
            console.log("Force scroll");
            hasForceScrolled = true;
        }
    }
});
*/
for (var item of msnry.items) {
    item.on("layout", (lItem) => {
        if (!hasForceScrolled && someCardActive) {
            if (lItem.element.classList.contains("active-card")) {
                if (!isInViewport(lItem.element, 100)) {
                    scrollToElement(lItem.element);
                    hasForceScrolled = true;
                }
            }
        }
    });
}

var activeCardInWindow = false; //Keep track of whether the active card is in view so we know whether to scroll back to it later on
function trackActiveCard() {
    if (someCardActive) {
        activeCardInWindow = isInViewport(document.getElementsByClassName("active-card")[0], 100);
    }
    else {
        activeCardInWindow = false;
    }
}
window.addEventListener("scroll", trackActiveCard);
window.addEventListener("resize", trackActiveCard);

var delayedLayoutTimeout = null;
window.addEventListener("resize", () => {
    if (someCardActive) {
        var aCard = document.getElementsByClassName("active-card")[0];
        restyleActiveCard(aCard, true); //This resize should also lead to masonry layout running again
        if (activeCardInWindow) hasForceScrolled = false; //Allow force scrolling once layout completes (only if item was initially in view)
    }
    if (delayedLayoutTimeout) window.clearTimeout(delayedLayoutTimeout);
    delayedLayoutTimeout = window.setTimeout(() => { //Re-layout once after resize is complete (fixes some odd resize-related masonry issues)
        delayedLayoutTimeout = null;
        msnry.layout();
    }, 150);
});