import Isotope from "isotope-layout";

console.log("Browser knows")

iso = new Isotope('.grid', {
    itemSelector: ".grid-item",
    layoutMode: "masonry",
    getSortData: {
        rank: '[data-rank] parseInt',
        name: '.isotop-sort-by-name'
    }
});

iso.arrange({ sortBy: 'rank', sortAscending: false });
