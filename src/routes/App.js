import React from 'react';
import Calendar from '../components/Calendar';
import './main.scss';
import Button from 'react-bootstrap/Button';
import {Col, Container, ListGroup, Navbar, Row} from 'react-bootstrap';
import EventModal from '../components/EventModal';
import * as moment from 'moment';
import {v4 as uuidv4} from 'uuid';
import {getCookie, setCookie} from "../components/cookies/Cookies";
import {API_URL, saveStateToLocalStorage} from "../helper";
import {Navigate} from "react-router-dom";
import DatabaseModal from "../components/DatabaseModal";

/*
* This is the main page of the application.
* It is responsible for rendering the calendar and the events.
*
* */

class App extends React.Component {

    constructor(props) {
        super(props);

        // there is a bug with getting current data according to the timezone
        this.state = {
            loggedIn: true,
            date: new Date(new Date().toLocaleDateString()),
            database: [],
            loadDatabase: {},
            events: [],
            today: [],
            loadEvent: {},
            eventShow: false,
            databaseShow: false,
            noDatabase: false,
            isLoading: false,
        };
    }

    componentDidMount() {
        fetch('http://' + API_URL + '/database', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': getCookie('loginToken')
            }
        })
            .then(response => {
                if (!response.ok) {
                    if (response.status === 401) {
                        setCookie('loginToken', '');
                        this.setState({loggedIn: false});
                    }
                    else {
                        const error = (response && response.message) || response.statusText;
                        throw new Error(error);
                    }
                }
                return response.json()
            })
            .then(data => {
                console.log(data);
                if (data.length === 0) {
                    this.setState({
                        databaseShow: true,
                        noDatabase: true
                    })
                }
                this.setState({
                    database: data
                })
            })
            .catch(error => {
                console.error('There was an error!', error);
            })
        fetch(`http://${API_URL}/schedule`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': getCookie("loginToken")
            }
        })
            .then(response => {
                if (!response.ok) {
                    if (response.status === 401) {
                        setCookie('loginToken', '');
                        this.setState({loggedIn: false});
                    }
                    else {
                        const error = (response && response.message) || response.statusText;
                        throw new Error(error);
                    }
                }
                return response.json()
            })
            .then(data => {
                const map = {
                    'UUID': 'id',
                    'ScheduleName': 'title',
                    'Starts': 'start',
                    'Ends': 'end',
                    'Owner': 'owner',
                    'Editor': 'editor',
                    'AllDay': 'allDay',
                }
                const res = [];
                data.forEach(event => {
                    const replacedKeysInData = {}
                    Object.keys(event).forEach((key) => {
                        const keyFromMap = map[key] || key;
                        replacedKeysInData[keyFromMap] = event[key]
                    })
                    if (replacedKeysInData.end == null && moment(replacedKeysInData.start).format("HH:mm") === "00:00") {
                        replacedKeysInData.allDay = true
                    }
                    res.push(replacedKeysInData);
                })

                console.log(res)

                this.setState(({
                    events: res
                }), () => {
                    saveStateToLocalStorage(this.state);
                })
                this.getEvents(moment(new Date()).format('YYYY-MM-DD'));
            })
            .catch(error => {
                console.error('There was an error!', error);
            })

        if (!getCookie("loginToken")) {
            this.setState({
                loggedIn: false
            })
        }
    }

    /*
    * this function is called from the modal component
    * it is called when the user clicks on the add button
    *
    * update the state with the new event and make a copy of state to local storage for persistent data usage
    * */
    addEvent = (event) => {
        let starts = moment(event.start).format("YYYY-MM-DD") + "T" + moment(event.startTime).format("HH:mm");
        let ends = moment(event.end).format("YYYY-MM-DD") + "T" + moment(event.endTime).format("HH:mm");

        if (event.end === null || event.end === "Invalid date") {
            ends = null;
        }

        let jsondata = {
            "UUID": event.id ? event.id : uuidv4(),
            "ScheduleName": event.title,
            "CalendarDatabase": event.CalendarDatabase,
            "Starts": starts,
            "Ends": ends,
            "Owner": "UUID",
            "AllDay": event.allDay ? event.allDay : false
        }

        let token = getCookie("loginToken");

        // Fetch API
        fetch(`http://${API_URL}/schedule/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify(jsondata)
        }).then((response) => {
            if (response.status === 200) {
                // const map = {
                //     'UUID': 'id',
                //     'ScheduleName': 'title',
                //     'Starts': 'start',
                //     'Ends': 'end',
                //     'Owner': 'owner',
                //     'Editor': 'editor',
                //     'AllDay': 'allDay',
                // }
                // const res = [];
                // const replacedKeysInData = {}
                // Object.keys(jsondata).forEach((key) => {
                //     const keyFromMap = map[key] || key;
                //     replacedKeysInData[keyFromMap] = event[key]
                // })
                // if (replacedKeysInData.end == null && moment(replacedKeysInData.start).format("HH:mm") === "00:00") {
                //     replacedKeysInData.allDay = true
                // }
                // res.push(replacedKeysInData);

                console.log(event);
                // if the response is 200, then the event is added successfully
                this.setState(({ events }) => ({
                    events: [...events, event]
                }), () => {
                    // after the state is updated, save the state to local storage
                    saveStateToLocalStorage(this.state);
                })

                // update the events for the current day
                this.getEvents(moment(new Date()).format('YYYY-MM-DD'));
            } else {
                // if the response is not 200, then the event is not added successfully, because of login token
                setCookie("loginToken", "");
                this.setState({
                    loggedIn: false
                })
            }
        });
    }


    // same as addEvent, but for deleting
    deleteEvent = (event) => {
        const newEvents = this.state.events.filter(e => e.id !== event.id);
        let token = getCookie("loginToken");
        console.log("newEvents" + newEvents);
        let jsondata = {
            "UUID": event.id,
        }
        fetch(`http://${API_URL}/schedule/delete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify(jsondata)
        }).then((response) => {
            if (response.status === 200) {
                this.setState({
                    events: newEvents
                }, () => {
                    saveStateToLocalStorage(this.state);
                })
            }
        });
    }

    // Update event is adding event after deleting the old event
    updateEvent = (event) => {
        //remove the old event from the state
        event.id = this.state.loadEvent.id;
        this.deleteEvent(event);
        //keep the previous ID and add the event
        this.addEvent(event);
    }

    // add the prev
    prepareEventUpdate = event => {
        // filter the event that is being clicked by using its id
        const currentEvent = this.state.events.filter(e => e.id === event.id)[0];

        this.setState({
            loadEvent: currentEvent,
            eventShow: true
        })
    }

    // get the events for the selected day
    getEvents = date => {
        const events = [];
        if (this.state.events.length > 0) {
            this.state.events.forEach(event => {
                if ((moment(event.start).isBefore(date) && moment(event.end).isAfter(date)) || moment(event.start, 'YYYY-MM-DD').isSame(date)) {
                    let start = event.start.slice(11, 16);
                    if (start === "") {
                        start = 'All Day'
                    }
                    events.push({title: event.title, start});
                }
            })
        }
        // sort events in order according to the time of the day ASC
        this.setState({
            today: events.sort((a, b) => a.start > b.start)
        })
    }

    // get the events for the selected day
    changeDate = (date) => {
        this.setState({
            date: new Date(date + 'T00:00:00'),
            eventShow: false
        })
        this.getEvents(date);
    }
    handleEventShow = () => {
        this.setState({
            eventShow: true
        })
    }
    handleEventClose = () => {
        this.setState({
            loadEvent: {},
            eventShow: false
        }, () => {
            this.getEvents(moment(this.state.date).format('YYYY-MM-DD'));
        })
    }

    handleDatabaseShow = () => {
        this.setState({
            databaseShow: true
        })
    }
    addDatabase = (database) => {
        let token = getCookie("loginToken");
        let databaseName = database.title
        console.log(databaseName)
        let jsondata = {
            "UUID": 'UUID',
            "DatabaseName": databaseName,
            "Owner": 'UUID',
        }
        fetch(`http://${API_URL}/database/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify(jsondata)
        })
            .then((response) => {
                if (response.status === 200) {
                    this.setState({
                        databaseShow: false
                    })
                }
                return response.json();
            })
            .then((data) => {
                this.setState(({ database }) => ({
                    database: [...database, data]
                }), () => {
                    // after the state is updated, save the state to local storage
                    saveStateToLocalStorage(this.state);
                })
            });
    }

    deleteDatabase = (database) => {
        let token = getCookie("loginToken");
        let jsondata = {
            "DatabaseName": database,
        }
        fetch(`http://${API_URL}/database/delete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify(jsondata)
        }).then((response) => {
            if (response.status === 200) {
                this.setState({
                    databaseShow: false
                })
            }
        });
    }

    updateDatabase = (database) => {
        let token = getCookie("loginToken");
        let jsondata = {
            "DatabaseName": database,
        }
        fetch(`http://${API_URL}/database/update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify(jsondata)
        }).then((response) => {
            if (response.status === 200) {
                this.setState({
                    databaseShow: false
                })
            }
        });
    }

    handleDatabaseClose = () => {
        this.setState({
            databaseShow: false
        })
    }

    handleLogout = () => {
        setCookie("loginToken", "");
        this.setState({
            loggedIn: false
        })
    }

    render() {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return (
            <>
                {
                    this.state.loggedIn ? null : <Navigate to="/" replace={true} />
                }
                <Container fluid>
                    <Row>
                        <Col md={12}>
                            <Navbar expand="lg" variant="light" bg="light">
                                <Container>
                                    <Navbar.Brand href="#"><h1>eCalendar</h1></Navbar.Brand>
                                </Container>
                                <div className={"menu"}>
                                    <Button>
                                        Profile
                                    </Button>
                                    <Button onClick={this.handleLogout}>
                                        Logout
                                    </Button>
                                </div>
                            </Navbar>
                        </Col>
                    </Row>
                    <Row className="main-row">
                        <Col lg={2} className={"d-none d-lg-block databases-container"}>
                            <div className={"databases-header"}>
                                <h2>Databases</h2>
                            </div>
                            <ListGroup className={"databases-list"}>
                                {this.state.database.length ? this.state.database.map((database, i) => <ListGroup.Item key={i}>
                                        <b>{database.DatabaseName}</b>
                                    </ListGroup.Item>)
                                    : <ListGroup.Item>No Database</ListGroup.Item>
                                }
                            </ListGroup>
                            <Button className="add-btn" onClick={this.handleDatabaseShow}>Add</Button>
                            <DatabaseModal
                                   addDatabase={this.addDatabase} deleteDatabase={this.deleteDatabase} updateDatabase={this.updateDatabase}
                                   database={this.state.loadDatabase} noDatabase={this.state.noDatabase}
                                   show={this.state.databaseShow} handleClose={this.handleDatabaseClose}/>
                        </Col>
                        <Col xs={12} sm={12} md={8} lg={7} xl={6}>
                            <Calendar changeDate={this.changeDate} updateEvent={this.prepareEventUpdate}
                                      events={this.state.events}/>
                        </Col>
                        <Col className="events-container" md={4} lg={3}>
                            <div className="events-header">
                                <h2>{days[this.state.date.getDay()]}</h2>
                                <h1>{months[this.state.date.getMonth()]} {this.state.date.getDate()}</h1>
                            </div>
                            <ListGroup className="events-list">
                                {this.state.today.length ? this.state.today.map((event, i) => <ListGroup.Item key={i}>
                                        <b>{event.start} </b> - {event.title}
                                    </ListGroup.Item>)
                                    : <ListGroup.Item>No Appoinments</ListGroup.Item>
                                }
                            </ListGroup>
                            <Button className="add-btn" onClick={this.handleEventShow}>Add</Button>
                            <EventModal deleteEvent={this.deleteEvent} updateEvent={this.updateEvent}
                                        database={this.state.database}
                                   event={this.state.loadEvent} show={this.state.eventShow} handleClose={this.handleEventClose}
                                   addEvent={this.addEvent}/>
                        </Col>
                    </Row>
                </Container>
            </>
        );
    }
}

export default App;
