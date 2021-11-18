import { select, templates } from '../settings.js';
import AmountWidget from './amountwidget.js';
class Booking {
  constructor(element) {
    const thisBooking = this;
    thisBooking.render(element);
    thisBooking.initWidgets();
  }
  render(element) {
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget();

    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.dom.peopleAmount = element.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = element.querySelector(select.booking.hoursAmount);

    thisBooking.dom.wrapper.innerHTML = generatedHTML;
  }
  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.dom.peopleAmount.addEventListener('updated', function () {
      console.log('CLICKED!');
    });
    console.log('thisBooking.peopleAmount: ', thisBooking.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.dom.hoursAmount.addEventListener('updated', function () {
      console.log('CLICKED!');
    });
  }
}

export default Booking;
