import React, {Component} from 'react'
import PropTypes from 'prop-types'

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from "@fullcalendar/interaction";
import koLocale from '@fullcalendar/core/locales/ko';
import './Calendar.scss';

// TO DO
// If you need to add arrows on the side of the calendar
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'

/*
*
* This is the calendar component.
* It is responsible for rendering the calendar.
*   - It is used in the main page of the application.
* */

class Calendar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            events: {}
        }
    }

    static propTypes = {
        props: PropTypes.object
    }
    calendarComponentRef = React.createRef();

    static getDerivedStateFromProps(props, state) {
        if (Object.keys(props.events).length !== 0) {
            return {events: props.events};
        }
        return state;
    }
    handleDateClick = (arg) => {
        //Get all the events for the date that was clicked
        this.props.changeDate(arg.dateStr);
    }

    render() {
        return (
            <div className="calendar-container">
                {/* <FontAwesomeIcon icon={faChevronLeft} size="5x" /> */}
                <FullCalendar
                    dateClick={this.handleDateClick}
                    //get the event that is about to be updated
                    eventClick={({event}) => this.props.updateEvent(event)}
                    initialView="dayGridMonth"
                    ref={this.calendarComponentRef}
                    headerToolbar={{
                        left: 'prev',
                        center: 'title',
                        right: 'today next'
                    }}
                    slotLabelFormat={
                        {
                            hour: '2-digit',
                            minute: '2-digit',
                            omitZeroMinute: false,
                            meridiem: 'narrow',
                            hour12: true
                        }
                    }
                    // timeFormat='h:mm'
                    plugins={[dayGridPlugin, interactionPlugin]}
                    events={this.state.events != null ? this.state.events : ""}
                    eventTimeFormat={{
                        hour: '2-digit', //2-digit, numeric
                        minute: '2-digit', //2-digit, numeric
                        omitZeroMinute: true,
                        meridiem: 'narrow',
                        // second: '0-digit', //2-digit, numeric
                        // meridiem: false, //lowercase, short, narrow, false (display of AM/PM)
                        hour12: false //true, false
                    }}
                    locale={koLocale}
                />
                {/* <FontAwesomeIcon icon={faChevronRight} size="5x" /> */}
            </div>
        )
    }
}

export default Calendar;
