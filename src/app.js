import Isotope from "isotope-layout";
import Showdown from "showdown";

console.log("Browser knows")

var converter = new Showdown.Converter();

document.querySelectorAll('.grid-item-body').forEach(item => (item.innerHTML = converter.makeHtml(item.dataset.markdown)));

iso = new Isotope('.grid', {
    itemSelector: ".grid-item",
    layoutMode: "masonry",
    getSortData: {
        rank: '[data-rank] parseInt',
        name: '.isotop-sort-by-name'
    }
});

iso.arrange({ sortBy: 'rank', sortAscending: false });


