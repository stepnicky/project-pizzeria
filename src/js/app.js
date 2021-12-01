import { settings, select, classNames, templates } from './settings.js';
import Product from './components/product.js';
import Cart from './components/cart.js';
import Booking from './components/booking.js';
import Home from './components/home.js';

const app = {
  initHome: function () {
    const thisApp = this;

    const homeContainer = document.querySelector(select.containerOf.home);

    thisApp.home = new Home(homeContainer);

    thisApp.homeLinks = [
      document.querySelector(select.home.orderOnline),
      document.querySelector(select.home.bookTable)
    ];

    for (let link of thisApp.homeLinks) {
      link.addEventListener('click', function (event) {
        const clickedElement = this;

        event.preventDefault();

        const id = clickedElement.getAttribute('href').replace('#', '');

        thisApp.activatePage(id);

        window.location.hash = '#/' + id;
      });
    }
  },
  initBooking: function () {
    const thisApp = this;

    const bookingContainer = document.querySelector(select.containerOf.booking);

    thisApp.bookingWidget = new Booking(bookingContainer);
  },
  initPages: function () {
    const thisApp = this;

    thisApp.pages = document.querySelector(select.containerOf.pages).children;

    thisApp.navLinks = document.querySelectorAll(select.nav.links);

    const idFromHash = window.location.hash.replace('#/', '');

    let pageMatchingHash = thisApp.pages[0].id;

    for (let page of thisApp.pages) {
      if (page.id == idFromHash) {
        pageMatchingHash = page.id;
        break;
      }
    }

    thisApp.activatePage(pageMatchingHash);

    for (let link of thisApp.navLinks) {
      link.addEventListener('click', function (event) {
        const clickedElement = this;

        event.preventDefault();

        // get page id from href attribute

        const id = clickedElement.getAttribute('href').replace('#', '');

        //  run thisApp.activatePage with that id

        thisApp.activatePage(id);

        // change URL hash

        window.location.hash = '#/' + id;
      });
    }
  },
  activatePage: function (pageId) {
    const thisApp = this;

    //  add class 'active' to matching pages, remove from non-matching

    for (let page of thisApp.pages) {
      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }

    // add class 'active to matching links, remove from non-matching

    for (let link of thisApp.navLinks) {
      link.classList.toggle(classNames.nav.active, link.getAttribute('href') == '#' + pageId);
    }
  },
  initCart: function () {
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('add-to-cart', function (event) {
      console.log('add-to-cart event: ', event);
      app.cart.add(event.detail.product);
    });
  },
  initMenu: function () {
    const thisApp = this;
    console.log('thisApp.data: ', thisApp.data);
    for (let productData in thisApp.data.products) {
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },
  initData: function () {
    const thisApp = this;

    thisApp.data = {};

    const url = settings.db.url + '/' + settings.db.products;

    fetch(url)
      .then(function (rawResponse) {
        return rawResponse.json();
      })
      .then(function (parsedResponse) {
        console.log('parsedResponse: ', parsedResponse);

        thisApp.data.products = parsedResponse;

        thisApp.initMenu();
      });

    console.log('thisApp.data: ', JSON.stringify(thisApp.data));
  },
  init: function () {
    const thisApp = this;
    console.log('*** App starting ***');
    console.log('thisApp:', thisApp);
    console.log('classNames:', classNames);
    console.log('settings:', settings);
    console.log('templates:', templates);
    thisApp.initPages();
    thisApp.initHome();
    thisApp.initData();
    thisApp.initCart();
    thisApp.initBooking();
  }
};

app.init();
