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

    // thisBooking.dom = {
    // wrapper: element
    // peopleAmount: element.querySelector(select.booking.peopleAmount),
    // hoursAmount: element.querySelector(select.booking.hoursAmount)
    // };

    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);

    thisBooking.dom.wrapper.innerHTML = generatedHTML;
  }
  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount));
    thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount).addEventListener('updated', function () {});

    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount));
    thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount).addEventListener('updated', function () {});
  }
}

export default Booking;
