/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };

  class Product{
    constructor(id, data){
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.renderInMenu();
      thisProduct.initAccordion();
      console.log('New Product: ', thisProduct);
    }

    renderInMenu(){
      const thisProduct = this;

      // generate HTML based on template

      const generatedHTML = templates.menuProduct(thisProduct.data);

      // create element using utils.createDomFromHTML

      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      console.log('thisProduct.element: ', thisProduct.element);
      
      // find menu container

      const menuContainer = document.querySelector(select.containerOf.menu);

      // add element to menu

      menuContainer.appendChild(thisProduct.element);

    }

    initAccordion(){
      const thisProduct = this;

      /* find the clickable trigger (the element that should react to clicking) */
      
      const clickableTrigger = document.querySelector(select.menuProduct.clickable);

      /* START: add event listener to clickable trigger on event click */
      
      clickableTrigger.addEventListener('click', function(event) {
      
        /* prevent default action for event */

        event.preventDefault();

        /* find active product (product that has active class) */

        const activeProduct = document.querySelector(classNames.menuProduct.wrapperActive);

        /* if there is active product and it's not thisProduct.element, remove class active from it */

        if(activeProduct !== thisProduct.element && activeProduct !== null){

          activeProduct.classList.remove(classNames.menuProduct.wrapperActive);

        /* toggle active class on thisProduct.element */
        
        }else {
          
          thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);

        }
      });
    }
  }

  const app = {
    initMenu: function(){
      const thisApp = this;
      console.log('thisApp.data: ', thisApp.data);
      for(let productData in thisApp.data.products){
        new Product(productData, this.data.products[productData]);
      }
    },
    initData: function(){
      const thisApp = this;

      thisApp.data = dataSource;
    },
    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);
      thisApp.initData();
      thisApp.initMenu();
    },
  };

  app.init();
}
