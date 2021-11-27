import { select, templates, settings, classNames } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './amountwidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';
class Booking {
  constructor(element) {
    const thisBooking = this;
    thisBooking.selectedTableId = null;
    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
    thisBooking.initActions();
  }
  getData() {
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);

    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      bookings: [startDateParam, endDateParam],
      eventsCurrent: [settings.db.notRepeatParam, startDateParam, endDateParam],
      eventsRepeat: [settings.db.repeatParam, endDateParam]
    };

    console.log('getData params: ', params);

    const urls = {
      bookings: settings.db.url + '/' + settings.db.bookings + '?' + params.bookings.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.events + '?' + params.eventsCurrent.join('&'),
      eventsRepeat: settings.db.url + '/' + settings.db.events + '?' + params.eventsRepeat.join('&')
    };
    console.log('getData urls: ', urls);

    Promise.all([fetch(urls.bookings), fetch(urls.eventsCurrent), fetch(urls.eventsRepeat)])
      .then(function (allResponses) {
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([bookingsResponse.json(), eventsCurrentResponse.json(), eventsRepeatResponse.json()]);
      })
      .then(function ([bookings, eventsCurrent, eventsRepeat]) {
        // console.log('bookings', bookings);
        // console.log('eventsCurrent', eventsCurrent);
        // console.log('eventsRepeat', eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }
  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;

    thisBooking.booked = {};

    for (let item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for (let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for (let item of eventsRepeat) {
      if (item.repeat == 'daily') {
        for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)) {
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }

    console.log('thisBooking.booked: ', thisBooking.booked);

    thisBooking.updateDOM();
  }
  makeBooked(date, hour, duration, table) {
    const thisBooking = this;

    if (typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) {
      if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }

      thisBooking.booked[date][hourBlock].push(table);
    }
  }
  updateDOM() {
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;

    if (
      typeof thisBooking.booked[thisBooking.date] == 'undefined' ||
      thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ) {
      allAvailable = true;
    }

    for (let table of thisBooking.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }

      if (!allAvailable && thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
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

    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    thisBooking.dom.peopleAmount = element.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = element.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = element.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = element.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tables = element.querySelectorAll(select.booking.tables);
    thisBooking.dom.tableWrapper = element.querySelector(select.containerOf.tables);
    thisBooking.dom.phone = element.querySelector(select.booking.phone);
    thisBooking.dom.address = element.querySelector(select.booking.address);
    thisBooking.dom.form = element.querySelector(select.booking.form);
    thisBooking.dom.starters = element.querySelectorAll(select.booking.starters);

    console.log('thisBooking: ', thisBooking);
  }
  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.dom.peopleAmount.addEventListener('updated', function () {});

    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.dom.hoursAmount.addEventListener('updated', function () {});

    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.dom.datePicker.addEventListener('updated', function () {});

    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
    thisBooking.dom.hourPicker.addEventListener('updated', function () {});
  }
  initActions() {
    const thisBooking = this;

    thisBooking.dom.tableWrapper.addEventListener('click', function (event) {
      console.log('event: ', event);

      thisBooking.clickedElement = event.target;
      thisBooking.selectedTable = thisBooking.dom.wrapper.querySelector(select.all.tableSelected);

      if (
        thisBooking.clickedElement.classList.contains(classNames.booking.table) &&
        !thisBooking.clickedElement.classList.contains(classNames.booking.tableBooked)
      ) {
        if (thisBooking.clickedElement.classList.contains(classNames.booking.tableSelected)) {
          thisBooking.clickedElement.classList.remove(classNames.booking.tableSelected);
          thisBooking.selectedTableId = null;
        } else {
          if (thisBooking.clickedElement !== thisBooking.selectedTable && thisBooking.selectedTable !== null) {
            thisBooking.selectedTable.classList.remove(classNames.booking.tableSelected);
            thisBooking.clickedElement.classList.add(classNames.booking.tableSelected);
            thisBooking.selectedTableId = parseInt(
              thisBooking.clickedElement.getAttribute(settings.booking.tableIdAttribute)
            );
          } else if (thisBooking.selectedTable == null) {
            thisBooking.clickedElement.classList.add(classNames.booking.tableSelected);
            thisBooking.selectedTableId = parseInt(
              thisBooking.clickedElement.getAttribute(settings.booking.tableIdAttribute)
            );
          }
        }
      } else if (
        thisBooking.clickedElement.classList.contains(classNames.booking.table) &&
        thisBooking.clickedElement.classList.contains(classNames.booking.tableBooked)
      ) {
        alert('This table is already booked!');
      }
      console.log('thisBooking.clickedElement: ', thisBooking.clickedElement);
      console.log('thisBooking.selectedTable: ', thisBooking.selectedTable);
      console.log('thisBooking.selectedTableId: ', thisBooking.selectedTableId);
    });

    thisBooking.dom.wrapper.addEventListener('updated', function () {
      thisBooking.updateDOM();
      thisBooking.clickedElement.classList.remove(classNames.booking.tableSelected);
      thisBooking.selectedTableId = null;
    });

    thisBooking.dom.form.addEventListener('submit', function (event) {
      event.preventDefault();
      console.log('booking form event: ', event);
      thisBooking.sendBooking();
    });
  }
  sendBooking() {
    const thisBooking = this;

    const url = settings.db.url + '/' + settings.db.bookings;

    const bookingRequest = {
      date: thisBooking.datePicker.value,
      hour: thisBooking.hourPicker.value,
      table: thisBooking.selectedTableId,
      duration: thisBooking.hoursAmount.value,
      ppl: thisBooking.peopleAmount.value,
      starters: [],
      phone: thisBooking.dom.phone.value,
      address: thisBooking.dom.address.value
    };

    for (let starter of thisBooking.dom.starters) {
      console.log('starter: ', starter);

      if (starter.checked) {
        bookingRequest.starters.push(starter.value);
      }
    }
    console.log('bookingRequest: ', bookingRequest);

    const options = {
      method: 'POST',
      body: JSON.stringify(bookingRequest),
      headers: {
        'Content-Type': 'application/json'
      }
    };

    fetch(url, options)
      .then(function (rawResponse) {
        return rawResponse.json();
      })
      .then(function (parsedResponse) {
        console.log('parsedResponse: ', parsedResponse);
        thisBooking.makeBooked(parsedResponse.date, parsedResponse.hour, parsedResponse.duration, parsedResponse.table);
        console.log('thisBooking.booked: ', thisBooking.booked);
      });
  }
}

export default Booking;
