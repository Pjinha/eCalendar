import React from 'react';
import Calendar from '../components/Calendar';
import './main.scss';
import Button from 'react-bootstrap/Button';
import {Col, Container, ListGroup, Navbar, Row} from 'react-bootstrap';
import EventModal from '../components/EventModal';
import * as moment from 'moment';
import {v4 as uuidv4} from 'uuid';
import {getCookie, setCookie} from "../components/cookies/Cookies";
import {API_URL} from "../helper";
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
            .then(response => response.json())
            .then(data => {
                // console.log(data);
                if (data.UUID === null) {
                    this.setState({
                        databaseShow: true,
                        noDatabase: true
                    })
                }
                this.setState({
                    database: data
                })
                if (data.hasOwnProperty("detail")){
                    setCookie("loginToken", "");
                    this.setState({
                        loggedIn: false
                    })
                }
            })
        fetch(`http://${API_URL}/schedule`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': getCookie("loginToken")
            }
        })
            .then(r => r.json())
            .then(data => {
                this.setState(({
                    events: data
                }), () => {
                    this.saveStateToLocalStorage();
                })
                if (data.hasOwnProperty("detail")){
                    setCookie("loginToken", "");
                    this.setState({
                        loggedIn: false
                    })
                }
                this.getEvents(moment(new Date()).format('YYYY-MM-DD'));
            })
            .catch(err => {
                console.log(err);
            })

        if (!getCookie("loginToken")) {
            this.setState({
                loggedIn: false
            })
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {

    }

    //*************** Helper Functions **************/
    getTime = date => {
        return moment(date).format("hh:mm");
    }
    getDate = date => {
        return moment(date).format("YYYY-MM-DD");
    }
    saveStateToLocalStorage = () => {
        localStorage.setItem('events', JSON.stringify(this.state.events));
    }

    //*************************************************/

    /*
    * this function is called from the modal component
    * it is called when the user clicks on the add button
    *
    * update the state with the new event and make a copy of state to local storage for persistent data usage
    * */
    addEvent = (event) => {
        let starts = moment(event.Starts).format("YYYY-MM-DDTHH:mm:ss.sssZ");
        let jsondata = {
            "UUID": "UUID",
            "ScheduleName": event.ScheduleName,
            "CalendarDatabase": event.CalendarDatabase,
            "Starts": starts,
            "Owner": "UUID",
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
                // if the response is 200, then the event is added successfully
                this.setState(({ events }) => ({
                    events: [...events, event]
                }), () => {
                    // after the state is updated, save the state to local storage
                    this.saveStateToLocalStorage();
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
                    this.saveStateToLocalStorage();
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

        currentEvent.startTime = this.getTime(currentEvent.start);
        currentEvent.start = this.getDate(currentEvent.start);

        currentEvent.endTime = this.getTime(currentEvent.end);
        currentEvent.end = this.getDate(currentEvent.end);

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
                if ((moment(event.Starts).isBefore(date) && moment(event.Ends).isAfter(date)) || moment(event.Starts, 'YYYY-MM-DD').isSame(date)) {
                    let start = event.Starts.slice(11, 16);
                    if (start === "") {
                        start = 'All Day'
                    }
                    events.push({title: event.ScheduleName, start});
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
        }).then((response) => {
            if (response.status === 200) {
                this.setState({
                    databaseShow: false
                })
            }
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
                {
                    this.state.loggedIn ? null : <Navigate to="/" replace={true} />
                }
            </>
        );
    }
}

export default App;
