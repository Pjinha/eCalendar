import React, {Component} from 'react'
import {Modal, Button, Form, Row, Col} from 'react-bootstrap';
// there is a findDomNode warning that needs to be fixed
import * as moment from 'moment';
import * as yup from 'yup';
import './EventModal.scss';
import {getDate} from "../../helper";

let schema = yup.object().shape({
    title: yup.string().trim('The title cannot include leading and trailing spaces').strict(true).required('Title is required'),
    CalendarDatabase: yup.string(),
    start: yup.date().required(),
    end: yup.date().min(yup.ref('start'), () => `End date can not be before start date!`).nullable().transform(v => (v instanceof Date && !isNaN(v) ? v : null)),
    startTime: yup.string(),
    endTime: yup.string(),
    // memo: yup.string()
});

class EventModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            event: {
                title: "",
                CalendarDatabase: "",
                start: '',
                end: '',
                startTime: '',
                endTime: '',
                allDay: false,
            },
            hasError: false,
            error: {}
        }
        // No need for binding if you are using arrow functions
        // this.closeModal = this.closeModal.bind(this);
    }

    static getDerivedStateFromProps(props, state) {
        if (Object.keys(props.event).length !== 0) {
            return {event: props.event};
        }
        return state;
    }

    onChange = input => {
        const prevEvent = this.state.event;
        const {value, id} = input.target;
        prevEvent[id] = value;
        this.setState({
            event: prevEvent,
            error: {}
        })
    }

    handleAddUpdateEvent = (e, status) => {
        e.preventDefault();
        const title = e.target.title.value;
        const CalendarDatabase = e.target.CalendarDatabase.value;
        let start = moment(e.target.start.value).format('YYYY-MM-DD');
        let end = moment(e.target.end.value).format('YYYY-MM-DD');
        const StartsTime = e.target.startTime.value;
        const EndsTime = e.target.endTime.value;
        // const memo = e.target.memo.value;
        if (StartsTime) {
            start += `T${StartsTime}`;
        }
        if (EndsTime) {
            end += `T${EndsTime}`;
        }
        let event = {
            "id": this.state.event.id,
            "title": title,
            "CalendarDatabase": CalendarDatabase,
            "start": start,
            "end": end,
            "Owner": "UUID",
            "AllDay": false
        }
        if (StartsTime === "" || EndsTime === "") {
            event.allDay = true;
        }

        schema
            .validate(event)
            .then(() => {
                if (!status) {
                    this.props.addEvent(event);
                } else {
                    this.props.updateEvent(event);
                }
                this.closeModal();
            })
            .catch(err => {
                this.setState({hasError: true, error: err});
                console.log(err)
            });
    }

    closeModal = () => {
        //reset state before closing
        this.setState({
            event: {
                title: "",
                CalendarDatabase: "",
                start: '',
                end: '',
                startTime: '',
                endTime: ''
            }
        });
        this.props.handleClose()
    }

    render() {
        const {title, CalendarDatabase, start, end, startTime, endTime} = this.state.event;
        return (
            <div className="modal">
                <Modal
                    size="lg"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered show={this.props.show} onHide={this.closeModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Add a new event</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={e => this.handleAddUpdateEvent(e, Object.keys(this.props.event).length !== 0)}>
                            <Form.Group as={Row} className={"mb-3"} controlId="title">
                                <Form.Label column sm="2">Title <span className="required">*</span></Form.Label>
                                <Col sm="10">
                                    <Form.Control required type="text" placeholder="Event Title" value={title || ''}
                                                  onChange={this.onChange}
                                                  isInvalid={this.state.error.path === "title"}/>
                                    <Form.Control.Feedback className="error"
                                                           type="isInvalid">{this.state.error.errors && this.state.error.path === "title" && this.state.error.errors[0]}</Form.Control.Feedback>
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} className={"mb-3"} controlId="CalendarDatabase">
                                <Form.Label column sm="2">Database <span className="required">*</span></Form.Label>
                                <Col sm="10">
                                    <Form.Select aria-label="Default select example" defaultValue={CalendarDatabase || ''}>
                                        {
                                            this.props.database.map((database, i) =>
                                                <option key={i} value={database.UUID}>{database.DatabaseName}</option>
                                            )
                                        }
                                    </Form.Select>
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} className={"mb-3"}>
                                <Form.Group as={Col}>
                                    <Form.Group as={Row} className={"mb-3"} controlId="start">
                                        <Form.Label column sm="4">Start Date <span
                                            className="required">*</span></Form.Label>
                                        <Col sm="8">
                                            <Form.Control required type="date" defaultValue={getDate(start) || ''} onChange={this.onChange}/>
                                            <Form.Control.Feedback className="error"
                                                                   type="isInvalid">{this.state.error.errors && this.state.error.path === "start" && this.state.error.errors[0]}</Form.Control.Feedback>
                                        </Col>
                                    </Form.Group>

                                </Form.Group>

                                <Form.Group as={Col}>
                                    <Form.Group as={Row} className={"mb-3"} controlId="end">
                                        <Form.Label column sm="4">End Date</Form.Label>
                                        <Col sm="8">
                                            <Form.Control type="date" defaultValue={getDate(end) || ''} onChange={this.onChange}/>
                                        </Col>
                                        <Form.Control.Feedback className="error"
                                                               type="isInvalid">{this.state.error.errors && this.state.error.path === "end" && this.state.error.errors[0]}</Form.Control.Feedback>
                                    </Form.Group>
                                </Form.Group>
                            </Form.Group>
                            <Form.Group as={Row} className={"mb-3"}>
                                <Form.Group as={Col}>
                                    <Form.Group as={Row} className={"mb-3"} controlId="startTime">
                                        <Form.Label column sm="4">Begins</Form.Label>
                                        <Col sm="8">
                                            <Form.Control type="time" defaultValue={startTime || ''} onChange={this.onChange}/>
                                        </Col>
                                    </Form.Group>
                                </Form.Group>

                                <Form.Group as={Col}>
                                    <Form.Group as={Row} className={"mb-3"} controlId="endTime">
                                        <Form.Label column sm="4">Ends</Form.Label>
                                        <Col sm="8">
                                            <Form.Control type="time" defaultValue={endTime || ''} onChange={this.onChange}/>
                                        </Col>
                                    </Form.Group>
                                </Form.Group>
                            </Form.Group>
                            {/*<Form.Group as={Row} className={"mb-3"} controlId="memo">*/}
                            {/*    <Form.Label column sm="2">*/}
                            {/*        Memo*/}
                            {/*    </Form.Label>*/}
                            {/*    <Col sm="10">*/}
                            {/*        <Form.Control as="textarea" value={memo} onChange={this.onChange}/>*/}
                            {/*    </Col>*/}
                            {/*</Form.Group>*/}
                            {/*<Form.Group as={Row} className={"mb-3"} controlId="todos">*/}
                            {/*    <Form.Label column sm="2">*/}
                            {/*        Todos*/}
                            {/*    </Form.Label>*/}
                            {/*    <Col sm="10">*/}
                            {/*        <InputGroup>*/}
                            {/*            <InputGroup.Checkbox aria-label="Checkbox for following text input"/>*/}
                            {/*            <Form.Control type="textbox" value={memo} onChange={this.onChange}/>*/}
                            {/*            <Button variant="outline-secondary" id="button-addon2">*/}
                            {/*                +*/}
                            {/*            </Button>*/}
                            {/*        </InputGroup>*/}
                            {/*    </Col>*/}
                            {/*</Form.Group>*/}
                            <Row>
                                <Col align="center">
                                    <Button variant="primary" type="submit">
                                        {Object.keys(this.props.event).length === 0 ? "Add" : "Update"} Event
                                    </Button>
                                </Col>
                            </Row>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        {Object.keys(this.props.event).length !== 0 ? <Button variant="danger" onClick={() => {
                            this.props.deleteEvent(this.props.event);
                            this.closeModal()
                        }}>
                            Delete
                        </Button> : ""
                        }
                        <Button variant="secondary" onClick={this.closeModal}>
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }

}

export default EventModal;
