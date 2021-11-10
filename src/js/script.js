/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
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
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };
  
  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };
  
  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },
    cart: {
      defaultDeliveryFee: 20,
    },
    db: {
      url: '//localhost:3131',
      products: 'products',
      orders: 'orders',
    },
  };
  
  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    // CODE ADDED END
  };

  class Product{
    constructor(id, data){
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
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

    getElements(){
      const thisProduct = this;
    
      thisProduct.dom = {};
      thisProduct.dom.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.dom.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.dom.formInputs = thisProduct.dom.form.querySelectorAll(select.all.formInputs);
      thisProduct.dom.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.dom.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.dom.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.dom.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }

    initAccordion(){
      const thisProduct = this;

      /* START: add event listener to clickable trigger on event click */
      
      thisProduct.dom.accordionTrigger.addEventListener('click', function(event) {
      
        /* prevent default action for event */

        event.preventDefault();

        /* find active product (product that has active class) */

        const activeProduct = document.querySelector(select.all.menuProductsActive);

        /* if there is active product and it's not thisProduct.element, remove class active from it */

        if(activeProduct !== thisProduct.element && activeProduct !== null){
          console.log('activeProduct: ', activeProduct);
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
        
        }

        /* toggle active class on thisProduct.element */
        
          
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);

        
      });
    }

    initOrderForm(){
      const thisProduct = this;

      console.log('initOrderForm: ', thisProduct.initOrderForm);
    
      thisProduct.dom.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
      
      for(let input of thisProduct.dom.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }
      
      thisProduct.dom.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }

    processOrder(){
      const thisProduct = this;

      // convert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      
      const formData = utils.serializeFormToObject(thisProduct.dom.form);
      console.log('formData: ', formData);

      // set price to default price
      
      let price = thisProduct.data.price;

      
      // for every category (param)...

      for(let paramId in thisProduct.data.params) {
        
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        
        const param = thisProduct.data.params[paramId];
        console.log(paramId, param);

        // for every option in this category
        
        for(let optionId in param.options) {
        
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        
          const option = param.options[optionId];
          console.log(optionId, option);

          if(formData[paramId] && formData[paramId].includes(optionId)){
            if(option.default != true){
              price += option.price;
            } 
          } else if(option.default == true){
            price -= option.price;  
          } 
        
          const optionImage = thisProduct.dom.imageWrapper.querySelector('.' + paramId + '-' + optionId);
          
          if(optionImage){
            console.log('optionImage: ', optionImage);
             
            if (formData[paramId] && formData[paramId].includes(optionId)){
              optionImage.classList.add(classNames.menuProduct.imageVisible);
            } else {
              optionImage.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
        }
      } 

      thisProduct.priceSingle = price;

      // multiply price by amount

      price *= thisProduct.amountWidget.value;

      // update calculated price in the HTML
  
      thisProduct.dom.priceElem.innerHTML = price;

      console.log('processOrder: ', thisProduct.processOrder);
    }
    
    initAmountWidget(){
      const thisProduct = this;
      
      thisProduct.amountWidget = new AmountWidget(thisProduct.dom.amountWidgetElem);
      
      thisProduct.dom.amountWidgetElem.addEventListener('updated', function(){
        thisProduct.processOrder();
      });
    }
    addToCart(){
      const thisProduct = this;

      app.cart.add(thisProduct.prepareCartProduct());
    }
    prepareCartProduct(){
      const thisProduct = this;

      // const productSummary = {
      //   id: thisProduct.id,
      //   name: thisProduct.name,
      //   amount: thisProduct.amountWidget.value,
      //   priceSingle: thisProduct.priceSingle,
      //   price: thisProduct.priceSingle * productSummary.amount,
      //   params: {},
      // };

      const productSummary = {};
      productSummary.id = thisProduct.id;
      productSummary.name = thisProduct.data.name;
      productSummary.amount = thisProduct.amountWidget.value;
      productSummary.priceSingle = thisProduct.priceSingle;
      productSummary.price = productSummary.priceSingle * productSummary.amount;
      productSummary.params = thisProduct.prepareCartProductParams();
      
      
      return productSummary;
    }
    prepareCartProductParams(){
      const thisProduct = this;

      // convert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      
      const formData = utils.serializeFormToObject(thisProduct.dom.form);
      

      // declare cartProductParams
      
      const cartProductParams = {};

      
      // for every category (param)...

      for(let paramId in thisProduct.data.params) {
        
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        
        const param = thisProduct.data.params[paramId];

        // create category param in cartProductParams const eg. params = { ingredients: { label: 'Ingredients', options: {}}}

        cartProductParams[paramId] = {
          label: param.label,
          options: {},
        };

        // for every option in this category
        
        for(let optionId in param.options) {
        
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        
          const option = param.options[optionId];
          
          // if selected add option id and label

          if(formData[paramId] && formData[paramId].includes(optionId)){
            cartProductParams[paramId].options[optionId] = option.label;
          } 
        }
     
      } 
      return cartProductParams;
    }
  }

  class AmountWidget{
    constructor(element){
      const thisWidget = this;

      thisWidget.getElements(element);
      thisWidget.setValue(thisWidget.input.value);
      thisWidget.initActions();
      console.log('AmountWidget: ', thisWidget);
      console.log('constructor arguments: ', element);
    }
    getElements(element){
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }
    setValue(value){
      const thisWidget = this;

      const newValue = parseInt(value);

      // Validation

      if(newValue !== thisWidget.value && !isNaN(newValue) && settings.amountWidget.defaultMin <= newValue && newValue <= settings.amountWidget.defaultMax){
        thisWidget.value = newValue;
      }

      thisWidget.input.value = thisWidget.value;
      thisWidget.announce();
    }
    initActions(){
      const thisWidget = this;
      
      thisWidget.input.addEventListener('change', function(){
        thisWidget.setValue(thisWidget.input.value);
      });

      thisWidget.linkDecrease.addEventListener('click', function(){
        thisWidget.setValue(thisWidget.value - 1);
      });

      thisWidget.linkIncrease.addEventListener('click', function(){
        thisWidget.setValue(thisWidget.value + 1);
      });
    }
    announce(){
      const thisWidget = this;

      const event = new CustomEvent('updated', {
        bubbles: true
      });
      thisWidget.element.dispatchEvent(event);
    }
  }

  class Cart{
    constructor(element){
      const thisCart = this;

      thisCart.products = [];

      thisCart.getElements(element);
      thisCart.initActions();
      
      console.log('new Cart: ', thisCart);
    }
    getElements(element){
      const thisCart = this;

      thisCart.dom = {};
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
      thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
      thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
      thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
      thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
    }
    initActions(){
      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener('click', function() {
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });

      thisCart.dom.productList.addEventListener('updated', function(){
        thisCart.update();
      });
      
      thisCart.dom.productList.addEventListener('remove', function(event){
        thisCart.remove(event.detail.cartProduct);
      });
    }
    add(menuProduct){
      const thisCart = this;

      console.log('adding product ', menuProduct);

      const generatedHTML = templates.cartProduct(menuProduct);

      const generatedDOM = utils.createDOMFromHTML(generatedHTML);

      thisCart.dom.productList.appendChild(generatedDOM);

      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
      console.log('thisCart.products: ', thisCart.products);
      
      thisCart.update();
    }
    update(){
      const thisCart = this;

      thisCart.deliveryFee = settings.cart.defaultDeliveryFee;

      let totalNumber = 0;

      let subtotalPrice = 0;

      for(let cartProduct of thisCart.products){
        totalNumber += cartProduct.amount;
        subtotalPrice += cartProduct.price;
      }

      if(totalNumber == 0){
        thisCart.deliveryFee = 0;
        thisCart.totalPrice = 0;
      } else{
        thisCart.totalPrice = subtotalPrice + thisCart.deliveryFee;
      }

      console.log('thisCart.deliveryFee: ', thisCart.deliveryFee);
      console.log('totalNumber: ', totalNumber);
      console.log('subtotalPrice: ', subtotalPrice);
      console.log('thisCart.totalPrice: ', thisCart.totalPrice);
    
      thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;

      thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;
      
      for(let total of thisCart.dom.totalPrice){
        total.innerHTML = thisCart.totalPrice;
      }

      thisCart.dom.totalNumber.innerHTML = totalNumber;
    
    }
    remove(removedProduct){
      const thisCart = this;

      const indexOfRemovedProduct = thisCart.products.indexOf(removedProduct);

      thisCart.products.splice(indexOfRemovedProduct, 1);
      
      console.log('thisCart.products after removing this product: ', thisCart.products);

      removedProduct.dom.wrapper.remove();

      thisCart.update();
    }
  }

  class CartProduct{
    constructor(menuProduct, element){
      const thisCartProduct = this;

      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.price = menuProduct.priceSingle * menuProduct.amount;
      thisCartProduct.params = menuProduct.params;

      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
      thisCartProduct.initActions();
   
      console.log('thisCartProduct: ', thisCartProduct);
    }
    getElements(element){
      const thisCartProduct = this;

      thisCartProduct.dom = {};
      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.amountWidget.input = thisCartProduct.dom.wrapper.querySelector(select.widgets.amount.input);
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);

    }
    initAmountWidget(){
      const thisCartProduct = this;

      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);
      

      
      thisCartProduct.dom.amountWidget.addEventListener('updated', function(){
        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        thisCartProduct.price = thisCartProduct.amount * thisCartProduct.priceSingle;
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
      });

    }
    remove(){
      const thisCartProduct = this;

      console.log('Removing product');

      const event = new CustomEvent('remove', {
        bubbles: true,
        detail: {
          cartProduct: thisCartProduct,
        },
      });

      thisCartProduct.dom.wrapper.dispatchEvent(event);
    }
    initActions(){
      const thisCartProduct = this;

      thisCartProduct.dom.edit.addEventListener('click', function(event){
        event.preventDefault();

      });

      thisCartProduct.dom.remove.addEventListener('click', function(event){
        event.preventDefault();

        thisCartProduct.remove();
      });
    }
  }

  const app = {
    initCart: function(){
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },
    initMenu: function(){
      const thisApp = this;
      console.log('thisApp.data: ', thisApp.data);
      for(let productData in thisApp.data.products){
        new Product(thisApp.data.products[productData].id, this.data.products[productData]);
      }
    },
    initData: function(){
      const thisApp = this;

      thisApp.data = {};

      const url = settings.db.url + '/' + settings.db.products;

      fetch(url)
        .then(function(rawResponse){
          return rawResponse.json();
        })
        .then(function(parsedResponse){
          console.log('parsedResponse: ', parsedResponse);

          thisApp.data.products = parsedResponse;

          thisApp.initMenu();

        });

      console.log('thisApp.data: ', JSON.stringify(thisApp.data));
    },
    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);
      thisApp.initData();
      thisApp.initCart();
    },
  };

  app.init();
}
