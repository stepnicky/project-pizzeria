import {settings, select, classNames, templates} from '../settings.js';
import CartProduct from './cartproduct.js';
import utils from '../utils.js';

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
      thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
      thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
      thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
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

      thisCart.dom.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisCart.sendOrder();
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

      thisCart.totalNumber = 0;

      thisCart.subtotalPrice = 0;

      for(let cartProduct of thisCart.products){
        thisCart.totalNumber += cartProduct.amount;
        thisCart.subtotalPrice += cartProduct.price;
      }

      if(thisCart.totalNumber == 0){
        thisCart.deliveryFee = 0;
        thisCart.totalPrice = 0;
      } else{
        thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
      }

      console.log('thisCart.deliveryFee: ', thisCart.deliveryFee);
      console.log('totalNumber: ', thisCart.totalNumber);
      console.log('subtotalPrice: ', thisCart.subtotalPrice);
      console.log('thisCart.totalPrice: ', thisCart.totalPrice);
    
      thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;

      thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
      
      for(let total of thisCart.dom.totalPrice){
        total.innerHTML = thisCart.totalPrice;
      }

      thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
    
    }
    remove(removedProduct){
      const thisCart = this;

      const indexOfRemovedProduct = thisCart.products.indexOf(removedProduct);

      thisCart.products.splice(indexOfRemovedProduct, 1);
      
      console.log('thisCart.products after removing this product: ', thisCart.products);

      removedProduct.dom.wrapper.remove();

      thisCart.update();
    }
    sendOrder(){
      const thisCart = this;

      const url = settings.db.url + '/' + settings.db.orders;

      const payload = {
        address: thisCart.dom.address.value,
        phone: thisCart.dom.phone.value,
        totalPrice: thisCart.totalPrice,
        subtotalPrice: thisCart.subtotalPrice,
        totalNumber: thisCart.totalNumber,
        deliveryFee: thisCart.deliveryFee,
        products: []
      };

      for(let prod of thisCart.products) {
        payload.products.push(prod.getData());
      }

      console.log('payload: ', payload);

      const options = {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json'
        }
      };

      fetch(url, options);


    }
  }

export default Cart;